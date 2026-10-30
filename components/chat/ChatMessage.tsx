'use client'

/**
 * @fileoverview ChatMessage – Individual message bubble
 *
 * Renders user and assistant messages with markdown, copy, and metadata.
 */

import React, { useState } from 'react'
import { Check, Copy, AlertTriangle, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ChatMessage as ChatMessageType } from './types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = !!message.error

  function handleCopy() {
    const text = message.content || message.error || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="group relative max-w-[72%]">
          <div className="rounded-2xl rounded-tr-sm bg-primary/[0.15] border border-primary/20 px-4 py-3 text-[14px] leading-7 text-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 right-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-foreground"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex gap-3 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Avatar */}
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-violet-400/60 shadow-[0_0_12px_rgba(116,103,247,0.25)]">
        <span className="text-[10px] font-bold text-white">L</span>
      </div>

      <div className="group min-w-0 flex-1">
        {message.isStreaming ? (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-[13px]">Thinking...</span>
          </div>
        ) : isError ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <p className="text-[13px] leading-6 text-red-400">{message.error}</p>
          </div>
        ) : (
          <>
            <div className="prose prose-sm prose-invert max-w-none text-[14px] leading-7
              prose-p:my-2 prose-p:leading-7
              prose-headings:font-semibold prose-headings:text-foreground
              prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:rounded prose-code:bg-white/[0.07] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[12px] prose-code:font-mono prose-code:text-violet-300 prose-code:before:content-none prose-code:after:content-none
              prose-pre:rounded-xl prose-pre:border prose-pre:border-white/[0.08] prose-pre:bg-[#0f0f12] prose-pre:p-4 prose-pre:text-[12px]
              prose-ul:my-2 prose-ol:my-2
              prose-li:my-0.5
              prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            ">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Footer: copy + metadata */}
            <div className="mt-3 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
              >
                {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {message.model && (
                <span className="text-[11px] text-muted-foreground/50">{message.model}</span>
              )}
              {message.tokens !== undefined && (
                <span className="text-[11px] text-muted-foreground/50">{message.tokens} tokens</span>
              )}
              {message.latencyMs !== undefined && (
                <span className="text-[11px] text-muted-foreground/50">{message.latencyMs}ms</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
