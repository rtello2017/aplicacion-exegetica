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
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { apiFetch } from './utils/api'; // Importa la nueva función
import { SessionExpiredError } from './utils/errors';
import { settings } from './appSettings';

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

function DiagramApp() {
  // --- ESTADO GENERAL DE LA APLICACIÓN ---
  const { language, setLanguage, localized, urls } = useLanguage();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // 1. Elimina el token del almacenamiento
    navigate('/login');               // 2. Redirige al usuario a la página de login
  };

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

  const handlePrint = () => {
    // Simplemente abre el diálogo de impresión del navegador.
    // El CSS que añadimos se encargará de formatear el contenido.
    window.print();
  };

  const handleExportPdf = () => {
    const input = document.getElementById('text-viewer-printable-area');
    if (!input) {
      console.error("El elemento para exportar a PDF no fue encontrado.");
      return;
    }

    // Usamos una opción para que html2canvas capture todo el ancho, incluso si hay overflow
    html2canvas(input, { 
      scale: 2, 
      useCORS: true,
      width: input.scrollWidth, // Captura el ancho total del contenido
      height: input.scrollHeight // Captura el alto total del contenido
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // 1. Crear un PDF en tamaño A4 y orientación horizontal para más espacio
        const pdf = new jsPDF({
            orientation: 'landscape', // 'l' para horizontal
            unit: 'px',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // 2. Calcular la proporción para que la imagen quepa sin deformarse
        const canvasRatio = canvasWidth / canvasHeight;
        const pdfRatio = pdfWidth / pdfHeight;

        let finalWidth, finalHeight;
        if (canvasRatio > pdfRatio) {
            // Si la imagen es más ancha (proporcionalmente) que el PDF
            finalWidth = pdfWidth;
            finalHeight = pdfWidth / canvasRatio;
        } else {
            // Si la imagen es más alta (proporcionalmente) que el PDF
            finalHeight = pdfHeight;
            finalWidth = pdfHeight * canvasRatio;
        }

        // 3. (Opcional) Centrar la imagen en la página del PDF
        const xOffset = (pdfWidth - finalWidth) / 2;
        const yOffset = (pdfHeight - finalHeight) / 2;
        
        // 4. Añadir la imagen escalada al PDF
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        
        const fileName = verseData?.reference ? `pasaje_${verseData.reference.replace(/\s|:/g, '_')}.pdf` : 'pasaje.pdf';
        pdf.save(fileName);
    });
  };

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

  const fetchData = useCallback(async () => {
      if (!activeQuery || books.length === 0) return;
      setLoading(true);

      try {
          //let apiUrl = '';
          let apiPath = '';
          if (activeQuery.type === 'range') {
              apiPath = `/passage/${encodeURIComponent(activeQuery.range)}`;
          } else {
              const book = books.find(b => b.book_id === activeQuery.bookId);
              if (!book) { setLoading(false); return; }
              apiPath = activeQuery.verse === 'ALL'
                  ? `/chapter/${book.name}/${activeQuery.chapter}`
                  : `/verse/${book.name}/${activeQuery.chapter}/${activeQuery.verse}`;
          }

          // 1. Obtenemos los datos del pasaje (esta ruta es pública)
          /*const passageResponse = await apiFetch(apiPath);
          if (!passageResponse.ok) throw new Error('Pasaje no encontrado');
          const passageData = await passageResponse.json();*/

          const passageData = await apiFetch(apiPath);
          
          const reference = passageData.reference;
          setVerseData({ reference, verses: passageData.verses || [{ verse: activeQuery.verse, words: passageData.words }] });

          // 2. Usamos Promise.all para buscar notas y diagramas en paralelo con apiFetch
          const [notesData, diagramData] = await Promise.all([
              apiFetch(`/notes/${encodeURIComponent(reference)}`).catch(() => ({ content: '' })),
              apiFetch(`/diagrams/${encodeURIComponent(reference)}`).catch(() => null)
          ]);

          // 3. Actualizamos los estados con los datos obtenidos
          const savedNotes = notesData.content || '';
          setNotesContent(savedNotes);
          if (notesEditorRef.current) {
              notesEditorRef.current.setContent(savedNotes);
          }

          if (diagramData && diagramData.nodes) {
              setInitialDiagramData(diagramData.nodes);
          } else {
              setInitialDiagramData(null); // Limpiamos el diagrama si no se encuentra
          }

      } catch (error) {
          console.error("Error al obtener el pasaje:", error);
          if (!(error instanceof SessionExpiredError)) { // <-- Compara el tipo, es robusto
              alert(localized.ui.app.notesConnectionError);
          }
      } finally {
          setLoading(false);
      }
  }, [activeQuery, books, urls.apiBase]);

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

  const handleSaveDiagram = async (diagramElements) => {
    if (!verseData || !verseData.reference) {
      alert(localized.ui.app.selectPassageFirstDiagram);
      return;
    }

    try {
        await apiFetch('/diagrams', {
            method: 'POST',
            body: JSON.stringify({
                reference: verseData.reference,
                nodes: diagramElements,
                edges: [], // Asegúrate de manejar 'edges' si los usas
            }),
        });
        alert(localized.ui.app.diagramSaveSuccess);
    } catch (error) {
        console.error('Error al guardar el diagrama:', error);
        if (!(error instanceof SessionExpiredError)) { // <-- Compara el tipo, es robusto
            alert(localized.ui.app.notesConnectionError);
        }
    }
  };

  const handleSaveNotes = async () => {
      // 1. La validación del pasaje se mantiene igual.
      if (!verseData || !verseData.reference) {
        alert(localized.ui.app.selectPassageFirstNotes);
        return;
      }

      // 2. Usamos try/catch para un manejo de errores más limpio.
      try {
          // 3. Llamamos a apiFetch. No necesitamos pasar el token ni las cabeceras.
          await apiFetch('/notes', {
              method: 'POST',
              body: JSON.stringify({ reference: verseData.reference, content: notesContent }),
          });

          // Si la petición fue exitosa, muestra el mensaje de éxito.
          alert(localized.ui.app.notesSaveSuccess);

      } catch (error) {
          console.error('Error al guardar notas:', error);
          
          if (!(error instanceof SessionExpiredError)) { // <-- Compara el tipo, es robusto
              alert(localized.ui.app.notesConnectionError);
          }
      }
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
        <div className="header-controls"> {/* ✅ NUEVO: Contenedor para los controles */}
        <div className="language-selector-wrapper">
          <label htmlFor="language-select">{localized.ui.app.languageLabel} </label>
          <select 
            id="language-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            {/* ✅ Mapea la lista de idiomas desde la configuración */}
            {settings.languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
          {/* ✅ NUEVO: Botón de Logout */}
          <button onClick={handleLogout} className="logout-button" title={localized.ui.app.closeSession}>
            <LogoutIcon />
          </button>
        </div>
      </div>
      
      {/* Pasamos el prop 'language' a los componentes que lo necesitarán */}
      <PassageSelector {...{books, chapters, verses, selectedBookId, setSelectedBookId, selectedChapter, setSelectedChapter, selectedVerse, setSelectedVerse, rangeInput, setRangeInput, handleRangeLoad}} />
      <PassageNavigator 
          onAddPassage={handleLoadPassageIntoDiagram} 
          onPrevBook={handlePrevBook} 
          onPrevVerse={handlePrevVerse} 
          onNextVerse={handleNextVerse} 
          onNextBook={handleNextBook}
          onPrint={handlePrint}
          onExportPdf={handleExportPdf} 
      />
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
              key={verseData?.reference || 'no-passage'}
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
    // El LanguageProvider envuelve todo para que el contexto esté disponible en todas las páginas
    <LanguageProvider>
      {/* BrowserRouter activa el sistema de rutas */}
      <BrowserRouter>
        {/* Routes define el conjunto de rutas posibles */}
        <Routes>
          {/* Ruta para la página de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta principal, protegida */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {/* DiagramApp solo se renderiza si el usuario está autenticado */}
                <DiagramApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}