/**
* Author: Ryan A. Kueter
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
class RTBlazorfied {
    constructor(id, shadow_id, toolbar_id, styles, dotNetObjectReference) {
        this.id = id;
        this.shadow_id = shadow_id;
        this.toolbar_id = toolbar_id;
        this.styles = styles;
        this.dotNetObjectReference = dotNetObjectReference;
        this.init();
    }
    init = () => {
        /* Give the shadow tree needed resources */
        this.hydrateShadowTree();

        /* Initialize utilities class */
        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);

        /* Initialize a Node Manager */
        this.NodeManager = new RTBlazorfiedNodeManager(this.shadowRoot, this.content, this.Utilities);

        /* Initialize Action Options (e.g., cut, copy, paste) */
        this.ActionOptions = new RTBlazorfiedActionOptions(this.shadowRoot, this.content, this.Utilities);

        /* Initialize List Provider */
        this.ListProvider = new RTBlazorfiedListProvider(this.shadowRoot, this.content, this.Utilities, this.NodeManager);

        /* Initialize the color pickers */
        this.ColorPickers = {};
        const colorModal = "rich-text-box-text-color-modal";
        const bgColorModal = "rich-text-box-text-bg-color-modal";
        this.ColorPickers[colorModal] = new RTBlazorfiedColorDialog(this.shadowRoot, this.content, colorModal, this.NodeManager, this.Utilities);
        this.ColorPickers[bgColorModal] = new RTBlazorfiedColorDialog(this.shadowRoot, this.content, bgColorModal, this.NodeManager, this.Utilities);

        /* Initialize the Link Dialog */
        this.LinkDialog = new RTBlazorfiedLinkDialog(this.shadowRoot, this.content, this.Utilities);

        /* Initialize Image Dialog */
        this.ImageDialog = new RTBlazorfiedImageDialog(this.shadowRoot, this.content, this.Utilities);

        /* Initialize Upload Image Dialog - removed to prevent abuse. */
        this.UploadImageDialog = new RTBlazorfiedUploadImageDialog(this.shadowRoot, this.content, this.Utilities); 

        /* Initialize Blockquote Dialog */
        this.BlockQuoteDialog = new RTBlazorfiedBlockQuoteDialog(this.shadowRoot, this.content, this.Utilities);

        /* Initialize Code Block Dialog */
        this.CodeBlockDialog = new RTBlazorfiedCodeBlockDialog(this.shadowRoot, this.content, this.Utilities);

        /* Initialize the Media Dialog */
        this.MediaDialog = new RTBlazorfiedMediaDialog(this.shadowRoot, this.content, this.Utilities);

        /* Initialize the Video Dialog */
        this.VideoDialog = new RTBlazorfiedVideoDialog(this.shadowRoot, this.content, this.Utilities);

        /* Table Dialog */
        this.TableDialog = new RTBlazorfiedTableDialog(this.shadowRoot, this.content, this.Utilities);

        /* Create a state manager */
        this.StateManager = new RTBlazorfiedStateManager(this.content, this.source, this.Utilities, this.dotNetObjectReference, this.contentContainer);

        /* Add the event listeners */
        this.addEventListeners();
    }
    hydrateShadowTree = () => {
        /* Load elements into the shadow DOM */
        const isolatedContainer = document.getElementById(this.shadow_id);
        this.shadowRoot = isolatedContainer.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = this.styles;
        this.shadowRoot.appendChild(style);

        this.contentContainer = document.createElement('div');
        this.contentContainer.classList.add('rich-text-box-content-container', 'rich-text-box-scroll');

        this.container = document.createElement('div');
        this.container.classList.add('rich-text-box-container', 'rich-text-box-scroll');

        /* The main content that is referenced throughout */
        this.content = document.createElement('div');
        this.content.setAttribute('id', this.id);
        this.content.setAttribute('class', 'rich-text-box-content');
        this.content.setAttribute('contenteditable', 'true');
        this.content.setAttribute('role', 'textbox');
        this.content.setAttribute('aria-multiline', 'true');
        this.content.setAttribute('aria-label', 'Rich text editor');
        this.content.setAttribute('aria-readonly', 'false');
        this.content.style.display = "block";

        this.source = document.createElement('textarea');
        this.source.setAttribute('id', 'rich-text-box-source');
        this.source.setAttribute('aria-label', 'HTML source');
        this.source.classList.add('rich-text-box-source', 'rich-text-box-scroll');
        this.source.style.display = "none";
        this.source.spellcheck = false;

        /* Create the fading bar */
        const fadingBar = document.createElement('div');
        fadingBar.setAttribute('class', 'rich-text-box-message-bar rich-text-box-message-hidden');
        fadingBar.setAttribute('id', 'rich-text-box-message-bar');

        const message = document.createElement('span');
        message.setAttribute('class', 'rich-text-box-message');

        const closeButton = document.createElement('button');
        closeButton.setAttribute('class', 'rich-text-box-message-close-button');
        closeButton.textContent = '×';
        closeButton.onclick = () => {
            this.Utilities.closeFadingBar();
        };

        fadingBar.appendChild(message);
        fadingBar.appendChild(closeButton);

        /* Status bar (word / char count) */
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'rtb-status-bar';
        this.statusBar.setAttribute('role', 'status');
        this.statusBar.setAttribute('aria-live', 'polite');
        this.statusBar.setAttribute('aria-atomic', 'true');
        this.statusBar.id = 'rich-text-box-status-bar';
        this.statusBar.textContent = '0 words · 0 characters';

        /* Assemble everything into the container */
        const toolbar = document.getElementById(this.toolbar_id);
        this.container.appendChild(toolbar);

        //contentContainer.appendChild(fadingBar);
        this.contentContainer.appendChild(this.content);
        this.contentContainer.appendChild(this.source);
        this.container.appendChild(fadingBar);
        this.container.appendChild(this.contentContainer);
        this.container.appendChild(this.statusBar);

        this.shadowRoot.appendChild(this.container);
    }
    addEventListeners = () => {
        /* Listen for selection change event to select buttons */
        document.addEventListener('selectionchange', (event) => {
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                this.clearSettings(selection.anchorNode);
            }
        });

        /* Prevent some clicks */
        this.content.addEventListener('click', (event) => {
            /* Prevent the default link click */
            if (event.target.tagName === 'A') {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        // Capture-phase click: intercept single clicks on <video> / <source>
        // before the browser routes them to the media controls. Places a
        // collapsed caret immediately after the <video> element so the user
        // can use toolbar alignment and other block operations on the video.
        this.content.addEventListener('click', (event) => {
            const tag = event.target.tagName;
            if (tag === 'VIDEO' || tag === 'SOURCE') {
                event.preventDefault();
                const videoEl = tag === 'SOURCE'
                    ? event.target.closest('video')
                    : event.target;
                if (videoEl && videoEl.parentNode === this.content) {
                    // Ensure there is a paragraph after the video to land in.
                    if (!videoEl.nextSibling) {
                        const p = document.createElement('p');
                        p.appendChild(document.createElement('br'));
                        this.content.insertBefore(p, null);
                    }
                    const after = videoEl.nextSibling;
                    const sel = window.getSelection();
                    if (sel && after) {
                        const range = document.createRange();
                        const target = after.firstChild ?? after;
                        range.setStart(target, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
        }, true);

        // Capture-phase listener: runs before the event reaches <video> or
        // <source> so preventDefault() blocks the browser's native double-click
        // behavior (play toggle, fullscreen) before those handlers ever fire.
        this.content.addEventListener('dblclick', (event) => {
            const tag = event.target.tagName;
            if (tag === 'VIDEO' || tag === 'SOURCE') {
                event.preventDefault();
            }
        }, true);

        this.content.addEventListener('dblclick', (event) => {
            switch (event.target.tagName) {
                case 'A':
                    event.preventDefault();
                    this.openLinkDialog();
                    break;
                case 'IMG':
                    event.preventDefault();

                    /* Select the target if necessary */
                    const selection = this.Utilities.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(event.target);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    /* Open the dialog */
                    if (!event.target.src.startsWith('data')) {
                        this.openImageDialog();
                    }
                    else {
                        this.uploadImageDialog();
                    }
                    break;
                case 'VIDEO':
                case 'SOURCE': {
                    event.preventDefault();
                    /* Resolve to the <video> element regardless of whether the
                       user clicked the video itself or an inner <source> element */
                    const videoTarget = event.target.tagName === 'SOURCE'
                        ? event.target.closest('video')
                        : event.target;
                    if (videoTarget) {
                        /* Select the node so the toolbar highlights correctly */
                        const vSel = this.Utilities.getSelection();
                        const vRange = document.createRange();
                        vRange.selectNode(videoTarget);
                        vSel.removeAllRanges();
                        vSel.addRange(vRange);
                        /* Open the dialog pre-populated with this element's attributes */
                        this.openVideoDialogForElement(videoTarget);
                    } else {
                        this.openVideoDialog();
                    }
                    break;
                }
                default:
                    break;
            }
        });

        this.content.addEventListener('input', (event) => {
            this.updateWordCount();

            /* Handles a bug in the contenteditable that automatically
            inserts a span with styles */
            const selection = this.Utilities.getSelection();
            const range = selection.getRangeAt(0);
            const startContainer = range.startContainer;

            if (startContainer.nodeType === Node.TEXT_NODE && startContainer.parentNode.tagName === 'SPAN') {
                const span = startContainer.parentNode;
                const element = span.parentNode;

                /* Currently this is only applied to format elements. */
                if (this.NodeManager.isFormatElement(element)) {

                    /* Unwrap the span */
                    while (span.firstChild) {
                        element.insertBefore(span.firstChild, span);
                    }
                    element.removeChild(span);

                    /* Move the cursor to the beginning of the line */
                    const newRange = document.createRange();
                    newRange.setStart(element.firstChild, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
        });

        /* Shortcut keys */
        this.content.addEventListener('keydown', (event) => {
            this.keyEvents(event);
        });
        
        this.source.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                if (this.EditMode === true) {
                    this.getHtml();
                }
                else {
                    this.getCode();
                }
            }
            if (event.ctrlKey && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                this.openPreview();
            }
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                this.saveHtml();
            }
            if (event.ctrlKey && !event.shiftKey && event.key === '\\') {
                event.preventDefault();
                this.toggleStatusBar();
            }
        });

        /* Prevent the dropdowns from causing the text box from losing focus. */
        const dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach((dropdown) => {
            dropdown.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });
        });
    }
    /* History */
    goBack = () => {
        this.StateManager.goBack();
        this.NodeManager.refreshUI();
        this.updateWordCount();
    };
    goForward = () => {
        this.StateManager.goForward();
        this.NodeManager.refreshUI();
        this.updateWordCount();
    };

    clearSettings = (node) => {
        this.fontSize = undefined;

        /* Select the buttons */
        this.NodeManager.selectButtons(node);
    }
    /* Shortcuts */
    keyEvents = (event) => {
        /* Create an element if one doesn't alreay exist */
        this.NodeManager.createDefaultElement();
        if (this.EditMode === false) {
            if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
            }
            if (event.ctrlKey && event.key === 'y') {
                event.preventDefault();
            }
            return;
        }
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            this.bold();
        }
        if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            this.italic();
        }
        if (event.ctrlKey && event.key === 'u') {
            event.preventDefault();
            this.underline();
        }
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            this.strikethrough();
        }
        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            this.copy();
        }
        if (event.ctrlKey && event.key === 'x') {
            event.preventDefault();
            this.cut();
        }
        if (event.ctrlKey && event.key === 'v') {
            event.preventDefault();
            this.paste();
        }
        if (event.key === 'Delete' || event.keyCode === 46) {
            /* Only do this is something is selected */

            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (selection.toString().length > 0) {
                    event.preventDefault();
                    this.delete();
                }
            }
        }
        if (event.ctrlKey && event.key === '=') {
            event.preventDefault();
            this.subscript();
        }
        if (event.ctrlKey && event.shiftKey && event.key === '+') {
            event.preventDefault();
            this.superscript();
        }
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            this.alignleft();
        }
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.aligncenter();
        }
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            this.alignright();
        }
        if (event.ctrlKey && event.key === 'j') {
            event.preventDefault();
            this.alignjustify();
        }
        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            this.selectall();
        }
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            this.goBack();
        }
        if (event.ctrlKey && event.key === 'y') {
            event.preventDefault();
            this.goForward();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            this.toggleView();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'S') {
            event.preventDefault();
            this.saveHtml();
        }
        if (event.ctrlKey && event.shiftKey && event.key === '&') {
            event.preventDefault();
            this.uploadImageDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'U') {
            event.preventDefault();
            this.unorderedlist();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'O') {
            event.preventDefault();
            this.orderedlist();
        }
        if (event.ctrlKey && event.shiftKey && event.key === '>') {
            event.preventDefault();
            this.changeFontSize(true);
        }
        if (event.ctrlKey && event.shiftKey && event.key === '<') {
            event.preventDefault();
            this.changeFontSize(false);
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            this.openTextColorDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'B') {
            event.preventDefault();
            this.openTextBackgroundColorDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'K') {
            event.preventDefault();
            this.openLinkDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === '*') {
            event.preventDefault();
            this.openCodeBlockDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
            event.preventDefault();
            this.openBlockQuoteDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'I') {
            event.preventDefault();
            this.openImageDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
            event.preventDefault();
            this.openMediaDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            event.preventDefault();
            this.openTableDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            this.format("none");
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
            event.preventDefault();
            this.openPreview();
        }
        if (event.ctrlKey && event.shiftKey && event.key === '!') {
            event.preventDefault();
            this.format("h1");
        }
        if (event.ctrlKey && event.shiftKey && event.key === '@') {
            event.preventDefault();
            this.format("h2");
        }
        if (event.ctrlKey && event.shiftKey && event.key === '#') {
            event.preventDefault();
            this.format("h3");
        }
        if (event.ctrlKey && event.shiftKey && event.key === '$') {
            event.preventDefault();
            this.format("h4");
        }
        if (event.ctrlKey && event.shiftKey && event.key === '%') {
            event.preventDefault();
            this.format("h5");
        }
        if (event.ctrlKey && event.shiftKey && event.key === '^') {
            event.preventDefault();
            this.format("h6");
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'V') {
            event.preventDefault();
            this.openVideoDialog();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'H') {
            event.preventDefault();
            this.insertHorizontalRule();
        }
        if (event.ctrlKey && !event.shiftKey && event.key === '\\') {
            event.preventDefault();
            this.toggleStatusBar();
        }
        if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
            this.decreaseIndent();
        }
        else {
            if (event.key === 'Tab') {
                const selection = this.Utilities.getSelection();
                if (selection !== null) {
                    if (selection.anchorNode != null && selection.anchorNode !== this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content) {
                        switch (selection.anchorNode.parentNode.nodeName) {
                            case "TD":
                                event.preventDefault();
                                this.TableDialog.tableTab();
                                break;
                            default:
                                event.preventDefault();
                                this.increaseIndent();
                                break;
                        }
                    }
                }
            }
        }

        /* Uncertain about this feature */
        /*
        if (event.key === 'Enter') {
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (selection.anchorNode != null && selection.anchorNode !== this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content) {
                    if (this.isBreakable(selection.anchorNode.parentNode.nodeName)) {
                        const range = selection.getRangeAt(0);
                        if (range.endContainer === selection.anchorNode && range.endOffset === selection.anchorNode.textContent.length) {
                            event.preventDefault();
                            this.NodeManager.insertLineBreak(selection.anchorNode.parentNode);
                        }
                    }
                }
            }
        }
        */
    }

    isBreakable = (node) => {
        let breakable = false;
        switch (node) {
            case "BLOCKQUOTE":
                breakable = true;
                break;
            case "CODE":
                breakable = true;
                break;
            case "P":
                breakable = true;
                break;
            case "SPAN":
                breakable = true;
                break;
        }
        return breakable;
    }

    changeFontSize = (increment) => {
        /* Get the current selection. */
        if (this.fontSize === undefined) {
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement);
                    this.fontSize = parseFloat(computedStyle.fontSize);
                }
            }
        }

        /* Increment the font size. */
        if (increment) {
            this.fontSize += 1;
        }
        else {
            this.fontSize -= 1;
        }
        this.NodeManager.updateNode("size", `${this.fontSize}px`);
    }
    openPreview = () => {
        this.preview = this.shadowRoot.getElementById(`${this.id}_Preview`);
        const previewWindow = this.shadowRoot.getElementById('rich-text-box-preview');

        if (this.preview && previewWindow) {
            this.loadPreviewWindow(previewWindow);
            this.addPreviewEventListeners(this.preview);
            this.preview.show();
            previewWindow.scrollTop = 0;
            previewWindow.scrollLeft = 0;
        }
    }
    addPreviewEventListeners = (dialog) => {
        dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.closePreview();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closePreview();
            }
        });
    }

    loadPreviewWindow = (previewWindow) => {
        const html = this.content.style.display === "block"
            ? (this.html() || '')
            : (this.source.value || '');

        // Use an <iframe srcdoc> for the preview content.  An iframe creates a
        // completely separate browsing context — no CSS (inherited properties,
        // custom properties, shadow-DOM cascade) from the editor or the host
        // page can reach inside it.  This is the only reliable way to render
        // the content with exclusively the user-supplied preview stylesheets.
        //
        // The shadow root on the preview container is kept solely to isolate
        // the iframe element itself from the RTB shadow CSS (e.g. the modal
        // styles that would otherwise apply to every descendant).
        const shadow = previewWindow.shadowRoot
                    || previewWindow.attachShadow({ mode: 'open' });

        while (shadow.firstChild) shadow.removeChild(shadow.firstChild);

        // Make the shadow host fill its container so the iframe can use 100%
        // dimensions.  Absolute positioning is used for cross-browser reliability.
        const hostStyle = document.createElement('style');
        hostStyle.textContent =
            ':host{display:block;position:relative;}' +
            'iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;}';
        shadow.appendChild(hostStyle);

        // Build the CSS injections for the iframe document.
        const cssLinks = (this._previewCssUrls || [])
            .filter(u => u)
            .map(u => `<link rel="stylesheet" href="${u.replace(/"/g, '%22')}">`)
            .join('');

        const inlineCss = this._previewCssText
            ? `<style>${this._previewCssText}</style>`
            : '';

        // Read content CSS variable values from the host element.  These become
        // the body-level defaults inside the iframe — the same base appearance
        // as the editor content area.  Built-in element styles (blockquote, pre,
        // table) are mirrored here too so the preview looks correct even when no
        // preview CSS files are loaded.  Preview CSS files and inline CSS are
        // injected after this block and override any of these defaults via normal
        // cascade (later rules + higher specificity win).
        const hostEl = this._rtbHostElement;
        const cs     = hostEl ? getComputedStyle(hostEl) : null;
        const getVar = (v, fb) => (cs ? cs.getPropertyValue(v).trim() : '') || fb;
        const baseStyle = [
            '<style>',
            'html,body{margin:0;}',
            'body{',
            `  padding:20px 24px;`,
            `  color:${getVar('--rtb-content-text', '#000')};`,
            `  font-size:${getVar('--rtb-content-size', '16px')};`,
            `  font-family:${getVar('--rtb-content-font', 'Arial, sans-serif')};`,
            `  background-color:${getVar('--rtb-content-bg', '#FFF')};`,
            '}',
            `blockquote{` +
                `background:${getVar('--rtb-quote-bg', '#f9f9f9')};` +
                `border-left:${getVar('--rtb-quote-border-width', '5px')} solid ${getVar('--rtb-quote-border-color', '#ccc')};` +
                `margin:1.5em 10px;padding:0.5em 10px;}`,
            `pre{` +
                `background:${getVar('--rtb-code-bg', '#f9f9f9')};` +
                `border-radius:${getVar('--rtb-code-border-radius', '10px')};` +
                `overflow-x:auto;white-space:pre-wrap;margin:1.5em 10px;padding:0.5em 10px;}`,
            'table{border-collapse:collapse;}',
            'td,th{border:1px solid #ccc;padding:4px 6px;height:25px;min-width:100px;}',
            '</style>',
        ].join('');

        const iframe = document.createElement('iframe');
        // srcdoc inherits the parent page's base URL, so relative CSS paths
        // resolve correctly (e.g. 'preview1.css' loads from the same directory).
        iframe.srcdoc = [
            '<!DOCTYPE html><html><head>',
            '<meta charset="UTF-8">',
            baseStyle,
            cssLinks,
            inlineCss,
            '</head><body>',
            html,
            '</body></html>'
        ].join('');

        shadow.appendChild(iframe);

        this.NodeManager.clearButtons();
        this.enablePreview();
    }
    closePreview = () => {
        this.disablePreview();
        this.preview.close();
        this.source.focus();
        this.content.focus();
    }
    // ---- Horizontal Rule -------------------------------------------------------

    insertHorizontalRule = () => {
        // Only insert when the editor already has focus — never steal focus.
        const sel = this.Utilities.getSelection();
        if (!sel || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        range.deleteContents();

        // Locate the block-level direct child of this.content that contains the
        // collapsed caret, so <hr> can be inserted after it at block scope.
        // <hr> is flow content and must never be nested inside phrasing elements
        // (<p>, <h1>–<h6>, <span>, <a>, etc.).

        let anchor = range.startContainer;

        // When deleteContents() collapses the caret directly inside this.content
        // (startContainer === this.content), use the child at startOffset as the
        // reference node and insert <hr> there — no further walking needed.
        if (anchor === this.content) {
            const ref = this.content.childNodes[range.startOffset] ?? null;
            const hr = document.createElement('hr');
            this.content.insertBefore(hr, ref);
            this.NodeManager.refreshUI();
            this.content.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }

        // Walk up from the caret position to find the direct child of this.content.
        // Stop immediately if we somehow stray outside the content area.
        while (anchor.parentNode && anchor.parentNode !== this.content) {
            anchor = anchor.parentNode;
            if (!this.content.contains(anchor)) {
                // Caret is outside the editable area — append as a safe fallback.
                this.content.appendChild(document.createElement('hr'));
                this.NodeManager.refreshUI();
                this.content.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        }

        const hr = document.createElement('hr');
        if (anchor && anchor !== this.content && this.content.contains(anchor)) {
            // Insert <hr> as the next sibling of the enclosing block element.
            this.content.insertBefore(hr, anchor.nextSibling);
        } else {
            // Fallback: append to the end of the content div.
            this.content.appendChild(hr);
        }
        this.NodeManager.refreshUI();
        this.content.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ---- Status bar toggle -----------------------------------------------------

    toggleStatusBar = () => {
        if (!this.statusBar) return;
        const isHidden = this.statusBar.style.display === 'none';
        const btn = this.shadowRoot.getElementById('blazing-rich-text-statusbar-button');
        if (isHidden) {
            this.statusBar.style.display = '';
            // Button appears "selected" (pressed) when the bar is now visible.
            if (btn) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
            }
            this.updateWordCount();
        } else {
            this.statusBar.style.display = 'none';
            if (btn) {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
            }
        }
    }

    // ---- Word / character count ------------------------------------------------

    updateWordCount = () => {
        if (!this.statusBar || this.statusBar.style.display === 'none') return;
        const text    = this.content.innerText || '';
        const trimmed = text.trim();
        const words   = trimmed ? trimmed.split(/\s+/).length : 0;
        const chars   = text.replace(/\n/g, '').length;
        this.statusBar.textContent =
            `${words} word${words !== 1 ? 's' : ''} · ${chars} character${chars !== 1 ? 's' : ''}`;
    }

    _syncWordCountVisibility = () => {
        const show = this._rtbHostElement?._visibility?.wordCount !== false;
        if (this.statusBar) this.statusBar.style.display = show ? '' : 'none';
    }

    // ---- Read-only mode --------------------------------------------------------

    setReadOnly = (on) => {
        this.content.contentEditable = on ? 'false' : 'true';
        this.content.setAttribute('aria-readonly', on ? 'true' : 'false');
        // Hide toolbar when read-only so users can't invoke editing commands
        const toolbar = this.shadowRoot.querySelector(`#${CSS.escape(this.toolbar_id)}`);
        if (toolbar) toolbar.style.display = on ? 'none' : '';
    }

    saveHtml = () => {
        const html = this.content.style.display === "block"
            ? (this.html() || '')
            : (this.source.value || '');
        const blob = new Blob([html], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'content.html';
        a.click();
        URL.revokeObjectURL(url);
    }
    enablePreview = () => {
        this.shadowRoot.getElementById('blazing-rich-text-source').disabled = true;
        this.disableButtons();
    }
    disablePreview = () => {
        this.shadowRoot.getElementById('blazing-rich-text-source').disabled = false;
        if (this.content.style.display === "block") {
            this.enableButtons();
        }
    }
    format = (format) => {
        this.NodeManager.formatNode(format);
        this.closeDropdown("blazing-rich-text-format-button-dropdown");
    }
    dropdown = (id) => {
        const element = this.shadowRoot.getElementById(id);
        if (element != null && element.classList.contains("rich-text-box-show")) {
            element.classList.remove("rich-text-box-show")
        }
        else {
            this.NodeManager.closeDropdowns();
            element.classList.add("rich-text-box-show")
        }
    }
    increaseIndent = () => {
        this.content.focus();
        const selection = this.Utilities.getSelection();
        const list = this.ListProvider.getList(selection.anchorNode);
        if (list) {
            this.ListProvider.increaseIndent(selection, list);
        }
        else {
            this.NodeManager.indentBlock(selection, true);
        }
    }
    decreaseIndent = () => {
        this.content.focus();

        const selection = this.Utilities.getSelection();
        const list = this.ListProvider.getList(selection.anchorNode);
        if (list) {
            this.ListProvider.decreaseIndent(list);
        }
        else {
            this.NodeManager.indentBlock(selection, false);
        }
    }
    openTextColorDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        /* Open the color picker */
        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection) {
            const colorPicker = this.ColorPickers["rich-text-box-text-color-modal"];
            this.selection = colorPicker.openColorPicker(selection, this.content);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    selectTextColor = (color) => {
        const colorPicker = this.ColorPickers["rich-text-box-text-color-modal"];
        colorPicker.selectColor(color);
    }
    insertTextColor = () => {
        const modal = "rich-text-box-text-color-modal";
        const colorPicker = this.ColorPickers[modal];
        colorPicker.insertColor();
    }
    removeTextColor = () => {
        this.currentColor = null;
        this.NodeManager.updateNode("textcolor", "None");
        this.NodeManager.updateNode("textbgcolor", "None");
    }
    openTextBackgroundColorDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        /* Open the color picker */
        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            const colorPicker = this.ColorPickers["rich-text-box-text-bg-color-modal"];
            this.selection = colorPicker.openColorPicker(selection, this.content);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }

    selectTextBackgroundColor = (color) => {
        const colorPicker = this.ColorPickers["rich-text-box-text-bg-color-modal"];
        colorPicker.selectColor(color);
    }
    insertTextBackgroundColor = () => {
        const modal = "rich-text-box-text-bg-color-modal";
        const colorPicker = this.ColorPickers[modal];
        colorPicker.insertColor();
    }
    openTableDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.TableDialog.openTableDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }

    insertTable = () => {
        this.TableDialog.insertTable();
    }
    font = (style) => {
        this.NodeManager.updateNode("font", style);
        this.closeDropdown("blazing-rich-text-font-button-dropdown");
    }
    size = (size) => {
        this.clearSettings();
        this.NodeManager.updateNode("size", size);
        this.closeDropdown("blazing-rich-text-size-button-dropdown");
    }
    bold = () => {
        this.NodeManager.updateNode("bold");
    }
    italic = () => {
        this.NodeManager.updateNode("italic");
    }
    underline = () => {
        this.NodeManager.updateNode("underline");
    };
    strikethrough = () => {
        this.NodeManager.updateNode("line-through");
    };
    subscript = () => {
        this.NodeManager.updateNode("subscript");
    };
    superscript = () => {
        this.NodeManager.updateNode("superscript");
    };
    alignleft = () => {
        this.NodeManager.updateNode("alignleft");
    };
    aligncenter = () => {
        this.NodeManager.updateNode("aligncenter");
    };
    alignright = () => {
        this.NodeManager.updateNode("alignright");
    };
    alignjustify = () => {
        this.NodeManager.updateNode("alignjustify");
    };
    copy = () => {
        this.ActionOptions.copy();
        this.NodeManager.refreshUI();
    };
    cut = () => {
        this.ActionOptions.cut();
        this.NodeManager.refreshUI();
    };
    paste = () => {
        if (this.NodeManager.allSelected) {
            this.delete();
        }
        this.ActionOptions.paste();
        this.NodeManager.refreshUI();
    };

    closeDropdown = (id) => {
        const e = this.shadowRoot.getElementById(id);
        e.classList.remove("rich-text-box-show");
        this.lockToolbar = false;
        this.content.focus();
    }
    delete = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            selection.deleteFromDocument();
            this.NodeManager.refreshUI();
        }
    };
    selectall = () => {
        const range = document.createRange();
        range.selectNodeContents(this.content)

        this.content.focus();
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            selection.removeAllRanges();
            selection.addRange(range);
            this.content.focus();
        }
    };

    orderedlist = () => {
        this.ListProvider.addlist("OL");
        this.NodeManager.refreshUI();
    };

    unorderedlist = () => {
        this.ListProvider.addlist("UL");
        this.NodeManager.refreshUI();
    };

    openLinkDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.LinkDialog.openLinkDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    insertLink = () => {
        this.LinkDialog.insertLink();
        this.NodeManager.refreshUI();
    }

    removeLink = () => {
        this.LinkDialog.removeLink();
    }

    openBlockQuoteDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.BlockQuoteDialog.openBlockQuoteDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    insertBlockQuote = () => {
        this.BlockQuoteDialog.insertBlockQuote();
        this.NodeManager.refreshUI();
    }
    openCodeBlockDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.CodeBlockDialog.openCodeBlockDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    insertCodeBlock = () => {
        this.CodeBlockDialog.insertCodeBlock();
        this.NodeManager.refreshUI();
    }
    openMediaDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        //this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.MediaDialog.openMediaDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    insertMedia = () => {
        this.MediaDialog.insertMedia();
        this.NodeManager.refreshUI();
    }
    openVideoDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.VideoDialog.openVideoDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    openVideoDialogForElement = (videoEl) => {
        /* Lock the toolbar and open dialog pre-populated for the given <video> */
        this.lockToolbar = true;
        const selection = this.Utilities.getSelection();
        const saved = this.Utilities.saveSelection(selection);
        this.savedSelection = saved;
        this.VideoDialog.openVideoDialogForElement(videoEl, saved);
    }
    insertVideo = () => {
        this.VideoDialog.insertVideo();
        this.NodeManager.refreshUI();
    }
    uploadImageDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.UploadImageDialog.openUploadImageDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    uploadImage = () => {
        this.UploadImageDialog.insertUploadedImage();
    }
    openImageDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
        this.savedSelection = this.Utilities.saveSelection(selection);
        if (selection !== null) {
            this.ImageDialog.openImageDialog(selection);
        }
        else {
            this.Utilities.showFadingBar("No content selected.");
        }
    }
    insertImage = () => {
        this.ImageDialog.insertImage();
        this.NodeManager.refreshUI();
    }

    closeDialog = (id) => {
        this.lockToolbar = false;
        this.Utilities.closeDialog(id, this.savedSelection);
    }
    enableButtons = () => {
        const dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-btn');
        dropdowns.forEach(button => button.disabled = false);
        const buttons = this.shadowRoot.querySelectorAll('.rich-text-box-menu-item');
        buttons.forEach(button => button.disabled = false);
    }
    disableButtons = () => {
        const dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-btn');
        dropdowns.forEach(button => button.disabled = true);
        const buttons = this.shadowRoot.querySelectorAll('.rich-text-box-menu-item');
        buttons.forEach(button => button.disabled = true);
    }
    toggleView = () => {
        if (this.EditMode === true) {
            this.getHtml();
        }
        else {
            this.getCode();
        }
    }
    getHtml = async () => {
        /* Save the scroll position and selection */
        this.htmlSelection = this.StateManager.saveSelection();
        this.contentScroll = this.Utilities.saveScroll(this.contentContainer);

        /* Hide the status bar in code view — word/char counts are meaningless
           against raw HTML source. Remember whether it was visible so getCode()
           can restore it correctly. */
        if (this.statusBar) {
            this._statusBarWasVisible = this.statusBar.style.display !== 'none';
            this.statusBar.style.display = 'none';
        }

        /* Load the source */
        const html = this.html();
        this.loadInnerText(html);
        this.content.style.display = "none";
        this.source.style.display = "block";
        this.source.focus();
        this.Utilities.restoreScroll(this.source, this.sourceScroll);
        this.disableButtons();
    };
    getCode = async () => {
        /* Save the scroll position */
        this.sourceScroll = this.Utilities.saveScroll(this.source);

        /* Load the source */
        const plaintext = this.source.value;
        this.loadHtml(plaintext);
        this.content.style.display = "block";
        this.source.style.display = "none";
        this.content.focus();

        this.StateManager.restoreSelection(this.htmlSelection);
        this.Utilities.restoreScroll(this.contentContainer, this.contentScroll);
        this.enableButtons();

        /* Restore the status bar to whatever state it had before entering code
           view, then refresh the count against the now-restored HTML content. */
        if (this.statusBar && this._statusBarWasVisible) {
            this.statusBar.style.display = '';
            this.updateWordCount();
        }
    };
    html = () => {
        this.NodeManager.removeEmptyNodes();
        return this.content.innerHTML;
    };
    loadView = (value) => {
        if (this.EditMode === true) {
            this.loadHtml(value);
        }
        else {
            this.loadInnerText(value);
        }
    }
    loadHtml = (html) => {
        this.EditMode = true;

        /* Toggle the button */
        const btn = this.shadowRoot.getElementById("blazing-rich-text-source");
        if (btn) {
            btn.classList.remove("selected");
            btn.setAttribute('aria-pressed', 'false');
        }
        if (html != null) {
            this.content.innerHTML = html;
        }
        else {
            this.content.innerHTML = "";
        }
        this.NodeManager.clearButtons();
        this.updateWordCount();
    };
    loadInnerText = (text) => {
        this.EditMode = false;

        /* Toggle the button */
        const btn = this.shadowRoot.getElementById("blazing-rich-text-source");
        if (btn) {
            btn.classList.add("selected");
            btn.setAttribute('aria-pressed', 'true');
        }
        if (text != null) {
            this.source.value = text;
        }
        else {
            this.source.value = "";
        }
        this.NodeManager.clearButtons();
    };
    plaintext = () => {
        return this.content.textContent;
    };
}

