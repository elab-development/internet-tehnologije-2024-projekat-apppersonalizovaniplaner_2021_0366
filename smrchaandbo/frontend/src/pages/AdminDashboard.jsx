import { useState } from 'react';
import AdminTabs from '../components/admin/AdminTabs';
import CatalogManager from '../components/admin/catalog/CatalogManager';
import AdminOverview from '../components/admin/overview/AdminOverview';
import AdminPlanners from '../components/admin/planners/AdminPlanners';
import AdminUsers from '../components/admin/users/AdminUsers';
import AdminOrders from '../components/admin/orders/AdminOrders';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'planners', label: 'Planners' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'orders', label: 'Orders' },
];

export default function AdminDashboard() {

   const [active, setActive] = useState('overview');

  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        <span className='text-fuchsia-700'>Admin Dashboard</span>
      </h1>
      <AdminTabs tabs={TABS} active={active} onChange={setActive} />
      <div>
        {active === 'overview' && <AdminOverview />}
        {active === 'catalog' && <CatalogManager />}
        {active === 'planners' && <AdminPlanners />}
        {active === 'orders' && <AdminOrders />}
       
      </div>
    </section>
  );
}
