"""add delivery notes

Revision ID: fd77d738d89a
Revises: 1bad719e606b
Create Date: 2026-09-10 15:42:41.917778
"""

from alembic import op
import sqlalchemy as sa


revision = "fd77d738d89a"
down_revision = "1bad719e606b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Delivery notes / challans (FR-SAL-08)
    op.create_table(
        "delivery_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("delivery_number", sa.String(length=40), nullable=False),
        sa.Column("sales_order_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=True),
        sa.Column("delivery_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("delivery_address", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"]),
        sa.ForeignKeyConstraint(["sales_order_id"], ["sales_orders.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_delivery_notes_sales_order_id"),
        "delivery_notes",
        ["sales_order_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_delivery_notes_tenant_id"),
        "delivery_notes",
        ["tenant_id"],
        unique=False,
    )

    op.create_index(
        "ix_delivery_notes_tenant_number",
        "delivery_notes",
        ["tenant_id", "delivery_number"],
        unique=True,
    )

    # Delivery note line items
    op.create_table(
        "delivery_note_lines",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("delivery_note_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["delivery_note_id"], ["delivery_notes.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_delivery_note_lines_delivery_note_id"),
        "delivery_note_lines",
        ["delivery_note_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_delivery_note_lines_product_id"),
        "delivery_note_lines",
        ["product_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_delivery_note_lines_tenant_id"),
        "delivery_note_lines",
        ["tenant_id"],
        unique=False,
    )


def downgrade() -> None:
    # Remove delivery note line items first because they reference delivery_notes.
    op.drop_index(
        op.f("ix_delivery_note_lines_tenant_id"),
        table_name="delivery_note_lines",
    )

    op.drop_index(
        op.f("ix_delivery_note_lines_product_id"),
        table_name="delivery_note_lines",
    )

    op.drop_index(
        op.f("ix_delivery_note_lines_delivery_note_id"),
        table_name="delivery_note_lines",
    )

    op.drop_table("delivery_note_lines")

    # Remove delivery notes.
    op.drop_index(
        "ix_delivery_notes_tenant_number",
        table_name="delivery_notes",
    )

    op.drop_index(
        op.f("ix_delivery_notes_tenant_id"),
        table_name="delivery_notes",
    )

    op.drop_index(
        op.f("ix_delivery_notes_sales_order_id"),
        table_name="delivery_notes",
    )

    op.drop_table("delivery_notes")