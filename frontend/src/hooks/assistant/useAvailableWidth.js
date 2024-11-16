import { useContext, useMemo } from 'react';
import { DrawerContext } from '../../contexts/DrawerContext';
import { DRAWER_WIDTH } from '../../utils/breakpoints';

const useAvailableWidth = () => {
  const { open } = useContext(DrawerContext);

  const availableWidth = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth - (open ? DRAWER_WIDTH : 0);
    }
    return window.innerWidth;
  }, [open]);

  return availableWidth;
};

export default useAvailableWidth;
