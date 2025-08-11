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

// Importamos el nuevo LanguageProvider
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function DiagramApp() {
  // --- ESTADO GENERAL DE LA APLICACIÓN ---
  const { language, setLanguage, localized, urls } = useLanguage();

  // ✅ CORRECCIÓN: Definimos la función ANTES de usarla.
  const getInitialQuery = () => {
    try {
      const savedQuery = localStorage.getItem('lastActiveQuery');
      return savedQuery ? JSON.parse(savedQuery) : { type: 'select', bookId: 1, chapter: 1, verse: 1 };
    } catch (error) {
      console.error("Error al leer la última consulta guardada:", error);
      return { type: 'select', bookId: 1, chapter: 1, verse: 1 };
    }
  };

  // ✅ CORRECCIÓN: Llamamos a getInitialQuery UNA SOLA VEZ al inicio.
  const initialQuery = getInitialQuery();
  
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  
  // ✅ CORRECCIÓN: Inicializamos los estados de los selectores de forma condicional.
  // Si la consulta inicial es de tipo 'select', usamos sus valores.
  // Si es de tipo 'range', usamos un valor por defecto seguro (ej: el primer libro, capítulo 1, etc.)
  // para evitar que los combos queden en un estado inválido (undefined).
  const [selectedBookId, setSelectedBookId] = useState(initialQuery.type === 'select' ? initialQuery.bookId : 1);
  const [selectedChapter, setSelectedChapter] = useState(initialQuery.type === 'select' ? initialQuery.chapter : 1);
  const [selectedVerse, setSelectedVerse] = useState(initialQuery.type === 'select' ? initialQuery.verse : 1);

  // ✅ CORRECCIÓN: Pre-poblamos el campo de rango si ese fue el último tipo de consulta.
  const [rangeInput, setRangeInput] = useState(initialQuery.type === 'range' ? initialQuery.range : '');
															   
  
  // ✅ CORRECCIÓN: El estado de la consulta activa se inicializa con el objeto que ya leímos.
  const [activeQuery, setActiveQuery] = useState(initialQuery);
 
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
    fetch(`${urls.apiBase}/books`)
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error al cargar libros:", err));
  }, []);

  useEffect(() => {
    if (!selectedBookId) return;
    fetch(`${urls.apiBase}/chapters/${selectedBookId}`)
      .then(res => res.json())
      .then(data => {
        setChapters(Array.from({ length: data.chapter_count || 0 }, (_, i) => i + 1));
      })
      .catch(err => console.error("Error al cargar capítulos:", err));
  }, [selectedBookId]);

  useEffect(() => {
    if (!selectedBookId || !selectedChapter) return;
    fetch(`${urls.apiBase}/verses/${selectedBookId}/${selectedChapter}`)
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
      apiUrl = `${urls.apiBase}/passage/${encodeURIComponent(activeQuery.range)}`;
    } else {
      const book = books.find(b => b.book_id === activeQuery.bookId);
      if (!book) { setLoading(false); return; }
      apiUrl = activeQuery.verse === 'ALL'
        ? `${urls.apiBase}/chapter/${book.name}/${activeQuery.chapter}`
        : `${urls.apiBase}/verse/${book.name}/${activeQuery.chapter}/${activeQuery.verse}`;
    }

    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject({ noPassageFound: localized.ui.app.noPassageFound }))
      .then(data => {
        const reference = data.reference;
        setVerseData({ reference, verses: data.verses || [{ verse: activeQuery.verse, words: data.words }] });

        fetch(`${urls.apiBase}/notes/${encodeURIComponent(reference)}`)
          .then(res => res.json())
          .then(notesData => {
            const savedNotes = notesData.content || '';
            setNotesContent(savedNotes);
            if (notesEditorRef.current) notesEditorRef.current.setContent(savedNotes);
          });

        fetch(`${urls.apiBase}/diagrams/${encodeURIComponent(reference)}`)
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

  // Eliminamos la condición `if` para que SIEMPRE que se cambie un combo, la consulta activa se actualice al modo 'select'.
  useEffect(() => {
      setActiveQuery({ 
        type: 'select', 
        bookId: selectedBookId, 
        chapter: selectedChapter, 
        verse: selectedVerse 
      });
      setRangeInput(''); // Limpiamos el input de rango al cambiar selección manualmente.
  }, [selectedBookId, selectedChapter, selectedVerse, books]); // Añadimos 'books' por si el ID inicial no existe hasta que carguen.
  
  // --- MANEJADORES DE EVENTOS ---
  const handleRangeLoad = () => { if (rangeInput.trim()) setActiveQuery({ type: 'range', range: rangeInput }); };
  const handleNextChapter = () => { const num = parseInt(selectedChapter); if (num < chapters.length) { setSelectedChapter(num + 1); setSelectedVerse(1); } else { handleNextBook(); } };
  const handlePrevChapter = async () => { const num = parseInt(selectedChapter); if (num > 1) { const prev = num - 1; const res = await fetch(`${urls.apiBase}/verses/${selectedBookId}/${prev}`); const data = await res.json(); setSelectedChapter(prev); setSelectedVerse(data.verse_count); } else { handlePrevBook(); } };
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
      alert(localized.ui.app.selectPassageFirstDiagram);
      return;
    }
    fetch(`${urls.apiBase}/diagrams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: verseData.reference,
        nodes: diagramElements,
        edges: [],
      }),
    })
    .then(res => res.ok ? alert(localized.ui.app.diagramSaveSuccess) : alert(localized.ui.app.diagramSaveError))
    .catch(err => {
      console.error('Error al guardar el diagrama:', err);
      alert(localized.ui.app.diagramConnectionError);
    });
  };

  const handleSaveNotes = () => {
    if (!verseData || !verseData.reference) {
      alert(localized.ui.app.selectPassageFirstNotes);
      return;
    }
    fetch(`${urls.apiBase}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: verseData.reference, content: notesContent }),
    })
    .then(res => res.ok ? alert(localized.ui.app.notesSaveSuccess) : alert(localized.ui.app.notesSaveError))
    .catch(err => {
        console.error('Error al guardar notas:', err);
        alert(localized.ui.app.notesConnectionError);
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
      {/* ✅ NUEVO: Cabecera con el título y el selector de idioma. */}
      <div className="app-header">
        <h1>{localized.ui.app.title}</h1>
        <div className="language-selector-wrapper">
          <label htmlFor="language-select">{localized.ui.app.languageLabel} </label>
          <select 
            id="language-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      
      {/* Pasamos el prop 'language' a los componentes que lo necesitarán */}
      <PassageSelector {...{books, chapters, verses, selectedBookId, setSelectedBookId, selectedChapter, setSelectedChapter, selectedVerse, setSelectedVerse, rangeInput, setRangeInput, handleRangeLoad}} />
      <PassageNavigator onAddPassage={handleLoadPassageIntoDiagram} onPrevBook={handlePrevBook} onPrevVerse={handlePrevVerse} onNextVerse={handleNextVerse} onNextBook={handleNextBook} />
      <Legend />

      <div className="tabs-container">
        <div className="tab-buttons">
            <button onClick={() => setActiveTab('text')} className={activeTab === 'text' ? 'active' : ''}>{localized.ui.app.tabPassage}</button>
            <button onClick={() => setActiveTab('diagram')} className={activeTab === 'diagram' ? 'active' : ''}>{localized.ui.app.tabDiagram}</button>
        </div>
        <div className="tab-content">
          <div id="text-viewer-printable-area" ref={textViewerRef} className="printable-content" style={{ display: activeTab === 'text' ? 'block' : 'none' }}>
            <div className="text-viewer-container">
              {loading ? <p>{localized.ui.app.loading}</p> : <TextViewer verseData={verseData} onWordClick={setSelectedWord} onWordDragStart={onWordDragStart} onWordDoubleClick={handleWordDoubleClick} />}
            </div> 
          </div>

          <div id="diagram-printable-area" className="printable-content" style={{ display: activeTab === 'diagram' ? 'flex' : 'none', height: 'calc(100vh - 250px)'}}>
            <SyntaxDiagram
              // ✅ CORRECCIÓN: Se asigna la referencia al componente
              ref={diagramRef}
              initialElements={initialDiagramData}
              passageWords={verseData ? verseData.verses.flatMap(v => v.words) : []}
              onSaveDiagram={handleSaveDiagram}
              reference={verseData ? verseData.reference : localized.ui.app.noPassageLoaded}
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
    <LanguageProvider>
      <DiagramApp />
    </LanguageProvider>
  );
}
