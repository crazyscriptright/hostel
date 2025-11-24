
import os
import ssl
import base64
import smtplib
import traceback
from datetime import datetime
from typing import Optional
from email.message import EmailMessage

# Third-party Imports
import psycopg2
from psycopg2.extras import RealDictCursor
from passlib.hash import bcrypt
from dotenv import load_dotenv

# FastAPI Imports
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field

# Local Imports
from db import get_db_connection
from wardan import router as warden_router
from admin import router as admin_router
from auth import (
    create_access_token, create_refresh_token, verify_jwt_token,
    set_auth_cookies, clear_auth_cookies, log_auth_debug, UserRole,
    get_current_student
)

# ==========================
# PYDANTIC MODELS
# ==========================

class UserAuthInput(BaseModel):
    shid: str
    pswd: str

class UserLoginInput(BaseModel):
    shid: str
    pswd: str

class ComplaintRequest(BaseModel):
    shid: str
    type: str
    description: str
    proof_image: str  

class FeedbackModel(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None)
    rating: int = Field(..., ge=1, le=5)

class WithdrawRequest(BaseModel):
    shid: str
    cid: int

class ForgetPasswordRequest(BaseModel):
    shid: str

class ResetPasswordRequest(BaseModel):
    shid: str
    new_password: str

# ==========================
# APP INITIALIZATION & CONFIGURATION
# ==========================

load_dotenv()
app = FastAPI(title="GovtHostelCare API", version="1.0.0")

# Production environment detection
ENV = os.getenv("ENV")
print(f"Running in {ENV} mode")
if ENV == "production":
    print("Production mode: Using .govthostelcare.me subdomain cookies")
    print(f"JWT Secret configured: {'✅' if os.getenv('JWT_SECRET_KEY') else '❌'}")
    print(f"Cookie domain: {os.getenv('COOKIE_DOMAIN', '.govthostelcare.me')}")
    print(f"Cookie secure: {os.getenv('COOKIE_SECURE', 'true')}")
else:
    print(f"Development mode: Using localhost cookies")

# Define allowed origins based on environment - Production uses subdomain setup
if ENV == "production":
    allowed_origins = [
        os.getenv("FRONTEND_DOMAIN"),
        os.getenv("LEGACY_FRONTEND_DOMAIN"),
    ]
    print(f"Production CORS origins (subdomain setup): {allowed_origins}")
else:
    allowed_origins = [
        os.getenv("LOCAL_FRONTEND_DOMAIN")
    ]
    print(f"Development CORS origins: {allowed_origins}")

# CORS middleware configuration for subdomain setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],  
)

# Session middleware only for development (JWT cookies used in production)
if ENV != "production":
    app.add_middleware(
        SessionMiddleware,
        secret_key=os.getenv("JWT_SECRET_KEY"),
        session_cookie="session",
        same_site="lax",
        domain=None  
    )
    print("Development: Session middleware enabled")
else:
    print("Production: Using JWT cookies only, session middleware disabled")

# Register routers
app.include_router(warden_router)
app.include_router(admin_router)

