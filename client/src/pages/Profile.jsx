import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    year: '3rd Year',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    interests: ['Web Development', 'AI/ML', 'Cloud Computing'],
    preferredRole: 'Full Stack Developer',
    bio: 'Passionate about building scalable web applications and exploring AI technologies.',
  });

  const [formData, setFormData] = useState(profile);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleSave = async () => {
    try {
      // API call would go here
      setProfile(formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your career profile and preferences</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
                  isEditing
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {isEditing ? (
                  <>
                    <FiX size={20} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <FiEdit2 size={20} />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="preferredRole"
                      value={formData.preferredRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.preferredRole}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.year}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio}</p>
                )}
              </div>

              {/* Skills Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:opacity-80 transition"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  ))}
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
                  {formData.interests.map((interest) => (
                    <div
                      key={interest}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center space-x-2"
                    >
                      <span>{interest}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:opacity-80 transition"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  ))}
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
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                  >
                    <FiSave size={20} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
