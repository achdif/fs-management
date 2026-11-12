// Web stub — pakai navigator.onLine untuk status konektivitas.

export default {
  async getCurrentStatus(): Promise<{isConnected: boolean; type: string}> {
    const nav = (globalThis as {navigator?: {onLine?: boolean}}).navigator;
    const isConnected = nav?.onLine ?? true;
    return {isConnected, type: isConnected ? 'web' : 'none'};
  },
  startListening(): void {
    // no-op di web — bisa ditambah listener 'online'/'offline' bila perlu
  },
  stopListening(): void {
    // no-op
  },
};
