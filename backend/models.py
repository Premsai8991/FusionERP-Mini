from sqlalchemy import Column, Integer, String, Float
from database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    vendor = Column(String, nullable=False)
    invoice_number = Column(String, unique=True)
    amount = Column(Float)
    status = Column(String)

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String, unique=True)
    item_name = Column(String, nullable=False)
    warehouse = Column(String)
    quantity = Column(Integer)
    reorder_level = Column(Integer)
    status = Column(String)