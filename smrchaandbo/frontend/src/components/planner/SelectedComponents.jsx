export default function SelectedComponents({ items, onChange, onRemove }) {
  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
      <h3 className='text-base font-semibold'>Selected components</h3>
      <div className='mt-3 overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-left text-slate-500'>
            <tr>
              <th className='py-2 pr-4'>Title</th>
              <th className='py-2 pr-4'>Qty</th>
              <th className='py-2 pr-4'>Pages</th>
              <th className='py-2 pr-4'>Unit</th>
              <th className='py-2 pr-4'>Line</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody className='align-top'>
            {items.map((it) => {
              const unit = Number(it.component?.base_price ?? 0);
              const qty = Number(it.quantity ?? 1);
              const line = unit * qty;
              return (
                <tr key={it.component.id} className='border-t border-slate-100'>
                  <td className='py-2 pr-4'>
                    <div className='font-medium text-slate-900'>
                      {it.component.title}
                    </div>
                    {it.component.category?.name && (
                      <div className='text-xs text-slate-500'>
                        {it.component.category.name}
                      </div>
                    )}
                  </td>
                  <td className='py-2 pr-4'>
                    <input
                      type='number'
                      min='1'
                      value={it.quantity ?? 1}
                      onChange={(e) =>
                        onChange(it.component.id, {
                          quantity:
                            e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      className='w-20 bg-slate-50 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                    />
                  </td>
                  <td className='py-2 pr-4'>
                    <input
                      type='number'
                      min='1'
                      value={it.pages ?? ''}
                      onChange={(e) =>
                        onChange(it.component.id, {
                          pages:
                            e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      className='w-24 bg-slate-50 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                      placeholder='—'
                    />
                  </td>
                  <td className='py-2 pr-4'>€{unit.toFixed(2)}</td>
                  <td className='py-2 pr-4'>
                    €{Number.isFinite(line) ? line.toFixed(2) : '0.00'}
                  </td>
                  <td className='py-2'>
                    <button
                      className='text-slate-500 hover:text-slate-800'
                      onClick={() => onRemove(it.component.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className='py-8 text-center text-slate-500'>
                  No components added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
