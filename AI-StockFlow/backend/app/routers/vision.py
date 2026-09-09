"""AI Vision endpoints (SRS FR-AI-VIS-01..04 baseline)."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require
from app.models.entities import User
from app.services.vision import analyze_image


router = APIRouter(prefix="/ai/vision", tags=["AI Vision"])


class VisionAnalysisOut(BaseModel):
    filename: str
    content_type: str | None
    width: int
    height: int
    format: str
    brightness: float
    sharpness: float
    quality_score: float
    object_regions: int
    status: str
    proposed_count: None = None
    requires_human_confirmation: bool
    inventory_updated: bool = False


@router.post(
    "/analyze",
    response_model=VisionAnalysisOut,
    status_code=status.HTTP_200_OK,
)
async def analyze_vision_image(
    file: UploadFile = File(...),
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Analyze an inventory image without modifying stock.

    The result is an observation/proposal only. Inventory changes must
    continue through the existing human-confirmed cycle-count workflow.
    """
    del user, db

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Use JPEG, PNG, WEBP, or BMP.",
        )

    data = await file.read()

    try:
        result = analyze_image(data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return VisionAnalysisOut(
        filename=file.filename or "uploaded-image",
        content_type=file.content_type,
        width=result.width,
        height=result.height,
        format=result.format,
        brightness=result.brightness,
        sharpness=result.sharpness,
        quality_score=result.quality_score,
        object_regions=result.object_regions,
        status=result.status,
        proposed_count=None,
        requires_human_confirmation=result.requires_human_confirmation,
        inventory_updated=False,
    )
