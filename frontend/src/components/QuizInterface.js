import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const Container = styled(motion.div)`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled(motion.div)`
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const QuizInfo = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Timer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const QuizCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 900px;
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
`;

const QuestionContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const QuestionNumber = styled.h3`
  color: #667eea;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const QuestionText = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Option = styled(motion.button)`
  padding: 1.5rem;
  border: 2px solid ${props => {
    if (props.isSelected && props.isCorrect) return '#10b981';
    if (props.isSelected && !props.isCorrect) return '#ef4444';
    if (props.isCorrect && props.showAnswer) return '#10b981';
    if (props.isSelected) return '#667eea';
    return '#e2e8f0';
  }};
  border-radius: 15px;
  background: ${props => {
    if (props.isSelected && props.isCorrect) return 'rgba(16, 185, 129, 0.1)';
    if (props.isSelected && !props.isCorrect) return 'rgba(239, 68, 68, 0.1)';
    if (props.isCorrect && props.showAnswer) return 'rgba(16, 185, 129, 0.1)';
    if (props.isSelected) return 'rgba(102, 126, 234, 0.1)';
    return 'white';
  }};
  text-align: left;
  font-size: 1.1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const OptionText = styled.span`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const OptionLetter = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isSelected ? 'white' : '#f8f9fa'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${props => props.isSelected ? '#667eea' : '#666'};
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
`;

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

const NavButton = styled(motion.button)`
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(NavButton)`
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #666;

  &:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
  }
`;

const NextButton = styled(NavButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const HomeButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  padding: 1rem;
  color: #666;
  
  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const ExplanationBox = styled(motion.div)`
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
`;

const QuizInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const quiz = location.state?.quiz;
  const metadata = location.state?.metadata;

  useEffect(() => {
    if (!quiz) {
      toast.error('No quiz data found');
      navigate('/');
      return;
    }
  }, [quiz, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedAnswer
    }));
    setShowAnswer(true);
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      toast.success('Correct!');
    } else {
      toast.error(`Incorrect. The correct answer is ${questions[currentQuestion].correctAnswer}`);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
      setShowAnswer(false);
    } else {
      // Quiz finished
      setIsFinished(true);
      const correctAnswers = Object.entries(userAnswers).filter(
        ([questionIndex, answer]) => answer === questions[questionIndex].correctAnswer
      ).length;
      
      navigate('/results', {
        state: {
          quiz,
          userAnswers,
          totalQuestions,
          correctAnswers,
          timeElapsed,
          metadata
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1] || '');
      setShowAnswer(!!userAnswers[currentQuestion - 1]);
    }
  };

  const currentQ = questions[currentQuestion];
  const hasAnswered = currentQuestion in userAnswers;

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <QuizInfo>
          <span style={{ fontWeight: '600', color: '#333' }}>
            {quiz.title} - {quiz.difficulty.toUpperCase()}
          </span>
        </QuizInfo>
        
        <Timer>
          <Clock size={20} />
          {formatTime(timeElapsed)}
        </Timer>
        
        <HomeButton
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home size={20} />
        </HomeButton>
      </Header>

      <QuizCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBar>

        <AnimatePresence mode="wait">
          <QuestionContainer
            key={currentQuestion}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionNumber>
              Question {currentQuestion + 1} of {totalQuestions}
            </QuestionNumber>
            
            <QuestionText>{currentQ.question}</QuestionText>

            <OptionsContainer>
              {Object.entries(currentQ.options).map(([letter, text]) => {
                const isSelected = selectedAnswer === letter;
                const isCorrect = letter === currentQ.correctAnswer;
                
                return (
                  <Option
                    key={letter}
                    onClick={() => handleAnswerSelect(letter)}
                    isSelected={isSelected}
                    isCorrect={isCorrect}
                    showAnswer={showAnswer}
                    disabled={showAnswer}
                    whileHover={{ scale: showAnswer ? 1 : 1.02 }}
                    whileTap={{ scale: showAnswer ? 1 : 0.98 }}
                  >
                    <OptionText>
                      <OptionLetter isSelected={isSelected}>
                        {letter}
                      </OptionLetter>
                      {text}
                    </OptionText>
                    {showAnswer && (
                      <StatusIcon>
                        {isCorrect && <CheckCircle size={24} color="#10b981" />}
                        {isSelected && !isCorrect && <XCircle size={24} color="#ef4444" />}
                      </StatusIcon>
                    )}
                  </Option>
                );
              })}
            </OptionsContainer>

            {showAnswer && currentQ.explanation && (
              <ExplanationBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <strong>Explanation:</strong> {currentQ.explanation}
              </ExplanationBox>
            )}
          </QuestionContainer>
        </AnimatePresence>

        <NavigationContainer>
          <PrevButton
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={20} />
            Previous
          </PrevButton>

          {!showAnswer ? (
            <NextButton
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Answer
            </NextButton>
          ) : (
            <NextButton
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
              <ChevronRight size={20} />
            </NextButton>
          )}
        </NavigationContainer>
      </QuizCard>
    </Container>
  );
};

export default QuizInterface;