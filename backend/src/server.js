const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const documentProcessor = require('./services/documentProcessor');
const quizGenerator = require('./services/quizGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `document-${uniqueSuffix}${fileExt}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (fileExt === '.pptx') {
      return cb(new Error('PPTX files are not supported. Please use PDF or DOCX files.'));
    }
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are supported.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Basic route - no complex routing
app.get('/api/health', function(req, res) {
  res.json({ 
    status: 'OK', 
    message: 'Quiz Me API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test OpenAI connection
app.get('/api/test-openai', async function(req, res) {
  try {
    console.log('🧪 Testing OpenAI connection...');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not set' });
    }

    const quiz = await quizGenerator.generateQuiz(
      "The sun is a star. It provides light and heat to Earth. The Earth orbits around the sun once every year.", 
      "easy", 
      1
    );
    
    res.json({ 
      success: true, 
      message: 'OpenAI connection working!', 
      sampleQuiz: quiz 
    });
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    res.status(500).json({ 
      error: 'OpenAI test failed', 
      details: error.message 
    });
  }
});

// Upload and process document
app.post('/api/upload-document', function(req, res) {
  upload.single('document')(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
      }
      
      return res.status(400).json({ error: err.message });
    }

    console.log('📄 Document upload request received');
    
    try {
      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { difficulty, questionCount } = req.body;
      
      console.log('📋 Request details:', {
        filename: req.file.originalname,
        size: req.file.size,
        difficulty,
        questionCount
      });
      
      if (!difficulty || !questionCount) {
        console.log('❌ Missing required parameters');
        return res.status(400).json({ 
          error: 'Missing required parameters: difficulty and questionCount' 
        });
      }

      console.log('🔍 Extracting text from document...');
      const documentText = await documentProcessor.extractText(req.file.path, req.file.originalname);
      
      console.log('📄 Raw extracted text preview:', documentText.substring(0, 200) + '...');
      
      if (!documentText || documentText.trim().length === 0) {
        console.log('❌ No text extracted from document');
        return res.status(400).json({ 
          error: 'Could not extract text from the document' 
        });
      }

      console.log(`✅ Text extracted successfully (${documentText.length} characters)`);

      if (!documentProcessor.validateText(documentText)) {
        console.log('❌ Extracted text too short');
        return res.status(400).json({ 
          error: 'Document does not contain enough text for quiz generation (minimum 100 characters required)' 
        });
      }

      console.log('🤖 Generating quiz with OpenAI...');
      console.log('🔑 API Key check:', process.env.OPENAI_API_KEY ? 'API key is set' : 'API key is missing');
      
      const quiz = await quizGenerator.generateQuiz(documentText, difficulty, parseInt(questionCount));
      
      console.log('✅ Quiz generated successfully');

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Warning: Could not clean up temporary file:', cleanupError.message);
      }
      
      res.json({
        success: true,
        quiz: quiz,
        metadata: {
          filename: req.file.originalname,
          difficulty: difficulty,
          questionCount: parseInt(questionCount),
          extractedTextLength: documentText.length,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error processing document:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Temporary file cleaned up after error');
        } catch (cleanupError) {
          console.error('❌ Error cleaning up file:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to process document and generate quiz',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
});

// 404 handler for any other routes
app.use(function(req, res) {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(function(error, req, res, next) {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, function() {
  console.log(`🚀 Quiz Me server is running on port ${PORT}`);
  console.log(`📚 Ready to generate quizzes from your documents!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}).on('error', function(err) {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use!`);
    console.log(`💡 Try one of these solutions:`);
    console.log(`   1. Change PORT in your .env file to a different number (e.g., PORT=3001)`);
    console.log(`   2. Kill the process using port ${PORT}: kill -9 $(lsof -ti:${PORT})`);
    console.log(`   3. Use a different terminal window`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

module.exports = app;