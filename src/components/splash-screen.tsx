import type { FC } from 'react';

export const SplashScreen: FC = () => {
  return (
    <div className='bg-background h-screen w-screen flex self-center items-center justify-center px-2 gap-2'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='animate-spin text-primary'
      >
        <path d='M21 12a9 9 0 1 1-6.219-8.56' />
      </svg>
      <span>Loading ...</span>
    </div>
  );
};
