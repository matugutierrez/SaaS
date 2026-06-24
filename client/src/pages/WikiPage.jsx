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
    } catch (err) {}
  };

  const canEdit = user?.role !== 'member';

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse w-1/3" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
    </div>
  );
  if (!doc) return <p className="text-center text-gray-400 py-12">Document not found</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/wiki`}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-sm">&larr;</Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadVersions}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium">
            v{doc.version} {showVersions ? '▲' : '▼'}
          </button>
          {canEdit && (
            <Link to={`/projects/${projectId}/wiki/${docId}/edit`}
              className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all">
              Edit
            </Link>
          )}
        </div>
      </div>

      {showVersions && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-4 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-800">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Version History</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-64 overflow-y-auto">
            {versions.length === 0 && <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">No previous versions</p>}
            {versions.map((v) => (
              <div key={v._id} className="px-5 py-3 flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <span className="font-mono text-gray-500 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">v{v.version}</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{v.updatedBy?.name}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">{new Date(v.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
        {doc.content ? (
          <div className="prose prose-sm max-w-none dark:text-gray-300" dangerouslySetInnerHTML={{ __html: doc.content }} />
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">This page is empty</p>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
        <span>Created by <span className="font-medium text-gray-500 dark:text-gray-400">{doc.createdBy?.name}</span></span>
        <span>·</span>
        <span>Last edited by <span className="font-medium text-gray-500 dark:text-gray-400">{doc.updatedBy?.name}</span></span>
        <span>·</span>
        <span>v{doc.version}</span>
      </div>
    </div>
  );
}
