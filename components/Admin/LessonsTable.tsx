import React, { useState, useEffect } from 'react';
import { Lesson } from '@/types';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LessonsTableProps {
  lessons: Lesson[];
  courseId: string;
  onEdit: (lessonId: string) => void;
  onDelete?: (lessonId: string) => void;
  onReorder?: (lessons: Lesson[]) => void;
}

interface SortableRowProps {
  lesson: Lesson;
  index: number;
  courseId: string;
  onEdit: (lessonId: string) => void;
  onDelete?: (lessonId: string) => void;
}

function SortableRow({ lesson, index, courseId, onEdit, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-[color:var(--ai-primary)]/5 transition-all"
    >
      <td className="px-4 py-3 font-mono text-sm text-[color:var(--ai-foreground)]">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
            aria-label="Drag to reorder"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span>{lesson.order ?? index}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-medium text-[color:var(--ai-foreground)]">{lesson.name}</td>
      <td className="px-4 py-3 text-[color:var(--ai-muted)]">{lesson.type}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${lesson.status === 'active'
              ? 'bg-[color:var(--ai-success)]/10 text-[color:var(--ai-success)]'
              : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-muted-foreground)]'
            }`}
        >
          {lesson.status}
        </span>
      </td>
      <td className="px-4 py-3 text-[color:var(--ai-muted)]">
        {lesson.duration ? lesson.duration + ' min' : '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={() => onEdit(lesson.id)}
            aria-label={`Edit lesson ${lesson.name}`}
          >
            Edit
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => onDelete(lesson.id)}
              aria-label={`Delete lesson ${lesson.name}`}
            >
              Delete
            </Button>
          )}
          <Link
            href={`/courses/${courseId}/lessons/${lesson.id}`}
            className="text-xs text-[color:var(--ai-primary)] underline"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function LessonsTable({ lessons, courseId, onEdit, onDelete, onReorder }: LessonsTableProps) {
  // Filter out invalid lessons and sort by order
  const validLessons = lessons.filter((lesson) => lesson && lesson.id);
  const [items, setItems] = useState(
    [...validLessons].sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  // Sync internal state with lessons prop changes (e.g., after deletion)
  useEffect(() => {
    const sortedLessons = [...validLessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    setItems(sortedLessons);
  }, [lessons]); // Re-sync when lessons prop changes

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      if (onReorder) {
        onReorder(newItems);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/60 shadow-md">
        <table className="min-w-full divide-y divide-[color:var(--ai-card-border)]">
          <thead className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[color:var(--ai-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="bg-transparent divide-y divide-[color:var(--ai-card-border)]">
              {items.map((lesson, index) => (
                <SortableRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  courseId={courseId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
}
