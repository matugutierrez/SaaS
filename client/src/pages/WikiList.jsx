import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DocumentCard from '../components/wiki/DocumentCard';

export default function WikiList() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/documents/project/${projectId}`)
      .then((res) => setDocuments(res.data.documents))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const canEdit = user?.role !== 'member';

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-gray-200 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Wiki</h1>
          <p className="text-sm text-gray-400 mt-0.5">{documents.length} pages</p>
        </div>
        {canEdit && (
          <Link to={`/projects/${projectId}/wiki/new`}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95">
            + New Page
          </Link>
        )}
      </div>
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">No wiki pages yet</p>
          <p className="text-sm text-gray-400 mb-4">Create documentation for your project</p>
          {canEdit && (
            <Link to={`/projects/${projectId}/wiki/new`}
              className="inline-flex px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-200 transition-all">
              Create first page
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => <DocumentCard key={doc._id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}
