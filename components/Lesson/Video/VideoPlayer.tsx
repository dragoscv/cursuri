'use client'

import React, { useRef } from 'react';
import { Lesson } from '@/types';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import useVideoControls from '../hooks/useVideoControls';
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ForwardIcon,
  CheckIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  PlaybackSpeedIcon
} from '@/components/icons/svg';
import CaptionsIcon from '@/components/icons/svg/CaptionsIcon';
import VolumeIcon from '@/components/icons/svg/VolumeIcon';
import MuteIcon from '@/components/icons/svg/MuteIcon';

interface VideoPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  saveProgress: boolean;
  saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted: boolean) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setProgressSaved: (isSaved: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  isCompleted,
  saveProgress,
  saveLessonProgress,
  markLessonComplete,
  setIsCompleted,
  setProgressSaved
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [captionsEnabled, setCaptionsEnabled] = React.useState(false);
  const [selectedCaptionLanguage, setSelectedCaptionLanguage] = React.useState('en-US');

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
    formatTime
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
    setProgressSaved
  });

  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Handle captions toggle
  const toggleCaptions = () => {
    setCaptionsEnabled(!captionsEnabled);

    if (videoRef.current) {
      // Get text tracks from video element
      const tracks = videoRef.current.textTracks;

      // Set mode for all tracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = captionsEnabled ? 'hidden' : 'showing';
      }
    }
  };

  // Initialize captions when the component mounts
  React.useEffect(() => {
    if (videoRef.current && lesson.captions) {
      // Clear existing tracks
      while (videoRef.current.firstChild) {
        videoRef.current.removeChild(videoRef.current.firstChild);
      }

      // Add caption tracks for available languages
      if (lesson.captions && Object.keys(lesson.captions).length > 0) {
        Object.entries(lesson.captions).forEach(([language, captionData]) => {
          if (captionData.url) {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = language;
            track.srclang = language.split('-')[0];
            track.src = captionData.url;

            // Set default language
            if (language === selectedCaptionLanguage) {
              track.default = true;
            }

            videoRef.current?.appendChild(track);
          }
        });
      }
    }
  }, [lesson.captions, selectedCaptionLanguage]);

  if (!lesson.file) {
    return (
      <div className="relative rounded-3xl bg-[color:var(--ai-card-bg)]/80 aspect-video flex items-center justify-center">
        <p className="text-[color:var(--ai-muted)]">No video available for this lesson</p>
      </div>
    );
  }

  return (
    <div
      ref={videoContainerRef}
      className="relative overflow-hidden rounded-3xl bg-black shadow-2xl group"
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
        src={lesson.file}
        className="w-full aspect-video bg-black"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => isPlaying}
        onPause={() => !isPlaying}
        onEnded={handleVideoEnded}
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
          <div className="rounded-2xl bg-white/20 hover:bg-white/30 p-5 backdrop-blur-sm transition-all duration-300 transform hover:scale-110">
            <PlayIcon className="w-14 h-14 text-white" />
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="relative w-full mb-2">
          <div className="h-1.5 bg-[color:var(--ai-card-border)]/50 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (videoRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = clickPosition * videoRef.current.duration;
              }
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
              style={{ width: `${videoProgress}%` }}
            ></div>
          </div>

          {/* Buffered Progress */}
          <div
            className="absolute left-0 top-0 h-1.5 bg-[color:var(--ai-card-border)]/20 pointer-events-none rounded-full"
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
              className="p-1.5 rounded-xl hover:bg-white/20 transition duration-300"
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds"
            >
              <RewindIcon />
            </button>

            {/* Play/Pause */}
            <button
              className="p-2 rounded-xl hover:bg-white/20 transition duration-300"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Forward */}
            <button
              className="p-1.5 rounded-xl hover:bg-white/20 transition duration-300"
              onClick={() => seek(10)}
              aria-label="Forward 10 seconds"
            >
              <ForwardIcon />
            </button>

            {/* Time Display */}            <span className="text-sm font-medium ml-2">
              {videoRef.current
                ? `${formatTime(videoRef.current?.currentTime || 0)} / ${formatTime(videoRef.current?.duration || 0)}`
                : '0:00 / 0:00'
              }
            </span>

            {/* Volume Control */}
            <button
              className="p-1.5 rounded-xl hover:bg-white/20 transition duration-300"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MuteIcon /> : <VolumeIcon />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Captions Toggle */}
            {lesson.captions && Object.keys(lesson.captions).length > 0 && (
              <button
                className={`p-1.5 rounded-xl transition duration-300 ${captionsEnabled
                    ? 'bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)]'
                    : 'hover:bg-white/20 text-white'
                  }`}
                onClick={toggleCaptions}
                aria-label={captionsEnabled ? 'Disable captions' : 'Enable captions'}
              >
                <CaptionsIcon />
              </button>
            )}

            {/* Playback Speed */}
            <Dropdown>
              <DropdownTrigger>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition duration-300 text-sm flex items-center gap-1">
                  <PlaybackSpeedIcon />
                  <span>
                    {videoRef.current?.playbackRate || 1}x
                  </span>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Playback speed"
                className="bg-[color:var(--ai-background)]/90 backdrop-blur-md border border-[color:var(--ai-card-border)]/50 text-[color:var(--ai-foreground)]"
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
                ? 'bg-[color:var(--ai-success)]/20 text-[color:var(--ai-success)]'
                : 'hover:bg-white/20 text-white'
                }`}
              onClick={handleMarkComplete}
              disabled={isCompleted}
              aria-label={isCompleted ? "Lesson completed" : "Mark lesson as complete"}
            >
              <CheckIcon />
            </button>

            {/* Fullscreen Toggle */}
            <button
              className="p-1.5 rounded-full hover:bg-white/20 transition duration-300"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
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
  );
};

export default VideoPlayer;