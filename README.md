# CareerPath AI - AI-Powered Career Guidance System

<div align="center">

![CareerPath AI](https://img.shields.io/badge/CareerPath-AI-pink?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**An intelligent career guidance platform powered by AI to help students discover their perfect career path, master in-demand skills, and land their dream jobs.**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [Project Structure](#project-structure)

</div>

---

## 🎯 Overview

CareerPath AI is an AI-powered career guidance system that helps students:
- Identify suitable career paths based on their profile, interests, and skills
- Generate personalized learning roadmaps
- Find internship and project opportunities
- Analyze skill gaps and get improvement suggestions
- Practice interview questions and get salary insights

## ✨ Features

### 🔐 Authentication System
- User registration with email, phone, and password
- OTP verification for enhanced security
- JWT-based authentication
- Secure session management

### 👤 User Profile Management
- Comprehensive profile setup with skills and interests
- Department and year information
- Preferred role selection
- Bio and personal information
- Easy profile editing and updates

### 🤖 AI-Powered Recommendations
- Personalized career path suggestions
- Match scoring based on user profile
- Multiple career options with detailed descriptions
- Salary insights for each career path
- Required skills for each career

### 📚 Learning Path Generator
- Structured learning roadmaps
- Skill progression tracking
- Resource recommendations
- Multiple difficulty levels
- Progress monitoring

### 📊 Skill Gap Analysis
- Current vs. required skill comparison
- Visual progress indicators
- Recommended resources for skill improvement
- Priority-based learning suggestions

### 🎤 Interview Preparation
- Real interview questions by category
- Difficulty levels (Easy, Medium, Hard)
- Answer explanations
- Practice tracking

### 📈 Dashboard Analytics
- Career progress visualization
- Skills distribution charts
- Recent activity tracking
- Performance metrics

## 🛠️ Tech Stack

### Frontend
- **React.js** 18.2.0 - UI library
- **React Router** 6.8.0 - Client-side routing
- **Tailwind CSS** 3.2.4 - Utility-first CSS framework
- **Recharts** 2.5.0 - Data visualization
- **React Icons** 4.7.1 - Icon library
- **Axios** 1.3.0 - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **OpenAI/Gemini API** - AI recommendations

### Development Tools
- **React Scripts** 5.0.1 - Build tool
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)
- API keys for OpenAI or Gemini

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
EOF

# Start server
npm start
```

The backend will run on `http://localhost:5000`

## 🚀 Usage

### For Users

1. **Sign Up**: Create an account with email, phone, and password
2. **Complete Profile**: Add your skills, interests, and preferences
3. **Get Recommendations**: Receive AI-powered career suggestions
4. **Follow Learning Path**: Access structured learning roadmaps
5. **Practice Interviews**: Prepare with real interview questions
6. **Track Progress**: Monitor your career development

### For Developers

```bash
# Development mode
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## 📁 Project Structure

```
careerpath-ai/
├── client/                          # Frontend React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # Navigation header
│   │   │   ├── Sidebar.js          # Sidebar navigation
│   │   │   ├── Footer.js           # Footer component
│   │   │   └── PrivateRoute.js     # Protected routes
│   │   ├── pages/
│   │   │   ├── Home.js             # Landing page
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   ├── Profile.js          # User profile
│   │   │   └── Recommendations.js  # Career recommendations
│   │   ├── App.js                  # Main app component
│   │   ├── index.js                # Entry point
│   │   └── index.css               # Global styles
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── package.json
│
├── server/                          # Backend Node.js application
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Recommendation.js       # Recommendation schema
│   ├── routes/
│   │   ├── auth.js                 # Auth routes
│   │   ├── profile.js              # Profile routes
│   │   └── recommendations.js      # Recommendation routes
│   ├── index.js                    # Server entry point
│   └── package.json
│
└── README.md                        # This file
```

## 🎨 UI/UX Features

### Modern Design
- Gradient backgrounds and smooth transitions
- Responsive layout for all devices
- Smooth animations and hover effects
- Clean card-based interface

### Color Scheme
- Primary: Pink (#ec4899) to Purple (#a855f7)
- Secondary: Blue (#3b82f6) to Cyan (#06b6d4)
- Neutral: Gray scale for text and backgrounds

### Components
- Interactive charts and graphs
- Progress bars and skill indicators
- Card-based layouts
- Modal dialogs
- Toast notifications

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  skills: [String],
  interests: [String],
  department: String,
  year: String,
  preferredRole: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Recommendations Collection
```javascript
{
  userId: ObjectId,
  careerPaths: [
    {
      title: String,
      match: Number,
      description: String,
      salary: String,
      skills: [String]
    }
  ],
  roadmap: [
    {
      title: String,
      duration: String,
      skills: [String]
    }
  ],
  projects: [String],
  skillGaps: [
    {
      skill: String,
      current: Number,
      required: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- JWT-based authentication
- OTP verification for registration
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Input validation and sanitization
- Secure session management

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop experience
- Touch-friendly interfaces
- Adaptive layouts

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
git push heroku main
```

## 📈 Performance Optimization

- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Minification and compression
- CDN integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**BrainWave Builders**
- AI/ML Integration
- Full Stack Development
- UI/UX Design

## 📞 Support

For support, email support@careerpath-ai.com or open an issue on GitHub.

## 🙏 Acknowledgments

- OpenAI/Gemini for AI capabilities
- React community for amazing tools
- Tailwind CSS for styling framework
- All contributors and users

---

<div align="center">

Made with ❤️ by BrainWave Builders

[⬆ back to top](#careerpath-ai---ai-powered-career-guidance-system)

</div>
