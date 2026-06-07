import os
from fastapi import Request, HTTPException
from shared.db.supabase_client import get_supabase

def get_current_user(request: Request):
    """
    FastAPI dependency to verify Supabase JWT token and return the user object.
    Requires 'Authorization: Bearer <token>' in headers.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    
    token = auth_header.split(" ")[1]
    db = get_supabase()
    
    try:
        user_resp = db.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_resp.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def verify_user_access(user_id: str, request: Request):
    """
    Verifies that the authenticated user matches the requested user_id.
    """
    user = get_current_user(request)
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied. You can only access your own data.")
    return user
