import {
  LayoutDashboard,
  Inbox,
  Users,
  Sparkles,
  UserCheck,
  BarChart3,
  Zap,
  Settings,
  Shield,
} from 'lucide-react';
import { NavSection } from '@/types/navigation';

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    id: 'workspace',
    title: 'WORKSPACE',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'inbox',
        label: 'Smart Inbox',
        path: '/inbox',
        icon: Inbox,
        badge: 12,
        badgeVariant: 'danger',
      },
      {
        id: 'customers',
        label: 'Customers',
        path: '/customers',
        icon: Users,
      },
      {
        id: 'ai-intelligence',
        label: 'AI Intelligence',
        path: '/ai-intelligence',
        icon: Sparkles,
        badge: 'v2.4',
        badgeVariant: 'info',
      },
      {
        id: 'agents',
        label: 'Team & Agents',
        path: '/agents',
        icon: UserCheck,
      },
      {
        id: 'analytics',
        label: 'Analytics & Reports',
        path: '/analytics',
        icon: BarChart3,
      },
      {
        id: 'automation',
        label: 'Automation Rules',
        path: '/automation',
        icon: Zap,
      },
    ],
  },
  {
    id: 'configuration',
    title: 'CONFIGURATION',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
      },
      {
        id: 'security',
        label: 'Security & Permissions',
        path: '/security',
        icon: Shield,
      },
    ],
  },
];
