import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { storage } from '@/utils/storage';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const token = storage.get<string | null>('convoai_auth_token', null);

  // If unauthenticated, redirect to login
  if (!isAuthenticated && !token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles required, check user role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
