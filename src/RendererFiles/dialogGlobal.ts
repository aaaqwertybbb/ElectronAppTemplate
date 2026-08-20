import { DIALOG_Settings_Create_async, DIALOG_Settings_Delete_async } from "./dialogImplementationsGlobal"




export const DialogKind = {
    None: "None",
    FindAll: "FindAll",
    Settings: "Settings",
    DocumentSymbol: "DocumentSymbol",
    Debug: "Debug",
} as const;
// Derive the type union from the object values
export type DialogKind = typeof DialogKind[keyof typeof DialogKind];



let DIALOG_currentDialogKind: DialogKind = DialogKind.None;

/** A delegate of the form: () => {} */
let DIALOG_onResizeAction: (() => void) | null = null;
let DIALOG_restoreFocusToElement: HTMLElement | null = null;
let DIALOG_HIDE_shouldRestoreFocus = true;

let DIALOG_windowExists = false;

let DIALOG_hasBeenMeaasured = false;

let DIALOG_SHOW_restoreFocusToElement: HTMLElement | null = null;
let DIALOG_SHOW_currentDialogKind: DialogKind = DialogKind.None;
let DIALOG_SHOW_onResizeAction: (() => void) | null = null;

/**
 * defaults to viewport size then getBoundingClientRect says the exact pixels upon trying to resize
 * need to track resizes and store the useragent width/height by the onmousedown and then on resize get proportion and update left top width height.
 */
let DIALOG_left = 0;
let DIALOG_top = 0;
let DIALOG_width = 0;
let DIALOG_height = 0;

let DIALOG_left_DRAWN = 0;
let DIALOG_top_DRAWN = 0;
let DIALOG_width_DRAWN = 0;
let DIALOG_height_DRAWN = 0;

let DIALOG_before_X = 0;
let DIALOG_before_Y = 0;

let DIALOG_after_X = 0;
let DIALOG_after_Y = 0;

let DIALOG_FindAll_options_matchWord = false;

export let DIALOG_Settings_isDark = true;
let DIALOG_Settings_trueTabs_falseSpaces = true;
export let DIALOG_Settings_editorDebugShowAdjacentCharacters = false;

let DIALOG_renderKindArray: number[] = [];
let DIALOG_isRenderPending = false;





export const Dialog_RenderKind = {
    None: 0,
    Show: 1,
    Hide: 2,
    DimensionsChanged: 3,
} as const;
// Derive the type union from the object values
export type Dialog_RenderKind = typeof Dialog_RenderKind[keyof typeof Dialog_RenderKind];




const DIALOG_minTop = 8;
const DIALOG_minLeft = 8;
const DIALOG_minHeight = 100;
const DIALOG_minWidth = 100;

export function DIALOG_Settings_isDark_SETTER(isDark: boolean) {
    DIALOG_Settings_isDark = isDark;
}

function DIALOG_render_request(renderKind: number) {
    if (DIALOG_renderKindArray[DIALOG_renderKindArray.length - 1] !== renderKind) {
        DIALOG_renderKindArray.push(renderKind);
    }
    
    if (!DIALOG_isRenderPending) {
        DIALOG_isRenderPending = true;
        requestAnimationFrame(DIALOG_render_do);
    }
}

function DIALOG_render_do() {
    let renderKind;
    
    while (renderKind = DIALOG_renderKindArray.shift()) {
        switch (renderKind) {
            case Dialog_RenderKind.Show:
                DIALOG_render_do_Show();
                break;
            case Dialog_RenderKind.Hide:
                DIALOG_render_do_Hide();
                break;
            case Dialog_RenderKind.DimensionsChanged:
                DIALOG_render_do_DimensionsChanged();
                break;
        }
    }
    
    DIALOG_isRenderPending = false; // Reset the paint lock
}

function DIALOG_render_do_DimensionsChanged() {
    let DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    if (DIALOG_left_DRAWN !== DIALOG_left) {
        DIALOG_left_DRAWN = DIALOG_left;
        DIALOG_element.style.left = `${DIALOG_left_DRAWN}px`;
    }
    if (DIALOG_top_DRAWN !== DIALOG_top) {
        DIALOG_top_DRAWN = DIALOG_top;
        DIALOG_element.style.top = `${DIALOG_top_DRAWN}px`;
    }
    if (DIALOG_width_DRAWN !== DIALOG_width) {
        DIALOG_width_DRAWN = DIALOG_width;
        DIALOG_element.style.width = `${DIALOG_width_DRAWN}px`;
    }
    if (DIALOG_height_DRAWN !== DIALOG_height) {
        DIALOG_height_DRAWN = DIALOG_height;
        DIALOG_element.style.height = `${DIALOG_height_DRAWN}px`;
    }
    
}

