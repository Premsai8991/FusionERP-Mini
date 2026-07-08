from fastapi import FastAPI, Depends, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
import crud
import pandas as pd
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FusionERP Mini API",
    description="Oracle Fusion Financials migration simulator with ERP invoice APIs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "FusionERP Mini API is running"}


@app.post("/invoices", response_model=schemas.InvoiceResponse)
def add_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return crud.create_invoice(db, invoice)


@app.get("/invoices", response_model=list[schemas.InvoiceResponse])
def list_invoices(db: Session = Depends(get_db)):
    return crud.get_invoices(db)


@app.put("/invoices/{invoice_id}/status")
def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

    if not invoice:
        return {"message": "Invoice not found"}

    invoice.status = status
    db.commit()
    db.refresh(invoice)

    return invoice


@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

    if not invoice:
        return {"message": "Invoice not found"}

    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted successfully"}


@app.post("/migration/upload")
async def upload_migration_file(
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    df = pd.read_csv(file.file)

    required_columns = ["vendor", "invoice_number", "amount", "status"]

    missing_columns = [
        column for column in required_columns if column not in df.columns
    ]

    if missing_columns:
        return {
            "file_name": file.filename,
            "total_records": len(df),
            "imported_records": 0,
            "failed_records": len(df),
            "duplicate_records": 0,
            "missing_columns": missing_columns,
            "status": "Migration failed because required columns are missing",
        }

    imported_records = 0
    failed_records = 0
    duplicate_records = 0
    seen_invoice_numbers = set()

    for _, row in df.iterrows():
        invoice_number = str(row["invoice_number"])

        if invoice_number in seen_invoice_numbers:
            duplicate_records += 1
            failed_records += 1
            continue

        seen_invoice_numbers.add(invoice_number)

        existing_invoice = (
            db.query(models.Invoice)
            .filter(models.Invoice.invoice_number == invoice_number)
            .first()
        )

        if existing_invoice:
            duplicate_records += 1
            failed_records += 1
            continue

        new_invoice = models.Invoice(
            vendor=row["vendor"],
            invoice_number=invoice_number,
            amount=float(row["amount"]),
            status=row["status"],
        )

        db.add(new_invoice)
        imported_records += 1

    db.commit()

    return {
        "file_name": file.filename,
        "total_records": len(df),
        "imported_records": imported_records,
        "failed_records": failed_records,
        "duplicate_records": duplicate_records,
        "missing_columns": [],
        "status": "CSV validated and imported into Accounts Payable",
    }


@app.post("/inventory", response_model=schemas.InventoryResponse)
def add_inventory_item(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    return crud.create_inventory_item(db, item)


@app.get("/inventory", response_model=list[schemas.InventoryResponse])
def list_inventory_items(db: Session = Depends(get_db)):
    return crud.get_inventory_items(db)


@app.put("/inventory/{item_id}/status")
def update_inventory_status(item_id: int, status: str, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()

    if not item:
        return {"message": "Inventory item not found"}

    item.status = status
    db.commit()
    db.refresh(item)

    return item


@app.delete("/inventory/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()

    if not item:
        return {"message": "Inventory item not found"}

    db.delete(item)
    db.commit()

    return {"message": "Inventory item deleted successfully"}