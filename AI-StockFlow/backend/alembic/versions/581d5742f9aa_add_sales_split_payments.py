"""add sales split payments

Revision ID: 581d5742f9aa
Revises: fd77d738d89a
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa


revision = "581d5742f9aa"
down_revision = "fd77d738d89a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sales_payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sales_order_id", sa.Integer(), nullable=False),
        sa.Column("payment_mode", sa.String(length=24), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("reference", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["sales_order_id"],
            ["sales_orders.id"],
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_sales_payments_sales_order_id",
        "sales_payments",
        ["sales_order_id"],
        unique=False,
    )

    op.create_index(
        "ix_sales_payments_tenant_id",
        "sales_payments",
        ["tenant_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_sales_payments_tenant_id",
        table_name="sales_payments",
    )

    op.drop_index(
        "ix_sales_payments_sales_order_id",
        table_name="sales_payments",
    )

    op.drop_table("sales_payments")