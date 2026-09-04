"""add stock transfer workflow

Revision ID: 1a386523d085
Revises: 0001
Create Date: 2026-08-18
"""

from alembic import op
import sqlalchemy as sa


revision = "1a386523d085"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "stock_transfers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("from_warehouse_id", sa.Integer(), nullable=False),
        sa.Column("to_warehouse_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("dispatched_by", sa.Integer(), nullable=True),
        sa.Column("received_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("dispatched_at", sa.DateTime(), nullable=True),
        sa.Column("received_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.ForeignKeyConstraint(
            ["from_warehouse_id"],
            ["warehouses.id"],
        ),
        sa.ForeignKeyConstraint(
            ["to_warehouse_id"],
            ["warehouses.id"],
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["approved_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["dispatched_by"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["received_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_stock_transfers_product_id",
        "stock_transfers",
        ["product_id"],
    )

    op.create_index(
        "ix_stock_transfers_status",
        "stock_transfers",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_stock_transfers_status",
        table_name="stock_transfers",
    )
    op.drop_index(
        "ix_stock_transfers_product_id",
        table_name="stock_transfers",
    )
    op.drop_table("stock_transfers")