
/** File contains more than one class (noted only because it doesn't feel obvious that there would be more than one class, this note doesn't exist in every file) */

/** See the "interface TreeViewDirector" towards the bottom of this file */

// # TypeScript
//     // Define the base object with 'as const'
//     const Status = {
//       Active: "ACTIVE",
//       Pending: "PENDING",
//     } as const;
//     // Derive the type union from the object values
//     type Status = typeof Status[keyof typeof Status];
//     let userStatus: Status = Status.Active;
//
// # Generated JavaScript
//    const Status = {
//        Active: 0,
//        Pending: 1,
//    };
//
// "I dunno it looks like this makes a javascript object in the end? Maybe it isn't"
// all in all I wanna lean towards being idiomatic to start than idiotic.
//
// I'm gonna ask:
// > is the generated javascript resulting in an object allocation?:
// > ```js
// > const Status = {
// >     Active: 0,
// >     Pending: 1,
// > };
// > ```
//
// < Yes, this code results in an object allocation at runtime.
// < ...
// < If your goal is absolute zero runtime allocation, you have two ways to achieve it:
// < 
// < 
// < 1. The const enum Pattern (Zero Allocation)
// < If you want to use a structural lookup in TypeScript but want zero objects allocated in your compiled JavaScript, use a const enum
// < ```ts
// < // TypeScript
// < const enum Status {
// <   Active = 0,
// <   Pending = 1,
// < }
// < const userStatus = Status.Active;
// < ```
// < Compiled JavaScript:
// < ```js
// < // The object completely disappears. The value is just hardcoded.
// < const userStatus = 0;
// < ```
// <
// <
// < 2. Pure Type Unions (Zero Allocation)
// < If you do not actually need to reference an object at runtime (like calling Object.keys() or passing the whole dictionary around),
// < you can bypass objects entirely using a pure string or number union type.
// < ```ts
// < // TypeScript
// < type Status = 0 | 1; // Or 'active' | 'pending'
// < 
// < const userStatus: Status = 0;
// < ```
// < Compiled JavaScript:
// < ```js
// < // Standard primitive variable assignment. Zero allocation.
// < const userStatus = 0;
// < ```
// < 
// < Would you like to see how to configure const enum tracking across isolated modules, or do you want to see how to structure your pure type unions for better readability?

// > "const enum tracking across isolated modules"

// < The main challenge with const enum is that tools like Babel, esbuild, SWC, and Vite compile files one by one (isolated modules).
// < Because they cannot see across files, they do not know what values to inline when you import a const enum from another file, which usually causes a build crash or runtime error
// <
// < To track and safely use const enum across isolated modules, you must configure your project using one of the two strategies below.
// <
// < Strategy 1: The Modern Standard (Preserve+Optimize)
// < Instead of forcing the compiler to guess, you tell TypeScript to preserve the enum structure as a standard object while allowing modern bundlers to safely strip it out if it isn't used.
// < 
// < 1. Update tsconfig.json
// < Set isolatedModules to true (which is required by modern tools) and tell TypeScript to output standard code for enums.
// <
// < ```json
// < {
// <   "compilerOptions": {
// <     "isolatedModules": true,
// <     "preserveConstEnums": true
// <   }
// < }
// < ```
// <
// < 2. The Resulting Behavior
// < - In development: The const enum acts like a regular object. Tools like Vite or esbuild can safely compile individual files without crashing.
// < - In production: Modern tree-shaking bundlers flag the preserved object as a side-effect-free literal and completely strip it out if it is unused, giving you the best of both worlds.
// <
// <
// < Strategy 2: Bundler-Specific Plugins
// < If you absolute require strict compile-time inlining (zero object allocation) even across files,
// < you must use a dedicated build plugin that reads the entire type tree during compilation.
// <
// < ...
//
// way too much to do right now I'm not dealing with this until later (and even then only maybe)


const TreeView_RenderKind = {
    None: 0,
    Cursor: 1,
    Create: 2,
    Batch: 3,
    Scroll: 4,
    SetItems: 5,
    FullReset: 6,
    Scroll_PullDataDrawResult: 7,
    Resize: 8,
} as const;
// Derive the type union from the object values
type TreeView_RenderKind = typeof TreeView_RenderKind[keyof typeof TreeView_RenderKind];


const TreeView_NodeKind = {
    None: 0,
    isExpandable_isExpanded: 1,
    isExpandable_NOTisExpanded: 2,
    NOTisExpandable_isExpanded: 3,
    NOTisExpandable_NOTisExpanded: 4,
} as const;
// Derive the type union from the object values
type TreeView_NodeKind = typeof TreeView_NodeKind[keyof typeof TreeView_NodeKind];


let TreeView_pooledNode_nodeKind: TreeView_NodeKind = TreeView_NodeKind.None;
let TreeView_pooledNode_key = 0;
let TreeView_pooledNode_depth = 0;

/**
 * The director maintains a flat optimized list of every element i.e.: represent each element in a uint8array and each one is a byte that maps to the actual.
 * 
 * Then the actual can be a hierarchical datastructure.
 * 
 * You just keep flattening it into a byte array and map back and forth.
 */
