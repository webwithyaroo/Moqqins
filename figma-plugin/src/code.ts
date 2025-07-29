/// <reference types="@figma/plugin-typings" />

console.log("DesignHub Plugin Started!");

// Show the plugin UI with inline HTML
figma.showUI(
  `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>DesignHub MVP</title>
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        margin: 0;
        padding: 16px;
        background: #f8f9fa;
      }
      
      .header {
        background: #2d3748;
        color: white;
        padding: 12px;
        margin: -16px -16px 16px -16px;
        border-radius: 8px 8px 0 0;
      }
      
      .button {
        background: #4299e1;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        margin: 8px 0;
        font-size: 14px;
      }
      
      .button:hover {
        background: #3182ce;
      }
      
      .info-box {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0;
        font-size: 12px;
      }
      
      .status {
        font-size: 12px;
        color: #718096;
        margin-top: 8px;
      }
      
      .success {
        color: #38a169;
        font-weight: bold;
      }
      
      .error {
        color: #e53e3e;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h3 style="margin: 0;">DesignHub MVP</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Day 1 - Foundation Ready</p>
    </div>
    
    <div class="info-box">
      <strong>Plugin Status:</strong>
      <div id="plugin-info">Testing connection...</div>
    </div>
    
    <button class="button" onclick="testConnection()">Test Plugin Connection</button>
    <button class="button" onclick="getDocumentInfo()">Get Document Info</button>
    
    <div id="status" class="status">Ready to test your first DesignHub plugin!</div>

    <script>
      // Test basic connection
      function testConnection() {
        updateStatus("Testing connection...");
        parent.postMessage({ pluginMessage: { type: 'test-connection' } }, '*');
      }
      
      // Get document information
      function getDocumentInfo() {
        updateStatus("Getting document info...");
        parent.postMessage({ pluginMessage: { type: 'get-document-info' } }, '*');
      }
      
      // Update status helper
      function updateStatus(message, type = 'normal') {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = 'status ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : '');
      }
      
      // Listen for messages from plugin code
      window.onmessage = (event) => {
        const msg = event.data.pluginMessage;
        
        if (msg.type === 'connection-success') {
          document.getElementById('plugin-info').innerHTML = '✅ Plugin connected successfully!';
          updateStatus('Connection successful! Ready to build your MVP.', 'success');
        }
        
        if (msg.type === 'document-info') {
          const info = msg.data;
          document.getElementById('plugin-info').innerHTML = \`
            <div><strong>Document:</strong> \${info.name}</div>
            <div><strong>Pages:</strong> \${info.pageCount}</div>
            <div><strong>Total Elements:</strong> \${info.nodeCount}</div>
          \`;
          updateStatus('Document info loaded!', 'success');
        }
        
        if (msg.type === 'error') {
          updateStatus(msg.data.message, 'error');
        }
      };
      
      // Test connection on load
      setTimeout(() => {
        testConnection();
      }, 500);
    </script>
  </body>
  </html>
`,
  { width: 320, height: 480 }
);

// Listen for messages from UI
figma.ui.onmessage = (msg: any) => {
  console.log("Received message:", msg);

  try {
    if (msg.type === "test-connection") {
      // Test basic connection
      figma.ui.postMessage({
        type: "connection-success",
        data: { timestamp: new Date().toISOString() },
      });
    }

    if (msg.type === "get-document-info") {
      // Get document information
      const documentInfo = {
        name: figma.root.name,
        id: figma.root.id,
        pageCount: figma.root.children.length,
        nodeCount: countAllNodes(figma.root),
      };

      figma.ui.postMessage({
        type: "document-info",
        data: documentInfo,
      });
    }
  } catch (error) {
    console.error("Plugin error:", error);
    figma.ui.postMessage({
      type: "error",
      data: { message: "Something went wrong: " + (error as Error).message },
    });
  }
};

// Helper function to count all nodes in document
function countAllNodes(node: BaseNode): number {
  let count = 1;
  if ("children" in node) {
    for (const child of node.children) {
      count += countAllNodes(child);
    }
  }
  return count;
}

// Plugin initialization
console.log("DesignHub plugin loaded successfully!");