async function DIALOG_render_do_Show() {
    if (DIALOG_currentDialogKind !== DialogKind.None) {
        DIALOG_HIDE_shouldRestoreFocus = true;
        await DIALOG_render_do_Hide();
    }

    let DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) {
        DIALOG_element = document.createElement('div');
        DIALOG_element.id = "DIALOG";
        document.body.appendChild(DIALOG_element);
    }

    DIALOG_restoreFocusToElement = DIALOG_SHOW_restoreFocusToElement;
    DIALOG_currentDialogKind = DIALOG_SHOW_currentDialogKind;
    DIALOG_onResizeAction = DIALOG_SHOW_onResizeAction;

    DIALOG_createWindow();

    switch (DIALOG_currentDialogKind) {
        case DialogKind.Settings:
            return DIALOG_Settings_Create_async();
    }
}

export async function DIALOG_show_async(dialogKind: DialogKind, onResizeAction: (() => void) | null) {
    if (document.activeElement instanceof HTMLElement) {
        DIALOG_SHOW_restoreFocusToElement = document.activeElement;
    }
    else {
        DIALOG_SHOW_restoreFocusToElement = null;
    }

    DIALOG_SHOW_currentDialogKind = dialogKind;
    DIALOG_SHOW_onResizeAction = onResizeAction;
    DIALOG_render_request(Dialog_RenderKind.Show);
}

async function DIALOG_render_do_Hide() {
    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    switch (DIALOG_currentDialogKind) {
        case DialogKind.Settings:
            await DIALOG_Settings_Delete_async();
            break;
    }

    DIALOG_deleteWindow();

    DIALOG_onResizeAction = null;
    DIALOG_element.remove();
    DIALOG_currentDialogKind = DialogKind.None;
    if (DIALOG_HIDE_shouldRestoreFocus) {
        if (DIALOG_restoreFocusToElement) {
            DIALOG_restoreFocusToElement.focus();
        }
        DIALOG_restoreFocusToElement = null;
    }
}

function DIALOG_hide_request(shouldRestoreFocus: boolean) {
    DIALOG_HIDE_shouldRestoreFocus = shouldRestoreFocus;
    DIALOG_render_request(Dialog_RenderKind.Hide);
}

function DIALOG_closeButton_onclick() {
    DIALOG_hide_request(true);
}

function DIALOG_resize_onmouseenter(event: MouseEvent) {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    if (event.buttons & 1) {
        // while resizing you went from one end to the other and it bugged out
        return;
    }

    let resize = document.getElementById('DIALOG_resize');
    if (!resize) return;

    // TODO: cache the bounding client rect
    let dialogBoundingClientRect = DIALOG_element.getBoundingClientRect();

    DIALOG_resize_setCursor(event, dialogBoundingClientRect, resize);
}

function DIALOG_resize_onmousedown(event: MouseEvent) {
    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    let resize = document.getElementById('DIALOG_resize');
    if (!resize) return;

    // TODO: cache the bounding client rect
    let dialogBoundingClientRect = DIALOG_element.getBoundingClientRect();

    DIALOG_resize_setCursor(event, dialogBoundingClientRect, resize);

    DIALOG_before_X = event.clientX;
    DIALOG_before_Y = event.clientY;
    DIALOG_after_X = 0;
    DIALOG_after_Y = 0;

    DIALOG_left = dialogBoundingClientRect.left;
    DIALOG_top = dialogBoundingClientRect.top;
    DIALOG_width = dialogBoundingClientRect.width;
    DIALOG_height = dialogBoundingClientRect.height;
    DIALOG_hasBeenMeaasured = true;

    document.body.classList.add('unselectable');
    window.addEventListener('mousemove', DIALOG_resize_body_onmousemove, /*useCapture*/ true);
}

/**
 * does not redraw, only preps the state to be redrawn
 */
