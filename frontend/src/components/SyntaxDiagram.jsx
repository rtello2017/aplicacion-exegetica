import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Un contador simple para asegurar IDs únicos para las formas
let id = 0;
const getId = () => `shape_${id++}`;

function SyntaxDiagram({ nodes, setNodes, edges, setEdges, nodeTypes, selectedTool, reactFlowWrapper }) {
  const reactFlowInstance = useReactFlow();

  // Callbacks para manejar cambios en nodos y aristas
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  
  // Callback para conectar nodos
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Lógica para añadir un nuevo nodo (forma) al hacer clic en el lienzo
  const onPaneClick = useCallback((event) => {
    // No hacer nada si la herramienta es de selección, de texto, o si el wrapper no está listo
    if (selectedTool === 'select' || selectedTool === 'text' || !reactFlowWrapper.current) {
        return;
    }

    // Proyectar la posición del clic a coordenadas del flujo
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    // Crear el nuevo nodo
    const newNode = {
      id: getId(),
      type: 'shapeNode',
      position,
      data: { shapeType: selectedTool }, // El tipo de forma viene de la herramienta seleccionada
      draggable: true,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, selectedTool, setNodes, reactFlowWrapper]);

  // Lógica para borrar nodos y aristas seleccionados
  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedNodes = reactFlowInstance.getNodes().filter(n => n.selected);
      const selectedEdges = reactFlowInstance.getEdges().filter(e => e.selected);
      
      // Actualizar el estado para remover los elementos seleccionados
      setNodes((nds) => nds.filter(n => !selectedNodes.find(sn => sn.id === n.id)));
      setEdges((eds) => eds.filter(e => !selectedEdges.find(se => se.id === e.id)));
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  return (
    // Es importante que el div contenedor pueda recibir el foco (tabIndex) para capturar eventos de teclado
    <div className="reactflow-wrapper" style={{width: '100%', height: '100%'}} onKeyDown={onKeyDown} tabIndex={-1}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            fitView
            nodeTypes={nodeTypes}
        >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
    </div>
  );
}

export default SyntaxDiagram;
