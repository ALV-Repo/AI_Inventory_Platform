"""add product bom

Revision ID: 819db5bd6fda
Revises: bdeb6fed0ab2
Create Date: 2026-09-03 11:33:14.970763
"""

from alembic import op
import sqlalchemy as sa


revision = "819db5bd6fda"
down_revision = "bdeb6fed0ab2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_boms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "tenant_id",
            sa.Integer(),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_table(
        "product_bom_lines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "tenant_id",
            sa.Integer(),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "bom_id",
            sa.Integer(),
            sa.ForeignKey("product_boms.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "component_product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "quantity",
            sa.Float(),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "uq_product_bom_tenant_product",
        "product_boms",
        ["tenant_id", "product_id"],
    )

    op.create_unique_constraint(
        "uq_product_bom_line_component",
        "product_bom_lines",
        ["bom_id", "component_product_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_product_bom_line_component",
        "product_bom_lines",
        type_="unique",
    )

    op.drop_constraint(
        "uq_product_bom_tenant_product",
        "product_boms",
        type_="unique",
    )

    op.drop_table("product_bom_lines")
    op.drop_table("product_boms")