import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { IQQuestion, TestProgress, Answer } from '../types/IQTest';
import { MatrixRenderer } from './MatrixRenderer';
import { Brain, Clock, Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface IQTestProps {
  questions: IQQuestion[];
  onTestComplete: (answers: Answer[], timeSpent: number) => void;
  onExit: () => void;
}

const TestContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 4px;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 600;
`;

const QuestionContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  color: #333;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
`;

const QuestionNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
`;

const QuestionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const InfoBadge = styled.div<{ type: 'category' | 'difficulty' | 'time' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  
  ${props => {
    switch (props.type) {
      case 'category':
        return 'background: #dbeafe; color: #1e40af;';
      case 'difficulty':
        return 'background: #fef3c7; color: #d97706;';
      case 'time':
        return 'background: #dcfce7; color: #16a34a;';
      default:
        return '';
    }
  }}
`;

const QuestionDescription = styled.p`
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 500;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 30px;
`;

const OptionButton = styled(motion.button)<{ isSelected: boolean; isCorrect?: boolean }>`
  padding: 20px;
  border: 3px solid ${props => props.isSelected ? '#667eea' : '#e5e7eb'};
  border-radius: 16px;
  background: ${props => props.isSelected ? '#f0f4ff' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
  
  ${props => props.isCorrect === true && `
    border-color: #22c55e;
    background: #f0fdf4;
  `}
  
  ${props => props.isCorrect === false && `
    border-color: #ef4444;
    background: #fef2f2;
  `}
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
`;

const NavButton = styled(motion.button)<{ variant: 'primary' | 'secondary' }>`
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `}
`;

const ConfidenceSlider = styled.div`
  margin: 30px 0;
  text-align: center;
`;

const SliderLabel = styled.label`
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: #374151;
`;

const Slider = styled.input`
  width: 100%;
  max-width: 400px;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ConfidenceValue = styled.span`
  display: inline-block;
  margin-left: 15px;
  font-weight: 600;
  color: #667eea;
`;

export const IQTest: React.FC<IQTestProps> = ({
  questions,
  onTestComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(questions[0]?.timeLimit || 120);
  const [testStartTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const answeredQuestions = new Set(answers.map(a => a.questionId));

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, currentQuestionIndex]);

  // Reset timer for new question
  useEffect(() => {
    setTimeRemaining(currentQuestion?.timeLimit || 120);
    setSelectedOption(null);
    setConfidence(5);
    setShowExplanation(false);
  }, [currentQuestionIndex, currentQuestion]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    setSelectedOption(optionIndex);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (selectedOption !== null) {
      const answer: Answer = {
        questionId: currentQuestion.id,
        selectedOption,
        timeSpent: (currentQuestion.timeLimit || 120) - timeRemaining,
        isCorrect: selectedOption === currentQuestion.correctAnswer
      };

      setAnswers(prev => [...prev, answer]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const totalTimeSpent = Date.now() - testStartTime;
      onTestComplete(answers, totalTimeSpent);
    }
  }, [selectedOption, currentQuestion, currentQuestionIndex, questions.length, timeRemaining, answers, testStartTime, onTestComplete]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      case 'expert': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <TestContainer>
      <Header>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Advanced IQ Test</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Professional Pattern Recognition</p>
        </div>
        
        <ProgressSection>
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </ProgressBar>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {answeredQuestions.size} answered
            </div>
          </div>
          
          <Timer>
            <Clock size={20} />
            {formatTime(timeRemaining)}
          </Timer>
        </ProgressSection>
      </Header>

      <QuestionContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <QuestionHeader>
          <QuestionNumber>Q{currentQuestion.id}</QuestionNumber>
          
          <QuestionInfo>
            <InfoBadge type="category">
              <Brain size={16} />
              {currentQuestion.category}
            </InfoBadge>
            
            <InfoBadge type="difficulty">
              <Target size={16} />
              {currentQuestion.difficulty.toUpperCase()}
            </InfoBadge>
            
            <InfoBadge type="time">
              <Clock size={16} />
              {currentQuestion.timeLimit}s
            </InfoBadge>
          </QuestionInfo>
        </QuestionHeader>

        <QuestionDescription>{currentQuestion.question.description}</QuestionDescription>

        {currentQuestion.question.matrix && (
          <MatrixRenderer
            matrix={currentQuestion.question.matrix}
            highlightMissing={true}
          />
        )}

        <ConfidenceSlider>
          <SliderLabel>
            How confident are you in your answer? (1-10)
          </SliderLabel>
          <Slider
            type="range"
            min="1"
            max="10"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
          <ConfidenceValue>{confidence}/10</ConfidenceValue>
        </ConfidenceSlider>

        <OptionsContainer>
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={option.id}
              isSelected={selectedOption === index}
              onClick={() => handleOptionSelect(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.content.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {option.content.map((element, elementIndex) => (
                    <div
                      key={elementIndex}
                      style={{
                        ...element.style,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {/* Render the actual shape based on the data */}
                      {element.data.type === 'circle' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            borderRadius: '50%',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'square' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            borderRadius: '4px',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'triangle' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'diamond' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            borderRadius: '4px',
                            transform: `rotate(${element.data.rotation + 45}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'star' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'hexagon' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'cross' && (
                        <div
                          style={{
                            width: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.fill === 'outline' ? 'transparent' : element.data.color,
                            border: element.data.fill === 'outline' ? `2px solid ${element.data.color}` : 'none',
                            clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)',
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                      {element.data.type === 'line' && (
                        <div
                          style={{
                            width: '4px',
                            height: element.data.size === 'small' ? '20px' : element.data.size === 'large' ? '48px' : '32px',
                            background: element.data.color,
                            transform: `rotate(${element.data.rotation}deg)`,
                            opacity: element.data.opacity
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#667eea', marginTop: '5px' }}>
                    Option {String.fromCharCode(65 + index)}
                  </div>
                </div>
              ) : (
                <div>
                  Option {String.fromCharCode(65 + index)}
                </div>
              )}
            </OptionButton>
          ))}
        </OptionsContainer>

        <NavigationButtons>
          <NavButton
            variant="secondary"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </NavButton>

          <div style={{ display: 'flex', gap: '15px' }}>
            <NavButton
              variant="secondary"
              onClick={onExit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Exit Test
            </NavButton>

            <NavButton
              variant="primary"
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
            </NavButton>
          </div>
        </NavigationButtons>
      </QuestionContainer>
    </TestContainer>
  );
}; 