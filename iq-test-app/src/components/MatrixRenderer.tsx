import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatrixCell, Shape } from '../types/IQTest';
import styled from 'styled-components';

interface MatrixRendererProps {
  matrix: MatrixCell[][];
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
  highlightMissing?: boolean;
}

const MatrixContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const MatrixCellContainer = styled(motion.div)<{ 
  isMissing?: boolean; 
  isInteractive?: boolean;
  highlight?: boolean;
}>`
  position: relative;
  background: ${props => props.highlight ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' : 'white'};
  border: 2px solid ${props => props.highlight ? '#ffc107' : '#dee2e6'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isInteractive ? 'pointer' : 'default'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  ${props => props.isInteractive && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: #007bff;
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  ${props => props.isMissing && `
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-color: #2196f3;
    border-style: dashed;
    
    &::before {
      content: '?';
      font-size: 2rem;
      font-weight: bold;
      color: #2196f3;
      opacity: 0.7;
    }
  `}
`;

const ShapeContainer = styled(motion.div)<{ 
  size: string; 
  color: string; 
  rotation: number;
  opacity: number;
  fill: string;
}>`
  position: absolute;
  width: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'medium': return '32px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'medium': return '32px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  transform: rotate(${props => props.rotation}deg);
  opacity: ${props => props.opacity};
  
  ${props => {
    switch (props.fill) {
      case 'outline':
        return `
          border: 2px solid ${props.color};
          background: transparent;
        `;
      case 'striped':
        return `
          background: repeating-linear-gradient(
            45deg,
            ${props.color},
            ${props.color} 2px,
            transparent 2px,
            transparent 4px
          );
        `;
      case 'dotted':
        return `
          background: radial-gradient(
            circle at 25% 25%,
            ${props.color} 2px,
            transparent 2px
          );
          background-size: 8px 8px;
        `;
      default:
        return `background: ${props.color};`;
    }
  }}
`;

const Circle = styled(ShapeContainer)`
  border-radius: 50%;
`;

const Square = styled(ShapeContainer)`
  border-radius: 4px;
`;

const Triangle = styled(ShapeContainer)`
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
`;

const Diamond = styled(ShapeContainer)`
  transform: rotate(45deg) rotate(${props => props.rotation}deg);
  border-radius: 4px;
`;

const Star = styled(ShapeContainer)`
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
`;

const Hexagon = styled(ShapeContainer)`
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
`;

const Cross = styled(ShapeContainer)`
  clip-path: polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%);
`;

const Line = styled(ShapeContainer)`
  width: 4px;
  height: 100%;
  background: ${props => props.color};
`;

const Cube = styled(ShapeContainer)`
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: ${props => props.color};
  border: 2px solid ${props => props.color === 'white' ? '#000' : '#fff'};
`;

  const renderShape = (shape: Shape, index: number) => {
  const commonProps = {
    size: shape.size,
    color: shape.color,
    rotation: shape.rotation,
    opacity: shape.opacity,
    fill: shape.fill,
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: shape.opacity },
    exit: { scale: 0, opacity: 0 },
    transition: { 
      delay: index * 0.1,
      duration: 0.5,
      type: "spring" as const,
      stiffness: 200
    }
  };

  switch (shape.type) {
    case 'circle':
      return <Circle key={index} {...commonProps} />;
    case 'square':
      return <Square key={index} {...commonProps} />;
    case 'triangle':
      return <Triangle key={index} {...commonProps} />;
    case 'diamond':
      return <Diamond key={index} {...commonProps} />;
    case 'star':
      return <Star key={index} {...commonProps} />;
    case 'hexagon':
      return <Hexagon key={index} {...commonProps} />;
    case 'cross':
      return <Cross key={index} {...commonProps} />;
    case 'line':
      return <Line key={index} {...commonProps} />;
    case 'cube':
    case 'sphere':
    case 'pyramid':
    case 'cylinder':
    case 'octahedron':
    case 'torus':
    case 'dodecahedron':
    case 'icosahedron':
    case 'tetrahedron':
    case 'prism':
    case 'cone':
    case 'ellipsoid':
    case 'frustum':
    case 'hyperboloid':
    case 'paraboloid':
    case 'helicoid':
      // For 3D shapes, use a simplified representation
      return <Cube key={index} {...commonProps} />;
    default:
      return <Circle key={index} {...commonProps} />;
  }
};

export const MatrixRenderer: React.FC<MatrixRendererProps> = ({
  matrix,
  onCellClick,
  interactive = false,
  highlightMissing = false
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (onCellClick && interactive) {
      onCellClick(row, col);
    }
  };

  const handleCellHover = (row: number, col: number) => {
    if (interactive) {
      setHoveredCell({ row, col });
    }
  };

  const handleCellLeave = () => {
    if (interactive) {
      setHoveredCell(null);
    }
  };

  return (
    <MatrixContainer>
      <AnimatePresence>
        {matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <MatrixCellContainer
              key={cell.id}
              isMissing={cell.shapes.length === 0}
              isInteractive={interactive}
              highlight={hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
              onMouseLeave={handleCellLeave}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: (rowIndex * 3 + colIndex) * 0.1,
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
            >
              {cell.shapes.map((shape, shapeIndex) => 
                renderShape(shape, shapeIndex)
              )}
            </MatrixCellContainer>
          ))
        )}
      </AnimatePresence>
    </MatrixContainer>
  );
}; 