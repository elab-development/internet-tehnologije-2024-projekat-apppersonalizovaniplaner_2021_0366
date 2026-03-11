import { useState } from 'react';
import AdminTabs from '../components/admin/AdminTabs';
import CatalogManager from '../components/admin/catalog/CatalogManager';
import AdminPlanners from '../components/admin/planners/AdminPlanners';
import AdminUsers from '../components/admin/users/AdminUsers';

function Placeholder({ title }) {
  return <div className='py-8 text-slate-500'>{title} — coming soon.</div>;
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'planners', label: 'Planners' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'orders', label: 'Orders' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('catalog');
  

  return (
    <><section className='space-y-6'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        <span className='text-fuchsia-700'>Admin Dashboard</span>
      </h1>
      <AdminTabs tabs={TABS} active={active} onChange={setActive} />
      <div>
        {active === 'catalog' && <CatalogManager />}


        {active === 'orders' && <Placeholder title='Orders' />}
        {active === 'reports' && <Placeholder title='Reports' />}
        {active === 'settings' && <Placeholder title='Settings' />}
      </div></>
    </section>
  );
}
