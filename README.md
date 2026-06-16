# AI-Powered FAQ Assistant

A premium full-stack AI-Powered FAQ Assistant that answers user questions instantly, stores conversation history in MongoDB, and supports intelligent real-time keyword search.

## 🚀 Features

- **Gemini AI Integration**: Real-time answers using Google's generative models (`gemini-1.5-flash`).
- **Smart Conversation History**: Stores user questions, AI answers, and timestamps in MongoDB.
- **Instant Full-Text Search**: Optimized regex searching to filter and retrieve past questions and answers.
- **Premium Glassmorphic UI**: Gorgeous Dark Mode dashboard built with React + Vite (Cyber Violet/Neon Cyan glow palette).
- **Flexible Deployment**: Spin up the entire system with Docker Compose or run locally.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Lucide React (Icons), Vanilla CSS (Custom Design System).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose ODM.
- **AI Integration**: Google Gemini SDK (`@google/generative-ai`).
- **Containerization**: Docker, Docker Compose.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder with the following contents:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/faq-assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!NOTE]
> If `GEMINI_API_KEY` is not provided, the backend will operate in **interactive fallback mode** allowing you to test database records, search, and UI updates seamlessly with mock responses.

---

## 🐳 Quick Start with Docker (Recommended)

1. Ensure Docker is running.
2. Build and launch all services with a single command:
   ```bash
   docker compose up --build
   ```
3. Open your browser and navigate to:
   - **Frontend**: http://localhost (Port 80)
   - **Backend health status**: http://localhost:5000/health

---

## 💻 Local Development Setup (Manual)

If you prefer to run the components separately on your local machine:

### 1. Database
Make sure you have MongoDB running locally at `mongodb://localhost:27017/` (or use a remote connection string like MongoDB Atlas).

### 2. Run Backend
```bash
cd backend
# Create / Edit .env file (add your GEMINI_API_KEY)
npm install
npm run dev
```
The server will start on http://localhost:5000.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 to access the FAQ Assistant.

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Request Body / Query Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/chat` | Submit a question to AI and save to Mongo | `{ "question": "..." }` |
| **GET** | `/api/history` | Retrieve full conversation history | *None* |
| **GET** | `/api/search` | Search through past Q&A history | `?q=search_query` |
