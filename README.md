# 🚀 Skill-Share E-Learning Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)

A full-stack web application designed to be a platform where creators can upload video courses and users can enroll, learn new skills, track their progress, and earn certificates upon completion.

---

## 📋 Table of Contents

1.  [Key Features](#-key-features)
2.  [Technology Stack](#-technology-stack)
3.  [Project Structure](#-project-structure)
4.  [Getting Started](#-getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation & Setup](#installation--setup)
    * [Environment Variables](#environment-variables)
    * [Running the Application](#running-the-application)
5.  [API Endpoints](#-api-endpoints)
6.  [Contributing](#-contributing)
7.  [License](#-license)

---

## ✨ Key Features

* **User Authentication:** Secure user registration and login functionality using JWT (JSON Web Tokens).
* **Course Management:**
    * Instructors can create, update, and manage their courses.
    * Functionality to upload and host video lessons.
    * Option to offer courses as **Free** or **Paid**.
* **Student Dashboard:**
    * Browse and enroll in available courses.
    * Track progress through course modules and lessons.
* **Interactive Learning:**
    * **Q&A Section** below each video for community engagement.
* **Rewards & Gamification:**
    * Automatic **Certificate Generation** upon course completion.
    * **Leaderboard** to showcase top-performing students.
* **Multi-page Experience:** A seamless, single-page application feel with client-side routing.

---

## 💻 Technology Stack

This project is built using the MERN stack.

#### Frontend:
* **React.js:** A JavaScript library for building user interfaces.
* **React Router:** For client-side routing and navigation between pages.
* **Axios / Fetch:** For making API requests to the backend server.
* **CSS3:** For styling the components.

#### Backend:
* **Node.js:** A JavaScript runtime environment.
* **Express.js:** A web application framework for Node.js, used to build our REST API.
* **MongoDB:** A NoSQL database to store user and course data.
* **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
* **JSON Web Tokens (JWT):** For securing API endpoints and managing user sessions.
* **Bcrypt.js:** For hashing and securing user passwords.
* **Dotenv:** For managing environment variables.
* **CORS:** For enabling cross-origin resource sharing.

---

## 📁 Project Structure

The project is organized into a monorepo structure with two main directories: `client` and `server`.
skillshare/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── assets/       # Images, logos, etc.
│   │   ├── components/   # Reusable React components (Login, Register, etc.)
│   │   ├── App.js        # Main app component with routing
│   │   ├── index.js      # Entry point for the React app
│   │   └── ...
│   ├── .gitignore
│   └── package.json
│
└── server/
├── controllers/    # Logic for handling requests (e.g., authController.js)
├── models/         # Mongoose schemas for the database (e.g., User.js, Course.js)
├── routes/         # API route definitions (e.g., authRoutes.js)
├── .gitignore
├── package.json
└── server.js       # Main entry point for the backend server


---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

You must have the following software installed on your system:
* [Node.js](https://nodejs.org/en/) (v16 or later)
* [Git](https://git-scm.com/)
* [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/gaganml13/skillshare.git](https://github.com/gaganml13/skillshare.git)
    cd skillshare
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd ../server
    npm install
    ```

### Environment Variables

The backend server requires some environment variables to be set up.

1.  In the `server` directory, create a new file named `.env`.
2.  Copy the contents of the `.env.example` file (we will create this later) into your new `.env` file.
3.  Fill in the required values:

    ```env
    # Port for the server to run on
    PORT=5001

    # Your MongoDB connection string (local or from Atlas)
    MONGO_URI=your_mongodb_connection_string

    # A secret key for signing JWT tokens
    JWT_SECRET=your_super_secret_key
    ```

### Running the Application

You will need to run the frontend and backend in two separate terminals.

1.  **Start the Backend Server:**
    ```bash
    # From the root /skillshare directory
    cd server
    npm start
    ```
    The server will be running on `http://localhost:5001`.

2.  **Start the Frontend Application:**
    ```bash
    # From the root /skillshare directory, in a new terminal
    cd client
    npm start
    ```
    The React app will open in your browser at `http://localhost:3000`.

---

## 🌐 API Endpoints

The following are the planned API endpoints. (This section is a work-in-progress).

* **User Routes (`/api/users`)**
    * `POST /register` - Register a new user.
    * `POST /login` - Authenticate a user and get a token.
    * `GET /me` - Get the currently logged-in user's profile.

* **Course Routes (`/api/courses`)**
    * `POST /` - Create a new course (Instructor only).
    * `GET /` - Get a list of all courses.
    * `GET /:id` - Get details of a single course.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourAmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some YourAmazingFeature'`).
4.  Push to the branch (`git push origin feature/YourAmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.