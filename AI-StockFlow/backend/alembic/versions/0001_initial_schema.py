"""Initial schema — created from the model metadata.

Revision ID: 0001
Revises:
Create Date: 2026-08-10

The first migration mirrors the ORM exactly so `alembic check` reports a clean
tree. Subsequent changes must come from `alembic revision --autogenerate`,
reviewed by hand before commit (CI verifies parity on every build).
"""
from alembic import op

from app.core.database import Base
from app.models import entities  # noqa: F401 — registers every table on Base

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