abstract class TreeViewComponent {
    rootElement: HTMLDivElement;
    virtualizationElement: HTMLDivElement;
    cursorElement: HTMLDivElement;
    itemListElement: HTMLDivElement;
    itemHeightTotal: number;
    cursorIndex: number;
    _ONSCROLLvirtualIndex: number;
    _ONSCROLLvirtualCount: number;
    lastReadNumber_scrollLeft: number;
    lastReadNumber_scrollTop: number;
    scrollTimer: null;
    hasTrailingCall: boolean;
    beltIndexZero: number;
    TREEVIEW_renderKindArray: TreeView_RenderKind[];
    TREEVIEW_isRenderPending: boolean;
    TREEVIEW_ArrayFrom_itemListElement_children: HTMLElement[];
    TREEVIEW_ArrayFrom_itemListElement_children_length: number;
    TREEVIEW_draw_create_request_parentElement: HTMLElement | null;
    TREEVIEW_draw_create_request_insertBeforeThisChild: null;
    start: number;
    length: number;
    onePositiveDiff_twoNegativeDiff_orThreeFullScreen: number;
    caseThreeOrigin: number;
    SET_ITEMS_itemHeightNumber: number;
    SET_ITEMS_itemHeightStyleAttributeValueString: string;
    WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING: number;
    LARGEST_DEPTH_SEEN_NOT_THE_CSS_JUST_THE_DEPTH: number;
    itemHeightNumber: number = 0;
    itemHeightStyleAttributeValueString: string = '0px';
    boundingClientRect_height: number = 0;
    boundingClientRect_top: number = 0;
    boundingClientRect_measurementsAreValid: boolean = false;
    virtualCount: number = 0;
    virtualIndex_ofScrollTop: number = 0;
    cursorTranslateYNumber: number = 0;
    lastReadNumber_offsetWidth: number = 0;
    lastReadNumber_offsetHeight: number = 0;
    scrollEndDeadline: number = 0;
    /** Starting with an empty array so I can have undefined/null signify that the "TreeViewDirector" is "opting out" of this feature, thus the component should not allocate this on the "TreeViewDirector"'s behalf. */
    pullData_array = new Uint32Array(0);
    pullData_array_count = 0;
    
    constructor() {
        this.rootElement = document.createElement('div');
        this.rootElement.classList.add('TREEVIEW', 'unselectable');
        this.rootElement.tabIndex = 0;
        this.rootElement.style.height = '100%';

        this.virtualizationElement = document.createElement('div');
        this.virtualizationElement.className = 'TREEVIEW_virtualization';
        this.rootElement.appendChild(this.virtualizationElement);

        /** Consider the existence of such methods as 'state_cursor_setIndex' before mutating state directly */
        this.cursorElement = document.createElement('div');
        this.cursorElement.className = 'TREEVIEW_cursor';
        this.rootElement.appendChild(this.cursorElement);

        this.itemListElement = document.createElement('div');
        this.itemListElement.className = 'TREEVIEW_itemList';
        this.rootElement.appendChild(this.itemListElement);

        this.itemHeightTotal = 0;

        /** Consider the existence of such methods as 'state_cursor_setIndex' before mutating state directly */
        this.cursorIndex = 0;

        this._ONSCROLLvirtualIndex = 0;
        this._ONSCROLLvirtualCount = 0;

        this.lastReadNumber_scrollLeft = 0;
        this.lastReadNumber_scrollTop = 0;
        
        this.scrollTimer = null;
        this.hasTrailingCall = false;

        this.beltIndexZero = 0;

        this.TREEVIEW_renderKindArray = [];
        this.TREEVIEW_isRenderPending = false;

        this.TREEVIEW_ArrayFrom_itemListElement_children = [];
        this.TREEVIEW_ArrayFrom_itemListElement_children_length = 0;

        this.TREEVIEW_draw_create_request_parentElement = null;
        this.TREEVIEW_draw_create_request_insertBeforeThisChild = null;

        this.start = 0;
        this.length = 0;
        this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen = 0;
        this.caseThreeOrigin = 0;

        this.SET_ITEMS_itemHeightNumber = 0;
        this.SET_ITEMS_itemHeightStyleAttributeValueString = '';

        this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = 2;

        this.LARGEST_DEPTH_SEEN_NOT_THE_CSS_JUST_THE_DEPTH = 0;
    }

    TREEVIEW_render_request(renderKind: TreeView_RenderKind) {
        if (this.TREEVIEW_renderKindArray[this.TREEVIEW_renderKindArray.length - 1] !== renderKind) {
            this.TREEVIEW_renderKindArray.push(renderKind);
        }
        
        if (!this.TREEVIEW_isRenderPending) {
            this.TREEVIEW_isRenderPending = true;
            requestAnimationFrame(this.renderDo);
        }
    }

    renderDo = (timestamp: number) => {
        let renderKind;
        
        // Synchronously exhaust the item queue for this animation frame
        while (renderKind = this.TREEVIEW_renderKindArray.shift()) {
            switch (renderKind) {
                case TreeView_RenderKind.Cursor:
                    this.TREEVIEW_render_do_Cursor();
                    break;
                case TreeView_RenderKind.Create:
                    this.TREEVIEW_render_do_Create(timestamp);
                    break;
                case TreeView_RenderKind.Batch:
                    this.TREEVIEW_render_do_Batch(timestamp);
                    break;
                case TreeView_RenderKind.Scroll:
                    this.TREEVIEW_render_do_Scroll(timestamp);
                    break;
                case TreeView_RenderKind.Scroll_PullDataDrawResult:
                    this.TREEVIEW_render_do_Scroll_PullDataDrawResult();
                    break;
                case TreeView_RenderKind.SetItems:
                    this.TREEVIEW_render_do_SetItems();
                    break;
                case TreeView_RenderKind.FullReset:
                    this.TREEVIEW_render_do_FullReset(timestamp);
                    break;
                case TreeView_RenderKind.Resize:
                    this.TREEVIEW_render_do_Resize(timestamp);
                    break;
            }
        }
        
        this.TREEVIEW_isRenderPending = false; // Reset the paint lock
    };

