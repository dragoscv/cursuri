'use client';

/**
 * CodeTyper — premium-editorial live typing demo.
 *
 * Renders a fake editor window with traffic lights, file tab, line numbers,
 * and types through a sequence of snippets. Used in HeroSection v2 right pane.
 *
 * - prefers-reduced-motion: shows the first snippet fully rendered, no typing
 * - GPU-friendly: only updates a substring, no layout thrash
 * - Pauseable: stops cycling when offscreen via IntersectionObserver
 */

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

type Token = { text: string; cls?: string };

type Snippet = {
  filename: string;
  language: string;
  /** Each line is an array of pre-tokenized chunks (so syntax colors survive typing) */
  lines: Token[][];
};

const SNIPPETS: Snippet[] = [
  {
    filename: 'prompt.md',
    language: 'markdown',
    lines: [
      [
        { text: '# ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'You are a senior copywriter.' },
      ],
      [{ text: '' }],
      [{ text: '## Task', cls: 'text-amber-400' }],
      [
        { text: 'Rewrite the headline below for ' },
        { text: 'clarity', cls: 'text-emerald-400' },
        { text: ' and ' },
        { text: 'energy', cls: 'text-emerald-400' },
        { text: '.' },
      ],
      [{ text: '' }],
      [{ text: '## Constraint', cls: 'text-amber-400' }],
      [
        { text: '- Max ', cls: 'text-[color:var(--ai-muted)]' },
        { text: '8 words', cls: 'text-pink-400' },
      ],
      [{ text: '- Active voice', cls: 'text-[color:var(--ai-muted)]' }],
      [{ text: '- One verb that earns its keep', cls: 'text-[color:var(--ai-muted)]' }],
    ],
  },
  {
    filename: 'agent.ts',
    language: 'typescript',
    lines: [
      [
        { text: 'export ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'async ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'function ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'review', cls: 'text-amber-300' },
        { text: '(diff: ' },
        { text: 'string', cls: 'text-emerald-400' },
        { text: ') {' },
      ],
      [
        { text: '  const ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'plan ' },
        { text: '= ', cls: 'text-pink-400' },
        { text: 'await ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'agent', cls: 'text-amber-300' },
        { text: '.' },
        { text: 'plan', cls: 'text-amber-300' },
        { text: '({ diff });' },
      ],
      [
        { text: '  const ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'notes ' },
        { text: '= ', cls: 'text-pink-400' },
        { text: 'await ', cls: 'text-[color:var(--ai-primary)]' },
        { text: 'agent', cls: 'text-amber-300' },
        { text: '.' },
        { text: 'critique', cls: 'text-amber-300' },
        { text: '(plan);' },
      ],
      [{ text: '' }],
      [{ text: '  return ', cls: 'text-[color:var(--ai-primary)]' }, { text: '{' }],
      [
        { text: '    summary: notes.', cls: '' },
        { text: 'tldr', cls: 'text-amber-300' },
        { text: ',' },
      ],
      [
        { text: '    risks: notes.' },
        { text: 'risks', cls: 'text-amber-300' },
        { text: '.filter(' },
        { text: 'r', cls: 'text-amber-300' },
        { text: ' => r.severity > ' },
        { text: '0.7', cls: 'text-pink-400' },
        { text: '),' },
      ],
      [{ text: '  };' }],
      [{ text: '}' }],
    ],
  },
  {
    filename: 'workflow.yml',
    language: 'yaml',
    lines: [
      [
        { text: 'name', cls: 'text-[color:var(--ai-primary)]' },
        { text: ': ' },
        { text: 'AI content pipeline', cls: 'text-emerald-400' },
      ],
      [
        { text: 'on', cls: 'text-[color:var(--ai-primary)]' },
        { text: ': ' },
        { text: '[push]', cls: 'text-pink-400' },
      ],
      [{ text: '' }],
      [{ text: 'jobs', cls: 'text-[color:var(--ai-primary)]' }, { text: ':' }],
      [{ text: '  draft', cls: 'text-amber-300' }, { text: ':' }],
      [
        { text: '    uses', cls: 'text-[color:var(--ai-primary)]' },
        { text: ': ' },
        { text: 'studiai/ai-draft@v1', cls: 'text-emerald-400' },
      ],
      [{ text: '  review', cls: 'text-amber-300' }, { text: ':' }],
      [
        { text: '    needs', cls: 'text-[color:var(--ai-primary)]' },
        { text: ': ' },
        { text: 'draft', cls: 'text-pink-400' },
      ],
      [
        { text: '    uses', cls: 'text-[color:var(--ai-primary)]' },
        { text: ': ' },
        { text: 'studiai/ai-review@v1', cls: 'text-emerald-400' },
      ],
    ],
  },
];

/** Total characters in a snippet (for typing progress) */
function snippetLength(s: Snippet) {
  let n = 0;
  for (const line of s.lines) {
    for (const tok of line) n += tok.text.length;
    n += 1; // newline
  }
  return n;
}

/** Slice a snippet to only show the first N characters (preserving token colors) */
function sliceSnippet(s: Snippet, chars: number): Token[][] {
  const out: Token[][] = [];
  let remaining = chars;
  for (const line of s.lines) {
    const newLine: Token[] = [];
    for (const tok of line) {
      if (remaining <= 0) {
        newLine.push({ text: '', cls: tok.cls });
        continue;
      }
      if (tok.text.length <= remaining) {
        newLine.push(tok);
        remaining -= tok.text.length;
      } else {
        newLine.push({ text: tok.text.slice(0, remaining), cls: tok.cls });
        remaining = 0;
      }
    }
    out.push(newLine);
    remaining -= 1; // newline
    if (remaining <= 0) {
      // Ensure we still render any trailing empty lines as empty arrays
      while (out.length < s.lines.length) out.push([{ text: '', cls: '' }]);
      break;
    }
  }
  return out;
}

const TYPE_SPEED = 14; // ms per char
const HOLD_AT_END = 2200; // ms to hold full snippet
const HOLD_AT_START = 350;

export function CodeTyper() {
  const prefersReduced = useReducedMotion();
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibleRef = useRef(true);

  const snippet = SNIPPETS[snippetIdx];
  const total = snippetLength(snippet);

  useEffect(() => {
    if (prefersReduced) {
      setChars(total);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    let raf = 0;
    let last = performance.now();
    let pendingMs = HOLD_AT_START;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!visibleRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      pendingMs -= dt;
      if (pendingMs <= 0) {
        setChars((c) => {
          if (c >= total) {
            // schedule snippet swap
            pendingMs = HOLD_AT_END;
            setTimeout(() => {
              setChars(0);
              setSnippetIdx((i) => (i + 1) % SNIPPETS.length);
            }, HOLD_AT_END);
            return c;
          }
          pendingMs = TYPE_SPEED;
          return Math.min(total, c + 1);
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [snippetIdx, total, prefersReduced]);

  const sliced = sliceSnippet(snippet, chars);
  const isTyping = chars < total && !prefersReduced;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden border border-white/10 dark:border-white/10 shadow-2xl bg-[#0a0e17] text-[13px] leading-[1.55] font-mono"
      role="img"
      aria-label={`Code editor showing ${snippet.filename}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#070a11]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" aria-hidden />
        </div>
        <div className="flex-1 text-center text-xs text-white/50 font-sans tracking-wide">
          {snippet.filename}
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30 font-sans">
          {snippet.language}
        </div>
      </div>

      {/* Editor body */}
      <div className="px-4 py-4 min-h-[320px]">
        {sliced.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span
              aria-hidden
              className="select-none text-white/20 tabular-nums w-6 text-right shrink-0"
            >
              {i + 1}
            </span>
            <span className="whitespace-pre text-white/85 break-all">
              {line.map((tok, j) => (
                <span key={j} className={tok.cls}>
                  {tok.text}
                </span>
              ))}
              {/* Cursor on the current line */}
              {isTyping && i === sliced.length - 1 && (
                <span className="inline-block w-[7px] h-[14px] -mb-0.5 ml-0.5 bg-white/80 align-middle animate-cursor-blink" />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#060911] text-[11px] font-sans text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden />
          <span>connected</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>LF</span>
          <span className="text-white/60">{snippet.language}</span>
        </div>
      </div>
    </div>
  );
}
