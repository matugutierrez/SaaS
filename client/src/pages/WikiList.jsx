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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Wiki</h1>
        {canEdit && (
          <Link to={`/projects/${projectId}/wiki/new`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
            + New Page
          </Link>
        )}
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No wiki pages yet</p>
          {canEdit && (
            <Link to={`/projects/${projectId}/wiki/new`}
              className="text-primary-600 hover:underline text-sm">Create the first page</Link>
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
