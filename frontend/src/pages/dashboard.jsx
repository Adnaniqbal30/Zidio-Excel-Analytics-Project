import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../components/UserManagement';
import FileUpload from '../components/FileUpload';
import ChartVisualization from '../components/ChartVisualization';
import UploadHistory from '../components/UploadHistory';

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token', error);
        setRole('');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileSelect = (fileId) => {
    setSelectedFileId(fileId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900">
        <div className="text-2xl font-bold text-white animate-pulse flex items-center space-x-3">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="bg-black/20 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 animate-gradient">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="group relative px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full overflow-hidden hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative">
        <div className="px-4 py-6 sm:px-0">
          {role === 'admin' ? (
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 animate-gradient">Welcome Admin!</h2>
                <p className="text-white/80 mt-2 text-lg">You have full access to all features.</p>
              </div>
              <div className="bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10">
                <UserManagement />
              </div>
            </div>
          ) : role === 'user' ? (
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 animate-gradient">Welcome User!</h2>
                <p className="text-white/80 mt-2 text-lg">You have access to basic features.</p>
              </div>
              
              {/* File Upload Section */}
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 animate-gradient">Upload Excel File</h3>
                <FileUpload onFileUploaded={handleFileSelect} />
              </div>

              {/* Upload History Section */}
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 animate-gradient">Upload History</h3>
                <UploadHistory onFileSelect={handleFileSelect} />
              </div>

              {/* Chart Visualization Section */}
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 animate-gradient">Data Visualization</h3>
                {selectedFileId ? (
                  <ChartVisualization fileId={selectedFileId} />
                ) : (
                  <div className="text-center text-white/60 py-12 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/40 group-hover:text-white/60 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg group-hover:text-white/80 transition-colors duration-300">Please select a file from the upload history to view its visualization</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 text-center">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400 animate-gradient">Access Denied</h2>
              <p className="text-white/80 mt-2 text-lg">Your role is not recognized. Please contact support.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
