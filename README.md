# Skyline Savannah Tours

This is a complete travel agency application featuring a modern React frontend and a robust PHP backend. It includes an AI-powered trip planner, dynamic tour packages, and a comprehensive booking system.

## Project Overview

**Skyline Savannah Tours** connects travelers with unforgettable African experiences. The application allows users to explore destinations, view detailed tour packages, and book trips effortlessly.

### Key Features
- **AI-Powered Trip Planner**: Generates personalized itineraries based on user preferences using Gemini/OpenAI.
- **Dynamic Tour Packages**: Browse safaris, beach holidays, and luxury escapes with rich media galleries.
- **Booking System**: Seamless inquiry and booking flow with email notifications.
- **Admin Dashboard**: Manage bookings, specific travel plans, and site settings.
- **Newsletter Subscription**: Auto-verification logic to handle subscriber limits.
- **Responsive Design**: Mobile-first, cinematic UI with smooth animations.

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (presumed based on usage) & Custom CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Language**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SMTP integration

## Setup Instructions

### 1. Backend Setup
The backend handles data persistence and API logic.

1. **Database**: Create a MySQL database (e.g., `skyline_db`). The system will automatically create tables on the first run.
2. **Environment & Secrets**:
    - Rename `.env.example` to `.env` in the root directory.
    - Update the values with your local configuration:
      ```ini
      DB_HOST=localhost
      DB_USER=your_db_user
      DB_PASS=your_db_password
      DB_NAME=skyline_db
      JWT_SECRET=your_secure_random_string
      ```
3. **Server**: Ensure your web server (Apache/Nginx) is pointing to the project root and `api.php` is accessible.

### 2. Frontend Setup
The frontend is a Vite-based React application.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

3. **Production Build**:
   ```bash
   npm run build
   ```
   The output will be in the `dist` folder.

## API Documentation

The `api.php` file acts as the single entry point for all backend operations.

### Public Endpoints
- `GET /api.php?action=get_all_data`: Fetch all content (tours, destinations, etc.).
- `POST /api.php?action=create_booking`: Submit a new booking.
- `GET /api.php?action=check_ai_usage`: Check if a user is allowed to generate more AI plans.

### Protected Endpoints (Admin)
- `POST /api.php?action=login`: Admin authentication.
- `GET /api.php?action=get_admin_data`: Fetch dashboard statistics.
- `POST /api.php?action=crud`: Generic create/read/update/delete for any table.

## Deployment
- **Frontend**: Can be deployed to Netlify, Vercel, or any static host.
- **Backend**: Requires a PHP/MySQL hosting environment.

## License
Private property of Skyline Savannah Tours.
