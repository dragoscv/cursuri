'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, Tab, SelectItem, Divider } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Switch, Select, Textarea } from '@/components/ui';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { AdminSettings as AdminSettingsType, PublicConfig } from '@/types';
import { StripeProduct, StripePrice } from '@/types/stripe';
import { SectionCard } from '@/components/Admin/shell';
import {
  getPublicConfig,
  updatePublicConfig,
} from '@/utils/firebase/publicConfig';
import {
  FiCheckCircle,
  FiX,
  FiUsers,
  FiAward,
  FiTarget,
  FiCreditCard,
} from '@/components/icons/FeatherIcons';
import { FiDollarSign } from '@/components/icons/FeatherIconsExtended';

type BillingInterval = 'one_time' | 'month' | 'year';

const GITHUB_PRODUCT_NAME = 'GitHub + Microsoft Account Subscription';

const DEFAULT_SETTINGS: AdminSettingsType = {
  siteName: '',
  siteDescription: '',
  contactEmail: '',
  allowRegistration: true,
  allowSocialLogin: true,
  paymentProcessorEnabled: true,
  taxRate: 0,
  currencyCode: 'RON',
};

const AdminSettings: React.FC = () => {
  const t = useTranslations('admin.settings');
  const tCurrency = useTranslations('admin.settings.currencies');
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AdminSettings must be used within an AppProvider');
  }

  const { getAdminSettings, updateAdminSettings, user, products, refreshProducts } = context;
  const { showToast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminSettingsType>(DEFAULT_SETTINGS);
  const [initialData, setInitialData] = useState<AdminSettingsType>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('general');

  // Public, admin-managed runtime config (Stripe price IDs, etc.). Stored in
  // Firestore at `config/public` so non-admin clients can read it for
  // checkout while only admins can mutate it.
  const [pricing, setPricing] = useState<{ githubPriceId: string }>({ githubPriceId: '' });
  const [pricingInitial, setPricingInitial] = useState<{ githubPriceId: string }>({ githubPriceId: '' });
  const [savingPricing, setSavingPricing] = useState(false);

  // Inline create-price form for the GitHub subscription
  const [newPriceAmount, setNewPriceAmount] = useState<string>('');
  const [newPriceCurrency, setNewPriceCurrency] = useState<string>('ron');
  const [newPriceInterval, setNewPriceInterval] = useState<BillingInterval>('month');
  const [newPriceProductName, setNewPriceProductName] =
    useState<string>(GITHUB_PRODUCT_NAME);
  const [creatingPrice, setCreatingPrice] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const config = await getPublicConfig();
        if (!active) return;
        const next = { githubPriceId: config?.stripe?.githubPriceId ?? '' };
        setPricing(next);
        setPricingInitial(next);
      } catch (err) {
        console.error('Error fetching public config:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        if (getAdminSettings) {
          const settings = await getAdminSettings();
          if (settings && active) {
            setFormData(settings);
            setInitialData(settings);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        if (active) setError(t('failedToLoad'));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, [getAdminSettings, t]);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialData),
    [formData, initialData]
  );

  const isPricingDirty = useMemo(
    () => JSON.stringify(pricing) !== JSON.stringify(pricingInitial),
    [pricing, pricingInitial]
  );

  const handlePricingSave = async () => {
    setSavingPricing(true);
    setSuccess(false);
    setError(null);
    try {
      const trimmed = pricing.githubPriceId.trim();
      const patch: Partial<PublicConfig> = {
        stripe: { githubPriceId: trimmed },
      };
      await updatePublicConfig(patch, user?.uid);
      const next = { githubPriceId: trimmed };
      setPricing(next);
      setPricingInitial(next);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving pricing config:', err);
      setError('Failed to save pricing. You may not have admin permissions.');
    } finally {
      setSavingPricing(false);
    }
  };

  // Flatten all known Stripe prices into selectable options. We surface every
  // price (one-time and recurring) so admins can pick whichever fits, with a
  // visible label that includes amount + interval.
  const priceOptions = useMemo(() => {
    type Option = {
      priceId: string;
      label: string;
      productName: string;
      amount: number;
      currency: string;
      interval: string | null;
    };
    const options: Option[] = [];
    (products as StripeProduct[] | undefined)?.forEach((product) => {
      product.prices?.forEach((price: StripePrice) => {
        if (!price.id || price.unit_amount == null) return;
        const amount = Number(price.unit_amount) / 100;
        const interval = price.recurring
          ? `${price.recurring.interval_count > 1 ? price.recurring.interval_count + ' ' : ''}${price.recurring.interval}${price.recurring.interval_count > 1 ? 's' : ''}`
          : null;
        const intervalSuffix = interval ? ` / ${interval}` : ' (one-time)';
        options.push({
          priceId: price.id,
          productName: product.name || 'Unnamed product',
          amount,
          currency: price.currency,
          interval,
          label: `${product.name || 'Unnamed product'} — ${amount.toFixed(2)} ${price.currency.toUpperCase()}${intervalSuffix}`,
        });
      });
    });
    // Sort: recurring first, then by amount asc
    options.sort((a, b) => {
      if (!!a.interval !== !!b.interval) return a.interval ? -1 : 1;
      return a.amount - b.amount;
    });
    return options;
  }, [products]);

  const selectedPriceLabel = useMemo(() => {
    const match = priceOptions.find((o) => o.priceId === pricing.githubPriceId);
    return match?.label ?? null;
  }, [priceOptions, pricing.githubPriceId]);

  const handleCreatePrice = async () => {
    const amountNumber = parseFloat(newPriceAmount);
    if (!newPriceProductName.trim() || isNaN(amountNumber) || amountNumber <= 0) {
      showToast({
        type: 'warning',
        title: 'Missing information',
        message:
          'Enter a product name and a positive amount before creating a Stripe price.',
        duration: 4000,
      });
      return;
    }
    if (!user) {
      showToast({
        type: 'error',
        title: 'Not signed in',
        message: 'You must be signed in as an admin to create Stripe prices.',
        duration: 4000,
      });
      return;
    }

    setCreatingPrice(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/create-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productName: newPriceProductName.trim(),
          productDescription: newPriceProductName.trim(),
          amount: Math.round(amountNumber * 100),
          currency: newPriceCurrency,
          ...(newPriceInterval !== 'one_time'
            ? { recurring: { interval: newPriceInterval, intervalCount: 1 } }
            : {}),
          metadata: {
            app: 'cursuri',
            feature: 'github-subscription',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create price');
      }

      const data = await response.json();

      // Inject into AppContext so the dropdown updates without a refetch.
      await refreshProducts({
        productId: data.productId,
        productName: data.productName,
        priceId: data.priceId,
        amount: data.amount,
        currency: data.currency,
        recurring: data.recurring ?? null,
      });

      // Auto-select the newly created price for convenience.
      setPricing({ githubPriceId: data.priceId });
      setNewPriceAmount('');

      showToast({
        type: 'success',
        title: 'Price created',
        message: `${(data.amount / 100).toFixed(2)} ${String(data.currency).toUpperCase()} — remember to click "Save pricing" to publish.`,
        duration: 5000,
      });
    } catch (err) {
      console.error('Error creating price:', err);
      showToast({
        type: 'error',
        title: 'Failed to create price',
        message: err instanceof Error ? err.message : 'Unknown error',
        duration: 6000,
      });
    } finally {
      setCreatingPrice(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: isNaN(numberValue) ? 0 : numberValue }));
  };

  const handleSubmit = async () => {
    if (!updateAdminSettings) {
      setError('Update functionality is not available');
      return;
    }
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const result = await updateAdminSettings(formData);
      if (result) {
        setSuccess(true);
        setInitialData(formData);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setError(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status banners */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[color:var(--ai-success)]/10 border border-[color:var(--ai-success)]/30 text-[color:var(--ai-success)] text-sm"
          >
            <FiCheckCircle size={16} />
            {t('savedSuccessfully')}
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[color:var(--ai-danger)]/10 border border-[color:var(--ai-danger)]/30 text-[color:var(--ai-danger)] text-sm"
          >
            <FiX size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs
        aria-label="Admin settings sections"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
        variant="underlined"
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-[color:var(--ai-card-border)]',
          cursor: 'w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]',
          tab: 'max-w-fit px-1 h-10',
          tabContent: 'group-data-[selected=true]:text-[color:var(--ai-foreground)] text-[color:var(--ai-muted)] font-medium',
        }}
      >
        <Tab
          key="general"
          title={
            <div className="flex items-center gap-2">
              <FiTarget size={14} />
              <span>{t('generalSettings')}</span>
            </div>
          }
        >
          <SectionCard
            title={t('generalSettings')}
            description="Site identity and contact details."
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {t('siteName')}
                </label>
                <Input
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder={t('enterSiteName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {t('siteDescription')}
                </label>
                <Textarea
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  placeholder={t('enterSiteDescription')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {t('contactEmail')}
                </label>
                <Input
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder={t('enterContactEmail')}
                />
                {formData.contactEmail &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail) && (
                    <p className="mt-1.5 text-xs text-[color:var(--ai-danger)]">
                      Please enter a valid email address.
                    </p>
                  )}
              </div>
            </div>
          </SectionCard>
        </Tab>

        <Tab
          key="auth"
          title={
            <div className="flex items-center gap-2">
              <FiUsers size={14} />
              <span>{t('authSettings')}</span>
            </div>
          }
        >
          <SectionCard
            title={t('authSettings')}
            description="Control how users sign up and authenticate."
          >
            <div className="space-y-5">
              <ToggleRow
                title={t('allowUserRegistration')}
                description={t('whenDisabledNoRegistration')}
                checked={formData.allowRegistration}
                onChange={(v) => handleSwitchChange('allowRegistration', v)}
              />
              <Divider />
              <ToggleRow
                title={t('allowSocialLogin')}
                description={t('whenEnabledSocialLogin')}
                checked={formData.allowSocialLogin}
                onChange={(v) => handleSwitchChange('allowSocialLogin', v)}
              />
            </div>
          </SectionCard>
        </Tab>

        <Tab
          key="payments"
          title={
            <div className="flex items-center gap-2">
              <FiAward size={14} />
              <span>{t('paymentSettings')}</span>
            </div>
          }
        >
          <SectionCard
            title={t('paymentSettings')}
            description="Currency, tax and payment processor configuration."
          >
            <div className="space-y-5">
              <ToggleRow
                title={t('paymentProcessing')}
                description={t('whenDisabledNoPurchases')}
                checked={formData.paymentProcessorEnabled}
                onChange={(v) => handleSwitchChange('paymentProcessorEnabled', v)}
              />

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                    {t('currency')}
                  </label>
                  <Select
                    value={formData.currencyCode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleSelectChange('currencyCode', e.target.value)
                    }
                  >
                    {/* @ts-expect-error - HeroUI SelectItem value typing */}
                    <SelectItem key="RON" value="RON">{tCurrency('ron')}</SelectItem>
                    {/* @ts-expect-error - HeroUI SelectItem value typing */}
                    <SelectItem key="USD" value="USD">{tCurrency('usd')}</SelectItem>
                    {/* @ts-expect-error - HeroUI SelectItem value typing */}
                    <SelectItem key="EUR" value="EUR">{tCurrency('eur')}</SelectItem>
                    {/* @ts-expect-error - HeroUI SelectItem value typing */}
                    <SelectItem key="GBP" value="GBP">{tCurrency('gbp')}</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                    {t('taxRate')}
                  </label>
                  <Input
                    name="taxRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={formData.taxRate.toString()}
                    onChange={handleNumberChange}
                  />
                  <p className="mt-1.5 text-xs text-[color:var(--ai-muted)]">
                    Applied at checkout (0–100%).
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </Tab>

        <Tab
          key="pricing"
          title={
            <div className="flex items-center gap-2">
              <FiCreditCard size={14} />
              <span>Pricing</span>
            </div>
          }
        >
          <SectionCard
            title="GitHub + Microsoft Subscription Pricing"
            description="Pick an existing Stripe price or create a new one. The selected price is what /profile/github checkout charges. Stored publicly in Firestore (config/public) — never paste secret keys here."
          >
            <div className="space-y-6">
              {/* Existing price picker */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  Active price
                </label>
                <Select
                  value={pricing.githubPriceId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setPricing({ githubPriceId: e.target.value })
                  }
                  aria-label="Select GitHub subscription price"
                >
                  {/* @ts-expect-error - HeroUI SelectItem value typing */}
                  <SelectItem key="" value="">
                    — None selected —
                  </SelectItem>
                  {priceOptions.map((opt) => (
                    /* @ts-expect-error - HeroUI SelectItem value typing */
                    <SelectItem key={opt.priceId} value={opt.priceId}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--ai-muted)]">
                  <span>
                    Currently saved:{' '}
                    {pricingInitial.githubPriceId ? (
                      <code className="px-1.5 py-0.5 rounded bg-[color:var(--ai-card-bg)]/70 border border-[color:var(--ai-card-border)]/60">
                        {pricingInitial.githubPriceId}
                      </code>
                    ) : (
                      <span className="italic">none — checkout will fall back to env var</span>
                    )}
                  </span>
                  {selectedPriceLabel && pricing.githubPriceId !== pricingInitial.githubPriceId && (
                    <span className="text-[color:var(--ai-warning)]">
                      Pending: {selectedPriceLabel}
                    </span>
                  )}
                </div>
              </div>

              <Divider />

              {/* Inline create-price */}
              <div className="rounded-xl border border-[color:var(--ai-card-border)]/60 bg-[color:var(--ai-card-bg)]/30 p-4">
                <h3 className="text-sm font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2 mb-1">
                  <FiDollarSign className="text-[color:var(--ai-primary)]" size={16} />
                  Create new price in Stripe
                </h3>
                <p className="text-xs text-[color:var(--ai-muted)] mb-4">
                  Don&apos;t see the price you want? Create one and it will appear in the dropdown above.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[color:var(--ai-foreground)] mb-1.5">
                      Product name
                    </label>
                    <Input
                      value={newPriceProductName}
                      onChange={(e) => setNewPriceProductName(e.target.value)}
                      placeholder={GITHUB_PRODUCT_NAME}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[color:var(--ai-foreground)] mb-1.5">
                      Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPriceAmount}
                      onChange={(e) => setNewPriceAmount(e.target.value)}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[color:var(--ai-foreground)] mb-1.5">
                      Currency
                    </label>
                    <Select
                      value={newPriceCurrency}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewPriceCurrency(e.target.value)
                      }
                      aria-label="Currency"
                    >
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="ron" value="ron">RON (Romanian Leu)</SelectItem>
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="usd" value="usd">USD (US Dollar)</SelectItem>
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="eur" value="eur">EUR (Euro)</SelectItem>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[color:var(--ai-foreground)] mb-1.5">
                      Billing interval
                    </label>
                    <Select
                      value={newPriceInterval}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewPriceInterval(e.target.value as BillingInterval)
                      }
                      aria-label="Billing interval"
                    >
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="month" value="month">Recurring — monthly</SelectItem>
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="year" value="year">Recurring — yearly</SelectItem>
                      {/* @ts-expect-error - HeroUI SelectItem value typing */}
                      <SelectItem key="one_time" value="one_time">One-time payment</SelectItem>
                    </Select>
                    <p className="mt-1.5 text-xs text-[color:var(--ai-muted)]">
                      The GitHub plan is normally a monthly recurring subscription.
                    </p>
                  </div>
                </div>
                <Button
                  color="secondary"
                  variant="bordered"
                  isLoading={creatingPrice}
                  isDisabled={
                    creatingPrice ||
                    !newPriceProductName.trim() ||
                    !newPriceAmount ||
                    parseFloat(newPriceAmount) <= 0
                  }
                  onPress={handleCreatePrice}
                  size="sm"
                  className="w-full"
                >
                  {creatingPrice ? 'Creating price…' : 'Create price in Stripe'}
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  color="primary"
                  isLoading={savingPricing}
                  isDisabled={savingPricing || !isPricingDirty}
                  onPress={handlePricingSave}
                  size="sm"
                  className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
                >
                  Save pricing
                </Button>
              </div>
            </div>
          </SectionCard>
        </Tab>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-20">
        <motion.div
          layout
          initial={false}
          animate={{ opacity: isDirty ? 1 : 0.7, y: 0 }}
          className="rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/95 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="text-sm text-[color:var(--ai-muted)] flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isDirty ? 'bg-[color:var(--ai-warning)] animate-pulse' : 'bg-[color:var(--ai-success)]'
              }`}
            />
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              isDisabled={!isDirty || saving}
              onPress={handleReset}
              size="sm"
            >
              Reset
            </Button>
            <Button
              color="primary"
              isLoading={saving}
              isDisabled={saving || !isDirty}
              onPress={handleSubmit}
              size="sm"
              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
            >
              {t('saveSettings')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[color:var(--ai-foreground)]">{title}</h3>
        <p className="mt-1 text-xs text-[color:var(--ai-muted)]">{description}</p>
      </div>
      <Switch
        isSelected={checked}
        onValueChange={onChange}
        aria-label={title}
        color="primary"
      />
    </div>
  );
}

export default AdminSettings;
