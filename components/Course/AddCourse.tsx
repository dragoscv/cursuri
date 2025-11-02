'use client';

import { useState, useContext, useEffect, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { AppContext } from "@/components/AppContext";
import { useToast } from "@/components/Toast/ToastContext";
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { FiClock, FiLayers, FiFileText, FiLink } from "../icons/FeatherIcons";
import { FiCode, FiDollarSign, FiImage, FiList, FiTag, FiTarget } from "../icons/FeatherIconsExtended";
import { StripeProduct } from "@/types/stripe";
import { CourseData } from "@/types/courseData";
// Import UI components
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select, { SelectItem } from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import Chip from "@/components/ui/Chip";
import Tooltip from "@/components/ui/Tooltip";
import CourseNameField from './fields/CourseNameField';
import CourseDescriptionField from './fields/CourseDescriptionField';
import InstructorNameField from './fields/InstructorNameField';
import CourseImageField from './fields/CourseImageField';

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
    const [customPriceAmount, setCustomPriceAmount] = useState("");
    const [customPriceCurrency, setCustomPriceCurrency] = useState("ron");
    const [creatingPrice, setCreatingPrice] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [courseImage, setCourseImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [courseLevel, setCourseLevel] = useState("beginner");
    const [courseCategories, setCourseCategories] = useState<string[]>([]);
    const [courseTags, setCourseTags] = useState<string[]>([]);
    const [courseRequirements, setCourseRequirements] = useState<string[]>([]);
    const [courseObjectives, setCourseObjectives] = useState<string[]>([]);
    const [courseStatus, setCourseStatus] = useState("active");
    const [currentObjective, setCurrentObjective] = useState("");
    const [currentRequirement, setCurrentRequirement] = useState("");
    const [currentTag, setCurrentTag] = useState("");
    const [currentCategory, setCurrentCategory] = useState("");
    const [instructorName, setInstructorName] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [certificateEnabled, setCertificateEnabled] = useState(false);
    const [allowPromoCodes, setAllowPromoCodes] = useState(false);
    const [coursePrerequisites, setCoursePrerequisites] = useState<string[]>([]);
    const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState("");

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { products, courses, user, refreshProducts, refreshCourses } = context;
    const { showToast } = useToast();
    const t = useTranslations('common.notifications');
    const tCourses = useTranslations('courses');

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
                setOriginalImageUrl(course.imageUrl);
            }

            // Set additional fields from metadata if they exist            
            // Set values from course properties
            setCourseLevel(course.level || "beginner");
            setCourseTags(course.tags || []);
            setCourseRequirements(course.requirements || []);
            // Set course objectives (benefits in the Course type)
            setCourseObjectives(course.benefits || []);            // Set prerequisites if they exist
            setCoursePrerequisites(course.prerequisites || []);

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

            // Set certificate and promo codes settings from metadata
            if (course.metadata) {
                // Handle both old single category string and new array format
                if (course.metadata.categories) {
                    setCourseCategories(course.metadata.categories);
                } else if (course.metadata.category) {
                    setCourseCategories([course.metadata.category]);
                } else {
                    setCourseCategories([]);
                }
                setCertificateEnabled(course.metadata.certificateEnabled || false);
                setAllowPromoCodes(course.metadata.allowPromoCodes || false);
            }
        }
    }, [courseId, courses]); const addCourse = useCallback(async () => {
        setLoading(true);
        try {
            const priceProduct = products.find(
                (product: StripeProduct) => product.prices.find((price) => price.id === coursePrice)
            );            // Prepare course data
            const courseData: CourseData = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProductId: priceProduct?.id || null,
                repoUrl: repoUrl,
                status: courseStatus,
                prerequisites: coursePrerequisites,
                benefits: courseObjectives, // Map objectives to benefits as per Course interface
                requirements: courseRequirements,
                level: courseLevel,
                duration: estimatedDuration,
                instructor: instructorName ? { name: instructorName } : "",
                tags: courseTags,
                metadata: {
                    level: courseLevel,
                    categories: courseCategories,
                    tags: courseTags,
                    requirements: courseRequirements,
                    objectives: courseObjectives,
                    instructorName: instructorName,
                    estimatedDuration: estimatedDuration,
                    certificateEnabled: certificateEnabled,
                    allowPromoCodes: allowPromoCodes
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };            // If image is provided, upload it first
            if (courseImage) {
                const storageRef = ref(firebaseStorage, `courses/${courseImage.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, courseImage);
                const downloadURL = await getDownloadURL(snapshot.ref);
                (courseData as CourseData).imageUrl = downloadURL;
            }

            // Add the course to Firestore
            await addDoc(collection(firestoreDB, "courses"), courseData);

            // Refresh courses list to show the new course
            await refreshCourses();

            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Error adding course:", error);
            showToast({
                type: 'error',
                title: 'Error Adding Course',
                message: 'Failed to add course. Please try again.',
                duration: 5000,
            });
        }
    }, [
        products, courseName, courseDescription, coursePrice, repoUrl,
        courseImage, courseLevel, courseCategories, courseTags,
        courseRequirements, courseObjectives, coursePrerequisites, courseStatus, instructorName,
        estimatedDuration, certificateEnabled, allowPromoCodes, onClose, refreshCourses, showToast
    ]);

    const updateCourse = useCallback(async () => {
        if (!courseId) return;

        setLoading(true);
        try {
            const courseRef = doc(firestoreDB, `courses/${courseId}`);
            const priceProduct = products.find((product: StripeProduct) => product.prices.find((price) => price.id === coursePrice));

            // Prepare updated data            
            const updatedData: Partial<CourseData> = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProductId: priceProduct?.id || null,
                repoUrl: repoUrl,
                status: courseStatus,
                prerequisites: coursePrerequisites,
                // Add top-level fields that match Course interface
                level: courseLevel,
                duration: estimatedDuration,
                tags: courseTags,
                requirements: courseRequirements,
                benefits: courseObjectives,
                metadata: {
                    level: courseLevel,
                    categories: courseCategories,
                    tags: courseTags,
                    requirements: courseRequirements,
                    objectives: courseObjectives,
                    instructorName: instructorName,
                    estimatedDuration: estimatedDuration,
                    certificateEnabled: certificateEnabled,
                    allowPromoCodes: allowPromoCodes
                },
                updatedAt: serverTimestamp()
            };

            // Only add instructor if it has a value (Firestore doesn't allow undefined)
            if (instructorName) {
                (updatedData as any).instructor = { name: instructorName };
            }            // If a new image is selected, upload it first
            if (courseImage) {
                const storageRef = ref(firebaseStorage, `courses/${courseId}/${courseImage.name}_${Date.now()}`);
                const snapshot = await uploadBytes(storageRef, courseImage);
                const downloadURL = await getDownloadURL(snapshot.ref);
                (updatedData as CourseData).imageUrl = downloadURL;
            } else if (originalImageUrl) {
                // Preserve the original image URL if no new image was selected
                (updatedData as CourseData).imageUrl = originalImageUrl;
            }

            // Update the course in Firestore
            await updateDoc(courseRef, updatedData);
            setLoading(false);
            // Don't call onClose() to stay on the same page after editing
            // Show success toast to user
            showToast({
                type: 'success',
                title: 'Success',
                message: 'Course updated successfully!',
                duration: 4000,
            });
        } catch (error) {
            setLoading(false);
            console.error("Error updating course:", error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update course. Please try again.',
                duration: 5000,
            });
        }
    }, [
        courseId, courseName, courseDescription, coursePrice, repoUrl, products,
        courseImage, courseLevel, courseCategories, courseTags,
        courseRequirements, courseObjectives, coursePrerequisites, courseStatus, instructorName,
        estimatedDuration, certificateEnabled, allowPromoCodes, onClose
    ]);

    // Type definitions for input event handlers    // Define event types for form handling
    type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
    type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
    type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

    // Handle image file selection
    const handleImageChange = (e: InputChangeEvent) => {
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

    // Handle adding new category
    const handleAddCategory = () => {
        if (currentCategory && !courseCategories.includes(currentCategory)) {
            setCourseCategories([...courseCategories, currentCategory]);
            setCurrentCategory('');
        }
    };

    // Handle removing category
    const handleRemoveCategory = (category: string) => {
        setCourseCategories(courseCategories.filter(c => c !== category));
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

    const handleCreateCustomPrice = async () => {
        if (!customPriceAmount || !courseName) {
            showToast({
                type: 'warning',
                title: t('warning.missingInformation'),
                message: t('warning.missingInformationMessage'),
                duration: 4000
            });
            return;
        }

        setCreatingPrice(true);
        try {
            // Get Firebase ID token for authentication
            const idToken = await user?.getIdToken();
            if (!idToken) {
                throw new Error('You must be logged in to create prices');
            }

            const response = await fetch('/api/stripe/create-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    productName: courseName,
                    productDescription: courseDescription || courseName,
                    amount: Math.round(parseFloat(customPriceAmount) * 100), // Convert to cents
                    currency: customPriceCurrency,
                    metadata: {
                        app: 'cursuri'
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create price');
            }

            const data = await response.json();

            // Update products immediately with the new price (avoids waiting for webhook sync)
            await refreshProducts({
                productId: data.productId,
                productName: data.productName,
                priceId: data.priceId,
                amount: data.amount,
                currency: data.currency
            });

            setCoursePrice(data.priceId);
            setCustomPriceAmount("");

            showToast({
                type: 'success',
                title: t('success.priceCreated'),
                message: t('success.priceCreatedMessage', { amount: data.amount / 100, currency: data.currency.toUpperCase() }),
                duration: 5000
            });
        } catch (error) {
            console.error('Error creating price:', error);
            showToast({
                type: 'error',
                title: t('error.priceCreationFailed'),
                message: error instanceof Error ? error.message : t('error.priceCreationFailedMessage'),
                duration: 6000
            });
        } finally {
            setCreatingPrice(false);
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
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 rounded-xl blur-xl"></div>
                    <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)]/50">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                                {editMode ? t('actions.editCourse') : t('actions.createNewCourse')}
                            </h1>
                            <p className="text-[color:var(--ai-muted)] mt-2">
                                {editMode
                                    ? tCourses('addCourse.updateCourseInfo')
                                    : tCourses('addCourse.addNewCourse')}
                            </p>
                        </div>
                        <Button
                            color="default"
                            variant="light"
                            onPress={onClose}
                            size="sm"
                            className="hover:bg-[color:var(--ai-card-border)]/30 transition-all"
                        >
                            {tCourses('addCourse.cancel')}
                        </Button>
                    </div>
                </div>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                    <CardBody className="p-6 overflow-visible">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="relative mb-6">
                                    <CourseNameField value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                                    <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/50 to-[color:var(--ai-secondary)]/50 mt-1 rounded-full"></div>
                                </div>

                                <CourseDescriptionField value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} />

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <InstructorNameField value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />

                                    <Input
                                        label={tCourses('form.labels.estimatedDuration')}
                                        variant="bordered"
                                        placeholder="e.g., 10 hours, 4 weeks"
                                        value={estimatedDuration}
                                        onChange={(e: InputChangeEvent) => setEstimatedDuration(e.target.value)}
                                        startContent={<FiClock className="text-[color:var(--ai-muted)]" />}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium"
                                        }}
                                    />
                                </div>

                                <Input label={tCourses('form.labels.repositoryUrl')}
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
                                        <FiImage className="text-[color:var(--ai-primary)]" /> {tCourses('addCourse.courseImage')}
                                    </label>
                                    <CourseImageField
                                        imagePreview={imagePreview}
                                        onImageChange={handleImageChange}
                                        onRemoveImage={() => {
                                            setCourseImage(null);
                                            setImagePreview(null);
                                            setOriginalImageUrl(null);
                                        }}
                                    />
                                </div>
                                <div className="mb-6">
                                    <Select
                                        label={tCourses('form.labels.difficultyLevel')}
                                        variant="bordered"
                                        value={courseLevel}
                                        onChange={(e: SelectChangeEvent) => setCourseLevel(e.target.value)}
                                        className="bg-[color:var(--ai-card-bg)]/40 relative z-10"
                                        startContent={<FiTarget className="text-[color:var(--ai-muted)]" />}
                                        classNames={{
                                            label: "text-[color:var(--ai-foreground)] font-medium",
                                            listboxWrapper: "z-[9999]",
                                            trigger: "focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                                        }}
                                    >
                                        <SelectItem itemKey="beginner" value="beginner"
                                            startContent={<Chip color="success" size="sm" variant="flat">Easy</Chip>}
                                        >
                                            {tCourses('addCourse.beginner')}
                                        </SelectItem>
                                        <SelectItem itemKey="intermediate" value="intermediate"
                                            startContent={<Chip color="warning" size="sm" variant="flat">Medium</Chip>}
                                        >
                                            {tCourses('addCourse.intermediate')}
                                        </SelectItem>
                                        <SelectItem itemKey="advanced" value="advanced"
                                            startContent={<Chip color="danger" size="sm" variant="flat">Hard</Chip>}
                                        >
                                            {tCourses('addCourse.advanced')}
                                        </SelectItem>
                                    </Select>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiFileText className="text-[color:var(--ai-primary)]" /> {tCourses('addCourse.category')}
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 rounded-lg border border-[color:var(--ai-card-border)]/50">
                                        {courseCategories.length > 0 ? (
                                            courseCategories.map((category) => (
                                                <Chip key={`category-${category}`}
                                                    onClose={() => handleRemoveCategory(category)}
                                                    variant="flat"
                                                    color="primary"
                                                    className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 border-none"
                                                    classNames={{
                                                        content: "font-medium"
                                                    }}
                                                >
                                                    {category}
                                                </Chip>
                                            ))
                                        ) : (
                                            <p className="text-sm text-[color:var(--ai-muted)] italic">{tCourses('addCourse.noCategorySelected')}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">                                        <Input
                                        placeholder={tCourses('addCourse.addCategory')}
                                        variant="bordered"
                                        value={currentCategory}
                                        onChange={(e: InputChangeEvent) => setCurrentCategory(e.target.value)}
                                        onKeyPress={(e: KeyboardEvent) => {
                                            if (e.key === 'Enter' && currentCategory) {
                                                handleAddCategory();
                                            }
                                        }}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        startContent={<FiFileText className="text-[color:var(--ai-muted)]" size={16} />}
                                        list="categories"
                                        aria-label="Enter a course category"
                                    />
                                        <datalist id="categories">
                                            {courseTags.map((tag, index) => (
                                                <option key={index} value={tag} />
                                            ))}
                                        </datalist>
                                        <Button
                                            color="primary"
                                            onPress={handleAddCategory}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var,--ai-secondary)]"
                                        >
                                            {tCourses('addCourse.add')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Select
                                        label={tCourses('addCourse.status')}
                                        variant="bordered"
                                        value={courseStatus}
                                        onChange={(e: SelectChangeEvent) => setCourseStatus(e.target.value)}
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
                                            {tCourses('addCourse.active')}
                                        </SelectItem>
                                        <SelectItem itemKey="draft" value="draft"
                                            startContent={<Chip color="warning" size="sm" variant="flat">Draft</Chip>}
                                        >
                                            {tCourses('addCourse.draft')}
                                        </SelectItem>
                                        <SelectItem itemKey="archived" value="archived"
                                            startContent={<Chip color="default" size="sm" variant="flat">Archive</Chip>}
                                        >
                                            {tCourses('addCourse.archived')}
                                        </SelectItem>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 block">{tCourses('addCourse.certificate')}</label>
                                    <Tooltip
                                        content={tCourses('addCourse.certificateAvailable')}
                                        placement="top"
                                    >
                                        <div className="flex items-center h-[40px] mt-1 border border-[color:var(--ai-card-border)]/50 rounded-lg px-3">
                                            <Switch
                                                size="sm"
                                                color="primary"
                                                isSelected={certificateEnabled}
                                                onValueChange={setCertificateEnabled}
                                            >
                                                {tCourses('addCourse.certificateUponCompletion')}
                                            </Switch>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl z-10">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent z-10">
                        <FiDollarSign className="text-[color:var(--ai-primary)]" size={20} />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">{tCourses('addCourse.pricing.title')}</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">{tCourses('addCourse.pricing.subtitle')}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 to-[color:var(--ai-secondary)]/5 rounded-xl p-4 mb-6">
                            <p className="text-sm text-[color:var(--ai-muted)]">
                                <span className="font-medium text-[color:var(--ai-foreground)]">{tCourses('addCourse.pricingTip')}</span> {tCourses('addCourse.pricingTipMessage')}
                            </p>
                        </div>                        <Select
                            label={tCourses('form.labels.coursePrice')}
                            variant="bordered"
                            value={coursePrice}
                            onChange={(e: SelectChangeEvent) => setCoursePrice(e.target.value)}
                            className="mb-4 bg-[color:var(--ai-card-bg)]/40 relative z-10" startContent={<FiDollarSign className="text-[color:var(--ai-muted)]" />}
                            aria-label="Select course price"
                            classNames={{
                                label: "text-[color:var(--ai-foreground)] font-medium",
                                listboxWrapper: "z-[9999]",
                                trigger: "focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                            }}
                        >
                            <SelectItem itemKey="" value="">{tCourses('form.labels.selectPrice')}</SelectItem>                            {products && products.length > 0 &&
                                products.map((product: StripeProduct) => (
                                    product.prices &&
                                    product.prices.map((price) => (
                                        <SelectItem itemKey={price.id} value={price.id} key={price.id}>
                                            {product.name} - {(Number(price.unit_amount) / 100).toFixed(2)} {price.currency}
                                        </SelectItem>
                                    ))
                                ))}
                        </Select>

                        <div className="border border-[color:var(--ai-card-border)]/50 rounded-xl p-4 mt-4 bg-[color:var(--ai-card-bg)]/20">
                            <h3 className="text-sm font-medium text-[color:var(--ai-foreground)] mb-3 flex items-center gap-2">
                                <FiDollarSign className="text-[color:var(--ai-primary)]" />
                                {tCourses('addCourse.createNewPrice')}
                            </h3>
                            <p className="text-xs text-[color:var(--ai-muted)] mb-4">
                                {tCourses('addCourse.dontSeePrice')}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input
                                    label={tCourses('form.labels.priceAmount')}
                                    variant="bordered"
                                    placeholder="100.00"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={customPriceAmount}
                                    onChange={(e: InputChangeEvent) => setCustomPriceAmount(e.target.value)}
                                    className="bg-[color:var(--ai-card-bg)]/40"
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] text-sm font-medium"
                                    }}
                                    startContent={<FiDollarSign className="text-[color:var(--ai-muted)]" />}
                                />
                                <Select
                                    label={tCourses('addCourse.currency')}
                                    variant="bordered"
                                    value={customPriceCurrency}
                                    onChange={(e: SelectChangeEvent) => setCustomPriceCurrency(e.target.value)}
                                    className="bg-[color:var(--ai-card-bg)]/40 relative z-10"
                                    classNames={{
                                        label: "text-[color:var(--ai-foreground)] text-sm font-medium",
                                        listboxWrapper: "z-[9999]"
                                    }}
                                >
                                    <SelectItem itemKey="ron" value="ron">{tCourses('addCourse.ronCurrency')}</SelectItem>
                                    <SelectItem itemKey="usd" value="usd">{tCourses('addCourse.usdCurrency')}</SelectItem>
                                    <SelectItem itemKey="eur" value="eur">{tCourses('addCourse.eurCurrency')}</SelectItem>
                                </Select>
                            </div>
                            <Button
                                color="secondary"
                                variant="flat"
                                onPress={handleCreateCustomPrice}
                                isLoading={creatingPrice}
                                isDisabled={!customPriceAmount || !courseName}
                                className="w-full"
                                size="sm"
                            >
                                {creatingPrice ? t('actions.creatingPrice') : t('actions.createPrice')}
                            </Button>
                            {!courseName && (
                                <p className="text-xs text-warning mt-2">{tCourses('addCourse.enterNameFirst')}</p>
                            )}
                        </div>

                        <div className="flex items-center mt-4">
                            <Switch
                                size="sm"
                                color="primary"
                                isSelected={allowPromoCodes}
                                onValueChange={setAllowPromoCodes}
                            >
                                {tCourses('addCourse.allowPromoCodes')}
                            </Switch>
                            <Tooltip
                                content={tCourses('addCourse.promoCodesCheckout')}
                                placement="right"
                            >
                                <div className="ml-1 text-[color:var(--ai-muted)] cursor-help">ⓘ</div>
                            </Tooltip>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
                    <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <FiLayers className="text-[color:var(--ai-primary)]" size={20} />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">{tCourses('form.sections.courseContentDetails')}</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">{tCourses('form.sections.courseContentDetailsDesc')}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiTag className="text-[color:var(--ai-primary)]" /> {tCourses('addCourse.tags')}
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
                                            <p className="text-sm text-[color:var(--ai-muted)] italic">{tCourses('addCourse.noTagsAdded')}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">                                        <Input
                                        placeholder={tCourses('addCourse.addTag')}
                                        variant="bordered"
                                        value={currentTag}
                                        onChange={(e: InputChangeEvent) => setCurrentTag(e.target.value)}
                                        onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleAddTag()}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        startContent={<FiTag className="text-[color:var(--ai-muted)]" size={16} />}
                                        aria-label="Enter a tag name"
                                    />
                                        <Button
                                            color="primary"
                                            onPress={handleAddTag}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var,--ai-secondary)]"
                                        >
                                            {tCourses('addCourse.add')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiTarget className="text-[color:var(--ai-primary]" /> {tCourses('addCourse.whatYouWillLearn')}
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {courseObjectives.length > 0 ? courseObjectives.map((objective, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var,--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
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
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">{tCourses('addCourse.noObjectives')}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">                                        <Input
                                        placeholder={tCourses('addCourse.addObjective')}
                                        variant="bordered"
                                        value={currentObjective}
                                        onChange={(e: InputChangeEvent) => setCurrentObjective(e.target.value)}
                                        onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleAddObjective()}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        startContent={<FiTarget className="text-[color:var(--ai-muted)]" size={16} />}
                                        aria-label="Enter a learning objective"
                                    />
                                        <Button
                                            color="primary"
                                            onPress={handleAddObjective}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var,--ai-secondary)]"
                                        >
                                            {tCourses('addCourse.add')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiList className="text-[color:var(--ai-primary)]" /> {tCourses('addCourse.courseRequirements')}
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {courseRequirements.length > 0 ? courseRequirements.map((requirement, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var,--ai-card-bg)] transition-all">
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
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">{tCourses('addCourse.noPrerequisites')}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">                                        <Input
                                        placeholder={tCourses('addCourse.addRequirement')}
                                        variant="bordered"
                                        value={currentRequirement}
                                        onChange={(e: InputChangeEvent) => setCurrentRequirement(e.target.value)}
                                        onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleAddRequirement()}
                                        className="bg-[color:var(--ai-card-bg)]/40"
                                        startContent={<FiList className="text-[color:var(--ai-muted)]" size={16} />}
                                        aria-label="Enter a course requirement"
                                    />
                                        <Button
                                            color="primary"
                                            onPress={handleAddRequirement}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var,--ai-secondary)]"
                                        >
                                            {tCourses('addCourse.add')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Course Prerequisites */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
                                        <FiLink className="text-[color:var(--ai-primary)]" /> {tCourses('addCourse.coursePrerequisites')}
                                    </label>
                                    <div className="space-y-2 mb-3 min-h-[100px]">
                                        {coursePrerequisites.length > 0 ? coursePrerequisites.map((prerequisiteId) => {
                                            const prerequisiteCourse = courses[prerequisiteId];
                                            return (
                                                <div key={prerequisiteId} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-md overflow-hidden mr-3 bg-[color:var(--ai-card-border)]/30 flex items-center justify-center">
                                                            <FiLink className="text-[color:var(--ai-primary)]" size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{prerequisiteCourse ? prerequisiteCourse.name : prerequisiteId}</p>
                                                            {prerequisiteCourse?.difficulty && (
                                                                <span className="text-xs text-[color:var(--ai-muted)]">{prerequisiteCourse.difficulty}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => setCoursePrerequisites(coursePrerequisites.filter(id => id !== prerequisiteId))}
                                                        className="opacity-60 hover:opacity-100"
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            );
                                        }) : (
                                            <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                                                <p className="text-sm text-[color:var(--ai-muted)] italic">Add prerequisite courses that students should complete first</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">                                        <select
                                        className="flex-1 px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                                        value={selectedPrerequisiteId}
                                        onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
                                        aria-label="Select prerequisite course"
                                    >
                                        <option value="">{tCourses('form.labels.selectPrerequisite')}</option>
                                        {Object.values(courses)
                                            .filter(course =>
                                                // Don't show the current course
                                                course.id !== courseId &&
                                                // Don't show courses already selected
                                                !coursePrerequisites.includes(course.id)
                                            )
                                            .map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                        <Button
                                            color="primary"
                                            onPress={() => {
                                                if (selectedPrerequisiteId && !coursePrerequisites.includes(selectedPrerequisiteId)) {
                                                    setCoursePrerequisites([...coursePrerequisites, selectedPrerequisiteId]);
                                                    setSelectedPrerequisiteId('');
                                                }
                                            }}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                            isDisabled={!selectedPrerequisiteId}
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
                            <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">{tCourses('form.sections.courseSummary')}</h2>
                            <p className="text-[color:var(--ai-muted)] text-sm">{tCourses('form.sections.courseSummaryDesc')}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">{tCourses('addCourse.courseName')}</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)]">{courseName || tCourses('addCourse.notSpecified')}</p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50">
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">{tCourses('addCourse.category')}</h3>
                                <p className="font-medium text-[color:var(--ai-foreground)]">
                                    {courseCategories.length > 0 ? courseCategories.join(', ') : tCourses('addCourse.notSpecified')}
                                </p>
                            </div>
                            <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var,--ai-card-border)]/50">                           <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">{tCourses('addCourse.status')}</h3>
                                <h3 className="text-sm font-medium text-[color:var(--ai-muted)] mb-1">{tCourses('addCourse.status')}</h3>
                                <Chip
                                    color={courseStatus === "active" ? "success" : courseStatus === "draft" ? "warning" : "default"}
                                    variant="flat"
                                    size="sm"
                                >
                                    {courseStatus === "active" ? tCourses('addCourse.active') : courseStatus === "draft" ? tCourses('addCourse.draft') : tCourses('addCourse.archived')}
                                </Chip>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center mr-3">
                                    <FiLayers className="text-[color:var(--ai-primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[color:var(--ai-muted)]">{tCourses('form.sections.afterCreating')}</p>
                                    <p className="font-medium text-[color:var(--ai-foreground)]">{tCourses('admin.addLesson')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    color="default"
                                    variant="flat"
                                    onPress={onClose}
                                    className="min-w-[100px]"
                                >
                                    {tCourses('addCourse.cancel')}
                                </Button>

                                {loading ? (
                                    <Button
                                        color="primary"
                                        isLoading
                                        className="min-w-[160px] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    >
                                        {editMode ? tCourses('addCourse.updating') : tCourses('addCourse.creating')}
                                    </Button>
                                ) : (
                                    <Button
                                        color="primary"
                                        onPress={editMode ? updateCourse : addCourse}
                                        className="min-w-[160px] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-lg shadow-[color:var(--ai-primary)]/20 hover:shadow-[color:var(--ai-primary)]/30 transition-all"
                                    >
                                        {editMode ? t('actions.updateCourse') : t('actions.createCourse')}
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