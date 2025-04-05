'use client'

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Spinner } from '@heroui/react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string, htmlContent: string) => void;
    placeholder?: string;
    minHeight?: number;
}

// Define types for TinyMCE parameters
interface BlobInfo {
    blob: () => Blob;
    base64: () => string;
    filename: () => string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write your answer here...',
    minHeight = 300
}: RichTextEditorProps) {
    const editorRef = useRef<any>(null);

    return (
        <div className="rich-text-editor">
            <Editor
                apiKey="your-tinymce-api-key" // You'll need to get an API key from TinyMCE
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={value}
                init={{
                    height: minHeight,
                    menubar: false,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | link image media | help',
                    content_style: 'body { font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif; font-size:14px }',
                    placeholder: placeholder,
                    images_upload_handler: async function (blobInfo: BlobInfo, progress: (percent: number) => void) {
                        // This is where you'd implement image upload to Firebase Storage
                        // For now, we'll use a simple Base64 representation
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = function () {
                                resolve(reader.result as string);
                            };
                            reader.onerror = function () {
                                reject(`Error: Could not read file`);
                            };
                            reader.readAsDataURL(blobInfo.blob());
                        });
                    },
                    setup: (editor: any) => {
                        editor.on('change', () => {
                            const content = editor.getContent({ format: 'text' });
                            const htmlContent = editor.getContent();
                            onChange(content, htmlContent);
                        });
                    }
                }}
                onEditorChange={(newValue, editor) => {
                    const content = editor.getContent({ format: 'text' });
                    const htmlContent = editor.getContent();
                    onChange(content, htmlContent);
                }}
            />
        </div>
    );
}

export const RichTextEditorSkeleton = () => {
    return (
        <div className="border border-[color:var(--ai-card-border)]/50 rounded-lg flex items-center justify-center p-6 bg-[color:var(--ai-card-bg)]/30 animate-pulse">
            <Spinner size="lg" color="primary" />
        </div>
    );
};