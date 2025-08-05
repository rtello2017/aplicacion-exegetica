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
    const baselineY = 50;

    // Cada 'case' corresponde a una herramienta de la barra de herramientas.
    switch (shapeType) {
        case 'baseline':
            shapeElement = <line x1="0" y1={baselineY} x2="100" y2={baselineY} {...style} />;
            break;
        case 'subjectPredicate':
            shapeElement = <path d={`M 0 ${baselineY} H 100 M 50 ${baselineY} V 5`} {...style} />;
            break;
        case 'directObject':
            shapeElement = <path d={`M 0 ${baselineY} H 100 M 85 ${baselineY} V 30`} {...style} />;
            break;
        case 'predicateNominative':
            shapeElement = <path d={`M 0 ${baselineY} H 100 M 85 ${baselineY} L 70 5`} {...style} />;
            break;
        case 'modifier':
             shapeElement = <path d="M 5 95 L 95 5" {...style} />;
             break;
        case 'prepositionalPhrase':
             shapeElement = <path d="M 5 95 L 50 50 H 100" {...style} />;
             break;
        case 'participle':
             shapeElement = <path d="M 5 50 H 40 L 60 95 H 95" {...style} />;
             break;
        case 'gerundInfinitive':
             shapeElement = <path d="M 5 50 H 40 L 60 5 H 95 M 40 50 V 95" {...style} />;
             break;
        case 'conjunction':
            shapeElement = <path d="M 15 20 V 80 M 85 20 V 80 M 15 50 H 85" {...style} strokeDasharray="5 5" />;
            break;
        case 'clausePedestal':
            shapeElement = <path d="M 25 25 H 75 M 50 25 V 60 L 33 90 H 67 L 50 60" {...style} />;
            break;
        case 'appositive':
            shapeElement = <path d="M 20 5 V 95 M 80 5 V 95" {...style} />;
            break;
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

  // Lógica de rotación corregida y funcional.
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
      degrees += 90; // Ajuste para que 0 grados sea hacia arriba.

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
      
      {/* Manjeador de Rotación (visible solo cuando el nodo está seleccionado) */}
      {selected && (
        <div
          className="nodrag" // Evita que arrastrar el manejador mueva el nodo.
          onMouseDown={onRotateStart}
          style={{
            position: 'absolute',
            top: '-25px', // Coloca el manejador fuera del nodo para fácil acceso.
            left: 'calc(50% - 10px)',
            width: '20px',
            height: '20px',
            background: '#fff',
            border: '2px solid #007bff',
            borderRadius: '50%',
            cursor: 'alias',
            zIndex: 11,
            transform: `rotate(-${data.rotation || 0}deg)`, // Mantiene el manejador siempre vertical.
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
