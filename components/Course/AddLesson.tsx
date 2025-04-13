import { useState, useContext, useCallback, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "../Buttons/LoadingButton"
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { Card, CardBody, Textarea, Input, Button, Select, SelectItem, Divider, Chip, Switch } from "@heroui/react";


export default function AddLesson(props: any) {
    const { onClose, courseId, lessonId } = props

    const [lessonName, setLessonName] = useState("")
    const [lessonDescription, setLessonDescription] = useState("")
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<any>(null)
    const [generatingCaptions, setGeneratingCaptions] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [lessonOrder, setLessonOrder] = useState<number>(0)
    const [durationMinutes, setDurationMinutes] = useState<number | string>("")
    const [isRequired, setIsRequired] = useState(true)
    const [lessonType, setLessonType] = useState("video")
    const [lessonStatus, setLessonStatus] = useState("active")
    const [lessonResources, setLessonResources] = useState<string[]>([])
    const [currentResource, setCurrentResource] = useState("")
    const [lessonTags, setLessonTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState("")
    const [previewEnabled, setPreviewEnabled] = useState(true)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { lessons } = context;

    useEffect(() => {
        // If lessonId is provided, we're in edit mode
        if (lessonId && courseId && lessons[courseId] && lessons[courseId][lessonId]) {
            const lesson = lessons[courseId][lessonId]
            setLessonName(lesson.name || "")
            setLessonDescription(lesson.description || "")
            setRepoUrl(lesson.repoUrl || "")
            setEditMode(true)

            // Set additional fields if available
            setLessonOrder(lesson.order || 0)            // Convert duration to minutes if it's stored as a duration string
            setDurationMinutes(lesson.duration ? parseInt(lesson.duration, 10) || "" : "")
            // Use isFree as the inverse of isRequired since that's what's available in the Lesson type
            setIsRequired(lesson.isFree !== true) // If not free, then it's required
            setLessonType(lesson.type?.toString() || "video")
            setLessonStatus(lesson.status || "active")
            // Convert LessonResource[] to string[] if needed
            setLessonResources(lesson.resources?.map(r => typeof r === 'string' ? r : r.url) || [])
            // Handle tags which might not exist on the Lesson type
            setLessonTags((lesson as any).tags || [])
            // Preview enabled can be inferred from isFree property
            setPreviewEnabled(lesson.isFree === true) // If free, it's available in preview

            // Set file preview if there's an existing file
            if (lesson.file) {
                setFilePreview(lesson.file)
            }
        } else if (lessonId && courseId) {
            // If lessonId is provided but not found in context, fetch it directly
            const fetchLessonData = async () => {
                try {
                    const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`)
                    const lessonSnap = await getDoc(lessonRef)

                    if (lessonSnap.exists()) {
                        const lessonData = lessonSnap.data()
                        setLessonName(lessonData.name || "")
                        setLessonDescription(lessonData.description || "")
                        setRepoUrl(lessonData.repoUrl || "")
                        setEditMode(true)

                        // Set additional fields if available
                        setLessonOrder(lessonData.order || 0)
                        setDurationMinutes(lessonData.durationMinutes || "")
                        setIsRequired(lessonData.isRequired !== false) // Default to true if not specified
                        setLessonType(lessonData.type || "video")
                        setLessonStatus(lessonData.status || "active")
                        setLessonResources(lessonData.resources || [])
                        setLessonTags(lessonData.tags || [])
                        setPreviewEnabled(lessonData.previewEnabled !== false) // Default to true if not specified

                        // Set file preview if there's an existing file
                        if (lessonData.file) {
                            setFilePreview(lessonData.file)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching lesson data:", error)
                }
            }

            fetchLessonData()
        }
    }, [lessonId, courseId, lessons]);

    const addLesson = useCallback(async () => {
        setLoading(true)

        if (!file) {
            alert("Please select a file to upload")
            setLoading(false)
            return
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
            }

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
    ]); const updateLesson = useCallback(async () => {
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
    ]);

    const generateCaptionsAndTranscriptions = useCallback(async () => {
        if (!lessonId) return;

        try {
            setGeneratingCaptions(true);

            // Mark the lesson as processing captions
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, { processingCaptions: true });

            // Use the Azure Speech Service utility to process the lesson
            const { processLessonForCaptions } = await import('@/utils/azure/speech');
            await processLessonForCaptions(courseId, lessonId);

            // Show success message
            alert('Captions and translations have been generated successfully!');

        } catch (error) {
            console.error('Error generating captions:', error);

            // Reset processing status in case of error
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, { processingCaptions: false });

            alert(`Failed to generate captions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setGeneratingCaptions(false);
        }
    }, [courseId, lessonId]);    // Handle adding new tag
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

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create video preview URL if the file is a video
            if (selectedFile.type.startsWith('video/')) {
                const url = URL.createObjectURL(selectedFile);
                setFilePreview(url);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                        {editMode ? 'Edit Lesson' : 'Create New Lesson'}
                    </h1>

                    <Button
                        color="default"
                        variant="light"
                        onPress={onClose}
                        size="sm"
                    >
                        Cancel
                    </Button>
                </div>                <Card className="shadow-lg border border-[color:var(--ai-card-border)] overflow-hidden mb-6 rounded-xl">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)]">Basic Information</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>                                <div className="mb-4">
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                    Lesson Name *
                                </label>
                                <Input
                                    variant="bordered"
                                    placeholder="Enter lesson name"
                                    value={lessonName}
                                    onChange={(e) => setLessonName(e.target.value)}
                                    isRequired
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)]",
                                        input: "bg-transparent"
                                    }}
                                />
                            </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                        Lesson Description *
                                    </label>
                                    <Textarea
                                        variant="bordered"
                                        placeholder="Provide a detailed description of the lesson"
                                        value={lessonDescription}
                                        onChange={(e) => setLessonDescription(e.target.value)}
                                        isRequired
                                        minRows={3}
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)]",
                                            input: "bg-transparent"
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                        Repository URL
                                    </label>
                                    <Input
                                        type="url"
                                        variant="bordered"
                                        placeholder="https://github.com/username/repo"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)]",
                                            input: "bg-transparent"
                                        }}
                                    />
                                </div>                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                            Lesson Order
                                        </label>
                                        <Input
                                            type="number"
                                            variant="bordered"
                                            placeholder="Lesson sequence number"
                                            value={lessonOrder.toString()}
                                            onChange={(e) => setLessonOrder(parseInt(e.target.value) || 0)}
                                            classNames={{
                                                label: "text-[color:var(--ai-foreground)]",
                                                input: "bg-transparent"
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                                            Duration (minutes)
                                        </label>
                                        <Input
                                            type="number"
                                            variant="bordered"
                                            placeholder="Duration in minutes"
                                            value={durationMinutes.toString()}
                                            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                            classNames={{
                                                label: "text-[color:var(--ai-foreground)]",
                                                input: "bg-transparent"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">Lesson Video/File</label>
                                    <div className="border-2 border-dashed border-[color:var(--ai-card-border)] rounded-lg p-4 text-center cursor-pointer hover:bg-[color:var(--ai-card-bg)]/50 transition-colors">
                                        {filePreview ? (
                                            <div className="relative">
                                                {filePreview.includes('video') || filePreview.includes('blob:') ? (
                                                    <video
                                                        src={filePreview}
                                                        className="w-full h-48 object-cover rounded-md"
                                                        controls
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <Button
                                                    color="danger"
                                                    variant="flat"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onPress={() => {
                                                        setFile(null);
                                                        setFilePreview(null);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500">Click to upload lesson video/file</p>
                                                <p className="text-xs text-gray-400 mt-1">MP4, WEBM, etc.</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept="video/*,audio/*,.pdf,.ppt,.pptx,.doc,.docx"
                                                />
                                            </label>
                                        )}
                                        {editMode && !file && (
                                            <p className="mt-2 text-xs text-[color:var(--ai-muted)]">
                                                Leave empty to keep the current file
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">                                    <Select
                                    label="Lesson Type"
                                    variant="bordered"
                                    selectedKeys={[lessonType]}
                                    onChange={(e) => setLessonType(e.target.value)}
                                >
                                    <SelectItem key="video">Video</SelectItem>
                                    <SelectItem key="document">Document</SelectItem>
                                    <SelectItem key="quiz">Quiz</SelectItem>
                                    <SelectItem key="assignment">Assignment</SelectItem>
                                    <SelectItem key="code">Coding Exercise</SelectItem>
                                </Select>

                                    <Select
                                        label="Status"
                                        variant="bordered"
                                        selectedKeys={[lessonStatus]}
                                        onChange={(e) => setLessonStatus(e.target.value)}
                                    >
                                        <SelectItem key="active">Active</SelectItem>
                                        <SelectItem key="draft">Draft</SelectItem>
                                        <SelectItem key="archived">Archived</SelectItem>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <Switch
                                            isSelected={isRequired}
                                            onValueChange={setIsRequired}
                                        >
                                            Required for completion
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Switch
                                            isSelected={previewEnabled}
                                            onValueChange={setPreviewEnabled}
                                        >
                                            Available in preview
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>                <Card className="shadow-lg border border-[color:var(--ai-card-border)] overflow-hidden mb-6 rounded-xl">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)]">Additional Resources</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">Lesson Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {lessonTags.map((tag) => (
                                    <Chip
                                        key={tag}
                                        onClose={() => handleRemoveTag(tag)}
                                        variant="flat"
                                        color="primary"
                                    >
                                        {tag}
                                    </Chip>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a tag"
                                    variant="bordered"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button color="primary" onPress={handleAddTag}>Add</Button>
                            </div>
                        </div>

                        <Divider className="my-6" />

                        <div>
                            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">Supplementary Resources</label>
                            <div className="space-y-2 mb-2">
                                {lessonResources.map((resource, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]">
                                        <p className="text-sm">{resource}</p>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            isIconOnly
                                            onPress={() => handleRemoveResource(resource)}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a resource URL or description"
                                    variant="bordered"
                                    value={currentResource}
                                    onChange={(e) => setCurrentResource(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddResource()}
                                />
                                <Button color="primary" onPress={handleAddResource}>Add</Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        color="default"
                        variant="flat"
                        onPress={onClose}
                    >
                        Cancel
                    </Button>

                    {loading ? (
                        <Button color="primary" isLoading>
                            {editMode ? 'Updating...' : 'Creating...'}
                        </Button>
                    ) : (
                        <Button
                            color="primary"
                            onPress={editMode ? updateLesson : addLesson}
                        >
                            {editMode ? 'Update Lesson' : 'Create Lesson'}
                        </Button>
                    )}

                    {editMode && (
                        generatingCaptions ? (
                            <Button
                                color="secondary"
                                isLoading
                            >
                                Generating Captions...
                            </Button>
                        ) : (
                            <Button
                                color="secondary"
                                startContent={(
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                                onPress={generateCaptionsAndTranscriptions}
                            >
                                Generate Captions
                            </Button>
                        )
                    )}
                </div>
            </motion.div>
        </>
    )
}