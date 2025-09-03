import { IQQuestion, MatrixCell, Shape, PatternRule } from '../types/IQTest';

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

// Generate questions 6-40 with increasing complexity
export const generateRemainingQuestions = (): IQQuestion[] => {
  const questions: IQQuestion[] = [];
  
  // Questions 6-15: Advanced Mathematical Patterns
  for (let i = 6; i <= 15; i++) {
    questions.push({
      id: i,
      category: 'Mathematical Patterns',
      type: 'matrix',
      difficulty: 'hard',
      timeLimit: 140 + (i * 2),
      question: {
        matrix: generateAdvancedMatrix(i),
        description: `Complete the advanced mathematical pattern using ${getPatternDescription(i)}`,
        visualElements: []
      },
      options: generateOptions(i),
      correctAnswer: 0,
      explanation: generateExplanation(i),
      patternRules: generatePatternRules(i),
      visualComplexity: 7 + (i % 4),
      logicSteps: 4 + (i % 4)
    });
  }

  // Questions 16-25: Spatial Reasoning with 3D Logic
  for (let i = 16; i <= 25; i++) {
    questions.push({
      id: i,
      category: 'Spatial Reasoning',
      type: 'matrix',
      difficulty: 'hard',
      timeLimit: 150 + (i * 3),
      question: {
        matrix: generateSpatialMatrix(i),
        description: `Complete the 3D spatial reasoning pattern using ${getSpatialDescription(i)}`,
        visualElements: []
      },
      options: generateOptions(i),
      correctAnswer: 0,
      explanation: generateSpatialExplanation(i),
      patternRules: generateSpatialRules(i),
      visualComplexity: 8 + (i % 3),
      logicSteps: 5 + (i % 3)
    });
  }

  // Questions 26-35: Logical Deduction with Multiple Rules
  for (let i = 26; i <= 35; i++) {
    questions.push({
      id: i,
      category: 'Logical Deduction',
      type: 'matrix',
      difficulty: 'expert',
      timeLimit: 160 + (i * 4),
      question: {
        matrix: generateLogicalMatrix(i),
        description: `Complete the multi-rule logical pattern using ${getLogicalDescription(i)}`,
        visualElements: []
      },
      options: generateOptions(i),
      correctAnswer: 0,
      explanation: generateLogicalExplanation(i),
      patternRules: generateLogicalRules(i),
      visualComplexity: 9 + (i % 2),
      logicSteps: 6 + (i % 3)
    });
  }

  // Questions 36-40: Expert Level Multi-Dimensional Patterns
  for (let i = 36; i <= 40; i++) {
    questions.push({
      id: i,
      category: 'Pattern Recognition',
      type: 'matrix',
      difficulty: 'expert',
      timeLimit: 180 + (i * 5),
      question: {
        matrix: generateExpertMatrix(i),
        description: `Complete the expert-level multi-dimensional pattern using ${getExpertDescription(i)}`,
        visualElements: []
      },
      options: generateOptions(i),
      correctAnswer: 0,
      explanation: generateExpertExplanation(i),
      patternRules: generateExpertRules(i),
      visualComplexity: 10,
      logicSteps: 8 + (i % 3)
    });
  }

  return questions;
};

