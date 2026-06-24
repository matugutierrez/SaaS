export default function DocumentCard({ doc }) {
  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <a href={`/projects/${doc.project}/wiki/${doc._id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
      <h3 className="font-semibold text-gray-800 mb-1 truncate">{doc.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{stripHtml(doc.content).slice(0, 120)}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>v{doc.version}</span>
        <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
    </a>
  );
}
