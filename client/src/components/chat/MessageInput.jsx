import { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2.5 bg-transparent border border-border text-text text-xs outline-none"
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className="px-4 py-2.5 bg-text text-page text-xs tracking-[0.15em] uppercase font-sans disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      </button>
    </form>
  );
}
