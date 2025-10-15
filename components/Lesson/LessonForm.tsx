import React, { useState, useContext, useCallback, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { firestoreDB, firebaseStorage } from '@/utils/firebase/firebase.config';
import { doc, addDoc, collection, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import { FiBook } from '../icons/FeatherIcons';
import { FiVideo, FiFileText, FiCode, FiHelpCircle, FiLink, FiTag, FiLayers, FiFilePlus, FiCheckSquare, FiTarget } from '../icons/AdditionalIcons';
import { LessonFormProps, CourseModule, LessonType } from '@/types';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select, { SelectItem } from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Chip from '@/components/ui/Chip';
import Tooltip from '@/components/ui/Tooltip';
import { Tabs, Tab } from '@heroui/react';
import Accordion, { AccordionItem } from '../ui/Accordion';
import Checkbox from '@/components/ui/Checkbox';
import RichTextEditor from '@/components/Lesson/QA/RichTextEditor';

export default function LessonForm({ courseId, lessonId, onClose }: LessonFormProps) {
    const [lessonName, setLessonName] = useState("");
    const [lessonDescription, setLessonDescription] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [lessonOrder, setLessonOrder] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number | string>("");
    const [isRequired, setIsRequired] = useState(true);
    const [lessonType, setLessonType] = useState("video");
    const [lessonStatus, setLessonStatus] = useState("active");
    const [lessonResources, setLessonResources] = useState<string[]>([]);
    const [currentResource, setCurrentResource] = useState("");
    const [lessonTags, setLessonTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [previewEnabled, setPreviewEnabled] = useState(true);

    // New state variables for enhanced features
    const [activeTab, setActiveTab] = useState("basic");
    const [moduleId, setModuleId] = useState<string>("");
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [hasQuiz, setHasQuiz] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
        id: crypto.randomUUID(),
        question: "",
        options: ["", "", "", ""],
        correctOption: 0,
        explanation: ""
    });
    const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
    const [currentObjective, setCurrentObjective] = useState("");
    const [embedUrl, setEmbedUrl] = useState("");
    const [embedType, setEmbedType] = useState<"youtube" | "codepen" | "github" | "other">("youtube");
    const [transcription, setTranscription] = useState("");
    const [additionalFiles, setAdditionalFiles] = useState<{ file: File, name: string, description?: string }[]>([]);
    const [currentAdditionalFile, setCurrentAdditionalFile] = useState<File | null>(null);
    const [currentFileDescription, setCurrentFileDescription] = useState("");
    const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
    const [currentKeyword, setCurrentKeyword] = useState("");
    const [completionCriteria, setCompletionCriteria] = useState<{
        watchPercentage: number;
        requireQuiz: boolean;
        requireExercise: boolean;
    }>({
        watchPercentage: 80,
        requireQuiz: false,
        requireExercise: false
    });

    // Interface for quiz questions
    interface QuizQuestion {
        id: string;
        question: string;
        options: string[];
        correctOption: number;
        explanation: string;
    }

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { lessons } = context; useEffect(() => {
        // Fetch course modules
        const fetchModules = async () => {
            try {
                const modulesRef = collection(firestoreDB, `courses/${courseId}/modules`);
                const modulesSnapshot = await getDocs(modulesRef);
                const modulesData: CourseModule[] = [];

                modulesSnapshot.forEach((doc) => {
                    modulesData.push({
                        id: doc.id,
                        ...doc.data()
                    } as CourseModule);
                });

                setModules(modulesData);
            } catch (error) {
                console.error("Error fetching modules:", error);
            }
        };

        // If lessonId is provided, we're in edit mode
        const loadLessonData = async () => {
            if (lessonId && courseId && lessons[courseId] && lessons[courseId][lessonId]) {
                const lesson = lessons[courseId][lessonId];
                setLessonName(lesson.name || "");
                setLessonDescription(lesson.description || "");
                setRepoUrl(lesson.repoUrl || "");
                setEditMode(true);
                setLessonOrder(lesson.order || 0);
                setDurationMinutes(lesson.duration ? parseInt(lesson.duration, 10) || "" : "");
                setIsRequired(lesson.isFree !== true);
                setLessonType(lesson.type?.toString() || "video");
                setLessonStatus(lesson.status || "active");
                setLessonResources(lesson.resources?.map(r => typeof r === 'string' ? r : r.url) || []);
                setLessonTags((lesson as any).tags || []);
                setPreviewEnabled(lesson.isFree === true);
                if (lesson.file) {
                    setFilePreview(lesson.file);
                }

                // Load extended properties
                setModuleId(lesson.moduleId || "");
                setHasQuiz(lesson.hasQuiz || false);
                setTranscription(lesson.transcription || "");

                // Fetch quiz questions if the lesson has a quiz
                if (lesson.hasQuiz) {
                    try {
                        const questionsRef = collection(firestoreDB, `courses/${courseId}/lessons/${lessonId}/quizQuestions`);
                        const questionsSnapshot = await getDocs(questionsRef);
                        const questions: QuizQuestion[] = [];

                        questionsSnapshot.forEach((doc) => {
                            questions.push({
                                id: doc.id,
                                ...doc.data()
                            } as QuizQuestion);
                        });

                        if (questions.length > 0) {
                            setQuizQuestions(questions);
                        }
                    } catch (error) {
                        console.error("Error fetching quiz questions:", error);
                    }
                }

                // Load learning objectives
                if ((lesson as any).learningObjectives) {
                    setLearningObjectives((lesson as any).learningObjectives || []);
                }

                // Load embed information
                if ((lesson as any).embedUrl) {
                    setEmbedUrl((lesson as any).embedUrl || "");
                    setEmbedType((lesson as any).embedType || "youtube");
                }

                // Load SEO keywords
                if ((lesson as any).seoKeywords) {
                    setSeoKeywords((lesson as any).seoKeywords || []);
                }

                // Load completion criteria
                if ((lesson as any).completionCriteria) {
                    setCompletionCriteria((lesson as any).completionCriteria || {
                        watchPercentage: 80,
                        requireQuiz: false,
                        requireExercise: false
                    });
                }
            }
        };

        fetchModules();
        loadLessonData();
    }, [lessonId, courseId, lessons]); const addLesson = useCallback(async () => {
        setLoading(true);
        if (!file && lessonType === 'video') {
            alert("Please select a video file to upload");
            setLoading(false);
            return;
        }
        try {
            // Upload main lesson file if provided
            let downloadURL = '';
            if (file) {
                const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, file);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            // Upload additional files if any
            const additionalFilesData = [];
            for (const addFile of additionalFiles) {
                const fileRef = ref(firebaseStorage, `lessons/${courseId}/resources/${addFile.file.name}_${Date.now()}`);
                const fileSnapshot = await uploadBytes(fileRef, addFile.file);
                const fileUrl = await getDownloadURL(fileSnapshot.ref);
                additionalFilesData.push({
                    name: addFile.name,
                    url: fileUrl,
                    description: addFile.description
                });
            }

            // Create the base lesson object
            const lesson: any = {
                name: lessonName,
                description: lessonDescription,
                repoUrl: repoUrl,
                status: lessonStatus,
                order: Number(lessonOrder),
                duration: durationMinutes ? Number(durationMinutes) : 0,
                isFree: !isRequired,
                type: lessonType,
                resources: lessonResources,
                additionalFiles: additionalFilesData,
                tags: lessonTags,
                previewEnabled: previewEnabled,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add file URL if a file was uploaded
            if (downloadURL) {
                lesson.file = downloadURL;
            }

            // Add module ID if selected
            if (moduleId) {
                lesson.moduleId = moduleId;
            }

            // Add quiz flag
            lesson.hasQuiz = hasQuiz;

            // Add learning objectives if any
            if (learningObjectives.length > 0) {
                lesson.learningObjectives = learningObjectives;
            }

            // Add embed information if provided
            if (embedUrl) {
                lesson.embedUrl = embedUrl;
                lesson.embedType = embedType;
            }

            // Add transcription if provided
            if (transcription) {
                lesson.transcription = transcription;
            }

            // Add SEO keywords if any
            if (seoKeywords.length > 0) {
                lesson.seoKeywords = seoKeywords;
            }

            // Add completion criteria
            lesson.completionCriteria = completionCriteria;

            // Add the lesson to Firestore
            const lessonDocRef = await addDoc(collection(firestoreDB, `courses/${courseId}/lessons`), lesson);

            // If the lesson has a quiz, add the questions
            if (hasQuiz && quizQuestions.length > 0) {
                const questionsRef = collection(firestoreDB, `courses/${courseId}/lessons/${lessonDocRef.id}/quizQuestions`);

                for (const question of quizQuestions) {
                    await addDoc(questionsRef, {
                        question: question.question,
                        options: question.options,
                        correctOption: question.correctOption,
                        explanation: question.explanation
                    });
                }
            }

            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error adding lesson:", error);
            alert("Failed to add lesson. Please try again.");
        }
    }, [
        lessonName, lessonDescription, repoUrl, courseId, file, lessonStatus,
        lessonOrder, durationMinutes, isRequired, lessonType, lessonResources,
        lessonTags, previewEnabled, onClose, moduleId, hasQuiz, quizQuestions,
        learningObjectives, embedUrl, embedType, transcription, additionalFiles,
        seoKeywords, completionCriteria
    ]);

    const updateLesson = useCallback(async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            // Create the updated data object
            const updatedData: any = {
                name: lessonName,
                description: lessonDescription,
                repoUrl: repoUrl,
                status: lessonStatus,
                order: Number(lessonOrder),
                duration: durationMinutes ? Number(durationMinutes) : 0,
                isFree: !isRequired,
                type: lessonType,
                resources: lessonResources,
                tags: lessonTags,
                previewEnabled: previewEnabled,
                updatedAt: new Date().toISOString()
            };

            // Update main file if a new one is provided
            if (file) {
                const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                updatedData.file = downloadURL;
            }

            // Upload additional files if any new ones were added
            if (additionalFiles.length > 0) {
                const additionalFilesData = [];
                for (const addFile of additionalFiles) {
                    // Only upload files that don't have URLs already
                    if (addFile.file) {
                        const fileRef = ref(firebaseStorage, `lessons/${courseId}/resources/${addFile.file.name}_${Date.now()}`);
                        const fileSnapshot = await uploadBytes(fileRef, addFile.file);
                        const fileUrl = await getDownloadURL(fileSnapshot.ref);
                        additionalFilesData.push({
                            name: addFile.name,
                            url: fileUrl,
                            description: addFile.description
                        });
                    }
                }
                updatedData.additionalFiles = additionalFilesData;
            }

            // Add module ID if selected
            if (moduleId) {
                updatedData.moduleId = moduleId;
            }

            // Add quiz flag
            updatedData.hasQuiz = hasQuiz;

            // Add learning objectives if any
            if (learningObjectives.length > 0) {
                updatedData.learningObjectives = learningObjectives;
            }

            // Add embed information if provided
            if (embedUrl) {
                updatedData.embedUrl = embedUrl;
                updatedData.embedType = embedType;
            }

            // Add transcription if provided
            if (transcription) {
                updatedData.transcription = transcription;
            }

            // Add SEO keywords if any
            if (seoKeywords.length > 0) {
                updatedData.seoKeywords = seoKeywords;
            }

            // Add completion criteria
            updatedData.completionCriteria = completionCriteria;

            // Update the lesson document
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, updatedData);

            // Update quiz questions if the lesson has a quiz
            if (hasQuiz && quizQuestions.length > 0) {
                // First delete existing questions
                const questionsRef = collection(firestoreDB, `courses/${courseId}/lessons/${lessonId}/quizQuestions`);
                const existingQuestions = await getDocs(questionsRef);

                existingQuestions.forEach(async (doc) => {
                    await updateDoc(doc.ref, {
                        deleted: true
                    });
                });

                // Add the new questions
                for (const question of quizQuestions) {
                    await addDoc(questionsRef, {
                        question: question.question,
                        options: question.options,
                        correctOption: question.correctOption,
                        explanation: question.explanation
                    });
                }
            }

            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error updating lesson:", error);
            alert("Failed to update lesson. Please try again.");
        }
    }, [
        lessonId, courseId, lessonName, lessonDescription, repoUrl, file,
        lessonStatus, lessonOrder, durationMinutes, isRequired, lessonType,
        lessonResources, lessonTags, previewEnabled, onClose, moduleId,
        hasQuiz, quizQuestions, learningObjectives, embedUrl, embedType,
        transcription, additionalFiles, seoKeywords, completionCriteria
    ]);    // Type definitions for input event handlers
    type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
    type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
    type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
    type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

    // Handle file selection
    const handleFileChange = (e: InputChangeEvent) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (selectedFile.type.startsWith("video/")) {
                setFilePreview("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxwb2x5Z29uIHBvaW50cz0iMTAgOCAxNiAxMiAxMCAxNiAxMCA4Ij48L3BvbHlnb24+PC9zdmc+");
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            }
        }
    };

    // Handle additional file selection
    const handleAdditionalFileChange = (e: InputChangeEvent) => {
        if (e.target.files && e.target.files.length > 0) {
            setCurrentAdditionalFile(e.target.files[0]);
        }
    };

    // Add an additional file
    const handleAddAdditionalFile = () => {
        if (currentAdditionalFile) {
            const fileName = currentAdditionalFile.name.length > 30
                ? currentAdditionalFile.name.substring(0, 30) + '...'
                : currentAdditionalFile.name;

            setAdditionalFiles([
                ...additionalFiles,
                {
                    file: currentAdditionalFile,
                    name: fileName,
                    description: currentFileDescription
                }
            ]);

            setCurrentAdditionalFile(null);
            setCurrentFileDescription("");
        }
    };

    // Remove an additional file
    const handleRemoveAdditionalFile = (index: number) => {
        const newFiles = [...additionalFiles];
        newFiles.splice(index, 1);
        setAdditionalFiles(newFiles);
    };

    // Handle quiz question changes
    const handleQuestionChange = (field: keyof QuizQuestion, value: string | string[] | number) => {
        setCurrentQuestion({
            ...currentQuestion,
            [field]: value
        });
    };

    // Handle option change for a quiz question
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions
        });
    };

    // Add a quiz question
    const handleAddQuestion = () => {
        if (currentQuestion.question && currentQuestion.options.filter(o => o).length >= 2) {
            setQuizQuestions([...quizQuestions, currentQuestion]);
            setCurrentQuestion({
                id: crypto.randomUUID(),
                question: "",
                options: ["", "", "", ""],
                correctOption: 0,
                explanation: ""
            });
        } else {
            alert("A question must have a question text and at least two options.");
        }
    };

    // Remove a quiz question
    const handleRemoveQuestion = (id: string) => {
        setQuizQuestions(quizQuestions.filter(q => q.id !== id));
    };

    // Edit a quiz question
    const handleEditQuestion = (question: QuizQuestion) => {
        setCurrentQuestion(question);
        setQuizQuestions(quizQuestions.filter(q => q.id !== question.id));
    };

    // Tag/resource/objective/keyword handlers
    const handleAddTag = () => {
        if (currentTag && !lessonTags.includes(currentTag)) {
            setLessonTags([...lessonTags, currentTag]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setLessonTags(lessonTags.filter(t => t !== tag));
    };

    const handleAddResource = () => {
        if (currentResource && !lessonResources.includes(currentResource)) {
            setLessonResources([...lessonResources, currentResource]);
            setCurrentResource('');
        }
    };

    const handleRemoveResource = (resource: string) => {
        setLessonResources(lessonResources.filter(r => r !== resource));
    };

    const handleAddObjective = () => {
        if (currentObjective && !learningObjectives.includes(currentObjective)) {
            setLearningObjectives([...learningObjectives, currentObjective]);
            setCurrentObjective('');
        }
    };

    const handleRemoveObjective = (objective: string) => {
        setLearningObjectives(learningObjectives.filter(o => o !== objective));
    };

    const handleAddKeyword = () => {
        if (currentKeyword && !seoKeywords.includes(currentKeyword)) {
            setSeoKeywords([...seoKeywords, currentKeyword]);
            setCurrentKeyword('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setSeoKeywords(seoKeywords.filter(k => k !== keyword));
    };

    // Handle key events for adding items
    const handleTagKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag) {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleResourceKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && currentResource) {
            e.preventDefault();
            handleAddResource();
        }
    };

    const handleObjectiveKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && currentObjective) {
            e.preventDefault();
            handleAddObjective();
        }
    };

    const handleKeywordKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && currentKeyword) {
            e.preventDefault();
            handleAddKeyword();
        }
    }; return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 rounded-xl blur-xl"></div>
                <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)]/50">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                            {editMode ? 'Edit Lesson' : 'Create New Lesson'}
                        </h1>
                        <p className="text-[color:var(--ai-muted)] mt-2">
                            {editMode
                                ? 'Update your lesson information and materials'
                                : 'Add a new lesson to your course with all necessary details'}
                        </p>
                    </div>
                    <Button
                        color="default"
                        variant="light"
                        onPress={onClose}
                        size="sm"
                        className="hover:bg-[color:var(--ai-card-border)]/30 transition-all"
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Tabbed Interface */}
            <Tabs 
                selectedKey={activeTab}
                onSelectionChange={(key: React.Key) => setActiveTab(String(key))}
                className="mb-8"
            >
                <Tab key="basic" title="Basic Information">
                    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                        <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                            <FiBook className="text-[color:var(--ai-primary)]" size={20} />
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Basic Information</h2>
                                <p className="text-[color:var(--ai-muted)] text-sm">Main details about your lesson</p>
                            </div>
                        </CardHeader>
                        <CardBody className="p-6 overflow-visible">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="relative mb-6">
                                        <Input
                                            label="Lesson Name"
                                            variant="bordered"
                                            placeholder="Enter lesson name"
                                            value={lessonName}
                                            onChange={(e: InputChangeEvent) => setLessonName(e.target.value)}
                                            isRequired
                                            startContent={<FiBook className="text-[color:var(--ai-muted)]" />}
                                            className="bg-[color:var(--ai-card-bg)]/40"
                                            classNames={{
                                                label: "text-[color:var(--ai-foreground)] font-medium"
                                            }}
                                        />
                                        <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/50 to-[color:var(--ai-secondary)]/50 mt-1 rounded-full"></div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Lesson Description
                                        </label>
                                        <RichTextEditor
                                            value={lessonDescription}
                                            onChange={(_text, html) => setLessonDescription(html)}
                                            placeholder="Provide a detailed description of the lesson"
                                            minHeight={250}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Select
                                                label="Module"
                                                placeholder="Select module"
                                                value={moduleId}
                                                onChange={(e: SelectChangeEvent) => setModuleId(e.target.value)}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            >                                                <SelectItem key="" itemKey="" value="">None (Top Level)</SelectItem>
                                                {modules.map((module) => (
                                                    <SelectItem key={module.id} itemKey={module.id} value={module.id}>
                                                        {module.title}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                label="Lesson Order"
                                                placeholder="Order in the course"
                                                value={lessonOrder.toString()}
                                                onChange={(e: InputChangeEvent) => setLessonOrder(parseInt(e.target.value) || 0)}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Input
                                                type="number"
                                                label="Duration (minutes)"
                                                placeholder="Estimated duration"
                                                value={durationMinutes.toString()}
                                                onChange={(e: InputChangeEvent) => setDurationMinutes(parseInt(e.target.value) || "")}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Select
                                                label="Lesson Type"
                                                value={lessonType}
                                                onChange={(e: SelectChangeEvent) => setLessonType(e.target.value)}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            >                                                <SelectItem key="video" itemKey="video" value="video">Video</SelectItem>
                                                <SelectItem key="text" itemKey="text" value="text">Text</SelectItem>
                                                <SelectItem key="quiz" itemKey="quiz" value="quiz">Quiz</SelectItem>
                                                <SelectItem key="coding" itemKey="coding" value="coding">Coding Exercise</SelectItem>
                                                <SelectItem key="exercise" itemKey="exercise" value="exercise">Practice Exercise</SelectItem>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Select
                                                label="Status"
                                                value={lessonStatus}
                                                onChange={(e: SelectChangeEvent) => setLessonStatus(e.target.value)}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            >                                                <SelectItem key="active" itemKey="active" value="active">Active</SelectItem>
                                                <SelectItem key="draft" itemKey="draft" value="draft">Draft</SelectItem>
                                                <SelectItem key="archived" itemKey="archived" value="archived">Archived</SelectItem>
                                            </Select>
                                        </div>
                                        <div>
                                            <Input
                                                label="Repository URL"
                                                placeholder="GitHub repository URL"
                                                value={repoUrl}
                                                onChange={(e: InputChangeEvent) => setRepoUrl(e.target.value)}
                                                className="w-full"
                                                classNames={{
                                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex-1">
                                            <Switch
                                                isSelected={!isRequired}
                                                onValueChange={(val) => setIsRequired(!val)}
                                                color="primary"
                                            >
                                                Free Preview Lesson
                                            </Switch>
                                        </div>
                                        <div className="flex-1">
                                            <Switch
                                                isSelected={hasQuiz}
                                                onValueChange={setHasQuiz}
                                                color="primary"
                                            >
                                                Has Quiz
                                            </Switch>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center gap-2">
                                        File
                                    </label>
                                    <div className="border-2 border-dashed border-[color:var(--ai-card-border)] rounded-xl p-4 text-center cursor-pointer hover:bg-[color:var(--ai-card-bg)]/50 transition-all hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg mb-6">
                                        {filePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={filePreview}
                                                    alt="Lesson preview"
                                                    className="w-full h-48 object-cover rounded-lg shadow-md"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                                    <Button
                                                        color="danger"
                                                        variant="flat"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onPress={() => {
                                                            setFile(null);
                                                            setFilePreview(null);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center">
                                                    {lessonType === 'video' ? (
                                                        <FiVideo size={28} className="text-[color:var(--ai-primary)]" />
                                                    ) : lessonType === 'text' ? (
                                                        <FiFileText size={28} className="text-[color:var(--ai-primary)]" />
                                                    ) : (
                                                        <FiFilePlus size={28} className="text-[color:var(--ai-primary)]" />
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm font-medium text-[color:var(--ai-foreground)]">Click to upload lesson file</p>
                                                <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                                                    {lessonType === 'video' ? 'Video up to 100MB' : 'PDF, ZIP, etc. up to 50MB'}
                                                </p>                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept={lessonType === 'video'
                                                        ? "video/*"
                                                        : "application/pdf,image/*,application/zip,application/x-zip-compressed,application/vnd.openxmlformats-officedocument.*"
                                                    }
                                                    aria-label="Upload lesson file"
                                                    title="Upload lesson file"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Learning Objectives
                                        </label>
                                        <div className="flex mb-2">
                                            <Input
                                                placeholder="Add a learning objective"
                                                value={currentObjective}
                                                onChange={(e: InputChangeEvent) => setCurrentObjective(e.target.value)}
                                                onKeyDown={handleObjectiveKeyDown}
                                                startContent={<FiTarget size={18} className="text-[color:var(--ai-muted)]" />}
                                                className="flex-1"
                                            />
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddObjective}
                                                className="ml-2"
                                                isDisabled={!currentObjective}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {learningObjectives.map((objective, index) => (
                                                <Chip
                                                    key={index}
                                                    onClose={() => handleRemoveObjective(objective)}
                                                    startContent={<FiCheckSquare size={16} />}
                                                    variant="flat"
                                                    color="primary"
                                                    className="bg-[color:var(--ai-primary)]/10"
                                                >
                                                    {objective}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Tags
                                        </label>
                                        <div className="flex mb-2">
                                            <Input
                                                placeholder="Add a tag"
                                                value={currentTag}
                                                onChange={(e: InputChangeEvent) => setCurrentTag(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                startContent={<FiTag size={18} className="text-[color:var(--ai-muted)]" />}
                                                className="flex-1"
                                            />
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddTag}
                                                className="ml-2"
                                                isDisabled={!currentTag}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {lessonTags.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    onClose={() => handleRemoveTag(tag)}
                                                    variant="flat"
                                                    color="default"
                                                >
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="content" title="Additional Content">
                    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                        <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                            <FiLayers className="text-[color:var(--ai-primary)]" size={20} />
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Additional Content</h2>
                                <p className="text-[color:var(--ai-muted)] text-sm">Supplementary materials and embeds</p>
                            </div>
                        </CardHeader>
                        <CardBody className="p-6 overflow-visible">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Embed Content
                                        </label>                                            <Select
                                            label="Embed Type"
                                            value={embedType}
                                            onChange={(e: SelectChangeEvent) => setEmbedType(e.target.value as any)}
                                            className="w-full mb-4"
                                        >
                                            <SelectItem key="youtube" itemKey="youtube" value="youtube">YouTube Video</SelectItem>
                                            <SelectItem key="codepen" itemKey="codepen" value="codepen">CodePen</SelectItem>
                                            <SelectItem key="github" itemKey="github" value="github">GitHub Gist</SelectItem>
                                            <SelectItem key="other" itemKey="other" value="other">Other (iframe)</SelectItem>
                                        </Select>
                                        <Input
                                            label="Embed URL"
                                            placeholder={
                                                embedType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                                                    embedType === 'codepen' ? 'https://codepen.io/username/pen/...' :
                                                        embedType === 'github' ? 'https://gist.github.com/username/...' :
                                                            'https://example.com/embed...'
                                            }
                                            value={embedUrl}
                                            onChange={(e: InputChangeEvent) => setEmbedUrl(e.target.value)}
                                            startContent={<FiLink size={18} className="text-[color:var(--ai-muted)]" />}
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            External Resources
                                        </label>
                                        <div className="flex mb-2">
                                            <Input
                                                placeholder="Add a resource URL"
                                                value={currentResource}
                                                onChange={(e: InputChangeEvent) => setCurrentResource(e.target.value)}
                                                onKeyDown={handleResourceKeyDown}
                                                startContent={<FiLink size={18} className="text-[color:var(--ai-muted)]" />}
                                                className="flex-1"
                                            />
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddResource}
                                                className="ml-2"
                                                isDisabled={!currentResource}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-2">
                                            {lessonResources.map((resource, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50">
                                                    <div className="truncate flex-1">
                                                        <a
                                                            href={resource}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[color:var(--ai-primary)] hover:underline truncate inline-block max-w-full"
                                                        >
                                                            {resource}
                                                        </a>
                                                    </div>
                                                    <Button
                                                        color="danger"
                                                        variant="light"
                                                        size="sm"
                                                        onPress={() => handleRemoveResource(resource)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            SEO Keywords
                                        </label>
                                        <div className="flex mb-2">
                                            <Input
                                                placeholder="Add SEO keyword"
                                                value={currentKeyword}
                                                onChange={(e: InputChangeEvent) => setCurrentKeyword(e.target.value)}
                                                onKeyDown={handleKeywordKeyDown}
                                                className="flex-1"
                                            />
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddKeyword}
                                                className="ml-2"
                                                isDisabled={!currentKeyword}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {seoKeywords.map((keyword, index) => (
                                                <Chip
                                                    key={index}
                                                    onClose={() => handleRemoveKeyword(keyword)}
                                                    variant="flat"
                                                    color="secondary"
                                                >
                                                    {keyword}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Additional Files
                                        </label>
                                        <div className="p-4 border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                                            <div className="mb-4">
                                                <label className="flex flex-col items-center justify-center h-24 cursor-pointer bg-[color:var(--ai-card-bg)]/30 rounded-lg border border-[color:var(--ai-card-border)]/50 hover:bg-[color:var(--ai-card-bg)]/60 transition-all">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FiFilePlus size={24} className="text-[color:var(--ai-primary)]" />
                                                        <p className="mt-2 text-sm text-[color:var(--ai-foreground)]">
                                                            {currentAdditionalFile
                                                                ? currentAdditionalFile.name
                                                                : "Click to select a file"
                                                            }
                                                        </p>
                                                    </div>                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleAdditionalFileChange}
                                                        aria-label="Upload additional file"
                                                        title="Upload additional file"
                                                    />
                                                </label>
                                            </div>

                                            {currentAdditionalFile && (
                                                <div className="mb-4">
                                                    <Input
                                                        label="File Description"
                                                        placeholder="Brief description of the file"
                                                        value={currentFileDescription}
                                                        onChange={(e: InputChangeEvent) => setCurrentFileDescription(e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <Button
                                                        color="primary"
                                                        onPress={handleAddAdditionalFile}
                                                        className="w-full"
                                                    >
                                                        Add File
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="space-y-2 mt-4">
                                                {additionalFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50"
                                                    >
                                                        <div className="truncate">
                                                            <p className="font-medium text-[color:var(--ai-foreground)]">{file.name}</p>
                                                            {file.description && (
                                                                <p className="text-xs text-[color:var(--ai-muted)]">{file.description}</p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            color="danger"
                                                            variant="light"
                                                            size="sm"
                                                            onPress={() => handleRemoveAdditionalFile(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                            Transcription
                                        </label>
                                        <Textarea
                                            placeholder="Add transcription for accessibility and SEO"
                                            value={transcription}
                                            onChange={(e: TextareaChangeEvent) => setTranscription(e.target.value)}
                                            minRows={5}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="quiz" title="Quiz & Assessment">
                    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                        <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                            <FiHelpCircle className="text-[color:var(--ai-primary)]" size={20} />
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Quiz & Assessment</h2>
                                <p className="text-[color:var(--ai-muted)] text-sm">Test student knowledge</p>
                            </div>
                        </CardHeader>
                        <CardBody className="p-6 overflow-visible">
                            {!hasQuiz ? (
                                <div className="p-8 text-center">
                                    <FiHelpCircle size={48} className="text-[color:var(--ai-muted)] mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-2">
                                        Quiz is disabled
                                    </h3>
                                    <p className="text-[color:var(--ai-muted)] mb-4">
                                        Enable the quiz feature in the Basic Information tab to add questions.
                                    </p>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        onPress={() => {
                                            setHasQuiz(true);
                                            setActiveTab("basic");
                                        }}
                                    >
                                        Enable Quiz
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
                                            Add Questions
                                        </h3>

                                        <div className="bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50 p-4 mb-6">
                                            <div className="mb-4">
                                                <Input
                                                    label="Question"
                                                    placeholder="Enter your question"
                                                    value={currentQuestion.question}
                                                    onChange={(e: InputChangeEvent) => handleQuestionChange('question', e.target.value)}
                                                    className="mb-4"
                                                />

                                                <div className="space-y-3 mb-4">
                                                    {currentQuestion.options.map((option, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] font-medium">
                                                                {String.fromCharCode(65 + index)}
                                                            </div>
                                                            <Input
                                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                                value={option}
                                                                onChange={(e: InputChangeEvent) => handleOptionChange(index, e.target.value)}
                                                                className="flex-1"
                                                            />
                                                            <Checkbox
                                                                isSelected={currentQuestion.correctOption === index}
                                                                onValueChange={() => handleQuestionChange('correctOption', index)}
                                                                aria-label={`Set option ${String.fromCharCode(65 + index)} as correct`}
                                                                color="success"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <Textarea
                                                    label="Explanation"
                                                    placeholder="Explain the correct answer (optional)"
                                                    value={currentQuestion.explanation}
                                                    onChange={(e: TextareaChangeEvent) => handleQuestionChange('explanation', e.target.value)}
                                                    className="mb-4"
                                                />

                                                <Button
                                                    color="primary"
                                                    onPress={handleAddQuestion}
                                                    isDisabled={!currentQuestion.question || currentQuestion.options.filter(Boolean).length < 2}
                                                    className="w-full"
                                                >
                                                    {currentQuestion.id ? 'Update Question' : 'Add Question'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                                                Quiz Questions ({quizQuestions.length})
                                            </h3>

                                            {quizQuestions.length === 0 ? (
                                                <div className="p-6 text-center bg-[color:var(--ai-card-bg)]/30 rounded-lg border border-dashed border-[color:var(--ai-card-border)]/50">
                                                    <p className="text-[color:var(--ai-muted)]">
                                                        No questions added yet. Add your first question above.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Accordion>
                                                    {quizQuestions.map((question, qIndex) => (
                                                        <AccordionItem
                                                            key={question.id}
                                                            id={question.id}
                                                            title={`Question ${qIndex + 1}: ${question.question}`}
                                                            endContent={
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color="primary"
                                                                        onPress={() => handleEditQuestion(question)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color="danger"
                                                                        onPress={() => handleRemoveQuestion(question.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="space-y-3">
                                                                {question.options.map((option, oIndex) => (
                                                                    <div
                                                                        key={oIndex}
                                                                        className={`p-3 rounded-lg flex items-center gap-2 ${question.correctOption === oIndex
                                                                            ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30'
                                                                            : 'bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/30'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${question.correctOption === oIndex
                                                                            ? 'bg-green-200 dark:bg-green-800/30 text-green-800 dark:text-green-300'
                                                                            : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                                                            } font-medium`}>
                                                                            {String.fromCharCode(65 + oIndex)}
                                                                        </div>
                                                                        <span className={`${question.correctOption === oIndex
                                                                            ? 'text-green-800 dark:text-green-300 font-medium'
                                                                            : 'text-[color:var(--ai-foreground)]'
                                                                            }`}>
                                                                            {option}
                                                                        </span>
                                                                        {question.correctOption === oIndex && (
                                                                            <span className="ml-auto text-green-600 dark:text-green-400 text-sm font-medium">
                                                                                Correct Answer
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {question.explanation && (
                                                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-lg">
                                                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                                                            Explanation:
                                                                        </p>
                                                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                                                            {question.explanation}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
                                            Completion Criteria
                                        </h3>

                                        <div className="bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50 p-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                                                        Required video watch percentage ({completionCriteria.watchPercentage}%)
                                                    </label>                                                    <input
                                                        type="range"
                                                        min="50"
                                                        max="100"
                                                        step="5"
                                                        value={completionCriteria.watchPercentage}
                                                        onChange={(e) => setCompletionCriteria({
                                                            ...completionCriteria,
                                                            watchPercentage: parseInt(e.target.value)
                                                        })}
                                                        className="w-full h-2 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded-lg appearance-none cursor-pointer"
                                                        aria-label="Video watch percentage"
                                                        title="Set required video watch percentage for completion"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    <Switch
                                                        isSelected={completionCriteria.requireQuiz}
                                                        onValueChange={(val) => setCompletionCriteria({
                                                            ...completionCriteria,
                                                            requireQuiz: val
                                                        })}
                                                        color="primary"
                                                    >
                                                        Require quiz completion
                                                    </Switch>

                                                    <Switch
                                                        isSelected={completionCriteria.requireExercise}
                                                        onValueChange={(val) => setCompletionCriteria({
                                                            ...completionCriteria,
                                                            requireExercise: val
                                                        })}
                                                        color="primary"
                                                    >
                                                        Require exercise submission
                                                    </Switch>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            <div className="flex justify-end gap-4 mt-8">
                <Button
                    color="default"
                    variant="flat"
                    onPress={onClose}
                    className="px-6"
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    isLoading={loading}
                    onPress={editMode ? updateLesson : addLesson}
                    className="px-8"
                >
                    {editMode ? 'Update Lesson' : 'Add Lesson'}
                </Button>
            </div>
        </motion.div>
    );
}
