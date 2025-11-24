# backend/admin.py
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Cookie
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from db import get_db_connection
from auth import (
    create_access_token, create_refresh_token, verify_jwt_token,
    set_auth_cookies, clear_auth_cookies, log_auth_debug,
    get_current_admin, refresh_user_token, UserRole
)
import os

load_dotenv()

router = APIRouter(tags=["Admin"])

# ─────────────────────── PYDANTIC MODELS ───────────────────────

class AdminLogin(BaseModel):
    email: str
    password: str

class StudentResponse(BaseModel):
    sid: int
    name: str
    email: str
    phone: str
    year: str
    course: str
    hid: Optional[int] = None
    room_number: Optional[str] = None
    
class WardenResponse(BaseModel):
    wid: int
    name: str
    mail: str
    phone: str
    password: str  # hashed
    hid: Optional[int] = None

class WardenUpdate(BaseModel):
    name: Optional[str] = None
    mail: Optional[str] = None
    phone: Optional[str] = None
    hid: Optional[int] = None

# ─────────────────────── AUTH ROUTES ───────────────────────

@router.post("/auth/admin/login")
def admin_login(
    credentials: AdminLogin,
    response: Response,
    request: Request,
    conn=Depends(get_db_connection)
):
    """
    Verify the supplied e‑mail / password against the Admin table.
    On success set JWT tokens in HttpOnly cookies; otherwise 401.
    """
    log_auth_debug("Admin login attempt started", request)
    
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT name, email
            FROM   Admin
            WHERE  email    = %s
              AND  password = %s
            """,
            (credentials.email, credentials.password),
        )
        admin = cur.fetchone()

    if admin:
        admin_name, admin_email = admin  # Unpack tuple (name, email)
        log_auth_debug(f"Login successful for {admin_email}")
        
        # Create JWT tokens with admin data
        token_data = {
            "email": admin_email,
            "name": admin_name,
            "role": UserRole.ADMIN,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Set HttpOnly, Secure cookies
        set_auth_cookies(response, access_token, refresh_token, UserRole.ADMIN)
        
        return {
            "status": "success",
            "message": "Admin logged in",
            "admin": {
                "email": admin_email,
                "name": admin_name,
                "role": "admin",
            },
            # Include tokens in response for cross-origin requests
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": 15 * 60  # 15 minutes in seconds
            }
        }

    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@router.post("/auth/admin/logout")
def admin_logout(response: Response):
    """
    JWT logout - clear HttpOnly cookies.
    """
    clear_auth_cookies(response, UserRole.ADMIN)
    return {"status": "success", "message": "Admin logged out"}

@router.post("/auth/admin/nuclear-logout")
def admin_nuclear_logout(response: Response):
    """
    Nuclear logout - aggressively clears all possible cookies for production.
    """
    # Clear regular admin cookies
    clear_auth_cookies(response, UserRole.ADMIN)
    
    # Clear all possible cookie variations
    all_possible_cookies = [
        "admin_access_token", "admin_refresh_token",
        "user_access_token", "user_refresh_token", 
        "warden_access_token", "warden_refresh_token",
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

@router.post("/auth/admin/refresh")
def admin_refresh_token(request: Request, response: Response):
    """
    Refresh admin access token using refresh token.
    """
    result = refresh_user_token(request, response, UserRole.ADMIN)
    
    # Format response to match frontend expectations
    if result.get("status") == "success":
        return {
            "status": "success",
            "message": result["message"],
            "admin": result["user"],  # Frontend expects "admin" key
            "access_token": result["tokens"]["access_token"],
            "expires_in": result["tokens"]["expires_in"]
        }
    
    return result

@router.get("/auth/admin/debug")
def admin_debug(request: Request):
    """
    Debug endpoint to check admin auth status and cookie settings.
    """
    log_auth_debug("Debug endpoint called", request)
    
    return {
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
        "environment": os.getenv("ENV", "development"),
        "auth_settings": {
            "secure": os.getenv("ENV") == "production",
            "samesite": "none" if os.getenv("ENV") == "production" else "lax"
        }
    }

@router.get("/admin/profile")
def get_admin_profile(request: Request):
    """Get the current admin's profile from JWT token."""
    admin_data = get_current_admin(request)
    return {"admin": admin_data}

