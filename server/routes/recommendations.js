const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model priority list — tries each in order until one succeeds
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Build a stable hash from the user's career-relevant profile fields.
 * Any change to skills, interests, department, year, or preferredRole
 * will produce a different hash → triggers regeneration.
 */
const buildProfileHash = (user) => {
  const key = JSON.stringify({
    skills: [...(user.skills || [])].sort(),
    interests: [...(user.interests || [])].sort(),
    department: user.department || '',
    year: user.year || '',
    preferredRole: user.preferredRole || '',
  });
  return crypto.createHash('md5').update(key).digest('hex');
};

/**
 * Call Gemini with automatic model fallback.
 */
const callGemini = async (prompt) => {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`Gemini success with model: ${modelName}`);
      return text;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`Gemini model ${modelName} failed: ${msg.slice(0, 150)}`);
      lastError = err;
      // Try next model on any error (quota, model not found, etc.)
      continue;
    }
  }
  throw lastError;
};

/**
 * Use Gemini to generate personalized career recommendations
 * based on the user's actual profile data.
 */
const generateRecommendations = async (user) => {
  const hasSkills = user.skills?.length > 0;
  const hasInterests = user.interests?.length > 0;

  const profileSummary = [
    `Name: ${user.name}`,
    `Department: ${user.department || 'Not specified'}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${hasSkills ? user.skills.join(', ') : 'None listed'}`,
    `Interests: ${hasInterests ? user.interests.join(', ') : 'None listed'}`,
    `Preferred Role: ${user.preferredRole || 'Not specified'}`,
  ].join('\n');

  const prompt = `You are an expert AI career guidance counselor. Analyze this student profile carefully and generate HIGHLY PERSONALIZED career recommendations that are UNIQUE to this specific student.

STUDENT PROFILE:
${profileSummary}

CRITICAL INSTRUCTIONS:
- Every recommendation MUST directly reference the student's actual skills (${hasSkills ? user.skills.join(', ') : 'none yet'})
- Every recommendation MUST align with their interests (${hasInterests ? user.interests.join(', ') : 'none yet'})
- Career paths MUST match their preferred role: "${user.preferredRole || 'not specified'}"
- Skill gaps MUST be skills they are MISSING relative to their preferred role — do NOT list skills they already have
- Interview questions MUST be relevant to their specific target career
- Scholarships MUST be real, well-known scholarships relevant to their field of study and career goals
- If the student has no skills/interests yet, recommend foundational paths for their department

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation. Just the JSON:
{
  "careerPaths": [
    {"title": "string", "description": "string", "matchScore": number}
  ],
  "roadmap": [
    {"phase": "string", "duration": "string", "skills": ["string"], "resources": ["string"]}
  ],
  "projects": [
    {"title": "string", "description": "string", "difficulty": "Beginner|Intermediate|Advanced", "skills": ["string"]}
  ],
  "skillGaps": [
    {"skill": "string", "importance": "High|Medium|Low", "resources": ["string"]}
  ],
  "interviewQuestions": [
    {"question": "string", "category": "string", "difficulty": "Beginner|Intermediate|Advanced", "answer": "string"}
  ],
  "scholarships": [
    {"name": "string", "provider": "string", "description": "string", "amount": "string", "eligibility": "string", "deadline": "string", "link": "string", "matchReason": "string"}
  ],
  "salaryInsights": {"entryLevel": number, "midLevel": number, "senior": number}
}

REQUIREMENTS:
- 4-6 careerPaths sorted by matchScore descending (60-98 range)
- Exactly 3 roadmap phases (Foundation, Intermediate, Advanced) — each phase builds on the previous
- 3 projects of increasing difficulty using the student's actual skills
- 4-5 skillGaps — ONLY skills the student does NOT already have but needs for their preferred role
- 5-6 interview questions specific to their target career field WITH DETAILED, UNIQUE ANSWERS for each question
- 4-6 scholarships relevant to the student's department, interests, and career goals — use real scholarship names (e.g. Google Scholarship, Microsoft Scholarship, Fulbright, etc.). For each: name, provider, brief description, amount (e.g. "Up to $10,000"), eligibility criteria, typical deadline (e.g. "December 31"), application link (real URL if known, otherwise "#"), and why it matches this student
- Salary in USD realistic for the career paths generated`;

  try {
    const text = await callGemini(prompt);
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    console.log(`Generated ${parsed.careerPaths?.length} career paths for ${user.name} (${user.preferredRole || 'no role'})`);
    return parsed;
  } catch (error) {
    console.error('Gemini generation failed, using profile-aware fallback:', error.message);
    return buildFallbackRecommendations(user);
  }
};

