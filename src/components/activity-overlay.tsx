import type { FC, HTMLAttributes, ReactNode } from 'react';
import { RingAnimation } from '@/components/ui/animation-icons/ring';
import { cn } from '@/lib/utils';

interface ActivityOverlayProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ActivityOverlay: FC<ActivityOverlayProps> = (props) => {
  const { children, className } = props;

  return (
    <div
      className={cn(
        'backdrop-blur h-full w-full flex self-center items-center justify-center px-2 flex-col gap-2',
        className
      )}
    >
      <RingAnimation />
      {children}
    </div>
  );
};
