/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';

import { GuestGuard } from '@/guards/guest-guard';
import { Layout as MainLayout } from '@/layouts/main';
import { Layout as AuthLayout } from '@/layouts/auth';

const MainPage = lazy(() => import('@/pages/main'));
const HistoryPage = lazy(() => import('@/pages/history/index'));
const EditHistoryPage = lazy(() => import('@/pages/history/edit-history'));
const LoginPage = lazy(() => import('@/pages/auth/login'));

const EmployeeListPage = lazy(() => import('@/pages/employee-list/index'));
const ProductListPage = lazy(() => import('@/pages/product-list/index'));
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
      {
        path: 'history',
        children: [
          {
            index: true,
            element: <HistoryPage />,
          },
          {
            path: ':id',
            element: <EditHistoryPage />,
          },
        ],
      },
      { path: 'employee-list', element: <EmployeeListPage /> },
      { path: 'product-list', element: <ProductListPage /> },
      { path: 'commission-rates', element: <CommissionRatesPage /> },
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
];
