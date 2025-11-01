'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import Button from '@/components/ui/Button';
import EmptyState from '../../../components/Profile/EmptyState';
import { motion } from 'framer-motion';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  downloadedAt: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('profile');
  const tFilters = useTranslations('profile.certificatesPage.filters');
  const { showToast } = useToast();

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }
  const { user } = context;

  useEffect(() => {
    async function fetchCertificates() {
      if (!user) return;

      try {
        const certificatesQuery = query(
          collection(firestoreDB, `users/${user.uid}/certificates`),
          orderBy('downloadedAt', 'desc')
        );

        const querySnapshot = await getDocs(certificatesQuery);
        const certificatesData: Certificate[] = [];

        querySnapshot.forEach((doc) => {
          certificatesData.push({
            id: doc.id,
            ...doc.data(),
          } as Certificate);
        });

        setCertificates(certificatesData);
        setAllCertificates(certificatesData);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, [user]);

  const downloadCertificate = async (certificateId: string, courseId: string) => {
    try {
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) throw new Error(t('certificatesPage.errors.failedToGenerate'));

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Download Error',
        message: t('certificatesPage.errors.couldNotDownload'),
        duration: 5000,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <EmptyState
        title={t('certificatesPage.emptyState.title')}
        description={t('certificatesPage.emptyState.description')}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>
        }
        actionText={t('certificatesPage.actions.browseCourses')}
        actionHref="/courses"
      />
    );
  }

  return (
    <div className="space-y-6">
      {' '}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('certificatesPage.yourCertificates')}</h2>

        <div className="flex items-center space-x-2">
          <select
            className="px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                setCertificates(allCertificates);
              } else {
                setCertificates(
                  allCertificates.filter((cert: Certificate) => {
                    // Filter by date - last 30 days, last 3 months, last year
                    const certDate = new Date(cert.completionDate);
                    const now = new Date();
                    const days = (now.getTime() - certDate.getTime()) / (1000 * 3600 * 24);

                    if (value === 'recent') return days <= 30;
                    if (value === '3months') return days <= 90;
                    if (value === 'year') return days <= 365;
                    return true;
                  })
                );
              }
            }}
            aria-label="Filter certificates"
            title="Filter certificates"
          >
            <option value="all">{tFilters('all')}</option>
            <option value="recent">{tFilters('recent')}</option>
            <option value="3months">{tFilters('threeMonths')}</option>
            <option value="year">{tFilters('year')}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((certificate, index) => (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <h3 className="text-lg font-semibold">{certificate.courseName}</h3>
                <span className="px-2 py-1 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] rounded-full">
                  ID: {certificate.certificateId.substring(0, 8)}...
                </span>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-[color:var(--ai-muted)]">
                        {t('certificatesPage.awardedOn')}
                      </p>
                      <p>{formatDate(certificate.completionDate)}</p>
                    </div>

                    <Button
                      color="primary"
                      variant="flat"
                      onClick={() =>
                        downloadCertificate(certificate.certificateId, certificate.courseId)
                      }
                    >
                      {t('certificatesPage.actions.download')}
                    </Button>
                  </div>

                  <div className="p-4 border border-[color:var(--ai-card-border)] rounded-lg bg-[color:var(--ai-card-bg)]/40">
                    <div className="flex items-center space-x-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[color:var(--ai-primary)]"
                      >
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                      <div>
                        <p className="text-sm font-medium">
                          {t('certificatesPage.certificateOfCompletion')}
                        </p>
                        <p className="text-xs text-[color:var(--ai-muted)]">
                          {t('certificatesPage.platformName')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
