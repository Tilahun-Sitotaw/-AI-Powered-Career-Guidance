import { FiX, FiBook, FiClock, FiTarget, FiCheckCircle } from 'react-icons/fi';

const COLORS = [
  'from-cyan-500 to-blue-600',
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-pink-500 to-orange-600',
];

const ICONS = [
  <FiBook className="text-3xl" />,
  <FiTarget className="text-3xl" />,
  <FiCheckCircle className="text-3xl" />,
  <FiClock className="text-3xl" />,
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const LearningModal = ({ phase, onClose }) => {
  if (!phase) return null;

  const phaseIndex = parseInt(phase.phase?.match(/\d+/)?.[0] || 0) - 1;
  const colorClass = COLORS[phaseIndex % COLORS.length];
  const icon = ICONS[phaseIndex % ICONS.length];
  const level = LEVELS[phaseIndex % LEVELS.length];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClass} p-8 text-white flex items-start justify-between`}>
          <div className="flex items-start space-x-4">
            <div className="text-white text-opacity-80">{icon}</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{phase.phase}</h2>
              <p className="text-white text-opacity-90 text-lg">{phase.duration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Level Badge */}
          <div className="mb-8">
            <span className="inline-block bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
              {level} Level
            </span>
          </div>

          {/* Skills to Learn */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FiTarget className="text-pink-500" />
              <span>Skills You'll Learn</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(phase.skills || []).map((skill, idx) => (
                <div key={idx} className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-cyan-900">{skill}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Resources */}
          {phase.resources?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FiBook className="text-purple-500" />
                <span>Recommended Resources</span>
              </h3>
              <div className="space-y-3">
                {phase.resources.map((resource, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start space-x-3">
                    <div className="text-purple-500 mt-1">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">{resource}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duration Info */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <FiClock className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-900">Estimated Duration</p>
              <p className="text-sm text-blue-700 mt-1">{phase.duration}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition">
              Start Learning
            </button>
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningModal;
