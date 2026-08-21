// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// preload with contextIsolation enabled

import { contextBridge, ipcRenderer } from 'electron'
import { myAPI_languageServer_response } from './RendererFiles/applicationRendererRoot';

// Exposes in the renderer API to interact with the main process.
// You turn on context isolation to avoid accidentally leaking any priviledged information / api
// from the preload.
//
// the contextBridge and exposeInMainWorld is a means of creating
// a readonly API on the 'window' object for the renderer.
contextBridge.exposeInMainWorld('myAPI', {
  onMessage: (callback: ((arg: myAPI_languageServer_response) => Promise<void>)) => ipcRenderer.on('from-main', (_event, value: myAPI_languageServer_response) => callback(value)),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),
  chooseWorkspace: () => ipcRenderer.invoke('choose-workspace'),
  didChangeTextDocumentNotification: (absolutePath: string, version: number, startLine: number, startCharacter: number, endLine: number, endCharacter: number, text: string | null) => ipcRenderer.invoke('did-change-text-document-notification', absolutePath, version, startLine, startCharacter, endLine, endCharacter, text),
  /**
   * The provided absolute file path is validated by the main process.
   * If the absolute file path is NOT recognized by the main process, then an empty enumeration is returned.
   * @returns 
   */
  getFilesystemEntries: (absoluteFilePath: string) => ipcRenderer.invoke('get-filesystem-entries', absoluteFilePath, /*argumentIsId*/ false),
  getFilesystemEntries_argumentIsId: (id: number) => ipcRenderer.invoke('get-filesystem-entries', id, /*argumentIsId*/ true),
  getFilesystemEntryById: (id: number) => ipcRenderer.invoke('get-filesystem-entry-by-id', id),
  getFilesystemEntryById_ARRAY: (arrayKeys: Uint32Array) => ipcRenderer.invoke('get-filesystem-entry-by-id-array', arrayKeys),
  /**
   * See also 'editorReadAllText'
   */
  readAllText: (absoluteFilePath: string) => ipcRenderer.invoke('read-all-text', absoluteFilePath),
  /**
   * This carries LSP "intent" of opening the file in the editor and will result in
   * in a method: 'textDocument/didOpen' notification being sent to the LSP.
   * 
   * TODO: Decide on the naming between 'readAllText', and 'editorReadAllText', and whether they both need to exist.
   * 
   * You can't store tabs as '\t\0\0\0' because the LSP interactions will be horrible to deal with?
  */
  editorReadAllText: (absoluteFilePath: string) => ipcRenderer.invoke('editor-read-all-text', absoluteFilePath),
  editorDocumentSymbolsRequest: () => ipcRenderer.invoke('editor-document-symbols-request'),
  editorGoToDefinitionRequest: (indexLine: number, indexColumn: number) => ipcRenderer.invoke('editor-go-to-definition-request', indexLine, indexColumn),
  editorHoverRequest: (indexLine: number, indexColumn: number) => ipcRenderer.invoke('editor-hover-request', indexLine, indexColumn),
  editorCompletionRequest: (indexLine: number, indexColumn: number) => ipcRenderer.invoke('editor-completion-request', indexLine, indexColumn),
  // I don't think 'slice' is in LSP specification but I need to start like this cause it is only way I'll get something "initially working".
  editorCompletionRequest_slice: (indexStart: number, indexEnd: number) => ipcRenderer.invoke('editor-completion-request-slice', indexStart, indexEnd),
  // I've seen people saying you can access the clipboard the same way as the main process from renderer process
  // but I'm not touching that at the moment.
  setClipboard: (text: string) => ipcRenderer.invoke('set-clipboard', text),
  editorSetClipboard: (uint8Array: Uint8Array, offset: number, length: number, EDITOR_lineEndString: string) => ipcRenderer.invoke('editor-set-clipboard', uint8Array, offset, length, EDITOR_lineEndString),
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  //findAll: (search, matchWord) => ipcRenderer.invoke('find-all', search, matchWord),
  //findAllGetPositions: (absolutePath: string, search, matchWord) => ipcRenderer.invoke('find-all-getPositions', absolutePath, search, matchWord),
  newFile: (parentDirectoryAbsolutePath: string, filename: string, isDirectory: boolean) => ipcRenderer.invoke('new-file', parentDirectoryAbsolutePath, filename, isDirectory),
  deleteFile: (absolutePath: string, isDirectory: boolean) => ipcRenderer.invoke('delete-file', absolutePath, isDirectory),
  renameFile: (absolutePath: string, filename: string, isDirectory: boolean) => ipcRenderer.invoke('rename-file', absolutePath, filename, isDirectory),
  saveFile: (unvalidatedAbsolutePath: string, text: string) => ipcRenderer.invoke('save-file', unvalidatedAbsolutePath, text),
  editorSaveFile: (unvalidatedAbsolutePath: string, uint8Array: Uint8Array, count: number, EDITOR_lineEndString: string, EDITOR_fileStartsWithBom: boolean) => ipcRenderer.invoke('editor-save-file', unvalidatedAbsolutePath, uint8Array, count, EDITOR_lineEndString, EDITOR_fileStartsWithBom),
  copyClipboardAbsolutePathToDirectory: (directory: string, menuOptionCut_id: number) => ipcRenderer.invoke('copy-clipboard-absolute-path-to-directory', directory, menuOptionCut_id),
})