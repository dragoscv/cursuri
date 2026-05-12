import React from 'react';

import { PolicySectionProps } from '@/types';
// ...existing code...

export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

import { PolicySubsectionProps } from '@/types';
// ...existing code...

export function PolicySubsection({ title, children }: PolicySubsectionProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

import { PolicyListProps } from '@/types';
// ...existing code...

export function PolicyList({ items, type = 'disc' }: PolicyListProps) {
  const listClass =
    type === 'disc' ? 'list-disc pl-6 mb-4 space-y-1.5' : 'list-none mb-4 space-y-1.5';

  return (
    <ul className={listClass}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicyParagraph({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed">{children}</p>;
}

const PolicyContent = {
  Section: PolicySection,
  Subsection: PolicySubsection,
  List: PolicyList,
  Paragraph: PolicyParagraph,
};

export default PolicyContent;
