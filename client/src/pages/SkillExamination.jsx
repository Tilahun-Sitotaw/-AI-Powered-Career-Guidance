import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiCheckCircle, FiXCircle, FiRefreshCw, FiAlertCircle, FiClipboard,
  FiChevronDown, FiChevronUp, FiClock, FiBarChart2, FiAward,
  FiTrendingUp, FiArrowRight, FiTarget,
} from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const EXAM_DURATION = 20 * 60; // 20 minutes in seconds

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const getScoreColor = (pct) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBg = (pct) => {
  if (pct >= 80) return 'bg-green-50 border-green-300';
  if (pct >= 60) return 'bg-yellow-50 border-yellow-300';
  return 'bg-red-50 border-red-300';
};

const getScoreGrade = (pct) => {
  if (pct >= 90) return { grade: 'A+', label: 'Outstanding', color: 'text-green-600' };
  if (pct >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600' };
  if (pct >= 70) return { grade: 'B', label: 'Good', color: 'text-blue-600' };
  if (pct >= 60) return { grade: 'C', label: 'Average', color: 'text-yellow-600' };
  if (pct >= 50) return { grade: 'D', label: 'Below Average', color: 'text-orange-600' };
  return { grade: 'F', label: 'Needs Improvement', color: 'text-red-600' };
};

const SkillExamination = () => {
  // Exam state
  const [phase, setPhase] = useState('idle'); // idle | loading | exam | results | analyzing
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [userSkills, setUserSkills] = useState([]);
  const [error, setError] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Results
  const [score, setScore] = useState(null);
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [examGaps, setExamGaps] = useState([]);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [savingResults, setSavingResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Progress
  const answeredCount = Object.keys(userAnswers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // ── Timer logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            handleAutoSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const handleAutoSubmit = useCallback(() => {
    submitExam(true);
  }, [questions, userAnswers]);

  // ── Fetch exam ───────────────────────────────────────────────────────────────
  const fetchExam = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setPhase('loading');
    setError(null);
    setUserAnswers({});
    setExpandedAnswers({});
    setScore(null);
    setSkillBreakdown([]);
    setExamGaps([]);
    setResultsSaved(false);
    setAnalysisResult(null);
    setTimeLeft(EXAM_DURATION);

    try {
      const profileRes = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skills = profileRes.data.skills || [];
      setUserSkills(skills);

      if (skills.length === 0) {
        setError('no_skills');
        setPhase('idle');
        return;
      }

      const res = await axios.post(
        `${API_BASE}/recommendations/exam`,
        { skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.questions || []);
      setPhase('exam');
      setTimerActive(true);
    } catch (err) {
      setError('Failed to generate exam. Please try again.');
      setPhase('idle');
    }
  };

  useEffect(() => { fetchExam(); }, []);

  // ── Submit exam ──────────────────────────────────────────────────────────────
  const submitExam = (autoSubmit = false) => {
    clearInterval(timerRef.current);
    setTimerActive(false);

    const total = questions.length;
    let correct = 0;
    const bySkill = {};

    questions.forEach((q, i) => {
      const skill = q.skill || 'General';
      if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0, wrong: [] };
      bySkill[skill].total++;
      if (userAnswers[i] === q.correctIndex) {
        correct++;
        bySkill[skill].correct++;
      } else {
        bySkill[skill].wrong.push(q.question);
      }
    });

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeTaken = EXAM_DURATION - timeLeft;

    setScore({ correct, total, percent, timeTaken, autoSubmit });

    // Build per-skill breakdown
    const breakdown = Object.entries(bySkill).map(([skill, data]) => ({
      skill,
      correct: data.correct,
      total: data.total,
      percent: Math.round((data.correct / data.total) * 100),
      wrong: data.wrong,
    })).sort((a, b) => a.percent - b.percent);

    setSkillBreakdown(breakdown);

    // Identify exam-detected skill gaps (skills with < 60% score)
    const gaps = breakdown
      .filter((b) => b.percent < 60)
      .map((b) => ({
        skill: b.skill,
        score: b.percent,
        importance: b.percent < 40 ? 'High' : 'Medium',
        source: 'exam',
      }));
    setExamGaps(gaps);
    setPhase('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (answeredCount < questions.length) {
      if (!window.confirm(`You have ${questions.length - answeredCount} unanswered questions. Submit anyway?`)) return;
    }
    submitExam(false);
  };

  // ── Analyze Results (save gaps to DB) ────────────────────────────────────────
  const handleAnalyzeResults = async () => {
    const token = localStorage.getItem('token');
    if (!token || examGaps.length === 0) return;
    setSavingResults(true);
    try {
      const res = await axios.post(
        `${API_BASE}/recommendations/exam/save-results`,
        { examGaps, skillBreakdown, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultsSaved(true);
      setAnalysisResult(res.data.analysis);
    } catch (err) {
      console.error('Save results error:', err);
    } finally {
      setSavingResults(false);
    }
  };

  const toggleAnswer = (i) => setExpandedAnswers((p) => ({ ...p, [i]: !p[i] }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ── Page header ── */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1">Skill Examination</h1>
                <p className="text-gray-600 text-sm">
                  Testing: <span className="font-semibold text-pink-600">{userSkills.join(', ') || '—'}</span>
                </p>
              </div>
              {phase !== 'loading' && (
                <button
                  onClick={fetchExam}
                  disabled={phase === 'loading' || phase === 'exam'}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  <FiRefreshCw size={16} className={phase === 'loading' ? 'animate-spin' : ''} />
                  <span>New Exam</span>
                </button>
              )}
            </div>

            {/* ── Loading ── */}
            {phase === 'loading' && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-pink-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Generating your personalized exam...</p>
                <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
              </div>
            )}

            {/* ── No skills ── */}
            {phase === 'idle' && error === 'no_skills' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-8 rounded-xl text-center">
                <FiClipboard size={44} className="mx-auto mb-3 text-blue-400" />
                <p className="text-lg font-semibold">No skills found in your profile.</p>
                <p className="text-sm mt-2">
                  Go to your <a href="/profile" className="underline font-semibold">Profile</a> and add your skills to generate a personalized exam.
                </p>
              </div>
            )}

            {/* ── Error ── */}
            {phase === 'idle' && error && error !== 'no_skills' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-2">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            {/* ── EXAM PHASE ── */}
            {phase === 'exam' && questions.length > 0 && (
              <>
                {/* Sticky exam toolbar */}
                <div className="sticky top-16 z-10 bg-white border border-gray-200 rounded-xl shadow-md px-5 py-3 mb-6 flex items-center justify-between flex-wrap gap-3">
                  {/* Timer */}
                  <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${timeLeft < 120 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                    <FiClock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                    {timeLeft < 120 && <span className="text-xs font-normal text-red-500">Time running out!</span>}
                  </div>

                  {/* Progress */}
                  <div className="flex-1 min-w-48 max-w-xs">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{answeredCount} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm"
                  >
                    Submit Exam
                  </button>
                </div>

                {/* Questions */}
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className={`bg-white rounded-xl shadow-md p-6 border-2 transition ${
                        userAnswers[i] !== undefined ? 'border-pink-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3 mb-4">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
                          Q{i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-900 font-semibold">{q.question}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.skill}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              q.difficulty === 'Beginner' ? 'bg-green-100 text-green-700'
                              : q.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>{q.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((option, j) => (
                          <div
                            key={j}
                            onClick={() => setUserAnswers((p) => ({ ...p, [i]: j }))}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                              userAnswers[i] === j
                                ? 'border-pink-500 bg-pink-50 text-pink-800'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-bold text-sm flex-shrink-0 w-5">{['A', 'B', 'C', 'D'][j]}.</span>
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom submit */}
                <div className="flex items-center justify-between pt-6 mt-4 border-t">
                  <p className="text-gray-500 text-sm">{answeredCount} of {questions.length} answered</p>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Submit Exam
                  </button>
                </div>
              </>
            )}

            {/* ── RESULTS PHASE ── */}
            {phase === 'results' && score && (
              <>
                {/* Score card */}
                <div className={`border-2 rounded-2xl p-6 mb-6 ${getScoreBg(score.percent)}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Final Score</p>
                      <div className="flex items-end space-x-3 mt-1">
                        <span className={`text-6xl font-black ${getScoreColor(score.percent)}`}>{score.percent}%</span>
                        <div className="mb-2">
                          <span className={`text-2xl font-bold ${getScoreGrade(score.percent).color}`}>
                            {getScoreGrade(score.percent).grade}
                          </span>
                          <p className={`text-sm font-semibold ${getScoreGrade(score.percent).color}`}>
                            {getScoreGrade(score.percent).label}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{score.correct} / {score.total} correct</p>
                      {score.autoSubmit && (
                        <p className="text-orange-600 text-sm mt-1 font-medium">⏰ Auto-submitted when time ran out</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <FiClock size={16} />
                        <span className="text-sm">Time taken: <strong>{formatTime(score.timeTaken)}</strong></span>
                      </div>
                      <button
                        onClick={fetchExam}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm"
                      >
                        <FiRefreshCw size={14} />
                        <span>Retake Exam</span>
                      </button>
                    </div>
                  </div>

                  {/* Overall progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Overall Performance</span>
                      <span>{score.percent}%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-60 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${
                          score.percent >= 80 ? 'bg-green-500'
                          : score.percent >= 60 ? 'bg-yellow-500'
                          : 'bg-red-500'
                        }`}
                        style={{ width: `${score.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Per-skill breakdown */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiBarChart2 className="text-pink-500" />
                    <span>Skill Breakdown</span>
                  </h2>
                  <div className="space-y-4">
                    {skillBreakdown.map((s, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">{s.skill}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{s.correct}/{s.total}</span>
                            <span className={`text-sm font-bold ${getScoreColor(s.percent)}`}>{s.percent}%</span>
                            {s.percent < 60 && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Gap Detected</span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              s.percent >= 80 ? 'bg-green-500'
                              : s.percent >= 60 ? 'bg-yellow-500'
                              : 'bg-red-500'
                            }`}
                            style={{ width: `${s.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exam-detected skill gaps */}
                {examGaps.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-red-400">
                    <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center space-x-2">
                      <FiTarget className="text-red-500" />
                      <span>Skill Gaps Detected from Exam</span>
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">These skills scored below 60% — they need improvement.</p>
                    <div className="space-y-3">
                      {examGaps.map((gap, i) => (
                        <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{gap.skill}</p>
                            <p className="text-sm text-red-600">Score: {gap.score}%</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            gap.importance === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {gap.importance} Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyze Results button */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center space-x-2">
                        <FiTrendingUp className="text-pink-500" />
                        <span>Analyze Results</span>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Save your exam results to update your Skill Gap Analysis page with gaps detected from this exam.
                        {resultsSaved && <span className="text-green-600 font-semibold ml-2">✓ Results saved!</span>}
                      </p>
                    </div>
                    <button
                      onClick={handleAnalyzeResults}
                      disabled={savingResults || resultsSaved || examGaps.length === 0}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
                    >
                      {savingResults ? (
                        <><FiRefreshCw size={16} className="animate-spin" /><span>Analyzing...</span></>
                      ) : resultsSaved ? (
                        <><FiCheckCircle size={16} /><span>Analyzed</span></>
                      ) : (
                        <><FiTrendingUp size={16} /><span>Analyze Results</span></>
                      )}
                    </button>
                  </div>

                  {analysisResult && (
                    <div className="mt-4 pt-4 border-t border-pink-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">AI Analysis:</p>
                      <p className="text-gray-700 text-sm">{analysisResult}</p>
                      <a
                        href="/skill-gap-analysis"
                        className="inline-flex items-center space-x-2 mt-3 text-pink-600 font-semibold text-sm hover:text-pink-700"
                      >
                        <span>View updated Skill Gap Analysis</span>
                        <FiArrowRight size={14} />
                      </a>
                    </div>
                  )}

                  {examGaps.length === 0 && (
                    <p className="text-green-600 text-sm mt-2 font-medium">
                      🎉 No skill gaps detected — you scored above 60% on all skills!
                    </p>
                  )}
                </div>

                {/* Detailed Q&A review */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiClipboard className="text-pink-500" />
                    <span>Question Review</span>
                  </h2>
                  <div className="space-y-4">
                    {questions.map((q, i) => {
                      const isCorrect = userAnswers[i] === q.correctIndex;
                      return (
                        <div
                          key={i}
                          className={`rounded-xl border-2 p-5 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start space-x-3 flex-1">
                              <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                                Q{i + 1}
                              </span>
                              <p className="text-gray-900 font-medium text-sm">{q.question}</p>
                            </div>
                            {isCorrect
                              ? <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
                              : <FiXCircle size={20} className="text-red-500 flex-shrink-0" />
                            }
                          </div>

                          <div className="space-y-1 mb-3">
                            {q.options.map((opt, j) => (
                              <div
                                key={j}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                                  j === q.correctIndex ? 'bg-green-100 text-green-800 font-semibold'
                                  : userAnswers[i] === j ? 'bg-red-100 text-red-700'
                                  : 'text-gray-600'
                                }`}
                              >
                                <span className="font-bold w-4">{['A','B','C','D'][j]}.</span>
                                <span>{opt}</span>
                                {j === q.correctIndex && <FiCheckCircle size={14} className="text-green-600 ml-auto" />}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div>
                              <button
                                onClick={() => toggleAnswer(i)}
                                className="flex items-center space-x-1 text-xs text-pink-600 font-semibold hover:text-pink-700"
                              >
                                {expandedAnswers[i] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                <span>{expandedAnswers[i] ? 'Hide' : 'Show'} Explanation</span>
                              </button>
                              {expandedAnswers[i] && (
                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                  <p className="text-blue-800 text-xs">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SkillExamination;
