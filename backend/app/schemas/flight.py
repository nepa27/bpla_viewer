from typing import List, Optional

from pydantic import BaseModel


class FlightResponse(BaseModel):
    id: int
    flight_id: str
    drone_type: str
    takeoff_lat: Optional[float] = None
    takeoff_lon: Optional[float] = None
    landing_lat: Optional[float] = None
    landing_lon: Optional[float] = None
    flight_date: Optional[str] = None
    takeoff_time: Optional[str] = None
    landing_time: Optional[str] = None
    flight_duration: Optional[str] = None
    region_id: int

    class Config:
        from_attributes = True


class PaginatedFlightResponse(BaseModel):
    data: List[FlightResponse]
    total: int
    skip: int
    limit: int
    has_more: bool
