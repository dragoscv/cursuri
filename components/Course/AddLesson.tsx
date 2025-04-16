import { useState, useContext, useCallback, useEffect } from "react";
import { AppContext } from "@/components/AppContext";
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { FiBook, FiClock, FiLayers, FiFileText, FiUser } from "../icons/FeatherIcons";
import { FiCode, FiDollarSign, FiImage, FiList, FiTag, FiTarget, FiVideo, FiFile } from "../icons/FeatherIconsExtended";
import CaptionsSection from "./CaptionsSection";
// Import UI components
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import Select, { SelectItem } from "@/components/ui/Select";
import LoadingButton from "../Buttons/LoadingButton";
import Switch from "@/components/ui/Switch";
import Chip from "@/components/ui/Chip";
import Tooltip from "@/components/ui/Tooltip";

interface AddLessonProps {
    onClose: () => void;
    courseId: string;
    lessonId?: string;
}

export default function AddLesson(props: AddLessonProps) {
    const { onClose, courseId, lessonId } = props;

    const [lessonName, setLessonName] = useState("");
    const [lessonDescription, setLessonDescription] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatingCaptions, setGeneratingCaptions] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [lessonOrder, setLessonOrder] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number | string>("");
    const [isRequired, setIsRequired] = useState(true);
    const [lessonType, setLessonType] = useState("video");
    const [lessonStatus, setLessonStatus] = useState("active");
    const [lessonResources, setLessonResources] = useState<string[]>([]);
    const [currentResource, setCurrentResource] = useState(""); const [lessonTags, setLessonTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [captionsData, setCaptionsData] = useState<Record<string, { url?: string, content?: string }> | null>(null);
    const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
    const [selectedCaptionLanguage, setSelectedCaptionLanguage] = useState("en-US");

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { lessons } = context;

    useEffect(() => {
        // If lessonId is provided, we're in edit mode
        if (lessonId && courseId && lessons[courseId] && lessons[courseId][lessonId]) {
            const lesson = lessons[courseId][lessonId];
            setLessonName(lesson.name || "");
            setLessonDescription(lesson.description || "");
            setRepoUrl(lesson.repoUrl || "");
            setEditMode(true);

            // Set additional fields if available
            setLessonOrder(lesson.order || 0);
            // Convert duration to minutes if it's stored as a duration string
            setDurationMinutes(lesson.duration ? parseInt(lesson.duration, 10) || "" : "");
            // Use isFree as the inverse of isRequired since that's what's available in the Lesson type
            setIsRequired(lesson.isFree !== true); // If not free, then it's required
            setLessonType(lesson.type?.toString() || "video");
            setLessonStatus(lesson.status || "active");
            // Convert LessonResource[] to string[] if needed
            setLessonResources(lesson.resources?.map(r => typeof r === 'string' ? r : r.url) || []);
            // Handle tags which might not exist on the Lesson type
            setLessonTags((lesson as any).tags || []);
            // Preview enabled can be inferred from isFree property
            setPreviewEnabled(lesson.isFree === true); // If free, it's available in preview            // Set file preview if there's an existing file
            if (lesson.file) {
                setFilePreview(lesson.file);
            }

            // Set captions and transcription data if available
            if (lesson.captions) {
                setCaptionsData(lesson.captions);
            }
            if (lesson.transcription) {
                setTranscriptionText(lesson.transcription);
            }
        } else if (lessonId && courseId) {
            // If lessonId is provided but not found in context, fetch it directly
            const fetchLessonData = async () => {
                try {
                    const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
                    const lessonSnap = await getDoc(lessonRef);

                    if (lessonSnap.exists()) {
                        const lessonData = lessonSnap.data();
                        setLessonName(lessonData.name || "");
                        setLessonDescription(lessonData.description || "");
                        setRepoUrl(lessonData.repoUrl || "");
                        setEditMode(true);

                        // Set additional fields if available
                        setLessonOrder(lessonData.order || 0);
                        setDurationMinutes(lessonData.durationMinutes || "");
                        setIsRequired(lessonData.isRequired !== false); // Default to true if not specified
                        setLessonType(lessonData.type || "video");
                        setLessonStatus(lessonData.status || "active");
                        setLessonResources(lessonData.resources || []);
                        setLessonTags(lessonData.tags || []);
                        setPreviewEnabled(lessonData.previewEnabled !== false); // Default to true if not specified

                        // Set file preview if there's an existing file
                        if (lessonData.file) {
                            setFilePreview(lessonData.file);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching lesson data:", error);
                }
            };

            fetchLessonData();
        }
    }, [lessonId, courseId, lessons]);

    const addLesson = useCallback(async () => {
        setLoading(true);

        if (!file) {
            alert("Please select a file to upload");
            setLoading(false);
            return;
        }

        try {
            const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}_${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Create lesson data with all fields
            const lesson = {
                name: lessonName,
                description: lessonDescription,
                repoUrl: repoUrl,
                file: downloadURL,
                status: lessonStatus,
                order: Number(lessonOrder),
                durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
                isRequired: isRequired,
                type: lessonType,
                resources: lessonResources,
                tags: lessonTags,
                previewEnabled: previewEnabled,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addDoc(collection(firestoreDB, `courses/${courseId}/lessons`), lesson);
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error adding lesson:", error);
            alert("Failed to add lesson. Please try again.");
        }
    }, [
        lessonName, lessonDescription, repoUrl, courseId, file,
        lessonStatus, lessonOrder, durationMinutes, isRequired,
        lessonType, lessonResources, lessonTags, previewEnabled, onClose
    ]);

    const updateLesson = useCallback(async () => {
        if (!lessonId) return;

        setLoading(true);
        try {
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);

            // Prepare updated data with all fields
            const updatedData: any = {
                name: lessonName,
                description: lessonDescription,
                repoUrl: repoUrl,
                status: lessonStatus,
                order: Number(lessonOrder),
                durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
                isRequired: isRequired,
                type: lessonType,
                resources: lessonResources,
                tags: lessonTags,
                previewEnabled: previewEnabled,
                updatedAt: new Date().toISOString()
            };

            if (file) {
                // If file was changed, upload new file first
                const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                updatedData.file = downloadURL;
            }

            // Update the lesson with all data
            await updateDoc(lessonRef, updatedData);
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error updating lesson:", error);
            alert("Failed to update lesson. Please try again.");
        }
    }, [
        lessonId, courseId, lessonName, lessonDescription, repoUrl, file,
        lessonStatus, lessonOrder, durationMinutes, isRequired,
        lessonType, lessonResources, lessonTags, previewEnabled, onClose
    ]); const generateCaptionsAndTranscriptions = useCallback(async () => {
        if (!lessonId) return;

        try {
            setGeneratingCaptions(true);

            // Mark the lesson as processing captions
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, { captionsProcessing: true });

            // Get the video URL from the lesson data
            const lessonDoc = await getDoc(lessonRef);
            if (!lessonDoc.exists()) {
                throw new Error("Lesson not found");
            }

            const lessonData = lessonDoc.data();
            const videoUrl = lessonData.videoUrl;

            if (!videoUrl) {
                throw new Error("No video URL found for this lesson");
            }

            // Call our API to extract audio and generate captions
            const response = await fetch('/api/captions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoUrl,
                    courseId,
                    lessonId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to process captions");
            }

            const data = await response.json();

            // Update local state to display captions immediately
            setTranscriptionText(data.transcription);
            setCaptionsData(data.captions);

            setGeneratingCaptions(false);

            // Success message
            alert("Captions and transcriptions generated successfully! You can now view and download them below.");
        } catch (error) {
            console.error("Error generating captions:", error);
            alert("Failed to generate captions. Please try again.");
            setGeneratingCaptions(false);
        }
    }, [courseId, lessonId]);

    // Type definitions for input event handlers
    type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
    type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
    type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
    type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

    // Handle file selection
    const handleFileChange = (e: InputChangeEvent) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create and set preview - if it's a video, set a generic preview
            if (selectedFile.type.startsWith("video/")) {
                setFilePreview("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxwb2x5Z29uIHBvaW50cz0iMTAgOCAxNiAxMiAxMCAxNiAxMCA4Ij48L3BvbHlnb24+PC9zdmc+");
            } else {
                // For images and other file types, create a data URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            }
        }
    };

    // Handle adding new tag
    const handleAddTag = () => {
        if (currentTag && !lessonTags.includes(currentTag)) {
            setLessonTags([...lessonTags, currentTag]);
            setCurrentTag('');
        }
    };

    // Handle removing tag
    const handleRemoveTag = (tag: string) => {
        setLessonTags(lessonTags.filter(t => t !== tag));
    };

    // Handle adding new resource
    const handleAddResource = () => {
        if (currentResource && !lessonResources.includes(currentResource)) {
            setLessonResources([...lessonResources, currentResource]);
            setCurrentResource('');
        }
    };

    // Handle removing resource
    const handleRemoveResource = (resource: string) => {
        setLessonResources(lessonResources.filter(r => r !== resource));
    };

    return (
        <>
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

                                <Textarea
                                    label="Lesson Description"
                                    variant="bordered"
                                    placeholder="Provide a detailed description of the lesson"
                                    value={lessonDescription}
                                    onChange={(e: TextareaChangeEvent) => setLessonDescription(e.target.value)}
                                    className="mb-6 bg-[color:var(--ai-card-bg)]/40"
                                    isRequired
                                    minRows={5}
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] font-medium"
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <Input
                                        label="Lesson Order"
                                        type="number"
                                        variant="bordered"
                                        placeholder="Lesson sequence"
                                        value={lessonOrder.toString()}
                                        onChange={(e: InputChangeEvent) => setLessonOrder(Number(e.target.value))}
                                        startContent={<FiList className="text-[color:var(--ai-muted)]" />}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    />

                                    <Input
                                        label="Duration (minutes)"
                                        type="number"
                                        variant="bordered"
                                        placeholder="e.g., 15, 30, 45"
                                        value={durationMinutes.toString()}
                                        onChange={(e: InputChangeEvent) => setDurationMinutes(Number(e.target.value))}
                                        startContent={<FiClock className="text-[color:var(--ai-muted)]" />}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    />
                                </div>

                                <Input
                                    label="Repository URL"
                                    type="url"
                                    variant="bordered"
                                    placeholder="https://github.com/username/repo"
                                    value={repoUrl}
                                    onChange={(e: InputChangeEvent) => setRepoUrl(e.target.value)}
                                    startContent={<FiCode className="text-[color:var(--ai-muted)]" />}
                                    className="bg-[color:var(--ai-card-bg)]/40 mb-6"
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] font-medium"
                                    }}
                                />
                            </div>

                            <div>
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center gap-2">
                                        <FiFile className="text-[color:var(--ai-primary)]" /> Lesson Media
                                    </label>
                                    <div className="border-2 border-dashed border-[color:var(--ai-card-border)] rounded-xl p-4 text-center cursor-pointer hover:bg-[color:var(--ai-card-bg)]/50 transition-all hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg">
                                        {filePreview ? (
                                            <div className="relative group">
                                                {lessonType === 'video' ? (
                                                    <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                                                        <FiVideo size={48} className="text-[color:var(--ai-primary)]" />
                                                        <p className="text-sm text-white ml-2">Video file selected</p>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={filePreview}
                                                        alt="Lesson preview"
                                                        className="w-full h-48 object-cover rounded-lg shadow-md"
                                                    />
                                                )}
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
                                                        <FiVideo size={24} className="text-[color:var(--ai-primary)]" />
                                                    ) : (
                                                        <FiFile size={24} className="text-[color:var(--ai-primary)]" />
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm font-medium text-[color:var(--ai-foreground)]">Click to upload {lessonType === 'video' ? 'video' : 'file'}</p>
                                                <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                                                    {lessonType === 'video'
                                                        ? 'MP4, WebM, MKV up to 500MB'
                                                        : 'PDF, PPTX, DOCX up to 100MB'}
                                                </p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept={lessonType === 'video' ? 'video/*' : '*/*'}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="mb-6">
                                        <Select
                                            label="Lesson Type"
                                            variant="bordered"
                                            value={lessonType}
                                            onChange={(e: SelectChangeEvent) => setLessonType(e.target.value)}
                                            className="bg-[color:var(--ai-card-bg)]/40 relative z-10"
                                            startContent={<FiVideo className="text-[color:var(--ai-muted)]" />}
                                            classNames={{
                                                label: "text-[color:var(--ai-foreground)] font-medium",
                                                listboxWrapper: "z-[9999]",
                                                trigger: "focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                                            }}
                                        >
                                            <SelectItem itemKey="video" value="video"
                                                startContent={<Chip color="primary" size="sm" variant="flat">Video</Chip>}
                                            >
                                                Video
                                            </SelectItem>
                                            <SelectItem itemKey="document" value="document"
                                                startContent={<Chip color="secondary" size="sm" variant="flat">Document</Chip>}
                                            >
                                                Document
                                            </SelectItem>
                                            <SelectItem itemKey="quiz" value="quiz"
                                                startContent={<Chip color="warning" size="sm" variant="flat">Quiz</Chip>}
                                            >
                                                Quiz
                                            </SelectItem>
                                            <SelectItem itemKey="assignment" value="assignment"
                                                startContent={<Chip color="success" size="sm" variant="flat">Task</Chip>}
                                            >
                                                Assignment
                                            </SelectItem>
                                        </Select>
                                    </div>

                                    <div className="mb-6">
                                        <Select
                                            label="Status"
                                            variant="bordered"
                                            value={lessonStatus}
                                            onChange={(e: SelectChangeEvent) => setLessonStatus(e.target.value)}
                                            className="bg-[color:var(--ai-card-bg)]/40 relative z-10"
                                            classNames={{
                                                label: "text-[color:var(--ai-foreground)] font-medium",
                                                listboxWrapper: "z-[9999]",
                                                trigger: "focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                                            }}
                                        >
                                            <SelectItem itemKey="active" value="active"
                                                startContent={<Chip color="success" size="sm" variant="flat">Live</Chip>}
                                            >
                                                Active
                                            </SelectItem>
                                            <SelectItem itemKey="draft" value="draft"
                                                startContent={<Chip color="warning" size="sm" variant="flat">Draft</Chip>}
                                            >
                                                Draft
                                            </SelectItem>
                                            <SelectItem itemKey="archived" value="archived"
                                                startContent={<Chip color="default" size="sm" variant="flat">Archive</Chip>}
                                            >
                                                Archived
                                            </SelectItem>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Tooltip
                                        content="Allow users to preview this lesson without purchasing the course"
                                        placement="top"
                                    >
                                        <div className="flex items-center h-[40px] border border-[color:var(--ai-card-border)]/50 rounded-lg px-3">
                                            <Switch
                                                size="sm"
                                                color="primary"
                                                isSelected={previewEnabled}
                                                onValueChange={setPreviewEnabled}
                                            >
                                                Available in preview
                                            </Switch>
                                        </div>
                                    </Tooltip>

                                    <Tooltip
                                        content="This lesson is required to complete the course"
                                        placement="top"
                                    >
                                        <div className="flex items-center h-[40px] border border-[color:var(--ai-card-border)]/50 rounded-lg px-3">
                                            <Switch
                                                size="sm"
                                                color="primary"
                                                isSelected={isRequired}
                                                onValueChange={setIsRequired}
                                            >
                                                Required for completion
                                            </Switch>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <FiLayers className="text-[color:var(--ai-primary)]" size={20} />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Additional Resources</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">Enhance your lesson with related materials</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiTag className="text-[color:var(--ai-primary)]" /> Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 rounded-lg border border-[color:var(--ai-card-border)]/50">
                                        {lessonTags.length > 0 ? lessonTags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                onClose={() => handleRemoveTag(tag)}
                                                variant="flat"
                                                color="primary"
                                                className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 border-none"
                                                classNames={{
                                                    content: "font-medium"
                                                }}
                                            >
                                                {tag}
                                            </Chip>
                                        )) : (
                                            <p className="text-sm text-[color:var(--ai-muted)] italic">No tags added yet</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a tag"
                                            variant="bordered"
                                            value={currentTag}
                                            onChange={(e: InputChangeEvent) => setCurrentTag(e.target.value)}
                                            onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleAddTag()}
                                            className="bg-[color:var(--ai-card-bg)]/40"
                                            startContent={<FiTag className="text-[color:var(--ai-muted)]" size={16} />}
                                        />
                                        <Button
                                            color="primary"
                                            onPress={handleAddTag}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiList className="text-[color:var(--ai-primary)]" /> Resource Links
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {lessonResources.length > 0 ? lessonResources.map((resource, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
                                                <a
                                                    href={resource}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-[color:var(--ai-primary)] hover:underline truncate max-w-[300px]"
                                                >
                                                    {resource}
                                                </a>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    isIconOnly
                                                    onPress={() => handleRemoveResource(resource)}
                                                    className="opacity-60 hover:opacity-100"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">Add supplementary resource links</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a resource URL"
                                            variant="bordered"
                                            value={currentResource}
                                            onChange={(e: InputChangeEvent) => setCurrentResource(e.target.value)}
                                            onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleAddResource()}
                                            className="bg-[color:var(--ai-card-bg)]/40"
                                            startContent={<FiList className="text-[color:var(--ai-muted)]" size={16} />}
                                        />
                                        <Button
                                            color="primary"
                                            onPress={handleAddResource}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/20">
                            <span className="text-[color:var(--ai-primary)] font-bold text-sm">✓</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Lesson Summary</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">Review your lesson details before publishing</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Lesson Name</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)]">{lessonName || 'Not specified'}</p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Type</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)] capitalize">{lessonType}</p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Status</h3>
                                <Chip
                                    color={lessonStatus === "active" ? "success" : lessonStatus === "draft" ? "warning" : "default"}
                                    variant="flat"
                                    size="sm"
                                >
                                    {lessonStatus === "active" ? "Active" : lessonStatus === "draft" ? "Draft" : "Archived"}
                                </Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Captions section positioned outside the Lesson Summary card */}
                {lessonId && lessonType === "video" && (
                    <CaptionsSection
                        lessonId={lessonId}
                        courseId={courseId}
                        captionsData={captionsData}
                        transcriptionText={transcriptionText}
                        hasFileUploaded={!!file || !!filePreview}
                        generatingCaptions={generatingCaptions}
                        onGenerateCaptions={generateCaptionsAndTranscriptions}
                    />
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center mr-3">
                            <FiLayers className="text-[color:var(--ai-primary)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[color:var(--ai-muted)]">Ready to publish?</p>
                            <p className="font-medium text-[color:var(--ai-foreground)]">You can edit this lesson later</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            color="default"
                            variant="flat"
                            onPress={onClose}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>

                        {loading ? (
                            <Button
                                color="primary"
                                isLoading
                                className="min-w-[160px] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                            >
                                {editMode ? 'Updating...' : 'Creating...'}
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                onPress={editMode ? updateLesson : addLesson}
                                className="min-w-[160px] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg shadow-[color:var(--ai-primary)]/20 hover:shadow-[color:var(--ai-primary)]/30 transition-all"
                            >
                                {editMode ? 'Update Lesson' : 'Create Lesson'}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}