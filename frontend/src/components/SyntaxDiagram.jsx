import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line, Text, Transformer, Group, Path, Rect, Ellipse, Arrow } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from "jspdf";
import { useLanguage } from '../context/LanguageContext';

// --- Iconos para la UI (SVG para conectores Kellogg) ---
const ICON_PATHS = {
    baseline: { path: <svg viewBox="0 0 100 100"><line x1="5" y1="50" x2="95" y2="50" stroke="black" strokeWidth="8" /></svg>, label: "Línea Base" },
    modifier: { path: <svg viewBox="0 0 100 100"><line x1="10" y1="90" x2="90" y2="10" stroke="black" strokeWidth="8" /></svg>, label: "Modificador" },
    modifierInverse: { path: <svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="black" strokeWidth="8" /></svg>, label: "Mod. Inverso" },
    subjectPredicate: { path: <svg viewBox="0 0 100 100"><path d="M 5 50 H 95 M 50 50 V 10" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Sujeto/Pred." },
    directObject: { path: <svg viewBox="0 0 100 100"><path d="M 20 10 V 50 H 95" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Obj. Directo" },
    indirectObject: { path: <svg viewBox="0 0 100 100"><path d="M 5 85 H 95 M 15 85 L 50 20" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Obj. Indirecto" },
    conjunction: { path: <svg viewBox="0 0 100 100"><path d="M 10 70 L 40 50 H 90 M 10 30 L 40 50" stroke="black" strokeWidth="8" fill="none" strokeDasharray="10 5" /></svg>, label: "Conjunción" },
    apposition: { path: <svg viewBox="0 0 100 100"><path d="M 20 20 L 50 50 H 95 M 20 80 L 50 50" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Aposición" },
    conjunctionInverse: { path: <svg viewBox="0 0 100 100"><path d="M 90 70 L 60 50 H 10 M 90 30 L 60 50" stroke="black" strokeWidth="8" fill="none" strokeDasharray="10 5" /></svg>, label: "Conj. Inversa" },
    appositionInverse: { path: <svg viewBox="0 0 100 100"><path d="M 80 20 L 50 50 H 5 M 80 80 L 50 50" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Apos. Inversa" },
    customText: { path: <svg viewBox="0 0 100 100"><text x="50" y="65" fontSize="50" textAnchor="middle" fontWeight="bold">T</text></svg>, label: "Texto" },
    ellipse: { path: <svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="30" stroke="black" strokeWidth="8" fill="none" /></svg>, label: "Elipse" },
    arrowLR: { path: <svg viewBox="0 0 100 100"><line x1="5" y1="50" x2="95" y2="50" stroke="black" strokeWidth="8" markerEnd="url(#arrowhead)" /><defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs></svg>, label: "Flecha →" },
    arrowRL: { path: <svg viewBox="0 0 100 100"><line x1="95" y1="50" x2="5" y2="50" stroke="black" strokeWidth="8" markerEnd="url(#arrowhead)" /><defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs></svg>, label: "Flecha ←" },
    arcArrowLR: { path: <svg viewBox="0 0 100 100"><path d="M 10 70 Q 50 20 90 70" stroke="black" strokeWidth="8" fill="none" markerEnd="url(#arrowhead)" /><defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs></svg>, label: "Arco →" },
    arcArrowRL: { path: <svg viewBox="0 0 100 100"><path d="M 90 70 Q 50 20 10 70" stroke="black" strokeWidth="8" fill="none" markerEnd="url(#arrowhead)" /><defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs></svg>, label: "Arco ←" },
};

// --- Componente para cada Elemento en el Lienzo (Shape) ---
const Shape = ({ element, onSelect, onDragStart, onDragMove, onDragEnd, onDblClick, children }) => {
    const shapeRef = useRef();
    
    const renderHitbox = () => <Rect width={element.width} height={element.height} />;

    const renderShape = () => {
        const scaleX = element.width / (element.baseWidth || 100);
        const scaleY = element.height / (element.baseHeight || 40);

        switch (element.type) {
            case 'baseline': return <Line points={[0, 0, element.width, 0]} stroke="black" strokeWidth={2} />;
            case 'modifier': return <Line points={[0, element.height, element.width, 0]} stroke="black" strokeWidth={2} />;
            case 'modifierInverse': return <Line points={[0, 0, element.width, element.height]} stroke="black" strokeWidth={2} />;
            case 'subjectPredicate': return <Path data="M 0 20 H 200 M 100 20 V 0" stroke="black" strokeWidth={2} scaleX={scaleX} scaleY={scaleY}/>;
            case 'directObject': return <Path data="M 20 0 V 20 H 100" stroke="black" strokeWidth={2} scaleX={scaleX} scaleY={scaleY}/>;
            case 'indirectObject': return <Path data="M 0 40 H 200 M 20 40 L 100 0" stroke="black" strokeWidth={2} scaleX={scaleX} scaleY={scaleY}/>;
            case 'conjunction': return <Path data="M 0 40 L 50 20 H 150 M 0 0 L 50 20" stroke="black" strokeWidth={2} dash={[5, 5]} scaleX={scaleX} scaleY={scaleY}/>;
            case 'apposition': return <Path data="M 20 0 L 60 20 H 180 M 20 40 L 60 20" stroke="black" strokeWidth={2} scaleX={scaleX} scaleY={scaleY}/>;
            case 'conjunctionInverse': return <Path data="M 150 40 L 100 20 H 0 M 150 0 L 100 20" stroke="black" strokeWidth={2} dash={[5, 5]} scaleX={scaleX} scaleY={scaleY}/>;
            case 'appositionInverse': return <Path data="M 160 0 L 120 20 H 0 M 160 40 L 120 20" stroke="black" strokeWidth={2} scaleX={scaleX} scaleY={scaleY}/>;
            case 'word': 
            case 'customText':
                return (
                    <Group>
                        {element.type === 'word' && <Text text={element.morph || ''} fontFamily="sans-serif" fontSize={12} fill="#888" y={0} width={element.width} align="center" listening={false} />}
                        <Text 
                            text={element.text} fontFamily="Cardo, serif" fontSize={element.fontSize || 22} y={element.type === 'word' ? 16 : 0} width={element.width} height={element.height} verticalAlign="middle" align="center"
                            fontStyle={element.fontStyle || 'normal'} fill={element.fill || 'black'} textDecoration={element.textDecoration || ''} listening={false}
                        />
                    </Group>
                );
            case 'ellipse': return <Ellipse width={element.width} height={element.height} stroke="black" strokeWidth={2} />;
            case 'arrowLR': return <Arrow points={[0, element.height/2, element.width, element.height/2]} stroke="black" strokeWidth={2} pointerLength={10} pointerWidth={10} />;
            case 'arrowRL': return <Arrow points={[element.width, element.height/2, 0, element.height/2]} stroke="black" strokeWidth={2} pointerLength={10} pointerWidth={10} />;
            case 'arcArrowLR': return <Arrow points={[0, element.height, element.width / 2, 0, element.width, element.height]} tension={1} stroke="black" strokeWidth={2} pointerLength={10} pointerWidth={10} />;
            case 'arcArrowRL': return <Arrow points={[element.width, element.height, element.width / 2, 0, 0, element.height]} tension={1} stroke="black" strokeWidth={2} pointerLength={10} pointerWidth={10} />;
            default: return null;
        }
    };
    
    return (
        <Group 
            id={element.id} name="shape" x={element.x} y={element.y} width={element.width} height={element.height} rotation={element.rotation} 
            draggable onClick={onSelect} onTap={onSelect} ref={shapeRef} 
            onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} 
            onDblClick={onDblClick} onDblTap={onDblClick}
            onTransformEnd={(e) => e.target.getStage().fire('transformend', { target: e.target })}
            stroke={element.isSnapTarget ? 'blue' : null} strokeWidth={2}
        >
            {renderHitbox()}
            {renderShape()}
            {children}
        </Group>
    );
};

// --- Componente Principal del Diagramador ---
const SyntaxDiagram = forwardRef(({ initialElements, passageWords = [], onSaveDiagram, reference }, ref) => {
    
    const { localized } = useLanguage();    

    const ICONS = Object.keys(ICON_PATHS).reduce((acc, key) => {
        acc[key] = {
            path: ICON_PATHS[key].path,
            label: localized.ui.syntaxDiagram.toolLabels[key] || key
        };
        return acc;
    }, {});

    const [elements, setElements] =useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [stage, setStage] = useState({ x: 0, y: 0, scale: 1 });
    const [snapTargetId, setSnapTargetId] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isWordsPanelCollapsed, setIsWordsPanelCollapsed] = useState(false);
    const [editingText, setEditingText] = useState(null);
    const [clipboard, setClipboard] = useState([]);
    const stageRef = useRef(null);
    const trRef = useRef(null);
    const dragItemRef = useRef(null);
    const containerRef = useRef(null);
    const textEditRef = useRef(null);

    useEffect(() => {
        setElements(initialElements || []);
        setStage({ x: 0, y: 0, scale: 1 });
    }, [initialElements]);

    useEffect(() => {
        if (trRef.current) {
            const selectedNodes = Array.from(selectedIds).map(id => stageRef.current.findOne('#' + id)).filter(Boolean);
            trRef.current.nodes(selectedNodes);
            trRef.current.getLayer().batchDraw();
        }
    }, [selectedIds, elements]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (editingText) {
                if(e.key === 'Escape') handleTextEdit();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                handleCopy();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                handlePaste();
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
                setElements(prev => prev.filter(el => !selectedIds.has(el.id) && !selectedIds.has(el.parentId)));
                setSelectedIds(new Set());
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                setSelectedIds(new Set(elements.map(el => el.id)));
            }
        };
        const container = containerRef.current;
        if(container) container.addEventListener('keydown', handleKeyDown);
        return () => { if(container) container.removeEventListener('keydown', handleKeyDown); };
    }, [selectedIds, elements, editingText]);
    
    const updateElements = (updatedElements) => setElements(updatedElements);

    const handleDragStart = (e) => {
        const id = e.target.id();
        const node = stageRef.current.findOne('#' + id);
        if (node) node.moveToTop();
        setElements(elements.map(el => ({ ...el, isDragging: el.id === id })));
    };

    const handleDragMove = (e) => {
        const stageNode = stageRef.current;
        const pos = stageNode.getPointerPosition();
        if (!pos) return;
        const shape = stageNode.getIntersection(pos);
        let targetId = null;
        if (shape && shape.parent.id() !== e.target.id() && shape.parent.attrs.id) {
            const targetElement = elements.find(el => el.id === shape.parent.attrs.id);
            if (targetElement && targetElement.type !== 'word' && targetElement.type !== 'customText') {
                 targetId = shape.parent.attrs.id;
            }
        }
        setSnapTargetId(targetId);
    };

    const handleDragEnd = (e) => {
        const id = e.target.id();
        let draggedElement = elements.find(el => el.id === id);
        if (!draggedElement) return;
        let newX = e.target.x();
        let newY = e.target.y();
        let newParent = snapTargetId ? elements.find(el => el.id === snapTargetId) : null;
        if (newParent && newParent.id === id) newParent = null;
        let newAttrs = { ...draggedElement, x: newX, y: newY, isDragging: false };
        if ((newParent?.id || null) !== draggedElement.parentId) {
            newAttrs.parentId = newParent ? newParent.id : null;
            if (newParent) {
                const parentNode = stageRef.current.findOne('#' + newParent.id);
                const invertedTransform = parentNode.getAbsoluteTransform().copy().invert();
                const relativePos = invertedTransform.point({ x: newX, y: newY });
                newAttrs.x = relativePos.x;
                newAttrs.y = relativePos.y;
            }
        }
        const finalElements = elements.map(el => el.id === id ? newAttrs : el);
        updateElements(finalElements);
        setSnapTargetId(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const stageNode = stageRef.current;
        stageNode.container().style.cursor = 'default';
        const itemData = dragItemRef.current;
        if (!itemData) return;
        
        const pointerPos = stageNode.getPointerPosition();
        const pos = {
            x: (pointerPos.x - stageNode.x()) / stageNode.scaleX(),
            y: (pointerPos.y - stageNode.y()) / stageNode.scaleY(),
        };

        const parent = snapTargetId ? elements.find(el => el.id === snapTargetId) : null;
        const baseDimensions = { subjectPredicate: {w: 200, h: 20}, directObject: {w: 100, h: 20}, indirectObject: {w: 200, h: 40}, conjunction: {w: 150, h: 40}, apposition: {w: 180, h: 40}, conjunctionInverse: {w: 150, h: 40}, appositionInverse: {w: 180, h: 40} };
        let newElement = {
            id: uuidv4(),
            width: itemData.type === 'word' ? 120 : (baseDimensions[itemData.type]?.w || 100),
            height: itemData.type === 'word' ? 50 : (baseDimensions[itemData.type]?.h || 50),
            baseWidth: itemData.type !== 'word' ? (baseDimensions[itemData.type]?.w || 100) : undefined,
            baseHeight: itemData.type !== 'word' ? (baseDimensions[itemData.type]?.h || 50) : undefined,
            rotation: 0, ...itemData, parentId: parent ? parent.id : null,
            text: itemData.type === 'customText' ? localized.ui.syntaxDiagram.customTextDefault : itemData.text,
        };
        if (parent) {
            const parentNode = stageRef.current.findOne('#' + parent.id);
            const invertedTransform = parentNode.getAbsoluteTransform().copy().invert();
            const relativePos = invertedTransform.point(pos);
            newElement.x = relativePos.x;
            newElement.y = relativePos.y;
        } else {
            newElement.x = pos.x;
            newElement.y = pos.y;
        }
        setElements(prev => [...prev, newElement]);
        dragItemRef.current = null;
        setSnapTargetId(null);
    };

    const handleTransformEnd = (e) => {
        const nodes = trRef.current.nodes();
        const updatedElements = elements.map(el => {
            const node = nodes.find(n => n.id() === el.id);
            if (node) {
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                return { ...el, x: node.x(), y: node.y(), rotation: node.rotation(), width: Math.max(20, node.width() * scaleX), height: Math.max(20, node.height() * scaleY) };
            }
            return el;
        });
        setElements(updatedElements);
    };

    const handleImport = () => {
        if (!passageWords || passageWords.length === 0) { 
            alert(localized.ui.syntaxDiagram.importAlert); 
            return; 
        }

        const newTextElements = passageWords.map((word, index) => {
            const morphText = [word.pos, (word.morph || word.parsing)].filter(Boolean).join(' - ');
            return {
                id: `word_${word.id || uuidv4()}`, type: 'word', text: word.text, morph: morphText,
                x: 50 + (index % 5) * 130, y: 50 + Math.floor(index / 5) * 70,
                width: 120, height: 50, rotation: 0, parentId: null,
                fontStyle: 'normal', fill: 'black', textDecoration: ''
            }
        });
        setElements(prev => [...prev, ...newTextElements]);
    };

    useImperativeHandle(ref, () => ({
        importText: handleImport,
    }));

    const handleSave = () => { if (typeof onSaveDiagram === 'function') onSaveDiagram(elements); };
    const handleClear = () => setElements([]);
    
    const handleExport = (format) => {
        setSelectedIds(new Set());
        const stageNode = stageRef.current;
        if (!stageNode) return;
        const layer = stageNode.getLayers()[0];
        const background = new Konva.Rect({ x: -10000, y: -10000, width: 20000, height: 20000, fill: 'white' });
        const title = new Konva.Text({ text: `Diagrama de: ${reference}`, fontSize: 24, fontFamily: 'sans-serif', fill: 'black', x: 20, y: 20 });
        layer.add(background); layer.add(title); background.moveToBottom();
        const stagePos = stageNode.position();
        const scale = stageNode.scaleX();
        title.x( -stagePos.x / scale + 20 / scale);
        title.y( -stagePos.y / scale + 20 / scale);
        title.scale({x: 1/scale, y: 1/scale});
        layer.draw();
        setTimeout(() => {
            const uri = stageNode.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${reference.replace(/\s/g, '_')}_diagrama.png`;
                link.href = uri; link.click();
            } else if (format === 'pdf') {
                const pdf = new jsPDF('l', 'px', [stageNode.width(), stageNode.height()]);
                pdf.addImage(uri, 'PNG', 0, 0, stageNode.width(), stageNode.height());
                pdf.save(`${reference.replace(/\s/g, '_')}_diagrama.pdf`);
            }
            background.destroy(); title.destroy(); layer.draw();
        }, 100);
    };

    const handleTextStyleChange = (property, value) => {
        if (selectedIds.size === 0) return;
        const updatedElements = elements.map(el => {
            if (selectedIds.has(el.id) && (el.type === 'word' || el.type === 'customText')) {
                const currentVal = el[property] || (property === 'fontStyle' ? 'normal' : '');
                const newVal = currentVal === value ? (property === 'fontStyle' ? 'normal' : '') : value;
                return { ...el, [property]: newVal };
            }
            return el;
        });
        setElements(updatedElements);
    };
    
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.05;
        const stageNode = stageRef.current;
        const oldScale = stageNode.scaleX();
        const pointer = stageNode.getPointerPosition();
        if(!pointer) return;
        const mousePointTo = { x: (pointer.x - stageNode.x()) / oldScale, y: (pointer.y - stageNode.y()) / oldScale };
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setStage({ scale: newScale, x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
    };

    const handleSelect = (e) => {
        const clickedNode = e.target.getParent();
        const id = clickedNode.id();
        if (!id) return;

        const node = stageRef.current.findOne('#' + id);
        if (node) node.moveToTop();
        
        const isSelected = selectedIds.has(id);
        if (!e.evt.shiftKey) {
            setSelectedIds(isSelected && selectedIds.size === 1 ? new Set() : new Set([id]));
        } else {
            const newIds = new Set(selectedIds);
            if (isSelected) newIds.delete(id); else newIds.add(id);
            setSelectedIds(newIds);
        }
    };

    const handleFitToScreen = () => {
        if (elements.length === 0) return;
        const stageNode = stageRef.current;
        const nodes = elements.map(el => stageNode.findOne('#' + el.id)).filter(Boolean);
        if (nodes.length === 0) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const box = node.getClientRect({ relativeTo: stageNode });
            minX = Math.min(minX, box.x);
            minY = Math.min(minY, box.y);
            maxX = Math.max(maxX, box.x + box.width);
            maxY = Math.max(maxY, box.y + box.height);
        });
        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;
        if(boxWidth === 0 || boxHeight === 0) return;
        const padding = 50;
        const scaleX = (stageNode.width() - padding * 2) / boxWidth;
        const scaleY = (stageNode.height() - padding * 2) / boxHeight;
        const newScale = Math.min(scaleX, scaleY, 1);
        const newX = -minX * newScale + (stageNode.width() - boxWidth * newScale) / 2;
        const newY = -minY * newScale + (stageNode.height() - boxHeight * newScale) / 2;
        setStage({ scale: newScale, x: newX, y: newY });
    };
    
    const handleTextDblClick = (e) => {
        const textNode = e.target.getParent();
        const element = elements.find(el => el.id === textNode.id());
        if (element.type !== 'customText') return;

        trRef.current.nodes([]);
        textNode.hide();
        
        setEditingText(element);
        const textPosition = textNode.getClientRect({relativeTo: containerRef.current.parentElement});
        
        const textarea = textEditRef.current;
        textarea.value = element.text;
        textarea.style.display = 'block';
        textarea.style.position = 'absolute';
        textarea.style.top = textPosition.y + 'px';
        textarea.style.left = textPosition.x + 'px';
        textarea.style.width = textPosition.width + 'px';
        textarea.style.height = textPosition.height + 'px';
        textarea.style.fontSize = (element.fontSize || 22) * stage.scale + 'px';
        textarea.style.lineHeight = '1.2';
        textarea.style.fontFamily = '"Cardo", serif';
        textarea.focus();
    };

    const handleTextEdit = () => {
        if (!editingText) return;

        const node = stageRef.current.findOne('#' + editingText.id);
        if (node) node.show();

        const newElements = elements.map(el => {
            if (el.id === editingText.id) {
                return { ...el, text: textEditRef.current.value };
            }
            return el;
        });
        setElements(newElements);
        setEditingText(null);
        textEditRef.current.style.display = 'none';
    };

    const handleCopy = () => {
        const toCopy = elements.filter(el => selectedIds.has(el.id));
        setClipboard(toCopy);
    };

    const handlePaste = () => {
        if (clipboard.length === 0) return;
        const newElements = clipboard.map(el => ({
            ...el,
            id: uuidv4(),
            x: el.x + 20,
            y: el.y + 20,
            parentId: null,
        }));
        setElements(prev => [...prev, ...newElements]);
        setSelectedIds(new Set(newElements.map(el => el.id)));
    };

    const renderElements = (parentId = null) => {
        return elements
            .filter(el => el.parentId === parentId)
            .map(el => (
                <Shape 
                    key={el.id} 
                    element={{...el, isSnapTarget: el.id === snapTargetId}} 
                    onSelect={(e) => handleSelect(e)} 
                    onDragStart={handleDragStart} 
                    onDragMove={handleDragMove} 
                    onDragEnd={handleDragEnd} 
                    onDblClick={handleTextDblClick}
                >
                    {renderElements(el.id)}
                </Shape>
            ));
    };

    const firstSelected = elements.find(el => selectedIds.has(el.id));
    const mainContainerStyle = isFullScreen ? 
        { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex' } :
        { display: 'flex', height: '100%', width: '100%', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', outline: 'none' };

    return (
        <div ref={containerRef} tabIndex={1} style={mainContainerStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap');`}</style>
            
            <div style={{ width: '200px', flexShrink: 0, padding: '10px', borderRight: '1px solid #ccc', backgroundColor: 'white', overflowY: 'auto', display: isFullScreen ? 'none' : 'block' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{localized.ui.syntaxDiagram.panelConnectorsTitle}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {Object.entries(ICONS).map(([type, { path, label }]) => (
                        <div key={type} draggable onDragStart={() => dragItemRef.current = { type }} title={label} style={{ cursor: 'grab', textAlign: 'center', padding: '5px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                            {/* <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '35px', height: '35px' }}>{path}</div></div> */}
                            <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '35px', height: '35px' }}>{path}</div></div>
                            <div style={{ fontSize: '11px' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
                {selectedIds.size > 0 && firstSelected && (firstSelected.type === 'word' || firstSelected.type === 'customText') && (
                    <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '5px', backgroundColor: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <button onClick={() => handleTextStyleChange('fontStyle', 'bold')} style={{ fontWeight: firstSelected.fontStyle === 'bold' ? 'bold' : 'normal' }}>B</button>
                        <button onClick={() => handleTextStyleChange('textDecoration', 'underline')} style={{ textDecoration: firstSelected.textDecoration === 'underline' ? 'underline' : 'none' }}>U</button>
                        <div onClick={() => handleTextStyleChange('fill', '#D32F2F')} style={{ width: '20px', height: '20px', backgroundColor: '#D32F2F', cursor: 'pointer', border: firstSelected.fill === '#D32F2F' ? '2px solid #333' : '1px solid #ccc' }}></div>
                        <div onClick={() => handleTextStyleChange('fill', '#388E3C')} style={{ width: '20px', height: '20px', backgroundColor: '#388E3C', cursor: 'pointer', border: firstSelected.fill === '#388E3C' ? '2px solid #333' : '1px solid #ccc' }}></div>
                        <div onClick={() => handleTextStyleChange('fill', '#1976D2')} style={{ width: '20px', height: '20px', backgroundColor: '#1976D2', cursor: 'pointer', border: firstSelected.fill === '#1976D2' ? '2px solid #333' : '1px solid #ccc' }}></div>
                        <div onClick={() => handleTextStyleChange('fill', 'black')} style={{ width: '20px', height: '20px', backgroundColor: 'black', cursor: 'pointer', border: firstSelected.fill === 'black' ? '2px solid #333' : '1px solid #ccc' }}></div>
                    </div>
                )}
                
                <div style={{ padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={handleImport}>{localized.ui.syntaxDiagram.importButton}</button>
                    <button onClick={handleSave}>{localized.ui.syntaxDiagram.saveButton}</button>
                    <button onClick={handleClear}>{localized.ui.syntaxDiagram.clearButton}</button>
                    <button onClick={() => handleExport('png')}>{localized.ui.syntaxDiagram.exportPng}</button>
                    <button onClick={() => handleExport('pdf')}>{localized.ui.syntaxDiagram.exportPdf}</button>
                    <button onClick={handleFitToScreen} title={localized.ui.syntaxDiagram.fitScreen}>⛶</button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} title={localized.ui.syntaxDiagram.fullscreen}>⛗</button>
                    <span style={{marginLeft: 'auto', color: '#555', fontSize: '14px'}}>{reference}</span>
                </div>
                <div style={{ flex: 1, position: 'relative', backgroundColor: '#fff', cursor: 'grab' }} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); handleDragMove(e); }}>
                    <Stage 
                        width={isFullScreen ? window.innerWidth - (isWordsPanelCollapsed ? 20 : 220) - 200 : window.innerWidth - 420} 
                        height={isFullScreen ? window.innerHeight - 48 : window.innerHeight - 310} 
                        onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedIds(new Set()); }} 
                        onWheel={handleWheel} draggable x={stage.x} y={stage.y} scaleX={stage.scale} scaleY={stage.scale} ref={stageRef}
                    >
                        <Layer>
                            {renderElements()}
                            <Transformer 
                                ref={trRef} 
                                onTransformEnd={handleTransformEnd} 
                                resizeEnabled={selectedIds.size === 1}
                                rotateEnabled={true}
                            />
                        </Layer>
                    </Stage>
                    <textarea ref={textEditRef} onBlur={handleTextEdit} style={{display: 'none', position: 'absolute', zIndex: 10, border: 'none', padding: '0px', margin: '0px', overflow: 'hidden', background: 'none', outline: 'none', resize: 'none', fontFamily: 'Cardo, serif'}} />
                </div>
            </div>

            <div style={{ width: isWordsPanelCollapsed ? '20px' : '200px', flexShrink: 0, padding: isWordsPanelCollapsed ? '10px 0' : '10px', borderLeft: '1px solid #ccc', backgroundColor: 'white', overflowY: 'auto', transition: 'width 0.3s ease', display: isFullScreen ? 'none' : 'block' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    {!isWordsPanelCollapsed && <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', flexGrow: 1 }}>{localized.ui.syntaxDiagram.panelWordsTitle}</h3>}
                    <button onClick={() => setIsWordsPanelCollapsed(!isWordsPanelCollapsed)} style={{border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', padding: '0 5px', lineHeight: 1}}>{isWordsPanelCollapsed ? '«' : '»'}</button>
                </div>
                {!isWordsPanelCollapsed && passageWords.map(word => {
                    const morphText = [word.pos, (word.morph || word.parsing)].filter(Boolean).join(' - ');
                    return (
                        <div key={word.id || word.text} draggable onDragStart={() => dragItemRef.current = { type: 'word', text: word.text, morph: morphText }} style={{ cursor: 'grab', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa', fontSize: '18px', fontFamily: 'Cardo, serif' }}>
                            {word.text}
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{morphText}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default SyntaxDiagram;
