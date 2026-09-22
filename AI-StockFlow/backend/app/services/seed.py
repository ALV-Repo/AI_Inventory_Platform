"""Seed a demo tenant so a fresh install has something to show.

Enabled with SEED_DEMO_DATA=true. Never enable this in production.
"""
import random
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entities import (
    Customer, Product, SalesOrder, SalesOrderLine, StockItem, StockMovement,
    Supplier, Tenant, User, Warehouse,
)

CATALOGUE = [
    # (sku, name, category, brand, cost, price, gst, reorder)
    ("TOY-HW-001", "Hot Wheels Basic Car", "Toys", "Hot Wheels", 60, 99, 12, 40),
    ("TOY-HW-002", "Hot Wheels Track Set", "Toys", "Hot Wheels", 720, 1199, 12, 10),
    ("TOY-LG-101", "Building Blocks 250 pc", "Toys", "BrickCo", 540, 899, 12, 15),
    ("TOY-RC-210", "RC Stunt Car", "Toys", "SpeedX", 890, 1499, 18, 12),
    ("TOY-PZ-330", "1000 Piece Puzzle", "Toys", "MindHive", 240, 449, 12, 20),
    ("TOY-DL-410", "Fashion Doll Set", "Toys", "Glimmer", 380, 699, 12, 18),
    ("GFT-CD-500", "Gift Card Holder", "Gifting", "Papyrus", 45, 99, 18, 50),
    ("GFT-WR-510", "Premium Wrap Roll", "Gifting", "Papyrus", 65, 129, 18, 40),
    ("ELC-BT-600", "Bluetooth Speaker", "Electronics", "SoundPod", 1180, 1899, 18, 8),
    ("ELC-HP-610", "Wireless Earbuds", "Electronics", "SoundPod", 1450, 2299, 18, 10),
    ("ELC-PB-620", "10000mAh Power Bank", "Electronics", "VoltEdge", 720, 1199, 18, 15),
    ("ELC-CB-630", "USB-C Cable 1m", "Electronics", "VoltEdge", 85, 199, 18, 60),
    ("STA-NB-700", "A5 Hardbound Notebook", "Stationery", "Inkwell", 95, 179, 12, 45),
    ("STA-PN-710", "Gel Pen Pack of 5", "Stationery", "Inkwell", 62, 125, 12, 70),
    ("HOM-CN-800", "Scented Candle Trio", "Home", "Lumen", 310, 599, 18, 20),
    ("HOM-PL-810", "Ceramic Planter", "Home", "Terra", 260, 499, 18, 15),
    ("SPT-BL-900", "Football Size 5", "Sports", "KickPro", 480, 849, 12, 12),
    ("SPT-YG-910", "Yoga Mat 6mm", "Sports", "FlexFit", 540, 999, 12, 10),
    ("SEA-DW-950", "Diwali Lantern Set", "Seasonal", "Utsav", 220, 449, 12, 25),
    ("SEA-XM-960", "Christmas Tree 4ft", "Seasonal", "Utsav", 1250, 2199, 18, 6),
]

# SKUs deliberately left unsold so dead-stock detection has something to find.
DEAD_SKUS = {"SEA-XM-960", "TOY-DL-410", "HOM-PL-810"}


