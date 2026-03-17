import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto max-w-[1800px] px-4">
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <div className="h-7 w-7 rounded-md bg-[#161b22] border border-[#30363d] grid place-items-center">
                  <span className="text-[11px] font-semibold text-[#ffa116]">LLD</span>
                </div>
                <span className="font-semibold tracking-tight">LLD LeetCode</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm">
                <Link
                  to="/"
                  className={cn(
                    'px-3 py-1.5 rounded-md hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]',
                    location.pathname === '/' && 'bg-[#161b22] text-[#c9d1d9]'
                  )}
                >
                  Problems
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#161b22] border border-[#30363d] grid place-items-center text-xs text-[#8b949e]">
                  {(user?.email?.[0] ?? 'U').toUpperCase()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate('/auth', { replace: true });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

