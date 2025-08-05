import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

let idCounter = 0;
const getId = (type) => `${type}_${idCounter++}`;

function SyntaxDiagram({ nodes, setNodes, edges, setEdges, nodeTypes, selectedTool, dragRef, dropTargetId, setDropTargetId }) {
  const reactFlowInstance = useReactFlow();

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  // --- LÓGICA DE PEGAR NODOS EXISTENTES ---
  const onNodeDragStop = useCallback((event, draggedNode) => {
    const allNodes = reactFlowInstance.getNodes();
    const targetParent = allNodes
      .filter(node =>
        node.id !== draggedNode.id &&
        node.type === 'shapeNode' &&
        draggedNode.position.x > node.position.x &&
        draggedNode.position.x < node.position.x + (node.width || 0) &&
        draggedNode.position.y > node.position.y &&
        draggedNode.position.y < node.position.y + (node.height || 0)
      )
      .sort((a, b) => (a.width * a.height) - (b.width * b.height))[0];

    if (targetParent) {
      setNodes(prevNodes => prevNodes.map(n => {
        if (n.id === draggedNode.id) {
          return {
            ...n,
            parentNode: targetParent.id,
            extent: 'parent',
            position: {
              x: draggedNode.position.x - targetParent.positionAbsolute.x,
              y: draggedNode.position.y - targetParent.positionAbsolute.y,
            },
          };
        }
        return n;
      }));
    } else if (draggedNode.parentNode) {
      setNodes(prevNodes => prevNodes.map(n => {
        if (n.id === draggedNode.id) {
          const { parentNode, extent, ...rest } = n;
          return { ...rest, position: draggedNode.position };
        }
        return n;
      }));
    }
  }, [reactFlowInstance, setNodes]);
  
  // --- LÓGICA MEJORADA PARA ARRASTRAR Y RESALTAR ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const allNodes = reactFlowInstance.getNodes();
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const targetNode = allNodes.find(node =>
        node.type === 'shapeNode' &&
        position.x > node.positionAbsolute.x &&
        position.x < node.positionAbsolute.x + node.width &&
        position.y > node.positionAbsolute.y &&
        position.y < node.positionAbsolute.y + node.height
    );

    setDropTargetId(targetNode ? targetNode.id : null);
  }, [reactFlowInstance, setDropTargetId]);

  const onDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, [setDropTargetId]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const draggedData = dragRef.current;
    if (!draggedData || !draggedData.word || !dropTargetId) {
      setDropTargetId(null);
      return;
    }
    
    const targetParent = reactFlowInstance.getNode(dropTargetId);
    if (!targetParent) {
        setDropTargetId(null);
        return;
    }

    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    
    const newNode = {
      id: `text_${draggedData.word.id}_${Math.random()}`, // ID más robusto
      type: 'textNode',
      position: {
        x: position.x - targetParent.positionAbsolute.x,
        y: position.y - targetParent.positionAbsolute.y - 15, // Ajuste para centrar
      },
      data: { label: draggedData.word.text },
      parentNode: targetParent.id,
      extent: 'parent',
    };
    setNodes((nds) => nds.concat(newNode));
    dragRef.current = null;
    setDropTargetId(null); // Limpiar resaltado
  }, [reactFlowInstance, setNodes, dragRef, dropTargetId, setDropTargetId]);

  // --- LÓGICA PARA AÑADIR FORMAS ---
  const onPaneClick = useCallback((event) => {
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let newNode;
    if (selectedTool === 'text') {
      newNode = { id: getId('text'), type: 'textNode', position, data: { label: 'Nuevo Texto' } };
    } else if (selectedTool !== 'select') {
      newNode = { id: getId('shape'), type: 'shapeNode', position, data: { shapeType: selectedTool, flipped: false }, style: { width: 150, height: 50 } };
    }
    if (newNode) setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, selectedTool, setNodes]);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedNodes = reactFlowInstance.getNodes().filter(n => n.selected);
      const selectedEdges = reactFlowInstance.getEdges().filter(e => e.selected);
      setNodes(nds => nds.filter(n => !selectedNodes.find(sn => sn.id === n.id)));
      setEdges(eds => eds.filter(e => !selectedEdges.find(se => se.id === e.id)));
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  // Añadimos el dropTargetId a los datos de cada nodo para que ShapeNode pueda reaccionar
  const nodesWithHighlight = nodes.map(node => {
      if (node.type === 'shapeNode') {
          return {
              ...node,
              data: { ...node.data, isDropTarget: node.id === dropTargetId }
          };
      }
      return node;
  });

  return (
    <div className="reactflow-wrapper" style={{width: '100%', height: '100%'}} onKeyDown={onKeyDown} tabIndex={-1}>
        <ReactFlow
            nodes={nodesWithHighlight} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            fitView 
            nodeTypes={nodeTypes}
        >
            <Controls /><MiniMap /><Background />
        </ReactFlow>
    </div>
  );
}

export default SyntaxDiagram;
