# How to Test Quiz Reports

## Method 1: Test via User Frontend (Recommended)

### Step 1: Start the Backend Server
```bash
cd Backend
npm start
```
You should see: `✅ Database connected successfully` and `Server is running at http://localhost:4000`

### Step 2: Start User Frontend
```bash
cd userFrontend
npm run dev
```
Open the user frontend (usually `http://localhost:5173` or similar)

### Step 3: Login as a User
1. Go to the login page
2. Login with a user account (make sure you have a user created)
3. After login, check the browser console (F12) and verify `userId` is stored in localStorage

### Step 4: Take a Quiz
1. Navigate to the quizzes page
2. Click on a quiz
3. Enter the passcode
4. Answer some questions
5. Click "Submit Quiz" or wait for timer to finish
6. You should see a success message: "Quiz submitted! Your score: X / Y"

### Step 5: Check Admin Reports
1. Open the Admin Frontend (usually `http://localhost:5176` or similar)
2. Login as admin
3. Navigate to **Reports** page (in the sidebar)
4. You should see the quiz result you just submitted with:
   - User name/email
   - Quiz name
   - Score and percentage
   - Time taken
   - Date and time

---

## Method 2: Test API Directly

### Step 1: Check if Results Endpoint Works
Open your browser or use Postman/curl:

```bash
# Get all quiz results
GET http://localhost:4000/api/quiz-results
```

You should see a JSON array of quiz results.

### Step 2: Submit a Test Quiz Result
```bash
POST http://localhost:4000/api/quizzes/YOUR_QUIZ_ID/submit
Content-Type: application/json

{
  "userId": "YOUR_USER_ID",
  "answers": {
    "QUESTION_ID_1": "option1",
    "QUESTION_ID_2": "option2"
  },
  "score": 2,
  "timeTaken": 5.5
}
```

Replace:
- `YOUR_QUIZ_ID` - Get this from `/api/quizzes` endpoint
- `YOUR_USER_ID` - Get this from `/api/users` endpoint or from localStorage after user login
- `QUESTION_ID_1`, `QUESTION_ID_2` - Get these from the quiz questions

---

## Method 3: Check Database Directly

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select the `quiz_app` database
4. Open the `quizresults` collection
5. You should see documents with:
   - `userId` (ObjectId reference)
   - `quizId` (ObjectId reference)
   - `score` (number)
   - `answers` (object)
   - `timeTaken` (number)
   - `timestamp` (date)

### Using MongoDB Shell:
```bash
# Connect to MongoDB
mongosh

# Use the database
use quiz_app

# View all quiz results
db.quizresults.find().pretty()

# Count total results
db.quizresults.countDocuments()
```

---

## Method 4: Check Backend Logs

When you submit a quiz, check your backend terminal. You should see:
```
Received quiz submission: { quizId: '...', userId: '...', answers: {...}, score: X, timeTaken: Y }
Quiz result saved successfully: [ObjectId]
```

When you fetch reports, you should see:
```
Fetched X quiz results
```

---

## Troubleshooting

### If Reports Page Shows "No quiz results available":
1. ✅ Check if any quizzes have been submitted
2. ✅ Verify backend is running and connected to MongoDB
3. ✅ Check browser console (F12) for errors
4. ✅ Verify the API endpoint: `http://localhost:4000/api/quiz-results`
5. ✅ Check backend logs for errors

### If Quiz Submission Fails:
1. ✅ Verify user is logged in (check localStorage for `userId`)
2. ✅ Check backend logs for error messages
3. ✅ Verify quizId and userId are valid ObjectIds
4. ✅ Check network tab in browser DevTools (F12) for API errors

### If Reports Don't Show User/Quiz Names:
1. ✅ Verify User and Quiz documents exist in database
2. ✅ Check that userId and quizId references are correct
3. ✅ Verify populate() is working in the backend route

---

## Quick Test Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] User frontend is running
- [ ] Admin frontend is running
- [ ] User is logged in (userId in localStorage)
- [ ] Quiz exists and has questions
- [ ] Quiz submitted successfully
- [ ] Results appear in Reports page
- [ ] Results show correct user name
- [ ] Results show correct quiz name
- [ ] Results show correct score
- [ ] Results show timestamp

---

## Expected Results

When everything works, the Reports page should show:
- **User**: Name or email of the user who took the quiz
- **Quiz**: Name of the quiz
- **Score**: X / Y (e.g., "3 / 5")
- **Percentage**: Calculated percentage (e.g., "60.0%")
- **Time Taken**: Minutes taken to complete (e.g., "5.5 minutes")
- **Date**: When the quiz was submitted

