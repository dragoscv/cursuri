'use client'

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { firestoreDB, firebaseStorage } from 'firewand';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Supported languages for translation
export const supportedLanguages = {
    'en-US': 'English',
    'ro-RO': 'Romanian',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'zh-CN': 'Chinese (Simplified)',
    'ru-RU': 'Russian',
    'pt-BR': 'Portuguese (Brazil)',
    'ar-SA': 'Arabic'
};

/**
 * Convert audio from a video URL to text using Azure Speech Service
 * @param audioUrl URL of the audio to transcribe
 * @param options Configuration options for the speech service
 * @returns Promise with transcription result
 */
export async function transcribeAudio(audioUrl: string, options?: {
    region?: string;
    language?: string;
}) {
    try {
        // Use environment variables or provided options
        const speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.NEXT_PUBLIC_AZURE_SPEECH_API_KEY || '',
            options?.region || process.env.NEXT_PUBLIC_AZURE_REGION || ''
        );

        // Set the language for speech recognition if provided
        if (options?.language) {
            speechConfig.speechRecognitionLanguage = options.language;
        } else {
            speechConfig.speechRecognitionLanguage = 'en-US';
        }

        // Create audio config from URL
        const audioConfig = sdk.AudioConfig.fromWavFileInput(new Blob([]) as any);  // Using a placeholder, will be updated in a real implementation

        // Create speech recognizer
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        return new Promise<string>((resolve, reject) => {
            // Full transcription result
            let transcription = '';

            // Process recognized text
            recognizer.recognized = (s, e) => {
                if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
                    transcription += e.result.text + ' ';
                } else if (e.result.reason === sdk.ResultReason.NoMatch) {
                    console.log('NOMATCH: Speech could not be recognized.');
                }
            };

            // Handle errors
            recognizer.canceled = (s, e) => {
                if (e.reason === sdk.CancellationReason.Error) {
                    console.error(`ERROR: ${e.errorCode}`);
                    console.error(`ERROR: ${e.errorDetails}`);
                    reject(new Error(e.errorDetails));
                }
            };

            // Session stopped
            recognizer.sessionStopped = (s, e) => {
                recognizer.close();
                resolve(transcription.trim());
            };

            // Start continuous recognition
            recognizer.startContinuousRecognitionAsync(
                () => console.log('Transcription started...'),
                (err) => reject(err)
            );
        });
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

/**
 * Generate WebVTT caption format from recognized speech
 * @param phrases Array of recognized phrases with timing information
 * @returns WebVTT formatted string
 */
export function generateWebVTT(phrases: any[]): string {
    let vtt = 'WEBVTT\n\n';

    phrases.forEach((phrase, index) => {
        if (phrase.text && phrase.text.trim()) {
            const startTime = formatTime(phrase.offset / 10000000); // Convert from 100ns to seconds
            const endTime = formatTime((phrase.offset + phrase.duration) / 10000000);

            vtt += `${index + 1}\n`;
            vtt += `${startTime} --> ${endTime}\n`;
            vtt += `${phrase.text.trim()}\n\n`;
        }
    });

    return vtt;
}

/**
 * Format time in HH:MM:SS.mmm format for WebVTT
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Translate text to multiple languages using Azure Speech Translation
 * @param text Text to translate
 * @param targetLanguages Array of language codes to translate to
 * @returns Object with translations keyed by language code
 */
export async function translateText(text: string, targetLanguages: string[]): Promise<Record<string, string>> {
    try {
        const translations: Record<string, string> = {};

        // Create translation config
        const translationConfig = sdk.SpeechTranslationConfig.fromSubscription(
            process.env.NEXT_PUBLIC_AZURE_SPEECH_API_KEY || '',
            process.env.NEXT_PUBLIC_AZURE_REGION || ''
        );

        // Set source language
        translationConfig.speechRecognitionLanguage = 'en-US';

        // Add target languages
        targetLanguages.forEach(language => {
            translationConfig.addTargetLanguage(language.split('-')[0]);
        });

        // Create synthesizer with text input
        const synthesizer = new sdk.TranslationRecognizer(translationConfig);

        return new Promise<Record<string, string>>((resolve, reject) => {
            synthesizer.recognizeOnceAsync(
                result => {
                    if (result.reason === sdk.ResultReason.TranslatedSpeech) {
                        targetLanguages.forEach(language => {
                            const langCode = language.split('-')[0];
                            translations[language] = result.translations.get(langCode) || '';
                        });
                        resolve(translations);
                    } else {
                        reject(new Error(`Translation failed: ${result.reason}`));
                    }
                    synthesizer.close();
                },
                error => {
                    console.error(`Error translating text: ${error}`);
                    synthesizer.close();
                    reject(error);
                }
            );
        });
    } catch (error) {
        console.error('Error in translation:', error);
        throw error;
    }
}

