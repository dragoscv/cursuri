'use client'

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Button, Input, Divider, Textarea, Switch } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiSettings, FiBell, FiGlobe, FiSave } from '@/components/icons/FeatherIcons';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import ThemeSelector from '@/components/Profile/ThemeSelector';
import { ColorScheme, UserPreferences } from '@/types';
import { useToast } from '@/components/Toast';

export default function ProfileSettings() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    } const { user, userPreferences, saveUserPreferences } = context;

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
    const [message, setMessage] = useState<{ type: string, text: string }>({ type: '', text: '' });
    const { showToast } = useToast();

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
            }); showToast({
                type: 'success',
                title: 'Profile Updated',
                message: 'Profile information updated successfully!'
            });
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update profile information.'
            });
        } finally {
            setIsLoading(false);
        }
    }; const updateUserEmail = async () => {
        if (!user || !user.email) return;

        if (!form.currentPassword) {
            showToast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please enter your current password to update email.'
            });
            return;
        }

        setIsLoading(true);

        try {
            // Reauthenticate user first
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticateWithCredential(user, credential);            // Then update email
            await updateEmail(user, form.email);

            showToast({
                type: 'success',
                title: 'Email Updated',
                message: 'Email updated successfully!'
            });
            setForm(prev => ({ ...prev, currentPassword: '' }));
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update email.'
            });
        } finally {
            setIsLoading(false);
        }
    }; const changePassword = async () => {
        if (!user || !user.email) return;

        if (!form.currentPassword) {
            showToast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please enter your current password.'
            });
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            showToast({
                type: 'error',
                title: 'Validation Error',
                message: 'New passwords do not match.'
            });
            return;
        }

        if (form.newPassword.length < 6) {
            showToast({
                type: 'error',
                title: 'Validation Error',
                message: 'Password should be at least 6 characters.'
            });
            return;
        }

        setIsLoading(true);

        try {
            // Reauthenticate user first
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticateWithCredential(user, credential);            // Then update password
            await updatePassword(user, form.newPassword);

            showToast({
                type: 'success',
                title: 'Password Updated',
                message: 'Password updated successfully!'
            });
            setForm(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update password.'
            });
        } finally {
            setIsLoading(false);
        }
    }; const updateNotificationSettings = async () => {
        if (!user) return;

        setIsLoading(true);

        try {
            // Save notification preferences to Firestore
            await saveUserPreferences({
                emailNotifications: form.emailNotifications,
                courseUpdates: form.courseUpdates,
                marketingEmails: form.marketingEmails
            });

            showToast({
                type: 'success',
                title: 'Preferences Updated',
                message: 'Notification preferences updated successfully!'
            });
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update notification preferences.'
            });
        } finally {
            setIsLoading(false);
        }
    }; if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">Account Settings</h1>
                <p className="text-[color:var(--ai-muted)]">
                    Manage your profile and account preferences.
                </p>
            </div>            {/* Profile Information */}
            <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/80 to-[color:var(--ai-secondary)]/80"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20">
                            <FiUser className="text-[color:var(--ai-primary)]" />
                        </div>
                        Profile Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                        <div>
                        <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                            Display Name
                        </label>
                        <Input
                            name="displayName"
                            value={form.displayName}
                            onChange={handleChange}
                            placeholder="Your name"
                            startContent={<FiUser className="text-[color:var(--ai-primary)]" />}
                            className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-primary)]/70 hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
                        />
                    </div>

                        <div>
                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                Bio
                            </label>
                            <Textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself"
                                className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-primary)]/70 hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
                            />
                        </div>
                    </div>                    <div className="mt-6">
                        <Button
                            color="primary"
                            startContent={<FiSave />}
                            onClick={updateProfileDetails}
                            isLoading={isLoading}
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Save Profile
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Email Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)]/80 to-[color:var(--ai-primary)]/80"></div>
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-secondary)]/20 to-[color:var(--ai-primary)]/20">
                                <FiMail className="text-[color:var(--ai-secondary)]" />
                            </div>
                            Email Settings
                        </h2>                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    Email Address
                                </label>
                                <Input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    startContent={<FiMail className="text-[color:var(--ai-secondary)]" />}
                                    className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-secondary)]/70 hover:border-[color:var(--ai-secondary)]/40 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    Current Password
                                </label>
                                <Input
                                    type="password"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    startContent={<FiLock className="text-[color:var(--ai-secondary)]" />}
                                    className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-secondary)]/70 hover:border-[color:var(--ai-secondary)]/40 transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                color="primary"
                                startContent={<FiSave />}
                                onClick={updateUserEmail}
                                isLoading={isLoading}
                                className="bg-gradient-to-r from-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Update Email
                            </Button>
                        </div>                </CardBody>
                </Card>
            </motion.div>

            {/* Password Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-accent)]/80 to-[color:var(--ai-secondary)]/80"></div>
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-accent)]/20 to-[color:var(--ai-secondary)]/20">
                                <FiLock className="text-[color:var(--ai-accent)]" />
                            </div>
                            Password Settings
                        </h2>                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    Current Password
                                </label>
                                <Input
                                    type="password"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                                    className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    New Password
                                </label>
                                <Input
                                    type="password"
                                    name="newPassword" value={form.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                                    className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    Confirm Password
                                </label>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                                    className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                                />
                            </div>
                        </div>                        <div className="mt-6">
                            <Button
                                color="primary"
                                startContent={<FiSave />}
                                onClick={changePassword}
                                isLoading={isLoading}
                                className="bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Update Password
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-success)]/80 to-[color:var(--ai-primary)]/80"></div>
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-success)]/20 to-[color:var(--ai-primary)]/20">
                                <FiBell className="text-[color:var(--ai-success)]" />
                            </div>
                            Notification Preferences
                        </h2>                        <div className="space-y-6 py-2">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                                <div>
                                    <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">Email Notifications</h3>
                                    <p className="text-xs text-[color:var(--ai-muted)]">Receive important updates via email</p>
                                </div>
                                <Switch
                                    isSelected={form.emailNotifications}
                                    onChange={(e) => handleSwitchChange('emailNotifications', e.target.checked)}
                                    color="success"
                                    classNames={{
                                        base: "bg-[color:var(--ai-card-bg)]/70"
                                    }}
                                />
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                                <div>
                                    <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">Course Updates</h3>
                                    <p className="text-xs text-[color:var(--ai-muted)]">Get notified when courses you're enrolled in are updated</p>
                                </div>
                                <Switch
                                    isSelected={form.courseUpdates}
                                    onChange={(e) => handleSwitchChange('courseUpdates', e.target.checked)}
                                    color="success"
                                    classNames={{
                                        base: "bg-[color:var(--ai-card-bg)]/70"
                                    }}
                                />
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                                <div>
                                    <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">Marketing Emails</h3>
                                    <p className="text-xs text-[color:var(--ai-muted)]">Receive promotions and special offers</p>
                                </div>
                                <Switch
                                    isSelected={form.marketingEmails}
                                    onChange={(e) => handleSwitchChange('marketingEmails', e.target.checked)}
                                    color="success"
                                    classNames={{
                                        base: "bg-[color:var(--ai-card-bg)]/70"
                                    }}
                                />
                            </div>
                        </div>                        <div className="mt-6">
                            <Button
                                color="success"
                                startContent={<FiSave />}
                                onClick={updateNotificationSettings}
                                isLoading={isLoading}
                                className="bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-primary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Save Preferences
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Language Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/80 to-[color:var(--ai-accent)]/80"></div>
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-accent)]/20">
                                <FiGlobe className="text-[color:var(--ai-primary)]" />
                            </div>
                            Language Settings
                        </h2>                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                Preferred Language
                            </label>
                            <select
                                title="Language"
                                className="w-full px-4 py-3 border border-[color:var(--ai-card-border)]/50 rounded-lg shadow-sm 
                                focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/20 focus:border-[color:var(--ai-primary)]/70 
                                bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm text-[color:var(--ai-foreground)]
                                hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
                                value={form.language}
                                onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
                            >
                                <option value="en">English</option>
                                <option value="ro">Romanian</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>                        <div className="mt-6">
                            <Button
                                color="primary"
                                startContent={<FiSave />}
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        await saveUserPreferences({
                                            language: form.language
                                        });
                                        showToast({
                                            type: 'success',
                                            title: 'Language Updated',
                                            message: 'Language preferences saved successfully!'
                                        });
                                    } catch (error: any) {
                                        showToast({
                                            type: 'error',
                                            title: 'Update Failed',
                                            message: error.message || 'Failed to update language preferences.'
                                        });
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                isLoading={isLoading}
                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-accent)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Save Language
                            </Button>
                        </div>
                    </CardBody>                </Card>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
            >
                <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)]/80 to-[color:var(--ai-accent)]/80"></div>
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-6 text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-secondary)]/20 to-[color:var(--ai-accent)]/20">
                                <FiSettings className="text-[color:var(--ai-secondary)]" />
                            </div>
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
            </motion.div>
        </div>
    );
}