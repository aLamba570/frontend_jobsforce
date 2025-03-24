import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon, 
  CalendarIcon, 
  ArrowLeftIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/jobs/${id}`);
        
        if (response.data.success) {
          setJob(response.data.data);
          // Also fetch related jobs
          fetchRelatedJobs(response.data.data);
        } else {
          toast.error('Failed to load job details');
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Error loading job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedJobs = async (jobData) => {
      if (!jobData?.skills?.length) return;
      
      try {
        const response = await axios.get('/recommendations/jobs', {
          params: { 
            limit: 3,
            skills: jobData.skills.join(',')
          }
        });
        
        if (response.data.success) {
          // Filter out the current job
          const filtered = response.data.jobs.filter(item => item._id !== id || item.id !== id);
          setRelatedJobs(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching related jobs:', error);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, navigate]);

  const handleApply = async () => {
    try {
      setApplying(true);
      // If the job has a direct application URL
      if (job.url) {
        window.open(job.url, '_blank');
      } else {
        // Otherwise track the application in your system
        await axios.post(`/applications/apply/${id}`);
        toast.success('Application submitted successfully');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      const response = await axios.post(`/recommendations/save-job/${id}`);
      if (response.data.success) {
        toast.success('Job saved to your favorites');
      } else {
        toast.error('Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Error saving job');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-10">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to jobs
          </button>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : job ? (
            <div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-gray-700">{job.company}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-gray-700">{job.location}</span>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills?.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-center">
                      <div className="bg-green-100 text-green-800 rounded-full px-4 py-2 flex items-center mb-4">
                        <ChartBarIcon className="h-5 w-5 mr-1" />
                        <span className="font-semibold">{Math.round((job.matchScore || 0) * 100)}% Match</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleApply}
                          disabled={applying}
                          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            applying ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {applying ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                            </div>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                              Apply Now
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleSaveJob}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-1" />
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                      <span>Posted {formatDate(job.postedAt)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                    {job.description ? (
                      <div className="prose max-w-none text-gray-700">
                        <p>{job.description}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No description available.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Jobs Section */}
              {relatedJobs.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Jobs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedJobs.map((relatedJob) => (
                      <div 
                        key={relatedJob._id || relatedJob.id} 
                        className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/jobs/${relatedJob._id || relatedJob.id}`)}
                      >
                        <h3 className="font-medium text-indigo-600 mb-1">{relatedJob.title}</h3>
                        <p className="text-sm text-gray-600">{relatedJob.company}</p>
                        <p className="text-xs text-gray-500 mb-2">{relatedJob.location}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-wrap gap-1">
                            {relatedJob.skills?.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                            {relatedJob.skills?.length > 2 && (
                              <span className="text-xs text-gray-500">+{relatedJob.skills.length - 2} more</span>
                            )}
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {Math.round((relatedJob.matchScore || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Job not found</h3>
              <p className="mt-1 text-sm text-gray-500">The job you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse all jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;