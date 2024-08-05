import { useCallback, useMemo, useState } from 'react';

interface DialogDrawerController<T> {
  data?: T;
  handleClose: () => void;
  handleOpen: (data?: T) => void;
  open: boolean;
}

export function useDialogDrawer<T = unknown>(): DialogDrawerController<T> {
  const [state, setState] = useState<{ open: boolean; data?: T }>({
    open: false,
    data: undefined,
  });

  const handleOpen = useCallback((data?: T): void => {
    setState({
      open: true,
      data,
    });
  }, []);

  const handleClose = useCallback((): void => {
    setState({
      open: false,
    });
  }, []);

  return useMemo(
    () => ({
      data: state.data,
      handleClose,
      handleOpen,
      open: state.open,
    }),
    [state.data, state.open, handleClose, handleOpen]
  );
}
