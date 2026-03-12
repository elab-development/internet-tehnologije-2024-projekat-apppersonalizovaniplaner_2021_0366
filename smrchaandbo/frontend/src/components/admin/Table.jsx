export default function Table({
  columns = [],
  rows = [],
  rowKey = 'id',
  renderActions,
}) {
  return (
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
                  {c.label}
                </th>
              ))}
              {renderActions && (
                <th className='text-left text-slate-600 font-medium px-4 py-3'>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r[rowKey] ?? idx}
                className='hover:bg-slate-50 transition'
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className='px-4 py-3 align-top text-slate-800'
                  >
                    {typeof c.render === 'function' ? c.render(r) : r[c.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className='px-4 py-3'>{renderActions(r)}</td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
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
  );
}