# ==========================
# HEALTH CHECK & SYSTEM ENDPOINTS
# ==========================

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and subdomain testing."""
    return {
        "status": "healthy",
        "environment": ENV,
        "timestamp": datetime.now().isoformat(),
        "cookie_config": {
            "domain": os.getenv("COOKIE_DOMAIN") if ENV == "production" else None,
            "secure": ENV == "production",
            "samesite": "lax"
        },
        "cors_origins": len(allowed_origins),
        "subdomain_setup": ENV == "production"
    }

# ==========================
# USER AUTHENTICATION ENDPOINTS
# ==========================

@app.post("/userauth")
def create_user_auth(data: UserAuthInput):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT SHID FROM Student WHERE SHID = %s", (data.shid,))
        if cursor.fetchone() is None:
            return {"status": "not_found", "message": "❌ SHID not found in Student table."}

        cursor.execute("SELECT UID FROM UserAuth WHERE SHID = %s", (data.shid,))
        if cursor.fetchone() is not None:
            return {"status": "exists", "message": "⚠️ SHID already registered."}

        hashed_password = bcrypt.hash(data.pswd)

        cursor.execute(
            "INSERT INTO UserAuth (SHID, PSWD) VALUES (%s, %s)",
            (data.shid, hashed_password)
        )
        conn.commit()
        return {"status": "success", "message": "User registered successfully."}

    except Exception as e:
        print("Exception occurred:", str(e))
        return {"status": "error", "message": f"Internal Server Error: {str(e)}"}

    finally:
        cursor.close()
        conn.close()

@app.post("/auth/user/login")
async def user_login(data: UserLoginInput, request: Request, response: Response):
    """
    User JWT-based login endpoint.
    Authenticates user and sets HttpOnly JWT cookies.
    """
    log_auth_debug("User login attempt started", request)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT SHID, PSWD FROM UserAuth WHERE SHID = %s", (data.shid,))
        result = cursor.fetchone()

        if result is None:
            log_auth_debug(f"User not found with SHID: {data.shid}")
            raise HTTPException(status_code=401, detail="SHID not registered.")

        db_shid, hashed_pswd = result

        if not bcrypt.verify(data.pswd, hashed_pswd):
            log_auth_debug("Password mismatch for user login")
            raise HTTPException(status_code=401, detail="Incorrect password.")

        cursor.execute("""
            SELECT SID, Name, Mail, Phone, HID 
            FROM Student 
            WHERE SHID = %s
        """, (db_shid,))
        student = cursor.fetchone()
        
        if not student:
            raise HTTPException(status_code=401, detail="Student data not found.")
        
        sid, name, mail, phone, hid = student
        
        token_data = {
            "sid": sid,
            "shid": db_shid,
            "name": name,
            "email": mail,
            "phone": phone,
            "hid": hid,
            "role": UserRole.USER,
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        set_auth_cookies(response, access_token, refresh_token, UserRole.USER)
        
        log_auth_debug(f"User login successful for {name}")
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success", 
            "message": "Login successful.",
            "user": {
                "shid": db_shid,
                "name": name,
                "email": mail,
                "role": "user"
            },
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": int(os.getenv("TOKEN_EXPIRY_SECONDS"))
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Login error:", str(e))
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.post("/auth/user/logout")
async def user_logout(response: Response):
    """
    User logout endpoint - clears JWT cookies.
    """
    clear_auth_cookies(response, UserRole.USER)
    return {"status": "success", "message": "🚪 Logged out successfully."}

@app.post("/auth/user/nuclear-logout")
async def user_nuclear_logout(response: Response):
    """
    Nuclear logout - aggressively clears all possible cookies for production subdomain setup.
    """
    clear_auth_cookies(response, UserRole.USER)
    
    all_possible_cookies = [
        "user_access_token", "user_refresh_token",
        "admin_access_token", "admin_refresh_token", 
        "warden_access_token", "warden_refresh_token",
        "access_token", "refresh_token",
        "sessionid", "csrftoken", "auth_token"
    ]
    
    if ENV == "production":
        domains = [os.getenv("FRONTEND_DOMAIN"), os.getenv("COOKIE_DOMAIN"), "govthostelcare.me", None]
        for cookie_name in all_possible_cookies:
            for domain in domains:
                response.delete_cookie(
                    cookie_name, 
                    path="/", 
                    domain=domain, 
                    secure=True, 
                    samesite="lax"
                )
        log_auth_debug("Nuclear logout: Cleared all subdomain cookies")
    else:
        # Development clearing
        for cookie_name in all_possible_cookies:
            response.delete_cookie(cookie_name, path="/")

    return {"status": "success", "message": "dNuclear logout completed (subdomain-aware)."}

@app.post("/auth/user/refresh")
async def user_refresh_token(request: Request, response: Response):
    """
    Refresh user access token using refresh token.
    """
    try:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=401, detail="No refresh token")
        
        payload = verify_jwt_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        token_data = {k: v for k, v in payload.items() if k not in ["exp", "iat", "type"]}
        new_access_token = create_access_token(token_data)
        
        set_auth_cookies(response, new_access_token, refresh_token, UserRole.USER)
        
        return {
            "status": "success",
            "message": "Token refreshed",
            "access_token": new_access_token,
            "expires_in": 15 * 60
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token refresh failed")

@app.get("/auth/user/profile")
async def get_user_profile(request: Request):
    """Get the current user's profile from JWT token."""
    user_data = get_current_student(request)
    return {
        "status": "success",
        "user": user_data,
        "message": "User profile retrieved successfully"
    }

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"status": "success", "message": " Logged out successfully."}

