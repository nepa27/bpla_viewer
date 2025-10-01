import os

from fastapi import APIRouter, HTTPException, status, Response

from backend.app.config import STATIC_DIR
from backend.app.constants import RUSSIA_ID_POLYGON

router = APIRouter(prefix="/polygons", tags=["Полигон координат"])


@router.get("")
async def get_polygons():
    """Получить полигон координат."""
    try:
        polygon_path = os.path.join(STATIC_DIR, RUSSIA_ID_POLYGON)

        with open(polygon_path, "rb") as f:
            data = f.read()

            return Response(
                content=data,
                media_type="application/gzip",
                headers={
                    "Content-Disposition": "attachment; filename=polygons.geo.json.gz"
                },
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file: {str(e)}",
        )
