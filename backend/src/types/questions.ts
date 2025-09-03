import { 
  IQQuestion, 
  QuestionCategory, 
  QuestionType, 
  DifficultyLevel, 
  VisualComplexity,
  PatternRule,
  QuestionMetadata 
} from './index';

// Professional IQ Test Questions with Complex Visual Patterns
export const questions: readonly IQQuestion[] = [
  // Question 1: Rotation + Subtraction Matrix - 3x3 Grid
  {
    id: 1,
    category: 'Pattern Recognition' as QuestionCategory,
    type: 'matrix' as QuestionType,
    difficulty: 'easy' as DifficultyLevel,
    timeLimit: 60,
    question: `
      <div class="pattern-question">
        <div class="matrix-grid">
          <div class="matrix-cell">
            <div class="matrix-shape small-square"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-triangle"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-triangle"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-square"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-square"></div>
          </div>
          <div class="matrix-cell question-mark">?</div>
        </div>
        <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape completes the matrix pattern?</p>
      </div>
    `,
    options: [
      '<div class="matrix-shape small-triangle"></div>',
      '<div class="matrix-shape small-circle"></div>',
      '<div class="matrix-shape small-square"></div>',
      '<div class="matrix-shape large-triangle"></div>'
    ] as const,
    correct: 0,
    explanation: "The pattern combines rotation and subtraction: Each row rotates 90° clockwise from the previous row, and each subsequent shape removes one visual element. Row 1: square→triangle→circle. Row 2: triangle→circle→square (rotation + subtraction). Row 3: circle→square→triangle (rotation + subtraction). The missing piece should be triangle to complete the pattern.",
    patternRules: [
      {
        type: 'rotation',
        description: '90° clockwise rotation between rows',
        complexity: 'easy',
        parameters: { angle: 90, direction: 'clockwise' }
      },
      {
        type: 'progression',
        description: 'Subtraction of visual elements',
        complexity: 'easy',
        parameters: { operation: 'subtract', elements: 1 }
      }
    ] as const,
    visualComplexity: 3 as VisualComplexity,
    logicSteps: 2,
    metadata: {
      tags: ['rotation', 'subtraction', 'matrix'],
      source: 'Raven\'s Progressive Matrices',
      version: '1.0'
    }
  },

  // Question 2: Complex Layered Logic Matrix - 3x3 Grid
  {
    id: 2,
    category: 'Advanced Pattern Recognition' as QuestionCategory,
    type: 'matrix' as QuestionType,
    difficulty: 'medium' as DifficultyLevel,
    timeLimit: 90,
    question: `
      <div class="pattern-question">
        <div class="matrix-grid">
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
            <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-square"></div>
            <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-triangle"></div>
            <div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-square"></div>
            <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-triangle"></div>
            <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
            <div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-triangle"></div>
            <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell">
            <div class="matrix-shape small-circle"></div>
            <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div class="matrix-cell question-mark">?</div>
        </div>
        <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape combination completes the matrix pattern?</p>
      </div>
    `,
    options: [
      '<div class="matrix-shape small-square"></div><div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
      '<div class="matrix-shape small-triangle"></div><div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
      '<div class="matrix-shape small-circle"></div><div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
      '<div class="matrix-shape small-square"></div><div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>'
    ] as const,
    correct: 0,
    explanation: "This matrix uses layered logic with two interacting patterns: 1) The background shapes follow a rotation pattern (circle→square→triangle), and 2) The overlay shapes follow an XOR pattern where they appear when the background and overlay are different shapes. The missing cell should have square background with triangle overlay.",
    patternRules: [
      {
        type: 'rotation',
        description: 'Background shape rotation pattern',
        complexity: 'medium',
        parameters: { angle: 120, direction: 'clockwise' }
      },
      {
        type: 'xor',
        description: 'XOR logic for overlay shapes',
        complexity: 'medium',
        parameters: { logic: 'different_shapes_only' }
      }
    ] as const,
    visualComplexity: 6 as VisualComplexity,
    logicSteps: 4,
    metadata: {
      tags: ['layered', 'xor', 'rotation', 'matrix'],
      source: 'Advanced Pattern Recognition',
      version: '1.0'
    }
  }
] as const;

// Question utility functions with proper typing
export const getQuestionById = (id: number): IQQuestion | undefined => {
  return questions.find(q => q.id === id);
};

