import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function WikiPage() {
  const { projectId, docId } = useParams();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/documents/${docId}`)
      .then((res) => setDoc(res.data.document))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [docId]);

  const loadVersions = async () => {
    if (versions.length > 0) { setShowVersions(!showVersions); return; }
    try {
      const res = await api.get(`/documents/${docId}/versions`);
      setVersions(res.data.versions);
      setShowVersions(true);
    } catch (err) {
      console.error(err);
    }
  };

  const canEdit = user?.role !== 'member';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  if (!doc) return <p className="text-center text-gray-400 py-12">Document not found</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/wiki`} className="text-gray-400 hover:text-gray-600 text-sm">&larr; Wiki</Link>
          <h1 className="text-2xl font-bold text-gray-800">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadVersions} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
            v{doc.version}
          </button>
          {canEdit && (
            <Link to={`/projects/${projectId}/wiki/${docId}/edit`}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
              Edit
            </Link>
          )}
        </div>
      </div>

      {showVersions && (
        <div className="bg-white rounded-xl border mb-4">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Version History</h3>
          </div>
          <div className="divide-y max-h-60 overflow-y-auto">
            {versions.map((v) => (
              <div key={v._id} className="px-4 py-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">v{v.version}</span>
                <span className="text-gray-700">{v.updatedBy?.name}</span>
                <span className="text-gray-400 text-xs">{new Date(v.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
      </div>

      <div className="text-xs text-gray-400 mt-4 flex gap-4">
        <span>Created by {doc.createdBy?.name}</span>
        <span>Updated by {doc.updatedBy?.name}</span>
        <span>v{doc.version}</span>
      </div>
    </div>
  );
}