/**
 * Profile-aware fallback when Gemini is unavailable.
 * Uses the user's actual data — never generic.
 */
const buildFallbackRecommendations = (user) => {
  const skills = user.skills || [];
  const interests = user.interests || [];
  const preferredRole = user.preferredRole || 'Software Developer';
  const dept = user.department || 'technology';

  // Determine skill gaps: common career skills minus what the user already has
  const allCareerSkills = ['System Design', 'Cloud Computing', 'DevOps', 'Data Structures & Algorithms',
    'Machine Learning', 'Docker', 'Kubernetes', 'SQL', 'REST APIs', 'TypeScript'];
  const userSkillsLower = skills.map((s) => s.toLowerCase());
  const gaps = allCareerSkills
    .filter((s) => !userSkillsLower.includes(s.toLowerCase()))
    .slice(0, 4);

  // Calculate dynamic match scores based on skill/interest alignment
  const calculateMatchScore = (role, relevantSkills, relevantInterests) => {
    let score = 60; // Base score
    const roleLower = role.toLowerCase();
    
    // Bonus for skill relevance
    relevantSkills.forEach(skill => {
      if (userSkillsLower.includes(skill.toLowerCase())) score += 5;
    });
    
    // Bonus for interest relevance
    const interestsLower = interests.map(i => i.toLowerCase());
    relevantInterests.forEach(interest => {
      if (interestsLower.includes(interest.toLowerCase())) score += 5;
    });
    
    // Bonus for department alignment
    if (dept.toLowerCase().includes(roleLower) || roleLower.includes(dept.toLowerCase())) score += 10;
    
    // Bonus for preferred role match
    if (roleLower === preferredRole.toLowerCase()) score += 15;
    
    return Math.min(score, 98); // Cap at 98
  };

  // Generate dynamic career paths based on user profile
  const generateCareerPaths = () => {
    const paths = [];
    
    // Primary path based on preferred role
    paths.push({
      title: preferredRole,
      description: `A career path aligned with your ${dept} background${skills.length > 0 ? ` and skills in ${skills.slice(0, 2).join(', ')}` : ''}. This role directly matches your stated preference.`,
      matchScore: calculateMatchScore(preferredRole, skills, interests),
    });
    
    // Secondary paths based on department and interests
    if (interests.length > 0) {
      interests.slice(0, 2).forEach((interest, idx) => {
        const role = `${interest} Developer`;
        paths.push({
          title: role,
          description: `Leverage your interest in ${interest} to build a focused career${skills.length > 0 ? ` using your skills in ${skills.slice(0, 2).join(', ')}` : ''}. Your ${dept} background provides a strong foundation.`,
          matchScore: calculateMatchScore(role, skills, [interest]),
        });
      });
    }
    
    // Add department-specific paths if we need more
    const deptRoles = {
      'computer science': ['Software Engineer', 'Data Scientist', 'Systems Analyst'],
      'information technology': ['IT Specialist', 'Network Administrator', 'Cybersecurity Analyst'],
      'engineering': ['Software Engineer', 'Systems Engineer', 'Technical Lead'],
      'business': ['Business Analyst', 'Product Manager', 'Technical Consultant'],
      'design': ['UX Designer', 'Product Designer', 'Design Engineer'],
      'medicine': ['Medical Doctor', 'Research Scientist', 'Healthcare Administrator'],
      'law': ['Lawyer', 'Legal Consultant', 'Corporate Counsel'],
      'education': ['Teacher', 'Education Consultant', 'Academic Researcher'],
      'arts': ['Creative Director', 'Art Director', 'Content Creator'],
      'science': ['Research Scientist', 'Lab Technician', 'Data Analyst'],
      'finance': ['Financial Analyst', 'Investment Banker', 'Risk Manager'],
      'marketing': ['Marketing Manager', 'Digital Marketing Specialist', 'Brand Manager'],
      'psychology': ['Clinical Psychologist', 'Counselor', 'HR Specialist'],
    };
    
    const deptLower = dept.toLowerCase();
    const matchingDept = Object.keys(deptRoles).find(key => deptLower.includes(key));
    
    if (matchingDept && paths.length < 3) {
      deptRoles[matchingDept].forEach(role => {
        if (!paths.find(p => p.title.toLowerCase() === role.toLowerCase())) {
          paths.push({
            title: role,
            description: `Apply your ${dept} expertise${skills.length > 0 ? ` and skills in ${skills.slice(0, 2).join(', ')}` : ''} to excel as a ${role}. This path leverages your academic background.`,
            matchScore: calculateMatchScore(role, skills, interests),
          });
        }
      });
    }
    
    // Sort by match score and return available paths (don't force generic tech roles)
    return paths.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  };

  return {
    careerPaths: generateCareerPaths(),
    roadmap: [
      {
        phase: 'Foundation (3 months)',
        duration: '3 months',
        skills: skills.length ? skills.slice(0, 3) : ['Programming Basics', 'Data Structures', 'Git'],
        resources: ['freeCodeCamp', 'Coursera', 'MDN Web Docs'],
      },
      {
        phase: 'Intermediate (3 months)',
        duration: '3 months',
        skills: skills.length > 3 ? skills.slice(3, 6) : ['System Design', 'Databases', 'REST APIs'],
        resources: ['Udemy', 'Pluralsight', 'LinkedIn Learning'],
      },
      {
        phase: 'Advanced (3 months)',
        duration: '3 months',
        skills: ['Cloud Services', 'CI/CD', 'Architecture Patterns'],
        resources: ['AWS Docs', 'Docker Docs', 'System Design Primer'],
      },
    ],
    projects: [
      {
        title: `${preferredRole} Portfolio Project`,
        description: `Build a portfolio project demonstrating your ${skills[0] || 'programming'} skills relevant to ${preferredRole}.`,
        difficulty: 'Beginner',
        skills: skills.slice(0, 2).length ? skills.slice(0, 2) : ['HTML', 'CSS', 'JavaScript'],
      },
      {
        title: `${interests[0] || 'Web'} Application`,
        description: `Build a full-featured application in the ${interests[0] || 'web'} domain with authentication and database integration.`,
        difficulty: 'Intermediate',
        skills: skills.slice(0, 3).length ? skills.slice(0, 3) : ['React', 'Node.js', 'MongoDB'],
      },
      {
        title: 'Production-Ready System',
        description: `Design and deploy a scalable system relevant to ${preferredRole} with proper DevOps practices.`,
        difficulty: 'Advanced',
        skills: ['Docker', 'CI/CD', 'Cloud Deployment'],
      },
    ],
    skillGaps: gaps.map((skill, i) => ({
      skill,
      importance: i < 2 ? 'High' : 'Medium',
      resources: [`${skill} Documentation`, `${skill} Course on Udemy`],
    })),
    interviewQuestions: [
      {
        question: `Describe a project where you used ${skills[0] || 'your primary skill'} to solve a real problem.`,
        category: 'Technical',
        difficulty: 'Intermediate',
        answer: `I worked on a project where I applied ${skills[0] || 'my technical skills'} to solve a critical business problem. The challenge was [specific problem]. I took the initiative to [action taken], which resulted in [measurable outcome]. This experience taught me the importance of [key learning].`,
      },
      {
        question: `What are the key responsibilities of a ${preferredRole}?`,
        category: 'Role Knowledge',
        difficulty: 'Beginner',
        answer: `As a ${preferredRole}, key responsibilities include: 1) Developing and maintaining applications using ${skills.join(', ') || 'relevant technologies'}, 2) Collaborating with team members to design solutions, 3) Writing clean, maintainable code, 4) Testing and debugging applications, and 5) Staying updated with industry best practices.`,
      },
      {
        question: `How would you design a scalable system for a ${interests[0] || 'web'} application?`,
        category: 'System Design',
        difficulty: 'Advanced',
        answer: `For a scalable system, I would: 1) Use microservices architecture, 2) Implement load balancing, 3) Use caching strategies (Redis/Memcached), 4) Implement database sharding, 5) Use message queues for asynchronous processing, and 6) Monitor performance with proper logging and metrics.`,
      },
      {
        question: 'Tell me about a time you had to learn a new technology quickly. How did you approach it?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        answer: `When I needed to learn ${skills[1] || 'a new technology'}, I took a structured approach: 1) Reviewed official documentation and tutorials, 2) Built small projects to practice, 3) Sought mentorship from experienced colleagues, and 4) Applied it to a real project. Within [timeframe], I became proficient and contributed meaningfully.`,
      },
      {
        question: `What trends in ${interests[0] || 'technology'} are you most excited about and why?`,
        category: 'Industry Knowledge',
        difficulty: 'Beginner',
        answer: `I'm excited about ${interests[0] || 'emerging trends'} because they align with my skills in ${skills.join(', ') || 'technical development'} and my passion for ${interests.join(', ') || 'innovation'}. I believe these trends will shape the future of ${dept}, and I want to be at the forefront of this change.`,
      },
      {
        question: 'How do you handle conflicts or disagreements with team members?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        answer: `I believe in open communication and collaboration. When disagreements arise, I: 1) Listen actively to understand their perspective, 2) Share my viewpoint respectfully with data/evidence, 3) Focus on the problem, not the person, 4) Look for common ground and compromise, and 5) Escalate to management if needed.`,
      },
    ],
    salaryInsights: { entryLevel: 55000, midLevel: 95000, senior: 145000 },
    scholarships: [
      {
        name: 'Google Generation Scholarship',
        provider: 'Google',
        description: 'Supports students in computer science and related fields who demonstrate academic excellence.',
        amount: 'Up to $10,000',
        eligibility: `Students studying ${dept} or related fields with strong academic record`,
        deadline: 'December 1',
        link: 'https://buildyourfuture.withgoogle.com/scholarships',
        matchReason: `Matches your ${dept} background and interest in ${interests[0] || 'technology'}`,
      },
      {
        name: 'Microsoft Scholarship Program',
        provider: 'Microsoft',
        description: 'Awarded to students pursuing degrees in computer science, engineering, or related technical fields.',
        amount: 'Up to $5,000',
        eligibility: 'Undergraduate students in STEM fields with demonstrated financial need',
        deadline: 'February 1',
        link: 'https://careers.microsoft.com/students',
        matchReason: `Supports students pursuing careers like ${preferredRole}`,
      },
      {
        name: 'Fulbright Foreign Student Program',
        provider: 'U.S. Department of State',
        description: 'Provides grants for graduate study, research, and teaching in the United States.',
        amount: 'Full funding',
        eligibility: 'International students with strong academic background',
        deadline: 'October 15',
        link: 'https://foreign.fulbrightonline.org',
        matchReason: 'Ideal for advancing your education in your field internationally',
      },
      {
        name: 'AWS Educate Scholarship',
        provider: 'Amazon Web Services',
        description: 'Supports students learning cloud computing and related technologies.',
        amount: 'Up to $3,000',
        eligibility: `Students interested in cloud computing and ${skills[0] || 'technology'}`,
        deadline: 'Rolling basis',
        link: 'https://aws.amazon.com/education/awseducate',
        matchReason: `Relevant to your skills in ${skills.slice(0, 2).join(', ') || 'technology'}`,
      },
    ],
  };
};

