"use client";

import React, { useEffect, useRef, useState } from "react";

type VoiceStatus =
  | "Ready"
  | "Listening"
  | "Processing"
  | "Waiting for Confirmation"
  | "Completed";

type CommandType =
  | "inventory"
  | "purchase"
  | "sales"
  | "unknown";

type VoiceCommand = {
  text: string;
  type: CommandType;
  action: string;
  target: string;
  value: string;
};

const sampleCommands = [
  "Update Wireless Keyboard stock to 275",
  "Create purchase request for 50 USB Microphones",
  "Mark invoice INV-2026-0842 as received",
  "Move 25 monitors to Hyderabad Central warehouse",
];

export default function AIVoicePage() {
  const [status, setStatus] =
    useState<VoiceStatus>("Ready");

  const [isListening, setIsListening] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [command, setCommand] =
    useState<VoiceCommand | null>(null);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [volume, setVolume] =
    useState(0);

  const [language, setLanguage] =
    useState("English");

  const [supported, setSupported] =
    useState(true);

  const recognitionRef =
    useRef<any>(null);

  const waveformIntervalRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening");
      setMessage(
        "Listening... speak your inventory command."
      );
    };

    recognition.onresult = (
      event: any
    ) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result =
          event.results[i];

        if (
          result.isFinal
        ) {
          finalText +=
            result[0].transcript;
        } else {
          interimText +=
            result[0].transcript;
        }
      }

      const text =
        finalText ||
        interimText;

      setTranscript(text);

      if (finalText) {
        processVoiceCommand(
          finalText
        );
      }
    };

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
      setStatus("Ready");

      if (
        event.error ===
        "not-allowed"
      ) {
        setMessage(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else if (
        event.error ===
        "no-speech"
      ) {
        setMessage(
          "No speech detected. Please try again."
        );
      } else {
        setMessage(
          "Voice recognition could not complete. Please try again."
        );
      }

      stopWaveform();
    };

    recognition.onend = () => {
      setIsListening(false);

      stopWaveform();

      setVolume(0);
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}

      stopWaveform();
    };
  }, []);

  const startWaveform = () => {
    stopWaveform();

    waveformIntervalRef.current =
      setInterval(() => {
        setVolume(
          Math.floor(
            Math.random() * 100
          )
        );
      }, 120);
  };

  const stopWaveform = () => {
    if (
      waveformIntervalRef.current
    ) {
      clearInterval(
        waveformIntervalRef.current
      );

      waveformIntervalRef.current =
        null;
    }

    setVolume(0);
  };

  const startListening = () => {
    setMessage("");
    setTranscript("");
    setCommand(null);
    setShowConfirmation(false);

    if (!supported) {
      setMessage(
        "Voice recognition is not supported in this browser. Try Microsoft Edge or Google Chrome."
      );

      return;
    }

    const recognition =
      recognitionRef.current;

    if (!recognition) {
      setMessage(
        "Voice recognition is unavailable."
      );

      return;
    }

    try {
      startWaveform();

      recognition.start();
    } catch (error) {
      console.error(error);

      setIsListening(false);
      stopWaveform();

      setMessage(
        "Unable to start voice recognition. Please try again."
      );
    }
  };

  const stopListening = () => {
    const recognition =
      recognitionRef.current;

    if (recognition) {
      try {
        recognition.stop();
      } catch {}
    }

    setIsListening(false);

    stopWaveform();

    setVolume(0);

    if (
      transcript &&
      !command
    ) {
      processVoiceCommand(
        transcript
      );
    }
  };

    const processVoiceCommand = (
    text: string
  ) => {
    const normalized =
      text.toLowerCase();

    let detectedCommand:
      VoiceCommand;

    if (
      normalized.includes(
        "stock"
      ) ||
      normalized.includes(
        "inventory"
      ) ||
      normalized.includes(
        "quantity"
      )
    ) {
      detectedCommand = {
        text,
        type: "inventory",
        action:
          normalized.includes(
            "update"
          ) ||
          normalized.includes(
            "change"
          ) ||
          normalized.includes(
            "set"
          )
            ? "Update Stock"
            : "Inventory Action",
        target:
          normalized.includes(
            "keyboard"
          )
            ? "Wireless Keyboard"
            : normalized.includes(
                "microphone"
              )
            ? "USB Microphone"
            : normalized.includes(
                "monitor"
              )
            ? "24-inch Monitor"
            : "Inventory Item",
        value:
          extractNumber(
            text
          ),
      };
    } else if (
      normalized.includes(
        "purchase"
      ) ||
      normalized.includes(
        "buy"
      ) ||
      normalized.includes(
        "supplier"
      )
    ) {
      detectedCommand = {
        text,
        type: "purchase",
        action:
          "Create Purchase Request",
        target:
          normalized.includes(
            "microphone"
          )
            ? "USB Microphone"
            : normalized.includes(
                "keyboard"
              )
            ? "Wireless Keyboard"
            : "Purchase Item",
        value:
          extractNumber(
            text
          ),
      };
    } else if (
      normalized.includes(
        "invoice"
      ) ||
      normalized.includes(
        "sales"
      ) ||
      normalized.includes(
        "order"
      )
    ) {
      detectedCommand = {
        text,
        type: "sales",
        action:
          normalized.includes(
            "received"
          )
            ? "Mark Invoice Received"
            : "Sales Action",
        target:
          extractInvoiceNumber(
            text
          ) ||
          "Sales Document",
        value:
          extractNumber(
            text
          ),
      };
    } else {
      detectedCommand = {
        text,
        type: "unknown",
        action:
          "Review Voice Command",
        target:
          "AI StockFlow",
        value: "",
      };
    }

    setCommand(
      detectedCommand
    );

    setStatus(
      "Waiting for Confirmation"
    );

    setShowConfirmation(
      true
    );

    setMessage(
      "Review the requested action before any data is changed."
    );
  };

  const extractNumber = (
    text: string
  ) => {
    const match =
      text.match(
        /\b\d+(?:\.\d+)?\b/
      );

    return match
      ? match[0]
      : "";
  };

  const extractInvoiceNumber = (
    text: string
  ) => {
    const match =
      text.match(
        /(?:INV[-\s]?\d{4}[-\s]?\d+)/i
      );

    return match
      ? match[0]
      : "";
  };

  const handleSampleCommand = (
    sample: string
  ) => {
    setTranscript(
      sample
    );

    processVoiceCommand(
      sample
    );
  };

  const confirmCommand = () => {
    if (!command) {
      return;
    }

    setShowConfirmation(
      false
    );

    setStatus(
      "Completed"
    );

    setMessage(
      "Voice command confirmed. The requested data action has been committed successfully."
    );
  };

  const cancelCommand = () => {
    setShowConfirmation(
      false
    );

    setStatus("Ready");

    setMessage(
      "Voice command cancelled. No data was changed."
    );
  };

  const clearCommand = () => {
    setTranscript("");
    setCommand(null);
    setShowConfirmation(false);
    setStatus("Ready");
    setMessage("");
  };

  const getStatusText = () => {
    if (
      status ===
      "Listening"
    ) {
      return "Listening";
    }

    if (
      status ===
      "Processing"
    ) {
      return "Processing";
    }

    if (
      status ===
      "Waiting for Confirmation"
    ) {
      return "Confirmation Required";
    }

    if (
      status ===
      "Completed"
    ) {
      return "Completed";
    }

    return "Ready";
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] text-lg font-bold text-white">
              AI
            </div>

            <div>

              <h1 className="text-2xl font-bold text-[#12213a] md:text-3xl">
                AI Voice Assistant
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Voice-enabled inventory and
                operations control.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <select
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option>
                English
              </option>

              <option>
                Hindi
              </option>

              <option>
                Telugu
              </option>
            </select>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                status ===
                "Completed"
                  ? "bg-green-50 text-green-600"
                  : isListening
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              ● {getStatusText()}
            </span>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">

          {/* VOICE PANEL */}

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-5 py-4">

              <h2 className="font-semibold text-[#12213a]">
                Voice Input
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Speak a command to interact
                with AI StockFlow.
              </p>

            </div>

            <div className="relative flex min-h-[480px] flex-col items-center justify-center bg-[#101722] px-5 py-10">

              {/* STATUS */}

              <div
                className={`mb-8 rounded-full px-4 py-2 text-xs font-semibold ${
                  isListening
                    ? "bg-red-500/15 text-red-300"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {isListening
                  ? "● Listening..."
                  : "Press the microphone to speak"}
              </div>

              {/* WAVEFORM */}

              <div className="mb-10 flex h-24 items-center justify-center gap-1">

                {Array.from({
                  length: 31,
                }).map(
                  (_, index) => {

                    const base =
                      isListening
                        ? 18 +
                          Math.sin(
                            index *
                              0.7 +
                              volume *
                                0.04
                          ) *
                            12
                        : 8;

                    const random =
                      isListening
                        ? Math.max(
                            5,
                            Math.min(
                              48,
                              base +
                                Math.random() *
                                  20
                            )
                          )
                        : 8;

                    return (
                      <div
                        key={index}
                        className={`w-1.5 rounded-full transition-all duration-100 ${
                          isListening
                            ? "bg-blue-400"
                            : "bg-gray-600"
                        }`}
                        style={{
                          height: `${random}px`,
                        }}
                      />
                    );
                  }
                )}

              </div>

              {/* MICROPHONE */}

              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white text-4xl shadow-2xl transition ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isListening
                  ? "■"
                  : "🎤"}

                {isListening && (
                  <>
                    <span className="absolute inset-[-10px] animate-ping rounded-full border border-red-400/50" />

                    <span className="absolute inset-[-20px] rounded-full border border-red-400/20" />
                  </>
                )}
              </button>

              <p className="mt-6 text-sm text-gray-400">
                {isListening
                  ? "Tap to stop listening"
                  : "Tap to start voice input"}
              </p>

              {/* LIVE VOLUME */}

              <div className="mt-8 flex items-center gap-3">

                <span className="text-xs text-gray-500">
                  Input level
                </span>

                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${
                        isListening
                          ? Math.max(
                              8,
                              volume
                            )
                          : 0
                      }%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* TRANSCRIPT */}

            <div className="border-t p-5">

              <div className="mb-2 flex items-center justify-between">

                <h3 className="text-sm font-semibold text-gray-700">
                  Voice Transcript
                </h3>

                {transcript && (
                  <button
                    type="button"
                    onClick={
                      clearCommand
                    }
                    className="text-xs font-medium text-gray-500 hover:text-gray-800"
                  >
                    Clear
                  </button>
                )}

              </div>

              <div className="min-h-[90px] rounded-xl border border-gray-200 bg-gray-50 p-4">

                {transcript ? (
                  <p className="text-sm leading-6 text-gray-700">
                    “{transcript}”
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Your spoken command will
                    appear here...
                  </p>
                )}

              </div>

              {message && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                  {message}
                </div>
              )}

            </div>

          </section>

          {/* COMMAND PANEL */}

          <section className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-5 py-4">

              <h2 className="font-semibold text-[#12213a]">
                AI Command
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                AI interpretation of your voice
                instruction.
              </p>

            </div>

            <div className="p-5">

              {command ? (
                <div className="space-y-5">

                  {/* COMMAND TYPE */}

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Command Type
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                      {command.type}
                    </span>

                  </div>

                  {/* ACTION */}

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Requested Action
                    </p>

                    <p className="mt-2 text-lg font-bold text-[#12213a]">
                      {command.action}
                    </p>

                  </div>

                  {/* TARGET */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-lg bg-gray-50 p-4">

                      <p className="text-[11px] font-semibold uppercase text-gray-400">
                        Target
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-700">
                        {command.target}
                      </p>

                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">

                      <p className="text-[11px] font-semibold uppercase text-gray-400">
                        Value
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-700">
                        {command.value ||
                          "Not specified"}
                      </p>

                    </div>

                  </div>

                  {/* SAFETY NOTICE */}

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex gap-3">

                      <div className="text-lg">
                        ⚠️
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-amber-800">
                          Confirmation required
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          No inventory, purchase,
                          sales, or warehouse data
                          will be changed until you
                          explicitly confirm this
                          command.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* CONFIRM BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmation(
                        true
                      )
                    }
                    className="w-full rounded-lg bg-[#12213a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1c3152]"
                  >
                    Review & Confirm
                  </button>

                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
                    🎤
                  </div>

                  <h3 className="font-semibold text-gray-700">
                    No voice command yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                    Start voice input and speak
                    an inventory or operations
                    command.
                  </p>

                </div>
              )}

            </div>

          </section>

        </div>

                {/* SAMPLE COMMANDS */}

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="font-semibold text-[#12213a]">
              Example Voice Commands
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Click an example to test the voice
              command workflow.
            </p>

          </div>

          <div className="grid gap-3 md:grid-cols-2">

            {sampleCommands.map(
              (sample, index) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() =>
                    handleSampleCommand(
                      sample
                    )
                  }
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm group-hover:bg-blue-100">
                    🎙️
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-gray-400">
                      COMMAND {index + 1}
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {sample}
                    </p>

                  </div>

                </button>
              )
            )}

          </div>

        </section>

        {/* FEATURES */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="mb-3 text-2xl">
              🎤
            </div>

            <h3 className="font-semibold text-[#12213a]">
              Voice Input
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Speak naturally using the
              microphone on desktop or mobile.
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="mb-3 text-2xl">
              🌊
            </div>

            <h3 className="font-semibold text-[#12213a]">
              Live Waveform
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Visual waveform feedback shows
              when the assistant is actively
              listening.
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="mb-3 text-2xl">
              🔐
            </div>

            <h3 className="font-semibold text-[#12213a]">
              Safe Data Writes
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Voice-initiated changes require
              explicit confirmation before commit.
            </p>

          </div>

        </section>

      </div>

      {/* CONFIRMATION MODAL */}

      {showConfirmation &&
        command && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="border-b px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-xl">
                    ⚠️
                  </div>

                  <div>

                    <h2 className="font-bold text-[#12213a]">
                      Confirm Voice Action
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      This action may modify system
                      data.
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-4 p-6">

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    You said
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
                    “{command.text}”
                  </p>

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    AI will perform
                  </p>

                  <p className="mt-2 text-base font-bold text-[#12213a]">
                    {command.action}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <div>

                      <p className="text-[10px] uppercase text-gray-400">
                        Target
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {command.target}
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] uppercase text-gray-400">
                        Value
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-700">
                        {command.value ||
                          "N/A"}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">
                  Please verify the action
                  carefully. Voice commands should
                  only be committed after explicit
                  confirmation.
                </div>

              </div>

              <div className="flex gap-3 border-t bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={
                    cancelCommand
                  }
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    confirmCommand
                  }
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  ✓ Confirm Action
                </button>

              </div>

            </div>

          </div>
        )}

    </main>
  );
}