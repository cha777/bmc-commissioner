/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';
import { GuestGuard } from '@/guards/guest-guard';
import { Layout as MainLayout } from '@/layouts/main';
import { Layout as AuthLayout } from '@/layouts/auth';

const MainPage = lazy(() => import('@/pages/main'));
const LoginPage = lazy(() => import('@/pages/auth/login'));

const EmployeeListPage = lazy(() => import('@/pages/employee-list/index'));
const MetalTypesPage = lazy(() => import('@/pages/metal-types/index'));
const CommissionRatesPage = lazy(() => import('@/pages/commission-bands/index'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <MainPage />,
      },
    ],
  },
  {
    path: 'auth',
    element: (
      <GuestGuard>
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      </GuestGuard>
    ),
    children: [{ path: 'login', element: <LoginPage /> }],
  },
  {
    path: 'employee-list',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <EmployeeListPage />,
      },
    ],
  },
  {
    path: 'metal-types',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <MetalTypesPage />,
      },
    ],
  },
  {
    path: 'commission-rates',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <CommissionRatesPage />,
      },
    ],
  },
];