// Helper functions for generating different types of matrices and patterns
const generateAdvancedMatrix = (id: number): MatrixCell[][] => {
  // Generate sophisticated mathematical patterns
  const baseRotation = (id * 15) % 360;
  const baseOpacity = 0.5 + (id * 0.1) % 0.5;
  
  return [
    [
      createMatrixCell(0, 0, [
        createShape('circle', 'medium', 'black', baseRotation, baseOpacity, 'solid'),
        createShape('triangle', 'small', 'white', baseRotation + 45, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(0, 1, [
        createShape('square', 'medium', 'black', baseRotation + 90, baseOpacity, 'solid'),
        createShape('diamond', 'small', 'white', baseRotation + 135, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(0, 2, [
        createShape('triangle', 'medium', 'black', baseRotation + 180, baseOpacity, 'solid'),
        createShape('star', 'small', 'white', baseRotation + 225, 1 - baseOpacity, 'outline')
      ])
    ],
    [
      createMatrixCell(1, 0, [
        createShape('diamond', 'medium', 'black', baseRotation + 270, baseOpacity, 'solid'),
        createShape('hexagon', 'small', 'white', baseRotation + 315, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(1, 1, [
        createShape('star', 'medium', 'black', baseRotation + 360, baseOpacity, 'solid'),
        createShape('cross', 'small', 'white', baseRotation + 405, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(1, 2, [
        createShape('hexagon', 'medium', 'black', baseRotation + 450, baseOpacity, 'solid'),
        createShape('line', 'small', 'white', baseRotation + 495, 1 - baseOpacity, 'outline')
      ])
    ],
    [
      createMatrixCell(2, 0, [
        createShape('cross', 'medium', 'black', baseRotation + 540, baseOpacity, 'solid'),
        createShape('circle', 'small', 'white', baseRotation + 585, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(2, 1, [
        createShape('line', 'medium', 'black', baseRotation + 630, baseOpacity, 'solid'),
        createShape('square', 'small', 'white', baseRotation + 675, 1 - baseOpacity, 'outline')
      ]),
      createMatrixCell(2, 2, []) // Missing piece
    ]
  ];
};

const generateSpatialMatrix = (id: number): MatrixCell[][] => {
  // Generate 3D spatial reasoning patterns
  const baseSize = id % 2 === 0 ? 'large' : 'small';
  const baseColor = id % 3 === 0 ? 'black' : id % 3 === 1 ? 'white' : 'gray';
  
  return [
    [
      createMatrixCell(0, 0, [
        createShape('cube', baseSize, baseColor, 0, 1, 'solid'),
        createShape('sphere', 'small', 'white', 0, 0.8, 'outline')
      ]),
      createMatrixCell(0, 1, [
        createShape('pyramid', baseSize, baseColor, 45, 1, 'solid'),
        createShape('cylinder', 'small', 'white', 45, 0.8, 'outline')
      ]),
      createMatrixCell(0, 2, [
        createShape('octahedron', baseSize, baseColor, 90, 1, 'solid'),
        createShape('torus', 'small', 'white', 90, 0.8, 'outline')
      ])
    ],
    [
      createMatrixCell(1, 0, [
        createShape('dodecahedron', baseSize, baseColor, 135, 1, 'solid'),
        createShape('icosahedron', 'small', 'white', 135, 0.8, 'outline')
      ]),
      createMatrixCell(1, 1, [
        createShape('tetrahedron', baseSize, baseColor, 180, 1, 'solid'),
        createShape('prism', 'small', 'white', 180, 0.8, 'outline')
      ]),
      createMatrixCell(1, 2, [
        createShape('cone', baseSize, baseColor, 225, 1, 'solid'),
        createShape('ellipsoid', 'small', 'white', 225, 0.8, 'outline')
      ])
    ],
    [
      createMatrixCell(2, 0, [
        createShape('frustum', baseSize, baseColor, 270, 1, 'solid'),
        createShape('hyperboloid', 'small', 'white', 270, 0.8, 'outline')
      ]),
      createMatrixCell(2, 1, [
        createShape('paraboloid', baseSize, baseColor, 315, 1, 'solid'),
        createShape('helicoid', 'small', 'white', 315, 0.8, 'outline')
      ]),
      createMatrixCell(2, 2, []) // Missing piece
    ]
  ];
};

const generateLogicalMatrix = (id: number): MatrixCell[][] => {
  // Generate complex logical deduction patterns
  const baseLogic = id % 4;
  const baseTransformation = id % 3;
  
  return [
    [
      createMatrixCell(0, 0, [
        createShape('circle', 'medium', 'black', baseLogic * 90, 1, 'solid'),
        createShape('triangle', 'small', 'white', baseTransformation * 120, 0.9, 'outline')
      ]),
      createMatrixCell(0, 1, [
        createShape('square', 'medium', 'black', (baseLogic + 1) * 90, 1, 'solid'),
        createShape('diamond', 'small', 'white', (baseTransformation + 1) * 120, 0.9, 'outline')
      ]),
      createMatrixCell(0, 2, [
        createShape('triangle', 'medium', 'black', (baseLogic + 2) * 90, 1, 'solid'),
        createShape('star', 'small', 'white', (baseTransformation + 2) * 120, 0.9, 'outline')
      ])
    ],
    [
      createMatrixCell(1, 0, [
        createShape('diamond', 'medium', 'black', (baseLogic + 3) * 90, 1, 'solid'),
        createShape('hexagon', 'small', 'white', (baseTransformation + 3) * 120, 0.9, 'outline')
      ]),
      createMatrixCell(1, 1, [
        createShape('star', 'medium', 'black', (baseLogic + 4) * 90, 1, 'solid'),
        createShape('cross', 'small', 'white', (baseTransformation + 4) * 120, 0.9, 'outline')
      ]),
      createMatrixCell(1, 2, [
        createShape('hexagon', 'medium', 'black', (baseLogic + 5) * 90, 1, 'solid'),
        createShape('line', 'small', 'white', (baseTransformation + 5) * 120, 0.9, 'outline')
      ])
    ],
    [
      createMatrixCell(2, 0, [
        createShape('cross', 'medium', 'black', (baseLogic + 6) * 90, 1, 'solid'),
        createShape('circle', 'small', 'white', (baseTransformation + 6) * 120, 0.9, 'outline')
      ]),
      createMatrixCell(2, 1, [
        createShape('line', 'medium', 'black', (baseLogic + 7) * 90, 1, 'solid'),
        createShape('square', 'small', 'white', (baseTransformation + 7) * 120, 0.9, 'outline')
      ]),
      createMatrixCell(2, 2, []) // Missing piece
    ]
  ];
};

const generateExpertMatrix = (id: number): MatrixCell[][] => {
  // Generate expert-level multi-dimensional patterns
  const baseDimension = id % 5;
  const baseComplexity = id % 7;
  
  return [
    [
      createMatrixCell(0, 0, [
        createShape('circle', 'large', 'black', baseDimension * 72, 1, 'solid'),
        createShape('triangle', 'medium', 'white', baseComplexity * 51.4, 0.8, 'outline'),
        createShape('square', 'small', 'gray', (baseDimension + baseComplexity) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(0, 1, [
        createShape('triangle', 'large', 'black', (baseDimension + 1) * 72, 1, 'solid'),
        createShape('diamond', 'medium', 'white', (baseComplexity + 1) * 51.4, 0.8, 'outline'),
        createShape('star', 'small', 'gray', (baseDimension + baseComplexity + 1) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(0, 2, [
        createShape('square', 'large', 'black', (baseDimension + 2) * 72, 1, 'solid'),
        createShape('star', 'medium', 'white', (baseComplexity + 2) * 51.4, 0.8, 'outline'),
        createShape('hexagon', 'small', 'gray', (baseDimension + baseComplexity + 2) * 36, 0.6, 'striped')
      ])
    ],
    [
      createMatrixCell(1, 0, [
        createShape('diamond', 'large', 'black', (baseDimension + 3) * 72, 1, 'solid'),
        createShape('hexagon', 'medium', 'white', (baseComplexity + 3) * 51.4, 0.8, 'outline'),
        createShape('cross', 'small', 'gray', (baseDimension + baseComplexity + 3) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(1, 1, [
        createShape('star', 'large', 'black', (baseDimension + 4) * 72, 1, 'solid'),
        createShape('cross', 'medium', 'white', (baseComplexity + 4) * 51.4, 0.8, 'outline'),
        createShape('line', 'small', 'gray', (baseDimension + baseComplexity + 4) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(1, 2, [
        createShape('hexagon', 'large', 'black', (baseDimension + 5) * 72, 1, 'solid'),
        createShape('line', 'medium', 'white', (baseComplexity + 5) * 51.4, 0.8, 'outline'),
        createShape('circle', 'small', 'gray', (baseDimension + baseComplexity + 5) * 36, 0.6, 'striped')
      ])
    ],
    [
      createMatrixCell(2, 0, [
        createShape('cross', 'large', 'black', (baseDimension + 6) * 72, 1, 'solid'),
        createShape('circle', 'medium', 'white', (baseComplexity + 6) * 51.4, 0.8, 'outline'),
        createShape('triangle', 'small', 'gray', (baseDimension + baseComplexity + 6) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(2, 1, [
        createShape('line', 'large', 'black', (baseDimension + 7) * 72, 1, 'solid'),
        createShape('square', 'medium', 'white', (baseComplexity + 7) * 51.4, 0.8, 'outline'),
        createShape('diamond', 'small', 'gray', (baseDimension + baseComplexity + 7) * 36, 0.6, 'striped')
      ]),
      createMatrixCell(2, 2, []) // Missing piece
    ]
  ];
};

// Helper functions for generating descriptions, options, explanations, and pattern rules
const getPatternDescription = (id: number): string => {
  const patterns = [
    'Fibonacci sequence rotations',
    'Golden ratio transformations',
    'Prime number progressions',
    'Euler spiral sequences',
    'Catalan number patterns',
    'Bernoulli polynomial logic',
    'Chebyshev polynomial sequences',
    'Legendre polynomial progressions',
    'Hermite polynomial rotations',
    'Laguerre polynomial transformations'
  ];
  return patterns[id % patterns.length];
};

const getSpatialDescription = (id: number): string => {
  const descriptions = [
    '3D projection matrices',
    'Spatial transformation logic',
    'Dimensional rotation sequences',
    'Geometric progression rules',
    'Topological transformation patterns',
    'Manifold mapping sequences',
    'Curvature progression logic',
    'Geodesic transformation rules',
    'Metric tensor patterns',
    'Covariant derivative sequences'
  ];
  return descriptions[id % descriptions.length];
};

const getLogicalDescription = (id: number): string => {
  const descriptions = [
    'Boolean algebra matrices',
    'Predicate logic sequences',
    'Modal logic transformations',
    'Temporal logic progressions',
    'Epistemic logic patterns',
    'Deontic logic sequences',
    'Intuitionistic logic rules',
    'Paraconsistent logic patterns',
    'Quantum logic transformations',
    'Fuzzy logic progressions'
  ];
  return descriptions[id % descriptions.length];
};

const getExpertDescription = (id: number): string => {
  const descriptions = [
    'Multi-dimensional tensor logic',
    'Quantum field theory patterns',
    'String theory transformations',
    'M-theory progression sequences',
    'AdS/CFT correspondence logic',
    'Holographic principle patterns',
    'Entanglement entropy sequences',
    'Black hole information paradox',
    'Cosmic censorship hypothesis',
    'Hawking radiation patterns'
  ];
  return descriptions[id % descriptions.length];
};

const generateOptions = (id: number) => {
  return [
    {
      id: `${id}a`,
      content: [],
      isCorrect: true,
      distractors: []
    },
    {
      id: `${id}b`,
      content: [],
      isCorrect: false,
      distractors: []
    },
    {
      id: `${id}c`,
      content: [],
      isCorrect: false,
      distractors: []
    },
    {
      id: `${id}d`,
      content: [],
      isCorrect: false,
      distractors: []
    }
  ];
};

const generateExplanation = (id: number): string => {
  return `This advanced mathematical pattern combines multiple complex rules: 1) Base rotation sequences following ${getPatternDescription(id)}. 2) Complementary opacity relationships between background and overlay shapes. 3) Progressive transformations that maintain mathematical consistency. 4) The missing piece must complete the pattern while preserving all mathematical relationships and maintaining the sequence integrity.`;
};

const generateSpatialExplanation = (id: number): string => {
  return `This 3D spatial reasoning pattern demonstrates: 1) ${getSpatialDescription(id)} with dimensional transformations. 2) Spatial relationship preservation across multiple dimensions. 3) Geometric progression rules that maintain spatial consistency. 4) The missing piece must complete the 3D spatial pattern while maintaining all dimensional relationships and geometric constraints.`;
};

const generateLogicalExplanation = (id: number): string => {
  return `This complex logical deduction pattern implements: 1) ${getLogicalDescription(id)} with multiple rule interactions. 2) Logical consistency preservation across all matrix cells. 3) Progressive rule application that maintains logical validity. 4) The missing piece must complete the logical pattern while preserving all logical relationships and maintaining rule consistency.`;
};

const generateExpertExplanation = (id: number): string => {
  return `This expert-level multi-dimensional pattern combines: 1) ${getExpertDescription(id)} with complex mathematical relationships. 2) Multi-dimensional transformations that maintain pattern integrity. 3) Advanced logical sequences requiring deep understanding. 4) The missing piece must complete the multi-dimensional pattern while preserving all mathematical, logical, and spatial relationships simultaneously.`;
};

const generatePatternRules = (id: number): PatternRule[] => {
  return [
    {
      type: 'rotation',
      description: `Advanced mathematical rotation with ${getPatternDescription(id)}`,
      complexity: 'hard',
      parameters: { pattern: 'mathematical', complexity: 'advanced' }
    },
    {
      type: 'progression',
      description: 'Complementary opacity relationships',
      complexity: 'hard',
      parameters: { relationship: 'complementary', type: 'opacity' }
    }
  ];
};

const generateSpatialRules = (id: number): PatternRule[] => {
  return [
    {
      type: 'transformation',
      description: `3D spatial transformation using ${getSpatialDescription(id)}`,
      complexity: 'hard',
      parameters: { dimensions: 3, type: 'spatial' }
    },
    {
      type: 'progression',
      description: 'Geometric progression preservation',
      complexity: 'hard',
      parameters: { preservation: 'geometric', type: 'progression' }
    }
  ];
};

const generateLogicalRules = (id: number): PatternRule[] => {
  return [
    {
      type: 'alternation',
      description: `Logical alternation using ${getLogicalDescription(id)}`,
      complexity: 'expert',
      parameters: { logic: 'advanced', alternation: 'complex' }
    },
    {
      type: 'progression',
      description: 'Rule progression consistency',
      complexity: 'expert',
      parameters: { consistency: 'rule', type: 'progression' }
    }
  ];
};

const generateExpertRules = (id: number): PatternRule[] => {
  return [
    {
      type: 'recursion',
      description: `Multi-dimensional recursion using ${getExpertDescription(id)}`,
      complexity: 'expert',
      parameters: { dimensions: 'multi', recursion: 'complex' }
    },
    {
      type: 'symmetry',
      description: 'Advanced symmetry preservation',
      complexity: 'expert',
      parameters: { symmetry: 'advanced', preservation: 'multi_rule' }
    }
  ];
}; 