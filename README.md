# 🚀 SkillShare Platform V2

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

An advanced, interactive e-learning platform designed to empower users with collaborative project-building, personalized learning roadmaps, AI-powered assistance, and verifiable certifications.

---

## 📋 Table of Contents

1.  [Key Features](#-key-features)
2.  [Technology Stack](#-technology-stack)
3.  [Getting Started](#-getting-started)
4.  [Project Structure](#-project-structure)
5.  [API Endpoints](#-api-endpoints)
6.  [AI Integration & Prompting](#-ai-integration--prompting)
7.  [Future Enhancements](#-future-enhancements)

---

## ✨ Key Features

* **Robust User Authentication & Roles:** Secure login/registration for "Student" and "Instructor" roles.
* **Comprehensive Course Management:**
    * Instructors can create, update, and manage courses and lessons.
    * Flexible video lesson system supporting both direct file uploads and YouTube/Vimeo embeds.
    * **Instructor Tools:** Dedicated options for instructors to edit course details and delete individual videos.
    * **Student Experience:** Intuitive course browsing, enrollment, and progress tracking.
* **Engaging Video Lesson Interface:**
    * **Visual-first Layout:** Each lesson page features a prominent video player at the top.
    * **Detailed Lesson Information:** Displays video title, duration, and user's progress.
    * **Tabbed Content:** Integrated sections for "Overview", "Assignments", and "Q&A" below the video.
* **Dynamic Project Collaboration (Community Feature):**
    * **Interest-Based Collaboration:** Users can form or join project groups based on shared interests or specific course topics.
    * **Collaborative Workspaces:** Dedicated areas for project teams to communicate, share resources, and track progress on projects.
    * **Project Showcase:** Feature completed projects on a community board.
* **Verifiable Certification:**
    * **Automated Certificate Generation:** Users automatically receive a verifiable certificate upon 100% completion of a course.
    * **Certificate Display:** A dedicated section on user profiles to view and manage earned certifications.
* **Innovative Learning Methods:**
    * **Visual Learning Roadmaps:** Personalized, interactive roadmaps to guide students through learning paths and course modules.
    * **AI Study Assistant:** An integrated AI chatbot (e.g., Gemini) accessible on course pages for quick answers, concept clarification, and study guidance.
    * **Per-Video Q&A:** A dedicated discussion section for each video lesson for specific questions and answers.
* **Gamification & Engagement:**
    * **Leaderboard:** Displays top-performing students and most active instructors.
    * **Achievement Badges:** Award badges for milestones and course completion.
* **"Trusted By" Section:** Displaying company logos on the homepage to enhance credibility.

---

## 💻 Technology Stack

#### Frontend:
* **React.js:** Building dynamic user interfaces.
* **React Router:** Declarative navigation.
* **Axios:** HTTP client for API communication.
* **React Context API:** Global state management (Authentication, Course data).
* **CSS3 / CSS Modules / Styled Components (Optional):** Modular and maintainable styling.

#### Backend:
* **Node.js & Express.js:** Robust RESTful API development.
* **MongoDB & Mongoose:** NoSQL database with object data modeling.
* **JSON Web Tokens (JWT):** Secure user authentication.
* **Bcrypt.js:** Password hashing.
* **Multer:** Handling file uploads (e.g., video lessons).
* **OpenAI API / Google Gemini API:** For AI Study Assistant integration.
* **PDF Generation Library (e.g., Puppeteer, html-pdf):** For certificate generation.

---

## 🚀 Getting Started

### Client (React)

```
cd client
npm install
npm start
```

* `npm start` launches the redesigned dashboard with the gradient header hero, responsive course grid, AI chat widget, and modern card layout.
* `npm run build` produces a production bundle in `client/build`.
* `npm test` runs the Jest + React Testing Library suite, including the new `CourseCard` and `ProgressBar` coverage.

### Server (Express)

```
cd server
npm install
npm start
```

The backend API is unchanged by this PR, so the existing `.env` expectations remain the same.
> Note: add your Google Gemini key to `server/.env` as `GEMINI_API_KEY` and never push that secret to git.
<!-- Documented GEMINI key reminder for deployments. -->

### ✅ Local chat testing

1. `npm --prefix server install`
2. `npm --prefix client install`
3. Start the services:
    * `npm --prefix server run start`
    * `npm --prefix client run start`
4. Open `http://localhost:3000` in the browser.
5. Launch the SkillverseX AI chat, send a message, and watch the server console for `[chat] incoming request` logs.
<!-- Added consolidated local chat test steps. -->

> Tip: When experimenting with the new `useCourseProgress` hook or `AIChatWidget`, run `npm start` in both `client/` and `server/` to keep sample data and API responses in sync.

---

## 📁 Project Structure

skillshare-app/
├── client/
│   ├── public/             # Static assets (index.html, favicon)
│   ├── src/
│   │   ├── assets/         # Images, icons, static files specific to client
│   │   ├── components/
│   │   │   ├── common/     # Generic UI components (Button, Modal, LoadingSpinner)
│   │   │   ├── courses/    # Components specific to course display/management
│   │   │   │   ├── CourseCard.js
│   │   │   │   ├── CourseVideoPlayer.js  # For handling video display
│   │   │   │   ├── CourseTabs.js         # Handles Overview, Assignments, Q&A tabs
│   │   │   │   └── ...
│   │   │   ├── community/  # Components for community/project feature
│   │   │   │   ├── ProjectCard.js
│   │   │   │   ├── ProjectForm.js
│   │   │   │   └── ...
│   │   │   ├── learning/   # Components for roadmaps, certificates, AI
│   │   │   │   ├── RoadmapVisualizer.js
│   │   │   │   ├── CertificateDisplay.js
│   │   │   │   ├── AIAssistantChat.js    # UI for AI study assistant
│   │   │   │   └── ...
│   │   │   ├── Navbar.js   # Global navigation
│   │   │   └── AuthForm.js # Reusable login/register form structure
│   │   ├── context/        # React Context for global state (AuthContext, CourseContext)
│   │   │   └── AuthContext.js
│   │   ├── pages/          # Top-level page components
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── CourseDetailPage.js # This will contain the video section
│   │   │   ├── CreateCoursePage.js
│   │   │   ├── CommunityPage.js    # New: Main page for community/projects
│   │   │   ├── ProfilePage.js
│   │   │   └── NotFoundPage.js
│   │   ├── App.js          # Main router and layout
│   │   ├── index.js        # React app entry point
│   │   ├── App.css         # Global styles
│   │   └── index.css       # Base/utility styles
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   └── package.json
│
└── server/
├── config/             # Database configuration
│   └── db.js
├── controllers/        # Business logic for routes
│   ├── authController.js
│   ├── courseController.js
│   ├── userController.js
│   ├── projectController.js # New: Logic for community projects
│   ├── certificateController.js # New: Logic for certificates
│   ├── roadmapController.js # New: Logic for roadmaps
│   ├── discussionController.js # New: Logic for Q&A
│   └── uploadController.js # Logic for video/file uploads
├── middleware/         # Custom Express middleware
│   ├── authMiddleware.js # JWT verification
│   ├── errorHandler.js
│   └── uploadMiddleware.js # Multer configuration
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Course.js
│   ├── Video.js        # Potentially separate video schema if complex
│   ├── Project.js      # New: Community Projects
│   ├── Certificate.js  # New: User certificates
│   ├── Roadmap.js      # New: Learning roadmaps
│   ├── Discussion.js   # New: For Q&A sections
│   └── Assignment.js   # New: For course assignments
├── routes/             # API route definitions
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── userRoutes.js
│   ├── projectRoutes.js    # New: API for community projects
│   ├── certificateRoutes.js # New: API for certificates
│   ├── roadmapRoutes.js    # New: API for roadmaps
│   ├── discussionRoutes.js # New: API for Q&A
│   ├── assignmentRoutes.js # New: API for assignments
│   └── uploadRoutes.js
├── uploads/            # Directory for uploaded video files
├── .env
├── .gitignore
├── package.json
└── server.js    