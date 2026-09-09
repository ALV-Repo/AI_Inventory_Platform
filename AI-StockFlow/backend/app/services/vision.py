"""Vision analysis service for AI StockFlow.

Phase-3 baseline:
- validates uploaded images
- performs deterministic OpenCV image analysis
- estimates image quality and object regions
- does not mutate inventory
- keeps the result suitable for human confirmation
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError


MAX_IMAGE_BYTES = 10 * 1024 * 1024
MIN_IMAGE_WIDTH = 160
MIN_IMAGE_HEIGHT = 160


@dataclass(frozen=True)
class VisionAnalysis:
    width: int
    height: int
    format: str
    brightness: float
    sharpness: float
    quality_score: float
    object_regions: int
    status: str
    requires_human_confirmation: bool


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def validate_image(data: bytes) -> tuple[Image.Image, np.ndarray]:
    """Validate image bytes and return PIL + OpenCV representations."""
    if not data:
        raise ValueError("Image file is empty.")

    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image file is too large. Maximum size is 10 MB.")

    try:
        image = Image.open(BytesIO(data))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("The uploaded file is not a valid image.") from exc

    if image.width < MIN_IMAGE_WIDTH or image.height < MIN_IMAGE_HEIGHT:
        raise ValueError(
            f"Image resolution is too small. Minimum is "
            f"{MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
        )

    rgb = image.convert("RGB")
    array = np.asarray(rgb)
    bgr = cv2.cvtColor(array, cv2.COLOR_RGB2BGR)

    return image, bgr


def analyze_image(data: bytes) -> VisionAnalysis:
    """Run deterministic baseline vision analysis.

    This function intentionally does not identify products or change stock.
    Product recognition/OCR/barcode inference can be plugged in later.
    """
    image, bgr = validate_image(data)

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    brightness = float(np.mean(gray))
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Estimate useful image quality.
    brightness_score = 100.0 - min(abs(brightness - 128.0) * 0.78, 100.0)

    # 0 variance is completely blurred; 500+ is generally sharp enough
    # for a useful camera capture.
    sharpness_score = min(sharpness / 5.0, 100.0)

    quality_score = round(
        _clamp(
            brightness_score * 0.4 + sharpness_score * 0.6,
            0.0,
            100.0,
        ),
        1,
    )

    # Simple foreground-region estimation. This is deliberately an
    # observation, not a product-count claim.
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    image_area = image.width * image.height
    min_region_area = image_area * 0.002

    object_regions = sum(
        1
        for contour in contours
        if cv2.contourArea(contour) >= min_region_area
    )

    if quality_score >= 70:
        status = "good"
    elif quality_score >= 45:
        status = "usable_with_caution"
    else:
        status = "poor"

    return VisionAnalysis(
        width=image.width,
        height=image.height,
        format=(image.format or "unknown").lower(),
        brightness=round(brightness, 2),
        sharpness=round(sharpness, 2),
        quality_score=quality_score,
        object_regions=object_regions,
        status=status,
        requires_human_confirmation=True,
    )