function DIALOG_n_resize_calcOnly(diff_Y: number, clientY: number) {
    if (diff_Y < 0) {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_top <= DIALOG_minTop) {
            return; // TODO: ...
        }
        else if (DIALOG_top - absdiff_Y < DIALOG_minTop) {
            clientY += (absdiff_Y - (DIALOG_top - DIALOG_minTop));
            absdiff_Y = DIALOG_top - DIALOG_minTop;
        }
        DIALOG_top -= absdiff_Y;
        DIALOG_height += absdiff_Y;
        DIALOG_before_Y = clientY;
    }
    else {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_height <= DIALOG_minHeight) {
            return; // TODO: ...
        }
        else if (DIALOG_height - absdiff_Y < DIALOG_minHeight) {
            clientY -= (absdiff_Y - (DIALOG_height - DIALOG_minHeight));
            absdiff_Y = DIALOG_height - DIALOG_minHeight;
        }
        DIALOG_height -= absdiff_Y;
        DIALOG_top += absdiff_Y;
        DIALOG_before_Y = clientY;
    }
}

/** does not redraw, only preps the state to be redrawn */
function DIALOG_e_resize_calcOnly(diff_X: number, clientX: number) {
    if (diff_X < 0) {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_width <= DIALOG_minWidth) {
            return; // TODO: ...
        }
        else if (DIALOG_width - absdiff_X < DIALOG_minWidth) {
            clientX += (absdiff_X - (DIALOG_width - DIALOG_minWidth));
            absdiff_X = DIALOG_width - DIALOG_minWidth;
        }
        DIALOG_width -= absdiff_X;
        DIALOG_before_X = clientX;
    }
    else {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_left + DIALOG_width + 8 >= window.innerWidth) {
            return; // TODO: ...
        }
        else if (DIALOG_left + DIALOG_width + 8 + absdiff_X > window.innerWidth) {
            let DIALOG_maxWidth = window.innerWidth - 8 - DIALOG_left;
            clientX -= (absdiff_X - (DIALOG_maxWidth - DIALOG_width));
            absdiff_X = DIALOG_maxWidth - DIALOG_width;
        }
        DIALOG_width += absdiff_X;
        DIALOG_before_X = clientX;
    }
}

/** does not redraw, only preps the state to be redrawn */
function DIALOG_s_resize_calcOnly(diff_Y: number, clientY: number) {
    if (diff_Y < 0) {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_height <= DIALOG_minHeight) {
            return; // TODO: ...
        }
        else if (DIALOG_height - absdiff_Y < DIALOG_minHeight) {
            // tighten in the other direction because overshoot
            clientY += (absdiff_Y - (DIALOG_height - DIALOG_minHeight));
            absdiff_Y = DIALOG_height - DIALOG_minHeight;
        }
        DIALOG_height -= absdiff_Y;
        DIALOG_before_Y = clientY;
    }
    else {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_top + 8 + DIALOG_height >= window.innerHeight) {
            return; // TODO: ...
        }
        else if (DIALOG_top + 8 + DIALOG_height + absdiff_Y > window.innerHeight) {
            // tighten in the other direction because overshoot
            // -8 is the hardcoded pixel size that the resize element overhangs the dialog.
            let DIALOG_maxHeight = window.innerHeight - 8 - DIALOG_top;
            clientY -= (absdiff_Y - (DIALOG_maxHeight - DIALOG_height));
            absdiff_Y = DIALOG_maxHeight - DIALOG_height;
        }
        DIALOG_height += absdiff_Y;
        DIALOG_before_Y = clientY;
    }
}

/** does not redraw, only preps the state to be redrawn */
function DIALOG_w_resize_calcOnly(diff_X: number, clientX: number) {
    if (diff_X < 0) {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_left <= DIALOG_minLeft) {
            return; // TODO: ...
        }
        else if (DIALOG_left - absdiff_X < DIALOG_minLeft) {
            clientX += (absdiff_X - (DIALOG_left - DIALOG_minLeft));
            absdiff_X = DIALOG_left - DIALOG_minLeft;
        }
        DIALOG_width += absdiff_X;
        DIALOG_left -= absdiff_X;
        DIALOG_before_X = clientX;
    }
    else {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_width <= DIALOG_minWidth) {
            return; // TODO: ...
        }
        else if (DIALOG_width - absdiff_X < DIALOG_minWidth) {
            clientX += (absdiff_X - (DIALOG_width - DIALOG_minWidth));
            absdiff_X = DIALOG_width - DIALOG_minWidth;
        }
        DIALOG_width -= absdiff_X;
        DIALOG_left += absdiff_X;
        DIALOG_before_X = clientX;
    }
}

