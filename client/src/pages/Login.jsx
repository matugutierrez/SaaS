import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-panel border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-blue flex items-center justify-center mx-auto mb-4">
              <span className="text-page text-2xl font-bold">F</span>
            </div>
            <h1 className="font-serif font-normal text-2xl text-text">Welcome back</h1>
            <p className="text-text-secondary text-xs tracking-[0.15em] mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-muted border border-accent-terracotta text-accent-terracotta text-xs px-4 py-2.5">{error}</div>}
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition" />
            </div>
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-text-secondary text-xs mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-blue text-xs">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
