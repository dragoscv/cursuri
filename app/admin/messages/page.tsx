'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { Card, CardBody, Chip, Spinner } from '@heroui/react';
import Button from '@/components/ui/Button';
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
        if (!confirm(t('confirmDelete'))) return;

        try {
            const messageRef = doc(firestoreDB, 'contactMessages', messageId);
            await deleteDoc(messageRef);
            showToast({
                type: 'success',
                message: t('messageDeleted'),
                duration: 3000,
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast({
                type: 'error',
                message: t('deleteFailed'),
                duration: 5000,
            });
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
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-2">
                    {t('title')}
                </h1>
                <p className="text-[color:var(--ai-muted)]">{t('description')}</p>
            </div>

            {/* Filters */}
            <Card className="mb-6 border border-[color:var(--ai-card-border)]">
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Status Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant={filterStatus === 'all' ? 'primary' : 'bordered'}
                                onClick={() => setFilterStatus('all')}
                            >
                                {t('filters.all')} ({statusCounts.all})
                            </Button>
                            <Button
                                size="sm"
                                variant={filterStatus === 'new' ? 'primary' : 'bordered'}
                                onClick={() => setFilterStatus('new')}
                            >
                                {t('filters.new')} ({statusCounts.new})
                            </Button>
                            <Button
                                size="sm"
                                variant={filterStatus === 'read' ? 'primary' : 'bordered'}
                                onClick={() => setFilterStatus('read')}
                            >
                                {t('filters.read')} ({statusCounts.read})
                            </Button>
                            <Button
                                size="sm"
                                variant={filterStatus === 'archived' ? 'primary' : 'bordered'}
                                onClick={() => setFilterStatus('archived')}
                            >
                                {t('filters.archived')} ({statusCounts.archived})
                            </Button>
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-auto">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 px-4 py-2 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] text-[color:var(--ai-foreground)]"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <Card className="border border-[color:var(--ai-card-border)]">
                    <CardBody className="p-8 text-center">
                        <FiMail className="mx-auto text-[color:var(--ai-muted)] mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                            {t('noMessages')}
                        </h3>
                        <p className="text-[color:var(--ai-muted)]">{t('noMessagesDescription')}</p>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map((message) => (
                        <Card
                            key={message.id}
                            className={`border ${message.status === 'new' ? 'border-[color:var(--ai-primary)]' : 'border-[color:var(--ai-card-border)]'} hover:shadow-lg transition-shadow`}
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
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            startContent={<FiTrash2 />}
                                            onClick={() => handleDelete(message.id)}
                                        >
                                            {t('actions.delete')}
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
