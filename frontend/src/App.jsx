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
  const [selectedBookId, setSelectedBookId] = useState(4); // Juan (book_id=4)
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);

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

  // --- FIN DEL CÓDIGO RESTAURADO ---


  // Función reutilizable para cargar el texto del versículo
  const fetchVerseData = () => {
    if (!selectedBookId || !selectedChapter || !selectedVerse || books.length === 0) return;
    const bookName = books.find(b => b.book_id === selectedBookId)?.name;
    if (!bookName) return;

    setLoading(true);
    const apiUrl = `http://localhost:4000/api/verse/${bookName}/${selectedChapter}/${selectedVerse}`;

    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject('Verse not found'))
      .then(data => setVerseData(data))
      .catch(error => {
        console.error("Error al obtener el versículo:", error);
        setVerseData(null);
      })
      .finally(() => setLoading(false));
  };

  // useEffect que llama a la función de fetch cuando cambia la selección
  useEffect(() => {
    fetchVerseData();
  }, [selectedBookId, selectedChapter, selectedVerse, books]);

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
          onSave={fetchVerseData}
        />
      }
    </div>
  );
}
export default App;