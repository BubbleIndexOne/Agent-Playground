/**
 * @fileoverview Playground Screen Component
 *
 * Pure presentational shell — all logic lives in `usePlayground`.
 * Renders the prompt editor, variable inputs, model output panel,
 * and the model configuration drawer.
 */

'use client'

import React from 'react'
import {
  Activity,
  FileJson,
  PanelLeft,
  Play,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { usePlayground } from './usePlayground'
import { StatusPill } from './StatusPill'
import { ModelConfigurationDrawer } from './ModelConfigurationDrawer'

export function PlaygroundScreen() {
  const {
    prompt, setPrompt,
    values, setValues,
    variables, ready,
    providers,
    providerId, setProviderId,
    modelId, setModelId,
    apiKey, setApiKey,
    configs, setConfigs,
    currentModelName,
    presets,
    handleApplyPreset,
    configOpen, setConfigOpen,
    run,
    ran, loading,
    responseOutput,
    errorMsg,
    showRaw, setShowRaw,
    latency, tokens,
  } = usePlayground()

  return (
    <main
      className="flex min-w-0 flex-1 flex-col"
      onKeyDown={e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          run()
        }
      }}
    >
      <header className="flex h-[68px] items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex">
            <PanelLeft className="size-3.5" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">Playground</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">A calm space to build and test</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill icon={Sparkles} label="Model" value={currentModelName} onClick={() => setConfigOpen(true)} />
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium text-primary">Playground</p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Try an idea</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Shape a prompt, add your inputs, and see what happens.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setConfigOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent sm:flex"
            >
              <SlidersHorizontal className="size-3.5 text-muted-foreground" /> Tune Model
            </button>
            <button
              onClick={run}
              disabled={!ready || loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="size-3.5 fill-current" />
              Run
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

          {/* Left Column: Prompt Template & Variable Inputs */}
          <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold">Prompt template</label>
              <span className="text-[11px] text-muted-foreground">Template editor</span>
            </div>
            <textarea
              aria-label="Prompt template"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="mt-4 min-h-[190px] flex-1 resize-none rounded-lg border border-border bg-background p-3 font-mono text-[12px] leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                Inputs <span className="font-normal">— detected from your template</span>
              </p>
              {variables.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                  Type <span className="font-mono text-foreground">{'{{variable_name}}'}</span> in your prompt to add an input.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variables.map(name => (
                    <label
                      key={name}
                      className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/[0.08] px-2.5 py-1.5"
                    >
                      <span className="font-mono text-[11px] text-primary select-none">{`{{${name}}}`}</span>
                      <input
                        type="search"
                        role="combobox"
                        aria-expanded="false"
                        aria-label={`${name} value`}
                        name={`var_${name}`}
                        value={values[name] ?? ''}
                        onChange={e => setValues({ ...values, [name]: e.target.value })}
                        placeholder="enter value"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        className="w-24 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Model Output */}
          <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold">Response</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Your model output will appear here.</p>
              </div>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className={`rounded-md p-1.5 transition-colors ${
                  showRaw ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                aria-label="Toggle raw text"
                title="Toggle raw text"
              >
                <FileJson className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-background/70 p-6 text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Activity className="size-4 animate-spin text-primary" />
                  <p className="text-[12px]">Running model...</p>
                </div>
              ) : errorMsg ? (
                <p className="w-full text-left text-[13px] leading-6 text-destructive break-words">{errorMsg}</p>
              ) : responseOutput ? (
                <div className="w-full h-full overflow-auto text-left text-[13px] leading-6">
                  {showRaw ? (
                    <pre className="whitespace-pre-wrap font-mono text-[12px]">{responseOutput}</pre>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-6 prose-pre:bg-accent prose-pre:text-[12px]">
                      <ReactMarkdown>{responseOutput}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : ran ? (
                <p className="max-w-sm text-[13px] leading-6 text-foreground">Waiting for response...</p>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent">
                    <Activity className="size-4 text-primary" />
                  </div>
                  <p className="text-[12px]">Nothing yet. Run your prompt to see the result.</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
              <span>Tokens used <strong className="ml-1 font-medium text-foreground">{tokens !== null ? tokens : '—'}</strong></span>
              <span>Latency <strong className="ml-1 font-medium text-foreground">{latency !== null ? `${latency}ms` : '—'}</strong></span>
              <span>Model <strong className="ml-1 font-medium text-foreground">{currentModelName}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {configOpen && (
        <ModelConfigurationDrawer
          providers={providers}
          providerId={providerId}
          modelId={modelId}
          apiKey={apiKey}
          configs={configs}
          setProviderId={setProviderId}
          setModelId={setModelId}
          setApiKey={setApiKey}
          setConfigs={setConfigs}
          onClose={() => setConfigOpen(false)}
          presets={presets}
          onApplyPreset={handleApplyPreset}
        />
      )}
    </main>
  )
}
