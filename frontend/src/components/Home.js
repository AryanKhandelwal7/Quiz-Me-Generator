import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Brain, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Container = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  width: 100%;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled(motion.p)`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const DropzoneContainer = styled(motion.div)`
  border: 3px dashed ${props => props.isDragActive ? '#667eea' : '#ddd'};
  border-radius: 15px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  margin-bottom: 2rem;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const FileInfo = styled(motion.div)`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SettingsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }
`;

const GenerateButton = styled(motion.button)`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
`;

// Environment-based API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        toast.success('File uploaded successfully!');
      }
    },
    onDropRejected: () => {
      toast.error('Please upload a PDF or DOCX file');
    }
  });

  const handleGenerateQuiz = async () => {
    if (!file) {
      toast.error('Please upload a document first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('difficulty', difficulty);
    formData.append('questionCount', questionCount);

    try {
      console.log('📤 Sending request to backend...');
      console.log('🌐 API URL:', `${API_BASE_URL}/api/upload-document`);
      
      const response = await axios.post(`${API_BASE_URL}/api/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minute timeout for production
      });

      console.log('📥 Response received:', response.data);

      if (response.data.success) {
        toast.success('Quiz generated successfully!');
        navigate('/quiz', { 
          state: { 
            quiz: response.data.quiz,
            metadata: response.data.metadata 
          } 
        });
      } else {
        toast.error('Quiz generation failed - no success flag');
      }
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. The document might be too large or complex.');
      } else if (error.response) {
        console.error('Response error:', error.response.data);
        toast.error(error.response.data?.error || error.response.data?.details || 'Failed to generate quiz');
      } else if (error.request) {
        console.error('Network error:', error.request);
        toast.error('Cannot connect to server. Please try again later.');
      } else {
        console.error('Unknown error:', error.message);
        toast.error('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Quiz Me 🧠
        </Title>
        
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Transform your study materials into interactive quizzes using AI
        </Subtitle>

        <DropzoneContainer
          {...getRootProps()}
          isDragActive={isDragActive}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          <UploadIcon>
            <Upload size={48} color={isDragActive ? '#667eea' : '#999'} />
          </UploadIcon>
          <UploadText>
            {isDragActive
              ? 'Drop your document here...'
              : 'Drag & drop your document here, or click to browse'}
          </UploadText>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>
            Supports PDF and DOCX files
          </p>
        </DropzoneContainer>

        {file && (
          <FileInfo
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FileText size={24} color="#667eea" />
            <div>
              <p style={{ fontWeight: '600', color: '#333' }}>{file.name}</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </FileInfo>
        )}

        <SettingsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <SettingGroup>
            <Label>Difficulty Level</Label>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <Label>Number of Questions</Label>
            <Select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </Select>
          </SettingGroup>
        </SettingsContainer>

        <GenerateButton
          onClick={handleGenerateQuiz}
          disabled={!file || isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {isLoading && (
            <LoadingSpinner
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {isLoading ? 'Generating Quiz...' : (
            <>
              <Brain size={20} style={{ marginRight: '0.5rem' }} />
              Generate Quiz
            </>
          )}
        </GenerateButton>
      </Card>
    </Container>
  );
};

export default Home;