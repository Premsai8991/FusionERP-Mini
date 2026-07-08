from sqlalchemy.orm import Session
import models
import schemas


def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    db_invoice = models.Invoice(**invoice.model_dump())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def get_invoices(db: Session):
    return db.query(models.Invoice).all()

def create_inventory_item(db: Session, item: schemas.InventoryCreate):
    db_item = models.InventoryItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_inventory_items(db: Session):
    return db.query(models.InventoryItem).all()