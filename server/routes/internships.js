const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
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

// Simple in-memory cache with TTL (5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCacheKey = (userId, type) => `${userId}:${type}`;
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✓ Cache hit for: ${key}`);
    return cached.data;
  }
  if (cached) cache.delete(key);
  return null;
};
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Robustly extract JSON object from AI response
 */
const extractJson = (text) => {
  try {
    return JSON.parse(text.trim());
  } catch (err) {
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

const invalidateCache = (userId) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      cache.delete(key);
    }
  }
};

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

const callGemini = async (prompt, cacheKey = null, bypassCache = false) => {
  // Check cache first
  if (cacheKey && !bypassCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`📡 Calling Gemini (${modelName}) for internships...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings 
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      if (!text) throw new Error('Empty response from Gemini');
      
      console.log(`✅ Gemini success with model: ${modelName}`);
      
      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, text);
      }
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
 * Generate personalized internship opportunities using Gemini
 */
const generateInternships = async (user, bypassCache = false) => {
  const dept = user.department || 'Not specified';
  const role = user.preferredRole || 'Not specified';
  const skills = user.skills?.length > 0 ? user.skills.join(', ') : 'Not specified';
  const interests = user.interests?.length > 0 ? user.interests.join(', ') : 'Not specified';
  const country = user.country || 'Ethiopia';

  const profileSummary = [
    `Name: ${user.name}`,
    `Country: ${country}`,
    `Department: ${dept}`,
    `Year of Study: ${user.year || 'Not specified'}`,
    `Skills: ${skills}`,
    `Interests: ${interests}`,
    `Preferred Role: ${role}`,
  ].join('\n');

  const prompt = `You are a world-class career advisor specializing in internships. Suggest 8-10 REAL, UNIQUE internship opportunities for a student with the following profile. Each opportunity MUST be DIFFERENT from the others.

STUDENT PROFILE:
${profileSummary}

CRITICAL REQUIREMENTS:
1. SKILL MATCHING: ONLY suggest internships that match their actual skills: ${skills}. Do NOT suggest roles requiring skills they don't have.
2. ROLE ALIGNMENT: Match opportunities strictly to their preferred role: "${role}".
3. COUNTRY FOCUS: Prioritize opportunities in ${country}. Include local companies, NGOs, and organizations based in ${country}.
4. REAL COMPANIES: Use ONLY well-known, legitimate, REAL companies that actually hire interns. Examples:
   - For Ethiopia: UN ECA, UNDP, World Bank, African Union, Ethiopian Airlines, CBE, Addis Ababa University, Save the Children, Plan International
   - For Global: UNICEF, UN, Save the Children, ICRC, Google, Microsoft, McKinsey, Deloitte, World Bank, IMF
5. VALID URLs: Provide ONLY the main careers/jobs page URL. Examples:
   - https://www.unicef.org/careers/job-openings
   - https://careers.google.com/jobs/results/
   - https://www.worldbank.org/en/about/careers/job-openings
   - https://careers.un.org/
   Do NOT make up URLs. Use only official main career portals.
6. UNIQUENESS: Each internship MUST be DIFFERENT - different companies, different roles, different locations. NO DUPLICATES.
7. REALISTIC DETAILS: Include realistic responsibilities, actual required skills, and genuine difficulty levels.

Return ONLY a valid JSON object with this exact structure:
{
  "internships": [
    {
      "company": "Real Company Name",
      "position": "Specific Job Title",
      "department": "Team/Department Name",
      "location": "City, Country or Remote",
      "duration": "Duration (e.g. 3-6 months)",
      "responsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3"],
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "whyGoodFit": "Specific reason why this matches their profile and skills",
      "stipend": "Salary/Stipend info or 'Unpaid' or 'Competitive'",
      "difficulty": "Easy|Medium|Hard",
      "applyUrl": "OFFICIAL_MAIN_CAREERS_PAGE_URL"
    }
  ]
}

IMPORTANT:
- Return ONLY JSON, no markdown, no code blocks
- Ensure all 8-10 internships are REAL and DIFFERENT
- Match to their ACTUAL skills, not generic skills
- Prioritize ${country} opportunities
- Include mix of local and international opportunities
- URLs MUST be valid main career portals, not specific job pages`;

  try {
    const profileString = [
      user.department || '',
      user.preferredRole || '',
      user.country || '',
      (user.skills || []).join(','),
      (user.interests || []).join(',')
    ].join('|');
    const cacheKey = `${user._id}:internships:${profileString}`;
    const text = await callGemini(prompt, cacheKey, bypassCache);
    const parsed = extractJson(text);
    console.log(`✅ Generated ${parsed.internships?.length || 0} internship opportunities for ${user.name} in ${country}`);
    return parsed;
  } catch (error) {
    console.error('Gemini generation failed:', error.message);
    return buildFallbackInternships(user);
  }
};