class RTBlazorfiedStateManager {
    constructor(content, source, utilities, dotNetObjectReference, contentContainer) {
        this.content = content;
        this.source = source;
        this.Utilities = utilities;
        this.dotNetObjectReference = dotNetObjectReference;
        this.contentContainer = contentContainer;

        /* Initialize history */
        this.history = [];
        this.currentIndex = -1;
        this.currentIndex = -1;
        this.isNavigating = false;

        this.mutationObserver();
    }

    mutationObserver = () => {
        /* Save the state when mutations to the state occur */
        const richtextbox = (mutationsList, observer) => {
            if (this.content.style.display === "block" && !this.isNavigating) {
                for (let mutation of mutationsList) {
                    switch (mutation.type) {
                        case 'attributes':
                            this.saveState();
                            break;
                        case 'characterData':
                            this.saveState();
                            break;
                        case 'subtree':
                            this.saveState();
                            break;
                        case 'childList':
                            this.saveState();
                            break;
                    }
                }
            }
            else {
                this.isNavigating = false;
                this.updateBinding();
            }
        };

        /* Options for the observer (which mutations to observe) */
        const config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        };

        /* Initialize an observer instance linked to the callback function */
        const observer = new MutationObserver(richtextbox);
        observer.observe(this.content, config);
    }

    updateBinding = () => {
        if (this.content.style.display === "block") {
            if (this.dotNetObjectReference) {
                this.dotNetObjectReference.invokeMethodAsync('UpdateValue', this.content.innerHTML);
            }
        }
        else {
            if (this.dotNetObjectReference) {
                this.dotNetObjectReference.invokeMethodAsync('UpdateValue', this.source.value);
            }
        }
    }

    /* History */
    saveState = () => {
        if (this.PreviousHtml === this.content.innerHTML) { return; }
        const currentState = {
            html: this.content.innerHTML,
            selection: this.saveSelection(),
            scroll: this.Utilities.saveScroll(this.contentContainer)
        };

        /* Prevent the editor from saving multiple copies */
        this.PreviousHtml = this.content.innerHTML;

        /* If there is any change in the content */
        if (this.currentIndex === -1 || currentState !== this.history[this.currentIndex]) {


            this.history = this.history.slice(0, this.currentIndex + 1);
            
            /* Add the new state */
            this.history.push(currentState);
            
            this.currentIndex++;

            /* Remove the oldest state if history exceeds 20 entries */
            if (this.history.length > 60) {
                /* shift() removes the oldest entry */
                this.history.shift();
                this.currentIndex--;
            }
            this.updateBinding();
        }        
    };
    /* History */
    restoreLastState = () => {
        if (this.currentIndex > 0) {
            this.isNavigating = true;
            this.restoreState(this.history[this.currentIndex]);
        }
    };
    goBack = () => {
        if (this.currentIndex > 0) {
            this.isNavigating = true;
            this.currentIndex--;
            this.restoreState(this.history[this.currentIndex]);
        }
    };
    goForward = () => {
        if (this.currentIndex < this.history.length - 1) {
            this.isNavigating = true;
            this.currentIndex++;
            this.restoreState(this.history[this.currentIndex]);
        }
    };

    saveSelection = () => {
        const selection = this.Utilities.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(this.content);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const start = preSelectionRange.toString().length;

            return {
                start: start,
                end: start + range.toString().length
            };
        }
        return null;
    };

    restoreSelection = (savedSelection) => {
        if (savedSelection) {
            try {
                const charIndex = (node, index) => {
                    let currentIndex = 0;
                    if (node.nodeType === Node.TEXT_NODE) {
                        return index <= node.length ? [node, index] : [null, index - node.length];
                    } else {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            const childNode = node.childNodes[i];
                            const [foundNode, remainingIndex] = charIndex(childNode, index - currentIndex);
                            if (foundNode) {
                                return [foundNode, remainingIndex];
                            }
                            currentIndex += childNode.textContent.length;
                        }
                    }
                    return [null, index - currentIndex];
                };

                const range = document.createRange();
                let [startNode, startOffset] = charIndex(this.content, savedSelection.start);
                let [endNode, endOffset] = charIndex(this.content, savedSelection.end);

                if (startNode && endNode) {
                    range.setStart(startNode, startOffset);
                    range.setEnd(endNode, endOffset);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            catch (ex) {
            }
        }
    };
    restoreState = (state) => {
        this.content.innerHTML = state.html;
        this.restoreSelection(state.selection);
        this.Utilities.restoreScroll(this.contentContainer, state.scroll);
        this.content.focus();
    };
}

