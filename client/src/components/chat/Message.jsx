import { useAuth } from '../../context/AuthContext';

export default function Message({ message }) {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user?._id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-500 mb-1 ml-1">{message.sender?.name}</p>
        )}
        <div className={`rounded-2xl px-4 py-2 text-sm ${
          isOwn ? 'bg-primary-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
