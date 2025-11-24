from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel
import bcrypt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from db import get_db_connection
from auth import (
    create_access_token, create_refresh_token, verify_jwt_token,
    set_auth_cookies, clear_auth_cookies, log_auth_debug,
    get_current_warden, refresh_user_token, UserRole
)

load_dotenv()

router = APIRouter()

# -------------------- SCHEMAS --------------------
class WardenSignup(BaseModel):
    name: str
    mail: str
    phone: str
    password: str
    hid: int

class WardenLogin(BaseModel):
    mail: str
    password: str

# -------------------- SIGNUP --------------------
@router.post("/auth/warden/signup")
def warden_signup(details: WardenSignup):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM Warden WHERE Mail = %s", (details.mail,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Warden with this email already exists")

    hashed_pw = bcrypt.hashpw(details.password.encode(), bcrypt.gensalt()).decode()

    cur.execute("""
        INSERT INTO Warden (Name, Mail, Phone, Password, HID)
        VALUES (%s, %s, %s, %s, %s)
    """, (details.name, details.mail, details.phone, hashed_pw, details.hid))

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success", "message": "Warden registered successfully"}

# -------------------- LOGIN --------------------
@router.post("/auth/warden/login")
def warden_login(credentials: WardenLogin, request: Request, response: Response):
    log_auth_debug("Warden login attempt started", request)
    
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT WID, Name, Phone, HID, Password FROM Warden 
        WHERE Mail = %s
    """, (credentials.mail,))
    warden = cur.fetchone()
    cur.close()
    conn.close()

    if not warden:
        log_auth_debug("No warden found with this email")
        raise HTTPException(status_code=401, detail="❌ Email not registered")

    wid, name, phone, hid, stored_password = warden
    log_auth_debug(f"Found warden: {name}")

    # Check password (assuming plaintext for now, but should be hashed)
    if credentials.password != stored_password:
        log_auth_debug("Password mismatch")
        raise HTTPException(status_code=401, detail="❌ Incorrect password")

    log_auth_debug("Password match! Creating JWT tokens")

    # Create JWT tokens with warden data
    token_data = {
        "wid": wid,
        "email": credentials.mail,
        "name": name,
        "phone": phone,
        "hid": hid,
        "role": UserRole.WARDEN,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Set HttpOnly, Secure cookies using centralized function
    set_auth_cookies(response, access_token, refresh_token, UserRole.WARDEN)

    return {
        "status": "success",
        "message": "✅ Login successful",
        "warden": {
            "wid": wid,
            "name": name,
            "email": credentials.mail,
            "phone": phone,
            "hid": hid,
            "role": "warden",
        },
        # Include tokens in response for cross-origin requests
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": 15 * 60  # 15 minutes in seconds
        }
    }

@router.post("/auth/warden/logout")
def warden_logout(response: Response):
    """
    JWT logout - clear HttpOnly cookies.
    """
    clear_auth_cookies(response, UserRole.WARDEN)
    return {"status": "success", "message": "Warden logged out"}

@router.post("/auth/warden/nuclear-logout")
def warden_nuclear_logout(response: Response):
    """
    Nuclear logout - aggressively clears all possible cookies for production.
    """
    # Clear regular warden cookies
    clear_auth_cookies(response, UserRole.WARDEN)
    
    # Clear all possible cookie variations
    all_possible_cookies = [
        "warden_access_token", "warden_refresh_token",
        "admin_access_token", "admin_refresh_token", 
        "user_access_token", "user_refresh_token",
        "access_token", "refresh_token",
        "sessionid", "csrftoken", "auth_token"
    ]
    
    for cookie_name in all_possible_cookies:
        # Clear with all possible path/domain combinations
        response.delete_cookie(cookie_name, path="/")
        response.delete_cookie(cookie_name, path="/", domain=None)
        if os.getenv("ENV", "development") == "production":
            response.delete_cookie(cookie_name, path="/", secure=True, samesite="none")
    
    return {"status": "success", "message": "🧨 Nuclear logout completed."}

@router.post("/auth/warden/refresh")
def warden_refresh_token(request: Request, response: Response):
    """Refresh the warden access token using the refresh token."""
    return refresh_user_token(request, response, UserRole.WARDEN)

@router.get("/auth/warden/profile")
def get_warden_auth_profile(request: Request):
    """Get the current warden's profile from JWT token (auth endpoint)."""
    warden_data = get_current_warden(request)
    return {"warden": warden_data}

