# Database Setup Guide

## Option 1: Automatic Setup (Recommended)
The application will automatically create the database tables when you start the server. Just make sure:

1. MySQL server is running
2. Update the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=e_learning_sma
DB_PORT=3306
```

3. Run the application:
```bash
cd e-learning-sma
npm run install-all
npm run dev
```

The server will automatically create all tables when it starts.

## Option 2: Manual Setup via phpMyAdmin
1. Open phpMyAdmin in your browser
2. Create a new database named `e_learning_sma`
3. Import the SQL file:
   - Click on the database you created
   - Go to "Import" tab
   - Choose the `database-schema.sql` file
   - Click "Go" to import

4. Update the `.env` file with your database credentials

## Database Connection Details
- **Host**: localhost (or your MySQL server address)
- **Port**: 3306 (default MySQL port)
- **Database**: e_learning_sma
- **User**: Your MySQL username (usually 'root' for local development)
- **Password**: Your MySQL password

## Troubleshooting
- If you get connection errors, check if MySQL service is running
- Make sure the user has privileges to create databases/tables
- For XAMPP/WAMP: MySQL is usually accessible at localhost:3306 with username 'root' and empty password

The application uses the `mysql2` package to handle database connections automatically.
