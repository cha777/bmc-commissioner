import { useContext } from 'react';
import { CommissionEditContext } from '@/contexts/commission-edit-context';

export const useCommissionEdit = () => {
  const context = useContext(CommissionEditContext);

  if (context === undefined) throw new Error('useCommissionEdit must be used within a CommissionEditProvider');

  return context;
};
