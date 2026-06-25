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
    const deleteHandler = ({ messageId }) => {
      setMessages((prev) => prev.filter(m => m._id !== messageId));
    };
    socket.on('chat:message', handler);
    socket.on('chat:messageDeleted', deleteHandler);
    return () => {
      socket.emit('chat:leave', roomId);
      socket.off('chat:message', handler);
      socket.off('chat:messageDeleted', deleteHandler);
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
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">#{roomName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/30 dark:bg-gray-950/30">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-36'} bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse`} />
            </div>)}
          </div>
        ) : (
          <>
            {page < totalPages && (
              <button onClick={loadMore}
                className="text-xs text-primary-600 font-medium hover:underline w-full text-center py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Load older messages
              </button>
            )}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Be the first to say something</p>
              </div>
            ) : (
              messages.map((msg) => <Message key={msg._id} message={msg} />)
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <div className="px-5 py-4 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
