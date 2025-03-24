import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import ResumeUpload from '../components/dashboard/ResumeUpload';
import { 
  DocumentTextIcon, 
  DocumentMagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Resume = () => {
  const { currentUser, loadUser } = useContext(AuthContext);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [education, setEducation] = useState([]);
  const [editing, setEditing] = useState({
    section: null,
    index: null
  });
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchResumeData();
  }, []);

  useEffect(() => {
    if (currentUser?.skills) {
      setSkills(currentUser.skills);
    }
  }, [currentUser]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/user/resume');
      
      if (response.data.success) {
        setResume(response.data.resume);
        
        if (response.data.resume) {
          // If specific sections are available in the response
          if (response.data.resume.workHistory) {
            setWorkHistory(response.data.resume.workHistory);
          }
          
          if (response.data.resume.education) {
            setEducation(response.data.resume.education);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume? This will also remove extracted skills.')) {
      return;
    }
    
    try {
      const response = await axios.delete('/user/resume');
      
      if (response.data.success) {
        toast.success('Resume deleted successfully');
        setResume(null);
        setWorkHistory([]);
        setEducation([]);
        loadUser(); // Refresh user data to update skills
      } else {
        toast.error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Error deleting resume');
    }
  };

  const downloadResume = async () => {
    try {
      const response = await axios.get('/user/resume/download', {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleEditClick = (section, index = null, initialData = {}) => {
    setEditing({ section, index });
    setFormData(initialData);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveWorkHistory = async () => {
    if (!formData.company || !formData.position || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedWorkHistory;
      
      if (editing.index !== null) {
        // Update existing entry
        updatedWorkHistory = [...workHistory];
        updatedWorkHistory[editing.index] = formData;
      } else {
        // Add new entry
        updatedWorkHistory = [...workHistory, formData];
      }

      const response = await axios.put('/user/resume/work-history', {
        workHistory: updatedWorkHistory
      });

      if (response.data.success) {
        setWorkHistory(updatedWorkHistory);
        setEditing({ section: null, index: null });
        setFormData({});
        toast.success('Work history updated successfully');
      } else {
        toast.error('Failed to update work history');
      }
    } catch (error) {
      console.error('Error updating work history:', error);
      toast.error('Error updating work history');
    }
  };

  const handleSaveEducation = async () => {
    if (!formData.institution || !formData.degree || !formData.graduationYear) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedEducation;
      
      if (editing.index !== null) {
        // Update existing entry
        updatedEducation = [...education];
        updatedEducation[editing.index] = formData;
      } else {
        // Add new entry
        updatedEducation = [...education, formData];
      }

      const response = await axios.put('/user/resume/education', {
        education: updatedEducation
      });

      if (response.data.success) {
        setEducation(updatedEducation);
        setEditing({ section: null, index: null });
        setFormData({});
        toast.success('Education updated successfully');
      } else {
        toast.error('Failed to update education');
      }
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error('Error updating education');
    }
  };

  const handleDeleteWorkHistory = async (index) => {
    if (!window.confirm('Are you sure you want to delete this work experience?')) {
      return;
    }

    try {
      const updatedWorkHistory = workHistory.filter((_, i) => i !== index);
      
      const response = await axios.put('/user/resume/work-history', {
        workHistory: updatedWorkHistory
      });

      if (response.data.success) {
        setWorkHistory(updatedWorkHistory);
        toast.success('Work experience deleted');
      } else {
        toast.error('Failed to delete work experience');
      }
    } catch (error) {
      console.error('Error deleting work history:', error);
      toast.error('Error deleting work history');
    }
  };

  const handleDeleteEducation = async (index) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) {
      return;
    }

    try {
      const updatedEducation = education.filter((_, i) => i !== index);
      
      const response = await axios.put('/user/resume/education', {
        education: updatedEducation
      });

      if (response.data.success) {
        setEducation(updatedEducation);
        toast.success('Education entry deleted');
      } else {
        toast.error('Failed to delete education entry');
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error('Error deleting education');
    }
  };

  const cancelEdit = () => {
    setEditing({ section: null, index: null });
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Management</h1>
          
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Your Resume</h2>
              <p className="text-gray-600 mt-1">
                Upload your resume to automatically extract skills and work experience
              </p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : resume ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-12 w-12 text-indigo-500 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {resume.fileName || 'Resume uploaded'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {resume.updatedAt 
                            ? `Last updated: ${new Date(resume.updatedAt).toLocaleDateString()}` 
                            : 'Resume available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadResume}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={handleDeleteResume}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Extracted Skills</h3>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 mb-4">No skills extracted yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No resume uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload your resume to get started.</p>
                </div>
              )}
              
              {(!resume || resume) && (
                <div className={`${resume ? 'mt-6 border-t border-gray-200 pt-6' : ''}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {resume ? 'Update Resume' : 'Upload Resume'}
                  </h3>
                  <ResumeUpload />
                </div>
              )}
            </div>
          </div>
          
          {/* Work History Section */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                <p className="text-gray-600 mt-1">
                  Add your work history to enhance job matching
                </p>
              </div>
              {editing.section !== 'work' && (
                <button
                  onClick={() => handleEditClick('work')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Experience
                </button>
              )}
            </div>
            
            <div className="p-6">
              {editing.section === 'work' ? (
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name*
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position*
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date*
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date (leave blank if current)
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description || ''}
                      onChange={handleFormChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWorkHistory}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : workHistory && workHistory.length > 0 ? (
                <div className="space-y-6">
                  {workHistory.map((work, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{work.position}</h4>
                          <p className="text-gray-600">{work.company}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(work.startDate).toLocaleDateString()} - 
                            {work.endDate ? new Date(work.endDate).toLocaleDateString() : ' Present'}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditClick('work', index, work)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkHistory(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {work.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {work.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No work experience added yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Education Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                <p className="text-gray-600 mt-1">
                  Add your educational background
                </p>
              </div>
              {editing.section !== 'education' && (
                <button
                  onClick={() => handleEditClick('education')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Education
                </button>
              )}
            </div>
            
            <div className="p-6">
              {editing.section === 'education' ? (
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution/University*
                      </label>
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree/Certificate*
                      </label>
                      <input
                        type="text"
                        name="degree"
                        value={formData.degree || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        name="fieldOfStudy"
                        value={formData.fieldOfStudy || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year*
                      </label>
                      <input
                        type="number"
                        name="graduationYear"
                        min="1950"
                        max="2030"
                        value={formData.graduationYear || ''}
                        onChange={handleFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEducation}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : education && education.length > 0 ? (
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                          <p className="text-gray-600">
                            {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            Graduated: {edu.graduationYear}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditClick('education', index, edu)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEducation(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No education history added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;