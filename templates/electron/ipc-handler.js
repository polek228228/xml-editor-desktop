// Template: IPC Handler
// Usage: Copy and replace {{placeholders}}

// ============ Main Process ============
// File: src/main/main.js

ipcMain.handle('{{channel}}', async (event, {{params}}) => {
  try {
    console.log('IPC {{channel}}:', {{params}});
    
    // Your logic here
    const result = await this.{{manager}}.{{method}}({{params}});
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('IPC {{channel}} error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// ============ Preload Script ============
// File: src/preload/preload.js

contextBridge.exposeInMainWorld('api', {
  {{methodName}}: ({{params}}) => ipcRenderer.invoke('{{channel}}', {{params}})
});

// ============ Renderer Usage ============
// File: src/renderer/js/app.js

async function example() {
  const result = await window.api.{{methodName}}({{params}});
  
  if (result.success) {
    console.log('Success:', result.data);
  } else {
    console.error('Error:', result.error);
  }
}