function DIALOG_resize_body_onmousemove(event: MouseEvent) {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    let resize = document.getElementById('DIALOG_resize');
    if (!resize) return;

    if (event.buttons & 1) {
        // TODO: I literally can't even right now with this empty if statement
    }
    else {
        document.body.classList.remove('unselectable');
        window.removeEventListener('mousemove', DIALOG_resize_body_onmousemove, /*useCapture*/ true);
        if (DIALOG_onResizeAction) DIALOG_onResizeAction();
        return;
    }

    let diff_X = event.clientX - DIALOG_before_X;
    let diff_Y = event.clientY - DIALOG_before_Y;

    if (diff_Y > -1 && diff_Y < 1) diff_Y = 0;
    if (diff_X > -1 && diff_X < 1) diff_X = 0;

    if (diff_X === 0 && diff_Y === 0) {
        return;
    }

    let clientX = event.clientX;
    let clientY = event.clientY;

    switch (resize.style.cursor) {
        case 'nw-resize':
            DIALOG_n_resize_calcOnly(diff_Y, clientY);
            DIALOG_w_resize_calcOnly(diff_X, clientX);
            break;
        case 'w-resize':
            DIALOG_w_resize_calcOnly(diff_X, clientX);
            break;
        case 'sw-resize':
            DIALOG_s_resize_calcOnly(diff_Y, clientY);
            DIALOG_w_resize_calcOnly(diff_X, clientX);
            break;
        case 'n-resize':
            DIALOG_n_resize_calcOnly(diff_Y, clientY);
            break;
        case 's-resize':
            DIALOG_s_resize_calcOnly(diff_Y, clientY);
            break;
        case 'ne-resize':
            DIALOG_n_resize_calcOnly(diff_Y, clientY);
            DIALOG_e_resize_calcOnly(diff_X, clientX);
            break;
        case 'e-resize':
            DIALOG_e_resize_calcOnly(diff_X, clientX);
            break;
        case 'se-resize':
            DIALOG_s_resize_calcOnly(diff_Y, clientY);
            DIALOG_e_resize_calcOnly(diff_X, clientX);
            break;
        default:
            return;
    }

    DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
}

function DIALOG_resize_setCursor(event: MouseEvent, dialogBoundingClientRect: DOMRect, resize: HTMLElement) {
    let rX = event.clientX - dialogBoundingClientRect.left;
    let rY = event.clientY - dialogBoundingClientRect.top;
    // left to right
    //     top to bottom
    if (rX < 0) {
        if (rY < 0) {
            resize.style.cursor = 'nw-resize';
        }
        else if (event.clientY < dialogBoundingClientRect.top + dialogBoundingClientRect.height) {
            resize.style.cursor = 'w-resize';
        }
        else {
            resize.style.cursor = 'sw-resize';
        }
    }
    else if (event.clientX < dialogBoundingClientRect.left + dialogBoundingClientRect.width) {
        if (rY < 0) {
            resize.style.cursor = 'n-resize';
        }
        else if (event.clientY < dialogBoundingClientRect.top + dialogBoundingClientRect.height) {
            //resize.style.cursor = 'ns-resize';
        }
        else {
            resize.style.cursor = 's-resize';
        }
    }
    else {
        if (rY < 0) {
            resize.style.cursor = 'ne-resize';
        }
        else if (event.clientY < dialogBoundingClientRect.top + dialogBoundingClientRect.height) {
            resize.style.cursor = 'e-resize';
        }
        else {
            resize.style.cursor = 'se-resize';
        }
    }
}