@app.get("/session-check")
async def session_check(request: Request):
    if "user" in request.session:
        return {"logged_in": True, "user": request.session["user"]}
    return {"logged_in": False}


# ==========================
# STUDENT DASHBOARD ENDPOINTS
# ==========================

@app.get("/dashboard/{shid}")
def get_student_dashboard(shid: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT S.SID, S.Name, S.Phone, S.Mail, S.DOB, S.SHID,
                   H.HID, H.Name AS HostelName, H.Location,
                   W.Name AS WardenName, W.Mail AS WardenMail, W.Phone AS WardenPhone,
                   R.RoomNumber
            FROM Student S
            JOIN Hostel H ON S.HID = H.HID
            LEFT JOIN Warden W ON H.HID = W.HID
            LEFT JOIN Room R ON H.HID = R.HID AND S.SID IN (
                SELECT SID FROM Student WHERE HID = H.HID
            )
            WHERE S.SHID = %s
            LIMIT 1
        """, (shid,))
        student_row = cursor.fetchone()

        if not student_row:
            raise HTTPException(status_code=404, detail="Student not found")

        student_info = {
            "sid": student_row[0],
            "name": student_row[1],
            "phone": student_row[2],
            "mail": student_row[3],
            "dob": student_row[4],
            "shid": student_row[5],
            "hostel": {
                "hid": student_row[6],
                "name": student_row[7],
                "location": student_row[8]
            },
            "warden": {
                "name": student_row[9],
                "mail": student_row[10],
                "phone": student_row[11]
            },
            "room_number": student_row[12]  # Added Room Number
        }

        # Complaint Stats
        cursor.execute("SELECT COUNT(*) FROM Complaint WHERE SID = %s", (student_info["sid"],))
        total_complaints = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM Complaint WHERE SID = %s AND Status = 'Pending'", (student_info["sid"],))
        pending = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM Complaint WHERE SID = %s AND Status = 'Resolved'", (student_info["sid"],))
        resolved = cursor.fetchone()[0]

        # Last 5 complaints
        cursor.execute("""
            SELECT Type, Status, Description, Created_at
            FROM Complaint
            WHERE SID = %s
            ORDER BY Created_at DESC
            LIMIT 5
        """, (student_info["sid"],))
        recent_complaints = cursor.fetchall()

        recent = [
            {
                "type": row[0],
                "status": row[1],
                "description": row[2],
                "created_at": row[3]
            }
            for row in recent_complaints
        ]

        cursor.close()
        conn.close()

        return {
            "student": student_info,
            "complaints": {
                "total": total_complaints,
                "pending": pending,
                "resolved": resolved,
                "recent": recent
            }
        }

    except Exception as e:
        print("❌ Dashboard Error:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")

# ==========================
# COMPLAINT MANAGEMENT ENDPOINTS
# ==========================

@app.post("/complaint/add")
def add_complaint(complaint: ComplaintRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT SID FROM Student WHERE SHID = %s", (complaint.shid,))
        student = cursor.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        sid = student[0]

        cursor.execute("""
            INSERT INTO Complaint (SID, Type, Description, Status, ProofImage)
            VALUES (%s, %s, %s, %s, %s)
        """, (sid, complaint.type, complaint.description, "Pending", complaint.proof_image))

        conn.commit()
        cursor.close()
        conn.close()

        return {"status": "success", "message": "Complaint added successfully"}

    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# ==========================
# FEEDBACK ENDPOINTS
# ==========================

@app.post("/feedback")
async def add_feedback(feedback: FeedbackModel, request: Request):
    if "user" not in request.session:
        raise HTTPException(status_code=401, detail="You must be logged in to submit feedback.")

    sid = request.session["user"]
    print(f"Logged in user sid: {sid}")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO Feedback (SID, Title, Description, Rating)
            VALUES (%s, %s, %s, %s)
            RETURNING FID;
            """,
            (sid, feedback.title, feedback.description, feedback.rating)
        )
        fid = cursor.fetchone()[0]
        conn.commit()
        return {"status": "success", "message": "✅ Feedback submitted successfully.", "feedback_id": fid}
    except Exception as e:
        print("DB error:", e)
        raise HTTPException(status_code=500, detail="Server error while submitting feedback.")
    finally:
        cursor.close()
        conn.close()

