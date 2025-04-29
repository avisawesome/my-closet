# Digital Closet Application

A full-stack web application that helps users digitally track their wardrobe, create outfits, and manage clothing status.

## Features

- User authentication system
- Add, remove, and organize clothing items by category
- Mark items as clean or dirty
- Create and save outfit combinations
- Get random outfit recommendations from clean clothes
- Responsive design for desktop and mobile

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Axios for API requests
- CSS for styling

### Backend
- Node.js
- Express.js
- MySQL database
- JSON Web Tokens (JWT) for authentication
- bcrypt.js for password hashing

## Project Structure

```
digital-closet/
├── client/                # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── assets/        # SVG icons and images
│   │   ├── components/    # React components
│   │   │   ├── Authentication/
│   │   │   ├── Closet/
│   │   │   └── Layout/
│   │   ├── contexts/      # React Context providers
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── server/                # Backend Express application
    ├── config/            # Configuration files
    ├── controllers/       # Request handlers
    ├── middleware/        # Express middleware
    ├── models/            # Database models
    ├── routes/            # API routes
    └── server.js          # Entry point
```

## Application Architecture

### Frontend Components

1. **Authentication Components**
   - Login.js: User login form
   - Register.js: New user registration
   - PrivateRoute.js: Route protection
   - UserProfile.js: Profile management

2. **Closet Components**
   - Closet.js: Main closet display
   - ClothingItem.js: Individual item display
   - AddClothingForm.js: New item creation
   - OutfitDisplay.js: Selected outfit view

3. **Context Providers**
   - AuthContext.js: Authentication state management
   - ClosetContext.js: Closet data management

### Backend Architecture

1. **API Endpoints**
   - `/api/auth`: Authentication operations
   - `/api/users`: User profile management
   - `/api/clothing`: Clothing CRUD operations
   - `/api/outfits`: Outfit management

2. **Database Schema**
   - users: Account information
   - categories: Clothing types (tops, bottoms, etc.)
   - clothing_items: Individual clothing entries
   - outfits: Saved outfit collections
   - outfit_items: Items within outfits

## Installation and Setup

### Prerequisites
- Node.js and npm
- MySQL database

### Backend Setup
1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file with:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=digital_closet
   JWT_SECRET=your_jwt_secret
   ```
5. Create database: `CREATE DATABASE digital_closet;`
6. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file with: `REACT_APP_API_URL=http://localhost:5000/api`
4. Start the development server: `npm start`
5. Access the application at: http://localhost:3000

## Usage

1. Register a new account
2. Add clothing items to your closet
3. Organize items by category
4. Create outfit combinations
5. Mark items as clean/dirty
6. Get outfit recommendations
