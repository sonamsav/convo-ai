import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  History,
  KeyRound,
  Trash2,
  Users,
} from 'lucide-react';
import { SecuritySettings, ActiveSession } from '../types/settings';
import { settingsService } from '../services/settingsService';
import { Button, Input, Badge } from '@/components/ui';

interface SecuritySettingsTabProps {
  security: SecuritySettings;
  onRefresh?: () => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  security,
  onRefresh,
}) => {
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>(security.activeSessions || []);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(security.mfaEnforced ?? true);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await settingsService.updatePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.error?.message || err.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      setRevokingId(id);
      const updated = await settingsService.revokeSession(id);
      setSessions(updated);
    } catch (err) {
      console.error('Failed to revoke session:', err);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Password Management */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Account Authentication & Password
            </h3>
            <p className="text-xs text-slate-500">
              Update your administrative account password to maintain security standards.
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="space-y-1.5">
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              helperText="Minimum 8 characters with a mix of letters, numbers, and symbols."
              required
            />
            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Password strength:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={passwordLoading}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication (2FA) */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-slate-500">
                Enforce one-time TOTP security codes for all agent logins.
              </p>
            </div>
          </div>
          <Badge variant={twoFactorEnabled ? 'success' : 'neutral'}>
            {twoFactorEnabled ? 'Enforced & Active' : 'Optional'}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Authenticator App (Google Authenticator, 1Password, Authy)
              </p>
              <p className="text-[11px] text-slate-500">
                Generate 6-digit verification codes every 30 seconds for signing in.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Browser & Device Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Manage signed-in web sessions and revoke untrusted devices.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {sessions.length} active session{sessions.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {sess.browser} on {sess.device}
                    </span>
                    {sess.current && (
                      <Badge variant="success" size="sm">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>IP: {sess.ipAddress}</span>
                    <span>•</span>
                    <span>{sess.location}</span>
                    <span>•</span>
                    <span>Active: {sess.lastActive}</span>
                  </p>
                </div>
              </div>

              {!sess.current && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={revokingId === sess.id}
                  onClick={() => handleRevokeSession(sess.id)}
                  leftIcon={<Trash2 className="w-3 h-3 text-rose-500" />}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login Audit Trail */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Authentication Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Recorded authentication events, IP addresses, and authorization timestamps.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Geo Location</th>
                <th className="py-2.5 px-3">Security Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {security.loginHistory?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-500 font-sans">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">{log.ip}</td>
                  <td className="py-2 px-3 font-sans">{log.location}</td>
                  <td className="py-2 px-3 font-sans">
                    <Badge
                      variant={
                        log.status.toLowerCase().includes('success')
                          ? 'success'
                          : log.status.toLowerCase().includes('fail')
                          ? 'danger'
                          : 'info'
                      }
                      size="sm"
                    >
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Overview */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Role-Based Access Control (RBAC) Permissions
            </h3>
            <p className="text-xs text-slate-500">
              Enterprise role boundaries and privilege matrices across modules.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Module Privilege</th>
                <th className="py-2.5 px-3 text-center">Administrator</th>
                <th className="py-2.5 px-3 text-center">Support Manager</th>
                <th className="py-2.5 px-3 text-center">Support Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  Global Workspace & SLA Targets
                </td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-slate-400">Read Only</td>
                <td className="py-2 px-3 text-center text-slate-400">None</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  OpenAI Configuration & Model Rules
                </td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-emerald-600">Configure Tones</td>
                <td className="py-2 px-3 text-center text-slate-400">Use Assistant</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  Automation Workflow Orchestration
                </td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-emerald-600">Create / Edit</td>
                <td className="py-2 px-3 text-center text-slate-400">View Triggers</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  Customer CRM & Agent Management
                </td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-emerald-600">Assign & Reassign</td>
                <td className="py-2 px-3 text-center text-slate-500">View Customers</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  Smart Inbox & Conversation Resolution
                </td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-emerald-600">Full Access</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-medium">Assigned Tickets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
