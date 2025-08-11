import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>S</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>P</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>Lista</button>
    </div>
  );
};

// Componente principal de Notas de Estudio, ahora con Tiptap
const StudyNotes = forwardRef(({ initialContent, onUpdate, onSave, reference, language }, ref) => {
  
  const { localized } = useLanguage();    
  
  const editor = useEditor({
    extensions: [StarterKit],
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

  // ✅ Construir el texto del título dinámicamente.
  const titleText = reference
    ? localized.ui.studyNotes.title.replace('{reference}', reference)
    : localized.ui.studyNotes.noPassage;

  return (
    <div className="study-notes-panel">
      <div className="notes-header">
        <h3>{titleText}</h3>
        <button onClick={onSave} className="save-notes-button">{localized.ui.studyNotes.saveButton}</button>
      </div>
      <div className="tiptap-editor-wrapper" onDrop={handleDrop} onDragOver={handleDragOver}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default StudyNotes;
