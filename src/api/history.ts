import pb from '@/lib/pocketbase';

const getCommissionHistory = async (from: Date, to: Date) => {
  const results = (
    await pb.collection('sales').getFullList({
      filter: `date >= '${_formatDateToISO(from)}' && date <= '${_formatDateToISO(to)}'`,
      sort: '+date',
      fields:
        'id,date,units,expand.commissions_via_sale_id.commission,expand.commissions_via_sale_id.employee_id,expand.commissions_via_sale_id.expand.employee_id.name',
      expand: 'commissions_via_sale_id.employee_id',
    })
  ).map((record) => {
    const commissions = record.expand!.commissions_via_sale_id as {
      employee_id: string;
      commission: number;
      expand: { employee_id: { name: string } };
    }[];

    return {
      id: record.id as string,
      date: new Date(record.date),
      units: record.units as number,
      commissions: commissions.map(({ employee_id, commission, expand }) => ({
        id: employee_id,
        name: expand.employee_id.name,
        commission,
      })),
    };
  });

  return results;
};

const _formatDateToISO = (date: Date) => {
  return date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD' format
};

export default {
  getCommissionHistory,
};
