# Setup Guide - AI-Powered Career Guidance

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Google Gemini API key
- Gmail account (for email verification)

---

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd -AI-Powered-Career-Guidance
```

### 2. Install Dependencies

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Server (.env)
Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpath-ai?retryWrites=true&w=majority&appName=cluster

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-12345

# Server Port
PORT=5000

# Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

#### Client (.env)
Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Add a database user with username and password
4. Whitelist IP address `0.0.0.0/0` (allows all IPs)
5. Copy the connection string and add to `.env`

**Note**: Special characters in passwords must be URL-encoded:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`

### 5. Google Gemini API Setup

1. Go to https://ai.google.dev/
2. Create a new API key
3. Enable the Generative AI API
4. Add the key to `.env` as `GEMINI_API_KEY`

### 6. Gmail Setup for Email Verification

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use this password in `.env` as `EMAIL_PASSWORD`

---

## Running the Application

### Development Mode

#### Terminal 1 - Start Server
```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

#### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

### Production Mode

#### Build Client
```bash
cd client
npm run build
```

#### Start Server
```bash
cd server
npm start
```

---

## API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
```

### Profile
```
GET /api/profile
PUT /api/profile
```

### Learning Paths
```
GET /api/learning-paths
POST /api/learning-paths/regenerate
```

### Internships
```
GET /api/internships
POST /api/internships/regenerate
```

### Recommendations
```
GET /api/recommendations
POST /api/recommendations/regenerate
```

### Chat
```
POST /api/chat/send
POST /api/chat/clear
```

---

## Features Overview

### 1. User Authentication
- Register with email verification
- OTP-based email confirmation
- Secure login with JWT tokens
- Password reset functionality

### 2. Profile Management
- Complete profile setup
- Skill management
- Interest tracking
- Career preference selection

### 3. Learning Paths
- AI-generated 3-phase learning roadmap
- Real learning resources with direct URLs
- Support for all departments
- Regenerate for new paths

### 4. Internship Opportunities
- Personalized internship recommendations
- Location-based filtering
- Difficulty level filtering
- Real company information

### 5. Skill Gap Analysis
- AI-identified skill gaps
- Priority levels
- Recommended resources

### 6. Interview Preparation
- AI-generated interview questions
- Category-based filtering
- Difficulty levels

### 7. Chat Assistant
- Real-time AI conversations
- Context-aware responses
- Career guidance

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify special characters are URL-encoded
- Try disconnecting VPN if issues persist

### Gemini API Quota Exceeded
- The free tier has daily limits
- Fallback data will be used when quota is exceeded
- Caching system reduces API calls
- Wait 24 hours for quota reset

### Email Verification Not Working
- Ensure Gmail app password is correct
- Check 2-factor authentication is enabled
- Verify email address in `.env`
- Check spam folder for verification email

### Port Already in Use
- Change port in `.env` or use different terminal
- Kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -i :5000
  kill -9 <PID>
  ```

---

## Performance Tips

1. **Enable Caching**
   - Caching is enabled by default
   - 5-minute TTL for API responses
   - Reduces Gemini API calls

2. **Use Fallback Data**
   - Fallback data is provided when API fails
   - Ensures app continues to work
   - User experience not affected

3. **Optimize Database**
   - Create indexes for frequently queried fields
   - Monitor MongoDB Atlas metrics
   - Use connection pooling

4. **Frontend Optimization**
   - Use Vite for fast builds
   - Lazy load components
   - Optimize images

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` for reference
   - Rotate API keys regularly

2. **Database Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Use MongoDB Atlas encryption

3. **API Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all inputs
   - Use CORS properly

4. **Authentication**
   - Use strong JWT secrets
   - Implement token expiration
   - Use secure password hashing

---

## Deployment

### Heroku Deployment

1. Create Heroku account
2. Install Heroku CLI
3. Create app: `heroku create app-name`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`

### Vercel Deployment (Frontend)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### AWS Deployment

1. Use EC2 for server
2. Use S3 for static files
3. Use RDS for database (or MongoDB Atlas)
4. Use CloudFront for CDN

---

## Support & Documentation

- **API Documentation**: See `FEATURES_IMPLEMENTED.md`
- **Code Structure**: See `README.md`
- **Issues**: Check GitHub issues
- **Contact**: Support email

---

**Last Updated**: May 16, 2026
