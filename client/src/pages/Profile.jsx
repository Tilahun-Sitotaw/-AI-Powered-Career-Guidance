import { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiPlus } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills?.includes(trimmed)) {
      setFormData({ ...formData, skills: [...(formData.skills || []), trimmed] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !formData.interests?.includes(trimmed)) {
      setFormData({ ...formData, interests: [...(formData.interests || []), trimmed] });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({ ...formData, interests: formData.interests.filter((i) => i !== interest) });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE}/profile`,
        {
          name: formData.name,
          department: formData.department,
          year: formData.year,
          skills: formData.skills,
          interests: formData.interests,
          preferredRole: formData.preferredRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data.user);
      setFormData(res.data.user);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Profile save error:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading profile...</span>
              </div>
            )}

            {!loading && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your career profile and preferences</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg"
                    >
                      <FiEdit2 size={20} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {/* Alerts */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
                    {successMsg}
                  </div>
                )}

                {formData && (
                  <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profile?.name || '—'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900 font-medium">{profile?.email || '—'}</p>
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                        <p className="text-gray-900 font-medium">{profile?.phone || '—'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Role</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="preferredRole"
                            value={formData.preferredRole || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Full Stack Developer"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profile?.preferredRole || '—'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="department"
                            value={formData.department || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Computer Science"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profile?.department || '—'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="year"
                            value={formData.year || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. 3"
                            min="1"
                            max="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">
                            {profile?.year ? `Year ${profile.year}` : '—'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(formData.skills || []).map((skill) => (
                          <div
                            key={skill}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                          >
                            <span>{skill}</span>
                            {isEditing && (
                              <button onClick={() => handleRemoveSkill(skill)} className="hover:opacity-80 transition">
                                <FiX size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {(formData.skills || []).length === 0 && (
                          <p className="text-gray-400 text-sm">No skills added yet.</p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Add a new skill..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <button
                            onClick={handleAddSkill}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition flex items-center space-x-2"
                          >
                            <FiPlus size={18} />
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interests Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Interests</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(formData.interests || []).map((interest) => (
                          <div
                            key={interest}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center space-x-2"
                          >
                            <span>{interest}</span>
                            {isEditing && (
                              <button onClick={() => handleRemoveInterest(interest)} className="hover:opacity-80 transition">
                                <FiX size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {(formData.interests || []).length === 0 && (
                          <p className="text-gray-400 text-sm">No interests added yet.</p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                            placeholder="Add a new interest..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <button
                            onClick={handleAddInterest}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                          >
                            <FiPlus size={18} />
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                      <div className="flex gap-4 pt-6 border-t">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-60"
                        >
                          <FiSave size={20} />
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
