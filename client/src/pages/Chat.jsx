import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-sm text-gray-800">Channels</h3>
          <p className="text-xs text-gray-400 mt-0.5">{rooms.length} channels</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)
          ) : rooms.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No channels available</p>
          ) : rooms.map((room) => (
            <button key={room._id} onClick={() => setActiveRoom(room)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center gap-2.5 ${
                activeRoom?._id === room._id
                  ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 text-primary-700 font-medium shadow-sm border border-primary-100'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              <span className={`w-2 h-2 rounded-full ${activeRoom?._id === room._id ? 'bg-primary-500' : 'bg-gray-300'}`} />
              # {room.name}
            </button>
          ))}
        </div>
      </div>
      <ChatRoomComponent roomId={activeRoom?._id} roomName={activeRoom?.name} />
    </div>
  );
}
