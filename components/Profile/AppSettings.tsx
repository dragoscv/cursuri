'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip } from '@heroui/react';
import { Button, Switch } from '@/components/ui';
import { AppContext } from '@/components/AppContext';
import { useTranslations } from 'next-intl';

interface NotificationSettings {
    emailNotifications: boolean;
    courseUpdates: boolean;
    marketingEmails: boolean;
    newLessonAlerts: boolean;
    commentReplies: boolean;
    certificateIssued: boolean;
    paymentReceipts: boolean;
    weeklyDigest: boolean;
}

interface PrivacySettings {
    showProfile: boolean;
    showProgressToPublic: boolean;
    showAchievements: boolean;
    shareActivityFeed: boolean;
}

interface AppSettingsProps {
    userId?: string;
}

const AppSettings: React.FC<AppSettingsProps> = ({ userId }) => {
    const t = useTranslations('profile.appSettings');
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppSettings must be used within an AppProvider");
    }

    const { user, userPreferences, saveUserPreferences } = context;
    const [loading, setLoading] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        courseUpdates: true,
        marketingEmails: false,
        newLessonAlerts: true,
        commentReplies: true,
        certificateIssued: true,
        paymentReceipts: true,
        weeklyDigest: false,
    });
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        showProfile: true,
        showProgressToPublic: false,
        showAchievements: true,
        shareActivityFeed: false,
    });
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize notification settings from user preferences
        if (userPreferences) {
            setNotifications({
                emailNotifications: userPreferences.emailNotifications,
                courseUpdates: userPreferences.courseUpdates,
                marketingEmails: userPreferences.marketingEmails ?? false,
                newLessonAlerts: userPreferences.emailNotifications,
                commentReplies: userPreferences.emailNotifications,
                certificateIssued: userPreferences.emailNotifications,
                paymentReceipts: true, // Always keep payment receipts on
                weeklyDigest: userPreferences.courseUpdates
            });

            // Initialize privacy settings (these would be stored in userPreferences in a real implementation)
            setPrivacySettings({
                showProfile: true,
                showProgressToPublic: false,
                showAchievements: true,
                shareActivityFeed: false
            });
        }
    }, [userPreferences]);

    const handleNotificationChange = (key: keyof NotificationSettings, checked: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: checked }));
    };

    const handlePrivacyChange = (key: keyof PrivacySettings, checked: boolean) => {
        setPrivacySettings(prev => ({ ...prev, [key]: checked }));
    };

    const saveSettings = async () => {
        if (!user) return;

        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            const result = await saveUserPreferences({
                emailNotifications: notifications.emailNotifications,
                courseUpdates: notifications.courseUpdates,
                marketingEmails: notifications.marketingEmails,
            });

            if (result) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('An error occurred while saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('title')}</h1>

                <Button
                    color="primary"
                    isLoading={loading}
                    isDisabled={loading}
                    onPress={saveSettings}
                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                >
                    {t('saveSettings')}
                </Button>
            </div>

            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg animate-fadeIn">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t('settingsSaved')}</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg animate-fadeIn">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Notification Settings */}
            <Card className="shadow-md overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold">{t('notificationSettings')}</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('emailNotifications')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('emailNotificationsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.emailNotifications}
                                onValueChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                                color="primary"
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('courseUpdates')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('courseUpdatesDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.courseUpdates}
                                onValueChange={(checked) => handleNotificationChange('courseUpdates', checked)}
                                color="primary"
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('newLessonAlerts')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('newLessonAlertsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.newLessonAlerts}
                                onValueChange={(checked) => handleNotificationChange('newLessonAlerts', checked)}
                                color="primary"
                                isDisabled={!notifications.emailNotifications}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('commentReplies')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('commentRepliesDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.commentReplies}
                                onValueChange={(checked) => handleNotificationChange('commentReplies', checked)}
                                color="primary"
                                isDisabled={!notifications.emailNotifications}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('certificateNotifications')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('certificateNotificationsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.certificateIssued}
                                onValueChange={(checked) => handleNotificationChange('certificateIssued', checked)}
                                color="primary"
                                isDisabled={!notifications.emailNotifications}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('paymentReceipts')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('paymentReceiptsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.paymentReceipts}
                                onValueChange={(checked) => handleNotificationChange('paymentReceipts', checked)}
                                color="primary"
                                isDisabled={true} // Always keep payment receipts on
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('weeklyDigest')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('weeklyDigestDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.weeklyDigest}
                                onValueChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                                color="primary"
                                isDisabled={!notifications.courseUpdates}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('marketingEmails')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('marketingEmailsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications.marketingEmails}
                                onValueChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                                color="primary"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Privacy Settings */}
            <Card className="shadow-md overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-semibold">{t('privacySettings')}</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('publicProfile')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('publicProfileDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={privacySettings.showProfile}
                                onValueChange={(checked) => handlePrivacyChange('showProfile', checked)}
                                color="primary"
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('publicProgress')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('publicProgressDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={privacySettings.showProgressToPublic}
                                onValueChange={(checked) => handlePrivacyChange('showProgressToPublic', checked)}
                                color="primary"
                                isDisabled={!privacySettings.showProfile}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('showAchievements')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('showAchievementsDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={privacySettings.showAchievements}
                                onValueChange={(checked) => handlePrivacyChange('showAchievements', checked)}
                                color="primary"
                                isDisabled={!privacySettings.showProfile}
                            />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">{t('activityFeed')}</h3>
                                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                    {t('activityFeedDesc')}
                                </p>
                            </div>
                            <Switch
                                isSelected={privacySettings.shareActivityFeed}
                                onValueChange={(checked) => handlePrivacyChange('shareActivityFeed', checked)}
                                color="primary"
                                isDisabled={!privacySettings.showProfile}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Data Management */}
            <Card className="shadow-md overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold">{t('dataManagement')}</h2>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                            {t('exportDataDesc')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                color="primary"
                                variant="flat"
                                className="w-full font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                {t('downloadMyData')}
                            </Button>

                            <Button
                                color="danger"
                                variant="flat"
                                className="w-full font-medium text-red-600 bg-red-100/50 hover:bg-red-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {t('deleteMyAccount')}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] p-4 rounded-lg border border-[color:var(--ai-card-border)] dark:border-[color:var(--ai-card-border)]">
                <h3 className="text-sm font-medium text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-2">{t('aboutYourData')}</h3>
                <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                    {t('privacyPolicyNote')} <a href="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
                    You can request a copy of your data or delete your account at any time.
                </p>
            </div>
        </div>
    );
};

export default AppSettings;
