import { useState } from 'react';
import { Menu } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui//scroll-area';
import { RouterLink } from '../router-link';
import { navConfig } from '@/config/nav-config';

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          className='mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden'
        >
          <Menu />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side='left'
        className='pr-0'
      >
        <SheetTitle>
          <VisuallyHidden>BMC Commissioner</VisuallyHidden>
        </SheetTitle>
        <ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-10 pl-6'>
          {navConfig.map((item) => (
            <div
              key={item.title}
              className='flex flex-col space-y-3 pt-6'
            >
              <h4 className='font-medium'>{item.title}</h4>
              {item.items.map((item) => (
                <RouterLink
                  key={item.href}
                  href={item.href}
                  className='text-muted-foreground'
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </RouterLink>
              ))}
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
