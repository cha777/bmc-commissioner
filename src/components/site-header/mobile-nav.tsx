import { useState } from 'react';
import { Menu, History } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui//scroll-area';

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
          <div className='flex flex-col space-y-3'>
            <a className='flex items-center gap-2 justify-start'>
              <History />
              <span>History</span>
            </a>
          </div>
          {/* <div className='flex flex-col space-y-2'>
            {docsConfig.sidebarNav.map((item, index) => (
              <div
                key={index}
                className='flex flex-col space-y-3 pt-6'
              >
                <h4 className='font-medium'>{item.title}</h4>
                {item?.items?.length &&
                  item.items.map((item) => (
                    <React.Fragment key={item.href}>
                      {!item.disabled &&
                        (item.href ? (
                          <MobileLink
                            href={item.href}
                            onOpenChange={setOpen}
                            className='text-muted-foreground'
                          >
                            {item.title}
                            {item.label && (
                              <span className='ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline'>
                                {item.label}
                              </span>
                            )}
                          </MobileLink>
                        ) : (
                          item.title
                        ))}
                    </React.Fragment>
                  ))}
              </div>
            ))}
          </div> */}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
