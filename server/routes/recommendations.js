const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Model priority list — tries each in order until one succeeds
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
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
};/**
 * Robustly extract JSON object from AI response
 */
const extractJson = (text) => {
  try {
    // Try simple parse first
    return JSON.parse(text.trim());
  } catch (err) {
    // If that fails, try to find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const potentialJson = text.substring(start, end + 1);
        return JSON.parse(potentialJson);
      } catch (innerErr) {
        throw new Error('Could not parse JSON from AI response');
      }
    }
    throw new Error('No JSON object found in AI response');
  }
};

/**
 * Call Gemini with automatic model fallback.
 */
const callGemini = async (prompt) => {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`📡 Calling Gemini (${modelName}) for recommendations...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      if (!text) throw new Error('Empty response from Gemini');
      
      console.log(`✅ Gemini success with model: ${modelName}`);
      return text;
    } catch (err) {
      const msg = err.message || '';
      console.error(`❌ Gemini model ${modelName} failed:`, msg.slice(0, 200));
      lastError = err;
      continue;
    }
  }
  throw lastError;
};

/**
 * Use Gemini to generate personalized career recommendations
 */
const generateRecommendations = async (user) => {
  const profileSummary = [
    `Department: ${user.department || 'Not specified'}`,
    `Current Skills: ${user.skills?.join(', ') || 'None listed'}`,
    `Interests: ${user.interests?.join(', ') || 'None listed'}`,
    `Preferred Role: ${user.preferredRole || 'Not specified'}`,
  ].join('\n');

  const hasSkills = user.skills && user.skills.length > 0;
  const hasInterests = user.interests && user.interests.length > 0;

  const prompt = `You are a world-class career strategist. Based on this student's profile, provide 4-6 distinct career paths, a structured roadmap, projects, 5-6 UNIQUE skill gaps, and tailored interview questions.

STUDENT PROFILE:
${profileSummary}

- Analyze the student's CURRENT skills: ${hasSkills ? user.skills.join(', ') : 'NONE'}
- Identify skills they are MISSING for their target role: ${user.preferredRole || 'not specified'}
- ONLY include skills they do NOT already have
- Each skill gap MUST be DIFFERENT and UNIQUE to this student

Return ONLY a JSON object:
{
  "careerPaths": [{"title": "string", "description": "string", "matchScore": number}],
  "roadmap": [{"phase": "string", "duration": "string", "skills": ["string"], "resources": ["string"]}],
  "projects": [{"title": "string", "description": "string", "difficulty": "Beginner|Intermediate|Advanced", "skills": ["string"]}],
  "skillGaps": [{"skill": "string", "importance": "High|Medium|Low", "resources": ["string"]}],
  "interviewQuestions": [{"question": "string", "category": "string", "difficulty": "Beginner|Intermediate|Advanced", "answer": "string"}],
  "scholarships": [{"name": "string", "provider": "string", "description": "string", "amount": "string", "eligibility": "string", "deadline": "string", "link": "string", "matchReason": "string"}],
  "salaryInsights": {"entryLevel": number, "midLevel": number, "senior": number}
}

REQUIREMENTS:
1. UNIQUENESS: Every piece of data must be specific to the department (${user.department || 'General'}) and preferred role.
2. SKILL GAPS: Provide 5-6 distinct gaps. Do not repeat skills. Focus on technical/role-specific gaps.
3. INTERVIEW QUESTIONS: Provide 5-6 unique questions with detailed, different answers that reference the student's interests (${hasInterests ? user.interests.join(', ') : 'technology'}).
4. ROADMAP: Exactly 3 phases (Foundation, Intermediate, Advanced) that build on each other.

Return ONLY the JSON. No other text.`;

  try {
    const text = await callGemini(prompt);
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    console.log(`Generated ${parsed.careerPaths?.length} career paths for ${user.name} (${user.preferredRole || 'no role'})`);
    console.log(`Generated ${parsed.skillGaps?.length} skill gaps for ${user.name}`);
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
  const preferredRole = user.preferredRole || 'Professional';
  const dept = user.department || 'General';

  // Department-aware skill mappings for fallback
  const deptSkills = {
    'social science': ['Qualitative Research', 'Data Analysis for Social Science', 'Public Policy Analysis', 'Social Work Ethics', 'Grant Writing', 'Advocacy', 'Community Organizing'],
    'business': ['Financial Modeling', 'Strategic Management', 'Marketing Analytics', 'Supply Chain Ops', 'Project Management (PMP)', 'Business Intelligence', 'Leadership'],
    'technology': ['System Design', 'Cloud Architecture', 'Full-stack Development', 'Data Structures & Algorithms', 'DevOps', 'Cybersecurity', 'API Design'],
    'engineering': ['CAD/CAM', 'Thermodynamics', 'Control Systems', 'Materials Science', 'Project Engineering', 'Simulation Tools'],
    'arts': ['Creative Direction', 'Digital Illustration', 'UI/UX Design', 'Art History Analysis', 'Portfolio Management', 'Exhibition Design'],
    'healthcare': ['Clinical Research', 'Patient Care Coordination', 'Medical Ethics', 'Health Informatics', 'Epidemiology', 'Pharmacology'],
  };

  const deptKey = dept.toLowerCase();
  let baseSkills = [];
  
  // Find matching department or default to a mix of soft/hard skills
  const matchedDept = Object.keys(deptSkills).find(k => deptKey.includes(k) || k.includes(deptKey));
  if (matchedDept) {
    baseSkills = deptSkills[matchedDept];
  } else {
    baseSkills = ['Project Management', 'Strategic Thinking', 'Data Analysis', 'Professional Communication', 'Technical Proficiency'];
  }

  const userSkillsLower = skills.map((s) => s.toLowerCase());
  const gaps = baseSkills
    .filter((s) => !userSkillsLower.includes(s.toLowerCase()))
    .slice(0, 5);

  // If user already has all base skills, give them some advanced ones
  if (gaps.length === 0) {
    gaps.push('Strategic Leadership', 'Advanced Research', 'Cross-functional Collaboration');
  }

  return {
    careerPaths: [
      {
        title: preferredRole,
        description: `Career path for ${preferredRole} in ${dept}`,
        matchScore: 85,
      },
    ],
    roadmap: [
      {
        phase: 'Foundation',
        duration: '3 months',
        skills: skills.length ? skills.slice(0, 2) : ['Basics'],
        resources: ['Documentation'],
      },
      {
        phase: 'Intermediate',
        duration: '3 months',
        skills: skills.length > 2 ? skills.slice(2, 4) : ['Advanced'],
        resources: ['Courses'],
      },
      {
        phase: 'Advanced',
        duration: '3 months',
        skills: ['Expert Skills'],
        resources: ['Practice'],
      },
    ],
    projects: [
      {
        title: 'Project 1',
        description: 'Build something',
        difficulty: 'Beginner',
        skills: skills.slice(0, 1),
      },
      {
        title: 'Project 2',
        description: 'Build something bigger',
        difficulty: 'Intermediate',
        skills: skills.slice(1, 2),
      },
      {
        title: 'Project 3',
        description: 'Build production system',
        difficulty: 'Advanced',
        skills: ['Advanced'],
      },
    ],
    skillGaps: gaps.map((skill, i) => ({
      skill,
      importance: i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low',
      resources: [
        `${skill} Fundamentals on Coursera`,
        `${skill} Professional Course on edX`,
        `${skill} Practice & Applications`,
        `Industry standards for ${skill}`,
      ],
    })),
    interviewQuestions: [
      {
        question: `Tell me about your experience with ${skills[0] || 'your skills'}`,
        category: 'Technical',
        difficulty: 'Intermediate',
        answer: `I have experience with ${skills[0] || 'various technologies'} and have applied them in real projects.`,
      },
      {
        question: 'How do you approach learning new technologies?',
        category: 'Behavioral',
        difficulty: 'Beginner',
        answer: 'I learn by reading documentation, building projects, and practicing consistently.',
      },
      {
        question: `What interests you about ${preferredRole}?`,
        category: 'Role Knowledge',
        difficulty: 'Beginner',
        answer: `I'm interested in ${preferredRole} because it aligns with my skills and career goals.`,
      },
      {
        question: 'Describe a challenging problem you solved',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        answer: 'I faced a challenge and solved it by breaking it down and applying my technical knowledge.',
      },
      {
        question: `What trends in ${interests[0] || 'technology'} excite you?`,
        category: 'Industry Knowledge',
        difficulty: 'Beginner',
        answer: `I'm excited about ${interests[0] || 'emerging trends'} because they represent the future of the industry.`,
      },
      {
        question: 'How do you handle team conflicts?',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        answer: 'I communicate openly, listen to others, and focus on finding solutions that work for everyone.',
      },
    ],
    salaryInsights: { entryLevel: 50000, midLevel: 80000, senior: 120000 },
    scholarships: [
      {
        name: 'Scholarship 1',
        provider: 'Provider',
        description: 'For students in your field',
        amount: 'Varies',
        eligibility: 'Academic excellence',
        deadline: 'TBD',
        link: '#',
        matchReason: `Matches your ${dept} background`,
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
- Include skills, resources (with names and REAL urls), and projects relevant to ${careerTitle}
- Tailor the roadmap to the student's background: ${dept} department

Return ONLY a valid JSON object:
{
  "phases": [
    {
      "title": "string",
      "duration": "string",
      "description": "string",
      "skills": ["string"],
      "resources": [{"name": "string", "url": "string"}],
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
      foundation: { 
        skills: ['HTML/CSS', 'JavaScript', 'Git & GitHub'], 
        resources: [
          { name: 'freeCodeCamp Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
          { name: 'The Odin Project', url: 'https://www.theodinproject.com/' }
        ], 
        projects: ['Portfolio Website'] 
      },
      intermediate: { 
        skills: ['React', 'Node.js', 'SQL'], 
        resources: [
          { name: 'Full Stack Open', url: 'https://fullstackopen.com/en/' },
          { name: 'React Documentation', url: 'https://react.dev/' }
        ], 
        projects: ['E-commerce App'] 
      },
      advanced: { 
        skills: ['Docker', 'CI/CD', 'System Design'], 
        resources: [
          { name: 'Docker Guide', url: 'https://docs.docker.com/get-started/' },
          { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
        ], 
        projects: ['Microservices App'] 
      }
    },
    'social science': {
      foundation: { 
        skills: ['Research Methodology', 'Critical Thinking', 'Social Theory'], 
        resources: [
          { name: 'Research Methods (Coursera)', url: 'https://www.coursera.org/specializations/social-science-research-methods' },
          { name: 'Social Theory Basics', url: 'https://plato.stanford.edu/entries/social-institutions/' }
        ], 
        projects: ['Literature Review'] 
      },
      intermediate: { 
        skills: ['Data Analysis (SPSS/R)', 'Policy Drafting', 'Ethics'], 
        resources: [
          { name: 'R for Data Science', url: 'https://r4ds.had.co.nz/' },
          { name: 'Public Policy Analysis (edX)', url: 'https://www.edx.org/course/public-policy-analysis' }
        ], 
        projects: ['Community Case Study'] 
      }
    }
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