@router.get("/admin/analytics")
def get_admin_analytics(request: Request):
    """Get analytics data for admin dashboard."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Get hostels data
            cur.execute("SELECT hid, name, location, numberofrooms FROM Hostel ORDER BY name")
            hostels_data = cur.fetchall()
            hostels = [
                {
                    "hid": h[0],
                    "name": h[1], 
                    "location": h[2],
                    "numberOfRooms": h[3]
                }
                for h in hostels_data
            ]
            
            # Get rooms data
            cur.execute("SELECT rid, roomnumber, capacity, hid FROM Room ORDER BY roomnumber")
            rooms_data = cur.fetchall()
            rooms = [
                {
                    "rid": r[0],
                    "roomNumber": r[1],
                    "capacity": r[2], 
                    "hid": r[3]
                }
                for r in rooms_data
            ]
            
            # Get wardens data
            cur.execute("SELECT wid, name, mail, phone, hid FROM Warden ORDER BY name")
            wardens_data = cur.fetchall()
            wardens = [
                {
                    "wid": w[0],
                    "name": w[1],
                    "email": w[2],
                    "phone": w[3],
                    "hid": w[4]
                }
                for w in wardens_data
            ]
            
            # Get students data
            cur.execute("SELECT sid, name, mail, phone, hid, shid FROM Student ORDER BY name")
            students_data = cur.fetchall()
            students = [
                {
                    "sid": s[0],
                    "name": s[1],
                    "email": s[2],
                    "phone": s[3],
                    "hid": s[4],
                    "shid": s[5]
                }
                for s in students_data
            ]
            
            # Get complaints data
            cur.execute("""
                SELECT c.cid, c.type, c.status, c.description, c.created_at,
                       s.name as student_name, s.shid
                FROM Complaint c
                JOIN Student s ON c.sid = s.sid
                ORDER BY c.created_at DESC
            """)
            complaints_data = cur.fetchall()
            complaints = [
                {
                    "cid": c[0],
                    "type": c[1],
                    "status": c[2],
                    "description": c[3],
                    "created_at": c[4].isoformat() if c[4] else None,
                    "student_name": c[5],
                    "shid": c[6]
                }
                for c in complaints_data
            ]
            
            # Get summary statistics
            cur.execute("SELECT COUNT(*) FROM Hostel")
            total_hostels = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Room")
            total_rooms = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Warden")
            total_wardens = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Student")
            total_students = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Complaint")
            total_complaints = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Complaint WHERE status = 'Pending'")
            pending_complaints = cur.fetchone()[0]
            
            conn.close()
            
            return {
                "meta": {
                    "total_hostels": total_hostels,
                    "total_rooms": total_rooms,
                    "total_wardens": total_wardens,
                    "total_students": total_students,
                    "total_complaints": total_complaints,
                    "pending_complaints": pending_complaints
                },
                "hostels": hostels,
                "rooms": rooms,
                "wardens": wardens,
                "students": students,
                "complaints": complaints
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Analytics fetch error: {str(e)}")

@router.get("/admin/complaints")
def get_admin_complaints(request: Request):
    """Get all complaints for admin."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT c.cid, c.type, c.status, c.description, c.created_at,
                       s.name as student_name, s.shid, s.hid,
                       h.name as hostel_name
                FROM Complaint c
                JOIN Student s ON c.sid = s.sid
                JOIN Hostel h ON s.hid = h.hid
                ORDER BY c.created_at DESC
            """)
            complaints_data = cur.fetchall()
            
            complaints = [
                {
                    "cid": c[0],
                    "type": c[1],
                    "status": c[2],
                    "description": c[3],
                    "created_at": c[4].isoformat() if c[4] else None,
                    "student_name": c[5],
                    "shid": c[6],
                    "hid": c[7],
                    "hostel_name": c[8]
                }
                for c in complaints_data
            ]
            
            conn.close()
            return {"complaints": complaints}
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error fetching complaints: {str(e)}")

@router.get("/admin/complaints/summary")
def get_admin_complaints_summary(request: Request):
    """Get complaints summary statistics for admin."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Get total counts
            cur.execute("SELECT COUNT(*) FROM Complaint")
            total = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Complaint WHERE status = 'Pending'")
            pending = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Complaint WHERE status = 'Resolved'")
            resolved = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM Complaint WHERE status = 'Withdrawn'")
            withdrawn = cur.fetchone()[0]
            
            # Get complaints by type
            cur.execute("""
                SELECT type, COUNT(*) as count
                FROM Complaint
                GROUP BY type
                ORDER BY count DESC
            """)
            by_type = [{"type": row[0], "count": row[1]} for row in cur.fetchall()]
            
            # Get recent complaints (last 30 days)
            cur.execute("""
                SELECT COUNT(*) FROM Complaint 
                WHERE created_at >= NOW() - INTERVAL '30 days'
            """)
            recent = cur.fetchone()[0]
            
            conn.close()
            return {
                "summary": {
                    "total": total,
                    "pending": pending,
                    "resolved": resolved,
                    "withdrawn": withdrawn,
                    "recent_30_days": recent
                },
                "by_type": by_type
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error fetching complaints summary: {str(e)}")

@router.get("/admin/complaints/overdue")
def get_admin_overdue_complaints(request: Request):
    """Get overdue complaints (pending for more than 7 days)."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT c.cid, c.type, c.status, c.description, c.created_at,
                       s.name as student_name, s.shid,
                       h.name as hostel_name,
                       EXTRACT(DAY FROM NOW() - c.created_at) as days_pending
                FROM Complaint c
                JOIN Student s ON c.sid = s.sid
                JOIN Hostel h ON s.hid = h.hid
                WHERE c.status = 'Pending' 
                AND c.created_at < NOW() - INTERVAL '7 days'
                ORDER BY c.created_at ASC
            """)
            overdue_data = cur.fetchall()
            
            overdue = [
                {
                    "cid": c[0],
                    "type": c[1],
                    "status": c[2],
                    "description": c[3],
                    "created_at": c[4].isoformat() if c[4] else None,
                    "student_name": c[5],
                    "shid": c[6],
                    "hostel_name": c[7],
                    "days_pending": int(c[8]) if c[8] else 0
                }
                for c in overdue_data
            ]
            
            conn.close()
            return {"overdue_complaints": overdue}
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error fetching overdue complaints: {str(e)}")

