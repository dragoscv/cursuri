'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'

interface NotesProps {
    notes: string;
    onNotesChange: (notes: string) => void;
    onSaveNotes: () => void;
    notesRef: React.RefObject<HTMLTextAreaElement>;
}

export default function Notes({
    notes,
    onNotesChange,
    onSaveNotes,
    notesRef
}: NotesProps) {
    const [showNotes, setShowNotes] = useState(false)

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Your Notes
                </h3>
                <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-indigo-600 dark:text-indigo-400"
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
                        className="w-full h-48 p-3 border rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Take notes about this lesson..."
                    />
                    <div className="mt-3 flex justify-end">
                        <Button
                            size="sm"
                            color="primary"
                            onClick={onSaveNotes}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            startContent={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Save Notes
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}