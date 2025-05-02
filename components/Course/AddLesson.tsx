import { motion } from "framer-motion";
import LessonForm from "@/components/Lesson/LessonForm";

interface AddLessonProps {
    onClose: () => void;
    courseId: string;
    lessonId?: string;
}

export default function AddLesson(props: AddLessonProps) {
    const { onClose, courseId, lessonId } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto"
        >
            <LessonForm courseId={courseId} lessonId={lessonId} onClose={onClose} />
        </motion.div>
    );
}