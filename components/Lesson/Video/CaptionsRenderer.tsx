'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    CaptionsSettings,
    buildCaptionInnerStyle,
    buildCaptionTextStyle,
    buildCaptionWrapperStyle,
} from './captionsSettings';

interface CaptionsRendererProps {
    /** The container element that wraps the <video>. We position relative to it. */
    containerRef: React.RefObject<HTMLDivElement | null>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    /** Currently selected caption language code (e.g. "en" or "off"). */
    selectedLanguage: string;
    /** Whether captions are enabled at all. */
    enabled: boolean;
    settings: CaptionsSettings;
}

/**
 * Renders the active subtitle cue text into a custom-styled overlay so we
 * can fully control padding, background, edges and positioning (the native
 * `::cue` pseudo only supports a small subset of CSS).
 *
 * Native track rendering is suppressed by setting `track.mode = 'hidden'`
 * (the player's caption-change handler does this when our renderer is
 * active). The browser still fires `cuechange`, so we observe `activeCues`
 * and paint them ourselves.
 */
const CaptionsRenderer: React.FC<CaptionsRendererProps> = ({
    containerRef,
    videoRef,
    selectedLanguage,
    enabled,
    settings,
}) => {
    const [text, setText] = useState('');
    const [videoHeight, setVideoHeight] = useState(0);
    const trackRef = useRef<TextTrack | null>(null);

    // Track the rendered video height (font sizes scale with it).
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const update = () => setVideoHeight(container.clientHeight || 0);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(container);
        return () => ro.disconnect();
    }, [containerRef]);

    // Hook into the active text track and listen for cue changes.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            setText('');
            return;
        }

        if (!enabled || selectedLanguage === 'off') {
            setText('');
            // Make sure no native track is showing either.
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = 'disabled';
            }
            trackRef.current = null;
            return;
        }

        // Find the matching track by language and put it in 'hidden' mode
        // (browser doesn't paint, but cuechange still fires).
        const langKey = selectedLanguage.split('-')[0];
        let activeTrack: TextTrack | null = null;
        for (let i = 0; i < video.textTracks.length; i++) {
            const tr = video.textTracks[i];
            if (tr.language === langKey || tr.label === selectedLanguage) {
                tr.mode = 'hidden';
                activeTrack = tr;
            } else {
                tr.mode = 'disabled';
            }
        }
        trackRef.current = activeTrack;
        if (!activeTrack) {
            setText('');
            return;
        }

        const handleCueChange = () => {
            const cues = activeTrack!.activeCues;
            if (!cues || cues.length === 0) {
                setText('');
                return;
            }
            const lines: string[] = [];
            for (let i = 0; i < cues.length; i++) {
                const cue = cues[i] as VTTCue;
                // Strip simple HTML/VTT tags (keep newlines).
                const t = (cue.text || '').replace(/<[^>]+>/g, '').trim();
                if (t) lines.push(t);
            }
            setText(lines.join('\n'));
        };

        activeTrack.addEventListener('cuechange', handleCueChange);
        // Trigger an immediate paint with whatever's currently active.
        handleCueChange();

        return () => {
            activeTrack?.removeEventListener('cuechange', handleCueChange);
        };
    }, [videoRef, selectedLanguage, enabled]);

    if (!enabled || selectedLanguage === 'off' || !text) return null;

    return (
        <div style={buildCaptionWrapperStyle(settings)} aria-live="polite">
            <div style={buildCaptionInnerStyle(settings)}>
                <span style={buildCaptionTextStyle(settings, videoHeight)}>{text}</span>
            </div>
        </div>
    );
};

export default CaptionsRenderer;
