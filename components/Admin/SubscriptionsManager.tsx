'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppButton, AppModal, DataTable } from '@/components/shared/ui';
import type { DataTableColumn } from '@/components/shared/ui';
import { SectionCard, EmptyState, StatCard } from '@/components/Admin/shell';
import {
    FiCreditCard,
    FiPlus,
    FiTrash2,
    FiEdit,
    FiStar,
    FiArchive,
    FiCheck,
    FiX,
    FiBookOpen,
} from '@/components/icons/FeatherIcons';

// ---------- Types ----------
interface PriceRow {
    id: string;
    active: boolean;
    currency: string;
    unit_amount: number | null;
    type: 'recurring' | 'one_time';
    recurring: {
        interval: string;
        interval_count: number;
        trial_period_days: number | null;
    } | null;
    nickname: string | null;
    metadata: Record<string, string>;
    created: number;
}

interface ProductRow {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    metadata: Record<string, string>;
    images: string[];
    created: number;
    updated: number;
    prices: PriceRow[];
}

// ---------- API helper ----------
async function api<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
): Promise<T> {
    const token = await firebaseAuth.currentUser?.getIdToken();
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data as T;
}

// ---------- Utilities ----------
function formatMoney(amountCents: number | null, currency: string, locale: string) {
    if (amountCents == null) return '—';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
        }).format(amountCents / 100);
    } catch {
        return `${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
    }
}

function intervalLabel(p: PriceRow): string {
    if (p.type === 'one_time') return 'one-time';
    if (!p.recurring) return '—';
    const { interval, interval_count } = p.recurring;
    return interval_count > 1 ? `every ${interval_count} ${interval}s` : `/${interval}`;
}

// ---------- Product editor modal ----------
interface ProductFormState {
    name: string;
    description: string;
    active: boolean;
    featured: boolean;
    mainPlan: boolean;
}

const emptyForm: ProductFormState = {
    name: '',
    description: '',
    active: true,
    featured: false,
    mainPlan: false,
};

interface ProductEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editing: ProductRow | null;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ isOpen, onClose, onSaved, editing }) => {
    const [form, setForm] = useState<ProductFormState>(emptyForm);
    const [includePrice, setIncludePrice] = useState<boolean>(true);
    const [priceAmount, setPriceAmount] = useState<string>('');
    const [priceCurrency, setPriceCurrency] = useState<string>('RON');
    const [priceType, setPriceType] = useState<'recurring' | 'one_time'>('recurring');
    const [priceInterval, setPriceInterval] = useState<'month' | 'year' | 'week' | 'day'>('month');
    const [trialDays, setTrialDays] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        if (editing) {
            setForm({
                name: editing.name,
                description: editing.description || '',
                active: editing.active,
                featured: editing.metadata?.featured === 'true',
                mainPlan: editing.metadata?.mainPlan === 'true',
            });
            setIncludePrice(false);
        } else {
            setForm(emptyForm);
            setIncludePrice(true);
            setPriceAmount('');
        }
        setError(null);
    }, [isOpen, editing]);

    const onSubmit = async () => {
        if (!form.name.trim()) {
            setError('Name is required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            if (editing) {
                await api(`/api/stripe/products/${editing.id}`, 'PATCH', {
                    name: form.name,
                    description: form.description || null,
                    active: form.active,
                    featured: form.featured,
                    mainPlan: form.mainPlan,
                });
            } else {
                const body: any = {
                    name: form.name,
                    description: form.description || undefined,
                    active: form.active,
                    metadata: {
                        featured: String(form.featured),
                        mainPlan: String(form.mainPlan),
                    },
                };
                if (includePrice && priceAmount) {
                    body.initialPrice = {
                        unit_amount: Math.round(parseFloat(priceAmount) * 100),
                        currency: priceCurrency,
                        type: priceType,
                        interval: priceType === 'recurring' ? priceInterval : undefined,
                        trial_period_days:
                            priceType === 'recurring' && trialDays
                                ? parseInt(trialDays, 10)
                                : undefined,
                    };
                }
                await api('/api/stripe/products', 'POST', body);
            }
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={editing ? 'Edit product' : 'New product'}
            subtitle={
                editing ? 'Updates sync to Stripe instantly.' : 'Creates a new Stripe product (and price).'
            }
            icon={<FiCreditCard size={20} />}
            tone="primary"
            size="lg"
            footer={
                <div className="flex items-center gap-2">
                    <AppButton variant="light" onPress={onClose} isDisabled={saving}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" onPress={onSubmit} isLoading={saving} loadingText="Saving…">
                        {editing ? 'Save changes' : 'Create product'}
                    </AppButton>
                </div>
            }
        >
            <div className="space-y-5">
                {error && (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                        {error}
                    </div>
                )}

                <Field label="Name">
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputCls}
                        placeholder="Pro Plan"
                    />
                </Field>

                <Field label="Description" hint="Shown to customers in checkout & subscription pages.">
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`${inputCls} min-h-[80px] resize-y`}
                        placeholder="Unlimited access to all courses…"
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ToggleCard
                        label="Active"
                        description="Available for purchase"
                        checked={form.active}
                        onChange={(v) => setForm({ ...form, active: v })}
                    />
                    <ToggleCard
                        label="Featured"
                        description="Highlighted in storefront"
                        checked={form.featured}
                        onChange={(v) => setForm({ ...form, featured: v })}
                    />
                    <ToggleCard
                        label="Main plan"
                        description="Default subscription"
                        checked={form.mainPlan}
                        onChange={(v) => setForm({ ...form, mainPlan: v })}
                    />
                </div>

                {!editing && (
                    <SectionCard
                        title="Initial price"
                        description="Optional — you can also add prices after creation."
                        flush={false}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                id="includePrice"
                                type="checkbox"
                                checked={includePrice}
                                onChange={(e) => setIncludePrice(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="includePrice" className="text-sm">
                                Create an initial price now
                            </label>
                        </div>

                        {includePrice && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Amount">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={priceAmount}
                                            onChange={(e) => setPriceAmount(e.target.value)}
                                            className={inputCls}
                                            placeholder="29.99"
                                        />
                                    </div>
                                </Field>
                                <Field label="Currency">
                                    <select
                                        value={priceCurrency}
                                        onChange={(e) => setPriceCurrency(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="RON">RON</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </Field>
                                <Field label="Type">
                                    <select
                                        value={priceType}
                                        onChange={(e) => setPriceType(e.target.value as any)}
                                        className={inputCls}
                                    >
                                        <option value="recurring">Recurring</option>
                                        <option value="one_time">One time</option>
                                    </select>
                                </Field>
                                {priceType === 'recurring' && (
                                    <>
                                        <Field label="Interval">
                                            <select
                                                value={priceInterval}
                                                onChange={(e) => setPriceInterval(e.target.value as any)}
                                                className={inputCls}
                                            >
                                                <option value="month">Monthly</option>
                                                <option value="year">Yearly</option>
                                                <option value="week">Weekly</option>
                                                <option value="day">Daily</option>
                                            </select>
                                        </Field>
                                        <Field label="Trial days (optional)">
                                            <input
                                                type="number"
                                                min={0}
                                                value={trialDays}
                                                onChange={(e) => setTrialDays(e.target.value)}
                                                className={inputCls}
                                                placeholder="0"
                                            />
                                        </Field>
                                    </>
                                )}
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>
        </AppModal>
    );
};

// ---------- Add price modal ----------
interface AddPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    product: ProductRow | null;
}

const AddPriceModal: React.FC<AddPriceModalProps> = ({ isOpen, onClose, onSaved, product }) => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('RON');
    const [type, setType] = useState<'recurring' | 'one_time'>('recurring');
    const [interval, setInterval] = useState<'month' | 'year' | 'week' | 'day'>('month');
    const [nickname, setNickname] = useState('');
    const [trialDays, setTrialDays] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setNickname('');
            setError(null);
        }
    }, [isOpen]);

    const onSubmit = async () => {
        if (!product) return;
        if (!amount) {
            setError('Amount is required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await api(`/api/stripe/products/${product.id}/prices`, 'POST', {
                unit_amount: Math.round(parseFloat(amount) * 100),
                currency,
                type,
                interval: type === 'recurring' ? interval : undefined,
                trial_period_days:
                    type === 'recurring' && trialDays ? parseInt(trialDays, 10) : undefined,
                nickname: nickname || undefined,
            });
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to add price');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add price"
            subtitle={product ? `For ${product.name}` : undefined}
            tone="primary"
            size="md"
            footer={
                <div className="flex items-center gap-2">
                    <AppButton variant="light" onPress={onClose} isDisabled={saving}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" onPress={onSubmit} isLoading={saving} loadingText="Adding…">
                        Add price
                    </AppButton>
                </div>
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Amount">
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={inputCls}
                            placeholder="29.99"
                        />
                    </Field>
                    <Field label="Currency">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={inputCls}
                        >
                            <option value="RON">RON</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                        </select>
                    </Field>
                    <Field label="Type">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className={inputCls}
                        >
                            <option value="recurring">Recurring</option>
                            <option value="one_time">One time</option>
                        </select>
                    </Field>
                    {type === 'recurring' && (
                        <Field label="Interval">
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value as any)}
                                className={inputCls}
                            >
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                                <option value="week">Weekly</option>
                                <option value="day">Daily</option>
                            </select>
                        </Field>
                    )}
                    {type === 'recurring' && (
                        <Field label="Trial days">
                            <input
                                type="number"
                                min={0}
                                value={trialDays}
                                onChange={(e) => setTrialDays(e.target.value)}
                                className={inputCls}
                                placeholder="0"
                            />
                        </Field>
                    )}
                    <Field label="Nickname (optional)">
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className={inputCls}
                            placeholder="Pro Monthly"
                        />
                    </Field>
                </div>
            </div>
        </AppModal>
    );
};

// ---------- Small helpers ----------
const inputCls =
    'w-full rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 px-3 py-2 text-sm text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/40';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
    label,
    hint,
    children,
}) => (
    <label className="block">
        <span className="block text-xs font-medium text-[color:var(--ai-muted)] mb-1">
            {label}
        </span>
        {children}
        {hint && <span className="block text-[11px] text-[color:var(--ai-muted)] mt-1">{hint}</span>}
    </label>
);

const ToggleCard: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`text-left rounded-xl border px-3 py-2.5 transition-all ${checked
            ? 'border-[color:var(--ai-primary)]/50 bg-[color:var(--ai-primary)]/8'
            : 'border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 hover:border-[color:var(--ai-primary)]/30'
            }`}
    >
        <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[color:var(--ai-foreground)]">{label}</span>
            <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${checked
                    ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]'
                    : 'border-[color:var(--ai-card-border)]'
                    }`}
            >
                {checked && <FiCheck size={10} className="text-white" />}
            </span>
        </div>
        <span className="block text-[11px] text-[color:var(--ai-muted)] mt-0.5">{description}</span>
    </button>
);

