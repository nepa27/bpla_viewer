import gzip
import os

from fastapi import APIRouter, HTTPException, status, Response

from backend.app.config import STATIC_DIR


router = APIRouter(
    prefix="/polygons",
    tags=["Полигон координат"]
)


@router.get("/")
async def get_polygons():
    """Получить полигон координат."""
    try:
        polygon_path = os.path.join(STATIC_DIR, 'russia_regions_id.geo.json')

        gz_filename = polygon_path + '.gz'
        with open(polygon_path, 'rb') as f_in:
            with gzip.open(gz_filename, 'wb', compresslevel=9) as f_out:
                f_out.writelines(f_in)

        with open(gz_filename, 'rb') as f:
            gzip_data =  f.read()

            return Response(
                content=gzip_data,
                media_type="application/gzip",
                headers={
                    "Content-Disposition": "attachment; filename=polygons.csv.gz"
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating GZIP file: {str(e)}"
        )
    finally:
        os.remove(gz_filename)
