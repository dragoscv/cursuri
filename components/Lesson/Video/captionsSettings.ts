/**
 * Closed-Captions appearance settings.
 *
 * The native `::cue` pseudo-element only allows a small subset of CSS and
 * does NOT honour padding, so we render captions ourselves via a hidden
 * `<track>` (mode='hidden') + a custom overlay div. These settings drive
 * that overlay and are persisted to localStorage.
 */

export type CcEdgeStyle = 'none' | 'shadow' | 'outline' | 'raised' | 'depressed';
export type CcFontFamily =
    | 'system'
    | 'sans'
    | 'serif'
    | 'mono'
    | 'rounded'
    | 'casual'
    | 'small-caps';
export type CcAlign = 'left' | 'center' | 'right';
export type CcPosition = 'bottom' | 'middle' | 'top';

export interface CaptionsSettings {
    enabled: boolean;
    fontFamily: CcFontFamily;
    /** Font size as a percentage of video height (3 → ~3% of height). */
    fontSize: number;
    fontWeight: 400 | 500 | 600 | 700 | 800;
    lineHeight: number;
    letterSpacing: number; // px
    textColor: string; // hex without alpha
    textOpacity: number; // 0-1
    bgColor: string;
    bgOpacity: number; // 0-1
    paddingX: number; // px
    paddingY: number; // px
    borderRadius: number; // px
    edgeStyle: CcEdgeStyle;
    edgeColor: string;
    align: CcAlign;
    position: CcPosition;
    /** Vertical offset from chosen position, in % of video height. */
    offset: number;
    /** Maximum width of the caption box in % of video width. */
    maxWidth: number;
}

export const DEFAULT_CC_SETTINGS: CaptionsSettings = {
    enabled: true,
    fontFamily: 'sans',
    fontSize: 3.6,
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: 0,
    textColor: '#ffffff',
    textOpacity: 1,
    bgColor: '#000000',
    bgOpacity: 0.65,
    paddingX: 14,
    paddingY: 8,
    borderRadius: 8,
    edgeStyle: 'shadow',
    edgeColor: '#000000',
    align: 'center',
    position: 'bottom',
    offset: 8,
    maxWidth: 90,
};

const STORAGE_KEY = 'cursuri:cc-settings:v1';

export function loadCaptionsSettings(): CaptionsSettings {
    if (typeof window === 'undefined') return DEFAULT_CC_SETTINGS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_CC_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<CaptionsSettings>;
        return { ...DEFAULT_CC_SETTINGS, ...parsed };
    } catch {
        return DEFAULT_CC_SETTINGS;
    }
}

export function saveCaptionsSettings(settings: CaptionsSettings) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        /* ignore quota / private mode */
    }
}

const FONT_STACK_MAP: Record<CcFontFamily, string> = {
    system:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    rounded: '"SF Pro Rounded", "Quicksand", "Nunito", sans-serif',
    casual: '"Comic Sans MS", "Comic Neue", cursive',
    'small-caps': '"Inter", Arial, sans-serif',
};

function hexToRgba(hex: string, alpha: number): string {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildEdgeShadow(style: CcEdgeStyle, color: string): string {
    switch (style) {
        case 'none':
            return 'none';
        case 'shadow':
            return `0 2px 4px ${hexToRgba(color, 0.9)}, 0 0 6px ${hexToRgba(color, 0.6)}`;
        case 'outline':
            return `1px 1px 0 ${color}, -1px 1px 0 ${color}, 1px -1px 0 ${color}, -1px -1px 0 ${color}, 0 1px 0 ${color}, 1px 0 0 ${color}, 0 -1px 0 ${color}, -1px 0 0 ${color}`;
        case 'raised':
            return `1px 1px 0 ${hexToRgba(color, 0.9)}, 2px 2px 0 ${hexToRgba(color, 0.6)}, 3px 3px 2px ${hexToRgba(color, 0.4)}`;
        case 'depressed':
            return `-1px -1px 0 ${hexToRgba(color, 0.9)}, -2px -2px 0 ${hexToRgba(color, 0.6)}`;
        default:
            return 'none';
    }
}

/**
 * Inline style applied to the caption text container (the bubble around the text).
 * `videoHeightPx` lets us scale font size relative to the rendered video.
 */
export function buildCaptionTextStyle(
    s: CaptionsSettings,
    videoHeightPx: number
): React.CSSProperties {
    const fontSizePx = Math.max(10, Math.round((videoHeightPx * s.fontSize) / 100));
    return {
        display: 'inline-block',
        fontFamily: FONT_STACK_MAP[s.fontFamily],
        fontVariant: s.fontFamily === 'small-caps' ? 'small-caps' : 'normal',
        fontWeight: s.fontWeight,
        fontSize: `${fontSizePx}px`,
        lineHeight: s.lineHeight,
        letterSpacing: `${s.letterSpacing}px`,
        color: hexToRgba(s.textColor, s.textOpacity),
        backgroundColor: hexToRgba(s.bgColor, s.bgOpacity),
        padding: `${s.paddingY}px ${s.paddingX}px`,
        borderRadius: `${s.borderRadius}px`,
        textShadow: buildEdgeShadow(s.edgeStyle, s.edgeColor),
        textAlign: s.align,
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone' as any,
        backdropFilter: s.bgOpacity > 0 && s.bgOpacity < 1 ? 'blur(2px)' : undefined,
    };
}

/**
 * Wrapper style controlling positioning of the caption box inside the video container.
 */
export function buildCaptionWrapperStyle(s: CaptionsSettings): React.CSSProperties {
    const base: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center',
        padding: `0 ${Math.max(8, s.paddingX)}px`,
        pointerEvents: 'none',
        zIndex: 5,
    };
    if (s.position === 'top') {
        return { ...base, top: `${s.offset}%` };
    }
    if (s.position === 'middle') {
        return { ...base, top: '50%', transform: 'translateY(-50%)' };
    }
    // Bottom (default) — sit above the controls bar.
    return { ...base, bottom: `${Math.max(s.offset, 4)}%` };
}

export function buildCaptionInnerStyle(s: CaptionsSettings): React.CSSProperties {
    return {
        maxWidth: `${s.maxWidth}%`,
    };
}
