import React from 'react';
import { Handle, Position } from 'reactflow';

// Usamos una exportación "nombrada" (export const) que es más robusta.
export const TextNode = ({ data }) => {
  return (
    <div style={{ padding: '5px', fontSize: '1.2em', background: 'transparent' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};