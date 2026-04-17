import {
    FiHome,
    FiBookOpen,
    FiUsers,
    FiMail,
    FiBarChart2,
    FiSettings,
    FiFileText,
    FiCreditCard,
    FiTrendingUp,
} from '@/components/icons/FeatherIcons';

export interface AdminNavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    /** keywords for command palette */
    keywords?: string[];
    /** show small chip badge (e.g. "Beta", count) */
    badge?: string;
}

export interface AdminNavGroup {
    id: string;
    label: string;
    items: AdminNavItem[];
}

/**
 * Single source of truth for admin navigation.
 * Used by sidebar, command palette and breadcrumbs.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
    {
        id: 'overview',
        label: 'Overview',
        items: [
            {
                id: 'dashboard',
                label: 'Dashboard',
                href: '/admin',
                icon: FiHome,
                keywords: ['home', 'overview', 'kpi'],
            },
            {
                id: 'analytics',
                label: 'Analytics',
                href: '/admin/analytics',
                icon: FiBarChart2,
                keywords: ['stats', 'metrics', 'revenue', 'growth'],
            },
            {
                id: 'subs-analytics',
                label: 'Subscription Analytics',
                href: '/admin/subscriptions/analytics',
                icon: FiTrendingUp,
                keywords: ['mrr', 'arr', 'churn', 'subscriptions', 'recurring'],
            },
        ],
    },
    {
        id: 'manage',
        label: 'Manage',
        items: [
            {
                id: 'courses',
                label: 'Courses',
                href: '/admin/courses',
                icon: FiBookOpen,
                keywords: ['lessons', 'content', 'curriculum'],
            },
            {
                id: 'subscriptions',
                label: 'Subscriptions',
                href: '/admin/subscriptions',
                icon: FiCreditCard,
                keywords: ['plans', 'pricing', 'stripe', 'products', 'billing'],
            },
            {
                id: 'users',
                label: 'Users',
                href: '/admin/users',
                icon: FiUsers,
                keywords: ['accounts', 'students', 'people', 'members'],
            },
            {
                id: 'messages',
                label: 'Messages',
                href: '/admin/messages',
                icon: FiMail,
                keywords: ['inbox', 'contact', 'support'],
            },
        ],
    },
    {
        id: 'system',
        label: 'System',
        items: [
            {
                id: 'audit',
                label: 'Audit Log',
                href: '/admin/audit',
                icon: FiFileText,
                keywords: ['security', 'history', 'activity'],
            },
            {
                id: 'settings',
                label: 'Settings',
                href: '/admin/settings',
                icon: FiSettings,
                keywords: ['preferences', 'configuration', 'platform'],
            },
        ],
    },
];

/** Flat list helpers */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((g) => g.items);

export const findNavByPath = (pathname: string): AdminNavItem | undefined =>
    ADMIN_NAV_ITEMS
        .slice()
        .sort((a, b) => b.href.length - a.href.length)
        .find((i) => pathname === i.href || pathname.startsWith(i.href + '/'));
