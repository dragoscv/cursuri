'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal, { ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
    CaptionsSettings,
    CcAlign,
    CcEdgeStyle,
    CcFontFamily,
    CcPosition,
    DEFAULT_CC_SETTINGS,
    buildCaptionInnerStyle,
    buildCaptionTextStyle,
    buildCaptionWrapperStyle,
} from './captionsSettings';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    settings: CaptionsSettings;
    onChange: (next: CaptionsSettings) => void;
    onReset: () => void;
}

const FONT_OPTIONS: { value: CcFontFamily; label: string }[] = [
    { value: 'sans', label: 'Sans-serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'mono', label: 'Monospace' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'casual', label: 'Casual' },
    { value: 'small-caps', label: 'Small caps' },
    { value: 'system', label: 'System default' },
];

const EDGE_OPTIONS: { value: CcEdgeStyle; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'shadow', label: 'Drop shadow' },
    { value: 'outline', label: 'Outline' },
    { value: 'raised', label: 'Raised' },
    { value: 'depressed', label: 'Depressed' },
];

const POSITION_OPTIONS: { value: CcPosition; label: string }[] = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'middle', label: 'Middle' },
    { value: 'top', label: 'Top' },
];

const ALIGN_OPTIONS: { value: CcAlign; label: string }[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

const PRESET_TEXT_COLORS = ['#ffffff', '#fef3c7', '#fde68a', '#fca5a5', '#86efac', '#93c5fd', '#000000'];
const PRESET_BG_COLORS = ['#000000', '#1f2937', '#7c3aed', '#be185d', '#0e7490', '#ffffff', '#000000'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ai-muted)]">
                {title}
            </h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Slider({
    label,
    value,
    min,
    max,
    step = 1,
    suffix = '',
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
    onChange: (v: number) => void;
}) {
    return (
        <label className="block">
            <div className="flex items-center justify-between text-xs text-[color:var(--ai-foreground)] mb-1.5">
                <span className="font-medium">{label}</span>
                <span className="text-[color:var(--ai-primary)] font-semibold tabular-nums">
                    {value}
                    {suffix}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-label={label}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full bg-[color:var(--ai-card-border)] accent-[color:var(--ai-primary)] cursor-pointer"
            />
        </label>
    );
}