    /**
     * TODO: Many of these suffer from two invocations sitting in the render queue with something between them so they didn't coallesce then the parameters
     * of the second are used for the first.
     */
    TREEVIEW_render_do_SetItems() {

        this.itemListElement.innerHTML = '';
        this.virtualizationElement.style.height = 1 + 'px';
        this.state_cursor_setIndex(0);
        
        
        this.itemHeightNumber = this.SET_ITEMS_itemHeightNumber;
        this.itemHeightStyleAttributeValueString = this.SET_ITEMS_itemHeightStyleAttributeValueString;

        this.cursorElement.style.height = this.itemHeightStyleAttributeValueString;
        this.itemHeightTotal = this.getTotalCount() * this.itemHeightNumber;
        this.virtualizationElement.style.height = this.itemHeightTotal + 'px';
        this.boundingClientRect_measurementsAreValid = false;
    }

    /**
     * @param {*} director interface TreeViewDirectory { director.drawItem(divItem, indexItem), director.onkeydown(this.TREEVIEW_ArrayFrom_itemListElement_children[relativeIndex], this.cursorIndex, this.items[this.cursorIndex]); }
     * @param {*} itemHeightNumber '50'; cursorTop = currentIndex * itemHeightNumber;
     * @param {*} itemHeightStyleAttributeValueString '50px'; div.style.height = itemHeightStyleAttributeValueString;
     */
    setItems(itemHeightNumber: number, itemHeightStyleAttributeValueString: string) {

        this.SET_ITEMS_itemHeightNumber = itemHeightNumber;
        this.SET_ITEMS_itemHeightStyleAttributeValueString = itemHeightStyleAttributeValueString;
        this.TREEVIEW_render_request(TreeView_RenderKind.SetItems);
    }

    TREEVIEW_render_do_Create(timestamp: number) {
        if (this.rootElement.parentElement) {
            // It is the case that I invoke 'draw_create_request' when creating the tree view for the first time.
            // But I also do this when I re-open the os input file dialog and pick either a separate or the same folder.
            // In this scenario having this invoke a "fullReset" is necessary otherwise nothing appears in the treeview.
            //
            // TODO: but, perhaps this is best left to the consumer of the TreeViewComponent to invoke themselves...
            // ...in such a scenario. Until further decision is made I'll have the invocation here.
            this.TREEVIEW_render_do_FullReset(timestamp);
            // TODO: Should there be a return here?...
            // ...more accurately the concern is 'TREEVIEW_draw_create_request_parentElement.insertBefore'
            // and 'this.draw_addEvents()'
            // |
            // Should those be in an else?
            // It reads as though you'd be inserting the element twice, which internally you cannot
            // have an HTML node with two parents so this probably doesn't duplicate the UI, but instead just wastes CPU.
            // |
            // The 'this.draw_addEvents();'... can you subscribe twice?
        }
        this.TREEVIEW_draw_create_request_parentElement.insertBefore(this.rootElement, this.TREEVIEW_draw_create_request_insertBeforeThisChild);
        this.draw_addEvents();

        this.rootElement.style.width = '';
        this.rootElement.style.height = '';
        this.rootElement.style.contain = '';

        this.measureBaseElement();

        this.TREEVIEW_render_do_Scroll(timestamp);
    }

    /**
     * if (this.rootElement.parentElement) { this.draw_render_fullReset_request(); return; }
     * Because the "list" is already drawn somewhere and 'draw_delete()' needs to be invoked prior to drawing at a different location.
     * 
     * @param {HTMLElement} parentElement 
     * @param {*} insertBeforeThisChild (if falsey, the list UI is appended to the parent element)
     */
    draw_create_request(parentElement: HTMLElement, insertBeforeThisChild: HTMLElement | null | undefined) {
        this.TREEVIEW_draw_create_request_parentElement = parentElement;
        this.TREEVIEW_draw_create_request_insertBeforeThisChild = insertBeforeThisChild;
        this.TREEVIEW_render_request(TreeView_RenderKind.Create);
    }

    TREEVIEW_render_do_Batch(timestamp: number) {
        this.drawItem_BATCH(this.start, this.length, this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen, this.caseThreeOrigin, timestamp);
    }

    /**
     * if (!this.rootElement.parentElement) return;
     * Because the "list" is not drawn, no UI needs to be removed.
     * (the purpose of this method is more-so related to unsubscribing of events and other such non-automatic actions that need to be performed)
     * 
     * @returns 
     */
    draw_delete() {
        if (!this.rootElement.parentElement) return;
        this.draw_removeEvents();
        this.boundingClientRect_measurementsAreValid = false;
        this.rootElement.parentElement.removeChild(this.rootElement);
    }

    draw_addEvents() {
        this.rootElement.addEventListener('click', this);
        this.rootElement.addEventListener('keydown', this);
        this.rootElement.addEventListener('scroll', this, { passive: true });
        this.rootElement.addEventListener('dblclick', this);
        this.rootElement.addEventListener('contextmenu', this);
        window.addEventListener('resize', this);
    }
    
    draw_removeEvents() {
        this.rootElement.removeEventListener('click', this);
        this.rootElement.removeEventListener('keydown', this);
        this.rootElement.removeEventListener('scroll', this, { passive: true });
        this.rootElement.addEventListener('dblclick', this);
        this.rootElement.addEventListener('contextmenu', this);
        window.removeEventListener('resize', this);
    }

