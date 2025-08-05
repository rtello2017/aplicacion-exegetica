import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export const TextNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const onDoubleClick = () => setIsEditing(true);
  const onBlur = () => {
    setIsEditing(false);
    data.label = label;
  };

  if (isEditing) {
    return (
      <input
        type="text" value={label} onChange={(e) => setLabel(e.target.value)}
        onBlur={onBlur} autoFocus
        style={{ fontSize: '1.2em', padding: '5px', border: '1px solid #007bff', background: 'white' }}
      />
    );
  }

  return (
    <div 
      className="nowheel" 
      onDoubleClick={onDoubleClick}
      style={{
        padding: '2px',
        background: 'transparent',
        border: selected ? '1px dashed #999' : '1px solid transparent',
        borderRadius: '3px',
        fontSize: '1.2em',
        cursor: 'pointer'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {label || 'Doble clic para editar'}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};