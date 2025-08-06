import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './SyntaxDiagram.css';

let idCounter = 0;
const getId = (type) => `${type}_${idCounter++}`;

const getPathBounds = (path) => {
    if (!path) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const points = path.match(/[\d.-]+/g).map(Number);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxX = Math.max(maxX, points[i]);
        maxY = Math.max(maxY, points[i + 1]);
    }
    return { minX, minY, maxX, maxY };
};

function SyntaxDiagram({ nodes, setNodes, edges, setEdges, nodeTypes, selectedTool, dragRef, dropTargetId, setDropTargetId }) {
  const reactFlowInstance = useReactFlow();
  const [drawingPath, setDrawingPath] = useState(null);
  const isDrawing = useRef(false);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  // ✅ --- LA FUNCIÓN AHORA SE LLAMA handleMouseDown Y ESTÁ CORRECTAMENTE VINCULADA ---
  const handleMouseDown = useCallback((event) => {
    if (selectedTool !== 'freeDraw' || event.button !== 0) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    isDrawing.current = true;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setDrawingPath(`M ${position.x} ${position.y}`);
    
    const onMouseMove = (moveEvent) => {
      if (!isDrawing.current) return;
      const currentPos = reactFlowInstance.screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      setDrawingPath(prevPath => `${prevPath} L ${currentPos.x} ${currentPos.y}`);
    };

    const onMouseUp = () => {
      isDrawing.current = false;
      
      setDrawingPath(currentPath => {
        if (currentPath && currentPath.includes('L')) {
          const bounds = getPathBounds(currentPath);
          const newNode = {
            id: getId('freeDraw'),
            type: 'freeDrawNode',
            position: { x: bounds.minX, y: bounds.minY },
            data: { path: currentPath, bounds },
            style: { width: bounds.maxX - bounds.minX + 5, height: bounds.maxY - bounds.minY + 5 },
          };
          setNodes(nds => [...nds, newNode]);
        }
        return null;
      });

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

  }, [selectedTool, reactFlowInstance, setNodes]);

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
      id: `text_${draggedData.word.id}_${Math.random()}`,
      type: 'textNode',
      position: {
        x: position.x - targetParent.positionAbsolute.x,
        y: position.y - targetParent.positionAbsolute.y - 15,
      },
      data: { label: draggedData.word.text, morphology: draggedData.word.morphology },
      parentNode: targetParent.id,
      extent: 'parent',
    };
    setNodes((nds) => nds.concat(newNode));
    dragRef.current = null;
    setDropTargetId(null);
  }, [reactFlowInstance, setNodes, dragRef, dropTargetId, setDropTargetId]);

  const onPaneClick = useCallback((event) => {
    if (selectedTool === 'freeDraw') return;
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

  const nodesWithHighlight = nodes.map(node => {
      if (node.type === 'shapeNode') {
          return {
              ...node,
              data: { ...node.data, isDropTarget: node.id === dropTargetId }
          };
      }
      return node;
  });

  const wrapperClassName = `reactflow-wrapper ${selectedTool === 'freeDraw' ? 'drawing-mode' : ''}`;

  return (
    <div 
      className={wrapperClassName} 
      style={{width: '100%', height: '100%'}} 
      onKeyDown={onKeyDown} 
      tabIndex={-1}
      // ✅ --- EL EVENTO onMouseDown AHORA ESTÁ AQUÍ, EN EL CONTENEDOR ---
      onMouseDown={handleMouseDown}
    >
        <ReactFlow
            nodes={nodesWithHighlight} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            // Se elimina la propiedad incorrecta de aquí
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            fitView 
            nodeTypes={nodeTypes}
            panOnDrag={selectedTool !== 'freeDraw'}
        >
            <Controls /><MiniMap /><Background />
            {drawingPath && (
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                  <path d={drawingPath} stroke="black" strokeWidth="1.5" fill="none" />
              </svg>
            )}
        </ReactFlow>
    </div>
  );
}

export default SyntaxDiagram;
