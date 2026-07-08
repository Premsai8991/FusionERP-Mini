from pydantic import BaseModel


class InvoiceBase(BaseModel):
    vendor: str
    invoice_number: str
    amount: float
    status: str


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceResponse(InvoiceBase):
    id: int

    class Config:
        from_attributes = True

class InventoryBase(BaseModel):
    item_code: str
    item_name: str
    warehouse: str
    quantity: int
    reorder_level: int
    status: str


class InventoryCreate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):
    id: int

    class Config:
        from_attributes = True