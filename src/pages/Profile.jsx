import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { 
  UserIcon, 
  IdentificationIcon,
  KeyIcon,
  CogIcon,
  BellAlertIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser, loadUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    jobAlerts: true,
    remoteOnly: false,
    salary: '',
    jobTypes: []
  });

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      setPersonalInfo({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        bio: currentUser.bio || ''
      });
      
      if (currentUser.preferences) {
        setPreferences({
          jobAlerts: currentUser.preferences.jobAlerts ?? true,
          remoteOnly: currentUser.preferences.remoteOnly ?? false,
          salary: currentUser.preferences.salary || '',
          jobTypes: currentUser.preferences.jobTypes || []
        });
      }
    }
  }, [currentUser]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo({
      ...passwordInfo,
      [name]: value
    });
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setPreferences({
        ...preferences,
        [name]: checked
      });
    }
    // Handle select-multiple for job types
    else if (name === 'jobTypes') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setPreferences({
        ...preferences,
        jobTypes: selectedOptions
      });
    }
    // Handle other inputs
    else {
      setPreferences({
        ...preferences,
        [name]: value
      });
    }
  };

  const updatePersonalInfo = async (e) => {
    e.preventDefault();
    
    if (!personalInfo.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put('/user/profile', personalInfo);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        loadUser(); // Refresh user data
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordInfo.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (!passwordInfo.newPassword || passwordInfo.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put('/user/password', {
        currentPassword: passwordInfo.currentPassword,
        newPassword: passwordInfo.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        setPasswordInfo({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.error || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.put('/user/preferences', preferences);
      
      if (response.data.success) {
        toast.success('Preferences updated successfully');
        loadUser(); // Refresh user data
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.error || 'Error updating preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmText = prompt('Please type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast.info('Account deletion cancelled');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.delete('/user/account');
      
      if (response.data.success) {
        toast.success('Account deleted successfully');
        logout(); // Log the user out
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.error || 'Error deleting account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <UserIcon className="h-4 w-4 mr-1" />
                {currentUser?.name}'s Account
              </span>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'personal' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Information
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'security' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Password & Security
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'preferences' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Job Preferences
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'personal' && (
                <form onSubmit={updatePersonalInfo}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-4">
                        <IdentificationIcon className="h-6 w-6 text-indigo-500 mr-2" />
                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name*
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={personalInfo.name}
                              onChange={handlePersonalInfoChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address*
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={personalInfo.email}
                              onChange={handlePersonalInfoChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                              disabled
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <div className="mt-1">
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={personalInfo.phone}
                              onChange={handlePersonalInfoChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="location"
                              name="location"
                              value={personalInfo.location}
                              onChange={handlePersonalInfoChange}
                              placeholder="City, State"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio / Professional Summary
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={personalInfo.bio}
                            onChange={handlePersonalInfoChange}
                            placeholder="Write a short introduction about yourself"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center mb-4">
                    <KeyIcon className="h-6 w-6 text-indigo-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Password & Security</h2>
                  </div>
                  
                  <form onSubmit={updatePassword} className="mt-6 border-b border-gray-200 pb-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password*
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordInfo.currentPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password*
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordInfo.newPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password*
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordInfo.confirmPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-8">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Danger Zone</h2>
                    </div>
                    
                    <div className="mt-4 border border-red-200 rounded-md p-4 bg-red-50">
                      <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                      <p className="mt-1 text-sm text-red-700">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <form onSubmit={updatePreferences}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-4">
                        <CogIcon className="h-6 w-6 text-indigo-500 mr-2" />
                        <h2 className="text-lg font-medium text-gray-900">Job Preferences</h2>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex items-center">
                          <input
                            id="jobAlerts"
                            name="jobAlerts"
                            type="checkbox"
                            checked={preferences.jobAlerts}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="jobAlerts" className="ml-2 block text-sm text-gray-900">
                            Receive job alerts via email
                          </label>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <input
                            id="remoteOnly"
                            name="remoteOnly"
                            type="checkbox"
                            checked={preferences.remoteOnly}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remoteOnly" className="ml-2 block text-sm text-gray-900">
                            Show remote jobs only
                          </label>
                        </div>
                        
                        <div className="mt-6">
                          <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                            Expected Salary (USD)
                          </label>
                          <div className="mt-1">
                            <select
                              id="salary"
                              name="salary"
                              value={preferences.salary}
                              onChange={handlePreferencesChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">No preference</option>
                              <option value="30000-50000">$30,000 - $50,000</option>
                              <option value="50000-70000">$50,000 - $70,000</option>
                              <option value="70000-90000">$70,000 - $90,000</option>
                              <option value="90000-120000">$90,000 - $120,000</option>
                              <option value="120000-150000">$120,000 - $150,000</option>
                              <option value="150000+">$150,000+</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <label htmlFor="jobTypes" className="block text-sm font-medium text-gray-700">
                            Job Types (Hold Ctrl/Cmd to select multiple)
                          </label>
                          <div className="mt-1">
                            <select
                              id="jobTypes"
                              name="jobTypes"
                              multiple
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={preferences.jobTypes}
                              onChange={handlePreferencesChange}
                              size="4"
                            >
                              <option value="full-time">Full-time</option>
                              <option value="part-time">Part-time</option>
                              <option value="contract">Contract</option>
                              <option value="freelance">Freelance</option>
                              <option value="internship">Internship</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;