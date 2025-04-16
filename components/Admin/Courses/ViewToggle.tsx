import React from 'react';
import Button from '@/components/ui/Button';

interface ViewToggleProps {
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex gap-4 mb-6">            <Button
            variant={view === "grid" ? "primary" : "bordered"}
            onClick={() => onViewChange("grid")}
            size="sm"
            className={view === "grid"
                ? "bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 text-[color:var(--ai-foreground)] shadow-sm rounded-full"
                : "text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-border)]/20 rounded-full"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="ml-2">Grid</span>
        </Button>
            <Button
                variant={view === "list" ? "primary" : "bordered"}
                onClick={() => onViewChange("list")}
                size="sm"
                className={view === "list"
                    ? "bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 text-[color:var(--ai-foreground)] shadow-sm rounded-full"
                    : "text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-border)]/20 rounded-full"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">List</span>
            </Button>
        </div>
    );
}