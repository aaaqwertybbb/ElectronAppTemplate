let TOOLTIP_exists = false;

let TOOLTIP_pending_textContent: string | null = null;

export const Tooltip_RenderKind = {
    None: 0,
    Show: 1,
    Hide: 2,
} as const;
// Derive the type union from the object values
export type Tooltip_RenderKind = typeof Tooltip_RenderKind[keyof typeof Tooltip_RenderKind];

let TOOLTIP_pending_renderKind: Tooltip_RenderKind = Tooltip_RenderKind.None;
let TOOLTIP_isRenderPending = false;

function TOOLTIP_render_request(renderKind: Tooltip_RenderKind) {
    TOOLTIP_pending_renderKind = renderKind;
    
    if (!TOOLTIP_isRenderPending) {
        TOOLTIP_isRenderPending = true;
        requestAnimationFrame(TOOLTIP_renderDo);
    }
}

function TOOLTIP_renderDo() {
    let renderKind = TOOLTIP_pending_renderKind;
    TOOLTIP_pending_renderKind = Tooltip_RenderKind.None;

    if (renderKind === Tooltip_RenderKind.Show) {
        TOOLTIP_render_do_show();
    }
    else if (renderKind === Tooltip_RenderKind.Hide) {
        TOOLTIP_render_do_hide();
    }
    else {
        throw new Error();
    }
    
    TOOLTIP_isRenderPending = false; // Reset the paint lock
};

function TOOLTIP_render_do_show() {
    let tooltipElement;

    if (TOOLTIP_exists) {
        tooltipElement = document.getElementById('TOOLTIP');
        // This is why I worry about doing a bool check in the other UIs
        // I worry about the state getting corrupted somehow.
        //
        // And then if it is truly meaningful from an optimization standpoint such as the scrolling of the editor
        // I take on the state corruption risk, otherwise I just defensively handle it.
        if (!tooltipElement) {
            TOOLTIP_exists = false;
            TOOLTIP_render_do_show();
            return;
        }
    }
    else {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'TOOLTIP';
        tooltipElement.style.left = '0px';
        tooltipElement.style.top = '0px';
        document.body.appendChild(tooltipElement);
    }
    
    // This was quickest first way of writing things that came to my mind.
    // I don't like it cause you're appending the child, then setting textContent
    // but it is sufficient for the first version.
    tooltipElement.textContent = TOOLTIP_pending_textContent;
    TOOLTIP_pending_textContent = null;

    TOOLTIP_exists = true;
}

export function TOOLTIP_show(textContent: string) {
    TOOLTIP_pending_textContent = textContent;
    TOOLTIP_render_request(Tooltip_RenderKind.Show);
}

function TOOLTIP_render_do_hide() {
    const tooltip = document.getElementById('TOOLTIP');
    if (tooltip) {
        tooltip.remove();
    }

    TOOLTIP_exists = false;
}

export function TOOLTIP_hide() {
    TOOLTIP_pending_textContent = null;
    TOOLTIP_render_request(Tooltip_RenderKind.Hide);
}
