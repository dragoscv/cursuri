'use client';

/**
 * Backwards-compat shim. Existing pages can keep importing AdminPageHeader,
 * but they now render the redesigned PageHeader from the admin shell.
 */
import React from 'react';
import PageHeader from './shell/PageHeader';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = (props) => <PageHeader {...props} />;

export default AdminPageHeader;
