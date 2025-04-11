'use client'

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Button, Input, Divider, Textarea, Switch } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiSettings, FiBell, FiGlobe, FiSave } from '@/components/icons/FeatherIcons';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import ThemeSelector from '@/components/Profile/ThemeSelector';
import { ColorScheme, UserPreferences } from '@/types';

export default function ProfileSettings() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, userPreferences, saveUserPreferences } = context;

    const [form, setForm] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        bio: userPreferences?.bio || '',
        language: userPreferences?.language || 'en',
        emailNotifications: userPreferences?.emailNotifications || true,
        courseUpdates: userPreferences?.courseUpdates || true,
        marketingEmails: userPreferences?.marketingEmails || false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load user preferences when available
    useEffect(() => {
        if (userPreferences) {
            setForm(prev => ({
                ...prev,
                bio: userPreferences.bio || prev.bio,
                language: userPreferences.language || prev.language,
                emailNotifications: userPreferences.emailNotifications || prev.emailNotifications,
                courseUpdates: userPreferences.courseUpdates || prev.courseUpdates,
                marketingEmails: userPreferences.marketingEmails || prev.marketingEmails
            }));
        }
    }, [userPreferences]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setForm(prev => ({ ...prev, [name]: checked }));
    };

    const updateProfileDetails = async () => {
        if (!user) return;

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: form.displayName,
            });

            // Save bio to Firestore preferences
            await saveUserPreferences({
                bio: form.bio
            });

            setMessage({
                type: 'success',
                text: 'Profile information updated successfully!'
            });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update profile information.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserEmail = async () => {
        if (!user || !user.email) return;

        if (!form.currentPassword) {
            setMessage({
                type: 'error',
                text: 'Please enter your current password to update email.'
            });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Reauthenticate user first
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Then update email
            await updateEmail(user, form.email);

            setMessage({
                type: 'success',
                text: 'Email updated successfully!'
            });
            setForm(prev => ({ ...prev, currentPassword: '' }));
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update email.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async () => {
        if (!user || !user.email) return;

        if (!form.currentPassword) {
            setMessage({
                type: 'error',
                text: 'Please enter your current password.'
            });
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setMessage({
                type: 'error',
                text: 'New passwords do not match.'
            });
            return;
        }

        if (form.newPassword.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password should be at least 6 characters.'
            });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Reauthenticate user first
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Then update password
            await updatePassword(user, form.newPassword);

            setMessage({
                type: 'success',
                text: 'Password updated successfully!'
            });
            setForm(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update password.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateNotificationSettings = async () => {
        if (!user) return;

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Save notification preferences to Firestore
            await saveUserPreferences({
                emailNotifications: form.emailNotifications,
                courseUpdates: form.courseUpdates,
                marketingEmails: form.marketingEmails
            });

            setMessage({
                type: 'success',
                text: 'Notification preferences updated successfully!'
            });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update notification preferences.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">            <div className="mb-6">
            <h1 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">Account Settings</h1>
            <p className="text-[color:var(--ai-muted)]">
                Manage your profile and account preferences.
            </p>
        </div>

            {/* Success/Error message */}
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Profile Information */}
            <Card className="border border-[color:var(--ai-card-border)] shadow-sm">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <FiUser className="text-[color:var(--ai-primary)]" />
                        Profile Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-1">
                            Display Name
                        </label>
                            <Input
                                name="displayName"
                                value={form.displayName}
                                onChange={handleChange}
                                placeholder="Your name"
                                startContent={<FiUser className="text-gray-400" />}
                                className="w-full"
                            />
                        </div>

                        <div>                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-1">
                            Bio
                        </label>
                            <Textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={updateProfileDetails}
                            isLoading={isLoading}
                        >
                            Save Profile
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Email Settings */}
            <Card className="border border-[color:var(--ai-card-border)] shadow-sm">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <FiMail className="text-[color:var(--ai-primary)]" />
                        Email Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <Input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                startContent={<FiMail className="text-gray-400" />}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={updateUserEmail}
                            isLoading={isLoading}
                        >
                            Update Email
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Password Settings */}
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <FiLock className="text-indigo-500" />
                        Password Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={changePassword}
                            isLoading={isLoading}
                        >
                            Update Password
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Notification Preferences */}
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <FiBell className="text-indigo-500" />
                        Notification Preferences
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive important updates via email</p>
                            </div>
                            <Switch
                                isSelected={form.emailNotifications}
                                onChange={(e) => handleSwitchChange('emailNotifications', e.target.checked)}
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Updates</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when courses you're enrolled in are updated</p>
                            </div>
                            <Switch
                                isSelected={form.courseUpdates}
                                onChange={(e) => handleSwitchChange('courseUpdates', e.target.checked)}
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Emails</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive promotions and special offers</p>
                            </div>
                            <Switch
                                isSelected={form.marketingEmails}
                                onChange={(e) => handleSwitchChange('marketingEmails', e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={updateNotificationSettings}
                        >
                            Save Preferences
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Language Settings */}
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <FiGlobe className="text-indigo-500" />
                        Language Settings
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Preferred Language
                        </label>
                        <select
                            title="Language"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={form.language}
                            onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
                        >
                            <option value="en">English</option>
                            <option value="ro">Romanian</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>

                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    await saveUserPreferences({
                                        language: form.language
                                    });
                                    setMessage({
                                        type: 'success',
                                        text: 'Language preferences saved!'
                                    });
                                } catch (error: any) {
                                    setMessage({
                                        type: 'error',
                                        text: error.message || 'Failed to update language preferences.'
                                    });
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            isLoading={isLoading}
                        >
                            Save Language
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Appearance Settings */}
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardBody>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <FiSettings className="text-indigo-500" />
                        Appearance Settings
                    </h2>

                    <ThemeSelector
                        onThemeChange={(theme) => {
                            setMessage({
                                type: 'success',
                                text: `Theme changed to ${theme.replace('-', ' ')}!`
                            });
                        }}
                    />
                </CardBody>
            </Card>
        </div>
    );
}