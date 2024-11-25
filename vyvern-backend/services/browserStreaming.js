const WebSocket = require('ws');
const CDP = require('chrome-remote-interface');

class BrowserStreamingService {
  constructor() {
    this.wss = null;
    this.activeStreams = new Map();
  }

  initialize() {
    this.wss = new WebSocket.Server({ port: 8080 });
    console.log('Stream server initialized on port 8080');

    this.wss.on('connection', (ws, req) => {
      const testId = new URL(req.url, 'http://localhost').searchParams.get('testId');
      if (!testId) {
        ws.close();
        return;
      }
      ws.testId = testId;
    });
  }

  async startStreaming(testId, page, browserWSEndpoint) {
    try {
      if (!browserWSEndpoint) {
        throw new Error('Browser WebSocket endpoint is required');
      }

      // Get the target from the page
      const target = await CDP.New({ target: browserWSEndpoint });
      
      // Connect to the target
      const client = await CDP({ target });
      this.activeStreams.set(testId, client);

      // Enable necessary domains
      const { Network, Page, Runtime, DOM } = client;
      
      await Promise.all([
        Network.enable(),
        DOM.enable(),
        Runtime.enable()
      ]);

      // Start screencasting after enabling domains
      await Page.enable();
      await Page.startScreencast({
        format: 'jpeg',
        quality: 80,
        maxWidth: 1280,
        maxHeight: 720,
        everyNthFrame: 1
      });

      // Handle screenshot data
      Page.screencastFrame(({ data, sessionId }) => {
        Page.screencastFrameAck({ sessionId });
        
        if (this.wss) {
          this.wss.clients.forEach((ws) => {
            if (ws.testId === testId && ws.readyState === WebSocket.OPEN) {
              ws.send(data);
            }
          });
        }
      });

    } catch (error) {
      console.error('Failed to start streaming:', error);
      throw error;
    }
  }

  async stopStreaming(testId) {
    try {
      const client = this.activeStreams.get(testId);
      if (client) {
        try {
          const { Page } = client;
          // Only try to stop screencast if the connection is still alive
          if (client.ws && client.ws.readyState === WebSocket.OPEN) {
            await Page.stopScreencast();
          }
        } catch (screencastError) {
          console.log('Screencast already stopped or connection closed');
        }

        try {
          await CDP.Close({ id: client.target });
        } catch (closeError) {
          console.log('Target already closed');
        }

        try {
          await client.close();
        } catch (clientError) {
          console.log('Client already closed');
        }

        this.activeStreams.delete(testId);
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }
}

const browserStreamingService = new BrowserStreamingService();
module.exports = browserStreamingService; 