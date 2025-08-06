import React from 'react';
import { NodeResizer } from '@reactflow/node-resizer';
import './FreeDrawNode.css';

export const FreeDrawNode = ({ data, selected }) => {
  const { path, bounds } = data;

  // Transforma el trazo para que empiece en (0,0) dentro de su propio SVG
  const transformedPath = path
    .replace(/([ML])\s*([\d.-]+)\s*([\d.-]+)/g, (match, command, x, y) => {
        return `${command} ${parseFloat(x) - bounds.minX} ${parseFloat(y) - bounds.minY}`;
    });

  return (
    <div className="free-draw-node">
      <NodeResizer isVisible={selected} minWidth={30} minHeight={30} />
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`}
        preserveAspectRatio="none"
      >
        <path 
          d={transformedPath} 
          stroke="black" 
          strokeWidth="1.5" 
          fill="none" 
          vectorEffect="non-scaling-stroke" 
        />
      </svg>
    </div>
  );
};