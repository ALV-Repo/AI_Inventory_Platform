"""Finance and accounting endpoints (SRS FR-FIN-01 through FR-FIN-07)."""

from __future__ import annotations

from datetime import date, datetime
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    Customer,
    Product,
    PurchaseOrder,
    SalesOrder,
    Supplier,
    StockMovement,
    User,
    utcnow,
)


router = APIRouter(prefix="/finance", tags=["Finance"])


# ============================================================
# FR-FIN-01 — GST ENGINE
# ============================================================

class GSTCalculateIn(BaseModel):
    taxable_amount: float = Field(gt=0)
    gst_rate: float = Field(ge=0, le=100)
    seller_state_code: str = Field(min_length=2, max_length=2)
    place_of_supply: str = Field(min_length=2, max_length=2)
    hsn_code: str | None = None
    tax_class: str | None = None


def calculate_gst(body: GSTCalculateIn) -> dict:
    taxable = round(body.taxable_amount, 2)
    rate = body.gst_rate

    tax = round(taxable * rate / 100, 2)

    if body.seller_state_code.upper() == body.place_of_supply.upper():
        cgst = round(tax / 2, 2)
        sgst = round(tax - cgst, 2)
        igst = 0.0
        tax_type = "CGST_SGST"
    else:
        cgst = 0.0
        sgst = 0.0
        igst = tax
        tax_type = "IGST"

    return {
        "taxable_amount": taxable,
        "gst_rate": rate,
        "cgst": cgst,
        "sgst": sgst,
        "igst": igst,
        "total_tax": round(cgst + sgst + igst, 2),
        "invoice_total": round(taxable + tax, 2),
        "tax_type": tax_type,
        "hsn_code": body.hsn_code,
        "tax_class": body.tax_class,
        "place_of_supply": body.place_of_supply.upper(),
    }


@router.post("/gst/calculate")
def gst_calculate(
    body: GSTCalculateIn,
    user: User = Depends(require("finance:read")),
):
    return calculate_gst(body)


@router.get("/gst-summary")
def gst_summary(
    date_from: date | None = None,
    date_to: date | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, SalesOrder, user.tenant_id)

    if date_from:
        query = query.filter(SalesOrder.created_at >= datetime.combine(date_from, datetime.min.time()))

    if date_to:
        query = query.filter(
            SalesOrder.created_at <= datetime.combine(date_to, datetime.max.time())
        )

    rows = (
        query.with_entities(
            SalesOrder.tax_amount,
            SalesOrder.total,
        )
        .all()
    )

    total_tax = round(sum(float(r.tax_amount or 0) for r in rows), 2)
    total_sales = round(sum(float(r.total or 0) for r in rows), 2)

    return {
        "period": {
            "from": date_from,
            "to": date_to,
        },
        "invoice_count": len(rows),
        "taxable_and_tax_total": total_sales,
        "total_gst": total_tax,
        "gstr1_view": {
            "outward_supplies": total_sales,
            "tax_collected": total_tax,
        },
        "gstr3b_view": {
            "taxable_outward_supplies": round(total_sales - total_tax, 2),
            "output_tax": total_tax,
        },
    }


# ============================================================
# FR-FIN-02 — EXPENSES
# ============================================================

