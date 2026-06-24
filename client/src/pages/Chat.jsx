import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ChatRoom from '../components/chat/ChatRoom';

export default function Chat() {
  const { projectId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    api.get('/chat/rooms').then((res) => {
      const filtered = res.data.rooms.filter((r) => r.project?._id === projectId);
      setRooms(filtered);
      if (filtered.length > 0 && !activeRoom) {
        setActiveRoom(filtered[0]);
      }
    }).catch(() => {});
  }, [projectId]);

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="w-60 bg-white border-r flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Channels</h3>
        </div>
        <div className="p-2">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => setActiveRoom(room)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                activeRoom?._id === room._id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              # {room.name}
            </button>
          ))}
          {rooms.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">No channels</p>}
        </div>
      </div>
      <ChatRoom roomId={activeRoom?._id} roomName={activeRoom?.name} />
    </div>
  );
}
