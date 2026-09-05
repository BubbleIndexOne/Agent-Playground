import { useState } from 'react'
import { Activity, Globe, Database, HardDrive, KeyRound } from 'lucide-react'

interface ClientToolEditorProps {
  onCancel: () => void
  onSave: () => void
}

const DEFAULT_CODE = `/**
 * @param {Object} args
 * @returns {Promise<any>}
 */
export async function execute(args) {
  // Your code here
  return { status: "success" };
}`

export function ClientToolEditor({ onCancel, onSave }: ClientToolEditorProps) {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Mock capabilities state
  const [capabilities, setCapabilities] = useState({
    network: true,
    storage: false,
    environment: false
  })

  const toggleCapability = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      
      {/* Left panel: Editor */}
      <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-background/50 px-4 py-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tool Name (e.g. Fetch Weather)"
            className="bg-transparent text-[14px] font-semibold outline-none placeholder:text-muted-foreground min-w-[200px]"
          />
        </div>
        <div className="flex items-center border-b border-border bg-background/50 px-4 py-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            className="w-full bg-transparent text-[12px] text-muted-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <textarea
          aria-label="Code editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 resize-none bg-background p-4 font-mono text-[12px] leading-6 text-foreground outline-none focus:ring-0"
          spellCheck={false}
        />
      </div>

      {/* Right panel: Capabilities & Actions */}
      <div className="flex flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="text-[14px] font-semibold">Capabilities</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Configure what this tool can access.</p>
        </div>
        
        <div className="flex flex-col flex-1 p-5 gap-6">
          {/* Capability Toggle Item */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                <Globe className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium">Network Access</span>
                <span className="text-[11px] text-muted-foreground">Make outgoing HTTP requests</span>
              </div>
            </div>
            <button
              onClick={() => toggleCapability('network')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                capabilities.network ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  capabilities.network ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                <HardDrive className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium">Local Storage</span>
                <span className="text-[11px] text-muted-foreground">Read and write local files</span>
              </div>
            </div>
            <button
              onClick={() => toggleCapability('storage')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                capabilities.storage ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  capabilities.storage ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                <KeyRound className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium">Environment</span>
                <span className="text-[11px] text-muted-foreground">Access environment variables</span>
              </div>
            </div>
            <button
              onClick={() => toggleCapability('environment')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                capabilities.environment ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  capabilities.environment ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-auto border-t border-border p-5 flex items-center justify-between bg-background/50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Tool
          </button>
        </div>
      </div>
    </div>
  )
}
