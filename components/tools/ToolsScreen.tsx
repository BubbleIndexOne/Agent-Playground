import { useState } from 'react'
import { PanelLeft, Sparkles, Activity } from 'lucide-react'
import { Tool, CreationStep } from './types'
import { ToolsHeader } from './ToolsHeader'
import { ToolCard } from './ToolCard'
import { ChooseToolType } from './creation/ChooseToolType'
import { ClientToolEditor } from './creation/ClientToolEditor'
import { ConnectServiceForm } from './creation/ConnectServiceForm'

const INITIAL_TOOLS: Tool[] = [
  {
    id: '1',
    name: 'Fetch Weather',
    description: 'Retrieves current weather data for a given location using an external API.',
    type: 'client',
    published: true,
  },
  {
    id: '2',
    name: 'Read User Database',
    description: 'Provides read-only access to the users table in production.',
    type: 'mcp',
    published: false,
  }
]

export function ToolsScreen() {
  const [activeTab, setActiveTab] = useState<'my-tools' | 'marketplace'>('my-tools')
  const [creationStep, setCreationStep] = useState<CreationStep>('none')
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS)

  const handleTogglePublish = (id: string, published: boolean) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, published } : t))
  }

  const handleSaveMock = () => {
    setCreationStep('none')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <div className="hidden size-7 items-center justify-center rounded-md bg-accent text-muted-foreground sm:flex">
            <PanelLeft className="size-3.5" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em]">Tools</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Build and connect capabilities</p>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-5 p-5 md:p-8">
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          
          {creationStep === 'none' && (
            <>
              <ToolsHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNewTool={() => setCreationStep('choose')}
              />
              
              {activeTab === 'my-tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                  {tools.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-background/50">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-accent mb-4">
                        <Activity className="size-4 text-primary" />
                      </div>
                      <p className="text-[13px] font-medium text-foreground">No tools yet</p>
                      <p className="mt-1 text-[12px] text-muted-foreground max-w-[250px]">Create your first client tool or connect an external service.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent mb-5">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-foreground">Marketplace</h3>
                  <p className="mt-2 text-[13px] text-muted-foreground max-w-sm">Discover and install tools created by the community. Coming soon.</p>
                </div>
              )}
            </>
          )}

          {creationStep === 'choose' && (
            <ChooseToolType onSelect={(type) => setCreationStep(type)} />
          )}

          {creationStep === 'client' && (
            <ClientToolEditor
              onCancel={() => setCreationStep('none')}
              onSave={handleSaveMock}
            />
          )}

          {creationStep === 'service' && (
            <ConnectServiceForm
              onCancel={() => setCreationStep('none')}
              onSave={handleSaveMock}
            />
          )}

        </div>
      </section>
    </div>
  )
}
