"""HRM endpoints (FR-HRM-01 to FR-HRM-04)."""

from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, Attendance, Employee, LeaveRequest, Payslip, User, utcnow,
)

router = APIRouter(prefix="/hrm", tags=["HRM"])


# ── FR-HRM-01: Employee Master ────────────────────────────────────────────────

class EmployeeIn(BaseModel):
    employee_code: str = Field(min_length=1, max_length=32)
    full_name: str = Field(min_length=1, max_length=180)
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    joining_date: date
    basic_salary: float = Field(default=0.0, ge=0)


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    basic_salary: float | None = None
    status: str | None = None


def _employee_dict(e: Employee) -> dict:
    return {
        "id": e.id,
        "employee_code": e.employee_code,
        "full_name": e.full_name,
        "email": e.email,
        "phone": e.phone,
        "department": e.department,
        "designation": e.designation,
        "joining_date": e.joining_date,
        "basic_salary": e.basic_salary,
        "status": e.status,
        "created_at": e.created_at,
    }


@router.get("/employees")
def list_employees(
    department: str | None = None,
    status: str | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, Employee, user.tenant_id)
    if department:
        query = query.filter(Employee.department == department)
    if status:
        query = query.filter(Employee.status == status)
    else:
        query = query.filter(Employee.status == "active")
    employees = query.order_by(Employee.full_name).all()
    return [_employee_dict(e) for e in employees]


@router.get("/employees/{employee_id}")
def get_employee(
    employee_id: int,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")
    return _employee_dict(emp)


@router.post("/employees", status_code=status.HTTP_201_CREATED)
def create_employee(
    body: EmployeeIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    # Check unique code
    existing = (
        scoped(db, Employee, user.tenant_id)
        .filter(Employee.employee_code == body.employee_code)
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Employee code {body.employee_code} already exists.")

    emp = Employee(
        tenant_id=user.tenant_id,
        employee_code=body.employee_code,
        full_name=body.full_name,
        email=body.email,
        phone=body.phone,
        department=body.department,
        designation=body.designation,
        joining_date=body.joining_date,
        basic_salary=body.basic_salary,
        status="active",
    )
    db.add(emp)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="hrm.employee.created", entity_type="employee",
        details={"name": body.full_name, "code": body.employee_code},
    ))
    db.commit()
    db.refresh(emp)
    return _employee_dict(emp)


@router.patch("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    body: EmployeeUpdate,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return _employee_dict(emp)


# ── FR-HRM-02: Attendance ─────────────────────────────────────────────────────

class AttendanceIn(BaseModel):
    employee_id: int
    date: date
    status: str = Field(default="present")
    check_in: str | None = None
    check_out: str | None = None
    source: str = Field(default="manual")


@router.get("/attendance")
def list_attendance(
    employee_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, Attendance, user.tenant_id)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    records = query.order_by(Attendance.date.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "date": r.date,
            "check_in": r.check_in,
            "check_out": r.check_out,
            "status": r.status,
            "source": r.source,
        }
        for r in records
    ]


@router.post("/attendance", status_code=status.HTTP_201_CREATED)
def mark_attendance(
    body: AttendanceIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    # Verify employee
    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == body.employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")

    # Upsert — avoid duplicates
    existing = (
        scoped(db, Attendance, user.tenant_id)
        .filter(Attendance.employee_id == body.employee_id, Attendance.date == body.date)
        .first()
    )
    if existing:
        existing.status = body.status
        existing.source = body.source
        if body.check_in:
            existing.check_in = body.check_in
        if body.check_out:
            existing.check_out = body.check_out
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "status": existing.status, "updated": True}

    record = Attendance(
        tenant_id=user.tenant_id,
        employee_id=body.employee_id,
        date=body.date,
        status=body.status,
        check_in=body.check_in,
        check_out=body.check_out,
        source=body.source,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "status": record.status, "updated": False}


@router.post("/attendance/biometric-webhook")
def biometric_webhook(
    payload: dict,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """FR-HRM-02 — receive attendance from biometric device webhook."""
    employee_id = payload.get("employee_id")
    event_time = payload.get("event_time")  # ISO datetime string
    event_type = payload.get("event_type", "check_in")  # check_in|check_out

    if not employee_id or not event_time:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "employee_id and event_time required.")

    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")

    try:
        dt = datetime.fromisoformat(event_time)
        attendance_date = dt.date()
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid event_time format. Use ISO 8601.")

    record = (
        scoped(db, Attendance, user.tenant_id)
        .filter(Attendance.employee_id == employee_id, Attendance.date == attendance_date)
        .first()
    )
    if not record:
        record = Attendance(
            tenant_id=user.tenant_id,
            employee_id=employee_id,
            date=attendance_date,
            status="present",
            source="biometric",
        )
        db.add(record)

    if event_type == "check_in":
        record.check_in = dt
    else:
        record.check_out = dt
    record.source = "biometric"

    db.commit()
    return {"received": True, "employee_id": employee_id, "date": attendance_date}


# ── FR-HRM-03: Leave Management ──────────────────────────────────────────────

class LeaveIn(BaseModel):
    employee_id: int
    leave_type: str = Field(default="casual")
    from_date: date
    to_date: date
    reason: str | None = None


@router.get("/leave")
def list_leave_requests(
    employee_id: int | None = None,
    status: str | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, LeaveRequest, user.tenant_id)
    if employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)
    if status:
        query = query.filter(LeaveRequest.status == status)
    requests = query.order_by(LeaveRequest.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "leave_type": r.leave_type,
            "from_date": r.from_date,
            "to_date": r.to_date,
            "days": r.days,
            "reason": r.reason,
            "status": r.status,
            "approved_by": r.approved_by,
            "approved_at": r.approved_at,
            "created_at": r.created_at,
        }
        for r in requests
    ]


