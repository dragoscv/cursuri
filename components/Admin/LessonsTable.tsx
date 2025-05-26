import React from "react";
import { Lesson } from "@/types";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface LessonsTableProps {
    lessons: Lesson[];
    courseId: string;
    onEdit: (lessonId: string) => void;
    onReorder?: (lessonIds: string[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LessonsTable({ lessons, courseId, onEdit, onReorder }: LessonsTableProps) {
    // Sort lessons by order
    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="overflow-x-auto rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 shadow-md">
            <table className="min-w-full divide-y divide-[color:var(--ai-card-border)]">
                <thead className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-[color:var(--ai-card-border)]">
                    {sortedLessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-[color:var(--ai-primary)]/5 transition-all">
                            <td className="px-4 py-3 font-mono text-sm text-[color:var(--ai-foreground)]">{lesson.order ?? "-"}</td>
                            <td className="px-4 py-3 font-medium text-[color:var(--ai-foreground)]">{lesson.name}</td>
                            <td className="px-4 py-3 text-[color:var(--ai-muted)]">{lesson.type}</td>
                            <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${lesson.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                    {lesson.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-[color:var(--ai-muted)]">{lesson.duration ? lesson.duration + " min" : "-"}</td>
                            <td className="px-4 py-3 text-right">
                                <Button size="sm" variant="flat" color="primary" onPress={() => onEdit(lesson.id)}>
                                    Edit
                                </Button>
                                <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                                    className="ml-2 text-xs text-[color:var(--ai-primary)] underline">
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
