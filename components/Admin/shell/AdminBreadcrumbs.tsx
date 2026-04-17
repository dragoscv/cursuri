'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiChevronRight } from '@/components/icons/FeatherIcons';
import { ADMIN_NAV_ITEMS } from './navigation';

interface Crumb {
  label: string;
  href: string;
  isCurrent: boolean;
}

const TITLE_OVERRIDES: Record<string, string> = {
  add: 'Add',
  edit: 'Edit',
  lessons: 'Lessons',
  audit: 'Audit Log',
};

const isIdSegment = (s: string) => s.length >= 16 || /^[a-z0-9]{8,}$/i.test(s);

const titleize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AdminBreadcrumbs: React.FC = () => {
  const pathname = usePathname() || '/admin';

  const crumbs = useMemo<Crumb[]>(() => {
    const segments = pathname.split('/').filter(Boolean); // ['admin', ...]
    const out: Crumb[] = [{ label: 'Admin', href: '/admin', isCurrent: pathname === '/admin' }];
    let acc = '/admin';
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      acc += `/${seg}`;
      // Try matching a known nav item
      const known = ADMIN_NAV_ITEMS.find((n) => n.href === acc);
      let label: string;
      if (known) label = known.label;
      else if (isIdSegment(seg)) label = `#${seg.slice(0, 6)}`;
      else label = TITLE_OVERRIDES[seg] ?? titleize(seg);
      out.push({ label, href: acc, isCurrent: i === segments.length - 1 });
    }
    return out;
  }, [pathname]);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-xs text-[color:var(--ai-muted)] min-w-0">
        {crumbs.map((c, i) => (
          <motion.li
            key={c.href}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-1 min-w-0"
          >
            {i > 0 && <FiChevronRight size={12} className="opacity-50 shrink-0" />}
            {c.isCurrent ? (
              <span className="font-medium text-[color:var(--ai-foreground)] truncate">{c.label}</span>
            ) : (
              <Link
                href={c.href}
                className="hover:text-[color:var(--ai-foreground)] transition truncate inline-flex items-center gap-1"
              >
                {i === 0 && <FiHome size={12} />}
                {c.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumbs;