    // The browser automatically looks for this exact method name
    handleEvent(event) {
        switch (event.type) {
            case 'click':
                this.event_click(event);
                break;
            case 'keydown':
                this.event_keydown(event);
                break;
            case 'scroll':
                this.event_scroll();
                break;
            case 'dblclick':
                this.event_dblclick(event);
                break;
            case 'contextmenu':
                this.event_contextmenu(event);
                break;
            case 'resize':
                this.event_windowResize();
                break;
        }
    }

    TREEVIEW_render_do_Scroll(timestamp: number) {
        if (this.TREEVIEW_ArrayFrom_itemListElement_children_length !== this.virtualCount) {
            this.TREEVIEW_render_do_FullReset(timestamp);
        }
        else {
            this.virtualIndex_ofScrollTop = Math.floor(this.lastReadNumber_scrollTop / this.itemHeightNumber);

            if (this._ONSCROLLvirtualIndex === this.virtualIndex_ofScrollTop &&
                this._ONSCROLLvirtualCount === this.virtualCount) {
                    return;
            }

            // If I delay setting 'this._ONSCROLLvirtualIndex' then I can just use that.
            // I can't bear to do that right now though. I'm just gonna make this variable.
            let prevVli = this._ONSCROLLvirtualIndex;
            let currVli = this.virtualIndex_ofScrollTop;

            this._ONSCROLLvirtualIndex = this.virtualIndex_ofScrollTop;

            if (this._ONSCROLLvirtualCount === this.virtualCount &&
                this.TREEVIEW_ArrayFrom_itemListElement_children_length === this.virtualCount) {

                let diff = currVli - prevVli;

                let totalCount = this.getTotalCount();

                if (diff > 0 && diff < this.virtualCount) {
                    this.drawItem_BATCH(prevVli + this._ONSCROLLvirtualCount, diff, 1, undefined, timestamp);
                }
                else if (diff < 0 && (diff *= -1) < this.virtualCount) {
                    this.drawItem_BATCH(currVli, diff, 2, undefined, timestamp);
                }
                else {
                    if (diff === 0) {
                        this.scrollEndDeadline = timestamp + 300;
                    }
                    else {
                        this.drawItem_BATCH(this.virtualIndex_ofScrollTop, this.virtualCount, 3, undefined, timestamp);
                    }
                }
            }
        }
    }

    TREEVIEW_render_do_Scroll_PullDataDrawResult() {
        this.drawItem_BATCH_PullDataDrawResult();
    }

    draw_BATCH_request(start: number, length: number, onePositiveDiff_twoNegativeDiff_orThreeFullScreen: number, caseThreeOrigin: number) {
        this.start = start;
        this.length = length;
        this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen = onePositiveDiff_twoNegativeDiff_orThreeFullScreen;
        this.caseThreeOrigin = caseThreeOrigin;
        this.TREEVIEW_render_request(TreeView_RenderKind.Batch);
    }

    TREEVIEW_render_do_FullReset(timestamp: number) {
        this.ensure_boundingClientRect();

        this._ONSCROLLvirtualCount = this.virtualCount;

        this.virtualIndex_ofScrollTop = Math.floor(this.lastReadNumber_scrollTop / this.itemHeightNumber);
        this.beltIndexZero = 0;

        let totalCount = this.getTotalCount();

        if (this.itemListElement.children.length !== this.virtualCount) {
            this.itemListElement.innerHTML = '';

            // padding of 2ch (the style attribute receives the width as a pixel by using 'EXPLORER_firstSpanWidthValue' as a baseline (not quite ch))
            // TODO: this is all very inaccurate and prone to eventual rounding issues due to not monospace font.
            //
            this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = 2;
            let widthAttributeValueNumber = Math.ceil((this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING + 2/*padding*/) * EXPLORER_firstSpanWidthValue);
            // This is actually more complicated you have to track whether you go above the minimum requirement lest you add 1 character over and over in width just to keep redrawing widths.
            //if (widthAttributeValueNumber < this.lastReadNumber_offsetWidth) {
            //    widthAttributeValueNumber = this.lastReadNumber_offsetWidth;
            //}
            //this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING
            let widthAttributeValueString = widthAttributeValueNumber + 'px';
            this.cursorElement.style.width = widthAttributeValueString;

            // this is zero'd, could use change for clarity of algorithm and match patterns but focus elsewhere first
            for (let i = 0; i < this.virtualCount; i++) {
                
                let divItem = document.createElement('div');
                divItem.style.width = widthAttributeValueString;
                divItem.style.height = this.itemHeightStyleAttributeValueString;
                divItem.style.whiteSpace = 'nowrap';
                divItem.style.position = 'absolute';
                this.itemListElement.appendChild(divItem);
                let iconSpan = document.createElement('span');
                iconSpan.style.width = EXPLORER_firstSpanWidth;
                iconSpan.style.display = 'inline-block';
                // TODO: Consider what differences if any exist between the '' iconSpan having an empty height of 0 when left unset, versus if you were to set it to 1px, does this matter? It doesn't seem to impact the "horizontal" space being taken.
                divItem.appendChild(iconSpan);
                divItem.appendChild(document.createTextNode(i));
            }
            
            // TODO: check the resize logic, that it works
            if (this.pullData_array) {
                //
                // TODO: When writing this to be an abstract class the 'this.pullData_array' is believed to always be non-falsey...
                // ...specifically: "TODO: make a final decision about this and remove the if statement depending on the final decision?"
                //
                this.pullData_array = new Uint32Array(this.virtualCount);
                this.pullData_array_count = 0;
            }

            this.TREEVIEW_ArrayFrom_itemListElement_children = Array.from(this.itemListElement.children) as HTMLElement[];
            this.TREEVIEW_ArrayFrom_itemListElement_children_length = this.TREEVIEW_ArrayFrom_itemListElement_children.length;
        }

        // TODO: This if statement check is awkward because the previous if statement ought to have guaranteed this one to be true.
        if (this.itemListElement.children.length === this.virtualCount) {
            this.drawItem_BATCH(this.virtualIndex_ofScrollTop, this.virtualCount, 3, undefined, timestamp);
        }
    }

