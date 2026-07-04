import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ChatRoomComponent from '../components/chat/ChatRoom';

export default function Chat() {
  const { projectId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/rooms').then((res) => {
      const filtered = res.data.rooms.filter((r) => r.project?._id === projectId);
      setRooms(filtered);
      if (filtered.length > 0 && !activeRoom) setActiveRoom(filtered[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="flex h-[calc(100vh-9rem)] -m-6">
      <div className="w-64 bg-panel border-r border-border flex-shrink-0 flex flex-col">
        <div className="px-5 py-4 border-b border-border-light">
          <h3 className="font-serif text-text">Channels</h3>
          <p className="text-text-secondary text-xs mt-0.5">{rooms.length} channels</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-10 bg-muted animate-pulse" />)
          ) : rooms.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-8">No channels available</p>
          ) : rooms.map((room) => (
            <button key={room._id} onClick={() => setActiveRoom(room)}
              className={`w-full text-left px-4 py-2.5 text-xs tracking-[0.1em] flex items-center gap-2.5 ${
                activeRoom?._id === room._id
                  ? 'bg-muted text-text border-l-2 border-accent-blue'
                  : 'text-text-secondary hover:bg-muted hover:text-text'
              }`}>
              <span className={`w-2 h-2 rotate-45 ${activeRoom?._id === room._id ? 'bg-accent-blue' : 'bg-border'}`} />
              # {room.name}
            </button>
          ))}
        </div>
      </div>
      <ChatRoomComponent roomId={activeRoom?._id} roomName={activeRoom?.name} />
    </div>
  );
}
