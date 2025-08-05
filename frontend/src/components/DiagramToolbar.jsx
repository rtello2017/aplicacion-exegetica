import React from 'react';
import './DiagramToolbar.css';

// Herramientas reconstruidas para una réplica 1:1 de la barra de Logos.
const syntacticTools = {
  // Grupo 1: Herramientas de Selección y Texto
  select: { 
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.64,21.97L10.13,16.76L5.24,18.94L2.05,15.21L7.43,11.69L2.54,9.5L3.9,4.92L10.13,6.61L12.31,1.87L16.88,3.22L15.19,9.3L20.08,7.12L23.27,10.85L17.89,14.37L22.78,16.55L21.42,21.13L15.19,19.44L17.37,24.18L13.64,21.97Z" /></svg>, 
    label: 'Seleccionar' 
  },
  text: { 
    icon: <svg viewBox="0 0 24 24"><text x="4" y="20" fontSize="22" fontWeight="bold" fill="currentColor">T</text></svg>, 
    label: 'Ingresar Texto' 
  },
  freeDraw: {
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" /></svg>,
    label: 'Dibujo Libre'
  },
  // Grupo 2: Líneas y Divisores
  baseline: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H22" /></svg>, 
    label: 'Línea Base' 
  },
  subjectPredicate: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H22 M12 12 V2" /></svg>, 
    label: 'Sujeto / Predicado' 
  },
  directObject: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H22 M18 12 V8" /></svg>, 
    label: 'Objeto Directo' 
  },
  predicateNominative: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H22 M18 12 L14 6" /></svg>, 
    label: 'Predicado Nominativo' 
  },
  // Grupo 3: Modificadores
  modifier: {
    icon: <svg viewBox="0 0 24 24"><path d="M2 18 L22 6" /></svg>,
    label: 'Modificador'
  },
  prepositionalPhrase: { 
    icon: <svg viewBox="0 0 24 24"><path d="M2 18 L12 12 H22" /></svg>, 
    label: 'Frase Preposicional' 
  },
  participle: {
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H10 L14 18 H22" /></svg>,
    label: 'Participio'
  },
  gerundInfinitive: {
    icon: <svg viewBox="0 0 24 24"><path d="M2 12 H10 L14 6 H22 M10 12 V18" /></svg>,
    label: 'Gerundio / Infinitivo'
  },
  // Grupo 4: Conjunciones y Cláusulas
  conjunction: { 
    icon: <svg viewBox="0 0 24 24"><path d="M4 6 V18 M20 6 V18 M4 12 H20" strokeDasharray="2 2" /></svg>, 
    label: 'Conjunción' 
  },
  clausePedestal: { 
    icon: <svg viewBox="0 0 24 24"><path d="M6 6 H18 M12 6 V14 L8 18 H16 L12 14" /></svg>, 
    label: 'Pedestal de Cláusula' 
  },
  appositive: {
    icon: <svg viewBox="0 0 24 24"><path d="M6 6 V18 M18 6 V18" /></svg>,
    label: 'Apositivo'
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

const style = document.createElement('style');
style.innerHTML = `
  .toolbar-button svg path, .toolbar-button svg line {
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;
document.head.appendChild(style);

export default DiagramToolbar;
