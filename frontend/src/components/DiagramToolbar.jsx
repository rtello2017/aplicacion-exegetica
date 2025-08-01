import React from 'react';
import './DiagramToolbar.css'; // Crearemos este archivo para los estilos

// Un objeto que mapea los nombres de las herramientas a sus representaciones SVG
const tools = {
  select: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 14a8 8 0 0 1-8 8m-1-9-4 4-4-4"/></svg>, label: 'Select Tool' },
  line: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>, label: 'Line' },
  angledLine: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8.9c-2.3 0-4.1 1.8-4.1 4.1s1.8 4.1 4.1 4.1H17V8.9zM7 17.1c2.3 0 4.1-1.8 4.1-4.1S9.3 8.9 7 8.9H7v8.2z"/></svg>, label: 'Angled Line' },
  steppedLine: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h4v4h4v-4h4"/></svg>, label: 'Stepped Line' },
  arcDown: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12 A 7 7 0 0 1 19 12"/></svg>, label: 'Arc Down' },
  // Agrega aquí más herramientas según la imagen de Logos
};

function DiagramToolbar({ onSelectTool, selectedTool }) {
  return (
    <div className="diagram-toolbar">
      {Object.entries(tools).map(([key, { icon, label }]) => (
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
