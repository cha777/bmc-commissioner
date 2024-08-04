import { useContext } from 'react';
import { CommissionContext } from '@/contexts/commission-context';

export const useCommission = () => {
  const context = useContext(CommissionContext);

  if (context === undefined) throw new Error('useCommission must be used within a CommissionProvider');

  return context;
};
