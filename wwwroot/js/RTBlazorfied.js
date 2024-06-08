
let editorInstances = {};

function RTBlazorfied_Initialize(id, shadow_id, toolbar_id, styles) {
    editorInstances[id] = new RTBlazorfied(id, shadow_id, toolbar_id, styles);
}

function RTBlazorfied_Method(methodName, id, param) {
    var editorInstance = editorInstances[id];
    if (editorInstance && typeof editorInstance[methodName] === 'function') {
        if (param != null) {
            return editorInstance[methodName](param);
        }
        else {
            return editorInstance[methodName]();
        }
    }
}

class RTBlazorfied {
    constructor(id, shadow_id, toolbar_id, styles) {
        this.id = id;
        this.shadow_id = shadow_id;
        this.toolbar_id = toolbar_id;
        this.styles = styles;
        this.init();
    }

    init() {
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

        /* Prevent the dropdowns from causing the text box from
        losing focus. */
        var dropdown = this.shadowRoot.querySelector('.rich-text-box-dropdown-content');
        if (dropdown != null) {
            dropdown.addEventListener('mousedown', function (event) {
                event.preventDefault();
            });
        }      
    }
    format(format) {
        this.formatNode(format);
    }
    dropdown(id) {
        var el = this.shadowRoot.getElementById(id);
        if (el != null && el.classList.contains("rich-text-box-show")) {
            el.classList.remove("rich-text-box-show")
        }
        else {
            el.classList.add("rich-text-box-show")
        }
    }
    bold() {
        this.updateNode("bold");
    }
    italic() {
        this.updateNode("italic");
    }
    underline() {
        this.updateNode("underline");
    };
    strikethrough() {
        this.updateNode("line-through");
    };
    subscript() {
        this.updateNode("subscript");
    };
    superscript() {
        this.updateNode("superscript");
    };
    alignleft() {
        this.updateNode("alignleft");
    };
    aligncenter() {
        this.updateNode("aligncenter");
    };
    alignright() {
        this.updateNode("alignright");
    };
    alignjustify() {
        this.updateNode("alignjustify");
    };
    indent() {
        this.updateNode("indent");
    };
    copy() {
        this.backupstate();

        var selection = window.getSelection();
        if (selection != null) {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selection);
            }
        }

        this.restorestate();
    };
    cut() {
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
    };

    removeEmptyNodes() {
        var div = this.shadowRoot.getElementById(this.id);

        if (div) {
            var elements = div.querySelectorAll('*');

            elements.forEach(element => {
                if (!element.hasChildNodes() ||
                    (element.childNodes.length === 1 &&
                        element.childNodes[0].nodeType === 3 &&
                        !/\S/.test(element.textContent))) {

                    if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }
                }
            });
        }

        this.selectButtons(div);
    };

    delete() {
        this.backupstate();

        window.getSelection().deleteFromDocument();
        this.removeEmptyNodes();

        this.restorestate();
    };
    selectall() {
        var range = document.createRange();
        range.selectNodeContents(this.content)
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    orderedlist() {
        this.addlist("OL");
    };

    unorderedlist() {
        this.addlist("UL");
    };
    addlist(type) {
        this.backupstate();

        // Get the selected text
        var selection = this.shadowRoot.getSelection();
        var selectedText = selection.toString().trim();
        if (!selectedText) {
            return;
        }

        // Get the items
        var items = selectedText.split('\n').filter(item => item != null);

        // Create the <ol> element
        var ol = document.createElement(type);
        items.forEach(function (item) {
            var li = document.createElement("li");
            li.textContent = item;
            ol.appendChild(li);
        });

        if (selection.rangeCount != 0) {
            range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(ol);
            range.selectNodeContents(ol);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.restorestate();
    }
    removelist(list) {
        while (list.firstChild) {
            // list.parentNode.insertBefore(list.firstChild, list);
            var listItem = list.firstChild;
            var div = document.createElement("DIV");
            div.innerHTML = listItem.innerHTML;
            list.parentNode.insertBefore(div, list);
            list.removeChild(listItem);
        }

        // Remove the ordered list element
        list.parentNode.removeChild(list);
    }
    createLink() {
        var selection = this.getSelection();
        var range = selection.getRangeAt(0);
        var link = prompt("Enter URL:");
        if (link) {
            var anchor = document.createElement("a");
            anchor.href = link;
            anchor.textContent = selection.toString();
            range.deleteContents();
            range.insertNode(anchor);
        }
    }

    UndoContent = null;
    RedoContent = null;
    undo() {
        if (this.UndoContent != null) {
            this.content.innerHTML = this.UndoContent;
        }
    }
    redo() {
        if (this.RedoContent != null) {
            this.content.innerHTML = this.RedoContent;
        }
    }
    restorestate() {
        var html = this.content?.innerHTML;
        if (html != null) {
            this.RedoContent = html;
        }
    }
    backupstate() {
        var html = this.content?.innerHTML;
        if (html != null) {
            this.UndoContent = html;
        }
    }
    saveSelection() {
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

    restoreSelection(savedSelection) {
        if (!savedSelection) return;

        var selection = this.shadowRoot.getSelection();
        var range = document.createRange();

        range.setStart(savedSelection.startContainer, savedSelection.startOffset);
        range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    formatNode(type) {
        var sel, range;

        this.backupstate();       

        if (this.shadowRoot.getSelection()) {
            sel = this.shadowRoot.getSelection();

            // See if an element with matching content exists
            // if it does, change or remove it
            var element = this.getElementByType(sel.anchorNode.parentNode, "Format");
            if (element != null) {
                
                //if (this.isFormatElement(element)) {
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

                    // Copy styles
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
    }
    isFormatElement(element) {
        if (element.nodeName == "P"
            || element.nodeName == "H1"
            || element.nodeName == "H2"
            || element.nodeName == "H3"
            || element.nodeName == "H4"
            || element.nodeName == "H5") {
            return true;
        }
    }
    closeDropdowns() {
        /* Close the Dropdowns */
        var dropdown = this.shadowRoot.querySelector('.rich-text-box-dropdown-content');
        if (dropdown != null && dropdown.classList.contains("rich-text-box-show")) {
            dropdown.classList.remove("rich-text-box-show")
        }
    }
    updateNode(type) {
        var sel, range;

        this.backupstate();

        if (this.shadowRoot.getSelection()) {
            sel = this.shadowRoot.getSelection();

            // Check if the node has a style applied and remove it
            var el = this.getElementByStyle(sel.anchorNode, type);
            if (el != null) {
                switch (type) {
                    case "bold":
                        this.removeProperty(el, "font-weight", "bold");
                        break;
                    case "italic":
                        this.removeProperty(el, "font-style", "italic");
                        break;
                    case "underline":
                        this.removeTextDecoration(el, "underline");
                        break;
                    case "line-through":
                        this.removeTextDecoration(el, "line-through");
                        break;
                    case "subscript":
                        this.removeProperty(el, "vertical-align", "sub");
                        break;
                    case "superscript":
                        this.removeProperty(el, "vertical-align", "super");
                        break;
                    case "alignleft":
                        this.removeProperty(el, "text-align", "left");
                        break;
                    case "aligncenter":
                        this.removeProperty(el, "text-align", "center");
                        break;
                    case "alignright":
                        this.removeProperty(el, "text-align", "right");
                        break;
                    case "alignjustify":
                        this.removeProperty(el, "text-align", "justify");
                        break;
                    case "indent":
                        this.removeProperty(el, "text-indent", "40px");
                        break;
                }
                //if (sel.anchorNode != null && sel.rangeCount != 0) {
                //    var range = document.createRange();
                //    range.selectNodeContents(sel.anchorNode);
                //    sel.removeAllRanges();
                //    sel.addRange(range);
                //}
                this.selectButtons(el);
                this.restorestate();
                return;
            }

            // See if an element with matching content exists
            // if it does, change or remove it
            var element = this.getElementByContent(sel.anchorNode);
            if (element != null) {
                switch (type) {
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
                            this.removeProperty(element, "text-decoration", "underline");
                        }
                        else {
                            this.addTextDecoration(element, "underline");
                        }
                        break;
                    case "line-through":
                        if (element.style.textDecoration.includes("line-through")) {
                            this.removeProperty(element, "text-decoration", "line-through");
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
                //if (sel.anchorNode != null && sel.rangeCount != 0) {
                //    var range = document.createRange();
                //    range.selectNodeContents(sel.anchorNode);
                //    sel.removeAllRanges();
                //    sel.addRange(range);
                //}
                this.selectButtons(sel.anchorNode);
                this.restorestate();
                return;
            }

            // Insert a new node
            // Make certain the element has content
            if (sel.toString().length > 0) {
                var newElement;
                switch (type) {
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

                    this.selectButtons(sel.anchorNode);
                }
            }
        }

        this.restorestate();
    }
    removeProperty(element, property, value) {
        // This should more generally consider all the styles
        if (this.styleCount(element) > 1) {
            element.style.removeProperty(property, value);
        }
        else {
            if (element.nodeName == "SPAN" || element.nodeName == "DIV") {
                if (element.childElementCount == 0) {
                    element.replaceWith(element.textContent);
                }
                else {
                    element.insertAdjacentHTML("afterend", element.innerHTML);
                    element.remove();

                    //var fragment = document.createDocumentFragment();

                    //while (element.firstChild) {
                    //    fragment.appendChild(element.firstChild);
                    //}
                    //element.parentNode.insertBefore(fragment, element);
                    //element.parentNode.removeChild(element);
                }
            }
            else {
                element.removeAttribute("style");
            }
        }
    }
    addTextDecoration(element, decoration) {
        var currentDecorations = element.style.textDecoration;

        // Check if the decoration is already applied
        if (currentDecorations != null && !currentDecorations.includes(decoration)) {
            // Add the new decoration
            var newDecorations = currentDecorations ? currentDecorations + ' ' + decoration : decoration;
            element.style.textDecoration = newDecorations;
        }
    }
    removeTextDecoration(element, decoration) {
        if (this.styleCount(element) > 1) {
            var currentDecorations = element.style.textDecoration.split(' ');

            // Remove the specified decoration
            var newDecorations = currentDecorations.filter(decor => decor !== decoration);

            // Update the element's text-decoration style
            element.style.textDecoration = newDecorations.join(' ');
        }
        else {
            if (element.nodeName == "SPAN" & element.childElementCount == 0) {
                element.replaceWith(element.textContent);
            }
            else if (element.nodeName == "SPAN") {
                element.insertAdjacentHTML("afterend", element.innerHTML);
                element.remove();
                //var fragment = document.createDocumentFragment();

                //while (element.firstChild) {
                //    fragment.appendChild(element.firstChild);
                //}
                //element.parentNode.insertBefore(fragment, element);
                //element.parentNode.removeChild(element);
            }
            else {
                // No more styles. Since, this element may be required
                // for formating, remove the styles
                element.removeAttribute("style");
            }
        }
    }

    // Gets the number of styles existing in an element
    styleCount(el) {
        if (el == null) {
            return null;
        }
        let n = 0;

        if (el.nodeName != "#text" || el.nodeName != "#document") {
            if (el.style.fontWeight == "bold") { n++; }
            if (el.style.fontStyle == "italic") { n++; }
            if (el.style.textDecoration.includes("underline")) { n++; }
            if (el.style.textDecoration.includes("line-through")) { n++; }
            if (el.style.verticalAlign == "sub") { n++; }
            if (el.style.verticalAlign == "super") { n++; }
            if (el.style.textAlign == "left") { n++; }
            if (el.style.textAlign == "center") { n++; }
            if (el.style.textAlign == "right") { n++; }
            if (el.style.textAlign == "justify") { n++; }
            if (el.style.textIndent == "40px") { n++; }
        }
        return n;
    }

    /* Get an element by type */
    getElementByType(el, type) {
        if (el == null) {
            return null;
        }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }

            // Recurse into the closest node and return it
            if (el.nodeName != "#text" && el.nodeName != "#document") {
                switch (type) {
                    case "Format":
                        if (this.isFormatElement(el)) {
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
    getElementByContent(el) {
        if (el == null) {
            return null;
        }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }

            // Recurse into the closest node and return it
            if (el.nodeName != "#text" && el.nodeName != "#document") {
                if (this.shadowRoot.getSelection().toString() == el.textContent) {
                    return el;
                }
            }

            el = el.parentNode;
        }

        return null;
    }
    /* Get an element by style */
    getElementByStyle(el, type) {
        if (el == null) {
            return null;
        }

        while (el) {
            /* Prevent recursion outside the editor */
            if (el.nodeName == 'DIV' && el.id == this.id) {
                break;
            }
            if (el.nodeName != "#text" && el.nodeName != "#document") {

                /* Get the node */
                switch (type) {
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
                        if (el.style.verticalAlign != null && el.style.verticalAlign == "super") {
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
                        if (el.style.textIndent != null && el.style.textIndent == "40px") {
                            return el;
                        }
                        break;
                    default:
                }
            }

            el = el.parentNode;
        }

        return null;
    }
    html() {
        return this.content.innerHTML;
    };
    loadHtml(html) {
        var element = this.content;
        element.style.fontFamily = 'Arial, sans-serif';
        if (html != null) {
            element.innerHTML = html;
        }
        else {
            element.innerHTML = "";
        }
    };
    loadInnerText(text) {
        var element = this.content;
        element.style.fontFamily = 'Consolas';
        if (text != null) {
            element.innerText = text;
        }
        else {
            element.innerText = "";
        }
    };
    plaintext() {
        var element = this.content;
        return element.innerText || element.textContent;
    };


    /* Search up the elements */
    selectButtons(el) {
        if (el == null) {
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

        this.closeDropdowns();

        while (el.parentNode) {
            /* Prevent selecting unwanted elements */
            if (el.parentNode == null || el.parentNode.nodeName == "A" && el.parentNode.classList.contains("rich-text-box-menu-item") || el.nodeName == 'DIV' && el.classList.contains("rich-text-box-content") || el.parentNode.nodeName == "#text" || el.parentNode.nodeName == "#document") {
                break;
            }

            var compStyles = window.getComputedStyle(el.parentNode);

            // Bold
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

                // var href = element.getAttribute("href");
            }
            el = el.parentNode;
        }

        return null;
    }
}