import { useEffect, useMemo, useState } from 'react';
import { getPlanners } from '../../../lib/plannerApi';
import AdminSectionHeader from '../AdminSectionHeader';
import Table from '../Table';

function money(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export default function AdminPlanners() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // sort
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchAll() {
    try {
      setErr(null);
      setLoading(true);
      const resp = await getPlanners(); // admin vidi sve
      const data = resp.data?.data ?? resp.data ?? [];
      setRows(data);
      setPage(1); // reset paginacije posle refreša
    } catch (e) {
      console.error(e?.response?.data || e);
      setErr(e?.response?.data?.message || 'Failed to load planners.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // definicija kolona sa sort “value extractor”
  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        getSortValue: (r) => Number(r.id),
      },
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        getSortValue: (r) => (r.title || `Planner #${r.id}`).toLowerCase(),
        render: (r) => r.title || `Planner #${r.id}`,
      },
      {
        key: 'user',
        label: 'User',
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
        key: 'template',
        label: 'Template',
        sortable: true,
        getSortValue: (r) => (r.template?.name || '').toLowerCase(),
        render: (r) => r.template?.name ?? '—',
      },
      {
        key: 'size',
        label: 'Size',
        sortable: true,
        getSortValue: (r) => (r.size?.label || '').toLowerCase(),
        render: (r) => r.size?.label ?? '—',
      },
      {
        key: 'paper',
        label: 'Paper',
        sortable: true,
        getSortValue: (r) => (r.paper?.label || '').toLowerCase(),
        render: (r) => r.paper?.label ?? '—',
      },
      {
        key: 'binding',
        label: 'Binding',
        sortable: true,
        getSortValue: (r) => (r.binding?.label || '').toLowerCase(),
        render: (r) => r.binding?.label ?? '—',
      },
      {
        key: 'color',
        label: 'Color',
        sortable: true,
        getSortValue: (r) => (r.color?.name || '').toLowerCase(),
        render: (r) => r.color?.name ?? '—',
      },
      {
        key: 'cover',
        label: 'Cover',
        sortable: true,
        getSortValue: (r) => (r.cover?.name || '').toLowerCase(),
        render: (r) => r.cover?.name ?? '—',
      },
      {
        key: 'items_count',
        label: 'Items',
        sortable: true,
        getSortValue: (r) => Number(r.items_count ?? 0),
        render: (r) => r.items_count ?? 0,
      },
      {
        key: 'subtotal',
        label: 'Subtotal (est.)',
        sortable: true,
        getSortValue: (r) => Number(r?.computed_totals?.subtotal ?? 0),
        render: (r) => `€${money(r?.computed_totals?.subtotal ?? 0)}`,
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

  return (
    <section className='space-y-4'>
      <AdminSectionHeader
        title='Planners'
        actions={
          <div className='flex items-center gap-3'>
            <label className='text-sm text-slate-600'>
              Rows per page:{' '}
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
          Loading planners…
        </div>
      ) : (
        <>
          {/* Custom header render to make headers clickable for sort */}
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
                    </tr>
                  ))}
                  {pagedRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className='px-4 py-10 text-center text-slate-500'
                      >
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination footer */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='text-sm text-slate-600'>
              Showing{' '}
              <span className='font-medium text-slate-900'>
                {total === 0 ? 0 : startIdx + 1}–
                {Math.min(total, startIdx + pageSize)}
              </span>{' '}
              of <span className='font-medium text-slate-900'>{total}</span>
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
                {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className='px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}