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
  const [forwardTarget, setForwardTarget] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [forwarding, setForwarding] = useState(false);
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

  const openForward = async (msg) => {
    setForwardTarget(msg);
    try {
      const res = await api.get('/chat/rooms');
      setAvailableRooms(res.data.rooms);
    } catch {}
  };

  const doForward = async (targetRoom) => {
    if (!forwardTarget) return;
    setForwarding(true);
    try {
      await api.post('/chat/forward', { messageId: forwardTarget._id, targetRoomId: targetRoom._id });
      setForwardTarget(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error forwarding message');
    } finally {
      setForwarding(false);
    }
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-page">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1a1f29] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <p className="text-text-secondary text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-panel">
      <div className="px-5 py-3.5 border-b border-border-light bg-panel flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-accent-sage" />
        <h3 className="font-serif text-text">#{roomName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-page">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-36'} bg-[#1a1f29] animate-pulse`} />
            </div>)}
          </div>
        ) : (
          <>
            {page < totalPages && (
              <button onClick={loadMore}
                className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans w-full text-center py-3 mb-4 hover:bg-[#1a1f29]">
                Load older messages
              </button>
            )}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-[#1a1f29] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-text-secondary text-sm">No messages yet</p>
                <p className="text-text-secondary text-xs mt-1">Be the first to say something</p>
              </div>
            ) : (
              messages.map((msg) => <Message key={msg._id} message={msg} onReply={() => {}} onForward={openForward} />)
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <div className="px-5 py-4 border-t border-border-light bg-panel">
        <MessageInput onSend={handleSend} />
      </div>

      {forwardTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setForwardTarget(null)}>
          <div className="bg-panel border border-border w-full max-w-sm mx-4 p-5 animate-[slideUp_0.15s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-text mb-1">Forward message</h3>
            <p className="text-xs text-text-secondary mb-4">Select a channel to forward this message to</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {availableRooms.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-4">No channels available</p>
              ) : availableRooms.map((room) => (
                <button key={room._id} onClick={() => doForward(room)} disabled={forwarding}
                  className="w-full text-left px-4 py-3 text-xs tracking-[0.1em] text-text-secondary hover:bg-[#1a1f29] hover:text-text disabled:opacity-50 flex items-center gap-3">
                  <span className="w-2 h-2 rotate-45 bg-accent-blue flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text">{room.name}</p>
                    <p className="text-xs text-text-secondary">{room.project?.name}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setForwardTarget(null)}
              className="mt-3 w-full text-center text-xs tracking-[0.15em] uppercase font-sans text-text-secondary hover:text-text py-2 hover:bg-[#1a1f29]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
