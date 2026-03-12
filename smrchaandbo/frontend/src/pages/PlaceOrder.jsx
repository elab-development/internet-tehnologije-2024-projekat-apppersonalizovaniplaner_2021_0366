import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPlanner } from '../lib/plannerApi';
import { createOrder } from '../lib/ordersApi';
import { loadCountries } from '../lib/countriesApi';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function money(n) {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}

export default function PlaceOrder() {
  const q = useQuery();
  const plannerId = q.get('plannerId');
  const navigate = useNavigate();

  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
// countries
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  // shipping form
  const [shipping, setShipping] = useState({
    shipping_name: '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    shipping_country: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
 // load planner
  useEffect(() => {
    (async () => {
      try {
        if (!plannerId) {
          setError('Missing plannerId.');
          return;
        }
        const resp = await getPlanner(plannerId);
        const p = resp.data?.data ?? resp.data;
        setPlanner(p);
      } catch (e) {
        setError('Failed to load planner.');
        console.error(e?.response?.data || e);
      } finally {
        setLoading(false);
      }
    })();
  }, [plannerId]);
// load countries
  useEffect(() => {
    (async () => {
      try {
        const list = await loadCountries();
        setCountries(list);
        // default country (ako nije setovano)
        if (!shipping.shipping_country) {
          const preferred = [
            'Serbia',
            'Germany',
            'United States',
            'United Kingdom',
          ];
          const pick = preferred.find((c) => list.includes(c)) || list[0] || '';
          setShipping((s) => ({ ...s, shipping_country: pick }));
        }
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []); // once
  const price = useMemo(() => {
    if (!planner) return null;
  
    const subtotal = parseFloat(planner?.computed_totals?.subtotal ?? 0);
    const tax = +(subtotal * 0.2).toFixed(2);
    const shippingFee = subtotal > 50 ? 0 : 4.9;
    const total = +(subtotal + tax + shippingFee).toFixed(2);
    return { subtotal, tax, shippingFee, total };
  }, [planner]);

  async function submit() {
    setError(null);
    if (!planner) return;
    if (
      !shipping.shipping_name ||
      !shipping.shipping_address ||
      !shipping.shipping_city ||
      !shipping.shipping_zip ||
      !shipping.shipping_country
    ) {
      setError('Please fill in all shipping fields.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = { planner_id: planner.id, ...shipping };
      await createOrder(payload);
      navigate('/account');
    } catch (e) {
      console.error(e?.response?.data || e);
      const msg = e?.response?.data?.message || 'Failed to place order.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className='py-10 text-center text-slate-600'>Loading…</section>
    );
  }
  if (error) {
    return (
      <section className='py-10 text-center text-rose-600'>{error}</section>
    );
  }
  if (!planner) return null;

  return (
    <section className='max-w-3xl space-y-6'>
      <h1 className='text-2xl font-semibold tracking-tight'>Place Order</h1>
      <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 space-y-4'>
        <div>
          <div className='text-sm text-slate-500'>Planner</div>
          <div className='font-medium text-slate-900'>
            {planner.title || `Planner #${planner.id}`}
          </div>
        </div>

        <div className='grid sm:grid-cols-2 gap-4'>
           <Field
            label='Name'
            value={shipping.shipping_name}
            onChange={(v) => setShipping((s) => ({ ...s, shipping_name: v }))}
          />
          <Field
            label='Address'
            value={shipping.shipping_address}
            onChange={(v) =>
              setShipping((s) => ({ ...s, shipping_address: v }))
            }
          />
          <Field
            label='City'
            value={shipping.shipping_city}
            onChange={(v) => setShipping((s) => ({ ...s, shipping_city: v }))}
          />
          <Field
            label='ZIP'
            value={shipping.shipping_zip}
            onChange={(v) => setShipping((s) => ({ ...s, shipping_zip: v }))}
          />
          <SelectField
            label='Country'
            value={shipping.shipping_country}
             options={countries}
            loading={countriesLoading}
            onChange={(v) =>
              setShipping((s) => ({ ...s, shipping_country: v }))
            }
          />
        </div>

        <div className='pt-2'>
          <div className='text-sm text-slate-500 mb-1'>Payment method</div>
          <div className='inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700'>
            Cash on delivery (COD)
          </div>
        </div>

        <div className='pt-2'>
          <h3 className='text-base font-semibold'>Price</h3>
          <dl className='mt-2 text-sm space-y-1'>
            <Row label='Subtotal' value={`€${money(price.subtotal)}`} />
            <Row label='Tax (est.)' value={`€${money(price.tax)}`} />
            <Row
              label='Shipping (est.)'
              value={`€${money(price.shippingFee)}`}
            />
            <div className='h-px bg-slate-200 my-2' />
            <Row bold label='Total' value={`€${money(price.total)}`} />
          </dl>
        </div>

        {error && (
          <div className='rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-rose-700 text-sm'>
            {error}
          </div>
        )}

        <div className='pt-2'>
          <button
            onClick={submit}
            disabled={submitting}
            className='w-full bg-fuchsia-600 text-white px-4 py-2 rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className='block text-sm text-slate-700 mb-1'>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
      />
    </div>
  );
}
function SelectField({ label, value, onChange, options = [], loading }) {
  return (
    <div>
      <label className='block text-sm text-slate-700 mb-1'>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || options.length === 0}
        className='w-full bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
      >
        {loading ? (
          <option value=''>Loading…</option>
        ) : options.length === 0 ? (
          <option value=''>No countries</option>
        ) : (
          options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))
        )}
      </select>
    </div>
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