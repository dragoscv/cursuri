# Enhanced Lesson Form Documentation

## Overview

The enhanced LessonForm component in the Cursuri platform provides a comprehensive interface for creating and editing course lessons with advanced features. This document outlines the technical implementation and usage of these features.

## Core Features

### 1. Tabbed Interface

The form is organized into three main tabs for better usability:

- **Basic Information**: Essential lesson details (name, description, type, order, etc.)
- **Additional Content**: Supplementary materials (files, links, embeds, etc.)
- **Quiz & Assessment**: Quiz questions and completion criteria

Implementation:

```tsx
<Tabs
  selectedKey={activeTab}
  onSelectionChange={(key: string | number) => setActiveTab(key as string)}
  className="mb-8"
>
  <Tab key="basic" title="Basic Information">
    {/* Basic information fields */}
  </Tab>
  <Tab key="additional" title="Additional Content">
    {/* Additional content fields */}
  </Tab>
  <Tab key="quiz" title="Quiz & Assessment">
    {/* Quiz and assessment fields */}
  </Tab>
</Tabs>
```

### 2. Module Organization

Lessons can now be organized within modules for better course structure:

- Module selection dropdown in the basic information tab
- Automatic fetching of available modules from the course
- Storage of module association in Firestore

Implementation:

```tsx
// Fetch modules in useEffect
const fetchModules = async () => {
  const modulesRef = collection(firestoreDB, `courses/${courseId}/modules`);
  const modulesSnapshot = await getDocs(modulesRef);
  const modulesData = [];

  modulesSnapshot.forEach((doc) => {
    modulesData.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  setModules(modulesData);
};

// Module selection UI
<Select
  label="Module"
  placeholder="Select a module"
  value={moduleId}
  onChange={(value) => setModuleId(value)}
>
  <SelectItem key="" value="">
    None (Top Level)
  </SelectItem>
  {modules.map((module) => (
    <SelectItem key={module.id} value={module.id}>
      {module.name}
    </SelectItem>
  ))}
</Select>;
```

### 3. Learning Objectives

Clear learning objectives help students understand what they'll gain from the lesson:

- Add multiple learning objectives
- Store objectives as an array in Firestore
- Display objectives to students in the lesson view

Implementation:

```tsx
// State management
const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
const [currentObjective, setCurrentObjective] = useState("");

// Add objective function
const addObjective = () => {
  if (currentObjective.trim()) {
    setLearningObjectives([...learningObjectives, currentObjective.trim()]);
    setCurrentObjective("");
  }
};

// UI implementation
<div>
  <div className="flex gap-2 mb-2">
    <Input
      value={currentObjective}
      onChange={(e) => setCurrentObjective(e.target.value)}
      placeholder="Add a learning objective"
    />
    <Button onPress={addObjective}>Add</Button>
  </div>

  {/* Display existing objectives */}
  <div className="flex flex-wrap gap-2 mt-2">
    {learningObjectives.map((objective, index) => (
      <Chip key={index} onClose={() => removeObjective(index)}>
        {objective}
      </Chip>
    ))}
  </div>
</div>;
```

### 4. Enhanced File Management

The system now supports:

- Primary lesson file (video, PDF, etc.)
- Multiple additional files with descriptions
- Preview capabilities for uploaded files
- File type detection and appropriate handling

Implementation:

```tsx
// Additional files state
const [additionalFiles, setAdditionalFiles] = useState<
  {
    file: File;
    name: string;
    description?: string;
  }[]
>([]);

// Upload function
const handleAdditionalFileUpload = useCallback(() => {
  if (!currentAdditionalFile) return;

  setAdditionalFiles([
    ...additionalFiles,
    {
      file: currentAdditionalFile,
      name: currentAdditionalFile.name,
      description: currentFileDescription,
    },
  ]);

  setCurrentAdditionalFile(null);
  setCurrentFileDescription("");
}, [currentAdditionalFile, currentFileDescription, additionalFiles]);

// Store in Firestore
for (const addFile of additionalFiles) {
  const fileRef = ref(
    firebaseStorage,
    `lessons/${courseId}/resources/${addFile.file.name}_${Date.now()}`
  );
  const fileSnapshot = await uploadBytes(fileRef, addFile.file);
  const fileUrl = await getDownloadURL(fileSnapshot.ref);
  additionalFilesData.push({
    name: addFile.name,
    url: fileUrl,
    description: addFile.description,
  });
}
```