@router.put("/admin/admins/me")
def update_current_admin(request: Request, admin_update: dict):
    """Update current admin's profile."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Build dynamic update query
            update_fields = []
            values = []
            
            if "name" in admin_update:
                update_fields.append("name = %s")
                values.append(admin_update["name"])
            
            if "email" in admin_update:
                update_fields.append("email = %s") 
                values.append(admin_update["email"])
                
            if "password" in admin_update:
                update_fields.append("password = %s")
                values.append(admin_update["password"])
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            values.append(current_admin["email"])  # for WHERE clause
            
            query = f"UPDATE Admin SET {', '.join(update_fields)} WHERE email = %s RETURNING *"
            cur.execute(query, values)
            updated_admin = cur.fetchone()
            
            if not updated_admin:
                raise HTTPException(status_code=404, detail="Admin not found")
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "Admin profile updated successfully",
                "admin": {
                    "email": updated_admin[1],
                    "name": updated_admin[2]
                }
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error updating admin: {str(e)}")

@router.post("/admin/admins")
def create_new_admin(request: Request, admin_data: dict):
    """Create a new admin (only existing admins can do this)."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Check if email already exists
            cur.execute("SELECT email FROM Admin WHERE email = %s", (admin_data["email"],))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already exists")
            
            # Create new admin
            cur.execute(
                "INSERT INTO Admin (email, password, name) VALUES (%s, %s, %s) RETURNING *",
                (admin_data["email"], admin_data["password"], admin_data["name"])
            )
            new_admin = cur.fetchone()
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "New admin created successfully",
                "admin": {
                    "aid": new_admin[0],
                    "email": new_admin[1],
                    "name": new_admin[2]
                }
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error creating admin: {str(e)}")

@router.post("/admin/warden")
def create_warden(request: Request, warden_data: dict):
    """Create a new warden."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Warden (name, mail, phone, password, hid) 
                VALUES (%s, %s, %s, %s, %s) 
                RETURNING *
            """, (
                warden_data["name"],
                warden_data["mail"], 
                warden_data["phone"],
                warden_data["password"],
                warden_data["hid"]
            ))
            new_warden = cur.fetchone()
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "Warden created successfully",
                "warden": {
                    "wid": new_warden[0],
                    "name": new_warden[1],
                    "mail": new_warden[2],
                    "phone": new_warden[3],
                    "hid": new_warden[5]
                }
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error creating warden: {str(e)}")

@router.put("/admin/warden/{warden_id}")
def update_warden_by_admin(warden_id: int, warden_update: dict, request: Request):
    """Update warden details by admin."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Build dynamic update query
            update_fields = []
            values = []
            
            for field in ["name", "mail", "phone", "password", "hid"]:
                if field in warden_update:
                    update_fields.append(f"{field} = %s")
                    values.append(warden_update[field])
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            values.append(warden_id)  # for WHERE clause
            
            query = f"UPDATE Warden SET {', '.join(update_fields)} WHERE wid = %s RETURNING *"
            cur.execute(query, values)
            updated_warden = cur.fetchone()
            
            if not updated_warden:
                raise HTTPException(status_code=404, detail="Warden not found")
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "Warden updated successfully",
                "warden": {
                    "wid": updated_warden[0],
                    "name": updated_warden[1],
                    "mail": updated_warden[2],
                    "phone": updated_warden[3],
                    "hid": updated_warden[5]
                }
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error updating warden: {str(e)}")

@router.delete("/admin/warden/{warden_id}")
def delete_warden_by_admin(warden_id: int, request: Request):
    """Delete a warden by admin."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM Warden WHERE wid = %s", (warden_id,))
            
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Warden not found")
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "Warden deleted successfully"
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error deleting warden: {str(e)}")

