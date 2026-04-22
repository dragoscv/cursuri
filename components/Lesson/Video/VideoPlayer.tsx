'use client';

import React, { useRef, useContext, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Lesson } from '@/types';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button as HeroButton } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import useVideoControls from '../hooks/useVideoControls';
import ResumeVideoModal from './ResumeVideoModal';
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ForwardIcon,
  CheckIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  PlaybackSpeedIcon,
} from '@/components/icons/svg';
import CaptionsIcon from '@/components/icons/svg/CaptionsIcon';
import VolumeIcon from '@/components/icons/svg/VolumeIcon';
import MuteIcon from '@/components/icons/svg/MuteIcon';
import Button from '@/components/ui/Button';
import LessonTimeline from './LessonTimeline';

interface VideoPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  saveProgress: boolean;
  saveLessonProgress: (
    courseId: string,
    lessonId: string,
    position: number,
    isCompleted: boolean
  ) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setProgressSaved: (isSaved: boolean) => void;
  isOfflineMode?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  isCompleted,
  saveProgress,
  saveLessonProgress,
  markLessonComplete,
  setIsCompleted,
  setProgressSaved,
}) => {
  const t = useTranslations('common.videoPlayer');
  const context = useContext(AppContext);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [captionsEnabled, setCaptionsEnabled] = React.useState(false);
  const [selectedCaptionLanguage, setSelectedCaptionLanguage] = React.useState<string>('off');
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [showResumeModal, setShowResumeModal] = React.useState(false);
  const [savedPosition, setSavedPosition] = React.useState<number>(0);
  const [videoReady, setVideoReady] = React.useState(false);
  const [hasShownModal, setHasShownModal] = React.useState(false);
  const [videoError, setVideoError] = React.useState<string | null>(null);

  const courseId = lesson?.courseId || '';

  const {
    videoProgress,
    isPlaying,
    isControlsVisible,
    isFullscreen,
    isHovering,
    setIsHovering,
    handleTimeUpdate,
    handleMouseMove,
    handleVideoEnded,
    handleMarkComplete,
    togglePlayPause,
    seek,
    toggleFullscreen,
    formatTime,
  } = useVideoControls({
    videoRef,
    videoContainerRef,
    courseId,
    lessonId: lesson.id,
    isCompleted,
    saveProgress,
    saveLessonProgress,
    markLessonComplete,
    setIsCompleted,
    setProgressSaved,
  });

  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Handle caption language selection
  const handleCaptionChange = (language: string) => {
    setSelectedCaptionLanguage(language);
    setCaptionsEnabled(language !== 'off');

    if (videoRef.current) {
      // Get text tracks from video element
      const tracks = videoRef.current.textTracks;

      // Set mode for all tracks
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (language === 'off') {
          track.mode = 'hidden';
        } else if (track.language === language.split('-')[0]) {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden';
        }
      }
    }
  };

  // Check for saved progress and show resume modal
  useEffect(() => {
    if (!context || !videoRef.current || !videoReady || hasShownModal) return;

    const lessonProgress = context.lessonProgress?.[courseId]?.[lesson.id];

    if (lessonProgress && lessonProgress.lastPosition) {
      const position = lessonProgress.lastPosition;
      const duration = videoRef.current.duration;

      // Only show resume modal if:
      // 1. Saved position is at least 3 seconds in
      // 2. Saved position is more than 60 seconds before the end
      // 3. Position is less than 95% of total duration
      if (position > 3 && (duration - position) > 60 && position < duration * 0.95) {
        setSavedPosition(position);
        setShowResumeModal(true);
        setHasShownModal(true);
      }
    }
  }, [context, courseId, lesson.id, videoReady, hasShownModal]);

  // Handle video metadata loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoReady(true);
      setVideoError(null);
    };

    const handleError = () => {
      const error = video.error;
      const src = lesson.file || lesson.videoUrl || '';
      const fileName = src.split('/').pop()?.split('?')[0]?.toLowerCase() || '';

      // Detect unsupported format on Safari/macOS
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isUnsupportedFormat = fileName.endsWith('.webm') || fileName.endsWith('.mkv') || fileName.endsWith('.avi');

      if (isUnsupportedFormat && isSafari) {
        setVideoError('This video format is not supported by your browser. Please try using Chrome or Firefox.');
      } else if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setVideoError('This video format is not supported by your browser. Please try using Chrome or Firefox.');
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            setVideoError('A network error occurred while loading the video. Please check your connection and try again.');
            break;
          case MediaError.MEDIA_ERR_DECODE:
            setVideoError('The video could not be decoded. Please try using a different browser.');
            break;
          default:
            setVideoError('An error occurred while loading the video. Please try again.');
        }
      } else {
        setVideoError('The video could not be loaded. Please try again.');
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [lesson.file, lesson.videoUrl]);

  // Handle resume video
  const handleResumeVideo = () => {
    setShowResumeModal(false);
    // Use setTimeout to ensure modal is closed and DOM is settled
    setTimeout(() => {
      if (videoRef.current && savedPosition > 0) {
        videoRef.current.currentTime = savedPosition;
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      }
    }, 100);
  };

  // Handle start from beginning
  const handleStartFromBeginning = () => {
    setShowResumeModal(false);
    // Use setTimeout to ensure modal is closed and DOM is settled
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      }
    }, 100);
  };

  // Initialize captions when the component mounts
  React.useEffect(() => {
    if (videoRef.current && lesson.captions) {
      // Only remove existing track elements (not all children — removing React-managed nodes causes hydration crashes)
      const existingTracks = videoRef.current.querySelectorAll('track');
      existingTracks.forEach((track) => track.remove());

      // Add caption tracks for available languages
      if (lesson.captions && Object.keys(lesson.captions).length > 0) {
        Object.entries(lesson.captions).forEach(([language, captionData]) => {
          if (captionData.url) {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = language;
            track.srclang = language.split('-')[0];
            track.src = captionData.url;

            // Don't set any track as default since we start with captions off
            (track as any).mode = 'hidden';

            videoRef.current?.appendChild(track);
          }
        });
      }
    }
  }, [lesson.captions]);

  if (!lesson.file) {
    return (
      <div className="relative rounded-3xl bg-[color:var(--ai-card-bg)]/80 aspect-video flex items-center justify-center">
        <p className="text-[color:var(--ai-muted)]">{t('noVideoAvailable')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Resume modal overlay */}
      {showResumeModal && videoRef.current && (
        <ResumeVideoModal
          isOpen={showResumeModal}
          savedPosition={savedPosition}
          duration={videoRef.current.duration || 0}
          onResume={handleResumeVideo}
          onStartFromBeginning={handleStartFromBeginning}
          formatTime={formatTime}
        />
      )}

      <div
        ref={videoContainerRef}
        className={`relative overflow-hidden rounded-3xl bg-black shadow-2xl group ${isFullscreen ? 'flex items-center justify-center' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          if (isPlaying) {
            // Hide controls when mouse leaves if playing
            setTimeout(() => {
              if (isPlaying && !isHovering) {
                setIsHovering(false);
              }
            }, 1000);
          }
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={lesson.file || lesson.videoUrl || ''}
          className={`bg-black object-contain ${isFullscreen ? 'w-full h-full' : 'w-full aspect-video'}`}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => isPlaying}
          onPause={() => !isPlaying}
          onEnded={handleVideoEnded}
          playsInline
          preload="auto"
          onClick={togglePlayPause}
          poster={lesson.thumbnail || lesson.thumbnailUrl || ''}
          crossOrigin="anonymous"
        />

        {/* Video Error Overlay */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
            <div className="text-center px-6 max-w-md">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-white text-sm mb-4">{videoError}</p>
              <button
                onClick={() => {
                  setVideoError(null);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                {t('retry') || 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Custom Play Button Overlay */}
        {!isPlaying && !videoError && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 transition-opacity duration-300"
            onClick={togglePlayPause}
          >
            <div className="rounded-2xl bg-white/20 hover:bg-white/30 p-5 transition-all duration-300 transform hover:scale-110">
              <PlayIcon className="w-14 h-14 text-white" />
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Progress Bar (waveform + speech regions + chapter markers) */}
          <div className="relative w-full mb-2">
            <LessonTimeline
              durationSeconds={videoRef.current?.duration || 0}
              currentSeconds={videoRef.current?.currentTime || 0}
              bufferedSeconds={
                videoRef.current && videoRef.current.buffered.length > 0
                  ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
                  : 0
              }
              waveformUrl={lesson.waveformUrl}
              speechSegments={lesson.speechSegments}
              chapters={lesson.chapters}
              onSeek={(t) => {
                if (videoRef.current && Number.isFinite(t)) videoRef.current.currentTime = t;
              }}
              onJumpToNextSpeech={() => {
                if (!videoRef.current || !lesson.speechSegments?.length) return;
                const cur = videoRef.current.currentTime;
                const next = lesson.speechSegments.find((s) => s.startSeconds > cur + 0.5);
                if (next) videoRef.current.currentTime = next.startSeconds;
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white gap-4">
            <div className="flex items-center gap-3">
              {/* Rewind */}
              <button
                className="p-1.5 rounded-xl hover:bg-white/20 transition duration-300"
                onClick={() => seek(-10)}
                aria-label={t('rewind')}
              >
                <RewindIcon />
              </button>
              {/* Play/Pause */}
              <button
                className="p-2 rounded-xl hover:bg-white/20 transition duration-300"
                onClick={togglePlayPause}
                aria-label={isPlaying ? t('pauseVideo') : t('playVideo')}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              {/* Forward */}
              <button
                className="p-1.5 rounded-xl hover:bg-white/20 transition duration-300"
                onClick={() => seek(10)}
                aria-label={t('forward')}
              >
                <ForwardIcon />
              </button>
              {/* Time Display */}{' '}
              <span className="text-sm font-medium ml-2">
                {videoRef.current
                  ? `${formatTime(videoRef.current?.currentTime || 0)} / ${formatTime(videoRef.current?.duration || 0)}`
                  : '0:00 / 0:00'}
              </span>{' '}
              {/* Volume Control */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={toggleMute}
                aria-label={isMuted ? t('unmute') : t('mute')}
              >
                {isMuted ? <MuteIcon /> : <VolumeIcon />}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {' '}
              {/* Captions Dropdown */}
              {lesson.captions && Object.keys(lesson.captions).length > 0 && (
                <Dropdown>
                  <DropdownTrigger>
                    <HeroButton
                      variant="light"
                      size="sm"
                      className={captionsEnabled ? 'text-white bg-[color:var(--ai-primary)]/20' : 'text-white'}
                      startContent={<CaptionsIcon />}
                      aria-label={t('selectCaptions')}
                    >
                      {selectedCaptionLanguage === 'off' ? 'Off' : selectedCaptionLanguage.toUpperCase()}
                    </HeroButton>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={t('selectCaptions')}
                    className="bg-[color:var(--ai-background)]/90 backdrop-blur-md border border-[color:var(--ai-card-border)]/50 text-[color:var(--ai-foreground)]"
                    selectedKeys={[selectedCaptionLanguage]}
                    selectionMode="single"
                    onAction={(key) => {
                      handleCaptionChange(key.toString());
                    }}
                  >
                    <DropdownItem key="off">{t('captionsOff') || 'Off'}</DropdownItem>
                    {Object.keys(lesson.captions).map((language) => (
                      <DropdownItem key={language}>
                        {language.toUpperCase()}
                      </DropdownItem>
                    )) as any}
                  </DropdownMenu>
                </Dropdown>
              )}
              {/* Playback Speed */}{' '}
              <Dropdown>
                <DropdownTrigger>
                  <HeroButton
                    variant="light"
                    size="sm"
                    className="text-white"
                    startContent={<PlaybackSpeedIcon />}
                  >
                    {playbackSpeed}x
                  </HeroButton>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={t('playbackSpeed')}
                  className="bg-[color:var(--ai-background)]/90 backdrop-blur-md border border-[color:var(--ai-card-border)]/50 text-[color:var(--ai-foreground)]"
                  onAction={(key) => {
                    const speed = parseFloat(key.toString());
                    if (videoRef.current) {
                      videoRef.current.playbackRate = speed;
                      setPlaybackSpeed(speed);
                    }
                  }}
                >
                  <DropdownItem key="0.5">0.5x</DropdownItem>
                  <DropdownItem key="0.75">0.75x</DropdownItem>
                  <DropdownItem key="1">{t('normalSpeed')}</DropdownItem>
                  <DropdownItem key="1.25">1.25x</DropdownItem>
                  <DropdownItem key="1.5">1.5x</DropdownItem>
                  <DropdownItem key="2">2x</DropdownItem>
                </DropdownMenu>
              </Dropdown>{' '}
              {/* Mark Complete Button */}
              <Button
                isIconOnly
                variant={isCompleted ? 'success' : 'light'}
                size="sm"
                onClick={handleMarkComplete}
                isDisabled={isCompleted}
                aria-label={isCompleted ? t('lessonCompleted') : t('markLessonComplete')}
              >
                {' '}
                <CheckIcon />
              </Button>
              {/* Fullscreen Toggle */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={toggleFullscreen}
                aria-label={t('toggleFullscreen')}
              >
                {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Info - Show briefly on load */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="font-semibold mb-1">{t('keyboardShortcuts')}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span>{t('shortcuts.space')}</span>
            <span>{t('shortcuts.playPause')}</span>
            <span>{t('shortcuts.arrows')}</span>
            <span>{t('shortcuts.seek')}</span>
            <span>{t('shortcuts.f')}</span>
            <span>{t('shortcuts.fullscreen')}</span>
            <span>{t('shortcuts.m')}</span>
            <span>{t('shortcuts.muteKey')}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
