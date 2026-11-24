import React, { Suspense, lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { LoadingState, Button, EmptyState } from '@/components/ui';
import { Compass } from 'lucide-react';

// Route-based lazy code splitting for performance optimization
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const InboxPage = lazy(() =>
  import('@/features/inbox/pages/InboxPage').then((m) => ({ default: m.InboxPage }))
);
const CustomersPage = lazy(() =>
  import('@/features/customers/pages/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const CustomerProfilePage = lazy(() =>
  import('@/features/customers/pages/CustomerProfilePage').then((m) => ({
    default: m.CustomerProfilePage,
  }))
);
const AiIntelligencePage = lazy(() =>
  import('@/features/ai-intelligence/pages/AiIntelligencePage').then((m) => ({
    default: m.AiIntelligencePage,
  }))
);
const AgentsPage = lazy(() =>
  import('@/features/agents/pages/AgentsPage').then((m) => ({ default: m.AgentsPage }))
);
const AgentProfilePage = lazy(() =>
  import('@/features/agents/pages/AgentProfilePage').then((m) => ({ default: m.AgentProfilePage }))
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const AutomationPage = lazy(() =>
  import('@/features/automation/pages/AutomationPage').then((m) => ({ default: m.AutomationPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const SecurityPage = lazy(() =>
  import('@/features/security/pages/SecurityPage').then((m) => ({ default: m.SecurityPage }))
);

const PageLoader: React.FC = () => (
  <div className="py-24 flex items-center justify-center">
    <LoadingState message="Loading module..." />
  </div>
);

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const NotFoundPage: React.FC = () => (
  <div className="py-16">
    <EmptyState
      icon={<Compass className="w-8 h-8 text-brand-600" />}
      title="404 — Page Not Found"
      description="The route you requested does not exist or may have been relocated."
      action={
        <Button variant="primary" size="sm" onClick={() => (window.location.href = '/dashboard')}>
          Return to Dashboard
        </Button>
      }
    />
  </div>
);

export const appRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'inbox',
        element: (
          <SuspenseWrapper>
            <InboxPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'customers',
        element: (
          <SuspenseWrapper>
            <CustomersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <SuspenseWrapper>
            <CustomerProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'ai-intelligence',
        element: (
          <SuspenseWrapper>
            <AiIntelligencePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'agents',
        element: (
          <SuspenseWrapper>
            <AgentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'agents/:id',
        element: (
          <SuspenseWrapper>
            <AgentProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'analytics',
        element: (
          <SuspenseWrapper>
            <AnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'automation',
        element: (
          <SuspenseWrapper>
            <AutomationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'security',
        element: (
          <SuspenseWrapper>
            <SecurityPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
