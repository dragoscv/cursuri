'use client'

import React, { useContext, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Tabs, Tab } from '@heroui/react';
import { motion } from 'framer-motion';
import AppSettings from '@/components/Profile/AppSettings';

export default function ProfileSettings() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user } = context;
    const [selectedTab, setSelectedTab] = useState<string>("account");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full"
        >
            <Card className="border border-[color:var(--ai-card-border)]">
                <CardBody className="p-0">
                    <Tabs
                        aria-label="Settings options"
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        variant="underlined"
                        classNames={{
                            tabList: "px-6 pt-4",
                            cursor: "bg-[color:var(--ai-primary)]",
                            tab: "text-[color:var(--ai-foreground)] data-[selected=true]:text-[color:var(--ai-primary)] py-4 px-4"
                        }}
                    >
                        <Tab key="account" title="Account Settings" />
                        <Tab key="notifications" title="Notifications & Privacy" />
                    </Tabs>

                    <div className="px-6 py-6">
                        {selectedTab === "account" && (
                            <div className="animate-fade-in-up">
                                <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                                <p className="text-[color:var(--ai-muted)] mb-6">
                                    Manage your account settings and password. Your information is always kept private.
                                </p>
                                <div className="text-center py-8">
                                    <p>The account settings form is in the original settings page. This is a placeholder for demonstration purposes.</p>
                                </div>
                            </div>
                        )}

                        {selectedTab === "notifications" && (
                            <AppSettings userId={user?.uid} />
                        )}
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
