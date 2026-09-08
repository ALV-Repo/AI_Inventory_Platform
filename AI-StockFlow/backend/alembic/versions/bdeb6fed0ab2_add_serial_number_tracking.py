
from alembic import op
import sqlalchemy as sa


revision = "bdeb6fed0ab2"
down_revision = "ffe3de024c64"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "stock_serials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("serial_number", sa.String(length=128), nullable=False),
        sa.Column("batch_no", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_stock_serials_product_id"),
        "stock_serials",
        ["product_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stock_serials_serial_number"),
        "stock_serials",
        ["serial_number"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stock_serials_tenant_id"),
        "stock_serials",
        ["tenant_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stock_serials_warehouse_id"),
        "stock_serials",
        ["warehouse_id"],
        unique=False,
    )

    op.create_index(
        "uq_stock_serial_tenant_serial",
        "stock_serials",
        ["tenant_id", "serial_number"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "uq_stock_serial_tenant_serial",
        table_name="stock_serials",
    )

    op.drop_index(
        op.f("ix_stock_serials_warehouse_id"),
        table_name="stock_serials",
    )

    op.drop_index(
        op.f("ix_stock_serials_tenant_id"),
        table_name="stock_serials",
    )

    op.drop_index(
        op.f("ix_stock_serials_serial_number"),
        table_name="stock_serials",
    )

    op.drop_index(
        op.f("ix_stock_serials_product_id"),
        table_name="stock_serials",
    )

    op.drop_table("stock_serials")