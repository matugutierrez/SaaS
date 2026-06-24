import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import Message from './Message';
import MessageInput from './MessageInput';

export default function ChatRoom({ roomId, roomName }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    setMessages([]);
    setPage(1);
    api.get(`/chat/rooms/${roomId}/messages?page=1`)
      .then((res) => {
        setMessages(res.data.messages);
        setTotalPages(res.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit('chat:join', roomId);
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat:message', handler);
    return () => {
      socket.emit('chat:leave', roomId);
      socket.off('chat:message', handler);
    };
  }, [socket, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content) => {
    if (!socket) return;
    socket.emit('chat:send', { roomId, content });
  };

  const loadMore = async () => {
    if (page >= totalPages) return;
    const next = page + 1;
    const res = await api.get(`/chat/rooms/${roomId}/messages?page=${next}`);
    setMessages((prev) => [...res.data.messages, ...prev]);
    setPage(next);
  };

  if (!roomId) {
    return <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a channel</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 border-b bg-white">
        <h3 className="font-semibold text-sm">#{roomName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div></div>
        ) : (
          <>
            {page < totalPages && (
              <button onClick={loadMore} className="text-xs text-primary-600 hover:underline w-full text-center py-2">Load older messages</button>
            )}
            {messages.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>}
            {messages.map((msg) => (
              <Message key={msg._id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <div className="p-4 border-t bg-white">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
