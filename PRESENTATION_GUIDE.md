# AI-Powered Career Guidance Platform - Presentation Guide

## System Overview

### Architecture
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API

---

## Pre-Presentation Checklist (Before 2:00 PM)

### 1. Start the Application
```bash
npm run dev
```
This starts both server and client automatically.

### 2. Verify MongoDB Connection
- Check server logs for: `✓ MongoDB connected successfully`
- If not connected, ensure VPN is OFF

### 3. Pre-load Gemini Data (Cache it)
To ensure Gemini data is cached and ready:

1. **Login** to the app
2. **Go to Profile** and add:
   - Skills (e.g., Python, JavaScript, Data Analysis)
   - Interests (e.g., AI, Web Development)
   - Department (e.g., Computer Science)
   - Preferred Role (e.g., Software Engineer)
3. **Visit each page** to trigger Gemini API calls:
   - Dashboard → Learning Paths
   - Skill Gap Analysis
   - Scholarships
   - Internships
   - Interview Prep
   - Chat (send a message)

This caches all Gemini responses in MongoDB for your presentation.

---

## System Features

### 1. Authentication
- **Register**: Create new account with email
- **Login**: OTP verification via email
- **Profile**: Store skills, interests, department, preferred role

### 2. Dashboard
- Shows personalized career recommendations
- Displays learning paths
- Shows skill gaps
- Displays scholarships and internships

### 3. Learning Paths
- AI-generated roadmap for target career
- 3 phases: Foundation, Intermediate, Advanced
- Includes skills, resources, and projects

### 4. Skill Gap Analysis
- Identifies missing skills for target role
- Prioritized by importance (High/Medium/Low)
- Provides learning resources

### 5. Scholarships
- Personalized scholarship recommendations
- Based on department and interests
- Includes eligibility and deadlines

### 6. Internships
- Personalized internship opportunities
- Filtered by skills and department
- Includes company info and application links

### 7. Interview Prep
- AI-generated interview questions
- Categorized by difficulty
- Includes suggested answers

### 8. Chat
- Real-time AI assistant
- Context-aware responses
- Supports career, learning, and interview contexts

---

## Data Storage

### MongoDB Collections

#### 1. Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  skills: [String],
  interests: [String],
  department: String,
  year: String,
  preferredRole: String,
  createdAt: Date
}
```

#### 2. Recommendations
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  profileHash: String, // Detects profile changes
  careerPaths: [
    { title, description, matchScore }
  ],
  roadmap: [
    { phase, duration, skills, resources }
  ],
  projects: [
    { title, description, difficulty, skills }
  ],
  skillGaps: [
    { skill, importance, resources }
  ],
  interviewQuestions: [
    { question, category, difficulty, answer }
  ],
  scholarships: [
    { name, provider, description, amount, eligibility, deadline, link, matchReason }
  ],
  salaryInsights: { entryLevel, midLevel, senior },
  updatedAt: Date
}
```

#### 3. OTP Verification
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  expiresAt: Date
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login with email
- `POST /api/auth/verify-otp` - Verify OTP

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Recommendations
- `GET /api/recommendations` - Get all recommendations (cached)
- `POST /api/recommendations/regenerate` - Force regenerate
- `POST /api/recommendations/roadmap` - Get role-specific roadmap

### Internships
- `GET /api/internships` - Get internship opportunities
- `POST /api/internships/regenerate` - Force regenerate

### Learning Paths
- `GET /api/learning-paths` - Get learning paths

### Chat
- `POST /api/chat/send` - Send message to AI
- `POST /api/chat/clear` - Clear chat history

### Health
- `GET /api/health` - Check server status

---

## Presentation Flow

### Demo Scenario
1. **Show Login/Register** - Demonstrate authentication
2. **Complete Profile** - Add skills, interests, department, role
3. **Show Dashboard** - Display personalized recommendations
4. **Show Learning Paths** - Explain career roadmap
5. **Show Skill Gaps** - Highlight missing skills
6. **Show Scholarships** - Display opportunities
7. **Show Internships** - Show job opportunities
8. **Show Interview Prep** - Demonstrate practice questions
9. **Show Chat** - Ask AI a career question

---

## Troubleshooting

### MongoDB Connection Issues
- **Error**: "Could not connect to any servers"
- **Solution**: Turn OFF VPN, ensure IP is whitelisted (0.0.0.0/0)

### Gemini API Quota Exceeded
- **Error**: "429 Too Many Requests"
- **Solution**: Wait for quota reset (daily at UTC midnight) or upgrade API plan

### Gemini Model Not Found
- **Error**: "404 Not Found - models/gemini-2.0-flash"
- **Solution**: Models are available, fallback data will display

### Port Already in Use
- **Error**: "EADDRINUSE: address already in use :::5000"
- **Solution**: Kill process: `lsof -ti:5000 | xargs kill -9`

---

## Performance Tips

1. **Cache Gemini Data**: Visit all pages before presentation to cache responses
2. **Use Fallback Data**: If Gemini fails, personalized fallback displays
3. **Test with Multiple Users**: Create test accounts to show different recommendations
4. **Clear Browser Cache**: If seeing old data, clear cache and reload

---

## Key Features to Highlight

✅ **AI-Powered Personalization** - All data tailored to user profile
✅ **Real-time Recommendations** - Gemini generates unique suggestions
✅ **Comprehensive Career Guidance** - Learning paths, skill gaps, scholarships, internships
✅ **Interview Preparation** - AI-generated questions with answers
✅ **Responsive Design** - Works on desktop and mobile
✅ **Secure Authentication** - OTP verification
✅ **Scalable Architecture** - MongoDB + Node.js + React

---

## Timeline

- **Before 2:00 PM**: Start app, pre-load Gemini data
- **2:00 PM**: Begin presentation
- **Demo**: Show all features with cached data
- **Q&A**: Answer questions about architecture and features

---

## Contact & Support

For issues during presentation:
1. Check MongoDB connection
2. Verify Gemini API key in .env
3. Restart server if needed
4. Use fallback data as backup

Good luck with your presentation! 🎓
