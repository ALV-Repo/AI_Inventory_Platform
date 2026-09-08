"""CRM endpoints (FR-CRM-01 to FR-CRM-04)."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, Customer, Lead, LeadActivity, SalesPipeline, SalesOrder, User, utcnow,
)

router = APIRouter(prefix="/crm", tags=["CRM"])


# ── FR-CRM-01: Leads ─────────────────────────────────────────────────────────

class LeadIn(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    email: str | None = None
    phone: str | None = None
    source: str = Field(default="walk_in")   # walk_in|referral|online|campaign
    notes: str | None = None


class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    source: str | None = None
    status: str | None = None
    notes: str | None = None


def _lead_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "source": lead.source,
        "status": lead.status,
        "notes": lead.notes,
        "assigned_to": lead.assigned_to,
        "created_at": lead.created_at,
        "activity_count": len(lead.activities) if lead.activities else 0,
    }


@router.get("/leads")
def list_leads(
    source: str | None = None,
    status: str | None = None,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, Lead, user.tenant_id)
    if source:
        query = query.filter(Lead.source == source)
    if status:
        query = query.filter(Lead.status == status)
    leads = query.order_by(Lead.created_at.desc()).all()
    return [_lead_dict(l) for l in leads]


@router.get("/leads/{lead_id}")
def get_lead(
    lead_id: int,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    lead = scoped(db, Lead, user.tenant_id).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found.")
    return _lead_dict(lead)


@router.post("/leads", status_code=status.HTTP_201_CREATED)
def create_lead(
    body: LeadIn,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    lead = Lead(
        tenant_id=user.tenant_id,
        name=body.name,
        email=body.email,
        phone=body.phone,
        source=body.source,
        notes=body.notes,
        status="new",
        assigned_to=user.id,
    )
    db.add(lead)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="crm.lead.created", entity_type="lead",
        details={"name": body.name, "source": body.source},
    ))
    db.commit()
    db.refresh(lead)
    return _lead_dict(lead)


@router.patch("/leads/{lead_id}")
def update_lead(
    lead_id: int,
    body: LeadUpdate,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    lead = scoped(db, Lead, user.tenant_id).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(lead, field, value)
    db.commit()
    db.refresh(lead)
    return _lead_dict(lead)


# ── FR-CRM-02: Activities / Follow-ups ───────────────────────────────────────

class ActivityIn(BaseModel):
    lead_id: int
    activity_type: str = Field(default="note")
    description: str = Field(min_length=1)
    due_date: str | None = None   # ISO datetime string


@router.get("/leads/{lead_id}/activities")
def list_activities(
    lead_id: int,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    lead = scoped(db, Lead, user.tenant_id).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found.")
    activities = (
        scoped(db, LeadActivity, user.tenant_id)
        .filter(LeadActivity.lead_id == lead_id)
        .order_by(LeadActivity.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "lead_id": a.lead_id,
            "activity_type": a.activity_type,
            "description": a.description,
            "due_date": a.due_date,
            "completed": a.completed,
            "completed_at": a.completed_at,
            "created_at": a.created_at,
        }
        for a in activities
    ]


@router.post("/activities", status_code=status.HTTP_201_CREATED)
def create_activity(
    body: ActivityIn,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    # Verify lead belongs to this tenant
    lead = scoped(db, Lead, user.tenant_id).filter(Lead.id == body.lead_id).first()
    if not lead:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found.")

    activity = LeadActivity(
        tenant_id=user.tenant_id,
        lead_id=body.lead_id,
        activity_type=body.activity_type,
        description=body.description,
        due_date=body.due_date,
        completed=False,
        created_by=user.id,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return {
        "id": activity.id,
        "lead_id": activity.lead_id,
        "activity_type": activity.activity_type,
        "description": activity.description,
        "due_date": activity.due_date,
        "completed": activity.completed,
        "created_at": activity.created_at,
    }


@router.post("/activities/{activity_id}/complete")
def complete_activity(
    activity_id: int,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    activity = (
        scoped(db, LeadActivity, user.tenant_id)
        .filter(LeadActivity.id == activity_id)
        .first()
    )
    if not activity:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Activity not found.")
    activity.completed = True
    activity.completed_at = utcnow()
    db.commit()
    return {"id": activity.id, "completed": True}


# ── FR-CRM-03: Customer 360 View ─────────────────────────────────────────────

@router.get("/customers/{customer_id}/360")
def customer_360(
    customer_id: int,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    """
    360-degree customer view: profile, orders, invoices, payments,
    and AI-derived purchase frequency. FR-CRM-03
    """
    customer = (
        scoped(db, Customer, user.tenant_id)
        .filter(Customer.id == customer_id)
        .first()
    )
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")

    # Sales history
    orders = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(SalesOrder.customer_id == customer_id)
        .order_by(SalesOrder.order_date.desc())
        .limit(20)
        .all()
    )

    total_orders = len(orders)
    total_spent = sum(o.total or 0 for o in orders)
    avg_order_value = round(total_spent / total_orders, 2) if total_orders else 0

    # Purchase frequency (orders per month over last 90 days)
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    recent = [o for o in orders if o.order_date and o.order_date >= cutoff]
    purchase_frequency = round(len(recent) / 3, 1)  # per month

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "gstin": customer.gstin,
            "credit_limit": customer.credit_limit,
            "outstanding": customer.outstanding,
        },
        "summary": {
            "total_orders": total_orders,
            "total_spent": round(total_spent, 2),
            "avg_order_value": avg_order_value,
            "purchase_frequency_per_month": purchase_frequency,
            "outstanding_balance": customer.outstanding,
        },
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "order_date": o.order_date,
                "total": o.total,
                "status": o.status,
                "payment_mode": o.payment_mode,
            }
            for o in orders[:10]
        ],
        "ai_insights": {
            "purchase_frequency_per_month": purchase_frequency,
            "segment": (
                "high_value" if total_spent > 100000
                else "regular" if total_orders > 5
                else "new"
            ),
            "churn_risk": "low" if purchase_frequency >= 2 else "medium" if purchase_frequency >= 1 else "high",
        },
    }


# ── FR-CRM-04: Sales Pipeline ─────────────────────────────────────────────────

class PipelineIn(BaseModel):
    customer_id: int
    title: str = Field(min_length=1, max_length=220)
    stage: str = Field(default="prospect")
    value: float = Field(default=0.0, ge=0)
    expected_close_date: date | None = None
    notes: str | None = None


class PipelineUpdate(BaseModel):
    title: str | None = None
    stage: str | None = None
    value: float | None = None
    expected_close_date: date | None = None
    notes: str | None = None


def _pipeline_dict(p: SalesPipeline) -> dict:
    return {
        "id": p.id,
        "customer_id": p.customer_id,
        "title": p.title,
        "stage": p.stage,
        "value": p.value,
        "expected_close_date": p.expected_close_date,
        "notes": p.notes,
        "created_at": p.created_at,
    }


@router.get("/pipeline")
def list_pipeline(
    stage: str | None = None,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, SalesPipeline, user.tenant_id)
    if stage:
        query = query.filter(SalesPipeline.stage == stage)

    items = query.order_by(SalesPipeline.value.desc()).all()

    # Group by stage for kanban view
    stages = ["prospect", "proposal", "negotiation", "closed_won", "closed_lost"]
    kanban = {s: [] for s in stages}
    for item in items:
        bucket = item.stage if item.stage in kanban else "prospect"
        kanban[bucket].append(_pipeline_dict(item))

    total_value = sum(i.value or 0 for i in items if i.stage not in {"closed_lost"})

    return {
        "total_pipeline_value": round(total_value, 2),
        "kanban": kanban,
        "items": [_pipeline_dict(i) for i in items],
    }


@router.post("/pipeline", status_code=status.HTTP_201_CREATED)
def create_pipeline_item(
    body: PipelineIn,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    # Verify customer
    customer = (
        scoped(db, Customer, user.tenant_id)
        .filter(Customer.id == body.customer_id)
        .first()
    )
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")

    item = SalesPipeline(
        tenant_id=user.tenant_id,
        customer_id=body.customer_id,
        title=body.title,
        stage=body.stage,
        value=body.value,
        expected_close_date=body.expected_close_date,
        notes=body.notes,
        assigned_to=user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _pipeline_dict(item)


@router.patch("/pipeline/{item_id}")
def update_pipeline_item(
    item_id: int,
    body: PipelineUpdate,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    item = (
        scoped(db, SalesPipeline, user.tenant_id)
        .filter(SalesPipeline.id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pipeline item not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return _pipeline_dict(item)