class RTBlazorfiedNodeManager {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
    }

    // Toggles the visual + accessible pressed state on a toolbar button.
    _press = (btn, on = true) => {
        if (!btn) return;
        btn.classList.toggle('selected', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };

    formatNode = (type) => {
        let sel, range;

        sel = this.Utilities.getSelection();
        if (sel !== null) {

            /* See if an element with matching content exists
            if it does, change or remove it */
            let element;
            if (sel.toString().length == 0) {
                if (sel.anchorNode != null && sel.anchorNode != this.content && sel.anchorNode.parentNode != null && this.content.contains(sel.anchorNode.parentNode)) {
                    element = this.getElementByType(sel.anchorNode.parentNode, "Format");
                }
            }
            else {
                /* See if this is an outer element */
                if (this.hasCommonAncestor(sel) == true) {
                    const range = sel.getRangeAt(0);
                    element = range.commonAncestorContainer;
                    this.isCommonAncestor = true;
                }
                else {
                    /* Get the element by the selected content */
                    element = this.getElementByContent(sel.anchorNode, type, sel);
                }
            }

            if (element != null && element != this.content && element.parentNode != null && this.content.contains(element.parentNode)) {

                if (type == "none") {
                    let caretPos = this.Utilities.saveCaretPosition();

                    /* Create a new div element */
                    const div = document.createElement('div');

                    /* Copy inline styles from the original element to the new div */
                    for (let i = 0; i < element.style.length; i++) {
                        const styleName = element.style[i];
                        div.style[styleName] = element.style[styleName];
                    }

                    /* Move all child nodes from the original element to the new div */
                    while (element.firstChild) {
                        div.appendChild(element.firstChild);
                    }

                    /* Replace the original element with the new div */
                    element.parentNode.replaceChild(div, element);

                    this.Utilities.restoreCaretPosition(div, caretPos);
                }
                else {
                    let caretPos = this.Utilities.saveCaretPosition();

                    const newElement = document.createElement(type);
                    newElement.innerHTML = element.innerHTML;

                    /* Copy styles */
                    const computedStyles = window.getComputedStyle(element);
                    for (let i = 0; i < computedStyles.length; i++) {
                        let styleName = computedStyles[i];
                        let inlineStyleValue = element.style.getPropertyValue(styleName);
                        if (inlineStyleValue !== "") {
                            newElement.style[styleName] = inlineStyleValue;
                        }
                    }
                    element.parentNode.replaceChild(newElement, element);

                    this.Utilities.restoreCaretPosition(newElement, caretPos);
                }
                return;
            }

            if (sel.toString().length > 0) {
                let newElement;
                switch (type) {
                    case "p":
                        newElement = document.createElement("p");
                        break;
                    case "h1":
                        newElement = document.createElement("h1");
                        break;
                    case "h2":
                        newElement = document.createElement("h2");
                        break;
                    case "h3":
                        newElement = document.createElement("h3");
                        break;
                    case "h4":
                        newElement = document.createElement("h4");
                        break;
                    case "h5":
                        newElement = document.createElement("h5");
                        break;
                }
                if (newElement != null && sel.rangeCount > 0) {
                    range = sel.getRangeAt(0);

                    if (!this.hasInvalidElementsInSelection(sel)) {
                        newElement.appendChild(range.cloneContents());
                        range.deleteContents();
                        range.insertNode(newElement);
                        range.selectNodeContents(newElement);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
        }
    }

    updateNode = (type, value, selection) => {
        let sel, range;

        sel = this.Utilities.getSelection();
        if (sel || selection) {

            /* Get the color selection if one exists */
            if (sel && selection) {
                sel.removeAllRanges();
                sel.addRange(selection);
            }
            else {
                if (selection) {
                    sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(selection);
                }
            }

            let element;
            this.isCommonAncestor = false;
            if (sel.toString().length == 0) {

                /* Check if a node exists with this style and get it */
                element = this.getElementByStyle(sel.anchorNode, type);

                /* See if it's an image */
                if (element == null && sel.anchorNode != null && sel.anchorNode != this.content && this.content.contains(sel.anchorNode) && sel.anchorNode.querySelector) {
                    const image = sel.anchorNode.querySelector('img');
                    if (image != null) {
                        element = sel.anchorNode;
                    }
                    const embed = sel.anchorNode.querySelector('embed');
                    if (embed != null) {
                        element = sel.anchorNode;
                    }
                    const object = sel.anchorNode.querySelector('object');
                    if (object != null) {
                        element = sel.anchorNode;
                    }
                    const table = sel.anchorNode.querySelector('table');
                    if (table != null) {
                        element = table;
                    }
                }

                /* If that node does not exist, style the parent node */
                if (element == null && sel.anchorNode != null && sel.anchorNode != this.content && sel.anchorNode.parentNode != null && sel.anchorNode.parentNode != this.content && this.content.contains(sel.anchorNode.parentNode)) {
                    element = sel.anchorNode.parentNode;
                }
            }
            else {
                /* See if this is an outer element */
                if (this.hasCommonAncestor(sel) == true) {
                    const range = sel.getRangeAt(0);
                    element = range.commonAncestorContainer;
                    this.isCommonAncestor = true;
                }
                else {
                    /* Get the element by the selected content */
                    element = this.getElementByContent(sel.anchorNode, type, sel);
                }
            }

            if (element != null) {
                let e;
                switch (type) {
                    case "textcolor":
                        if (value == "None") {
                            e = this.getElementByStyle(element, type);
                            if (e != null) {
                                this.removeProperty(e, "color", e.style.getPropertyValue("color"));
                            }
                        }
                        else {
                            element.style.setProperty("color", value);
                        }
                        break;
                    case "textbgcolor":
                        if (value == "None") {
                            e = this.getElementByStyle(element, type);
                            if (e != null) {
                                this.removeProperty(e, "background-color", e.style.getPropertyValue("background-color"));
                            }
                        }
                        else {
                            element.style.setProperty("background-color", value);
                        }
                        break;
                    case "font":
                        if (value == "None") {
                            this.removeProperty(element, "font-family", value);
                        }
                        else {
                            element.style.setProperty("font-family", value);
                        }
                        break;
                    case "size":
                        if (value == "None") {
                            this.removeProperty(element, "font-size");
                        }
                        else {
                            element.style.setProperty("font-size", value);
                        }
                        break;
                    case "bold":
                        if (element.style.fontWeight == "bold") {
                            this.removeProperty(element, "font-weight", "bold");
                        }
                        else {
                            element.style.setProperty("font-weight", "bold");
                        }
                        break;
                    case "italic":
                        if (element.style.fontStyle == "italic") {
                            this.removeProperty(element, "font-style", "italic");
                        }
                        else {
                            element.style.setProperty("font-style", "italic");
                        }
                        break;
                    case "underline":
                        if (element.style.textDecoration.includes("underline")) {
                            this.removeTextDecoration(element, "underline");
                        }
                        else {
                            this.addTextDecoration(element, "underline");
                        }
                        break;
                    case "line-through":
                        if (element.style.textDecoration.includes("line-through")) {
                            this.removeTextDecoration(element, "line-through");
                        }
                        else {
                            this.addTextDecoration(element, "line-through");
                        }
                        break;
                    case "subscript":
                        if (element.style.verticalAlign == "sub") {
                            this.removeProperty(element, "vertical-align", "sub");
                        }
                        else {
                            element.style.setProperty("vertical-align", "sub");
                        }
                        break;
                    case "superscript":
                        if (element.style.verticalAlign == "super") {
                            this.removeProperty(element, "vertical-align", "super");
                        }
                        else {
                            element.style.setProperty("vertical-align", "super");
                        }
                        break;
                    case "alignleft":
                        if (element.nodeName === "TABLE") {
                            this.alignTable(element, "alignleft");
                        } else {
                            if (element.style.textAlign == "left") {
                                this.removeProperty(element, "text-align", "left");
                            }
                            else {
                                element.style.setProperty("text-align", "left");
                            }
                        }
                        break;
                    case "aligncenter":
                        if (element.nodeName === "TABLE") {
                            this.alignTable(element, "aligncenter");
                        }
                        else {
                            if (element.style.textAlign == "center") {
                                this.removeProperty(element, "text-align", "center");
                            }
                            else {
                                element.style.setProperty("text-align", "center");
                            }
                        }
                        break;
                    case "alignright":
                        if (element.nodeName === "TABLE") {
                            this.alignTable(element, "alignright");
                        } else {
                            if (element.style.textAlign == "right") {
                                this.removeProperty(element, "text-align", "right");
                            }
                            else {
                                element.style.setProperty("text-align", "right");
                            }
                        }
                        break;
                    case "alignjustify":
                        if (element.nodeName === "TABLE") {
                            this.alignTable(element, "alignjustify");
                        } else {
                            if (element.style.textAlign == "justify") {
                                this.removeProperty(element, "text-align", "justify");
                            }
                            else {
                                element.style.setProperty("text-align", "justify");
                            }
                        }
                        break;
                    default:
                }
                this.selection = null;
                this.refreshUI();
                return;
            }

            /* Insert a new node */
            /* Make certain the element has content */
            if (sel.toString().length > 0 && value != "None" && !this.isExcluded(sel)) {
                let newElement;
                switch (type) {
                    case "textcolor":
                        newElement = this.createElement(sel);
                        newElement.style.color = value;
                        break;
                    case "textbgcolor":
                        newElement = this.createElement(sel);
                        newElement.style.backgroundColor = value;
                        break;
                    case "font":
                        newElement = this.createElement(sel);
                        newElement.style.fontFamily = value;
                        break;
                    case "size":
                        newElement = this.createElement(sel);
                        newElement.style.fontSize = value;
                        break;
                    case "bold":
                        newElement = this.createElement(sel);
                        newElement.style.fontWeight = "bold";
                        break;
                    case "italic":
                        newElement = this.createElement(sel);
                        newElement.style.fontStyle = "italic";
                        break;
                    case "underline":
                        newElement = this.createElement(sel);
                        this.addTextDecoration(newElement, "underline");
                        break;
                    case "line-through":
                        newElement = this.createElement(sel);
                        this.addTextDecoration(newElement, "line-through");
                        break;
                    case "subscript":
                        newElement = this.createElement(sel);
                        newElement.style.verticalAlign = "sub";
                        break;
                    case "superscript":
                        newElement = this.createElement(sel);
                        newElement.style.verticalAlign = "super";
                        break;
                    case "alignleft":
                        newElement = document.createElement("div");
                        newElement.style.textAlign = "left";
                        break;
                    case "aligncenter":
                        newElement = document.createElement("div");
                        newElement.style.textAlign = "center";
                        break;
                    case "alignright":
                        newElement = document.createElement("div");
                        newElement.style.textAlign = "right";
                        break;
                    case "alignjustify":
                        newElement = document.createElement("div");
                        newElement.style.textAlign = "justify";
                        break;
                    default:
                }
                if (newElement != null && sel.rangeCount != 0) {
                    range = sel.getRangeAt(0);
                    newElement.appendChild(range.cloneContents());
                    range.deleteContents();
                    range.insertNode(newElement);
                    range.selectNodeContents(newElement);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    this.selection = null;
                    this.refreshUI();
                }
            }
        }
    }

    alignTable = (element, alignment) => {
        if (alignment === 'alignleft' || alignment === 'alignjustify') {
            if (element.style.margin == "auto") {
                this.removeProperty(element, "margin", "auto");
            }
            if (element.style.marginLeft == "auto") {
                this.removeProperty(element, "margin-left", "auto");
            }
        }

        if (alignment === 'aligncenter') {
            if (element.style.margin && element.style.margin === "auto") {
                this.removeProperty(element, "margin", "auto");
            }
            else {
                element.style.setProperty("margin", "auto");
            }
        }

        if (alignment === 'alignright') {
            if (element.style.margin == "auto") {
                this.removeProperty(element, "margin", "auto");
            }
            if (element.style.marginLeft == "auto") {
                this.removeProperty(element, "margin-left", "auto");
            }
            else {
                element.style.setProperty("margin-left", "auto");
            }
        }
    }

    isExcluded = (selection) => {
        /* Make certain the user cannot select table
        cells from the left */
        if (selection.anchorNode && selection.anchorNode.querySelector) {
            const table = selection.anchorNode.querySelector('table');
            if (table != null) {
                if (selection.toString().trim() !== table.innerText.trim()) {
                    return true;
                }
            }
        }

        if (selection.anchorNode.parentNode !== this.content) {
            switch (selection.anchorNode.parentNode.nodeName) {
                case "TD":
                    return true;
                    break;
                case "CODE":
                    return true;
                    break;
                case "PRE":
                    return true;
                    break;
            }
        }
        return false;
    }

    /* Used by the indent buttons */
    indentBlock = (selection, increase) => {
        let currentNode = selection.anchorNode;
        /* Traverse up the DOM tree */
        while (currentNode) {
            if (this.applyMargin(currentNode, increase)) {
                break;
            }
            currentNode = currentNode.parentNode;
        }
    }

    applyMargin = (currentNode, increase) => {

        /* List of block-level elements */
        const blockLevelElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'UL', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER'];

        /* Check if the current node is an element and is a block-level element */
        if (currentNode.nodeType === Node.ELEMENT_NODE && blockLevelElements.includes(currentNode.nodeName)) {

            /* Increase or decrease margin-left */
            const currentMarginLeft = window.getComputedStyle(currentNode).marginLeft;
            const marginLeftValue = parseFloat(currentMarginLeft) || 0;
            const marginValue = 40;
            if (increase) {
                currentNode.style.marginLeft = `${marginLeftValue + marginValue}px`;
            }
            else {
                if (marginLeftValue <= marginValue) {
                    currentNode.style.marginLeft = '';

                    /* Remove the style attribute if no other styles exist */
                    if (currentNode.hasAttribute('style')) {
                        if (!currentNode.getAttribute('style')) {
                            currentNode.removeAttribute('style');
                        }
                    }
                }
                else {
                    currentNode.style.marginLeft = `${marginLeftValue - marginValue}px`;
                }
            }
            return true;
        }
        return false;
    }

    /* Search up the elements */
    selectButtons = (el) => {
        if (el == null || el == this.content || !this.content.contains(el) || this.lockToolbar == true) { return; }

        /* Clear the buttons */
        this.clearButtons();

        /* Reset Styles */
        const bold = this.getButton("blazing-rich-text-bold-button");
        const italic = this.getButton("blazing-rich-text-italic-button");
        const underline = this.getButton("blazing-rich-text-underline-button");
        const strike = this.getButton("blazing-rich-text-strike-button");
        const sub = this.getButton("blazing-rich-text-sub-button");
        const superscript = this.getButton("blazing-rich-text-super-button");
        const alignleft = this.getButton("blazing-rich-text-alignleft-button");
        const aligncenter = this.getButton("blazing-rich-text-aligncenter-button");
        const alignright = this.getButton("blazing-rich-text-alignright-button");
        const alignjustify = this.getButton("blazing-rich-text-alignjustify-button");
        this.textAlign = false;

        const ol = this.getButton("blazing-rich-text-orderedlist-button");
        const ul = this.getButton("blazing-rich-text-unorderedlist-button");

        const link = this.getButton("blazing-rich-text-link-button");
        const linkRemove = this.getButton("blazing-rich-text-remove-link-button");
        const textColor = this.getButton("blazing-rich-text-textcolor-button");
        const textBackgroundColor = this.getButton("blazing-rich-text-text-bg-color-button");
        const textColorRemove = this.getButton("blazing-rich-text-textcolor-remove-button");

        const blockQuote = this.getButton("blazing-rich-text-quote-button");
        const codeBlock = this.getButton("blazing-rich-text-code-block-button");
        const table = this.getButton("blazing-rich-text-table-button");

        const img = this.getButton("blazing-rich-text-image-button");
        const imgUpload = this.getButton("blazing-rich-text-image-upload-button");
        const media = this.getButton("blazing-rich-text-embed-button");
        const videoBtn = this.getButton("blazing-rich-text-video-button");
        
        /* Menus */
        const formatButton = this.shadowRoot.getElementById("blazing-rich-text-format-button");
        if (formatButton != null) {
            formatButton.innerText = "Format";
            this.formatSelected = false;
        }

        const fontButton = this.shadowRoot.getElementById("blazing-rich-text-font-button");
        if (fontButton != null) {
            fontButton.innerText = "Font";
            this.fontSelected = false;
        }

        const sizeButton = this.shadowRoot.getElementById("blazing-rich-text-size-button");
        if (sizeButton != null) {
            sizeButton.innerText = "Size";
            this.fontSizeSelected = false;
        }

        while (el !== this.content && el.parentNode !== null && this.content.contains(el.parentNode)) {

            /* Prevent selecting unwanted elements */
            if (el.parentNode.nodeName == "#text" || el.parentNode.nodeName == "#document") {
                break;
            }

            let compStyles = window.getComputedStyle(el.parentNode);

            /* Bold */
            if (el.parentNode.style != null && el.parentNode.style.fontWeight == "bold") {
                this._press(bold);
            }
            /* Text color */
            if (el.parentNode.style != null && el.parentNode.style.color) {
                this._press(textColor);
            }
            /* Text background color */
            if (el.parentNode.style != null && el.parentNode.style.backgroundColor) {
                this._press(textBackgroundColor);
            }
            /* Remove text color */
            if (el.parentNode.style != null && el.parentNode.style.color || el.parentNode.style.backgroundColor) {
                this._press(textColorRemove);
            }
            if (compStyles.getPropertyValue("font-style") == "italic") {
                this._press(italic);
            }
            if (compStyles.getPropertyValue("text-decoration").includes("underline") && el.parentNode.nodeName != "A") {
                this._press(underline);
            }
            if (compStyles.getPropertyValue("text-decoration").includes("line-through")) {
                this._press(strike);
            }
            if (compStyles.getPropertyValue("vertical-align") == "sub") {
                this._press(sub);
            }
            if (compStyles.getPropertyValue("vertical-align") == "super") {
                this._press(superscript);
            }
            if (compStyles.getPropertyValue("text-align") == "left" && !this.textAlign) {
                this._press(alignleft);
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "center" && !this.textAlign) {
                this._press(aligncenter);
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "right" && !this.textAlign) {
                this._press(alignright);
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "justify" && !this.textAlign) {
                this._press(alignjustify);
                this.textAlign = true;
            }
            if (el != null && el.style != null && el.style.fontFamily && !this.fontSelected) {
                fontButton.innerText = el.style.fontFamily.replace(/^"(.*)"$/, '$1');
                this.fontSelected = true;
            }

            if (el != null && el.style != null && el.style.fontSize && !this.fontSizeSelected) {
                sizeButton.innerText = el.style.fontSize;
                this.fontSizeSelected = true;
            }
            if (el.parentNode.nodeName == "P" && !this.formatSelected) {
                formatButton.innerText = 'Paragraph';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "H1" && !this.formatSelected) {
                formatButton.innerText = 'Header 1';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "H2" && !this.formatSelected) {
                formatButton.innerText = 'Header 2';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "H3" && !this.formatSelected) {
                formatButton.innerText = 'Header 3';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "H4" && !this.formatSelected) {
                formatButton.innerText = 'Header 4';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "H5" && !this.formatSelected) {
                formatButton.innerText = 'Header 5';
                this.formatSelected = true;
            }
            if (el.parentNode.nodeName == "A") {
                this._press(link);
                this._press(linkRemove);
            }
            if (el.parentNode.nodeName == "BLOCKQUOTE") {
                this._press(blockQuote);
            }
            if (el.parentNode.nodeName == "CODE") {
                this._press(codeBlock);
            }
            if (el.parentNode.nodeName == "TD") {
                this._press(table);
            }
            if (el.parentNode.nodeName == "OL") {
                this._press(ol);
            }
            if (el.parentNode.nodeName == "UL") {
                this._press(ul);
            }

            /* Direct element checks (handles cursor on video/source itself) */
            if (el.nodeName === 'VIDEO' || el.nodeName === 'SOURCE') {
                if (videoBtn) this._press(videoBtn);
            }

            /* Check for querySelector */
            if (el.querySelector) {

                /* Check for image */
                const image = el.querySelector('img');
                if (image) {
                    if (image.src.startsWith('data')) {
                        this._press(imgUpload);
                    }
                    else {
                        this._press(img);
                    }
                }

                /* Check for object */
                const object = el.querySelector('object');
                if (object) {
                    this._press(media);
                }

                /* Check for video */
                const videoEl = el.querySelector('video');
                if (videoEl) {
                    if (videoBtn) this._press(videoBtn);
                }
            }

            el = el.parentNode;
        }
        this.closeDropdowns();
    }
    closeDropdowns = () => {
        /* Close the Dropdowns */
        const dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach(function (dropdown) {
            if (dropdown.classList.contains("rich-text-box-show")) {
                dropdown.classList.remove('rich-text-box-show');
            }
        });
    }
    getButton = (id) => {
        return this.shadowRoot.getElementById(id);
    }
    refreshUI = () => {
        /* Select Buttons */
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            this.selectButtons(selection.anchorNode);
        }
        this.removeEmptyNodes();
        this.content.focus();
    };

    removeEmptyNodes = () => {
        /* Remove Empty Nodes */
        const div = this.content;
        if (div) {
            const elements = div.querySelectorAll('*');

            elements.forEach(element => {
                if (!element.hasChildNodes() ||
                    (element.childNodes.length === 1 &&
                        element.childNodes[0].nodeType === 3 &&
                        !/\S/.test(element.textContent))) {

                    if (element.parentElement && !this.isNotRemovable(element.nodeName)) {
                        element.parentElement.removeChild(element);
                    }
                }
            });
        }
    }

    createDefaultElement = () => {
        /* Create an element if one doesn't alreay exist */
        if (this.content.innerHTML.trim() === '') {
            const div = document.createElement('div');
            const br = document.createElement('br');
            div.appendChild(br);
            this.content.appendChild(div);
        }
    }

    allSelected = () => {
        /* Get the current selection */
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            if (selection.rangeCount === 0) {
                return false;
            }

            /* Get the range of the current selection */
            const selectionRange = selection.getRangeAt(0);
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(this.content);

            // Compare the start and end points of both ranges
            return selectionRange.startContainer === nodeRange.startContainer &&
                selectionRange.startOffset === nodeRange.startOffset &&
                selectionRange.endContainer === nodeRange.endContainer &&
                selectionRange.endOffset === nodeRange.endOffset;
        }
        else {
            return false;
        }
    }

    clearButtons = () => {
        this.closeDropdowns();

        const buttons = this.shadowRoot.querySelectorAll(
            '.rich-text-box-menu-item, .rich-text-box-menu-item-special'
        );
        buttons.forEach(function (button) {
            button.classList.remove('selected');
            button.setAttribute('aria-pressed', 'false');
        });

        const formatButton = this.shadowRoot.getElementById("blazing-rich-text-format-button");
        if (formatButton != null) {
            formatButton.innerText = "Format";
            this.formatSelected = false;
        }

        const fontButton = this.shadowRoot.getElementById("blazing-rich-text-font-button");
        if (fontButton != null) {
            fontButton.innerText = "Font";
            this.fontSelected = false;
        }

        const sizeButton = this.shadowRoot.getElementById("blazing-rich-text-size-button");
        if (sizeButton != null) {
            sizeButton.innerText = "Size";
            this.fontSizeSelected = false;
        }
    }

    /* A list of nodes that should not be removed */
    isNotRemovable = (nodeName) => {
        switch (nodeName.toLowerCase()) {
            case "td":
                return true;
                break;
            case "img":
                return true;
                break;
            case "i":
                return true;
                break;
            case "br":
                return true;
                break;
            case "area":
                return true;
                break;
            case "base":
                return true;
                break;
            case "col":
                return true;
                break;
            case "embed":
                return true;
                break;
            case "object":
                return true;
                break;
            case "video":
                return true;
                break;
            case "source":
                return true;
                break;
            case "hr":
                return true;
                break;
            case "input":
                return true;
                break;
            case "link":
                return true;
                break;
            case "meta":
                return true;
                break;
            case "param":
                return true;
                break;
            case "source":
                return true;
                break;
            case "track":
                return true;
                break;
            case "wbr":
                return true;
                break;
            case "keygen":
                return true;
                break;
        }
        return false;
    }

    hasCommonAncestor(selection) {
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);

        /* This is used to compare the html contents
        to ensure they are the same element */
        const fragment = range.cloneContents();
        const temp = document.createElement('div');
        temp.appendChild(fragment);

        const commonAncestor = range.commonAncestorContainer;
        if (commonAncestor !== this.content && this.content.contains(commonAncestor) && temp.innerHTML == range.commonAncestorContainer.innerHTML && commonAncestor.nodeType !== Node.TEXT_NODE) {
            temp.remove();
            return true;
        }
        temp.remove();
        return false;
    }
    createElement = (selection) => {
        /* Insert a div if no elements exist in the editor */
        if (this.hasInvalidElementsInSelection(selection)) {
            return document.createElement("div");
        }
        return document.createElement("span");
    }
    hasInvalidElementsInSelection = (selection) => {
        if (selection) {
            const relevantElements = [
                "address", "article", "aside", "blockquote", "details", "dialog", "div",
                "dl", "fieldset", "figcaption", "figure", "footer", "form", "header",
                "hgroup", "hr", "main", "menu", "nav", "ol", "p", "pre", "section",
                "table", "ul", "button", "input", "textarea", "select", "form",
                "h1", "h2", "h3", "h4", "h5", "h6"
            ];

            /* Get the range of the selection */
            const range = selection.getRangeAt(0);

            /* Create a document fragment to hold the contents of the range */
            const fragment = range.cloneContents();

            /* Query all elements within the fragment */
            const elements = fragment.querySelectorAll('*');
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                /* Check if the element's tag name is in relevantElements */
                if (relevantElements.includes(element.tagName.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }
    removeProperty = (element, property, value) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        /* This should more generally consider all the styles */
        if (this.getUserDefinedStyleCount(element) > 1) {
            element.style.removeProperty(property, value);
        }
        else {
            if (element.nodeName == "SPAN") {
                if (element.childElementCount == 0) {
                    element.replaceWith(element.textContent);
                }
                else {
                    element.insertAdjacentHTML("afterend", element.innerHTML);
                    element.remove();
                }
            }
            else {
                if (element.nodeName == "DIV" && this.isCommonAncestor === true) {
                    element.insertAdjacentHTML("afterend", element.innerHTML);
                    element.remove();
                }
                else {
                    if (element.hasAttribute('style')) {
                        element.removeAttribute('style');
                    }
                }
            }
        }
    }
    addTextDecoration = (element, decoration) => {
        if (element == null || element == this.content || element == this.content.parentNode) { return; }

        const currentDecorations = element.style.textDecoration;

        /* Check if the decoration is already applied */
        if (currentDecorations != null && !currentDecorations.includes(decoration)) {
            /* Add the new decoration */
            const newDecorations = currentDecorations ? currentDecorations + ' ' + decoration : decoration;
            element.style.textDecoration = newDecorations;
        }
    }
    removeTextDecoration = (element, decoration) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        if (this.getUserDefinedStyleCount(element) > 1) {
            const currentDecorations = element.style.textDecoration.split(' ');

            /* Remove the specified decoration */
            const newDecorations = currentDecorations.filter(decor => decor !== decoration);

            /* Update the element's text-decoration style */
            element.style.textDecoration = newDecorations.join(' ');
        }
        else {
            if (element.nodeName == "SPAN" & element.childElementCount == 0) {
                element.replaceWith(element.textContent);
            }
            else if (element.nodeName == "SPAN") {
                element.insertAdjacentHTML("afterend", element.innerHTML);
                element.remove();
            }
            else {
                /* No more styles. Since, this element may be required */
                /* for formating, remove the styles */
                if (element.hasAttribute('style')) {
                    element.removeAttribute('style');
                }
            }
        }
    }

    getUserDefinedStyles = (element) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        let styles = {};
        for (let i = 0; i < element.style.length; i++) {
            let property = element.style[i];
            let value = element.style.getPropertyValue(property);
            styles[property] = value;
        }

        return styles;
    }

    getUserDefinedStyleCount = (element) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        let c = 0;
        for (let i = 0; i < element.style.length; i++) {
            let property = element.style[i];
            let value = element.style.getPropertyValue(property);

            /* Filter out the initual values, e.g., <h1> */
            if (this.isFormatElement(element)) {
                if (value != "initial") {
                    let words = value.split(' ');

                    /* Check if the style contains multiple values */
                    if (!this.isMultiValueProperty(property) && words.length > 1) {
                        for (let i = 0; i < words.length; i++) {
                            c++;
                        }
                    }
                    else {
                        c++;
                    }
                }
            }
            else {
                /* If it's not a formating node... */
                c++;
            }
        }
        return c;
    }
    isMultiValueProperty = (property) => {
        switch (property) {
            case "background-color":
                return true;
                break;
            case "color":
                return true;
                break;
            case "font-family":
                return true;
                break;
        }
        return false;
    }

    /* Get an element by type */
    getElementByType = (el, type) => {
        if (el == null || el == this.content || !this.content.contains(el)) { return; }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el === this.content || !this.content.contains(el)) { return; }

            /* Recurse into the closest node and return it */
            if (el.nodeName != "#text" && el.nodeName != "#document") {
                switch (type) {
                    case "Format":
                        if (this.isFormatElement(el)) {
                            return el;
                        }
                        break;
                    case "UL":
                        if (el.nodeName === type) {
                            return el;
                        }
                        break;
                    case "OL":
                        if (el.nodeName === type) {
                            return el;
                        }
                        break;
                    case "Element":
                        if (el.nodeName === type) {
                            return el;
                        }
                        break;
                }
            }
            el = el.parentNode;
        }

        return null;
    }

    /* Get an element by matching content */
    getElementByContent = (el, type, selection) => {
        if (el == null || el == this.content || !this.content.contains(el)) { return; }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el === this.content || !this.content.contains(el)) { return; }

            /* Recurse into the closest node and return it */
            if (el.nodeName != "#text" && el.nodeName != "#document") {

                /* Check if a style element exists  */
                const e = this.getElementByStyle(el, type);
                if (e != null && this.selectionContainsNode(selection, e)) {
                    return e;
                }

                /* Check if the selection contains a list item and return the list */
                if (el.nodeName === 'LI') {
                    return el.parentNode;
                }

                /* Match the text, or get the element by the style */
                if (selection !== null && selection.toString().trim() == el.textContent.trim()) {
                    return el;
                }
            }
            el = el.parentNode;
        }
        return;
    }

    selectionContainsNode(selection, node) {
        if (node == null || node == this.content || !this.content.contains(node)) { return false; }

        if (selection.rangeCount > 0) {
            for (let i = 0; i < selection.rangeCount; i++) {
                let range = selection.getRangeAt(i);
                if (this.isNodeInRange(node, range)) {
                    return true;
                }
            }
        }
        return false;
    }

    isNodeInRange(node, range) {
        if (node == null || node == this.content || !this.content.contains(node)) { return false; }

        /* Check if the node is contained within the range */
        let nodeRange = node.ownerDocument.createRange();
        nodeRange.selectNode(node);

        /* Compare ranges to check for intersection */
        return range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0 &&
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0;
    }

    /* Get an element by style */
    getElementByStyle = (el, type) => {
        if (el == null || el == this.content || !this.content.contains(el)) { return; }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el === this.content || !this.content.contains(el)) { return; }
            if (el.style != null) {
                let style = null;
                switch (type) {
                    case "textcolor":
                        /* This method is more specific to the element
                        instead of applying inherited styles */
                        style = el.getAttribute("style");
                        if (style != null && style.includes("color:")) {
                            return el;
                        }
                        break;
                    case "textbgcolor":
                        /* This method is more specific to the element
                        instead of applying inherited styles */
                        style = el.getAttribute("style");
                        if (style != null && style.includes("background-color:")) {
                            return el;
                        }
                        break;
                    case "font":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("font-family:")) {
                            return el;
                        }
                        break;
                    case "size":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("font-size:")) {
                            return el;
                        }
                        break;
                    case "bold":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("font-weight:")) {
                            if (el.style.fontWeight == "bold") {
                                return el;
                            }
                        }
                        break;
                    case "italic":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("font-style:")) {
                            if (el.style.fontStyle == "italic") {
                                return el;
                            }
                        }
                        break;
                    case "underline":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-decoration:")) {
                            if (el.style.textDecoration.includes("underline")) {
                                return el;
                            }
                        }
                        break;
                    case "line-through":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-decoration:")) {
                            if (el.style.textDecoration.includes("line-through")) {
                                return el;
                            }
                        }
                        break;
                    case "subscript":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("vertical-align:")) {
                            if (el.style.verticalAlign == "sub") {
                                return el;
                            }
                        }
                        break;
                    case "superscript":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("vertical-align:")) {
                            if (el.style.verticalAlign == "superscript") {
                                return el;
                            }
                        }
                        break;
                    case "alignleft":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "left") {
                                return el;
                            }
                        }
                        break;
                    case "aligncenter":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "center") {
                                return el;
                            }
                        }
                        break;
                    case "alignright":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "right") {
                                return el;
                            }
                        }
                        break;
                    case "alignjustify":
                        style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "justify") {
                                return el;
                            }
                        }
                        break;
                }
            }
            el = el.parentNode;
        }

        return null;
    }

    isFormatElement = (element) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return false };

        if (element.nodeName == "P"
            || element.nodeName == "H1"
            || element.nodeName == "H2"
            || element.nodeName == "H3"
            || element.nodeName == "H4"
            || element.nodeName == "H5") {
            return true;
        }

        /* Text decoration contains similar format elements */
        if (element.style != null && element.style.textDecoration != null) {
            return true;
        }
    }

    insertLineBreak = (element) => {
        const div = document.createElement('div');
        const br = document.createElement('br');
        div.appendChild(br);

        if (element.nodeName == "CODE") {
            /* Insert the new div after the grandparent element */
            const grandparent = element.parentNode.parentNode;
            if (grandparent.nextSibling) {
                grandparent.parentNode.insertBefore(div, grandparent.nextSibling);
            } else {
                grandparent.parentNode.appendChild(div);
            }
        }
        else {
            element.parentNode.insertBefore(div, element.nextSibling);
        }

        /* Move the cursor to the new line */
        const range = document.createRange();
        range.setStartBefore(br);
        range.collapse(true);

        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

class RTBlazorfiedListProvider {
    constructor(shadowRoot, content, utilities, nodeManager) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.NodeManager = nodeManager;
    }
    addlist = (type) => {

        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            /* Check if the element is already an OL and replace it */
            if (type == "UL") {
                const list = this.NodeManager.getElementByType(selection.anchorNode, "OL");
                if (list != null) {
                    this.replaceList(list, "UL");
                    return;
                }
            }
            else {
                const list = this.NodeManager.getElementByType(selection.anchorNode, "UL");
                if (list != null) {
                    this.replaceList(list, "OL");
                    return;
                }
            }
            const list = this.NodeManager.getElementByType(selection.anchorNode, type);
            if (list != null) {
                this.removelist(list);
            }
            else {
                const selectedText = selection.toString().trim();
                /* If an entire node is not selected */
                if (selectedText.length === 0) {
                    const range = selection.getRangeAt(0);

                    let node;
                    const ulElement = document.createElement(type);
                    if (selection.anchorNode.parentNode !== this.content) {
                        node = selection.anchorNode.parentNode;
                    }
                    if (selection.anchorNode !== this.content) {
                        node = selection.anchorNode;
                    }
                    if (node.nodeType === Node.ELEMENT_NODE
                        || node.nodeType === Node.TEXT_NODE) {

                        let liElement = document.createElement('li');

                        let clonedContent = node.cloneNode(true);
                        liElement.appendChild(clonedContent);

                        ulElement.appendChild(liElement);

                        node.remove();
                    }
                    range.deleteContents();
                    range.insertNode(ulElement);

                    /* Set the cursor position at the end of the newly inserted element */
                    const newRange = document.createRange();
                    newRange.selectNodeContents(ulElement);
                    newRange.collapse(false); /* Move to the end of the ulElement */

                    const newSelection = window.getSelection();
                    newSelection.removeAllRanges();
                    newSelection.addRange(newRange);
                }
                else {
                    const ulElement = document.createElement(type);

                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectedNodes = range.cloneContents().childNodes;

                        /* Convert NodeList to Array for easier iteration */
                        const selectedElements = Array.from(selectedNodes);

                        /* Iterate over selected elements */
                        selectedElements.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE
                                || node.nodeType === Node.TEXT_NODE) {

                                let liElement = document.createElement('li');

                                let clonedContent = node.cloneNode(true);
                                liElement.appendChild(clonedContent);

                                ulElement.appendChild(liElement);

                                node.remove();
                            }
                        });
                        
                        range.deleteContents();
                        range.insertNode(ulElement);
                        range.selectNodeContents(ulElement);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        }
    }
    replaceList = (list, type) => {
        if (list === null || list === this.content || !this.content.contains(list)) { return; }

        /* Save the current selection range */
        const selection = this.Utilities.getSelection();
        let range, startContainer, startOffset, endContainer, endOffset;
        if (selection !== null && selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            startContainer = range.startContainer;
            startOffset = range.startOffset;
            endContainer = range.endContainer;
            endOffset = range.endOffset;
        }

        /* Replace the list element */
        const element = document.createElement(type);
        while (list.firstChild) {
            element.appendChild(list.firstChild);
        }
        list.parentNode.replaceChild(element, list);

        /* Restore the selection range */
        if (range) {
            const newRange = document.createRange();

            /* Update the containers and offsets if they were inside the replaced list */
            if (list.contains(startContainer)) {
                newRange.setStart(element, startOffset);
            } else {
                newRange.setStart(startContainer, startOffset);
            }

            if (list.contains(endContainer)) {
                newRange.setEnd(element, endOffset);
            } else {
                newRange.setEnd(endContainer, endOffset);
            }

            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    
    removelist = (list) => {
        if (list == null || list == this.content || !this.content.contains(list)) { return; }
        
        /* Variable to store the first node moved out of the list */
        let firstNode = null;

        /* Remove the list */
        while (list.firstChild) {
            const listItem = list.firstChild;

            if (listItem.nodeName === "UL" || listItem.nodeName === "OL") {
                /* If the list item is itself a list, preserve it entirely */
                if (!firstNode) {
                    firstNode = listItem;
                }
                list.parentNode.insertBefore(listItem, list);
            } else {
                /* Move each child node of listItem to before list */
                while (listItem.firstChild) {
                    const child = listItem.firstChild;
                    if (!firstNode) {
                        firstNode = child;
                    }
                    list.parentNode.insertBefore(child, list);
                }

                /* Remove the now empty listItem */
                list.removeChild(listItem);
            }
        }

        /* Remove the ordered list element */
        list.parentNode.removeChild(list);

        /* Set the cursor to the beginning of the first node */
        if (firstNode) {
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                const range = document.createRange();
                range.setStart(firstNode, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
    increaseIndent = (selection, list) => {

        /* Get selected nodes */
        let selectedNodes = this.getSelectedNodes(selection, list);

        /* Check if the previous sibling of the first selected node is a list */
        const firstItem = selectedNodes[0];
        const prevSibling = firstItem.previousElementSibling;
        const nextSibling = firstItem.nextElementSibling;
        let targetList;

        if (nextSibling && nextSibling.nodeName === list.nodeName) {
            // If the previous sibling is a list, use it as the target
            targetList = nextSibling;
        }
        else if (prevSibling && prevSibling.nodeName === list.nodeName) {
            // If the previous sibling is a list, use it as the target
            targetList = prevSibling;
        } else {
            // Otherwise, create a new list
            targetList = document.createElement(list.nodeName);
            list.insertBefore(targetList, firstItem);
        }

        /* Move the selected nodes to the target list */
        selectedNodes.forEach(item => {
            targetList.appendChild(item);
        });

        /*  Restore the selection */
        const newRange = document.createRange();
        /* Reselect the nodes */
        newRange.setStartAfter(targetList.lastChild);
        newRange.setEndAfter(targetList.lastChild);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    decreaseIndent = (list) => {
        /* Check if the list has at least one child */
        if (list.nodeName !== 'UL' && list.nodeName !== 'OL' || list.children.length === 0) {
            return;
        }

        /* Find the parent list element */
        const parentList = list.parentElement;
        if (parentList.nodeName !== 'UL' && parentList.nodeName !== 'OL') {
            this.removelist(list);
            return;
        }

        /* Collect the nodes to move and their nested lists */
        const nodesToMove = Array.from(list.children);
        const fragment = document.createDocumentFragment();

        /* Move each node and its nested lists into the fragment */
        nodesToMove.forEach(node => {
            
            fragment.appendChild(node);

            /* Move nested lists into the fragment as well */
            const nestedLists = node.querySelectorAll('ul, ol');
            nestedLists.forEach(nestedList => {
                fragment.appendChild(nestedList);
            });
        });

        /* Insert nodes from the fragment into the parent list */
        const nextSibling = list.nextSibling;
        parentList.insertBefore(fragment, nextSibling);

        /* Remove the child list from the parent */
        parentList.removeChild(list);
    }
    
    getSelectedNodes = (selection, list) => {
        const selectedNodes = [];

        if (!selection.rangeCount) {
            return null;
        }

        const range = selection.getRangeAt(0);
        if (list !== null) {
            const listItems = list.children; // Get the children directly

            for (let i = 0; i < listItems.length; i++) {
                const li = listItems[i];
                if (range.intersectsNode(li)) {
                    selectedNodes.push(li);
                }
            }
            return selectedNodes;
        }
        return null;
    }
    getList = (el) => {
        while (el) {
            /* Prevent recursion outside the editor */
            if (el === this.content || !this.content.contains(el)) { return; }

            /* Recurse into the closest node and return it */
            if (el.nodeName != "#text" && el.nodeName != "#document") {
                switch (el.nodeName) {
                    case "OL":
                        return el;
                        break;
                    case "UL":
                        return el;
                        break;
                }
            }
            el = el.parentNode;
        }
        return null;
    }
}

class RTBlazorfiedActionOptions {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
    }
    copy = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            if (selection !== null) {
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(selection);
                }
            }
        }
    };
    cut = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            if (selection !== null) {
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(selection);

                    /* Remove the selection */
                    selection.deleteFromDocument();
                }
            }
        }
    };

    paste = () => {
        navigator.clipboard.readText().then(text => {
            if (this.checkParagraphs(text.trim())) {
                return;
            }
            if (this.checkTables(text.trim())) {
                return;
            }
            if (this.checkLines(text.trim())) {
                return;
            }
            this.checkText(text.trim());

        }).catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
    };

    checkParagraphs = (text) => {
        /* See if this node contains paragraphs */
        let paragraphs = text.split(/\n\s*\n/);
        if (paragraphs.length > 1) {
            /* Insert the pasted text at the cursor position */

            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (!selection.rangeCount) { return false; }

                const range = selection.getRangeAt(0);
                range.deleteContents();

                let fragment = document.createDocumentFragment();
                paragraphs.forEach(para => {
                    let checked = this.checkParagraphTable(para, fragment);
                    if (!checked) {
                        checked = this.checkParagraphLines(para, fragment);
                    }
                    if (!checked) {
                        let p = document.createElement('p');
                        p.textContent = para.trim();
                        fragment.appendChild(p);
                    }
                });

                range.insertNode(fragment);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
            }
        }
        return false;
    }

    /* See if the paragraph may also contain lines */
    checkParagraphLines = (text, fragment) => {
        let n = 0;
        let lines = text.trim().split(/\n+/);
        if (lines.length > 1) {
            lines.forEach(line => {
                n++;
                if (n === lines.length) {
                    let p = document.createElement('p');
                    p.textContent = line.trim();
                    fragment.appendChild(p);
                }
                else {
                    let div = document.createElement('div');
                    div.textContent = line.trim();
                    fragment.appendChild(div);
                }
            });
            return true;
        }
        return false;
    }

    /* See if the code may contain a table */
    checkParagraphTable = (text, fragment) => {
        if (this.isTable(text)) {
            /* Create table element */
            let table = this.buildTable(text);
            fragment.appendChild(table);
            return true;
        }
        return false;
    }

    checkLines = (text) => {
        /* Check if its a list of new lines */
        let lines = text.trim().split(/\n+/);

        if (lines.length > 1) {

            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (!selection.rangeCount) { return false; }

                const range = selection.getRangeAt(0);
                range.deleteContents();

                let fragment = document.createDocumentFragment();
                lines.forEach(line => {
                    let div = document.createElement('div');
                    div.textContent = line.trim(); // Set text content of the div
                    fragment.appendChild(div);
                });

                range.insertNode(fragment);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
            }
        }
    }

    checkTables = (text) => {

        if (this.isTable(text)) {

            /* Insert the pasted text at the cursor position */
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (!selection.rangeCount) { return false; }

                const range = selection.getRangeAt(0);
                range.deleteContents();

                let fragment = document.createDocumentFragment();

                let table = this.buildTable(text);

                /* Create table element */
                fragment.appendChild(table);

                range.insertNode(fragment);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
            }
        }
    }

    buildTable = (text) => {
        /* Create table element */
        let table = document.createElement('table');
        //table.style.setProperty('margin', 'auto');

        /* Split the text by lines */
        let lines = text.split('\n');

        /* Create thead and tbody elements */
        let tbody = document.createElement('tbody');

        lines.forEach((line, index) => {
            if (line.trim().length > 0) {
                /* Split each line by tabs */
                let cells = line.split('\t');
                let row = document.createElement('tr');

                cells.forEach(cell => {
                    /* Create table cell element */
                    let cellElement = document.createElement('td');
                    if (cell.trim().length > 0) {
                        cellElement.textContent = cell;
                    }
                    row.appendChild(cellElement);
                });

                /* Append row to the thead or tbody based on index */
                tbody.appendChild(row);
            }
        });

        /* Append thead and tbody to the table */
        table.appendChild(tbody);
        return table;
    }

    isTable = (text) => {
        if (text.includes('\t')) {
            /* Split the text by lines */
            let lines = text.split('\n');

            /* Check the number of tabs in the subsequent lines */
            if (lines.length > 1 && lines[1].trim().length > 0) {
                let expectedTabs = (lines[1].match(/\t/g) || []).length;
                if (expectedTabs === 0) {
                    return false;
                }
                else {
                    for (let i = 1; i < lines.length; i++) {
                        let line = lines[i];
                        if (line.trim().length > 0) {
                            let tabCount = (line.match(/\t/g) || []).length;

                            if (tabCount !== expectedTabs) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            }
        }

        return false;
    }

    checkText = (text) => {
        /* Insert the pasted text at the cursor position */
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            if (!selection.rangeCount) { return false; }

            const range = selection.getRangeAt(0);
            range.deleteContents();

            if (this.content.innerHTML.trim() === '') {
                /* Create a div and insert the text node into it */
                const div = document.createElement('div');
                const textNode = document.createTextNode(text);
                div.appendChild(textNode);
                range.insertNode(div);

                /* Move the cursor to the end of the newly pasted text */
                range.setStartAfter(div);
                range.setEndAfter(div);
            }
            else {
                /* Default: Insert a text node */
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);

                /* Move the cursor to the end of the newly pasted text */
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}
class RTBlazorfiedUtilities {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;
    }

    closeDialog = (id, savedSelection) => {
        const e = this.shadowRoot.getElementById(id);
        if (e != null) {
            e.close();
        }
        if (savedSelection) {
            this.restoreSelection(window.getSelection(), savedSelection);
        }
        this.content.focus();
    }
    addClasses = (classlist, element) => {
        if (classlist == null || element == null) { return; }

        /* Clear the classes */
        element.classList.remove(...element.classList);

        /* Read classes, if necessary */
        if (classlist.length > 0) {
            const classNames = classlist.split(' ').map(className => className.trim());

            /* Add each class to the element's class list */
            classNames.forEach(className => {
                if (className) {
                    element.classList.add(className);
                }
            });
        }
        else {
            if (element.hasAttribute('class')) {
                element.removeAttribute('class');
            }
        }
    }

    getSelection = () => {
        const selection = this.shadowRoot.getSelection();
        if (this.content.contains(selection.anchorNode) && this.content.contains(selection.focusNode)) {
            return selection;
        }
        return null;
    }

    showFadingBar = (message) => {
        const fadingBar = this.shadowRoot.getElementById('rich-text-box-message-bar');
        const messageElement = fadingBar.querySelector('.rich-text-box-message');

        /* Check if fadingBar and messageElement exist */
        if (fadingBar && messageElement) {

            /* Set the custom message */
            messageElement.textContent = message;

            /* Remove the hidden class to show the fading bar */
            fadingBar.classList.remove('rich-text-box-message-hidden');

            /* Hide the fading bar after a delay */
            setTimeout(() => {
                this.closeFadingBar();
            }, 2000);
        }
    }
    closeFadingBar = () => {
        const fadingBar = this.shadowRoot.getElementById('rich-text-box-message-bar');
        fadingBar.classList.add('rich-text-box-message-hidden');
    }

    saveSelection = (selection) => {
        if (selection && selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange();
        }
        return null;
    }
    restoreSelection = (selection, savedSelection) => {
        if (selection && savedSelection) {
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        }
        this.content.focus();
    }
    reselectNode = (node) => {
        /* Set the selection after the new link */
        const newRange = document.createRange();
        const selection = window.getSelection();
        if (node.childNodes.length > 0) {
            newRange.setStartAfter(node.childNodes[node.childNodes.length - 1]);
        } else {
            newRange.setStartAfter(node);
        }
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    saveCaretPosition = () => {
        const selection = this.getSelection();
        if (selection !== null) {
            let startOffset = selection.getRangeAt(0).startOffset;
            let endOffset = selection.getRangeAt(0).endOffset;

            return { startOffset, endOffset };
        }
        return null;
    }
    restoreCaretPosition = (element, savedPos) => {
        const selection = this.getSelection();
        if (selection !== null && savedPos !== null) {
            let range = document.createRange();
            range.setStart(element.firstChild, savedPos.startOffset);
            range.setEnd(element.firstChild, savedPos.endOffset);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    saveScroll = (element) => {
        return element.scrollTop;
    };
    restoreScroll = (element, scrollTop) => {
        element.scrollTop = scrollTop;
    };
}
class RTBlazorfiedTableDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }

    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-table-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertTable();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    openTableDialog = (selection) => {
        this.resetTableDialog();
        this.savedSelection = this.Utilities.saveSelection(selection);

        if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content && selection.anchorNode.parentNode.nodeName === "TD") {

            const table = this.getTable(selection);
            if (table) {
                const rows = this.shadowRoot.getElementById("rich-text-box-table-rows");
                rows.value = table.rows.length;
                rows.disabled = true;

                const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
                columns.value = this.getColumns(table);
                columns.disabled = true;

                const width = this.shadowRoot.getElementById("rich-text-box-table-width");
                width.value = table.style.width;

                const classes = this.shadowRoot.getElementById("rich-text-box-table-classes");
                if (classes != null) {
                    const classList = table.classList;
                    classes.value = Array.from(classList).join(' ');
                }

                this.table = table;
            }
        }
        else {
            if (selection !== null && selection.rangeCount > 0) {
                this.tableSelection = selection.getRangeAt(0).cloneRange();
            }
        }

        this.shadowRoot.getElementById("rich-text-box-table-modal").show();

        const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
        if (columns) {
            columns.focus();
        }
    }
    getTable = (selection) => {
        if (selection.anchorNode.parentNode.parentNode.parentNode.nodeName === "TABLE") {
            return selection.anchorNode.parentNode.parentNode.parentNode;
        }
        if (selection.anchorNode.parentNode.parentNode.parentNode.parentNode.nodeName === "TABLE") {
            return selection.anchorNode.parentNode.parentNode.parentNode.parentNode;
        }
    }
    getColumns(table) {
        let maxColumns = 0;

        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            let numColumns = row.cells.length;
            if (numColumns > maxColumns) {
                maxColumns = numColumns;
            }
        }

        return maxColumns;
    }
    resetTableDialog = () => {
        this.table = null;
        this.tableSelection = null;

        const rows = this.shadowRoot.getElementById("rich-text-box-table-rows");
        rows.value = null;
        rows.disabled = false;

        const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
        columns.value = null;
        columns.disabled = false;

        const width = this.shadowRoot.getElementById("rich-text-box-table-width");
        width.value = null;

        const classes = this.shadowRoot.getElementById("rich-text-box-table-classes");
        if (classes != null) {
            classes.value = null;
        }
    }

    insertTable = () => {
        const rows = this.shadowRoot.getElementById("rich-text-box-table-rows");
        const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
        const width = this.shadowRoot.getElementById("rich-text-box-table-width");
        const classes = this.shadowRoot.getElementById("rich-text-box-table-classes");

        if (rows.value.length == 0 || columns.value.length == 0) {
            this.closeDialog();
            return;
        }

        /* Get the link selection or element */
        if (this.table !== null) {
            if (width.value.trim().length > 0) {
                this.table.style.width = width.value;
            }
            else {
                this.table.style.removeProperty('width');
                if (this.table.style.cssText.trim().length === 0) {
                    if (this.table.hasAttribute('style')) {
                        this.table.removeAttribute('style');
                    }
                }
            }
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, this.table);
            }
            this.Utilities.reselectNode(this.table);
        }
        else {
            if (this.tableSelection != null) {
                const range = this.tableSelection;
                const table = this.createTable(rows.value, columns.value, width.value);
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, table);
                }
                range.deleteContents();
                range.insertNode(table);

                /* Set the cursor position to the first cell of the table */
                let firstCell = table.querySelector('td, th');
                let newRange = document.createRange();
                newRange.setStart(firstCell, 0);
                newRange.setEnd(firstCell, 0);

                this.savedSelection = newRange;
            }
        }

        this.closeDialog();
    }
    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-table-modal", this.savedSelection);
    }
    createTable = (r, c, w) => {
        const rows = parseInt(r, 10);
        const columns = parseInt(c, 10);

        /* Create the table element */
        const table = document.createElement('table');
        if (w) {
            table.style.width = w;
        }
        const tbody = document.createElement('tbody');

        /* Iterate the rows */
        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');

            /* Iterate the columns */
            for (let j = 0; j < columns; j++) {
                const td = document.createElement('td');
                td.innerHTML = `&#8203;`;
                tr.appendChild(td);
            }

            /* Append the row to the tbody */
            tbody.appendChild(tr);
        }

        // Append the tbody to the table
        table.appendChild(tbody);

        return table;
    }
    tableTab = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            if (!selection.rangeCount) return;

            const activeElement = selection.anchorNode.parentNode;

            // Find the next focusable <td>
            const nextElement = this.getNextElement(activeElement);

            // Focus the next element if it exists
            if (nextElement) {
                nextElement.focus();
                const range = document.createRange();
                range.selectNodeContents(nextElement);
                if (nextElement.innerText === '\u200B') {
                    range.collapse();
                }
                selection.removeAllRanges();
                selection.addRange(range);
            }
            this.content.focus();
        }
    }
    getNextElement = (currentElement) => {
        let nextElement = currentElement.nextElementSibling;

        // If there is no next sibling, try to find the next <td> in the next row
        if (!nextElement) {
            let nextRow = currentElement.parentElement.nextElementSibling;
            if (nextRow) {
                nextElement = nextRow.querySelector('td');
            }
        }
        return nextElement;
    }
}
class RTBlazorfiedMediaDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }

    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-embed-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertMedia();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    openMediaDialog = (selection) => {
        if (selection !== null) {
            this.resetMediaDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            if (selection.anchorNode && selection.anchorNode.querySelector) {
                this.embed = selection.anchorNode.querySelector('object');

                if (this.embed !== null) {
                    const source = this.shadowRoot.getElementById('rich-text-box-embed-source');
                    source.value = this.embed.data;

                    const width = this.shadowRoot.getElementById('rich-text-box-embed-width');
                    width.value = this.embed.width;

                    const height = this.shadowRoot.getElementById('rich-text-box-embed-height');
                    height.value = this.embed.height;

                    const type = this.shadowRoot.getElementById('rich-text-box-embed-type');
                    type.value = this.embed.type;

                    const classes = this.shadowRoot.getElementById('rich-text-box-embed-css-classes');
                    classes.value = Array.from(this.embed.classList).join(' ');
                }

            }

            if (selection.rangeCount > 0) {
                this.embedSelection = selection.getRangeAt(0).cloneRange();
            }

            this.shadowRoot.getElementById("rich-text-box-embed-modal").show();

            const source = this.shadowRoot.getElementById("rich-text-box-embed-source");
            if (source) {
                source.focus();
            }
        }
    }
    resetMediaDialog = () => {
        this.embed = null;
        this.embedSelection = null;

        const source = this.shadowRoot.getElementById('rich-text-box-embed-source');
        source.value = null;

        const width = this.shadowRoot.getElementById('rich-text-box-embed-width');
        width.value = null;

        const height = this.shadowRoot.getElementById('rich-text-box-embed-height');
        height.value = null;

        const type = this.shadowRoot.getElementById('rich-text-box-embed-type');
        type.value = null;

        const classes = this.shadowRoot.getElementById('rich-text-box-embed-css-classes');
        if (classes != null) {
            classes.value = null;
        }
    }
    insertMedia = () => {
        const source = this.shadowRoot.getElementById('rich-text-box-embed-source');
        const width = this.shadowRoot.getElementById('rich-text-box-embed-width');
        const height = this.shadowRoot.getElementById('rich-text-box-embed-height');
        const type = this.shadowRoot.getElementById('rich-text-box-embed-type');
        const classes = this.shadowRoot.getElementById('rich-text-box-embed-css-classes');

        if (this.embed !== null) {
            this.embed.data = source.value;
            if (type.value.trim().length > 0) {
                this.embed.type = type.value;
            }
            else {
                if (this.embed.hasAttribute('type')) {
                    this.embed.removeAttribute('type');
                }
            }
            if (width.value.trim().length > 0) {
                this.embed.width = width.value;
            }
            else {
                if (this.embed.hasAttribute('width')) {
                    this.embed.removeAttribute('width');
                }
            }
            if (height.value.trim().length > 0) {
                this.embed.height = height.value;
            }
            else {
                if (this.embed.hasAttribute('height')) {
                    this.embed.removeAttribute('height');
                }
            }
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, this.embed);
            }
        }
        else {
            if (this.embedSelection != null && source.value.length > 0) {

                const range = this.embedSelection.cloneRange();

                /* Create the <code> element */
                const object = document.createElement('object');

                /* Set the content of the <code> element */
                object.data = source.value;
                if (type.value.trim().length > 0) {
                    object.type = type.value;
                }
                else {
                    if (object.hasAttribute('type')) {
                        object.removeAttribute('type');
                    }
                }
                if (width.value.trim().length > 0) {
                    object.width = width.value;
                }
                else {
                    if (object.hasAttribute('width')) {
                        object.removeAttribute('width');
                    }
                }
                if (height.value.trim().length > 0) {
                    object.height = height.value;
                }
                else {
                    if (object.hasAttribute('height')) {
                        object.removeAttribute('height');
                    }
                }
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, object);
                }

                range.deleteContents();
                range.insertNode(object);

                this.Utilities.reselectNode(object);

                /* Update the stored cursor position to the new position */
                this.embedSelection = range.cloneRange();
            }
        }
        

        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-embed-modal", this.savedSelection);
    }
}
class RTBlazorfiedVideoDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.video = null;
        this.videoSelection = null;
        this.savedSelection = null;
        this.addEventListeners();
    }

    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-video-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertVideo();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    _populateFromVideo = (videoEl) => {
        const ge = (id) => this.shadowRoot.getElementById(id);
        const sourceEl = videoEl.querySelector('source');
        ge('rich-text-box-video-source').value      = sourceEl ? (sourceEl.getAttribute('src') || '') : (videoEl.getAttribute('src') || '');
        ge('rich-text-box-video-source-type').value = sourceEl ? (sourceEl.getAttribute('type') || '') : '';
        ge('rich-text-box-video-poster').value      = videoEl.getAttribute('poster') || '';
        ge('rich-text-box-video-width').value       = videoEl.getAttribute('width')  || '';
        ge('rich-text-box-video-height').value      = videoEl.getAttribute('height') || '';
        ge('rich-text-box-video-controls').checked  = videoEl.hasAttribute('controls');
        ge('rich-text-box-video-autoplay').checked  = videoEl.hasAttribute('autoplay');
        ge('rich-text-box-video-loop').checked      = videoEl.hasAttribute('loop');
        ge('rich-text-box-video-muted').checked     = videoEl.hasAttribute('muted');
        ge('rich-text-box-video-css-classes').value = Array.from(videoEl.classList).join(' ');
    }

    _showDialog = () => {
        this.shadowRoot.getElementById("rich-text-box-video-modal").show();
        this.shadowRoot.getElementById("rich-text-box-video-source").focus();
    }

    openVideoDialog = (selection) => {
        if (selection !== null) {
            this.resetVideoDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            // Find a video in the selection: check the anchor node itself,
            // its descendants, and its parent chain so all click scenarios work.
            const anchorNode = selection.anchorNode;
            if (anchorNode) {
                if (anchorNode.nodeName === 'VIDEO') {
                    this.video = anchorNode;
                } else if (anchorNode.nodeName === 'SOURCE' && anchorNode.parentElement?.nodeName === 'VIDEO') {
                    this.video = anchorNode.parentElement;
                } else if (anchorNode.querySelector) {
                    this.video = anchorNode.querySelector('video');
                }
                if (!this.video && anchorNode.closest) {
                    this.video = anchorNode.closest('video');
                }
            }

            if (this.video !== null) {
                this._populateFromVideo(this.video);
            }

            if (selection.rangeCount > 0) {
                this.videoSelection = selection.getRangeAt(0).cloneRange();
            }

            this._showDialog();
        }
    }

    openVideoDialogForElement = (videoEl, savedSelection) => {
        this.resetVideoDialog();
        this.savedSelection = savedSelection;
        this.video = videoEl;
        this._populateFromVideo(videoEl);
        // Capture the current range so insertVideo can reselectNode correctly
        const sel = this.Utilities.getSelection();
        if (sel && sel.rangeCount > 0) {
            this.videoSelection = sel.getRangeAt(0).cloneRange();
        }
        this._showDialog();
    }

    resetVideoDialog = () => {
        this.video = null;
        this.videoSelection = null;
        const ge = (id) => this.shadowRoot.getElementById(id);
        ge('rich-text-box-video-source').value      = '';
        ge('rich-text-box-video-source-type').value = '';
        ge('rich-text-box-video-poster').value      = '';
        ge('rich-text-box-video-width').value       = '';
        ge('rich-text-box-video-height').value      = '';
        ge('rich-text-box-video-controls').checked  = true;   // sensible default: show controls
        ge('rich-text-box-video-autoplay').checked  = false;
        ge('rich-text-box-video-loop').checked      = false;
        ge('rich-text-box-video-muted').checked     = false;
        ge('rich-text-box-video-css-classes').value = '';
    }

    insertVideo = () => {
        const ge      = (id) => this.shadowRoot.getElementById(id);
        const src      = ge('rich-text-box-video-source').value.trim();
        const srcType  = ge('rich-text-box-video-source-type').value.trim();
        const poster   = ge('rich-text-box-video-poster').value.trim();
        const width    = ge('rich-text-box-video-width').value.trim();
        const height   = ge('rich-text-box-video-height').value.trim();
        const controls = ge('rich-text-box-video-controls').checked;
        const autoplay = ge('rich-text-box-video-autoplay').checked;
        const loop     = ge('rich-text-box-video-loop').checked;
        const muted    = ge('rich-text-box-video-muted').checked;
        const classes  = ge('rich-text-box-video-css-classes').value.trim();

        const applyAttrs = (videoEl) => {
            /* <source> child */
            let sourceEl = videoEl.querySelector('source');
            if (!sourceEl) {
                sourceEl = document.createElement('source');
                videoEl.appendChild(sourceEl);
            }
            sourceEl.setAttribute('src', src);
            if (srcType) sourceEl.setAttribute('type', srcType);
            else         sourceEl.removeAttribute('type');

            /* Poster */
            if (poster) videoEl.setAttribute('poster', poster);
            else        videoEl.removeAttribute('poster');

            /* Dimensions */
            if (width)  videoEl.setAttribute('width',  width);
            else        videoEl.removeAttribute('width');
            if (height) videoEl.setAttribute('height', height);
            else        videoEl.removeAttribute('height');

            /* Boolean attributes — set via setAttribute so they appear in innerHTML */
            controls ? videoEl.setAttribute('controls', '') : videoEl.removeAttribute('controls');
            autoplay ? videoEl.setAttribute('autoplay', '') : videoEl.removeAttribute('autoplay');
            loop     ? videoEl.setAttribute('loop',     '') : videoEl.removeAttribute('loop');
            muted    ? videoEl.setAttribute('muted',    '') : videoEl.removeAttribute('muted');

            /* CSS classes */
            this.Utilities.addClasses(classes, videoEl);
        };

        if (this.video !== null) {
            /* Editing an existing <video> */
            applyAttrs(this.video);
        }
        else if (this.videoSelection !== null && src.length > 0) {
            /* Inserting a new <video> — must land at block scope inside this.content.
               <video> is treated as block-level; it must never be nested inside
               phrasing elements (<p>, <h1>–<h6>, <span>, <a>, etc.) and must
               never be inserted outside the editor's content area. */
            const range = this.videoSelection.cloneRange();

            // ── Scope guard: abort silently if the range is outside this.content ──
            if (!this.content.contains(range.startContainer)) {
                this.closeDialog();
                return;
            }

            const videoEl = document.createElement('video');
            applyAttrs(videoEl);
            range.deleteContents();

            let anchor = range.startContainer;

            if (anchor === this.content) {
                // Caret is directly inside the content div — insert at offset.
                const ref = this.content.childNodes[range.startOffset] ?? null;
                this.content.insertBefore(videoEl, ref);
            } else {
                // Walk up from the caret to the direct child of this.content,
                // escaping any phrasing-content ancestors along the way.
                while (anchor.parentNode && anchor.parentNode !== this.content) {
                    anchor = anchor.parentNode;
                    if (!this.content.contains(anchor)) {
                        // Strayed outside — safe fallback: append at end of content.
                        this.content.appendChild(videoEl);
                        this._placeCursorAfterVideo(videoEl);
                        this.videoSelection = null;
                        this.closeDialog();
                        return;
                    }
                }
                // Insert <video> as the next sibling of the enclosing block element.
                this.content.insertBefore(videoEl, anchor.nextSibling);
            }

            this._placeCursorAfterVideo(videoEl);
            this.videoSelection = null;
        }

        this.closeDialog();
    }

    _placeCursorAfterVideo = (videoEl) => {
        // Ensure there is a paragraph after the video so the cursor can land
        // beyond it. Without one, a video at the end of the content area has
        // nothing to click into.
        if (!videoEl.nextSibling) {
            const p = document.createElement('p');
            p.appendChild(document.createElement('br'));
            this.content.insertBefore(p, videoEl.nextSibling);
        }
        // Store a reference so closeDialog can position the caret after the
        // dialog is dismissed and the content area has focus again.
        // Do NOT manipulate the selection here — the dialog still has focus,
        // so this.Utilities.getSelection() returns null and would throw.
        this._insertedVideo = videoEl;
    }

    closeDialog = () => {
        const insertedVideo = this._insertedVideo;
        this._insertedVideo = null;
        this.Utilities.closeDialog("rich-text-box-video-modal", this.savedSelection);
        // Place the caret at the start of the element that follows the video.
        // This runs after the dialog is closed and the content area is focused,
        // so the selection assignment is safe.
        if (insertedVideo) {
            const after = insertedVideo.nextSibling;
            if (after) {
                const newRange = document.createRange();
                const target = after.firstChild ?? after;
                newRange.setStart(target, 0);
                newRange.collapse(true);
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
            }
        }
    }
}
class RTBlazorfiedCodeBlockDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }

    addEventListeners = () => {
        const code = this.shadowRoot.getElementById('rich-text-box-code');
        this.dialog = this.shadowRoot.getElementById("rich-text-box-code-block-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                /* Make certain the user is not pressing enter in the code block */
                if (event.target !== code) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.insertCodeBlock();
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    openCodeBlockDialog = (selection) => {
        if (selection !== null) {
            this.resetCodeBlockDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            const code = this.shadowRoot.getElementById('rich-text-box-code');
            const classes = this.shadowRoot.getElementById('rich-text-box-code-css-classes');

            if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "CODE") {

                const clone = selection.anchorNode.parentNode.cloneNode(true);
                code.value = clone.textContent;

                if (classes != null) {
                    const classList = selection.anchorNode.parentNode.classList;
                    classes.value = Array.from(classList).join(' ');
                }

                this.codeSelection = selection.getRangeAt(0).cloneRange();
                this.code = selection.anchorNode.parentNode;
            }
            else {
                if (selection.rangeCount > 0) {
                    this.codeSelection = selection.getRangeAt(0).cloneRange();
                }
            }

            this.shadowRoot.getElementById("rich-text-box-code-block-modal").show();

            if (code) {
                code.focus();
                code.scrollTop = 0;
                code.scrollLeft = 0;
            }
        }
    }
    resetCodeBlockDialog = () => {
        this.code = null;
        this.codeSelection = null;

        const code = this.shadowRoot.getElementById("rich-text-box-code");
        code.value = null;

        const css = this.shadowRoot.getElementById("rich-text-box-code-css-classes");
        if (css != null) {
            css.value = null;
        }
    }
    insertCodeBlock = () => {
        const codeText = this.shadowRoot.getElementById("rich-text-box-code");
        const classes = this.shadowRoot.getElementById("rich-text-box-code-css-classes");

        if (this.code != null) {
            const element = this.code;
            element.textContent = codeText.value;
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, element);
            }
            this.Utilities.reselectNode(element);
        }
        else {
            if (this.codeSelection != null && codeText.value.length > 0) {

                const range = this.codeSelection.cloneRange();

                /* Create the <pre> element */
                const pre = document.createElement('pre');

                /* Create the <code> element */
                const code = document.createElement('code');
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, code);
                }

                /* Set the content of the <code> element */
                code.textContent = codeText.value;

                /* Append the <code> element to the <pre> element */
                pre.appendChild(code);

                range.deleteContents();
                range.insertNode(pre);
                range.setStartAfter(pre.lastChild);
                range.setEndAfter(pre.lastChild);
                
                this.savedSelection = range;
            }
        }
        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-code-block-modal", this.savedSelection);
    }
}
class RTBlazorfiedBlockQuoteDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }
    addEventListeners = () => {
        const quote = this.shadowRoot.getElementById('rich-text-box-quote');
        this.dialog = this.shadowRoot.getElementById("rich-text-box-block-quote-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                /* Make certain the user is not pressing enter in the quote block */
                if (event.target !== quote) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.insertBlockQuote();
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }
    openBlockQuoteDialog = (selection) => {
        if (selection !== null) {
            this.resetBlockQuoteDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            const quote = this.shadowRoot.getElementById('rich-text-box-quote');
            const cite = this.shadowRoot.getElementById('rich-text-box-cite');
            const classes = this.shadowRoot.getElementById('rich-text-box-quote-css-classes');


            if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName == "BLOCKQUOTE") {
                quote.value = selection.anchorNode.parentNode.textContent;

                if (selection.anchorNode.parentNode.cite != null) {
                    cite.value = selection.anchorNode.parentNode.cite;
                }
                if (classes != null) {
                    const classList = selection.anchorNode.parentNode.classList;
                    classes.value = Array.from(classList).join(' ');
                }

                this.quoteSelection = selection.getRangeAt(0).cloneRange();
                this.quote = selection.anchorNode.parentNode;
            }
            else {
                if (selection.rangeCount > 0) {
                    this.quoteSelection = selection.getRangeAt(0).cloneRange();
                }
            }

            this.shadowRoot.getElementById("rich-text-box-block-quote-modal").show();
            if (quote) {
                quote.focus();
                quote.scrollTop = 0;
                quote.scrollLeft = 0;
            }
        }

    }
    resetBlockQuoteDialog = () => {
        this.quote = null;
        this.quoteSelection = null;

        const quote = this.shadowRoot.getElementById("rich-text-box-quote");
        quote.value = null;

        const cite = this.shadowRoot.getElementById("rich-text-box-cite");
        cite.value = null;

        const css = this.shadowRoot.getElementById("rich-text-box-quote-css-classes");
        if (css != null) {
            css.value = null;
        }
    }
    insertBlockQuote = () => {
        const quote = this.shadowRoot.getElementById("rich-text-box-quote");
        const cite = this.shadowRoot.getElementById("rich-text-box-cite");
        const classes = this.shadowRoot.getElementById("rich-text-box-quote-css-classes");

        if (this.quote != null) {
            const element = this.quote;
            element.textContent = quote.value;
            if (cite.value.trim().length > 0) {
                element.setAttribute('cite', cite.value);
            }
            else {
                if (element.hasAttribute('cite')) {
                    element.removeAttribute('cite');
                }
            }
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, element);
            }

            this.Utilities.reselectNode(element);
        }
        else {
            if (this.quoteSelection != null && quote.value.length > 0) {

                const range = this.quoteSelection.cloneRange();

                const blockquote = document.createElement("blockquote");
                blockquote.textContent = quote.value;
                if (cite.value.trim().length > 0) {
                    blockquote.cite = cite.value;
                }
                else {
                    if (blockquote.hasAttribute('cite')) {
                        blockquote.removeAttribute('cite');
                    }
                }
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, blockquote);
                }

                range.deleteContents();
                range.insertNode(blockquote);
                range.setStartAfter(blockquote.lastChild);
                range.setEndAfter(blockquote.lastChild);

                this.savedSelection = range;
            }
        }
        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-block-quote-modal", this.savedSelection);
    }
}

class RTBlazorfiedUploadImageDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }
    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-upload-image-modal");
        if (this.dialog) {
            this.dialog.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.insertUploadedImage();
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    this.closeDialog();
                }
            });
        }
        
        const actualBtn = this.shadowRoot.getElementById('rich-text-box-upload-image-file');
        actualBtn.addEventListener('change', this.handleFileSelect);
    }
    handleFileSelect = (event) => {
        const file = event.target.files[0]; // Get the selected file

        const fileChosen = this.shadowRoot.getElementById('rich-text-box-upload-image-file-chosen');
        fileChosen.textContent = file.name

        const image = document.createElement("img");
        if (file) {
            const reader = new FileReader();
            reader.onloadend = function () {
                /* Get the base-64 encoded string from the data URL */
                this.base64String = reader.result.split(',')[1];
                image.src = `data:image/jpg;base64,${this.base64String}`;
            };
            /* Read the file as a data URL */
            reader.readAsDataURL(file);
            this.image = image;
        }
    }

    openUploadImageDialog = (selection) => {
        if (selection !== null) {
            this.resetUploadImageDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            if (selection.anchorNode && selection.anchorNode.querySelector) {
                this.currentImage = selection.anchorNode.querySelector('img');
                if (this.currentImage !== null) {
                    const width = this.shadowRoot.getElementById("rich-text-box-upload-image-width");
                    width.value = this.currentImage.width;

                    const height = this.shadowRoot.getElementById("rich-text-box-upload-image-height");
                    height.value = this.currentImage.height;

                    const alt = this.shadowRoot.getElementById("rich-text-box-upload-image-alt-text");
                    alt.value = this.currentImage.alt;

                    const classes = this.shadowRoot.getElementById("rich-text-box-upload-image-css-classes");
                    classes.value = Array.from(this.currentImage.classList).join(' ');
                }
            }

            this.range = selection.getRangeAt(0).cloneRange();
            this.shadowRoot.getElementById("rich-text-box-upload-image-modal").show();

            const fileBrowser = this.shadowRoot.getElementById("rich-text-box-upload-btn");
            if (fileBrowser) {
                fileBrowser.focus();
            }
        }
    }
    resetUploadImageDialog = () => {
        this.currentImage = null;
        this.image = null;
        this.range = null;

        const fileChosen = this.shadowRoot.getElementById('rich-text-box-upload-image-file-chosen');
        fileChosen.textContent = null;

        const address = this.shadowRoot.getElementById("rich-text-box-upload-image-file");
        address.value = null;

        const width = this.shadowRoot.getElementById("rich-text-box-upload-image-width");
        width.value = null;

        const height = this.shadowRoot.getElementById("rich-text-box-upload-image-height");
        height.value = null;

        const alt = this.shadowRoot.getElementById("rich-text-box-upload-image-alt-text");
        alt.value = null;

        const classes = this.shadowRoot.getElementById("rich-text-box-upload-image-css-classes");
        if (classes != null) {
            classes.value = null;
        }
    }
    insertUploadedImage = () => {

        const width = this.shadowRoot.getElementById("rich-text-box-upload-image-width");
        const height = this.shadowRoot.getElementById("rich-text-box-upload-image-height");
        const alt = this.shadowRoot.getElementById("rich-text-box-upload-image-alt-text");
        const classes = this.shadowRoot.getElementById("rich-text-box-upload-image-css-classes");

        if (this.currentImage) {
            if (this.image && this.image.src.length > 0) {
                this.currentImage.src = this.image.src;
            }
            if (width.value.trim().length > 0) {
                this.currentImage.width = width.value;
            }
            else {
                if (this.currentImage.hasAttribute('width')) {
                    this.currentImage.removeAttribute('width');
                }
            }
            if (height.value.trim().length > 0) {
                this.currentImage.height = height.value;
            }
            else {
                if (this.currentImage.hasAttribute('height')) {
                    this.currentImage.removeAttribute('height');
                }
            }
            if (alt.value.trim().length > 0) {
                this.currentImage.alt = alt.value;
            }
            else {
                if (this.currentImage.hasAttribute('alt')) {
                    this.currentImage.removeAttribute('alt');
                }
            }
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, this.currentImage);
            }
            this.Utilities.reselectNode(this.currentImage);
        }
        else {
            if (this.image) {
                if (width.value.length > 0) {
                    this.image.width = width.value;
                }
                else {
                    if (this.image.hasAttribute('width')) {
                        this.image.removeAttribute('width');
                    }
                }
                if (height.value.length > 0) {
                    this.image.height = height.value;
                }
                else {
                    if (this.image.hasAttribute('height')) {
                        this.image.removeAttribute('height');
                    }
                }
                if (alt.value.length > 0) {
                    this.image.alt = alt.value;
                }
                else {
                    if (this.image.hasAttribute('alt')) {
                        this.image.removeAttribute('alt');
                    }
                }
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, this.image);
                }
                this.range.deleteContents();
                this.range.insertNode(this.image);

                this.Utilities.reselectNode(this.image);
            }
        }

        
        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-upload-image-modal", this.savedSelection);
    }
}
class RTBlazorfiedImageDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }
    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-image-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertImage();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    openImageDialog = (selection) => {
        if (selection !== null) {
            this.resetImageDialog();
            this.savedSelection = this.Utilities.saveSelection(selection);

            if (selection.anchorNode && selection.anchorNode.querySelector) {
                this.image = selection.anchorNode.querySelector('img');
                if (this.image !== null) {
                    const address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
                    address.value = this.image.src;

                    const width = this.shadowRoot.getElementById("rich-text-box-image-width");
                    width.value = this.image.width;

                    const height = this.shadowRoot.getElementById("rich-text-box-image-height");
                    height.value = this.image.height;

                    const alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");
                    alt.value = this.image.alt;

                    const classes = this.shadowRoot.getElementById("rich-text-box-image-css-classes");
                    classes.value = Array.from(this.image.classList).join(' ');
                }
                
            }
            
            if (selection && selection.rangeCount > 0) {
                this.imageSelection = selection.getRangeAt(0).cloneRange();
            }

            this.shadowRoot.getElementById("rich-text-box-image-modal").show();

            const address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
            if (address) {
                address.focus();
            }
        }
    }
    resetImageDialog = () => {
        this.image = null;
        this.imageSelection = null;

        const address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        address.value = null;

        const width = this.shadowRoot.getElementById("rich-text-box-image-width");
        width.value = null;

        const height = this.shadowRoot.getElementById("rich-text-box-image-height");
        height.value = null;

        const alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");
        alt.value = null;

        const classes = this.shadowRoot.getElementById("rich-text-box-image-css-classes");
        if (classes != null) {
            classes.value = null;
        }
    }
    insertImage = () => {
        const address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        const width = this.shadowRoot.getElementById("rich-text-box-image-width");
        const height = this.shadowRoot.getElementById("rich-text-box-image-height");
        const alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");
        const classes = this.shadowRoot.getElementById("rich-text-box-image-css-classes");
        
        if (this.imageSelection !== null) {
            const range = this.imageSelection.cloneRange();

            if (this.image !== null) {
                if (address.value.trim().length > 0) {
                    this.image.src = address.value;
                }
                if (alt.value.trim().length > 0) {
                    this.image.alt = alt.value;
                }
                else {
                    if (this.image.hasAttribute('alt')) {
                        this.image.removeAttribute('alt');
                    }
                }
                if (width.value.trim().length > 0) {
                    this.image.width = width.value;
                }
                else {
                    if (this.image.hasAttribute('width')) {
                        this.image.removeAttribute('width');
                    }
                }
                if (height.value.trim().length > 0) {
                    this.image.height = height.value;
                }
                else {
                    if (this.image.hasAttribute('height')) {
                        this.image.removeAttribute('height');
                    }
                }
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, this.image);
                }
                this.Utilities.reselectNode(this.image);
            }
            else {
                if (address.value.length > 0) {

                    const img = document.createElement("img");
                    img.src = address.value;
                    if (width.value.trim().length > 0) {
                        img.width = width.value;
                    }
                    if (height.value.trim().length > 0) {
                        img.height = height.value;
                    }
                    if (alt.value.trim().length > 0) {
                        img.alt = alt.value;
                    }
                    if (classes !== null) {
                        this.Utilities.addClasses(classes.value, img);
                    }

                    range.deleteContents();
                    range.insertNode(img);

                    this.Utilities.reselectNode(img);
                }
            }           

            /* Update the stored cursor position to the new position */
            this.imageSelection = range.cloneRange();
        }
        
        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-image-modal", this.savedSelection);
    }
}
class RTBlazorfiedLinkDialog {
    constructor(shadowRoot, content, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.Utilities = utilities;
        this.addEventListeners();
    }
    addEventListeners = () => {
        this.dialog = this.shadowRoot.getElementById("rich-text-box-link-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertLink();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }
    openLinkDialog = (selection) => {
        if (selection !== null) {
            this.savedSelection = this.Utilities.saveSelection(selection);
            this.resetLinkDialog();

            if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "A") {
                const linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
                linktext.value = selection.anchorNode.parentNode.textContent;

                const link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
                link.value = selection.anchorNode.parentNode.getAttribute("href");

                const classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");
                if (classes != null) {
                    const classList = selection.anchorNode.parentNode.classList;
                    classes.value = Array.from(classList).join(' ');
                }

                const target = selection.anchorNode.parentNode.getAttribute('target');
                if (target === '_blank') {
                    const newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
                    newtab.checked = true;
                }

                this.linkNode = selection.anchorNode.parentNode;
            }
            else {
                const linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
                if (selection.toString().length > 0) {
                    this.linkSelection = selection.getRangeAt(0).cloneRange();
                    linktext.value = this.linkSelection.toString();
                }
            }
            this.shadowRoot.getElementById("rich-text-box-link-modal").show();

            const address = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
            if (address) {
                address.focus();
            }
        }
    }
    resetLinkDialog = () => {
        this.linkNode = null;
        this.linkSelection = null;

        const linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        linktext.value = null;

        const link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        link.value = null;

        const newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
        newtab.checked = false;

        const classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");
        if (classes != null) {
            classes.value = null;
        }
    }
    insertLink = () => {
        const linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        const link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        const newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
        const classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");

        if (link.value.length == 0 || linktext.value.length == 0) {
            this.closeDialog();
            return;
        }

        /* Get the link selection or element */
        if (this.linkNode != null) {
            const element = this.linkNode;
            element.href = link.value;
            element.textContent = linktext.value;
            if (classes !== null) {
                this.Utilities.addClasses(classes.value, element);
            }
            if (newtab.checked) {
                element.target = "_blank";
            }
            else {
                if (element.hasAttribute('target')) {
                    element.removeAttribute('target');
                }
            }
            this.Utilities.reselectNode(element);
        }
        else {
            if (this.linkSelection != null) {
                const range = this.linkSelection;
                const anchor = document.createElement("a");
                anchor.href = link.value;
                anchor.textContent = linktext.value;
                if (classes !== null) {
                    this.Utilities.addClasses(classes.value, anchor);
                }
                if (newtab.checked) {
                    anchor.target = "_blank";
                }
                range.deleteContents();
                range.insertNode(anchor);
                range.setStartBefore(anchor.firstChild);
                range.setEndAfter(anchor.lastChild);

                this.savedSelection = range;
            }
        }
        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog("rich-text-box-link-modal", this.savedSelection);
    }

    removeLink = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            const savedSelection = this.Utilities.saveSelection(selection);
           
            if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "A") {
                const element = selection.anchorNode.parentNode;
                const fragment = document.createDocumentFragment();

                while (element.firstChild) {
                    fragment.appendChild(element.firstChild);
                }
                element.parentNode.insertBefore(fragment, element);
                element.parentNode.removeChild(element);
            }          

