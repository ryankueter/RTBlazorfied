/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
class RTBlazorfied {
    constructor(id, shadow_id, toolbar_id, styles) {
        this.id = id;
        this.shadow_id = shadow_id;
        this.toolbar_id = toolbar_id;
        this.styles = styles;
        this.init();
    }

    init = () => {
        var isolatedContainer = document.getElementById(this.shadow_id);
        this.shadowRoot = isolatedContainer.attachShadow({ mode: 'open' });

        var style = document.createElement('style');
        style.textContent = this.styles;
        this.shadowRoot.appendChild(style);

        var contentContainer = document.createElement('div');
        contentContainer.classList.add('rich-text-box-content-container', 'rich-text-box-scroll');

        var container = document.createElement('div');
        container.setAttribute('class', 'rich-text-box-container');

        this.content = document.createElement('div');
        this.content.setAttribute('id', this.id);
        this.content.setAttribute('class', 'rich-text-box-content');
        this.content.setAttribute('contenteditable', 'true');

        var toolbar = document.getElementById(this.toolbar_id);
        container.appendChild(toolbar);

        contentContainer.appendChild(this.content);
        container.appendChild(contentContainer);

        this.shadowRoot.appendChild(container);

        document.addEventListener('selectionchange', (event) => {
            this.selectButtons(this.shadowRoot.getSelection().anchorNode);
        });

        this.content.addEventListener('click', (event) => {
            /* Prevent the default link click */
            if (event.target.tagName === 'A') {
                event.preventDefault(); 
                event.stopPropagation();
            }
        });
        
        this.content.addEventListener('keydown', (event) => {
            this.keyEvents(event);
        });

        /* Prevent the dropdowns from causing the text box from
        losing focus. */
        var dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach((dropdown) => {
            dropdown.addEventListener('mousedown', function (event) {
                event.preventDefault();
            });
        });
    }
    keyEvents = (event) => {
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

        if (event.ctrlKey && event.shiftKey && event.key === '>') {
            event.preventDefault();
            this.changeFontSize(true);
        }
        if (event.ctrlKey && event.shiftKey && event.key === '<') {
            event.preventDefault();
            this.changeFontSize(false);
        }
    }
    changeFontSize = (increment) => {
        var selection = this.shadowRoot.getSelection();
        if (selection && selection.rangeCount > 0) {
            /* Get the current selection. */
            var range = selection.getRangeAt(0);

            /* Get the font size */
            var computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement);
            let fontSize = parseFloat(computedStyle.fontSize);

            /* Increment the font size. */
            if (increment) {
                fontSize += 1;
            }
            else {
                fontSize -= 1;
            }
            this.updateNode("size", `${fontSize}px`);
        }
    }
    format = (format) => {
        this.formatNode(format);
        this.closeDropdown("blazing-rich-text-format-button-dropdown");
    }
    dropdown = (id) => {
        var el = this.shadowRoot.getElementById(id);
        if (el != null && el.classList.contains("rich-text-box-show")) {
            el.classList.remove("rich-text-box-show")
        }
        else {
            this.closeDropdowns();
            el.classList.add("rich-text-box-show")
        }
    }
    openTextColorDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();
        if (selection != null && selection.rangeCount > 0 && selection.toString().length > 0) {
            this.selection = selection.getRangeAt(0).cloneRange();
        }

        // Reset the selected color
        var el = this.shadowRoot.getElementById('blazing-rich-text-color-selection');
        el.style.backgroundColor = '';

        var e = this.shadowRoot.getElementById("rich-text-box-text-color-modal");
        e.style.display = "block";
    }
    selectTextColor = (color) => {
        var el = this.shadowRoot.getElementById('blazing-rich-text-color-selection');
        el.style.backgroundColor = color;
    }
    insertTextColor = () => {
        var el = this.shadowRoot.getElementById('blazing-rich-text-color-selection');

        if (el.style.backgroundColor === '') {
            this.updateNode("textcolor", "None");
        }
        else {
            this.updateNode("textcolor", el.style.backgroundColor);
        }

        /* Close the dialog */
        this.closeDialog("rich-text-box-text-color-modal");
    }
    removeTextColor = () => {
        this.updateNode("textcolor", "None");
    }
    font = (style) => {
        this.updateNode("font", style);
        this.closeDropdown("blazing-rich-text-font-button-dropdown");
    }
    size = (size) => {
        this.updateNode("size", size);
        this.closeDropdown("blazing-rich-text-size-button-dropdown");
    }
    bold = () => {
        this.updateNode("bold");
    }
    italic = () => {
        this.updateNode("italic");
    }
    underline = () => {
        this.updateNode("underline");
    };
    strikethrough = () => {
        this.updateNode("line-through");
    };
    subscript = () => {
        this.updateNode("subscript");
    };
    superscript = () => {
        this.updateNode("superscript");
    };
    alignleft = () => {
        this.updateNode("alignleft");
    };
    aligncenter = () => {
        this.updateNode("aligncenter");
    };
    alignright = () => {
        this.updateNode("alignright");
    };
    alignjustify = () => {
        this.updateNode("alignjustify");
    };
    indent = () => {
        this.updateNode("indent");
    };
    copy = () => {
        this.backupstate();

        var selection = window.getSelection();
        if (selection != null) {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selection);
            }
        }

        this.restorestate();
        this.focusEditor();
    };
    cut = () => {
        this.backupstate();

        var selection = window.getSelection();
        if (selection != null) {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selection);

                /* Remove the selection */
                selection.deleteFromDocument();
                this.removeEmptyNodes();
            }
        }

        this.restorestate();
        this.focusEditor();
    };

    closeDropdown = (id) => {
        var e = this.shadowRoot.getElementById(id);
        e.classList.remove("rich-text-box-show");
        this.lockToolbar = false;
        this.focusEditor();
    }

    removeEmptyNodes = () => {
        var div = this.content;

        if (div) {
            var elements = div.querySelectorAll('*');

            elements.forEach(element => {
                if (!element.hasChildNodes() ||
                    (element.childNodes.length === 1 &&
                        element.childNodes[0].nodeType === 3 &&
                        !/\S/.test(element.textContent))) {

                    if (element.parentElement && !this.isSelfClosingTag(element.nodeName)) {
                        element.parentElement.removeChild(element);
                    }
                }
            });
        }
        this.selectButtons(div);
    };

    isSelfClosingTag(nodeName) {
        switch (nodeName.toLowerCase()) {
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
            default:
                return false;
                break;
        }
        return false;
    }

    delete = () => {
        this.backupstate();

        window.getSelection().deleteFromDocument();
        this.removeEmptyNodes();

        this.restorestate();
        this.focusEditor();
    };
    focusEditor = () => {
        /* Return focus to editor */
        this.content.focus();
    }
    selectall = () => {
        var range = document.createRange();
        range.selectNodeContents(this.content)
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        this.focusEditor();
    };

    orderedlist = () => {
        this.addlist("OL");
    };

    unorderedlist = () => {
        this.addlist("UL");
    };
    addlist = (type) => {
        this.backupstate();

        /* Get the selected text */
        var selection = this.shadowRoot.getSelection();
       
        /* Check if the element is already an OL and replace it */
        if (type == "UL") {
            var list = this.getElementByType(selection.anchorNode, "OL");
            if (list != null) {
                this.replaceList(list, "UL");
                this.restorestate();
                return;
            }
        }
        else {
            var list = this.getElementByType(selection.anchorNode, "UL");
            if (list != null) {
                this.replaceList(list, "OL");
                this.restorestate();
                return;
            }
        }

        var list = this.getElementByType(selection.anchorNode, type);
        if (list != null) {
            this.removelist(list);
        }
        else {
            var selectedText = selection.toString().trim();
            if (selectedText) {
                var ulElement = document.createElement(type);

                if (selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    var selectedNodes = range.cloneContents().childNodes;

                    /* Convert NodeList to Array for easier iteration */
                    var selectedElements = Array.from(selectedNodes);

                    /* Iterate over selected elements */
                    selectedElements.forEach(function (node) {
                        if (node.nodeType === Node.ELEMENT_NODE
                            || node.nodeType === Node.TEXT_NODE) {

                            var liElement = document.createElement('li');

                            var clonedContent = node.cloneNode(true);
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
        this.restorestate();
        this.focusEditor();
    }
    replaceList = (list, type) => {
        var olElement = document.createElement(type);

        while (list.firstChild) {
            olElement.appendChild(list.firstChild);
        }
        list.parentNode.replaceChild(olElement, list);

        this.removeEmptyNodes();

        var selection = this.shadowRoot.getSelection();
        if (selection.rangeCount != 0) {
            var range = selection.getRangeAt(0);
            range.deleteContents();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    removelist = (list) => {

        /* Get the current selection */
        var range = document.createRange();
        var selection = this.shadowRoot.getSelection();
        if (list != null) {
            range.setStartBefore(list);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        /* Remove the list */
        while (list.firstChild) {
            var listItem = list.firstChild;

            /* Move each child node of listItem to before list */
            while (listItem.firstChild) {
                list.parentNode.insertBefore(listItem.firstChild, list);
            }

            /* Remove the now empty listItem */
            list.removeChild(listItem);
        }

        /* Remove the ordered list element */
        list.parentNode.removeChild(list);

        this.removeEmptyNodes();

        if (range != null) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    openLinkDialog = () => {
        this.resetLinkDialog();

        var selection = this.shadowRoot.getSelection();

        if (selection.anchorNode != null && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode.nodeName === "A") {

            var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
            linktext.value = selection.anchorNode.parentNode.textContent;

            var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
            link.value = selection.anchorNode.parentNode.getAttribute("href");

            var target = selection.anchorNode.parentNode.getAttribute('target');
            if (target === '_blank') {
                var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
                newtab.checked = true;
            }

            this.selection = selection.anchorNode.parentNode;
        }
        else {
            var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
            if (selection != null && selection.toString().length > 0) {
                this.selection = selection.getRangeAt(0).cloneRange();
                linktext.value = this.selection.toString();
            }
        }

        if (linktext.value.trim().length === 0) {
            this.selection = this.moveCursorToStart();
        }

        var e = this.shadowRoot.getElementById("rich-text-box-link-modal");
        e.style.display = "block";

        var address = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        if (address) {
            address.focus();
        }
    }
    moveCursorToStart = () => {
        var el = this.content;
        var range = document.createRange();
        var selection = window.getSelection();

        /* Create a new range at the beginning of the contenteditable div */
        range.setStart(el, 0);
        range.collapse(true);

        /* Remove all existing selections and add the new range */
        selection.removeAllRanges();
        selection.addRange(range);

        /* Optionally, set the focus to the contenteditable div */
        el.focus();

        var selection = this.shadowRoot.getSelection();
        return selection.getRangeAt(0).cloneRange();
    }
    resetLinkDialog = () => {
        var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        linktext.value = null;

        var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        link.value = null;

        var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
        newtab.checked = false;
    }
    insertLink = () => {
        this.backupstate();
        var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");

        /* Get the link selection or element */
        var selection = this.shadowRoot.getSelection();
        if (this.selection instanceof HTMLElement) {
            var element = this.selection;
            element.href = link.value;
            element.textContent = linktext.value;
            if (newtab.checked) {
                element.target = "_blank";
            }
            else {
                element.removeAttribute('target');
            }
        }
        else {
            if (selection && this.selection) {
                selection.removeAllRanges();
                selection.addRange(this.selection);
            }

            var range = selection.getRangeAt(0);
            var anchor = document.createElement("a");
            anchor.href = link.value;
            anchor.textContent = linktext.value;
            if (newtab.checked) {
                anchor.target = "_blank";
            }
            range.deleteContents();
            range.insertNode(anchor);
        }
        this.selection = null;
        this.restorestate();

        this.closeDialog("rich-text-box-link-modal");
        this.focusEditor();
    }
    removeLink = () => {
        this.backupstate();

        var selection = this.shadowRoot.getSelection();

        if (selection.anchorNode != null && selection.anchorNode.parentNode != null && selection.anchorNode.parentNode.nodeName === "A") {
            var element = selection.anchorNode.parentNode;
            var fragment = document.createDocumentFragment();

            while (element.firstChild) {
                fragment.appendChild(element.firstChild);
            }
            element.parentNode.insertBefore(fragment, element);
            element.parentNode.removeChild(element);

            if (selection.anchorNode != null && selection.rangeCount != 0) {
                var range = document.createRange();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        this.restorestate();
        this.focusEditor();
    }
    closeDialog = (id) => {
        var e = this.shadowRoot.getElementById(id);
        if (e != null) {
            e.style.display = "none";
        }
        this.lockToolbar = false;
    }
    openImageDialog = () => {
        this.resetImageDialog();

        var selection = this.shadowRoot.getSelection();
        if (selection && selection.rangeCount > 0) {
            this.imageSelection = selection.getRangeAt(0).cloneRange();
        }
        else {
            this.imageSelection = this.moveCursorToStart();
        }
        
        var e = this.shadowRoot.getElementById("rich-text-box-image-modal");
        e.style.display = "block";

        var address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        if (address) {
            address.focus();
        }
    }
    resetImageDialog = () => {
        this.imageSelection = null;

        var address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        address.value = null;

        var width = this.shadowRoot.getElementById("rich-text-box-image-width");
        width.value = null;

        var height = this.shadowRoot.getElementById("rich-text-box-image-height");
        height.value = null;

        var alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");
        alt.value = null;
    }
    insertImage = () => {
        this.backupstate();
        var address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        var width = this.shadowRoot.getElementById("rich-text-box-image-width");
        var height = this.shadowRoot.getElementById("rich-text-box-image-height");
        var alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");

        if (this.imageSelection != null && address.value.length > 0) {

            var range = this.imageSelection.cloneRange();

            var img = document.createElement("img");
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
            
            range.deleteContents();
            range.insertNode(img);

            /* Move the cursor after the inserted image */
            range.setStartAfter(img);
            range.setEndAfter(img);

            /* Get the selection from the shadowRoot */
            var selection = this.shadowRoot.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            /* Update the stored cursor position to the new position */
            this.imageSelection = range.cloneRange();
        }

        this.restorestate();

        this.closeDialog("rich-text-box-image-modal");
        this.focusEditor();
    }

    undo = () => {
        if (this.undoContent != null) {
            this.content.innerHTML = this.undoContent;
        }
        this.focusEditor();
    }
    redo = () => {
        if (this.redoContent != null) {
            this.content.innerHTML = this.redoContent;
        }
        this.focusEditor();
    }
    restorestate = () => {
        var html = this.content?.innerHTML;
        if (html != null) {
            this.redoContent = html;
        }
    }
    backupstate = () => {
        var html = this.content?.innerHTML;
        if (html != null) {
            this.undoContent = html;
        }
    }
    saveSelection = () => {
        var selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            return {
                startContainer: range.startContainer,
                startOffset: range.startOffset,
                endContainer: range.endContainer,
                endOffset: range.endOffset
            };
        }
        return null;
    }

    restoreSelection = (savedSelection) => {
        if (!savedSelection) return;

        var selection = this.shadowRoot.getSelection();
        var range = document.createRange();

        range.setStart(savedSelection.startContainer, savedSelection.startOffset);
        range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    formatNode = (type) => {
        var sel, range;

        this.backupstate();
        
        if (this.shadowRoot.getSelection()) {
            sel = this.shadowRoot.getSelection();

            /* See if an element with matching content exists
            if it does, change or remove it */
            var element;
            if (sel.toString().length == 0) {
                if (sel.anchorNode != null && sel.anchorNode.parentNode != null) {
                    element = this.getElementByType(sel.anchorNode.parentNode, "Format");
                }
            }
            else {
                /* See if this is an outer element */
                if (this.hasCommonAncestor(sel) == true) {
                    var range = sel.getRangeAt(0);
                    element = range.commonAncestorContainer;
                    this.isCommonAncestor = true;
                }
                else {
                    /* Get the element by the selected content */
                    element = this.getElementByContent(sel.anchorNode, type, sel);
                }
            }
            
            if (element != null) {
                if (type == "none") {
                    while (element.firstChild) {
                        element.parentNode.insertBefore(element.firstChild, element);
                    }
                    element.parentNode.removeChild(element);

                    if (sel.anchorNode != null && sel.rangeCount != 0) {
                        var range = document.createRange();
                        range.selectNodeContents(sel.anchorNode);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
                else {
                    var newElement = document.createElement(type);
                    newElement.innerHTML = element.innerHTML;

                    /* Copy styles */
                    var computedStyles = window.getComputedStyle(element);
                    for (var i = 0; i < computedStyles.length; i++) {
                        var styleName = computedStyles[i];
                        var inlineStyleValue = element.style.getPropertyValue(styleName);
                        if (inlineStyleValue !== "") {
                            newElement.style[styleName] = inlineStyleValue;
                        }
                    }
                    element.parentNode.replaceChild(newElement, element);
                }
                this.selectButtons(sel.anchorNode);
                this.closeDropdowns();
                this.restorestate();
                this.focusEditor();
                return;
            }

            if (sel.toString().length > 0) {                
                var newElement;
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
                if (newElement != null && sel.rangeCount != 0) {
                    range = sel.getRangeAt(0);

                    /* See if this is an outer element */
                    if (!this.hasInvalidElementsInRange(range)) {
                        newElement.appendChild(range.cloneContents());
                        range.deleteContents();
                        range.insertNode(newElement);
                        range.selectNodeContents(newElement);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        this.selectButtons(newElement);
                    }
                }
            }
        }
        this.closeDropdowns();
        this.removeEmptyNodes();
        this.restorestate();
        this.focusEditor();
    }
    hasInvalidElementsInRange = (range) => {
        // Traverse through nodes within the range
        let node = range.startContainer;
        const endNode = range.endContainer;

        while (node && node !== endNode.nextSibling) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                // Check for block-level elements
                if (["address", "article", "aside", "blockquote", "details", "dialog", "div", "dl", "fieldset", "figcaption", "figure", "footer", "form", "header", "hgroup", "hr", "main", "menu", "nav", "ol", "p", "pre", "section", "table", "ul"].includes(tagName)) {
                    return true;
                }

                // Check for heading elements
                if (tagName.match(/^h[1-6]$/)) {
                    return true;
                }

                // Check for interactive elements
                if (["a", "button", "input", "textarea", "select"].includes(tagName)) {
                    return true;
                }

                // Check for form elements
                if (tagName === "form") {
                    return true;
                }
            }

            // Move to the next node
            node = node.nextSibling || node.parentNode.nextSibling;
        }

        return false;
    }

    isFormatElement = (element) => {
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
    closeDropdowns = () => {
        /* Close the Dropdowns */
        var dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach(function (dropdown) {
            if (dropdown.classList.contains("rich-text-box-show")) {
                dropdown.classList.remove('rich-text-box-show');
            }
        });

        this.lockToolbar = false;
    }
    updateNode = (type, value) => {
        var sel, range;

        this.backupstate();

        if (this.shadowRoot.getSelection()) {

            sel = this.shadowRoot.getSelection();

            /* Get the color selection if one exists */
            if (this.selection != null) {
                sel.removeAllRanges();
                sel.addRange(this.selection);
            }
            
            var element;
            this.isCommonAncestor = false;
            if (sel.toString().length == 0) {
                /* Check if a node exists with this style and get it */
                element = this.getElementByStyle(sel.anchorNode, type);
               
                /* See if it's an image */
                if (element == null && sel.anchorNode != null && sel.anchorNode.nodeType === Node.ELEMENT_NODE) {
                    var image = sel.anchorNode.querySelector('img');
                    if (image != null) {
                        element = sel.anchorNode;
                    }
                }
                
                /* If that node does not exist, style the parent node */
                if (element == null && sel.anchorNode != null && sel.anchorNode.parentNode != null && sel.anchorNode.parentNode != this.content) {
                    element = sel.anchorNode.parentNode;   
                }
            }
            else {
                /* See if this is an outer element */
                if (this.hasCommonAncestor(sel) == true) {
                    var range = sel.getRangeAt(0);
                    element = range.commonAncestorContainer;
                    this.isCommonAncestor = true;
                }
                else {
                    /* Get the element by the selected content */
                    element = this.getElementByContent(sel.anchorNode, type, sel);
                }
            }
            
            if (element != null) {
                switch (type) {
                    case "textcolor":
                        if (value == "None") {
                            var e = this.getElementByStyle(element, type);
                            if (e != null) {
                                this.removeProperty(e, "color", e.style.getPropertyValue("color"));
                            }
                        }
                        else {
                            element.style.setProperty("color", value);
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
                        if (element.style.textAlign == "left") {
                            this.removeProperty(element, "text-align", "left");
                        }
                        else {
                            element.style.setProperty("text-align", "left");
                        }
                        break;
                    case "aligncenter":
                        if (element.style.textAlign == "center") {
                            this.removeProperty(element, "text-align", "center");
                        }
                        else {
                            element.style.setProperty("text-align", "center");
                        }
                        break;
                    case "alignright":
                        if (element.style.textAlign == "right") {
                            this.removeProperty(element, "text-align", "right");
                        }
                        else {
                            element.style.setProperty("text-align", "right");
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
                    case "indent":
                        if (element.style.textIndent == "40px") {
                            this.removeProperty(element, "text-indent", "40px");
                        }
                        else {
                            element.style.setProperty("text-indent", "40px");
                        }
                        break;
                    default:
                }
                this.selection = null;
                this.removeEmptyNodes();
                this.selectButtons(sel.anchorNode);
                this.restorestate();
                this.focusEditor();
                return;
            }

            /* Insert a new node */
            /* Make certain the element has content */
            if (sel.toString().length > 0 && value != "None") {
                var newElement;
                switch (type) {
                    case "textcolor":
                        newElement = this.createElement(sel);
                        newElement.style.color = value;
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
                    case "indent":
                        newElement = document.createElement("div");
                        newElement.style.textIndent = "40px";
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
                }
            }
        }
        this.removeEmptyNodes();
        this.selectButtons(sel.anchorNode);
        this.restorestate();
        this.focusEditor();
    }
    hasCommonAncestor(selection) {
        var range = selection.getRangeAt(0);

        /* This is used to compare the html contents
        to ensure they are the same element */
        var fragment = range.cloneContents();
        var temp = document.createElement('div');
        temp.appendChild(fragment);

        var commonAncestor = range.commonAncestorContainer;
        if (this.content != commonAncestor && temp.innerHTML == range.commonAncestorContainer.innerHTML && commonAncestor.nodeType !== Node.TEXT_NODE) {
            temp.remove();
            return true;
        }
        temp.remove();
        return false;
    }
    createElement(selection) {
        if (this.containsElements(selection)) {
            return document.createElement("div");
        }
        else {
            return document.createElement("span");
        }
    }
    containsElements(selection) {
        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);

            /* Clone the contents to a document fragment */
            var fragment = range.cloneContents();

            /* Check for child elements */
            for (let node of fragment.childNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {

                    /* If it contains an element */
                    return true;
                }
            }
        }
        /* If it does not contain an element */
        return false;
    }
    removeProperty = (element, property, value) => {
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
        var currentDecorations = element.style.textDecoration;

        /* Check if the decoration is already applied */
        if (currentDecorations != null && !currentDecorations.includes(decoration)) {
            /* Add the new decoration */
            var newDecorations = currentDecorations ? currentDecorations + ' ' + decoration : decoration;
            element.style.textDecoration = newDecorations;
        }
    }
    removeTextDecoration = (element, decoration) => {
        if (this.getUserDefinedStyleCount(element) > 1) {
            var currentDecorations = element.style.textDecoration.split(' ');

            /* Remove the specified decoration */
            var newDecorations = currentDecorations.filter(decor => decor !== decoration);

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
        let styles = {};

        for (let i = 0; i < element.style.length; i++) {
            let property = element.style[i];
            let value = element.style.getPropertyValue(property);
            styles[property] = value;
        }

        return styles;
    }

    getUserDefinedStyleCount = (element) => {
        let c = 0;
        for (let i = 0; i < element.style.length; i++) {
            let property = element.style[i];
            let value = element.style.getPropertyValue(property);

            /* Filter out the initual values, e.g., <h1> */
            if (this.isFormatElement(element)) {
                if (value != "initial") {
                    var words = value.split(' ');

                    /* Check if the style contains multiple values */
                    if (property != "color" && words.length > 1) {
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

    /* Get an element by type */
    getElementByType = (el, type) => {
        if (el == null) {
            return null;
        }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }

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
        if (el == null) {
            return null;
        }

        //console.log(el.textContent);
        //console.log(this.shadowRoot.getSelection().toString());

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }

            /* Recurse into the closest node and return it */
            if (el.nodeName != "#text" && el.nodeName != "#document") {

                /* Check if a style element exists  */
                var e = this.getElementByStyle(el, type);
                if (e != null && this.selectionContainsNode(selection, e)) {
                    return e;
                }

                /* Check if the selection contains a list item and return the list */
                if (el.nodeName === 'LI') {
                    return el.parentNode;
                }
                
                /* Match the text, or get the element by the style */
                if (this.shadowRoot.getSelection().toString().trim() == el.textContent.trim()) {
                    return el;
                }
            }
            el = el.parentNode;
        }

        return null;
    }

    selectionContainsNode(selection, node) {
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
        /* Check if the node is contained within the range */
        let nodeRange = node.ownerDocument.createRange();
        nodeRange.selectNode(node);

        /* Compare ranges to check for intersection */
        return range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0 &&
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0;
    }

    /* Get an element by style */
    getElementByStyle = (el, type) => {
        if (el == null) {
            return null;
        }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }
            if (el.style != null) {
                switch (type) {
                    case "textcolor":
                        /* This method is more specific to the element
                        instead of applying inherited styles */
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("color:")) {
                            return el;
                        }
                        break;
                    case "font":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("font-family:")) {
                            return el;
                        }
                        break;
                    case "size":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("font-size:")) {
                            return el;
                        }
                        break;
                    case "bold":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("font-weight:")) {
                            if (el.style.fontWeight == "bold") {
                                return el;
                            }
                        }
                        break;
                    case "italic":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("font-style:")) {
                            if (el.style.fontStyle == "italic") {
                                return el;
                            }
                        }
                        break;
                    case "underline":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-decoration:")) {
                            if (el.style.textDecoration.includes("underline")) {
                                return el;
                            }
                        }
                        break;
                    case "line-through":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-decoration:")) {
                            if (el.style.textDecoration.includes("line-through")) {
                                return el;
                            }
                        }
                        break;
                    case "subscript":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("vertical-align:")) {
                            if (el.style.verticalAlign == "sub") {
                                return el;
                            }
                        }                        
                        break;
                    case "superscript":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("vertical-align:")) {
                            if (el.style.verticalAlign == "superscript") {
                                return el;
                            }
                        }
                        break;
                    case "alignleft":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "left") {
                                return el;
                            }
                        }
                        break;
                    case "aligncenter":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "center") {
                                return el;
                            }
                        }
                        break;
                    case "alignright":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "right") {
                                return el;
                            }
                        }
                        break;
                    case "alignjustify":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-align:")) {
                            if (el.style.textAlign == "justify") {
                                return el;
                            }
                        }
                        break;
                    case "indent":
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("text-indent:")) {
                            return el;
                        }
                        break;
                }
            }
            
            el = el.parentNode;
        }

        return null;
    }
    getHtml = () => {
        var html = this.html();
        this.loadInnerText(html);
        this.focusEditor();
    };
    getCode = () => {
        var plaintext = this.plaintext();
        this.loadHtml(plaintext);
        this.focusEditor();
    };
    html = () => {
        return this.content.innerHTML;
    };
    loadHtml = (html) => {
        this.content.style.fontFamily = 'Arial, sans-serif';
        if (html != null) {
            this.content.innerHTML = html;
        }
        else {
            this.content.innerHTML = "";
        }
        if (this.IsLoaded) {
            this.selectButtons(this.content);
            this.IsLoaded = true;
        }
    };
    loadInnerText = (text) => {
        this.content.style.fontFamily = 'Consolas';
        if (text != null) {
            this.content.innerText = text;
        }
        else {
            this.content.innerText = "";
        }
        this.selectButtons(this.content);
    };
    plaintext = () => {
        return this.content.innerText || this.content.textContent;
    };

    /* Search up the elements */
    selectButtons = (el) => {
        if (el == null || this.lockToolbar == true) {
            return null;
        }

        /* Reset Styles */
        var bold = this.getButton("blazing-rich-text-bold-button");
        var italic = this.getButton("blazing-rich-text-italic-button");
        var underline = this.getButton("blazing-rich-text-underline-button");
        var strike = this.getButton("blazing-rich-text-strike-button");
        var sub = this.getButton("blazing-rich-text-sub-button");
        var superscript = this.getButton("blazing-rich-text-super-button");
        var alignleft = this.getButton("blazing-rich-text-alignleft-button");
        var aligncenter = this.getButton("blazing-rich-text-aligncenter-button");
        var alignright = this.getButton("blazing-rich-text-alignright-button");
        var alignjustify = this.getButton("blazing-rich-text-alignjustify-button");
        this.textAlign = false;

        var indent = this.getButton("blazing-rich-text-indent-button");
        var link = this.getButton("blazing-rich-text-link-button");
        var linkRemove = this.getButton("blazing-rich-text-remove-link-button");
        var textColor = this.getButton("blazing-rich-text-textcolor-button");
        var textColorRemove = this.getButton("blazing-rich-text-textcolor-remove-button");

        /* Menus */
        var formatButton = this.shadowRoot.getElementById("blazing-rich-text-format-button");
        if (formatButton != null) {
            formatButton.innerText = "Format";
            this.formatSelected = false;
        }
       
        var fontButton = this.shadowRoot.getElementById("blazing-rich-text-font-button");
        if (fontButton != null) {
            fontButton.innerText = "Font";
            this.fontSelected = false;
        }
        
        var sizeButton = this.shadowRoot.getElementById("blazing-rich-text-size-button");
        if (sizeButton != null) {
            sizeButton.innerText = "Size";
            this.fontSizeSelected = false;
        }

        while (el.parentNode) {
            /* Prevent selecting unwanted elements */
            if (el.parentNode.nodeType != 1 || el.parentNode == null || el.parentNode.nodeName == "A" && el.parentNode.classList.contains("rich-text-box-menu-item") || el.nodeName == 'DIV' && el.classList.contains("rich-text-box-content") || el.parentNode.nodeName == "#text" || el.parentNode.nodeName == "#document") {
                break;
            }

            var compStyles = window.getComputedStyle(el.parentNode);

            if (el.parentNode.style != null && el.parentNode.style.fontWeight == "bold") {
                bold.classList.add("selected");
            }
            if (el.parentNode.style != null && el.parentNode.style.color) {
                textColor.classList.add("selected");
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
            if (compStyles.getPropertyValue("text-indent") == "40px") {
                indent.classList.add("selected");
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
            el = el.parentNode;
        }
        this.closeDropdowns();
    }
    getButton(id) {
        var element = this.shadowRoot.getElementById(id);
        if (element != null && element.classList.contains("selected")) {
            element.classList.remove("selected");
        }
        return element;
    }
}

let RTBlazorfied_Instances = {};

window.RTBlazorfied_Initialize = (id, shadow_id, toolbar_id, styles, html) => {
    RTBlazorfied_Instances[id] = new RTBlazorfied(id, shadow_id, toolbar_id, styles);
    RTBlazorfied_Instances[id].loadHtml(html);
}

window.RTBlazorfied_Method = (methodName, id, param) => {
    var editorInstance = RTBlazorfied_Instances[id];
    if (editorInstance && typeof editorInstance[methodName] === 'function') {
        if (param != null) {
            return editorInstance[methodName](param);
        }
        else {
            return editorInstance[methodName]();
        }
    }
}