@router.post("/leave", status_code=status.HTTP_201_CREATED)
def apply_leave(
    body: LeaveIn,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == body.employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")

    if body.to_date < body.from_date:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "to_date must be on or after from_date.")

    days = (body.to_date - body.from_date).days + 1

    leave = LeaveRequest(
        tenant_id=user.tenant_id,
        employee_id=body.employee_id,
        leave_type=body.leave_type,
        from_date=body.from_date,
        to_date=body.to_date,
        days=days,
        reason=body.reason,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return {"id": leave.id, "days": days, "status": leave.status}


@router.post("/leave/{leave_id}/approve")
def approve_leave(
    leave_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    leave = scoped(db, LeaveRequest, user.tenant_id).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Leave request not found.")
    if leave.status != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Leave is already {leave.status}.")
    leave.status = "approved"
    leave.approved_by = user.id
    leave.approved_at = utcnow()
    db.commit()
    return {"id": leave.id, "status": "approved"}


@router.post("/leave/{leave_id}/reject")
def reject_leave(
    leave_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    leave = scoped(db, LeaveRequest, user.tenant_id).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Leave request not found.")
    if leave.status != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Leave is already {leave.status}.")
    leave.status = "rejected"
    leave.approved_by = user.id
    leave.approved_at = utcnow()
    db.commit()
    return {"id": leave.id, "status": "rejected"}


# ── FR-HRM-04: Payroll / Payslips ────────────────────────────────────────────

@router.post("/payslips/generate")
def generate_payslip(
    employee_id: int,
    month: int = Field(ge=1, le=12),
    year: int = Field(ge=2020),
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """
    Generate payslip for an employee for a given month/year.
    Computes pay from attendance + basic salary. FR-HRM-04
    """
    emp = scoped(db, Employee, user.tenant_id).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found.")

    # Check if payslip already exists
    existing = (
        scoped(db, Payslip, user.tenant_id)
        .filter(Payslip.employee_id == employee_id, Payslip.month == month, Payslip.year == year)
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Payslip already generated for this period.")

    # Count working days in month (Mon-Fri = 5/7 of days in month)
    import calendar
    total_days = calendar.monthrange(year, month)[1]
    working_days = sum(
        1 for d in range(1, total_days + 1)
        if date(year, month, d).weekday() < 5
    )

    # Count present days from attendance
    from_date = date(year, month, 1)
    to_date = date(year, month, total_days)
    present_days = (
        scoped(db, Attendance, user.tenant_id)
        .filter(
            Attendance.employee_id == employee_id,
            Attendance.date >= from_date,
            Attendance.date <= to_date,
            Attendance.status.in_(["present", "half_day"]),
        )
        .count()
    )

    # Pro-rated pay
    basic = round((emp.basic_salary or 0) * present_days / working_days, 2) if working_days else 0
    allowances = round(basic * 0.20, 2)   # 20% HRA + TA allowance
    deductions = round(basic * 0.12, 2)   # 12% PF deduction
    net_pay = round(basic + allowances - deductions, 2)

    payslip = Payslip(
        tenant_id=user.tenant_id,
        employee_id=employee_id,
        month=month,
        year=year,
        working_days=working_days,
        present_days=present_days,
        basic=basic,
        allowances=allowances,
        deductions=deductions,
        net_pay=net_pay,
        status="draft",
    )
    db.add(payslip)
    db.commit()
    db.refresh(payslip)

    return {
        "id": payslip.id,
        "employee_id": employee_id,
        "employee_name": emp.full_name,
        "month": month,
        "year": year,
        "working_days": working_days,
        "present_days": present_days,
        "basic": basic,
        "allowances": allowances,
        "deductions": deductions,
        "net_pay": net_pay,
        "status": payslip.status,
    }


@router.get("/payslips")
def list_payslips(
    employee_id: int | None = None,
    year: int | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, Payslip, user.tenant_id)
    if employee_id:
        query = query.filter(Payslip.employee_id == employee_id)
    if year:
        query = query.filter(Payslip.year == year)
    payslips = query.order_by(Payslip.year.desc(), Payslip.month.desc()).all()
    return [
        {
            "id": p.id,
            "employee_id": p.employee_id,
            "month": p.month,
            "year": p.year,
            "net_pay": p.net_pay,
            "status": p.status,
        }
        for p in payslips
    ]
