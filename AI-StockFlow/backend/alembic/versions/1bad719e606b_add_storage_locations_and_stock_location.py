"""add storage locations and stock location

Revision ID: 1bad719e606b
Revises: bef59cb90f55
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1bad719e606b"
down_revision: Union[str, Sequence[str], None] = "bef59cb90f55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "storage_locations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
        ),
        sa.ForeignKeyConstraint(
            ["warehouse_id"],
            ["warehouses.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "tenant_id",
            "warehouse_id",
            "code",
            name="ix_storage_locations_tenant_warehouse_code",
        ),
    )

    op.create_index(
        "ix_storage_locations_warehouse_id",
        "storage_locations",
        ["warehouse_id"],
        unique=False,
    )

    op.add_column(
        "stock_items",
        sa.Column(
            "location_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_stock_items_location_id",
        "stock_items",
        ["location_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_stock_items_location_id",
        "stock_items",
        "storage_locations",
        ["location_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_stock_items_location_id",
        "stock_items",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_stock_items_location_id",
        table_name="stock_items",
    )

    op.drop_column(
        "stock_items",
        "location_id",
    )

    op.drop_index(
        "ix_storage_locations_warehouse_id",
        table_name="storage_locations",
    )

    op.drop_table("storage_locations")
