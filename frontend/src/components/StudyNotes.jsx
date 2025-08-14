import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

import { useLanguage } from '../context/LanguageContext';

// Barra de herramientas para el editor Tiptap
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu-bar">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><u>U</u></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>S</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>P</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>Lista</button>
       <input
        type="color"
        onInput={event => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
      />
    </div>
  );
};

// Componente principal de Notas de Estudio, ahora con Tiptap
const StudyNotes = forwardRef(({ initialContent, onUpdate, onSave, reference }, ref) => {
  
  const { localized } = useLanguage();    
  
  const editor = useEditor({
    extensions: [StarterKit, Underline, Color, TextStyle],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML()); // Actualiza el estado en App.jsx
    },
  });

  // Expone métodos del editor al componente padre (App.jsx)
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    insertContent: (text) => editor?.chain().focus().insertContent(text).run(),
    setContent: (content) => editor?.commands.setContent(content),
  }));

  // Sincroniza el contenido del editor si el contenido inicial cambia desde el padre
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  const handleDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (text && editor) {
      editor.chain().focus().insertContent(text + ' ').run();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleExportPDF = () => {
    const content = editor.getHTML();
    const element = document.createElement('div');
    element.innerHTML = content;

    const opt = {
      margin:       1,
      filename:     `notas_${reference || 'documento'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleExportWord = () => {
      if (!editor) return;

      const tiptapJson = editor.getJSON();

      // ✅ NUEVO: Función para convertir colores RGB a HEX
      const rgbToHex = (rgb) => {
          if (!rgb || !rgb.startsWith('rgb')) {
              // Si ya es hexadecimal (o no es un color válido), lo devuelve limpiando el '#'
              return rgb ? rgb.replace('#', '') : '000000';
          }
          // Extrae los números del string "rgb(r, g, b)"
          const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
          if (!result) return '000000'; // Devuelve negro si el formato es inesperado
          
          // Convierte cada número a su par hexadecimal
          const toHex = (c) => ('0' + parseInt(c, 10).toString(16)).slice(-2);
          
          return `${toHex(result[1])}${toHex(result[2])}${toHex(result[3])}`;
      };

      const convertNodesToDocx = (nodes) => {
          const docxElements = [];

          const createStyledTextRun = (childNode) => {
              const textRunOptions = {
                  text: childNode.text,
                  bold: childNode.marks?.some(mark => mark.type === 'bold'),
                  italics: childNode.marks?.some(mark => mark.type === 'italic'),
                  underline: childNode.marks?.some(mark => mark.type === 'underline'),
                  strike: childNode.marks?.some(mark => mark.type === 'strike'),
              };

              // ✅ MODIFICACIÓN: Usamos la nueva función para convertir el color
              const colorMark = childNode.marks?.find(mark => mark.type === 'textStyle' && mark.attrs.color);
              if (colorMark) {
                  textRunOptions.color = rgbToHex(colorMark.attrs.color);
              }
              
              return new TextRun(textRunOptions);
          };
          // ... (el resto de la función convertNodesToDocx no cambia)
          nodes.forEach(node => {
              if (node.type === 'paragraph' && node.content) {
                  const paragraphChildren = node.content.map(createStyledTextRun);
                  docxElements.push(new Paragraph({ children: paragraphChildren }));
              }
              if (node.type === 'heading' && node.content) {
                  const headingChildren = node.content.map(createStyledTextRun);
                  const level = `HEADING_${node.attrs.level}`;
                  docxElements.push(new Paragraph({
                      children: headingChildren,
                      heading: HeadingLevel[level],
                  }));
              }
              if (node.type === 'bulletList' && node.content) {
                  node.content.forEach(listItem => {
                      const paragraphChildren = listItem.content[0].content.map(createStyledTextRun);
                      docxElements.push(new Paragraph({
                          children: paragraphChildren,
                          bullet: { level: 0 },
                      }));
                  });
              }
          });
          return docxElements;
      };

      const doc = new Document({
          sections: [{
              children: convertNodesToDocx(tiptapJson.content),
          }],
      });

      Packer.toBlob(doc).then(blob => {
          saveAs(blob, `notas_${reference || 'documento'}.docx`);
      });
  };

  // ✅ Construir el texto del título dinámicamente.
  const titleText = reference
    ? localized.ui.studyNotes.title.replace('{reference}', reference)
    : localized.ui.studyNotes.noPassage;

  return (
    <div className="study-notes-panel">
      <div className="notes-header">
        <h3>{titleText}</h3>
        <div className="notes-actions">
          <button onClick={handleExportPDF} className="export-button">{localized.ui.studyNotes.exportPDFButton}</button>
          <button onClick={handleExportWord} className="export-button">{localized.ui.studyNotes.exportWordButton}</button>
          <button onClick={onSave} className="save-notes-button">{localized.ui.studyNotes.saveButton}</button>
        </div>
      </div>
      <div className="tiptap-editor-wrapper" onDrop={handleDrop} onDragOver={handleDragOver}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default StudyNotes;
