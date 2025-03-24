// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import SkillsSection from '../components/dashboard/SkillsSection';
import ResumeUpload from '../components/dashboard/ResumeUpload';
import StatsCard from '../components/dashboard/StatsCard';
import { ArrowTrendingUpIcon, BriefcaseIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    jobsMatched: 0,
    skills: currentUser?.skills?.length || 0,
    matchScore: 0
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/recommendations/jobs');
        if (response.data.success) {
          setJobs(response.data.jobs);
          setStats(prev => ({
            ...prev,
            jobsMatched: response.data.count,
            matchScore: response.data.jobs[0]?.matchScore * 100 || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        if (error.response?.data?.error === 'No skills found. Please upload your resume or add skills first') {
          // This is expected for new users, don't show error toast
          setJobs([]);
        } else {
          toast.error('Failed to fetch job recommendations');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.skills?.length > 0) {
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              title="Skills Identified" 
              value={stats.skills} 
              icon={<DocumentTextIcon className="h-6 w-6" />}
              color="bg-blue-500"
            />
            <StatsCard 
              title="Jobs Matched" 
              value={stats.jobsMatched}
              icon={<BriefcaseIcon className="h-6 w-6" />}
              color="bg-green-500"
            />
            <StatsCard 
              title="Top Match Score" 
              value={`${Math.round(stats.matchScore)}%`}
              icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
              color="bg-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
                <ResumeUpload />
              </div>
              
              <div className="bg-white shadow rounded-lg p-6 mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
                <SkillsSection skills={currentUser?.skills || []} />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Job Matches</h2>
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job.id || job._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg text-indigo-600">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {job.skills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                              {job.skills?.length > 3 && (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  +{job.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                              {Math.round(job.matchScore * 100)}% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 text-center">
                      <a href="/jobs" className="text-indigo-600 hover:text-indigo-900 font-medium">
                        View all job matches →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No job matches yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload your resume or add skills to get job recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;