'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, SelectItem, Spinner } from '@heroui/react';
import { Button, Input, Switch, Select, Textarea } from '@/components/ui';
import { AppContext } from '@/components/AppContext';
import { AdminSettings as AdminSettingsType } from '@/types';

const AdminSettings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminSettings must be used within an AppProvider");
    }

    const { getAdminSettings, updateAdminSettings } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AdminSettingsType>({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        allowRegistration: true,
        allowSocialLogin: true,
        paymentProcessorEnabled: true,
        taxRate: 0,
        currencyCode: 'RON'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                if (getAdminSettings) {
                    const settings = await getAdminSettings();
                    if (settings) {
                        setFormData(settings);
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setError('Failed to load settings data');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [getAdminSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberValue = parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: isNaN(numberValue) ? 0 : numberValue }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (e: React.FormEvent | any) => {
        e.preventDefault();

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
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError('Failed to save settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            setError('An error occurred while saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Platform Settings</h1>                <Button
                    color="primary"
                    isLoading={saving}
                    isDisabled={saving}
                    onPress={handleSubmit}
                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                >
                    Save Settings
                </Button>
            </div>

            {success && (
                <div className="bg-[color:var(--ai-success)]/10 border border-[color:var(--ai-success)]/30 text-[color:var(--ai-success)] p-4 rounded-lg">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Settings saved successfully</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-[color:var(--ai-danger)]/10 border border-[color:var(--ai-danger)]/30 text-[color:var(--ai-danger)] rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Settings */}
                <Card className="shadow-md">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">General Settings</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                                    Site Name
                                </label>
                                <Input
                                    name="siteName"
                                    value={formData.siteName}
                                    onChange={handleChange}
                                    placeholder="Enter site name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                                    Site Description
                                </label>
                                <Textarea
                                    name="siteDescription"
                                    value={formData.siteDescription}
                                    onChange={handleChange}
                                    placeholder="Enter site description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                                    Contact Email
                                </label>
                                <Input
                                    name="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    placeholder="Enter contact email"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* User Registration Settings */}
                <Card className="shadow-md">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Authentication Settings</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-[color:var(--ai-foreground)]">Allow User Registration</h3>
                                    <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                        When disabled, new users cannot register
                                    </p>
                                </div>                                <Switch
                                    isSelected={formData.allowRegistration}
                                    onValueChange={(checked) => handleSwitchChange('allowRegistration', checked)}
                                    aria-label="Allow User Registration"
                                    color="primary"
                                />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-[color:var(--ai-foreground)]">Allow Social Login</h3>
                                    <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                        When enabled, users can sign in with Google and other providers
                                    </p>
                                </div>
                                <Switch
                                    isSelected={formData.allowSocialLogin}
                                    onValueChange={(checked) => handleSwitchChange('allowSocialLogin', checked)}
                                    aria-label="Allow Social Login"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Payment Settings */}
                <Card className="shadow-md">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Payment Settings</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-[color:var(--ai-foreground)]">Payment Processing</h3>
                                    <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                        When disabled, users cannot make purchases
                                    </p>
                                </div>
                                <Switch
                                    isSelected={formData.paymentProcessorEnabled}
                                    onValueChange={(checked) => handleSwitchChange('paymentProcessorEnabled', checked)}
                                    aria-label="Enable Payment Processing"
                                />
                            </div>

                            <Divider />

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                                    Currency
                                </label>                                <Select
                                    value={formData.currencyCode}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('currencyCode', e.target.value)}
                                    className="max-w-xs"
                                >                                    {/* @ts-expect-error - The SelectItem component from @heroui/react has type conflicts with value prop */}
                                    <SelectItem key="RON" value="RON">Romanian Leu (RON)</SelectItem>
                                    {/* @ts-expect-error - The SelectItem component from @heroui/react has type conflicts with value prop */}
                                    <SelectItem key="USD" value="USD">US Dollar (USD)</SelectItem>
                                    {/* @ts-expect-error - The SelectItem component from @heroui/react has type conflicts with value prop */}
                                    <SelectItem key="EUR" value="EUR">Euro (EUR)</SelectItem>
                                    {/* @ts-expect-error - The SelectItem component from @heroui/react has type conflicts with value prop */}
                                    <SelectItem key="GBP" value="GBP">British Pound (GBP)</SelectItem>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                                    Tax Rate (%)
                                </label>
                                <Input
                                    name="taxRate"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={formData.taxRate.toString()}
                                    onChange={handleNumberChange}
                                    className="max-w-xs"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </form>
        </div>
    );
};

export default AdminSettings;



