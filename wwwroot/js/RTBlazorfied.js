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

        document.addEventListener('selectionchange', (e) => {
            this.selectButtons(this.shadowRoot.getSelection().anchorNode);
        });

        this.content.addEventListener('click', function (event) {
            /* Prevent the default link click */
            if (event.target.tagName === 'A') {
                event.preventDefault(); 
                event.stopPropagation();
            }
        });

        /* Prevent the dropdowns from causing the text box from
        losing focus. */
        var dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach(function (dropdown) {
            dropdown.addEventListener('mousedown', function (event) {
                event.preventDefault();
            });
        });
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
        this.focusEditor();
    }
    openTextColorPicker = () => {
        this.lockToolbar = true;
        var selection = this.shadowRoot.getSelection();
        if (selection != null && selection.toString().length > 0) {
            this.colorSelection = selection.getRangeAt(0).cloneRange();
        }

        var colorPickerDropdown = this.shadowRoot.getElementById('blazing-rich-text-textcolor-dropdown');
        colorPickerDropdown.style.display = colorPickerDropdown.style.display === 'block' ? 'none' : 'block';
        
    }
    selectTextColor = (color) => {
        this.updateNode("textcolor", color);

        var colorPickerDropdown = this.shadowRoot.getElementById('blazing-rich-text-textcolor-dropdown');
        colorPickerDropdown.style.display = 'none';
        this.lockToolbar = false;
    }
    removeTextColor = () => {
        this.updateNode("textcolor", "None");

        var colorPickerDropdown = this.shadowRoot.getElementById('blazing-rich-text-textcolor-dropdown');
        colorPickerDropdown.style.display = 'none';
        this.lockToolbar = false;
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
        var div = this.shadowRoot.getElementById(this.id);

        if (div) {
            var elements = div.querySelectorAll('*');

            elements.forEach(element => {
                if (!element.hasChildNodes() ||
                    (element.childNodes.length === 1 &&
                        element.childNodes[0].nodeType === 3 &&
                        !/\S/.test(element.textContent))) {

                    if (element.parentElement && element.nodeName != "IMG" && element.nodeName != "BR") {
                        element.parentElement.removeChild(element);
                    }
                }
            });
        }

        this.selectButtons(div);
    };

    delete = () => {
        this.backupstate();

        window.getSelection().deleteFromDocument();
        this.removeEmptyNodes();

        this.restorestate();
        this.focusEditor();
    };
    focusEditor = () => {
        /* Return focus to editor */
        var div = this.shadowRoot.getElementById(this.id);
        div.focus();
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

            this.linkSelection = selection.anchorNode.parentNode;
        }
        else {
            var linktext = this.shadowRoot.getElementById("rich-text-box-linktext");
            if (selection != null && selection.toString().length > 0) {
                this.linkSelection = selection.getRangeAt(0).cloneRange();
                linktext.value = this.linkSelection.toString();
            }
        }

        if (linktext.value.trim().length === 0) {
            this.linkSelection = this.moveCursorToStart();
        }

        var e = this.shadowRoot.getElementById("rich-text-box-link-modal");
        e.style.display = "block";

        var address = this.shadowRoot.getElementById("rich-text-box-link-webaddress");
        if (address) {
            address.focus();
        }
    }
    moveCursorToStart = () => {
        var el = this.shadowRoot.getElementById(this.id);
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
        if (this.linkSelection instanceof HTMLElement) {
            var element = this.linkSelection;
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
            if (selection && this.linkSelection) {
                selection.removeAllRanges();
                selection.addRange(this.linkSelection);
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
        this.restorestate();
        this.closeLinkDialog();
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
                range.selectNodeContents(selection.anchorNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        this.restorestate();
        this.focusEditor();
    }
    closeLinkDialog = () => {
        var e = this.shadowRoot.getElementById("rich-text-box-link-modal");
        e.style.display = "none";
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
        this.closeImageDialog();
        this.focusEditor();
    }
    closeImageDialog = () => {
        var e = this.shadowRoot.getElementById("rich-text-box-image-modal");
        e.style.display = "none";
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
                element = this.getElementByContent(sel.anchorNode, type);
            }
            if (element != null) {
                
                if (type == "none") {
                    var fragment = document.createDocumentFragment();

                    while (element.firstChild) {
                        fragment.appendChild(element.firstChild);
                    }
                    element.parentNode.insertBefore(fragment, element);
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

                    if (newElement != null && sel.rangeCount != 0) {
                        var range = document.createRange();
                        range.selectNodeContents(newElement);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
                this.selectButtons(sel.anchorNode);
                this.closeDropdowns();
                this.restorestate();
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
                    newElement.appendChild(range.cloneContents());
                    range.deleteContents();
                    range.insertNode(newElement);
                    range.selectNodeContents(newElement);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    this.selectButtons(sel.anchorNode);
                }
            }
        }
        this.closeDropdowns();
        this.restorestate();
        this.focusEditor();
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
    }
    closeDropdowns = () => {
        this.lockToolbar = false;

        /* Close the Dropdowns */
        var dropdowns = this.shadowRoot.querySelectorAll('.rich-text-box-dropdown-content');
        dropdowns.forEach(function (dropdown) {
            if (dropdown.classList.contains("rich-text-box-show")) {
                dropdown.classList.remove('rich-text-box-show');
            }
        });
    }
    updateNode = (type, value) => {
        var sel, range;

        this.backupstate();

        if (this.shadowRoot.getSelection()) {

            sel = this.shadowRoot.getSelection();

            /* Get the color selection if one exists */
            if (this.colorSelection != null) {
                sel.removeAllRanges();
                sel.addRange(this.colorSelection);
            }
            
            var element;
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
                element = this.getElementByContent(sel.anchorNode, type);
            }
            
            if (element != null) {
                switch (type) {
                    case "textcolor":
                        if (value == "None") {
                            if (element.style.getPropertyValue("color") != null) {
                                this.removeProperty(element, "color", element.style.getPropertyValue("color"));
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
                /*if (sel.anchorNode != null && sel.rangeCount != 0) {
                    var range = document.createRange();
                    range.selectNodeContents(sel.anchorNode);
                    sel.removeAllRanges();
                    sel.addRange(range);
                } */
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
                        newElement = document.createElement("span");
                        newElement.style.color = value;
                        break;
                    case "font":
                        newElement = document.createElement("span");
                        newElement.style.fontFamily = value;
                        break;
                    case "size":
                        newElement = document.createElement("span");
                        newElement.style.fontSize = value;
                        break;
                    case "bold":
                        newElement = document.createElement("span");
                        newElement.style.fontWeight = "bold";
                        break;
                    case "italic":
                        newElement = document.createElement("span");
                        newElement.style.fontStyle = "italic";
                        break;
                    case "underline":
                        newElement = document.createElement("span");
                        this.addTextDecoration(newElement, "underline");
                        break;
                    case "line-through":
                        newElement = document.createElement("span");
                        this.addTextDecoration(newElement, "line-through");
                        break;
                    case "subscript":
                        newElement = document.createElement("span");
                        newElement.style.verticalAlign = "sub";
                        break;
                    case "superscript":
                        newElement = document.createElement("span");
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
                }
            }
        }
        this.removeEmptyNodes();
        this.selectButtons(sel.anchorNode);
        this.restorestate();
        this.focusEditor();
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
                element.removeAttribute("style");
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
            if (value != "initial") {
                var words = value.split(' ');
                if (words.length > 1) {
                    for (let i = 0; i < words.length; i++) {
                        c++;
                    }
                }
                else {
                    c++;
                }
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
    getElementByContent = (el, type) => {
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

                /* Check if a style element exists  */
                var e = this.getElementByStyle(el, type);
                if (e != null) {
                    return e;
                }

                /* Check if the selection contains a list item and return the list */
                if (el.nodeName === 'LI') {
                    return el.parentNode;
                }

                /* Match the text, or get the element by the style */
                if (this.shadowRoot.getSelection().toString() == el.textContent) {
                    return el;
                }
            }

            el = el.parentNode;
        }

        return null;
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
                        return el;
                    case "font":
                        return el;
                    case "size":
                        return el;
                    case "bold":
                        if (el.style.fontWeight != null && el.style.fontWeight == "bold") {
                            return el;
                        }
                        break;
                    case "italic":
                        if (el.style.fontStyle != null && el.style.fontStyle == "italic") {
                            return el;
                        }
                        break;
                    case "underline":
                        if (el.style.textDecoration != null && el.style.textDecoration.includes("underline")) {
                            return el;
                        }
                        break;
                    case "line-through":
                        if (el.style.textDecoration != null && el.style.textDecoration.includes("line-through")) {
                            return el;
                        }
                        break;
                    case "subscript":
                        if (el.style.verticalAlign != null && el.style.verticalAlign == "sub") {
                            return el;
                        }
                        break;
                    case "superscript":
                        if (el.style.verticalAlign != null && el.style.verticalAlign == "superscript") {
                            return el;
                        }
                        break;
                    case "alignleft":
                        if (el.style.textAlign != null && el.style.textAlign == "left") {
                            return el;
                        }
                        break;
                    case "aligncenter":
                        if (el.style.textAlign != null && el.style.textAlign == "center") {
                            return el;
                        }
                        break;
                    case "alignright":
                        if (el.style.textAlign != null && el.style.textAlign == "right") {
                            return el;
                        }
                        break;
                    case "alignjustify":
                        if (el.style.textAlign != null && el.style.textAlign == "justify") {
                            return el;
                        }
                        break;
                    case "indent":
                        if (el.style.textIndent != null && el.style.textIndent != null) {
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
        var element = this.content;
        element.style.fontFamily = 'Arial, sans-serif';
        if (html != null) {
            element.innerHTML = html;
        }
        else {
            element.innerHTML = "";
        }
        if (this.IsLoaded) {
            this.selectButtons(element);
        }
        this.IsLoaded = true;
    };
    loadInnerText = (text) => {
        var element = this.content;
        element.style.fontFamily = 'Consolas';
        if (text != null) {
            element.innerText = text;
        }
        else {
            element.innerText = "";
        }
        this.selectButtons(element);
    };
    plaintext = () => {
        var element = this.content;
        return element.innerText || element.textContent;
    };

    /* Search up the elements */
    selectButtons = (el) => {
        if (el == null || this.lockToolbar == true) {
            return null;
        }

        /* Reset Styles */
        var bold = this.shadowRoot.getElementById("blazing-rich-text-bold-button");
        if (bold != null && bold.classList.contains("selected")) {
            bold.classList.remove("selected");
        }

        var italic = this.shadowRoot.getElementById("blazing-rich-text-italic-button");
        if (italic != null && italic.classList.contains("selected")) {
            italic.classList.remove("selected");
        }

        var underline = this.shadowRoot.getElementById("blazing-rich-text-underline-button");
        if (underline != null && underline.classList.contains("selected")) {
            underline.classList.remove("selected");
        }

        var strike = this.shadowRoot.getElementById("blazing-rich-text-strike-button");
        if (strike != null && strike.classList.contains("selected")) {
            strike.classList.remove("selected");
        }

        var sub = this.shadowRoot.getElementById("blazing-rich-text-sub-button");
        if (sub != null && sub.classList.contains("selected")) {
            sub.classList.remove("selected");
        }

        var superscript = this.shadowRoot.getElementById("blazing-rich-text-super-button");
        if (superscript != null && superscript.classList.contains("selected")) {
            superscript.classList.remove("selected");
        }

        var alignleft = this.shadowRoot.getElementById("blazing-rich-text-alignleft-button");
        if (alignleft != null && alignleft.classList.contains("selected")) {
            alignleft.classList.remove("selected");
        }

        var aligncenter = this.shadowRoot.getElementById("blazing-rich-text-aligncenter-button");
        if (aligncenter != null && aligncenter.classList.contains("selected")) {
            aligncenter.classList.remove("selected");
        }

        var alignright = this.shadowRoot.getElementById("blazing-rich-text-alignright-button");
        if (alignright != null && alignright.classList.contains("selected")) {
            alignright.classList.remove("selected");
        }

        var alignjustify = this.shadowRoot.getElementById("blazing-rich-text-alignjustify-button");
        if (alignjustify != null && alignjustify.classList.contains("selected")) {
            alignjustify.classList.remove("selected");
        }

        var indent = this.shadowRoot.getElementById("blazing-rich-text-indent-button");
        if (indent != null && indent.classList.contains("selected")) {
            indent.classList.remove("selected");
        }

        var link = this.shadowRoot.getElementById("blazing-rich-text-link-button");
        if (link != null && link.classList.contains("selected")) {
            link.classList.remove("selected");
        }

        /* Menus */
        var formatButton = this.shadowRoot.getElementById("blazing-rich-text-format-button");
        formatButton.innerText = "Format";

        var fontButton = this.shadowRoot.getElementById("blazing-rich-text-font-button");
        fontButton.innerText = "Font";

        var sizeButton = this.shadowRoot.getElementById("blazing-rich-text-size-button");
        sizeButton.innerText = "Size";

        this.closeDropdowns();

        while (el.parentNode) {
            /* Prevent selecting unwanted elements */
            if (el.parentNode.nodeType != 1 || el.parentNode == null || el.parentNode.nodeName == "A" && el.parentNode.classList.contains("rich-text-box-menu-item") || el.nodeName == 'DIV' && el.classList.contains("rich-text-box-content") || el.parentNode.nodeName == "#text" || el.parentNode.nodeName == "#document") {
                break;
            }

            var compStyles = window.getComputedStyle(el.parentNode);

            if (el.parentNode.style.fontWeight == "bold") {
                bold.classList.add("selected");
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

            if (compStyles.getPropertyValue("text-align") == "left") {
                alignleft.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-align") == "center") {
                aligncenter.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-align") == "right") {
                alignright.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-align") == "justify") {
                alignjustify.classList.add("selected");
            }
            if (compStyles.getPropertyValue("text-indent") == "40px") {
                indent.classList.add("selected");
            }
            if (el != null && el.style != null && el.style.fontFamily) {
                fontButton.innerText = el.style.fontFamily.replace(/^"(.*)"$/, '$1');
            }
            if (el != null && el.style != null && el.style.fontSize) {
                sizeButton.innerText = el.style.fontSize;
            }
            if (el.parentNode.nodeName == "P") {
                formatButton.innerText = 'Paragraph';
            }
            if (el.parentNode.nodeName == "H1") {
                formatButton.innerText = 'Header 1';
            }
            if (el.parentNode.nodeName == "H2") {
                formatButton.innerText = 'Header 2';
            }
            if (el.parentNode.nodeName == "H3") {
                formatButton.innerText = 'Header 3';
            }
            if (el.parentNode.nodeName == "H4") {
                formatButton.innerText = 'Header 4';
            }
            if (el.parentNode.nodeName == "H5") {
                formatButton.innerText = 'Header 5';
            }
            if (el.parentNode.nodeName == "A") {
                link.classList.add("selected");
                /* var href = element.getAttribute("href"); */
            }
            el = el.parentNode;
        }
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