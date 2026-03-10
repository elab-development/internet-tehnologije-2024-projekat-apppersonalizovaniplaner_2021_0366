import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminSectionHeader from '../AdminSectionHeader';
import Modal from '../Modal';
import Table from '../Table';
import {
  getSizes,
  getPapers,
  getBindings,
  getColors,
  getCovers,
  getTemplates,
  getComponentCategories,
  getComponents,
  createSize,
  updateSize,
  deleteSize,
  createPaper,
  updatePaper,
  deletePaper,
  createBinding,
  updateBinding,
  deleteBinding,
  createColor,
  updateColor,
  deleteColor,
  createCover,
  updateCover,
  deleteCover,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createComponentCategory,
  updateComponentCategory,
  deleteComponentCategory,
  createComponent,
  updateComponent,
  deleteComponent,
} from '../../../lib/catalogApi';

// ——— tiny form helper ———
function useForm(initial) {
  const [values, setValues] = useState(initial);
  function patch(p) {
    setValues((v) => ({ ...v, ...p }));
  }
  function reset(obj = initial) {
    setValues(obj);
  }
  return { values, patch, reset };
}

export default function CatalogManager() {
  // data
  const [sizes, setSizes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [bindings, setBindings] = useState([]);
  const [colors, setColors] = useState([]);
  const [covers, setCovers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState([]);

  // modal state
  const [modal, setModal] = useState(null); // { type, mode: 'create'|'edit', item }

  const fetchAll = async () => {
    try {
      const sz = await getSizes();
      const pa = await getPapers();
      const bi = await getBindings();
      const co = await getColors();
      const cv = await getCovers();
      const te = await getTemplates();
      const ca = await getComponentCategories();
      const cm = await getComponents();

      setSizes(sz.data?.data ?? sz.data);
      setPapers(pa.data?.data ?? pa.data);
      setBindings(bi.data?.data ?? bi.data);
      setColors(co.data?.data ?? co.data);
      setCovers(cv.data?.data ?? cv.data);
      setTemplates(te.data?.data ?? te.data);
      setCategories(ca.data?.data ?? ca.data);
      setComponents(cm.data?.data ?? cm.data);
    } catch (err) {
      console.error(
        'Catalog fetch failed:',
        err?.response?.status,
        err?.response?.data || err
      );
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const sections = useMemo(
    () => [
      {
        key: 'sizes',
        title: 'Sizes',
        data: sizes,
        cols: [
          { key: 'label', label: 'Label' },
          { key: 'code', label: 'Code' },
          {
            key: 'price_delta',
            label: 'Price Δ',
            render: (r) => money(r.price_delta),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'papers',
        title: 'Papers',
        data: papers,
        cols: [
          { key: 'label', label: 'Label' },
          { key: 'gsm', label: 'GSM' },
          {
            key: 'price_delta',
            label: 'Price Δ',
            render: (r) => money(r.price_delta),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'bindings',
        title: 'Bindings',
        data: bindings,
        cols: [
          { key: 'label', label: 'Label' },
          {
            key: 'price_delta',
            label: 'Price Δ',
            render: (r) => money(r.price_delta),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'colors',
        title: 'Colors',
        data: colors,
        cols: [
          { key: 'name', label: 'Name' },
          {
            key: 'hex',
            label: 'Color',
            render: (r) => <Swatch hex={r.hex} text={r.hex} />,
          },
          {
            key: 'price_delta',
            label: 'Price Δ',
            render: (r) => money(r.price_delta),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'covers',
        title: 'Covers',
        data: covers,
        cols: [
          { key: 'name', label: 'Name' },
          {
            key: 'image_url',
            label: 'Preview',
            render: (r) => (
              <a
                href={r.image_url}
                target='_blank'
                rel='noreferrer'
                className='text-fuchsia-700 hover:underline'
              >
                Open image
              </a>
            ),
          },
          {
            key: 'price_delta',
            label: 'Price Δ',
            render: (r) => money(r.price_delta),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'templates',
        title: 'Templates',
        data: templates,
        cols: [
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          {
            key: 'base_price',
            label: 'Base Price',
            render: (r) => money(r.base_price),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
      {
        key: 'categories',
        title: 'Component Categories',
        data: categories,
        cols: [
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
        ],
      },
      {
        key: 'components',
        title: 'Components',
        data: components,
        cols: [
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          {
            key: 'category',
            label: 'Category',
            render: (r) => r.category?.name ?? '—',
          },
          {
            key: 'base_price',
            label: 'Base Price',
            render: (r) => money(r.base_price),
          },
          { key: 'default_pages', label: 'Default Pages' },
          { key: 'max_repeats', label: 'Max Repeats' },
          {
            key: 'is_active',
            label: 'Status',
            render: (r) => <Badge active={r.is_active} />,
          },
        ],
      },
    ],
    [sizes, papers, bindings, colors, covers, templates, categories, components]
  );

  function openCreate(type) {
    setModal({ type, mode: 'create', item: null });
  }
  function openEdit(type, item) {
    setModal({ type, mode: 'edit', item });
  }
  function closeModal() {
    setModal(null);
  }

  async function handleDelete(type, id) {
    const map = {
      sizes: deleteSize,
      papers: deletePaper,
      bindings: deleteBinding,
      colors: deleteColor,
      covers: deleteCover,
      templates: deleteTemplate,
      categories: deleteComponentCategory,
      components: deleteComponent,
    };
    if (!map[type]) return;
    await map[type](id);
    await fetchAll();
  }

  return (
    <div className='space-y-10'>
      {sections.map((sec) => (
        <section key={sec.key} className='space-y-3'>
          <AdminSectionHeader
            title={sec.title}
            actions={
              <button
                onClick={() => openCreate(sec.key)}
                className='inline-flex items-center gap-2 bg-fuchsia-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 shadow-sm'
              >
                <Plus className='h-4 w-4' /> New
              </button>
            }
          />
          <Table
            columns={sec.cols}
            rows={sec.data}
            renderActions={(row) => (
              <div className='flex gap-2'>
                <button
                  className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-fuchsia-700 hover:bg-fuchsia-50'
                  onClick={() => openEdit(sec.key, row)}
                >
                  <Pencil className='h-4 w-4' /> Edit
                </button>
                <button
                  className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 hover:bg-slate-50'
                  onClick={() => handleDelete(sec.key, row.id)}
                >
                  <Trash2 className='h-4 w-4' /> Delete
                </button>
              </div>
            )}
          />
        </section>
      ))}

      <CatalogModal
        modal={modal}
        onClose={closeModal}
        afterSave={async () => {
          await fetchAll();
          closeModal();
        }}
        categories={categories}
      />
    </div>
  );
}

/** ——— Modal dispatcher ——— */
function CatalogModal({ modal, onClose, afterSave, categories }) {
  const { type, mode, item } = modal || {};
  if (!modal) return null;
  const titleMap = {
    sizes: 'Size',
    papers: 'Paper',
    bindings: 'Binding',
    colors: 'Color',
    covers: 'Cover',
    templates: 'Template',
    categories: 'Component Category',
    components: 'Component',
  };
  const Form = formMap[type];
  return (
    <Modal
      open
      title={`${mode === 'create' ? 'Create' : 'Edit'} ${titleMap[type]}`}
      onClose={onClose}
    >
      <div className='space-y-4'>
        <Form
          mode={mode}
          initial={item}
          onSaved={afterSave}
          categories={categories}
        />
      </div>
    </Modal>
  );
}

/** ——— Small visual atoms ——— */
function Badge({ active }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs rounded-full
      ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function Swatch({ hex, text }) {
  return (
    <div className='flex items-center gap-2'>
      <span
        className='h-4 w-4 rounded-sm shadow-sm'
        style={{ background: hex }}
      />
      <span className='font-mono text-xs text-slate-700'>{text}</span>
    </div>
  );
}

function money(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v.toFixed(2);
  if (typeof v === 'string') {
    const n = Number.parseFloat(v.trim());
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  }
  return '0.00';
}

/* ======= Form controls (flat, roomy) ======= */
function Label({ children }) {
  return (
    <label className='block text-sm text-slate-700 mb-1'>{children}</label>
  );
}

function Text({ label, value, onChange, ...rest }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
        {...rest}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, ...rest }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 h-28 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
        {...rest}
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, ...rest }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type='number'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
        {...rest}
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className='inline-flex items-center gap-2 text-sm text-slate-700'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='h-4 w-4 rounded-sm border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500'
      />
      {label}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
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

function Submit() {
  return (
    <div className='pt-2'>
      <button
        type='submit'
        className='bg-fuchsia-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 shadow-sm'
      >
        Save
      </button>
    </div>
  );
}

const formMap = {
  sizes: SizeForm,
  papers: PaperForm,
  bindings: BindingForm,
  colors: ColorForm,
  covers: CoverForm,
  templates: TemplateForm,
  categories: CategoryForm,
  components: ComponentForm,
};

/* ======= Individual Forms (logic unchanged) ======= */

function SizeForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { code: '', label: '', price_delta: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createSize(values);
    else await updateSize(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Label'
        value={values.label}
        onChange={(v) => patch({ label: v })}
        required
      />
      <Text
        label='Code'
        value={values.code}
        onChange={(v) => patch({ code: v })}
        required
      />
      <NumberInput
        label='Price Δ'
        value={values.price_delta}
        onChange={(v) => patch({ price_delta: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function PaperForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { label: '', gsm: 90, price_delta: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createPaper(values);
    else await updatePaper(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Label'
        value={values.label}
        onChange={(v) => patch({ label: v })}
        required
      />
      <NumberInput
        label='GSM'
        value={values.gsm}
        onChange={(v) => patch({ gsm: v })}
        min='60'
        max='200'
      />
      <NumberInput
        label='Price Δ'
        value={values.price_delta}
        onChange={(v) => patch({ price_delta: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function BindingForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { label: '', price_delta: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createBinding(values);
    else await updateBinding(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Label'
        value={values.label}
        onChange={(v) => patch({ label: v })}
        required
      />
      <NumberInput
        label='Price Δ'
        value={values.price_delta}
        onChange={(v) => patch({ price_delta: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function ColorForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { name: '', hex: '#000000', price_delta: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createColor(values);
    else await updateColor(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Name'
        value={values.name}
        onChange={(v) => patch({ name: v })}
        required
      />
      <Text
        label='HEX'
        value={values.hex}
        onChange={(v) => patch({ hex: v })}
        required
        placeholder='#RRGGBB'
      />
      <NumberInput
        label='Price Δ'
        value={values.price_delta}
        onChange={(v) => patch({ price_delta: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function CoverForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { name: '', image_url: '', price_delta: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createCover(values);
    else await updateCover(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Name'
        value={values.name}
        onChange={(v) => patch({ name: v })}
        required
      />
      <Text
        label='Image URL'
        value={values.image_url}
        onChange={(v) => patch({ image_url: v })}
        required
      />
      <NumberInput
        label='Price Δ'
        value={values.price_delta}
        onChange={(v) => patch({ price_delta: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function TemplateForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(
    initial ?? { name: '', description: '', base_price: 0, is_active: true }
  );
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createTemplate(values);
    else await updateTemplate(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Name'
        value={values.name}
        onChange={(v) => patch({ name: v })}
        required
      />
      <TextArea
        label='Description'
        value={values.description}
        onChange={(v) => patch({ description: v })}
      />
      <NumberInput
        label='Base Price'
        value={values.base_price}
        onChange={(v) => patch({ base_price: v })}
        min='0'
        step='0.01'
      />
      <Checkbox
        label='Active'
        checked={values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}

function CategoryForm({ mode, initial, onSaved }) {
  const { values, patch } = useForm(initial ?? { name: '', slug: '' });
  async function submit(e) {
    e.preventDefault();
    if (mode === 'create') await createComponentCategory(values);
    else await updateComponentCategory(initial.id, values);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Name'
        value={values.name}
        onChange={(v) => patch({ name: v })}
        required
      />
      <Text
        label='Slug (optional)'
        value={values.slug ?? ''}
        onChange={(v) => patch({ slug: v })}
        placeholder='auto if blank'
      />
      <Submit />
    </form>
  );
}

function ComponentForm({ mode, initial, onSaved, categories }) {
  const { values, patch } = useForm(
    initial ?? {
      title: '',
      slug: '',
      description: '',
      base_price: 0,
      default_pages: '',
      max_repeats: '',
      category_id: '',
      is_active: true,
    }
  );
  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...values,
      default_pages: values.default_pages ? Number(values.default_pages) : null,
      max_repeats: values.max_repeats ? Number(values.max_repeats) : null,
      category_id: values.category_id || null,
    };
    if (mode === 'create') await createComponent(payload);
    else await updateComponent(initial.id, payload);
    onSaved();
  }
  return (
    <form onSubmit={submit} className='space-y-4'>
      <Text
        label='Title'
        value={values.title}
        onChange={(v) => patch({ title: v })}
        required
      />
      <Text
        label='Slug (optional)'
        value={values.slug ?? ''}
        onChange={(v) => patch({ slug: v })}
        placeholder='auto if blank'
      />
      <TextArea
        label='Description'
        value={values.description ?? ''}
        onChange={(v) => patch({ description: v })}
      />
      <NumberInput
        label='Base Price'
        value={values.base_price}
        onChange={(v) => patch({ base_price: v })}
        min='0'
        step='0.01'
      />
      <NumberInput
        label='Default Pages'
        value={values.default_pages ?? ''}
        onChange={(v) => patch({ default_pages: v })}
        min='1'
      />
      <NumberInput
        label='Max Repeats'
        value={values.max_repeats ?? ''}
        onChange={(v) => patch({ max_repeats: v })}
        min='1'
      />
      <Select
        label='Category'
        value={values.category_id ?? ''}
        onChange={(v) => patch({ category_id: v })}
        options={[
          { value: '', label: '— None —' },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <Checkbox
        label='Active'
        checked={!!values.is_active}
        onChange={(v) => patch({ is_active: v })}
      />
      <Submit />
    </form>
  );
}
