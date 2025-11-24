# Hostel Management System

The Hostel Management System is a modern web-based solution designed specifically for government educational institutions to streamline hostel operations and improve student experience. The platform bridges the communication gap between students, wardens, and administrators through a centralized complaint management system.


## Project Structure

```
├── backend/          # FastAPI backend server
├── frontend/         # React frontend application
├── README.md
```

## Features

- Student registration and authentication
- Complaint management system
- Admin and warden dashboards
- Real-time complaint tracking
- Feedback system
- Responsive web design

## Technology Stack

**Backend:**
- FastAPI
- PostgreSQL
- JWT Authentication
- Bcrypt for password hashing

**Frontend:**
- React 22
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM

## Installation & Setup

### Prerequisites
- Node.js (v22 or higher)
- Python 3.11.8
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `backend/.env` file with required variables:
```env
# Database Configuration
DB_NAME=your_database_name
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# Environment
ENV=development

# Frontend URLs
FRONTEND_DOMAIN=http://localhost:5173
LOCAL_FRONTEND_DOMAIN=http://localhost:5173

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_HOURS=24

# Email Configuration 
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_SENDER=your_sender_email@example.com

# Token Settings
TOKEN_EXPIRY_SECONDS=900
```

5. Initialize database:
```bash
python db.py
```

6. Start the server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `frontend/.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```
## API Endpoints

### Authentication
- `POST /auth/user/register` - Student registration
- `POST /auth/user/login` - Student login
- `POST /auth/admin/login` - Admin login
- `POST /auth/warden/login` - Warden login

### Complaints
- `POST /complaint/add` - Submit new complaint
- `GET /dashboard/{shid}` - Get student dashboard data
- `POST /complaint/withdraw` - Withdraw complaint

### Admin
- `GET /admin/analytics` - Get admin analytics
- `POST /admin/users/add` - Add new user

## Database Schema

The system uses PostgreSQL with the following main tables:
- `Student` - Student information
- `Hostel` - Hostel details
- `Warden` - Warden information
- `Complaint` - Complaint records
- `UserAuth` - Authentication data
- `Admin` - Admin accounts

## Deployment

### Production Environment Variables

For production deployment, update the following variables:

```env
ENV=production
FRONTEND_DOMAIN=https://your-frontend-domain.com
COOKIE_DOMAIN=.your-domain.com
```

### Build Commands

**Frontend:**
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Collaboration
Special thanks to [Mubbassir24](https://github.com/Mubbassir24) for contributing to backend development.


## License

This project is part of an educational initiative for government hostel management systems.