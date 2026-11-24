import { ComponentType } from 'react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children?: Omit<NavItem, 'children'>[];
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}
