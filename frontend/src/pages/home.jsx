import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Excel Analytics Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
              <Link to="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Excel Analytics Platform</h1>
            <p className="text-xl text-gray-600 mb-8">Analyze your Excel data with powerful tools and visualizations</p>
            <div className="space-x-4">
              <Link to="/login" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600">Get Started</Link>
              <Link to="/signup" className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600">Create Account</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
