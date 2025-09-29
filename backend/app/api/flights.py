from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.responses import get_all_flights_gzip_responses, get_flights_by_region_gzip_responses
from backend.app.database import get_db
from backend.app.schemas.flight import PaginatedFlightResponse
from backend.app.services.flight_service import FlightService


router = APIRouter(
    prefix="/flights",
    tags=["Полеты БПЛА"]
)


@router.get("/regions/", response_model=PaginatedFlightResponse)
async def get_all_flights(
        skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
        limit: int = Query(100, ge=1, le=1000, description="Количество записей на странице"),
        db: AsyncSession = Depends(get_db)
):
    """Получить все полеты из всех регионов с пагинацией"""
    try:
        flights, total_count = await FlightService.get_all_flights(db, skip, limit)

        return {
            "data": flights,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving flights: {str(e)}"
        )


@router.get("/regions/{region_id}", response_model=PaginatedFlightResponse)
async def get_flights_by_region(
        region_id: int,
        skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
        limit: int = Query(100, ge=1, le=1000, description="Количество записей на странице"),
        db: AsyncSession = Depends(get_db)
):
    """Получить все полеты в конкретном регионе с пагинацией"""
    try:
        flights, total_count = await FlightService.get_flights_by_region(db, region_id, skip, limit)

        if not flights:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No flights found for region ID {region_id}"
            )

        return {
            "data": flights,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving flights for region {region_id}: {str(e)}"
        )


@router.get("/regions_gzip/", responses=get_all_flights_gzip_responses)
async def get_all_flights_gzip(db: AsyncSession = Depends(get_db)):
    """Получить все полеты в виде GZIP с CSV"""
    try:
        flights_data = await FlightService.get_data(db)

        if not flights_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No flights found"
            )

        gzip_data = FlightService.create_csv_gzip(flights_data)

        return Response(
            content=gzip_data,
            media_type="application/gzip",
            headers={
                "Content-Disposition": "attachment; filename=all_flights.csv.gz"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file: {str(e)}"
        )


@router.get("/regions_gzip/{region_id}", responses=get_flights_by_region_gzip_responses)
async def get_flights_by_region_gzip(region_id: int, db: AsyncSession = Depends(get_db)):
    """Получить полеты региона в виде GZIP с CSV"""
    try:
        flights_data = await FlightService.get_data(db, region_id)

        if not flights_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No flights found for region ID {region_id}"
            )

        gzip_data = FlightService.create_csv_gzip(flights_data)

        return Response(
            content=gzip_data,
            media_type="application/gzip",
            headers={
                "Content-Disposition": f"attachment; filename=region_{region_id}_flights.csv.gz"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file for region {region_id}: {str(e)}"
        )
