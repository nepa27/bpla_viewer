get_all_flights_gzip_responses = {
    200: {
        "description": "Successful Response",
        "content": {
            "application/gzip": {"schema": {"type": "string", "format": "binary"}}
        },
        "headers": {
            "Content-Disposition": {
                "description": "The filename for the downloaded file",
                "schema": {"type": "string"},
            },
            "Content-Length": {
                "description": "The length of the response body in bytes",
                "schema": {"type": "integer"},
            },
            "Content-Type": {
                "description": "The media type of the response body",
                "schema": {"type": "string", "enum": ["application/gzip"]},
            },
            "Date": {
                "description": "The date and time at which the response was generated",
                "schema": {"type": "string"},
            },
            "Server": {
                "description": "The server software used to generate the response",
                "schema": {"type": "string"},
            },
        },
    },
    404: {
        "description": "No flights found",
        "content": {"application/json": {"example": {"detail": "No flights found"}}},
    },
    500: {
        "description": "Error generating GZIP file",
        "content": {
            "application/json": {"example": {"detail": "Error generating GZIP file"}}
        },
    },
}

get_flights_by_region_gzip_responses = {
    200: {
        "description": "Successful Response",
        "content": {
            "application/gzip": {"schema": {"type": "string", "format": "binary"}}
        },
        "headers": {
            "Content-Disposition": {
                "description": "The filename for the downloaded file",
                "schema": {"type": "string"},
            },
            "Content-Length": {
                "description": "The length of the response body in bytes",
                "schema": {"type": "integer"},
            },
            "Content-Type": {
                "description": "The media type of the response body",
                "schema": {"type": "string", "enum": ["application/gzip"]},
            },
            "Date": {
                "description": "The date and time at which the response was generated",
                "schema": {"type": "string"},
            },
            "Server": {
                "description": "The server software used to generate the response",
                "schema": {"type": "string"},
            },
        },
    },
    404: {
        "description": "No flights found for region ID",
        "content": {
            "application/json": {
                "example": {"detail": "No flights found for region ID"}
            }
        },
    },
    500: {
        "description": "Error generating GZIP file for region",
        "content": {
            "application/json": {
                "example": {"detail": "Error generating GZIP file for region"}
            }
        },
    },
}
