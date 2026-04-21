from typing import Any, Optional


def success_response(data: Any = None, message: str = "Success") -> dict:
    return {
        "success": True,
        "message": message,
        "data": data,
        "error": None,
    }


def error_response(
    message: str = "Error",
    *,
    code: Optional[str | int] = None,
    details: Any = None,
) -> dict:
    return {
        "success": False,
        "message": message,
        "data": None,
        "error": {
            "code": code,
            "details": details,
        },
    }
