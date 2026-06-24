import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TiptapEditor from '../components/wiki/TiptapEditor';

export default function WikiEditor() {
  const { projectId, docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(docId ? true : false);

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

  if (fetching) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/projects/${projectId}/wiki`} className="text-gray-400 hover:text-gray-600 text-sm">&larr; Wiki</Link>
        <h1 className="text-xl font-bold text-gray-800">{docId ? 'Edit Page' : 'New Page'}</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-xl border mb-4">
          <div className="p-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title..."
              required
              className="w-full text-2xl font-bold outline-none placeholder-gray-300"
            />
          </div>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-2 justify-end">
          <Link to={`/projects/${projectId}/wiki`}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !title.trim()}
            className="px-6 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
