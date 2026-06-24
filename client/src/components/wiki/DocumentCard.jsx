export default function DocumentCard({ doc }) {
  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const preview = stripHtml(doc.content).slice(0, 120);

  return (
    <a href={`/projects/${doc.project}/wiki/${doc._id}`}
      className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:shadow-md transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition flex-1 truncate">{doc.title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
        {preview || <span className="italic text-gray-300 dark:text-gray-600">Empty page</span>}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-50 dark:border-gray-800">
        <span className="font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">v{doc.version}</span>
        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
    </a>
  );
}
