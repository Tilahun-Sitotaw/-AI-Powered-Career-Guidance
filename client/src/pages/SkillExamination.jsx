import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiAlertCircle, FiClipboard, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const SkillExamination = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    fetchExamQuestions();
  }, []);

  const fetchExamQuestions = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setScore(null);
    setUserAnswers({});
    setExpandedAnswers({});
    try {
      // Get user profile to know their skills
      const profileRes = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skills = profileRes.data.skills || [];
      setUserSkills(skills);

      if (skills.length === 0) {
        setError('no_skills');
        setLoading(false);
        return;
      }

      // Generate exam questions via the exam endpoint
      const res = await axios.post(
        `${API_BASE}/recommendations/exam`,
        { skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Exam fetch error:', err);
      setError('Failed to generate exam questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    let correct = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correct++;
    });
    setScore({ correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAnswer = (i) => {
    setExpandedAnswers((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const getScoreColor = (percent) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percent) => {
    if (percent >= 80) return 'bg-green-50 border-green-200';
    if (percent >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreMessage = (percent) => {
    if (percent >= 80) return 'Excellent! You have strong command of your skills.';
    if (percent >= 60) return 'Good effort! Review the areas you missed to strengthen your knowledge.';
    return 'Keep practicing! Focus on the explanations below to improve.';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Skill Examination</h1>
                <p className="text-gray-600">
                  Test your knowledge on: <span className="font-semibold text-pink-600">{userSkills.join(', ') || '—'}</span>
                </p>
              </div>
              <button
                onClick={fetchExamQuestions}
                disabled={loading || generating}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
              >
                <FiRefreshCw size={16} className={loading || generating ? 'animate-spin' : ''} />
                <span>{loading ? 'Generating...' : 'New Exam'}</span>
              </button>
            </div>

            {/* Score result */}
            {submitted && score && (
              <div className={`border rounded-xl p-6 mb-8 ${getScoreBg(score.percent)}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">Your Score</p>
                    <p className={`text-5xl font-bold mt-1 ${getScoreColor(score.percent)}`}>
                      {score.percent}%
                    </p>
                    <p className="text-gray-600 mt-2">{score.correct} / {score.total} correct</p>
                    <p className="text-gray-700 mt-2 font-medium">{getScoreMessage(score.percent)}</p>
                  </div>
                  <button
                    onClick={fetchExamQuestions}
                    className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    <FiRefreshCw size={16} />
                    <span>Retake Exam</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Generating your personalized exam...</span>
              </div>
            )}

            {/* No skills */}
            {!loading && error === 'no_skills' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-6 rounded-xl text-center">
                <FiClipboard size={40} className="mx-auto mb-3 text-blue-400" />
                <p className="text-lg font-semibold">No skills found in your profile.</p>
                <p className="text-sm mt-2">Go to your <a href="/profile" className="underline font-semibold">Profile</a> and add your skills to generate a personalized exam.</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && error !== 'no_skills' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-2">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            {/* Questions */}
            {!loading && !error && questions.length > 0 && (
              <div className="space-y-6">
                {questions.map((q, i) => {
                  const answered = userAnswers[i] !== undefined;
                  const isCorrect = submitted && userAnswers[i] === q.correctIndex;
                  const isWrong = submitted && answered && userAnswers[i] !== q.correctIndex;

                  return (
                    <div
                      key={i}
                      className={`bg-white rounded-xl shadow-md p-6 border-2 transition ${
                        submitted
                          ? isCorrect ? 'border-green-400' : isWrong ? 'border-red-400' : 'border-gray-200'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Question header */}
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
                            Q{i + 1}
                          </span>
                          <div>
                            <p className="text-gray-900 font-semibold">{q.question}</p>
                            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {q.skill} · {q.difficulty}
                            </span>
                          </div>
                        </div>
                        {submitted && (
                          isCorrect
                            ? <FiCheckCircle size={24} className="text-green-500 flex-shrink-0" />
                            : <FiXCircle size={24} className="text-red-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {q.options.map((option, j) => {
                          let optionClass = 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer';
                          if (!submitted && userAnswers[i] === j) {
                            optionClass = 'border-pink-500 bg-pink-50 text-pink-700 cursor-pointer';
                          }
                          if (submitted) {
                            if (j === q.correctIndex) {
                              optionClass = 'border-green-500 bg-green-50 text-green-700 cursor-default';
                            } else if (userAnswers[i] === j && j !== q.correctIndex) {
                              optionClass = 'border-red-400 bg-red-50 text-red-700 cursor-default';
                            } else {
                              optionClass = 'border-gray-200 bg-gray-50 text-gray-500 cursor-default';
                            }
                          }

                          return (
                            <div
                              key={j}
                              onClick={() => handleAnswer(i, j)}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition ${optionClass}`}
                            >
                              <span className="font-bold text-sm flex-shrink-0">
                                {['A', 'B', 'C', 'D'][j]}.
                              </span>
                              <span className="text-sm">{option}</span>
                              {submitted && j === q.correctIndex && (
                                <FiCheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation (shown after submit) */}
                      {submitted && q.explanation && (
                        <div>
                          <button
                            onClick={() => toggleAnswer(i)}
                            className="flex items-center space-x-2 text-sm text-pink-600 font-semibold hover:text-pink-700 transition"
                          >
                            {expandedAnswers[i] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            <span>{expandedAnswers[i] ? 'Hide' : 'Show'} Explanation</span>
                          </button>
                          {expandedAnswers[i] && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                              <p className="text-blue-800 text-sm">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit button */}
                {!submitted && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-gray-500 text-sm">
                      {Object.keys(userAnswers).length} / {questions.length} answered
                    </p>
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      Submit Exam
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SkillExamination;
