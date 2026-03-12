export default function AdminSectionHeader({ title, actions }) {
  return (
    <div className='flex items-center justify-between mb-3'>
      <h3 className='text-base sm:text-lg font-semibold text-slate-900'>
        {title}
      </h3>
      <div className='flex items-center gap-2'>{actions}</div>
    </div>
  );
}