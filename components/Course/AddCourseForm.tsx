'use client'

import AddCourse from './AddCourse';

interface AddCourseFormProps {
    onClose: () => void;
    courseId?: string;
}

export default function AddCourseForm({ onClose, courseId }: AddCourseFormProps) {
    return <AddCourse courseId={courseId} onClose={onClose} />;
}
