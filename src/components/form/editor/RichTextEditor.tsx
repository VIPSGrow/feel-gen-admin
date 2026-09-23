"use client";
import React, { useRef, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
  rows,
}) => {
  const [mounted, setMounted] = useState(false);
  const lastValue = useRef(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR hydration error fix
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-[160px] p-4 text-gray-900 dark:text-gray-100 max-w-none focus:outline-none",
      },
    },
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastValue.current = html;
      onChange(html);
    },
  });

  // Sync external value changes safely bina cursor jump karwaye
  useEffect(() => {
    if (!editor) return;
    const isSame = editor.getHTML() === value;
    if (!isSame && value !== lastValue.current) {
      lastValue.current = value;
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const toggleHeading = (level: 1 | 2 | 3) => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBold = () => {
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    if (!editor) return;
    editor.chain().focus().toggleItalic().run();
  };

  const toggleBulletList = () => {
    if (!editor) return;
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    if (!editor) return;
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    if (!editor) return;
    editor.chain().focus().toggleBlockquote().run();
  };

  const toggleCode = () => {
    if (!editor) return;
    editor.chain().focus().toggleCode().run();
  };

  const btnBase =
    "p-2 rounded text-xs transition-colors border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed";

  const btnActive =
    "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold";

  const btnInactive =
    "bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200";

  const btnClass = (active: boolean) =>
    `${btnBase} ${active ? btnActive : btnInactive}`;

  if (!mounted) {
    return (
      <div
        className={`border border-gray-300 rounded-xl dark:border-gray-700 dark:bg-gray-900 animate-pulse ${className}`}
        style={{ minHeight: rows ? `${rows * 1.5}rem` : "220px" }}
      />
    );
  }

  return (
    <div
      className={`border border-gray-300 rounded-xl overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {/* TipTap Essential Typography Styles */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.25;
        }
        .tiptap h2 {
          font-size: 1.35rem;
          font-weight: 600;
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
          line-height: 1.3;
        }
        .tiptap h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.35rem;
          line-height: 1.35;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 0.85rem;
          margin: 0.75rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .tiptap code {
          background-color: rgba(150, 150, 150, 0.15);
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
      `}</style>

      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-1 flex-wrap items-center">
        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className={btnClass(false)}
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className={btnClass(false)}
          title="Redo"
        >
          <Redo2 size={14} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={() => toggleHeading(1)}
          className={btnClass(editor?.isActive("heading", { level: 1 }) ?? false)}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </button>
        <button
          type="button"
          onClick={() => toggleHeading(2)}
          className={btnClass(editor?.isActive("heading", { level: 2 }) ?? false)}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => toggleHeading(3)}
          className={btnClass(editor?.isActive("heading", { level: 3 }) ?? false)}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={toggleBold}
          className={btnClass(editor?.isActive("bold") ?? false)}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={btnClass(editor?.isActive("italic") ?? false)}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={toggleBulletList}
          className={btnClass(editor?.isActive("bulletList") ?? false)}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          className={btnClass(editor?.isActive("orderedList") ?? false)}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={toggleBlockquote}
          className={btnClass(editor?.isActive("blockquote") ?? false)}
          title="Blockquote"
        >
          <Quote size={14} />
        </button>
        <button
          type="button"
          onClick={toggleCode}
          className={btnClass(editor?.isActive("code") ?? false)}
          title="Inline Code"
        >
          <Code size={14} />
        </button>
      </div>

      {/* Editor Content */}
      <div
        className="w-full bg-transparent overflow-y-auto"
        style={{
          minHeight: rows ? `${rows * 1.5}rem` : "180px",
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Counter */}
      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span>{(value || "").length} characters</span>
        <span>Supports HTML formatting</span>
      </div>
    </div>
  );
};

export default RichTextEditor;