
# AI-Powered LLD LeetCode

AI-Powered LLD LeetCode is a specialized platform for practicing Object-Oriented Design (OOD) and Low-Level Design (LLD). 
Unlike traditional coding platforms that validate only input/output, this system evaluates the internal design quality of your code using Generative AI.

The platform analyzes adherence to SOLID principles and common design patterns, simulating real-world architectural code reviews.

## Core Capabilities

- Real-time design analysis with architectural-level feedback
- SOLID score (0–100) based on SRP, OCP, LSP, ISP, and DIP
- Automatic detection of design patterns such as Strategy, Observer, and Factory
- Visual pass/fail indicators for each design principle

## Architecture Overview

### Tech Stack

| Component   | Technology                    | Port | Description |
|------------|--------------------------------|------|-------------|
| Frontend   | React, Vite, Tailwind, Monaco | 5173 | Interactive UI and code editor |
| Backend    | Node.js, Express, TypeScript  | 5000 | API server and evaluation logic |
| AI Engine  | Google Gemini 1.5 Flash       | N/A  | Code analysis and scoring engine |

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lld-leetcode.git
cd lld-leetcode
```

### 2. Backend Setup

A Google Gemini API key is required.

```bash
cd lld-leetcode-backend
npm install
```

Create a `.env` file:

```bash
PORT=5000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Start the backend server:

```bash
npm run dev
```

The backend should now be running at:

```
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal window:

```bash
cd lld-leetcode-client
npm install
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

## Testing the Platform

Navigate to the problem URLs and paste the provided solutions into the editor to verify AI evaluation.

### Problem 1: Parking Lot Design

URL:
```
http://localhost:5173/solve/1
```

Expected behavior:
- Well-designed solutions score above 90
- Poorly designed solutions score below 50

### Problem 2: Notification System

URL:
```
http://localhost:5173/solve/2
```

Expected behavior:
- Interface-based and loosely coupled designs score above 90
- Tightly coupled implementations score below 60

## Troubleshooting

### AI Service Unavailable or Score = 0

- Ensure the backend server is running
- Verify the Gemini API key in the `.env` file
- Restart the backend server

### CORS Errors

- Confirm backend is running on port 5000
- Verify frontend API URL is set to:
  ```
  http://localhost:5000/api
  ```

## Project Vision

This platform is designed to bridge the gap between competitive programming and real-world software engineering by focusing on design correctness, maintainability, and extensibility.
