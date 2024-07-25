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

        /* Initialize a Node Manager */
        this.NodeManager = new RTBlazorfiedNodeManager(this.shadowRoot, this.content);
        
        /* Initialize Action Options (e.g., cut, copy, paste) */
        this.ActionOptions = new RTBlazorfiedActionOptions(this.shadowRoot, this.content);

        /* Initialize List Provider */
        this.ListProvider = new RTBlazorfiedListProvider(this.shadowRoot, this.content);

        /* Create a state manager */
        this.StateManager = new RTBlazorfiedStateManager(this.content, this.source, this.dotNetObjectReference);

        /* Initialize the color pickers */
        this.ColorPickers = {};
        const colorModal = "rich-text-box-text-color-modal";
        const bgColorModal = "rich-text-box-text-bg-color-modal";
        this.ColorPickers[colorModal] = new RTBlazorfiedColorDialog(this.shadowRoot, this.content, colorModal);
        this.ColorPickers[bgColorModal] = new RTBlazorfiedColorDialog(this.shadowRoot, this.content, bgColorModal);

        /* Initialize the Link Dialog */
        this.LinkDialog = new RTBlazorfiedLinkDialog(this.shadowRoot, this.content);

        /* Initialize utilities class */
        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);

        /* Initialize Image Dialog */
        this.ImageDialog = new RTBlazorfiedImageDialog(this.shadowRoot, this.content);

        /* Initialize Upload Image Dialog */
        /* Removed to prevent abuse. */
        /* this.UploadImageDialog = new RTBlazorfiedUploadImageDialog(this.shadowRoot, this.content); */

        /* Initialize Blockquote Dialog */
        this.BlockQuoteDialog = new RTBlazorfiedBlockQuoteDialog(this.shadowRoot, this.content);

        /* Initialize Code Block Dialog */
        this.CodeBlockDialog = new RTBlazorfiedCodeBlockDialog(this.shadowRoot, this.content);

        /* Initialize the Media Dialog */
        this.MediaDialog = new RTBlazorfiedMediaDialog(this.shadowRoot, this.content);

        /* Table Dialog */ 
        this.TableDialog = new RTBlazorfiedTableDialog(this.shadowRoot, this.content);

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

        const contentContainer = document.createElement('div');
        contentContainer.classList.add('rich-text-box-content-container', 'rich-text-box-scroll');

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'rich-text-box-container');

        /* The main content that is referenced throughout */
        this.content = document.createElement('div');
        this.content.setAttribute('id', this.id);
        this.content.setAttribute('class', 'rich-text-box-content');
        this.content.setAttribute('contenteditable', 'true');
        this.content.style.display = "block";

        this.source = document.createElement('textarea');
        this.source.setAttribute('id', 'rich-text-box-source');
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
            this.closeFadingBar();
        };

        fadingBar.appendChild(message);
        fadingBar.appendChild(closeButton);

        /* Assemble everything into the container */
        const toolbar = document.getElementById(this.toolbar_id);
        this.container.appendChild(toolbar);

        //contentContainer.appendChild(fadingBar);
        contentContainer.appendChild(this.content);
        contentContainer.appendChild(this.source);
        this.container.appendChild(fadingBar);
        this.container.appendChild(contentContainer);

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

        /* Prevent certain clicks */
        this.content.addEventListener('click', (event) => {
            /* Prevent the default link click */
            if (event.target.tagName === 'A') {
                event.preventDefault();
                event.stopPropagation();
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
    };
    goForward = () => {
        this.StateManager.goForward();
        this.NodeManager.refreshUI();
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
            if (this.EditMode === true) {
                this.getHtml();
            }
            else {
                this.getCode();
            }            
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
            this.format("p");
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
        
        if (event.key === 'Enter') {
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                if (selection.anchorNode != null && selection.anchorNode !== this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content) {
                    switch (selection.anchorNode.parentNode.nodeName) {
                        case "BLOCKQUOTE":
                            event.preventDefault();
                            this.NodeManager.insertLineBreak(selection.anchorNode.parentNode);
                            break;
                        case "CODE":
                            event.preventDefault();
                            this.NodeManager.insertLineBreak(selection.anchorNode.parentNode);
                            break;
                        case "SPAN":
                            event.preventDefault();
                            this.NodeManager.insertLineBreak(selection.anchorNode.parentNode);
                            break;
                    }
                }
            }
        }
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

        /* Close the dialog */
        this.closeDialog(modal);
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
        /* Close the dialog */
        this.closeDialog(modal);
    }
    openTableDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
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
    uploadImageDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.content.focus();
        const selection = this.Utilities.getSelection();
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
        this.Utilities.closeDialog(id);
        this.lockToolbar = false;
        this.content.focus();
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
    getHtml = () => {
        const html = this.html();
        this.loadInnerText(html);
        this.content.style.display = "none";
        this.source.style.display = "block";
        this.source.focus();
        this.source.scrollTop = 0;
        this.source.scrollLeft = 0;
        this.disableButtons();
    };
    getCode = () => {
        const plaintext = this.source.value;
        this.loadHtml(plaintext);
        this.content.style.display = "block";
        this.source.style.display = "none";
        this.content.focus();
        this.enableButtons();
    };
    html = () => {
        return this.content.innerHTML;
    };
    loadHtml = (html) => {
        this.EditMode = true;

        /* Toggle the button */
        const btn = this.shadowRoot.getElementById("blazing-rich-text-source");
        if (btn.classList.contains("selected")) {
            btn.classList.remove("selected");
        }

        this.content.style.fontFamily = 'Arial, sans-serif';
        if (html != null) {
            this.content.innerHTML = html;
        }
        else {
            this.content.innerHTML = "";
        }
        this.NodeManager.clearButtons();
    };
    loadInnerText = (text) => {
        this.EditMode = false;

        /* Toggle the button */
        const btn = this.shadowRoot.getElementById("blazing-rich-text-source");
        btn.classList.add("selected");

        this.source.style.fontFamily = 'Consolas, monospace';
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
    constructor(content, source, dotNetObjectReference) {
        this.content = content;
        this.source = source;
        this.dotNetObjectReference = dotNetObjectReference;

        /* Initialize history */
        this.history = [];
        this.currentIndex = -1;
        this.currentIndex = -1;

        this.mutationObserver();
    }

    mutationObserver = () => {
        /* Save the state when mutations to the state occur */
        const richtextbox = (mutationsList, observer) => {
            if (this.content.style.display === "block") {
                for (let mutation of mutationsList) {
                    switch (mutation.type) {
                        case 'childList':
                            this.saveState();
                            break;
                        case 'attributes':
                            this.saveState();
                            break;
                        case 'characterData':
                            this.saveState();
                            break;
                        case 'subtree':
                            this.saveState();
                            break;
                    }
                }
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
        const currentState = this.content.innerHTML;

        /* If there is any change in the content */
        if (this.currentIndex === -1 || currentState !== this.history[this.currentIndex]) {

            /* Remove all future states */
            this.history = this.history.slice(0, this.currentIndex + 1);

            /* Add the new state */
            this.history.push(currentState);
            this.currentIndex++;

            /* Remove the oldest state if history exceeds 20 entries */
            if (this.history.length > 40) {
                /* shift() removes the oldest entry */
                this.history.shift();
                this.currentIndex--;
            }
        }
        this.updateBinding();
    };

    /* History */
    goBack = () => {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.content.innerHTML = this.history[this.currentIndex];
        }
    };
    goForward = () => {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.content.innerHTML = this.history[this.currentIndex];
        }
    };
}

class RTBlazorfiedNodeManager {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }
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

                    if (sel.anchorNode != null && sel.rangeCount != 0) {
                        const range = document.createRange();
                        range.setStartAfter(sel.anchorNode);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
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
                if (element == null && sel.anchorNode != null && sel.anchorNode != this.content && this.content.contains(sel.anchorNode) && sel.anchorNode.nodeType === Node.ELEMENT_NODE) {
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
                        if (element.style.textAlign == "justify") {
                            this.removeProperty(element, "text-align", "justify");
                        }
                        else {
                            element.style.setProperty("text-align", "justify");
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
        if (element.style.margin == "auto") {
            this.removeProperty(element, "margin", "auto");
        }
        if (element.style.marginLeft == "auto") {
            this.removeProperty(element, "margin-left", "auto");
        }
        if (alignment === 'aligncenter') {
            element.style.setProperty("margin", "auto");
        }

        if (alignment === 'alignright') {
            element.style.setProperty("margin-left", "auto");
        }
    }

    isExcluded = (selection) => {
        /* Make certain the user cannot select table
        cells from the left */
        if (selection.anchorNode.nodeType === Node.ELEMENT_NODE) {
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
                    if (!currentNode.getAttribute('style')) {
                        currentNode.removeAttribute('style');
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
                bold.classList.add("selected");
            }
            /* Text color */
            if (el.parentNode.style != null && el.parentNode.style.color) {
                textColor.classList.add("selected");
            }
            /* Text background color */
            if (el.parentNode.style != null && el.parentNode.style.backgroundColor) {
                textBackgroundColor.classList.add("selected");
            }
            /* Remove text color */
            if (el.parentNode.style != null && el.parentNode.style.color || el.parentNode.style.backgroundColor) {
                textColorRemove.classList.add("selected");
            }
            if (compStyles.getPropertyValue("font-style") == "italic") {
                italic.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-decoration").includes("underline") && el.parentNode.nodeName != "A") {
                underline.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-decoration").includes("line-through")) {
                strike.classList.add("selected");
            }
            if (compStyles.getPropertyValue("vertical-align") == "sub") {
                sub.classList.add("selected");
            }
            if (compStyles.getPropertyValue("vertical-align") == "super") {
                superscript.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-align") == "left" && !this.textAlign) {
                alignleft.classList.add("selected");
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "center" && !this.textAlign) {
                aligncenter.classList.add("selected");
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "right" && !this.textAlign) {
                alignright.classList.add("selected");
                this.textAlign = true;
            }
            if (compStyles.getPropertyValue("text-align") == "justify" && !this.textAlign) {
                alignjustify.classList.add("selected");
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
                link.classList.add("selected");
                linkRemove.classList.add("selected");
            }
            if (el.parentNode.nodeName == "BLOCKQUOTE") {
                blockQuote.classList.add("selected");
            }
            if (el.parentNode.nodeName == "CODE") {
                codeBlock.classList.add("selected");
            }
            if (el.parentNode.nodeName == "TD") {
                table.classList.add("selected");
            }
            if (el.parentNode.nodeName == "OL") {
                ol.classList.add("selected");
            }
            if (el.parentNode.nodeName == "UL") {
                ul.classList.add("selected");
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

        /* Select Buttons */
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            this.selectButtons(selection.anchorNode);
        }
        this.content.focus();        
    };

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

        const buttons = this.shadowRoot.querySelectorAll('.rich-text-box-menu-item');
        buttons.forEach(function (button) {
            if (button.classList.contains("selected")) {
                button.classList.remove('selected');
            }
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
                    element.removeAttribute("style");
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
                element.removeAttribute("style");
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
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        /* Initialize a Node Manager */
        this.NodeManager = new RTBlazorfiedNodeManager(this.shadowRoot, this.content);
        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
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

                    console.log(node);
                    console.log(ulElement);
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

        const childList = list.querySelector('ul, ol');
        if (childList !== null) {
            this.Utilities.showFadingBar("The list contains childnodes and cannot be removed.");
            return;
        }

        /* Variable to store the first node moved out of the list */
        let firstNode = null;

        /* Remove the list */
        while (list.firstChild) {
            const listItem = list.firstChild;

            /* Move each child node of listItem to before list */
            while (listItem.firstChild) {
                const child = listItem.firstChild;
                if (!firstNode) {
                    firstNode = child; // Store the first node
                }
                list.parentNode.insertBefore(child, list);
            }

            /* Remove the now empty listItem */
            list.removeChild(listItem);
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

        /* Create a new <ul> and append the selected <li> elements to it */
        const newList = document.createElement(list.nodeName);
        selectedNodes.forEach(item => {
            const clonedItem = item.cloneNode(true); // Clone the node and its descendants
            newList.appendChild(clonedItem);
        });

        /* Insert the new <ul> in place of the first <li> element */
        const firstItem = selectedNodes[0];
        list.insertBefore(newList, firstItem);

        /* Remove the original selected nodes from the original list */
        selectedNodes.forEach(item => list.removeChild(item));

        /*  Restore the selection */
        const newRange = document.createRange();

        /* Reselect the nodes */
        if (newList.firstChild !== newList.lastChild) {
            newRange.setStartBefore(newList.firstChild);
            newRange.setEndAfter(newList.lastChild);

            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        else {
            newRange.setStart(newList, 0);
            newRange.collapse(true);

            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    decreaseIndent = (list) => {
        /* Check if the list is a <ul> or <ol> and has at least one child */
        if (list.nodeName !== 'UL' && list.nodeName !== 'OL' || list.children.length === 0) {
            return;
        }

        /* Find the parent list element and the child list element */
        const parentList = list.parentElement;
        if (parentList.nodeName !== 'UL' && parentList.nodeName !== 'OL' || parentList.children.length === 0) {
            this.removelist(list);
            return;
        }

        const childList = parentList.querySelector('ul, ol');
        if (!childList) {
            return;
        }

        /* Collect the nodes to be moved from the child list */
        const nodesToMove = Array.from(childList.children);

        /* Insert the nodes from the child list into the parent list */
        nodesToMove.forEach(item => {
            parentList.insertBefore(item, list.nextSibling);
        });

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
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
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

    closeDialog = (id) => {
        const e = this.shadowRoot.getElementById(id);
        if (e != null) {
            e.close();
        }
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
}
class RTBlazorfiedTableDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.dialog = this.shadowRoot.getElementById("rich-text-box-table-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertTable();
                this.dialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }

    openTableDialog = (selection) => {
        this.resetTableDialog();

        if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode != this.content && selection.anchorNode.parentNode.nodeName === "TD") {

            const table = this.getTable(selection);
            if (table) {
                const rows = this.shadowRoot.getElementById("rich-text-box-table-rows");
                rows.value = table.rows.length;
                rows.disabled = true;

                const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
                columns.value = this.getColumns(table);
                columns.disabled = true;

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

        const classes = this.shadowRoot.getElementById("rich-text-box-table-classes");
        if (classes != null) {
            classes.value = null;
        }
    }

    insertTable = () => {
        const rows = this.shadowRoot.getElementById("rich-text-box-table-rows");
        const columns = this.shadowRoot.getElementById("rich-text-box-table-columns");
        const classes = this.shadowRoot.getElementById("rich-text-box-table-classes");

        if (rows.value.length == 0 || columns.value.length == 0) {
            this.Utilities.closeDialog("rich-text-box-table-modal");
            this.content.focus();
            return;
        }

        /* Get the link selection or element */
        if (this.table != null) {
            if (classes != null) {
                this.Utilities.addClasses(classes.value, this.table);
            }
        }
        else {
            if (this.tableSelection != null) {
                const range = this.tableSelection;
                const table = this.createTable(rows.value, columns.value);
                if (classes != null) {
                    this.Utilities.addClasses(classes.value, table);
                }
                range.deleteContents();
                range.insertNode(table);

                /* Set the cursor position to the first cell of the table */
                let firstCell = table.querySelector('td, th');
                let newRange = document.createRange();
                newRange.setStart(firstCell, 0);
                newRange.setEnd(firstCell, 0);

                let selection = document.getSelection();
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }

        this.Utilities.closeDialog("rich-text-box-table-modal");
    }
    createTable = (r, c) => {
        // Convert rows and columns to integers
        const rows = parseInt(r, 10);
        const columns = parseInt(c, 10);

        // Create the table element
        const table = document.createElement('table');
        //table.style.setProperty('margin', 'auto');

        // Create the table body element
        const tbody = document.createElement('tbody');

        // Loop through the number of rows
        for (let i = 0; i < rows; i++) {
            // Create a row element
            const tr = document.createElement('tr');

            // Loop through the number of columns
            for (let j = 0; j < columns; j++) {
                // Create a cell element
                const td = document.createElement('td');
                td.innerHTML = `&#8203;`;
                tr.appendChild(td);
            }

            // Append the row to the tbody
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
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.dialog = this.shadowRoot.getElementById("rich-text-box-embed-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertMedia();
                this.dialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }

    openMediaDialog = (selection) => {
        if (selection !== null) {
            this.resetMediaDialog();

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

        if (this.embedSelection != null && source.value.length > 0) {

            const range = this.embedSelection.cloneRange();

            /* Create the <code> element */
            const object = document.createElement('object');

            /* Set the content of the <code> element */
            object.data = source.value;
            object.type = type.value;
            object.height = height.value;
            object.width = width.value;
            if (classes != null) {
                this.Utilities.addClasses(classes.value, object);
            }

            range.deleteContents();
            range.insertNode(object);

            /* Move the cursor after the inserted element */
            range.setStartAfter(object);
            range.setEndAfter(object);

            /* Get the selection from the shadowRoot */
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        this.Utilities.closeDialog("rich-text-box-embed-modal");
    }
}
class RTBlazorfiedCodeBlockDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        const code = this.shadowRoot.getElementById('rich-text-box-code');
        this.dialog = this.shadowRoot.getElementById("rich-text-box-code-block-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                /* Make certain the user is not pressing enter in the code block */
                if (event.target !== code) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.insertCodeBlock();
                    this.dialog.close();
                    this.content.focus();
                } 
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }

    openCodeBlockDialog = (selection) => {
        if (selection !== null) {
            this.resetCodeBlockDialog();          

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
            if (classes != null) {
                this.Utilities.addClasses(classes.value, element);
            }
        }
        else {
            if (this.codeSelection != null && codeText.value.length > 0) {

                const range = this.codeSelection.cloneRange();

                /* Create the <pre> element */
                const pre = document.createElement('pre');

                /* Create the <code> element */
                const code = document.createElement('code');
                if (classes != null) {
                    this.Utilities.addClasses(classes.value, code);
                }

                /* Set the content of the <code> element */
                code.textContent = codeText.value;

                /* Append the <code> element to the <pre> element */
                pre.appendChild(code);

                range.deleteContents();
                range.insertNode(pre);

                /* Move the cursor after the inserted element */
                range.setStartAfter(pre);
                range.setEndAfter(pre);

                /* Reset the selection from the shadowRoot */
                const selection = this.Utilities.getSelection();
                if (selection !== null) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        this.Utilities.closeDialog("rich-text-box-code-block-modal");
    }
}
class RTBlazorfiedBlockQuoteDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        const quote = this.shadowRoot.getElementById('rich-text-box-quote');
        this.dialog = this.shadowRoot.getElementById("rich-text-box-block-quote-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                /* Make certain the user is not pressing enter in the quote block */
                if (event.target !== quote) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.insertBlockQuote();
                    this.dialog.close();
                    this.content.focus();
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }

    openBlockQuoteDialog = (selection) => {
        if (selection !== null) {
            this.resetBlockQuoteDialog();

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
                element.removeAttribute('cite');
            }
            if (classes != null) {
                this.Utilities.addClasses(classes.value, element);
            }

            const range = this.quoteSelection.cloneRange();
            /* Move the cursor after the inserted element */
            range.setStartAfter(element);
            range.setEndAfter(element);
            
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        else {
            if (this.quoteSelection != null && quote.value.length > 0) {

                const range = this.quoteSelection.cloneRange();

                const blockquote = document.createElement("blockquote");
                blockquote.textContent = quote.value;
                if (cite.value.trim().length > 0) {
                    blockquote.cite = cite.value;
                }
                if (classes != null) {
                    this.Utilities.addClasses(classes.value, blockquote);
                }

                range.deleteContents();
                range.insertNode(blockquote);

                /* Move the cursor after the inserted element */
                range.setStartAfter(blockquote);
                range.setEndAfter(blockquote);

                /* Get the selection from the shadowRoot */
                const selection = this.Utilities.getSelection();
                if (selection !== null) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        this.Utilities.closeDialog("rich-text-box-block-quote-modal");
    }
}

class RTBlazorfiedUploadImageDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.dialog = this.shadowRoot.getElementById("rich-text-box-upload-image-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertUploadedImage();
                this.dialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        const actualBtn = this.shadowRoot.getElementById('rich-text-box-upload-image-file');
        actualBtn.addEventListener('change', this.handleFileSelect);

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }
    handleFileSelect = (event) => {
        const file = event.target.files[0]; // Get the selected file

        const fileChosen = this.shadowRoot.getElementById('rich-text-box-upload-image-file-chosen');
        fileChosen.textContent = file.name

        /* Unfortunately no better way to do this */
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

            this.range = selection.getRangeAt(0).cloneRange();
            this.shadowRoot.getElementById("rich-text-box-upload-image-modal").show();

            const address = this.shadowRoot.getElementById("rich-text-box-upload-image-file");
            if (address) {
                address.focus();
            }
        }
    }
    resetUploadImageDialog = () => {
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

        if (this.image) {
            if (width.value.length > 0) {
                this.image.width = width.value;
            }
            if (height.value.length > 0) {
                this.image.height = height.value;
            }
            if (alt.value.length > 0) {
                this.image.alt = alt.value;
            }
            if (classes != null) {
                this.Utilities.addClasses(classes.value, this.image);
            }

            this.range.deleteContents();
            this.range.insertNode(this.image);
        }
        this.Utilities.closeDialog("rich-text-box-upload-image-modal");
    }
}
class RTBlazorfiedImageDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.dialog = this.shadowRoot.getElementById("rich-text-box-image-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertImage();
                this.dialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }

    openImageDialog = (selection) => {
        if (selection !== null) {
            this.resetImageDialog();
            
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

        if (this.imageSelection != null && address.value.length > 0) {

            const range = this.imageSelection.cloneRange();

            const img = document.createElement("img");
            img.src = address.value;
            if (width.value.length > 0) {
                img.width = width.value;
            }
            if (height.value.length > 0) {
                img.height = height.value;
            }
            if (alt.value.length > 0) {
                img.alt = alt.value;
            }
            if (classes != null) {
                this.Utilities.addClasses(classes.value, img);
            }

            range.deleteContents();
            range.insertNode(img);

            /* Move the cursor after the inserted image */
            range.setStartAfter(img);
            range.setEndAfter(img);

            /* Get the selection from the shadowRoot */
            const selection = this.Utilities.getSelection();
            if (selection !== null) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
                        
            /* Update the stored cursor position to the new position */
            this.imageSelection = range.cloneRange();
        }
        this.Utilities.closeDialog("rich-text-box-image-modal");
    }
}
class RTBlazorfiedLinkDialog {
    constructor(shadowRoot, content) {
        this.shadowRoot = shadowRoot;
        this.content = content;

        this.dialog = this.shadowRoot.getElementById("rich-text-box-link-modal");
        this.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertLink();
                this.dialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.dialog.close();
                this.content.focus();
            }
        });

        this.Utilities = new RTBlazorfiedUtilities(this.shadowRoot, this.content);
    }
    openLinkDialog = (selection) => {
        if (selection !== null) {
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
            this.Utilities.closeDialog("rich-text-box-link-modal");
            this.content.focus();
            return;
        }

        /* Get the link selection or element */
        if (this.linkNode != null) {
            const element = this.linkNode;
            element.href = link.value;
            element.textContent = linktext.value;
            if (classes != null) {
                this.Utilities.addClasses(classes.value, element);
            }
            if (newtab.checked) {
                element.target = "_blank";
            }
            else {
                element.removeAttribute('target');
            }
        }
        else {
            if (this.linkSelection != null) {
                const range = this.linkSelection;
                const anchor = document.createElement("a");
                anchor.href = link.value;
                anchor.textContent = linktext.value;
                if (classes != null) {
                    this.Utilities.addClasses(classes.value, anchor);
                }
                if (newtab.checked) {
                    anchor.target = "_blank";
                }
                range.deleteContents();
                range.insertNode(anchor);
            }
        }
        this.Utilities.closeDialog("rich-text-box-link-modal");
    }

    removeLink = () => {
        const selection = this.Utilities.getSelection();
        if (selection !== null) {
            const savedSelection = this.saveSelection(selection);

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
            this.restoreSelection(selection, savedSelection);
        }
    }

    saveSelection = (selection) => {
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange();
        }
        return null;
    }
    restoreSelection = (selection, savedSelection) => {
        if (savedSelection) {
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        }
        this.content.focus();
    }
}
class RTBlazorfiedColorDialog {
    constructor(shadowRoot, content, id) {
        this.shadowRoot = shadowRoot;
        this.content = content;
        this.id = id;
        this.init();

        this.NodeManager = new RTBlazorfiedNodeManager(this.shadowRoot, this.content);
    }
    
    init = () => {
        /* Get the dialog and color picker */
        this.colorPickerDialog = this.shadowRoot.getElementById(this.id);
        this.colorPickerDialog.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insertColor();
                this.colorPickerDialog.close();
                this.content.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.colorPickerDialog.close();
                this.content.focus();
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

    addSliderEventListener = (slider) => {
        slider.addEventListener('input', () => this.updateColor());
    }

    addValueEventListener = (value) => {
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

    addHexEventListener = (hexInput) => {
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
            if (this.currentColor === null) {
                this.NodeManager.updateNode(modaltype, "None", this.selection);
            }
            else {
                this.NodeManager.updateNode(modaltype, this.currentColor, this.selection);
            }
        }
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