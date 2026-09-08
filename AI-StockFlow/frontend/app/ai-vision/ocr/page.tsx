"use client";

import React, { useRef, useState } from "react";

type OCRField = {
  label: string;
  value: string;
  confidence: number;
};

type ScanType = "invoice" | "label";

const initialInvoiceFields: OCRField[] = [
  {
    label: "Supplier Name",
    value: "TechSource Distributors Pvt Ltd",
    confidence: 98,
  },
  {
    label: "Invoice Number",
    value: "INV-2026-0842",
    confidence: 97,
  },
  {
    label: "Invoice Date",
    value: "22 Aug 2026",
    confidence: 96,
  },
  {
    label: "GST Number",
    value: "36AABCT1234F1Z5",
    confidence: 94,
  },
  {
    label: "Purchase Order",
    value: "PO-2026-0187",
    confidence: 92,
  },
  {
    label: "Total Amount",
    value: "₹2,48,500",
    confidence: 95,
  },
];

const initialLabelFields: OCRField[] = [
  {
    label: "Product Name",
    value: "Wireless Keyboard",
    confidence: 97,
  },
  {
    label: "SKU",
    value: "KB-WL-001",
    confidence: 99,
  },
  {
    label: "Batch Number",
    value: "BATCH-0826-A",
    confidence: 94,
  },
  {
    label: "Barcode",
    value: "8901234567890",
    confidence: 98,
  },
  {
    label: "Expiry Date",
    value: "31 Dec 2028",
    confidence: 91,
  },
];

