export interface MyAPI {
  setClipboard: (text: string) => Promise<void>;
  getFilesystemEntryById: (id: number) => Promise<any>;
  copyClipboardAbsolutePathToDirectory: (directory, menuOptionCut_id) => Promise<any>;
  newFile: (parentDirectoryAbsolutePath, filename, isDirectory) => Promise<any>;
  deleteFile: (absolutePath, isDirectory) => Promise<any>;
  renameFile: (absolutePath, filename, isDirectory) => Promise<any>;
  getFilesystemEntryById_ARRAY: (arrayKeys) => Promise<any>;
  getFilesystemEntries_argumentIsId: (id) => Promise<any>;
  chooseDirectory: () => Promise<any>;
  chooseWorkspace: () => Promise<any>;
}

declare global {
  interface Window {
    myAPI: MyAPI;
  }
}
