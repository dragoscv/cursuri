'use client'

import { Resource } from '@/types'

interface ResourcesListProps {
    resources: Resource[];
}

export default function ResourcesList({
    resources
}: ResourcesListProps) {
    if (!resources || resources.length === 0) {
        return null;
    }

    return (
        <div className="p-6">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-4">
                Lesson Resources
            </h3>
            <ul className="space-y-3">
                {resources.map((resource: Resource, index: number) => (
                    <li key={index} className="group">
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 rounded-lg border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/30 bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-primary)]/10 transition-all duration-300 group"
                        >
                            <div className="mr-3 p-2 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] group-hover:bg-[color:var(--ai-primary)]/20 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <span className="text-[color:var(--ai-primary)] font-medium group-hover:text-[color:var(--ai-primary-accent)] transition-colors">
                                    {resource.name}
                                </span>
                            </div>
                            <svg className="w-4 h-4 text-[color:var(--ai-primary)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}