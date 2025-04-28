'use client'

// Dynamically import the Speech SDK only on the client side
// This prevents server-side import which causes build errors
let sdk: typeof import('microsoft-cognitiveservices-speech-sdk') | null = null;

// We'll initialize this in a useEffect or when needed on the client
const initSpeechSdk = async () => {
    if (typeof window !== 'undefined' && !sdk) {
        sdk = await import('microsoft-cognitiveservices-speech-sdk');
    }
    return sdk;
};

import { firestoreDB, firebaseStorage } from '@/utils/firebase/firebase.config';
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
 * Generate speech from text using Azure Cognitive Services
 * @param text Text to convert to speech
 * @param language Language code (e.g., 'en-US')
 * @param voice Optional voice name
 * @returns ArrayBuffer containing the audio data
 */
export async function textToSpeech(text: string, language: string = 'en-US', voice?: string): Promise<ArrayBuffer> {
    // Initialize SDK if not already done
    await initSpeechSdk();
    if (!sdk) {
        throw new Error("Failed to initialize Speech SDK");
    }

    // Select appropriate voice based on language if not provided
    if (!voice) {
        switch (language) {
            case 'en-US':
                voice = 'en-US-JennyNeural';
                break;
            case 'ro-RO':
                voice = 'ro-RO-EmilNeural';
                break;
            case 'es-ES':
                voice = 'es-ES-ElviraNeural';
                break;
            case 'fr-FR':
                voice = 'fr-FR-DeniseNeural';
                break;
            case 'de-DE':
                voice = 'de-DE-KatjaNeural';
                break;
            default:
                voice = 'en-US-JennyNeural';
        }
    }

    return new Promise((resolve, reject) => {
        try {
            // Configure speech service
            const speechConfig = sdk.SpeechConfig.fromSubscription(
                process.env.NEXT_PUBLIC_AZURE_SPEECH_API_KEY || '',
                process.env.NEXT_PUBLIC_AZURE_REGION || ''
            );
            speechConfig.speechSynthesisVoiceName = voice;

            // Set output format to MP3
            speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

            // Create synthesizer with push audio output stream
            const pushStream = sdk.AudioOutputStream.createPushStream();
            const audioConfig = sdk.AudioConfig.fromStreamOutput(pushStream);
            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

            // Collect audio data
            const audioData: Uint8Array[] = [];
            pushStream.write = (data: ArrayBuffer) => {
                audioData.push(new Uint8Array(data));
                return data.byteLength;
            }

            // Synthesize text to speech
            synthesizer.speakTextAsync(
                text,
                result => {
                    // Close synthesizer and stream
                    synthesizer.close();
                    pushStream.close();

                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        // Combine all audio chunks
                        const totalLength = audioData.reduce((acc, cur) => acc + cur.length, 0);
                        const combinedAudio = new Uint8Array(totalLength);

                        let offset = 0;
                        for (const chunk of audioData) {
                            combinedAudio.set(chunk, offset);
                            offset += chunk.length;
                        }

                        resolve(combinedAudio.buffer);
                    } else {
                        reject(`Speech synthesis failed: ${result.errorDetails}`);
                    }
                },
                error => {
                    synthesizer.close();
                    reject(`Speech synthesis error: ${error}`);
                }
            );
        } catch (error) {
            reject(`Failed to initialize speech synthesis: ${error}`);
        }
    });
}

/**
 * Upload caption file to Firebase Storage and update lesson document
 * @param courseId Course ID
 * @param lessonId Lesson ID
 * @param captionContent Caption content (SRT, WebVTT, etc.)
 * @param language Language code (e.g., 'en-US')
 * @returns URL to the caption file
 */
export async function uploadCaptions(
    courseId: string,
    lessonId: string,
    captionContent: string,
    language: string = 'en-US'
): Promise<string> {
    try {
        // Create file path
        const filePath = `courses/${courseId}/lessons/${lessonId}/captions/${language}.vtt`;

        // Upload to Firebase Storage
        const captionsRef = ref(firebaseStorage, filePath);
        await uploadString(captionsRef, captionContent, 'raw');

        // Get download URL
        const downloadURL = await getDownloadURL(captionsRef);

        // Update lesson document with caption info
        const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
        const lessonDoc = await getDoc(lessonRef);

        if (lessonDoc.exists()) {
            // Update or add the caption entry for this language
            await updateDoc(lessonRef, {
                [`captions.${language}`]: {
                    url: downloadURL,
                    content: captionContent
                }
            });
        }

        return downloadURL;
    } catch (error) {
        console.error('Error uploading captions:', error);
        throw error;
    }
}

/**
 * Translate text to multiple languages using Azure Cognitive Services
 * @param text Text to translate
 * @param targetLanguages Array of language codes to translate to
 * @returns Object with translations keyed by language code
 */
export async function translateText(text: string, targetLanguages: string[]): Promise<Record<string, string>> {
    try {
        // Ensure SDK is initialized
        await initSpeechSdk();
        if (!sdk) {
            throw new Error("Failed to initialize Speech SDK");
        }

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
                            if (result.translations.has(langCode)) {
                                translations[language] = result.translations.get(langCode) || '';
                            }
                        });
                        resolve(translations);
                    } else {
                        reject(`Translation failed: ${result.errorDetails}`);
                    }
                    synthesizer.close();
                },
                error => {
                    synthesizer.close();
                    reject(`Translation error: ${error}`);
                }
            );
        });
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
}

/**
 * Convert speech to text using Azure Cognitive Services
 * @param audioData ArrayBuffer containing the audio data
 * @param language Language code (e.g., 'en-US')
 * @returns Transcribed text
 */
export async function speechToText(audioData: ArrayBuffer, language: string = 'en-US'): Promise<string> {
    // Ensure SDK is initialized
    await initSpeechSdk();
    if (!sdk) {
        throw new Error("Failed to initialize Speech SDK");
    }

    try {
        return new Promise<string>((resolve, reject) => {
            // Configure speech service
            const speechConfig = sdk.SpeechConfig.fromSubscription(
                process.env.NEXT_PUBLIC_AZURE_SPEECH_API_KEY || '',
                process.env.NEXT_PUBLIC_AZURE_REGION || ''
            );

            // Set recognition language
            speechConfig.speechRecognitionLanguage = language;

            // Create push stream for audio data
            const pushStream = sdk.AudioInputStream.createPushStream();

            // Push audio data to stream
            pushStream.write(audioData);
            pushStream.close();

            // Create audio config from stream
            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

            // Create speech recognizer
            const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            // Start recognition
            recognizer.recognizeOnceAsync(
                result => {
                    recognizer.close();

                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        resolve(result.text);
                    } else {
                        reject(`Speech recognition failed: ${result.reason}`);
                    }
                },
                error => {
                    recognizer.close();
                    reject(`Speech recognition error: ${error}`);
                }
            );
        });
    } catch (error) {
        console.error('Error in speech to text conversion:', error);
        throw error;
    }
}