import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = { name: form.name, email: form.email, password: form.password };
      if (form.inviteCode) data.inviteCode = form.inviteCode.toUpperCase();
      await register(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
            <h1 className="font-serif font-normal text-2xl text-text">Create account</h1>
            <p className="text-text-secondary text-xs tracking-[0.15em] mt-1">First user = Owner · With invite code = Member</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-muted border border-accent-terracotta text-accent-terracotta text-xs px-4 py-2.5">{error}</div>}
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition" />
            </div>
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@company.com"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition" />
            </div>
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition" />
            </div>
            <div>
              <label className="block text-text-secondary text-xs tracking-[0.22em] uppercase mb-1.5">
                Invite Code <span className="text-text-secondary font-normal">(optional — empty = create org)</span>
              </label>
              <input name="inviteCode" value={form.inviteCode} onChange={handleChange} placeholder="e.g. ABC-1234"
                className="w-full px-4 py-3 bg-transparent border border-border text-text text-xs placeholder-text-secondary focus:border-text outline-none transition uppercase" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-text text-page border border-border text-xs tracking-[0.15em] uppercase font-sans disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-text-secondary text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-blue text-xs">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
