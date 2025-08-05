import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './App.css';
import './components/TextViewer.css';
// --- IMPORTACIONES AÑADIDAS ---
import './components/Legend.css'; // Estilos para la nueva leyenda
// ------------------------------------
import { ReactFlowProvider } from 'reactflow';
import '@reactflow/node-resizer/dist/style.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importación de componentes
import PassageSelector from './components/PassageSelector';
import TextViewer from './components/TextViewer';
import AnalysisPopup from './components/AnalysisPopup';
import PassageNavigator from './components/PassageNavigator';
import SyntaxDiagram from './components/SyntaxDiagram';
import DiagramToolbar from './components/DiagramToolbar';
import { TextNode } from './components/diagram-nodes/TextNode';
import { ShapeNode } from './components/ShapeNode';
// --- IMPORTACIÓN AÑADIDA ---
import Legend from './components/Legend'; // El nuevo componente de leyenda
// ------------------------------------

function DiagramApp() {
  // El resto de los estados y la lógica permanecen sin cambios
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [rangeInput, setRangeInput] = useState('');
  const [activeQuery, setActiveQuery] = useState({ type: 'select', bookId: 1, chapter: 1, verse: 1 });
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [dropTargetId, setDropTargetId] = useState(null);
  const dragRef = useRef(null);
  const textViewerRef = useRef(null);
  const diagramWrapperRef = useRef(null);
  const nodeTypes = useMemo(() => ({ textNode: TextNode, shapeNode: ShapeNode }), []);

    useEffect(() => {
    fetch('http://localhost:4000/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error al cargar libros:", err));
  }, []);

  useEffect(() => {
    if (!selectedBookId) return;
    fetch(`http://localhost:4000/api/chapters/${selectedBookId}`)
      .then(res => res.json())
      .then(data => {
        setChapters(Array.from({ length: data.chapter_count || 0 }, (_, i) => i + 1));
        setSelectedChapter(1);
      })
      .catch(err => console.error("Error al cargar capítulos:", err));
  }, [selectedBookId]);

  useEffect(() => {
    if (!selectedBookId || !selectedChapter) return;
    fetch(`http://localhost:4000/api/verses/${selectedBookId}/${selectedChapter}`)
      .then(res => res.json())
      .then(data => {
        setVerses(Array.from({ length: data.verse_count || 0 }, (_, i) => i + 1));
        setSelectedVerse(1);
      })
      .catch(err => console.error("Error al cargar versículos:", err));
  }, [selectedBookId, selectedChapter]);

  const fetchData = useCallback(() => {
    if (!activeQuery || books.length === 0) return;
    setLoading(true);
    let apiUrl = '';
    if (activeQuery.type === 'range') {
      apiUrl = `http://localhost:4000/api/passage/${encodeURIComponent(activeQuery.range)}`;
    } else {
      const book = books.find(b => b.book_id === activeQuery.bookId);
      if (!book) { setLoading(false); return; }
      apiUrl = activeQuery.verse === 'ALL'
        ? `http://localhost:4000/api/chapter/${book.name}/${activeQuery.chapter}`
        : `http://localhost:4000/api/verse/${book.name}/${activeQuery.chapter}/${activeQuery.verse}`;
    }
    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject('Pasaje no encontrado'))
      .then(data => {
        setVerseData({ reference: data.reference, verses: data.verses || [{ verse: activeQuery.verse, words: data.words }] });
      })
      .catch(error => { console.error("Error al obtener el pasaje:", error); setVerseData(null); })
      .finally(() => setLoading(false));
  }, [activeQuery, books]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setActiveQuery({ type: 'select', bookId: selectedBookId, chapter: selectedChapter, verse: selectedVerse }); }, [selectedBookId, selectedChapter, selectedVerse]);
  const handleRangeLoad = () => { if (rangeInput.trim()) setActiveQuery({ type: 'range', range: rangeInput }); };
  
  const handleNextChapter = () => {
    const currentChapterNum = parseInt(selectedChapter);
    if (currentChapterNum < chapters.length) {
      setSelectedChapter(currentChapterNum + 1);
    } else {
      handleNextBook();
    }
  };

  const handlePrevChapter = async () => {
    const currentChapterNum = parseInt(selectedChapter);
    if (currentChapterNum > 1) {
      const prevChapter = currentChapterNum - 1;
      const res = await fetch(`http://localhost:4000/api/verses/${selectedBookId}/${prevChapter}`);
      const data = await res.json();
      const lastVerse = data.verse_count;
      setSelectedChapter(prevChapter);
      setSelectedVerse(lastVerse);
    } else {
      handlePrevBook();
    }
  };
  
  const handleNextVerse = () => {
    const currentVerseNum = parseInt(selectedVerse);
    if (currentVerseNum < verses.length) {
      setSelectedVerse(currentVerseNum + 1);
    } else {
      handleNextChapter();
    }
  };

  const handlePrevVerse = () => {
    const currentVerseNum = parseInt(selectedVerse);
    if (currentVerseNum > 1) {
      setSelectedVerse(currentVerseNum - 1);
    } else {
      handlePrevChapter();
    }
  };

  const handleNextBook = () => {
    const currentIndex = books.findIndex(b => b.book_id === selectedBookId);
    if (currentIndex < books.length - 1) {
      setSelectedBookId(books[currentIndex + 1].book_id);
    }
  };

  const handlePrevBook = () => {
    const currentIndex = books.findIndex(b => b.book_id === selectedBookId);
    if (currentIndex > 0) {
      setSelectedBookId(books[currentIndex - 1].book_id);
    }
  };

  const onWordDragStart = (event, wordData) => {
    dragRef.current = { word: wordData };
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadPassageIntoDiagram = () => {
    if (!verseData || !verseData.verses) return;
    const existingShapeNodes = nodes.filter(node => node.type === 'shapeNode');
    const newTextNodes = [];
    let yOffset = 200;
    if (nodes.length > 0) {
        yOffset = Math.max(...nodes.map(n => n.position.y + (n.height || 40)), 200) + 60;
    }
    verseData.verses.forEach(verse => {
      verse.words.forEach((word, index) => {
        newTextNodes.push({
          id: `text_${word.id}_${Math.random()}`,
          type: 'textNode',
          data: { label: word.text },
          position: { x: index * 100 + 20, y: yOffset },
        });
      });
      yOffset += 100;
    });
    setNodes([...existingShapeNodes, ...newTextNodes]);
  };
  
  const handleClearDiagram = () => { if (window.confirm("¿Está seguro de que desea limpiar el lienzo?")) { setNodes([]); setEdges([]); } };

  const handlePrint = () => {
    if (activeTab === 'text') {
      window.print();
    } else if (activeTab === 'diagram') {
      const diagramViewport = diagramWrapperRef.current ? diagramWrapperRef.current.querySelector('.react-flow__viewport') : null;
      if (!diagramViewport) {
          console.error("No se encontró el elemento del diagrama para imprimir.");
          return;
      }
      html2canvas(diagramViewport, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
              <html>
                  <head><title>Imprimir Diagrama</title></head>
                  <body style="margin:0;">
                      <img src="${imgData}" style="width:100%;">
                      <script>
                          window.onload = () => { window.print(); window.close(); };
                      </script>
                  </body>
              </html>
          `);
          printWindow.document.close();
      });
    }
  };

  const handleExportPdf = () => {
    const diagramViewport = diagramWrapperRef.current ? diagramWrapperRef.current.querySelector('.react-flow__viewport') : null;
    const input = activeTab === 'diagram' ? diagramViewport : textViewerRef.current;
    
    const filename = activeTab === 'diagram' 
        ? 'diagrama_sintactico.pdf'
        : `${verseData?.reference || 'pasaje'}.pdf`;

    if (!input) {
      console.error("Elemento para exportar no encontrado.");
      return;
    }

    html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    });
  };

  return (
    <div className="app-container">
      <h1>Proyecto Exegética Bíblica</h1>
      <PassageSelector
        books={books} chapters={chapters} verses={verses}
        selectedBookId={selectedBookId} setSelectedBookId={setSelectedBookId}
        selectedChapter={selectedChapter} setSelectedChapter={setSelectedChapter}
        selectedVerse={selectedVerse} setSelectedVerse={setSelectedVerse}
        rangeInput={rangeInput} setRangeInput={setRangeInput}
        handleRangeLoad={handleRangeLoad}
      />
      <PassageNavigator 
        onPrevBook={handlePrevBook}
        onPrevVerse={handlePrevVerse}
        onNextVerse={handleNextVerse}
        onNextBook={handleNextBook}
        onAddPassage={loadPassageIntoDiagram}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
      />
      
      {/* --- LEYENDA AÑADIDA AQUÍ --- */}
      <Legend />
      {/* --------------------------- */}

      <div className="tabs-container">
        <div className="tab-buttons">
            <button onClick={() => setActiveTab('text')} className={activeTab === 'text' ? 'active' : ''}>Pasaje</button>
            <button onClick={() => setActiveTab('diagram')} className={activeTab === 'diagram' ? 'active' : ''}>Diagrama</button>
        </div>
        <div className="tab-content">
          <div 
            id="text-viewer-printable-area" 
            ref={textViewerRef}
            className="printable-content"
            style={{ display: activeTab === 'text' ? 'block' : 'none' }}
          >
            <div className="text-viewer-container">
              {loading ? <p>Cargando...</p> : <TextViewer verseData={verseData} onWordClick={setSelectedWord} onWordDragStart={onWordDragStart}/>}
            </div> 
          </div>
          <div 
            id="diagram-printable-area" 
            className="printable-content"
            style={{ display: activeTab === 'diagram' ? 'block' : 'none' }}
          >
            <div className="diagram-main-container">
               <div className="diagram-top-controls">
                <button onClick={handleClearDiagram} className="clear-btn">Limpiar Lienzo</button>
              </div>
              <div className="diagram-view-container">
                <DiagramToolbar onSelectTool={setSelectedTool} selectedTool={selectedTool} />
                <div className="diagram-wrapper" ref={diagramWrapperRef}>
                  <SyntaxDiagram
                    nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}
                    nodeTypes={nodeTypes} selectedTool={selectedTool}
                    dragRef={dragRef} dropTargetId={dropTargetId} setDropTargetId={setDropTargetId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedWord && <AnalysisPopup wordData={selectedWord} onClose={() => setSelectedWord(null)} onSave={fetchData} />}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <DiagramApp />
    </ReactFlowProvider>
  );
}
