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
      console.log(`📡 Calling Gemini (${modelName}) for jobs...`);
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
 * Generate personalized jobs using Gemini
 */
const generateJobs = async (user, bypassCache = false) => {
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

  const prompt = `You are a world-class career advisor. Suggest 6-8 REAL, LEGITIMATE, and RELEVANT job openings for a professional/graduate with the following profile. Each job must be UNIQUE and DIFFERENT.

STUDENT/PROFESSIONAL PROFILE:
${profileSummary}

CRITICAL REQUIREMENTS:
1. SKILL ALIGNMENT: Suggest jobs that match their actual skills: ${skills} and preferred role: "${role}"
2. DEPARTMENT RELEVANCE: Ensure the jobs are directly relevant to their department/field: ${dept}
3. GEOGRAPHIC LOCATION: Prioritize opportunities in ${country} (especially Addis Ababa if Ethiopia) but include standard global/remote options too
4. REAL COMPANIES: Use well-known, legitimate, real companies (e.g., Safaricom Ethiopia, Ethio Telecom, CBE, UN ECA, Google, Microsoft, DHL, etc.)
5. VALID LINKS: Provide real official career portal or job application links (e.g., https://www.safaricom.co.et/careers, https://careers.google.com/jobs/results/, etc.)
6. SPECIFIC DETAILS: Define appropriate salary estimates, deadlines, locations, and a compelling matchReason based on their specific skills.

Return ONLY a valid JSON object with this exact structure:
{
  "jobs": [
    {
      "title": "Specific Job Title",
      "company": "Real Company Name",
      "type": "Full-time | Part-time | Remote | Contract",
      "description": "A detailed 2-3 sentence overview of the role and its key duties.",
      "location": "City, Country or Remote",
      "salary": "Estimated salary range (e.g., '$80,000 - $100,000 / year' or 'Competitive')",
      "deadline": "Application deadline (e.g., June 30, 2026)",
      "link": "OFFICIAL_COMPANY_CAREER_PORTAL_URL",
      "matchReason": "Why this job is perfect for this person based on their skills and interests",
      "skills": ["Required Skill 1", "Required Skill 2", "Required Skill 3"]
    }
  ]
}

No markdown, no code blocks, just JSON.`;

  try {
    const profileString = [
      user.department || '',
      user.preferredRole || '',
      user.country || '',
      (user.skills || []).join(','),
      (user.interests || []).join(',')
    ].join('|');
    const cacheKey = `${user._id}:jobs:${profileString}`;
    const text = await callGemini(prompt, cacheKey, bypassCache);
    const parsed = extractJson(text);
    console.log(`✅ Generated ${parsed.jobs?.length || 0} jobs for ${user.name}`);
    return parsed;
  } catch (error) {
    console.error('Gemini job generation failed:', error.message);
    return buildFallbackJobs(user);
  }
};

/**
 * Fallback jobs when Gemini fails
 */
