'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { Card, CardBody, Chip, Spinner, Select, SelectItem } from '@heroui/react';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    where,
    Timestamp
} from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { ContactMessage } from '@/types';
import { FiMail, FiTrash2, FiFilter, FiUser, FiClock, FiCheck, FiX } from '@/components/icons/FeatherIcons';
import { useRouter } from 'next/navigation';
import { PageHeader, DataToolbar, ConfirmDialog, EmptyState, StatCard } from '@/components/Admin/shell';

export default function AdminMessagesPage() {
    const t = useTranslations('admin.messages');
    const tCommon = useTranslations('common');
    const context = useContext(AppContext);
    const { showToast } = useToast();
    const router = useRouter();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'archived'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!context?.user || !context?.isAdmin) {
            router.push('/');
            return;
        }

        // Subscribe to messages in real-time
        const messagesRef = collection(firestoreDB, 'contactMessages');
        let q = query(messagesRef, orderBy('timestamp', 'desc'));

        // Apply status filter
        if (filterStatus !== 'all') {
            q = query(messagesRef, where('status', '==', filterStatus), orderBy('timestamp', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData: ContactMessage[] = [];
            snapshot.forEach((doc) => {
                messagesData.push({
                    id: doc.id,
                    ...doc.data(),
                } as ContactMessage);
            });
            setMessages(messagesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching messages:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [context?.user, context?.isAdmin, router, filterStatus]);

    const handleStatusChange = async (messageId: string, newStatus: 'new' | 'read' | 'archived') => {
        try {
            const messageRef = doc(firestoreDB, 'contactMessages', messageId);
            await updateDoc(messageRef, {
                status: newStatus,
                updatedAt: Timestamp.now(),
            });
            showToast({
                type: 'success',
                message: t('statusUpdated'),
                duration: 3000,
            });
        } catch (error) {
            console.error('Error updating message status:', error);
            showToast({
                type: 'error',
                message: t('statusUpdateFailed'),
                duration: 5000,
            });
        }
    };

    const handleDelete = async (messageId: string) => {
        setDeleting(true);
        try {
            const messageRef = doc(firestoreDB, 'contactMessages', messageId);
            await deleteDoc(messageRef);
            showToast({
                type: 'success',
                message: t('messageDeleted'),
                duration: 3000,
            });
            setPendingDelete(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast({
                type: 'error',
                message: t('deleteFailed'),
                duration: 5000,
            });
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';

        try {
            let date: Date;
            if (timestamp instanceof Timestamp) {
                date = timestamp.toDate();
            } else if (timestamp.toDate) {
                date = timestamp.toDate();
            } else if (timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else {
                date = new Date(timestamp);
            }

            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const filteredMessages = messages.filter(message => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            message.name.toLowerCase().includes(search) ||
            message.email.toLowerCase().includes(search) ||
            message.subject.toLowerCase().includes(search) ||
            message.message.toLowerCase().includes(search)
        );
    });

    const statusCounts = {
        all: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        read: messages.filter(m => m.status === 'read').length,
        archived: messages.filter(m => m.status === 'archived').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader
                eyebrow="Inbox"
                title={t('title')}
                description={t('description')}
                icon={<FiMail size={20} />}
                tone="primary"
            />

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label={t('filters.all')} value={statusCounts.all} icon={<FiMail size={16} />} />
                <StatCard label={t('filters.new')} value={statusCounts.new} tone="primary" />
                <StatCard label={t('filters.read')} value={statusCounts.read} tone="success" />
                <StatCard label={t('filters.archived')} value={statusCounts.archived} tone="warning" />
            </div>

            {/* Filters */}
            <DataToolbar
                search={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder={t('searchPlaceholder')}
                filters={
                    <Select
                        aria-label="Filter by status"
                        size="sm"
                        variant="flat"
                        className="min-w-[160px]"
                        selectedKeys={[filterStatus]}
                        onSelectionChange={(keys) =>
                            setFilterStatus(Array.from(keys)[0] as 'all' | 'new' | 'read' | 'archived')
                        }
                    >
                        <SelectItem key="all">{t('filters.all')}</SelectItem>
                        <SelectItem key="new">{t('filters.new')}</SelectItem>
                        <SelectItem key="read">{t('filters.read')}</SelectItem>
                        <SelectItem key="archived">{t('filters.archived')}</SelectItem>
                    </Select>
                }
            />

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <EmptyState
                    icon={<FiMail size={20} />}
                    title={t('noMessages')}
                    description={t('noMessagesDescription')}
                />
            ) : (
                <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
                    }}
                >
                    <AnimatePresence initial={false}>
                        {filteredMessages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 12 },
                                    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 240, damping: 24 } },
                                }}
                                exit={{ opacity: 0, scale: 0.97 }}
                            >
                                <Card
                                    className={`border ${message.status === 'new' ? 'border-[color:var(--ai-primary)]/60 ring-1 ring-[color:var(--ai-primary)]/20' : 'border-[color:var(--ai-card-border)]'} bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm hover:shadow-lg transition-shadow`}
                                >
                                    <CardBody className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center">
                                                    <FiUser className="text-white" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-[color:var(--ai-foreground)]">
                                                        {message.name}
                                                    </h3>
                                                    <p className="text-sm text-[color:var(--ai-muted)]">{message.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {message.status === 'new' && (
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        {t('status.new')}
                                                    </Chip>
                                                )}
                                                {message.status === 'read' && (
                                                    <Chip size="sm" color="success" variant="flat">
                                                        {t('status.read')}
                                                    </Chip>
                                                )}
                                                {message.status === 'archived' && (
                                                    <Chip size="sm" color="default" variant="flat">
                                                        {t('status.archived')}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-[color:var(--ai-muted)]">
                                                {t('subject')}:
                                            </span>
                                            <span className="ml-2 text-[color:var(--ai-foreground)] font-semibold">
                                                {message.subject}
                                            </span>
                                        </div>

                                        {/* Message */}
                                        <div className="mb-4 p-4 bg-[color:var(--ai-background)] rounded-lg border border-[color:var(--ai-card-border)]">
                                            <p className="text-[color:var(--ai-foreground)] whitespace-pre-wrap">
                                                {message.message}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-[color:var(--ai-card-border)]">
                                            <div className="flex items-center gap-2 text-sm text-[color:var(--ai-muted)]">
                                                <FiClock size={14} />
                                                {formatDate(message.timestamp)}
                                            </div>

                                            <div className="flex gap-2">
                                                {message.status === 'new' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="success"
                                                        startContent={<FiCheck />}
                                                        onClick={() => handleStatusChange(message.id, 'read')}
                                                    >
                                                        {t('actions.markRead')}
                                                    </Button>
                                                )}
                                                {message.status === 'read' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="default"
                                                        startContent={<FiMail />}
                                                        onClick={() => handleStatusChange(message.id, 'new')}
                                                    >
                                                        {t('actions.markUnread')}
                                                    </Button>
                                                )}
                                                {message.status === 'read' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="warning"
                                                        startContent={<FiX />}
                                                        onClick={() => handleStatusChange(message.id, 'archived')}
                                                    >
                                                        {t('actions.archive')}
                                                    </Button>
                                                )}
                                                {message.status === 'archived' && (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<FiCheck />}
                                                        onClick={() => handleStatusChange(message.id, 'read')}
                                                    >
                                                        {t('actions.unarchive')}
                                                    </Button>
                                                )}
                                                <a
                                                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                                                    className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                                                >
                                                    <FiMail size={14} />
                                                    Reply
                                                </a>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="danger"
                                                    startContent={<FiTrash2 />}
                                                    onClick={() => setPendingDelete(message)}
                                                >
                                                    {t('actions.delete')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <ConfirmDialog
                isOpen={pendingDelete !== null}
                onClose={() => (deleting ? null : setPendingDelete(null))}
                onConfirm={async () => {
                    if (pendingDelete?.id) {
                        await handleDelete(pendingDelete.id);
                    }
                }}
                loading={deleting}
                tone="danger"
                icon={<FiTrash2 size={18} />}
                title={t('confirmDelete')}
                description={pendingDelete ? `${pendingDelete.subject} — ${pendingDelete.email}` : ''}
                confirmLabel={t('actions.delete')}
            />
        </div>
    );
}
