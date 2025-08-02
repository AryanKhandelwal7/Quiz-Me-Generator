import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';

// Components
import Home from './components/Home';
import QuizInterface from './components/QuizInterface';
import Results from './components/Results';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
    overflow-x: hidden;
  }

  html {
    scroll-behavior: smooth;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input {
    outline: none;
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const BackgroundAnimation = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.1;
`;

const Circle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: white;
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <BackgroundAnimation>
          <Circle
            style={{
              width: '300px',
              height: '300px',
              top: '10%',
              left: '10%',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <Circle
            style={{
              width: '200px',
              height: '200px',
              top: '60%',
              right: '10%',
            }}
            animate={{
              y: [0, 30, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <Circle
            style={{
              width: '150px',
              height: '150px',
              bottom: '20%',
              left: '20%',
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, 25, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </BackgroundAnimation>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<QuizInterface />} />
          <Route path="/results" element={<Results />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AppContainer>
    </Router>
  );
}

export default App;