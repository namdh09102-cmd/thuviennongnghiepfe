'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import imageCompression from 'browser-image-compression';
import { Bold, Italic, Heading2, Heading3, Quote, Code, List, ListOrdered, Link as LinkIcon, ImageIcon, Loader2 } from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Detect mobile keyboard height stickiness via visualViewport API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const fullHeight = window.innerHeight;
        const diff = fullHeight - viewportHeight;
        setKeyboardHeight(diff > 60 ? diff : 0);
      };

      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-4 shadow-md',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-green-600 font-bold underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Chia sẻ kinh nghiệm, kỹ thuật canh tác, hoặc đặt câu hỏi...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content synced initially
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content === '') {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return <div className="h-40 bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center text-xs font-bold text-gray-400">Đang tải trình soạn thảo...</div>;

  const addLink = () => {
    const url = prompt('Nhập liên kết URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Resize image down to max 1200px
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const ToolbarButton = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${
        active
          ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
      {/* Floating or Fixed Toolbar for mobile keyboard stickiness */}
      <div
        className="bg-gray-50 p-3 border-b border-gray-200 flex flex-col gap-2 z-20 sticky top-0 transition-all"
        style={{ bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 'auto' }}
      >
        {/* Row 1: Bold, Italic, H2, H3, Quote, Code */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Row 2: List (bullet), List (numbered), Link, Image upload */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addLink} active={editor.isActive('link')}>
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          
          {/* Image Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <ImageIcon className="w-4 h-4" />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-6 min-h-[300px] prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  );
}
