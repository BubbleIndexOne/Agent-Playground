'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Activity, Bot, Check, ChevronDown, CircleHelp, Clock3, Command, Eye, EyeOff,
  FileJson, KeyRound, LockKeyhole, Menu, PanelLeft, Play, Settings2, Sparkles,
  Wrench, X, Zap, SlidersHorizontal
} from 'lucide-react'
import { getProviders, getKey, saveKey, clearKey, callModel, Provider, ModelConfig, getModelConfigs, saveModelConfigs } from '@/src/lib/api'
import { DEFAULT_MODEL_CONFIGS } from '@/src/lib/constants'
import ReactMarkdown from 'react-markdown'

const navigation = [
  { label: 'Playground', description: 'Experiment with models', icon: Play },
  { label: 'Tools', description: 'Reusable capabilities', icon: Wrench },
  { label: 'Agents', description: 'Automated workflows', icon: Bot },
  { label: 'History', description: 'Your recent runs', icon: Clock3 },
]

function Logo() {
  return <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"><Command className="size-4" strokeWidth={2.5} /></div><span className="text-[15px] font-semibold tracking-[-0.02em]">Console</span></div>
}

function Sidebar({ active, onSelect }: { active: string; onSelect: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  return <>
    <button aria-label="Open navigation" className="fixed left-4 top-4 z-20 flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden" onClick={() => setOpen(true)}><Menu className="size-4" /></button>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-background/70 md:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-border bg-sidebar px-3 py-5 transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3"><Logo /><button aria-label="Close navigation" className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent md:hidden" onClick={() => setOpen(false)}><X className="size-4" /></button></div>
      <div className="mt-9 flex flex-col gap-6"><div><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workspace</p><nav aria-label="Main navigation" className="flex flex-col gap-1">{navigation.map(({ label, description, icon: Icon }) => { const selected = active === label; return <button key={label} onClick={() => { onSelect(label); setOpen(false) }} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selected ? 'bg-primary/[0.1] text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`} aria-current={selected ? 'page' : undefined}><Icon className={`size-[17px] shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={selected ? 2.3 : 1.8} /><span className="flex min-w-0 flex-col gap-0.5"><span className="text-[13px] font-medium leading-4">{label}</span><span className="truncate text-[11px] leading-4 text-muted-foreground">{description}</span></span></button> })}</nav></div><div><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resources</p><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><CircleHelp className="size-[17px]" strokeWidth={1.8} /><span className="text-[13px] font-medium">Documentation</span></button></div></div>
      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4"><button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-[17px]" strokeWidth={1.8} /><span className="text-[13px] font-medium">Settings</span></button><div className="mt-2 flex items-center gap-3 rounded-lg bg-accent/60 px-3 py-2.5"><div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">JD</div><div className="min-w-0"><p className="truncate text-[12px] font-medium">Jordan Davis</p><p className="truncate text-[11px] text-muted-foreground">Personal workspace</p></div><ChevronDown className="ml-auto size-3.5 text-muted-foreground" /></div></div>
    </aside>
  </>
}

function StatusPill({ icon: Icon, label, value, onClick, connected = false }: { icon: typeof Activity; label: string; value: string; onClick: () => void; connected?: boolean }) {
  return <button onClick={onClick} className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary/50 hover:bg-accent" aria-label={`${label}: ${value}. Open model settings`}><Icon className="size-3.5 text-muted-foreground group-hover:text-primary" /><span className="hidden text-[11px] text-muted-foreground sm:inline">{label}</span><span className="text-[11px] font-medium text-foreground">{value}</span>{connected ? <span className="size-1.5 rounded-full bg-emerald-400" /> : <ChevronDown className="size-3 text-muted-foreground" />}</button>
}

function BasicModelSettings({ providers, providerId, modelId, apiKey, setProviderId, setModelId, setApiKey, onClose }: { providers: Provider[]; providerId: string; modelId: string; apiKey: string; setProviderId: (v: string) => void; setModelId: (v: string) => void; setApiKey: (v: string) => void; onClose: () => void }) {
  const [draftProvider, setDraftProvider] = useState(providerId)
  const [draftModel, setDraftModel] = useState(modelId)
  const [draftKey, setDraftKey] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const save = () => { setProviderId(draftProvider); setModelId(draftModel); setApiKey(draftKey.trim()); saveKey(draftKey.trim()); onClose() }
  const clear = () => { setDraftKey(''); setApiKey(''); clearKey() }
  const currentProvider = providers.find(p => p.id === draftProvider) || providers[0]

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="model-settings-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between"><div><p className="text-[11px] font-medium text-primary">Workspace configuration</p><h2 id="model-settings-title" className="mt-1 text-[19px] font-semibold tracking-[-0.025em]">Model &amp; API Key</h2></div><button aria-label="Close model settings" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><X className="size-4" /></button></div>
      <div className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-2"><label htmlFor="provider" className="text-[12px] font-medium">Model provider</label>
          <div className="relative"><select id="provider" value={draftProvider} onChange={(e) => { setDraftProvider(e.target.value); const p = providers.find(p => p.id === e.target.value); if(p) setDraftModel(p.models[0].id) }} className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div>
        </div>
        <div className="flex flex-col gap-2"><label htmlFor="model" className="text-[12px] font-medium">Model</label>
          <div className="relative"><select id="model" value={draftModel} onChange={(e) => setDraftModel(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {currentProvider.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div>
        </div>
        <div className="flex flex-col gap-2"><label htmlFor="settings-key" className="text-[12px] font-medium">API key</label>
          <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><input id="settings-key" type={visible ? 'text' : 'password'} value={draftKey} onChange={e => setDraftKey(e.target.value)} placeholder="sk-ant-..." className="h-10 w-full rounded-lg border border-border bg-background px-10 pr-10 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /><button type="button" aria-label={visible ? 'Hide API key' : 'Show API key'} onClick={() => setVisible(!visible)} className="absolute right-2 top-2 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><p className="text-[11px] leading-5 text-muted-foreground">Stored only for this browser session — cleared when you close this tab. Never sent anywhere except directly to the model provider.</p>
        </div>
      </div>
      <div className="mt-7 flex items-center justify-between"><button onClick={clear} className="rounded-md px-1 py-2 text-[12px] text-muted-foreground transition-colors hover:text-destructive">Clear key</button><button onClick={save} className="glow-hover rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">Save</button></div>
    </div>
  </div>
}

function AdvancedModelSettings({ providers, providerId, modelId, apiKey, configs, setProviderId, setModelId, setApiKey, setConfigs, onClose }: { providers: Provider[]; providerId: string; modelId: string; apiKey: string; configs: ModelConfig; setProviderId: (v: string) => void; setModelId: (v: string) => void; setApiKey: (v: string) => void; setConfigs: (v: ModelConfig) => void; onClose: () => void }) {
  const [draftProvider, setDraftProvider] = useState(providerId)
  const [draftModel, setDraftModel] = useState(modelId)
  const [draftKey, setDraftKey] = useState(apiKey)
  const [draftConfigs, setDraftConfigs] = useState<ModelConfig>(configs)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'model'>('config')

  const save = () => { 
    setProviderId(draftProvider); 
    setModelId(draftModel); 
    setApiKey(draftKey.trim()); 
    saveKey(draftKey.trim()); 
    setConfigs(draftConfigs);
    saveModelConfigs(draftConfigs);
    onClose() 
  }
  const clear = () => { setDraftKey(''); setApiKey(''); clearKey() }
  const currentProvider = providers.find(p => p.id === draftProvider) || providers[0]

  const updateConfig = (key: keyof ModelConfig, value: any) => {
    setDraftConfigs(prev => ({ ...prev, [key]: value }))
  }

  const resetConfigs = () => {
    setDraftConfigs({})
  }

  return <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="model-settings-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="w-full max-w-[400px] h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div><h2 id="model-settings-title" className="text-[19px] font-semibold tracking-[-0.025em]">Tune Model</h2><p className="text-[11px] text-muted-foreground mt-1">Configure workspace and model parameters</p></div>
        <button aria-label="Close model settings" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><X className="size-4" /></button>
      </div>
      
      <div className="flex border-b border-border px-6 mt-2 gap-4 text-[12px] font-medium">
        <button onClick={() => setActiveTab('config')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Configuration</button>
        <button onClick={() => setActiveTab('model')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'model' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Model & API Key</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {activeTab === 'model' ? (
          <>
            <div className="flex flex-col gap-2"><label htmlFor="provider" className="text-[12px] font-medium">Model provider</label>
              <div className="relative"><select id="provider" value={draftProvider} onChange={(e) => { setDraftProvider(e.target.value); const p = providers.find(p => p.id === e.target.value); if(p) setDraftModel(p.models[0].id) }} className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div>
            </div>
            <div className="flex flex-col gap-2"><label htmlFor="model" className="text-[12px] font-medium">Model</label>
              <div className="relative"><select id="model" value={draftModel} onChange={(e) => setDraftModel(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {currentProvider.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div>
            </div>
            <div className="flex flex-col gap-2"><label htmlFor="settings-key" className="text-[12px] font-medium">API key</label>
              <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><input id="settings-key" type={visible ? 'text' : 'password'} value={draftKey} onChange={e => setDraftKey(e.target.value)} placeholder="sk-ant-..." className="h-10 w-full rounded-lg border border-border bg-background px-10 pr-10 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /><button type="button" aria-label={visible ? 'Hide API key' : 'Show API key'} onClick={() => setVisible(!visible)} className="absolute right-2 top-2 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><p className="text-[11px] leading-5 text-muted-foreground">Stored only for this browser session.</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Creativity</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Temperature <span className="text-muted-foreground">{draftConfigs.temperature ?? DEFAULT_MODEL_CONFIGS.temperature}</span></label>
                    <input type="range" min="0" max="2" step="0.1" value={draftConfigs.temperature ?? DEFAULT_MODEL_CONFIGS.temperature} onChange={e => updateConfig('temperature', parseFloat(e.target.value))} className="accent-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Stop Sequences</label>
                    <input type="text" value={draftConfigs.stopSequences?.join(', ') ?? ''} onChange={e => { const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean); updateConfig('stopSequences', vals.length > 0 ? vals : undefined) }} placeholder="e.g. stop, 🛑" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Length</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Max Output Tokens</label>
                    <input type="number" min="1" value={draftConfigs.maxOutputTokens ?? ''} onChange={e => updateConfig('maxOutputTokens', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Provider default" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sampling</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Top P <span className="text-muted-foreground">{draftConfigs.topP ?? DEFAULT_MODEL_CONFIGS.topP}</span></label>
                    <input type="range" min="0" max="1" step="0.05" value={draftConfigs.topP ?? DEFAULT_MODEL_CONFIGS.topP} onChange={e => updateConfig('topP', parseFloat(e.target.value))} className="accent-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Top K <span className="text-muted-foreground">{draftConfigs.topK ?? 'Provider default'}</span></label>
                    <input type="range" min="2" max="100" step="1" value={draftConfigs.topK ?? DEFAULT_MODEL_CONFIGS.topK} onChange={e => updateConfig('topK', parseInt(e.target.value))} className="accent-primary" />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Penalties</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Presence Penalty <span className="text-muted-foreground">{draftConfigs.presencePenalty ?? DEFAULT_MODEL_CONFIGS.presencePenalty}</span></label>
                    <input type="range" min="-2" max="2" step="0.1" value={draftConfigs.presencePenalty ?? DEFAULT_MODEL_CONFIGS.presencePenalty} onChange={e => updateConfig('presencePenalty', parseFloat(e.target.value))} className="accent-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Frequency Penalty <span className="text-muted-foreground">{draftConfigs.frequencyPenalty ?? DEFAULT_MODEL_CONFIGS.frequencyPenalty}</span></label>
                    <input type="range" min="-2" max="2" step="0.1" value={draftConfigs.frequencyPenalty ?? DEFAULT_MODEL_CONFIGS.frequencyPenalty} onChange={e => updateConfig('frequencyPenalty', parseFloat(e.target.value))} className="accent-primary" />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Determinism</p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium flex justify-between">Seed</label>
                    <input type="number" min="0" value={draftConfigs.seed ?? ''} onChange={e => updateConfig('seed', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Provider default" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-border flex items-center justify-between bg-card mt-auto">
        {activeTab === 'config' ? (
          <>
            <button onClick={resetConfigs} className="rounded-md px-1 py-2 text-[12px] text-muted-foreground transition-colors hover:text-destructive">Reset to defaults</button>
            <button onClick={save} className="glow-hover rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">Save Config</button>
          </>
        ) : (
          <>
            <button onClick={clear} className="rounded-md px-1 py-2 text-[12px] text-muted-foreground transition-colors hover:text-destructive">Clear key</button>
            <button onClick={save} className="glow-hover rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">Save & Apply</button>
          </>
        )}
      </div>
    </div>
  </div>
}

export default function Page() {
  const [active, setActive] = useState('Playground')
  const [prompt, setPrompt] = useState('Summarize the following text in {{style}} style:\n\n{{content}}')
  const [values, setValues] = useState<Record<string, string>>({ style: '', content: '' })
  
  const providers = getProviders()
  const [providerId, setProviderId] = useState(providers[0].id)
  const [modelId, setModelId] = useState(providers[0].models[0].id)
  const [apiKey, setApiKey] = useState('')
  const [configs, setConfigs] = useState<ModelConfig>({})
  
  const [basicSettingsOpen, setBasicSettingsOpen] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [ran, setRan] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responseOutput, setResponseOutput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [tokens, setTokens] = useState<number | null>(null)

  useEffect(() => {
    const key = getKey()
    if (key) setApiKey(key)
    
    const savedConfigs = getModelConfigs()
    if (savedConfigs) setConfigs(savedConfigs)
  }, [])

  const variables = useMemo(() => Array.from(prompt.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g), match => match[1]).filter((name, index, all) => all.indexOf(name) === index), [prompt])
  const ready = variables.length === 0 || variables.every(name => values[name]?.trim())

  const run = async () => {
    if (!ready) return
    setRan(true)
    setLoading(true)
    setErrorMsg('')
    setResponseOutput('')
    setLatency(null)
    setTokens(null)
    
    let finalPrompt = prompt
    for (const name of variables) {
      finalPrompt = finalPrompt.replace(new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g'), values[name] || '')
    }

    const start = Date.now()
    try {
      const res = await callModel(apiKey, providerId, modelId, [{ role: 'user', content: finalPrompt }], configs)
      if (res.text) {
        setResponseOutput(res.text)
      } else {
        setResponseOutput(JSON.stringify(res, null, 2))
      }
      if (res.usage) {
        setTokens(res.usage.total)
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unknown error occurred")
    } finally {
      setLatency(Date.now() - start)
      setLoading(false)
    }
  }

  const currentProvider = providers.find(p => p.id === providerId)
  const currentModelName = currentProvider?.models.find(m => m.id === modelId)?.name || modelId

  return <div className="flex min-h-screen bg-background text-foreground" onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } }}><Sidebar active={active} onSelect={setActive} /><main className="flex min-w-0 flex-1 flex-col"><header className="flex h-[68px] items-center justify-between border-b border-border px-5 md:px-8"><div className="flex items-center gap-3 pl-10 md:pl-0"><div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex"><PanelLeft className="size-3.5" /></div><div><h1 className="text-[14px] font-semibold tracking-[-0.01em]">Playground</h1><p className="hidden text-[11px] text-muted-foreground sm:block">A calm space to build and test</p></div></div><div className="flex items-center gap-2"><StatusPill icon={Sparkles} label="Model" value={currentModelName} onClick={() => setBasicSettingsOpen(true)} /><StatusPill icon={KeyRound} label="API key" value={apiKey ? 'Connected' : 'Not set'} connected={!!apiKey} onClick={() => setBasicSettingsOpen(true)} /></div></header>
    <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8"><div className="flex items-end justify-between"><div><p className="text-[11px] font-medium text-primary">Playground</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em]">Try an idea</h2><p className="mt-1 text-[13px] text-muted-foreground">Shape a prompt, add your inputs, and see what happens.</p></div><div className="flex items-center gap-4"><button onClick={() => setAdvancedSettingsOpen(true)} className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent sm:flex"><SlidersHorizontal className="size-3.5 text-muted-foreground" /> Tune Model</button><button onClick={run} disabled={!ready || loading} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground glow-hover transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Play className="size-3.5 fill-current" />Run</button></div></div>
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"><div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><label className="text-[12px] font-semibold">Prompt template</label><span className="text-[11px] text-muted-foreground">Template editor</span></div><textarea aria-label="Prompt template" value={prompt} onChange={e => setPrompt(e.target.value)} className="mt-4 min-h-[190px] flex-1 resize-none rounded-lg border border-border bg-background p-3 font-mono text-[12px] leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" spellCheck={false} /><div className="mt-4 flex flex-col gap-3"><p className="text-[11px] font-medium text-muted-foreground">Inputs <span className="font-normal">— detected from your template</span></p>{variables.length === 0 ? <p className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">Type <span className="font-mono text-foreground">{'{{variable_name}}'}</span> in your prompt to add an input.</p> : <div className="flex flex-wrap gap-2">{variables.map(name => <label key={name} className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/[0.08] px-2.5 py-1.5"><span className="font-mono text-[11px] text-primary">{`{{${name}}}`}</span><input aria-label={`${name} value`} value={values[name] ?? ''} onChange={e => setValues({ ...values, [name]: e.target.value })} placeholder="enter value" className="w-24 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground" /></label>)}</div>}</div></div><div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><div><p className="text-[12px] font-semibold">Response</p><p className="mt-1 text-[11px] text-muted-foreground">Your model output will appear here.</p></div><button onClick={() => setShowRaw(!showRaw)} className={`rounded-md p-1.5 transition-colors ${showRaw ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`} aria-label="Toggle raw text" title="Toggle raw text"><FileJson className="size-4" /></button></div>
      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-background/70 p-6 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground"><Activity className="size-4 animate-spin text-primary" /><p className="text-[12px]">Running model...</p></div>
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
          <div className="flex flex-col items-center gap-3 text-muted-foreground"><div className="flex size-10 items-center justify-center rounded-xl bg-accent"><Activity className="size-4 text-primary" /></div><p className="text-[12px]">Nothing yet. Run your prompt to see the result.</p></div>
        )}
      </div><div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground"><span>Tokens used <strong className="ml-1 font-medium text-foreground">{tokens !== null ? tokens : '—'}</strong></span><span>Latency <strong className="ml-1 font-medium text-foreground">{latency !== null ? `${latency}ms` : '—'}</strong></span><span>Model <strong className="ml-1 font-medium text-foreground">{currentModelName}</strong></span></div></div></div></section></main>{basicSettingsOpen && <BasicModelSettings providers={providers} providerId={providerId} modelId={modelId} apiKey={apiKey} setProviderId={setProviderId} setModelId={setModelId} setApiKey={setApiKey} onClose={() => setBasicSettingsOpen(false)} />}{advancedSettingsOpen && <AdvancedModelSettings providers={providers} providerId={providerId} modelId={modelId} apiKey={apiKey} configs={configs} setProviderId={setProviderId} setModelId={setModelId} setApiKey={setApiKey} setConfigs={setConfigs} onClose={() => setAdvancedSettingsOpen(false)} />}</div>
}
