import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';

export default function ComponentPicker({
  components,
  categories,
  selected,
  onAdd,
  onRemove,
}) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const selectedIds = new Set(selected.map((s) => s.component.id));

  const filtered = useMemo(() => {
    let arr = components;
    if (categoryId) {
      arr = arr.filter(
        (c) => String(c.category?.id ?? c.category_id) === String(categoryId)
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.slug || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [components, search, categoryId]);

  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
      {/* Header row */}
      <div className='flex flex-wrap items-center gap-3 justify-between'>
        <h3 className='text-base font-semibold'>Components</h3>

        {/* Controls container */}
        <div className='flex flex-1 min-w-0 items-center gap-3 sm:max-w-xl md:max-w-2xl'>
          {/* Search */}
          <div className='relative flex-1 min-w-[180px]'>
            <Search className='h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search components…'
              className='w-full pl-9 pr-3 py-2 bg-slate-50 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
            />
          </div>

          {/* Category select */}
          <div className='shrink-0'>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className='bg-slate-50 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-500 w-44 sm:w-52'
              title='Filter by category'
            >
              <option value=''>All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <ul className='mt-4 divide-y divide-slate-100'>
        {filtered.map((c) => {
          const already = selectedIds.has(c.id);
          return (
            <li
              key={c.id}
              className='py-3 flex items-center justify-between gap-4'
            >
              <div className='min-w-0'>
                <p className='font-medium text-slate-900 truncate'>{c.title}</p>
                {c.category?.name && (
                  <p className='text-xs text-slate-500 truncate'>
                    {c.category.name}
                  </p>
                )}
                {c.description && (
                  <p className='text-sm text-slate-600 mt-1 line-clamp-2'>
                    {c.description}
                  </p>
                )}
              </div>
              <div className='text-right shrink-0'>
                <p className='text-sm text-slate-700'>
                  €{Number(c.base_price ?? 0).toFixed(2)}
                </p>
                {!already ? (
                  <button
                    className='mt-2 inline-flex items-center gap-2 text-sm bg-fuchsia-600 text-white px-3 py-1.5 rounded hover:bg-fuchsia-700'
                    onClick={() => onAdd(c)}
                  >
                    <Plus className='h-4 w-4' /> Add
                  </button>
                ) : (
                  <button
                    className='mt-2 text-sm text-slate-500 hover:text-slate-800'
                    onClick={() => onRemove(c.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className='py-10 text-center text-slate-500'>
            No components match your filters.
          </li>
        )}
      </ul>
    </div>
  );
}
