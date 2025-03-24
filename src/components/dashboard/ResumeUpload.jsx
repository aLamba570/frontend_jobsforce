import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { loadUser } = useContext(AuthContext);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a resume file');
      return;
    }
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'docx') {
      toast.error('Only PDF and DOCX files are accepted');
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await axios.post('/recommendations/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Resume uploaded and skills extracted successfully');
        setFile(null);
        loadUser(); // Refresh user data to get updated skills
      } else {
        toast.error('Failed to process resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Error uploading resume');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <div className="flex justify-center">
              {file ? (
                <DocumentTextIcon className="h-12 w-12 text-indigo-500" />
              ) : (
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="flex flex-col items-center text-sm text-gray-600">
              {file ? (
                <p className="font-medium text-indigo-600">{file.name}</p>
              ) : (
                <>
                  <p>Drag and drop your resume here, or</p>
                  <label className="mt-2 cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50">
                    Browse files
                    <input type="file" className="sr-only" onChange={handleChange} accept=".pdf,.docx" />
                  </label>
                </>
              )}
              <p className="mt-2 text-xs text-gray-500">PDF or DOCX up to 5MB</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none ${
              !file || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!file || uploading}
          >
            {uploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              'Upload Resume'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResumeUpload;