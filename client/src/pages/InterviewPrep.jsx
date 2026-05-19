import { useState, useEffect } from 'react';
import { FiArrowRight, FiRefreshCw, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getDifficultyColor = (d) => {
  if (d === 'Easy' || d === 'Beginner') return 'bg-green-100 text-green-700';
  if (d === 'Medium' || d === 'Intermediate') return 'bg-yellow-100 text-yellow-700';
  if (d === 'Hard' || d === 'Advanced') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.interviewQuestions || []);
    } catch (err) {
      setError('Failed to load interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/recommendations/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.recommendation?.interviewQuestions || []);
      setActiveCategory('All');
    } catch (err) {
      setError('Failed to regenerate interview questions.');
    } finally {
      setRegenerating(false);
    }
  };

  const categories = ['All', ...new Set(questions.map((q) => q.category).filter(Boolean))];
  const filtered = activeCategory === 'All' ? questions : questions.filter((q) => q.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900 py-16 px-4 sm:px-6 lg:px-8 rounded-lg mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">Interview Preparation</h1>
                <p className="text-lg text-gray-700 max-w-2xl">
                  AI-generated interview questions tailored to your target career and skill set. Practice and prepare with confidence.
                </p>
              </div>
            </section>

            {/* Header row */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-slate-900">Your Interview Questions</h2>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
                </button>
              )}
            </div>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
                Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized interview questions.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600">Loading interview questions...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center space-x-2">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && isAuthenticated && questions.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <FiMessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No interview questions yet.</p>
                <p className="text-sm mt-2">Complete your profile with a preferred role to get personalized questions.</p>
              </div>
            )}

            {/* Questions */}
            {!loading && questions.length > 0 && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                    const count = questions.filter((q) =>
                      q.difficulty === level || q.difficulty === (level === 'Beginner' ? 'Easy' : level === 'Advanced' ? 'Hard' : 'Medium')
                    ).length;
                    const colors = {
                      Beginner: 'bg-green-50 border-green-200 text-green-600',
                      Intermediate: 'bg-yellow-50 border-yellow-200 text-yellow-600',
                      Advanced: 'bg-red-50 border-red-200 text-red-600',
                    };
                    return (
                      <div key={level} className={`border rounded-xl p-4 text-center ${colors[level]}`}>
                        <p className="text-3xl font-bold">{count}</p>
                        <p className="text-sm font-semibold mt-1">{level}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        activeCategory === cat
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filtered.map((q, i) => (
                    <div key={i} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">{q.question}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{q.category}</span>
                        <button 
                          onClick={() => {
                            setSelectedQuestion(q);
                            setShowAnswer(false);
                          }}
                          className="text-pink-500 hover:text-pink-600 font-semibold flex items-center space-x-2"
                        >
                          <span>View Answer</span>
                          <FiArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Interview Question</h2>
              <p className="text-white text-opacity-90">{selectedQuestion.question}</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty} - {selectedQuestion.category}
                </span>
              </div>

              {!showAnswer ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">Think about your answer before revealing the suggested response.</p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition"
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                  <h3 className="font-bold text-gray-900 mb-3">Suggested Answer:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedQuestion.answer || 'This is a great question to practice. Consider discussing your relevant experience, skills, and how they apply to the role. Focus on specific examples and outcomes.'}
                  </p>
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> Personalize this answer with your own experiences and examples. Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                {showAnswer && (
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                  >
                    Hide Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110 z-30"
          title="Open AI Assistant"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Bot */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} context="interview" />
    </div>
  );
};

export default InterviewPrep;
