import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTemplates,
  getSizes,
  getPapers,
  getBindings,
  getColors,
  getCovers,
  getComponentCategories,
  getComponents,
} from '../lib/catalogApi';
import { createPlanner, addPlannerItem } from '../lib/plannerApi';
import OptionPicker from '../components/planner/OptionPicker';
import ComponentPicker from '../components/planner/ComponentPicker';
import SelectedComponents from '../components/planner/SelectedComponents';
import PriceSummary from '../components/planner/PriceSummary';

function money(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export default function CreatePlanner() {
  const navigate = useNavigate();

  // catalog
  const [templates, setTemplates] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [bindings, setBindings] = useState([]);
  const [colors, setColors] = useState([]);
  const [covers, setCovers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allComponents, setAllComponents] = useState([]);

  // form state
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [sizeId, setSizeId] = useState('');
  const [paperId, setPaperId] = useState('');
  const [bindingId, setBindingId] = useState('');
  const [colorId, setColorId] = useState('');
  const [coverId, setCoverId] = useState('');
  const [notes, setNotes] = useState(''); // harmless; not sent to API
  const [items, setItems] = useState([]); // [{ component, quantity, pages, sort_order }]

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, s, p, b, c, cv, cat, comps] = await Promise.all([
          getTemplates({ active_only: 1 }),
          getSizes({ active_only: 1 }),
          getPapers({ active_only: 1 }),
          getBindings({ active_only: 1 }),
          getColors({ active_only: 1 }),
          getCovers({ active_only: 1 }),
          getComponentCategories(),
          getComponents({ active_only: 1 }),
        ]);

        setTemplates(t.data?.data ?? t.data);
        setSizes(s.data?.data ?? s.data);
        setPapers(p.data?.data ?? p.data);
        setBindings(b.data?.data ?? b.data);
        setColors(c.data?.data ?? c.data);
        setCovers(cv.data?.data ?? cv.data);
        setCategories(cat.data?.data ?? cat.data);
        setAllComponents(comps.data?.data ?? comps.data);

        const dt = t.data?.data ?? t.data;
        const ds = s.data?.data ?? s.data;
        const dp = p.data?.data ?? p.data;
        const db = b.data?.data ?? b.data;
        setTemplateId(String(dt?.[0]?.id ?? ''));
        setSizeId(String(ds?.[0]?.id ?? ''));
        setPaperId(String(dp?.[0]?.id ?? ''));
        setBindingId(String(db?.[0]?.id ?? ''));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // price calc
  const computed = useMemo(() => {
    const t = templates.find((x) => String(x.id) === String(templateId));
    const s = sizes.find((x) => String(x.id) === String(sizeId));
    const p = papers.find((x) => String(x.id) === String(paperId));
    const b = bindings.find((x) => String(x.id) === String(bindingId));
    const c = colors.find((x) => String(x.id) === String(colorId));
    const cv = covers.find((x) => String(x.id) === String(coverId));

    const templateBase = t ? parseFloat(t.base_price ?? 0) : 0;
    const deltas = [
      s?.price_delta,
      p?.price_delta,
      b?.price_delta,
      c?.price_delta,
      cv?.price_delta,
    ].map((v) => parseFloat(v ?? 0));
    const optionsDelta = deltas.reduce(
      (a, n) => a + (Number.isFinite(n) ? n : 0),
      0
    );

    const itemsTotal = items.reduce((sum, it) => {
      const base = parseFloat(it.component?.base_price ?? 0);
      const qty = parseInt(it.quantity ?? 1, 10);
      const line =
        (Number.isFinite(base) ? base : 0) * (Number.isFinite(qty) ? qty : 1);
      return sum + line;
    }, 0);

    const subtotal = templateBase + optionsDelta + itemsTotal;
    const tax = +(subtotal * 0.2).toFixed(2);
    const shipping = subtotal > 50 ? 0 : 4.9;
    const total = +(subtotal + tax + shipping).toFixed(2);

    return {
      templateBase,
      optionsDelta,
      itemsTotal,
      subtotal,
      tax,
      shipping,
      total,
    };
  }, [
    templates,
    sizes,
    papers,
    bindings,
    colors,
    covers,
    templateId,
    sizeId,
    paperId,
    bindingId,
    colorId,
    coverId,
    items,
  ]);

  function upsertItem(component, changes = {}) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.component.id === component.id);
      if (idx === -1) {
        const next = {
          component,
          quantity: 1,
          pages: component.default_pages ?? '',
          sort_order: prev.length,
          ...changes,
        };
        return [...prev, next];
      } else {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...changes };
        return copy;
      }
    });
  }

  function removeItem(componentId) {
    setItems((prev) => prev.filter((i) => i.component.id !== componentId));
  }

  async function handleCreate() {
    setFormError(null);
    if (!templateId || !sizeId || !paperId || !bindingId) {
      setFormError('Please choose template, size, paper and binding.');
      return;
    }
    try {
      setSubmitting(true);

      // ✅ match your DB columns (Planner model & migration)
      const payload = {
        title: title || null,
        template_id: Number(templateId),
        size_option_id: Number(sizeId),
        paper_option_id: Number(paperId),
        binding_option_id: Number(bindingId),
        color_option_id: colorId ? Number(colorId) : null,
        cover_design_id: coverId ? Number(coverId) : null,
        // notes not sent (no column)
      };

      const resp = await createPlanner(payload);
      const planner = resp.data?.data ?? resp.data;

      // add items (optional)
      for (const it of items) {
        await addPlannerItem(planner.id, {
          component_id: it.component.id,
          quantity: it.quantity ? Number(it.quantity) : 1,
          pages: it.pages ? Number(it.pages) : null,
          sort_order: it.sort_order ?? 0,
        });
      }

      navigate('/account');
    } catch (e) {
      console.error('Create planner failed', e?.response?.data || e);
      const apiMsg =
        e?.response?.data?.message ||
        (e?.response?.status === 403
          ? 'Only customers can create planners. Sign in with a customer account.'
          : null);

      const validation = e?.response?.data?.errors
        ? Object.entries(e.response.data.errors)
            .map(([k, arr]) => `${k}: ${arr.join(', ')}`)
            .join(' | ')
        : null;

      setFormError(
        apiMsg ||
          validation ||
          'Failed to create planner. Check your inputs and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className='py-10 text-center text-slate-600'>
        Loading planner builder…
      </section>
    );
  }

  return (
    <section className='space-y-8'>
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Create Planner
          </h1>
          <p className='text-slate-600'>
            Pick options, add components, preview price.
          </p>
        </div>
        <PriceSummary
          computed={computed}
          disabled={submitting}
          onCreate={handleCreate}
        />
      </div>

      {formError && (
        <div className='rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm'>
          {formError}
        </div>
      )}

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Left: options */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 space-y-4'>
            <div>
              <label className='block text-sm text-slate-700 mb-1'>
                Title (optional)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                placeholder='My 2026 planner'
              />
            </div>

            <OptionPicker
              templates={templates}
              sizes={sizes}
              papers={papers}
              bindings={bindings}
              colors={colors}
              covers={covers}
              templateId={templateId}
              setTemplateId={setTemplateId}
              sizeId={sizeId}
              setSizeId={setSizeId}
              paperId={paperId}
              setPaperId={setPaperId}
              bindingId={bindingId}
              setBindingId={setBindingId}
              colorId={colorId}
              setColorId={setColorId}
              coverId={coverId}
              setCoverId={setCoverId}
              notes={notes}
              setNotes={setNotes}
            />
          </div>
        </div>

        {/* Middle: component picker */}
        <div className='lg:col-span-1'>
          <ComponentPicker
            components={allComponents}
            categories={categories}
            selected={items}
            onAdd={(c) => upsertItem(c)}
            onRemove={(id) => removeItem(id)}
          />
        </div>

        {/* Right: selected components + summary */}
        <div className='lg:col-span-1'>
          <SelectedComponents
            items={items}
            onChange={(componentId, changes) => {
              const component = allComponents.find((c) => c.id === componentId);
              if (!component) return;
              upsertItem(component, changes);
            }}
            onRemove={(id) => removeItem(id)}
          />

          <div className='mt-6 bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
            <h3 className='text-base font-semibold'>Price breakdown</h3>
            <dl className='mt-3 space-y-2 text-sm'>
              <Row
                label='Template base'
                value={`€${money(computed.templateBase)}`}
              />
              <Row
                label='Options delta'
                value={`€${money(computed.optionsDelta)}`}
              />
              <Row
                label='Components'
                value={`€${money(computed.itemsTotal)}`}
              />
              <div className='h-px bg-slate-200 my-2' />
              <Row label='Subtotal' value={`€${money(computed.subtotal)}`} />
              <Row label='Tax (est.)' value={`€${money(computed.tax)}`} />
              <Row
                label='Shipping (est.)'
                value={`€${money(computed.shipping)}`}
              />
              <div className='h-px bg-slate-200 my-2' />
              <Row
                bold
                label='Total est.'
                value={`€${money(computed.total)}`}
              />
            </dl>
            <button
              className='mt-4 w-full bg-fuchsia-600 text-white px-4 py-2 rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create planner'}
            </button>
          </div>
        </div>
      </div>
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
