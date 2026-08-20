export interface MyAPI {
  setClipboard: (text: string) => Promise<void>;
}

declare global {
  interface Window {
    myAPI: MyAPI;
  }
}