/** This is the wellknown JS window object: 'window.addEventListener...' not to be confused with what I call the "window" of the dialog. */
function DIALOG_window_onresize() {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    if (!DIALOG_hasBeenMeaasured) return;

    // Max width and min width depend on the left/top so they need to come first.
    if (DIALOG_left <= DIALOG_minLeft) {
        DIALOG_left = DIALOG_minLeft;
        DIALOG_element.style.left = DIALOG_left + 'px';
    }
    if (DIALOG_top <= DIALOG_minTop) {
        DIALOG_top = DIALOG_minTop;
        DIALOG_element.style.top = DIALOG_top + 'px';
    }

    if (DIALOG_height <= DIALOG_minHeight) {
        DIALOG_height = DIALOG_minHeight;
        DIALOG_element.style.height = DIALOG_height + 'px';
    }
    else if (DIALOG_height + DIALOG_top + 8 >= window.innerHeight) {
        DIALOG_height = window.innerHeight - 8 - DIALOG_top;
        DIALOG_element.style.height = DIALOG_height + 'px';
    }

    if (DIALOG_width <= DIALOG_minWidth) {
        DIALOG_width = DIALOG_minWidth;
        DIALOG_element.style.width = DIALOG_width + 'px';
    }	
    else if (DIALOG_left + DIALOG_width + 8 >= window.innerWidth) {
        DIALOG_width = window.innerWidth - 8 - DIALOG_left;
        DIALOG_element.style.width = DIALOG_width + 'px';
    }
}

