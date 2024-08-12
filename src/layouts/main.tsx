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
      <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>{children}</main>
      <SiteFooter />
    </div>
  );
});
