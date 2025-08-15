import React, { useState, useEffect, useRef } from 'react';
import './ConcordanceModal.css';

import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../utils/api';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Componente oculto que se usa solo para renderizar el contenido completo para el PDF
const PrintableConcordance = React.forwardRef(({ data, wordData, localized }, ref) => (
    <div ref={ref} className="printable-content">
        <h2>{localized.ui.concordanceModal.title.replace("{word}", wordData.text)}</h2>
        <div className="concordance-columns">
            <div className="concordance-section">
                <h3>&nbsp;{localized.ui.concordanceModal.lemmaHeader.replace("{lemma}", wordData.lemma).replace("{count}", data.lemmaOccurrences.length)}</h3>
                {data.lemmaOccurrences.map((item, index) => (
                    <div key={`p-lemma-${index}`} className="printable-item">
                        <span>&nbsp;</span>
                        <span>{item.reference}</span>
                        <p><span>&nbsp;</span>{item.context.map(w => w.text).join(' ')}</p>
                    </div>
                ))}
            </div>
            <div className="concordance-section">
                <h3>{localized.ui.concordanceModal.textHeader.replace("{text}", wordData.text).replace("{count}", data.textOccurrences.length)}</h3>
                {data.textOccurrences.map((item, index) => (
                    <div key={`p-text-${index}`} className="printable-item">
                        <span>{item.reference}</span>
                        <p>{item.context.map(w => w.text).join(' ')}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
));

function ConcordanceModal({ wordData, onClose }) {

  const { localized } = useLanguage();  
  const [concordance, setConcordance] = useState({ lemmaOccurrences: [], textOccurrences: [] });
  const [totals, setTotals] = useState({ lemma: 0, text: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [fullExportData, setFullExportData] = useState(null);
  const printableRef = useRef(null);
  const limit = 25;

  // ✅ 2. Modificamos el useEffect para que reaccione a los cambios de página
  useEffect(() => {
    const fetchConcordance = async () => {
        if (wordData.lemma && wordData.text) {
            setIsLoading(true);
            try {
                const endpoint = `/word/concordance/${encodeURIComponent(wordData.lemma)}/${encodeURIComponent(wordData.text)}?page=${currentPage}&limit=${limit}`;
                const data = await apiFetch(endpoint);
                setConcordance({
                    lemmaOccurrences: data.lemmaOccurrences,
                    textOccurrences: data.textOccurrences
                });
                setTotals(data.totals);
            } catch (error) {
                console.error('Error al cargar la concordancia:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchConcordance();
  }, [wordData, currentPage]);

  useEffect(() => {
    if (fullExportData && printableRef.current) {
        html2canvas(printableRef.current, { scale: 2, windowWidth: printableRef.current.scrollWidth, windowHeight: printableRef.current.scrollHeight }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            let heightLeft = pdfHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft > 0) {
              position = heightLeft - pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`concordancia_${wordData.lemma}.pdf`);
            
            setFullExportData(null);
            setIsExporting(false);
        });
    }
  }, [fullExportData, wordData]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
        const endpoint = `/word/concordance/${encodeURIComponent(wordData.lemma)}/${encodeURIComponent(wordData.text)}`;
        const data = await apiFetch(endpoint);
        setFullExportData(data);
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        alert('No se pudo generar el PDF.');
        setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(Math.max(totals.lemma, totals.text) / limit);
  // Calculamos las páginas totales para Lemma y Forma exacta
  const totalPagesLemma = Math.ceil(totals.lemma / limit);
  const totalPagesText = Math.ceil(totals.text / limit);

  // Función para resaltar la palabra en el texto del versículo
  const highlightWord = (verseText, wordToHighlight) => {
    const regex = new RegExp(`(${wordToHighlight})`, 'gi');
    return verseText.split(regex).map((part, index) => 
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{localized.ui.concordanceModal.title.replace("{word}", wordData.text)}</h2>
          <div className="modal-actions">
            <button onClick={handleExportPdf} disabled={isExporting} className="export-pdf-button">
              {isExporting ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>

        {isLoading ? (
          <p>{localized.ui.concordanceModal.loading}</p>
        ) : (
          <div className="concordance-columns" ref={printableRef}>
            {/* --- Columna para la Raíz (Lemma) --- */}
            <div className="concordance-section">
              <h3>{localized.ui.concordanceModal.lemmaHeader.replace("{lemma}", wordData.lemma).replace("{count}", totals.lemma)}</h3>
              <div className="results-list">
                {concordance.lemmaOccurrences.map((item, index) => (
                  <div key={`lemma-${index}`} className="concordance-item">
                    <span className="concordance-ref">{item.reference}</span>
                    {/* ✅ Lógica de renderizado corregida */}
                    <p className="concordance-text">
                      {item.context.map((word, wordIndex) => (
                        <span 
                          key={wordIndex} 
                          className={`word ${word.lemma === wordData.lemma ? 'highlight' : ''}`}
                        >
                          <span className="greek-word">{word.text}</span>
                          <span className="parsing">{word.parsing}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Columna para la Forma Exacta --- */}
            <div className="concordance-section">
              <h3>{localized.ui.concordanceModal.textHeader.replace("{text}", wordData.text).replace("{count}", totals.text)}</h3>
              <div className="results-list">
                 {concordance.textOccurrences.map((item, index) => (
                  <div key={`text-${index}`} className="concordance-item">
                    <span className="concordance-ref">{item.reference}</span>
                    {/* ✅ Lógica de renderizado corregida */}
                     <p className="concordance-text">
                      {item.context.map((word, wordIndex) => (
                        <span 
                          key={wordIndex} 
                          className={`word ${word.text === wordData.text ? 'highlight' : ''}`}
                        >
                          <span className="greek-word">{word.text}</span>
                          <span className="parsing">{word.parsing}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && !isLoading && (
            <div className="pagination-controls">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Siguiente</button>
            </div>
        )}

        {fullExportData && (
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                <PrintableConcordance ref={printableRef} data={fullExportData} wordData={wordData} localized={localized} />
            </div>
        )}
      </div>
    </div>
  );
}

export default ConcordanceModal;
