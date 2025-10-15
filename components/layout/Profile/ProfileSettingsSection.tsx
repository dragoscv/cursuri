import React from 'react';
import { Card, CardBody, Switch } from '@heroui/react';
import { FiSettings } from '@/components/icons/FeatherIcons';

interface ProfileSettingsSectionProps {
    isDark?: boolean;
    emailNotifications?: boolean;
    courseUpdates?: boolean;
    onToggleDark?: (value: boolean) => void;
    onToggleEmailNotifications?: (value: boolean) => void;
    onToggleCourseUpdates?: (value: boolean) => void;
}

export default function ProfileSettingsSection({ isDark = false, emailNotifications = true, courseUpdates = true, onToggleDark, onToggleEmailNotifications, onToggleCourseUpdates }: ProfileSettingsSectionProps) {
    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)] via-[color:var(--ai-primary)] to-[color:var(--ai-accent)]"></div>
            <CardBody className="p-6">
                <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-[color:var(--ai-secondary)]/10">
                        <FiSettings className="text-[color:var(--ai-secondary)]" />
                    </span>
                    Profile Settings
                </h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[color:var(--ai-foreground)]">Dark Mode</span>
                        <Switch isSelected={isDark} onValueChange={onToggleDark} color="primary" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[color:var(--ai-foreground)]">Email Notifications</span>
                        <Switch isSelected={emailNotifications} onValueChange={onToggleEmailNotifications} color="primary" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[color:var(--ai-foreground)]">Course Updates</span>
                        <Switch isSelected={courseUpdates} onValueChange={onToggleCourseUpdates} color="primary" />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
