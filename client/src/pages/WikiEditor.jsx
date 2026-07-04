import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import TiptapEditor from '../components/wiki/TiptapEditor';

export default function WikiEditor() {
  const { projectId, docId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!docId);

  useEffect(() => {
    if (!docId) return;
    api.get(`/documents/${docId}`)
      .then((res) => {
        setTitle(res.data.document.title);
        setContent(res.data.document.content);
      })
      .catch(() => navigate(`/projects/${projectId}/wiki`))
      .finally(() => setFetching(false));
  }, [docId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (docId) {
        await api.put(`/documents/${docId}`, { title, content });
        navigate(`/projects/${projectId}/wiki/${docId}`);
      } else {
        const res = await api.post(`/documents/project/${projectId}`, { title, content });
        navigate(`/projects/${projectId}/wiki/${res.data.document._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving document');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-12 bg-gray-200 dark:bg-gray-800 animate-pulse w-1/3" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link to={`/projects/${projectId}/wiki`}
          className="text-text-secondary hover:text-text p-1.5 transition text-sm">&larr;</Link>
        <h1 className="font-serif font-normal text-text">{docId ? 'Edit Page' : 'New Page'}</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-panel border border-border overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-border-light">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title..." required
              className="w-full bg-transparent text-text font-serif text-2xl outline-none placeholder-gray-300 dark:placeholder-gray-600" />
          </div>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-2 justify-end">
          <Link to={`/projects/${projectId}/wiki`}
            className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-5 py-2.5">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !title.trim()}
            className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-6 py-2.5 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
