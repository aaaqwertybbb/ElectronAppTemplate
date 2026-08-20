import { myAPI_chooseDirectory_result, myAPI_chooseWorkspace_result } from './applicationRendererRoot';

export interface MyAPI {
  setClipboard: (text: string) => Promise<void>;
  getFilesystemEntryById: (id: number) => Promise<any>;
  copyClipboardAbsolutePathToDirectory: (directory, menuOptionCut_id) => Promise<any>;
  newFile: (parentDirectoryAbsolutePath, filename, isDirectory) => Promise<any>;
  deleteFile: (absolutePath, isDirectory) => Promise<any>;
  renameFile: (absolutePath, filename, isDirectory) => Promise<any>;
  getFilesystemEntryById_ARRAY: (arrayKeys) => Promise<any>;
  getFilesystemEntries_argumentIsId: (id) => Promise<any>;
  chooseDirectory: () => Promise<myAPI_chooseDirectory_result>;
  chooseWorkspace: () => Promise<myAPI_chooseWorkspace_result>;
  onMessage: (callback) => Promise<any>;
  editorCompletionRequest_slice: (indexStart: number, indexEnd: number) => Promise<any>;
}

declare global {
  interface Window {
    myAPI: MyAPI;
  }
}
