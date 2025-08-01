import React, { useCallback } from 'react'; // Importamos useCallback
import ReactFlow, { MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';

function SyntaxDiagram({ nodes, setNodes, edges, setEdges }) {
  const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

  // --- NUEVA FUNCIÓN PARA MANEJAR CONEXIONES ---
  // Esta función se llama cuando arrastras una línea de un nodo a otro.
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect} // <-- Pasamos la nueva función aquí
        fitView // Esta opción hace que el diagrama se centre y ajuste automáticamente
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default SyntaxDiagram;