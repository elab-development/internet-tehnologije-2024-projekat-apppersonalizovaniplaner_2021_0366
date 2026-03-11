
import { useEffect, useState } from 'react';
import { getPlanners } from '../lib/plannerApi';
import { getOrders } from '../lib/ordersApi';
import { Link, useNavigate } from 'react-router-dom';

function money(n) {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}
export default function Account() {
  const [planners, setPlanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [p, o] = await Promise.all([getPlanners(), getOrders()]);
        setPlanners(p.data?.data ?? p.data);
        setOrders(o.data?.data ?? o.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <section className='py-10 text-center text-slate-600'>Loading…</section>
    );
  return (
   <section className='space-y-8'>
      <h1 className='text-2xl font-semibold tracking-tight'>My Account</h1>

      <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>My Planners</h2>
          <Link
            to='/planners/new'
            className='text-fuchsia-700 hover:underline text-sm'
          >
            Create new
          </Link>
        </div>
        <div className='mt-3 divide-y divide-slate-100'>
          {planners.length === 0 && (
            <div className='text-slate-500 text-sm py-3'>No planners yet.</div>
          )}
          {planners.map((p) => (
            <div key={p.id} className='py-3 flex items-center justify-between'>
              <div>
                <div className='font-medium'>
                  {p.title || `Planner #${p.id}`}
                </div>
                <div className='text-xs text-slate-500'>
                  Subtotal est.: €{money(p?.computed_totals?.subtotal)}
                </div>
              </div>
              <button
                onClick={() => navigate(`/orders/new?plannerId=${p.id}`)}
                className='text-sm text-fuchsia-700 hover:underline'
              >
                Order this
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
        <h2 className='text-lg font-semibold'>My Orders</h2>
        <div className='mt-3 divide-y divide-slate-100'>
          {orders.length === 0 && (
            <div className='text-slate-500 text-sm py-3'>No orders yet.</div>
          )}
          {orders.map((o) => (
            <div key={o.id} className='py-3 flex items-center justify-between'>
              <div>
                <div className='font-medium'>{o.order_number}</div>
                <div className='text-xs text-slate-500'>
                  {o.status} · €{money(o.total)}
                </div>
              </div>
              <div className='text-xs text-slate-500'>
                {o?.planner?.title || `Planner #${o.planner_id}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
