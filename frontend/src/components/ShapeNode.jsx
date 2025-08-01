import React from 'react';
import { Handle, Position } from 'reactflow';

// Un componente para renderizar diferentes formas basadas en props
const ShapeRenderer = ({ shapeType }) => {
    switch (shapeType) {
        case 'line':
            return <svg width="100" height="20" viewBox="0 0 100 20"><line x1="0" y1="10" x2="100" y2="10" stroke="black" strokeWidth="2" /></svg>;
        case 'angledLine':
            return <svg width="100" height="50" viewBox="0 0 100 50"><path d="M 0 40 L 50 10 L 100 40" stroke="black" fill="none" strokeWidth="2" /></svg>;
        case 'steppedLine':
            return <svg width="100" height="50" viewBox="0 0 100 50"><path d="M 0 40 H 40 V 10 H 100" stroke="black" fill="none" strokeWidth="2" /></svg>;
        case 'arcDown':
            return <svg width="100" height="50" viewBox="0 0 100 50"><path d="M 0 10 A 50 40 0 0 1 100 10" stroke="black" fill="none" strokeWidth="2" /></svg>;
        default:
            return null;
    }
}


export const ShapeNode = ({ data }) => {
  return (
    <div style={{ background: 'transparent', border: 'none' }}>
      {/* Handles para poder conectar estos nodos con otros */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <ShapeRenderer shapeType={data.shapeType} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};
