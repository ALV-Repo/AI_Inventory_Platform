"""add crm hrm whs tables

Revision ID: c001_nikhil
Revises: 819db5bd6fda
Create Date: 2026-09-08

Dev C — adds:
  CRM:  leads, lead_activities, sales_pipeline
  HRM:  employees, attendance, leave_requests, payslips
  WHS:  warehouse_bins, pick_lists, pick_list_lines, put_aways, dispatches
"""

from alembic import op
import sqlalchemy as sa

revision = "c001_nikhil"
down_revision = "819db5bd6fda"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── CRM ──────────────────────────────────────────────────────────────────
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("email", sa.String(180)),
        sa.Column("phone", sa.String(32)),
        sa.Column("source", sa.String(40), server_default="walk_in"),
        sa.Column("status", sa.String(32), server_default="new"),
        sa.Column("assigned_to", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("updated_at", sa.DateTime()),
    )
    op.create_index("ix_leads_tenant_status", "leads", ["tenant_id", "status"])

    op.create_table(
        "lead_activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("lead_id", sa.Integer(), sa.ForeignKey("leads.id"), nullable=False, index=True),
        sa.Column("activity_type", sa.String(40), server_default="note"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("due_date", sa.DateTime()),
        sa.Column("completed", sa.Boolean(), server_default=sa.false()),
        sa.Column("completed_at", sa.DateTime()),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime()),
    )

    op.create_table(
        "sales_pipeline",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False, index=True),
        sa.Column("title", sa.String(220), nullable=False),
        sa.Column("stage", sa.String(40), server_default="prospect"),
        sa.Column("value", sa.Float(), server_default="0"),
        sa.Column("expected_close_date", sa.Date()),
        sa.Column("assigned_to", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("updated_at", sa.DateTime()),
    )
    op.create_index("ix_pipeline_tenant_stage", "sales_pipeline", ["tenant_id", "stage"])

    # ── HRM ──────────────────────────────────────────────────────────────────
    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("employee_code", sa.String(32), nullable=False),
        sa.Column("full_name", sa.String(180), nullable=False),
        sa.Column("email", sa.String(180)),
        sa.Column("phone", sa.String(32)),
        sa.Column("department", sa.String(120)),
        sa.Column("designation", sa.String(120)),
        sa.Column("joining_date", sa.Date(), nullable=False),
        sa.Column("basic_salary", sa.Float(), server_default="0"),
        sa.Column("status", sa.String(20), server_default="active"),
        sa.Column("created_at", sa.DateTime()),
    )
    op.create_unique_constraint("ix_employees_tenant_code", "employees", ["tenant_id", "employee_code"])

    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("employee_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=False, index=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("check_in", sa.DateTime()),
        sa.Column("check_out", sa.DateTime()),
        sa.Column("status", sa.String(20), server_default="present"),
        sa.Column("source", sa.String(20), server_default="manual"),
    )
    op.create_unique_constraint("ix_attendance_employee_date", "attendance", ["tenant_id", "employee_id", "date"])

    op.create_table(
        "leave_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("employee_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=False, index=True),
        sa.Column("leave_type", sa.String(40), server_default="casual"),
        sa.Column("from_date", sa.Date(), nullable=False),
        sa.Column("to_date", sa.Date(), nullable=False),
        sa.Column("days", sa.Float(), nullable=False),
        sa.Column("reason", sa.Text()),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("approved_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime()),
    )

    op.create_table(
        "payslips",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("employee_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=False, index=True),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("working_days", sa.Float(), server_default="0"),
        sa.Column("present_days", sa.Float(), server_default="0"),
        sa.Column("basic", sa.Float(), server_default="0"),
        sa.Column("allowances", sa.Float(), server_default="0"),
        sa.Column("deductions", sa.Float(), server_default="0"),
        sa.Column("net_pay", sa.Float(), server_default="0"),
        sa.Column("status", sa.String(20), server_default="draft"),
        sa.Column("created_at", sa.DateTime()),
    )
    op.create_unique_constraint("ix_payslips_employee_month", "payslips", ["tenant_id", "employee_id", "year", "month"])

    # ── WHS ──────────────────────────────────────────────────────────────────
    op.create_table(
        "warehouse_bins",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False, index=True),
        sa.Column("zone", sa.String(32), nullable=False),
        sa.Column("rack", sa.String(32), nullable=False),
        sa.Column("bin_code", sa.String(32), nullable=False),
        sa.Column("capacity", sa.Float(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
    )
    op.create_unique_constraint("ix_bins_tenant_code", "warehouse_bins", ["tenant_id", "warehouse_id", "bin_code"])

    op.create_table(
        "pick_lists",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("sales_order_id", sa.Integer(), sa.ForeignKey("sales_orders.id"), nullable=False, index=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("assigned_to", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("completed_at", sa.DateTime()),
    )

    op.create_table(
        "pick_list_lines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("pick_list_id", sa.Integer(), sa.ForeignKey("pick_lists.id"), nullable=False, index=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("bin_id", sa.Integer(), sa.ForeignKey("warehouse_bins.id")),
        sa.Column("quantity_required", sa.Float(), nullable=False),
        sa.Column("quantity_picked", sa.Float(), server_default="0"),
        sa.Column("is_picked", sa.Boolean(), server_default=sa.false()),
    )

    op.create_table(
        "put_aways",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("purchase_order_id", sa.Integer(), sa.ForeignKey("purchase_orders.id"), nullable=False, index=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("suggested_bin_id", sa.Integer(), sa.ForeignKey("warehouse_bins.id")),
        sa.Column("actual_bin_id", sa.Integer(), sa.ForeignKey("warehouse_bins.id")),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("assigned_to", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("completed_at", sa.DateTime()),
    )

    op.create_table(
        "dispatches",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("sales_order_id", sa.Integer(), sa.ForeignKey("sales_orders.id"), nullable=False, index=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("courier", sa.String(120)),
        sa.Column("vehicle_number", sa.String(32)),
        sa.Column("tracking_number", sa.String(64)),
        sa.Column("gate_pass_number", sa.String(32)),
        sa.Column("dispatched_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("dispatched_at", sa.DateTime()),
        sa.Column("status", sa.String(20), server_default="dispatched"),
    )


def downgrade() -> None:
    op.drop_table("dispatches")
    op.drop_table("put_aways")
    op.drop_table("pick_list_lines")
    op.drop_table("pick_lists")
    op.drop_table("warehouse_bins")
    op.drop_table("payslips")
    op.drop_table("leave_requests")
    op.drop_table("attendance")
    op.drop_table("employees")
    op.drop_table("sales_pipeline")
    op.drop_table("lead_activities")
    op.drop_table("leads")
