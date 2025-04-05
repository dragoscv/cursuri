'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { supportedLanguages } from '@/utils/azure/speech'
import { Lesson } from '@/types'

interface VideoPlayerProps {
    lesson: Lesson;
    isCompleted: boolean;
    onTimeUpdate: (progress: number) => void;
    onPlay: () => void;
    onPause: () => void;
    onEnded: () => void;
    onMarkComplete: () => void;
    saveCurrentProgress: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
    videoContainerRef: React.RefObject<HTMLDivElement>;
}

export default function VideoPlayer({
    lesson,
    isCompleted,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onMarkComplete,
    saveCurrentProgress,
    videoRef,
    videoContainerRef
}: VideoPlayerProps) {
    const [videoProgress, setVideoProgress] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isControlsVisible, setIsControlsVisible] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [captionsEnabled, setCaptionsEnabled] = useState(false)
    const [selectedCaptionLanguage, setSelectedCaptionLanguage] = useState('en-US')

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Handle captions setup when lesson changes
    useEffect(() => {
        if (videoRef.current && lesson.captions) {
            // Clear any existing tracks
            const videoElement = videoRef.current;

            // We need to handle text tracks differently than DOM nodes
            // Rather than removing children, we can use removeTextTrack API
            // or simply set their mode to disabled
            Array.from(videoElement.textTracks).forEach(track => {
                track.mode = 'disabled';
            });

            // Add caption tracks for each available language
            Object.entries(lesson.captions).forEach(([language, captionData]) => {
                if (captionData.url) {
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = supportedLanguages[language as keyof typeof supportedLanguages] || language;
                    track.srclang = language.split('-')[0];
                    track.src = captionData.url;

                    // Set English as default if available
                    if (language === 'en-US') {
                        track.default = true;
                    }

                    videoElement.appendChild(track);
                }
            });

            // Enable captions by default if available
            setCaptionsEnabled(true);
        }
    }, [lesson, videoRef]);

    // Handle internal time updates
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setVideoProgress(progress)
            setIsPlaying(!videoRef.current.paused)

            // Pass the progress up to parent
            onTimeUpdate(progress)
        }
    }

    // Reset the controls timeout when mouse moves
    const handleMouseMove = () => {
        if (isPlaying) {
            setIsControlsVisible(true);

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }

            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying && !isHovering) {
                    setIsControlsVisible(false);
                }
            }, 3000);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play()
                setIsPlaying(true)
                onPlay()

                // Hide controls after 3 seconds
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current)
                }
                controlsTimeoutRef.current = setTimeout(() => {
                    if (!isHovering) {
                        setIsControlsVisible(false)
                    }
                }, 3000)
            } else {
                videoRef.current.pause()
                // Save progress when paused
                saveCurrentProgress()
                setIsPlaying(false)
                onPause()
                setIsControlsVisible(true) // Always show controls on pause
            }
        }
    }

    const seek = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
            // Show controls briefly when seeking
            setIsControlsVisible(true)

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }

            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    if (!isHovering) {
                        setIsControlsVisible(false)
                    }
                }, 3000)
            }
        }
    }

    const toggleFullscreen = () => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                videoContainerRef.current.requestFullscreen().then(() => {
                    setIsFullscreen(true)
                }).catch(err => {
                    console.error("Error attempting to enable fullscreen:", err)
                })
            } else {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false)
                }).catch(err => {
                    console.error("Error attempting to exit fullscreen:", err)
                })
            }
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    }

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
                controlsTimeoutRef.current = null
            }
        }
    }, [])

    return (
        <div
            ref={videoContainerRef}
            className="relative overflow-hidden rounded-2xl bg-black shadow-2xl group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                if (isPlaying) {
                    // Hide controls when mouse leaves if playing
                    if (controlsTimeoutRef.current) {
                        clearTimeout(controlsTimeoutRef.current);
                    }
                    controlsTimeoutRef.current = setTimeout(() => {
                        setIsControlsVisible(false);
                    }, 1000);
                }
            }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={lesson.file}
                className="w-full aspect-video bg-black"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onEnded}
                playsInline
                preload="metadata"
                onClick={togglePlayPause}
            />

            {/* Custom Play Button Overlay */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                    onClick={togglePlayPause}
                >
                    <div className="rounded-full bg-white/20 hover:bg-white/30 p-5 backdrop-blur-sm transition-all duration-300 transform hover:scale-110">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Video Controls Overlay */}
            <div
                className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <div className="relative w-full mb-2">
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            if (videoRef.current) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickPosition = (e.clientX - rect.left) / rect.width;
                                videoRef.current.currentTime = clickPosition * videoRef.current.duration;
                            }
                        }}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{ width: `${videoProgress}%` }}
                        ></div>
                    </div>

                    {/* Buffered Progress */}
                    <div className="absolute left-0 top-0 h-1.5 bg-gray-400/30 pointer-events-none"
                        style={{
                            width: `${videoRef.current && videoRef.current.buffered.length > 0
                                ? (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / videoRef.current.duration) * 100
                                : 0}%`
                        }}
                    ></div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white gap-4">
                    <div className="flex items-center gap-3">
                        {/* Rewind */}
                        <button
                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                            onClick={() => seek(-10)}
                            aria-label="Rewind 10 seconds"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.5 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9h-2a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7v3l6-4-6-4v3Z" />
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button
                            className="p-2 rounded-full hover:bg-white/20 transition duration-300"
                            onClick={togglePlayPause}
                            aria-label={isPlaying ? 'Pause video' : 'Play video'}
                        >
                            {isPlaying ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Forward */}
                        <button
                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                            onClick={() => seek(10)}
                            aria-label="Forward 10 seconds"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10.5 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9h2a7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7v3l-6-4 6-4v3Z" />
                            </svg>
                        </button>

                        {/* Time Display */}
                        <span className="text-sm font-medium ml-2">
                            {videoRef.current
                                ? `${formatTime(videoRef.current?.currentTime || 0)} / ${formatTime(videoRef.current?.duration || 0)}`
                                : '0:00 / 0:00'
                            }
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Captions Toggle */}
                        {lesson.captions && Object.keys(lesson.captions).length > 0 && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <button
                                        className={`p-1.5 rounded-full transition duration-300 ${captionsEnabled
                                            ? 'bg-indigo-500/30 text-indigo-300'
                                            : 'hover:bg-white/20 text-white'
                                            }`}
                                        aria-label={captionsEnabled ? "Captions enabled" : "Captions disabled"}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm0 2h14v14H5V5zm3 3v2h8V8H8zm0 4v2h4v-2H8zm6 0v2h2v-2h-2z" />
                                        </svg>
                                    </button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Captions options"
                                    className="bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white min-w-[200px]"
                                >
                                    <DropdownItem
                                        key="toggle"
                                        className="flex items-center justify-between"
                                        onClick={() => setCaptionsEnabled(!captionsEnabled)}
                                    >
                                        <span>Captions</span>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={captionsEnabled}
                                                onChange={() => setCaptionsEnabled(!captionsEnabled)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                    </DropdownItem>

                                    <DropdownItem key="language-title" className="font-bold text-xs opacity-70" isDisabled>
                                        CAPTION LANGUAGE
                                    </DropdownItem>

                                    {Object.entries(lesson.captions || {}).map(([langCode, _]) => (
                                        <DropdownItem
                                            key={langCode}
                                            className="flex items-center justify-between"
                                            onClick={() => {
                                                setSelectedCaptionLanguage(langCode);
                                                if (!captionsEnabled) setCaptionsEnabled(true);

                                                // Update active text track
                                                if (videoRef.current) {
                                                    Array.from(videoRef.current.textTracks).forEach(track => {
                                                        track.mode = track.language === langCode.split('-')[0] ? 'showing' : 'hidden';
                                                    });
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{supportedLanguages[langCode as keyof typeof supportedLanguages] || langCode}</span>
                                                {selectedCaptionLanguage === langCode && (
                                                    <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        )}

                        {/* Playback Speed */}
                        <Dropdown>
                            <DropdownTrigger>
                                <button className="p-1.5 rounded-full hover:bg-white/20 transition duration-300 text-sm flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 8v8l6-4-6-4zm6.33-1.17a8.03 8.03 0 0 1 2.93 7.83 8.01 8.01 0 0 1-6.93 6.13 8.1 8.1 0 0 1-8.16-3.08 7.97 7.97 0 0 1-1.33-8.17 8 8 0 0 1 7.16-4.37c2.21 0 4.21.89 5.67 2.33l1.41-1.41A10 10 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07l-1.41 1.41z" />
                                    </svg>
                                    <span>
                                        {videoRef.current?.playbackRate || 1}x
                                    </span>
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Playback speed"
                                className="bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white"
                                onAction={(key) => {
                                    if (videoRef.current) {
                                        videoRef.current.playbackRate = parseFloat(key.toString());
                                    }
                                }}
                            >
                                <DropdownItem key="0.5">0.5x</DropdownItem>
                                <DropdownItem key="0.75">0.75x</DropdownItem>
                                <DropdownItem key="1">1x (Normal)</DropdownItem>
                                <DropdownItem key="1.25">1.25x</DropdownItem>
                                <DropdownItem key="1.5">1.5x</DropdownItem>
                                <DropdownItem key="2">2x</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        {/* Mark Complete Button */}
                        <button
                            className={`p-1.5 rounded-full transition duration-300 ${isCompleted
                                ? 'bg-green-500/20 text-green-400'
                                : 'hover:bg-white/20 text-white'
                                }`}
                            onClick={onMarkComplete}
                            disabled={isCompleted}
                            aria-label={isCompleted ? "Lesson completed" : "Mark lesson as complete"}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
                            onClick={toggleFullscreen}
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts Info - Show briefly on load */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <span>Space</span>
                    <span>Play/Pause</span>
                    <span>←/→</span>
                    <span>Seek ±10s</span>
                    <span>F</span>
                    <span>Fullscreen</span>
                    <span>M</span>
                    <span>Mute</span>
                </div>
            </div>
        </div>
    )
}