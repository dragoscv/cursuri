'use client'

import AddCourse from './AddCourse';
import { useRouter } from 'next/navigation';

export default function EditCourseForm(props: { courseId: string }) {
    const router = useRouter();

    // Pass courseId to AddCourse for edit mode
    return <AddCourse courseId={props.courseId} onClose={() => router.back()} />;
}
