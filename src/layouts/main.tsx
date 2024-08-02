import type { FC, ReactNode } from 'react';
import { withAuthGuard } from '@/hocs/with-auth-guard';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = withAuthGuard((props) => {
  const { children } = props;

  return (
    <div className='relative flex min-h-screen flex-col bg-background'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      <SiteFooter />
    </div>
  );
});
