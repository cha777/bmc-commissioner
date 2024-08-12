import { paths } from '@/paths';

export const navConfig = [
  {
    title: 'Billing',
    items: [
      { title: 'Commission', href: paths.index },
      { title: 'History', href: paths.history.index },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { title: 'Employee list', href: paths.employeeList },
      { title: 'Product List', href: paths.productList },
      { title: 'Commission Rates', href: paths.commissionRates },
    ],
  },
];
