export interface MatrixCell {
  id: string;
  shapes: Shape[];
  position: { row: number; col: number };
  transformations?: Transformation[];
}

export interface Shape {
  type: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon' | 'cross' | 'line' | 'cube' | 'sphere' | 'pyramid' | 'cylinder' | 'octahedron' | 'torus' | 'dodecahedron' | 'icosahedron' | 'tetrahedron' | 'prism' | 'cone' | 'ellipsoid' | 'frustum' | 'hyperboloid' | 'paraboloid' | 'helicoid';
  size: 'small' | 'medium' | 'large';
  color: 'black' | 'white' | 'gray' | 'transparent';
  rotation: number; // degrees
  opacity: number;
  position: { x: number; y: number };
  fill: 'solid' | 'outline' | 'striped' | 'dotted';
}

export interface Transformation {
  type: 'rotate' | 'scale' | 'translate' | 'skew' | 'flip';
  value: number | string;
  axis?: 'x' | 'y' | 'both';
}

export interface PatternRule {
  type: 'rotation' | 'reflection' | 'progression' | 'symmetry' | 'alternation' | 'recursion' | 'xor' | 'arithmetic' | 'transformation';
  description: string;
  complexity: 'easy' | 'medium' | 'hard' | 'expert';
  parameters: any;
}

export interface IQQuestion {
  id: number;
  category: 'Pattern Recognition' | 'Spatial Reasoning' | 'Logical Deduction' | 'Mathematical Patterns' | 'Visual Memory';
  type: 'matrix' | 'sequence' | 'analogy' | 'completion' | 'transformation';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit: number; // seconds
  question: {
    matrix?: MatrixCell[][];
    sequence?: Shape[];
    description: string;
    visualElements: VisualElement[];
  };
  options: AnswerOption[];
  correctAnswer: number;
  explanation: string;
  patternRules: PatternRule[];
  visualComplexity: number; // 1-10 scale
  logicSteps: number; // number of reasoning steps required
}

export interface AnswerOption {
  id: string;
  content: VisualElement[];
  isCorrect: boolean;
  distractors: string[]; // why this option is wrong
}

export interface VisualElement {
  type: 'shape' | 'grid' | 'pattern' | 'animation' | 'interaction';
  data: any;
  style: React.CSSProperties;
}

export interface TestSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  answers: Answer[];
  score?: number;
  timeSpent: number;
  email?: string;
  paymentStatus: 'pending' | 'completed' | 'locked';
}

export interface Answer {
  questionId: number;
  selectedOption: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface TestProgress {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  answeredQuestions: Set<number>;
  confidence: number; // 1-10 scale
}

export interface UserProfile {
  email: string;
  testHistory: TestSession[];
  averageScore: number;
  bestScore: number;
  totalTests: number;
  memberSince: Date;
} 