function ColorRow({
    label,
    value,
    presets,
    onChange,
}: {
    label: string;
    value: string;
    presets: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs text-[color:var(--ai-foreground)] mb-2 font-medium">
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {presets.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        title={c}
                        aria-label={`${label} ${c}`}
                        aria-pressed={value.toLowerCase() === c.toLowerCase()}
                        className={`w-7 h-7 rounded-md border-2 transition-transform ${value.toLowerCase() === c.toLowerCase()
                            ? 'border-[color:var(--ai-primary)] scale-110'
                            : 'border-[color:var(--ai-card-border)] hover:scale-105'
                            }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <input
                    type="color"
                    value={value}
                    aria-label={`${label} custom`}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-9 h-7 rounded-md cursor-pointer bg-transparent border border-[color:var(--ai-card-border)]"
                />
            </div>
        </div>
    );
}

function PillGroup<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div>
            <div className="text-xs text-[color:var(--ai-foreground)] mb-2 font-medium">{label}</div>
            <div className="flex flex-wrap gap-1.5">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        aria-pressed={value === opt.value}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${value === opt.value
                            ? 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-md'
                            : 'bg-[color:var(--ai-card-bg)]/60 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/40'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

const CaptionsSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onChange, onReset }) => {
    const update = <K extends keyof CaptionsSettings>(key: K, value: CaptionsSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    // Build preview wrapper style but force it to sit at the bottom of the
    // preview container regardless of the chosen video position.
    const previewWrapperStyle: React.CSSProperties = {
        ...buildCaptionWrapperStyle(settings),
        position: 'absolute',
        bottom: 16,
        top: undefined,
        transform: undefined,
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            classNames={{ base: 'bg-[color:var(--ai-card-bg)]' }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center text-white text-xs font-bold">
                                    CC
                                </div>
                                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">
                                    Caption settings
                                </h3>
                            </div>
                            <p className="text-xs text-[color:var(--ai-muted)] font-normal">
                                Personalise how subtitles look. Settings are saved on this device.
                            </p>
                        </ModalHeader>

                        <ModalBody>
                            {/* Live preview */}
                            <div
                                className="relative w-full rounded-xl overflow-hidden mb-4 border border-[color:var(--ai-card-border)]"
                                style={{
                                    aspectRatio: '16 / 9',
                                    backgroundImage:
                                        'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #312e81 100%)',
                                }}
                            >
                                <div className="absolute inset-0 opacity-30" style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5), transparent 50%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 50%)',
                                }} />
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={JSON.stringify({
                                            f: settings.fontFamily,
                                            s: settings.fontSize,
                                            c: settings.textColor,
                                            b: settings.bgColor,
                                            o: settings.bgOpacity,
                                            e: settings.edgeStyle,
                                        })}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={previewWrapperStyle}
                                    >
                                        <div style={buildCaptionInnerStyle(settings)}>
                                            <span style={buildCaptionTextStyle(settings, 240)}>
                                                The quick brown fox jumps over the lazy dog.
                                            </span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Section title="Typography">
                                    <PillGroup
                                        label="Font family"
                                        value={settings.fontFamily}
                                        options={FONT_OPTIONS}
                                        onChange={(v) => update('fontFamily', v)}
                                    />
                                    <PillGroup
                                        label="Weight"
                                        value={String(settings.fontWeight) as any}
                                        options={[400, 500, 600, 700, 800].map((w) => ({
                                            value: String(w) as any,
                                            label: String(w),
                                        }))}
                                        onChange={(v) => update('fontWeight', parseInt(v) as any)}
                                    />
                                    <Slider
                                        label="Font size"
                                        value={settings.fontSize}
                                        min={2}
                                        max={8}
                                        step={0.1}
                                        suffix="%"
                                        onChange={(v) => update('fontSize', v)}
                                    />
                                    <Slider
                                        label="Line height"
                                        value={settings.lineHeight}
                                        min={1}
                                        max={2.2}
                                        step={0.05}
                                        onChange={(v) => update('lineHeight', v)}
                                    />
                                    <Slider
                                        label="Letter spacing"
                                        value={settings.letterSpacing}
                                        min={-2}
                                        max={6}
                                        step={0.5}
                                        suffix="px"
                                        onChange={(v) => update('letterSpacing', v)}
                                    />
                                </Section>

                                <Section title="Colour">
                                    <ColorRow
                                        label="Text colour"
                                        value={settings.textColor}
                                        presets={PRESET_TEXT_COLORS}
                                        onChange={(v) => update('textColor', v)}
                                    />
                                    <Slider
                                        label="Text opacity"
                                        value={Math.round(settings.textOpacity * 100)}
                                        min={20}
                                        max={100}
                                        step={5}
                                        suffix="%"
                                        onChange={(v) => update('textOpacity', v / 100)}
                                    />
                                    <ColorRow
                                        label="Background"
                                        value={settings.bgColor}
                                        presets={PRESET_BG_COLORS}
                                        onChange={(v) => update('bgColor', v)}
                                    />
                                    <Slider
                                        label="Background opacity"
                                        value={Math.round(settings.bgOpacity * 100)}
                                        min={0}
                                        max={100}
                                        step={5}
                                        suffix="%"
                                        onChange={(v) => update('bgOpacity', v / 100)}
                                    />
                                    <PillGroup
                                        label="Edge style"
                                        value={settings.edgeStyle}
                                        options={EDGE_OPTIONS}
                                        onChange={(v) => update('edgeStyle', v)}
                                    />
                                    <ColorRow
                                        label="Edge colour"
                                        value={settings.edgeColor}
                                        presets={['#000000', '#ffffff', '#7c3aed', '#0ea5e9']}
                                        onChange={(v) => update('edgeColor', v)}
                                    />
                                </Section>

                                <Section title="Box & padding">
                                    <Slider
                                        label="Padding (horizontal)"
                                        value={settings.paddingX}
                                        min={0}
                                        max={48}
                                        step={1}
                                        suffix="px"
                                        onChange={(v) => update('paddingX', v)}
                                    />
                                    <Slider
                                        label="Padding (vertical)"
                                        value={settings.paddingY}
                                        min={0}
                                        max={32}
                                        step={1}
                                        suffix="px"
                                        onChange={(v) => update('paddingY', v)}
                                    />
                                    <Slider
                                        label="Corner radius"
                                        value={settings.borderRadius}
                                        min={0}
                                        max={24}
                                        step={1}
                                        suffix="px"
                                        onChange={(v) => update('borderRadius', v)}
                                    />
                                    <Slider
                                        label="Max width"
                                        value={settings.maxWidth}
                                        min={40}
                                        max={100}
                                        step={5}
                                        suffix="%"
                                        onChange={(v) => update('maxWidth', v)}
                                    />
                                </Section>

                                <Section title="Position">
                                    <PillGroup
                                        label="Vertical position"
                                        value={settings.position}
                                        options={POSITION_OPTIONS}
                                        onChange={(v) => update('position', v)}
                                    />
                                    <PillGroup
                                        label="Text alignment"
                                        value={settings.align}
                                        options={ALIGN_OPTIONS}
                                        onChange={(v) => update('align', v)}
                                    />
                                    <Slider
                                        label="Offset from edge"
                                        value={settings.offset}
                                        min={0}
                                        max={40}
                                        step={1}
                                        suffix="%"
                                        onChange={(v) => update('offset', v)}
                                    />
                                </Section>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex justify-between">
                            <Button
                                variant="light"
                                color="default"
                                onPress={() => { onChange(DEFAULT_CC_SETTINGS); onReset(); }}
                            >
                                Reset to defaults
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Done
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default CaptionsSettingsModal;