            // Restore the selection after the operation
            this.Utilities.restoreSelection(selection, savedSelection);
        }
    }
}
class RTBlazorfiedColorDialog {
    constructor(shadowRoot, content, id, nodeManager, utilities) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.id = id;
        this.NodeManager = nodeManager;
        this.Utilities = utilities;
        this.init();
    }

    init = () => {
        /* Get the dialog and color picker */
        this.colorPickerDialog = this.shadowRoot.getElementById(this.id);
        this.colorPickerDialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertColor();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });

        this.colorPicker = this.colorPickerDialog.querySelector(".rich-text-box-color-picker");

        /* Add the elements from the color picker and even listeners */
        this.redSlider = this.colorPicker.querySelector('.rich-text-box-red-slider');
        this.addSliderEventListener(this.redSlider);

        this.greenSlider = this.colorPicker.querySelector('.rich-text-box-green-slider');
        this.addSliderEventListener(this.greenSlider);

        this.blueSlider = this.colorPicker.querySelector('.rich-text-box-blue-slider');
        this.addSliderEventListener(this.blueSlider);

        this.redValue = this.colorPicker.querySelector('.rich-text-box-red-value');
        this.addValueEventListener(this.redValue);

        this.greenValue = this.colorPicker.querySelector('.rich-text-box-green-value');
        this.addValueEventListener(this.greenValue);

        this.blueValue = this.colorPicker.querySelector('.rich-text-box-blue-value');
        this.addValueEventListener(this.blueValue);

        this.hexInput = this.colorPicker.querySelector('.rich-text-box-hex-input');
        this.addHexEventListener(this.hexInput);

        this.colorDisplay = this.colorPicker.querySelector('.rich-text-box-color-display');
    }

    addSliderEventListener = async (slider) => {
        slider.addEventListener('input', () => this.updateColor());
    }

    addValueEventListener = async (value) => {
        value.addEventListener('input', (event) => {
            let valueClass = Array.from(event.target.classList).find(cls => cls.includes('value'));
            let slider = this.colorPicker.querySelector(`.${valueClass.replace('value', 'slider')}`);
            slider.value = event.target.value;
            this.updateColor();
        });

        /* Select all text when the input box gains focus */
        value.addEventListener('focus', (event) => {
            event.target.select();
        });
    }

    addHexEventListener = async (hexInput) => {
        hexInput.addEventListener('keyup', (event) => {
            /* Only update if the input is a valid hex color */
            if (/^#?[0-9A-Fa-f]{6}$/.test(event.target.value)) {
                this.updateFromHex();
            }
        });
        hexInput.addEventListener('change', () => this.updateFromHex());
        hexInput.addEventListener('paste', () => setTimeout(this.updateFromHex, 0));

        /* Highlight all text when the input box gains focus */
        hexInput.addEventListener('focus', (event) => {
            hexInput.select();
        });
    }

    openColorPicker = (selection, content) => {
        this.resetColorDialog();
        this.savedSelection = this.Utilities.saveSelection(selection);

        if (selection !== null && selection.anchorNode != null && selection.anchorNode != content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != content && content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.style != null) {
            this.selection = selection.getRangeAt(0).cloneRange();

            /* Get the type of color dialog and the type of color */
            switch (this.id) {
                case "rich-text-box-text-color-modal":
                    if (selection.anchorNode.parentNode.style.color.toString().length > 0) {
                        this.hexInput.value = this.colorToHex(selection.anchorNode.parentNode.style.color);
                    }
                    break;
                case "rich-text-box-text-bg-color-modal":
                    if (selection.anchorNode.parentNode.style.backgroundColor.toString().length > 0) {
                        this.hexInput.value = this.colorToHex(selection.anchorNode.parentNode.style.backgroundColor);
                    }
                    break;
            }
            this.updateFromHex();
            this.selection = selection.getRangeAt(0).cloneRange();
        }
        else {
            if (selection !== null && selection.rangeCount > 0) {
                this.selection = selection.getRangeAt(0).cloneRange();
            }
        }

        this.colorPickerDialog.show();
        return this.selection;
    }

    insertColor = () => {
        this.currentColor = this.getCurrentColor();

        let modaltype;
        switch (this.id) {
            case "rich-text-box-text-color-modal":
                modaltype = "textcolor";
                break;
            case "rich-text-box-text-bg-color-modal":
                modaltype = "textbgcolor";
                break;
        }

        if (this.selection !== null) {
            this.savedSelection = this.Utilities.saveSelection(this.selection);
            if (this.currentColor === null) {
                this.NodeManager.updateNode(modaltype, "None", this.selection);
            }
            else {
                this.NodeManager.updateNode(modaltype, this.currentColor, this.selection);
            }
        }

        this.closeDialog();
    }

    closeDialog = () => {
        this.Utilities.closeDialog(this.id, this.savedSelection);
    }

    resetColorDialog = () => {
        this.selection = null;

        /* Reset the selected color */
        this.hexInput.value = "#000000";
        this.updateFromHex();
    }

    selectColor = (color) => {
        this.hexInput.value = color;
        this.updateFromHex();
    }

    updateColor = () => {
        let r = parseInt(this.redSlider.value);
        let g = parseInt(this.greenSlider.value);
        let b = parseInt(this.blueSlider.value);
        let color = `rgb(${r}, ${g}, ${b})`;

        this.currentColor = color;
        this.colorDisplay.style.backgroundColor = color;
        this.redValue.value = r;
        this.greenValue.value = g;
        this.blueValue.value = b;
        this.hexInput.value = this.rgbToHex(r, g, b);
    }

    getCurrentColor = () => {
        return this.currentColor;
    }

    updateFromHex = () => {

        let hex = this.hexInput.value.trim();
        if (hex.charAt(0) !== '#') {
            hex = '#' + hex;
        }
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            let rgb = this.hexToRgb(hex);
            if (rgb) {
                this.redSlider.value = this.redValue.value = rgb.r;
                this.greenSlider.value = this.greenValue.value = rgb.g;
                this.blueSlider.value = this.blueValue.value = rgb.b;
            }
        }
        this.updateColor();
    }

    rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    colorToHex = (color) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        return ctx.fillStyle;
    }
}

