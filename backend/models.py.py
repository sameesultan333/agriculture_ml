from datetime import date
from typing import Optional


class Trade:
    def __init__(
        self,
        id: int,
        vegetable: str,
        mumbai_price: float,
        quantity: int,
        arrival_date: date,
        status: str = "IN_TRANSIT",
    ):
        self.id = id
        self.vegetable = vegetable
        self.mumbai_price = mumbai_price
        self.quantity = quantity
        self.arrival_date = arrival_date

        self.status = status   # ✅ correct

        self.actual_price: Optional[float] = None
        self.profit: Optional[float] = None
class TradeStatus:
    IN_TRANSIT = "IN_TRANSIT"
    ARRIVED = "ARRIVED"
