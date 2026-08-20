import { myAPI_chooseDirectory_result, myAPI_chooseWorkspace_result, myAPI_getFilesystemEntries_entry } from './applicationRendererRoot';

export interface MyAPI {
  setClipboard: (text: string) => Promise<void>;
  getFilesystemEntryById: (id: number) => Promise<any>;
  copyClipboardAbsolutePathToDirectory: (directory, menuOptionCut_id) => Promise<any>;
  newFile: (parentDirectoryAbsolutePath, filename, isDirectory) => Promise<any>;
  deleteFile: (absolutePath, isDirectory) => Promise<any>;
  renameFile: (absolutePath, filename, isDirectory) => Promise<any>;
  getFilesystemEntryById_ARRAY: (arrayKeys) => Promise<myAPI_getFilesystemEntryById_ARRAY_entry[]>;
  getFilesystemEntries_argumentIsId: (id) => Promise<myAPI_getFilesystemEntries_entry[]>;
  chooseDirectory: () => Promise<myAPI_chooseDirectory_result>;
  chooseWorkspace: () => Promise<myAPI_chooseWorkspace_result>;
  onMessage: (callback) => Promise<any>;
  editorCompletionRequest_slice: (indexStart: number, indexEnd: number) => Promise<any>;
  editorReadAllText: (absoluteFilePath: string) => Promise<any>;
}

declare global {
  interface Window {
    myAPI: MyAPI;
  }
}
