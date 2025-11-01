import React from 'react';

interface SectionSkeletonProps {
    height?: string;
    className?: string;
}

export default function SectionSkeleton({ height = 'h-96', className = '' }: SectionSkeletonProps) {
    return (
        <div className={`w-full ${height} ${className} animate-pulse`}>
            <div className="container mx-auto px-4 h-full flex items-center justify-center">
                <div className="w-full max-w-7xl space-y-4">
                    <div className="h-8 bg-[color:var(--ai-card-border)]/50 rounded w-1/4 mx-auto"></div>
                    <div className="h-4 bg-[color:var(--ai-card-border)]/50 rounded w-1/2 mx-auto"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="h-32 bg-[color:var(--ai-card-border)]/50 rounded"></div>
                        <div className="h-32 bg-[color:var(--ai-card-border)]/50 rounded"></div>
                        <div className="h-32 bg-[color:var(--ai-card-border)]/50 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
