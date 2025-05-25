const mongoose = require('mongoose');

const excelDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  headers: {
    type: Array,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExcelData', excelDataSchema); 