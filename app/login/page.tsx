/**
 * @fileoverview Loom Sign In / Sign Up Route (/login)
 *
 * Two-column full-screen authentication page inspired by the Loom studio architecture reference:
 * - Left panel: In-place authentication (sign-in & sign-up), OAuth placeholders, sleek dark styling.
 * - Right panel: Celestial space background with planetary horizon curve glow, the core Architecture
 *   Studio diagram (Models, Tools, MCP Servers, Logic -> Loom [Compose] -> AI System [Live]),
 *   and 3-column horizontal feature highlights.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  BarChart2,
  BarChart3,
  Box,
  Wrench,
  Server,
  Code2,
  Package,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LoomIcon } from '@/components/ui/LoomIcon'

// ─── OAuth Button ─────────────────────────────────────────────────────────────

function OAuthButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group relative">
      <button
        type="button"
        disabled
        className="flex w-full items-center gap-3 rounded-lg border border-white/[0.08] bg-[#121215] px-4 py-2.5 text-[13px] font-medium text-zinc-400 transition-colors hover:border-white/[0.14]"
        aria-describedby={`${label}-tooltip`}
      >
        <span className="size-4 shrink-0 opacity-70">{icon}</span>
        <span>Continue with {label}</span>
      </button>
      <div
        id={`${label}-tooltip`}
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 rounded-md bg-[#1d1d23] border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-zinc-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        Coming soon
      </div>
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const GitHubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="size-full">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

// ─── Input Field Component ────────────────────────────────────────────────────

function FormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  rightElement,
  autoComplete,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  rightElement?: React.ReactNode
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-white/[0.08] bg-[#121215] px-3.5 py-2.5 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30"
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Architecture Flow Diagram ────────────────────────────────────────────────

function ArchitectureDiagram() {
  return (
    <div className="relative my-4 w-[920px] h-[340px] max-w-full select-none mx-auto">
      {/* Dynamic Curved SVG Connector Lines with Subtly Dimmed Glow */}
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 920 340"
        fill="none"
      >
        <defs>
          {/* Soft Dimmed Glow Filter */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wire Gradients: Left to Center */}
          <linearGradient id="wire-prompts" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-models" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-tools" x1="195" y1="161" x2="405" y2="161" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-mcp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-logic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
          </linearGradient>

          {/* Wire Gradients: Center to Right */}
          <linearGradient id="wire-research" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-automate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-analyze" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="wire-operate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* ── Soft Glow Underlayers (Left to Center) - 50% line width reduced ── */}
        <path d="M 195 33 C 290 33, 330 157, 405 157" stroke="url(#wire-prompts)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 195 97 C 280 97, 330 159, 405 159" stroke="url(#wire-models)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 195 161 C 265 160.5, 335 161.5, 405 161" stroke="url(#wire-tools)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 195 225 C 280 225, 330 163, 405 163" stroke="url(#wire-mcp)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 195 289 C 290 289, 330 165, 405 165" stroke="url(#wire-logic)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />

        {/* ── Core Strokes (Left to Center) - 50% line width reduced to 1.25px ── */}
        <path d="M 195 33 C 290 33, 330 157, 405 157" stroke="url(#wire-prompts)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 195 97 C 280 97, 330 159, 405 159" stroke="url(#wire-models)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 195 161 C 265 160.5, 335 161.5, 405 161" stroke="url(#wire-tools)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 195 225 C 280 225, 330 163, 405 163" stroke="url(#wire-mcp)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 195 289 C 290 289, 330 165, 405 165" stroke="url(#wire-logic)" strokeWidth="1.25" strokeLinecap="round" />

        {/* ── Soft Glow Underlayers (Center to Right) - 50% line width reduced ── */}
        <path d="M 521 157 C 560 157, 570 48, 615 48" stroke="url(#wire-research)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 521 159 C 585 159, 635 118, 715 118" stroke="url(#wire-automate)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 521 163 C 565 163, 595 188, 645 188" stroke="url(#wire-analyze)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />
        <path d="M 521 165 C 565 165, 580 258, 630 258" stroke="url(#wire-operate)" strokeWidth="3" strokeOpacity="0.2" filter="url(#neon-glow)" />

        {/* ── Core Strokes (Center to Right) - 50% line width reduced to 1.25px ── */}
        <path d="M 521 157 C 560 157, 570 48, 615 48" stroke="url(#wire-research)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 521 159 C 585 159, 635 118, 715 118" stroke="url(#wire-automate)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 521 163 C 565 163, 595 188, 645 188" stroke="url(#wire-analyze)" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M 521 165 C 565 165, 580 258, 630 258" stroke="url(#wire-operate)" strokeWidth="1.25" strokeLinecap="round" />

        {/* Dashed Indicator Arc Behind Right Cards */}
        <path
          d="M 770 30 A 180 190 0 0 1 815 240"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="4 5"
          fill="none"
        />

        {/* Subtle Ambient Particle Specks */}
        <circle cx="760" cy="35" r="1.5" fill="#c084fc" opacity="0.6" />
        <circle cx="820" cy="180" r="1.5" fill="#34d399" opacity="0.6" />
        <circle cx="795" cy="245" r="1.5" fill="#38bdf8" opacity="0.6" />
      </svg>

      {/* ── Left Column: 5 Inputs (What Loom Provides) ── */}
      {/* 1. Prompts */}
      <div
        style={{ left: '10px', top: '10px', width: '185px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20">
          <MessageSquare className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Prompts</p>
          <p className="text-[9px] text-zinc-400 truncate">Your ideas, goals, context</p>
        </div>
        {/* Soft Glowing Connector Dot */}
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-purple-400 ring-2 ring-purple-500/25 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
      </div>

      {/* 2. Models */}
      <div
        style={{ left: '10px', top: '74px', width: '185px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
          <Box className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Models</p>
          <p className="text-[9px] text-zinc-400 truncate">Frontier and open models</p>
        </div>
        {/* Soft Glowing Connector Dot */}
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-indigo-400 ring-2 ring-indigo-500/25 shadow-[0_0_6px_rgba(129,140,248,0.6)]" />
      </div>

      {/* 3. Tools */}
      <div
        style={{ left: '10px', top: '138px', width: '185px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <Wrench className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Tools</p>
          <p className="text-[9px] text-zinc-400 truncate">Ready-made or custom</p>
        </div>
        {/* Soft Glowing Connector Dot */}
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/25 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
      </div>

      {/* 4. MCP Servers */}
      <div
        style={{ left: '10px', top: '202px', width: '185px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20">
          <Server className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">MCP Servers</p>
          <p className="text-[9px] text-zinc-400 truncate">Connect to your world</p>
        </div>
        {/* Soft Glowing Connector Dot */}
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-sky-400 ring-2 ring-sky-500/25 shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
      </div>

      {/* 5. Logic */}
      <div
        style={{ left: '10px', top: '266px', width: '185px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
          <Code2 className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Logic</p>
          <p className="text-[9px] text-zinc-400 truncate">Control, orchestrate, extend</p>
        </div>
        {/* Soft Glowing Connector Dot */}
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/25 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
      </div>

      {/* ── Center: Loom Engine (Softened Glow) ── */}
      <div
        style={{ left: '405px', top: '103px', width: '116px', height: '116px' }}
        className="absolute flex flex-col items-center justify-center rounded-2xl border border-[#3b82f6]/50 bg-[#0b0e22]/95 shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_50px_rgba(99,102,241,0.15),inset_0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-center">
          <LoomIcon className="w-14 h-8" />
        </div>
        <span className="mt-1 text-[16px] font-bold tracking-tight text-white">Loom</span>
      </div>
      {/* Under Loom: BRING IT TOGETHER (Ref: Img 2 single line, tracked) */}
      <div
        style={{ left: '463px', top: '232px' }}
        className="absolute -translate-x-1/2 pointer-events-none text-center whitespace-nowrap"
      >
        <span className="text-[10px] font-medium tracking-[0.28em] text-white/40 uppercase">
          Bring It Together
        </span>
      </div>

      {/* ── Right Column: 4 Outcomes (What You Can Build) ── */}
      {/* 1. Research */}
      <div
        style={{ left: '615px', top: '25px', width: '170px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-fuchsia-400 ring-2 ring-fuchsia-500/25 shadow-[0_0_6px_rgba(217,70,239,0.6)]" />
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20">
          <Search className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Research</p>
          <p className="text-[9px] text-zinc-400 truncate">Find, learn, discover</p>
        </div>
      </div>

      {/* 2. Automate (Staggered Right) */}
      <div
        style={{ left: '715px', top: '95px', width: '170px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-violet-400 ring-2 ring-violet-500/25 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/20">
          <Zap className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Automate</p>
          <p className="text-[9px] text-zinc-400 truncate">Save time, take action</p>
        </div>
      </div>

      {/* 3. Analyze */}
      <div
        style={{ left: '645px', top: '165px', width: '170px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/25 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <BarChart3 className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Analyze</p>
          <p className="text-[9px] text-zinc-400 truncate">Turn data into insights</p>
        </div>
      </div>

      {/* 4. Operate */}
      <div
        style={{ left: '630px', top: '235px', width: '170px', height: '46px' }}
        className="absolute flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#10121a]/95 px-3 py-1.5 shadow-md backdrop-blur-md"
      >
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-sky-400 ring-2 ring-sky-500/25 shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20">
          <Users className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white leading-tight">Operate</p>
          <p className="text-[9px] text-zinc-400 truncate">Power real workflows</p>
        </div>
      </div>

      {/* ── Handwritten Cursive Annotation (Ref: Img 3) ── */}
      <div className="pointer-events-none absolute right-[35px] top-[-2px] select-none text-right">
        <p className="font-[family-name:var(--font-caveat)] text-[22px] text-[#9bb0ff]/90 leading-[1.05] -rotate-3 font-bold drop-shadow-[0_0_6px_rgba(155,176,255,0.3)]">
          Build<br />what you need.
        </p>
        {/* Hand-drawn Arrow Pointing down to Automate */}
        <svg className="w-8 h-8 text-[#9bb0ff]/80 -rotate-12 mt-0.5 ml-auto mr-4" viewBox="0 0 32 32" fill="none">
          <path
            d="M 14 4 C 20 8, 22 18, 15 26 M 15 26 L 11 20 M 15 26 L 21 22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Bottom Right: And so much more. (Caveat font matching Build what you need) ── */}
      <div className="pointer-events-none absolute right-[18px] bottom-[25px] select-none text-right">
        <p className="font-[family-name:var(--font-caveat)] text-[19px] text-[#9bb0ff]/70 leading-none -rotate-2 font-bold drop-shadow-[0_0_6px_rgba(155,176,255,0.25)]">
          And so<br />much more.
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Panel = 'login' | 'signup'

export default function LoginPage() {
  const { login, signUp, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [panel, setPanel] = useState<Panel>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Redirect already-authenticated users to the workspace
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, authLoading, router])

  const handlePanelSwitch = (next: Panel) => {
    setPanel(next)
    setFormError(null)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (panel === 'login') {
        await login({ email, password })
      } else {
        await signUp({ email, password, first_name: firstName, last_name: lastName || undefined })
        // Auto-login after successful signup
        await login({ email, password })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#070709] text-foreground">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="relative flex w-full max-w-full lg:max-w-[440px] xl:max-w-[460px] shrink-0 flex-col justify-between border-r border-white/[0.06] bg-[#090a0d] px-8 sm:px-12 py-8 z-10">
        
        {/* Brand header */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LoomIcon className="size-6 text-indigo-400" />
              <span className="text-[18px] font-bold tracking-tight text-white">Loom</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 tracking-wider">v0.1</span>
          </div>
          <p className="mt-2 text-[12px] text-zinc-400 leading-relaxed">
            An architecture studio for AI systems.
          </p>
        </div>

        {/* Form section */}
        <div className="flex flex-col gap-6 py-6">
          {/* Panel heading */}
          <div>
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-white">
              {panel === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              {panel === 'login' ? 'Sign in to continue building.' : 'Start building your AI systems.'}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5">
            <OAuthButton icon={GitHubIcon} label="GitHub" />
            <OAuthButton icon={GoogleIcon} label="Google" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">or</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {panel === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="first-name"
                  label="First name"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                />
                <FormInput
                  id="last-name"
                  label="Last name"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={setLastName}
                  autoComplete="family-name"
                />
              </div>
            )}

            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[12px] font-medium text-zinc-300">
                  Password
                </label>
                {panel === 'login' && (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={panel === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#121215] py-2.5 pl-3.5 pr-10 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Inline form error */}
            {formError && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-400">
                {formError}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              id="submit-auth"
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#534ae4] to-[#685ff4] py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{panel === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Panel switcher */}
          <p className="text-center text-[12px] text-zinc-400">
            {panel === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => handlePanelSwitch('signup')}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handlePanelSwitch('login')}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom footer */}
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-indigo-500/60" />
          <span className="text-[11px] text-zinc-500">Build what&apos;s next.</span>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#06070a] p-10 lg:flex select-none">

        {/* ── Background Cosmic Canvas & Luminous Earth Horizon ── */}
        <div className="pointer-events-none absolute inset-0">
          {/* Subtle Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '54px 54px',
            }}
          />

          {/* Deep violet radial aura behind hero */}
          <div className="absolute left-1/2 top-1/4 h-[550px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/[0.09] blur-[140px]" />

          {/* Planetary Earth Horizon Arc with Subtly Dimmed Atmospheric Corona */}
          <div className="absolute -bottom-[420px] left-1/2 -translate-x-1/2 w-[1650px] h-[720px] rounded-[100%] border-t border-[#3b82f6]/35 shadow-[0_-4px_25px_rgba(59,130,246,0.25),0_-1px_10px_rgba(147,197,253,0.3)] bg-gradient-to-b from-[#0a0f28] via-[#040612] to-[#020306]">
            {/* Atmospheric corona haze rising into space */}
            <div className="absolute inset-x-0 -top-16 h-36 bg-gradient-to-b from-blue-500/15 via-indigo-500/08 to-transparent blur-3xl" />
            <div className="absolute inset-x-0 -top-4 h-12 bg-gradient-to-b from-cyan-400/15 via-blue-500/08 to-transparent blur-xl" />
          </div>
        </div>

        {/* Top ticker row */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
            <span>Ideas</span>
            <span className="text-indigo-400/60">→</span>
            <span>Systems</span>
            <span className="text-indigo-400/60">→</span>
            <span>Impact</span>
          </div>

          <div className="flex items-center gap-3 text-right">
            <span className="text-[9px] font-semibold tracking-[0.16em] text-white/20 uppercase leading-tight">
              More<br />Capable<br />Tomorrow
            </span>
            <div className="h-6 w-0.5 bg-indigo-500/40" />
          </div>
        </div>

        {/* Central Content (Hero & Architecture Diagram) */}
        <div className="relative z-10 my-auto flex flex-col justify-center px-6 lg:px-10 py-4 max-w-5xl mx-auto w-full">
          <div>
            <h2 className="text-[44px] xl:text-[50px] font-bold leading-[1.08] tracking-[-0.03em] text-white">
              From ideas<br />
              <span className="bg-gradient-to-r from-[#7082ff] via-[#a5b4fc] to-[#5567f7] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(112,130,255,0.45)]">
                to intelligent systems.
              </span>
            </h2>
            <p className="mt-3.5 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              Compose agents, connect tools, and deploy powerful AI systems — all in one place.
            </p>
          </div>

          {/* Central Architecture Studio Visual */}
          <div className="mt-6">
            <ArchitectureDiagram />
          </div>

          {/* Bottom 3-Card Feature Highlights (Ref: Img 2) */}
          <div className="mt-6 grid grid-cols-3 gap-3.5">
            {/* Card 1 */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d0f19]/80 p-3.5 shadow-lg backdrop-blur-md">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                <Zap className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white">Build your way</p>
                <p className="mt-0.5 text-[11px] text-zinc-400 truncate">Use what you need. Start simple, scale later.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d0f19]/80 p-3.5 shadow-lg backdrop-blur-md">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                <BarChart2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white">Stay in control</p>
                <p className="mt-0.5 text-[11px] text-zinc-400 truncate">Test, iterate, and refine with confidence.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d0f19]/80 p-3.5 shadow-lg backdrop-blur-md">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                <Package className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white">Ship what works</p>
                <p className="mt-0.5 text-[11px] text-zinc-400 truncate">Turn ideas into real impact.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

