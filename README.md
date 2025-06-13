# 🚀 Task-Management-WebApp

The Task Management System is a full-stack web application designed to simplify task assignment, tracking, and management for teams. It offers secure authentication, intuitive dashboards, and role-based features for users and admins, it enhances productivity across devices, from desktops to smartphones.

## ✨ Features

### 🔐 Authentication
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- Role-based access control (Admin/User)

### 👤 User Features
- Personal dashboard with assigned tasks
- Task status updates (pending, in-progress, completed)
- Profile management with profile picture upload
- Task filtering and searching
- PDF report generation

### 🛠️ Admin Features
- User management (create, view, edit, delete)
- Task management (create, assign, edit, delete)
- Admin dashboard with profile management
- Task reporting and analytics
- PDF export functionality

## 🧰 Technologies Used

### 🖥️ Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- jsPDF for PDF generation
- Google OAuth integration

### 🗄️ Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email functionality

## 🛠️ Installation

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB
- Google OAuth credentials

### Backend Setup
1. Clone the repository
   
   git clone [https://github.com/yourusername/task-management-system.git](https://github.com/KanchanaKoralage1/Task-Management-WebApp.git)
   

2. Install backend dependencies
   
   cd backend
   npm install

   ### Dependencies
    "dependencies": {  <br/>
    "bcryptjs": "^3.0.2",  <br/>
    "cors": "^2.8.5",  <br/>
    "dotenv": "^16.5.0",  <br/>
    "express": "^5.1.0",  <br/>
    "googleapis": "^150.0.1",  <br/>
    "jsonwebtoken": "^9.0.2",  <br/>
    "mongoose": "^8.15.1",  <br/>
    "multer": "^2.0.1",  <br/>
    "nodemailer": "^7.0.3",  <br/>
    "passport": "^0.7.0",  <br/>
    "passport-google-oauth20": "^2.0.0"  <br/>
  }  <br/>

4. Create a `.env` file in the backend directory with the following variables:
   
  - PORT=5000
  - MONGO_URI=your_mongodb_connection_string
  - JWT_SECRET=your_jwt_secret
  - JWT_EXPIRES_IN=90d
  - JWT_ADMIN_SECRET=your_admin_secret
  - GOOGLE_CLIENT_ID=your_google_client_id
  - GOOGLE_CLIENT_SECRET=your_google_client_secret
  - EMAIL_USER=your_email@gmail.com
  - GOOGLE_REFRESH_TOKEN=your_google_refresh_token


4. Start the backend server
 
   npm run dev
  

### Frontend Setup
1. Install frontend dependencies
   
   cd ../frontend
   npm install

   ### Dependencies

   "dependencies": {  <br/>
    "@react-oauth/google": "^0.12.2", <br/>
    "@tailwindcss/vite": "^4.1.10", <br/>
    "axios": "^1.9.0", <br/>
    "jspdf": "^2.5.1", <br/>
    "jspdf-autotable": "^3.8.2", <br/>
    "react": "^19.1.0", <br/>
    "react-dom": "^19.1.0", <br/>
    "react-router-dom": "^7.6.2", <br/>
    "tailwindcss": "^4.1.10" <br/>
  }, <br/>
  "devDependencies": { <br/>
    "@eslint/js": "^9.25.0", <br/>
    "@types/react": "^19.1.2", <br/>
    "@types/react-dom": "^19.1.2", <br/>
    "@vitejs/plugin-react": "^4.4.1", <br/>
    "eslint": "^9.25.0", <br/>
    "eslint-plugin-react-hooks": "^5.2.0", <br/>
    "eslint-plugin-react-refresh": "^0.4.19", <br/>
    "globals": "^16.0.0", <br/>
    "vite": "^6.3.5" <br/>
  } <br/>

3. Start the frontend development server
  
   npm run dev
   

4. The application will be available at `http://localhost:5173`

## 🔧 Usage

### User Registration and Login
1. Navigate to the signup page to create a new account
2. Use email/password or Google OAuth to register
3. Login with your credentials

### User Dashboard
1. View assigned tasks
2. Update task status (pending, in-progress, completed)
3. Filter and search tasks
4. Generate PDF reports

### Profile Management
1. Update profile information
2. Change password
3. Upload profile picture

### Admin Dashboard
1. Manage users (create, edit, delete)
2. Create and assign tasks
3. Monitor task progress
4. Generate reports

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/google-login` - Google OAuth login
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password

### User Management
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/update-profile` - Update user profile
- `PATCH /api/users/update-password` - Update user password
- `POST /api/users/upload-profile-picture` - Upload profile picture
- `GET /api/users/all-users` - Get all users (admin only)
- `GET /api/users/user/:id` - Get user by ID (admin only)
- `PATCH /api/users/user/:id` - Update user (admin only)
- `DELETE /api/users/user/:id` - Delete user (admin only)

### Task Management
- `GET /api/tasks` - Get all tasks (filtered by user role)
- `POST /api/tasks` - Create a new task (admin only)
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)
- `GET /api/tasks/report` - Get tasks for PDF report


## 👤 Author

- [Kanchana Koralage](https://github.com/KanchanaKoralage1)

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
