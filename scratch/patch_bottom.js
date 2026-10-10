const fs = require('fs');
const file = 'd:/BubbleIndexOne/Agent-Playground/Agent-Playground-UX/components/playground/PlaygroundScreen.tsx';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('{basicSettingsOpen && ('));
const endIdx = lines.findIndex(l => l.includes('    </main>'));

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `      {configOpen && (
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
  lines.splice(startIdx, endIdx - startIdx, replacement);
  fs.writeFileSync(file, lines.join('\n'));
} else {
  console.log('Not found', startIdx, endIdx);
}