    /**
     * This actually only gets invoked if 'this.itemListElement.children.length !== this.virtualCount'...
     * ...But it is a bit more complicated if you want to involve a change to totalCount, you'd need to force the final 'else' case
     * so it is easier to just invoke this directly when you change totalCount?
     */
    draw_render_fullReset_request() {
        this.TREEVIEW_render_request(TreeView_RenderKind.FullReset);
    }

    /**
     * TODO: To detect whether the "expand/collapse icon" was clicked, the logic 'if(event.target === nodeElement.children[0])' is used...
     * ...this logic is flawed if one ever were to put an element within the span that became the target...
     * ...thus, you should consider checking the x position of the event against the x position of the nodeElement.children[0].
     * @param {*} event 
     */
    async event_click(event: MouseEvent) {
        this.ensure_boundingClientRect();

        let rY = event.clientY - this.boundingClientRect_top + this.lastReadNumber_scrollTop;
        let indexItem = Math.floor(rY / this.itemHeightNumber);
        indexItem = this.state_cursor_validateIndex(indexItem);

        // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
        // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
        // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
        // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
        let beltIndexItem = ((indexItem)) - this.virtualIndex_ofScrollTop;
        if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
        else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

        if (beltIndexItem < 0) return;
        let divItem = this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem];

        if (event.target === divItem.children[0]) {
            return this.expandCollapseIconWasClicked_async(divItem, indexItem);
        }
        else {
            this.state_cursor_setIndex(indexItem);
        }
    }

    async event_dblclick(event: MouseEvent) {
        this.ensure_boundingClientRect();

        let rY = event.clientY - this.boundingClientRect_top + this.lastReadNumber_scrollTop;
        let indexItem = Math.floor(rY / this.itemHeightNumber);
        indexItem = this.state_cursor_validateIndex(indexItem);

        // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
        // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
        // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
        // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
        let beltIndexItem = ((indexItem)) - this.virtualIndex_ofScrollTop;
        if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
        else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

        if (beltIndexItem < 0) return;
        let divItem = this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem];

        // if not clicked "chevron"
        if (event.target !== divItem.children[0]) {
            // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
            // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
            // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
            // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
            let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
            else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

            if (beltIndexItem < 0) return;
            return this.ondblclick_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex);
        }
    }

    async event_contextmenu(event: MouseEvent) {
        this.ensure_boundingClientRect();

        if (event.button === 2) {
            let rY = event.clientY - this.boundingClientRect_top + this.lastReadNumber_scrollTop;

            this.state_cursor_setIndex(this.state_cursor_validateIndex(
                Math.floor(rY / this.itemHeightNumber)));

            // TODO: you need to move this above the divItem assignment and do checks earlier... double check all other uses

            // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
            // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
            // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
            // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
            let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
            else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

            if (beltIndexItem < 0) return;
            return this.oncontextmenu_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex, event, beltIndexItem);
        } else {
            if (this.cursorIndex >= this.getTotalCount()) {
                return;
            }

            this.state_cursor_setIndex(this.state_cursor_validateIndex(
                this.cursorIndex));

            // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
            // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
            // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
            // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
            let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
            else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

            if (beltIndexItem < 0) return;

            // TODO: Handle context menu with keyboard when active node is out of view
            return this.oncontextmenu_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex, event, beltIndexItem);
        }
    }

    async event_keydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (event.ctrlKey) {
                    this.rootElement.scrollBy(0, this.itemHeightNumber);
                }
                else {
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex + 1));
                }
                return;
            case 'ArrowUp':
                event.preventDefault();
                if (event.ctrlKey) {
                    this.rootElement.scrollBy(0, -1 * this.itemHeightNumber);
                }
                else {
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex - 1));
                }
                return;
            case 'ArrowRight':
                if (!event.ctrlKey) { // If holding ctrl, don't preventDefault so the user can scroll horizontally?
                    event.preventDefault();
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex));

                    // TODO: 'ArrowRight' when the cursor is on a valid item but isn't part of the virtualization result.

                    // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
                    // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
                    // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
                    // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
                    let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                    if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
                    else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

                    if (beltIndexItem < 0) return;
                    return this.arrowRight_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex);
                }
                return;
            case 'ArrowLeft':
            	if (!event.ctrlKey) { // If holding ctrl, don't preventDefault so the user can scroll horizontally?
                    event.preventDefault();
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex));
                    
                    // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
                    // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
                    // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
                    // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
                    let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                    if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
                    else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

                    if (beltIndexItem < 0) return;
                    return this.arrowLeft_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex);
                }
            	return;
            case ' ':
            case 'Enter':
                event.preventDefault();
                this.state_cursor_setIndex(this.state_cursor_validateIndex(
                    this.cursorIndex));
                
                // TODO: This is an awkward explicit inlining of 'this.indexItemTo_beltIndexItem'...
                // ...the initial declaration of 'let beltIndexLine' is assigned what I refer to as the "virtualIndex"
                // but 'beltIndexLine' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
                // for the calculation. So by storing the 'virtualIndex' in 'beltIndexLine' at the start I skip a variable declaration.
                let beltIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                if (beltIndexItem >= this.TREEVIEW_ArrayFrom_itemListElement_children_length || beltIndexItem < 0) beltIndexItem = -1;
                else beltIndexItem = (beltIndexItem + this.beltIndexZero) % this.virtualCount;

                if (beltIndexItem < 0) return;
                return this.onkeydown_async(this.TREEVIEW_ArrayFrom_itemListElement_children[beltIndexItem], this.cursorIndex, event.key);
        }
    }

    TREEVIEW_render_do_Resize(timestamp: number) {
        this.rootElement.style.width = '';
        this.rootElement.style.height = '';
        this.rootElement.style.contain = '';

        this.measureBaseElement();

        this.boundingClientRect_measurementsAreValid = false;
        this.ensure_boundingClientRect();
        this.TREEVIEW_render_do_FullReset(timestamp);
    }

    /**
     * TODO: intra-app resizes or movements will also invoke this; i.e.: if a list is shown in a dialog and the dialog is resized or moved.
     */
    event_windowResize() {
        this.TREEVIEW_render_request(TreeView_RenderKind.Resize);
    }

    event_scroll() {
        this.lastReadNumber_scrollLeft = this.rootElement.scrollLeft;
        this.lastReadNumber_scrollTop = this.rootElement.scrollTop;
        this.TREEVIEW_render_request(TreeView_RenderKind.Scroll);
    }

    ensure_boundingClientRect() {
        if (!this.boundingClientRect_measurementsAreValid) {
            let rect = this.rootElement.getBoundingClientRect();;
            this.boundingClientRect_height = rect.height;
            this.boundingClientRect_top = rect.top;
            this.boundingClientRect_measurementsAreValid = true;
            this.virtualCount = Math.ceil(this.rootElement.offsetHeight / this.itemHeightNumber);
        }
    }

    TREEVIEW_render_do_Cursor() {
        // Determine the number without modifying styles so you can use this variable to determine the need to scroll into view without synchronous layout.
        this.cursorTranslateYNumber = this.cursorIndex * this.itemHeightNumber;

        // Preferably this hasn't changed thus the function immediately just returns.
        this.ensure_boundingClientRect();
        
        // If no UI modifications were made prior that are still pending this might avoid a synchronous layout.
        // TODO: If you touch the transform style first... I don't know what would happen it is a GPU related style... so I'm unsure.
        //
        if (this.cursorTranslateYNumber + (2 * this.itemHeightNumber) > this.lastReadNumber_scrollTop + this.boundingClientRect_height) {
            let currentBottom = this.lastReadNumber_scrollTop + this.boundingClientRect_height;
            let changeToMakeBottomTouch = this.cursorTranslateYNumber - currentBottom;
            let entireValueToScrollBy = changeToMakeBottomTouch + (2 * this.itemHeightNumber);
            this.rootElement.scrollBy(0, entireValueToScrollBy);
        }
        else if (this.cursorTranslateYNumber < this.lastReadNumber_scrollTop) {
            this.rootElement.scrollBy(0, this.cursorTranslateYNumber - this.lastReadNumber_scrollTop);
        }

        // transform last for optimal state flagging of the modified DOM element
        this.cursorElement.style.transform = `translateY(${this.cursorTranslateYNumber}px)`;
    }

    /**
     * if (this.cursorIndex === index) return;
     * 
     * @param {*} index 
     */
    state_cursor_setIndex(index: number) {
        if (this.cursorIndex === index) return;
        this.cursorIndex = index;
        this.TREEVIEW_render_request(TreeView_RenderKind.Cursor);
    }

    /**
     * if (this.cursorIndex === index) return;
     * 
     * @param {*} indexItem 
     */
    state_cursor_validateIndex(indexItem: number) {
        if (indexItem >= this.getTotalCount()) {
            indexItem = this.getTotalCount() - 1;
        }
        if (indexItem < 0) {
            indexItem = 0;
        }
        return indexItem;
    }

    /**
     * This logic according to what I understand Google AI to be saying, is very bad (I gave it the version that the Editor has).
     * 
     * I don't fully agree with the AI on this for a few reasons.
     * And I'm not entirely adverse to removing this logic.
     * But a main reason for why I don't agree with the AI is that I don't fully understand things.
     * And the only way for me to fully understand things is to mess around with this a bit more and see what happens.
     * So I can hopefully glean some insight and better understand what the AI is saying.
     * 
     * I want to list out my points for doing this, I have a limited amount of energy each day
     * and I have a lot to do involving measuring the longest line of text and setting all divs to that width
     * so I might find it in me to list my point of view today.
     * Maybe if I don't find it in me today I will tomorrow etc...
     * 
     * My point of view:
     * - I think I agree that making the width and height a whole number is pointless.
     * - And that getBoundingClientRect is more accurate so I should be using that, since I'd incur layout cost regardless if it was needed when accessing any offset... properties.
     * - But, I have absolute positioned elements and A LOT of them.
     * - By marking the base element as "contain = 'layout'" I believe I am explicitly telling the browser to ignore all of my "z axis layers" or layers made by using position absolute.
     *   i.e.: that they will NEVER impact the UI that exists outside of the base element.
     *   and that this is beneficial.
     * - As well by making the size explicitly defined I am permitting the use of "contain = 'layout'" without that you wouldn't have a width or height of the base element I believe.
     *   because otherwise the children could cause a change in width and impact the surrounding UI which you just said explicitly won't happen.
     * - The final statements that read the offsetWidth and height after having set them is a guaranteed synchronous layout,
     *   but this only happens oninit or when resizing, vs the constant changes happening while I scroll explicitly stating that nothing else will be impacted each event.
     * 
     * And I am very open to the idea that I'm wrong.
     * But I don't understand the AI's point of view and I'm not going to blindly copy what it says.
     * I am instead just aware that this might be wrong and I'm looking for some indications to learn from and observe.
     * 
     * I read the property back just incase some weird interaction (perhaps DPI?) causes the number I set to not actually be the end result number that is used
     * for the attribute value.
     */
    measureBaseElement() {
        this.lastReadNumber_offsetWidth = Math.floor(this.rootElement.offsetWidth);
        this.lastReadNumber_offsetHeight = Math.floor(this.rootElement.offsetHeight);
        
        this.rootElement.style.width = this.lastReadNumber_offsetWidth + 'px';
        this.rootElement.style.height = this.lastReadNumber_offsetHeight + 'px';

        this.rootElement.style.contain = 'layout';

        this.lastReadNumber_offsetWidth = this.rootElement.offsetWidth;
        this.lastReadNumber_offsetHeight = this.rootElement.offsetHeight;
    }

    protected abstract getTotalCount(): number;

    /** 
     * @param {number} caseThreeOrigin if left undefined or (falsey but not 0), this will default to 'this.component.beltIndexZero'
     */
    protected abstract drawItem_BATCH(start: number, length: number, onePositiveDiff_twoNegativeDiff_orThreeFullScreen: number, caseThreeOrigin: number | undefined, timestamp: number): void;

    /**
     * Not every key invokes this. 
     */
    protected abstract onkeydown_async(divItem: HTMLElement, indexItem: number, eventKey: string): Promise<void>;

    protected abstract arrowLeft_async(divItem: HTMLElement, indexItem: number): Promise<void>;

    protected abstract arrowRight_async(divItem: HTMLElement, indexItem: number): Promise<void>;

    protected abstract oncontextmenu_async(divItem: HTMLElement, indexItem: number, event: MouseEvent, relativeIndex: number): Promise<void>;

    protected abstract ondblclick_async(divItem: HTMLElement, indexItem: number): Promise<void>;

    protected abstract drawItem_BATCH_PullDataDrawResult(): void;

    protected abstract expandCollapseIconWasClicked_async(divItem: HTMLElement, indexItem: number): Promise<void>;
    
    /*
    TODO: The TreeView after you resize it, you can continually scroll down and it keeps replacing more and more '~' lines
          even if you've scrolled through everything already.
          This is probably some kind of rounding error?
          It porbably happens regardless of whether you resized
          and more-so that you just happen to have hit the perfect height for it to happen?
    */
}

