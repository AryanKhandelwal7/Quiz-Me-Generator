**Quiz-Me Generator**

A simple prototype that converts study documents into interactive quizzes using AI.

**What it does**

- Upload PDF or DOCX files
- AI generates multiple-choice questions
- Take interactive quizzes with instant feedback
- View detailed results

**Tech Stack**

- Frontend: React.js
- Backend: Node.js + Express
- AI: OpenAI GPT-3.5

**STEP 1: Backend Setup**

`cd backend`
`npm install`

Create `.env` file in backend folder:

`OPENAI_API_KEY=your-openai-key-here
PORT=3001
NODE_ENV=development`

Start backend:

`npm run dev`

**Step 2: Frontend Setup**

`cd frontend
npm install
npm start`

**Step 3: Use the app**

1. Open http://localhost:3000
2. Upload a PDF or DOCX file
3. Select difficulty and number of questions
4. Generate and take your quiz!
