export default function PriceSummary({ computed, disabled, onCreate }) {
  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-4 min-w-[220px]'>
      <p className='text-xs text-slate-500'>Estimated total</p>
      <p className='mt-1 text-2xl font-semibold text-slate-900'>
        €{(computed?.total ?? 0).toFixed(2)}
      </p>
      <p className='text-xs text-slate-500'>incl. tax & shipping</p>
      <button
        className='mt-3 w-full bg-fuchsia-600 text-white px-3 py-2 rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
        onClick={onCreate}
        disabled={disabled}
      >
        Create planner
      </button>
    </div>
  );
}
