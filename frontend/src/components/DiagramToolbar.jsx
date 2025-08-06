import React from 'react';
import './DiagramToolbar.css';

// --- Definición de los 11 iconos solicitados ---
const syntacticTools = {
  select: { 
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.64,21.97L10.13,16.76L5.24,18.94L2.05,15.21L7.43,11.69L2.54,9.5L3.9,4.92L10.13,6.61L12.31,1.87L16.88,3.22L15.19,9.3L20.08,7.12L23.27,10.85L17.89,14.37L22.78,16.55L21.42,21.13L15.19,19.44L17.37,24.18L13.64,21.97Z" /></svg>, 
    label: 'Seleccionar' 
  },
  text: { 
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><text x="5" y="20" fontFamily="serif" fontSize="20" fontWeight="bold">T</text></svg>, 
    label: 'Ingresar Texto' 
  },
  freeDraw: {
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" /></svg>,
    label: 'Dibujo Libre'
  },
  line: { 
    icon: <svg viewBox="0 0 24 24"><path d="M4 20 L 20 4" /></svg>, 
    label: 'Línea' 
  },
  subjectPredicate: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H 22 M 12 12 V 2" /></svg>, 
    label: 'Sujeto / Predicado' 
  },
  directObject: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H 22 M 18 12 V 8" /></svg>, 
    label: 'Objeto Directo' 
  },
  indirectObject: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 18 H 22 M 2 18 L 12 8" /></svg>, 
    label: 'Objeto Indirecto' 
  },
  // ✅ --- ICONOS CORREGIDOS CON TUS PATHS EXACTOS ---
  leftConjunction: {
    icon: <svg viewBox="0 0 24 24"><path d="M4 10 L 12 6 H 20 M 12 6 L 4 10 L 12 14 H 20 M 12 14 L 10 12 L 10 8" /></svg>,
    label: 'Conjunción Izquierda'
  },
  modifier: {
    icon: <svg viewBox="0 0 24 24"><path d="M4 4 L 12 12 H 22" /></svg>,
    label: 'Modificador'
  },
  leftArc: {
    icon: <svg viewBox="0 0 24 24"><path d="M4 12 L 8 12 L 8 6 H 20 M 8 6 L 8 18 H 20" /></svg>,
    label: 'Arco Izquierdo'
  },
  // --- FIN DE LA CORRECCIÓN ---
  diagonalLine: {
    icon: <svg viewBox="0 0 24 24"><path d="M4 20 L 20 4" /></svg>,
    label: 'Línea Diagonal'
  }
};

function DiagramToolbar({ onSelectTool, selectedTool }) {
  return (
    <div className="diagram-toolbar-vertical">
      {Object.entries(syntacticTools).map(([key, { icon, label }]) => (
        <button
          key={key}
          className={`toolbar-button ${selectedTool === key ? 'selected' : ''}`}
          onClick={() => onSelectTool(key)}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// Estilos base para los iconos SVG de la barra de herramientas
const style = document.createElement('style');
style.innerHTML = `
  .toolbar-button svg path, .toolbar-button svg line, .toolbar-button svg text {
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .toolbar-button svg [fill="currentColor"] {
    fill: currentColor;
    stroke: none;
  }
`;
document.head.appendChild(style);

export default DiagramToolbar;
