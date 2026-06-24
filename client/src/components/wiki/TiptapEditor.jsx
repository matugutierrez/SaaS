import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const Toolbar = () => {
    const items = [
      { icon: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Bold' },
      { icon: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Italic' },
      { icon: 'S', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: 'Strike' },
      { type: 'divider' },
      { icon: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), label: 'Heading 1' },
      { icon: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), label: 'Heading 2' },
      { icon: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), label: 'Heading 3' },
      { type: 'divider' },
      { icon: '•', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), label: 'Bullet list' },
      { icon: '1.', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), label: 'Ordered list' },
      { icon: '❝', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), label: 'Blockquote' },
      { icon: '</>', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), label: 'Code block' },
      { type: 'divider' },
      { icon: '🔗', action: () => { const url = prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }, active: editor.isActive('link'), label: 'Link' },
    ];

    return (
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        {items.map((item, i) => {
          if (item.type === 'divider') return <div key={i} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
          return (
            <button
              key={i}
              onClick={item.action}
              title={item.label}
              className={`px-2 py-1 text-xs font-medium rounded ${item.active ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <Toolbar />
      <EditorContent editor={editor} className="prose prose-sm max-w-none dark:text-gray-300 dark:prose-invert" />
    </div>
  );
}
