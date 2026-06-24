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
      <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-1/3" />
      <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link to={`/projects/${projectId}/wiki`}
          className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition text-sm">&larr;</Link>
        <h1 className="text-xl font-bold text-gray-800">{docId ? 'Edit Page' : 'New Page'}</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-50">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title..." required
              className="w-full text-2xl font-bold outline-none placeholder-gray-300 text-gray-800" />
          </div>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-2 justify-end">
          <Link to={`/projects/${projectId}/wiki`}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !title.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