function DIALOG_toolbar_body_onmousemove(event: MouseEvent) {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    let resize = document.getElementById('DIALOG_resize');
    if (!resize) return;

    if (event.buttons & 1) {
        // TODO: I literally can't even right now with this empty if statement
    }
    else {
        document.body.classList.remove('unselectable');
        window.removeEventListener('mousemove', DIALOG_toolbar_body_onmousemove, /*useCapture*/ true);
        if (DIALOG_onResizeAction) DIALOG_onResizeAction();
        return;
    }

    let diff_X = event.clientX - DIALOG_before_X;
    let diff_Y = event.clientY - DIALOG_before_Y;

    if (diff_Y > -1 && diff_Y < 1) diff_Y = 0;
    if (diff_X > -1 && diff_X < 1) diff_X = 0;

    if (diff_X === 0 && diff_Y === 0) {
        return;
    }

    let clientX = event.clientX;
    let clientY = event.clientY;

    if (diff_X < 0) {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_left <= DIALOG_minLeft) {
            //return; // TODO: ...
        }
        else if (DIALOG_left - absdiff_X < DIALOG_minLeft) {
            clientX += (absdiff_X - (DIALOG_left - DIALOG_minLeft));
            absdiff_X = DIALOG_left - DIALOG_minLeft;

            DIALOG_left -= absdiff_X;
            DIALOG_before_X = clientX;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
        else {
            DIALOG_left -= absdiff_X;
            DIALOG_before_X = clientX;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
    }
    else if (diff_X > 0) {
        let absdiff_X = Math.abs(diff_X);
        if (DIALOG_left + DIALOG_width + 8 >= window.innerWidth) {
            //return; // TODO: ...
        }
        else if (DIALOG_left + DIALOG_width + 8 + absdiff_X > window.innerWidth) {
            let DIALOG_maxLeft = window.innerWidth - 8 - DIALOG_width;
            clientX -= (absdiff_X - (DIALOG_maxLeft - DIALOG_left));
            absdiff_X = DIALOG_maxLeft - DIALOG_left;

            DIALOG_left += absdiff_X;
            DIALOG_before_X = clientX;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
        else {
            DIALOG_left += absdiff_X;
            DIALOG_before_X = clientX;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
    }

    if (diff_Y < 0) {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_top <= DIALOG_minTop) {
            //return; // TODO: ...
        }
        else if (DIALOG_top - absdiff_Y < DIALOG_minTop) {
            clientY += (absdiff_Y - (DIALOG_top - DIALOG_minTop));
            absdiff_Y = DIALOG_top - DIALOG_minTop;
            
            DIALOG_top -= absdiff_Y;
            DIALOG_before_Y = clientY;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
        else {
            DIALOG_top -= absdiff_Y;
            DIALOG_before_Y = clientY;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
    }
    else if (diff_Y > 0) {
        let absdiff_Y = Math.abs(diff_Y);
        if (DIALOG_top + 8 + DIALOG_height >= window.innerHeight) {
            //return; // TODO: ...
        }
        else if (DIALOG_top + 8 + DIALOG_height + absdiff_Y > window.innerHeight) {
            let DIALOG_maxTop = window.innerHeight - 8 - DIALOG_height;
            clientY -= (absdiff_Y - (DIALOG_maxTop - DIALOG_top));
            absdiff_Y = DIALOG_maxTop - DIALOG_top;
            
            DIALOG_top += absdiff_Y;
            DIALOG_before_Y = clientY;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
        else {
            DIALOG_top += absdiff_Y;
            DIALOG_before_Y = clientY;
            DIALOG_render_request(Dialog_RenderKind.DimensionsChanged);
        }
    }
}

function DIALOG_toolbar_onmousedown(event: MouseEvent) {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    let resize = document.getElementById('DIALOG_toolbar');
    if (!resize) return;

    // TODO: cache the bounding client rect
    let dialogBoundingClientRect = DIALOG_element.getBoundingClientRect();

    DIALOG_before_X = event.clientX;
    DIALOG_before_Y = event.clientY;
    DIALOG_after_X = 0;
    DIALOG_after_Y = 0;

    DIALOG_left = dialogBoundingClientRect.left;
    DIALOG_top = dialogBoundingClientRect.top;
    DIALOG_width = dialogBoundingClientRect.width;
    DIALOG_height = dialogBoundingClientRect.height;
    DIALOG_hasBeenMeaasured = true;

    document.body.classList.add('unselectable');
    window.addEventListener('mousemove', DIALOG_toolbar_body_onmousemove, /*useCapture*/ true);
}

/**
 * Window is the title bar, maximize, minimize, close etc...
 */
function DIALOG_createWindow() {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    // TODO: Might want to check if the HTML element exists instead.
    if (DIALOG_windowExists) return;
    DIALOG_windowExists = true;

    let toolbar = document.createElement('div');
    toolbar.id = 'DIALOG_toolbar';
    let body = document.createElement('div');
    body.id = 'DIALOG_body';
    let resize = document.createElement('div');
    resize.id = 'DIALOG_resize';

    toolbar.addEventListener('mousedown', DIALOG_toolbar_onmousedown);

    resize.addEventListener('mouseenter', DIALOG_resize_onmouseenter);
    resize.addEventListener('mousedown', DIALOG_resize_onmousedown);
    window.addEventListener('resize', DIALOG_window_onresize);

    DIALOG_element.appendChild(resize);
    DIALOG_element.appendChild(toolbar);
    DIALOG_element.appendChild(body);

    // TODO: You have to actually make sure the text fits
    toolbar.textContent = DIALOG_currentDialogKind;

    let closeButton = document.createElement('button');
    closeButton.textContent = 'x';
    closeButton.id = 'DIALOG_closeButton';

    closeButton.addEventListener('click', DIALOG_closeButton_onclick);

    toolbar.appendChild(closeButton);

    closeButton.focus();
}

/**
 * Window is the title bar, maximize, minimize, close etc...
 */
function DIALOG_deleteWindow() {

    const DIALOG_element = document.getElementById('DIALOG');
    if (!DIALOG_element) return;

    // TODO: Might want to check if the HTML element exists instead.
    if (!DIALOG_windowExists) return;
    // TODO: Perhaps move these respective sets to the end of their functions.
    // This way them being set as a certain value reflects that the entirety of their respective code had been ran but then again... idk
    DIALOG_windowExists = false;

    DIALOG_left = 0;
    DIALOG_top = 0;
    DIALOG_width = 0;
    DIALOG_height = 0;

    DIALOG_before_X = 0;
    DIALOG_before_Y = 0;
    DIALOG_after_X = 0;
    DIALOG_after_Y = 0;

    let toolbar = document.getElementById('DIALOG_toolbar');
    if (!toolbar) throw new Error('getElementById for DIALOG_toolbar was null');
    toolbar.removeEventListener('mousedown', DIALOG_toolbar_onmousedown);

    document.body.classList.remove('unselectable');
    window.removeEventListener('mousemove', DIALOG_resize_body_onmousemove, /*useCapture*/ true);
    window.removeEventListener('mousemove', DIALOG_toolbar_body_onmousemove, /*useCapture*/ true);
    if (DIALOG_onResizeAction) DIALOG_onResizeAction();

    window.removeEventListener('resize', DIALOG_window_onresize);

    let resize = document.getElementById('DIALOG_resize');
    if (!resize) throw new Error('getElementById for DIALOG_resize was null');
    resize.removeEventListener('mouseenter', DIALOG_resize_onmouseenter);
    resize.removeEventListener('mousedown', DIALOG_resize_onmousedown);
    

    let closeButton = document.getElementById('DIALOG_closeButton');
    if (!closeButton) throw new Error('getElementById for closeButton was null');
    closeButton.removeEventListener('click', DIALOG_closeButton_onclick);
}
