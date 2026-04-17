'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, Tab, SelectItem, Divider } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Switch, Select, Textarea } from '@/components/ui';
import { AppContext } from '@/components/AppContext';
import { AdminSettings as AdminSettingsType } from '@/types';
import { SectionCard } from '@/components/Admin/shell';
import {
  FiCheckCircle,
  FiX,
  FiUsers,
  FiAward,
  FiTarget,
} from '@/components/icons/FeatherIcons';

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

  const { getAdminSettings, updateAdminSettings } = context;
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminSettingsType>(DEFAULT_SETTINGS);
  const [initialData, setInitialData] = useState<AdminSettingsType>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('general');

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