export default function OCRDataEntryPage() {
  const cameraRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [scanType, setScanType] =
    useState<ScanType>("invoice");

  const [cameraActive, setCameraActive] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState<string | null>(null);

  const [isScanning, setIsScanning] =
    useState(false);

  const [scanComplete, setScanComplete] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [fields, setFields] =
    useState<OCRField[]>(
      initialInvoiceFields
    );

  const [flashEnabled, setFlashEnabled] =
    useState(false);

  const updateField = (
    index: number,
    value: string
  ) => {
    setFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              value,
            }
          : field
      )
    );
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setMessage("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia({
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
        });

      streamRef.current = stream;

      if (cameraRef.current) {
        cameraRef.current.srcObject =
          stream;

        await cameraRef.current.play();
      }

      setCameraActive(true);

      setMessage(
        scanType === "invoice"
          ? "Camera ready. Position the supplier invoice inside the scan frame."
          : "Camera ready. Position the product label inside the scan frame."
      );
    } catch (error) {
      console.error(error);

      setCameraActive(false);

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again."
      );
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

    if (cameraRef.current) {
      cameraRef.current.srcObject =
        null;
    }

    setCameraActive(false);
  };

  const toggleFlash = async () => {
    const track =
      streamRef.current?.getVideoTracks()[0];

    if (!track) {
      setMessage(
        "Start the camera before using flash."
      );
      return;
    }

    try {
      const capabilities =
        track.getCapabilities?.();

      if (
        !("torch" in capabilities)
      ) {
        setMessage(
          "Flash control is not supported on this device."
        );
        return;
      }

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
        "Unable to change flash setting."
      );
    }
  };

  const performOCR = () => {
    setIsScanning(true);
    setScanComplete(false);
    setMessage(
      "AI OCR is reading the document..."
    );

    setTimeout(() => {
      setFields(
        scanType === "invoice"
          ? initialInvoiceFields
          : initialLabelFields
      );

      setIsScanning(false);
      setScanComplete(true);

      setMessage(
        "OCR completed successfully. Review the extracted fields before saving."
      );
    }, 1400);
  };

  const captureImage = () => {
    if (
      !cameraRef.current ||
      !cameraActive
    ) {
      setMessage(
        "Start the camera first."
      );
      return;
    }

    const video =
      cameraRef.current;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      video.videoWidth || 1280;

    canvas.height =
      video.videoHeight || 720;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setMessage(
        "Unable to capture the image."
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
        0.88
      );

    setCapturedImage(image);

    stopCamera();

    performOCR();
  };

  const handleUpload = (
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
      if (
        typeof reader.result ===
        "string"
      ) {
        setCapturedImage(
          reader.result
        );

        performOCR();
      }
    };

    reader.readAsDataURL(file);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setScanComplete(false);
    setIsScanning(false);
    setMessage("");
    setCameraError("");

    setFields(
      scanType === "invoice"
        ? initialInvoiceFields
        : initialLabelFields
    );

    startCamera();
  };

  const changeScanType = (
    type: ScanType
  ) => {
    setScanType(type);
    setCapturedImage(null);
    setScanComplete(false);
    setIsScanning(false);
    setMessage("");
    setCameraError("");

    setFields(
      type === "invoice"
        ? initialInvoiceFields
        : initialLabelFields
    );
  };

  const saveData = () => {
    setMessage(
      scanType === "invoice"
        ? "Supplier invoice data saved successfully."
        : "Product label data saved successfully."
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] font-bold text-white">
              AI
            </div>

            <div>

              <h1 className="text-2xl font-bold text-[#12213a] md:text-3xl">
                OCR Data Entry
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                AI-assisted camera scanning for
                supplier invoices and product labels.
              </p>

            </div>

          </div>

          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
            ● OCR Ready
          </span>

        </div>

        {/* SCAN TYPE */}

        <div className="mb-6 rounded-xl border bg-white p-2 shadow-sm">

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                changeScanType(
                  "invoice"
                )
              }
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                scanType ===
                "invoice"
                  ? "bg-[#12213a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📄 Supplier Invoice
            </button>

            <button
              type="button"
              onClick={() =>
                changeScanType(
                  "label"
                )
              }
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                scanType ===
                "label"
                  ? "bg-[#12213a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🏷️ Product Label
            </button>

          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

          {/* CAMERA CARD */}

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="font-semibold text-[#12213a]">
                  {scanType ===
                  "invoice"
                    ? "Invoice Scanner"
                    : "Label Scanner"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Capture an image for OCR
                  assisted data entry.
                </p>

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  scanComplete
                    ? "bg-green-50 text-green-600"
                    : cameraActive
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {scanComplete
                  ? "OCR Complete"
                  : cameraActive
                  ? "Camera Active"
                  : "Ready"}
              </span>

            </div>

            {/* CAMERA AREA */}

            <div className="relative aspect-[4/3] bg-[#101722]">

              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  ref={cameraRef}
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

                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl">
                      {scanType ===
                      "invoice"
                        ? "📄"
                        : "🏷️"}
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {scanType ===
                      "invoice"
                        ? "Invoice Camera Ready"
                        : "Label Camera Ready"}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-gray-400">
                      Start the camera and
                      position the document
                      clearly inside the scan
                      area.
                    </p>

                  </div>
                )}

              {/* SCAN FRAME */}

              {cameraActive &&
                !capturedImage && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                    <div className="relative h-[58%] w-[78%]">

                      <div className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-blue-400" />

                      <div className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-blue-400" />

                      <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-blue-400" />

                      <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-blue-400" />

                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-blue-400/60" />

                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                        Align document here
                      </div>

                    </div>

                  </div>
                )}

              {/* OCR LOADING */}

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">

                  <div className="rounded-xl bg-white px-7 py-6 text-center shadow-xl">

                    <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="font-semibold text-gray-800">
                      Reading with OCR
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Extracting text and fields...
                    </p>

                  </div>

                </div>
              )}

              {/* CAMERA CONTROLS */}

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-5 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-12">

                <button
                  type="button"
                  onClick={
                    toggleFlash
                  }
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                    flashEnabled
                      ? "bg-yellow-400 text-black"
                      : "bg-white/15 text-white"
                  }`}
                  title="Flash"
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
                    isScanning
                  }
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
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
                    handleUpload
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
                      resetScan
                    }
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ↻ Scan Again
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

          {/* OCR FORM */}

          <section className="rounded-2xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="font-semibold text-[#12213a]">
                  Extracted Information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Review and edit OCR results
                  before saving.
                </p>

              </div>

              {scanComplete && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  ✓ Verified
                </span>
              )}

            </div>

            <div className="space-y-4 p-5">

              {fields.map(
                (field, index) => (
                  <div
                    key={`${field.label}-${index}`}
                  >

                    <div className="mb-1.5 flex items-center justify-between">

                      <label className="text-xs font-semibold text-gray-600">
                        {field.label}
                      </label>

                      <span
                        className={`text-[10px] font-semibold ${
                          field.confidence >=
                          95
                            ? "text-green-600"
                            : field.confidence >=
                              90
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {field.confidence}%
                        confidence
                      </span>

                    </div>

                    <div className="relative">

                      <input
                        value={
                          field.value
                        }
                        onChange={(event) =>
                          updateField(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {field.confidence >=
                        95
                          ? "✓"
                          : "✎"}
                      </span>

                    </div>

                  </div>
                )
              )}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
                    ℹ️
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-gray-700">
                      OCR-assisted entry
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Extracted values are editable.
                      Always verify important
                      invoice and product details
                      before saving.
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  saveData
                }
                disabled={
                  !scanComplete
                }
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✓ Confirm & Save Data
              </button>

            </div>

          </section>

        </div>

        {/* STATUS CARDS */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Document Type
            </p>

            <p className="mt-2 text-lg font-bold text-[#12213a]">
              {scanType ===
              "invoice"
                ? "Supplier Invoice"
                : "Product Label"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              OCR input source
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Extracted Fields
            </p>

            <p className="mt-2 text-lg font-bold text-blue-600">
              {fields.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Editable data fields
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              OCR Status
            </p>

            <p className="mt-2 text-lg font-bold text-green-600">
              {scanComplete
                ? "Completed"
                : "Waiting"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Ready for data verification
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}