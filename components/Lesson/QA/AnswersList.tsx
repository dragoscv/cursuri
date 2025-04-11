'use client'

import React, { useContext } from 'react';
import { Answer } from '@/types';
import { Avatar, Button } from '@heroui/react';
import { LikeIcon } from '@/components/icons/svg';
import { updateDoc, doc, arrayUnion, arrayRemove, increment, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';

interface AnswersListProps {
    answers: Answer[];
    questionId: string;
    expanded: boolean;
}

const AnswersList: React.FC<AnswersListProps> = ({ answers, questionId, expanded }) => {
    const context = useContext(AppContext);
    const user = context?.user || null;

    // Format the date for display
    const formatDate = (date: Date | Timestamp) => {
        if (date instanceof Timestamp) {
            date = date.toDate();
        }
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleLike = async (answer: Answer) => {
        if (!user) return;

        try {
            const questionRef = doc(firestoreDB, 'questions', questionId);
            const isLiked = answer.likedBy?.includes(user.uid);

            // Find the answer in the array and update its likes
            const updatedAnswers = answers.map(ans => {
                if (ans.id === answer.id) {
                    return {
                        ...ans,
                        likes: isLiked ? ans.likes - 1 : ans.likes + 1,
                        likedBy: isLiked
                            ? ans.likedBy?.filter(id => id !== user.uid)
                            : [...(ans.likedBy || []), user.uid]
                    };
                }
                return ans;
            });

            // Update the answers array in Firestore
            await updateDoc(questionRef, { answers: updatedAnswers });
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    // Display all answers or just the first one based on expanded state
    const displayAnswers = expanded ? answers : (answers.length > 0 ? [answers[0]] : []);

    return (
        <div className="space-y-4">
            {displayAnswers.map((answer) => (
                <div key={answer.id} className="border-t border-[color:var(--ai-card-border)]/20 pt-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={answer.userAvatar || "/default-avatar.png"}
                                name={answer.userName?.charAt(0) || "?"}
                                size="sm"
                                className={`border-2 ${answer.isAuthorOrAdmin ? 'border-[color:var(--ai-secondary)]/60' : 'border-[color:var(--ai-card-border)]/40'}`}
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-[color:var(--ai-text)]">{answer.userName}</h4>
                                    {answer.userRole && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${answer.userRole === 'Instructor' || answer.userRole === 'Admin'
                                            ? 'bg-[color:var(--ai-secondary)]/10 text-[color:var(--ai-secondary)]'
                                            : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                            }`}>
                                            {answer.userRole}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[color:var(--ai-muted)]">{formatDate(answer.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Render rich text content or plain text if no HTML */}
                    <div className="mt-2">
                        {answer.htmlContent ? (
                            <div
                                className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-img:shadow-md prose-a:text-[color:var(--ai-primary)] text-[color:var(--ai-text-secondary)]"
                                dangerouslySetInnerHTML={{ __html: answer.htmlContent }}
                            />
                        ) : (
                            <p className="text-[color:var(--ai-text-secondary)] whitespace-pre-wrap">{answer.content}</p>
                        )}
                    </div>

                    {/* Display attachments if any */}
                    {answer.attachments && answer.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {answer.attachments.map(attachment => (
                                <div key={attachment.id} className="relative group">
                                    {attachment.type === 'image' && (
                                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
                                            <img
                                                src={attachment.url}
                                                alt={attachment.name}
                                                className="rounded-md max-h-40 object-cover border border-[color:var(--ai-card-border)]"
                                            />
                                        </a>
                                    )}
                                    {attachment.type === 'video' && (
                                        <video
                                            src={attachment.url}
                                            controls
                                            className="rounded-md max-h-40 border border-[color:var(--ai-card-border)]"
                                        />
                                    )}
                                    {attachment.type === 'file' && (
                                        <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-2 bg-[color:var(--ai-card-bg)]/60 rounded-md border border-[color:var(--ai-card-border)] hover:bg-[color:var(--ai-card-border)]/10"
                                        >
                                            <span className="icon mr-2">📄</span>
                                            <span className="text-sm">{attachment.name}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Like button */}
                    <div className="mt-3">                        <Button
                        size="sm"
                        variant={user && answer.likedBy?.includes(user.uid) ? "primary" : "flat"}
                        onClick={() => handleLike(answer)}
                        className={user && answer.likedBy?.includes(user.uid) ?
                            'text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10' :
                            'text-[color:var(--ai-muted)]'
                        }
                        startContent={<LikeIcon className="w-3.5 h-3.5" />}
                    >
                        {answer.likes || 0}
                    </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnswersList;