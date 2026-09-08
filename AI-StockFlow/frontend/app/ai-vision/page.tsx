"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

type ScanMode = "shelf" | "cycle";

type ScanStatus =
  | "Ready"
  | "Camera Active"
  | "Product Detected"
  | "Confirmed";

type DetectedProduct = {
  name: string;
  sku: string;
  warehouse: string;
  shelf: string;
  systemQuantity: number;
  scannedQuantity: number;
  confidence: number;
};

const demoProducts: DetectedProduct[] = [
  {
    name: "Wireless Keyboard",
    sku: "KB-WL-001",
    warehouse: "Hyderabad Central",
    shelf: "A-03-12",
    systemQuantity: 250,
    scannedQuantity: 250,
    confidence: 97,
  },
  {
    name: "USB Microphone",
    sku: "MIC-USB-002",
    warehouse: "Hyderabad Central",
    shelf: "A-04-08",
    systemQuantity: 85,
    scannedQuantity: 82,
    confidence: 94,
  },
  {
    name: "24-inch Monitor",
    sku: "MON-24-004",
    warehouse: "Hyderabad Central",
    shelf: "B-02-05",
    systemQuantity: 120,
    scannedQuantity: 118,
    confidence: 96,
  },
];

export default function AIVisionPage() {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [mode, setMode] =
    useState<ScanMode>("shelf");

  const [cameraActive, setCameraActive] =
    useState(false);

  const [flashEnabled, setFlashEnabled] =
    useState(false);

  const [scanStatus, setScanStatus] =
    useState<ScanStatus>("Ready");

  const [capturedImage, setCapturedImage] =
    useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<DetectedProduct | null>(null);

  const [scannedQuantity, setScannedQuantity] =
    useState(0);

  const [scanCount, setScanCount] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [cameraError, setCameraError] =
    useState("");

  const [isProcessing, setIsProcessing] =
    useState(false);

  const startCamera = async () => {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported in this browser."
        );

        return;
      }

      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }

      setCameraActive(true);
      setScanStatus("Camera Active");
      setMessage(
        "Camera ready. Position the product inside the scan frame."
      );
    } catch (error) {
      console.error(error);

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again."
      );

      setCameraActive(false);
      setScanStatus("Ready");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleFlash = async () => {
    const track =
      streamRef.current?.getVideoTracks()[0];

    if (!track) {
      setMessage(
        "Start the camera before using the flash."
      );

      return;
    }

    const capabilities =
      track.getCapabilities?.();

    if (
      !("torch" in capabilities)
    ) {
      setMessage(
        "Flash control is not supported by this device/browser."
      );

      return;
    }

    try {
      await track.applyConstraints({
        advanced: [
          {
            torch: !flashEnabled,
          } as MediaTrackConstraintSet,
        ],
      });

      setFlashEnabled(
        !flashEnabled
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to change the flashlight setting."
      );
    }
  };

  const processScan = () => {
    setIsProcessing(true);
    setScanStatus(
      "Product Detected"
    );

    setMessage(
      "AI is analyzing the captured image..."
    );

    setTimeout(() => {
      const product =
        demoProducts[
          scanCount %
            demoProducts.length
        ];

      setSelectedProduct(product);

      setScannedQuantity(
        product.scannedQuantity
      );

      setScanCount(
        (current) =>
          current + 1
      );

      setIsProcessing(false);

      setMessage(
        "Product detected successfully."
      );
    }, 900);
  };

  const captureImage = () => {
    if (
      !videoRef.current ||
      !cameraActive
    ) {
      setMessage(
        "Start the camera first."
      );

      return;
    }

    const video =
      videoRef.current;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      video.videoWidth ||
      1280;

    canvas.height =
      video.videoHeight ||
      720;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setMessage(
        "Unable to capture image."
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.85
      );

    setCapturedImage(image);

    stopCamera();

    processScan();
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "Please select an image file."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result ===
        "string"
      ) {
        setCapturedImage(
          result
        );

        setScanStatus(
          "Product Detected"
        );

        processScan();
      }
    };

    reader.readAsDataURL(file);
  };

  const retakeScan = () => {
    setCapturedImage(null);
    setSelectedProduct(null);
    setScannedQuantity(0);
    setScanStatus("Ready");
    setMessage("");

    startCamera();
  };

  const confirmScan = () => {
    if (!selectedProduct) {
      return;
    }

    setScanStatus(
      "Confirmed"
    );

    setMessage(
      mode === "shelf"
        ? "Shelf scan confirmed and inventory count updated."
        : "Cycle count confirmed and inventory record updated."
    );
  };

  const incrementQuantity = () => {
    setScannedQuantity(
      (current) =>
        current + 1
    );
  };

  const decrementQuantity = () => {
    setScannedQuantity(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    );
  };

  const difference =
    selectedProduct
      ? scannedQuantity -
        selectedProduct.systemQuantity
      : 0;

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] text-lg font-bold text-white">
                AI
              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#12213a] md:text-3xl">
                  AI Vision Scanner
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Mobile camera capture for
                  shelf scanning and cycle counting.
                </p>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
              ● AI Vision Ready
            </span>

          </div>

        </div>

        {/* MODE SELECTOR */}

        <div className="mb-6 rounded-xl border bg-white p-2 shadow-sm">

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() => {
                setMode("shelf");
                setSelectedProduct(null);
                setCapturedImage(null);
                setScanStatus("Ready");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                mode === "shelf"
                  ? "bg-[#12213a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📦 Shelf Scan
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("cycle");
                setSelectedProduct(null);
                setCapturedImage(null);
                setScanStatus("Ready");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                mode === "cycle"
                  ? "bg-[#12213a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🔢 Cycle Count
            </button>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* CAMERA PANEL */}

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="font-semibold text-[#12213a]">
                  {mode === "shelf"
                    ? "Shelf Scanner"
                    : "Cycle Count Scanner"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {mode === "shelf"
                    ? "Scan products placed on a warehouse shelf."
                    : "Capture the physical quantity for cycle counting."}
                </p>

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  scanStatus ===
                  "Confirmed"
                    ? "bg-green-50 text-green-600"
                    : scanStatus ===
                      "Product Detected"
                    ? "bg-blue-50 text-blue-600"
                    : cameraActive
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {scanStatus}
              </span>

            </div>

            {/* CAMERA */}

            <div className="relative aspect-[4/3] bg-[#101722]">

              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured inventory scan"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${
                    cameraActive
                      ? "block"
                      : "hidden"
                  }`}
                />
              )}

              {!cameraActive &&
                !capturedImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl">
                      📷
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      Camera Ready
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-gray-400">
                      Start the camera and
                      position the product or
                      shelf inside the scan area.
                    </p>

                  </div>
                )}

              {/* SCAN FRAME */}

              {cameraActive &&
                !capturedImage && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                    <div className="relative h-[55%] w-[70%] max-w-md">

                      <div className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-blue-400" />

                      <div className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-blue-400" />

                      <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-blue-400" />

                      <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-blue-400" />

                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-blue-400/70" />

                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                        Align product here
                      </div>

                    </div>

                  </div>
                )}

              {/* PROCESSING */}

              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">

                  <div className="rounded-xl bg-white px-6 py-5 text-center shadow-xl">

                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="font-semibold text-gray-800">
                      AI Analyzing...
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Detecting product and quantity
                    </p>

                  </div>

                </div>
              )}

              {/* CAMERA CONTROLS */}

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-5 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-12">

                <button
                  type="button"
                  onClick={toggleFlash}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                    flashEnabled
                      ? "bg-yellow-400 text-black"
                      : "bg-white/15 text-white"
                  }`}
                  title="Toggle flash"
                >
                  ⚡
                </button>

                <button
                  type="button"
                  onClick={
                    cameraActive
                      ? captureImage
                      : startCamera
                  }
                  disabled={
                    isProcessing
                  }
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
                  title={
                    cameraActive
                      ? "Capture"
                      : "Start camera"
                  }
                >
                  {cameraActive
                    ? "📸"
                    : "▶"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg text-white"
                  title="Upload image"
                >
                  🖼️
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={
                    handleFileUpload
                  }
                />

              </div>

            </div>

            {/* CAMERA ACTIONS */}

            <div className="border-t p-5">

              <div className="flex flex-wrap gap-3">

                {!cameraActive &&
                  !capturedImage && (
                    <button
                      type="button"
                      onClick={
                        startCamera
                      }
                      className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3152]"
                    >
                      📷 Start Camera
                    </button>
                  )}

                {cameraActive && (
                  <button
                    type="button"
                    onClick={
                      stopCamera
                    }
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Stop Camera
                  </button>
                )}

                {capturedImage && (
                  <button
                    type="button"
                    onClick={
                      retakeScan
                    }
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ↻ Retake
                  </button>
                )}

              </div>

              {cameraError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {cameraError}
                </div>
              )}

              {message && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                  {message}
                </div>
              )}

            </div>

          </section>

          {/* RIGHT INFORMATION PANEL */}

          <aside className="space-y-6">

            {/* SCAN INSTRUCTIONS */}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <h2 className="font-semibold text-[#12213a]">
                How it works
              </h2>

              <div className="mt-4 space-y-4">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Start Camera
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Allow camera access and
                      point it at the shelf or
                      product.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Capture
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Keep the barcode or
                      product clearly visible
                      inside the scan frame.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      AI Detection
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      AI identifies the product
                      and compares the physical
                      quantity with system stock.
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-600">
                    4
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Confirm
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review the detected
                      information and confirm the
                      inventory count.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* DETECTED PRODUCT */}

            <div className="rounded-2xl border bg-white shadow-sm">

              <div className="border-b px-5 py-4">

                <h2 className="font-semibold text-[#12213a]">
                  Detection Result
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  AI scan information
                </p>

              </div>

              {!selectedProduct ? (
                <div className="px-5 py-12 text-center">

                  <div className="text-4xl">
                    🔍
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No product detected
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Capture an image to see
                    detection results.
                  </p>

                </div>
              ) : (
                <div className="space-y-4 p-5">

                  <div>

                    <p className="text-xs text-gray-400">
                      PRODUCT
                    </p>

                    <p className="mt-1 font-semibold text-[#12213a]">
                      {
                        selectedProduct.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {
                        selectedProduct.sku
                      }
                    </p>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-[11px] text-gray-400">
                        WAREHOUSE
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {
                          selectedProduct.warehouse
                        }
                      </p>

                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-[11px] text-gray-400">
                        SHELF
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {
                          selectedProduct.shelf
                        }
                      </p>

                    </div>

                  </div>

                  {/* CONFIDENCE */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-xs font-medium text-gray-500">
                        AI Confidence
                      </span>

                      <span className="text-sm font-bold text-green-600">
                        {
                          selectedProduct.confidence
                        }
                        %
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${selectedProduct.confidence}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* QUANTITY */}

                  <div className="rounded-xl border p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-sm font-semibold text-gray-700">
                        Physical Quantity
                      </span>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                        Editable
                      </span>

                    </div>

                    <div className="flex items-center justify-center gap-4">

                      <button
                        type="button"
                        onClick={
                          decrementQuantity
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-50"
                      >
                        −
                      </button>

                      <span className="min-w-[70px] text-center text-3xl font-bold text-[#12213a]">
                        {
                          scannedQuantity
                        }
                      </span>

                      <button
                        type="button"
                        onClick={
                          incrementQuantity
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-50"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  {/* SYSTEM COMPARISON */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-lg bg-blue-50 p-3">

                      <p className="text-[11px] text-blue-500">
                        SYSTEM STOCK
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-700">
                        {
                          selectedProduct.systemQuantity
                        }
                      </p>

                    </div>

                    <div
                      className={`rounded-lg p-3 ${
                        difference ===
                        0
                          ? "bg-green-50"
                          : "bg-amber-50"
                      }`}
                    >

                      <p
                        className={`text-[11px] ${
                          difference ===
                          0
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        VARIANCE
                      </p>

                      <p
                        className={`mt-1 text-xl font-bold ${
                          difference ===
                          0
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        {difference > 0
                          ? `+${difference}`
                          : difference}
                      </p>

                    </div>

                  </div>

                  {/* CONFIRM */}

                  <button
                    type="button"
                    onClick={
                      confirmScan
                    }
                    disabled={
                      scanStatus ===
                      "Confirmed"
                    }
                    className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {scanStatus ===
                    "Confirmed"
                      ? "✓ Scan Confirmed"
                      : mode === "shelf"
                      ? "✓ Confirm Shelf Scan"
                      : "✓ Confirm Cycle Count"}
                  </button>

                </div>
              )}

            </div>

          </aside>

        </div>

        {/* MOBILE INFORMATION */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Scan Mode
            </p>

            <p className="mt-2 text-lg font-bold text-[#12213a]">
              {mode === "shelf"
                ? "Shelf Scan"
                : "Cycle Count"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Mobile camera workflow
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Scans Completed
            </p>

            <p className="mt-2 text-lg font-bold text-blue-600">
              {scanCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              During this session
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Camera Status
            </p>

            <p className="mt-2 text-lg font-bold text-green-600">
              {cameraActive
                ? "Active"
                : "Standby"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Rear camera preferred
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}