window.RTBlazorfied_Instances = {};

window.RTBlazorfied_Initialize = (id, shadow_id, toolbar_id, styles, html, objectReference) => {
    try {
        if (RTBlazorfied_Instances[id] == null) {
            RTBlazorfied_Instances[id] = new RTBlazorfied(id, shadow_id, toolbar_id, styles, objectReference);
            RTBlazorfied_Instances[id].loadHtml(html);
        }
    }
    catch (ex) {
        console.log(ex)
    }
}

window.RTBlazorfied_Method = (methodName, id, param) => {
    try {
        const editorInstance = RTBlazorfied_Instances[id];
        if (editorInstance != null && typeof editorInstance[methodName] === 'function') {
            if (param != null) {
                return editorInstance[methodName](param);
            }
            else {
                return editorInstance[methodName]();
            }
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

// ============================================================================
// SVG Icons  (source: RTBlazorfiedIcons.cs)
// ============================================================================
const _RTB_ICONS = {
    Bold:                "M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z",
    Italic:              "M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z",
    Underline:           "M200-120v-80h560v80H200Zm280-160q-101 0-157-63t-56-167v-330h103v336q0 56 28 91t82 35q54 0 82-35t28-91v-336h103v330q0 104-56 167t-157 63Z",
    Strikethrough:       "M486-160q-76 0-135-45t-85-123l88-38q14 48 48.5 79t85.5 31q42 0 76-20t34-64q0-18-7-33t-19-27h112q5 14 7.5 28.5T694-340q0 86-61.5 133T486-160ZM80-480v-80h800v80H80Zm402-326q66 0 115.5 32.5T674-674l-88 39q-9-29-33.5-52T484-710q-41 0-68 18.5T386-640h-96q2-69 54.5-117.5T482-806Z",
    Subscript:           "M760-160v-80q0-17 11.5-28.5T800-280h80v-40H760v-40h120q17 0 28.5 11.5T920-320v40q0 17-11.5 28.5T880-240h-80v40h120v40H760Zm-525-80 185-291-172-269h106l124 200h4l123-200h107L539-531l186 291H618L482-457h-4L342-240H235Z",
    Superscript:         "M760-600v-80q0-17 11.5-28.5T800-720h80v-40H760v-40h120q17 0 28.5 11.5T920-760v40q0 17-11.5 28.5T880-680h-80v40h120v40H760ZM235-160l185-291-172-269h106l124 200h4l123-200h107L539-451l186 291H618L482-377h-4L342-160H235Z",
    Alignleft:           "M120-120v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Z",
    Aligncenter:         "M120-120v-80h720v80H120Zm160-160v-80h400v80H280ZM120-440v-80h720v80H120Zm160-160v-80h400v80H280ZM120-760v-80h720v80H120Z",
    Alignright:          "M120-760v-80h720v80H120Zm240 160v-80h480v80H360ZM120-440v-80h720v80H120Zm240 160v-80h480v80H360ZM120-120v-80h720v80H120Z",
    Alignjustify:        "M120-120v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z",
    Copy:                "M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z",
    Cut:                 "M760-120 480-400l-94 94q8 15 11 32t3 34q0 66-47 113T240-80q-66 0-113-47T80-240q0-66 47-113t113-47q17 0 34 3t32 11l94-94-94-94q-15 8-32 11t-34 3q-66 0-113-47T80-720q0-66 47-113t113-47q66 0 113 47t47 113q0 17-3 34t-11 32l494 494v40H760ZM600-520l-80-80 240-240h120v40L600-520ZM240-640q33 0 56.5-23.5T320-720q0-33-23.5-56.5T240-800q-33 0-56.5 23.5T160-720q0 33 23.5 56.5T240-640Zm240 180q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6ZM240-160q33 0 56.5-23.5T320-240q0-33-23.5-56.5T240-320q-33 0-56.5 23.5T160-240q0 33 23.5 56.5T240-160Z",
    Paste:               "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z",
    Delete:              "M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z",
    Selectall:           "M280-280v-400h400v400H280Zm80-80h240v-240H360v240ZM200-200v80q-33 0-56.5-23.5T120-200h80Zm-80-80v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm80-160h-80q0-33 23.5-56.5T200-840v80Zm80 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80q0 33-23.5 56.5T760-120Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80q33 0 56.5 23.5T840-760h-80Z",
    OrderedList:         "M120-80v-60h100v-30h-60v-60h60v-30H120v-60h120q17 0 28.5 11.5T280-280v40q0 17-11.5 28.5T240-200q17 0 28.5 11.5T280-160v40q0 17-11.5 28.5T240-80H120Zm0-280v-110q0-17 11.5-28.5T160-510h60v-30H120v-60h120q17 0 28.5 11.5T280-560v70q0 17-11.5 28.5T240-450h-60v30h100v60H120Zm60-280v-180h-60v-60h120v240h-60Zm180 440v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360Z",
    UnorderedList:       "M280-600v-80h560v80H280Zm0 160v-80h560v80H280Zm0 160v-80h560v80H280ZM160-600q-17 0-28.5-11.5T120-640q0-17 11.5-28.5T160-680q17 0 28.5 11.5T200-640q0 17-11.5 28.5T160-600Zm0 160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440Zm0 160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360q17 0 28.5 11.5T200-320q0 17-11.5 28.5T160-280Z",
    CreateLink:          "M680-160v-120H560v-80h120v-120h80v120h120v80H760v120h-80ZM440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm560-40h-80q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480Z",
    RemoveLink:          "m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56 56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z",
    Image:               "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z",
    Undo:                "M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z",
    Redo:                "M396-200q-97 0-166.5-63T160-420q0-94 69.5-157T396-640h252L544-744l56-56 200 200-200 200-56-56 104-104H396q-63 0-109.5 40T240-420q0 60 46.5 100T396-280h284v80H396Z",
    CodeBlocks:          "m384-336 56-57-87-87 87-87-56-57-144 144 144 144Zm192 0 144-144-144-144-56 57 87 87-87 87 56 57ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z",
    Code:                "M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z",
    Preview:             "M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z",
    PermMedia:           "M360-440h400L622-620l-92 120-62-80-108 140ZM120-120q-33 0-56.5-23.5T40-200v-520h80v520h680v80H120Zm160-160q-33 0-56.5-23.5T200-360v-440q0-33 23.5-56.5T280-880h200l80 80h280q33 0 56.5 23.5T920-720v360q0 33-23.5 56.5T840-280H280Zm0-80h560v-360H527l-80-80H280v440Zm0 0v-440 440Z",
    TextColor:           "M80 0v-160h800V0H80Zm140-280 210-560h100l210 560h-96l-50-144H368l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z",
    TextBackgroundColor: "M80 0v-160h800V0H80Zm504-480L480-584 320-424l103 104 161-160Zm-47-160 103 103 160-159-104-104-159 160Zm-84-29 216 216-189 190q-24 24-56.5 24T367-263l-27 23H140l126-125q-24-24-25-57.5t23-57.5l189-189Zm0 0 187-187q24-24 56.5-24t56.5 24l104 103q24 24 24 56.5T857-640L669-453 453-669Z",
    RemoveTextFormat:    "m528-546-93-93-121-121h486v120H568l-40 94ZM792-56 460-388l-80 188H249l119-280L56-792l56-56 736 736-56 56Z",
    Quote:               "m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92ZM320-500q25 0 42.5-17.5T380-560q0-25-17.5-42.5T320-620q-25 0-42.5 17.5T260-560q0 25 17.5 42.5T320-500Zm360 0q25 0 42.5-17.5T740-560q0-25-17.5-42.5T680-620q-25 0-42.5 17.5T620-560q0 25 17.5 42.5T680-500Zm0-60Zm-360 0Z",
    VideoFile:           "M360-240h160q17 0 28.5-11.5T560-280v-40l80 42v-164l-80 42v-40q0-17-11.5-28.5T520-480H360q-17 0-28.5 11.5T320-440v160q0 17 11.5 28.5T360-240ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z",
    Table:               "M120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200Zm80-400h560v-160H200v160Zm213 200h134v-120H413v120Zm0 200h134v-120H413v120ZM200-400h133v-120H200v120Zm427 0h133v-120H627v120ZM200-200h133v-120H200v120Zm427 0h133v-120H627v120Z",
    IncreaseIndent:      "M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm0 440v-320l160 160-160 160Z",
    DecreaseIndent:      "M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm160 440L120-480l160-160v320Z",
    UploadImage:         "M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z",
    SaveHtml:            "m720-120 160-160-56-56-64 64v-167h-80v167l-64-64-56 56 160 160ZM560 0v-80h320V0H560ZM240-160q-33 0-56.5-23.5T160-240v-560q0-33 23.5-56.5T240-880h280l240 240v121h-80v-81H480v-200H240v560h240v80H240Zm0-80v-560 560Z",
    HorizontalRule:      "M160-440v-80h640v80H160Z",
    StatusBar:           "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-200v120h560v-120H568q-17 18-39.5 29T480-280q-26 0-48.5-11T392-320H200Zm308.5-51.5Q520-383 520-400t-11.5-28.5Q497-440 480-440t-28.5 11.5Q440-417 440-400t11.5 28.5Q463-360 480-360t28.5-11.5ZM200-400h160q0-50 35-85t85-35q50 0 85 35t35 85h160v-360H200v360Zm0 200h560-560Z",
};

// ============================================================================
// Shadow DOM CSS — injected into the shadow root by RTBlazorfied.
// Uses CSS custom properties so the host element (rich-text-box) can control
// all values without regenerating this string.
// ============================================================================
const _RTB_SHADOW_CSS = `
.rich-text-box-tool-bar {
    background-color: var(--rtb-toolbar-bg, #FFF);
    border-bottom-style: var(--rtb-toolbar-border-style, solid);
    border-bottom-width: var(--rtb-toolbar-border-width, 1px);
    border-bottom-color: var(--rtb-toolbar-border-color, #EEE);
    border-radius: var(--rtb-toolbar-border-radius, 0px);
    padding-left: 3px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
}
.rich-text-box-tool-bar button {
    background-color: var(--rtb-btn-bg, inherit);
    border-style: var(--rtb-btn-border-style, none);
    border-width: var(--rtb-btn-border-width, 0px);
    border-color: var(--rtb-btn-border-color, #AAA);
    border-radius: var(--rtb-btn-border-radius, 5px);
    color: var(--rtb-btn-text, #000);
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    min-height: calc(var(--rtb-btn-size, 16px) + 14px);
    font-family: var(--rtb-btn-font, Arial, sans-serif);
    margin: 4px 1px;
}
.rich-text-box-tool-bar button:hover {
    background-color: var(--rtb-btn-bg-hover, #e8e8e8);
    border-color: var(--rtb-btn-border-hover, inherit);
}
.rich-text-box-tool-bar button.selected {
    background-color: var(--rtb-btn-bg-selected, #dcdcdc);
    border-color: var(--rtb-btn-border-selected, inherit);
}
.rich-text-box-tool-bar button:disabled {
    background-color: transparent;
    color: #999;
    cursor: default;
}
.rich-text-box-tool-bar button svg {
    fill: var(--rtb-btn-text, #000);
    width: var(--rtb-btn-size, 16px);
    height: var(--rtb-btn-size, 16px);
}
.rich-text-box-tool-bar button:hover svg {
    fill: var(--rtb-btn-text, #000);
}
.rich-text-box-tool-bar button:disabled svg {
    fill: #999;
}
.rich-text-box-menu-item {}
.rich-text-box-menu-item-special {}
.rich-text-box-menu-item svg,
.rich-text-box-menu-item-special svg {
    display: block;
    height: auto;
    width: auto;
    max-height: 100%;
    max-width: 100%;
}
.rich-text-box-menu-item:disabled { color: #999; }

.rich-text-box-container {
    resize: both;
    overflow: var(--rtb-editor-resize, auto);
    border-style: var(--rtb-editor-border-style, solid);
    border-width: var(--rtb-editor-border-width, 1px);
    border-color: var(--rtb-editor-border-color, #EEE);
    border-radius: var(--rtb-editor-border-radius, 0px);
    box-shadow: var(--rtb-editor-shadow, none);
    max-width: var(--rtb-editor-width, 100%);
    height: var(--rtb-editor-height, 300px);
    display: flex;
    flex-direction: column;
    z-index: 1;
}
.rich-text-box-content-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: row;
    background-color: var(--rtb-content-bg, #FFF);
    box-shadow: var(--rtb-content-shadow, none);
}
.rtb-status-bar {
    /* Mirror the toolbar's background and typography so every theme is
       automatically reflected without adding status-bar-specific CSS vars. */
    background-color: var(--rtb-toolbar-bg, #ffffff);
    color:            var(--rtb-btn-text, #242424);
    font-family:      var(--rtb-btn-font, Arial, Helvetica, Verdana, sans-serif);
    font-size:        calc(var(--rtb-btn-size, 16px) * 0.9);
    border-top:       1px solid var(--rtb-toolbar-border-color, #d1d1d1);
    padding:          5px 24px 5px 10px;
    text-align:       right;
    user-select:      none;
    flex-shrink:      0;
    letter-spacing:   0.2px;
}
.rich-text-box-content[data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: var(--rtb-placeholder-color, #9ca3af);
    pointer-events: none;
    font-style: italic;
}
.rich-text-box-content[contenteditable="false"] {
    cursor: default;
    opacity: 0.85;
}
.rich-text-box-content {
    color: var(--rtb-content-text, #000);
    font-size: var(--rtb-content-size, 16px);
    font-family: var(--rtb-content-font, Arial, sans-serif);
    padding: 5px 10px;
    width: 100%;
    min-height: 25px;
    white-space: pre-wrap;
    word-wrap: break-word;
    outline: 0px solid transparent;
}
.rich-text-box-content img { cursor: pointer; }
.rich-text-box-source {
    padding: 10px;
    width: 100%;
    min-height: 25px;
    color: var(--rtb-content-text, #000) !important;
    font-size: var(--rtb-content-size, 16px) !important;
    white-space: pre-wrap;
    background-color: var(--rtb-content-bg, #FFF);
    box-shadow: var(--rtb-content-shadow, none);
    border-style: none;
    display: none;
    resize: none;
    margin: 0;
    line-height: 1.6;
    outline: 0px solid transparent;
}
.rich-text-box-divider-btn {
    background-color: inherit;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: none !important;
    outline: none;
    cursor: pointer;
    padding: 3px 4px;
    transition: 0.3s;
    margin: 4px 1px;
}
.rich-text-box-divider-btn[disabled],
.rich-text-box-divider-btn[disabled]:hover,
.rich-text-box-divider-btn[disabled]:focus,
.rich-text-box-divider-btn[disabled]:active {
    background: unset;
    color: unset;
    cursor: default;
}
.rich-text-box-divider {
    min-height: 25px;
    height: var(--rtb-btn-size, 16px);
    background-color: var(--rtb-btn-text, #000);
    display: block;
    border-left: 0.5px solid rgba(255, 255, 255, 0.6);
    opacity: 0.5;
}
.rich-text-box-scroll::-webkit-scrollbar {
    height: var(--rtb-scroll-width, 10px);
    width: var(--rtb-scroll-width, 10px);
    opacity: var(--rtb-scroll-opacity, 1);
}
.rich-text-box-scroll::-webkit-scrollbar-track {
    background-color: var(--rtb-scroll-bg, transparent);
}
.rich-text-box-scroll::-webkit-scrollbar-thumb {
    background: var(--rtb-scroll-thumb-bg, #AAA);
    border-radius: var(--rtb-scroll-thumb-radius, 0);
}
.rich-text-box-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--rtb-scroll-thumb-bg-hover, #DDD);
    cursor: default;
}
.rich-text-box-dropdown { position: relative; display: inline-block; }
.rich-text-box-dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--rtb-dropdown-bg, #FFF);
    border-style: var(--rtb-btn-border-style, none);
    border-width: var(--rtb-btn-border-width, 0px);
    border-color: var(--rtb-btn-border-color, #AAA);
    border-radius: 5px;
    max-height: 200px;
    overflow: auto;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
    font-family: Arial, sans-serif !important;
    z-index: 2;
}
.rich-text-box-dropdown-btn {
    font-size: var(--rtb-btn-size, 16px);
    min-height: calc(var(--rtb-btn-size, 16px) + 14px);
    padding: 0 10px;
}
.rich-text-box-format-button {}
.rich-text-box-format-content { min-width: 185px; }
.rich-text-box-font-button {}
.rich-text-box-font-content { min-width: 180px; }
.rich-text-box-size-button {}
.rich-text-box-size-content { min-width: 80px; }
.rich-text-box-dropdown-content a {
    color: var(--rtb-dropdown-text, #000);
    font-size: 18px;
    padding: 10px 14px;
    text-decoration: none;
    display: block;
}
.rich-text-box-dropdown a:hover,
.rich-text-box-menu-item.active {
    background-color: var(--rtb-dropdown-bg-hover, #e5e5e5);
    color: var(--rtb-dropdown-text-hover, #000);
}
.rich-text-box-show { display: block; }

.rich-text-box-modal {
    background-color: var(--rtb-modal-bg, #fefefe);
    color: var(--rtb-modal-text, #000);
    font-size: var(--rtb-modal-text-size, 16px);
    font-family: var(--rtb-modal-text-font, Arial, sans-serif);
    margin: auto;
    padding: 6px 16px 14px;
    border: 1px solid #888;
    width: 800px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5px;
    user-select: none;
    z-index: 2;
}
.rich-text-box-modal-title {
    font-weight: bold;
    font-size: calc(var(--rtb-modal-text-size, 16px) + 2px);
}
.rtb-modal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    padding-bottom: 10px;
}
.rich-text-box-form-left { float: left; width: 380px; }
.rich-text-box-form-right { float: right; width: 380px; }
@media screen and (max-width: 850px) {
    .rich-text-box-form-left,
    .rich-text-box-form-right { float: none; }
    .rich-text-box-modal { width: 400px; }
}
@media screen and (max-width: 500px) {
    .rich-text-box-modal { width: 100%; }
}
.clearfix { overflow: auto; }
.clearfix::after { content: ""; clear: both; display: table; }
.rich-text-box-modal-close {
    appearance: none;
    background: none;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    align-self: center;
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    max-width: 32px;
    max-height: 32px;
    border-radius: 50%;
    padding: 0;
    color: var(--rtb-modal-text, #000);
    cursor: pointer;
    opacity: 0.75;
}
/* SVG icon inside the close button — block display eliminates inline
   baseline offset so the flex centering acts on the icon bounds only.
   Width/height are set via CSS (not just SVG attributes) so the size is
   reliably enforced regardless of browser presentation-attribute handling. */
.rich-text-box-modal-close svg { display: block; width: 11px; height: 11px; }
.rich-text-box-modal-close:hover {
    opacity: 1;
    background: rgba(128, 128, 128, 0.18);
}
.rich-text-box-modal-close:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
}
.rich-text-box-modal-body { padding: 2px 8px; }
.rtb-preview-window {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
    border: 1px solid var(--rtb-editor-border-color, #eee);
    border-radius: 4px;
    box-sizing: border-box;
    display: block;
}
.rtb-preview-window::-webkit-scrollbar {
    height: var(--rtb-scroll-width, 10px);
    width: var(--rtb-scroll-width, 10px);
}
.rtb-preview-window::-webkit-scrollbar-track { background: transparent; }
.rtb-preview-window::-webkit-scrollbar-thumb {
    background: var(--rtb-scroll-thumb-bg, #AAA);
    border-radius: var(--rtb-scroll-thumb-radius, 0);
}
.rtb-preview-window::-webkit-scrollbar-thumb:hover {
    background: var(--rtb-scroll-thumb-bg-hover, #DDD);
}
/* Preview dialog — flex column layout so the dialog itself is resizable and
   the html viewer automatically fills the remaining space.
   display is intentionally NOT set here so the browser UA rule
   dialog:not([open]){display:none} still applies when the dialog is closed.
   display:flex is only added when the dialog is open (has the [open] attr). */
.rtb-preview-dialog {
    padding: 6px 12px 10px;
    flex-direction: column;
    height: 520px;
    min-width: 400px;
    min-height: 300px;
    max-width: 95vw;
    max-height: 95vh;
    resize: both;
    overflow: hidden;
    box-sizing: border-box;
}
.rtb-preview-dialog[open] {
    display: flex;
}
.rtb-preview-dialog-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    gap: 6px;
}
.rich-text-box-form-element {
    width: 100%;
    padding: 10px;
    font-size: var(--rtb-modal-text-size, 16px);
    font-family: var(--rtb-modal-text-font, Arial, sans-serif);
    background-color: var(--rtb-modal-input-bg, #fff);
    color: var(--rtb-modal-input-text, #000);
    border-width: 1px;
    border-style: solid;
    border-color: var(--rtb-modal-input-border, #CCC);
    outline: 0;
    border-radius: 0px;
    box-sizing: border-box;
    margin-top: 0px;
    margin-bottom: 16px;
    resize: vertical;
}
.rich-text-box-form-element:disabled {
    color: #999;
    border-color: #DDD;
    cursor: default;
}
.rich-text-box-form-checkbox {
    outline: none;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    accent-color: var(--rtb-modal-checkbox, #007bff);
}
.rich-text-box-form-checkbox:focus {
    border-style: solid;
    border-color: var(--rtb-modal-input-border, #CCC);
    border-width: 1px;
    box-shadow: 0 0 5px 2px rgba(169, 169, 169, 0.8);
}
.rich-text-box-upload-btn {
    padding: 10px 20px !important;
    font-size: var(--rtb-modal-text-size, 16px);
    font-family: var(--rtb-modal-text-font, Arial, sans-serif);
    transition: 0.3s;
    background-color: var(--rtb-btn-bg, inherit);
    border: 1px solid var(--rtb-btn-border-color, #AAA);
    border-radius: var(--rtb-btn-border-radius, 5px);
    color: var(--rtb-btn-text, #000);
    outline: none;
    cursor: pointer;
    min-width: 100% !important;
    min-height: calc(var(--rtb-btn-size, 16px) + 14px);
    font-family: var(--rtb-btn-font, Arial, sans-serif);
    margin: 4px 1px;
}
.rich-text-box-upload-btn:hover {
    background-color: var(--rtb-btn-bg-hover, #e8e8e8);
    border-color: var(--rtb-btn-border-hover, inherit);
}
.rich-text-box-form-button {
    padding: 10px 20px !important;
    font-size: var(--rtb-modal-text-size, 16px);
    font-family: var(--rtb-modal-text-font, Arial, sans-serif);
    transition: 0.3s;
}
.rich-text-box-form-button:focus {
    background-color: var(--rtb-btn-bg-hover, #e8e8e8);
    border-color: var(--rtb-btn-border-hover, inherit);
}
.blazing-rich-text-color-picker-container { position: relative; }
.blazing-rich-text-color-picker-button { min-height: calc(var(--rtb-btn-size, 16px) + 14px); }
.blazing-rich-text-color-picker-dropdown { width: 80px; padding: 10px 10px 6px 10px; }
.blazing-rich-text-color-option {
    width: 15px; height: 15px; margin: 2px; cursor: pointer;
    display: inline-block; border: 1px solid #999;
}
.blazing-rich-text-color-option:hover { border-color: #000; }
.blazing-rich-text-color-selection {
    width: 100%; border-style: solid; border-width: 1px; border-color: #999;
    height: 40px; cursor: pointer; display: inline-block;
}
.rich-text-box-quote { font-family: var(--rtb-modal-text-font, Arial, sans-serif); }
.rich-text-box-code { overflow: auto !important; white-space: pre; }
.rich-text-box-message-bar {
    font-size: var(--rtb-content-size, 16px);
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
    pointer-events: auto;
}
.rich-text-box-message-bar.rich-text-box-message-hidden {
    opacity: 0; height: 0; padding: 0; color: transparent; pointer-events: none;
}
.rich-text-box-message {}
.rich-text-box-message-close-button {
    background: none; border: none; color: white; font-size: 18px; cursor: pointer;
}
.rich-text-box-color-picker { width: 100%; }
.rich-text-box-color-display { width: 100%; height: 50px; border: 1px solid #ccc; margin: 20px 0; }
.rich-text-box-slider-container { display: flex; align-items: center; margin-bottom: 10px; }
.rich-text-box-slider-container label {
    width: 20px; margin-right: 10px;
    color: var(--rtb-modal-text, #000);
}
.rich-text-box-range { width: 100%; -webkit-appearance: none; cursor: pointer; }
.rich-text-box-range:focus { outline: none; }
.rich-text-box-range::-webkit-slider-runnable-track {
    background: var(--rtb-modal-text, #000); height: 5px;
}
.rich-text-box-red-slider::-webkit-slider-runnable-track {
    background: linear-gradient(to right, rgb(0,0,0) 0%, rgb(255,0,0) 100%) !important;
}
.rich-text-box-green-slider::-webkit-slider-runnable-track {
    background: linear-gradient(to right, rgb(0,0,0) 0%, rgb(0,255,0) 100%) !important;
}
.rich-text-box-blue-slider::-webkit-slider-runnable-track {
    background: linear-gradient(to right, rgb(0,0,0) 0%, rgb(0,0,255) 100%) !important;
}
.rich-text-box-range::-moz-range-track {
    background: var(--rtb-modal-text, #000); height: 5px;
}
.rich-text-box-range::-webkit-slider-thumb {
    -webkit-appearance: none; height: 15px; width: 15px;
    background: var(--rtb-modal-bg, #fefefe);
    margin-top: -5px; border-style: solid; border-width: 3px;
    border-color: var(--rtb-modal-text, #000); border-radius: 50%;
}
.rich-text-box-range::-moz-range-thumb {
    -webkit-appearance: none; height: 15px; width: 15px;
    background: var(--rtb-modal-bg, #fefefe);
    margin-top: -5px; border-style: solid; border-width: 3px;
    border-color: var(--rtb-modal-text, #000); border-radius: 50%;
}
.rich-text-box-number {
    width: 100px; margin-left: 10px; padding: 5px; font-size: 14px;
    background-color: var(--rtb-modal-input-bg, #fff);
    color: var(--rtb-modal-input-text, #000);
    border-width: 1px; border-style: solid;
    border-color: var(--rtb-modal-input-border, #CCC);
    outline: 0; border-radius: 0px; box-sizing: border-box;
}
.rich-text-box-hex-container { display: flex; align-items: center; margin-top: 20px; }
.rich-text-box-hex-input { width: 100px !important; margin-left: 10px; }
blockquote {
    background: var(--rtb-quote-bg, #f9f9f9);
    border-left: var(--rtb-quote-border-width, 5px) solid var(--rtb-quote-border-color, #ccc);
    margin: 1.5em 10px; padding: 0.5em 10px;
}
pre {
    background: var(--rtb-code-bg, #f9f9f9);
    border-radius: var(--rtb-code-border-radius, 10px);
    overflow-x: auto; white-space: pre-wrap; margin: 1.5em 10px; padding: 0.5em 10px;
}
table { border-collapse: collapse; }
td, th { border: 1px solid #ccc; padding: 4px 6px; height: 25px; min-width: 100px; }
`;

// ============================================================================
// RichTextBox — Native Web Component
// ============================================================================
class RichTextBox extends HTMLElement {

    constructor() {
        super();
        this._uid            = 'rtb-' + Math.random().toString(36).substring(2, 11);
        this._initialized    = false;
        this._value          = null;   // null = never set; '' = explicitly cleared
        this._visibility     = RichTextBox._defaultVisibility(true);
        this._previewCssUrls = [];     // array of CSS file URLs for preview + editor content
        this._previewCssText = '';     // inline CSS for preview + editor content
    }

    // ---- Default button visibility (mirrors C# SetButtonDefaults) ----------

    static _defaultVisibility(on = true) {
        return {
            // Dropdowns
            font: on, size: on, format: on, textStylesDivider: on,
            // Text format
            bold: on, italic: on, underline: on, strikethrough: on,
            subscript: on, superscript: on, formatDivider: on,
            // Color
            textColor: on, textColorDivider: on,
            // Alignment
            alignLeft: on, alignCenter: on, alignRight: on, alignJustify: on, alignDivider: on,
            // Clipboard / selection
            copy: on, cut: on, paste: on, delete: on, selectAll: on, actionDivider: on,
            // Lists & indent
            orderedList: on, unorderedList: on, indent: on, listDivider: on,
            // Insert
            link: on, image: on, imageUpload: on,
            quote: on, codeBlock: on, embedMedia: on, video: on,
            table: on, horizontalRule: on, mediaDivider: on,
            // History
            undo: on, redo: on, historyDivider: on,
            // View
            saveHtml: on, htmlView: on, preview: on, statusBarToggle: on,
            // Status bar — hidden by default; reveal via the toggle button or config
            wordCount: false,
        };
    }

    // ---- Global style injection (runs once per page) -----------------------
    // Embeds all component CSS — host defaults and preview dialog — directly
    // into <head> so no external stylesheet is required.

    static _injectGlobalStyles() {
        if (document.getElementById('_rtb-global-styles')) return;
        const style = document.createElement('style');
        style.id = '_rtb-global-styles';
        style.textContent = `
/* ── rt-native host defaults ──────────────────────────────────────────────
   Override any --rtb-* variable on rt-native (or a higher-specificity rule
   such as .my-wrapper rt-native or rt-native.my-class) to theme the editor.
   ──────────────────────────────────────────────────────────────────────── */
rt-native {
    display: block;

    /* Toolbar — Fluent 2 colorNeutralBackground1 + colorNeutralStroke1 separator */
    --rtb-toolbar-bg:            #ffffff;
    --rtb-toolbar-border-style:  solid;
    --rtb-toolbar-border-width:  1px;
    --rtb-toolbar-border-color:  #d1d1d1;
    --rtb-toolbar-border-radius: 0px;

    /* Toolbar dropdowns */
    --rtb-dropdown-bg:           #ffffff;
    --rtb-dropdown-text:         #242424;
    --rtb-dropdown-bg-hover:     #f5f5f5;
    --rtb-dropdown-text-hover:   #242424;

    /* Buttons — transparent at rest, no border */
    --rtb-btn-text:              #242424;
    --rtb-btn-size:              16px;
    --rtb-btn-font:              Arial, Helvetica, Verdana, sans-serif;
    --rtb-btn-bg:                transparent;
    --rtb-btn-bg-hover:          #e8e8e8;
    --rtb-btn-bg-selected:       #dcdcdc;
    --rtb-btn-border-style:      none;
    --rtb-btn-border-width:      0px;
    --rtb-btn-border-color:      #d1d1d1;
    --rtb-btn-border-hover:      inherit;
    --rtb-btn-border-selected:   inherit;
    --rtb-btn-border-radius:     4px;

    /* Editor content area */
    --rtb-content-text:          #242424;
    --rtb-content-size:          1rem;
    --rtb-content-font:          Arial, Helvetica, Verdana, sans-serif;
    --rtb-content-bg:            #ffffff;
    --rtb-content-shadow:        none;

    /* Blockquote — brand-blue left accent on a tinted surface */
    --rtb-quote-bg:              #f0f7ff;
    --rtb-quote-border-color:    #0078d4;
    --rtb-quote-border-width:    4px;

    /* Code / pre — neutral surface, Fluent medium corner radius */
    --rtb-code-bg:               #f5f5f5;
    --rtb-code-border-radius:    4px;

    /* Editor container — hairline border + featherweight shadow */
    --rtb-editor-width:          100%;
    --rtb-editor-height:         300px;
    --rtb-editor-border-radius:  4px;
    --rtb-editor-border-style:   solid;
    --rtb-editor-border-width:   1px;
    --rtb-editor-border-color:   #d1d1d1;
    --rtb-editor-shadow:         0 2px 4px rgba(0, 0, 0, 0.06);
    --rtb-editor-resize:         auto;

    /* Scrollbars — thin pill-shaped Fluent style */
    --rtb-scroll-width:          6px;
    --rtb-scroll-opacity:        1;
    --rtb-scroll-bg:             transparent;
    --rtb-scroll-thumb-bg:       #c2c2c2;
    --rtb-scroll-thumb-bg-hover: #8a8a8a;
    --rtb-scroll-thumb-radius:   3px;

    /* Placeholder */
    --rtb-placeholder-color:     #9ca3af;

    /* Modals / dialogs */
    --rtb-modal-bg:              #ffffff;
    --rtb-modal-text:            #242424;
    --rtb-modal-text-size:       1rem;
    --rtb-modal-text-font:       Arial, Helvetica, Verdana, sans-serif;
    --rtb-modal-input-bg:        #ffffff;
    --rtb-modal-input-text:      #242424;
    --rtb-modal-input-border:    #d1d1d1;
    --rtb-modal-checkbox:        #0078d4;
}

`;
        document.head.appendChild(style);
    }

    // ---- Custom-element lifecycle ------------------------------------------

    static get observedAttributes() {
        return ['value', 'width', 'height', 'config', 'placeholder', 'readonly', 'aria-label', 'label'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        if (name === 'value' && this._initialized) {
            this._value = newVal || '';
            RTBlazorfied_Method('loadView', this._uid, newVal);
        }
        if (name === 'width')  this.style.setProperty('--rtb-editor-width',  newVal || '100%');
        if (name === 'height') this.style.setProperty('--rtb-editor-height', newVal || '300px');
        if (name === 'config') {
            try { this.configure(JSON.parse(newVal)); } catch (_) {}
        }
        if (name === 'placeholder') {
            const inst = RTBlazorfied_Instances?.[this._uid];
            if (inst?.content) {
                if (newVal) inst.content.setAttribute('data-placeholder', newVal);
                else        inst.content.removeAttribute('data-placeholder');
            }
        }
        if (name === 'readonly') {
            const inst = RTBlazorfied_Instances?.[this._uid];
            if (inst) inst.setReadOnly(newVal !== null);
        }
        if (name === 'aria-label' || name === 'label') {
            const inst = RTBlazorfied_Instances?.[this._uid];
            if (inst?.content && newVal) inst.content.setAttribute('aria-label', newVal);
        }
    }

    connectedCallback() {
        RichTextBox._injectGlobalStyles();
        // Seed width/height custom properties from attributes
        this.style.setProperty('--rtb-editor-width',  this.getAttribute('width')  || '100%');
        this.style.setProperty('--rtb-editor-height', this.getAttribute('height') || '300px');
        this._render();
        requestAnimationFrame(() => this._initialize());
    }

    /** Returns true if the editor is currently in read-only mode. */
    get readOnly() { return this.hasAttribute('readonly'); }

    /** Programmatically set or clear read-only mode. */
    setReadOnly(on) {
        if (on) this.setAttribute('readonly', '');
        else    this.removeAttribute('readonly');
    }

    disconnectedCallback() {
        if (window.RTBlazorfied_Instances?.[this._uid]) {
            delete RTBlazorfied_Instances[this._uid];
        }
    }

    // ---- Public API --------------------------------------------------------

    /** Returns the current editor HTML. */
    getValue() {
        return this._initialized
            ? (RTBlazorfied_Method('html', this._uid) || this._value || '')
            : (this._value || '');
    }

    /** Returns the editor content as plain text. */
    getPlainText() {
        return this._initialized
            ? (RTBlazorfied_Method('plaintext', this._uid) || '')
            : '';
    }

    /** Replaces the editor content with the supplied HTML string. */
    setValue(html) {
        // Trim leading/trailing whitespace and collapse inter-tag whitespace so
        // template-literal newlines between block elements don't render as blank lines.
        const trimmed = (html || '').trim().replace(/>\s+</g, '><');
        this._value = trimmed;
        if (this._initialized) RTBlazorfied_Method('loadView', this._uid, trimmed);
    }

    /**
     * Sets one or more CSS files to apply to both the editor content area
     * and the preview window. Rules are automatically scoped so they only
     * affect the HTML being edited — the toolbar, menus, and dialogs are
     * never touched. Call with no arguments to clear all files.
     *
     * @param {...string} urls - Paths or URLs to .css files.
     */
    setPreviewCssFiles(...urls) {
        this._previewCssUrls = urls.filter(u => u && typeof u === 'string');
        this._syncToInstance();
        this._applyContentStyles();
    }

    /**
     * Sets a single CSS file to apply to the editor content area and the
     * preview window. Convenience wrapper around setPreviewCssFiles().
     *
     * @param {string} url - Path or URL to a .css file.
     */
    setPreviewCssFile(url) {
        this.setPreviewCssFiles(...(url ? [url] : []));
    }

    /**
     * Supplies inline CSS to apply to the editor content area and the
     * preview window. Rules are automatically scoped. Call with no argument
     * (or '') to clear.
     *
     * @param {string} css - Valid CSS string.
     */
    setPreviewCss(css) {
        this._previewCssText = css || '';
        this._syncToInstance();
        this._applyContentStyles();
    }

    /**
     * Transfers the current preview CSS settings to the RTBlazorfied
     * instance so the preview window picks them up on next open.
     */
    _syncToInstance() {
        if (!this._initialized) return;
        const inst = RTBlazorfied_Instances[this._uid];
        if (!inst) return;
        inst._previewCssUrls = this._previewCssUrls;
        inst._previewCssText = this._previewCssText;
    }

    /**
     * Scopes CSS text so every selector is prefixed with `scope`.
     * Handles @media, @supports, @layer, and @container by recursing.
     *
     * @param {string} css   - Raw CSS text.
     * @param {string} scope - Selector prefix, e.g. '.rich-text-box-content'.
     * @returns {string}
     */
    _scopeCssText(css, scope) {
        css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // strip block comments
        let result = '';
        let i = 0;

        while (i < css.length) {
            while (i < css.length && /\s/.test(css[i])) i++;
            if (i >= css.length) break;

            const braceStart = css.indexOf('{', i);
            if (braceStart === -1) break;

            const header = css.slice(i, braceStart).trim();

            // Find the matching closing brace.
            let depth = 1;
            let j = braceStart + 1;
            while (j < css.length && depth > 0) {
                if (css[j] === '{') depth++;
                else if (css[j] === '}') depth--;
                j++;
            }

            const body = css.slice(braceStart + 1, j - 1);
            i = j;

            if (!header) continue;

            if (header.startsWith('@')) {
                const atType = (header.match(/^@[\w-]+/) || [''])[0].toLowerCase();
                if (['@media', '@supports', '@layer', '@container'].includes(atType)) {
                    result += header + ' {\n' + this._scopeCssText(body, scope) + '}\n';
                } else {
                    result += header + ' {' + body + '}\n';
                }
            } else {
                const prefixed = header.split(',')
                    .map(s => s.trim())
                    .filter(s => s)
                    .map(s => s === ':root' ? scope : scope + ' ' + s)
                    .join(',\n');
                result += prefixed + ' {' + body + '}\n';
            }
        }

        return result;
    }

    /**
     * Fetches all preview CSS files, scopes their rules to the editor
     * content area, and injects them into the editor shadow root so that
     * the HTML being edited is styled exactly as it will appear in production.
     * The toolbar, menus, and dialogs are never affected.
     */
    async _applyContentStyles() {
        if (!this._initialized) return;
        const inst = RTBlazorfied_Instances[this._uid];
        if (!inst || !inst.shadowRoot) return;

        // Remove any previously injected content styles.
        const old = inst.shadowRoot.getElementById('_rtb-content-preview-styles');
        if (old) old.remove();

        const scope = '.rich-text-box-content';
        let combined = '';

        for (const url of this._previewCssUrls) {
            try {
                const resp = await fetch(url);
                if (resp.ok) combined += this._scopeCssText(await resp.text(), scope) + '\n';
                else console.warn(`rt-native: failed to load preview CSS (${resp.status}): ${url}`);
            } catch (e) {
                console.warn(`rt-native: could not load preview CSS: ${url}`, e);
            }
        }

        if (this._previewCssText) {
            combined += this._scopeCssText(this._previewCssText, scope) + '\n';
        }

        if (combined.trim()) {
            const style = document.createElement('style');
            style.id = '_rtb-content-preview-styles';
            style.textContent = combined;
            inst.shadowRoot.appendChild(style);
        }
    }

    /**
     * Applies configuration options.
     *
     * @param {object} options
     * @param {object} [options.toolbar]   - Toolbar appearance
     * @param {object} [options.button]    - Button appearance
     * @param {object} [options.content]   - Editor content area
     * @param {object} [options.editor]    - Editor container
     * @param {object} [options.scroll]    - Custom scrollbars
     * @param {object} [options.modal]     - Dialog / modal appearance
     * @param {object} [options.visibility] - Button visibility
     * Toolbar options:
     *   backgroundColor, borderStyle, borderWidth, borderColor, borderRadius,
     *   dropdownBackgroundColor, dropdownTextColor,
     *   dropdownBackgroundColorHover, dropdownTextColorHover
     *
     * Button options:
     *   textColor, textSize, textFont,
     *   backgroundColor, backgroundColorHover, backgroundColorSelected,
     *   borderStyle, borderWidth, borderColor, borderColorHover, borderColorSelected,
     *   borderRadius
     *
     * Content options:
     *   textColor, textSize, textFont, backgroundColor, boxShadow
     *
     * Editor options:
     *   width, height, borderRadius, borderStyle, borderWidth, borderColor,
     *   boxShadow, removeResizeHandle (bool)
     *
     * Scroll options:
     *   width, opacity, backgroundColor, thumbBackground, thumbBackgroundHover,
     *   thumbBorderRadius
     *
     * Modal options:
     *   backgroundColor, textColor, textSize, textFont,
     *   textboxBackgroundColor, textboxTextColor, textboxBorderColor,
     *   checkboxAccentColor
     *
     * Visibility options (all boolean, default true):
     *   clearAll — set all buttons to false first, then apply individual overrides
     *   font, size, format, textStylesDivider,
     *   bold, italic, underline, strikethrough, subscript, superscript, formatDivider,
     *   textColor, textColorDivider,
     *   alignLeft, alignCenter, alignRight, alignJustify, alignDivider,
     *   copy, cut, paste, delete, selectAll, actionDivider,
     *   orderedList, unorderedList, indent, listDivider,
     *   link, image, imageUpload, quote, codeBlock, embedMedia, video, table, horizontalRule, mediaDivider,
     *   undo, redo, historyDivider,
     *   saveHtml, htmlView, preview, statusBarToggle,
     *   wordCount
     */
    configure(options = {}) {
        const { visibility, ...styleOptions } = options;

        // Visibility — must be applied before (re)render
        if (visibility) {
            if (visibility.clearAll) {
                this._visibility = RichTextBox._defaultVisibility(false);
            }
            Object.assign(this._visibility, visibility);
        }

        // CSS custom properties — apply immediately (no re-render needed)
        this._applyCSSVars(styleOptions);

        // Sync updated theme variables to the body-level preview dialog.
        this._syncPreviewTheme();

        // If already rendered, rebuild toolbar HTML to reflect visibility changes
        if (this._initialized && visibility) {
            this._reinitialize();
        }
    }

    // ---- CSS custom-property mapping ---------------------------------------

    _syncPreviewTheme() {
        // Preview CSS is rebuilt from scratch each time the preview opens —
        // no additional sync is required here.
    }

    _applyCSSVars(options) {
        const set = (prop, val) => { if (val != null) this.style.setProperty(prop, val); };

        const t = options.toolbar || {};
        set('--rtb-toolbar-bg',            t.backgroundColor);
        set('--rtb-toolbar-border-style',  t.borderStyle);
        set('--rtb-toolbar-border-width',  t.borderWidth);
        set('--rtb-toolbar-border-color',  t.borderColor);
        set('--rtb-toolbar-border-radius', t.borderRadius);
        set('--rtb-dropdown-bg',           t.dropdownBackgroundColor);
        set('--rtb-dropdown-text',         t.dropdownTextColor);
        set('--rtb-dropdown-bg-hover',     t.dropdownBackgroundColorHover);
        set('--rtb-dropdown-text-hover',   t.dropdownTextColorHover);

        const b = options.button || {};
        set('--rtb-btn-text',            b.textColor);
        set('--rtb-btn-size',            b.textSize);
        set('--rtb-btn-font',            b.textFont);
        set('--rtb-btn-bg',              b.backgroundColor);
        set('--rtb-btn-bg-hover',        b.backgroundColorHover);
        set('--rtb-btn-bg-selected',     b.backgroundColorSelected);
        set('--rtb-btn-border-style',    b.borderStyle);
        set('--rtb-btn-border-width',    b.borderWidth);
        set('--rtb-btn-border-color',    b.borderColor);
        set('--rtb-btn-border-hover',    b.borderColorHover);
        set('--rtb-btn-border-selected', b.borderColorSelected);
        set('--rtb-btn-border-radius',   b.borderRadius);

        const c = options.content || {};
        set('--rtb-content-text',   c.textColor);
        set('--rtb-content-size',   c.textSize);
        set('--rtb-content-font',   c.textFont);
        set('--rtb-content-bg',     c.backgroundColor);
        set('--rtb-content-shadow', c.boxShadow);

        const e = options.editor || {};
        set('--rtb-editor-width',         e.width);
        set('--rtb-editor-height',        e.height);
        set('--rtb-editor-border-radius', e.borderRadius);
        set('--rtb-editor-border-style',  e.borderStyle);
        set('--rtb-editor-border-width',  e.borderWidth);
        set('--rtb-editor-border-color',  e.borderColor);
        set('--rtb-editor-shadow',        e.boxShadow);
        if (e.removeResizeHandle != null) {
            set('--rtb-editor-resize', e.removeResizeHandle ? 'visible' : 'auto');
        }

        const s = options.scroll || {};
        set('--rtb-scroll-width',          s.width);
        set('--rtb-scroll-opacity',        s.opacity);
        set('--rtb-scroll-bg',             s.backgroundColor);
        set('--rtb-scroll-thumb-bg',       s.thumbBackground);
        set('--rtb-scroll-thumb-bg-hover', s.thumbBackgroundHover);
        set('--rtb-scroll-thumb-radius',   s.thumbBorderRadius);

        const m = options.modal || {};
        set('--rtb-modal-bg',           m.backgroundColor);
        set('--rtb-modal-text',         m.textColor);
        set('--rtb-modal-text-size',    m.textSize);
        set('--rtb-modal-text-font',    m.textFont);
        set('--rtb-modal-input-bg',     m.textboxBackgroundColor);
        set('--rtb-modal-input-text',   m.textboxTextColor);
        set('--rtb-modal-input-border', m.textboxBorderColor);
        set('--rtb-modal-checkbox',     m.checkboxAccentColor);

        const q = options.quote || {};
        set('--rtb-quote-bg',           q.backgroundColor);
        set('--rtb-quote-border-color', q.borderColor);
        set('--rtb-quote-border-width', q.borderWidth);

        const k = options.code || {};
        set('--rtb-code-bg',            k.backgroundColor);
        set('--rtb-code-border-radius', k.borderRadius);
    }


    // ---- Rendering ---------------------------------------------------------

    _render() {
        this.innerHTML =
            this._buildToolbarHTML() +
            `<div id="${this._uid}_Shadow"></div>`;
    }

    _initialize() {
        // If setValue() was called before the engine was ready, _value is
        // already set (non-null) and takes priority over the value attribute.
        // Otherwise fall back to the attribute so declarative usage still works.
        const attrValue    = this.getAttribute('value') || '';
        const initialValue = this._value !== null ? this._value : attrValue;
        this._value        = initialValue;

        const onValueChange = (value) => {
            this._value = value;
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value },
                bubbles: true,
                composed: true,
            }));
        };

        if (!window.RTBlazorfied_Instances) window.RTBlazorfied_Instances = {};

        RTBlazorfied_Instances[this._uid] = new RTBlazorfied(
            this._uid,
            `${this._uid}_Shadow`,
            `${this._uid}_Toolbar`,
            _RTB_SHADOW_CSS,
            { invokeMethodAsync: (_m, value) => onValueChange(value) }
        );
        RTBlazorfied_Instances[this._uid]._rtbHostElement = this;

        // Accessible label — honour aria-label / label attributes on the host element
        const ariaLabel = this.getAttribute('aria-label') || this.getAttribute('label');
        if (ariaLabel) {
            RTBlazorfied_Instances[this._uid].content.setAttribute('aria-label', ariaLabel);
        }

        // Placeholder
        const placeholder = this.getAttribute('placeholder');
        if (placeholder) {
            RTBlazorfied_Instances[this._uid].content.setAttribute('data-placeholder', placeholder);
        }

        // Read-only
        if (this.hasAttribute('readonly')) {
            RTBlazorfied_Instances[this._uid].setReadOnly(true);
        }

        // Word-count status bar visibility
        RTBlazorfied_Instances[this._uid]._syncWordCountVisibility();

        RTBlazorfied_Instances[this._uid].loadHtml(initialValue);
        this._initialized = true;

        // Transfer preview CSS settings to the RTBlazorfied instance and
        // apply scoped styles to the editor content area.
        this._syncToInstance();
        this._applyContentStyles();
    }

    _reinitialize() {
        const savedValue = this.getValue();
        delete RTBlazorfied_Instances[this._uid];
        this._initialized = false;
        this._uid = 'rtb-' + Math.random().toString(36).substring(2, 11);
        this._render();
        requestAnimationFrame(() => {
            this._initialize();
            if (savedValue) this.setValue(savedValue);
        });
    }

    // ---- HTML helpers ------------------------------------------------------

    _svg(icon) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="${_RTB_ICONS[icon]}"/></svg>`;
    }

    _btn(buttonId, icon, title, method, param) {
        const call = param !== undefined
            ? `RTBlazorfied_Method('${method}','${this._uid}','${param}')`
            : `RTBlazorfied_Method('${method}','${this._uid}')`;
        return `<button id="${buttonId}" title="${title}" aria-label="${title}" aria-pressed="false" class="rich-text-box-menu-item" onclick="${call}">${this._svg(icon)}</button>`;
    }

    _specialBtn(buttonId, icon, title, method) {
        return `<button id="${buttonId}" title="${title}" aria-label="${title}" aria-pressed="false" class="rich-text-box-menu-item-special" onclick="RTBlazorfied_Method('${method}','${this._uid}')">${this._svg(icon)}</button>`;
    }

    _divider() {
        return `<button class="rich-text-box-divider-btn" disabled><div class="rich-text-box-divider"></div></button>`;
    }

    // ---- Dropdown content --------------------------------------------------

    _fontDropdown() {
        const id = this._uid;
        const fonts = ['None','Arial','Arial Narrow','Baskerville','Brush Script','Calibri',
            'Cambria','Candara','Century Gothic','Claude Garamond','Comic Sans MS','Copperplate',
            'Courier','Didot','Georgia','Gill Sans','Helvetica','Impact','Lucida Bright',
            'Monospace','Optima','Palatino','Segoe UI','Tahoma','Times New Roman',
            'Trebuchet MS','Verdana'];
        const items = fonts.map(f =>
            `<a class="rich-text-box-menu-item" style="font-family:${f};cursor:pointer" onclick="RTBlazorfied_Method('font','${id}','${f}')">${f}</a>`
        ).join('');
        return `
<div class="rich-text-box-dropdown">
  <button id="blazing-rich-text-font-button" title="Font" class="rich-text-box-font-button rich-text-box-dropdown-btn"
    onclick="RTBlazorfied_Method('dropdown','${id}','blazing-rich-text-font-button-dropdown')">Font</button>
  <div id="blazing-rich-text-font-button-dropdown" class="rich-text-box-dropdown-content rich-text-box-font-content rich-text-box-scroll">
    ${items}
  </div>
</div>`;
    }

    _sizeDropdown() {
        const id = this._uid;
        const sizes = ['None','8','9','10','11','12','14','16','18','20','22','24','26','28','36','48','64'];
        const items = sizes.map(s => {
            const val = s === 'None' ? 'None' : `${s}px`;
            const sty = s === 'None' ? '' : `font-size:${s}px !important;`;
            return `<a class="rich-text-box-menu-item" style="${sty}cursor:pointer" onclick="RTBlazorfied_Method('size','${id}','${val}')">${s === 'None' ? 'None' : s}</a>`;
        }).join('');
        return `
<div class="rich-text-box-dropdown">
  <button id="blazing-rich-text-size-button" title="Size (Ctrl+Shift+[&lt;,&gt;])" class="rich-text-box-size-button rich-text-box-dropdown-btn"
    onclick="RTBlazorfied_Method('dropdown','${id}','blazing-rich-text-size-button-dropdown')">Size</button>
  <div id="blazing-rich-text-size-button-dropdown" class="rich-text-box-dropdown-content rich-text-box-size-content rich-text-box-scroll">
    ${items}
  </div>
</div>`;
    }

    _formatDropdown() {
        const id = this._uid;
        return `
<div class="rich-text-box-dropdown">
  <button id="blazing-rich-text-format-button" title="Format (Ctrl+Shift+[D,P,1,2...])" class="rich-text-box-format-button rich-text-box-dropdown-btn"
    onclick="RTBlazorfied_Method('dropdown','${id}','blazing-rich-text-format-button-dropdown')">Format</button>
  <div id="blazing-rich-text-format-button-dropdown" class="rich-text-box-dropdown-content rich-text-box-format-content rich-text-box-scroll">
    <a class="rich-text-box-menu-item" style="cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','none')">None</a>
    <a class="rich-text-box-menu-item" style="cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','p')">Paragraph</a>
    <a class="rich-text-box-menu-item" style="font-size:34px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h1')">Header 1</a>
    <a class="rich-text-box-menu-item" style="font-size:30px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h2')">Header 2</a>
    <a class="rich-text-box-menu-item" style="font-size:24px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h3')">Header 3</a>
    <a class="rich-text-box-menu-item" style="font-size:20px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h4')">Header 4</a>
    <a class="rich-text-box-menu-item" style="font-size:18px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h5')">Header 5</a>
    <a class="rich-text-box-menu-item" style="font-size:16px;cursor:pointer" onclick="RTBlazorfied_Method('format','${id}','h6')">Header 6</a>
  </div>
</div>`;
    }

    // ---- Color dialogs -----------------------------------------------------

    _colorSwatches(selectMethod) {
        const colors = [
            '#FFFFFF','#DCDCDC','#A9A9A9','#696969','#303030','#000000',
            '#FFCCCC','#FF6666','#FF3333','#FF0000','#CC0000','#990000','#800000',
            '#CCFFCC','#99FF99','#66FF66','#33CC33','#009900',
            '#CCCCFF','#9999FF','#6666FF','#3333CC','#000099','#002060',
            '#FFFFCC','#FFFF99','#FFFF66','#CCCC33','#999900',
            '#CCFFFF','#99FFFF','#66FFFF','#33CCCC','#009999',
            '#FFCCFF','#FF99FF','#FF66FF','#CC33CC','#990099',
            '#FFDDCC','#FFBB99','#FF9966','#FF7733','#CC4400',
            '#E0CCFF','#C199FF','#A366FF','#8533FF','#6600CC',
        ];
        return colors.map(c =>
            `<div class="blazing-rich-text-color-option" onclick="RTBlazorfied_Method('${selectMethod}','${this._uid}','${c}')" style="background-color:${c};"></div>`
        ).join('');
    }

    _colorDialog(dialogId, title, selectMethod, insertMethod) {
        const id = this._uid;
        return `
<dialog id="${dialogId}" class="rich-text-box-modal rich-text-box-scroll" aria-modal="true" aria-labelledby="${dialogId}-title">
  <div class="rtb-modal-header">
    <div id="${dialogId}-title" class="rich-text-box-modal-title">${title}</div>
    <button class="rich-text-box-modal-close" aria-label="Close dialog" onclick="RTBlazorfied_Method('closeDialog','${id}','${dialogId}')"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" width="8" height="8" style="display:block"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg></button>
  </div>
  <div class="rich-text-box-color-picker">
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        ${this._colorSwatches(selectMethod)}
        <div class="rich-text-box-color-display"></div>
      </div>
      <div class="rich-text-box-form-right">
        <div class="rich-text-box-slider-container">
          <label>R</label>
          <input type="range" class="rich-text-box-range rich-text-box-red-slider" min="0" max="255" value="0">
          <input type="number" class="rich-text-box-number rich-text-box-form-element rich-text-box-red-value" min="0" max="255" value="0">
        </div>
        <div class="rich-text-box-slider-container">
          <label>G</label>
          <input type="range" class="rich-text-box-range rich-text-box-green-slider" min="0" max="255" value="0">
          <input type="number" class="rich-text-box-number rich-text-box-form-element rich-text-box-green-value" min="0" max="255" value="0">
        </div>
        <div class="rich-text-box-slider-container">
          <label>B</label>
          <input type="range" class="rich-text-box-range rich-text-box-blue-slider" min="0" max="255" value="0">
          <input type="number" class="rich-text-box-number rich-text-box-form-element rich-text-box-blue-value" min="0" max="255" value="0">
        </div>
        <div class="rich-text-box-hex-container">
          <label>Hex:</label>
          <input type="text" class="rich-text-box-form-element rich-text-box-hex-input" value="#000000" autocomplete="off">
        </div>
      </div>
    </div>
    <div style="text-align:right;">
      <button class="rich-text-box-form-button" onclick="RTBlazorfied_Method('closeDialog','${id}','${dialogId}')">Close</button>
      <button id="rich-text-box-ok-button" class="rich-text-box-form-button" onclick="RTBlazorfied_Method('${insertMethod}','${id}')">OK</button>
    </div>
  </div>
</dialog>`;
    }

    _genericDialog(dialogId, title, insertMethod, bodyHTML) {
        const id = this._uid;
        return `
<dialog id="${dialogId}" class="rich-text-box-modal rich-text-box-scroll" aria-modal="true" aria-labelledby="${dialogId}-title">
  <div class="rtb-modal-header">
    <div id="${dialogId}-title" class="rich-text-box-modal-title">${title}</div>
    <button class="rich-text-box-modal-close" aria-label="Close dialog" onclick="RTBlazorfied_Method('closeDialog','${id}','${dialogId}')"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" width="8" height="8" style="display:block"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg></button>
  </div>
  <div>
    ${bodyHTML}
    <div style="margin-top:5px;text-align:right;">
      <button class="rich-text-box-form-button" onclick="RTBlazorfied_Method('closeDialog','${id}','${dialogId}')">Close</button>
      <button id="rich-text-box-ok-button" class="rich-text-box-form-button" onclick="RTBlazorfied_Method('${insertMethod}','${id}')">OK</button>
    </div>
  </div>
</dialog>`;
    }

    // ---- Toolbar HTML (with button visibility) -----------------------------

    _buildToolbarHTML() {
        const id = this._uid;
        const v  = this._visibility;

        const textStylesDividerNeeded = (v.font || v.size || v.format) && v.textStylesDivider;
        const formatDividerNeeded     = (v.bold || v.italic || v.underline || v.strikethrough || v.subscript || v.superscript) && v.formatDivider;
        const colorDividerNeeded      = v.textColor && v.textColorDivider;
        const alignDividerNeeded      = (v.alignLeft || v.alignCenter || v.alignRight || v.alignJustify) && v.alignDivider;
        const actionDividerNeeded     = (v.copy || v.cut || v.paste || v.delete || v.selectAll) && v.actionDivider;
        const listDividerNeeded       = (v.orderedList || v.unorderedList || v.indent) && v.listDivider;
        const mediaDividerNeeded      = (v.link || v.image || v.imageUpload || v.quote || v.codeBlock || v.embedMedia || v.video || v.table || v.horizontalRule) && v.mediaDivider;
        const historyDividerNeeded    = (v.undo || v.redo) && v.historyDivider;

        return `
<div id="${id}_Toolbar" class="rich-text-box-tool-bar" role="toolbar" aria-label="Formatting toolbar">

  ${v.font   ? this._fontDropdown()   : ''}
  ${v.size   ? this._sizeDropdown()   : ''}
  ${v.format ? this._formatDropdown() : ''}
  ${textStylesDividerNeeded ? this._divider() : ''}

  ${v.bold          ? this._btn('blazing-rich-text-bold-button',       'Bold',          'Bold (Ctrl+B)',              'bold')          : ''}
  ${v.italic        ? this._btn('blazing-rich-text-italic-button',     'Italic',        'Italic (Ctrl+I)',            'italic')        : ''}
  ${v.underline     ? this._btn('blazing-rich-text-underline-button',  'Underline',     'Underline (Ctrl+U)',         'underline')     : ''}
  ${v.strikethrough ? this._btn('blazing-rich-text-strike-button',     'Strikethrough', 'Strikethrough (Ctrl+D)',     'strikethrough') : ''}
  ${v.subscript   ? this._btn('blazing-rich-text-sub-button',   'Subscript',   'Subscript (Ctrl+=)',         'subscript')   : ''}
  ${v.superscript ? this._btn('blazing-rich-text-super-button', 'Superscript', 'Superscript (Ctrl+Shift++)', 'superscript') : ''}
  ${formatDividerNeeded ? this._divider() : ''}

  ${v.textColor ? this._btn('blazing-rich-text-textcolor-button',        'TextColor',           'Text Color (Ctrl+Shift+C)',            'openTextColorDialog')           : ''}
  ${v.textColor ? this._btn('blazing-rich-text-text-bg-color-button',    'TextBackgroundColor', 'Text Background Color (Ctrl+Shift+B)', 'openTextBackgroundColorDialog') : ''}
  ${v.textColor ? this._btn('blazing-rich-text-textcolor-remove-button', 'RemoveTextFormat',    'Remove Color',                        'removeTextColor')               : ''}
  ${colorDividerNeeded ? this._divider() : ''}

  ${v.alignLeft    ? this._btn('blazing-rich-text-alignleft-button',    'Alignleft',    'Align Left (Ctrl+L)',    'alignleft')    : ''}
  ${v.alignCenter  ? this._btn('blazing-rich-text-aligncenter-button',  'Aligncenter',  'Align Center (Ctrl+E)',  'aligncenter')  : ''}
  ${v.alignRight   ? this._btn('blazing-rich-text-alignright-button',   'Alignright',   'Align Right (Ctrl+R)',   'alignright')   : ''}
  ${v.alignJustify ? this._btn('blazing-rich-text-alignjustify-button', 'Alignjustify', 'Align Justify (Ctrl+J)', 'alignjustify') : ''}
  ${alignDividerNeeded ? this._divider() : ''}

  ${v.cut       ? this._btn('blazing-rich-text-cut-button',       'Cut',       'Cut (Ctrl+X)',        'cut')       : ''}
  ${v.copy      ? this._btn('blazing-rich-text-copy-button',      'Copy',      'Copy (Ctrl+C)',       'copy')      : ''}
  ${v.paste     ? this._btn('blazing-rich-text-paste-button',     'Paste',     'Paste (Ctrl+V)',      'paste')     : ''}
  ${v.delete    ? this._btn('blazing-rich-text-delete-button',    'Delete',    'Delete',              'delete')    : ''}
  ${v.selectAll ? this._btn('blazing-rich-text-selectall-button', 'Selectall', 'Select All (Ctrl+A)', 'selectall') : ''}
  ${actionDividerNeeded ? this._divider() : ''}

  ${v.orderedList   ? this._btn('blazing-rich-text-orderedlist-button',     'OrderedList',   'Ordered List (Ctrl+Shift+O)',   'orderedlist')   : ''}
  ${v.unorderedList ? this._btn('blazing-rich-text-unorderedlist-button',   'UnorderedList', 'Unordered List (Ctrl+Shift+U)', 'unorderedlist') : ''}
  ${v.indent        ? this._btn('blazing-rich-text-increase-indent-button', 'IncreaseIndent','Increase Indent (Tab)',          'increaseIndent') : ''}
  ${v.indent        ? this._btn('blazing-rich-text-decrease-indent-button', 'DecreaseIndent','Decrease Indent (Shift+Tab)',    'decreaseIndent') : ''}
  ${listDividerNeeded ? this._divider() : ''}

  ${v.link        ? this._btn('blazing-rich-text-link-button',        'CreateLink',  'Insert Link (Ctrl+Shift+K)',  'openLinkDialog')        : ''}
  ${v.link        ? this._btn('blazing-rich-text-remove-link-button', 'RemoveLink',  'Remove Link',                 'removeLink')            : ''}
  ${v.image       ? this._btn('blazing-rich-text-image-button',       'Image',       'Insert Image (Ctrl+Shift+I)', 'openImageDialog')       : ''}
  ${v.imageUpload ? this._btn('blazing-rich-text-image-upload-button','UploadImage', 'Upload Image (Ctrl+Shift+&)', 'uploadImageDialog')     : ''}
  ${v.quote       ? this._btn('blazing-rich-text-quote-button',       'Quote',       'Block Quote (Ctrl+Shift+Q)',  'openBlockQuoteDialog')  : ''}
  ${v.embedMedia  ? this._btn('blazing-rich-text-embed-button',       'PermMedia',   'Insert Media (Ctrl+Shift+M)', 'openMediaDialog')       : ''}
  ${v.video       ? this._btn('blazing-rich-text-video-button',       'VideoFile',   'Insert Video (Ctrl+Shift+V)', 'openVideoDialog')        : ''}
  ${v.table       ? this._btn('blazing-rich-text-table-button',       'Table',       'Table (Ctrl+Shift+L)',        'openTableDialog')       : ''}
  ${v.codeBlock      ? this._btn('blazing-rich-text-code-block-button', 'CodeBlocks',     'Code Block (Ctrl+Shift+*)',        'openCodeBlockDialog')  : ''}
  ${v.horizontalRule ? this._btn('blazing-rich-text-hr-button',         'HorizontalRule', 'Horizontal Rule (Ctrl+Shift+H)',   'insertHorizontalRule') : ''}
  ${mediaDividerNeeded ? this._divider() : ''}

  ${v.undo ? this._btn('blazing-rich-text-undo-button', 'Undo', 'Undo (Ctrl+Z)', 'goBack')    : ''}
  ${v.redo ? this._btn('blazing-rich-text-redo-button', 'Redo', 'Redo (Ctrl+Y)', 'goForward') : ''}
  ${historyDividerNeeded ? this._divider() : ''}

  ${v.statusBarToggle? this._specialBtn('blazing-rich-text-statusbar-button',  'StatusBar', 'Toggle Status Bar (Ctrl+\\)', 'toggleStatusBar')   : ''}
  ${v.saveHtml       ? this._specialBtn('blazing-rich-text-save-button',       'SaveHtml',  'Save HTML (Ctrl+Shift+S)',     'saveHtml')          : ''}
  ${v.htmlView       ? this._specialBtn('blazing-rich-text-source',            'Code',      'HTML Source (Ctrl+Shift+A)',   'toggleView')        : ''}
  ${v.preview        ? this._specialBtn('blazing-rich-text-preview-button',    'Preview',   'Preview (Ctrl+Shift+P)',       'openPreview')       : ''}

  ${this._colorDialog('rich-text-box-text-color-modal',    'Text Color',            'selectTextColor',           'insertTextColor')}
  ${this._colorDialog('rich-text-box-text-bg-color-modal', 'Text Background Color', 'selectTextBackgroundColor', 'insertTextBackgroundColor')}

  ${this._genericDialog('rich-text-box-table-modal', 'Table', 'insertTable', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Columns</label>
        <input type="number" id="rich-text-box-table-columns" class="rich-text-box-form-element" min="0" max="10000" value="0" autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Rows</label>
        <input type="number" id="rich-text-box-table-rows" class="rich-text-box-form-element" min="0" max="10000" value="0" autocomplete="off">
        <label>Width</label>
        <input type="text" id="rich-text-box-table-width" class="rich-text-box-form-element" placeholder="500px">
      </div>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-table-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-embed-modal', 'Media', 'insertMedia', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Source</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-embed-source" placeholder="e.g., /documents/file.pdf" autocomplete="off">
        <label>Type</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-embed-type" placeholder="e.g., audio/mp3, application/pdf" autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Width</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-embed-width" placeholder="450" autocomplete="off">
        <label>Height</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-embed-height" placeholder="250" autocomplete="off">
      </div>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-embed-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-video-modal', 'Video', 'insertVideo', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Source</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-source" placeholder="e.g., /videos/movie.mp4" autocomplete="off">
        <label>Source Type</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-source-type" placeholder="e.g., video/mp4" autocomplete="off">
        <label>Poster Image URL</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-poster" placeholder="e.g., /images/poster.jpg" autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Width</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-width" placeholder="640" autocomplete="off">
        <label>Height</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-height" placeholder="360" autocomplete="off">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-video-css-classes" placeholder="class1 class2 class3">
      </div>
      <div style="clear:both;display:grid;grid-template-columns:1fr 1fr;gap:2px 20px;margin-top:10px;">
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <input class="rich-text-box-form-checkbox" type="checkbox" id="rich-text-box-video-controls">
          Controls
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <input class="rich-text-box-form-checkbox" type="checkbox" id="rich-text-box-video-autoplay">
          Autoplay
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <input class="rich-text-box-form-checkbox" type="checkbox" id="rich-text-box-video-loop">
          Loop
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <input class="rich-text-box-form-checkbox" type="checkbox" id="rich-text-box-video-muted">
          Muted
        </label>
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-code-block-modal', 'Code Block', 'insertCodeBlock', `
    <div class="clearfix">
      <label>Code Block</label>
      <textarea rows="6" cols="50" class="rich-text-box-form-element rich-text-box-code rich-text-box-scroll" id="rich-text-box-code" spellcheck="false"></textarea>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-code-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-block-quote-modal', 'Block Quote', 'insertBlockQuote', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Quote</label>
        <textarea rows="6" cols="50" class="rich-text-box-form-element rich-text-box-quote rich-text-box-scroll" id="rich-text-box-quote"></textarea>
      </div>
      <div class="rich-text-box-form-right">
        <label>Cite</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-cite" placeholder="https://www..." autocomplete="off">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-quote-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-image-modal', 'Image', 'insertImage', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Web Address</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-image-webaddress" placeholder="https://www..." autocomplete="off">
        <label>Alternative Text</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-image-alt-text" autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Width</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-image-width" placeholder="400" autocomplete="off">
        <label>Height</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-image-height" autocomplete="off">
      </div>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-image-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-upload-image-modal', 'Upload / Embed Image', 'uploadImage', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <div style="height:40px;padding:20px 0 10px 0;">
          <input type="file" id="rich-text-box-upload-image-file" hidden>
          <label for="rich-text-box-upload-image-file" class="rich-text-box-upload-btn">Choose File</label>
          <span id="rich-text-box-upload-image-file-chosen">No file chosen</span>
        </div>
        <label>Alternative Text</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-upload-image-alt-text" autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Width</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-upload-image-width" placeholder="400" autocomplete="off">
        <label>Height</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-upload-image-height" autocomplete="off">
      </div>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-upload-image-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}

  ${this._genericDialog('rich-text-box-link-modal', 'Link', 'insertLink', `
    <div class="clearfix">
      <div class="rich-text-box-form-left">
        <label>Web Address</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-link-webaddress" placeholder="https://www..." autocomplete="off">
      </div>
      <div class="rich-text-box-form-right">
        <label>Link Text</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-linktext" autocomplete="off">
        <label style="display:flex;align-items:center;margin-bottom:12px;">
          <input class="rich-text-box-form-checkbox" id="rich-text-box-link-modal-newtab" type="checkbox">
          Open in New Tab
        </label>
      </div>
      <div class="rich-text-box-form-left">
        <label>CSS Classes</label>
        <input class="rich-text-box-form-element" type="text" id="rich-text-box-link-css-classes" placeholder="class1 class2 class3">
      </div>
    </div>
  `)}


  ${this._buildPreviewDialogHTML()}

</div>`;
    }

    // ---- Preview dialog — lives in the shadow DOM alongside all other modals -

    _buildPreviewDialogHTML() {
        const id = this._uid;
        return `
<dialog id="${id}_Preview" class="rich-text-box-modal rich-text-box-scroll rtb-preview-dialog" aria-modal="true" aria-labelledby="${id}_Preview-title">
  <div class="rtb-modal-header">
    <div id="${id}_Preview-title" class="rich-text-box-modal-title">Preview</div>
    <button class="rich-text-box-modal-close" aria-label="Close preview" onclick="RTBlazorfied_Method('closePreview','${id}')"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" width="8" height="8" style="display:block"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg></button>
  </div>
  <div class="rtb-preview-dialog-body">
    <div id="rich-text-box-preview" class="rtb-preview-window"></div>
    <div style="text-align:right;flex-shrink:0;">
      <button class="rich-text-box-form-button" onclick="RTBlazorfied_Method('closePreview','${id}')">Close</button>
    </div>
  </div>
</dialog>`;
    }
}

customElements.define('rt-native', RichTextBox);
