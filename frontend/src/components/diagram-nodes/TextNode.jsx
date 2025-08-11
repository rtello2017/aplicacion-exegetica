import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './TextNode.css'; // Añadimos un archivo CSS para los estilos

import { useLanguage } from '../context/LanguageContext';

export const TextNode = ({ data, selected }) => {

  const { localized } = useLanguage();  

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  // Este efecto asegura que si el nodo se actualiza desde fuera, el texto cambie.
  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  const onDoubleClick = () => setIsEditing(true);

  const onBlur = () => {
    setIsEditing(false);
    // Mantenemos tu lógica original para actualizar el dato.
    data.label = label; 
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onBlur();
    }
  };

  return (
    // Contenedor principal que reacciona a la selección
    <div 
      className="text-node-wrapper"
      style={{ border: selected ? '1px dashed #007bff' : '1px solid #ccc' }}
      onDoubleClick={onDoubleClick}
    >
      {/* Manijas de conexión siempre presentes pero invisibles */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      
      {/* ✅ SECCIÓN NUEVA: Muestra la morfología si existe */}
      {data.morphology && (
        <div className="morphology-text">
          {data.morphology}
        </div>
      )}

      {/* Lógica de edición existente, ahora dentro del nuevo contenedor */}
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-node-input"
        />
      ) : (
        <div className="greek-text-label">
          {label || localized.ui.diagramNode.textPlaceholder}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};