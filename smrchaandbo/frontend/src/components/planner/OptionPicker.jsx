export default function OptionPicker({
  templates,
  sizes,
  papers,
  bindings,
  colors,
  covers,
  templateId,
  setTemplateId,
  sizeId,
  setSizeId,
  paperId,
  setPaperId,
  bindingId,
  setBindingId,
  colorId,
  setColorId,
  coverId,
  setCoverId,
  notes,
  setNotes,
}) {
  return (
    <div className='space-y-4'>
      <Select
        label='Template'
        value={templateId}
        onChange={setTemplateId}
        options={templates.map((t) => ({
          value: String(t.id),
          label: `${t.name} (€${
            (t.base_price ?? 0).toFixed
              ? t.base_price.toFixed(2)
              : Number(t.base_price ?? 0).toFixed(2)
          })`,
        }))}
      />

      <Select
        label='Size'
        value={sizeId}
        onChange={setSizeId}
        options={sizes.map((s) => ({
          value: String(s.id),
          label: `${s.label} (+€${Number(s.price_delta ?? 0).toFixed(2)})`,
        }))}
      />

      <Select
        label='Paper'
        value={paperId}
        onChange={setPaperId}
        options={papers.map((p) => ({
          value: String(p.id),
          label: `${p.label} ${p.gsm}gsm (+€${Number(
            p.price_delta ?? 0
          ).toFixed(2)})`,
        }))}
      />

      <Select
        label='Binding'
        value={bindingId}
        onChange={setBindingId}
        options={bindings.map((b) => ({
          value: String(b.id),
          label: `${b.label} (+€${Number(b.price_delta ?? 0).toFixed(2)})`,
        }))}
      />

      <Select
        label='Color (optional)'
        value={colorId ?? ''}
        onChange={setColorId}
        options={[
          { value: '', label: '— None —' },
          ...colors.map((c) => ({
            value: String(c.id),
            label: `${c.name} (${c.hex}) (+€${Number(
              c.price_delta ?? 0
            ).toFixed(2)})`,
          })),
        ]}
      />

      <Select
        label='Cover (optional)'
        value={coverId ?? ''}
        onChange={setCoverId}
        options={[
          { value: '', label: '— None —' },
          ...covers.map((cv) => ({
            value: String(cv.id),
            label: `${cv.name} (+€${Number(cv.price_delta ?? 0).toFixed(2)})`,
          })),
        ]}
      />

      <div>
        <Label>Notes (optional)</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className='w-full bg-slate-50 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
          placeholder='Anything we should know? (gift, start month, etc.)'
        />
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className='block text-sm text-slate-700 mb-1'>{children}</label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
