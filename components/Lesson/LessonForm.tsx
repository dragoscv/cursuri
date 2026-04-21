import React, { useState, useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { firestoreDB, firebaseStorage } from '@/utils/firebase/firebase.config';
import {
  doc,
  addDoc,
  collection,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { motion } from 'framer-motion';
import { FiBook } from '../icons/FeatherIcons';
import {
  FiVideo,
  FiFileText,
  FiHelpCircle,
  FiLink,
  FiTag,
  FiLayers,
  FiFilePlus,
  FiCheckSquare,
  FiTarget,
} from '../icons/AdditionalIcons';
import { LessonFormProps, CourseModule } from '@/types';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select, { SelectItem } from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Chip from '@/components/ui/Chip';
import { Tabs, Tab } from '@heroui/react';
import Accordion, { AccordionItem } from '../ui/Accordion';
import Checkbox from '@/components/ui/Checkbox';
import RichTextEditor from '@/components/Lesson/QA/RichTextEditor';
import LessonAIProcessor from '@/components/Lesson/LessonAIProcessor';

// Hoisted so it isn't re-declared on every render
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface ExistingAdditionalFile {
  url: string;
  name: string;
  description?: string;
  path?: string;
}

interface PendingAdditionalFile {
  file: File;
  name: string;
  description?: string;
}

type FormErrors = {
  lessonName?: string;
  lessonOrder?: string;
  durationMinutes?: string;
  embedUrl?: string;
  repoUrl?: string;
  file?: string;
  quiz?: string;
};

// Maps each error key to the tab that owns the field, used for the
// per-tab error indicator dots in the UI.
const ERROR_TAB_MAP: Record<keyof FormErrors, string> = {
  lessonName: 'basic',
  lessonOrder: 'basic',
  durationMinutes: 'basic',
  file: 'media',
  embedUrl: 'media',
  repoUrl: 'resources',
  quiz: 'quiz',
};

const isValidUrl = (value: string): boolean => {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function LessonForm({ courseId, lessonId, onClose, onSave }: LessonFormProps) {
  const t = useTranslations('lessons.form');
  const { showToast } = useToast();

  // ----- Basic info -----
  const [lessonName, setLessonName] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonOrder, setLessonOrder] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number | string>('');
  const [lessonType, setLessonType] = useState('video');
  const [lessonStatus, setLessonStatus] = useState('active');
  const [moduleId, setModuleId] = useState<string>('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [lessonTags, setLessonTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // ----- Media tab -----
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedType, setEmbedType] = useState<'youtube' | 'codepen' | 'github' | 'other'>('youtube');
  const [transcription, setTranscription] = useState('');

  // ----- Resources tab -----
  const [repoUrl, setRepoUrl] = useState('');
  const [lessonResources, setLessonResources] = useState<string[]>([]);
  const [currentResource, setCurrentResource] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [currentObjective, setCurrentObjective] = useState('');
  const [existingAdditionalFiles, setExistingAdditionalFiles] = useState<ExistingAdditionalFile[]>(
    []
  );
  const [additionalFiles, setAdditionalFiles] = useState<PendingAdditionalFile[]>([]);
  const [currentAdditionalFile, setCurrentAdditionalFile] = useState<File | null>(null);
  const [currentFileDescription, setCurrentFileDescription] = useState('');

  // ----- Quiz tab -----
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: crypto.randomUUID(),
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
  });
  const [completionCriteria, setCompletionCriteria] = useState<{
    watchPercentage: number;
    requireQuiz: boolean;
    requireExercise: boolean;
  }>({
    watchPercentage: 80,
    requireQuiz: false,
    requireExercise: false,
  });

  // ----- SEO tab -----
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');

  // ----- Form-wide -----
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFile, setUploadingFile] = useState<string>('');
  const [additionalFilesProgress, setAdditionalFilesProgress] = useState<{ [key: string]: number }>(
    {}
  );
  const formTopRef = useRef<HTMLDivElement>(null);

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }
  useEffect(() => {
    // Fetch course modules
    const fetchModules = async () => {
      try {
        const modulesRef = collection(firestoreDB, `courses/${courseId}/modules`);
        const modulesSnapshot = await getDocs(modulesRef);
        const modulesData: CourseModule[] = [];

        modulesSnapshot.forEach((doc) => {
          modulesData.push({
            id: doc.id,
            ...doc.data(),
          } as CourseModule);
        });

        setModules(modulesData);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    // Get the highest order number for new lessons
    const fetchNextLessonOrder = async () => {
      if (!lessonId) {
        // Only for new lessons
        try {
          const lessonsRef = collection(firestoreDB, `courses/${courseId}/lessons`);
          const lessonsSnapshot = await getDocs(lessonsRef);

          let maxOrder = -1;
          lessonsSnapshot.forEach((doc) => {
            const lessonData = doc.data();
            const order = lessonData.order || 0;
            if (order > maxOrder) {
              maxOrder = order;
            }
          });

          // Set the next order (maxOrder + 1)
          setLessonOrder(maxOrder + 1);
        } catch (error) {
          console.error('Error fetching lesson order:', error);
        }
      }
    };

    // If lessonId is provided, we're in edit mode - fetch directly from Firestore
    const loadLessonData = async () => {
      if (lessonId && courseId) {
        try {
          setEditMode(true);

          // Fetch lesson data directly from Firestore
          const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
          const lessonDoc = await getDoc(lessonRef);

          if (!lessonDoc.exists()) {
            console.error('Lesson not found:', lessonId);
            return;
          }

          const lesson = lessonDoc.data();

          setLessonName(lesson.name || '');
          setLessonDescription(lesson.description || '');
          setLessonContent(lesson.content || '');
          setRepoUrl(lesson.repoUrl || '');
          setLessonOrder(lesson.order || 0);
          setDurationMinutes(
            typeof lesson.duration === 'number'
              ? lesson.duration
              : lesson.duration
                ? parseInt(String(lesson.duration), 10) || ''
                : ''
          );
          setIsFree(lesson.isFree === true);
          setLessonType(lesson.type?.toString() || 'video');
          setLessonStatus(lesson.status || 'active');
          setLessonResources(
            lesson.resources?.map((r: any) => (typeof r === 'string' ? r : r.url)) || []
          );
          setLessonTags(lesson.tags || []);
          if (lesson.file) {
            setFilePreview(lesson.file);
            // Extract filename from URL or use a generic name
            try {
              const url = new URL(lesson.file);
              const pathname = decodeURIComponent(url.pathname);
              // Extract filename from path like /v0/b/bucket/o/lessons%2FcourseId%2Ffilename
              const match = pathname.match(/lessons[\/\%2F][^\/\%2F]+[\/\%2F]([^?]+)/);
              if (match && match[1]) {
                // Remove timestamp suffix if present (e.g., _1234567890)
                const filename = match[1].replace(/_\d+(\.[^.]+)$/, '$1');
                setExistingFileName(filename);
              } else {
                setExistingFileName('Video File');
              }
            } catch {
              setExistingFileName('Video File');
            }
          }

          // Load extended properties
          setModuleId(lesson.moduleId || '');
          setHasQuiz(lesson.hasQuiz || false);
          setTranscription(lesson.transcription || '');

          // Fetch quiz questions if the lesson has a quiz
          if (lesson.hasQuiz) {
            try {
              const questionsRef = collection(
                firestoreDB,
                `courses/${courseId}/lessons/${lessonId}/quizQuestions`
              );
              const questionsSnapshot = await getDocs(questionsRef);
              const questions: QuizQuestion[] = [];

              questionsSnapshot.forEach((doc) => {
                questions.push({
                  id: doc.id,
                  ...doc.data(),
                } as QuizQuestion);
              });

              if (questions.length > 0) {
                setQuizQuestions(questions);
              }
            } catch (error) {
              console.error('Error fetching quiz questions:', error);
            }
          }

          // Load learning objectives
          if (lesson.learningObjectives) {
            setLearningObjectives(lesson.learningObjectives || []);
          }

          // Load embed information
          if (lesson.embedUrl) {
            setEmbedUrl(lesson.embedUrl || '');
            setEmbedType(lesson.embedType || 'youtube');
          }

          // Load SEO keywords
          if (lesson.seoKeywords) {
            setSeoKeywords(lesson.seoKeywords || []);
          }

          // Load completion criteria
          if (lesson.completionCriteria) {
            setCompletionCriteria(
              lesson.completionCriteria || {
                watchPercentage: 80,
                requireQuiz: false,
                requireExercise: false,
              }
            );
          }

          // Load additional files if any. Existing files come back with `url`,
          // `name`, optional `description`/`path`. They are kept separate from
          // `additionalFiles` (which holds *new* files staged for upload).
          if (Array.isArray(lesson.additionalFiles)) {
            setExistingAdditionalFiles(
              lesson.additionalFiles
                .filter((f: any) => f && (f.url || f.path))
                .map((f: any) => ({
                  url: f.url || '',
                  name: f.name || 'file',
                  description: f.description || '',
                  path: f.path,
                }))
            );
          }
        } catch (error) {
          console.error('Error loading lesson data:', error);
        }
      }
    };

    fetchModules();
    fetchNextLessonOrder();
    loadLessonData();
  }, [lessonId, courseId]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Helper function to sanitize filename for Firebase Storage
  const sanitizeFilename = (filename: string): string => {
    // Remove or replace problematic characters that can cause 412 errors
    return filename
      .normalize('NFD') // Normalize Unicode characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w.-]/g, '_') // Replace non-word chars except dots and hyphens
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 200); // Limit filename length
  };

  /**
   * Validate the form. Returns the new errors object and the first tab that
   * has an error so the UI can switch to it. The video file is only required
   * for new video lessons that don't already have one stored.
   */
  const validateForm = useCallback((): {
    errors: FormErrors;
    firstErrorTab: string | null;
  } => {
    const next: FormErrors = {};

    if (!lessonName.trim()) {
      next.lessonName = t('validationNameRequired');
    } else if (lessonName.trim().length < 3) {
      next.lessonName = t('validationNameMinLength');
    }

    if (Number.isNaN(Number(lessonOrder)) || Number(lessonOrder) < 0) {
      next.lessonOrder = t('validationOrderInvalid');
    }

    if (durationMinutes !== '' && (Number(durationMinutes) < 0 || Number.isNaN(Number(durationMinutes)))) {
      next.durationMinutes = t('validationDurationInvalid');
    }

    if (lessonType === 'video' && !file && !filePreview) {
      next.file = t('validationVideoRequired');
    }

    if (embedUrl && !isValidUrl(embedUrl)) {
      next.embedUrl = t('validationUrlInvalid');
    }

    if (repoUrl && !isValidUrl(repoUrl)) {
      next.repoUrl = t('validationUrlInvalid');
    }

    if (hasQuiz && quizQuestions.length === 0) {
      next.quiz = t('validationQuizMinQuestions');
    }

    let firstErrorTab: string | null = null;
    for (const key of Object.keys(next) as Array<keyof FormErrors>) {
      const tabKey = ERROR_TAB_MAP[key];
      if (tabKey) {
        firstErrorTab = tabKey;
        break;
      }
    }

    return { errors: next, firstErrorTab };
  }, [
    lessonName,
    lessonOrder,
    durationMinutes,
    lessonType,
    file,
    filePreview,
    embedUrl,
    repoUrl,
    hasQuiz,
    quizQuestions.length,
    t,
  ]);

  // Tabs that currently contain at least one error (for the dot indicator)
  const errorTabs = useMemo(() => {
    const set = new Set<string>();
    (Object.keys(errors) as Array<keyof FormErrors>).forEach((key) => {
      if (errors[key]) set.add(ERROR_TAB_MAP[key]);
    });
    return set;
  }, [errors]);

  // Re-validate live after the user has attempted a submit so error
  // indicators clear as fields are fixed.
  useEffect(() => {
    if (!submitAttempted) return;
    const { errors: next } = validateForm();
    setErrors(next);
  }, [submitAttempted, validateForm]);

  const addLesson = useCallback(async () => {
    setSubmitAttempted(true);
    const { errors: validation, firstErrorTab } = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      if (firstErrorTab) setActiveTab(firstErrorTab);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast({
        type: 'warning',
        title: t('validationFailedTitle'),
        message: t('validationFailedMessage'),
        duration: 4000,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    setUploadProgress(0);
    try {
      // Upload main lesson file if provided
      let downloadURL = '';
      if (file) {
        try {
          setUploadingFile(file.name);

          const sanitizedName = sanitizeFilename(file.name);
          const storageRef = ref(firebaseStorage, `lessons/${courseId}/${sanitizedName}_${Date.now()}`);

          // Use uploadBytesResumable for progress tracking
          const uploadTask = uploadBytesResumable(storageRef, file);

          downloadURL = await new Promise<string>((resolve, reject) => {
            let lastLoggedProgress = 0;
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const bytesTransferredMB = (snapshot.bytesTransferred / 1024 / 1024).toFixed(2);
                const totalBytesMB = (snapshot.totalBytes / 1024 / 1024).toFixed(2);

                // Log every 10% progress
                if (progress - lastLoggedProgress >= 10 || progress === 100) {
                  lastLoggedProgress = Math.floor(progress / 10) * 10;
                }

                setUploadProgress(progress);
              },
              (error) => {
                console.error('Upload error:', error);
                setUploadingFile('');
                reject(error);
              },
              async () => {
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  setUploadingFile('');
                  resolve(url);
                } catch (error) {
                  console.error('Error getting download URL:', error);
                  setUploadingFile('');
                  reject(error);
                }
              }
            );
          });

          if (!downloadURL) {
            throw new Error('Failed to get download URL after upload');
          }
        } catch (error) {
          console.error('File upload failed:', error);
          throw new Error(
            `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Upload additional files if any
      const additionalFilesData = [];
      for (let i = 0; i < additionalFiles.length; i++) {
        const addFile = additionalFiles[i];
        setUploadingFile(addFile.name);

        const sanitizedName = sanitizeFilename(addFile.file.name);
        const fileRef = ref(
          firebaseStorage,
          `lessons/${courseId}/resources/${sanitizedName}_${Date.now()}`
        );

        const uploadTask = uploadBytesResumable(fileRef, addFile.file);

        const fileUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setAdditionalFilesProgress((prev) => ({ ...prev, [addFile.name]: progress }));
            },
            (error) => {
              console.error('Additional file upload error:', error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        additionalFilesData.push({
          name: addFile.name,
          url: fileUrl,
          description: addFile.description,
        });
        setUploadingFile('');
      }

      // Create the base lesson object
      const lesson: any = {
        name: lessonName,
        description: lessonDescription,
        content: lessonContent, // Add content field
        repoUrl: repoUrl,
        status: lessonStatus,
        order: Number(lessonOrder),
        duration: durationMinutes ? Number(durationMinutes) : 0,
        isFree: isFree,
        type: lessonType,
        resources: lessonResources,
        additionalFiles: additionalFilesData,
        tags: lessonTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add file URL if a file was uploaded
      if (downloadURL) {
        console.log('Adding file URL to lesson:', downloadURL);
        lesson.file = downloadURL;
      } else {
        console.log('No file URL to add (no file uploaded)');
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
      const lessonDocRef = await addDoc(
        collection(firestoreDB, `courses/${courseId}/lessons`),
        lesson
      );

      // If the lesson has a quiz, add the questions
      if (hasQuiz && quizQuestions.length > 0) {
        const questionsRef = collection(
          firestoreDB,
          `courses/${courseId}/lessons/${lessonDocRef.id}/quizQuestions`
        );

        for (const question of quizQuestions) {
          await addDoc(questionsRef, {
            question: question.question,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation,
          });
        }
      }

      setUploadProgress(0);
      setUploadingFile('');
      setAdditionalFilesProgress({});
      setLoading(false);

      // For new lessons, close the form. For updates, just notify parent to reload data
      if (lessonId && onSave) {
        onSave();
      } else {
        onClose();
      }
    } catch (error) {
      setUploadProgress(0);
      setUploadingFile('');
      setAdditionalFilesProgress({});
      setLoading(false);
      console.error('Error adding lesson:', error);
      showToast({
        type: 'error',
        title: 'Error Adding Lesson',
        message: 'Failed to add lesson. Please try again.',
        duration: 5000,
      });
    }
  }, [
    lessonName,
    lessonDescription,
    lessonContent, // Add to dependencies
    repoUrl,
    courseId,
    file,
    lessonStatus,
    lessonOrder,
    durationMinutes,
    isFree,
    lessonType,
    lessonResources,
    lessonTags,
    onClose,
    moduleId,
    hasQuiz,
    quizQuestions,
    learningObjectives,
    embedUrl,
    embedType,
    transcription,
    additionalFiles,
    seoKeywords,
    completionCriteria,
    validateForm,
    showToast,
    t,
  ]);

  const updateLesson = useCallback(async () => {
    if (!lessonId) return;
    setSubmitAttempted(true);
    const { errors: validation, firstErrorTab } = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      if (firstErrorTab) setActiveTab(firstErrorTab);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast({
        type: 'warning',
        title: t('validationFailedTitle'),
        message: t('validationFailedMessage'),
        duration: 4000,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    setUploadProgress(0);
    try {
      // Create the updated data object
      const updatedData: any = {
        name: lessonName,
        description: lessonDescription,
        content: lessonContent, // Add content field
        repoUrl: repoUrl,
        status: lessonStatus,
        order: Number(lessonOrder),
        duration: durationMinutes ? Number(durationMinutes) : 0,
        isFree: isFree,
        type: lessonType,
        resources: lessonResources,
        tags: lessonTags,
        updatedAt: new Date().toISOString(),
      };

      // Update main file if a new one is provided
      if (file) {
        try {
          setUploadingFile(file.name);

          const sanitizedName = sanitizeFilename(file.name);
          const storageRef = ref(firebaseStorage, `lessons/${courseId}/${sanitizedName}_${Date.now()}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          const downloadURL = await new Promise<string>((resolve, reject) => {
            let lastLoggedProgress = 0;
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const bytesTransferredMB = (snapshot.bytesTransferred / 1024 / 1024).toFixed(2);
                const totalBytesMB = (snapshot.totalBytes / 1024 / 1024).toFixed(2);

                // Log every 10% progress
                if (progress - lastLoggedProgress >= 10 || progress === 100) {
                  lastLoggedProgress = Math.floor(progress / 10) * 10;
                }

                setUploadProgress(progress);
              },
              (error) => {
                console.error('Update upload error:', error);
                setUploadingFile('');
                reject(error);
              },
              async () => {
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  setUploadingFile('');
                  resolve(url);
                } catch (error) {
                  console.error('Error getting download URL on update:', error);
                  setUploadingFile('');
                  reject(error);
                }
              }
            );
          });

          if (!downloadURL) {
            throw new Error('Failed to get download URL after update upload');
          }

          updatedData.file = downloadURL;
        } catch (error) {
          console.error('File upload failed on update:', error);
          throw new Error(
            `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Persist additional files. We always rewrite the array so that
      // existing files removed by the user actually disappear from
      // Firestore. Existing files (already uploaded) are kept by their
      // metadata; new ones are uploaded now.
      const mergedAdditionalFilesData: Array<{
        name: string;
        url: string;
        description?: string;
        path?: string;
      }> = existingAdditionalFiles.map((f) => ({
        name: f.name,
        url: f.url,
        description: f.description,
        path: f.path,
      }));

      for (let i = 0; i < additionalFiles.length; i++) {
        const addFile = additionalFiles[i];
        if (!addFile.file) continue;
        setUploadingFile(addFile.name);

        const sanitizedName = sanitizeFilename(addFile.file.name);
        const storagePath = `lessons/${courseId}/resources/${sanitizedName}_${Date.now()}`;
        const fileRef = ref(firebaseStorage, storagePath);

        const uploadTask = uploadBytesResumable(fileRef, addFile.file);

        const fileUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setAdditionalFilesProgress((prev) => ({ ...prev, [addFile.name]: progress }));
            },
            (error) => {
              console.error('Additional file upload error:', error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        mergedAdditionalFilesData.push({
          name: addFile.name,
          url: fileUrl,
          description: addFile.description,
          path: storagePath,
        });
        setUploadingFile('');
      }
      updatedData.additionalFiles = mergedAdditionalFilesData;

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

      // Sync quiz questions. We delete the previous questions before
      // re-adding the current ones so the collection doesn't accumulate
      // orphan documents (the previous code only marked them as
      // `deleted: true`, leaving them in queries).
      const questionsRef = collection(
        firestoreDB,
        `courses/${courseId}/lessons/${lessonId}/quizQuestions`
      );
      const existingQuestionsSnap = await getDocs(questionsRef);
      await Promise.all(existingQuestionsSnap.docs.map((d) => deleteDoc(d.ref)));

      if (hasQuiz && quizQuestions.length > 0) {
        for (const question of quizQuestions) {
          await addDoc(questionsRef, {
            question: question.question,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation,
          });
        }
      }

      setUploadProgress(0);
      setUploadingFile('');
      setAdditionalFilesProgress({});
      setLoading(false);

      // For updates, notify parent to reload data instead of closing
      if (onSave) {
        console.log('Update completed, notifying parent to reload');
        onSave();
      } else {
        onClose();
      }
    } catch (error) {
      setUploadProgress(0);
      setUploadingFile('');
      setAdditionalFilesProgress({});
      setLoading(false);
      console.error('Error updating lesson:', error);
      showToast({
        type: 'error',
        title: 'Error Updating Lesson',
        message: 'Failed to update lesson. Please try again.',
        duration: 5000,
      });
    }
  }, [
    lessonId,
    courseId,
    lessonName,
    lessonDescription,
    lessonContent,
    repoUrl,
    file,
    lessonStatus,
    lessonOrder,
    durationMinutes,
    isFree,
    lessonType,
    lessonResources,
    lessonTags,
    onClose,
    moduleId,
    hasQuiz,
    quizQuestions,
    learningObjectives,
    embedUrl,
    embedType,
    transcription,
    additionalFiles,
    existingAdditionalFiles,
    seoKeywords,
    completionCriteria,
    validateForm,
    showToast,
    t,
  ]);

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
      setExistingFileName(null); // Clear existing filename when new file is uploaded

      // Clean up previous preview URL if it exists
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }

      if (selectedFile.type.startsWith('video/')) {
        // Create a blob URL for video preview
        const videoUrl = URL.createObjectURL(selectedFile);
        setFilePreview(videoUrl);

        // Extract video duration automatically using a separate video element
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';

        // Flag to prevent multiple callbacks
        let hasProcessed = false;

        const cleanupVideoElement = () => {
          // Remove event listeners to prevent memory leaks and multiple triggers
          videoElement.onloadedmetadata = null;
          videoElement.onerror = null;
          // Clear the src and remove from memory
          videoElement.src = '';
          videoElement.remove();
        };

        videoElement.onloadedmetadata = () => {
          if (hasProcessed) return;
          hasProcessed = true;

          // Get duration in minutes (rounded up)
          const durationInMinutes = Math.ceil(videoElement.duration / 60);

          console.log('Video duration extracted:', {
            seconds: videoElement.duration,
            minutes: durationInMinutes,
          });

          // Auto-fill the duration field
          setDurationMinutes(durationInMinutes.toString());

          // Clean up the temporary video element (but not the preview URL)
          cleanupVideoElement();
        };

        videoElement.onerror = (error) => {
          if (hasProcessed) return;
          hasProcessed = true;

          console.warn(
            'Could not extract video duration automatically. You can enter it manually.',
            error
          );
          // Clean up without triggering another load
          cleanupVideoElement();
        };

        // Use the same blob URL for metadata extraction
        // Wrap in try-catch to handle any edge cases
        try {
          videoElement.src = videoUrl;
        } catch (err) {
          console.warn('Could not load video for duration extraction:', err);
          cleanupVideoElement();
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];

      // Validate file type - check both MIME type and extension
      const fileName = droppedFile.name.toLowerCase();
      const isVideo = droppedFile.type.startsWith('video/') ||
        fileName.endsWith('.mkv') ||
        fileName.endsWith('.mp4') ||
        fileName.endsWith('.webm') ||
        fileName.endsWith('.avi') ||
        fileName.endsWith('.mov');

      const acceptedTypes = lessonType === 'video'
        ? isVideo
        : droppedFile.type.includes('pdf') ||
        droppedFile.type.includes('image') ||
        droppedFile.type.includes('zip') ||
        droppedFile.type.includes('document');

      if (acceptedTypes) {
        // Simulate file input change
        const fileChangeEvent = {
          target: {
            files: [droppedFile]
          }
        } as any;
        handleFileChange(fileChangeEvent);
      } else {
        showToast({
          type: 'error',
          title: 'Invalid File Type',
          message: lessonType === 'video'
            ? 'Please drop a video file'
            : 'Please drop a valid file (PDF, image, ZIP, or document)',
          duration: 4000,
        });
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
      const fileName =
        currentAdditionalFile.name.length > 30
          ? currentAdditionalFile.name.substring(0, 30) + '...'
          : currentAdditionalFile.name;

      setAdditionalFiles([
        ...additionalFiles,
        {
          file: currentAdditionalFile,
          name: fileName,
          description: currentFileDescription,
        },
      ]);

      setCurrentAdditionalFile(null);
      setCurrentFileDescription('');
    }
  };

  // Remove a *new* (not-yet-uploaded) additional file
  const handleRemoveAdditionalFile = (index: number) => {
    const newFiles = [...additionalFiles];
    newFiles.splice(index, 1);
    setAdditionalFiles(newFiles);
  };

  // Remove a previously-uploaded additional file. We also try to delete it
  // from Storage; failure there is non-fatal (the file may already be gone
  // or be referenced by a different document).
  const handleRemoveExistingAdditionalFile = async (index: number) => {
    const removed = existingAdditionalFiles[index];
    setExistingAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    if (removed?.path) {
      try {
        await deleteObject(ref(firebaseStorage, removed.path));
      } catch (err) {
        console.warn('Failed to delete existing additional file from storage:', err);
      }
    }
  };

  // Handle quiz question changes
  const handleQuestionChange = (field: keyof QuizQuestion, value: string | string[] | number) => {
    setCurrentQuestion({
      ...currentQuestion,
      [field]: value,
    });
  };

  // Handle option change for a quiz question
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Add a quiz question
  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.filter((o) => o).length >= 2) {
      setQuizQuestions([...quizQuestions, currentQuestion]);
      setCurrentQuestion({
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
      });
    } else {
      showToast({
        type: 'warning',
        title: 'Invalid Question',
        message: 'A question must have a question text and at least two options.',
        duration: 4000,
      });
    }
  };

  // Remove a quiz question
  const handleRemoveQuestion = (id: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== id));
  };

  // Edit a quiz question
  const handleEditQuestion = (question: QuizQuestion) => {
    setCurrentQuestion(question);
    setQuizQuestions(quizQuestions.filter((q) => q.id !== question.id));
  };

  // Tag/resource/objective/keyword handlers
  const handleAddTag = () => {
    if (currentTag && !lessonTags.includes(currentTag)) {
      setLessonTags([...lessonTags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setLessonTags(lessonTags.filter((t) => t !== tag));
  };

  const handleAddResource = () => {
    if (currentResource && !lessonResources.includes(currentResource)) {
      setLessonResources([...lessonResources, currentResource]);
      setCurrentResource('');
    }
  };

  const handleRemoveResource = (resource: string) => {
    setLessonResources(lessonResources.filter((r) => r !== resource));
  };

  const handleAddObjective = () => {
    if (currentObjective && !learningObjectives.includes(currentObjective)) {
      setLearningObjectives([...learningObjectives, currentObjective]);
      setCurrentObjective('');
    }
  };

  const handleRemoveObjective = (objective: string) => {
    setLearningObjectives(learningObjectives.filter((o) => o !== objective));
  };

  const handleAddKeyword = () => {
    if (currentKeyword && !seoKeywords.includes(currentKeyword)) {
      setSeoKeywords([...seoKeywords, currentKeyword]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keyword));
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
  };

  // Render a tab title with an optional red dot showing the tab has at
  // least one validation error.
  const renderTabTitle = (label: string, hasError: boolean) => (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      {hasError && (
        <span
          className="w-2 h-2 rounded-full bg-red-500"
          aria-label={t('tabHasErrors')}
          title={t('tabHasErrors')}
        />
      )}
    </span>
  );

  const errorCount = Object.keys(errors).length;

  return (
    <motion.div
      ref={formTopRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto pb-32"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 rounded-xl blur-xl"></div>
        <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent backdrop-blur-sm rounded-xl border border-[color:var(--ai-card-border)]/50">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
              {editMode ? t('editLesson') : t('createNewLesson')}
            </h1>
            <p className="text-[color:var(--ai-muted)] mt-2">
              {editMode ? t('updateLessonInfo') : t('addNewLessonDetails')}
            </p>
          </div>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            size="sm"
            className="hover:bg-[color:var(--ai-card-border)]/30 transition-all"
          >
            {t('cancel')}
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key: React.Key) => setActiveTab(String(key))}
        className="mb-8"
      >
        <Tab key="basic" title={renderTabTitle(t('basicInfo'), errorTabs.has('basic'))}>
          <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
            <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
              <FiBook className="text-[color:var(--ai-primary)]" size={20} />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                  {t('basicInfo')}
                </h2>
                <p className="text-[color:var(--ai-muted)] text-sm">{t('basicInfoDesc')}</p>
              </div>
            </CardHeader>
            <CardBody className="p-6 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="relative mb-6">
                    <Input
                      label={t('lessonName')}
                      variant="bordered"
                      placeholder={t('enterLessonName')}
                      value={lessonName}
                      onChange={(e: InputChangeEvent) => setLessonName(e.target.value)}
                      isRequired
                      isInvalid={!!errors.lessonName}
                      errorMessage={errors.lessonName}
                      startContent={<FiBook className="text-[color:var(--ai-muted)]" />}
                      className="bg-[color:var(--ai-card-bg)]/40"
                      classNames={{
                        label: 'text-[color:var(--ai-foreground)] font-medium',
                      }}
                    />
                    <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/50 to-[color:var(--ai-secondary)]/50 mt-1 rounded-full"></div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('lessonDescription')}
                    </label>
                    <RichTextEditor
                      value={lessonDescription}
                      onChange={(_text, html) => setLessonDescription(html)}
                      placeholder={t('provideLessonDesc')}
                      minHeight={250}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('lessonContent')}
                    </label>
                    <RichTextEditor
                      value={lessonContent}
                      onChange={(_text, html) => setLessonContent(html)}
                      placeholder={t('lessonContentPlaceholder')}
                      minHeight={300}
                    />
                    <p className="text-xs text-[color:var(--ai-muted)] mt-2">
                      {t('lessonContentHelp')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Select
                        label={t('module')}
                        placeholder={t('selectModule')}
                        value={moduleId}
                        onChange={(e: SelectChangeEvent) => setModuleId(e.target.value)}
                        className="w-full"
                        classNames={{
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      >
                        {' '}
                        <SelectItem key="" itemKey="" value="">
                          {t('noneTopLevel')}
                        </SelectItem>
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
                        label={t('lessonOrder')}
                        placeholder={t('orderInCourse')}
                        value={lessonOrder.toString()}
                        onChange={(e: InputChangeEvent) =>
                          setLessonOrder(parseInt(e.target.value) || 0)
                        }
                        isInvalid={!!errors.lessonOrder}
                        errorMessage={errors.lessonOrder}
                        className="w-full"
                        classNames={{
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Input
                        type="number"
                        label={t('duration')}
                        placeholder={t('estimatedDuration')}
                        value={durationMinutes.toString()}
                        onChange={(e: InputChangeEvent) =>
                          setDurationMinutes(parseInt(e.target.value) || '')
                        }
                        isInvalid={!!errors.durationMinutes}
                        errorMessage={errors.durationMinutes}
                        className="w-full"
                        classNames={{
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      />
                    </div>
                    <div>
                      <Select
                        label={t('lessonType')}
                        value={lessonType}
                        onChange={(e: SelectChangeEvent) => setLessonType(e.target.value)}
                        className="w-full"
                        classNames={{
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      >
                        {' '}
                        <SelectItem key="video" itemKey="video" value="video">
                          {t('video')}
                        </SelectItem>
                        <SelectItem key="text" itemKey="text" value="text">
                          Text
                        </SelectItem>
                        <SelectItem key="quiz" itemKey="quiz" value="quiz">
                          Quiz
                        </SelectItem>
                        <SelectItem key="coding" itemKey="coding" value="coding">
                          Coding Exercise
                        </SelectItem>
                        <SelectItem key="exercise" itemKey="exercise" value="exercise">
                          Practice Exercise
                        </SelectItem>
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
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      >
                        {' '}
                        <SelectItem key="active" itemKey="active" value="active">
                          {t('statusActive')}
                        </SelectItem>
                        <SelectItem key="draft" itemKey="draft" value="draft">
                          {t('statusDraft')}
                        </SelectItem>
                        <SelectItem key="archived" itemKey="archived" value="archived">
                          {t('statusArchived')}
                        </SelectItem>
                      </Select>
                    </div>
                    <div>
                      <Input
                        label={t('repositoryUrl')}
                        placeholder={t('githubRepoUrl')}
                        value={repoUrl}
                        onChange={(e: InputChangeEvent) => setRepoUrl(e.target.value)}
                        isInvalid={!!errors.repoUrl}
                        errorMessage={errors.repoUrl}
                        className="w-full"
                        classNames={{
                          label: 'text-[color:var(--ai-foreground)] font-medium',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <Switch
                        isSelected={isFree}
                        onValueChange={setIsFree}
                        color="primary"
                      >
                        {t('freePreviewLesson')}
                      </Switch>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center gap-2">
                    {t('file')}
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-6 ${isDragging
                      ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 shadow-xl'
                      : 'border-[color:var(--ai-card-border)] hover:bg-[color:var(--ai-card-bg)]/50 hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {filePreview ? (
                      <div className="relative group">
                        {lessonType === 'video' ? (
                          <div>
                            <video
                              src={filePreview}
                              className="w-full h-48 object-contain rounded-lg shadow-md bg-black relative z-10"
                              controls
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                            {file && (
                              <div className="mt-3 px-4 py-2 bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] rounded-lg">
                                <p className="text-sm text-[color:var(--ai-muted)] flex items-center gap-2">
                                  <FiVideo size={16} className="text-[color:var(--ai-primary)]" />
                                  <span className="font-medium text-[color:var(--ai-foreground)]">{file.name}</span>
                                  <span className="text-xs">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </p>
                              </div>
                            )}
                            {!file && existingFileName && (
                              <div className="mt-3 px-4 py-2 bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] rounded-lg">
                                <p className="text-sm text-[color:var(--ai-muted)] flex items-center gap-2">
                                  <FiVideo size={16} className="text-[color:var(--ai-primary)]" />
                                  <span className="font-medium text-[color:var(--ai-foreground)]">{existingFileName}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <img
                            src={filePreview}
                            alt="Lesson preview"
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                          />
                        )}
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          onPress={() => {
                            if (filePreview && filePreview.startsWith('blob:')) {
                              URL.revokeObjectURL(filePreview);
                            }
                            setFile(null);
                            setFilePreview(null);
                          }}
                        >
                          {t('remove')}
                        </Button>
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
                        <p className="mt-3 text-sm font-medium text-[color:var(--ai-foreground)]">
                          {isDragging ? 'Drop file here' : t('clickToUploadFile')}
                        </p>
                        <p className="text-xs text-[color:var(--ai-muted)] mt-1">
                          {isDragging
                            ? 'Release to upload'
                            : `${lessonType === 'video' ? t('videoUpTo100MB') : t('filesUpTo50MB')} • Or drag and drop`
                          }
                        </p>{' '}
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept={
                            lessonType === 'video'
                              ? 'video/*,.mkv,.mp4,.webm,.avi,.mov'
                              : 'application/pdf,image/*,application/zip,application/x-zip-compressed,application/vnd.openxmlformats-officedocument.*'
                          }
                          aria-label="Upload lesson file"
                          title="Upload lesson file"
                        />
                      </label>
                    )}
                  </div>
                  {errors.file && (
                    <p className="mt-2 mb-4 text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.file}
                    </p>
                  )}

                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('learningObjectives')}
                    </label>
                    <div className="flex mb-2">
                      <Input
                        placeholder={t('addLearningObjective')}
                        value={currentObjective}
                        onChange={(e: InputChangeEvent) => setCurrentObjective(e.target.value)}
                        onKeyDown={handleObjectiveKeyDown}
                        startContent={
                          <FiTarget size={18} className="text-[color:var(--ai-muted)]" />
                        }
                        className="flex-1"
                      />
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={handleAddObjective}
                        className="ml-2"
                        isDisabled={!currentObjective}
                      >
                        {t('add')}
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
                      {t('tags')}
                    </label>
                    <div className="flex mb-2">
                      <Input
                        placeholder={t('addTag')}
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
                        {t('add')}
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

        <Tab key="content" title={renderTabTitle(t('additionalContent'), errorTabs.has('media') || errorTabs.has('resources'))}>
          <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
            <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
              <FiLayers className="text-[color:var(--ai-primary)]" size={20} />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                  {t('additionalContent')}
                </h2>
                <p className="text-[color:var(--ai-muted)] text-sm">
                  {t('supplementaryMaterials')}
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-6 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('embedContent')}
                    </label>{' '}
                    <Select
                      label={t('embedType')}
                      value={embedType}
                      onChange={(e: SelectChangeEvent) => setEmbedType(e.target.value as any)}
                      className="w-full mb-4"
                    >
                      <SelectItem key="youtube" itemKey="youtube" value="youtube">
                        {t('youtubeVideo')}
                      </SelectItem>
                      <SelectItem key="codepen" itemKey="codepen" value="codepen">
                        {t('codepen')}
                      </SelectItem>
                      <SelectItem key="github" itemKey="github" value="github">
                        {t('githubGist')}
                      </SelectItem>
                      <SelectItem key="other" itemKey="other" value="other">
                        {t('otherIframe')}
                      </SelectItem>
                    </Select>
                    <Input
                      label={t('embedUrl')}
                      placeholder={
                        embedType === 'youtube'
                          ? 'https://www.youtube.com/watch?v=...'
                          : embedType === 'codepen'
                            ? 'https://codepen.io/username/pen/...'
                            : embedType === 'github'
                              ? 'https://gist.github.com/username/...'
                              : 'https://example.com/embed...'
                      }
                      value={embedUrl}
                      onChange={(e: InputChangeEvent) => setEmbedUrl(e.target.value)}
                      isInvalid={!!errors.embedUrl}
                      errorMessage={errors.embedUrl}
                      startContent={<FiLink size={18} className="text-[color:var(--ai-muted)]" />}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('externalResources')}
                    </label>
                    <div className="flex mb-2">
                      <Input
                        placeholder={t('addResourceUrl')}
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
                        {t('add')}
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      {lessonResources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50"
                        >
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
                            {t('remove')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('seoKeywords')}
                    </label>
                    <div className="flex mb-2">
                      <Input
                        placeholder={t('addSeoKeyword')}
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
                        {t('add')}
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
                      {t('additionalFiles')}
                    </label>
                    <div className="p-4 border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                      <div className="mb-4">
                        <label className="flex flex-col items-center justify-center h-24 cursor-pointer bg-[color:var(--ai-card-bg)]/30 rounded-lg border border-[color:var(--ai-card-border)]/50 hover:bg-[color:var(--ai-card-bg)]/60 transition-all">
                          <div className="flex flex-col items-center justify-center">
                            <FiFilePlus size={24} className="text-[color:var(--ai-primary)]" />
                            <p className="mt-2 text-sm text-[color:var(--ai-foreground)]">
                              {currentAdditionalFile
                                ? currentAdditionalFile.name
                                : t('clickToSelectFile')}
                            </p>
                          </div>{' '}
                          <input
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
                            label={t('fileDescription')}
                            placeholder={t('briefFileDescription')}
                            value={currentFileDescription}
                            onChange={(e: InputChangeEvent) =>
                              setCurrentFileDescription(e.target.value)
                            }
                            className="mb-2"
                          />
                          <Button
                            color="primary"
                            onPress={handleAddAdditionalFile}
                            className="w-full"
                          >
                            {t('addFile')}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2 mt-4">
                        {existingAdditionalFiles.length > 0 && (
                          <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold mt-2">
                            {t('existingFiles')}
                          </p>
                        )}
                        {existingAdditionalFiles.map((existing, index) => (
                          <div
                            key={`existing-${index}`}
                            className="flex items-center justify-between p-3 bg-[color:var(--ai-success)]/5 rounded-lg border border-[color:var(--ai-success)]/20"
                          >
                            <div className="truncate flex-1 min-w-0">
                              <a
                                href={existing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-[color:var(--ai-primary)] hover:underline truncate inline-block max-w-full"
                              >
                                {existing.name}
                              </a>
                              {existing.description && (
                                <p className="text-xs text-[color:var(--ai-muted)] truncate">
                                  {existing.description}
                                </p>
                              )}
                            </div>
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => handleRemoveExistingAdditionalFile(index)}
                            >
                              {t('remove')}
                            </Button>
                          </div>
                        ))}
                        {additionalFiles.length > 0 && (
                          <p className="text-xs uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold mt-2">
                            {t('newFilesPendingUpload')}
                          </p>
                        )}
                        {additionalFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50"
                          >
                            <div className="truncate">
                              <p className="font-medium text-[color:var(--ai-foreground)]">
                                {file.name}
                              </p>
                              {file.description && (
                                <p className="text-xs text-[color:var(--ai-muted)]">
                                  {file.description}
                                </p>
                              )}
                            </div>
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => handleRemoveAdditionalFile(index)}
                            >
                              {t('remove')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                      {t('transcription')}
                    </label>
                    <Textarea
                      placeholder={t('addTranscriptionPlaceholder')}
                      value={transcription}
                      onChange={(e: TextareaChangeEvent) => setTranscription(e.target.value)}
                      minRows={5}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <LessonAIProcessor
                      courseId={courseId}
                      lessonId={lessonId}
                      videoUrl={filePreview || undefined}
                      onApply={(data) => {
                        if (typeof data.transcription === 'string') {
                          setTranscription(data.transcription);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="quiz" title={renderTabTitle(t('quizAssessment'), errorTabs.has('quiz'))}>
          <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
            <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
              <FiHelpCircle className="text-[color:var(--ai-primary)]" size={20} />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                  {t('quizAssessment')}
                </h2>
                <p className="text-[color:var(--ai-muted)] text-sm">{t('testStudentKnowledge')}</p>
              </div>
            </CardHeader>
            <CardBody className="p-6 overflow-visible">
              <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50">
                <div>
                  <p className="font-medium text-[color:var(--ai-foreground)]">{t('hasQuiz')}</p>
                  <p className="text-sm text-[color:var(--ai-muted)]">
                    {t('hasQuizDescription')}
                  </p>
                </div>
                <Switch isSelected={hasQuiz} onValueChange={setHasQuiz} color="primary" />
              </div>
              {errors.quiz && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-sm text-red-700 dark:text-red-300">
                  {errors.quiz}
                </div>
              )}
              {!hasQuiz ? (
                <div className="p-8 text-center">
                  <FiHelpCircle size={48} className="text-[color:var(--ai-muted)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-2">
                    {t('quizDisabled')}
                  </h3>
                  <p className="text-[color:var(--ai-muted)] mb-4">
                    {t('enableQuizInlineMessage')}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
                      {t('addQuestions')}
                    </h3>

                    <div className="bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50 p-4 mb-6">
                      <div className="mb-4">
                        <Input
                          label={t('question')}
                          placeholder={t('enterYourQuestion')}
                          value={currentQuestion.question}
                          onChange={(e: InputChangeEvent) =>
                            handleQuestionChange('question', e.target.value)
                          }
                          className="mb-4"
                        />

                        <div className="space-y-3 mb-4">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] font-medium">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Input
                                placeholder={t('optionLabel', {
                                  letter: String.fromCharCode(65 + index),
                                })}
                                value={option}
                                onChange={(e: InputChangeEvent) =>
                                  handleOptionChange(index, e.target.value)
                                }
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
                          label={t('explanation')}
                          placeholder={t('explainCorrectAnswer')}
                          value={currentQuestion.explanation}
                          onChange={(e: TextareaChangeEvent) =>
                            handleQuestionChange('explanation', e.target.value)
                          }
                          className="mb-4"
                        />

                        <Button
                          color="primary"
                          onPress={handleAddQuestion}
                          isDisabled={
                            !currentQuestion.question ||
                            currentQuestion.options.filter(Boolean).length < 2
                          }
                          className="w-full"
                        >
                          {currentQuestion.id ? t('updateQuestion') : t('addQuestion')}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                        {t('quizQuestions', { count: quizQuestions.length })}
                      </h3>

                      {quizQuestions.length === 0 ? (
                        <div className="p-6 text-center bg-[color:var(--ai-card-bg)]/30 rounded-lg border border-dashed border-[color:var(--ai-card-border)]/50">
                          <p className="text-[color:var(--ai-muted)]">{t('noQuestionsYet')}</p>
                        </div>
                      ) : (
                        <Accordion>
                          {quizQuestions.map((question, qIndex) => (
                            <AccordionItem
                              key={question.id}
                              id={question.id}
                              title={t('questionNumber', {
                                number: qIndex + 1,
                                question: question.question,
                              })}
                              endContent={
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    onPress={() => handleEditQuestion(question)}
                                  >
                                    {t('edit')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    onPress={() => handleRemoveQuestion(question.id)}
                                  >
                                    {t('delete')}
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
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${question.correctOption === oIndex
                                        ? 'bg-green-200 dark:bg-green-800/30 text-green-800 dark:text-green-300'
                                        : 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]'
                                        } font-medium`}
                                    >
                                      {String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <span
                                      className={`${question.correctOption === oIndex
                                        ? 'text-green-800 dark:text-green-300 font-medium'
                                        : 'text-[color:var(--ai-foreground)]'
                                        }`}
                                    >
                                      {option}
                                    </span>
                                    {question.correctOption === oIndex && (
                                      <span className="ml-auto text-green-600 dark:text-green-400 text-sm font-medium">
                                        {t('correctAnswer')}
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

                </div>
              )}

              {/* Completion criteria is always visible — lessons may require
                  a watch percentage even when no quiz is configured. */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-4">
                  {t('completionCriteria')}
                </h3>

                <div className="bg-[color:var(--ai-card-bg)]/50 rounded-lg border border-[color:var(--ai-card-border)]/50 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[color:var(--ai-foreground)] font-medium mb-2">
                        {t('watchPercentageLabel', { percentage: completionCriteria.watchPercentage })}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={completionCriteria.watchPercentage}
                        onChange={(e) =>
                          setCompletionCriteria({
                            ...completionCriteria,
                            watchPercentage: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] rounded-lg appearance-none cursor-pointer"
                        aria-label={t('watchPercentageAria')}
                        title={t('watchPercentageTitle')}
                      />
                    </div>

                    <div className="flex items-center gap-8 flex-wrap">
                      <Switch
                        isSelected={completionCriteria.requireQuiz}
                        onValueChange={(val) =>
                          setCompletionCriteria({
                            ...completionCriteria,
                            requireQuiz: val,
                          })
                        }
                        color="primary"
                        isDisabled={!hasQuiz}
                      >
                        {t('requireQuizCompletion')}
                      </Switch>

                      <Switch
                        isSelected={completionCriteria.requireExercise}
                        onValueChange={(val) =>
                          setCompletionCriteria({
                            ...completionCriteria,
                            requireExercise: val,
                          })
                        }
                        color="primary"
                      >
                        {t('requireExerciseSubmission')}
                      </Switch>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Upload Progress Indicator */}
      {loading && uploadProgress > 0 && (
        <div className="mb-6 p-4 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[color:var(--ai-primary)] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[color:var(--ai-foreground)]">
                {uploadingFile ? t('uploadingFile', { fileName: uploadingFile }) : t('processing')}
              </span>
            </div>
            <span className="text-sm font-semibold text-[color:var(--ai-primary)]">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-[color:var(--ai-card-border)] rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          {Object.keys(additionalFilesProgress).length > 0 && (
            <div className="mt-3 space-y-2">
              {Object.entries(additionalFilesProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center justify-between text-xs">
                  <span className="text-[color:var(--ai-muted)] truncate max-w-[70%]">
                    {fileName}
                  </span>
                  <span className="text-[color:var(--ai-primary)] font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[color:var(--ai-card-bg)]/95 backdrop-blur-md border-t border-[color:var(--ai-card-border)] shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {errorCount > 0 ? (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {t('errorSummary', { count: errorCount })}
            </p>
          ) : (
            <p className="text-sm text-[color:var(--ai-muted)]">
              {editMode ? t('readyToUpdate') : t('readyToCreate')}
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              color="default"
              variant="flat"
              onPress={onClose}
              className="px-6"
              isDisabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={editMode ? updateLesson : addLesson}
              className="px-8"
              isDisabled={loading}
            >
              {loading && uploadProgress > 0
                ? t('uploadingProgress', { progress: Math.round(uploadProgress) })
                : editMode
                  ? t('updateLesson')
                  : t('addLesson')}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
