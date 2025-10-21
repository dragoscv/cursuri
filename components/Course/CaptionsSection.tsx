import React, { useState } from 'react';
import { FiFileText } from '../icons/FeatherIcons';
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

// Language display names for captions
const supportedLanguages: Record<string, string> = {
    "en-US": "English (US)",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "it-IT": "Italian",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "pt-BR": "Portuguese",
    "zh-CN": "Chinese (Simplified)",
    "ru-RU": "Russian",
};

interface CaptionsSectionProps {
    lessonId: string | undefined;
    courseId: string;
    captionsData: Record<string, { url?: string, content?: string }> | null;
    transcriptionText: string | null;
    hasFileUploaded: boolean;
    generatingCaptions: boolean;
    onGenerateCaptions: () => void;
}

const CaptionsSection: React.FC<CaptionsSectionProps> = ({
    lessonId,
    courseId,
    captionsData,
    transcriptionText,
    hasFileUploaded,
    generatingCaptions,
    onGenerateCaptions
}) => {
    const [selectedCaptionLanguage, setSelectedCaptionLanguage] = useState<string>("en-US");

    if (!lessonId) return null;

    return (
        <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden mb-8 hover:shadow-[color:var(--ai-primary)]/5 transition-all">
            <CardHeader className="flex gap-3 px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/20">
                    <FiFileText size={12} className="text-[color:var(--ai-primary)]" />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Captions & Transcription</h2>
                    {captionsData && Object.keys(captionsData).length > 0 ? (
                        <p className="text-[color:var(--ai-muted)] text-sm">
                            Available in {Object.keys(captionsData).length} language{Object.keys(captionsData).length > 1 ? 's' : ''}
                        </p>
                    ) : (
                        <p className="text-[color:var(--ai-muted)] text-sm">
                            Generate automatic captions for your video
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardBody className="p-6">                {/* Check for valid caption data with actual content - not just presence of an empty object */}
                {(!captionsData || Object.keys(captionsData).length === 0 || !transcriptionText) ? (
                    // No captions yet - show generate button
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center mb-4">
                            <FiFileText size={24} className="text-[color:var(--ai-primary)]" />
                        </div>
                        <h3 className="text-base font-medium text-[color:var(--ai-foreground)] mb-2">No Captions Generated Yet</h3>
                        <p className="text-sm text-[color:var(--ai-muted)] text-center mb-6 max-w-md">
                            Generate automatic captions and transcriptions to make your lesson more accessible and searchable.
                        </p>
                        <Button
                            color="primary"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-md"
                            onPress={onGenerateCaptions}
                            isLoading={generatingCaptions}
                            isDisabled={!hasFileUploaded || generatingCaptions}
                            startContent={!generatingCaptions && <FiFileText size={16} />}
                        >
                            {generatingCaptions ? "Processing..." : "Generate Captions & Transcription"}
                        </Button>
                    </div>
                ) : (
                    // Show captions content when available
                    <>
                        {/* Language Selection Tabs */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.keys(captionsData).map((lang) => (
                                <Chip
                                    key={lang}
                                    color={selectedCaptionLanguage === lang ? "primary" : "default"}
                                    variant={selectedCaptionLanguage === lang ? "flat" : "bordered"}
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => setSelectedCaptionLanguage(lang)}
                                >
                                    {supportedLanguages[lang] || lang}
                                </Chip>
                            ))}
                        </div>

                        {/* Caption Content */}
                        <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/50 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-medium text-[color:var(--ai-foreground)]">
                                    {supportedLanguages[selectedCaptionLanguage] || selectedCaptionLanguage} Captions
                                </h3>
                                {captionsData[selectedCaptionLanguage]?.url && (
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        size="sm"
                                        as="a"
                                        href={captionsData[selectedCaptionLanguage]?.url}
                                        target="_blank"
                                        download={`captions-${selectedCaptionLanguage}.vtt`}
                                        rel="noopener noreferrer"
                                        startContent={<FiFileText size={14} />}
                                    >
                                        Download VTT
                                    </Button>
                                )}
                            </div>

                            {/* Caption Preview */}
                            <div className="max-h-[100px] overflow-y-auto p-3 bg-[color:var(--ai-card-bg)]/80 rounded border border-[color:var(--ai-card-border)]/30 text-sm text-[color:var(--ai-foreground)]">
                                {captionsData[selectedCaptionLanguage]?.content || t('captions.noContentAvailable')}
                            </div>
                        </div>

                        {/* Full Transcription (Only shown for English) */}
                        {selectedCaptionLanguage === "en-US" && (
                            <div>
                                <h3 className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center">
                                    <FiFileText size={14} className="text-[color:var(--ai-primary)] mr-2" />
                                    Full Transcription
                                </h3>
                                <div className="max-h-[200px] overflow-y-auto p-3 bg-[color:var(--ai-card-bg)]/80 rounded border border-[color:var(--ai-card-border)]/30 text-sm text-[color:var(--ai-foreground)]">
                                    {transcriptionText}
                                </div>
                            </div>
                        )}

                        {/* Regenerate button */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                onPress={onGenerateCaptions}
                                isLoading={generatingCaptions}
                                isDisabled={!hasFileUploaded || generatingCaptions}
                                startContent={!generatingCaptions && <FiFileText size={14} />}
                            >
                                {generatingCaptions ? t('captions.processing') : t('captions.regenerateCaptions')}
                            </Button>
                        </div>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default CaptionsSection;
