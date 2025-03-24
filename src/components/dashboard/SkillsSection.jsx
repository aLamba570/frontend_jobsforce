// src/components/dashboard/SkillsSection.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SkillsSection = ({ skills }) => {
  const [localSkills, setLocalSkills] = useState(skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const { loadUser } = useContext(AuthContext);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    // Check for duplicates (case-insensitive)
    if (localSkills.some(skill => skill.toLowerCase() === newSkill.toLowerCase())) {
      toast.info('This skill is already in your list');
      return;
    }
    
    setLocalSkills([...localSkills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setLocalSkills(localSkills.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      const response = await axios.put('/recommendations/skills', { skills: localSkills });
      
      if (response.data.success) {
        toast.success('Skills updated successfully');
        loadUser(); // Refresh user data
      } else {
        toast.error('Failed to update skills');
      }
    } catch (error) {
      console.error('Save skills error:', error);
      toast.error(error.response?.data?.error || 'Error saving skills');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const extractSkillsFromText = async () => {
    const text = prompt("Paste a job description or text with skills:");
    if (!text || text.trim().length < 10) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await axios.post('/recommendations/extract-skills', { text });
      
      if (response.data.success && response.data.skills) {
        // Merge existing skills with new ones, removing duplicates
        const newSkills = [...new Set([...localSkills, ...response.data.skills])];
        setLocalSkills(newSkills);
        toast.success(`${response.data.skills.length} skills extracted`);
      } else {
        toast.error('Failed to extract skills');
      }
    } catch (error) {
      toast.error('Error extracting skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {localSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {localSkills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
            >
              <span className="mr-1">{skill}</span>
              <button 
                onClick={() => handleRemoveSkill(index)}
                className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No skills added yet. Add skills to get better job matches.
        </div>
      )}

      <div className="flex mt-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill..."
          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-between pt-2">
        <button 
          onClick={extractSkillsFromText}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Extract skills from text
        </button>
        
        <button
          onClick={handleSaveSkills}
          disabled={saving || JSON.stringify(localSkills) === JSON.stringify(skills)}
          className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none ${
            (saving || JSON.stringify(localSkills) === JSON.stringify(skills)) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SkillsSection;