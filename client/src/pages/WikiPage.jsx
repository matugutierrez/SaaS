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
      <div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse w-1/3" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>
  );
  if (!doc) return <p className="text-center text-text-secondary py-12">Document not found</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/projects/${projectId}/wiki`}
            className="text-text-secondary hover:text-text p-1.5 transition text-sm flex-shrink-0">&larr;</Link>
          <h1 className="font-serif font-normal text-text truncate">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadVersions}
            className="bg-transparent text-text-secondary border border-border text-xs tracking-[0.15em] uppercase font-sans px-3 py-1.5">
            v{doc.version} {showVersions ? '▲' : '▼'}
          </button>
          {canEdit && (
            <Link to={`/projects/${projectId}/wiki/${docId}/edit`}
              className="bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans px-4 py-1.5">
              Edit
            </Link>
          )}
        </div>
      </div>

      {showVersions && (
        <div className="bg-panel border border-border mb-4 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-light">
            <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-text font-medium">Version History</h3>
          </div>
          <div className="divide-y divide-border-light max-h-64 overflow-y-auto">
            {versions.length === 0 && <p className="text-center text-text-secondary text-sm py-6">No previous versions</p>}
            {versions.map((v) => (
              <div key={v._id} className="px-4 md:px-5 py-2.5 md:py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="bg-muted text-text-secondary px-2 py-0.5 font-mono text-xs">v{v.version}</span>
                <span className="text-text font-medium">{v.updatedBy?.name}</span>
                <span className="text-text-secondary text-xs">{new Date(v.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-panel border border-border p-4 md:p-8">
        {doc.content ? (
          <div className="prose prose-sm max-w-none text-text dark:text-gray-300" dangerouslySetInnerHTML={{ __html: doc.content }} />
        ) : (
          <p className="text-text-secondary text-center py-8">This page is empty</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 text-text-secondary text-xs">
        <span>Created by <span className="font-medium text-text-secondary">{doc.createdBy?.name}</span></span>
        <span>·</span>
        <span>Last edited by <span className="font-medium text-text-secondary">{doc.updatedBy?.name}</span></span>
        <span>·</span>
        <span>v{doc.version}</span>
      </div>
    </div>
  );
}
