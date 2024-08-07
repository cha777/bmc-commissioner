import { useContext } from 'react';
import { CommissionHistoryContext } from '@/contexts/commission-history-context';

export const useCommissionHistory = () => {
  const context = useContext(CommissionHistoryContext);

  if (context === undefined) throw new Error('useCommissionHistory must be used within a CommissionHistoryProvider');

  return context;
};