/**
 * Process a lesson video for captions, transcription, and translations
 * @param courseId Course ID
 * @param lessonId Lesson ID
 * @returns Promise that resolves when processing is complete
 */
export async function processLessonForCaptions(courseId: string, lessonId: string): Promise<void> {
    try {
        // Get lesson details
        const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
        const lessonDoc = await getDoc(lessonRef);

        if (!lessonDoc.exists()) {
            throw new Error('Lesson not found');
        }

        const lessonData = lessonDoc.data();
        const videoUrl = lessonData.file;

        if (!videoUrl) {
            throw new Error('No video file found for lesson');
        }

        // Mark the lesson as processing captions
        await updateDoc(lessonRef, { processingCaptions: true });

        // Step 1: Extract audio from the video and transcribe it
        // For this example, we'll assume the video URL can be processed directly
        // In a real implementation, you'd need to extract the audio first
        const transcription = await transcribeAudio(videoUrl);

        // Step 2: Generate captions in WebVTT format and upload to storage
        const captionsVtt = generateVttFromTranscription(transcription);
        const captionsStoragePath = `captions/${courseId}/${lessonId}/en-US.vtt`;
        const captionsRef = ref(firebaseStorage, captionsStoragePath);
        await uploadString(captionsRef, captionsVtt, 'raw');
        const captionsUrl = await getDownloadURL(captionsRef);

        // Step 3: Translate the transcription to other languages
        const translations: Record<string, { url?: string, content?: string }> = {};
        translations['en-US'] = { url: captionsUrl, content: transcription };

        // Get target languages excluding the source language (en-US)
        const targetLanguages = Object.keys(supportedLanguages).filter(lang => lang !== 'en-US');

        // Perform translations for all target languages
        const translatedTexts = await translateText(transcription, targetLanguages);

        // Process each translation and create WebVTT files
        for (const language of targetLanguages) {
            if (translatedTexts[language]) {
                const translatedVtt = generateVttFromTranscription(translatedTexts[language]);
                const translationStoragePath = `captions/${courseId}/${lessonId}/${language}.vtt`;
                const translationRef = ref(firebaseStorage, translationStoragePath);
                await uploadString(translationRef, translatedVtt, 'raw');
                const translationUrl = await getDownloadURL(translationRef);

                translations[language] = {
                    url: translationUrl,
                    content: translatedTexts[language]
                };
            }
        }

        // Update the lesson with transcription and captions
        await updateDoc(lessonRef, {
            transcription,
            captions: translations,
            processingCaptions: false
        });

    } catch (error) {
        console.error('Error processing lesson for captions:', error);

        // Update the lesson to indicate processing failed
        const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
        await updateDoc(lessonRef, { processingCaptions: false });

        throw error;
    }
}

/**
 * Generate VTT format from a plain text transcription
 * This is a simplified version as we don't have timestamps for individual phrases
 * @param transcription Full text transcription
 * @returns WebVTT formatted string
 */
function generateVttFromTranscription(transcription: string): string {
    let vtt = 'WEBVTT\n\n';

    // Simple approach: Split by sentences/periods and estimate timing
    // In a real implementation, you'd want to get actual timestamps from the recognizer
    const sentences = transcription.split(/(?<=[.!?])\s+/);
    let currentTime = 0;

    sentences.forEach((sentence, index) => {
        if (sentence.trim()) {
            // Estimate 5 seconds per sentence (very simplified approach)
            const startTime = formatTime(currentTime);
            currentTime += 5; // 5 seconds per sentence
            const endTime = formatTime(currentTime);

            vtt += `${index + 1}\n`;
            vtt += `${startTime} --> ${endTime}\n`;
            vtt += `${sentence.trim()}\n\n`;
        }
    });

    return vtt;
}