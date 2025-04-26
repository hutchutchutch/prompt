import { create } from 'zustand';

type ProgressData = {
  modelId: string;
  variantId: string;
  progress: number;
  message?: string;
  firstTokenLatency?: number;
  totalTime?: number;
  output?: string;
  qualityScore?: number;
  costUsd?: number;
  vulnerabilityStatus?: string;
};

type WebSocketState = {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  testId: number | null;
  progressData: Record<string, ProgressData>; // key is `${modelId}:${variantId}`
  testCompleted: boolean;
  error: string | null;
  connect: (testId: number) => void;
  disconnect: () => void;
  reset: () => void;
};

export const useWebSocket = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  testId: null,
  progressData: {},
  testCompleted: false,
  error: null,
  
  connect: (testId: number) => {
    // Close existing connection if any
    if (get().socket) {
      get().disconnect();
    }
    
    set({ isConnecting: true, testId, error: null });
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        set({ isConnected: true, isConnecting: false, socket });
        
        // Subscribe to test updates
        socket.send(JSON.stringify({
          type: 'subscribe',
          testId,
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              // Initial connection confirmed
              break;
              
            case 'progress_update':
            case 'result_ready':
              // Update progress data for this model/variant
              set((state) => {
                const key = `${data.modelId}:${data.variantId}`;
                return {
                  progressData: {
                    ...state.progressData,
                    [key]: {
                      modelId: data.modelId,
                      variantId: data.variantId,
                      progress: data.progress,
                      message: data.message,
                      firstTokenLatency: data.firstTokenLatency,
                      totalTime: data.totalTime,
                      output: data.output,
                      qualityScore: data.qualityScore,
                      costUsd: data.costUsd,
                      vulnerabilityStatus: data.vulnerabilityStatus,
                    }
                  }
                };
              });
              break;
              
            case 'test_completed':
              set({ testCompleted: true });
              break;
              
            default:
              console.warn('Unknown WebSocket message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ error: 'Failed to connect to the server', isConnecting: false });
      };
      
      socket.onclose = () => {
        set({ isConnected: false, socket: null });
      };
      
      // Save the socket reference
      set({ socket });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to connect to WebSocket server',
        isConnecting: false 
      });
    }
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      set({ socket: null, isConnected: false });
    }
  },
  
  reset: () => {
    const { socket } = get();
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }
    set({
      socket: null,
      isConnected: false,
      isConnecting: false,
      testId: null,
      progressData: {},
      testCompleted: false,
      error: null,
    });
  },
}));
