import React from 'react';
import './DiagramToolbar.css';

// Herramientas estándar para diagramación sintáctica del Griego Koiné
const syntacticTools = {
  select: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 13l6 6m-6-6l-4 9 1.5 1.5 9-4-1.5-1.5-3-3zM4 4l9 4-3 3-4-9z"/></svg>, label: 'Seleccionar' },
  text: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V6h16v1M9 18h6M12 6v12"/></svg>, label: 'Añadir Texto' },
  
  // Línea base con divisiones
  baseline: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>, label: 'Línea Base' },
  subjectPredicateDivider: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M12 12V4"/></svg>, label: 'Divisor Sujeto/Predicado' },
  directObjectDivider: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M16 12V8"/></svg>, label: 'Divisor Objeto Directo' },
  predicateNominativeDivider: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M14 12l-4-4"/></svg>, label: 'Divisor Predicado Nominativo' },

  // Modificadores
  modifierSlant: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6"/></svg>, label: 'Modificador (Línea Inclinada)' },
  modifierAngled: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18l6-6h8"/></svg>, label: 'Modificador (Línea Angular)' },
  
  // Conjunciones y elementos compuestos
  conjunctionDotted: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8v8m12-8v8M6 12h12" strokeDasharray="2 2"/></svg>, label: 'Conjunción (Compuestos)' },
  
  // Cláusulas subordinadas
  clausePedestal: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h8M12 12v6l-4 4h8l-4-4"/></svg>, label: 'Pedestal de Cláusula' },
  
  // Otros
  appositiveBrackets: { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4v16M15 4v16"/></svg>, label: 'Apositivo (Paréntesis)' },

};

function DiagramToolbar({ onSelectTool, selectedTool }) {
  return (
    <div className="diagram-toolbar">
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

export default DiagramToolbar;
