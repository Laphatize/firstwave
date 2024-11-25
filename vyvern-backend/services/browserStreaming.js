const WebSocket = require('ws');
const CDP = require('chrome-remote-interface');

class BrowserStreamingService {
  constructor() {
    this.wss = null;
    this.activeStreams = new Map(); // testId -> CDP client
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

      // connec to Chrome using the WebSocket endpoint
      const client = await CDP({
        target: browserWSEndpoint
      });
      
      this.activeStreams.set(testId, client);

      // enable required domains
      const {Page, Runtime} = client;
      
      // enable domains in parallel
      await Promise.all([
        Page.enable(),
        Runtime.enable()
      ]);
      
      // lets stream now...
      await Page.startScreencast({
        format: 'jpeg',
        quality: 80,
        maxWidth: 1280,
        maxHeight: 720,
        everyNthFrame: 1
      });

      // handle screenshot data
      Page.screencastFrame(({ data, sessionId }) => {
        // okay, the frame is here
        Page.screencastFrameAck({ sessionId });

        // sail away
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
        await client.Page.stopScreencast();
        await client.close();
        this.activeStreams.delete(testId);
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }
}

//  c+e singleton instance
const browserStreamingService = new BrowserStreamingService();
module.exports = browserStreamingService; 