class ExpenseIn(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    payment_mode: str = Field(default="cash", max_length=30)
    description: str | None = None
    attachment_url: str | None = None
    expense_date: date | None = None


@router.post("/expenses")
def create_expense(
    body: ExpenseIn,
    user: User = Depends(require("finance:write")),
    db: Session = Depends(get_db),
):
    # Finance models are expected to be added through the Finance migration.
    from app.models.entities import Expense

    expense = Expense(
        tenant_id=user.tenant_id,
        category=body.category,
        amount=body.amount,
        payment_mode=body.payment_mode,
        description=body.description,
        attachment_url=body.attachment_url,
        expense_date=body.expense_date or date.today(),
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {
        "id": expense.id,
        "category": expense.category,
        "amount": expense.amount,
        "payment_mode": expense.payment_mode,
        "description": expense.description,
        "attachment_url": expense.attachment_url,
        "expense_date": expense.expense_date,
    }


@router.get("/expenses")
def list_expenses(
    date_from: date | None = None,
    date_to: date | None = None,
    category: str | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import Expense

    query = scoped(db, Expense, user.tenant_id)

    if date_from:
        query = query.filter(Expense.expense_date >= date_from)

    if date_to:
        query = query.filter(Expense.expense_date <= date_to)

    if category:
        query = query.filter(Expense.category == category)

    expenses = query.order_by(Expense.expense_date.desc()).all()

    return [
        {
            "id": e.id,
            "category": e.category,
            "amount": e.amount,
            "payment_mode": e.payment_mode,
            "description": e.description,
            "attachment_url": e.attachment_url,
            "expense_date": e.expense_date,
        }
        for e in expenses
    ]


@router.get("/expenses/summary")
def expense_summary(
    date_from: date | None = None,
    date_to: date | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import Expense

    query = scoped(db, Expense, user.tenant_id)

    if date_from:
        query = query.filter(Expense.expense_date >= date_from)

    if date_to:
        query = query.filter(Expense.expense_date <= date_to)

    rows = (
        query.with_entities(
            Expense.category,
            func.sum(Expense.amount),
        )
        .group_by(Expense.category)
        .all()
    )

    result = {
        str(category): round(float(amount or 0), 2)
        for category, amount in rows
    }

    return {
        "period": {
            "from": date_from,
            "to": date_to,
        },
        "by_category": result,
        "total": round(sum(result.values()), 2),
    }


# ============================================================
# FR-FIN-03 — PROFIT & LOSS
# ============================================================

@router.get("/profit-loss")
def profit_loss(
    date_from: date,
    date_to: date,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    if date_to < date_from:
        raise HTTPException(400, "date_to must be greater than or equal to date_from")

    sales_query = scoped(db, SalesOrder, user.tenant_id).filter(
        SalesOrder.created_at >= datetime.combine(date_from, datetime.min.time()),
        SalesOrder.created_at <= datetime.combine(date_to, datetime.max.time()),
    )

    sales_rows = sales_query.all()

    revenue = round(
        sum(float(order.total or 0) for order in sales_rows),
        2,
    )

    tax = round(
        sum(float(order.tax_amount or 0) for order in sales_rows),
        2,
    )

    from app.models.entities import Expense

    expense_query = scoped(db, Expense, user.tenant_id).filter(
        Expense.expense_date >= date_from,
        Expense.expense_date <= date_to,
    )

    expenses = round(
        sum(float(e.amount or 0) for e in expense_query.all()),
        2,
    )

    # Calculate COGS from stock-out movements using their recorded
    # weighted-average unit cost.
    stock_movements = scoped(db, StockMovement, user.tenant_id).filter(
        StockMovement.created_at >= datetime.combine(
            date_from, datetime.min.time()
        ),
        StockMovement.created_at <= datetime.combine(
            date_to, datetime.max.time()
        ),
    ).all()

    cogs = round(
        sum(
            abs(float(m.quantity or 0)) * float(m.unit_cost or 0)
            for m in stock_movements
            if str(m.movement_type).upper() in {"SALE", "OUT"}
        ),
        2,
    )

    net_sales = round(revenue - tax, 2)
    gross_profit = round(net_sales - cogs, 2)
    net_profit = round(gross_profit - expenses, 2)

    return {
        "period": {
            "from": date_from,
            "to": date_to,
        },
        "revenue": revenue,
        "gst": tax,
        "net_sales": net_sales,
        "cogs": cogs,
        "gross_profit": gross_profit,
        "expenses": expenses,
        "net_profit": net_profit,
    }


# ============================================================
# FR-FIN-04 — CASH FLOW
# ============================================================

@router.get("/cash-flow")
def cash_flow(
    date_from: date,
    date_to: date,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import Expense, FinanceTransaction

    transactions = (
        scoped(db, FinanceTransaction, user.tenant_id)
        .filter(
            FinanceTransaction.transaction_date >= date_from,
            FinanceTransaction.transaction_date <= date_to,
        )
        .all()
    )

    expenses = (
        scoped(db, Expense, user.tenant_id)
        .filter(
            Expense.expense_date >= date_from,
            Expense.expense_date <= date_to,
        )
        .all()
    )

    inflows = round(
        sum(
            float(t.amount or 0)
            for t in transactions
            if str(t.transaction_type).lower() in {"receipt", "inflow", "income"}
        ),
        2,
    )

    transaction_outflows = round(
        sum(
            float(t.amount or 0)
            for t in transactions
            if str(t.transaction_type).lower() in {"payment", "outflow", "expense"}
        ),
        2,
    )

    expense_outflows = round(
        sum(float(e.amount or 0) for e in expenses),
        2,
    )

    total_outflow = round(transaction_outflows + expense_outflows, 2)

    return {
        "period": {
            "from": date_from,
            "to": date_to,
        },
        "inflows": inflows,
        "payments": transaction_outflows,
        "expenses": expense_outflows,
        "total_outflows": total_outflow,
        "net_cash_flow": round(inflows - total_outflow, 2),
    }


# ============================================================
# FR-FIN-05 — AR / AP AGING
# ============================================================

def aging_bucket(days: int) -> str:
    if days <= 30:
        return "0-30"
    if days <= 60:
        return "31-60"
    if days <= 90:
        return "61-90"
    return "90+"


@router.get("/aging")
def aging(
    as_of: date | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    as_of = as_of or date.today()

    customers = scoped(db, Customer, user.tenant_id).all()
    suppliers = scoped(db, Supplier, user.tenant_id).all()

    ar = {
        "0-30": 0.0,
        "31-60": 0.0,
        "61-90": 0.0,
        "90+": 0.0,
    }

    for customer in customers:
        outstanding = float(customer.outstanding or 0)

        if outstanding <= 0:
            continue

        terms = int(getattr(customer, "payment_terms_days", 30) or 30)
        # Customer model does not currently expose invoice due dates.
        # Use payment terms as a conservative aging basis.
        bucket = aging_bucket(terms)
        ar[bucket] += outstanding

    ap = {
        "0-30": 0.0,
        "31-60": 0.0,
        "61-90": 0.0,
        "90+": 0.0,
    }

    for supplier in suppliers:
        # Supplier outstanding is not guaranteed in the base model.
        outstanding = float(getattr(supplier, "outstanding", 0) or 0)

        if outstanding <= 0:
            continue

        terms = int(getattr(supplier, "payment_terms_days", 30) or 30)
        bucket = aging_bucket(terms)
        ap[bucket] += outstanding

    return {
        "as_of": as_of,
        "accounts_receivable": {
            key: round(value, 2)
            for key, value in ar.items()
        },
        "accounts_payable": {
            key: round(value, 2)
            for key, value in ap.items()
        },
        "ar_total": round(sum(ar.values()), 2),
        "ap_total": round(sum(ap.values()), 2),
        "reminder_status": "ready",
    }


@router.get("/payment-reminders")
def payment_reminders(
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    customers = scoped(db, Customer, user.tenant_id).all()

    reminders = []

    for customer in customers:
        outstanding = float(customer.outstanding or 0)

        if outstanding > 0:
            reminders.append(
                {
                    "customer_id": customer.id,
                    "customer_name": customer.name,
                    "outstanding": round(outstanding, 2),
                    "payment_terms_days": customer.payment_terms_days,
                    "status": "payment_due",
                }
            )

    return {
        "count": len(reminders),
        "reminders": reminders,
    }


# ============================================================
# FR-FIN-06 — RECEIPTS / PAYMENTS
# ============================================================

class FinanceTransactionIn(BaseModel):
    transaction_type: str = Field(
        description="receipt or payment"
    )
    amount: float = Field(gt=0)
    payment_mode: str = Field(default="cash", max_length=30)
    reference_type: str | None = None
    reference_id: int | None = None
    party_id: int | None = None
    notes: str | None = None
    transaction_date: date | None = None


@router.post("/transactions")
def create_transaction(
    body: FinanceTransactionIn,
    user: User = Depends(require("finance:write")),
    db: Session = Depends(get_db),
):
    from app.models.entities import FinanceTransaction

    transaction_type = body.transaction_type.lower()

    if transaction_type not in {"receipt", "payment"}:
        raise HTTPException(
            400,
            "transaction_type must be 'receipt' or 'payment'",
        )

    transaction = FinanceTransaction(
        tenant_id=user.tenant_id,
        transaction_type=transaction_type,
        amount=body.amount,
        payment_mode=body.payment_mode,
        reference_type=body.reference_type,
        reference_id=body.reference_id,
        party_id=body.party_id,
        notes=body.notes,
        transaction_date=body.transaction_date or date.today(),
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "id": transaction.id,
        "transaction_type": transaction.transaction_type,
        "amount": transaction.amount,
        "payment_mode": transaction.payment_mode,
        "reference_type": transaction.reference_type,
        "reference_id": transaction.reference_id,
        "party_id": transaction.party_id,
        "transaction_date": transaction.transaction_date,
    }


@router.get("/transactions")
def list_transactions(
    transaction_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import FinanceTransaction

    query = scoped(db, FinanceTransaction, user.tenant_id)

    if transaction_type:
        query = query.filter(
            FinanceTransaction.transaction_type == transaction_type.lower()
        )

    if date_from:
        query = query.filter(
            FinanceTransaction.transaction_date >= date_from
        )

    if date_to:
        query = query.filter(
            FinanceTransaction.transaction_date <= date_to
        )

    rows = query.order_by(
        FinanceTransaction.transaction_date.desc()
    ).all()

    return [
        {
            "id": t.id,
            "transaction_type": t.transaction_type,
            "amount": t.amount,
            "payment_mode": t.payment_mode,
            "reference_type": t.reference_type,
            "reference_id": t.reference_id,
            "party_id": t.party_id,
            "notes": t.notes,
            "transaction_date": t.transaction_date,
        }
        for t in rows
    ]


class AllocationIn(BaseModel):
    transaction_id: int
    document_type: str
    document_id: int
    allocated_amount: float = Field(gt=0)


@router.post("/allocations")
def create_allocation(
    body: AllocationIn,
    user: User = Depends(require("finance:write")),
    db: Session = Depends(get_db),
):
    from app.models.entities import FinanceAllocation, FinanceTransaction

    transaction = (
        scoped(db, FinanceTransaction, user.tenant_id)
        .filter(FinanceTransaction.id == body.transaction_id)
        .first()
    )

    if not transaction:
        raise HTTPException(404, "Finance transaction not found")

    allocation = FinanceAllocation(
        tenant_id=user.tenant_id,
        transaction_id=body.transaction_id,
        document_type=body.document_type,
        document_id=body.document_id,
        allocated_amount=body.allocated_amount,
    )

    db.add(allocation)
    db.commit()
    db.refresh(allocation)

    return {
        "id": allocation.id,
        "transaction_id": allocation.transaction_id,
        "document_type": allocation.document_type,
        "document_id": allocation.document_id,
        "allocated_amount": allocation.allocated_amount,
    }


@router.get("/allocations")
def list_allocations(
    transaction_id: int | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import FinanceAllocation

    query = scoped(db, FinanceAllocation, user.tenant_id)

    if transaction_id:
        query = query.filter(
            FinanceAllocation.transaction_id == transaction_id
        )

    rows = query.order_by(FinanceAllocation.id.desc()).all()

    return [
        {
            "id": a.id,
            "transaction_id": a.transaction_id,
            "document_type": a.document_type,
            "document_id": a.document_id,
            "allocated_amount": a.allocated_amount,
        }
        for a in rows
    ]


# ============================================================
# FR-FIN-07 — ACCOUNTING EXPORT
# ============================================================

@router.get("/export/tally")
def export_tally(
    date_from: date | None = None,
    date_to: date | None = None,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    from app.models.entities import Expense, FinanceTransaction

    transaction_query = scoped(
        db,
        FinanceTransaction,
        user.tenant_id,
    )

    expense_query = scoped(
        db,
        Expense,
        user.tenant_id,
    )

    if date_from:
        transaction_query = transaction_query.filter(
            FinanceTransaction.transaction_date >= date_from
        )
        expense_query = expense_query.filter(
            Expense.expense_date >= date_from
        )

    if date_to:
        transaction_query = transaction_query.filter(
            FinanceTransaction.transaction_date <= date_to
        )
        expense_query = expense_query.filter(
            Expense.expense_date <= date_to
        )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow(
        [
            "Date",
            "Voucher Type",
            "Amount",
            "Payment Mode",
            "Reference Type",
            "Reference ID",
            "Party ID",
            "Notes",
        ]
    )

    for transaction in transaction_query.all():
        voucher_type = (
            "Receipt"
            if transaction.transaction_type == "receipt"
            else "Payment"
        )

        writer.writerow(
            [
                transaction.transaction_date,
                voucher_type,
                transaction.amount,
                transaction.payment_mode,
                transaction.reference_type,
                transaction.reference_id,
                transaction.party_id,
                transaction.notes,
            ]
        )

    for expense in expense_query.all():
        writer.writerow(
            [
                expense.expense_date,
                "Expense",
                expense.amount,
                expense.payment_mode,
                "expense",
                expense.id,
                "",
                expense.description,
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=finance_tally_export.csv"
        },
    )