class TreeViewNodeList {
    data_literal;
    capacity_literal;

    capacity_abstract;
    count_abstract = 0;

    // Storing the nodeKind as an int32 isn't the most ideal thing in the world.
    // Previously the ints were being grouped via a class instance.
    // So this still ought to be better than what was done previously.
    field_count = 3;
    // this.nodeKind = nodeKind;
    // this.key = key;
    // this.depth = depth;

    nodeKind_offset = 0;
    key_offset = 1;
    depth_offset = 2;

    constructor(initialCapacity_abstract: number) {
        let temp_capacity_literal = initialCapacity_abstract * this.field_count;

        this.data_literal = new Uint32Array(temp_capacity_literal);
        this.capacity_abstract = initialCapacity_abstract;
        this.capacity_literal = temp_capacity_literal;

        this.count_abstract = 0;
    }

    /**
     * Does not clear the information, only sets 'this.count' to '0'.
     */
    clear() {
        this.count_abstract = 0;
    }

    /**
     * TODO: Rename all of these because you're actually reading the data into a global variable and this name replicates an API that returns a value so it is confusing.
     * 
     * @param {TreeViewNode} trackedSyntax a place to read the data into, since it is stored as just int32 data (not the class)
     * @returns {TrackedSyntax}
     */
    getElementAt(index_abstract: number) {
        let index_literal = index_abstract * this.field_count;

        TreeView_pooledNode_nodeKind = this.data_literal[index_literal + this.nodeKind_offset] as TreeView_NodeKind;
        // TODO: A Safer Alternative (Runtime Validation) 'if (rawValue in TreeView_NodeKind)'?

        TreeView_pooledNode_key = this.data_literal[index_literal + this.key_offset];
        TreeView_pooledNode_depth = this.data_literal[index_literal + this.depth_offset];
    }

