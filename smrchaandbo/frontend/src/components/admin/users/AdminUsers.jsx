import { useEffect, useMemo, useState } from 'react';
import { getUsers } from '../../../lib/adminApi';
import AdminSectionHeader from '../AdminSectionHeader';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // sort
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc'); // asc|desc

  async function fetchAll() {
    try {
      setErr(null);
      setLoading(true);
      const resp = await getUsers();
      const data = resp.data ?? [];
      setRows(data);
    } catch (e) {
      console.error(e?.response?.data || e);
      setErr(e?.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []); // initial

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        getSortValue: (r) => Number(r.id),
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        getSortValue: (r) => (r.name || '').toLowerCase(),
        render: (r) => (
          <div className='leading-tight'>
            <div className='font-medium'>{r.name}</div>
            <div className='text-xs text-slate-500'>{r.email}</div>
          </div>
        ),
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        getSortValue: (r) => (r.role || '').toLowerCase(),
        render: (r) => (
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
              r.role === 'admin'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {r.role || '—'}
          </span>
        ),
      },
      {
        key: 'planners_count',
        label: 'Planners',
        sortable: true,
        getSortValue: (r) => Number(r.planners_count ?? 0),
        render: (r) => r.planners_count ?? 0,
      },
      {
        key: 'orders_count',
        label: 'Orders',
        sortable: true,
        getSortValue: (r) => Number(r.orders_count ?? 0),
        render: (r) => r.orders_count ?? 0,
      },
      {
        key: 'created_at',
        label: 'Joined',
        sortable: true,
        getSortValue: (r) => new Date(r.created_at || 0).getTime(),
        render: (r) => fmtDate(r.created_at),
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
        title='Users'
        actions={
          <button
            onClick={fetchAll}
            className='inline-flex items-center bg-white px-3 py-2 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50'
          >
            Refresh
          </button>
        }
      />

      {err && (
        <div className='rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 px-4 py-10 text-center text-slate-600'>
          Loading users…
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
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r, idx) => (
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
                {sortedRows.length === 0 && (
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
      )}
    </section>
  );
}