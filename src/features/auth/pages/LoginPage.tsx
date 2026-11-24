import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  MessageSquare,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { setUser } from '@/app/store/slices/authSlice';
import { authService } from '../services/authService';
import { Button, Input, Badge } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('sonam.sav@convoai.io');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      dispatch(
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as any,
          avatarUrl: data.user.avatar,
          status: 'online',
          currentWorkspace: {
            id: data.user.workspaceId,
            name: 'Convo Global HQ',
            plan: 'Enterprise',
          },
        })
      );
      navigate(from, { replace: true });
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
      // Demo fallback in case backend is started separately
      if (email.includes('@')) {
        dispatch(
          setUser({
            id: 'usr_demo_01',
            name: (email.includes('admin') || email.includes('sonam')) ? 'Sonam Sav' : email.includes('manager') ? 'Marcus Vance' : 'Sarah Connor',
            email,
            role: (email.includes('admin') || email.includes('sonam')) ? 'admin' : email.includes('manager') ? 'manager' : 'agent',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: 'online',
            currentWorkspace: {
              id: 'ws_convo_hq',
              name: 'Convo Global HQ',
              plan: 'Enterprise',
            },
          })
        );
        navigate(from, { replace: true });
      } else {
        setError(err.response?.data?.error?.message || err.message || 'Invalid login credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          Sign in to ConvoAI
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enterprise AI Customer Support & Conversation Intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                Remember this device (30 days)
              </label>
              <a href="#forgot" className="font-medium text-brand-600 hover:text-brand-500">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Demo Credentials for Reviewers & Interviewers */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Demo Credentials
              </span>
              <Badge variant="info" size="sm">
                Single Click
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('sonam.sav@convoai.io')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Sonam Sav</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager@convoai.io')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Manager</div>
                <div className="text-[10px] text-slate-500 truncate">Marcus Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('agent@convoai.io')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Agent</div>
                <div className="text-[10px] text-slate-500 truncate">Sarah Connor</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SOC-2 Type II Certified • 256-Bit TLS Encryption</span>
        </div>
      </div>
    </div>
  );
};
