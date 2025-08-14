import React from 'react';
// ✅ 1. Importar el objeto de configuración.
import { useLanguage } from '../context/LanguageContext'; 

// --- Iconos SVG para cada botón ---
const icons = {
  first: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>,
  prev: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  next: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  last: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>,
  add: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>,
  print: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
  pdf: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="15 15 12 18 9 15"></polyline></svg>
};

function PassageNavigator({ 
  onPrevBook, 
  onPrevVerse, 
  onNextVerse, 
  onNextBook,
  onAddPassage,
  onPrint,
  onExportPdf
}) {

  // ✅ 3. Obtener los textos para el idioma actual.
  const { localized } = useLanguage();    

  return (
    <div className="passage-navigator">
      <div className="navigation-group">
        {/* ✅ 4. Usar los textos localizados en los 'title' de los botones. */}
        <button onClick={onPrevBook} title={localized.ui.passageNavigator.prevBook}>{icons.first}</button>
        <button onClick={onPrevVerse} title={localized.ui.passageNavigator.prevVerse}>{icons.prev}</button>
        <button onClick={onNextVerse} title={localized.ui.passageNavigator.nextVerse}>{icons.next}</button>
        <button onClick={onNextBook} title={localized.ui.passageNavigator.nextBook}>{icons.last}</button>
      </div>
      <div className="action-group">
        <button onClick={onAddPassage} title={localized.ui.passageNavigator.add}>{icons.add}</button>
        <button onClick={onPrint} title={localized.ui.passageNavigator.print}>{icons.print}</button>
        <button onClick={onExportPdf} title={localized.ui.passageNavigator.exportPdf}>{icons.pdf}</button>
      </div>
    </div>
  );
}

export default PassageNavigator;
