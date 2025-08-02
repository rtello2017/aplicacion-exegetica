import React from 'react';
import { Handle, Position } from 'reactflow';

const ShapeRenderer = ({ shapeType }) => {
    const style = { stroke: "black", strokeWidth: 2, fill: "none" };
    
    switch (shapeType) {
        // Líneas Base y Divisores
        case 'baseline':
            return <svg width="150" height="20" viewBox="0 0 150 20"><line x1="0" y1="10" x2="150" y2="10" {...style} /></svg>;
        case 'subjectPredicateDivider':
            return <svg width="150" height="40" viewBox="0 0 150 40"><path d="M 0 20 H 150 M 75 20 V 0" {...style} /></svg>;
        case 'directObjectDivider':
            return <svg width="150" height="40" viewBox="0 0 150 40"><path d="M 0 20 H 150 M 100 20 V 10" {...style} /></svg>;
        case 'predicateNominativeDivider':
            return <svg width="150" height="40" viewBox="0 0 150 40"><path d="M 0 20 H 150 M 100 20 L 80 0" {...style} /></svg>;

        // Modificadores
        case 'modifierSlant':
            return <svg width="100" height="100" viewBox="0 0 100 100"><path d="M 0 0 L 100 100" {...style} /></svg>;
        case 'modifierAngled':
            return <svg width="100" height="60" viewBox="0 0 100 60"><path d="M 0 0 L 40 40 H 100" {...style} /></svg>;

        // Conjunciones
        case 'conjunctionDotted':
            return <svg width="80" height="80" viewBox="0 0 80 80"><path d="M 10 0 V 80 M 70 0 V 80 M 10 40 H 70" {...style} strokeDasharray="4 4" /></svg>;

        // Cláusulas
        case 'clausePedestal':
            return <svg width="120" height="80" viewBox="0 0 120 80"><path d="M 30 20 H 90 M 60 20 V 50 L 40 70 H 80 L 60 50" {...style} /></svg>;
            
        // Otros
        case 'appositiveBrackets':
             return <svg width="100" height="40" viewBox="0 0 100 40"><path d="M 20 0 V 40 M 80 0 V 40" {...style} /></svg>;

        default:
            return null;
    }
}

export const ShapeNode = ({ data }) => {
  return (
    <div style={{ background: 'transparent', border: 'none' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <ShapeRenderer shapeType={data.shapeType} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};