@router.put("/admin/student/{student_id}")
def update_student_by_admin(student_id: int, student_update: dict, request: Request):
    """Update student details by admin."""
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # Build dynamic update query
            update_fields = []
            values = []
            
            for field in ["name", "mail", "phone", "hid", "shid"]:
                if field in student_update:
                    update_fields.append(f"{field} = %s")
                    values.append(student_update[field])
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            values.append(student_id)  # for WHERE clause
            
            query = f"UPDATE Student SET {', '.join(update_fields)} WHERE sid = %s RETURNING *"
            cur.execute(query, values)
            updated_student = cur.fetchone()
            
            if not updated_student:
                raise HTTPException(status_code=404, detail="Student not found")
            
            conn.commit()
            conn.close()
            
            return {
                "status": "success",
                "message": "Student updated successfully"
            }
            
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error updating student: {str(e)}")

# ─────────────────────── PROTECTED ADMIN ROUTES ───────────────────────

@router.get("/admin/students")
def get_all_students(request: Request):
    """
    Get all students. (Protected admin endpoint)
    """
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                s.sid, s.name, s.mail, s.phone, s.dob, s.shid,
                s.hid
            FROM Student s
            ORDER BY s.name
        """)
        students = cur.fetchall()

    return [
        {
            "sid": student[0],
            "name": student[1], 
            "email": student[2],
            "phone": student[3],
            "dob": student[4],
            "shid": student[5],
            "hid": student[6]
        }
        for student in students
    ]

@router.get("/admin/wardens")
def get_all_wardens(request: Request):
    """
    Get all wardens. (Protected admin endpoint)
    """
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT wid, name, mail, phone, password, hid FROM Warden ORDER BY name")
        wardens = cur.fetchall()

    return [
        {
            "wid": warden[0],
            "name": warden[1],
            "mail": warden[2],
            "phone": warden[3],
            "password": warden[4],
            "hid": warden[5]
        }
        for warden in wardens
    ]

@router.put("/admin/wardens/{warden_id}")
def update_warden(
    warden_id: int,
    warden_update: WardenUpdate,
    request: Request
):
    """
    Update warden details. (Protected admin endpoint)
    """
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    # Build dynamic update query
    update_fields = []
    values = []
    
    if warden_update.name is not None:
        update_fields.append("name = %s")
        values.append(warden_update.name)
    
    if warden_update.mail is not None:
        update_fields.append("mail = %s")
        values.append(warden_update.mail)
    
    if warden_update.phone is not None:
        update_fields.append("phone = %s")
        values.append(warden_update.phone)
    
    if warden_update.hid is not None:
        update_fields.append("hid = %s")
        values.append(warden_update.hid)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(warden_id)  # for WHERE clause
    
    with conn.cursor() as cur:
        query = f"UPDATE Warden SET {', '.join(update_fields)} WHERE wid = %s RETURNING *"
        cur.execute(query, values)
        updated_warden = cur.fetchone()
        
        if not updated_warden:
            raise HTTPException(status_code=404, detail="Warden not found")
        
        conn.commit()
    
    return {
        "status": "success",
        "message": "Warden updated successfully",
        "warden": WardenResponse(
            wid=updated_warden["wid"],
            name=updated_warden["name"],
            mail=updated_warden["mail"],
            phone=updated_warden["phone"],
            password=updated_warden["password"],
            hid=updated_warden["hid"]
        )
    }

@router.delete("/admin/wardens/{warden_id}")
def delete_warden(
    warden_id: int,
    request: Request
):
    """
    Delete a warden. (Protected admin endpoint)
    """
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM Warden WHERE wid = %s", (warden_id,))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Warden not found")
        
        conn.commit()
    
    return {
        "status": "success",
        "message": "Warden deleted successfully"
    }

@router.delete("/admin/students/{student_id}")
def delete_student(
    student_id: int,
    request: Request
):
    """
    Delete a student. (Protected admin endpoint)
    """
    current_admin = get_current_admin(request)
    conn = get_db_connection()
    with conn.cursor() as cur:
        # First delete from StudentRoom if exists
        cur.execute("DELETE FROM StudentRoom WHERE sid = %s", (student_id,))
        
        # Then delete from Student
        cur.execute("DELETE FROM Student WHERE sid = %s", (student_id,))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        
        conn.commit()
    
    return {
        "status": "success",
        "message": "Student deleted successfully"
    }
