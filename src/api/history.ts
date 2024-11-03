import pb from '@/lib/pocketbase';
import { CommissionHistoryTransformer } from './transformers/commission-history-transformer';
import { CommissionHistoryDetailTransformer } from './transformers/commission-history-detail-transformer';
import type { CommissionHistory, CommissionHistoryDetail } from '@/types/commission';

const getCommissionRecordDates = async (): Promise<string[]> => {
  const results = (
    await pb.collection('sales').getFullList({
      sort: '+date',
      fields: 'date',
    })
  ).map((_record) => _record.date);

  return results;
};

const getCommissionHistory = async (period: { from: Date; to: Date }): Promise<CommissionHistory[]> => {
  const fields = [
    'id',
    'date',
    'units',
    'expand.commissions_via_sale_id.commission',
    'expand.commissions_via_sale_id.employee_id',
    'expand.commissions_via_sale_id.expand.employee_id.name',
  ];

  const results = (
    await pb.collection('sales').getFullList({
      filter: `date >= '${_formatDateToISO(period.from)}' && date <= '${_formatDateToISO(period.to)}'`,
      sort: '+date',
      fields: fields.join(','),
      expand: 'commissions_via_sale_id.employee_id',
    })
  ).map(CommissionHistoryTransformer.transform);

  return results;
};

const getCommissionRecordById = async (id: CommissionHistory['id']): Promise<CommissionHistoryDetail> => {
  const fields = [
    'id',
    'date',
    'units',
    'employees',
    'products',
    'rates',
    'is_negative_allowed',
    'expand.commissions_via_sale_id.id',
    'expand.commissions_via_sale_id.commission',
    'expand.commissions_via_sale_id.employee_id',
    'expand.commissions_via_sale_id.expand.employee_id.weight',
  ];

  const result = CommissionHistoryDetailTransformer.transform(
    await pb.collection('sales').getOne(id, {
      fields: fields.join(','),
      expand: 'commissions_via_sale_id.employee_id',
    })
  );

  return result;
};

const _formatDateToISO = (date: Date) => {
  return date.toISOString().replace('T', ' '); // Convert to 'YYYY-MM-DD' format
};

export default {
  getCommissionRecordDates,
  getCommissionHistory,
  getCommissionRecordById,
};
