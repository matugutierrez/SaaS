export default function DocumentCard({ doc }) {
  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const preview = stripHtml(doc.content).slice(0, 120);

  return (
    <a href={`/projects/${doc.project}/wiki/${doc._id}`}
      className="block bg-panel border border-border p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 bg-[#1a1f29] text-text-secondary flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </div>
        <h3 className="font-serif text-text font-normal flex-1 truncate">{doc.title}</h3>
      </div>
      <p className="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-2">
        {preview || <span className="italic text-text-secondary">Empty page</span>}
      </p>
      <div className="flex items-center justify-between text-text-secondary text-xs pt-3 border-t border-border-light">
        <span className="bg-[#1a1f29] text-text-secondary px-2 py-0.5">v{doc.version}</span>
        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
    </a>
  );
}
