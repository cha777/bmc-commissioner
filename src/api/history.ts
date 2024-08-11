import pb from '@/lib/pocketbase';
import { CommissionHistoryTransformer } from './transformers/commission-history-transformer';

const getCommissionHistory = async (from: Date, to: Date) => {
  const results = (
    await pb.collection('sales').getFullList({
      filter: `date >= '${_formatDateToISO(from)}' && date <= '${_formatDateToISO(to)}'`,
      sort: '+date',
      fields:
        'id,date,units,expand.commissions_via_sale_id.commission,expand.commissions_via_sale_id.employee_id,expand.commissions_via_sale_id.expand.employee_id.name',
      expand: 'commissions_via_sale_id.employee_id',
    })
  ).map(CommissionHistoryTransformer.transform);

  return results;
};

const _formatDateToISO = (date: Date) => {
  return date.toISOString().replace('T', ' '); // Convert to 'YYYY-MM-DD' format
};

export default {
  getCommissionHistory,
};
