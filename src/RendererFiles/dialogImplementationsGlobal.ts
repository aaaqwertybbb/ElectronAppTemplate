import { DIALOG_Settings_isDark, DIALOG_Settings_isDark_SETTER } from './dialogGlobal';

export async function DIALOG_Settings_Create_async() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;

    let buttonTheme = document.createElement('button');
    buttonTheme.id = 'SETTINGS_theme';
    buttonTheme.textContent = 'Theme';
    buttonTheme.addEventListener('click', DIALOG_buttonTheme_onclick);
    dialogBody.appendChild(buttonTheme);
}

export async function DIALOG_Settings_Delete_async() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;
    
    let buttonTheme = document.getElementById('SETTINGS_theme');
    if (buttonTheme) {
        buttonTheme.removeEventListener('click', DIALOG_buttonTheme_onclick);
    }
}

function DIALOG_buttonTheme_onclick() {
    if (DIALOG_Settings_isDark) {
        DIALOG_Settings_isDark_SETTER(false);
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    else {
        DIALOG_Settings_isDark_SETTER(true);
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
}

//let DEBUG_listData = null;
//let DEBUG_listComponent = null;

async function DIALOG_Debug_Create_async() {
//    let dialogBody = document.getElementById('DIALOG_body');
//    if (!dialogBody) return;
//    
//    DEBUG_listData = new Uint16Array(65_536);
//    for (let i = 0; i < 65_536; i++) {
//        DEBUG_listData[i] = i;
//    }
//
//    if (!DEBUG_listComponent) {
//        DEBUG_listComponent = new ListComponent();
//    }
//    DEBUG_listComponent.setItems(APP_lineHeight, APP_lineHeight + 'px',
//        /*drawItemAction*/ (div, index) => {
//            if (index === -1) {
//                div.textContent = '';
//                div.title = '';
//                div.style.display = 'none';
//            }
//            else {
//                let item = DEBUG_listData[index];
//                div.textContent = item;
//                div.style.display = '';
//            }
//        },
//        /*onkeydownAction*/ (div, index) => {
//            //if (index === -1) {
//            //    // TODO: if (index === -1)
//            //}
//            //else {
//            //    // TODO: Ensure that json parsing the title like this is a safe way of doing things
//            //    const startPosition = JSON.parse(div.title);
//            //    EDITOR_moveCursor_indexLine_indexColumn(startPosition.line, startPosition.character);
//            //}
//        },
//        /*getItemsCountFunc*/ () => {
//            if (DEBUG_listData) {
//                return DEBUG_listData.length;
//            }
//            else {
//                return 0;
//            }
//        });
//    
//    if (DEBUG_listData) {
//        let div = document.createElement('div');
//        div.textContent = 'DEBUG_listData.length: ' + DEBUG_listData.length;
//        div.style.height = APP_lineHeight + 'px';
//        div.style.whiteSpace = 'nowrap';
//        dialogBody.appendChild(div);
//        DEBUG_listComponent.rootElement.style.height = `calc(100% - ${div.style.height})`;
//        DEBUG_listComponent.draw_create(dialogBody, null);
//    }
//    else {
//        dialogBody.textContent = 'DEBUG_listData is falsey';
//    }
}

async function DIALOG_Debug_Delete_async() {
//    let dialogBody = document.getElementById('DIALOG_body');
//    if (!dialogBody) return;
//
//    DEBUG_listData = null;
//    DEBUG_listComponent = null;
}
