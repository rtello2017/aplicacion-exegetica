import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './components/TextViewer.css';
import './components/Legend.css';
import './components/StudyNotes.css';

// --- LIBRERÍAS DE EXPORTACIÓN ---
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- COMPONENTES PRINCIPALES DE LA APP ---
import PassageSelector from './components/PassageSelector';
import TextViewer from './components/TextViewer';
import AnalysisPopup from './components/AnalysisPopup';
import PassageNavigator from './components/PassageNavigator';
import Legend from './components/Legend';
import StudyNotes from './components/StudyNotes';

// --- NUEVO DIAGRAMADOR CONECTADO ---
import SyntaxDiagram from './components/SyntaxDiagram';


function DiagramApp() {
  // --- ESTADO GENERAL DE LA APLICACIÓN ---
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  
  const getInitialQuery = () => {
    try {
      const savedQuery = localStorage.getItem('lastActiveQuery');
      return savedQuery ? JSON.parse(savedQuery) : { type: 'select', bookId: 1, chapter: 1, verse: 1 };
    } catch (error) {
      console.error("Error al leer la última consulta guardada:", error);
      return { type: 'select', bookId: 1, chapter: 1, verse: 1 };
    }
  };

  const [selectedBookId, setSelectedBookId] = useState(getInitialQuery().bookId);
  const [selectedChapter, setSelectedChapter] = useState(getInitialQuery().chapter);
  const [selectedVerse, setSelectedVerse] = useState(getInitialQuery().verse);
  const [rangeInput, setRangeInput] = useState('');
  const [activeQuery, setActiveQuery] = useState(getInitialQuery());
  
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [notesContent, setNotesContent] = useState('');
  
  const [initialDiagramData, setInitialDiagramData] = useState(null);

  // --- REFERENCIAS ---
  const notesEditorRef = useRef(null);
  const dragRef = useRef(null);
  const textViewerRef = useRef(null);
  // ✅ CORRECCIÓN: Se crea una referencia para el componente del diagrama
  const diagramRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('lastActiveQuery', JSON.stringify(activeQuery));
    } catch (error) {
      console.error("Error al guardar la última consulta:", error);
    }
  }, [activeQuery]);


  // --- LÓGICA DE CARGA DE DATOS ---
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
      })
      .catch(err => console.error("Error al cargar capítulos:", err));
  }, [selectedBookId]);

  useEffect(() => {
    if (!selectedBookId || !selectedChapter) return;
    fetch(`http://localhost:4000/api/verses/${selectedBookId}/${selectedChapter}`)
      .then(res => res.json())
      .then(data => {
        setVerses(Array.from({ length: data.verse_count || 0 }, (_, i) => i + 1));
      })
      .catch(err => console.error("Error al cargar versículos:", err));
  }, [selectedBookId, selectedChapter]);

  const fetchData = useCallback(() => {
    if (!activeQuery || books.length === 0) return;
    setLoading(true);
    setInitialDiagramData(null); 
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
        const reference = data.reference;
        setVerseData({ reference, verses: data.verses || [{ verse: activeQuery.verse, words: data.words }] });
        
        fetch(`http://localhost:4000/api/notes/${encodeURIComponent(reference)}`)
          .then(res => res.json())
          .then(notesData => {
            const savedNotes = notesData.content || '';
            setNotesContent(savedNotes);
            if (notesEditorRef.current) notesEditorRef.current.setContent(savedNotes);
          });

        fetch(`http://localhost:4000/api/diagrams/${encodeURIComponent(reference)}`)
          .then(res => res.ok ? res.json() : null)
          .then(diagramData => {
            if (diagramData && diagramData.nodes) {
              setInitialDiagramData(diagramData.nodes);
            }
          })
          .catch(err => console.log('No se encontró diagrama guardado o hubo un error:', err));

      })
      .catch(error => { 
        console.error("Error al obtener el pasaje:", error); 
        setVerseData(null);
      })
      .finally(() => setLoading(false));
  }, [activeQuery, books]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { 
      if (activeQuery.type === 'select' && (activeQuery.bookId !== selectedBookId || activeQuery.chapter !== selectedChapter || activeQuery.verse !== selectedVerse)) {
          setActiveQuery({ type: 'select', bookId: selectedBookId, chapter: selectedChapter, verse: selectedVerse });
      }
  }, [selectedBookId, selectedChapter, selectedVerse]);
  
  // --- MANEJADORES DE EVENTOS ---
  const handleRangeLoad = () => { if (rangeInput.trim()) setActiveQuery({ type: 'range', range: rangeInput }); };
  const handleNextChapter = () => { const num = parseInt(selectedChapter); if (num < chapters.length) { setSelectedChapter(num + 1); setSelectedVerse(1); } else { handleNextBook(); } };
  const handlePrevChapter = async () => { const num = parseInt(selectedChapter); if (num > 1) { const prev = num - 1; const res = await fetch(`http://localhost:4000/api/verses/${selectedBookId}/${prev}`); const data = await res.json(); setSelectedChapter(prev); setSelectedVerse(data.verse_count); } else { handlePrevBook(); } };
  const handleNextVerse = () => { const num = parseInt(selectedVerse); if (num < verses.length) { setSelectedVerse(num + 1); } else { handleNextChapter(); } };
  const handlePrevVerse = () => { const num = parseInt(selectedVerse); if (num > 1) { setSelectedVerse(num - 1); } else { handlePrevChapter(); } };
  const handleNextBook = () => { const idx = books.findIndex(b => b.book_id === selectedBookId); if (idx < books.length - 1) { setSelectedBookId(books[idx + 1].book_id); setSelectedChapter(1); setSelectedVerse(1); } };
  const handlePrevBook = () => { const idx = books.findIndex(b => b.book_id === selectedBookId); if (idx > 0) { setSelectedBookId(books[idx - 1].book_id); setSelectedChapter(1); setSelectedVerse(1); } };
  
  const onWordDragStart = (event, wordData) => {
    event.dataTransfer.setData('text/plain', wordData.text);
    dragRef.current = { word: wordData };
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveDiagram = (diagramElements) => {
    if (!verseData || !verseData.reference) {
      alert('Por favor, seleccione un pasaje antes de guardar el diagrama.');
      return;
    }
    fetch('http://localhost:4000/api/diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: verseData.reference,
        nodes: diagramElements,
        edges: [],
      }),
    })
    .then(res => res.ok ? alert('Diagrama guardado correctamente.') : alert('Error al guardar el diagrama.'))
    .catch(err => {
      console.error('Error al guardar el diagrama:', err);
      alert('Error de conexión al guardar el diagrama.');
    });
  };

  const handleSaveNotes = () => {
    if (!verseData || !verseData.reference) {
      alert('Por favor, seleccione un pasaje antes de guardar notas.');
      return;
    }
    fetch('http://localhost:4000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: verseData.reference, content: notesContent }),
    })
    .then(res => res.ok ? alert('Notas guardadas correctamente.') : alert('Error al guardar las notas.'))
    .catch(err => {
        console.error('Error al guardar notas:', err);
        alert('Error de conexión al guardar las notas.');
    });
  };

  const handleWordDoubleClick = (wordData) => {
    if (notesEditorRef.current) notesEditorRef.current.insertContent(`${wordData.text} `);
  };
  
  const handlePrintAndExport = async (action) => {
    console.log("Exportar/Imprimir iniciado para:", action);
  };

  // ✅ CORRECCIÓN: Nueva función que llama al método expuesto por el componente hijo
  const handleLoadPassageIntoDiagram = () => {
      if (diagramRef.current) {
          diagramRef.current.importText();
      }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="app-container">
      <h1>Proyecto Exegética Bíblica</h1>
      <PassageSelector {...{books, chapters, verses, selectedBookId, setSelectedBookId, selectedChapter, setSelectedChapter, selectedVerse, setSelectedVerse, rangeInput, setRangeInput, handleRangeLoad}} />
      {/* ✅ CORRECCIÓN: Se pasa la nueva función al navegador */}
      <PassageNavigator onAddPassage={handleLoadPassageIntoDiagram} onPrevBook={handlePrevBook} onPrevVerse={handlePrevVerse} onNextVerse={handleNextVerse} onNextBook={handleNextBook} onPrint={() => handlePrintAndExport('print')} onExportPdf={() => handlePrintAndExport('pdf')} />
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

          <div id="diagram-printable-area" className="printable-content" style={{ display: activeTab === 'diagram' ? 'flex' : 'none', height: 'calc(100vh - 250px)'}}>
            <SyntaxDiagram
              // ✅ CORRECCIÓN: Se asigna la referencia al componente
              ref={diagramRef}
              initialElements={initialDiagramData}
              passageWords={verseData ? verseData.verses.flatMap(v => v.words) : []}
              onSaveDiagram={handleSaveDiagram}
              reference={verseData ? verseData.reference : 'Ningún pasaje cargado'}
            />
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
      <DiagramApp />
  );
}
