import { IQQuestion, MatrixCell, Shape, PatternRule } from '../types/IQTest';
import { generateRemainingQuestions } from './questionGenerator';

// Helper function to create matrix cells
const createMatrixCell = (
  row: number, 
  col: number, 
  shapes: Shape[], 
  transformations?: any[]
): MatrixCell => ({
  id: `${row}-${col}`,
  shapes,
  position: { row, col },
  transformations
});

// Helper function to create shapes
const createShape = (
  type: Shape['type'],
  size: Shape['size'] = 'medium',
  color: Shape['color'] = 'black',
  rotation: number = 0,
  opacity: number = 1,
  fill: Shape['fill'] = 'solid'
): Shape => ({
  type,
  size,
  color,
  rotation,
  opacity,
  position: { x: 0, y: 0 },
  fill
});

export const advancedQuestions: IQQuestion[] = [
  // Question 1: Multi-Layer Rotation Matrix with XOR Logic
  {
    id: 1,
    category: 'Pattern Recognition',
    type: 'matrix',
    difficulty: 'expert',
    timeLimit: 120,
    question: {
      matrix: [
        [
          createMatrixCell(0, 0, [
            createShape('circle', 'medium', 'black', 0, 1, 'solid'),
            createShape('triangle', 'small', 'white', 45, 0.8, 'outline')
          ]),
          createMatrixCell(0, 1, [
            createShape('square', 'medium', 'black', 90, 1, 'solid'),
            createShape('diamond', 'small', 'white', 135, 0.8, 'outline')
          ]),
          createMatrixCell(0, 2, [
            createShape('triangle', 'medium', 'black', 180, 1, 'solid'),
            createShape('star', 'small', 'white', 225, 0.8, 'outline')
          ])
        ],
        [
          createMatrixCell(1, 0, [
            createShape('diamond', 'medium', 'black', 270, 1, 'solid'),
            createShape('hexagon', 'small', 'white', 315, 0.8, 'outline')
          ]),
          createMatrixCell(1, 1, [
            createShape('star', 'medium', 'black', 0, 1, 'solid'),
            createShape('cross', 'small', 'white', 45, 0.8, 'outline')
          ]),
          createMatrixCell(1, 2, [
            createShape('hexagon', 'medium', 'black', 90, 1, 'solid'),
            createShape('line', 'small', 'white', 135, 0.8, 'outline')
          ])
        ],
        [
          createMatrixCell(2, 0, [
            createShape('cross', 'medium', 'black', 180, 1, 'solid'),
            createShape('circle', 'small', 'white', 225, 0.8, 'outline')
          ]),
          createMatrixCell(2, 1, [
            createShape('line', 'medium', 'black', 270, 1, 'solid'),
            createShape('square', 'small', 'white', 315, 0.8, 'outline')
          ]),
          createMatrixCell(2, 2, []) // Missing piece
        ]
      ],
      description: "Complete the matrix pattern using advanced rotation and XOR logic",
      visualElements: []
    },
    options: [
      {
        id: '1a',
        content: [
          {
            type: 'shape',
            data: { type: 'square', size: 'medium', color: 'black', rotation: 0, opacity: 1, fill: 'solid' },
            style: { width: '32px', height: '32px', background: 'black', borderRadius: '4px' }
          },
          {
            type: 'shape',
            data: { type: 'triangle', size: 'small', color: 'white', rotation: 45, opacity: 0.8, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
          }
        ],
        isCorrect: true,
        distractors: ['Completes the 90° rotation sequence', 'Maintains XOR visibility rule', 'Follows Fibonacci rotation pattern']
      },
      {
        id: '1b',
        content: [
          {
            type: 'shape',
            data: { type: 'circle', size: 'medium', color: 'black', rotation: 0, opacity: 1, fill: 'solid' },
            style: { width: '32px', height: '32px', background: 'black', borderRadius: '50%' }
          },
          {
            type: 'shape',
            data: { type: 'diamond', size: 'small', color: 'white', rotation: 45, opacity: 0.8, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', transform: 'rotate(45deg)', borderRadius: '4px' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Breaks rotation sequence', 'Incorrect XOR pattern']
      },
      {
        id: '1c',
        content: [
          {
            type: 'shape',
            data: { type: 'triangle', size: 'medium', color: 'black', rotation: 0, opacity: 1, fill: 'solid' },
            style: { width: '32px', height: '32px', background: 'black', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
          },
          {
            type: 'shape',
            data: { type: 'star', size: 'small', color: 'white', rotation: 45, opacity: 0.8, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Incorrect rotation', 'Violates XOR rule']
      },
      {
        id: '1d',
        content: [
          {
            type: 'shape',
            data: { type: 'hexagon', size: 'medium', color: 'black', rotation: 0, opacity: 1, fill: 'solid' },
            style: { width: '32px', height: '32px', background: 'black', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }
          },
          {
            type: 'shape',
            data: { type: 'cross', size: 'small', color: 'white', rotation: 45, opacity: 0.8, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Incorrect rotation', 'Breaks pattern sequence']
      }
    ],
    correctAnswer: 0,
    explanation: "This matrix combines THREE complex patterns: 1) Background shapes rotate 90° clockwise per cell with alternating fill patterns. 2) Overlay shapes follow a Fibonacci sequence rotation (45°, 135°, 225°, 315°, 45°, 135°, 225°, 315°). 3) XOR logic: when background and overlay are the same type, the result is transparent; when different, the result is visible. The missing piece requires a background shape that completes the rotation sequence AND an overlay that maintains the Fibonacci rotation AND satisfies the XOR visibility rule.",
    patternRules: [
      {
        type: 'rotation',
        description: '90° clockwise rotation with alternating fill patterns',
        complexity: 'expert',
        parameters: { angle: 90, direction: 'clockwise', fillPattern: 'alternating' }
      },
      {
        type: 'progression',
        description: 'Fibonacci-based rotation sequence for overlays',
        complexity: 'expert',
        parameters: { sequence: 'fibonacci', baseAngle: 45 }
      },
      {
        type: 'xor',
        description: 'XOR logic for shape visibility',
        complexity: 'expert',
        parameters: { operation: 'xor', visibilityRule: 'different_types_visible' }
      }
    ],
    visualComplexity: 9,
    logicSteps: 5
  },

  // Question 2: Recursive Symmetry with Progressive Transformation
  {
    id: 2,
    category: 'Spatial Reasoning',
    type: 'matrix',
    difficulty: 'expert',
    timeLimit: 150,
    question: {
      matrix: [
        [
          createMatrixCell(0, 0, [
            createShape('square', 'large', 'black', 0, 1, 'solid'),
            createShape('circle', 'small', 'white', 0, 0.6, 'outline')
          ]),
          createMatrixCell(0, 1, [
            createShape('triangle', 'large', 'black', 60, 1, 'solid'),
            createShape('diamond', 'small', 'white', 60, 0.6, 'outline')
          ]),
          createMatrixCell(0, 2, [
            createShape('hexagon', 'large', 'black', 120, 1, 'solid'),
            createShape('star', 'small', 'white', 120, 0.6, 'outline')
          ])
        ],
        [
          createMatrixCell(1, 0, [
            createShape('diamond', 'large', 'black', 180, 1, 'solid'),
            createShape('cross', 'small', 'white', 180, 0.6, 'outline')
          ]),
          createMatrixCell(1, 1, [
            createShape('star', 'large', 'black', 240, 1, 'solid'),
            createShape('line', 'small', 'white', 240, 0.6, 'outline')
          ]),
          createMatrixCell(1, 2, [
            createShape('cross', 'large', 'black', 300, 1, 'solid'),
            createShape('square', 'small', 'white', 300, 0.6, 'outline')
          ])
        ],
        [
          createMatrixCell(2, 0, [
            createShape('line', 'large', 'black', 0, 1, 'solid'),
            createShape('triangle', 'small', 'white', 0, 0.6, 'outline')
          ]),
          createMatrixCell(2, 1, [
            createShape('circle', 'large', 'black', 60, 1, 'solid'),
            createShape('hexagon', 'small', 'white', 60, 0.6, 'outline')
          ]),
          createMatrixCell(2, 2, []) // Missing piece
        ]
      ],
      description: "Complete the recursive symmetry pattern with progressive transformations",
      visualElements: []
    },
    options: [
      {
        id: '2a',
        content: [
          {
            type: 'shape',
            data: { type: 'triangle', size: 'large', color: 'black', rotation: 120, opacity: 1, fill: 'solid' },
            style: { width: '48px', height: '48px', background: 'black', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
          },
          {
            type: 'shape',
            data: { type: 'star', size: 'small', color: 'white', rotation: 120, opacity: 0.6, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
          }
        ],
        isCorrect: true,
        distractors: ['Completes 60° rotation sequence', 'Maintains diagonal symmetry', 'Follows size alternation pattern']
      },
      {
        id: '2b',
        content: [
          {
            type: 'shape',
            data: { type: 'hexagon', size: 'large', color: 'black', rotation: 120, opacity: 1, fill: 'solid' },
            style: { width: '48px', height: '48px', background: 'black', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }
          },
          {
            type: 'shape',
            data: { type: 'diamond', size: 'small', color: 'white', rotation: 120, opacity: 0.6, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', transform: 'rotate(45deg)', borderRadius: '4px' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Breaks rotation sequence', 'Violates symmetry rule']
      },
      {
        id: '2c',
        content: [
          {
            type: 'shape',
            data: { type: 'star', size: 'large', color: 'black', rotation: 120, opacity: 1, fill: 'solid' },
            style: { width: '48px', height: '48px', background: 'black', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
          },
          {
            type: 'shape',
            data: { type: 'cross', size: 'small', color: 'white', rotation: 120, opacity: 0.6, fill: 'outline' },
            style: { width: '20px', height: '20px', border: '2px solid white', clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Incorrect rotation', 'Breaks pattern sequence']
      },
      {
        id: '2d',
        content: [
          {
            type: 'shape',
            data: { type: 'cross', size: 'large', color: 'black', rotation: 120, opacity: 1, fill: 'solid' },
            style: { width: '48px', height: '48px', background: 'black', clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }
          },
          {
            type: 'shape',
            data: { type: 'line', size: 'small', color: 'white', rotation: 120, opacity: 0.6, fill: 'outline' },
            style: { width: '4px', height: '20px', background: 'white' }
          }
        ],
        isCorrect: false,
        distractors: ['Wrong background shape', 'Incorrect rotation', 'Violates symmetry rule']
      }
    ],
    correctAnswer: 0,
    explanation: "This matrix demonstrates RECURSIVE SYMMETRY with FOUR interacting patterns: 1) Background shapes follow a 60° rotation sequence that resets every 6 cells. 2) Overlay shapes create a mirror image across the diagonal, with each overlay being the 'opposite' shape type. 3) Size progression: shapes alternate between large and small every 3 cells. 4) Opacity follows a sine wave pattern (1.0 → 0.6 → 0.8 → 1.0 → 0.6 → 0.8). The missing piece must complete the recursive symmetry while maintaining all four pattern sequences simultaneously.",
    patternRules: [
      {
        type: 'rotation',
        description: '60° rotation sequence with 6-cell reset cycle',
        complexity: 'expert',
        parameters: { angle: 60, cycle: 6, reset: true }
      },
      {
        type: 'symmetry',
        description: 'Recursive diagonal mirror symmetry',
        complexity: 'expert',
        parameters: { axis: 'diagonal', type: 'recursive', mirror: true }
      },
      {
        type: 'progression',
        description: 'Size alternation with 3-cell cycle',
        complexity: 'hard',
        parameters: { cycle: 3, alternation: 'size' }
      },
      {
        type: 'progression',
        description: 'Sine wave opacity progression',
        complexity: 'expert',
        parameters: { function: 'sine', amplitude: 0.2, frequency: 0.5 }
      }
    ],
    visualComplexity: 10,
    logicSteps: 6
  }
];

// Generate the remaining 35 questions to complete the 40-question set
const remainingQuestions = generateRemainingQuestions();
export const allQuestions = [...advancedQuestions, ...remainingQuestions];

export const getQuestionById = (id: number): IQQuestion | undefined => {
  return allQuestions.find(q => q.id === id);
};

export const getQuestionsByDifficulty = (difficulty: string): IQQuestion[] => {
  return allQuestions.filter(q => q.difficulty === difficulty);
};

export const getTotalQuestions = (): number => {
  return allQuestions.length;
}; 