// ─── Helper: save recommendations to DB ──────────────────────────────────────

const saveRecommendations = async (userId, data, profileHash) => {
  // Explicitly set each field to ensure arrays are fully replaced, not merged
  return await Recommendation.findOneAndUpdate(
    { userId },
    {
      $set: {
        profileHash,
        careerPaths: data.careerPaths || [],
        roadmap: data.roadmap || [],
        projects: data.projects || [],
        skillGaps: data.skillGaps || [],
        interviewQuestions: data.interviewQuestions || [],
        scholarships: data.scholarships || [],
        salaryInsights: data.salaryInsights || {},
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/recommendations
// Returns cached recommendations UNLESS the user's profile has changed since last generation
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentHash = buildProfileHash(user);
    let recommendation = await Recommendation.findOne({ userId: req.userId });

    const needsRegeneration =
      !recommendation ||                          // no data at all
      !recommendation.profileHash ||              // old data without hash (pre-fix)
      recommendation.profileHash !== currentHash; // profile changed since last generation

    if (needsRegeneration) {
      console.log(`Profile changed or no data — regenerating for: ${user.name}`);
      const recommendations = await generateRecommendations(user);
      recommendation = await saveRecommendations(req.userId, recommendations, currentHash);
      console.log(`Saved ${recommendation.careerPaths?.length} career paths to DB for ${user.name}`);
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/recommendations/regenerate — force regenerate regardless of cache
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log(`Force regenerating for: ${user.name}`);
    const currentHash = buildProfileHash(user);
    const recommendations = await generateRecommendations(user);
    const recommendation = await saveRecommendations(req.userId, recommendations, currentHash);
    console.log(`Saved ${recommendation.careerPaths?.length} career paths to DB for ${user.name}`);

    res.json({ message: 'Recommendations regenerated successfully', recommendation });
  } catch (error) {
    console.error('Regenerate recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/recommendations/roadmap — generate role-specific roadmap using Gemini
router.post('/roadmap', auth, async (req, res) => {
  try {
    const { careerTitle } = req.body;
    if (!careerTitle) {
      return res.status(400).json({ message: 'Career title is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skills = user.skills || [];
    const interests = user.interests || [];
    const dept = user.department || 'technology';

    const profileSummary = [
      `Name: ${user.name}`,
      `Department: ${dept}`,
      `Year of Study: ${user.year || 'Not specified'}`,
      `Skills: ${skills.length > 0 ? skills.join(', ') : 'None listed'}`,
      `Interests: ${interests.length > 0 ? interests.join(', ') : 'None listed'}`,
      `Preferred Role: ${user.preferredRole || 'Not specified'}`,
    ].join('\n');

    const prompt = `You are an expert career counselor. Generate a DETAILED, ROLE-SPECIFIC career roadmap for the following career:

CAREER: ${careerTitle}

STUDENT PROFILE:
${profileSummary}

CRITICAL INSTRUCTIONS:
- The roadmap MUST be specific to "${careerTitle}" - not generic
- Each phase should build upon the previous one
- Include skills, resources, and projects relevant to ${careerTitle}
- Tailor the roadmap to the student's background: ${dept} department with skills in ${skills.join(', ') || 'various areas'}
- Make the roadmap realistic and achievable

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation. Just the JSON:
{
  "phases": [
    {
      "title": "string",
      "duration": "string",
      "description": "string",
      "skills": ["string"],
      "resources": ["string"],
      "projects": ["string"]
    }
  ]
}

REQUIREMENTS:
- 4-5 phases covering the complete career journey from beginner to expert
- Each phase should have 5-7 specific skills to learn
- Each phase should have 4-6 learning resources (courses, books, websites, etc.)
- Each phase should have 3-4 recommended projects
- Duration should be realistic (e.g., "3 months", "6 months", "1 year")
- The final phase should include specializations with specific skills`;

    try {
      const text = await callGemini(prompt);
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      console.log(`Generated roadmap for ${careerTitle}`);
      res.json(parsed);
    } catch (error) {
      console.error('Gemini roadmap generation failed, using fallback:', error.message);
      res.json(buildFallbackRoadmap(careerTitle, skills, interests, dept));
    }
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Fallback roadmap generator when Gemini is unavailable
 */
const buildFallbackRoadmap = (careerTitle, skills, interests, dept) => {
  // Role-specific skill/resource mappings for common career titles
  const roleData = {
    'software engineer': {
      foundation: { skills: ['HTML/CSS', 'JavaScript', 'Git & GitHub', 'Data Structures', 'Algorithms'], resources: ['freeCodeCamp', 'The Odin Project', 'CS50 by Harvard', 'LeetCode'], projects: ['Personal Portfolio Website', 'Todo App with CRUD', 'CLI Tool in Python/Node'] },
      intermediate: { skills: ['React/Vue/Angular', 'Node.js/Express', 'SQL & NoSQL Databases', 'REST APIs', 'Testing (Jest/Mocha)'], resources: ['Udemy - Full Stack Courses', 'Frontend Masters', 'MDN Web Docs', 'PostgreSQL Tutorial'], projects: ['Full-Stack Blog Platform', 'E-Commerce Store', 'Real-time Chat App'] },
      advanced: { skills: ['System Design', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Cloud (AWS/GCP/Azure)', 'Microservices'], resources: ['System Design Primer', 'AWS Certified Developer', 'Docker Documentation', 'Designing Data-Intensive Applications'], projects: ['Deploy Microservices on K8s', 'Build a CI/CD Pipeline', 'Scalable URL Shortener'] },
      mastery: { skills: ['Architecture Patterns', 'Performance Optimization', 'Security Best Practices', 'Technical Leadership'], resources: ['Staff Engineer by Will Larson', 'Martin Fowler Blog', 'OWASP Guidelines', 'Tech Conference Talks'], projects: ['Open Source Contribution', 'Tech Blog/Newsletter', 'Mentor Junior Developers'] },
    },
    'data scientist': {
      foundation: { skills: ['Python', 'Statistics & Probability', 'Pandas & NumPy', 'Data Visualization (Matplotlib)', 'SQL'], resources: ['Kaggle Learn', 'Khan Academy Statistics', 'Python for Data Science (Coursera)', 'DataCamp'], projects: ['Exploratory Data Analysis on Kaggle', 'COVID-19 Data Dashboard', 'SQL Database Queries Project'] },
      intermediate: { skills: ['Machine Learning (scikit-learn)', 'Feature Engineering', 'Deep Learning (TensorFlow/PyTorch)', 'NLP Basics', 'Big Data Tools (Spark)'], resources: ['Andrew Ng ML Course', 'Fast.ai', 'Hands-On ML by Géron', 'Kaggle Competitions'], projects: ['House Price Prediction Model', 'Sentiment Analysis App', 'Image Classification with CNN'] },
      advanced: { skills: ['MLOps', 'Model Deployment', 'A/B Testing', 'Advanced NLP (Transformers)', 'Time Series Analysis'], resources: ['MLOps Specialization (Coursera)', 'Hugging Face Docs', 'Causal Inference Course', 'Papers With Code'], projects: ['End-to-End ML Pipeline', 'Deploy Model as API', 'Recommendation Engine'] },
      mastery: { skills: ['Research & Publishing', 'AI Ethics', 'Strategic Data Leadership', 'Cross-functional Communication'], resources: ['ArXiv Papers', 'Data Science Conferences', 'Harvard Data Science Review', 'O\'Reilly Data Books'], projects: ['Publish Research Paper', 'Build Data Strategy for Org', 'Open Source ML Library'] },
    },
    'ux designer': {
      foundation: { skills: ['Design Thinking', 'User Research', 'Wireframing', 'Figma/Sketch', 'Typography & Color Theory'], resources: ['Google UX Design Certificate', 'Nielsen Norman Group', 'Figma Tutorials', 'Don\'t Make Me Think (Book)'], projects: ['Redesign a Mobile App', 'User Research Case Study', 'Wireframe a Landing Page'] },
      intermediate: { skills: ['Prototyping', 'Usability Testing', 'Interaction Design', 'Design Systems', 'Accessibility (WCAG)'], resources: ['Interaction Design Foundation', 'Material Design Guidelines', 'A11y Project', 'UX Design Institute'], projects: ['Create a Design System', 'Conduct Usability Tests', 'Interactive Prototype for SaaS'] },
      advanced: { skills: ['Motion Design', 'Advanced Prototyping', 'UX Strategy', 'Data-Driven Design', 'Cross-Platform Design'], resources: ['DesignBetter.co', 'Framer Academy', 'Measuring UX (Book)', 'UX Conferences (UXPA)'], projects: ['End-to-End Product Design', 'UX Audit for Enterprise App', 'Design for AR/VR'] },
      mastery: { skills: ['Design Leadership', 'Product Strategy', 'Team Management', 'Design Ops'], resources: ['Design Leadership Handbook', 'InVision Blog', 'DesignOps Summit', 'Design Management Institute'], projects: ['Lead Design for Product Launch', 'Establish DesignOps Process', 'Mentor Design Team'] },
    },
    'cybersecurity analyst': {
      foundation: { skills: ['Networking Fundamentals (TCP/IP)', 'Linux Administration', 'Security Concepts (CIA Triad)', 'Firewalls & VPNs', 'Ethical Hacking Basics'], resources: ['CompTIA Security+', 'TryHackMe', 'Cybrary', 'Professor Messer Videos'], projects: ['Set Up a Home Lab', 'Network Scanning with Nmap', 'Basic Penetration Test'] },
      intermediate: { skills: ['SIEM Tools (Splunk/ELK)', 'Incident Response', 'Vulnerability Assessment', 'Python for Security', 'Cloud Security'], resources: ['CEH Certification', 'SANS Courses', 'Hack The Box', 'Blue Team Labs'], projects: ['Build a SIEM Dashboard', 'CTF Competitions', 'Vulnerability Report for Web App'] },
      advanced: { skills: ['Threat Intelligence', 'Malware Analysis', 'Digital Forensics', 'Zero Trust Architecture', 'Compliance (NIST/ISO)'], resources: ['OSCP Certification', 'GIAC Certifications', 'MITRE ATT&CK Framework', 'Forensics Tools Training'], projects: ['Malware Reverse Engineering', 'Incident Response Playbook', 'Security Architecture Review'] },
      mastery: { skills: ['Security Strategy', 'Risk Management', 'Security Program Development', 'Executive Communication'], resources: ['CISSP Certification', 'RSA Conference', 'Security Leadership Courses', 'CISO Handbook'], projects: ['Develop Security Program', 'Red Team Exercise', 'Security Awareness Training'] },
    },
  };

  const titleLower = careerTitle.toLowerCase();
  const matchedRole = Object.keys(roleData).find(key => titleLower.includes(key) || key.includes(titleLower));
  const data = matchedRole ? roleData[matchedRole] : null;

  if (data) {
    return {
      phases: [
        { title: `Phase 1: ${careerTitle} Foundation`, duration: '3-6 months', description: `Build the core skills needed to begin your journey as a ${careerTitle}. Focus on fundamentals that every ${careerTitle} must know.`, skills: data.foundation.skills, resources: data.foundation.resources, projects: data.foundation.projects },
        { title: `Phase 2: Intermediate ${careerTitle} Skills`, duration: '6-12 months', description: `Deepen your expertise with industry-standard tools and practices used by ${careerTitle} professionals.`, skills: data.intermediate.skills, resources: data.intermediate.resources, projects: data.intermediate.projects },
        { title: `Phase 3: Advanced ${careerTitle} Expertise`, duration: '12-18 months', description: `Master advanced concepts and become a competitive ${careerTitle} candidate ready for senior-level challenges.`, skills: data.advanced.skills, resources: data.advanced.resources, projects: data.advanced.projects },
        { title: `Phase 4: ${careerTitle} Mastery & Leadership`, duration: 'Ongoing', description: `Establish yourself as a thought leader and expert ${careerTitle}. Focus on strategic impact and mentorship.`, skills: data.mastery.skills, resources: data.mastery.resources, projects: data.mastery.projects },
      ]
    };
  }

  // Generic but still career-specific fallback
  return {
    phases: [
      {
        title: `Phase 1: ${careerTitle} Foundation`,
        duration: '3-6 months',
        description: `Build foundational knowledge and core skills for a career as a ${careerTitle} in the ${dept} field.`,
        skills: skills.length > 0 ? [...skills.slice(0, 3), `${careerTitle} Fundamentals`, 'Industry Tools'] : [`${careerTitle} Fundamentals`, 'Core Concepts', 'Industry Tools', 'Professional Communication', 'Problem Solving'],
        resources: [`${careerTitle} Beginner Guides`, 'Coursera/Udemy Fundamentals', 'Industry Documentation', 'YouTube Tutorials', 'Community Forums'],
        projects: [`${careerTitle} Starter Project`, 'Skill-building Exercises', 'Industry Case Study']
      },
      {
        title: `Phase 2: Building ${careerTitle} Expertise`,
        duration: '6-12 months',
        description: `Develop intermediate skills and hands-on experience specific to ${careerTitle}.`,
        skills: skills.length > 3 ? skills.slice(3, 8) : [`Advanced ${careerTitle} Tools`, 'Industry Best Practices', 'Team Collaboration', 'Project Management', 'Technical Communication'],
        resources: ['Advanced Courses', 'Industry Workshops', 'Professional Mentorship', 'Networking Events'],
        projects: [`Intermediate ${careerTitle} Project`, 'Team Collaboration Project', 'Real-world Application']
      },
      {
        title: `Phase 3: Advanced ${careerTitle} Skills`,
        duration: '12-18 months',
        description: `Master advanced concepts and start specializing within the ${careerTitle} domain.`,
        skills: [`Advanced ${careerTitle} Techniques`, 'Specialization Skills', 'Leadership', 'Strategic Thinking', 'Innovation'],
        resources: ['Expert-led Courses', 'Industry Conferences', 'Research Papers', 'Advanced Certifications'],
        projects: [`Complex ${careerTitle} Project`, 'Cross-functional Initiative', 'Innovation Prototype']
      },
      {
        title: `Phase 4: ${careerTitle} Mastery & Leadership`,
        duration: 'Ongoing',
        description: `Become a recognized expert and leader in the ${careerTitle} field.`,
        skills: ['Expert-level Knowledge', 'Strategic Vision', 'Industry Leadership', 'Mentorship'],
        resources: ['Executive Programs', 'Industry Thought Leadership', 'Advanced Certifications', 'Continuous Learning'],
        projects: ['Lead Major Initiative', 'Mentor Others', 'Contribute to Industry Knowledge']
      }
    ]
  };
};

module.exports = router;