# -------------------- PROFILE --------------------
@router.get("/warden/profile")
def get_warden_profile(request: Request):
    """Get the current warden's profile from JWT token."""
    warden_data = get_current_warden(request)
    return {"warden": warden_data}

# -------------------- COMPLAINTS LIST --------------------
@router.get("/warden/complaints")
def get_warden_complaints(request: Request):
    # ✅ Get hostel ID for this warden
    warden_data = get_current_warden(request)
    hostel_id = warden_data["hid"]

    conn = get_db_connection()
    cur = conn.cursor()

        # ✅ Fetch complaints of students from this hostel
    cur.execute("""
        SELECT 
            c.CID, c.Type, c.Description, c.Status, c.Created_at,
            s.Name AS StudentName, s.SHID
        FROM Complaint c
        JOIN Student s ON c.SID = s.SID
        WHERE s.HID = %s
        ORDER BY c.Created_at DESC
        LIMIT 20
    """, (hostel_id,))

    complaints_data = cur.fetchall()

    # ✅ Convert tuples to dictionary format and handle datetime
    complaints = []
    for c in complaints_data:
        complaint = {
            "cid": c[0],
            "type": c[1], 
            "description": c[2],
            "status": c[3],
            "createdAt": c[4].isoformat() if c[4] else None,
            "studentName": c[5],
            "shid": c[6]
        }
        complaints.append(complaint)

    cur.close()
    conn.close()

    return {"complaints": complaints}


@router.get("/warden/complaint/{cid}/proof")
def get_complaint_proof(cid: int, request: Request):
    warden_data = get_current_warden(request)
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT ProofImage
        FROM Complaint c
        JOIN Student s ON c.SID = s.SID
        WHERE c.CID = %s AND s.HID = %s
    """, (cid, warden_data["hid"]))

    complaint = cur.fetchone()
    cur.close()
    conn.close()

    if not complaint or not complaint[0]:  # complaint[0] is ProofImage
        raise HTTPException(status_code=404, detail="No proof found")

    return {"proofImage": complaint[0]}


@router.patch("/warden/complaint/{cid}/status")
def update_complaint_status(cid: int, data: dict, request: Request):
    # ✅ Check JWT authentication through dependency
    warden_data = get_current_warden(request)
    new_status = data.get("status")
    if new_status not in ["Pending", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = get_db_connection()
    cur = conn.cursor()

    # ✅ Ensure complaint belongs to same hostel
    cur.execute("""
        SELECT c.CID FROM Complaint c
        JOIN Student s ON c.SID = s.SID
        WHERE c.CID = %s AND s.HID = %s
    """, (cid, warden_data["hid"]))
    complaint = cur.fetchone()

    if not complaint:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found or not authorized")

    # ✅ Update status
    cur.execute("UPDATE Complaint SET Status = %s WHERE CID = %s", (new_status, cid))
    conn.commit()

    cur.close()
    conn.close()

    return {"message": "Status updated successfully", "cid": cid, "new_status": new_status}


@router.get("/warden/complaint-stats")
def get_complaint_stats(request: Request):
    warden_data = get_current_warden(request)
    hid = warden_data["hid"]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            COUNT(*) FILTER (WHERE Status = 'Pending') AS pending,
            COUNT(*) FILTER (WHERE Status = 'Resolved') AS resolved,
            COUNT(*) FILTER (WHERE Status = 'Rejected') AS rejected,
            COUNT(*) AS total
        FROM Complaint
        WHERE SID IN (
            SELECT SID FROM Student WHERE HID = %s
        )
    """, (hid,))
    result = cur.fetchone()
    cur.close()
    conn.close()

    return {
        "pending": result[0],
        "resolved": result[1],
        "rejected": result[2],
        "total": result[3]
    }
