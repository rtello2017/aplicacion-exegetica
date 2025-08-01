import React, { useState, useEffect } from 'react';
import './App.css';
import PassageSelector from './components/PassageSelector';
import TextViewer from './components/TextViewer';
import AnalysisPopup from './components/AnalysisPopup';

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
  // --- ¡LA CLAVE DE LA SOLUCIÓN! ---
  // Un único estado para guardar la última consulta válida
  const [activeQuery, setActiveQuery] = useState({ type: 'select', bookId: 1, chapter: 1, verse: 1 });

  // Estados para el visor de texto y el popup
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  // --- CÓDIGO RESTAURADO PARA CARGAR LOS SELECTORES ---

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
        const chapterCount = data.chapter_count || 0;
        setChapters(Array.from({ length: chapterCount }, (_, i) => i + 1));
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

  return (
    <div>
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
      <div className="viewer-container">
        {loading ? <p>Cargando...</p> : 
          <TextViewer 
            verseData={verseData} 
            onWordClick={setSelectedWord}
          />
        }
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