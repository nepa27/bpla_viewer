from typing import List, Optional

from pydantic import BaseModel

from .flight import FlightResponse


class RegionResponse(BaseModel):
    id: int
    name: Optional[str] = None

    class Config:
        from_attributes = True


class RegionWithFlightsResponse(BaseModel):
    id: int
    name: str
    total_flights: int
    flights: List[FlightResponse]

    class Config:
        from_attributes = True