// ---------- Main manager ----------
const SubscriptionsManager: React.FC = () => {
    const t = useTranslations('admin.subscriptions');
    const locale = useLocale();
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<ProductRow | null>(null);
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [activePriceProduct, setActivePriceProduct] = useState<ProductRow | null>(null);
    const [confirmArchive, setConfirmArchive] = useState<ProductRow | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api<{ products: ProductRow[] }>('/api/stripe/products?active=all');
            setProducts(data.products);
        } catch (e: any) {
            setError(e.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const filtered = useMemo(() => {
        if (filter === 'all') return products;
        return products.filter((p) => (filter === 'active' ? p.active : !p.active));
    }, [products, filter]);

    const stats = useMemo(() => {
        const total = products.length;
        const active = products.filter((p) => p.active).length;
        const subscriptionPlans = products.filter((p) =>
            p.prices.some((pr) => pr.type === 'recurring' && pr.active)
        ).length;
        const totalActivePrices = products.reduce(
            (sum, p) => sum + p.prices.filter((pr) => pr.active).length,
            0
        );
        return { total, active, subscriptionPlans, totalActivePrices };
    }, [products]);

    const togglePrice = async (productId: string, priceId: string, active: boolean) => {
        setActionLoading(`price:${priceId}`);
        try {
            await api(`/api/stripe/products/${productId}/prices/${priceId}`, 'PATCH', { active });
            await reload();
        } catch (e: any) {
            setError(e.message || 'Failed to toggle price');
        } finally {
            setActionLoading(null);
        }
    };

    const archiveProduct = async (product: ProductRow) => {
        setActionLoading(`product:${product.id}`);
        try {
            await api(`/api/stripe/products/${product.id}`, 'DELETE');
            setConfirmArchive(null);
            await reload();
        } catch (e: any) {
            setError(e.message || 'Failed to archive product');
        } finally {
            setActionLoading(null);
        }
    };

    const columns: DataTableColumn<ProductRow>[] = [
        {
            key: 'name',
            header: t('table.product'),
            cell: (p) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[color:var(--ai-foreground)]">{p.name}</span>
                        {p.metadata?.mainPlan === 'true' && (
                            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-full bg-[color:var(--ai-primary)]/15 text-[10px] font-medium text-[color:var(--ai-primary)]">
                                <FiStar size={10} /> {t('badges.main')}
                            </span>
                        )}
                        {p.metadata?.featured === 'true' && (
                            <span className="inline-flex items-center px-1.5 h-5 rounded-full bg-amber-500/15 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                {t('badges.featured')}
                            </span>
                        )}
                    </div>
                    {p.description && (
                        <span className="text-xs text-[color:var(--ai-muted)] line-clamp-1">
                            {p.description}
                        </span>
                    )}
                </div>
            ),
            sortAccessor: (p) => p.name,
        },
        {
            key: 'status',
            header: t('table.status'),
            width: '100px',
            cell: (p) =>
                p.active ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t('status.active')}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[color:var(--ai-muted)] text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ai-muted)]" />{' '}
                        {t('status.archived')}
                    </span>
                ),
        },
        {
            key: 'prices',
            header: t('table.prices'),
            cell: (p) => {
                if (p.prices.length === 0) {
                    return (
                        <span className="text-xs text-[color:var(--ai-muted)]">{t('table.noPrices')}</span>
                    );
                }
                return (
                    <div className="flex flex-col gap-1">
                        {p.prices
                            .slice()
                            .sort((a, b) => Number(b.active) - Number(a.active))
                            .map((pr) => (
                                <div
                                    key={pr.id}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <span
                                        className={`font-medium ${pr.active
                                            ? 'text-[color:var(--ai-foreground)]'
                                            : 'text-[color:var(--ai-muted)] line-through'
                                            }`}
                                    >
                                        {formatMoney(pr.unit_amount, pr.currency, locale)}
                                    </span>
                                    <span className="text-[color:var(--ai-muted)]">{intervalLabel(pr)}</span>
                                    {pr.nickname && (
                                        <span className="text-[10px] text-[color:var(--ai-muted)] italic">
                                            ({pr.nickname})
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => togglePrice(p.id, pr.id, !pr.active)}
                                        disabled={actionLoading === `price:${pr.id}`}
                                        className={`ml-auto inline-flex items-center gap-1 px-1.5 h-5 rounded-full border text-[10px] font-medium transition-colors ${pr.active
                                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                                            : 'border-[color:var(--ai-card-border)] text-[color:var(--ai-muted)] hover:bg-[color:var(--ai-card-bg)]/60'
                                            }`}
                                        title={pr.active ? 'Deactivate price' : 'Activate price'}
                                    >
                                        {pr.active ? <FiCheck size={10} /> : <FiX size={10} />}
                                        {pr.active ? t('actions.activePrice') : t('actions.inactivePrice')}
                                    </button>
                                </div>
                            ))}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            width: '180px',
            align: 'right',
            cell: (p) => (
                <div className="flex items-center justify-end gap-1">
                    <AppButton
                        variant="light"
                        size="xs"
                        startContent={<FiPlus size={12} />}
                        onPress={() => {
                            setActivePriceProduct(p);
                            setPriceModalOpen(true);
                        }}
                    >
                        {t('actions.addPrice')}
                    </AppButton>
                    <AppButton
                        variant="light"
                        size="xs"
                        isIconOnly
                        onPress={() => {
                            setEditing(p);
                            setEditorOpen(true);
                        }}
                        title={t('actions.edit')}
                    >
                        <FiEdit size={14} />
                    </AppButton>
                    <AppButton
                        variant="light"
                        color="danger"
                        size="xs"
                        isIconOnly
                        isDisabled={!p.active}
                        onPress={() => setConfirmArchive(p)}
                        title={t('actions.archive')}
                    >
                        <FiArchive size={14} />
                    </AppButton>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={t('stats.totalProducts')} value={stats.total} icon={<FiCreditCard size={16} />} />
                <StatCard label={t('stats.activeProducts')} value={stats.active} tone="success" />
                <StatCard label={t('stats.subscriptionPlans')} value={stats.subscriptionPlans} tone="primary" />
                <StatCard label={t('stats.activePrices')} value={stats.totalActivePrices} />
            </div>

            {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                </div>
            )}

            <SectionCard
                title={t('catalog.title')}
                description={t('catalog.description')}
                actions={
                    <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-[color:var(--ai-card-border)] p-0.5 bg-[color:var(--ai-card-bg)]/40">
                            {(['all', 'active', 'archived'] as const).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFilter(f)}
                                    className={`px-3 h-7 text-xs rounded-md transition-colors ${filter === f
                                        ? 'bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)] font-medium'
                                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                                        }`}
                                >
                                    {t(`filter.${f}`)}
                                </button>
                            ))}
                        </div>
                        <AppButton
                            variant="primary"
                            size="sm"
                            startContent={<FiPlus size={14} />}
                            onPress={() => {
                                setEditing(null);
                                setEditorOpen(true);
                            }}
                        >
                            {t('actions.newProduct')}
                        </AppButton>
                    </div>
                }
                flush
            >
                <DataTable
                    data={filtered}
                    columns={columns}
                    rowKey={(p) => p.id}
                    isLoading={loading}
                    emptyState={
                        <EmptyState
                            icon={<FiBookOpen size={20} />}
                            title={t('empty.title')}
                            description={t('empty.description')}
                        />
                    }
                />
            </SectionCard>

            <ProductEditor
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                onSaved={reload}
                editing={editing}
            />
            <AddPriceModal
                isOpen={priceModalOpen}
                onClose={() => setPriceModalOpen(false)}
                onSaved={reload}
                product={activePriceProduct}
            />
            <AppModal
                isOpen={!!confirmArchive}
                onClose={() => setConfirmArchive(null)}
                title={t('confirm.archiveTitle')}
                tone="danger"
                size="sm"
                icon={<FiTrash2 size={20} />}
                footer={
                    <div className="flex items-center gap-2">
                        <AppButton variant="light" onPress={() => setConfirmArchive(null)}>
                            {t('actions.cancel')}
                        </AppButton>
                        <AppButton
                            variant="danger"
                            isLoading={actionLoading?.startsWith('product:')}
                            onPress={() => confirmArchive && archiveProduct(confirmArchive)}
                        >
                            {t('actions.archive')}
                        </AppButton>
                    </div>
                }
            >
                <p className="text-sm text-[color:var(--ai-muted)]">
                    {confirmArchive
                        ? t('confirm.archiveBody', { name: confirmArchive.name })
                        : ''}
                </p>
            </AppModal>
        </div>
    );
};

export default SubscriptionsManager;
