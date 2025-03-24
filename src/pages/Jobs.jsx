import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    location: '',
    searchTerm: ''
  });

  // Items per page
  const ITEMS_PER_PAGE = 10;

  const fetchJobs = async (page = 1, refresh = false) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        refresh: refresh ? 'true' : undefined,
        minMatchScore: filters.minMatchScore > 0 ? filters.minMatchScore / 100 : undefined,
        location: filters.location || undefined,
        searchTerm: filters.searchTerm || undefined
      };
      
      console.log('Fetching jobs with params:', params);
      
      // Make sure to use the correct API endpoint
      const response = await axios.get('/recommendations/jobs', { params });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setJobs(response.data.jobs);
        setPagination({
          currentPage: parseInt(response.data.page) || 1,
          totalPages: parseInt(response.data.pages) || 1,
          totalJobs: parseInt(response.data.total) || 0
        });
        console.log(`Loaded ${response.data.jobs.length} jobs (page ${response.data.page} of ${response.data.pages})`);
      } else {
        toast.error('Failed to load job recommendations');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchJobs(page);
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchJobs(1); // Reset to first page when applying filters
  };

  const resetFilters = () => {
    setFilters({
      minMatchScore: 0,
      location: '',
      searchTerm: ''
    });
    fetchJobs(1);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const { currentPage, totalPages } = pagination;
    
    console.log(`Generating pagination numbers: currentPage=${currentPage}, totalPages=${totalPages}`);
    
    let pages = [];

    if (totalPages <= 7) {
      // Less than 7 pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Current page is in the first 3 pages
      if (currentPage <= 3) {
        pages.push(2, 3, 4, '...', totalPages);
      }
      // Current page is in the last 3 pages
      else if (currentPage >= totalPages - 2) {
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      }
      // Current page is somewhere in the middle
      else {
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Job Recommendations</h1>
            <button 
              onClick={() => fetchJobs(1, true)} // refresh=true
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : "Refresh Jobs"}
            </button>
          </div>
          
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Search jobs by title, company..."
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Filter by location..."
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. Match Score: {filters.minMatchScore}%
                </label>
                <input
                  type="range"
                  name="minMatchScore"
                  min="0"
                  max="100"
                  value={filters.minMatchScore}
                  onChange={handleFilterChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Jobs List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Showing {(pagination.currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalJobs)} of {pagination.totalJobs} jobs
                  </p>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job._id || job.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">{job.title}</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                              {Math.round((job.matchScore || 0) * 100)}% Match
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {job.company} • {job.location}
                          </p>
                          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                            {job.description?.substring(0, 150)}...
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {job.skills?.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                            {job.skills?.length > 5 && (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <span className="text-xs text-gray-500">
                          {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Unknown date'}
                        </span>
                        <div>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View Details &rarr;
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Debug info for pagination */}
              <div className="text-xs text-gray-500 mt-2 mb-2">
                Page {pagination.currentPage} of {pagination.totalPages} (Total: {pagination.totalJobs} jobs)
              </div>

              {/* Pagination - Added force display */}
              <div className="flex items-center justify-center py-6 space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-2 py-2 rounded-md ${
                    pagination.currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {getPaginationNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-indigo-600 text-white'
                        : page === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={page === '...'}
                    aria-label={page === '...' ? 'More pages' : `Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-2 py-2 rounded-md ${
                    pagination.currentPage === pagination.totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Next Page"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.minMatchScore > 0 || filters.location || filters.searchTerm 
                  ? "No jobs match your current filters. Try adjusting your filter criteria."
                  : "We couldn't find any job recommendations. Try uploading your resume or adding skills to your profile."
                }
              </p>
              {(filters.minMatchScore > 0 || filters.location || filters.searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;