### 5. Quiz System

Interactive quizzes enhance learning with:

- Multiple-choice questions
- Correct answer marking
- Explanations for answers
- Quiz results tracking

Implementation:

```tsx
// Quiz question interface
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

// Question management
const addQuestion = () => {
  if (
    currentQuestion.question &&
    currentQuestion.options.filter((o) => o).length >= 2
  ) {
    setQuizQuestions([...quizQuestions, currentQuestion]);
    setCurrentQuestion({
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
      explanation: "",
    });
  }
};

// Store in Firestore
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
```

### 6. External Content Embedding

Embed various external resources:

- YouTube videos
- CodePen snippets
- GitHub gists
- Generic iframes

Implementation:

```tsx
// Embed state
const [embedUrl, setEmbedUrl] = useState("");
const [embedType, setEmbedType] = useState<
  "youtube" | "codepen" | "github" | "other"
>("youtube");

// Store in lesson object
if (embedUrl) {
  lesson.embedUrl = embedUrl;
  lesson.embedType = embedType;
}
```

### 7. SEO and Accessibility

Improve lesson discoverability and accessibility:

- SEO keywords
- Transcription for video content
- Metadata for improved search

Implementation:

```tsx
// SEO keywords
const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
const [currentKeyword, setCurrentKeyword] = useState("");

// Transcription
const [transcription, setTranscription] = useState("");

// Store in lesson object
if (seoKeywords.length > 0) {
  lesson.seoKeywords = seoKeywords;
}

if (transcription) {
  lesson.transcription = transcription;
}
```

### 8. Completion Criteria

Configure how students complete lessons:

- Video watch percentage requirement
- Quiz completion requirement
- Exercise completion requirement

Implementation:

```tsx
const [completionCriteria, setCompletionCriteria] = useState<{
  watchPercentage: number;
  requireQuiz: boolean;
  requireExercise: boolean;
}>({
  watchPercentage: 80,
  requireQuiz: false,
  requireExercise: false,
});

// Add to lesson object
lesson.completionCriteria = completionCriteria;
```

## Technical Implementation

### Firebase Integration

The enhanced form uses Firebase for:

- **Firestore**: Store lesson metadata, quiz questions, etc.
- **Storage**: Upload and manage lesson files
- **Security Rules**: Ensure proper access control

### Data Flow

1. User fills out the form
2. Form data is validated
3. Files are uploaded to Firebase Storage
4. Metadata is saved to Firestore
5. Quiz questions are stored in a subcollection

### Component Architecture

- **LessonForm**: Main component with tabs and state management
- **AddLesson**: Wrapper component that provides context
- **QA Components**: Specialized components for quiz creation
- **File Upload Components**: Handle file selection and preview

## Future Enhancements

Planned improvements:

1. **Advanced Video Features**:

   - In-browser trimming
   - Chaptering and bookmarks
   - Interactive video elements

2. **AI Integration**:

   - Automatic transcription generation
   - Content summarization
   - Quiz generation from lesson content

3. **Enhanced Interaction**:

   - Drag-and-drop lesson ordering
   - Interactive exercises with code execution
   - Peer review capabilities

4. **Analytics**:
   - Detailed lesson completion metrics
   - Quiz performance analytics
   - Student engagement tracking

## Conclusion

The enhanced LessonForm provides a comprehensive solution for creating rich, interactive course content. By supporting various content types, quizzes, and supplementary materials, it enables instructors to create engaging learning experiences while maintaining proper organization and accessibility.
