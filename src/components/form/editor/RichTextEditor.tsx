import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

const formatText = (command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value ?? undefined);
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleToolbar = (item: {command: string, value?: string}) => {
    formatText(item.command, item.value);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const toolbarItems = [
    { label: 'H1', command: 'formatBlock', value: 'h1' },
    { label: 'H2', command: 'formatBlock', value: 'h2' },
    { label: 'H3', command: 'formatBlock', value: 'h3' },
    { label: 'Bold', command: 'bold' },
    { label: 'Italic', command: 'italic' },
    { label: 'UL', command: 'insertUnorderedList' },
    { label: 'OL', command: 'insertOrderedList' },
  ];

  return (
    <div className={`border border-gray-300 rounded-xl focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className={`bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-1 flex-wrap ${!isFocused ? 'hidden' : ''}`}>
        {toolbarItems.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleToolbar(item)}
            className="px-2 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200 shadow-sm transition-colors"
            title={item.label}
          >
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
      
      {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="w-full min-h-[200px] p-4 outline-none text-gray-900 dark:text-white bg-transparent resize-vertical"
          style={{ minHeight: '200px' }}
          suppressContentEditableWarning={true}
        />
      
      {/* Placeholder */}
      {!isFocused && !value && (
        <div className="absolute inset-0 pointer-events-none p-4 text-gray-400 italic">
          {placeholder}
        </div>
      )}
      
      {/* Counter (optional) */}
      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
        {value.length} characters - Supports basic HTML formatting
      </div>
    </div>
  );
};

export default RichTextEditor;

