const fs = require('fs');
const file = 'd:/BubbleIndexOne/Agent-Playground/Agent-Playground-UX/components/playground/PlaygroundScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const [basicSettingsOpen, setBasicSettingsOpen] = useState(false)\n  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)`,
  `  const [configOpen, setConfigOpen] = useState(false)`
);

content = content.replace(
  `onClick={() => setBasicSettingsOpen(true)}`,
  `onClick={() => setConfigOpen(true)}`
);

content = content.replace(
  `onClick={() => setAdvancedSettingsOpen(true)}`,
  `onClick={() => setConfigOpen(true)}`
);

const oldDrawerHTML = `{basicSettingsOpen && (
        <BasicModelSettings
          providers={providers}
          providerId={providerId}
          modelId={modelId}
          apiKey={apiKey}
          setProviderId={setProviderId}
          setModelId={setModelId}
          setApiKey={setApiKey}
          onClose={() => setBasicSettingsOpen(false)}
          presets={presets}
          onApplyPreset={handleApplyPreset}
        />
      )}

      {advancedSettingsOpen && (
        <AdvancedModelSettings
          providers={providers}
          providerId={providerId}
          modelId={modelId}
          apiKey={apiKey}
          configs={configs}
          setProviderId={setProviderId}
          setModelId={setModelId}
          setApiKey={setApiKey}
          setConfigs={setConfigs}
          onClose={() => setAdvancedSettingsOpen(false)}
          presets={presets}
          onApplyPreset={handleApplyPreset}
        />
      )}`;

const newDrawerHTML = `{configOpen && (
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
      )}`;

content = content.replace(oldDrawerHTML, newDrawerHTML);

fs.writeFileSync(file, content, 'utf8');
