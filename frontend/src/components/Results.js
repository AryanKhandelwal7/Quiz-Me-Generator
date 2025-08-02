import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Trophy, Target, Clock, FileText, Home, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const Container = styled(motion.div)`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResultsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 1000px;
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ScoreCircle = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${props => props.grade >= 80 ? 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
    props.grade >= 60 ?
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  };
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: white;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
`;

const ScoreText = styled.div`
  font-size: 3rem;
  font-weight: 700;
`;

const ScoreSubtext = styled.div`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuestionReview = styled.div`
  margin-bottom: 3rem;
`;

const ReviewTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuestionItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.isCorrect ? '#10b981' : '#ef4444'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionText = styled.div`
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 1rem;
`;

const QuestionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  font-weight: 600;
`;

const AnswerDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.9rem;
`;

const AnswerItem = styled.div`
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 1rem;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #666;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    quiz,
    userAnswers,
    totalQuestions,
    correctAnswers,
    timeElapsed,
    metadata
  } = location.state || {};

  if (!quiz || !userAnswers) {
    navigate('/');
    return null;
  }

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const grade = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Improvement';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = () => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResultsCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Header>
          <ScoreCircle
            grade={percentage}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ScoreText>{percentage}%</ScoreText>
            <ScoreSubtext>{grade}</ScoreSubtext>
          </ScoreCircle>
          
          <Title>Quiz Complete!</Title>
          <Subtitle>
            You answered {correctAnswers} out of {totalQuestions} questions correctly
          </Subtitle>
        </Header>

        <StatsGrid>
          <StatCard
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <StatIcon color="#667eea">
              <Target size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{correctAnswers}/{totalQuestions}</StatValue>
              <StatLabel>Correct Answers</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <StatIcon color="#10b981">
              <Trophy size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{percentage}%</StatValue>
              <StatLabel>Score</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <StatIcon color="#f59e0b">
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{formatTime(timeElapsed)}</StatValue>
              <StatLabel>Time Taken</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <StatIcon color="#8b5cf6">
              <FileText size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{quiz.difficulty.toUpperCase()}</StatValue>
              <StatLabel>Difficulty</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <QuestionReview>
          <ReviewTitle>
            <FileText size={24} />
            Question Review
          </ReviewTitle>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <QuestionItem
                key={question.id}
                isCorrect={isCorrect}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
              >
                <QuestionHeader>
                  <QuestionText>
                    {index + 1}. {question.question}
                  </QuestionText>
                  <QuestionStatus isCorrect={isCorrect}>
                    {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </QuestionStatus>
                </QuestionHeader>
                
                <AnswerDetails>
                  <AnswerItem>
                    <strong>Your Answer:</strong> {userAnswer ? `${userAnswer}. ${question.options[userAnswer]}` : 'Not answered'}
                  </AnswerItem>
                  <AnswerItem>
                    <strong>Correct Answer:</strong> {question.correctAnswer}. {question.options[question.correctAnswer]}
                  </AnswerItem>
                </AnswerDetails>
                
                {question.explanation && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </QuestionItem>
            );
          })}
        </QuestionReview>

        <ActionButtons>
          <PrimaryButton
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={20} />
            Create New Quiz
          </PrimaryButton>
          
          <SecondaryButton
            onClick={() => navigate('/quiz', { 
              state: { quiz, metadata } 
            })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
            Retake Quiz
          </SecondaryButton>
        </ActionButtons>
      </ResultsCard>
    </Container>
  );
};

export default Results;