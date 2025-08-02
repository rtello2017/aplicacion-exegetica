import React, { useState, useEffect, useMemo, useRef } from 'react'; // 1. Importar useMemo
import './App.css';
import { ReactFlowProvider } from 'reactflow'; // Importar el Provider

// Importación de componentes
import PassageSelector from './components/PassageSelector';
import TextViewer from './components/TextViewer';
import AnalysisPopup from './components/AnalysisPopup';
import PassageNavigator from './components/PassageNavigator'; // <-- 1. IMPORTAR EL NUEVO COMPONENTE
import SyntaxDiagram from './components/SyntaxDiagram';
import DiagramToolbar from './components/DiagramToolbar';
import { ShapeNode } from './components/ShapeNode';
import { TextNode } from './components/diagram-nodes/TextNode';
																																		   
function App() {
  // Estados para las listas de los selectores
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);

  // Estados para la selección actual del usuario
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [rangeInput, setRangeInput] = useState('');
  const [activeQuery, setActiveQuery] = useState(null);

  // Estados para el visor de texto y el popup
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' o 'diagram'
  
  // Estados de React Flow
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const reactFlowWrapper = useRef(null);

  const nodeTypes = useMemo(() => ({
    textNode: TextNode,
    shapeNode: ShapeNode,
  }), []);

  // 1. Cargar la lista de libros al iniciar la app
  useEffect(() => {
    fetch('http://localhost:4000/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Error al cargar libros:", err));
  }, []); // El array vacío significa que solo se ejecuta una vez

  // 2. Cargar la lista de capítulos cuando cambia el libro seleccionado
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

  // 3. Cargar la lista de versículos cuando cambia el capítulo (o el libro)
  useEffect(() => {
    if (!selectedBookId || !selectedChapter) return;
    fetch(`http://localhost:4000/api/verses/${selectedBookId}/${selectedChapter}`)
      .then(res => res.json())
      .then(data => {
        const verseCount = data.verse_count || 0;
        setVerses(Array.from({ length: verseCount }, (_, i) => i + 1));
        setSelectedVerse(1);
      })
      .catch(err => console.error("Error al cargar versículos:", err));
  }, [selectedBookId, selectedChapter]);

  // --- Lógica de Fetch Unificada ---
  const fetchData = () => {
    if (!activeQuery) return;
    setLoading(true);

    let apiUrl = '';
    
    if (activeQuery.type === 'range') {
      // Si la última consulta fue un rango
      const encodedRange = encodeURIComponent(activeQuery.range);
      apiUrl = `http://localhost:4000/api/passage/${encodedRange}`;
    } else {
      // Si la última consulta fue de los selectores
      const book = books.find(b => b.book_id === activeQuery.bookId);
      if (!book) { setLoading(false); return; }

      if (activeQuery.verse === 'ALL') {
        apiUrl = `http://localhost:4000/api/chapter/${book.name}/${activeQuery.chapter}`;
      } else {
        apiUrl = `http://localhost:4000/api/verse/${book.name}/${activeQuery.chapter}/${activeQuery.verse}`;
      }
    }

    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject('Pasaje no encontrado'))
      .then(data => {
        if (data.verses) {
          setVerseData({ reference: data.reference, verses: data.verses });
        } else {
          setVerseData({ reference: data.reference, verses: [{ verse: activeQuery.verse, words: data.words }] });
        }
      })
      .catch(error => { console.error("Error al obtener el pasaje:", error); setVerseData(null); })
      .finally(() => setLoading(false));
  };

  // Este useEffect ahora se dispara solo cuando cambia la consulta activa
  useEffect(() => {
    if (books.length > 0) {
      fetchData();
    }
  }, [activeQuery, books]);

  // Nuevo useEffect para actualizar la consulta activa cuando cambian los selectores
  useEffect(() => {
    setActiveQuery({ type: 'select', bookId: selectedBookId, chapter: selectedChapter, verse: selectedVerse });
  }, [selectedBookId, selectedChapter, selectedVerse]);

  // La función para cargar el rango ahora solo actualiza la consulta activa
  const handleRangeLoad = () => {
    if (!rangeInput.trim()) return;
    setActiveQuery({ type: 'range', range: rangeInput });
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
      // Para ir al último versículo del capítulo anterior, necesitamos saber cuántos versículos tiene
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

  // --- LÓGICA DE CLIC EN LA PALABRA (SIMPLIFICADA) ---
  // Ahora el clic solo abre el popup, como era originalmente.
  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  // --- NUEVA FUNCIÓN PARA CARGAR EL PASAJE AL DIAGRAMA ---
  const loadPassageIntoDiagram = () => {
    if (!verseData || !verseData.verses) return;

    // Validamos la restricción de 15 versículos
    if (verseData.verses.length > 15) {
      alert("La herramienta de diagrama solo puede cargar un máximo de 15 versículos a la vez.");
      return;
    }
	
	// Filtramos para mantener solo los nodos que son formas (los que no son 'textNode')
    const existingShapeNodes = nodes.filter(node => node.type !== 'textNode');

    const newNodes = [];
    let yOffset = 0;

    // Iteramos sobre cada versículo y cada palabra para crear los nodos
    verseData.verses.forEach(verse => {
      verse.words.forEach((word, index) => {
        const newNode = {
          id: String(word.id),
          type: 'textNode',
          data: { label: word.text },
          position: { x: index * 120, y: yOffset },
        };
        newNodes.push(newNode);
      });
      yOffset += 100; // Aumentamos el espaciado vertical para el siguiente versículo
    });

    setNodes([...existingShapeNodes, ...newNodes]);
    setEdges([]); // Limpiamos las conexiones anteriores
  };

  const handleClearDiagram = () => {
    // Usamos el diálogo de confirmación nativo del navegador
    const isConfirmed = window.confirm("¿Estás seguro de que deseas limpiar el lienzo? Se perderá todo el trabajo no guardado.");

    if (isConfirmed) {
      setNodes([]);
      setEdges([]);
    }
  };

				   
							 
		 

  return (
    <div className="app-container"> {/* <-- AÑADE ESTA CLASE */}
      <h1>Proyecto Exegética Bíblica</h1>
      <PassageSelector
        books={books}
        chapters={chapters}
        verses={verses}
        selectedBookId={selectedBookId}
        setSelectedBookId={setSelectedBookId}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        selectedVerse={selectedVerse}
        setSelectedVerse={setSelectedVerse}
        rangeInput={rangeInput}
        setRangeInput={setRangeInput}
        handleRangeLoad={handleRangeLoad} // <-- PASAMOS LA NUEVA FUNCIÓN
      />
      {/* 2. AÑADIR EL COMPONENTE DE NAVEGACIÓN */}
      <PassageNavigator 
        onPrevBook={handlePrevBook}
        onPrevVerse={handlePrevVerse}
        onNextVerse={handleNextVerse}
        onNextBook={handleNextBook}
      />

	    {/* --- NUEVA INTERFAZ DE PESTAÑAS --- */}
      <div className="tabs-container">
        <div className="tab-buttons" style={{marginBottom: '10px'}}>
          <button onClick={() => setActiveTab('text')} className={activeTab === 'text' ? 'active' : ''}>
            Pasaje
          </button>
          <button onClick={() => setActiveTab('diagram')} className={activeTab === 'diagram' ? 'active' : ''}>
            Diagrama
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'text' && (
            <div className="viewer-container">
              {loading ? <p>Cargando...</p> : 
                <TextViewer 
                  verseData={verseData} 
                  onWordClick={setSelectedWord} // <-- Usamos la función simplificada
                />
              }
            </div>
          )}

          {activeTab === 'diagram' && (
            <div className="diagram-main-container">
			  <div className="diagram-top-controls">
                <button onClick={loadPassageIntoDiagram}>
                  Añadir Pasaje al Diagrama
                </button>
                {/* --- AÑADIR ESTE NUEVO BOTÓN --- */}
                <button onClick={handleClearDiagram} className="clear-btn">
                  Limpiar Lienzo
                </button>
              </div>
			  {/* Este contenedor usa flexbox para alinear la barra y el lienzo */}
              <div className="diagram-view-container">
              <DiagramToolbar
                onSelectTool={setSelectedTool}
                selectedTool={selectedTool}
              />
              <div className="diagram-wrapper" ref={reactFlowWrapper}>
                <ReactFlowProvider> {/* Envolver con el Provider */}
                  <SyntaxDiagram
                    nodes={nodes}
                    setNodes={setNodes}
                    edges={edges}
                    setEdges={setEdges}
                    nodeTypes={nodeTypes}
                    selectedTool={selectedTool}
                    reactFlowWrapper={reactFlowWrapper}
                    />
                  </ReactFlowProvider>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
	  
      {selectedWord && 
        <AnalysisPopup 
          wordData={selectedWord} 
          onClose={() => setSelectedWord(null)}
          onSave={fetchData}
        />
      }
    </div>
  );
}
export default App;
