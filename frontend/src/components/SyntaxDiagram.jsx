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

let id = 0;
const getId = () => `shape_${id++}`;

function SyntaxDiagram({ nodes, setNodes, edges, setEdges, nodeTypes, selectedTool, reactFlowWrapper }) {
  const reactFlowInstance = useReactFlow();

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onPaneClick = useCallback((event) => {
    if (selectedTool === 'select' || !reactFlowWrapper.current) {
        return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getId(),
      type: 'shapeNode',
      position,
      data: { shapeType: selectedTool },
      draggable: true,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, selectedTool, setNodes, reactFlowWrapper]);


  return (
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
  );
}

export default SyntaxDiagram;
