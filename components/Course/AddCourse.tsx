import { useState, useContext, useEffect, useCallback } from "react";
import { AppContext } from "@/components/AppContext";
import LoadingButton from "../Buttons/LoadingButton";
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader, Textarea, Input, Button, Select, SelectItem, Divider, Chip, Tooltip, Progress, Switch } from "@heroui/react";
import { FiBook, FiClock, FiLayers, FiFileText, FiUser } from "../icons/FeatherIcons";
import { FiCode, FiDollarSign, FiImage, FiList, FiTag, FiTarget } from "../icons/FeatherIconsExtended";
import { Course } from "@/types";

interface AddCourseProps {
    onClose: () => void;
    courseId?: string;
}

export default function AddCourse(props: AddCourseProps) {
    const { onClose, courseId } = props;

    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [coursePrice, setCoursePrice] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [courseImage, setCourseImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [courseLevel, setCourseLevel] = useState("beginner");
    const [courseCategory, setCourseCategory] = useState("");
    const [courseTags, setCourseTags] = useState<string[]>([]);
    const [courseRequirements, setCourseRequirements] = useState<string[]>([]);
    const [courseObjectives, setCourseObjectives] = useState<string[]>([]);
    const [courseStatus, setCourseStatus] = useState("active");
    const [currentObjective, setCurrentObjective] = useState("");
    const [currentRequirement, setCurrentRequirement] = useState("");
    const [currentTag, setCurrentTag] = useState("");
    const [instructorName, setInstructorName] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { products, courses } = context;

    useEffect(() => {
        // If courseId is provided, we're in edit mode
        if (courseId && courses[courseId]) {
            const course = courses[courseId];
            setCourseName(course.name || "");
            setCourseDescription(course.description || "");
            // Convert price to string if it's a number
            setCoursePrice(course.price ? String(course.price) : "");
            setRepoUrl(course.repoUrl || "");
            setEditMode(true);

            // Set image preview if there's an existing image
            if (course.imageUrl) {
                setImagePreview(course.imageUrl);
            }

            // Set additional fields from metadata if they exist            // Set values from course properties
            setCourseLevel(course.level || "beginner");
            // There's no 'category' property on the Course type, so we'll leave it empty or use a custom field
            setCourseCategory("");
            setCourseTags(course.tags || []);
            setCourseRequirements(course.requirements || []);
            // Set course objectives (benefits in the Course type)
            setCourseObjectives(course.benefits || []);

            // Set instructor name - could be string or object
            if (typeof course.instructor === 'string') {
                setInstructorName(course.instructor || "");
            } else if (course.instructor && typeof course.instructor === 'object') {
                setInstructorName(course.instructor.name || "");
            } else {
                setInstructorName("");
            }

            // Set duration
            setEstimatedDuration(course.duration || "");
            setCourseStatus(course.status || "active");
        }
    }, [courseId, courses]);

    const addCourse = useCallback(async () => {
        setLoading(true);
        try {
            const priceProduct = products.find((product: any) => product.prices.find((price: any) => price.id === coursePrice));

            // Prepare course data
            const courseData: any = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProduct: priceProduct,
                repoUrl: repoUrl,
                status: courseStatus,
                metadata: {
                    level: courseLevel,
                    category: courseCategory,
                    tags: courseTags,
                    requirements: courseRequirements,
                    objectives: courseObjectives,
                    instructorName: instructorName,
                    estimatedDuration: estimatedDuration
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // If image is provided, upload it first
            if (courseImage) {
                const storageRef = ref(firebaseStorage, `courses/${courseImage.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, courseImage);
                const downloadURL = await getDownloadURL(snapshot.ref);
                courseData.imageUrl = downloadURL;
            }

            // Add the course to Firestore
            await addDoc(collection(firestoreDB, "courses"), courseData);
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error adding course:", error);
            alert("Failed to add course. Please try again.");
        }
    }, [
        products, courseName, courseDescription, coursePrice, repoUrl,
        courseImage, courseLevel, courseCategory, courseTags,
        courseRequirements, courseObjectives, courseStatus, instructorName,
        estimatedDuration, onClose
    ]);

    const updateCourse = useCallback(async () => {
        if (!courseId) return;

        setLoading(true);
        try {
            const courseRef = doc(firestoreDB, `courses/${courseId}`);
            const priceProduct = products.find((product: any) => product.prices.find((price: any) => price.id === coursePrice));

            // Prepare updated data
            const updatedData: any = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProduct: priceProduct,
                repoUrl: repoUrl,
                status: courseStatus,
                metadata: {
                    level: courseLevel,
                    category: courseCategory,
                    tags: courseTags,
                    requirements: courseRequirements,
                    objectives: courseObjectives,
                    instructorName: instructorName,
                    estimatedDuration: estimatedDuration
                },
                updatedAt: new Date().toISOString()
            };

            // If a new image is selected, upload it first
            if (courseImage) {
                const storageRef = ref(firebaseStorage, `courses/${courseId}/${courseImage.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, courseImage);
                const downloadURL = await getDownloadURL(snapshot.ref);
                updatedData.imageUrl = downloadURL;
            }

            // Update the course in Firestore
            await updateDoc(courseRef, updatedData);
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error updating course:", error);
            alert("Failed to update course. Please try again.");
        }
    }, [
        courseId, courseName, courseDescription, coursePrice, repoUrl, products,
        courseImage, courseLevel, courseCategory, courseTags,
        courseRequirements, courseObjectives, courseStatus, instructorName,
        estimatedDuration, onClose
    ]);

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setCourseImage(selectedFile);

            // Create and set preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    // Handle adding new tag
    const handleAddTag = () => {
        if (currentTag && !courseTags.includes(currentTag)) {
            setCourseTags([...courseTags, currentTag]);
            setCurrentTag('');
        }
    };

    // Handle removing tag
    const handleRemoveTag = (tag: string) => {
        setCourseTags(courseTags.filter(t => t !== tag));
    };

    // Handle adding new objective
    const handleAddObjective = () => {
        if (currentObjective && !courseObjectives.includes(currentObjective)) {
            setCourseObjectives([...courseObjectives, currentObjective]);
            setCurrentObjective('');
        }
    };

    // Handle removing objective
    const handleRemoveObjective = (objective: string) => {
        setCourseObjectives(courseObjectives.filter(o => o !== objective));
    };

    // Handle adding new requirement
    const handleAddRequirement = () => {
        if (currentRequirement && !courseRequirements.includes(currentRequirement)) {
            setCourseRequirements([...courseRequirements, currentRequirement]);
            setCurrentRequirement('');
        }
    };

    // Handle removing requirement
    const handleRemoveRequirement = (requirement: string) => {
        setCourseRequirements(courseRequirements.filter(r => r !== requirement));
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto"
            >                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 rounded-xl blur-xl"></div>
                    <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)]/50">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                                {editMode ? 'Edit Course' : 'Create New Course'}
                            </h1>
                            <p className="text-[color:var(--ai-muted)] mt-2">
                                {editMode
                                    ? 'Update your course information and materials'
                                    : 'Add a new course to your platform with all necessary details'}
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
                            <p className="text-[color:var(--ai-muted)] text-sm">Main details about your course</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <div className="relative mb-6">
                                <Input
                                    label="Course Name"
                                    variant="bordered"
                                    placeholder="Enter course name"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
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
                                label="Course Description"
                                variant="bordered"
                                placeholder="Provide a detailed description of the course"
                                value={courseDescription}
                                onChange={(e) => setCourseDescription(e.target.value)}
                                className="mb-6 bg-[color:var(--ai-card-bg)]/40"
                                isRequired
                                minRows={5}
                                classNames={{
                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                }}
                            />

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <Input
                                    label="Instructor Name"
                                    variant="bordered"
                                    placeholder="Instructor name"
                                    value={instructorName}
                                    onChange={(e) => setInstructorName(e.target.value)}
                                    startContent={<FiUser className="text-[color:var(--ai-muted)]" />}
                                    className="bg-[color:var(--ai-card-bg)]/40"
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] font-medium"
                                    }}
                                />

                                <Input
                                    label="Estimated Duration"
                                    variant="bordered"
                                    placeholder="e.g., 10 hours, 4 weeks"
                                    value={estimatedDuration}
                                    onChange={(e) => setEstimatedDuration(e.target.value)}
                                    startContent={<FiClock className="text-[color:var(--ai-muted)]" />}
                                    className="bg-[color:var(--ai-card-bg)]/40"
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] font-medium"
                                    }}
                                />
                            </div>

                            <Input label="Repository URL"
                                type="url"
                                variant="bordered"
                                placeholder="https://github.com/username/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                startContent={<FiCode className="text-[color:var(--ai-muted)]" />}
                                className="bg-[color:var(--ai-card-bg)]/40 mb-6"
                                classNames={{
                                    label: "text-[color:var(--ai-foreground)] font-medium"
                                }}
                            />
                        </div>

                        <div>
                            <div className="mb-6">                                <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center gap-2">
                                <FiImage className="text-[color:var(--ai-primary)]" /> Course Image
                            </label>
                                <div className="border-2 border-dashed border-[color:var(--ai-card-border)] rounded-xl p-4 text-center cursor-pointer hover:bg-[color:var(--ai-card-bg)]/50 transition-all hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg">
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Course preview"
                                                className="w-full h-48 object-cover rounded-lg shadow-md"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                                <Button
                                                    color="danger"
                                                    variant="flat"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onPress={() => {
                                                        setCourseImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center">
                                                <FiImage size={24} className="text-[color:var(--ai-primary)]" />
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-[color:var(--ai-foreground)]">Click to upload course image</p>
                                            <p className="text-xs text-[color:var(--ai-muted)] mt-1">PNG, JPG, GIF up to 10MB</p>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <Select
                                        label="Difficulty Level"
                                        variant="bordered"
                                        selectedKeys={[courseLevel]}
                                        onChange={(e) => setCourseLevel(e.target.value)}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        startContent={<FiTarget className="text-[color:var(--ai-muted)]" />}
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    >
                                        <SelectItem key="beginner"
                                            startContent={<Chip color="success" size="sm" variant="flat">Easy</Chip>}
                                        >
                                            Beginner
                                        </SelectItem>
                                        <SelectItem key="intermediate"
                                            startContent={<Chip color="warning" size="sm" variant="flat">Medium</Chip>}
                                        >
                                            Intermediate
                                        </SelectItem>
                                        <SelectItem key="advanced"
                                            startContent={<Chip color="danger" size="sm" variant="flat">Hard</Chip>}
                                        >
                                            Advanced
                                        </SelectItem>
                                    </Select>
                                </div>

                                <div>
                                    <Input
                                        label="Category"
                                        variant="bordered"
                                        placeholder="e.g., Web Development"
                                        value={courseCategory}
                                        onChange={(e) => setCourseCategory(e.target.value)}
                                        startContent={<FiFileText className="text-[color:var(--ai-muted)]" />}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Select
                                        label="Status"
                                        variant="bordered"
                                        selectedKeys={[courseStatus]}
                                        onChange={(e) => setCourseStatus(e.target.value)}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    >
                                        <SelectItem key="active"
                                            startContent={<Chip color="success" size="sm" variant="flat">Live</Chip>}
                                        >
                                            Active
                                        </SelectItem>
                                        <SelectItem key="draft"
                                            startContent={<Chip color="warning" size="sm" variant="flat">Draft</Chip>}
                                        >
                                            Draft
                                        </SelectItem>
                                        <SelectItem key="archived"
                                            startContent={<Chip color="default" size="sm" variant="flat">Archive</Chip>}
                                        >
                                            Archived
                                        </SelectItem>
                                    </Select>
                                </div>
                                <div>
                                    <Tooltip content="Course completion certificate will be available">
                                        <div className="flex items-center h-full mt-7">
                                            <Switch
                                                size="sm"
                                                color="primary"
                                            >
                                                Certificate upon completion
                                            </Switch>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    </CardBody>                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <FiDollarSign className="text-[color:var(--ai-primary)]" size={20} />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Pricing</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">Set your course price and payment options</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 to-[color:var(--ai-secondary)]/5 rounded-xl p-4 mb-6">
                            <p className="text-sm text-[color:var(--ai-muted)]">
                                <span className="font-medium text-[color:var(--ai-foreground)]">Pricing Tip:</span> Choose a competitive price that reflects the value of your course content and target audience.
                            </p>
                        </div>

                        <Select
                            label="Course Price"
                            variant="bordered"
                            selectedKeys={coursePrice ? [coursePrice] : []}
                            onChange={(e) => setCoursePrice(e.target.value)}
                            className="mb-4 bg-[color:var(--ai-card-bg)]/40"
                            startContent={<FiDollarSign className="text-[color:var(--ai-muted)]" />}
                            classNames={{
                                label: "text-[color:var(--ai-foreground)] font-medium"
                            }}
                        >
                            <SelectItem key="">Select a price</SelectItem>
                            {products.map((product: any) => (
                                product.prices.map((price: any) => (
                                    <SelectItem key={price.id}>
                                        {product.name} - {(Number(price.unit_amount) / 100).toFixed(2)} {price.currency}
                                    </SelectItem>
                                ))
                            ))}
                        </Select>

                        <div className="flex items-center mt-4">
                            <Switch
                                size="sm"
                                color="primary"
                            >
                                Allow promotion codes
                            </Switch>
                            <Tooltip content="Students can use promotion codes at checkout">
                                <div className="ml-1 text-[color:var(--ai-muted)]">ⓘ</div>
                            </Tooltip>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <FiLayers className="text-[color:var(--ai-primary)]" size={20} />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Course Content Details</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">Enhance your course with additional information</p>
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
                                        {courseTags.length > 0 ? courseTags.map((tag) => (
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
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
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

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiTarget className="text-[color:var(--ai-primary)]" /> What You'll Learn
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {courseObjectives.length > 0 ? courseObjectives.map((objective, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
                                                <p className="text-sm">{objective}</p>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    isIconOnly
                                                    onPress={() => handleRemoveObjective(objective)}
                                                    className="opacity-60 hover:opacity-100"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">Add learning objectives for your course</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a learning objective"
                                            variant="bordered"
                                            value={currentObjective}
                                            onChange={(e) => setCurrentObjective(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                                            className="bg-[color:var(--ai-card-bg)]/40"
                                            startContent={<FiTarget className="text-[color:var(--ai-muted)]" size={16} />}
                                        />
                                        <Button
                                            color="primary"
                                            onPress={handleAddObjective}
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
                                        <FiList className="text-[color:var(--ai-primary)]" /> Course Requirements
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {courseRequirements.length > 0 ? courseRequirements.map((requirement, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
                                                <p className="text-sm">{requirement}</p>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    isIconOnly
                                                    onPress={() => handleRemoveRequirement(requirement)}
                                                    className="opacity-60 hover:opacity-100"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">Add prerequisites or requirements for your course</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a requirement"
                                            variant="bordered"
                                            value={currentRequirement}
                                            onChange={(e) => setCurrentRequirement(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                                            className="bg-[color:var(--ai-card-bg)]/40"
                                            startContent={<FiList className="text-[color:var(--ai-muted)]" size={16} />}
                                        />
                                        <Button
                                            color="primary"
                                            onPress={handleAddRequirement}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/20">
                            <span className="text-[color:var(--ai-primary)] font-bold text-sm">✓</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Course Summary</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">Review your course details before publishing</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Course Name</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)]">{courseName || 'Not specified'}</p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Category</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)]">{courseCategory || 'Not specified'}</p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">Status</h3>
                                <Chip
                                    color={courseStatus === "active" ? "success" : courseStatus === "draft" ? "warning" : "default"}
                                    variant="flat"
                                    size="sm"
                                >
                                    {courseStatus === "active" ? "Active" : courseStatus === "draft" ? "Draft" : "Archived"}
                                </Chip>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center mr-3">
                                    <FiLayers className="text-[color:var(--ai-primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[color:var(--ai-muted)]">After creating your course</p>
                                    <p className="font-medium text-[color:var(--ai-foreground)]">You'll be able to add lessons</p>
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
                                        onPress={editMode ? updateCourse : addCourse}
                                        className="min-w-[160px] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg shadow-[color:var(--ai-primary)]/20 hover:shadow-[color:var(--ai-primary)]/30 transition-all"
                                    >
                                        {editMode ? 'Update Course' : 'Create Course'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </>
    );
}