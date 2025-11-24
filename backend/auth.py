# backend/auth.py - Centralized JWT Authentication System
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import jwt
import os
from fastapi import HTTPException, Request, Response, Depends
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 15))
JWT_REFRESH_TOKEN_EXPIRE_HOURS = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_HOURS', 24))

# Cookie settings
ENV = os.getenv("ENV")
COOKIE_SECURE = ENV == "production"

if ENV == "production":
    COOKIE_DOMAIN = os.getenv('COOKIE_DOMAIN')
    COOKIE_SAMESITE = "lax"  # Same-site policy since all services on same domain
else:
    COOKIE_DOMAIN = None  # Localhost development
    COOKIE_SAMESITE = "lax"

# User roles
class UserRole:
    ADMIN = "admin"
    WARDEN = "warden"
    USER = "user"

# ───────────────────────── JWT UTILITIES ──────────────────────────

def create_access_token(data: Dict[str, Any]) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow()
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_REFRESH_TOKEN_EXPIRE_HOURS)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow()
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, access_token: str, refresh_token: str, role: str):
    """Set HttpOnly authentication cookies with production subdomain support."""
    log_auth_debug(f"Setting cookies for role: {role}, domain: {COOKIE_DOMAIN}, secure: {COOKIE_SECURE}, samesite: {COOKIE_SAMESITE}")
    
    # Set access token cookie
    response.set_cookie(
        key=f"{role}_access_token",
        value=access_token,
        max_age=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path="/"
    )
    
    # Set refresh token cookie
    response.set_cookie(
        key=f"{role}_refresh_token",
        value=refresh_token,
        max_age=JWT_REFRESH_TOKEN_EXPIRE_HOURS * 3600,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path="/"
    )

def clear_auth_cookies(response: Response, role: str):
    """Clear authentication cookies with proper production domain settings."""
    log_auth_debug(f"Clearing cookies for role: {role}, domain: {COOKIE_DOMAIN}")
    
    # Clear access token with same settings as when it was set
    response.delete_cookie(
        key=f"{role}_access_token",
        path="/",
        domain=COOKIE_DOMAIN,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE
    )
    
    # Clear refresh token with same settings as when it was set  
    response.delete_cookie(
        key=f"{role}_refresh_token",
        path="/",
        domain=COOKIE_DOMAIN,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE
    )
    
    # Additional clearing for production - comprehensive cleanup
    if ENV == "production":
        # Clear with different domain combinations for maximum compatibility
        for domain in [COOKIE_DOMAIN, None, "govthostelcare.me"]:
            response.delete_cookie(f"{role}_access_token", path="/", domain=domain)
            response.delete_cookie(f"{role}_refresh_token", path="/", domain=domain)
        
        # Clear legacy cookie names if they exist
        legacy_cookies = ["access_token", "refresh_token", "sessionid", "csrftoken", "auth_token"]
        for cookie in legacy_cookies:
            for domain in [COOKIE_DOMAIN, None, "govthostelcare.me"]:
                response.delete_cookie(cookie, path="/", domain=domain)
        
        log_auth_debug(f"Production comprehensive cookie clearing completed for role: {role}")

def log_auth_debug(message: str, request: Request = None):
    """Debug logging for authentication."""
    if ENV == "production":
        print(f"🔐 AUTH DEBUG: {message}")
        if request:
            print(f"   Origin: {request.headers.get('origin', 'None')}")
            print(f"   User-Agent: {request.headers.get('user-agent', 'None')[:50]}...")

# ───────────────────────── AUTHENTICATION DEPENDENCIES ──────────────────────────

def get_current_user(request: Request, required_role: str = None) -> Dict[str, Any]:
    """
    Generic dependency to get the current authenticated user from JWT cookie or Authorization header.
    Args:
        request: FastAPI Request object
        required_role: Optional role requirement ("admin", "warden", "user")
    Returns:
        Dict containing user information from JWT payload
    """
    log_auth_debug(f"Checking authentication for role: {required_role}", request)
    
    # Try to get token from cookie first
    access_token = None
    if required_role:
        access_token = request.cookies.get(f"{required_role}_access_token")
    
    # If no cookie, try Authorization header (for cross-origin requests)
    if not access_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header[7:]  # Remove "Bearer " prefix
            log_auth_debug(f"Using Authorization header token: {access_token[:50]}...")
    
    if not access_token:
        log_auth_debug("No access token found in cookies or Authorization header")
        raise HTTPException(status_code=401, detail="Access token missing")
    
    log_auth_debug(f"Access token found: {access_token[:50]}...")
    
    payload = verify_jwt_token(access_token)
    
    # Check if it's an access token
    if payload.get("type") != "access":
        log_auth_debug(f"Invalid token type: {payload.get('type')}")
        raise HTTPException(status_code=403, detail="Invalid token type")
    
    # Check role if required
    if required_role and payload.get("role") != required_role:
        log_auth_debug(f"Invalid role: expected {required_role}, got {payload.get('role')}")
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    log_auth_debug(f"User authenticated: {payload.get('email', payload.get('user_id'))}")
    return payload

# Role-specific dependencies
def get_current_admin(request: Request) -> Dict[str, Any]:
    """Dependency to get the current authenticated admin."""
    return get_current_user(request, UserRole.ADMIN)

def get_current_warden(request: Request) -> Dict[str, Any]:
    """Dependency to get the current authenticated warden."""
    return get_current_user(request, UserRole.WARDEN)

def get_current_student(request: Request) -> Dict[str, Any]:
    """Dependency to get the current authenticated student/user."""
    return get_current_user(request, UserRole.USER)

# ───────────────────────── REFRESH TOKEN HANDLER ──────────────────────────

def refresh_user_token(request: Request, response: Response, role: str) -> Dict[str, Any]:
    """
    Refresh access token using refresh token.
    Args:
        request: FastAPI Request object
        response: FastAPI Response object
        role: User role ("admin", "warden", "user")
    Returns:
        Dict containing new token information
    """
    # Try to get refresh token from cookie first
    refresh_token = request.cookies.get(f"{role}_refresh_token")
    
    # If no cookie, try Authorization header
    if not refresh_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header[7:]
    
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = verify_jwt_token(refresh_token)
        
        # Check if it's a refresh token and correct role
        if payload.get("type") != "refresh" or payload.get("role") != role:
            raise HTTPException(status_code=403, detail="Invalid refresh token")
        
        # Create new access token
        token_data = {
            "role": payload["role"]
        }
        
        # Add role-specific data
        if role == UserRole.ADMIN:
            token_data.update({
                "email": payload["email"],
                "name": payload["name"]
            })
        elif role == UserRole.WARDEN:
            token_data.update({
                "wid": payload["wid"],
                "email": payload["email"],
                "name": payload["name"],
                "hid": payload["hid"]
            })
        elif role == UserRole.USER:
            token_data.update({
                "shid": payload["shid"],
                "sid": payload["sid"],
                "name": payload["name"]
            })
        
        new_access_token = create_access_token(token_data)
        
        # Set new access token cookie with production domain
        response.set_cookie(
            key=f"{role}_access_token",
            value=new_access_token,
            max_age=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
            domain=COOKIE_DOMAIN,
            path="/"
        )
        
        return {
            "status": "success",
            "message": "Token refreshed",
            "user": token_data,
            "tokens": {
                "access_token": new_access_token,
                "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
        }
        
    except HTTPException:
        # Clear invalid refresh token
        response.delete_cookie(f"{role}_refresh_token")
        raise
    except Exception as e:
        log_auth_debug(f"Refresh token error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid refresh token")
