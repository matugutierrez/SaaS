import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import TaskDetail from './pages/TaskDetail';
import Chat from './pages/Chat';
import WikiList from './pages/WikiList';
import WikiPage from './pages/WikiPage';
import WikiEditor from './pages/WikiEditor';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Templates from './pages/Templates';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-page"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="projects/:projectId/board" element={<Board />} />
        <Route path="tasks/:taskId" element={<TaskDetail />} />
        <Route path="projects/:projectId/chat" element={<Chat />} />
        <Route path="projects/:projectId/wiki" element={<WikiList />} />
        <Route path="projects/:projectId/wiki/new" element={<WikiEditor />} />
        <Route path="projects/:projectId/wiki/:docId" element={<WikiPage />} />
        <Route path="projects/:projectId/wiki/:docId/edit" element={<WikiEditor />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="reports" element={<Reports />} />
        <Route path="templates" element={<Templates />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
