import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = (location.state as { from?: string } | undefined)?.from ?? '/';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-md bg-[#161b22] border border-[#30363d] grid place-items-center">
            <span className="text-[12px] font-semibold text-[#ffa116]">LLD</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">LLD LeetCode</span>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-1">
            {mode === 'login' ? 'Sign in' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#8b949e] mb-5">
            {mode === 'login' ? 'Use your email to continue.' : 'Start solving LLD problems in minutes.'}
          </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#8b949e] mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder="At least 8 characters"
            />
          </div>

          {error ? <p className="text-sm text-rose-300 bg-rose-950/40 border border-rose-900/40 rounded-md px-3 py-2">{error}</p> : null}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full h-10"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>

          <div className="mt-4 text-sm text-[#8b949e]">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="font-medium text-[#c9d1d9] hover:text-[#ffa116]"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