/**
 * Fallback internships when Gemini fails
 * Uses user's actual data, not generic templates
 */
const buildFallbackInternships = (user) => {
  const dept = (user.department || 'General').toLowerCase();
  const role = user.preferredRole || 'Professional';
  const country = user.country || 'Ethiopia';
  const skills = user.skills || [];

  // Ethiopia-specific internship opportunities with VERIFIED URLs
  const ethiopiaOpportunities = [
    { company: 'UN Economic Commission for Africa (ECA)', position: 'Policy Research Intern', link: 'https://www.uneca.org/careers' },
    { company: 'UNDP Ethiopia', position: 'Development Program Intern', link: 'https://www.undp.org/careers' },
    { company: 'World Bank', position: 'Project Support Intern', link: 'https://www.worldbank.org/en/about/careers/job-openings' },
    { company: 'African Union', position: 'Administrative Intern', link: 'https://au.int/en/careers' },
    { company: 'Save the Children', position: 'Program Intern', link: 'https://www.savethechildren.net/careers' },
    { company: 'Plan International', position: 'Community Development Intern', link: 'https://www.planinternational.org/careers' },
    { company: 'Ethiopian Airlines', position: 'Operations Intern', link: 'https://www.ethiopianairlines.com/en/careers' },
    { company: 'Commercial Bank of Ethiopia', position: 'Finance Intern', link: 'https://www.cbe.com.et/' },
    { company: 'Addis Ababa University', position: 'Research Intern', link: 'https://www.aau.edu.et/' },
    { company: 'Addis Ababa Science and Technology University', position: 'Technology Intern', link: 'https://www.aastu.edu.et/' }
  ];

  // Global opportunities with VERIFIED URLs
  const globalOpportunities = [
    { company: 'UNICEF', position: 'Program Support Intern', link: 'https://www.unicef.org/careers/job-openings' },
    { company: 'United Nations', position: 'Administrative Intern', link: 'https://careers.un.org/' },
    { company: 'Google', position: 'Software Engineering Intern', link: 'https://careers.google.com/jobs/results/' },
    { company: 'Microsoft', position: 'Cloud Solutions Intern', link: 'https://careers.microsoft.com/us/en/job-openings' },
    { company: 'McKinsey & Company', position: 'Business Analyst Intern', link: 'https://www.mckinsey.com/careers/search-jobs' },
    { company: 'Deloitte', position: 'Consulting Intern', link: 'https://www2.deloitte.com/us/en/careers/search-jobs.html' },
    { company: 'World Bank', position: 'Development Intern', link: 'https://www.worldbank.org/en/about/careers/job-openings' },
    { company: 'International Monetary Fund', position: 'Economics Intern', link: 'https://www.imf.org/external/np/hr/index.aspx' }
  ];

  // Determine which opportunities to prioritize
  const isPriorityEthiopia = country.toLowerCase().includes('ethiopia') || country.toLowerCase().includes('eth');
  const baseOpportunities = isPriorityEthiopia 
    ? [...ethiopiaOpportunities.slice(0, 6), ...globalOpportunities.slice(0, 4)]
    : [...globalOpportunities.slice(0, 6), ...ethiopiaOpportunities.slice(0, 4)];

  const getRequiredSkillsForRole = (posStr) => {
    const pos = posStr.toLowerCase();
    if (pos.includes('software engineering')) return ['JavaScript', 'React', 'Git', 'Data Structures'];
    if (pos.includes('cloud solutions')) return ['Azure / AWS', 'Networking', 'Security Fundamentals', 'Linux'];
    if (pos.includes('technology intern')) return ['HTML/CSS', 'Python', 'Basic Databases', 'SQL'];
    if (pos.includes('policy research')) return ['Policy Analysis', 'Research Methods', 'Academic Writing', 'Literature Review'];
    if (pos.includes('development program') || pos.includes('development intern')) return ['Program Design', 'M&E Concepts', 'Social Development', 'Report Design'];
    if (pos.includes('project support')) return ['Trello/Asana', 'Meeting Coordination', 'Documentation', 'Scheduling'];
    if (pos.includes('administrative')) return ['Data Entry', 'Microsoft Excel', 'Communication', 'Office Management'];
    if (pos.includes('community development')) return ['Fieldwork', 'Public Relations', 'Intercultural Skills', 'Social Work'];
    if (pos.includes('operations intern')) return ['Logistics Coordination', 'Workflow Analysis', 'Supply Chain', 'Troubleshooting'];
    if (pos.includes('finance intern')) return ['Financial Spreadsheet modeling', 'Basic Accounting', 'Data Auditing', 'QuickBooks'];
    if (pos.includes('research intern')) return ['Data Collection', 'Qualitative Research', 'SPSS / Excel', 'Report Synthesis'];
    if (pos.includes('program support')) return ['Event Management', 'Data Organization', 'Technical Writing', 'Teamwork'];
    if (pos.includes('business analyst')) return ['Business Analytics', 'Data Visualisation', 'Presenting', 'SQL queries'];
    if (pos.includes('consulting intern')) return ['Problem Solving', 'Case Analysis', 'Slide Preparation', 'Communication'];
    if (pos.includes('economics intern')) return ['Macroeconomic Theory', 'Excel analysis', 'Data Wrangling', 'Econometrics'];
    return ['Problem Solving', 'Communication', 'Teamwork', 'Critical Thinking'];
  };

  return {
    internships: baseOpportunities.map((op, i) => ({
      company: op.company,
      position: op.position,
      department: user.department || 'Professional Services',
      location: i < 5 ? (isPriorityEthiopia ? 'Addis Ababa, Ethiopia' : 'Remote / Global') : 'Remote / Global',
      duration: '3-6 months',
      responsibilities: [
        `Support the ${op.company} team in ${op.position} tasks`,
        `Work on projects related to ${user.preferredRole || 'your field'}`,
        'Collaborate with experienced professionals',
        'Gain practical experience in your career field'
      ],
      requiredSkills: getRequiredSkillsForRole(op.position),
      whyGoodFit: `Perfect match for your ${user.department || 'field'} background and ${user.preferredRole || 'career goals'}. Located in ${isPriorityEthiopia ? 'Ethiopia' : 'global markets'}.`,
      stipend: i === 0 ? 'Competitive' : i === 1 ? 'Partial' : 'Varies',
      difficulty: i < 2 ? 'Hard' : i < 5 ? 'Medium' : 'Easy',
      applyUrl: op.link
    }))
  };
};

/**
 * GET /api/internships
 * Fetch personalized internship opportunities
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const internships = await generateInternships(user);
    res.json(internships);
  } catch (error) {
    console.error('Internships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/internships/regenerate
 * Force regenerate internship opportunities
 */
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Force regenerating internship opportunities for: ${user.name} (${user.department})`);
    invalidateCache(req.userId);
    const internships = await generateInternships(user, true); // true bypasses cache
    res.json({ message: 'Internship opportunities regenerated', ...internships });
  } catch (error) {
    console.error('Regenerate internships error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
