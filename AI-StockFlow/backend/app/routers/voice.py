"""AI Voice Assistant endpoints (SRS FR-AI-VOC-01..02)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require
from app.models.entities import User
from app.services.copilot import answer_question
from app.services.voice import interpret_voice_command


router = APIRouter(prefix="/ai/voice", tags=["AI Voice"])


class VoiceCommandRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=500)
    conversation_id: str | None = None


class VoiceCommandResponse(BaseModel):
    transcript: str
    command_type: str
    intent: str
    requires_confirmation: bool
    proposed_action: dict | None = None
    answer: dict | None = None


@router.post("/command", response_model=VoiceCommandResponse)
def voice_command(
    body: VoiceCommandRequest,
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Interpret a voice transcript safely.

    Read-only commands are answered through the existing Copilot.
    Commands that may modify business data are returned as proposals
    requiring human confirmation and are never executed here.
    """

    transcript = body.transcript.strip()

    if not transcript:
        raise HTTPException(
            status_code=400,
            detail="Voice transcript is empty.",
        )

    text = transcript.lower()

    mutation_phrases = (
        "add ",
        "increase stock",
        "decrease stock",
        "remove stock",
        "generate purchase order",
        "create purchase order",
    )

    is_mutation = any(
        phrase in text
        for phrase in mutation_phrases
    )

    copilot_answer = None

    if not is_mutation:
        copilot_answer = answer_question(
            db=db,
            tenant_id=user.tenant_id,
            user_id=user.id,
            role=user.role,
            question=transcript,
            conversation_id=body.conversation_id,
        )

    result = interpret_voice_command(
        transcript=transcript,
        copilot_answer=copilot_answer,
    )

    return VoiceCommandResponse(
        transcript=result.transcript,
        command_type=result.command_type,
        intent=result.intent,
        requires_confirmation=result.requires_confirmation,
        proposed_action=result.proposed_action,
        answer=result.answer,
    )