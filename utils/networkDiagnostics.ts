/**
 * Network diagnostics utility for WebRTC connection troubleshooting
 * Helps identify connectivity issues in production builds
 */

export interface NetworkDiagnostics {
  isOnline: boolean;
  canReachSignalingServer: boolean;
  stunServerReachable: boolean;
  connectionType?: string;
  latency?: number;
  error?: string;
}

export class NetworkDiagnosticsService {
  private static instance: NetworkDiagnosticsService;
  
  static getInstance(): NetworkDiagnosticsService {
    if (!NetworkDiagnosticsService.instance) {
      NetworkDiagnosticsService.instance = new NetworkDiagnosticsService();
    }
    return NetworkDiagnosticsService.instance;
  }

  /**
   * Perform comprehensive network diagnostics
   */
  async performDiagnostics(signalingUrl: string): Promise<NetworkDiagnostics> {
    const diagnostics: NetworkDiagnostics = {
      isOnline: navigator.onLine,
      canReachSignalingServer: false,
      stunServerReachable: false,
    };

    try {
      // Test signaling server connectivity
      const signalingTest = await this.testSignalingServer(signalingUrl);
      diagnostics.canReachSignalingServer = signalingTest.reachable;
      diagnostics.latency = signalingTest.latency;

      // Test STUN server connectivity
      diagnostics.stunServerReachable = await this.testStunConnectivity();

      // Get connection type if available
      diagnostics.connectionType = this.getConnectionType();

    } catch (error) {
      diagnostics.error = error instanceof Error ? error.message : String(error);
      console.error('Network diagnostics failed:', error);
    }

    return diagnostics;
  }

  /**
   * Test signaling server connectivity
   */
  private async testSignalingServer(signalingUrl: string): Promise<{ reachable: boolean; latency?: number }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const healthCheckUrl = signalingUrl.replace(/^wss?:\/\//, 'https://') + '/health';
      
      // Use fetch with timeout for health check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch(healthCheckUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })
        .then(response => {
          clearTimeout(timeoutId);
          const latency = Date.now() - startTime;
          resolve({
            reachable: response.ok,
            latency: response.ok ? latency : undefined,
          });
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve({ reachable: false });
        });
    });
  }

  /**
   * Test STUN server connectivity using WebRTC
   */
  private async testStunConnectivity(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        let hasStunCandidate = false;
        const timeout = setTimeout(() => {
          pc.close();
          resolve(hasStunCandidate);
        }, 5000);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            // Check if we got a STUN candidate (srflx type)
            if (candidate.includes('typ srflx')) {
              hasStunCandidate = true;
              clearTimeout(timeout);
              pc.close();
              resolve(true);
            }
          }
        };

        // Create a data channel to trigger ICE gathering
        pc.createDataChannel('test');
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer);
        });

      } catch (error) {
        console.error('STUN connectivity test failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get connection type information
   */
  private getConnectionType(): string | undefined {
    // @ts-ignore - navigator.connection is not in standard types
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }
    
    return undefined;
  }

  /**
   * Generate diagnostic report for debugging
   */
  generateDiagnosticReport(diagnostics: NetworkDiagnostics): string {
    const report = [
      '=== WebRTC Network Diagnostics ===',
      `Online Status: ${diagnostics.isOnline ? '✅ Online' : '❌ Offline'}`,
      `Signaling Server: ${diagnostics.canReachSignalingServer ? '✅ Reachable' : '❌ Unreachable'}`,
      `STUN Connectivity: ${diagnostics.stunServerReachable ? '✅ Working' : '❌ Failed'}`,
    ];

    if (diagnostics.latency) {
      report.push(`Latency: ${diagnostics.latency}ms`);
    }

    if (diagnostics.connectionType) {
      report.push(`Connection Type: ${diagnostics.connectionType}`);
    }

    if (diagnostics.error) {
      report.push(`Error: ${diagnostics.error}`);
    }

    report.push('================================');
    
    return report.join('\n');
  }

  /**
   * Get troubleshooting suggestions based on diagnostics
   */
  getTroubleshootingSuggestions(diagnostics: NetworkDiagnostics): string[] {
    const suggestions: string[] = [];

    if (!diagnostics.isOnline) {
      suggestions.push('Check your internet connection');
    }

    if (!diagnostics.canReachSignalingServer) {
      suggestions.push('Signaling server is unreachable - check firewall settings');
      suggestions.push('Try switching between WiFi and mobile data');
    }

    if (!diagnostics.stunServerReachable) {
      suggestions.push('STUN servers are blocked - check network restrictions');
      suggestions.push('Corporate networks may block WebRTC traffic');
    }

    if (diagnostics.connectionType === '2g' || diagnostics.connectionType === 'slow-2g') {
      suggestions.push('Connection is too slow for video calls - try audio only');
    }

    if (diagnostics.latency && diagnostics.latency > 1000) {
      suggestions.push('High latency detected - calls may have poor quality');
    }

    return suggestions;
  }
}
