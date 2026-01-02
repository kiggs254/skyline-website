# Skyline Savannah Tours API

This is the backend API for the Skyline Savannah Tours application. It handles user authentication, bookings, data retrieval (packages, destinations, etc.), and email notifications.

## Project Overview

The project consists of a single PHP file (`api.php`) that acts as a RESTful API. It connects to a MySQL database to store and retrieve data. The frontend application communicates with this API to function.

## Setup Instructions

### Pre-requisites
- **PHP**: 7.4 or higher.
- **MySQL**: 5.7 or higher.
- **Web Server**: Apache or Nginx.

### 1. Database Setup
1. Create a MySQL database (e.g., `skyline_db`).
2. The API will automatically create the necessary tables (`admins`, `bookings`, `subscribers`, `generated_plans`, etc.) upon the first request (e.g., login or get_all_data), implementing a self-healing schema.

### 2. Environment Configuration
1. Rename `.env.example` to `.env`:
   ```bash
   mv .env.example .env
   ```
2. Open `.env` and fill in your database credentials and secret keys:
   ```ini
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=skyline_db
   JWT_SECRET=your_secure_random_string
   ```

### 3. Server Configuration
- Ensure your web server points to the project directory.
- For Apache, ensure `mod_rewrite` is enabled if you plan to use clean URLs (though the current setup works with query parameters).
- Ensure the `uploads` directory is writable by the web server user.

## API Usage

### Endpoints

- **GET /?action=get\_all\_data**: Fetches all public data (packages, destinations, services, etc.).
- **POST /?action=login**: Admin login. Requires `username` and `password`.
- **POST /?action=create\_booking**: Creates a new booking.
- **POST /?action=add\_subscriber**: Adds a newsletter subscriber.
- **POST /?action=save\_plan**: Saves an AI-generated travel plan.
- **GET /?action=check\_ai\_usage&email=...**: Checks AI plan usage limit for an email.

### Protected Endpoints (Require Bearer Token)
- **GET /?action=get\_admin\_data**: Fetches admin dashboard data.
- **POST /?action=crud**: Generic CRUD operations for managed tables.
- **POST /?action=upload\_file**: Uploads an image.
- **POST /?action=update\_settings**: Updates site settings (SMTP, etc.).
- **POST /?action=change\_password**: Changes admin password.
- **POST /?action=send\_test\_email**: Sends a test email using configured SMTP settings.

## Security Note
- Never commit your `.env` file to version control.
- Change the `JWT_SECRET` to a strong, random string in production.
