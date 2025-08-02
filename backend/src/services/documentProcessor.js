const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentProcessor {
  async extractText(filePath, originalName) {
    const fileExtension = path.extname(originalName).toLowerCase();
    
    try {
      switch (fileExtension) {
        case '.pdf':
          return await this.extractFromPDF(filePath);
        case '.docx':
          return await this.extractFromDOCX(filePath);
        case '.pptx':
          throw new Error('PPTX support is temporarily disabled. Please use PDF or DOCX files.');
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error(`Error extracting text from ${originalName}:`, error);
      throw new Error(`Failed to extract text from ${fileExtension} file: ${error.message}`);
    }
  }

  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return this.cleanText(data.text);
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.cleanText(result.value);
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  // Utility method to clean and prepare text for quiz generation
  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .replace(/[^\w\s.,;:!?()-]/g, '') // Remove special characters but keep basic punctuation
      .trim();
  }

  // Validate extracted text
  validateText(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }
    
    const cleanedText = this.cleanText(text);
    return cleanedText.length >= 100; // Minimum 100 characters for meaningful quiz
  }
}

module.exports = new DocumentProcessor();