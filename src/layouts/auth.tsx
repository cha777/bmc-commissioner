import type { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = (props) => {
  const { children } = props;

  return <main className='bg-background w-full min-h-screen flex items-center justify-center px-4'>{children}</main>;
};
