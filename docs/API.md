# 🔌 API Documentation

This document outlines the REST API endpoints provided by the PrepPilot Node.js backend.

## Base URL
All API requests should be prefixed with `/api`.
Example: `http://localhost:5000/api`

## Authentication
Most endpoints require a JSON Web Token (JWT) provided in the HTTP `Authorization` header.
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Auth API (`/api/auth`)

### Register a new user
- **URL**: `/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com" }
  }
  ```

### Login
- **URL**: `/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response**: `200 OK` (Returns token and user object).

---

## 2. Resume API (`/api/resume`)

### Upload & Analyze Resume
- **URL**: `/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: Form data containing a `resume` file field (PDF only).
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Resume analyzed successfully",
    "data": {
      "atsScore": 85,
      "missingSkills": ["Docker", "Kubernetes"],
      "grammarSuggestions": ["Fix tense on line 4"],
      "keywordOptimization": ["Include more REST API mentions"],
      "improvements": ["Quantify your achievements"]
    }
  }
  ```

### Get User Resumes
- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK` (Array of resume objects).

---

## 3. Interview API (`/api/interview`)

### Start New Interview
- **URL**: `/start`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "type": "Technical",
    "category": "React"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "interviewId": "...",
    "firstQuestion": {
      "question": "Explain the virtual DOM.",
      "expectedAnswerKeywords": ["reconciliation", "diffing"]
    }
  }
  ```

### Submit Answer
- **URL**: `/answer`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "interviewId": "...",
    "question": "Explain the virtual DOM.",
    "answer": "It is a lightweight copy of the real DOM..."
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "feedback": {
      "score": 90,
      "feedback": "Great answer, but mention reconciliation."
    },
    "nextQuestion": { ... }
  }
  ```

---

## 4. DSA Tracking API (`/api/dsa`)

### Get User DSA Progress
- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

### Update Progress
- **URL**: `/update`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "problemsSolvedToday": 3,
    "difficulty": { "easy": 2, "medium": 1, "hard": 0 },
    "topics": ["Arrays", "Two Pointers"]
  }
  ```

---

## 5. Roadmap API (`/api/roadmap`)

### Generate Custom Roadmap
- **URL**: `/generate`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "targetCompany": "Google",
    "currentSkills": ["JavaScript", "React"]
  }
  ```
- **Success Response**: `200 OK` (Returns heavily nested JSON containing week-by-week plan).

---

## 6. Chat Mentor API (`/api/chat`)

### Send Message to AI Mentor
- **URL**: `/message`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "message": "How do I prepare for a behavioral interview?",
    "history": [ ... ]
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "reply": "The best approach is the STAR method..."
  }
  ```