    getKey(index_abstract: number) {
        return this.data_literal[(index_abstract * this.field_count) + this.key_offset];
    }

    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} key 
     */
    setKey(index_abstract: number, key) {
        this.data_literal[(index_abstract * this.field_count) + this.key_offset] = key;
    }
    
    getDepth(index_abstract: number) {
        return this.data_literal[(index_abstract * this.field_count) + this.depth_offset];
    }
    
    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} depth 
     */
    setDepth(index_abstract: number, depth: number) {
        this.data_literal[(index_abstract * this.field_count) + this.depth_offset] = depth;
    }
    
    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} nodeKind 
     */
    setNodeKind(index_abstract: number, nodeKind) {
        this.data_literal[(index_abstract * this.field_count) + this.nodeKind_offset] = nodeKind;
    }

    insert(index_abstract: number, nodeKind, key, depth: number) {
        this.ensureCapacityForInsertion(index_abstract, 1);

        let index_literal = index_abstract * this.field_count;

        if (index_abstract !== this.count_abstract) {
            this.copyTo(this.data_literal, index_abstract, this.data_literal, index_abstract + 1, this.count_abstract - index_abstract);
        }

        this.data_literal[index_literal + this.nodeKind_offset] = nodeKind;
        this.data_literal[index_literal + this.key_offset] = key;
        this.data_literal[index_literal + this.depth_offset] = depth;

        this.count_abstract++;
    }

    /**
     * Does not clear trailing information.
     * 
     * count === 0 immediately returns
     */
    removeAt(index_abstract: number, count_abstract: number) {

        if (index_abstract > this.count_abstract) { throw new Error('removeAt(...): index_abstract > this.count_abstract'); }
        if (index_abstract + count_abstract > this.count_abstract) { throw new Error('removeAt(...): index_abstract + count_abstract > this.count_abstract'); }
        if (count_abstract === 0) { return; }

        if (index_abstract + count_abstract === this.count_abstract) {
            let shiftableCount_abstract = this.count_abstract - (index_abstract + count_abstract);
            if (shiftableCount_abstract > 0) {
                this.copyTo(
                    this.data_literal,
                    index_abstract + count_abstract,
                    this.data_literal,
                    index_abstract,
                    shiftableCount_abstract);
            }
        }
        else {
            this.copyTo(
                this.data_literal,
                index_abstract + count_abstract,
                this.data_literal,
                index_abstract,
                this.count_abstract - (index_abstract + count_abstract));
        }

        this.count_abstract -= count_abstract;
    }

    /**
     * - If the size asked for cannot be allocated, an exception will be thrown. (presumably the wording "thrown by the runtime" is involved.)
     * - JavaScript numbers do not wrap around to negative values when the value is very large.
     *       They instead approach infinity and lose precision.
     *       - There still is a check for whether the new, expected to be larger, capacity is smaller for whatever reason.
     *         Since this ought to be a negligible check for this method to perform.
     *         And failure to catch that case if it happens is an infinite loop.
     */
    ensureCapacityForInsertion(index_abstract: number, count_abstract: number) {
        let capacityPrevious_abstract = this.capacity_abstract;
        while (true) {
            if (this.count_abstract + count_abstract > this.capacity_abstract) {
                this.doubleCapacity();
            }
            else if (index_abstract >= this.capacity_abstract) {
                this.doubleCapacity();
            }
            else {
                break;
            }

            if (this.capacity_abstract === capacityPrevious_abstract) {
                break;
            }
            if (this.capacity_abstract < capacityPrevious_abstract) {
                throw new Error('ensureCapacityForInsertion(...): this.capacity_abstract < capacityPrevious_abstract');
            }

            capacityPrevious_abstract = this.capacity_abstract;
        }
    }

    doubleCapacity() {
        let capacityNew_literal = this.capacity_literal * 2;
        let dataNew_literal = new Uint32Array(capacityNew_literal);
        this.copyTo(this.data_literal, 0, dataNew_literal, 0, this.count_abstract);
        this.data_literal = dataNew_literal;
        this.capacity_literal = capacityNew_literal;
        this.capacity_abstract *= 2;
    }

    /**
     * inclusive/exclusive
     */
    copyTo(dataSource_literal, sourceStart_abstract: number, dataDestination_literal, destinationStart_abstract: number, length_abstract: number) {

        if (dataSource_literal === dataDestination_literal) {
            if (dataSource_literal !== this.data_literal) {
                throw new Error('dataSource_literal === dataDestination_literal ; but dataSource_literal !== this.data_literal');
            }

            // TODO: use 'copyWithin' method here and other such locations

            let distance_abstract = destinationStart_abstract - sourceStart_abstract;

            if (distance_abstract > 0) {
                for (var i_abstract = sourceStart_abstract + length_abstract - 1; i_abstract >= sourceStart_abstract; i_abstract--) {
                    let iplusd_abstract = i_abstract + distance_abstract;
                    let iplusd_literal = iplusd_abstract * this.field_count;
                    let i_literal = i_abstract * this.field_count;
                    this.data_literal[iplusd_literal + this.nodeKind_offset] = this.data_literal[i_literal + this.nodeKind_offset];
                    this.data_literal[iplusd_literal + this.key_offset] = this.data_literal[i_literal + this.key_offset];
                    this.data_literal[iplusd_literal + this.depth_offset] = this.data_literal[i_literal + this.depth_offset];
                }
            }
            else {
                for (var i_abstract = destinationStart_abstract; i_abstract < this.count_abstract; i_abstract++) {
                    let iminusd_abstract = i_abstract - distance_abstract;
                    let iminusd_literal = iminusd_abstract * this.field_count;
                    let i_literal = i_abstract * this.field_count;
                    this.data_literal[i_literal + this.nodeKind_offset] = this.data_literal[iminusd_literal + this.nodeKind_offset];
                    this.data_literal[i_literal + this.key_offset] = this.data_literal[iminusd_literal + this.key_offset];
                    this.data_literal[i_literal + this.depth_offset] = this.data_literal[iminusd_literal + this.depth_offset];
                }
            }
        }
        else {
            // TODO: use 'set' method here and other such locations
            for (var i_abstract = 0; i_abstract < length_abstract; i_abstract++) {
                let dSplusi_abstract = destinationStart_abstract + i_abstract;
                let dSplusi_literal = dSplusi_abstract * this.field_count;
                let sSplusi_abstract = sourceStart_abstract + i_abstract;
                let sSplusi_literal = sSplusi_abstract * this.field_count;
                dataDestination_literal[dSplusi_literal + this.nodeKind_offset] = dataSource_literal[sSplusi_literal + this.nodeKind_offset];
                dataDestination_literal[dSplusi_literal + this.key_offset] = dataSource_literal[sSplusi_literal + this.key_offset];
                dataDestination_literal[dSplusi_literal + this.depth_offset] = dataSource_literal[sSplusi_literal + this.depth_offset];
            }
        }
    }
}
