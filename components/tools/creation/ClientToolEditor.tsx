/**
 * @fileoverview Full-Featured Client Tool IDE & Code Editor
 *
 * Pure UI shell for the ClientToolEditor. Logic is in useClientToolEditor.
 */

import React from 'react'
import {
  Globe,
  HardDrive,
  KeyRound,
  FileCode2,
  Sliders,
  PlayCircle,
  AlertCircle,
  Check,
  RotateCcw,
  GripVertical,
  History,
} from 'lucide-react'
import { Tool } from '../types'
import { ToolParametersBuilder } from './ToolParametersBuilder'
import { LiveTestSandbox } from './LiveTestSandbox'
import { ToolVersionHistory } from './ToolVersionHistory'
import { useClientToolEditor } from './useClientToolEditor'

export interface ClientToolEditorProps {
  initialTool?: Tool | null
  onCancel: () => void
  onSave: (tool: Tool) => void
}

export function ClientToolEditor(props: ClientToolEditorProps) {
  const { initialTool, onCancel } = props
  const {
    name, setName,
    description, setDescription,
    parameters,
    code, setCode,
    capabilities,
    activeRightTab, setActiveRightTab,
    showValidationErrors,
    feedbackNotice,
    showResetConfirm, setShowResetConfirm,
    parseStatus,
    leftWidthPercent,
    isResizing, setIsResizing,
    containerRef,
    toggleCapability,
    handleAddParam,
    handleUpdateParam,
    handleRemoveParam,
    handleResetToTemplate,
    isNameValid,
    isDescValid,
    handleSaveClick,
    showNotification,
  } = useClientToolEditor(props)

  const isValid = isNameValid && isDescValid

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Top Header info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-foreground">
            {initialTool ? 'Edit Client Tool' : 'Create Client Tool'}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Write JavaScript logic, configure input schema, and test in real-time sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-1.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90"
          >
            {initialTool ? 'Update Tool' : 'Save Tool'}
          </button>
        </div>
      </div>

      {showValidationErrors && !isValid && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Please provide both a <strong>Tool Name</strong> and a mandatory <strong>Description</strong> (used by the AI to understand when to invoke this tool).
          </span>
        </div>
      )}

      {/* Main Resizable Split Panels */}
      <div
        ref={containerRef}
        className="flex flex-col lg:flex-row min-h-0 flex-1 relative select-none gap-0 items-stretch"
        style={{ userSelect: isResizing ? 'none' : 'auto' }}
      >
        {/* Left Column (Code & Docs) */}
        <div
          style={{ width: `${leftWidthPercent}%` }}
          className="flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-[width] duration-75 min-w-[280px] shadow-sm"
        >
          {/* Tool Name Input & Code Sync Bar */}
          <div className="flex items-center justify-between border-b border-border bg-background/50 px-4 py-2.5">
            <div className="flex flex-1 items-center gap-2 mr-3">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">Name:</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. CalculateDistance"
                className={`bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/60 w-full ${
                  showValidationErrors && !isNameValid ? 'text-destructive placeholder:text-destructive/50' : 'text-foreground'
                }`}
              />
            </div>

            {/* Sync Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {feedbackNotice ? (
                <div className="flex items-center gap-1 rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[11px] text-primary">
                  <Check className="size-3 text-emerald-400" />
                  <span>{feedbackNotice}</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(!showResetConfirm)}
                    className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                    title="Reset code to default template"
                  >
                    <RotateCcw className="size-3" />
                  </button>

                  {showResetConfirm && (
                    <div className="absolute right-0 top-8 z-30 w-56 rounded-xl border border-border bg-card p-3 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">
                      <p className="text-[11px] font-medium text-foreground">Reset to default template?</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        This will replace your custom code with a fresh skeleton.
                      </p>
                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToTemplate}
                          className="rounded bg-destructive px-2 py-1 text-[10px] font-semibold text-destructive-foreground hover:opacity-90"
                        >
                          Reset Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mandatory Description Input */}
          <div className="flex items-start gap-2 border-b border-border bg-background/30 px-4 py-2">
            <span className="text-[11px] font-medium text-muted-foreground pt-1 shrink-0">Docs (Mandatory):</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Explain to the AI model what this tool does and when to call it..."
              className={`w-full resize-none bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/50 ${
                showValidationErrors && !isDescValid ? 'text-destructive placeholder:text-destructive/50' : 'text-muted-foreground focus:text-foreground'
              }`}
            />
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <textarea
              aria-label="Code editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 resize-none bg-background p-4 font-mono text-[12px] leading-6 text-foreground outline-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Resizer Handle with margin spacer */}
        <div
          onMouseDown={e => {
            e.preventDefault()
            setIsResizing(true)
          }}
          className="group relative hidden lg:flex items-center justify-center w-5 mx-1 cursor-col-resize z-20 select-none"
          title="Drag to resize panels"
        >
          <div
            className={`h-full w-[2px] transition-colors rounded-full ${
              isResizing ? 'bg-primary' : 'bg-border/60 group-hover:bg-primary/50'
            }`}
          />
          <div
            className={`absolute flex size-5 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all ${
              isResizing ? 'scale-110 border-primary text-primary bg-accent' : 'opacity-60 group-hover:opacity-100 text-muted-foreground group-hover:scale-105'
            }`}
          >
            <GripVertical className="size-3" />
          </div>
        </div>

        {/* Right Column (Parameters / Sandbox / Permissions) */}
        <div className="flex flex-col flex-1 rounded-xl border border-border bg-card overflow-hidden min-w-[280px] shadow-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-background/50 px-4 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setActiveRightTab('schema')}
              className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
                activeRightTab === 'schema'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCode2 className="size-3.5" />
              Parameters ({parameters.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('sandbox')}
              className={`flex items-center gap-1.5 py-3 ml-4 border-b-2 transition-colors ${
                activeRightTab === 'sandbox'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlayCircle className="size-3.5 text-primary" />
              Live Sandbox
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('capabilities')}
              className={`flex items-center gap-1.5 py-3 ml-4 border-b-2 transition-colors ${
                activeRightTab === 'capabilities'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="size-3.5" />
              Permissions
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('versions')}
              className={`flex items-center gap-1.5 py-3 ml-4 border-b-2 transition-colors ${
                activeRightTab === 'versions'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="size-3.5" />
              Revisions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeRightTab === 'schema' && (
              <ToolParametersBuilder
                parameters={parameters}
                onAddParam={handleAddParam}
                onUpdateParam={handleUpdateParam}
                onRemoveParam={handleRemoveParam}
                parseStatus={parseStatus}
              />
            )}

            {activeRightTab === 'sandbox' && (
              <LiveTestSandbox
                code={code}
                parameters={parameters}
                capabilities={capabilities}
                toolName={name}
                toolId={initialTool?.id}
                onRegisterSuccess={() => {
                  showNotification('Tool verified & registered in Cloudflare Sandbox!')
                }}
              />
            )}

            {activeRightTab === 'capabilities' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-[13px] font-semibold text-foreground">Runtime Capabilities</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Configure environment and access permissions granted to this tool.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Network */}
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                        <Globe className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">Network Access</span>
                        <span className="text-[11px] text-muted-foreground">Allow outgoing fetch/HTTP requests</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCapability('network')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        capabilities.network ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          capabilities.network ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Storage */}
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                        <HardDrive className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">Local Storage</span>
                        <span className="text-[11px] text-muted-foreground">Read and write cached local data</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCapability('storage')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        capabilities.storage ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          capabilities.storage ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Environment */}
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                        <KeyRound className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">Environment Variables</span>
                        <span className="text-[11px] text-muted-foreground">Access configured runtime environment</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCapability('environment')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        capabilities.environment ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          capabilities.environment ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'versions' && (
              <ToolVersionHistory
                toolId={initialTool?.id}
                currentVersionNumber={initialTool?.current_version?.version_number}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