# ==========================
# ANALYTICS ENDPOINTS
# ==========================

@app.get("/analytics/student/complaint-trend/{shid}")
def complaint_trend(shid: str, days: int = 7):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT SID FROM Student WHERE SHID = %s", (shid,))
    student = cur.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sid = student["sid"]

    cur.execute("""
        SELECT 
            TO_CHAR(d::date, 'YYYY-MM-DD') AS day,
            COUNT(c.cid) AS total,
            COUNT(CASE WHEN c.iswithdrawn THEN 1 END) AS withdrawn
        FROM generate_series(
            CURRENT_DATE - %s + 1,
            CURRENT_DATE,
            '1 day'
        ) AS d
        LEFT JOIN complaint c ON DATE_TRUNC('day', c.created_at) = d::date AND c.sid = %s
        GROUP BY day ORDER BY day
    """, (days, sid))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "labels": [r["day"] for r in rows],
        "totalComplaints": [r["total"] for r in rows],
        "withdrawnComplaints": [r["withdrawn"] for r in rows]
    }

# ==========================
# UTILITY ENDPOINTS (Legacy Session-based)
# ==========================

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"status": "success", "message": "🚪 Logged out successfully."}

@app.get("/session-check")
async def session_check(request: Request):
    if "user" in request.session:
        return {"logged_in": True, "user": request.session["user"]}
    return {"logged_in": False}

# ==========================
# COMPLAINT WITHDRAWAL ENDPOINTS
# ==========================

