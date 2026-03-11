import { useEffect, useMemo, useState } from 'react';
import AdminSectionHeader from '../AdminSectionHeader';
import Modal from '../Modal';
import Table from '../Table';
import {
  getOrders,
  getOrder,
  markPaid,
  markRefunded,
  markInProduction,
  markShipped,
  markDelivered,
} from '../../../lib/ordersApi';

function money(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

const STATUS_BADGE = {
  pending: 'bg-slate-100 text-slate-800',
  paid: 'bg-emerald-100 text-emerald-800',
  in_production: 'bg-amber-100 text-amber-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  canceled: 'bg-rose-100 text-rose-800',
  refunded: 'bg-violet-100 text-violet-800',
};
const PAY_BADGE = {
  unpaid: 'bg-slate-100 text-slate-800',
  paid: 'bg-emerald-100 text-emerald-800',
  refunded: 'bg-violet-100 text-violet-800',
};

export default function AdminOrders() {
  // data & ui state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // filters
  const [status, setStatus] = useState(''); // '' = all

  // sort
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc'); // asc|desc

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // detail modal
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState(null);
  const [acting, setActing] = useState(false);

  async function fetchAll() {
    try {
      setErr(null);
      setLoading(true);
      const resp = await getOrders(status ? { status } : {});
      const data = resp.data?.data ?? resp.data ?? [];
      setRows(data);
      setPage(1);
    } catch (e) {
      console.error(e?.response?.data || e);
      setErr(e?.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id) {
    setDetailId(id);
    setDetail(null);
    setDetailErr(null);
    setDetailLoading(true);
    try {
      const resp = await getOrder(id);
      setDetail(resp.data?.data ?? resp.data);
    } catch (e) {
      console.error(e?.response?.data || e);
      setDetailErr(e?.response?.data?.message || 'Failed to load order.');
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailId(null);
    setDetail(null);
    setDetailErr(null);
  }

  useEffect(() => {
    fetchAll();
  }, [status]);

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        getSortValue: (r) => Number(r.id),
      },
      {
        key: 'order_number',
        label: 'Order #',
        sortable: true,
        getSortValue: (r) => (r.order_number || '').toLowerCase(),
      },
      {
        key: 'user',
        label: 'Customer',
        sortable: true,
        getSortValue: (r) => (r.user?.name || '').toLowerCase(),
        render: (r) =>
          r.user ? (
            <div className='leading-tight'>
              <div className='font-medium'>{r.user.name}</div>
              <div className='text-xs text-slate-500'>{r.user.email}</div>
            </div>
          ) : (
            '—'
          ),
      },
      {
        key: 'planner',
        label: 'Planner',
        sortable: true,
        getSortValue: (r) => (r.planner?.title || '').toLowerCase(),
        render: (r) => r.planner?.title || `Planner #${r.planner?.id ?? '—'}`,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        getSortValue: (r) => (r.status || '').toLowerCase(),
        render: (r) => (
          <span
            className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
              STATUS_BADGE[r.status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {r.status}
          </span>
        ),
      },
      {
        key: 'payment_status',
        label: 'Payment',
        sortable: true,
        getSortValue: (r) => (r.payment_status || '').toLowerCase(),
        render: (r) => (
          <span
            className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
              PAY_BADGE[r.payment_status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {r.payment_status}
          </span>
        ),
      },
      {
        key: 'total',
        label: 'Total',
        sortable: true,
        getSortValue: (r) => Number(r.total ?? 0),
        render: (r) => `€${money(r.total)}`,
      },
      {
        key: 'placed_at',
        label: 'Placed at',
        sortable: true,
        getSortValue: (r) => new Date(r.placed_at || 0).getTime(),
        render: (r) => fmtDate(r.placed_at),
      },
    ],
    []
  );

  function toggleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const sortedRows = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.getSortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.getSortValue(a);
      const bv = col.getSortValue(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, columns, sortKey, sortDir]);

  // pagination
  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagedRows = sortedRows.slice(startIdx, startIdx + pageSize);

  const SortHeader = ({ col }) => {
    const isActive = sortKey === col.key;
    return (
      <button
        type='button'
        onClick={() => toggleSort(col)}
        disabled={!col.sortable}
        className={`inline-flex items-center gap-1 ${
          col.sortable ? 'cursor-pointer' : 'cursor-default'
        }`}
        title={col.sortable ? 'Sort' : undefined}
      >
        <span>{col.label}</span>
        {col.sortable && (
          <span
            className={`text-xs ${
              isActive ? 'text-fuchsia-700' : 'text-slate-400'
            }`}
          >
            {isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        )}
      </button>
    );
  };

  async function doAction(kind, id) {
    try {
      setActing(true);
      if (kind === 'paid') await markPaid(id);
      if (kind === 'refunded') await markRefunded(id);
      if (kind === 'prod') await markInProduction(id);
      if (kind === 'shipped') await markShipped(id);
      if (kind === 'delivered') await markDelivered(id);

      await fetchAll();
      if (detailId === id) {
        // refresh detail view too
        const resp = await getOrder(id);
        setDetail(resp.data?.data ?? resp.data);
      }
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.message || 'Action failed.');
    } finally {
      setActing(false);
    }
  }

  function ActionsCell({ r }) {
    const s = r.status;
    const p = r.payment_status;

    return (
      <div className='flex flex-wrap gap-2'>
        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50'
          onClick={() => openDetail(r.id)}
        >
          Details
        </button>

        {/* Admin transitions */}
        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
          onClick={() => doAction('paid', r.id)}
          disabled={
            acting || p === 'paid' || s === 'canceled' || s === 'refunded'
          }
          title='Mark paid'
        >
          Mark paid
        </button>

        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
          onClick={() => doAction('prod', r.id)}
          disabled={
            acting || (s !== 'pending' && s !== 'in_production') || p !== 'paid'
          }
          title='Move to production'
        >
          In production
        </button>

        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
          onClick={() => doAction('shipped', r.id)}
          disabled={acting || (s !== 'in_production' && s !== 'shipped')}
          title='Mark shipped'
        >
          Shipped
        </button>

        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
          onClick={() => doAction('delivered', r.id)}
          disabled={acting || (s !== 'shipped' && s !== 'delivered')}
          title='Mark delivered'
        >
          Delivered
        </button>

        <button
          className='px-2 py-1 text-xs rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
          onClick={() => doAction('refunded', r.id)}
          disabled={acting || p !== 'paid'}
          title='Mark refunded'
        >
          Refunded
        </button>
      </div>
    );
  }

  return (
    <section className='space-y-4'>
      <AdminSectionHeader
        title='Orders'
        actions={
          <div className='flex items-center gap-3'>
            <label className='text-sm text-slate-600'>
              Status:{' '}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='ml-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm'
              >
                <option value=''>All</option>
                <option value='pending'>pending</option>
                <option value='in_production'>in_production</option>
                <option value='shipped'>shipped</option>
                <option value='delivered'>delivered</option>
                <option value='canceled'>canceled</option>
                <option value='refunded'>refunded</option>
              </select>
            </label>

            <label className='text-sm text-slate-600'>
              Rows:{' '}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className='ml-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm'
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={fetchAll}
              className='inline-flex items-center bg-white px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50'
            >
              Refresh
            </button>
          </div>
        }
      />

      {err && (
        <div className='rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 px-4 py-10 text-center text-slate-600'>
          Loading orders…
        </div>
      ) : (
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-slate-50/70'>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className='text-left text-slate-600 font-medium px-4 py-3'
                    >
                      <SortHeader col={c} />
                    </th>
                  ))}
                  <th className='text-left text-slate-600 font-medium px-4 py-3'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((r, idx) => (
                  <tr
                    key={r.id ?? idx}
                    className='hover:bg-slate-50 transition'
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className='px-4 py-3 align-top text-slate-800'
                      >
                        {typeof c.render === 'function'
                          ? c.render(r)
                          : r[c.key]}
                      </td>
                    ))}
                    <td className='px-4 py-3'>
                      <ActionsCell r={r} />
                    </td>
                  </tr>
                ))}
                {pagedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className='px-4 py-10 text-center text-slate-500'
                    >
                      No items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className='flex items-center justify-between p-3'>
            <div className='text-sm text-slate-600'>
              Showing{' '}
              <span className='font-medium text-slate-900'>
                {sortedRows.length === 0 ? 0 : startIdx + 1}–
                {Math.min(sortedRows.length, startIdx + pageSize)}
              </span>{' '}
              of{' '}
              <span className='font-medium text-slate-900'>
                {sortedRows.length}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white disabled:opacity-50'
              >
                Prev
              </button>
              <span className='text-sm text-slate-700'>
                Page{' '}
                <span className='font-medium text-slate-900'>{safePage}</span> /{' '}
                {Math.max(1, Math.ceil(sortedRows.length / pageSize))}
              </span>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      Math.max(1, Math.ceil(sortedRows.length / pageSize)),
                      p + 1
                    )
                  )
                }
                disabled={
                  safePage >=
                  Math.max(1, Math.ceil(sortedRows.length / pageSize))
                }
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!detailId}
        title={`Order details #${detail?.order_number ?? detailId}`}
        onClose={closeDetail}
      >
        {detailLoading ? (
          <div className='py-6 text-slate-600'>Loading…</div>
        ) : detailErr ? (
          <div className='rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700'>
            {detailErr}
          </div>
        ) : detail ? (
          <div className='space-y-6'>
            {/* Top badges + totals */}
            <div className='flex flex-wrap items-center gap-2'>
              <span
                className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                  STATUS_BADGE[detail.status] || 'bg-slate-100 text-slate-800'
                }`}
              >
                {detail.status}
              </span>
              <span
                className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                  PAY_BADGE[detail.payment_status] ||
                  'bg-slate-100 text-slate-800'
                }`}
              >
                {detail.payment_status}
              </span>
              <span className='text-sm text-slate-600 ml-auto'>
                Placed:{' '}
                <span className='font-medium text-slate-900'>
                  {fmtDate(detail.placed_at)}
                </span>
              </span>
            </div>

            <div className='grid sm:grid-cols-2 gap-6'>
              {/* Shipping */}
              <div>
                <h4 className='text-sm font-semibold text-slate-900'>
                  Shipping
                </h4>
                <div className='mt-2 text-sm text-slate-700'>
                  <div>{detail.shipping?.name || '—'}</div>
                  <div>{detail.shipping?.address || '—'}</div>
                  <div>
                    {detail.shipping?.zip || '—'} {detail.shipping?.city || ''}
                  </div>
                  <div>{detail.shipping?.country || '—'}</div>
                </div>
              </div>

              {/* Totals */}
              <div>
                <h4 className='text-sm font-semibold text-slate-900'>Totals</h4>
                <dl className='mt-2 space-y-1 text-sm'>
                  <Row label='Subtotal' value={`€${money(detail.subtotal)}`} />
                  <Row label='Tax' value={`€${money(detail.tax)}`} />
                  <Row
                    label='Shipping'
                    value={`€${money(detail.shipping_fee)}`}
                  />
                  <Row
                    label='Discounts'
                    value={`-€${money(detail.discount_total)}`}
                  />
                  <div className='h-px bg-slate-200 my-1' />
                  <Row bold label='Total' value={`€${money(detail.total)}`} />
                </dl>
              </div>
            </div>

            {/* Planner summary */}
            <div>
              <h4 className='text-sm font-semibold text-slate-900'>Planner</h4>
              {detail.planner ? (
                <div className='mt-2 text-sm text-slate-700 space-y-2'>
                  <div className='font-medium'>
                    {detail.planner.title || `Planner #${detail.planner.id}`}
                  </div>
                  <ul className='list-disc ml-5 space-y-1'>
                    <li>Template: {detail.planner.template?.name ?? '—'}</li>
                    <li>Size: {detail.planner.size?.label ?? '—'}</li>
                    <li>Paper: {detail.planner.paper?.label ?? '—'}</li>
                    <li>Binding: {detail.planner.binding?.label ?? '—'}</li>
                    <li>Color: {detail.planner.color?.name ?? '—'}</li>
                    <li>Cover: {detail.planner.cover?.name ?? '—'}</li>
                  </ul>

                  {/* Components table if present */}
                  {Array.isArray(detail.planner.items) &&
                    detail.planner.items.length > 0 && (
                      <div className='mt-3'>
                        <div className='text-sm font-medium text-slate-900 mb-1'>
                          Components
                        </div>
                        <div className='overflow-x-auto ring-1 ring-slate-100 rounded-lg'>
                          <table className='w-full text-sm'>
                            <thead className='bg-slate-50/70'>
                              <tr>
                                <th className='text-left text-slate-600 font-medium px-3 py-2'>
                                  Title
                                </th>
                                <th className='text-left text-slate-600 font-medium px-3 py-2'>
                                  Qty
                                </th>
                                <th className='text-left text-slate-600 font-medium px-3 py-2'>
                                  Unit €
                                </th>
                                <th className='text-left text-slate-600 font-medium px-3 py-2'>
                                  Line €
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.planner.items.map((it) => (
                                <tr
                                  key={it.id}
                                  className='border-t border-slate-100'
                                >
                                  <td className='px-3 py-2'>
                                    {it.component?.title ??
                                      `#${it.planner_component_id}`}
                                  </td>
                                  <td className='px-3 py-2'>
                                    {it.quantity ?? 1}
                                  </td>
                                  <td className='px-3 py-2'>
                                    €
                                    {money(
                                      it.unit_price_snapshot ??
                                        it.component?.base_price ??
                                        0
                                    )}
                                  </td>
                                  <td className='px-3 py-2'>
                                    €{money(it.line_total_snapshot ?? 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className='mt-2 text-sm text-slate-600'>—</div>
              )}
            </div>

            {/* Quick actions inside modal */}
            <div className='flex flex-wrap gap-2 pt-1'>
              <button
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
                onClick={() => doAction('paid', detail.id)}
                disabled={
                  acting ||
                  detail.payment_status === 'paid' ||
                  detail.status === 'canceled' ||
                  detail.status === 'refunded'
                }
              >
                Mark paid
              </button>
              <button
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
                onClick={() => doAction('prod', detail.id)}
                disabled={
                  acting ||
                  !['pending', 'in_production'].includes(detail.status) ||
                  detail.payment_status !== 'paid'
                }
              >
                In production
              </button>
              <button
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
                onClick={() => doAction('shipped', detail.id)}
                disabled={
                  acting ||
                  !['in_production', 'shipped'].includes(detail.status)
                }
              >
                Shipped
              </button>
              <button
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
                onClick={() => doAction('delivered', detail.id)}
                disabled={
                  acting || !['shipped', 'delivered'].includes(detail.status)
                }
              >
                Delivered
              </button>
              <button
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50'
                onClick={() => doAction('refunded', detail.id)}
                disabled={acting || detail.payment_status !== 'paid'}
              >
                Refunded
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className='flex items-center justify-between'>
      <dt
        className={`text-slate-600 ${
          bold ? 'font-semibold text-slate-800' : ''
        }`}
      >
        {label}
      </dt>
      <dd className={`text-slate-900 ${bold ? 'font-semibold' : ''}`}>
        {value}
      </dd>
    </div>
  );
}