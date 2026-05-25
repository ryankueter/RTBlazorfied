# rt-native - Rich Text Editor

**Author:** Ryan Kueter | **Updated:** May, 2026

**rt-native.js** HTML Editor is a free native web component that provides accessibility features and a wide variety of elements and customizations that make it one of the most robust and flexible HTML editors available. It allows the programmer to apply custom .css files to the preview window, to see how the content will be displayed in production. The editor uses embedded .svg Google Font Icons and the shadow DOM to isolate the HTML from inheriting the existing page styles. No frameworks, no build step, no dependencies — drop **one script tag** into any HTML page and you're done.

---

## Table of Contents

1. [Files](#files)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [HTML Attributes](#html-attributes)
5. [JavaScript API](#javascript-api)
   - [getValue()](#getvalue)
   - [getPlainText()](#getplaintext)
   - [setValue()](#setvalue)
   - [configure()](#configure)
   - [setReadOnly()](#setreadonly)
   - [setPreviewCssFiles()](#setpreviewcssfiles)
   - [setPreviewCssFile()](#setpreviewcssfile)
   - [setPreviewCss()](#setpreviewcss)
   - [addCustomButton()](#addcustombutton)
   - [setCustomButtons()](#setcustombuttons)
   - [removeCustomButton()](#removecustombutton)
   - [clearCustomButtons()](#clearcustombuttons)
6. [Events](#events)
7. [CSS Variables](#css-variables)
   - [Toolbar](#toolbar-variables)
   - [Buttons](#button-variables)
   - [Content Area](#content-area-variables)
   - [Editor Container](#editor-container-variables)
   - [Scrollbars](#scrollbar-variables)
   - [Blockquote](#blockquote-variables)
   - [Code / Pre](#code--pre-variables)
   - [Modals & Dialogs](#modal--dialog-variables)
8. [Theming with CSS Classes](#theming-with-css-classes)
9. [Preview Window Styling](#preview-window-styling)
10. [Toolbar Buttons](#toolbar-buttons)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Accessibility](#accessibility)
13. [Multiple Instances](#multiple-instances)
14. [Browser Support](#browser-support)

---

## Files

| File | Purpose |
| --- | --- |
| rt-native.js | **The only required file.** Contains the complete editor engine, web component wrapper, all CSS defaults, and all dialog styles — everything is self-contained. |

---

## Installation

**npm**

```bash
npm install rt-native
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="module">
        import '/node_modules/rt-native/rt-native.js';
    </script>
</head>
<body>
    <rt-native id="editor" height="400px"></rt-native>
</body>
</html>
```

**CDN — unpkg**

```html
<script src="https://unpkg.com/rt-native/rt-native.js"></script>
```

**CDN — jsDelivr**

```html
<script src="https://cdn.jsdelivr.net/npm/rt-native/rt-native.js"></script>
```

---

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>

    <rt-native id="editor" height="400px"></rt-native>

    <script src="rt-native.js"></script>
    <script>
        const editor = document.getElementById('editor');

        // Read the content
        console.log(editor.getValue());

        // Write content
        editor.setValue('<p>Hello <strong>world</strong></p>');

        // React to changes
        editor.addEventListener('change', e => {
            console.log(e.detail.value);
        });
    </script>
</body>
</html>
```

---

## HTML Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | '' | Initial HTML content of the editor. |
| width | string | 100% | Editor width. Any valid CSS value (px, %, vw, etc.). |
| height | string | 300px | Editor height. Any valid CSS value. |
| placeholder | string | — | Placeholder text shown when the editor is empty. |
| readonly | boolean (presence) | — | Puts the editor in read-only mode. Hides the toolbar. |
| aria-label | string | 'Rich text editor' | Accessible name for the editor region. |
| label | string | — | Alternative to **aria-label** for the accessible name. |
| config | JSON string | — | Declarative configuration. Parsed and passed to **configure()** on connect. |

### Example

```html
<!-- Inline value and placeholder -->
<rt-native value="<p>Hello</p>" width="800px" height="500px"
           placeholder="Start typing…"></rt-native>

<!-- Read-only display -->
<rt-native readonly value="<p>This content cannot be edited.</p>"></rt-native>

<!-- Accessible label -->
<rt-native aria-label="Article body"></rt-native>
```

---

## JavaScript API

### getValue()

Returns the current editor content as an **HTML string**.

```js
const html = editor.getValue();
// "<p>Hello <strong>world</strong></p>"
```

### getPlainText()

Returns the editor content as **plain text** (all HTML tags stripped).

```js
const text = editor.getPlainText();
// "Hello world"
```

### setValue()

Replaces the editor content with the supplied HTML string. Passing an empty string or null clears the editor.

```js
editor.setValue('<h2>New content</h2><p>Paragraph text.</p>');
editor.setValue('');   // clear
```

### configure()

Controls which toolbar buttons are rendered. All buttons are visible by default except the **status bar** (wordCount), which is hidden by default and revealed with the Toggle Status Bar button.

Use `clearAll: true` to hide everything first, then opt individual buttons back in.

```js
// Hide specific buttons
editor.configure({
    visibility: {
        embedMedia:  false,
        table:       false,
        imageUpload: false,
    }
});

// Pass every key explicitly as true to restore full toolbar
editor.configure({
    visibility: {
        clearAll: true,
        font: true, size: true, format: true, insert: true, textStylesDivider: true,
        bold: true, italic: true, underline: true, strikethrough: true,
        subscript: true, superscript: true, formatDivider: true,
        textColor: true, textColorDivider: true,
        alignLeft: true, alignCenter: true, alignRight: true,
        alignJustify: true, alignDivider: true,
        copy: true, cut: true, paste: true, delete: true,
        selectAll: true, actionDivider: true,
        orderedList: true, unorderedList: true, indent: true, listDivider: true,
        link: true, image: true, imageUpload: true,
        quote: true, codeBlock: true, embedMedia: true,
        table: true, horizontalRule: true, mediaDivider: true,
        undo: true, redo: true, historyDivider: true,
        saveHtml: true, htmlView: true, preview: true, statusBarToggle: true,
        wordCount: true,
    }
});
```

**All visibility keys:**

| Key | Controls |
| --- | --- |
| font | Font family dropdown |
| size | Font size dropdown |
| format | Paragraph / heading format dropdown |
| insert | Insert symbol / emoji dropdown |
| textStylesDivider | Divider after the top dropdowns |
| bold | Bold button |
| italic | Italic button |
| underline | Underline button |
| strikethrough | Strikethrough button |
| subscript | Subscript button |
| superscript | Superscript button |
| formatDivider | Divider after text-format buttons |
| textColor | Text color, background color, and remove-color buttons |
| textColorDivider | Divider after color buttons |
| alignLeft | Align left button |
| alignCenter | Align center button |
| alignRight | Align right button |
| alignJustify | Justify button |
| alignDivider | Divider after alignment buttons |
| cut | Cut button |
| copy | Copy button |
| paste | Paste button |
| delete | Delete button |
| selectAll | Select all button |
| actionDivider | Divider after clipboard buttons |
| orderedList | Ordered list button |
| unorderedList | Unordered list button |
| indent | Increase / decrease indent buttons |
| listDivider | Divider after list buttons |
| link | Insert link and remove link buttons |
| image | Insert image button |
| imageUpload | Upload / embed image button |
| quote | Block quote button |
| codeBlock | Code block button |
| embedMedia | Embed media (audio / PDF / iframe) button |
| video | Video embed button |
| table | Insert table button |
| horizontalRule | Insert horizontal rule button |
| mediaDivider | Divider after insert buttons |
| undo | Undo button |
| redo | Redo button |
| historyDivider | Divider after undo / redo |
| statusBarToggle | Toggle Status Bar button |
| saveHtml | Save HTML file button |
| htmlView | Toggle HTML source view button |
| preview | Preview button |
| wordCount | Status bar (word / character count) — hidden by default |

> **Divider auto-hiding:** Dividers are only rendered when at least one button in their group is visible *and* the divider's own key is true.

### setReadOnly()

Programmatically enable or disable read-only mode. When read-only, the toolbar is hidden and the content area cannot be edited.

```js
editor.setReadOnly(true);   // lock
editor.setReadOnly(false);  // unlock
```

The **readOnly** getter reflects the current state:

```js
if (editor.readOnly) {
    console.log('Editor is locked.');
}
```

Read-only mode can also be set declaratively via the **readonly** HTML attribute:

```html
<rt-native readonly></rt-native>
```

### setPreviewCssFiles()

Sets one or more CSS files to apply to the preview window. Rules are automatically scoped so they only style the HTML being edited — the toolbar, menus, and dialogs are never affected. Call with no arguments to remove all files.

```js
// Load two stylesheets
editor.setPreviewCssFiles('/styles/content.css', '/styles/tables.css');

// Load a single file
editor.setPreviewCssFiles('/styles/my-content.css');

// Clear all preview files
editor.setPreviewCssFiles();
```

> **CORS:** Files are loaded with fetch(). They must be served from the same origin or include appropriate Access-Control-Allow-Origin headers.

### setPreviewCssFile()

Convenience method that sets a **single** CSS file. Equivalent to **setPreviewCssFiles(url)**.

```js
editor.setPreviewCssFile('/styles/content.css');

// Clear
editor.setPreviewCssFile('');
```

### setPreviewCss()

Supplies **inline CSS** to apply to both the preview window. Rules are automatically scoped, exactly like **setPreviewCssFiles()**. Call with no argument (or '') to clear.

```js
editor.setPreviewCss(`
    h1, h2, h3 { color: #0a2540; }
    blockquote {
        border-left-color: #635bff;
        background: #f8f6ff;
    }
`);

// Clear
editor.setPreviewCss('');
```

**setPreviewCss()** and **setPreviewCssFiles()** are independent — both can be active at the same time. File rules are applied first; inline rules are appended after, so inline CSS always wins when there is a conflict.

### At-rules

@media, @supports, @layer, and @container blocks are handled correctly — selectors inside them are scoped. Other at-rules (@keyframes, @font-face, etc.) are passed through unchanged.

### addCustomButton()

Adds a single custom button to the right end of the toolbar (after the built-in buttons). If a button with the same `id` already exists it is replaced in-place. The toolbar rebuilds automatically.

```js
editor.addCustomButton({
    id:      'my-stamp',
    title:   'Insert Stamp',
    svg:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M160-120v-80h640v80H160Zm0-120v-80l320-400-320-400v-80h640v80L480-720l320 400v80H160Z"/>
              </svg>`,
    onClick: (event, editor) => {
        editor.setValue(editor.getValue() + '<p>🔖 Stamp inserted.</p>');
    }
});
```

| Property | Type | Required | Description |  |
| --- | --- | --- | --- | --- |
| id | string | yes | Unique identifier for the button. |  |
| title | string | — | Tooltip text and accessible label. Defaults to `id`. |  |
| svg | string | — | SVG markup rendered as the button icon. |  |
| onClick | Function \\ | string | — | Called when the button is clicked. A string is resolved as a dot-path on `window` (e.g. `'myApp.handleStamp'`). Receives `(event, editor, instance)`. |
| disabled | boolean | — | When `true` the button is rendered but not clickable. |  |

### setCustomButtons()

Replaces **all** custom toolbar buttons at once.

```js
editor.setCustomButtons([
    { id: 'stamp', title: 'Stamp', svg: '…', onClick: handleStamp },
    { id: 'sign',  title: 'Sign',  svg: '…', onClick: handleSign  },
]);
```

### removeCustomButton()

Removes the custom button with the given `id`.

```js
editor.removeCustomButton('stamp');
```

### clearCustomButtons()

Removes **all** custom toolbar buttons.

```js
editor.clearCustomButtons();
```

---

## Events

### change

Fired on the element whenever the editor content changes. The event **bubbles** and is **composed** (crosses shadow DOM boundaries).

```js
editor.addEventListener('change', (event) => {
    const html = event.detail.value;  // current HTML string
    console.log(html);
});
```

| Property | Value |
| --- | --- |
| event.detail.value | Current editor HTML as a string |
| event.bubbles | true |
| event.composed | true |

### custom-button-click

Fired whenever a custom toolbar button is clicked. The event **bubbles** and is **composed**.

```js
editor.addEventListener('custom-button-click', (event) => {
    console.log('Custom button clicked:', event.detail.id);
});
```

| Property | Value |
| --- | --- |
| event.detail.id | The `id` of the button that was clicked |
| event.detail.button | The full button definition object |
| event.detail.editor | The `rt-native` element |
| event.bubbles | true |
| event.composed | true |

---

## CSS Variables

All visual aspects of the editor are controlled through CSS custom properties declared on the **rt-native** element. Default values are injected automatically by **rt-native.js** when the first editor mounts — no stylesheet required. Override any variable in your own CSS to theme the editor.

```css
/* Override globally (all editors on the page) */
rt-native {
    --rtb-toolbar-bg: #f5f5f5;
    --rtb-btn-size:   14px;
}

/* Override for a specific editor */
#my-editor {
    --rtb-content-bg:   #1e1e1e;
    --rtb-content-text: #ddd;
}
```

> **How it works:** CSS custom properties inherit through shadow boundaries. Any value set on the host element is automatically picked up inside the shadow root — no re-initialization needed.

---

### Toolbar Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-toolbar-bg | #FFF | Toolbar background color |
| --rtb-toolbar-border-style | solid | Toolbar bottom border style |
| --rtb-toolbar-border-width | 1px | Toolbar bottom border width |
| --rtb-toolbar-border-color | #EEE | Toolbar bottom border color |
| --rtb-toolbar-border-radius | 0px | Toolbar corner radius (container clips top corners automatically) |
| --rtb-dropdown-bg | #FFF | Font / Size / Format dropdown background |
| --rtb-dropdown-text | #000 | Dropdown item text color |
| --rtb-dropdown-bg-hover | #e5e5e5 | Dropdown item hover background |
| --rtb-dropdown-text-hover | #000 | Dropdown item hover text color |

---

### Button Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-btn-text | #000 | Button icon color |
| --rtb-btn-size | 16px | Icon size (also drives button min-height and divider height) |
| --rtb-btn-font | Arial, sans-serif | Font for dropdown buttons |
| --rtb-btn-bg | inherit | Button background at rest |
| --rtb-btn-bg-hover | #DDD | Button background on hover |
| --rtb-btn-bg-selected | #CCC | Button background when active / selected |
| --rtb-btn-border-style | none | Button border style |
| --rtb-btn-border-width | 0px | Button border width |
| --rtb-btn-border-color | #AAA | Button border color at rest |
| --rtb-btn-border-hover | inherit | Button border color on hover |
| --rtb-btn-border-selected | inherit | Button border color when selected |
| --rtb-btn-border-radius | 5px | Button corner radius |

---

### Content Area Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-content-text | #000 | Editor text color |
| --rtb-content-size | 16px | Editor font size |
| --rtb-content-font | Arial, sans-serif | Editor font family |
| --rtb-content-bg | #FFF | Editor content background color |
| --rtb-content-shadow | none | Inner box shadow on the content area |
| --rtb-placeholder-color | #9ca3af | Placeholder text color |

---

### Editor Container Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-editor-width | 100% | Maximum width of the editor |
| --rtb-editor-height | 300px | Height of the editor |
| --rtb-editor-border-style | solid | Outer border style |
| --rtb-editor-border-width | 1px | Outer border width |
| --rtb-editor-border-color | #EEE | Outer border color |
| --rtb-editor-border-radius | 0px | Outer corner radius |
| --rtb-editor-shadow | none | Outer box shadow |
| --rtb-editor-resize | auto | auto shows the resize handle; hidden removes it |
| --rtb-z-index | 1 | Z-index of the editor container — raise this to stack the editor above surrounding page content |

---

### Scrollbar Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-scroll-width | 10px | Scrollbar track width |
| --rtb-scroll-opacity | 1 | Scrollbar opacity |
| --rtb-scroll-bg | transparent | Scrollbar track background |
| --rtb-scroll-thumb-bg | #AAA | Scrollbar thumb color |
| --rtb-scroll-thumb-bg-hover | #DDD | Scrollbar thumb color on hover |
| --rtb-scroll-thumb-radius | 0 | Scrollbar thumb corner radius |

---

### Blockquote Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-quote-bg | #f9f9f9 | Blockquote background color |
| --rtb-quote-border-color | #ccc | Blockquote left-border color |
| --rtb-quote-border-width | 5px | Blockquote left-border width |

---

### Code / Pre Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-code-bg | #f9f9f9 | Code block background color |
| --rtb-code-border-radius | 10px | Code block corner radius |

---

### Modal / Dialog Variables

| Variable | Default | Description |
| --- | --- | --- |
| --rtb-modal-bg | #fefefe | Dialog background color |
| --rtb-modal-text | #000 | Dialog text and close-button color |
| --rtb-modal-text-size | 16px | Dialog font size |
| --rtb-modal-text-font | Arial, sans-serif | Dialog font family |
| --rtb-modal-input-bg | #fff | Input field background |
| --rtb-modal-input-text | #000 | Input field text color |
| --rtb-modal-input-border | #CCC | Input field border color |
| --rtb-modal-checkbox | #007bff | Checkbox accent color |

---

## Theming with CSS Classes

The cleanest way to create reusable themes is to define a CSS class that overrides the variables you need, then apply it to the element.

```css
/* styles.css */
rt-native.dark {
    --rtb-toolbar-bg:          #1e1e1e;
    --rtb-toolbar-border-color:#333;
    --rtb-btn-text:            #ccc;
    --rtb-btn-bg-hover:        #3a3a3a;
    --rtb-btn-bg-selected:     #444;
    --rtb-content-text:        #ddd;
    --rtb-content-bg:          #252526;
    --rtb-editor-border-color: #333;
    --rtb-modal-bg:            #2d2d2d;
    --rtb-modal-text:          #ccc;
    --rtb-modal-input-bg:      #1e1e1e;
    --rtb-modal-input-text:    #ccc;
    --rtb-modal-input-border:  #555;
    --rtb-dropdown-bg:         #2d2d2d;
    --rtb-dropdown-text:       #ccc;
    --rtb-dropdown-bg-hover:   #3a3a3a;
}
```

**Apply via HTML:**

```html
<rt-native class="dark" id="editor" height="400px"></rt-native>
```

**Apply via JavaScript:**

```js
var editor = document.getElementById("editor");
if (editor) {
    if (editor.classList.contains('light')) {
        editor.classList.remove('light');
    }
    if (editor.classList.contains('dark')) {
        editor.classList.remove('dark');
    }
    editor.classList.add(theme);
}
```

**Apply via media query (system dark mode):**

```css
@media (prefers-color-scheme: dark) {
    rt-native {
        --rtb-toolbar-bg:  #1e1e1e;
        --rtb-content-bg:  #252526;
        --rtb-content-text:#ddd;
        /* etc. */
    }
}
```

### Fluent 2 Themes

Complete ready-to-use implementations of Microsoft's [Fluent 2 Design System](https://fluent2.microsoft.design/). Copy either block into your stylesheet and apply the class to the element.

**Fluent 2 Light**

```css
rt-native.fluent {
    /* Typography */
    --rtb-btn-font:              Arial, Helvetica, Verdana, sans-serif;
    --rtb-btn-size:              16px;

    /* Toolbar */
    --rtb-toolbar-bg:            #ffffff;
    --rtb-toolbar-border-style:  solid;
    --rtb-toolbar-border-width:  1px;
    --rtb-toolbar-border-color:  #d1d1d1;
    --rtb-dropdown-bg:           #ffffff;
    --rtb-dropdown-text:         #242424;
    --rtb-dropdown-bg-hover:     #f5f5f5;
    --rtb-dropdown-text-hover:   #242424;

    /* Buttons */
    --rtb-btn-text:              #242424;
    --rtb-btn-bg:                transparent;
    --rtb-btn-bg-hover:          #e8e8e8;
    --rtb-btn-bg-selected:       #dcdcdc;
    --rtb-btn-border-style:      none;
    --rtb-btn-border-radius:     4px;

    /* Content area */
    --rtb-content-text:          #242424;
    --rtb-content-size:          1rem;
    --rtb-content-font:          Arial, Helvetica, Verdana, sans-serif;
    --rtb-content-bg:            #ffffff;

    /* Editor container */
    --rtb-editor-border-style:   solid;
    --rtb-editor-border-width:   1px;
    --rtb-editor-border-color:   #d1d1d1;
    --rtb-editor-border-radius:  4px;
    --rtb-editor-shadow:         0 2px 4px rgba(0, 0, 0, 0.06);

    /* Scrollbars */
    --rtb-scroll-width:          6px;
    --rtb-scroll-thumb-bg:       #c2c2c2;
    --rtb-scroll-thumb-bg-hover: #8a8a8a;
    --rtb-scroll-thumb-radius:   3px;

    /* Modals & dialogs */
    --rtb-modal-bg:              #ffffff;
    --rtb-modal-text:            #242424;
    --rtb-modal-text-size:       1rem;
    --rtb-modal-text-font:       Arial, Helvetica, Verdana, sans-serif;
    --rtb-modal-input-bg:        #ffffff;
    --rtb-modal-input-text:      #242424;
    --rtb-modal-input-border:    #d1d1d1;
    --rtb-modal-checkbox:        #0078d4;

    /* Blockquote */
    --rtb-quote-bg:              #f0f7ff;
    --rtb-quote-border-color:    #0078d4;
    --rtb-quote-border-width:    4px;

    /* Code blocks */
    --rtb-code-bg:               #f5f5f5;
    --rtb-code-border-radius:    4px;
}
```

```html
<rt-native class="fluent" id="editor" height="400px"></rt-native>
```

**Fluent 2 Dark**

```css
rt-native.fluent-dark {
    /* Typography */
    --rtb-btn-font:              Arial, Helvetica, Verdana, sans-serif;
    --rtb-btn-size:              16px;

    /* Toolbar */
    --rtb-toolbar-bg:            #292929;
    --rtb-toolbar-border-style:  solid;
    --rtb-toolbar-border-width:  1px;
    --rtb-toolbar-border-color:  #424242;
    --rtb-dropdown-bg:           #292929;
    --rtb-dropdown-text:         #ffffff;
    --rtb-dropdown-bg-hover:     #2e2e2e;
    --rtb-dropdown-text-hover:   #ffffff;

    /* Buttons */
    --rtb-btn-text:              #ffffff;
    --rtb-btn-bg:                transparent;
    --rtb-btn-bg-hover:          #404040;
    --rtb-btn-bg-selected:       #4e4e4e;
    --rtb-btn-border-style:      none;
    --rtb-btn-border-radius:     4px;

    /* Content area */
    --rtb-content-text:          #ffffff;
    --rtb-content-size:          1rem;
    --rtb-content-font:          Arial, Helvetica, Verdana, sans-serif;
    --rtb-content-bg:            #1f1f1f;

    /* Editor container */
    --rtb-editor-border-style:   solid;
    --rtb-editor-border-width:   1px;
    --rtb-editor-border-color:   #424242;
    --rtb-editor-border-radius:  4px;
    --rtb-editor-shadow:         0 2px 8px rgba(0, 0, 0, 0.32);

    /* Scrollbars */
    --rtb-scroll-width:          6px;
    --rtb-scroll-thumb-bg:       #5c5c5c;
    --rtb-scroll-thumb-bg-hover: #8a8a8a;
    --rtb-scroll-thumb-radius:   3px;

    /* Modals & dialogs */
    --rtb-modal-bg:              #2e2e2e;
    --rtb-modal-text:            #ffffff;
    --rtb-modal-text-size:       1rem;
    --rtb-modal-text-font:       Arial, Helvetica, Verdana, sans-serif;
    --rtb-modal-input-bg:        #1f1f1f;
    --rtb-modal-input-text:      #ffffff;
    --rtb-modal-input-border:    #424242;
    --rtb-modal-checkbox:        #479ef5;

    /* Blockquote */
    --rtb-quote-bg:              #00244a;
    --rtb-quote-border-color:    #479ef5;
    --rtb-quote-border-width:    4px;

    /* Code blocks */
    --rtb-code-bg:               #141414;
    --rtb-code-border-radius:    4px;
}
```

```html
<rt-native class="fluent-dark" id="editor" height="400px"></rt-native>
```

---

## Preview Window Styling

When you load preview CSS with **setPreviewCssFiles()** or **setPreviewCss()**, the component applies the styles to the Preview window. Content is rendered inside an iframe srcdoc with a completely isolated browsing context. The preview shows exactly what a reader would see in production with a clean browser baseline.

```js
editor.setPreviewCssFiles('my-content.css');
```

---

## Toolbar Buttons

Buttons appear left-to-right in the order listed. Dividers separate logical groups.

| Button | Action | Shortcut |
| --- | --- | --- |
| Font | Set font family | — |
| Size | Set font size | Ctrl+Shift+< / Ctrl+Shift+> |
| Format | Apply block format (paragraph, headings 1–6) | Ctrl+Shift+D / Ctrl+Shift+1–6 |
| Bold | Bold | Ctrl+B |
| Italic | Italic | Ctrl+I |
| Underline | Underline | Ctrl+U |
| Strikethrough | Strikethrough | Ctrl+D |
| Subscript | Subscript | Ctrl+= |
| Superscript | Superscript | Ctrl+Shift++ |
| Text Color | Open text color picker | Ctrl+Shift+C |
| Background Color | Open text background color picker | Ctrl+Shift+B |
| Remove Color | Strip text and background color | — |
| Align Left | Left-align | Ctrl+L |
| Align Center | Center-align | Ctrl+E |
| Align Right | Right-align | Ctrl+R |
| Justify | Justify | Ctrl+J |
| Cut | Cut selection | Ctrl+X |
| Copy | Copy selection | Ctrl+C |
| Paste | Paste from clipboard | Ctrl+V |
| Delete | Delete selection | Delete |
| Select All | Select all content | Ctrl+A |
| Ordered List | Insert numbered list | Ctrl+Shift+O |
| Unordered List | Insert bulleted list | Ctrl+Shift+U |
| Increase Indent | Indent / promote list item | Tab |
| Decrease Indent | Outdent / demote list item | Shift+Tab |
| Insert Link | Open link dialog | Ctrl+Shift+K |
| Remove Link | Remove hyperlink | — |
| Insert Image | Open image URL dialog | Ctrl+Shift+I |
| Upload Image | Open image upload / embed dialog | Ctrl+Shift+& |
| Block Quote | Open block quote dialog | Ctrl+Shift+Q |
| Embed Media | Open media embed dialog (audio, PDF, iframe) | Ctrl+Shift+M |
| Video | Open video embed dialog | Ctrl+Shift+V |
| Insert Table | Open table dialog | Ctrl+Shift+L |
| Code Block | Open code block dialog | Ctrl+Shift+\* |
| Horizontal Rule | Insert \\<hr> at cursor position | Ctrl+Shift+H |
| Undo | Undo last action | Ctrl+Z |
| Redo | Redo last action | Ctrl+Y |
| Toggle Status Bar | Show / hide the word and character count bar | Ctrl+\\ |
| Save HTML | Download editor content as an .html file | Ctrl+Shift+S |
| HTML Source | Toggle raw HTML source view | Ctrl+Shift+A |
| Preview | Open preview dialog | Ctrl+Shift+P |

---

## Keyboard Shortcuts

All shortcuts are active when the editor content area has focus. The Ctrl+\\ and Ctrl+Shift+A/P/S shortcuts also work when the HTML source textarea has focus.

| Category | Action | Shortcut |
| --- | --- | --- |
| **Formatting** | Bold | Ctrl+B |
|  | Italic | Ctrl+I |
|  | Underline | Ctrl+U |
|  | Strikethrough | Ctrl+D |
|  | Subscript | Ctrl+= |
|  | Superscript | Ctrl+Shift++ |
| **Color** | Text color | Ctrl+Shift+C |
|  | Text background color | Ctrl+Shift+B |
| **Alignment** | Align left | Ctrl+L |
|  | Align center | Ctrl+E |
|  | Align right | Ctrl+R |
|  | Justify | Ctrl+J |
| **Editing** | Cut | Ctrl+X |
|  | Copy | Ctrl+C |
|  | Paste | Ctrl+V |
|  | Select all | Ctrl+A |
|  | Undo | Ctrl+Z |
|  | Redo | Ctrl+Y |
| **Lists** | Ordered list | Ctrl+Shift+O |
|  | Unordered list | Ctrl+Shift+U |
|  | Increase indent | Tab |
|  | Decrease indent | Shift+Tab |
| **Insert** | Insert link | Ctrl+Shift+K |
|  | Insert image | Ctrl+Shift+I |
|  | Upload image | Ctrl+Shift+& |
|  | Block quote | Ctrl+Shift+Q |
|  | Video | Ctrl+Shift+V |
|  | Embed media | Ctrl+Shift+M |
|  | Insert table | Ctrl+Shift+L |
|  | Code block | Ctrl+Shift+\* |
|  | Horizontal rule | Ctrl+Shift+H |
| **Format** | Paragraph | Ctrl+Shift+D |
|  | Heading 1–6 | Ctrl+Shift+1 – Ctrl+Shift+6 |
|  | Increase font size | Ctrl+Shift+> |
|  | Decrease font size | Ctrl+Shift+< |
| **View** | Toggle status bar | Ctrl+\\ |
|  | Toggle HTML source | Ctrl+Shift+A |
|  | Preview | Ctrl+Shift+P |
|  | Save HTML | Ctrl+Shift+S |

---

## Accessibility

**rt-native** is built with WCAG 2.1 AA compliance in mind:

- **Editor region** — The content area carries role="textbox", aria-multiline="true", and an aria-label (defaults to "Rich text editor"; override with the **aria-label** or **label** attribute on the host element).
- **Read-only state** — aria-readonly is kept in sync with the **readonly** attribute and **setReadOnly()**.
- **Toolbar** — The toolbar container has role="toolbar" and aria-label="Formatting toolbar". Every button has an aria-label derived from its tooltip text (e.g. "Bold (Ctrl+B)") and an aria-pressed attribute that is kept in sync with the button's active/selected state.
- **Status bar** — Carries role="status", aria-live="polite", and aria-atomic="true" so word and character count updates are announced non-intrusively by screen readers.
- **Dialogs** — Every dialog has aria-modal="true" and aria-labelledby pointing to its title element. Close buttons are native button elements with descriptive aria-label text.
- **HTML source textarea** — Has aria-label="HTML source" to distinguish it from the main editor.

---

## Multiple Instances

Each rt-native element is fully isolated. You can place as many on a page as needed — each gets its own unique ID, shadow root, and state.

```html
<rt-native id="editor-1" height="200px"></rt-native>
<rt-native id="editor-2" height="200px" class="dark"></rt-native>
<rt-native id="editor-3" height="200px"></rt-native>

<script src="rt-native.js"></script>
<script>
    document.getElementById('editor-1').configure({
        visibility: { clearAll: true, bold: true, italic: true }
    });
    document.getElementById('editor-2').setPreviewCssFiles('/styles/content.css');
</script>
```

---

## Browser Support

Requires browsers with native support for:

- [Custom Elements v1](https://caniuse.com/custom-elementsv1)
- [Shadow DOM v1](https://caniuse.com/shadowdomv1)
- [dialog element](https://caniuse.com/dialog)
- [CSS Custom Properties](https://caniuse.com/css-variables)
- [fetch()](https://caniuse.com/fetch) *(required for **setPreviewCssFiles()** / **setPreviewCssFile()**)*

All modern browsers (Chrome 67+, Firefox 63+, Safari 12.1+, Edge 79+) are supported. Internet Explorer is not supported.