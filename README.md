# RTO Automated Queue System

A full-stack web application for managing RTO (Regional Transport Office) queue system with automated token generation, slot booking, and admin dashboard.

## Features

- **User Registration & Login**: Secure user authentication with Aadhaar validation
- **Slot Booking**: Book time slots up to 5 days in advance (excluding weekends)
- **Token Generation**: Automatic token generation with OTP verification
- **Admin Dashboard**: Complete admin panel for managing applications and tokens
- **Priority Queue**: Users with disabilities get priority in the queue
- **Real-time Updates**: Live queue status and token management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication (planned)
- **CORS** enabled for cross-origin requests

### Frontend
- **React.js** with React Router
- **Tailwind CSS** for styling
- **Axios** for API calls
- **QR Code** generation for tokens

## Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Git** (for cloning)

## Quick Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd RTO-Automated-Queue-System
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb rto_queue_system

# Or using psql
psql -U postgres
CREATE DATABASE rto_queue_system;
\q
```

### 3. Backend Setup
```bash
   cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000

## Detailed Setup Instructions

### Database Configuration

1. **Install PostgreSQL**:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**:
   ```sql
   CREATE DATABASE rto_queue_system;
   CREATE USER rto_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE rto_queue_system TO rto_user;
   ```

3. **Run Schema**:
   ```bash
   psql -U rto_user -d rto_queue_system -f backend/src/DB/schema.sql
   ```

### Environment Configuration

Create `backend/.env` with the following variables:

```env
# Database Configuration
PG_USER=your_db_user
PG_PASSWORD=your_db_password
PG_HOST=localhost
PG_DATABASE=rto_queue_system
PG_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (for future authentication)
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend Configuration

Create `frontend/.env` (optional):

```env
REACT_APP_API_BASE=http://localhost:3000
```

## Project Structure

```
RTO-Automated-Queue-System/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── DB/             # Database connection and schema
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # React entry point
│   └── package.json
└── README.md
```

## API Endpoints

### User Management
- `POST /users` - Register new user
- `POST /login` - User login
- `GET /users/:user_id/otp` - Get user's OTP
- `POST /users/cancel` - Cancel application

### Slot Management
- `POST /slots` - Book a slot
- `GET /slots/availability` - Get slot availability
- `GET /slots/queue` - Get queue for a slot

### Token Management
- `POST /tokens/issue` - Issue new token
- `GET /tokens/active` - Get active token for user

### Admin (Protected)
- `GET /applications` - Get all applications
- `GET /applications/next` - Get next application
- `GET /stats/today` - Get today's statistics
- `POST /admin/otp/verify` - Verify OTP and finish
- `POST /admin/otp/reveal` - Reveal OTP to admin

## Admin Access

To grant admin access to a user:

```sql
UPDATE app_user SET is_admin = TRUE WHERE id = <user_id>;
```

## Development

### Running in Development Mode

1. **Backend**:
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm start    # Opens browser automatically
   ```

### Building for Production

1. **Backend**:
   ```bash
   cd backend
   npm install --production
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with a web server
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in backend `.env`
   - Update REACT_APP_API_BASE in frontend `.env`

3. **CORS Issues**:
   - Backend CORS is configured for all origins
   - For production, restrict to your domain

4. **Environment Variables Not Loading**:
   - Ensure `.env` files are in correct locations
   - Check file permissions
   - Restart the server after changes

### Database Issues

If you encounter schema errors:

```bash
# Drop and recreate database
dropdb rto_queue_system
createdb rto_queue_system
psql -U your_user -d rto_queue_system -f backend/src/DB/schema.sql
```

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Implement proper JWT authentication for production
- Add rate limiting for API endpoints
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository
