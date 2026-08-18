
// I don't want to touch the originally scaffolded "if (require('electron-squirrel-startup'))" at the moment.
// thus this file is staying common js.

const { app, BrowserWindow, dialog, ipcMain, clipboard } = require('electron');
const path = require('node:path');
const fs = require('fs');
const AppDatabase = require('./Database/database').default;
const { spawn } = require('node:child_process');
const { URI } = require('vscode-uri');
const os = require('os');

if (!app.isPackaged) {
	app.setPath('userData', path.join(app.getPath('appData'), 'my-app-Debug'));
}

let database;

/** openedDirectory | openedWorkspace; TODO: consider making single object with bool 'isWorkspace' */
let openedDirectory = null;
/** openedDirectory | openedWorkspace; TODO: consider making single object with bool 'isWorkspace'  */
let openedWorkspace = null;
let workspaceDirectories = null;

/** Relates to LSP, simple and naive implementation for "open text document" this tracks most recent */
let openedDocumentUri = null;
/**
 * @type {ChildProcessWithoutNullStreams}
 */
let languageServer;
let languageServerHandshakeSuccess = false;

/** You probably ought to do something more optimal than holding each chunk in memory until you get the entirety. */
let stdoutChunkObjects = [];
/** The first entry is partially unread so you at minimum will need to store the index that starts the unread content or some such index */
let stdoutChunkFirstEntryMetadata = { substringIndexStart: 0, contentLengthNumber: 0 };

let remainingStdoutFromPartiallyReadEvent = null;

// I probably need something like this eventually:
//let pendingRequests = [];

let mostRecentRequest = null;

/**
 * TODO: Is it problematic to bring mainWindow into this scope? It is created within `const createWindow`...
 * ...and until now has only been accessible from that arrow function.
 * ...
 * The change is desirable because upon a stdout event from an lsp,
 * the BrowserWindow needs to be accessible in order to send a message
 * from the main-process to the renderer-process in this scenario.
 * ...
 * I specifically put the assignment that brings a reference to mainWindow into this scope
 * as the final line within `const createWindow`.
 * ...
 * It is expected that if an issue were possible, that electron's "initialization code"
 * can run in its entirety prior to this reference being exposed in the global scope.
 * 
 * @type {BrowserWindow}
 */
let mainWindowCapture = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

/**
 * @param {*} absolutePath 
 * @returns {boolean} to indicate whether the invoker is permitted to continue execution with the given absolutePath
 */
function isValidAbsolutePath(absolutePath) {
    // The provided absolute file path is validated.
    // If the absolute file path is NOT recognized, then an empty enumeration is returned.
    if (absolutePath !== openedDirectory & !database.contains(absolutePath)) return false;

	return true;
}

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true, // this might already be the default value
			preload: path.join(__dirname, 'preload.js'),
		},
		autoHideMenuBar: true,
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, 'index.html'));

	mainWindow.isMenuBarVisible(false);

	// Handle the request from the renderer process
	ipcMain.handle('choose-directory', chooseDirectory);
	ipcMain.handle('choose-workspace', chooseWorkspace);
	ipcMain.handle('get-filesystem-entries', getFilesystemEntries);
	ipcMain.handle('get-filesystem-entry-by-id', getFilesystemEntryById);
	ipcMain.handle('get-filesystem-entry-by-id-array', getFilesystemEntryById_ARRAY);
	ipcMain.handle('editor-read-all-text', editorReadAllText);
	ipcMain.handle('set-clipboard', setClipboard);
	ipcMain.handle('editor-set-clipboard', editorSetClipboard);
	ipcMain.handle('read-clipboard', readClipboard);
	ipcMain.handle('new-file', newFile);
	ipcMain.handle('delete-file', deleteFile);
	ipcMain.handle('rename-file', renameFile);
	ipcMain.handle('save-file', saveFile);
	ipcMain.handle('editor-save-file', editorSaveFile);
	ipcMain.handle('copy-clipboard-absolute-path-to-directory', copyClipboardAbsolutePathToDirectory);

	mainWindowCapture = mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	database = new AppDatabase();
	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (languageServer) {
		languageServer.kill();
	}
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

/**
 * TODO: Store the path more optimally to avoid doing this each time?
 * TODO: capital 'c' or lowercase, encoded ':' and etc... or not?
 */
function formatAbsolutePath(absolutePath) {
	return 'file:///' + absolutePath.replaceAll('\\', '/');
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function MAIN_encodeMessageObject(messageObject) {
	let content = JSON.stringify(messageObject);
	let spacing = '\r\n\r\n';
	return `Content-Length: ${content.length}${spacing}${content}\n`;
}

/**
 * Extracts more data per entry { basename, absolutePath, isDirectory, id }
 * and applies a common sorting prior to returning results.
 * */
function wrap_readdirSync_getChildList(parentAbsolutePath) {
	let childList = fs.readdirSync(parentAbsolutePath, { withFileTypes: true });
	for (var i = 0; i < childList.length; i++) {
		let filename = childList[i].name;
		let isDirectory = childList[i].isDirectory();
		let childAbsolutePath = path.join(parentAbsolutePath, filename);
		let id = database.addAbsolutePath(childAbsolutePath, filename);
		childList[i] = {
			basename: filename,
			absolutePath: childAbsolutePath,
			isDirectory: isDirectory,
			id: id
		};
	}

	childList.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) {
			return -1;
		}

		if (!a.isDirectory && b.isDirectory) {
			return 1;
		}

		return a.basename.localeCompare(b.basename);
	});

	return childList;
}

/**
 * Applies a common sorting prior to finding the indexOf
 * 
 * (does NOT internally extract any extra data than what is used for determining the indexOf)
 * 
 * TODO: This could still be faster. You shouldn't need to have an initial loop over the array to rewrite each index as { basename, isDirectory } to do this.
 * TODO: As well I believe checking the filename alone (not checking the childIsDirectory) is sufficient.
 */
function wrap_readdirSync_indexOf(parentAbsolutePath, childFilename, childIsDirectory) {
	let childList = fs.readdirSync(parentAbsolutePath, { withFileTypes: true });
	for (var i = 0; i < childList.length; i++) {
		let filename = childList[i].name;
		let isDirectory = childList[i].isDirectory();
		childList[i] = {
			basename: filename,
			isDirectory: isDirectory,
		};
	}

	childList.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) {
			return -1;
		}

		if (!a.isDirectory && b.isDirectory) {
			return 1;
		}

		return a.basename.localeCompare(b.basename);
	});

	for (let i = 0; i < childList.length; i++) {
		if (childList[i].basename === childFilename && childList[i].isDirectory === childIsDirectory) {
			return i;
		}
	}

	return -1;
}

/**
 * started off with code snippet from Google AI Overview for "node fs determine if file has bom":
 */
function hasBOM(filePath) {
	// Use a small buffer to read just the first 3-4 bytes
	const buffer = Buffer.alloc(4);
	const fd = fs.openSync(filePath, 'r');
	fs.readSync(fd, buffer, 0, 4, 0);

	let stat = fs.statSync(filePath);

	// Check for common BOM signatures
	// UTF-8: EF BB BF
	if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
		const bufferaaa = Buffer.alloc(stat.size - 4);
		fs.readSync(fd, bufferaaa, 0, bufferaaa.length, 3);
		fs.closeSync(fd);
		return {
			text: bufferaaa.toString(),
			fileStartsWithBom: true
		};
	}
	else {
		const bufferaaa = Buffer.alloc(stat.size);
		fs.readSync(fd, bufferaaa, 0, bufferaaa.length, 0);
		fs.closeSync(fd);
		return {
			text: bufferaaa.toString(),
			fileStartsWithBom: false
		};
	}

	/*
	// UTF-16 Little Endian: FF FE
	if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
		return 'UTF-16LE';
	}
	// UTF-16 Big Endian: FE FF
	if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
		return 'UTF-16BE';
	}
	*/
}

async function chooseDirectory (event) {
	const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
	if (result.canceled) {
		return { basename: '', openedDirectory: '', canceled: result.canceled };
	}

	openedDirectory = result.filePaths[0];
	openedWorkspace = null;
	workspaceDirectories = null;

	let filename = path.basename(openedDirectory);
	let id = database.addAbsolutePath(openedDirectory, filename);

	return { basename: filename, openedDirectory: openedDirectory, id: id, canceled: result.canceled };
}

async function chooseWorkspace(event) {
	const result = await dialog.showOpenDialog({ properties: ['openFile'] });
	if (result.canceled) {
		return {
			workspaceFileAbsolutePath: null,
			workspaceFileNameWithoutExtension: null,
			directories: [],
			canceled: result.canceled };
	}

	openedDirectory = null;
	openedWorkspace = result.filePaths[0];
	workspaceDirectories = null;

	let filename = path.basename(openedWorkspace);
	let id = database.addAbsolutePath(openedWorkspace, filename);

	let fileContent = fs.readFileSync(openedWorkspace, 'utf8');
	let jsonObject = JSON.parse(fileContent);

	if (!jsonObject.folders) {
		throw new Error('if (!jsonObject.folders)');
	}

	let parentDirectoryAbsolutePath = path.dirname(openedWorkspace);

	let directories = [];
	  
	for (let i = 0; i < jsonObject.folders.length; i++) {
		let folderEntry = jsonObject.folders[i];
		let absolutePath = path.join(parentDirectoryAbsolutePath, folderEntry.path);
		let filename = path.basename(absolutePath);
		let id = database.addAbsolutePath(absolutePath, filename);
		directories.push({
			basename: filename,
			absolutePath: absolutePath,
			id: id,
		});
	}

	workspaceDirectories = directories;

	return {
		workspaceFileAbsolutePath: openedWorkspace,
		workspaceFileNameWithoutExtension: path.parse(openedWorkspace).name,
		directories: directories,
		canceled: result.canceled
	};
}

async function getFilesystemEntries(event, argument, argumentIsId) {

	let parentAbsolutePath;

	if (argumentIsId) {
		let entry = database.getBy_id(argument);
		if (!entry) return;

		parentAbsolutePath = entry.value;
	}
	else {
		parentAbsolutePath = argument;
		if (!isValidAbsolutePath(parentAbsolutePath)) return;
	}

	try {
		return wrap_readdirSync_getChildList(parentAbsolutePath);
	}
	catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
}

async function getFilesystemEntryById(event, id) {
	try {
		let entry = database.getBy_id(id);
		if (!entry) {
			return null;
		}
		else {
			return {
				basename: entry.displayName,
				absolutePath: entry.value,
				isDirectory: fs.statSync(entry.value)?.isDirectory() ?? false
			};
		}
	}
	catch (err) {
		console.error("Error during get-filesystem-entry-by-id:", err);
		return [];
	}
}

async function getFilesystemEntryById_ARRAY(event, arrayKeys) {
	try {
		const KEY_BITS = 12;
        const KEY_MASK = (1 << KEY_BITS) - 1; // Binary: 00000000000000000000111111111111 (0xFFF)

		let arrayEntries = new Array(arrayKeys.length);
		for (let i = 0; i < arrayKeys.length; i++) {
			let packedInteger = arrayKeys[i];
			const key = packedInteger & KEY_MASK;
			let entry = database.getBy_id(key);
			if (!entry) {
				//arrayEntries[i] = null;
				arrayEntries[i] =  {
					basename: 'basenameUndefined',
					absolutePath: 'absolutePathUndefined',
					// TODO: return 'null' not 'true'. And then the UI should interpret this as "whatever you currently have just keep it that way cause nobody knows what the file even is anymore"...
					// ...because presumably a render happened between the time that the FS deleted the file, but before the UI removed it from the node list... this is only speculation but it probably is what is happening.
					// thus the next render should correctly remove the node from the UI anyways.					
					isDirectory: true//fs.statSync(entry.value)?.isDirectory() ?? false
				};
			}
			else {

				let fsStatSyncResult;
				
				try {
					fsStatSyncResult = fs.statSync(entry.value);
				}
				catch (err) {
					fsStatSyncResult = null;
				}

				// Oddly if the node is expanded this works entirely but if collapsed the node visually never gets removed.

				arrayEntries[i] =  {
					basename: entry.displayName,
					absolutePath: entry.value,
					// TODO: return 'null' not 'true'. And then the UI should interpret this as "whatever you currently have just keep it that way cause nobody knows what the file even is anymore"...
					// ...because presumably a render happened between the time that the FS deleted the file, but before the UI removed it from the node list... this is only speculation but it probably is what is happening.
					// thus the next render should correctly remove the node from the UI anyways.
					isDirectory: fsStatSyncResult?.isDirectory() ?? true
				};
			}
		}
		return arrayEntries;
	}
	catch (err) {
		console.error("Error during get-filesystem-entry-by-id:", err);
		return [];
	}
}

async function editorReadAllText(event, absolutePath) {
	if(!isValidAbsolutePath(absolutePath)) return;

	try {
		let basename = path.basename(absolutePath);
		let extension = path.extname(absolutePath);

		let itHasBom = hasBOM(absolutePath);

		absolutePath = formatAbsolutePath(absolutePath);
		itHasBom.formattedAbsolutePath = absolutePath;
		itHasBom.extension = extension;

		let pathId = database.addAbsolutePath(itHasBom.formattedAbsolutePath, basename);

		return itHasBom;
	}
	catch (err) {
		return null;
	}
}

async function setClipboard(event, text) {
	try {
		clipboard.writeText(text);
	}
	catch (err) {
		console.error("Error setting clipboard:", err);
		return [];
	}
}

async function editorSetClipboard(event, uint8Array, offset, length, EDITOR_lineEndString) {
	try {
		if (!EDITOR_lineEndString)
			EDITOR_lineEndString = '\n';

		clipboard.writeText(MAIN_decode_experimental_textonly(uint8Array, offset, length, EDITOR_lineEndString));
	}
	catch (err) {
		console.error("Error setting clipboard:", err);
		return [];
	}
}

async function readClipboard(event) {
	try {
		return clipboard.readText();
	}
	catch (err) {
		console.error("Error reading clipboard:", err);
		return [];
	}
}

/** 
 * Returns an object with property 'success' equal to 'true' if success, otherwise the property is equal to 'false'...
 * ...and other properties as well.
 */
async function newFile(event, parentDirectoryAbsolutePath, filename, isDirectory) {
	if (!isValidAbsolutePath(parentDirectoryAbsolutePath)) return;

	/*
	I'm duplicating the code for mkdirSync and writeFile because
	I only want to add the path to the database if the operating system operation was successful.
	I don't like the idea of creating some if statement that occurs after either conditional branch
	in order to put this logic in one place, I'd rather duplicate it.

	As well, neither the renderer process or the main process are storing the absolutepaths.
	So I need to re-interact with the OS file-system to determine what index the new UI will go in.

	Having the main process determine which index changed, and telling the renderer how to update its state accordingly,
	while feeling somewhat wasteful, is still much less expensive than if you were to have the main process
	re-collect all of the children of some directory and send that down to the UI and delete the current children
	from the flat-list and add in this updated list wherein most are equal to what previously was in the flat list that you just deleted.
	*/

	try {
		let pathToNewFile = path.join(parentDirectoryAbsolutePath, filename);
		if (isDirectory) {
			fs.mkdirSync(pathToNewFile);
			let pathId = database.addAbsolutePath(pathToNewFile, filename);
			let indexOf = wrap_readdirSync_indexOf(parentDirectoryAbsolutePath, filename, /*childIsDirectory*/ true);
			return {
				success: true,
				pathId: pathId,
				indexOf: indexOf,
			};
		}
		else {
			fs.writeFile(pathToNewFile, 'overwritten?', { flag: 'wx' }, () => {});
			let pathId = database.addAbsolutePath(pathToNewFile, filename);
			let indexOf = wrap_readdirSync_indexOf(parentDirectoryAbsolutePath, filename, /*childIsDirectory*/ false);
			return {
				success: true,
				pathId: pathId,
				indexOf: indexOf,
			};
		}
	}
	catch (err) {
		console.error("Error making new file:", err);
		return {
			success: false,
		};
	}
}

/**
 * Returns 'true' if success, otherwise 'false'
 * 
 * TODO: delete should remove a row from the DB of absolute paths?
 */
async function deleteFile(event, absolutePath, isDirectory) {
	if (!isValidAbsolutePath(absolutePath)) return false;

	try {
		if (isDirectory) {
			fs.rmSync(absolutePath, { recursive: true });
			return true;
		}
		else {
			fs.unlinkSync(absolutePath);
			return true;
		}
	}
	catch (err) {
		console.error("Error deleting file:", err);
		return false;
	}
}
  
/**
 * Returns an object with property named 'success' equal to 'true' if successful, otherwise the property is equal to'false'...
 * ...as well contains a property named 'pathId' for the "absolute path id" of the row in the database that represents the absolute path...
 * ...as well contains a property named 'absolutePath' for the resulting absolute path string.
 * 
 * TODO: rename should remove the previous named path (provided that a change actually occurred)?
 */
async function renameFile(event, absolutePath, filename, isDirectory) {
	if (!isValidAbsolutePath(absolutePath)) return;

	try {
		if (isDirectory) {
			let directory = path.dirname(absolutePath);
			let pathToNewFile = path.join(directory, filename);
			if (fs.existsSync(pathToNewFile)) {
				throw new Error("The desination path '" + pathToNewFile + "' already exists.");
			}
			fs.renameSync(absolutePath, pathToNewFile);
			let pathId = database.addAbsolutePath(pathToNewFile, filename);
			return {
				success: true,
				pathId: pathId,
				absolutePath: pathToNewFile
			};
		}
		else {
			let directory = path.dirname(absolutePath);
			let pathToNewFile = path.join(directory, filename);
			if (fs.existsSync(pathToNewFile)) {
				throw new Error("The desination path '" + pathToNewFile + "' already exists.");
			}
			fs.renameSync(absolutePath, pathToNewFile);
			let pathId = database.addAbsolutePath(pathToNewFile, filename);
			return {
				success: true,
				pathId: pathId,
				absolutePath: pathToNewFile
			};
		}
	}
	catch (err) {
		console.error("Error renaming file:", err);
		return {
			success: false,
			pathId: pathId
		};
	}
}

async function saveFile(event, absolutePath, text) {
	if (!isValidAbsolutePath(absolutePath)) return;

	try {
		// TODO: verify that 'fs.writeFile' won't already throw an exception if file is directory (i.e.: verify that this check is necessary).
		const stats = fs.statSync(absolutePath);
		if (stats.isDirectory()) {
			throw new Error('The destination path is a directory');
		}

		fs.writeFile(absolutePath, text, () => {});
	}
	catch (err) {
		console.error("Error saving file:", err);
		return [];
	}
}

async function editorSaveFile(event, absolutePath, uint8Array, count, EDITOR_lineEndString, EDITOR_fileStartsWithBom) {
	if (!isValidAbsolutePath(absolutePath)) return;

	try {
		const stats = fs.statSync(absolutePath);
		if (stats.isDirectory()) {
			throw new Error('The destination path is a directory');
		}

		if (!EDITOR_lineEndString)
			EDITOR_lineEndString = '\n';

		fs.writeFile(absolutePath, MAIN_decode_experimental_textonly(uint8Array, /*start*/ 0, count, EDITOR_lineEndString, EDITOR_fileStartsWithBom), () => {});
	}
	catch (err) {
		console.error("Error saving file:", err);
		return [];
	}
}

/**
 * Returns an object with property 'success' equal to 'true' if success, otherwise the property is equal to 'false'...
 * ...and other properties as well.
 */
async function copyClipboardAbsolutePathToDirectory(event, directory, menuOptionCut_id) {
	if (!isValidAbsolutePath(directory)) return;

	try {
		let sourceFile = clipboard.readText();
		if (!sourceFile.startsWith('file:///')) {
			throw new Error("The clipboard's text does not start with 'file:///'.");
		}
		let sourceWasMenuOptionCut = sourceFile === menuOptionCut_id;
		sourceFile = sourceFile.substring('file:///'.length);
		if (!fs.existsSync(sourceFile)) {
			throw new Error("The clipboard does not contain a path to a file.");
		}
		if (!isValidAbsolutePath(sourceFile)) return;
		const stats = fs.statSync(sourceFile);
		let filename = path.basename(sourceFile);
		let destinationFile = path.join(directory, filename);
		if (stats.isDirectory()) {
			fs.cpSync(sourceFile, destinationFile, { force: false, errorOnExist: true, recursive: true });
			let pathId = database.addAbsolutePath(destinationFile, filename);
			let sourceFileWasDeleted = false;
			if (sourceWasMenuOptionCut & fs.existsSync(destinationFile)) {
				fs.rmSync(sourceFile, { recursive: true });
				sourceFileWasDeleted = true;
			}
			let indexOf = wrap_readdirSync_indexOf(directory, filename, /*childIsDirectory*/ true);
			return {
				success: true,
				pathId: pathId,
				indexOf: indexOf,
				isDirectory: true,
				sourceFileWasDeleted: sourceFileWasDeleted,
			};
		}
		else {
			fs.copyFileSync(sourceFile, destinationFile, fs.constants.COPYFILE_EXCL);
			let pathId = database.addAbsolutePath(destinationFile, filename);
			let sourceFileWasDeleted = false;
			if (sourceWasMenuOptionCut & fs.existsSync(destinationFile)) {
				fs.unlinkSync(sourceFile);
				sourceFileWasDeleted = true;
			}
			let indexOf = wrap_readdirSync_indexOf(directory, filename, /*childIsDirectory*/ false);
			return {
				success: true,
				pathId: pathId,
				indexOf: indexOf,
				isDirectory: false,
				sourceFileWasDeleted: sourceFileWasDeleted,
			};
		}
	}
	catch (err) {
		console.error("Error copying file:", err);
		return {
			success: false
		};
	}
}

/*
- [ ] classes, if an instance will "always exist" compile two versions:
    - [ ] The baseline always existing will use fieldBuffer.js
	- [ ] Any instance created beyond that as necessary will use fields themselves.
- [ ] all strings can be moved to a fieldBuffer to be stored as the byte representation
    - [ ] If you do this you'd want to from the get-go never introduce the string to begin with unless necessary


TODO: DefinitionClientCapabilities

*/

/* sec0
//========
/*
	TODO: Every IPC from renderer to main should return a result type
	{
		Result: ...,
		State: { cancelled, completed, failed },
		Note: "some string",
	}

	if (aaa.failed) { showNotification(aaa.Note); }

	if (aaa.Result === undefined) {
		// void
	}

	if (aaa.Result === null) {
		// lack of a Result / nullable result
	}
*//*
//========
sec0*/