def seed_demo_tenant() -> None:
    db = SessionLocal()
    try:
        # Several uvicorn workers start at once; a Postgres advisory lock makes
        # sure only one of them seeds. (No-op on SQLite, which is single-writer.)
        if db.bind.dialect.name == "postgresql":
            from sqlalchemy import text
            db.execute(text("SELECT pg_advisory_lock(920071)"))

        if db.query(Tenant).filter(Tenant.name == "I-ROBOX").first():
            return

        tenant = Tenant(
            name="I-ROBOX", plan="professional", region="IN", gstin="29ABCDE1234F1Z5",
            feature_flags={"ai_copilot": True, "ai_forecast": True, "ai_dead_stock": True},
        )
        db.add(tenant)
        db.flush()

        users = [
    ("owner@irobox.in", "Lekhana", "owner"),
    ("manager@irobox.in", "Rahul Menon", "store_manager"),
    ("cashier@irobox.in", "Anita Rao", "cashier"),
    ("accounts@irobox.in", "Suresh Kumar", "accountant"),
]
        for email, name, role in users:
            db.add(User(
                tenant_id=tenant.id, email=email, full_name=name, role=role,
                password_hash=hash_password("Demo@12345"),
            ))

        warehouses = [
            Warehouse(tenant_id=tenant.id, code="WH-MAIN", name="Main Store — Bengaluru"),
            Warehouse(tenant_id=tenant.id, code="WH-BACK", name="Backroom Warehouse"),
        ]
        db.add_all(warehouses)
        db.flush()
        main_wh = warehouses[0].id

        suppliers = [
            Supplier(tenant_id=tenant.id, name="Sunrise Distributors", lead_time_days=5,
                     on_time_rate=0.94, payment_terms_days=30, gstin="29AAACS1234A1ZQ"),
            Supplier(tenant_id=tenant.id, name="Metro Wholesale", lead_time_days=9,
                     on_time_rate=0.81, payment_terms_days=45),
            Supplier(tenant_id=tenant.id, name="Coastal Imports", lead_time_days=14,
                     on_time_rate=0.72, payment_terms_days=60),
        ]
        db.add_all(suppliers)

        db.add_all([
            Customer(tenant_id=tenant.id, name="Walk-in Customer"),
            Customer(tenant_id=tenant.id, name="Bright Kids Preschool",
                     phone="9880012345", credit_limit=50000, outstanding=12400),
            Customer(tenant_id=tenant.id, name="Corporate Gifting Co",
                     phone="9845567890", credit_limit=200000, outstanding=68000),
        ])

        products = []
        for sku, name, cat, brand, cost, price, gst, reorder in CATALOGUE:
            p = Product(
                tenant_id=tenant.id, sku=sku, name=name, category=cat, brand=brand,
                cost_price=cost, selling_price=price, gst_rate=gst,
                reorder_level=reorder, safety_stock=max(3, reorder // 3),
                barcode=f"890{random.randint(1000000000, 9999999999)}",
            )
            db.add(p)
            products.append(p)
        db.flush()

        # Opening stock — a few SKUs are set low so the low-stock panel is populated.
        for p in products:
            low = p.sku in ("ELC-BT-600", "TOY-HW-002", "SPT-BL-900", "STA-PN-710")
            qty = random.randint(1, max(2, p.reorder_level // 2)) if low \
                else random.randint(p.reorder_level, p.reorder_level * 6)
            if p.sku in DEAD_SKUS:
                qty = random.randint(40, 90)

            db.add(StockItem(
                tenant_id=tenant.id, product_id=p.id, warehouse_id=main_wh,
                quantity=qty, reserved_qty=0, avg_cost=p.cost_price,
            ))
            db.add(StockMovement(
                tenant_id=tenant.id, product_id=p.id, warehouse_id=main_wh,
                movement_type="receipt", quantity=qty, unit_cost=p.cost_price,
                reason_code="opening_stock",
            ))

        # 120 days of sales history, with weekend lift and a festival spike.
        now = datetime.now(timezone.utc)
        sellable = [p for p in products if p.sku not in DEAD_SKUS]
        order_seq = 0

        for day_offset in range(120, 0, -1):
            day = now - timedelta(days=day_offset)
            weekend_lift = 1.6 if day.weekday() >= 5 else 1.0
            festival_lift = 2.2 if 30 <= day_offset <= 45 else 1.0
            orders_today = max(1, int(random.gauss(7, 2) * weekend_lift * festival_lift))

            for _ in range(orders_today):
                order_seq += 1
                order = SalesOrder(
                    tenant_id=tenant.id,
                    order_number=f"INV-{day.strftime('%Y%m')}-{order_seq:05d}",
                    warehouse_id=main_wh, channel="pos",
                    payment_mode=random.choice(["cash", "upi", "card", "upi"]),
                    order_date=day.replace(
                        hour=random.randint(10, 20), minute=random.randint(0, 59)
                    ),
                )
                db.add(order)
                db.flush()

                subtotal = tax_total = cogs = 0.0
                for p in random.sample(sellable, random.randint(1, 3)):
                    qty = random.randint(1, 4)
                    taxable = p.selling_price * qty
                    tax = round(taxable * p.gst_rate / 100, 2)

                    db.add(SalesOrderLine(
                        tenant_id=tenant.id, order_id=order.id, product_id=p.id,
                        quantity=qty, unit_price=p.selling_price, gst_rate=p.gst_rate,
                        tax_amount=tax, line_total=round(taxable + tax, 2),
                        unit_cost=p.cost_price,
                    ))
                    db.add(StockMovement(
                        tenant_id=tenant.id, product_id=p.id, warehouse_id=main_wh,
                        movement_type="sale", quantity=-qty, unit_cost=p.cost_price,
                        reason_code="sale", reference_type="sales_order", reference_id=order.id,
                    ))
                    subtotal += taxable
                    tax_total += tax
                    cogs += p.cost_price * qty

                order.subtotal = round(subtotal, 2)
                order.tax_amount = round(tax_total, 2)
                order.total = round(subtotal + tax_total, 2)
                order.cogs = round(cogs, 2)

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_tenant()
    print("Demo tenant seeded. Sign in as owner@irobox.in / Demo@12345")
