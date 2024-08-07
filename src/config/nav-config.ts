import { paths } from '@/paths';

export const navConfig = [
  {
    title: 'Billing',
    items: [
      { title: 'Commission', href: paths.index },
      { title: 'History', href: paths.history },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { title: 'Employee list', href: paths.employeeList },
      { title: 'Metal Types', href: paths.metalTypes },
      { title: 'Commission Rates', href: paths.commissionRates },
    ],
  },
];
