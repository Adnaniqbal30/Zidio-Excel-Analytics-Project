const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelData = require('../models/ExcelData');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Upload Excel file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    // Get headers from the first row
    const headers = Object.keys(data[0] || {});

    // Create new ExcelData document
    const excelData = new ExcelData({
      userId: req.user.id,
      fileName: req.file.originalname,
      data: data,
      headers: headers
    });

    await excelData.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'File uploaded and processed successfully',
      data: {
        id: excelData._id,
        fileName: excelData.fileName,
        headers: excelData.headers,
        rowCount: excelData.data.length
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Get user's uploaded files
router.get('/files', auth, async (req, res) => {
  try {
    const files = await ExcelData.find({ userId: req.user.id })
      .select('fileName uploadDate headers')
      .sort({ uploadDate: -1 });
    
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

// Get specific file data
router.get('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelData.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file data', error: error.message });
  }
});

// Delete file
router.delete('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelData.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    await ExcelData.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

module.exports = router; 