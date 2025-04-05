'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem, Spinner, Switch, Textarea } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { AdminSettings as AdminSettingsType } from '@/types';

const AdminSettings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminSettings must be used within an AppProvider");
    }

    const { adminSettings, getAdminSettings, updateAdminSettings } = context;
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

    const handleSubmit = async (e: React.FormEvent) => {
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
                <h1 className="text-3xl font-bold">Platform Settings</h1>
                <Button
                    color="primary"
                    isLoading={saving}
                    isDisabled={saving}
                    onPress={handleSubmit}
                >
                    Save Settings
                </Button>
            </div>

            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Settings saved successfully</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Allow User Registration</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        When disabled, new users cannot register
                                    </p>
                                </div>
                                <Switch
                                    isSelected={formData.allowRegistration}
                                    onValueChange={(checked) => handleSwitchChange('allowRegistration', checked)}
                                    aria-label="Allow User Registration"
                                />
                            </div>

                            <Divider />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Allow Social Login</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Payment Processing</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Currency
                                </label>
                                <Select
                                    value={formData.currencyCode}
                                    onChange={(e) => handleSelectChange('currencyCode', e.target.value)}
                                    className="max-w-xs"
                                >
                                    <SelectItem key="RON" value="RON">Romanian Leu (RON)</SelectItem>
                                    <SelectItem key="USD" value="USD">US Dollar (USD)</SelectItem>
                                    <SelectItem key="EUR" value="EUR">Euro (EUR)</SelectItem>
                                    <SelectItem key="GBP" value="GBP">British Pound (GBP)</SelectItem>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tax Rate (%)
                                </label>
                                <Input
                                    name="taxRate"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={formData.taxRate}
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