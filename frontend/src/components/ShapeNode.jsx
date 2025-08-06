import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';

// --- Componente que renderiza el SVG basado en el tipo ---
const ShapeRenderer = ({ shapeType, isDropTarget }) => {
    const strokeColor = isDropTarget ? '#FFD700' : 'black';
    const style = { 
        stroke: strokeColor, 
        strokeWidth: isDropTarget ? 2.5 : 1.5, 
        fill: "none", 
        vectorEffect: "non-scaling-stroke"
    };
    
    let shapeElement;
    const baselineY = 50; // Línea media de referencia en el viewBox de 100x100

    // Cada 'case' corresponde a una herramienta de la barra de herramientas.
    switch (shapeType) {
        case 'line':
        case 'diagonalLine':
            shapeElement = <path d="M 5 95 L 95 5" {...style} />;
            break;
        case 'subjectPredicate':
            shapeElement = <path d={`M 0 ${baselineY} H 100 M 50 ${baselineY} V 5`} {...style} />;
            break;
        case 'directObject':
            shapeElement = <path d={`M 0 ${baselineY} H 100 M 85 ${baselineY} V 30`} {...style} />;
            break;
        case 'indirectObject':
            shapeElement = <path d={`M 5 ${baselineY+45} L 50 5 H 100`} {...style} />;
            break;

        // ✅ --- FORMAS CORREGIDAS CON TUS PATHS EXACTOS ---
        case 'leftConjunction':
            // Path: M 0 0 L 2 -2 H 4 M 2 -2 L 0 0 L 2 2 H 4 M 2 2 L 1 1 L 1 -1
            shapeElement = <path d="M 10 50 L 50 10 H 90 M 50 10 L 10 50 L 50 90 H 90 M 50 90 L 30 70 L 30 30" {...style} />;
            break;
        case 'modifier':
            // Path: M 0 0 L 2 2 H 6
            shapeElement = <path d="M 5 5 L 35 35 H 95" {...style} />;
            break;
        case 'leftArc':
            // Path: M 0 0 L 1 0 L 1 -2 L 4 -2 M 1 -2 L 1 2 L 4 2
            shapeElement = <path d="M 10 50 L 25 50 L 25 10 H 85 M 25 10 L 25 90 H 85" {...style} />;
            break;
        // --- FIN DE LA CORRECCIÓN ---
            
        case 'freeDraw':
            shapeElement = <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.02)" />;
            break;
        default:
            shapeElement = <line x1="0" y1={baselineY} x2="100" y2={baselineY} {...style} />;
    }
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {shapeElement}
      </svg>
    );
};


// --- Componente principal del Nodo ---
export const ShapeNode = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const onRotateStart = (event) => {
    event.preventDefault();
    const nodeElement = event.target.closest('.react-flow__node');
    const nodeRect = nodeElement.getBoundingClientRect();
    const center = {
      x: nodeRect.left + nodeRect.width / 2,
      y: nodeRect.top + nodeRect.height / 2,
    };

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - center.x;
      const dy = moveEvent.clientY - center.y;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI);
      degrees += 90;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return { ...n, data: { ...n.data, rotation: degrees } };
          }
          return n;
        })
      );
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className="shape-node-wrapper"
      style={{ 
        width: '100%', 
        height: '100%',
        transform: `rotate(${data.rotation || 0}deg)`,
      }}
    >
      <NodeResizer 
        color="#007bff" 
        isVisible={selected} 
        minWidth={40} 
        minHeight={40}
      />
      
      {selected && (
        <div
          className="nodrag"
          onMouseDown={onRotateStart}
          style={{
            position: 'absolute',
            top: '-25px',
            left: 'calc(50% - 10px)',
            width: '20px',
            height: '20px',
            background: '#fff',
            border: '2px solid #007bff',
            borderRadius: '50%',
            cursor: 'alias',
            zIndex: 11,
            transform: `rotate(-${data.rotation || 0}deg)`,
          }}
        />
      )}
      
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
      <ShapeRenderer 
        shapeType={data.shapeType} 
        isDropTarget={data.isDropTarget} 
      />
    </div>
  );
};
