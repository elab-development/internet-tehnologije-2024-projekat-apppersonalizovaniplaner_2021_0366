export default function AdminTabs({ tabs, active, onChange }) {
  return (
    <div className='bg-white shadow-sm rounded-xl p-1 flex flex-wrap gap-1'>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition
              ${
                isActive
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
