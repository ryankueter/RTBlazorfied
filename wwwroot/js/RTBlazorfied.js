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
        /* Initialize history */
        this.history = [];
        this.currentIndex = -1;
        this.currentIndex = -1;

        /* Load elements into the shadow DOM */
        var isolatedContainer = document.getElementById(this.shadow_id);
        this.shadowRoot = isolatedContainer.attachShadow({ mode: 'open' });

        var style = document.createElement('style');
        style.textContent = this.styles;
        this.shadowRoot.appendChild(style);

        var contentContainer = document.createElement('div');
        contentContainer.classList.add('rich-text-box-content-container', 'rich-text-box-scroll');

        var container = document.createElement('div');
        container.setAttribute('class', 'rich-text-box-container');

        /* The main content that is referenced throughout */
        this.content = document.createElement('div');
        this.content.setAttribute('id', this.id);
        this.content.setAttribute('class', 'rich-text-box-content');
        this.content.setAttribute('contenteditable', 'true');

        /* Assemble everything into the container */
        var toolbar = document.getElementById(this.toolbar_id);
        container.appendChild(toolbar);

        contentContainer.appendChild(this.content);
        container.appendChild(contentContainer);

        this.shadowRoot.appendChild(container);

        /* Listen for selection change event to select buttons */
        document.addEventListener('selectionchange', () => {
            /* Ensure that this event listener only fires for this text box */
            var selection = this.shadowRoot.getSelection();
            if (this.content.contains(selection.anchorNode) && this.content.contains(selection.focusNode)) {
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

        /* Prevent the dropdowns from causing the text box from losing focus. */
        var dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach((dropdown) => {
            dropdown.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });
        });
        
        /* Callback function to execute when mutations are observed */
        var richtextbox = (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && this.EditMode === true) {
                    /* A child node has been added or removed. */
                    this.saveState();
                }
                else if (mutation.type === 'attributes' && this.EditMode === true) {
                    /* The ${mutation.attributeName} attribute was modified. */
                    this.saveState();
                }
                else if (mutation.type === 'characterData' && this.EditMode === true) {
                    /* The text content of a node has been changed. */
                    this.saveState();
                }
            }
        };

        /* Options for the observer (which mutations to observe) */
        var config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        };

        /* Create an observer instance linked to the callback function */
        var observer = new MutationObserver(richtextbox);
        observer.observe(this.content, config);
    }

    /* History */
    saveState = () => {
        var currentState = this.content.innerHTML;

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
    };
    /* History */
    goBack = () => {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.content.innerHTML = this.history[this.currentIndex];
        }
        this.focusEditor();
        this.selectButtons(this.shadowRoot.getSelection().anchorNode);        
    };
    goForward = () => {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.content.innerHTML = this.history[this.currentIndex];
        }
        this.focusEditor();
        this.selectButtons(this.shadowRoot.getSelection().anchorNode);
    };

    clearSettings = (node) => {
        this.fontSize = undefined;

        /* Select the buttons */
        this.selectButtons(node);
    }
    /* Shortcuts */
    keyEvents = (event) => {
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
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            this.goBack();
        }
        if (event.ctrlKey && event.key === 'y') {
            event.preventDefault();
            this.goForward();
        }
        if (event.key === 'Enter') {
            var selection = this.shadowRoot.getSelection();
            if (selection.anchorNode != null && selection.anchorNode !== this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode)) {
                switch (selection.anchorNode.parentNode.nodeName) {
                    case "BLOCKQUOTE":
                        event.preventDefault();
                        this.insertLineBreak(selection.anchorNode.parentNode);
                        break;
                    case "CODE":
                        event.preventDefault();
                        this.insertLineBreak(selection.anchorNode.parentNode);
                        break;
                    case "SPAN":
                        event.preventDefault();
                        this.insertLineBreak(selection.anchorNode.parentNode);
                        break;
                }
            }
        }
    }
    insertLineBreak = (element) => {
        var div = document.createElement('div');
        var br = document.createElement('br');
        div.appendChild(br);

        if (element.nodeName == "CODE") {
            /* Insert the new div after the grandparent element */
            var grandparent = element.parentNode.parentNode;            
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
        var range = document.createRange();
        range.setStartBefore(br);
        range.collapse(true);

        var sel = this.shadowRoot.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    changeFontSize = (increment) => {     
        /* Get the current selection. */
        if (this.fontSize === undefined) {
            var selection = this.shadowRoot.getSelection();
            if (selection && selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                var computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement);
                this.fontSize = parseFloat(computedStyle.fontSize);
            }
        }
       
        /* Increment the font size. */
        if (increment) {
            this.fontSize += 1;
        }
        else {
            this.fontSize -= 1;
        }
        this.updateNode("size", `${this.fontSize}px`);
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
        this.resetTextColorDialog();

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();
        
        var el = this.shadowRoot.getElementById('rich-text-box-text-color-modal-selection');
        if (selection != null && selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.style != null && selection.anchorNode.parentNode.style.color != null) {
            el.style.backgroundColor = selection.anchorNode.parentNode.style.color;
            this.selection = selection.getRangeAt(0).cloneRange();
        }
        else {
            if (selection != null && selection.rangeCount > 0 && selection.toString().length > 0) {
                this.selection = selection.getRangeAt(0).cloneRange();
            }
        }
        
        var e = this.shadowRoot.getElementById("rich-text-box-text-color-modal");
        e.style.display = "block";
        el.focus();
    }
    resetTextColorDialog = () => {
        this.selection = null;

        /* Reset the selected color */
        var el = this.shadowRoot.getElementById('rich-text-box-text-color-modal-selection');
        el.style.backgroundColor = '';
    }
    selectTextColor = (color) => {
        var el = this.shadowRoot.getElementById('rich-text-box-text-color-modal-selection');
        el.style.backgroundColor = color;
    }
    insertTextColor = () => {
        if (this.selection != null) {
            var el = this.shadowRoot.getElementById('rich-text-box-text-color-modal-selection');

            if (el.style.backgroundColor === '') {
                this.updateNode("textcolor", "None");
            }
            else {
                this.updateNode("textcolor", el.style.backgroundColor);
            }
        }
        /* Close the dialog */
        this.closeDialog("rich-text-box-text-color-modal");
    }
    removeTextColor = () => {
        this.updateNode("textcolor", "None");
        this.updateNode("textbgcolor", "None");
    }
    openTextBackgroundColorDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;
        this.resetTextBackgroundColorDialog();

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();

        var el = this.shadowRoot.getElementById('rich-text-box-text-bg-color-modal-selection');
        if (selection != null && selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.style != null && selection.anchorNode.parentNode.style.color != null) {
            el.style.backgroundColor = selection.anchorNode.parentNode.style.backgroundColor;
            this.selection = selection.getRangeAt(0).cloneRange();
        }
        else {
            if (selection != null && selection.rangeCount > 0 && selection.toString().length > 0) {
                this.selection = selection.getRangeAt(0).cloneRange();
            }
        }

        var e = this.shadowRoot.getElementById("rich-text-box-text-bg-color-modal");
        e.style.display = "block";
        el.focus();
    }
    resetTextBackgroundColorDialog = () => {
        this.selection = null;

        /* Reset the selected color */
        var el = this.shadowRoot.getElementById('rich-text-box-text-bg-color-modal-selection');
        el.style.backgroundColor = '';
    }
    selectTextBackgroundColor = (color) => {
        var el = this.shadowRoot.getElementById('rich-text-box-text-bg-color-modal-selection');
        el.style.backgroundColor = color;
    }
    insertTextBackgroundColor = () => {
        if (this.selection != null) {
            var el = this.shadowRoot.getElementById('rich-text-box-text-bg-color-modal-selection');

            if (el.style.backgroundColor === '') {
                this.updateNode("textbgcolor", "None");
            }
            else {
                this.updateNode("textbgcolor", el.style.backgroundColor);
            }
        }
        /* Close the dialog */
        this.closeDialog("rich-text-box-text-bg-color-modal");
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
        var selection = window.getSelection();
        if (selection != null) {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selection);
            }
        }
        this.focusEditor();
    };
    cut = () => {
        var selection = window.getSelection();
        if (selection != null) {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selection);

                /* Remove the selection */
                selection.deleteFromDocument();
                this.removeEmptyNodes();
            }
        }
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
            default:
                return false;
                break;
        }
        return false;
    }

    delete = () => {
        window.getSelection().deleteFromDocument();
        this.removeEmptyNodes();
        
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
        /* Get the selected text */
        var selection = this.shadowRoot.getSelection();
       
        /* Check if the element is already an OL and replace it */
        if (type == "UL") {
            var list = this.getElementByType(selection.anchorNode, "OL");
            if (list != null) {
                this.replaceList(list, "UL");
                return;
            }
        }
        else {
            var list = this.getElementByType(selection.anchorNode, "UL");
            if (list != null) {
                this.replaceList(list, "OL");
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
                    selectedElements.forEach((node) => {
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
        this.focusEditor();
    }
    replaceList = (list, type) => {
        if (list === null || list === this.content || !this.content.contains(list)) { return; }
        
        var element = document.createElement(type);
        while (list.firstChild) {
            element.appendChild(list.firstChild);
        }
        list.parentNode.replaceChild(element, list);

        this.removeEmptyNodes();       

        var selection = this.shadowRoot.getSelection();
        if (selection != null && selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            range.selectNodeContents(element);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    removelist = (list) => {
        if (list == null || list == this.content || !this.content.contains(list)) { return; }

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

        var selection = this.shadowRoot.getSelection();
        if (selection != null && selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    openLinkDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.resetLinkDialog();

        var selection = this.shadowRoot.getSelection();

        if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "A") {

            var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
            linktext.value = selection.anchorNode.parentNode.textContent;

            var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
            link.value = selection.anchorNode.parentNode.getAttribute("href");

            var classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");
            var classList = selection.anchorNode.parentNode.classList;
            classes.value = Array.from(classList).join(' ');

            var target = selection.anchorNode.parentNode.getAttribute('target');
            if (target === '_blank') {
                var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
                newtab.checked = true;
            }

            this.linkNode = selection.anchorNode.parentNode;
        }
        else {
            var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
            if (selection != null && selection.toString().length > 0) {
                this.linkSelection = selection.getRangeAt(0).cloneRange();
                linktext.value = this.linkSelection.toString();
            }
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
        this.linkNode = null;
        this.linkSelection = null;

        var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        linktext.value = null;

        var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        link.value = null;

        var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
        newtab.checked = false;

        var classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");
        classes.value = null;
    }
    insertLink = () => {
        var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
        var link = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        var newtab = this.shadowRoot.getElementById("rich-text-box-link-modal-newtab");
        var classes = this.shadowRoot.getElementById("rich-text-box-link-css-classes");

        if (link.value.length == 0 || linktext.value.length == 0) {
            this.closeDialog("rich-text-box-link-modal");
            this.focusEditor();
            return;
        }

        /* Get the link selection or element */
        if (this.linkNode != null) {
            var element = this.linkNode;
            element.href = link.value;
            element.textContent = linktext.value;
            this.addClasses(classes.value, element);
            if (newtab.checked) {
                element.target = "_blank";
            }
            else {
                element.removeAttribute('target');
            }
        }
        else {
            if (this.linkSelection != null) {
                var selection = this.shadowRoot.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(this.linkSelection);
                }

                var range = selection.getRangeAt(0);
                var anchor = document.createElement("a");
                anchor.href = link.value;
                anchor.textContent = linktext.value;
                this.addClasses(classes.value, anchor);
                if (newtab.checked) {
                    anchor.target = "_blank";
                }
                range.deleteContents();
                range.insertNode(anchor);
            }
        }
        this.closeDialog("rich-text-box-link-modal");
        this.focusEditor();
    }
    addClasses = (classlist, element) => {
        /* Clear the classes */
        element.classList.remove(...element.classList);

        /* Readd classes, if necessary */
        if (classlist.length > 0) {
            var classNames = classlist.split(' ').map(className => className.trim());

            /* Add each class to the element's class list */
            classNames.forEach(className => {
                if (className) {
                    element.classList.add(className);
                }
            });
        }
    }
    removeLink = () => {
        var selection = this.shadowRoot.getSelection();

        if (selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "A") {
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
        this.focusEditor();
    }
    closeDialog = (id) => {
        var e = this.shadowRoot.getElementById(id);
        if (e != null) {
            e.style.display = "none";
        }
        this.lockToolbar = false;
    }
    openBlockQuoteDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;
        this.resetBlockQuoteDialog();

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();

        var quote = this.shadowRoot.getElementById('rich-text-box-quote');
        var cite = this.shadowRoot.getElementById('rich-text-box-cite');
        var classes = this.shadowRoot.getElementById('rich-text-box-quote-css-classes');


        if (selection != null && selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName == "BLOCKQUOTE") {
            quote.value = selection.anchorNode.parentNode.textContent;

            if (selection.anchorNode.parentNode.cite != null) {
                cite.value = selection.anchorNode.parentNode.cite;
            }           
                        
            var classList = selection.anchorNode.parentNode.classList;
            classes.value = Array.from(classList).join(' ');

            this.quoteSelection = selection.getRangeAt(0).cloneRange();
            this.quote = selection.anchorNode.parentNode;         
        }
        else {
            if (selection != null && selection.rangeCount > 0) {
                this.quoteSelection = selection.getRangeAt(0).cloneRange();
            }
        }
        
        var e = this.shadowRoot.getElementById("rich-text-box-block-quote-modal");
        e.style.display = "block";

        var quote = this.shadowRoot.getElementById("rich-text-box-quote");
        if (quote) {
            quote.focus();
            quote.scrollTop = 0;
            quote.scrollLeft = 0;
        }
    }
    resetBlockQuoteDialog = () => {
        this.quote = null;
        this.quoteSelection = null;

        var quote = this.shadowRoot.getElementById("rich-text-box-quote");
        quote.value = null;

        var cite = this.shadowRoot.getElementById("rich-text-box-cite");
        cite.value = null;

        var css = this.shadowRoot.getElementById("rich-text-box-quote-css-classes");
        css.value = null;
    }
    insertBlockQuote = () => {
        var quote = this.shadowRoot.getElementById("rich-text-box-quote");
        var cite = this.shadowRoot.getElementById("rich-text-box-cite");
        var classes = this.shadowRoot.getElementById("rich-text-box-quote-css-classes");

        if (this.quote != null) {
            var element = this.quote;
            element.textContent = quote.value;
            if (cite.value.trim().length > 0) {
                element.setAttribute('cite', cite.value);
            }
            else {
                element.removeAttribute('cite');
            }
            this.addClasses(classes.value, element);

            var range = this.quoteSelection.cloneRange();
            /* Move the cursor after the inserted element */
            range.setStartAfter(element);
            range.setEndAfter(element);

            var selection = this.shadowRoot.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else {
            if (this.quoteSelection != null && quote.value.length > 0) {

                var range = this.quoteSelection.cloneRange();

                var blockquote = document.createElement("blockquote");
                blockquote.textContent = quote.value;
                if (cite.value.trim().length > 0) {
                    blockquote.cite = cite.value;
                }
                this.addClasses(classes.value, blockquote);

                range.deleteContents();
                range.insertNode(blockquote);

                /* Move the cursor after the inserted element */
                range.setStartAfter(blockquote);
                range.setEndAfter(blockquote);

                /* Get the selection from the shadowRoot */
                var selection = this.shadowRoot.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        this.closeDialog("rich-text-box-block-quote-modal");
        this.focusEditor();
    }
    openCodeBlockDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;
        this.resetCodeBlockDialog();

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();

        var code = this.shadowRoot.getElementById('rich-text-box-code');
        var classes = this.shadowRoot.getElementById('rich-text-box-code-css-classes');

        if (selection != null && selection.anchorNode != null && selection.anchorNode != this.content && selection.anchorNode.parentNode != null && this.content.contains(selection.anchorNode.parentNode) && selection.anchorNode.parentNode.nodeName === "CODE") {
            
            var clone = selection.anchorNode.parentNode.cloneNode(true);
            code.value = clone.textContent;
            
            var classList = selection.anchorNode.parentNode.classList;
            classes.value = Array.from(classList).join(' ');

            this.codeSelection = selection.getRangeAt(0).cloneRange();
            this.code = selection.anchorNode.parentNode;
        }
        else {
            if (selection != null && selection.rangeCount > 0) {
                this.codeSelection = selection.getRangeAt(0).cloneRange();
            }
        }

        var e = this.shadowRoot.getElementById("rich-text-box-code-block-modal");
        e.style.display = "block";

        var code = this.shadowRoot.getElementById("rich-text-box-code");
        if (code) {
            code.focus();
            code.scrollTop = 0;
            code.scrollLeft = 0;
        }
    }
    resetCodeBlockDialog = () => {
        this.code = null;
        this.codeSelection = null;

        var code = this.shadowRoot.getElementById("rich-text-box-code");
        code.value = null;

        var css = this.shadowRoot.getElementById("rich-text-box-code-css-classes");
        css.value = null;
    }
    insertCodeBlock = () => {
        var codeText = this.shadowRoot.getElementById("rich-text-box-code");
        var classes = this.shadowRoot.getElementById("rich-text-box-code-css-classes");

        if (this.code != null) {
            var element = this.code;
            element.textContent = codeText.value;
            this.addClasses(classes.value, element);
        }
        else {
            if (this.codeSelection != null && codeText.value.length > 0) {

                var range = this.codeSelection.cloneRange();

                /* Create the <pre> element */
                var pre = document.createElement('pre');

                /* Create the <code> element */
                var code = document.createElement('code');
                this.addClasses(classes.value, code);

                /* Set the content of the <code> element */
                code.textContent = codeText.value;

                /* Append the <code> element to the <pre> element */
                pre.appendChild(code);

                range.deleteContents();
                range.insertNode(pre);

                /* Move the cursor after the inserted element */
                range.setStartAfter(pre);
                range.setEndAfter(pre);

                /* Get the selection from the shadowRoot */
                var selection = this.shadowRoot.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        this.closeDialog("rich-text-box-code-block-modal");
        this.focusEditor();
    }
    openEmbedDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;
        this.resetEmbedDialog();

        /* Get the selection */
        var selection = this.shadowRoot.getSelection();

        if (selection != null && selection.rangeCount > 0) {
            this.embedSelection = selection.getRangeAt(0).cloneRange();
        }

        var e = this.shadowRoot.getElementById("rich-text-box-embed-modal");
        e.style.display = "block";

        var source = this.shadowRoot.getElementById("rich-text-box-embed-source");
        if (source) {
            source.focus();
        }
    }
    resetEmbedDialog = () => {
        this.embed = null;
        this.embedSelection = null;

        var source = this.shadowRoot.getElementById('rich-text-box-embed-source');
        source.value = null;

        var width = this.shadowRoot.getElementById('rich-text-box-embed-width');
        width.value = null;

        var height = this.shadowRoot.getElementById('rich-text-box-embed-height');
        height.value = null;

        var type = this.shadowRoot.getElementById('rich-text-box-embed-type');
        type.value = null;

        var classes = this.shadowRoot.getElementById('rich-text-box-embed-css-classes');
        classes.value = null;
    }
    insertEmbed = () => {
        var source = this.shadowRoot.getElementById('rich-text-box-embed-source');
        var width = this.shadowRoot.getElementById('rich-text-box-embed-width');
        var height = this.shadowRoot.getElementById('rich-text-box-embed-height');
        var type = this.shadowRoot.getElementById('rich-text-box-embed-type');
        var classes = this.shadowRoot.getElementById('rich-text-box-embed-css-classes');

        if (this.embedSelection != null && source.value.length > 0) {

            var range = this.embedSelection.cloneRange();

            /* Create the <code> element */
            var object = document.createElement('object');

            /* Set the content of the <code> element */
            object.data = source.value;
            object.type = type.value;
            object.height = height.value;
            object.width = width.value;
            this.addClasses(classes.value, object);

            range.deleteContents();
            range.insertNode(object);

            /* Move the cursor after the inserted element */
            range.setStartAfter(object);
            range.setEndAfter(object);
            
            /* Get the selection from the shadowRoot */
            var selection = this.shadowRoot.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.closeDialog("rich-text-box-embed-modal");
        this.focusEditor();
    }
    openImageDialog = () => {
        /* Lock the toolbar */
        this.lockToolbar = true;

        this.resetImageDialog();

        var selection = this.shadowRoot.getSelection();
        if (selection && selection.rangeCount > 0) {
            this.imageSelection = selection.getRangeAt(0).cloneRange();
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

        var classes = this.shadowRoot.getElementById("rich-text-box-image-css-classes");
        classes.value = null;
    }
    insertImage = () => {
        var address = this.shadowRoot.getElementById("rich-text-box-image-webaddress");
        var width = this.shadowRoot.getElementById("rich-text-box-image-width");
        var height = this.shadowRoot.getElementById("rich-text-box-image-height");
        var alt = this.shadowRoot.getElementById("rich-text-box-image-alt-text");
        var classes = this.shadowRoot.getElementById("rich-text-box-image-css-classes");

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
            this.addClasses(classes.value, img);
            
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

        this.closeDialog("rich-text-box-image-modal");
        this.focusEditor();
    }
    formatNode = (type) => {
        var sel, range;
        
        if (this.shadowRoot.getSelection()) {
            sel = this.shadowRoot.getSelection();

            /* See if an element with matching content exists
            if it does, change or remove it */
            var element;
            if (sel.toString().length == 0) {
                if (sel.anchorNode != null && sel.anchorNode != this.content && sel.anchorNode.parentNode != null && this.content.contains(sel.anchorNode.parentNode)) {
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
                        
            if (element != null && element != this.content && element.parentNode != null && this.content.contains(element.parentNode)) {

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
                    var caretPos = this.saveCaretPosition(element);

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

                    this.restoreCaretPosition(newElement, caretPos);
                }
                this.selectButtons(sel.anchorNode);
                this.closeDropdowns();
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
        this.focusEditor();
    }

    saveCaretPosition = (el) => {
        let range = document.createRange();
        let sel = this.shadowRoot.getSelection();
        let startOffset = sel.getRangeAt(0).startOffset;
        let endOffset = sel.getRangeAt(0).endOffset;

        return { startOffset, endOffset };
    }

    restoreCaretPosition = (el, savedPos) => {
        let range = document.createRange();
        let sel = this.shadowRoot.getSelection();
        range.setStart(el.firstChild, savedPos.startOffset);
        range.setEnd(el.firstChild, savedPos.endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    hasInvalidElementsInRange = (range) => {
        var node = range.startContainer;
        var endNode = range.endContainer;

        /* Traverse through nodes within the range */
        while (node != null && node !== this.content && this.content.contains(node) && node !== endNode.nextSibling) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                /* Check for block-level elements */
                if (["address", "article", "aside", "blockquote", "details", "dialog", "div", "dl", "fieldset", "figcaption", "figure", "footer", "form", "header", "hgroup", "hr", "main", "menu", "nav", "ol", "p", "pre", "section", "table", "ul"].includes(tagName)) {
                    return true;
                }

                /* Check for heading elements */
                if (tagName.match(/^h[1-6]$/)) {
                    return true;
                }

                /* Check for interactive elements */
                if (["a", "button", "input", "textarea", "select"].includes(tagName)) {
                    return true;
                }

                /* Check for form elements */
                if (tagName === "form") {
                    return true;
                }
            }

            /* Move to the next node */
            node = node.nextSibling || node.parentNode.nextSibling;
        }

        return false;
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
                if (element == null && sel.anchorNode != null && sel.anchorNode != this.content && this.content.contains(sel.anchorNode) && sel.anchorNode.nodeType === Node.ELEMENT_NODE) {
                    var image = sel.anchorNode.querySelector('img');
                    if (image != null) {
                        element = sel.anchorNode;
                    }
                    var embed = sel.anchorNode.querySelector('embed');
                    if (embed != null) {
                        element = sel.anchorNode;
                    }
                    var object = sel.anchorNode.querySelector('object');
                    if (object != null) {
                        element = sel.anchorNode;
                    }
                }
                
                /* If that node does not exist, style the parent node */
                if (element == null && sel.anchorNode != null && sel.anchorNode != this.content && sel.anchorNode.parentNode != null && this.content.contains(sel.anchorNode.parentNode)) {
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
                    case "textbgcolor":
                        if (value == "None") {
                            var e = this.getElementByStyle(element, type);
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
        if (commonAncestor !== this.content && this.content.contains(commonAncestor) && temp.innerHTML == range.commonAncestorContainer.innerHTML && commonAncestor.nodeType !== Node.TEXT_NODE) {
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
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        var currentDecorations = element.style.textDecoration;

        /* Check if the decoration is already applied */
        if (currentDecorations != null && !currentDecorations.includes(decoration)) {
            /* Add the new decoration */
            var newDecorations = currentDecorations ? currentDecorations + ' ' + decoration : decoration;
            element.style.textDecoration = newDecorations;
        }
    }
    removeTextDecoration = (element, decoration) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

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
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        var styles = {};
        for (var i = 0; i < element.style.length; i++) {
            var property = element.style[i];
            var value = element.style.getPropertyValue(property);
            styles[property] = value;
        }

        return styles;
    }

    getUserDefinedStyleCount = (element) => {
        if (element == null || element == this.content || !this.content.contains(element)) { return; }

        var c = 0;
        for (let i = 0; i < element.style.length; i++) {
            let property = element.style[i];
            let value = element.style.getPropertyValue(property);

            /* Filter out the initual values, e.g., <h1> */
            if (this.isFormatElement(element)) {
                if (value != "initial") {
                    var words = value.split(' ');

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
                switch (type) {
                    case "textcolor":
                        /* This method is more specific to the element
                        instead of applying inherited styles */
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("color:")) {
                            return el;
                        }
                        break;
                    case "textbgcolor":
                        /* This method is more specific to the element
                        instead of applying inherited styles */
                        var style = el.getAttribute("style");
                        if (style != null && style.includes("background-color:")) {
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
        this.EditMode = true;
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
        this.EditMode = false;
        this.content.style.fontFamily = 'Consolas, monospace';
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
        if (el == null || el == this.content || !this.content.contains(el) || this.lockToolbar == true) { return; }
       
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

        var ol = this.getButton("blazing-rich-text-orderedlist-button");
        var ul = this.getButton("blazing-rich-text-unorderedlist-button");

        var indent = this.getButton("blazing-rich-text-indent-button");
        var link = this.getButton("blazing-rich-text-link-button");
        var linkRemove = this.getButton("blazing-rich-text-remove-link-button");
        var textColor = this.getButton("blazing-rich-text-textcolor-button");
        var textBackgroundColor = this.getButton("blazing-rich-text-text-bg-color-button");
        var textColorRemove = this.getButton("blazing-rich-text-textcolor-remove-button");

        var blockQuote = this.getButton("blazing-rich-text-quote-button");
        var codeBlock = this.getButton("blazing-rich-text-code-block-button");

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

        while (el !== this.content && el.parentNode !== null && this.content.contains(el.parentNode)) {

            /* Prevent selecting unwanted elements */
            if (el.parentNode.nodeName == "#text" || el.parentNode.nodeName == "#document") {
                break;
            }

            var compStyles = window.getComputedStyle(el.parentNode);

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
            if (el.parentNode.nodeName == "BLOCKQUOTE") {
                blockQuote.classList.add("selected");
            }
            if (el.parentNode.nodeName == "CODE") {
                codeBlock.classList.add("selected");
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
    getButton(id) {
        var element = this.shadowRoot.getElementById(id);
        if (element != null && element.classList.contains("selected")) {
            element.classList.remove("selected");
        }
        return element;
    }
}

window.RTBlazorfied_Instances = {};

window.RTBlazorfied_Initialize = (id, shadow_id, toolbar_id, styles, html) => {
    try {
        RTBlazorfied_Instances[id] = new RTBlazorfied(id, shadow_id, toolbar_id, styles);
        RTBlazorfied_Instances[id].loadHtml(html);
    }
    catch (ex) {
        console.log(ex)
    }
}

window.RTBlazorfied_Method = (methodName, id, param) => {
    try {
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
    catch (ex) {
        console.log(ex);
    }
}