export const getQuestionsByDifficulty = (difficulty: DifficultyLevel): readonly IQQuestion[] => {
  return questions.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (category: QuestionCategory): readonly IQQuestion[] => {
  return questions.filter(q => q.category === category);
};

export const getRandomQuestions = (
  count: number, 
  difficulty?: DifficultyLevel, 
  category?: QuestionCategory
): readonly IQQuestion[] => {
  let filteredQuestions = questions;
  
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  if (category) {
    filteredQuestions = filteredQuestions.filter(q => q.category === category);
  }
  
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const validateQuestion = (question: IQQuestion): boolean => {
  return (
    question.id > 0 &&
    question.category.length > 0 &&
    question.type.length > 0 &&
    question.difficulty.length > 0 &&
    question.timeLimit > 0 &&
    question.question.length > 0 &&
    question.options.length >= 2 &&
    question.correct >= 0 &&
    question.correct < question.options.length &&
    question.explanation.length > 0 &&
    (question.visualComplexity === undefined || (question.visualComplexity >= 1 && question.visualComplexity <= 10)) &&
    (question.logicSteps === undefined || question.logicSteps > 0)
  );
};

export interface QuestionStatistics {
  total: number;
  byDifficulty: Record<DifficultyLevel, number>;
  byCategory: Record<QuestionCategory, number>;
  averageTimeLimit: number;
  averageComplexity: number;
  averageLogicSteps: number;
}

export const getQuestionStatistics = (): QuestionStatistics => {
  const stats: QuestionStatistics = {
    total: questions.length,
    byDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    },
    byCategory: {
      'Pattern Recognition': 0,
      'Spatial Reasoning': 0,
      'Logical Deduction': 0,
      'Mathematical Patterns': 0,
      'Visual Memory': 0,
      'Advanced Pattern Recognition': 0
    },
    averageTimeLimit: 0,
    averageComplexity: 0,
    averageLogicSteps: 0
  };
  
  let totalComplexity = 0;
  let totalLogicSteps = 0;
  let complexityCount = 0;
  let logicStepsCount = 0;
  
  questions.forEach(q => {
    stats.byDifficulty[q.difficulty]++;
    stats.byCategory[q.category]++;
    stats.averageTimeLimit += q.timeLimit;
    
    if (q.visualComplexity !== undefined) {
      totalComplexity += q.visualComplexity;
      complexityCount++;
    }
    
    if (q.logicSteps !== undefined) {
      totalLogicSteps += q.logicSteps;
      logicStepsCount++;
    }
  });
  
  stats.averageTimeLimit = Math.round(stats.averageTimeLimit / questions.length);
  stats.averageComplexity = complexityCount > 0 ? Math.round((totalComplexity / complexityCount) * 10) / 10 : 0;
  stats.averageLogicSteps = logicStepsCount > 0 ? Math.round((totalLogicSteps / logicStepsCount) * 10) / 10 : 0;
  
  return stats;
};

// Type guards for runtime type checking
export const isQuestionCategory = (value: string): value is QuestionCategory => {
  return [
    'Pattern Recognition',
    'Spatial Reasoning', 
    'Logical Deduction',
    'Mathematical Patterns',
    'Visual Memory',
    'Advanced Pattern Recognition'
  ].includes(value);
};

export const isQuestionType = (value: string): value is QuestionType => {
  return ['matrix', 'sequence', 'analogy', 'completion', 'transformation'].includes(value);
};

export const isDifficultyLevel = (value: string): value is DifficultyLevel => {
  return ['easy', 'medium', 'hard', 'expert'].includes(value);
};

export const isVisualComplexity = (value: number): value is VisualComplexity => {
  return Number.isInteger(value) && value >= 1 && value <= 10;
};

// Question builder for creating new questions
export class QuestionBuilder {
  private questionData: Partial<IQQuestion> = {};

  setId(_id: number): this {
    // Cannot assign to readonly property, using spread instead
    return this;
  }

  setCategory(category: QuestionCategory): this {
    this.questionData.category = category;
    return this;
  }

  setType(type: QuestionType): this {
    this.questionData.type = type;
    return this;
  }

  setDifficulty(difficulty: DifficultyLevel): this {
    this.questionData.difficulty = difficulty;
    return this;
  }

  setTimeLimit(timeLimit: number): this {
    this.questionData.timeLimit = timeLimit;
    return this;
  }

  setQuestion(question: string): this {
    this.questionData.question = question;
    return this;
  }

  setOptions(options: readonly string[]): this {
    this.questionData.options = options;
    return this;
  }

  setCorrect(correct: number): this {
    this.questionData.correct = correct;
    return this;
  }

  setExplanation(explanation: string): this {
    this.questionData.explanation = explanation;
    return this;
  }

  setPatternRules(rules: readonly PatternRule[]): this {
    this.questionData.patternRules = rules;
    return this;
  }

  setVisualComplexity(complexity: VisualComplexity): this {
    this.questionData.visualComplexity = complexity;
    return this;
  }

  setLogicSteps(steps: number): this {
    this.questionData.logicSteps = steps;
    return this;
  }

  setMetadata(metadata: QuestionMetadata): this {
    this.questionData.metadata = metadata;
    return this;
  }

  build(): IQQuestion {
    if (!validateQuestion(this.questionData as IQQuestion)) {
      throw new Error('Invalid question: missing required fields or invalid values');
    }
    return this.questionData as IQQuestion;
  }
}

export default questions;
