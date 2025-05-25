import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const UploadHistory = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/excel/files', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    try {
      setSelectedFile(file);
      onFileSelect(file._id);
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const handleDeleteClick = (file, e) => {
    e.stopPropagation(); // Prevent file selection when clicking delete
    setFileToDelete(file);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/excel/files/${fileToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove the deleted file from the list
      setFiles(files.filter(f => f._id !== fileToDelete._id));
      
      // If the deleted file was selected, clear the selection
      if (selectedFile?._id === fileToDelete._id) {
        setSelectedFile(null);
        onFileSelect(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setDeleteLoading(false);
      setShowConfirmDialog(false);
      setFileToDelete(null);
    }
  };

  const downloadChart = async (format) => {
    if (!selectedFile) return;

    try {
      const chartCanvas = document.querySelector('#chart-container canvas');
      if (!chartCanvas) {
        console.error('Chart canvas not found');
        return;
      }

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${selectedFile.fileName}-chart.png`;
        link.href = chartCanvas.toDataURL('image/png', 1.0);
        link.click();
      } else if (format === 'pdf') {
        const canvas = await html2canvas(chartCanvas, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${selectedFile.fileName}-chart.pdf`);
      }
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        Upload History
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedFile?._id === file._id
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white hover:shadow-xl border border-gray-100'
            }`}
            onClick={() => handleFileSelect(file)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg truncate">
                {file.fileName}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDeleteClick(file, e)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    selectedFile?._id === file._id
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-red-50 hover:bg-red-100'
                  }`}
                  title="Delete file"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className={`p-2 rounded-full ${
                  selectedFile?._id === file._id
                    ? 'bg-white/20'
                    : 'bg-indigo-50'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-sm flex items-center ${
                selectedFile?._id === file._id
                  ? 'text-white/80'
                  : 'text-gray-500'
              }`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
              </p>
              <p className={`text-sm flex items-center ${
                selectedFile?._id === file._id
                  ? 'text-white/80'
                  : 'text-gray-500'
              }`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Columns: {file.headers.length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => downloadChart('png')}
            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Download PNG
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={() => downloadChart('pdf')}
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{fileToDelete?.fileName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory; 