@app.get("/fetch_complaint/{shid}")
def fetch_complaints_by_shid(shid: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT SID FROM Student WHERE SHID = %s", (shid,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        sid = student[0]

        cursor.execute("""
            SELECT CID, Type, Description, Status, Created_at, ProofImage, 
                   COALESCE(WithdrawCount, 0), COALESCE(IsWithdrawn, FALSE)
            FROM Complaint 
            WHERE SID = %s 
            ORDER BY Created_at DESC
        """, (sid,))

        complaints = []
        for row in cursor.fetchall():
            cid, type_, desc, status, created_at, proof_image, withdraw_count, is_withdrawn = row

            image_data = None
            if proof_image:
                image_data = f"data:image/png;base64,{proof_image.strip()}"

            complaints.append({
                "cid": cid,
                "type": type_,
                "description": desc,
                "status": status,
                "created_at": created_at,
                "proof_image": image_data,
                "withdraw_count": withdraw_count,
                "is_withdrawn": is_withdrawn,
            })

        return {"complaints": complaints}

    except Exception as e:
        print("Error in fetch_complaints_by_shid:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    finally:
        cursor.close()
        conn.close()

@app.get("/student_analytics/{shid}")
def get_student_analytics(shid: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT SID FROM Student WHERE SHID = %s", (shid,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        sid = student[0]

        cursor.execute("""
            SELECT Status, COUNT(*) 
            FROM Complaint
            WHERE SID = %s
            GROUP BY Status
        """, (sid,))
        complaint_status = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("""
            SELECT Type, COUNT(*)
            FROM Complaint
            WHERE SID = %s
            GROUP BY Type
        """, (sid,))
        complaint_types = [{"type": row[0], "count": row[1]} for row in cursor.fetchall()]

        cursor.execute("""
            SELECT TO_CHAR(Created_at, 'YYYY-MM') AS month, COUNT(*)
            FROM Complaint
            WHERE SID = %s
            GROUP BY month
            ORDER BY month ASC
            LIMIT 6
        """, (sid,))
        complaints_over_time = [{"month": row[0], "count": row[1]} for row in cursor.fetchall()]

        cursor.execute("""
            SELECT TO_CHAR(Created_at, 'YYYY-MM') AS month, Status, COUNT(*)
            FROM Complaint
            WHERE SID = %s
            GROUP BY month, Status
            ORDER BY month ASC
            LIMIT 12
        """, (sid,))
        monthly_status_data = {}
        for month, status, count in cursor.fetchall():
            if month not in monthly_status_data:
                monthly_status_data[month] = {"Resolved": 0, "Pending": 0}
            monthly_status_data[month][status] = count

        monthly_status = [
            {"month": m, "Resolved": d["Resolved"], "Pending": d["Pending"]}
            for m, d in monthly_status_data.items()
        ]

        cursor.close()
        conn.close()

        return {
            "complaint_status": complaint_status,
            "complaint_types": complaint_types,
            "complaints_over_time": complaints_over_time,
            "monthly_status": monthly_status
        }

    except Exception as e:
        print("Analytics Error:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/complaint/withdraw")
async def withdraw_complaint(req: Request):
    body = await req.json()
    print("Raw JSON Received:", body)

    try:
        data = WithdrawRequest(**body)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid input format")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT SID FROM Student WHERE SHID = %s", (data.shid,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        sid = student[0]

        cursor.execute("""
            SELECT WithdrawCount, IsWithdrawn 
            FROM Complaint 
            WHERE CID = %s AND SID = %s
        """, (data.cid, sid))
        complaint = cursor.fetchone()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        withdraw_count, is_withdrawn = complaint

        if is_withdrawn:
            raise HTTPException(status_code=400, detail="Complaint already withdrawn")

        if withdraw_count >= 3:
            raise HTTPException(status_code=400, detail="Withdraw limit exceeded (Max 3 times)")

        cursor.execute("""
            UPDATE Complaint
            SET Status = 'Withdrawn',
                WithdrawCount = WithdrawCount + 1,
                IsWithdrawn = TRUE
            WHERE CID = %s AND SID = %s
        """, (data.cid, sid))

        conn.commit()

        return {"status": "success", "message": "Complaint withdrawn successfully"}

    finally:
        cursor.close()
        conn.close()

# ==========================
# PASSWORD RESET ENDPOINTS  
# ==========================


@app.post("/auth/forgot-password")
def forgot_password(request: ForgetPasswordRequest, preview: bool = False):
    shid = request.shid

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT s.name, s.mail
            FROM student s
            INNER JOIN userauth u ON s.shid = u.shid
            WHERE s.shid = %s
        """, (shid,))
        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="❌ SHID not found or not registered.")

        user_email = result["mail"]
        user_name = result["name"]

        if preview:
            return {"name": user_name, "email": user_email}

        if os.getenv("ENV") == "production":
            reset_link = f"{os.getenv('FRONTEND_DOMAIN')}/reset-password/{shid}"
        else:
            reset_link = f"{os.getenv('LOCAL_FRONTEND_DOMAIN')}/reset-password/{shid}"
        msg = EmailMessage()
        msg["Subject"] = "Password Reset Request – Hostel Management System"
        msg["From"] = os.getenv("EMAIL_SENDER")
        msg["To"] = user_email
        msg.set_content(
            f"""
Dear {user_name},

We received a request to reset the password for your Hostel Management System account (SHID: {shid}).

To reset your password, click below:
{reset_link}

If this wasn't you, ignore this message.

Regards,  
Hostel Management System Team
"""
        )

        context = ssl.create_default_context()
        with smtplib.SMTP(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT"))) as smtp:
            smtp.ehlo() 
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login(
                os.getenv("EMAIL_SENDER"),
                os.getenv("EMAIL_PASSWORD")
            )
            smtp.send_message(msg)

        return {"message": f"Reset link sent to {user_email}"}

    except HTTPException as e:
        raise e

    except Exception as e:
        print("Internal server error:", traceback.format_exc())  
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")
        
    finally:
        if conn:
            conn.close()


@app.post("/auth/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM userauth WHERE shid = %s", (request.shid,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        hashed_pw = bcrypt.hash(request.new_password)

        cur.execute("UPDATE userauth SET pswd = %s WHERE shid = %s", (hashed_pw, request.shid))
        conn.commit()

        return {"message": "Password reset successful"}

    except Exception as e:
        print("Password reset error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    finally:
        if conn:
            conn.close()
