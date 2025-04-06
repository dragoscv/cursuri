'use client'

import React from 'react';
import Button from '@/components/ui/Button';
import { SaveIcon } from '@/components/icons/svg';

interface NotesProps {
    notes: string;
    showNotes: boolean;
    onNotesChange: (notes: string) => void;
    onToggleNotes: () => void;
    onSaveNotes: () => void;
    notesRef: React.RefObject<HTMLTextAreaElement>;
}

export const Notes: React.FC<NotesProps> = ({
    notes,
    showNotes,
    onNotesChange,
    onToggleNotes,
    onSaveNotes,
    notesRef
}) => {
    return (
        <div className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-xl overflow-hidden mt-8 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent rounded-3xl">
                    Your Notes
                </h3>
                <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    onClick={onToggleNotes}
                    className="text-[color:var(--ai-primary)]"
                    endContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showNotes ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                    }
                >
                    {showNotes ? 'Hide' : 'Show'}
                </Button>
            </div>

            {showNotes && (
                <div className="animate-in slide-in-from-top duration-300">
                    <textarea
                        ref={notesRef}
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        className="w-full h-48 p-3 border rounded-xl bg-[color:var(--ai-card-bg)]/80 text-[color:var(--ai-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] transition-all"
                        placeholder="Take notes about this lesson..."
                    />
                    <div className="mt-3 flex justify-end">
                        <Button
                            size="sm"
                            color="primary"
                            onClick={onSaveNotes}
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg"
                            startContent={<SaveIcon />}
                        >
                            Save Notes
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notes;