import { useEffect, useMemo, useState } from 'react';
import { getAdminStats } from '../../../lib/adminApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

function money(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
}

const STATUS_COLORS = {
  pending: '#64748B',
  paid: '#10B981',
  in_production: '#F59E0B',
  shipped: '#3B82F6',
  delivered: '#059669',
  canceled: '#EF4444',
  refunded: '#8B5CF6',
};

export default function AdminOverview() {
  const [range, setRange] = useState('30d'); // 30d | 90d | 12m
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const resp = await getAdminStats({ range });
      setData(resp.data);
    } catch (e) {
      console.error(e?.response?.data || e);
      setErr(e?.response?.data?.message || 'Failed to load stats.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [range]);

  const statusPie = useMemo(() => {
    if (!data?.orders_by_status) return [];
    return Object.entries(data.orders_by_status).map(([status, cnt]) => ({
      name: status,
      value: Number(cnt || 0),
      fill: STATUS_COLORS[status] || '#94A3B8',
    }));
  }, [data]);

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-slate-900'>Overview</h3>
        <div className='flex items-center gap-2'>
          <label className='text-sm text-slate-600'>
            Range:{' '}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className='ml-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm'
            >
              <option value='30d'>Last 30 days</option>
              <option value='90d'>Last 90 days</option>
              <option value='12m'>Last 12 months</option>
            </select>
          </label>
          <button
            onClick={load}
            className='inline-flex items-center bg-white px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50'
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className='rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700'>
          {err}
        </div>
      )}

      {loading || !data ? (
        <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 px-4 py-10 text-center text-slate-600'>
          Loading…
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Kpi
              title='Revenue (total)'
              value={`€${money(data.totals.revenue_total)}`}
            />
            <Kpi
              title='Revenue (30d)'
              value={`€${money(data.totals.revenue_30d)}`}
            />
            <Kpi title='Avg order value' value={`€${money(data.totals.aov)}`} />
            <Kpi title='Paid orders' value={String(data.totals.paid_orders)} />

            <Kpi title='Users' value={String(data.totals.users)} />
            <Kpi title='Customers' value={String(data.totals.customers)} />
            <Kpi title='Admins' value={String(data.totals.admins)} />
            <Kpi title='Planners' value={String(data.totals.planners)} />
          </div>

          {/* Charts grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Revenue series */}
            <Card title='Revenue trend'>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={data.series.revenue}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' tickFormatter={fmtDate} />
                    <YAxis />
                    <Tooltip
                      formatter={(v) => `€${money(v)}`}
                      labelFormatter={fmtDate}
                    />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#7C3AED'
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Orders count series */}
            <Card title='Orders trend'>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={data.series.orders}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' tickFormatter={fmtDate} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={fmtDate} />
                    <Bar dataKey='orders_count' fill='#A78BFA' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Orders by status */}
            <Card title='Orders by status'>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={statusPie}
                      dataKey='value'
                      nameKey='name'
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {statusPie.map((entry, idx) => (
                        <Cell key={`c-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top templates + recent orders */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card title='Top templates'>
              <ul className='divide-y divide-slate-100'>
                {data.top_templates.length === 0 && (
                  <li className='py-3 text-sm text-slate-500'>No data.</li>
                )}
                {data.top_templates.map((t) => (
                  <li
                    key={t.template_id}
                    className='py-3 text-sm flex items-center justify-between'
                  >
                    <span className='text-slate-800'>{t.name}</span>
                    <span className='text-slate-600'>{t.count}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title='Recent orders'>
              <ul className='divide-y divide-slate-100'>
                {data.recent_orders.length === 0 && (
                  <li className='py-3 text-sm text-slate-500'>No data.</li>
                )}
                {data.recent_orders.map((o) => (
                  <li key={o.id} className='py-3 text-sm'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium text-slate-900'>
                        {o.order_number}{' '}
                        <span className='text-slate-500 font-normal'>
                          —{' '}
                          {o.planner?.title ||
                            `Planner #${o.planner?.id ?? '—'}`}
                        </span>
                      </div>
                      <div className='text-slate-600'>
                        {fmtDate(o.placed_at)}
                      </div>
                    </div>
                    <div className='flex items-center justify-between mt-1'>
                      <div className='text-slate-700'>
                        {o.user?.name || '—'} ({o.user?.email || '—'})
                      </div>
                      <div className='text-slate-900 font-semibold'>
                        €{money(o.total)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}

function Kpi({ title, value }) {
  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-4'>
      <div className='text-sm text-slate-600'>{title}</div>
      <div className='mt-1 text-2xl font-semibold text-slate-900'>{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-4'>
      <div className='text-sm font-semibold text-slate-900 mb-3'>{title}</div>
      {children}
    </div>
  );
}