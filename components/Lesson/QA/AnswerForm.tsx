'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { Attachment } from '@/types';
import RichTextEditor from './RichTextEditor';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '@/utils/firebase/firebase.config';
import { v4 as uuidv4 } from 'uuid';

interface AnswerFormProps {
  onSubmit: (content: string, htmlContent: string, attachments?: Attachment[]) => void;
  onCancel: () => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ onSubmit, onCancel }) => {
  const t = useTranslations('lessons.qa');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleEditorChange = (text: string, html: string) => {
    setContent(text);
    setHtmlContent(html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(content, htmlContent, attachments);
      setContent('');
      setHtmlContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const storagePath = `attachments/${fileId}.${fileExtension}`;
        const storageRef = ref(firebaseStorage, storagePath);

        // Determine attachment type
        let attachmentType: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) {
          attachmentType = 'image';
        } else if (file.type.startsWith('video/')) {
          attachmentType = 'video';
        }

        // Upload file with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Error uploading file:', error);
              reject(error);
            },
            async () => {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Add attachment to state
              const newAttachment: Attachment = {
                id: fileId,
                type: attachmentType,
                url: downloadURL,
                name: file.name,
                size: file.size,
                mimeType: file.type,
              };

              setAttachments((prev) => [...prev, newAttachment]);
              resolve();
            }
          );
        });
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="w-full">
        <RichTextEditor value={content} onChange={handleEditorChange} minHeight={200} />
      </div>

      {/* Attachment upload */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[color:var(--ai-card-border)]/20 hover:bg-[color:var(--ai-card-border)]/30 cursor-pointer text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          {t('attachFiles')}
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
        {isUploading && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-20 h-1.5 bg-[color:var(--ai-card-border)]/20 rounded-full">
              <div
                className="h-full bg-[color:var(--ai-primary)] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative group">
              {attachment.type === 'image' ? (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-16 w-16 object-cover rounded border border-[color:var(--ai-card-border)]"
                  />
                  <Button
                    type="button"
                    isIconOnly
                    size="sm"
                    variant="danger"
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 p-0 min-w-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove attachment"
                  >
                    ✕
                  </Button>
                </div>
              ) : attachment.type === 'video' ? (
                <div className="relative">
                  <div className="h-16 w-16 bg-[color:var(--ai-card-bg)]/80 rounded border border-[color:var(--ai-card-border)] flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-[color:var(--ai-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <Button
                    type="button"
                    isIconOnly
                    size="sm"
                    variant="danger"
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 p-0 min-w-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove attachment"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div className="h-16 w-16 bg-[color:var(--ai-card-bg)]/80 rounded border border-[color:var(--ai-card-border)] flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-[color:var(--ai-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <Button
                    type="button"
                    isIconOnly
                    size="sm"
                    variant="danger"
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 p-0 min-w-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove attachment"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="flat"
          color="default"
          size="md"
          radius="lg"
          onClick={onCancel}
          type="button"
          className="bg-[color:var(--ai-card-border)]/20 hover:bg-[color:var(--ai-card-border)]/30 rounded-lg"
        >
          {t('cancel')}
        </Button>
        <Button
          color="primary"
          size="md"
          radius="lg"
          type="submit"
          isLoading={isSubmitting}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white rounded-lg font-semibold"
          isDisabled={!content.trim() || isUploading}
        >
          {isSubmitting ? t('submittingAnswer') : t('submitAnswer')}
        </Button>
      </div>
    </form>
  );
};

export default AnswerForm;
