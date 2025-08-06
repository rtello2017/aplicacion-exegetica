import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './App.css';
import './components/TextViewer.css';
import './components/Legend.css';
import './components/StudyNotes.css';
import { ReactFlowProvider } from 'reactflow';
import domtoimage from 'dom-to-image-more';
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
import Legend from './components/Legend';
import StudyNotes from './components/StudyNotes';

function DiagramApp() {
  // Estados existentes (sin cambios)
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
  const [selectedTool, setSelectedTool] = useState('select');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [notesContent, setNotesContent] = useState('');
  
  const notesEditorRef = useRef(null);
  const dragRef = useRef(null);
  const textViewerRef = useRef(null);
  const diagramWrapperRef = useRef(null);
  const nodeTypes = useMemo(() => ({ textNode: TextNode, shapeNode: ShapeNode }), []);

  // Lógica de carga de datos (sin cambios)
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
        
        fetch(`http://localhost:4000/api/notes/${encodeURIComponent(data.reference)}`)
          .then(res => res.json())
          .then(notesData => {
            const savedNotes = notesData.content || '';
            setNotesContent(savedNotes);
            if (notesEditorRef.current) {
              notesEditorRef.current.setContent(savedNotes);
            }
          });

        fetch(`http://localhost:4000/api/diagrams/${encodeURIComponent(data.reference)}`)
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            setNodes([]);
            setEdges([]);
            return null;
          })
          .then(diagramData => {
            if (diagramData) {
              setNodes(diagramData.nodes || []);
              setEdges(diagramData.edges || []);
            }
          })
          .catch(err => console.error('Error al cargar el diagrama:', err));

      })
      .catch(error => { 
        console.error("Error al obtener el pasaje:", error); 
        setVerseData(null);
        setNodes([]);
        setEdges([]);
      })
      .finally(() => setLoading(false));
  }, [activeQuery, books]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setActiveQuery({ type: 'select', bookId: selectedBookId, chapter: selectedChapter, verse: selectedVerse }); }, [selectedBookId, selectedChapter, selectedVerse]);
  
  // --- MANEJADORES DE EVENTOS ---
  const handleRangeLoad = () => { if (rangeInput.trim()) setActiveQuery({ type: 'range', range: rangeInput }); };
  const handleNextChapter = () => { const num = parseInt(selectedChapter); if (num < chapters.length) { setSelectedChapter(num + 1); } else { handleNextBook(); } };
  const handlePrevChapter = async () => { const num = parseInt(selectedChapter); if (num > 1) { const prev = num - 1; const res = await fetch(`http://localhost:4000/api/verses/${selectedBookId}/${prev}`); const data = await res.json(); setSelectedChapter(prev); setSelectedVerse(data.verse_count); } else { handlePrevBook(); } };
  const handleNextVerse = () => { const num = parseInt(selectedVerse); if (num < verses.length) { setSelectedVerse(num + 1); } else { handleNextChapter(); } };
  const handlePrevVerse = () => { const num = parseInt(selectedVerse); if (num > 1) { setSelectedVerse(num - 1); } else { handlePrevChapter(); } };
  const handleNextBook = () => { const idx = books.findIndex(b => b.book_id === selectedBookId); if (idx < books.length - 1) { setSelectedBookId(books[idx + 1].book_id); } };
  const handlePrevBook = () => { const idx = books.findIndex(b => b.book_id === selectedBookId); if (idx > 0) { setSelectedBookId(books[idx - 1].book_id); } };
  
  const onWordDragStart = (event, wordData) => {
    event.dataTransfer.setData('text/plain', wordData.text);
    dragRef.current = { word: wordData };
    event.dataTransfer.effectAllowed = 'move';
  };

  // ✅ --- FUNCIÓN `loadPassageIntoDiagram` MODIFICADA PARA AÑADIR MORFOLOGÍA ---
  const loadPassageIntoDiagram = () => {
    if (!verseData || !verseData.verses) return;
    
    const newTextNodes = [];
    let yOffset = 100;
    if (nodes.length > 0) {
      yOffset = Math.max(...nodes.map(n => (n.position.y + (n.height || 40)))) + 60;
    }

    verseData.verses.forEach(verse => {
      verse.words.forEach((word, index) => {
        // Formatear la morfología como en el visor de texto
        const pos = word.pos || '';
        const parsing = word.parsing ? word.parsing.replace(/-/g, ' ') : '';
        const morphology = parsing ? `${pos} - ${parsing}` : pos;

        newTextNodes.push({
          id: `text_${word.id}_${Math.random()}`,
          type: 'textNode',
          // Añadir la morfología al objeto de datos del nodo
          data: { 
            label: word.text,
            morphology: morphology.trim()
          },
          position: { x: index * 100 + 20, y: yOffset },
        });
      });
      yOffset += 100;
    });
    
    setNodes(prevNodes => [...prevNodes, ...newTextNodes]);
  };
  
  const handleClearDiagram = () => { if (window.confirm("¿Está seguro de que desea limpiar el lienzo?")) { setNodes([]); setEdges([]); } };

  const handleSaveNotes = () => {
    if (!verseData || !verseData.reference) {
      alert('Por favor, seleccione un pasaje antes de guardar notas.');
      return;
    }
    fetch('http://localhost:4000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: verseData.reference,
        content: notesContent,
      }),
    })
    .then(res => res.ok ? alert('Notas guardadas correctamente.') : alert('Error al guardar las notas.'))
    .catch(err => {
      console.error('Error al guardar notas:', err);
      alert('Error de conexión al guardar las notas.');
    });
  };

  const handleSaveDiagram = () => {
    if (!verseData || !verseData.reference) {
      alert('Por favor, seleccione un pasaje antes de guardar el diagrama.');
      return;
    }
    fetch('http://localhost:4000/api/diagrams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: verseData.reference,
        nodes: nodes,
        edges: edges,
      }),
    })
    .then(res => {
      if (res.ok) {
        alert('Diagrama guardado correctamente.');
      } else {
        alert('Error al guardar el diagrama.');
      }
    })
    .catch(err => {
      console.error('Error al guardar el diagrama:', err);
      alert('Error de conexión al guardar el diagrama.');
    });
  };

  const handleWordDoubleClick = (wordData) => {
    if (notesEditorRef.current) {
      notesEditorRef.current.insertContent(`${wordData.text} `);
    }
  };
  
  const handlePrintAndExport = async (action) => {
    const printableArea = document.createElement('div');
    printableArea.style.padding = '20px';
    printableArea.style.backgroundColor = 'white';

    if (activeTab === 'diagram') {
      if (diagramWrapperRef.current) {
        try {
          const diagramImage = await domtoimage.toPng(diagramWrapperRef.current, { bgcolor: '#ffffff' });
          const img = document.createElement('img');
          img.src = diagramImage;
          img.style.width = '100%';
          printableArea.appendChild(img);
        } catch (error) {
          console.error("Error al exportar el diagrama a PNG:", error);
          alert("No se pudo generar la imagen del diagrama.");
          return;
        }
      }
    } else {
      if (textViewerRef.current) {
        const textContentClone = textViewerRef.current.cloneNode(true);
        printableArea.appendChild(textContentClone);
      }
    }

    if (notesContent && notesEditorRef.current) {
      const notesHeader = document.createElement('h3');
      notesHeader.textContent = `Notas de Estudio para: ${verseData.reference}`;
      notesHeader.style.marginTop = '30px';
      notesHeader.style.borderTop = '1px solid #ccc';
      notesHeader.style.paddingTop = '20px';
      
      const notesContainer = document.createElement('div');
      notesContainer.innerHTML = notesEditorRef.current.getHTML();
      
      printableArea.appendChild(notesHeader);
      printableArea.appendChild(notesContainer);
    }
    
    document.body.appendChild(printableArea);

    html2canvas(printableArea, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      .then((canvas) => {
        if (action === 'print') {
            const imgData = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>Imprimir</title></head><body style="margin:0;"><img src="${imgData}" style="width:100%;"></body></html>`);
            printWindow.document.close();
            printWindow.onload = () => { printWindow.print(); printWindow.close(); };
        } else if (action === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({ 
              orientation: 'l',
              unit: 'mm',
              format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            
            let imgWidth = pageWidth;
            let imgHeight = imgWidth / canvasAspectRatio;

            if (imgHeight > pageHeight) {
              imgHeight = pageHeight;
              imgWidth = imgHeight * canvasAspectRatio;
            }

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            const filename = `${verseData?.reference || 'pasaje'}_con_notas.pdf`;
            pdf.save(filename);
        }
        document.body.removeChild(printableArea);
      });
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="app-container">
      <h1>Proyecto Exegética Bíblica</h1>
      <PassageSelector {...{books, chapters, verses, selectedBookId, setSelectedBookId, selectedChapter, setSelectedChapter, selectedVerse, setSelectedVerse, rangeInput, setRangeInput, handleRangeLoad}} />
      <PassageNavigator onPrevBook={handlePrevBook} onPrevVerse={handlePrevVerse} onNextVerse={handleNextVerse} onNextBook={handleNextBook} onAddPassage={loadPassageIntoDiagram} onPrint={() => handlePrintAndExport('print')} onExportPdf={() => handlePrintAndExport('pdf')} />
      <Legend />
      <div className="tabs-container">
        <div className="tab-buttons">
            <button onClick={() => setActiveTab('text')} className={activeTab === 'text' ? 'active' : ''}>Pasaje</button>
            <button onClick={() => setActiveTab('diagram')} className={activeTab === 'diagram' ? 'active' : ''}>Diagrama</button>
        </div>
        <div className="tab-content">
          <div id="text-viewer-printable-area" ref={textViewerRef} className="printable-content" style={{ display: activeTab === 'text' ? 'block' : 'none' }}>
            <div className="text-viewer-container">
              {loading ? <p>Cargando...</p> : <TextViewer verseData={verseData} onWordClick={setSelectedWord} onWordDragStart={onWordDragStart} onWordDoubleClick={handleWordDoubleClick} />}
            </div> 
          </div>
          <div id="diagram-printable-area" className="printable-content" style={{ display: activeTab === 'diagram' ? 'block' : 'none' }}>
            <div className="diagram-main-container">
               <div className="diagram-top-controls">
                <button onClick={handleSaveDiagram} className="save-diagram-btn">Guardar Diagrama</button>
                <button onClick={loadPassageIntoDiagram} className="add-passage-btn">Añadir Pasaje al Diagrama</button>
                <button onClick={handleClearDiagram} className="clear-btn">Limpiar Lienzo</button>
              </div>
              <div className="diagram-view-container">
                <DiagramToolbar onSelectTool={setSelectedTool} selectedTool={selectedTool} />
                <div className="diagram-wrapper" ref={diagramWrapperRef}>
                  <SyntaxDiagram {...{nodes, setNodes, edges, setEdges, nodeTypes, selectedTool, dragRef, dropTargetId, setDropTargetId}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <StudyNotes 
        ref={notesEditorRef}
        initialContent={notesContent}
        onUpdate={setNotesContent}
        onSave={handleSaveNotes}
        reference={verseData?.reference}
      />

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