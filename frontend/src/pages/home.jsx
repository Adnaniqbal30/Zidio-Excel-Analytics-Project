import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  console.log("Home component rendered"); // Debug log

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Excel Analytics Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to Excel Analytics Platform
            </h1>
            <p className="text-2xl text-gray-600 mb-12">
              Analyze your Excel data with powerful tools and visualizations
            </p>
            <div className="space-x-6">
              <Link 
                to="/login" 
                className="bg-blue-500 text-white px-8 py-4 rounded-md hover:bg-blue-600 text-lg font-medium"
              >
                Get Started
              </Link>
              <Link 
                to="/signup" 
                className="bg-green-500 text-white px-8 py-4 rounded-md hover:bg-green-600 text-lg font-medium"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
              <p className="text-gray-600">Create beautiful charts and graphs from your Excel data</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">3D Analysis</h3>
              <p className="text-gray-600">View your data in interactive 3D visualizations</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
              <p className="text-gray-600">Get AI-powered insights and analysis of your data</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
