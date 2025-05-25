import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: '', id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsFilters, setAuditLogsFilters] = useState({
    action: '',
    targetType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit-logs') {
      fetchAuditLogs();
    }
  }, [activeTab, auditLogsPage, auditLogsFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, filesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/admin/files', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: auditLogsPage,
        ...auditLogsFilters
      });

      const response = await axios.get(
        `http://localhost:5000/api/admin/audit-logs?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setAuditLogs(response.data.logs);
      setAuditLogsTotal(response.data.total);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching audit logs');
    }
  };

  const updateUserStatus = async (userId, status) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting file');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ show: false, type: '', id: null });
    }
  };

  const showConfirmDialog = (type, id) => {
    setConfirmDialog({ show: true, type, id });
  };

  const ConfirmDialog = () => {
    if (!confirmDialog.show) return null;

    const messages = {
      deleteFile: 'Are you sure you want to delete this file? This action cannot be undone.',
      suspendUser: 'Are you sure you want to suspend this user? They will not be able to access the platform.',
      activateUser: 'Are you sure you want to activate this user?'
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
          <p className="text-gray-600 mb-6">{messages[confirmDialog.type]}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setConfirmDialog({ show: false, type: '', id: null })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (confirmDialog.type === 'deleteFile') {
                  handleDeleteFile(confirmDialog.id);
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const ErrorMessage = () => {
    if (!error) return null;
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
        <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={() => setError(null)}
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getFilteredData = (data) => {
    return data.filter(item => {
      const matchesSearch = 
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  };

  const SearchBar = () => (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );

  const FilterDropdown = () => (
    <div className="mb-4">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );

  const Pagination = ({ totalItems, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    );
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const renderDashboard = () => {
    if (!stats) return null;

    const userActivityData = {
      labels: stats.userActivity.map(activity => activity._id),
      datasets: [
        {
          label: 'Upload Count',
          data: stats.userActivity.map(activity => activity.uploadCount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Files</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalFiles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Storage</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalStorage} rows
          </p>
        </div>

        <div className="col-span-full bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <Bar data={userActivityData} />
        </div>

        <div className="col-span-full bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">File Name</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUploads.map((upload) => (
                  <tr key={upload._id}>
                    <td className="px-4 py-2">{upload.fileName}</td>
                    <td className="px-4 py-2">{upload.userId.email}</td>
                    <td className="px-4 py-2">
                      {new Date(upload.uploadDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = getFilteredData(users);
    const sortedUsers = getSortedData(filteredUsers);
    const paginatedUsers = getPaginatedData(sortedUsers);

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <SearchBar />
          <FilterDropdown />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('email')}
                >
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={user.status}
                      onChange={(e) => {
                        if (e.target.value === 'suspended') {
                          showConfirmDialog('suspendUser', user._id);
                        } else if (e.target.value === 'active') {
                          showConfirmDialog('activateUser', user._id);
                        } else {
                          updateUserStatus(user._id, e.target.value);
                        }
                      }}
                      className="p-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users found matching your search criteria
            </div>
          ) : (
            <Pagination
              totalItems={sortedUsers.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    );
  };

  const renderFiles = () => {
    const filteredFiles = getFilteredData(files);
    const sortedFiles = getSortedData(filteredFiles);
    const paginatedFiles = getPaginatedData(sortedFiles);

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">File Management</h3>
        <SearchBar />
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('fileName')}
                >
                  File Name {sortConfig.key === 'fileName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('userId.email')}
                >
                  User {sortConfig.key === 'userId.email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('uploadDate')}
                >
                  Upload Date {sortConfig.key === 'uploadDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map((file) => (
                <tr key={file._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{file.fileName}</td>
                  <td className="px-4 py-2">{file.userId.email}</td>
                  <td className="px-4 py-2">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => showConfirmDialog('deleteFile', file._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedFiles.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No files found matching your search criteria
            </div>
          ) : (
            <Pagination
              totalItems={sortedFiles.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    );
  };

  const renderAuditLogs = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Audit Logs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={auditLogsFilters.action}
            onChange={(e) => setAuditLogsFilters(prev => ({ ...prev, action: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="user_status_update">User Status Update</option>
            <option value="file_delete">File Delete</option>
            <option value="user_delete">User Delete</option>
            <option value="file_access">File Access</option>
          </select>

          <select
            value={auditLogsFilters.targetType}
            onChange={(e) => setAuditLogsFilters(prev => ({ ...prev, targetType: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="file">File</option>
          </select>

          <input
            type="date"
            value={auditLogsFilters.startDate}
            onChange={(e) => setAuditLogsFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={auditLogsFilters.endDate}
            onChange={(e) => setAuditLogsFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Target Type</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{log.adminId.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      log.action === 'user_status_update' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'file_delete' ? 'bg-red-100 text-red-800' :
                      log.action === 'user_delete' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.targetType}</td>
                  <td className="px-4 py-2">
                    <pre className="text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                  <td className="px-4 py-2">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No audit logs found matching your criteria
            </div>
          ) : (
            <Pagination
              totalItems={auditLogsTotal}
              currentPage={auditLogsPage}
              onPageChange={setAuditLogsPage}
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <ErrorMessage />
      <ConfirmDialog />
      
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={actionLoading}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={actionLoading}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === 'files'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={actionLoading}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              activeTab === 'audit-logs'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={actionLoading}
          >
            Audit Logs
          </button>
        </nav>
      </div>

      {actionLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Processing...
        </div>
      )}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'files' && renderFiles()}
      {activeTab === 'audit-logs' && renderAuditLogs()}
    </div>
  );
};

export default AdminPanel; 