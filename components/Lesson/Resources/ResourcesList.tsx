'use client'

import { Resource } from '@/types';
import { Card } from '@heroui/react';
import { FiFileText, FiExternalLink, FiDownload } from '@/components/icons/FeatherIcons';

interface ResourcesListProps {
    resources: Resource[];
    isOfflineMode?: boolean;
}

export default function ResourcesList({
    resources,
    isOfflineMode = false
}: ResourcesListProps) {
    if (!resources || resources.length === 0) {
        return null;
    }

    // Function to get appropriate icon based on resource type
    const getResourceIcon = (type: string | undefined) => {
        switch (type?.toLowerCase()) {
            case 'pdf':
                return <FiFileText size={18} />;
            case 'download':
                return <FiDownload size={18} />;
            default:
                return <FiExternalLink size={18} />;
        }
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
            <div className="p-5">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiFileText className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>Lesson Resources</span>
                        {isOfflineMode && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] rounded-full">
                                Offline Mode
                            </span>
                        )}
                    </h3>
                </div>

                <ul className="space-y-3">
                    {resources.map((resource: Resource, index: number) => (
                        <li key={index} className="group">
                            <a
                                href={resource.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer" download={isOfflineMode ? true : undefined}
                                className="flex items-center p-3 rounded-lg border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/30 bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-primary)]/5 transition-all duration-300 group"
                            >
                                <div className="mr-3 p-2 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] group-hover:bg-[color:var(--ai-primary)]/20 transition-colors">
                                    {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[color:var(--ai-foreground)] font-medium group-hover:text-[color:var(--ai-primary)] transition-colors block truncate">
                                        {resource.name}
                                    </span>
                                    {resource.description && (
                                        <span className="text-xs text-[color:var(--ai-muted)] block truncate">
                                            {resource.description}
                                        </span>
                                    )}
                                </div>
                                <FiExternalLink className="w-4 h-4 text-[color:var(--ai-primary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
}