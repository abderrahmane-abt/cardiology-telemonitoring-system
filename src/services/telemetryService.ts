/**
 * Telemetry Service: Real-Time Hardware Bridge for Arduino & ESP32
 * Supports:
 * 1. Web Serial API (Direct USB connection via browser, no local backend required)
 * 2. WebSocket Stream (For ESP32 WiFi or intermediate FastAPI/Node backend)
 * 3. Graceful fallback to simulated telemetry
 */

export interface TelemetryFrame {
  bpm: number;
  resp: number;
  motion: number;
  finger: boolean;
  fallAlert?: boolean;
  ir?: number;
  red?: number;
  temp?: number;
}

export type ConnectionMode = 'SIMULATED' | 'WEB_SERIAL' | 'WEBSOCKET';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

class TelemetryService {
  private mode: ConnectionMode = 'SIMULATED';
  private status: ConnectionStatus = 'DISCONNECTED';
  private serialPort: any = null;
  private reader: any = null;
  private socket: WebSocket | null = null;
  private listeners: Array<(frame: TelemetryFrame) => void> = [];
  private statusListeners: Array<(status: ConnectionStatus, mode: ConnectionMode, details?: string) => void> = [];
  private packetsReceived = 0;
  private lastPacketTime = 0;

  // Check if Web Serial API is supported in the current browser
  public isSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getMode(): ConnectionMode {
    return this.mode;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getPacketsCount(): number {
    return this.packetsReceived;
  }

  public getLastPacketTime(): number {
    return this.lastPacketTime;
  }

  public subscribe(callback: (frame: TelemetryFrame) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public onStatusChange(callback: (status: ConnectionStatus, mode: ConnectionMode, details?: string) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(status: ConnectionStatus, mode: ConnectionMode, details?: string) {
    this.status = status;
    this.mode = mode;
    this.statusListeners.forEach(cb => cb(status, mode, details));
  }

  private notifyFrame(frame: TelemetryFrame) {
    this.packetsReceived++;
    this.lastPacketTime = Date.now();
    this.listeners.forEach(cb => cb(frame));
  }

  /**
   * Connect directly to ESP32 / Arduino via Web Serial API
   */
  public async connectSerial(baudRate: number = 115200): Promise<boolean> {
    if (!this.isSerialSupported()) {
      this.notifyStatus('ERROR', 'SIMULATED', 'Web Serial API non supporté par ce navigateur (Utilisez Chrome ou Edge)');
      return false;
    }

    try {
      this.notifyStatus('CONNECTING', 'WEB_SERIAL', 'Sélection du port série...');
      const serial = (navigator as any).serial;
      this.serialPort = await serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.notifyStatus('CONNECTED', 'WEB_SERIAL', `Connecté en USB à ${baudRate} bauds`);

      // Start background reading stream
      this.readSerialLoop();
      return true;
    } catch (err: any) {
      console.warn('Erreur connexion port série:', err);
      this.notifyStatus('ERROR', 'SIMULATED', err.message || 'Connexion annulée');
      return false;
    }
  }

  /**
   * Continuous loop reading serial chunks line by line
   */
  private async readSerialLoop() {
    if (!this.serialPort || !this.serialPort.readable) return;

    const textDecoder = new TextDecoderStream();
    this.serialPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    this.reader = reader;

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (typeof parsed.bpm === 'number') {
                  this.notifyFrame({
                    bpm: parsed.bpm,
                    resp: parsed.resp ?? 16,
                    motion: parsed.motion ?? 1.0,
                    finger: parsed.finger !== false,
                    fallAlert: parsed.fallAlert ?? parsed.fall ?? false,
                    ir: parsed.ir,
                    red: parsed.red
                  });
                }
              } catch {
                // Ignore malformed JSON line chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Erreur lecture flux série:', err);
      this.notifyStatus('DISCONNECTED', 'SIMULATED', 'Port série déconnecté');
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Connect to an ESP32 or backend WebSocket stream
   */
  public connectWebSocket(url: string = 'ws://192.168.4.1/ws'): void {
    try {
      this.notifyStatus('CONNECTING', 'WEBSOCKET', `Connexion à ${url}...`);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.notifyStatus('CONNECTED', 'WEBSOCKET', `WebSocket actif sur ${url}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (typeof parsed.bpm === 'number') {
            this.notifyFrame(parsed);
          }
        } catch {}
      };

      this.socket.onerror = (err) => {
        console.warn('Erreur WebSocket:', err);
        this.notifyStatus('ERROR', 'SIMULATED', 'Erreur de connexion WebSocket');
      };

      this.socket.onclose = () => {
        this.notifyStatus('DISCONNECTED', 'SIMULATED', 'Liaison WebSocket fermée');
      };
    } catch (err: any) {
      this.notifyStatus('ERROR', 'SIMULATED', err.message);
    }
  }

  /**
   * Disconnect any active hardware or network connection
   */
  public async disconnect(): Promise<void> {
    if (this.reader) {
      try { await this.reader.cancel(); } catch {}
      this.reader = null;
    }
    if (this.serialPort) {
      try { await this.serialPort.close(); } catch {}
      this.serialPort = null;
    }
    if (this.socket) {
      try { this.socket.close(); } catch {}
      this.socket = null;
    }
    this.notifyStatus('DISCONNECTED', 'SIMULATED', 'Simulation locale active');
  }
}

export const telemetryService = new TelemetryService();
