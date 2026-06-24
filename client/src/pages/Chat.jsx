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
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Channels</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{rooms.length} channels</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)
          ) : rooms.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-8">No channels available</p>
          ) : rooms.map((room) => (
            <button key={room._id} onClick={() => setActiveRoom(room)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center gap-2.5 ${
                activeRoom?._id === room._id
                  ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 dark:from-primary-900/30 dark:to-primary-900/20 text-primary-700 dark:text-primary-400 font-medium shadow-sm border border-primary-100 dark:border-primary-900/50'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <span className={`w-2 h-2 rounded-full ${activeRoom?._id === room._id ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              # {room.name}
            </button>
          ))}
        </div>
      </div>
      <ChatRoomComponent roomId={activeRoom?._id} roomName={activeRoom?.name} />
    </div>
  );
}