const buildFallbackJobs = (user) => {
  const dept = (user.department || 'General').toLowerCase();
  const role = user.preferredRole || 'Specialist';
  const country = user.country || 'Ethiopia';
  const skills = user.skills || [];

  // Local/Global opportunities depending on sector
  const deptData = {
    'social science': [
      { title: 'Social Development Specialist', company: 'World Bank Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.worldbank.org/en/about/careers' },
      { title: 'Program Officer', company: 'UNDP Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.undp.org/careers' },
      { title: 'Human Rights Advisor', company: 'African Union', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://au.int/en/careers' },
      { title: 'Monitoring & Evaluation Officer', company: 'Save the Children', location: 'Remote / Addis Ababa', type: 'Full-time', link: 'https://www.savethechildren.net/careers' }
    ],
    'business': [
      { title: 'Business Development Manager', company: 'Safaricom Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.safaricom.co.et/careers' },
      { title: 'Financial Analyst', company: 'Commercial Bank of Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.cbe.com.et/' },
      { title: 'Operations Associate', company: 'DHL Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://careers.dhl.com/' },
      { title: 'Management Consultant', company: 'Deloitte East Africa', location: 'Remote / Nairobi', type: 'Full-time', link: 'https://www2.deloitte.com/us/en/careers' }
    ],
    'technology': [
      { title: 'Software Engineer', company: 'Safaricom Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.safaricom.co.et/careers' },
      { title: 'Frontend Developer', company: 'Google', location: 'Remote / Global', type: 'Remote', link: 'https://careers.google.com/jobs/results/' },
      { title: 'Systems Analyst', company: 'Ethio Telecom', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.ethiotelecom.et/' },
      { title: 'IT Support Engineer', company: 'Microsoft', location: 'Remote / Kenya', type: 'Full-time', link: 'https://careers.microsoft.com/' }
    ],
    'engineering': [
      { title: 'Network Engineer', company: 'Ethio Telecom', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.ethiotelecom.et/' },
      { title: 'Infrastructure Project Manager', company: 'UN Economic Commission for Africa', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.uneca.org/careers' },
      { title: 'Civil Engineer', company: 'Addis Ababa City Administration', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.aau.edu.et/' },
      { title: 'Systems Operations Engineer', company: 'Safaricom Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.safaricom.co.et/careers' }
    ],
    'healthcare': [
      { title: 'Health Program Coordinator', company: 'World Health Organization', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.who.int/' },
      { title: 'Clinical Operations Lead', company: 'Ministry of Health Ethiopia', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'http://www.moh.gov.et/' },
      { title: 'Public Health Researcher', company: 'Ethiopian Public Health Institute', location: 'Addis Ababa, Ethiopia', type: 'Full-time', link: 'https://www.ephi.gov.et/' }
    ]
  };

  const getRequiredSkillsForRole = (titleStr) => {
    const title = titleStr.toLowerCase();
    if (title.includes('software engineer')) return ['Node.js', 'Express', 'System Design', 'MongoDB'];
    if (title.includes('frontend developer')) return ['React', 'HTML5/CSS3', 'Tailwind CSS', 'JavaScript'];
    if (title.includes('systems analyst')) return ['Requirements Gathering', 'UML Modeling', 'SQL', 'SDLC'];
    if (title.includes('it support')) return ['Troubleshooting', 'Active Directory', 'Networking', 'Customer Support'];
    if (title.includes('network engineer')) return ['Cisco Routing', 'VPNs', 'TCP/IP', 'Network Security'];
    if (title.includes('infrastructure project')) return ['Project Management', 'Agile/Scrum', 'Budgeting', 'Risk Management'];
    if (title.includes('civil engineer')) return ['AutoCAD', 'Structural Analysis', 'Project Estimation', 'Site Supervision'];
    if (title.includes('systems operations')) return ['Linux', 'Docker', 'Bash Scripting', 'CI/CD'];
    if (title.includes('health program')) return ['Program Planning', 'Stakeholder Liaison', 'Grant Management', 'Public Relations'];
    if (title.includes('clinical operations')) return ['Clinical Trials', 'GCP Guidelines', 'Data Verification', 'Patient Safety'];
    if (title.includes('public health')) return ['Epidemiology', 'Biostatistics', 'Survey Design', 'SPSS/R'];
    if (title.includes('business development')) return ['B2B Sales', 'Negotiation', 'Lead Generation', 'Market Analysis'];
    if (title.includes('financial analyst')) return ['Financial Modeling', 'Excel Formulas', 'Valuation', 'Corporate Finance'];
    if (title.includes('operations associate')) return ['Inventory Management', 'Supply Chain', 'Logistics', 'Procurement'];
    if (title.includes('management consultant')) return ['Business Strategy', 'SWOT Analysis', 'Client Advisory', 'Slide Design'];
    return ['Problem Solving', 'Communication', 'Teamwork', 'Critical Thinking'];
  };

  const matchedKey = Object.keys(deptData).find(k => dept.includes(k) || k.includes(dept));
  const baseJobs = matchedKey ? deptData[matchedKey] : deptData['technology'];

  return {
    jobs: baseJobs.map((job, i) => ({
      title: job.title,
      company: job.company,
      type: job.type,
      description: `Exciting opportunity for a ${job.title} to join the team at ${job.company}. You will work on challenging projects, collaborate with cross-functional teams, and contribute to impactful work aligned with ${user.preferredRole || 'your preferred career role'}.`,
      location: job.location,
      salary: i === 0 ? 'Competitive' : 'Varies based on experience',
      deadline: 'Check official portal for details',
      link: job.link,
      matchReason: `Perfect match for your ${user.department || 'field'} background, especially given your skills in ${skills.slice(0, 3).join(', ') || 'related areas'}.`,
      skills: getRequiredSkillsForRole(job.title)
    }))
  };
};

/**
 * GET /api/jobs
 * Fetch personalized jobs
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const jobs = await generateJobs(user);
    res.json(jobs);
  } catch (error) {
    console.error('Jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/jobs/regenerate
 * Force regenerate jobs
 */
router.post('/regenerate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Force regenerating jobs for: ${user.name} (${user.department})`);
    invalidateCache(req.userId);
    const jobs = await generateJobs(user, true); // true bypasses cache
    res.json({ message: 'Jobs regenerated', ...jobs });
  } catch (error) {
    console.error('Regenerate jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
