"""AI Voice Assistant service for AI-StockFlow.

Phase-3 MVP:
- interprets a voice/text transcript into a safe command proposal
- reuses the existing Copilot for read-only business questions
- never mutates inventory directly
- mutation commands require human confirmation before execution
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VoiceCommand:
    transcript: str
    command_type: str
    intent: str
    requires_confirmation: bool
    proposed_action: dict | None
    answer: dict | None


def _mutation_proposal(transcript: str) -> VoiceCommand | None:
    """Detect common mutation commands without executing them."""
    text = transcript.strip().lower()

    if any(
        phrase in text
        for phrase in (
            "add ",
            "increase stock",
            "decrease stock",
            "remove stock",
            "generate purchase order",
            "create purchase order",
        )
    ):
        return VoiceCommand(
            transcript=transcript,
            command_type="mutation",
            intent="proposed_business_change",
            requires_confirmation=True,
            proposed_action={
                "status": "pending_confirmation",
                "instruction": transcript.strip(),
                "message": (
                    "This command would modify business data. "
                    "Review the proposed action and confirm it on screen "
                    "before committing."
                ),
            },
            answer=None,
        )

    return None


def interpret_voice_command(
    *,
    transcript: str,
    copilot_answer: dict | None = None,
) -> VoiceCommand:
    """Convert a transcript into a safe read-only answer or mutation proposal."""

    cleaned = transcript.strip()

    if not cleaned:
        raise ValueError("Voice transcript is empty.")

    mutation = _mutation_proposal(cleaned)
    if mutation:
        return mutation

    return VoiceCommand(
        transcript=cleaned,
        command_type="query",
        intent="business_question",
        requires_confirmation=False,
        proposed_action=None,
        answer=copilot_answer,
    )