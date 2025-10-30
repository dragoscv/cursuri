'use client';

import React, { useContext, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody } from '@heroui/react';
import { Button, Input, Textarea, Switch } from '@/components/ui';
import ThemeSelector from '@/components/Profile/ThemeSelector';
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiBell,
  FiGlobe,
  FiSettings,
} from '@/components/icons/FeatherIcons';
import { motion } from 'framer-motion';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';
import { useTranslations } from 'next-intl';

export default function ProfileSettings() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const t = useTranslations('common.notifications');
  const tProfile = useTranslations('profile.settingsPage');
  const context = useContext(AppContext);
  if (!context) throw new Error('AppContext not found');
  const { user, saveUserPreferences } = context;
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    courseUpdates: true,
    marketingEmails: false,
    language: 'en',
  });
  const [isLoading, setIsLoading] = useState(false);
  const tLanguages = useTranslations('profile.settingsPage.languages');
  const showToast = ({
    type,
    title,
    message,
  }: {
    type: 'success' | 'error';
    title: string;
    message: string;
  }) => {
    // Replace with your preferred toast/notification system
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (window && (window as any).toast) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).toast[type](message, { title });
    } else {
      alert(`${title}: ${message}`);
    }
  };
  // Updated: handleChange supports checkbox and other input types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSwitchChange = (key: string, checked: boolean) => {
    setForm((prev) => ({ ...prev, [key]: checked }));
  };
  const changePassword = async () => {
    if (!user || !user.email) return;

    if (!form.currentPassword) {
      showToast({
        type: 'error',
        title: t('error.validationError'),
        message: t('error.enterCurrentPassword'),
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showToast({
        type: 'error',
        title: t('error.validationError'),
        message: t('error.passwordsDoNotMatch'),
      });
      return;
    }

    // Enhanced security: Use the password validation utility
    const { validatePassword } = await import('@/utils/security/passwordValidation');
    const validation = validatePassword(form.newPassword);

    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: tProfile('settingsPage.validation.passwordTooWeak'),
        message:
          validation.errors[0] ||
          tProfile('settingsPage.validation.passwordDoesNotMeetRequirements'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const authMod = await import('firebase/auth');
      const EmailAuthProvider = authMod.EmailAuthProvider;
      const reauthenticateWithCredential = authMod.reauthenticateWithCredential;
      const updatePassword = authMod.updatePassword;
      const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPassword);

      showToast({
        type: 'success',
        title: t('success.passwordUpdated.title'),
        message: t('success.passwordUpdated.message'),
      });
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' })); // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('error.updateFailed'),
        message: error.message || t('error.passwordUpdateFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  const updateNotificationSettings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await saveUserPreferences({
        emailNotifications: form.emailNotifications,
        courseUpdates: form.courseUpdates,
        marketingEmails: form.marketingEmails,
      });
      showToast({
        type: 'success',
        title: t('success.preferencesUpdated.title'),
        message: t('success.preferencesUpdated.message'),
      }); // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('error.updateFailed'),
        message: error.message || t('error.preferencesUpdateFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // --- JSX UI code starts here (copied from previous return) ---
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-2">
          {tProfile('accountSettings')}
        </h1>
        <p className="text-[color:var(--ai-muted)]">{tProfile('updateYourProfile')}</p>
      </div>{' '}
      {/* Profile Information */}
      <Card className="border border-[color:var(--ai-card-border)]/50 shadow-lg rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/80 to-[color:var(--ai-secondary)]/80"></div>
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20">
              <FiUser className="text-[color:var(--ai-primary)]" />
            </div>
            {tProfile('profile')}
          </h2>{' '}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                {tProfile('nameLabel')}
              </label>
              <Input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder={tProfile('namePlaceholder')}
                startContent={<FiUser className="text-[color:var(--ai-primary)]" />}
                className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-primary)]/70 hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                {tProfile('emailLabel')}
              </label>
              <Input
                name="email"
                value={form.email}
                disabled
                readOnly
                startContent={<FiMail className="text-[color:var(--ai-primary)]" />}
                className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 text-[color:var(--ai-foreground)]/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                {tProfile('bioLabel')}
              </label>
              <Textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder={tProfile('bioPlaceholder')}
                className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-primary)]/70 hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button
              color="primary"
              startContent={<FiSave />}
              onClick={async () => {
                setIsLoading(true);
                try {
                  // Save displayName and bio to Firestore (user profile)
                  // This assumes a users collection with user.uid as doc id
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { firestoreDB } = await import('@/utils/firebase/firebase.config');
                  if (!user?.uid) throw new Error('User not found');
                  const userRef = doc(firestoreDB, 'users', user.uid);
                  await updateDoc(userRef, {
                    displayName: form.displayName,
                    bio: form.bio,
                  });
                  showToast({
                    type: 'success',
                    title: t('success.profileUpdated.title'),
                    message: t('success.profileUpdated.message'),
                  });
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                  showToast({
                    type: 'error',
                    title: t('error.updateFailed'),
                    message: error.message || t('error.updateFailed'),
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              isLoading={isLoading}
              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {tProfile('saveChanges')}
            </Button>
          </div>{' '}
        </CardBody>
      </Card>
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
              {tProfile('security')}
            </h2>{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {tProfile('currentPasswordLabel')}
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder={tProfile('currentPasswordPlaceholder')}
                  startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                  className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {tProfile('newPasswordLabel')}
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder={tProfile('newPasswordPlaceholder')}
                  startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                  className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                />

                {/* Add password strength meter */}
                {form.newPassword && (
                  <div className="mt-2">
                    <PasswordStrengthMeter
                      password={form.newPassword}
                      showRequirements={false}
                      maxErrorsShown={1}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                  {tProfile('confirmPasswordLabel')}
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={tProfile('confirmPasswordPlaceholder')}
                  startContent={<FiLock className="text-[color:var(--ai-accent)]" />}
                  className="w-full rounded-lg bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm border-[color:var(--ai-card-border)]/50 focus:border-[color:var(--ai-accent)]/70 hover:border-[color:var(--ai-accent)]/40 transition-all duration-300"
                />
              </div>
            </div>{' '}
            <div className="mt-6">
              <Button
                color="primary"
                startContent={<FiSave />}
                onClick={changePassword}
                isLoading={isLoading}
                className="bg-gradient-to-r from-[color:var(--ai-accent)] to-[color:var(--ai-secondary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {tProfile('updatePassword')}
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
              {tProfile('notificationSettings')}
            </h2>{' '}
            <div className="space-y-6 py-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">
                    {tProfile('emailLabel')}
                  </h3>
                  <p className="text-xs text-[color:var(--ai-muted)]">
                    {tProfile('settingsPage.notificationDescriptions.courseUpdates')}
                  </p>
                </div>
                <Switch
                  isSelected={form.emailNotifications}
                  onValueChange={(checked: boolean) =>
                    handleSwitchChange('emailNotifications', checked)
                  }
                  color="success"
                  classNames={{
                    base: 'bg-[color:var(--ai-card-bg)]/70',
                  }}
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">
                    {tProfile('courseUpdates')}
                  </h3>
                  <p className="text-xs text-[color:var(--ai-muted)]">
                    {tProfile('settingsPage.notificationDescriptions.courseUpdates')}
                  </p>
                </div>
                <Switch
                  isSelected={form.courseUpdates}
                  onValueChange={(checked: boolean) => handleSwitchChange('courseUpdates', checked)}
                  color="success"
                  classNames={{
                    base: 'bg-[color:var(--ai-card-bg)]/70',
                  }}
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-300 border border-[color:var(--ai-card-border)]/30">
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">
                    {tProfile('marketingEmails')}
                  </h3>
                  <p className="text-xs text-[color:var(--ai-muted)]">
                    {tProfile('settingsPage.notificationDescriptions.marketingEmails')}
                  </p>
                </div>
                <Switch
                  isSelected={form.marketingEmails}
                  onValueChange={(checked: boolean) =>
                    handleSwitchChange('marketingEmails', checked)
                  }
                  color="success"
                  classNames={{
                    base: 'bg-[color:var(--ai-card-bg)]/70',
                  }}
                />
              </div>
            </div>{' '}
            <div className="mt-6">
              <Button
                color="success"
                startContent={<FiSave />}
                onClick={updateNotificationSettings}
                isLoading={isLoading}
                className="bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-primary)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {tProfile('saveChanges')}
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
              {tProfile('language')}
            </h2>{' '}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                {tProfile('languagePreference')}
              </label>
              <select
                title={tProfile('selectLanguage')}
                className="w-full px-4 py-3 border border-[color:var(--ai-card-border)]/50 rounded-lg shadow-sm 
                                focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/20 focus:border-[color:var(--ai-primary)]/70 
                                bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm text-[color:var(--ai-foreground)]
                                hover:border-[color:var(--ai-primary)]/40 transition-all duration-300"
                value={form.language}
                onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">{tProfile('english')}</option>
                <option value="ro">{tProfile('romanian')}</option>
                <option value="es">{tLanguages('spanish')}</option>
                <option value="fr">{tLanguages('french')}</option>
                <option value="de">{tLanguages('german')}</option>
              </select>
            </div>{' '}
            <div className="mt-6">
              <Button
                color="primary"
                startContent={<FiSave />}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await saveUserPreferences({
                      language: form.language,
                    });
                    showToast({
                      type: 'success',
                      title: t('success.languageUpdated.title'),
                      message: t('success.languageUpdated.message'),
                    });
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } catch (error: any) {
                    showToast({
                      type: 'error',
                      title: t('error.updateFailed'),
                      message: error.message || t('error.updateFailed'),
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-accent)] border-none text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {tProfile('saveChanges')}
              </Button>
            </div>
          </CardBody>{' '}
        </Card>
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
              {tProfile('appearance')}
            </h2>{' '}
            <ThemeSelector
              onThemeChange={(theme: string) => {
                setMessage({
                  type: 'success',
                  text: `Theme changed to ${theme.replace('-', ' ')}!`,
                });
              }}
            />
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
