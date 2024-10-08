import type { FC } from 'react';

interface LoadingIndicatorProps {
  message?: string;
}
export const LoadingIndicator: FC<LoadingIndicatorProps> = (props) => {
  const { message = 'Loading ...' } = props;

  return (
    <div className='bg-background flex items-center justify-center px-2 gap-2'>
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
      <span>{message}</span>
    </div>
  );
};
