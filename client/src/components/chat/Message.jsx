import { useAuth } from '../../context/AuthContext';

export default function Message({ message }) {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user?._id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-2.5 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm mt-1">
            {message.sender?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          {!isOwn && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1 font-medium">{message.sender?.name}</p>
          )}
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm'
          }`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className={`text-[10px] text-gray-400 dark:text-gray-500 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
