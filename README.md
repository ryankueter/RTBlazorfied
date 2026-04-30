# RTBlazorfied — Blazor Rich Text Editor Component

**Author:** Ryan Kueter  
**Updated:** April, 2026

RT Blazorfied HTML Editor is a free .NET Blazor component that provides accessibility features and a wide variety of elements and customizations that make it one of the most robust and flexible HTML editors available. It allows the programmer to apply custom .css files to the preview window, so see how the content will be displayed in production. The editor uses embedded .svg Google Font Icons and the shadow DOM to isolate the HTML from inheriting the existing page styles. While this component is a wrapper for `rt-native.js` HTML editor native web component available on NPM, no additional setup beyond the steps below are required. 

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Styling with CSS Variables](#styling-with-css-variables)
   - [Theming with CSS Classes](#theming-with-css-classes)
4. [Parameters](#parameters)
5. [Two-Way Binding](#two-way-binding)
6. [Component Reference (`@ref`)](#component-reference-ref)
7. [Options — Button Visibility](#options--button-visibility)
8. [ButtonVisibility Reference](#buttonvisibility-reference)
9. [Preview Window Styling](#preview-window-styling)
10. [Read-Only Mode](#read-only-mode)
11. [Toolbar Buttons](#toolbar-buttons)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
13. [Accessibility](#accessibility)
14. [Multiple Instances](#multiple-instances)
15. [Browser Support](#browser-support)

---

## Installation

### 1. Install the NuGet package

**Package Manager Console**
```powershell
Install-Package RTBlazorfied
```

**.NET CLI**
```bash
dotnet add package RTBlazorfied
```

> NuGet: [https://www.nuget.org/packages/RTBlazorfied](https://www.nuget.org/packages/RTBlazorfied)

### 2. Add the script tag

In your `wwwroot/index.html` (Blazor WebAssembly) or `Pages/_Layout.cshtml` / `App.razor` (Blazor Server), add the script **before** the closing `</body>` tag:

```html
<script src="_content/RTBlazorfied/js/RTBlazorfied.js"></script>
```

### 3. Add the using statement

In your `_Imports.razor`:

```razor
@using RichTextBlazorfied
```

That's it — no additional CSS or JS imports are needed.

---

## Quick Start

```razor
@page "/editor"

<RTBlazorfied @bind-Value="@_html" Height="400px" />

<p>Character count: @_html.Length</p>

@code {
    private string _html = "<p>Hello <strong>world</strong></p>";
}
```

---

## Styling with CSS Variables

All visual aspects of the editor are controlled through CSS custom properties on the `rt-native` host element. The defaults are injected as an `rt-native { }` rule in the document `<head>`, so any rule that targets `rt-native` with **equal or greater specificity** will override them.

```css
/* Theme all editors on the page (same specificity as defaults —
   wins when declared after the component script tag) */
rt-native {
    --rtb-toolbar-bg:   #f5f5f5;
    --rtb-content-bg:   #fafafa;
    --rtb-content-size: 16px;
}

/* Reliably override with higher specificity — wrapper class + element selector */
.my-editor rt-native {
    --rtb-content-bg:   #1e1e1e;
    --rtb-content-text: #ddd;
}

/* Dark theme via media query */
@media (prefers-color-scheme: dark) {
    rt-native {
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
}
```

> **Note:** Setting variables on `:root` or `body` will **not** work — CSS custom properties are inherited top-down in the DOM, but the component's injected defaults are set directly on `rt-native`, which has higher priority than inherited values. Target `rt-native` directly, or use a descendant-combinator rule that ends with `rt-native` (e.g. `.my-wrapper rt-native { }`).

### Theming with CSS Classes

The `Class` parameter passes one or more CSS class names directly to the `rt-native` host element. This is the cleanest way to apply per-instance themes in Blazor:

```razor
<RTBlazorfied @bind-Value="@_html" Class="editor-dark" />
```

Define the theme in your stylesheet using `rt-native.editor-dark` (element + class — higher specificity than the injected `rt-native {}` defaults):

```css
/* app.css or site.css */
rt-native.editor-dark {
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

Multiple classes are supported — separate them with a space: `Class="fluent dark"`.

#### Switching themes at runtime

Use `@ref` and `SetClassAsync` to swap the theme dynamically:

```razor
<RTBlazorfied @ref="_editor" @bind-Value="@_html" Class="@_theme" />

<button @onclick='() => _editor.SetClassAsync("fluent")'>Light</button>
<button @onclick='() => _editor.SetClassAsync("fluent-dark")'>Dark</button>
<button @onclick='() => _editor.SetClassAsync(string.Empty)'>Default</button>

@code {
    private RTBlazorfied _editor = default!;
    private string _html = string.Empty;
    private string _theme = "fluent";
}
```

> **Tip:** `SetClassAsync` completely replaces the element's class list, so you do not need to track which class was set previously.

### Fluent 2 Themes

Complete ready-to-use implementations of Microsoft's [Fluent 2 Design System](https://fluent2.microsoft.design/). Copy the CSS block into your `app.css` or `site.css`, then wrap your `<RTBlazorfied>` component in the matching `<div>`.

**Fluent 2 Light**

```razor
<RTBlazorfied @bind-Value="@_html" Class="fluent" />
```

```css
/* app.css or site.css */
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

**Fluent 2 Dark**

```razor
<RTBlazorfied @bind-Value="@_html" Class="fluent-dark" />
```

```css
/* app.css or site.css */
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

### Toolbar

| Variable | Default | Description |
|---|---|---|
| `--rtb-toolbar-bg` | `#ffffff` | Toolbar background color |
| `--rtb-toolbar-border-style` | `solid` | Toolbar bottom border style |
| `--rtb-toolbar-border-width` | `1px` | Toolbar bottom border width |
| `--rtb-toolbar-border-color` | `#d1d1d1` | Toolbar bottom border color |
| `--rtb-toolbar-border-radius` | `0px` | Toolbar corner radius |
| `--rtb-dropdown-bg` | `#ffffff` | Font / Size / Format dropdown background |
| `--rtb-dropdown-text` | `#242424` | Dropdown item text color |
| `--rtb-dropdown-bg-hover` | `#f5f5f5` | Dropdown item hover background |
| `--rtb-dropdown-text-hover` | `#242424` | Dropdown item hover text color |

### Buttons

| Variable | Default | Description |
|---|---|---|
| `--rtb-btn-text` | `#242424` | Button icon color |
| `--rtb-btn-size` | `16px` | Icon size (also drives button height and divider height) |
| `--rtb-btn-font` | `"Segoe UI Variable", sans-serif` | Font for dropdown buttons |
| `--rtb-btn-bg` | `transparent` | Button background at rest |
| `--rtb-btn-bg-hover` | `#e8e8e8` | Button background on hover |
| `--rtb-btn-bg-selected` | `#dcdcdc` | Button background when active / selected |
| `--rtb-btn-border-style` | `none` | Button border style |
| `--rtb-btn-border-width` | `0px` | Button border width |
| `--rtb-btn-border-color` | `#d1d1d1` | Button border color at rest |
| `--rtb-btn-border-hover` | `inherit` | Button border color on hover |
| `--rtb-btn-border-selected` | `inherit` | Button border color when selected |
| `--rtb-btn-border-radius` | `4px` | Button corner radius |

### Content Area

| Variable | Default | Description |
|---|---|---|
| `--rtb-content-text` | `#242424` | Editor text color |
| `--rtb-content-size` | `14px` | Editor font size |
| `--rtb-content-font` | `"Segoe UI Variable", sans-serif` | Editor font family |
| `--rtb-content-bg` | `#ffffff` | Editor content background |
| `--rtb-content-shadow` | `none` | Inner box shadow on the content area |
| `--rtb-placeholder-color` | `#9ca3af` | Placeholder text color |

### Editor Container

| Variable | Default | Description |
|---|---|---|
| `--rtb-editor-border-style` | `solid` | Outer border style |
| `--rtb-editor-border-width` | `1px` | Outer border width |
| `--rtb-editor-border-color` | `#d1d1d1` | Outer border color |
| `--rtb-editor-border-radius` | `4px` | Outer corner radius |
| `--rtb-editor-shadow` | `0 2px 4px rgba(0,0,0,0.06)` | Outer box shadow |
| `--rtb-editor-resize` | `auto` | `auto` shows the resize handle; `hidden` removes it |
| `--rtb-z-index` | `1` | Z-index of the editor container — raise this to stack the editor above surrounding page content |

### Scrollbars

| Variable | Default | Description |
|---|---|---|
| `--rtb-scroll-width` | `6px` | Scrollbar track width |
| `--rtb-scroll-opacity` | `1` | Scrollbar opacity |
| `--rtb-scroll-bg` | `transparent` | Scrollbar track background |
| `--rtb-scroll-thumb-bg` | `#c2c2c2` | Scrollbar thumb color |
| `--rtb-scroll-thumb-bg-hover` | `#8a8a8a` | Scrollbar thumb color on hover |
| `--rtb-scroll-thumb-radius` | `3px` | Scrollbar thumb corner radius |

### Blockquotes

| Variable | Default | Description |
|---|---|---|
| `--rtb-quote-bg` | `#f0f7ff` | Blockquote background color |
| `--rtb-quote-border-color` | `#0078d4` | Blockquote left-border color |
| `--rtb-quote-border-width` | `4px` | Blockquote left-border width |

### Code Blocks

| Variable | Default | Description |
|---|---|---|
| `--rtb-code-bg` | `#f5f5f5` | Code block background color |
| `--rtb-code-border-radius` | `4px` | Code block corner radius |

### Modals & Dialogs

| Variable | Default | Description |
|---|---|---|
| `--rtb-modal-bg` | `#ffffff` | Dialog background color |
| `--rtb-modal-text` | `#242424` | Dialog text color |
| `--rtb-modal-text-size` | `14px` | Dialog font size |
| `--rtb-modal-text-font` | `"Segoe UI Variable", sans-serif` | Dialog font family |
| `--rtb-modal-input-bg` | `#ffffff` | Input field background |
| `--rtb-modal-input-text` | `#242424` | Input field text color |
| `--rtb-modal-input-border` | `#d1d1d1` | Input field border color |
| `--rtb-modal-checkbox` | `#0078d4` | Checkbox accent color |

---

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `Value` | `string?` | `null` | HTML content of the editor. Use `@bind-Value` for two-way binding. |
| `ValueChanged` | `EventCallback<string>` | — | Raised whenever the editor content changes. Wired automatically by `@bind-Value`. |
| `Class` | `string?` | `null` | One or more CSS class names applied to the host element for theming. E.g. `Class="fluent"` or `Class="fluent dark"`. |
| `Height` | `string` | `"300px"` | Editor height. Any valid CSS length (`px`, `vh`, etc.). |
| `Width` | `string` | `"100%"` | Editor width. Any valid CSS length. |
| `Placeholder` | `string?` | `null` | Placeholder text shown when the editor is empty. |
| `ReadOnly` | `bool` | `false` | Puts the editor in read-only mode. Hides the toolbar. |
| `AriaLabel` | `string?` | `null` | Accessible name for the editor region. Defaults to `"Rich text editor"`. |
| `Options` | `Action<IRTBlazorfiedOptions>?` | `null` | Controls toolbar button visibility. |

---

## Two-Way Binding

Use standard Blazor `@bind-Value` syntax to keep your C# model in sync with the editor:

```razor
<RTBlazorfied @bind-Value="@_html" Height="500px" />

@code {
    private string _html = string.Empty;
}
```

The component raises `ValueChanged` each time the user changes the content. If you update `_html` from code, the component automatically pushes the new content into the editor.

---

## Component Reference (`@ref`)

Use `@ref` to access the component's public methods at runtime:

```razor
<RTBlazorfied @ref="_editor" @bind-Value="@_html" Height="400px" />

<button @onclick="Clear">Clear</button>
<button @onclick="MakeReadOnly">Lock</button>

@code {
    private RTBlazorfied _editor = default!;
    private string _html = string.Empty;

    private Task Clear()
    {
        _html = string.Empty;
        return Task.CompletedTask;
    }

    private async Task MakeReadOnly()
    {
        await _editor.SetReadOnlyAsync(true);
    }
}
```

### Public Methods

| Method | Returns | Description |
|---|---|---|
| `GetValueAsync()` | `Task<string>` | Returns the current editor HTML. |
| `GetPlainTextAsync()` | `Task<string>` | Returns the editor content with all HTML tags stripped. |
| `SetReadOnlyAsync(bool on)` | `Task` | Enables (`true`) or disables (`false`) read-only mode at runtime. |
| `SetClassAsync(string? cssClass)` | `Task` | Replaces the CSS class(es) on the host element — use for runtime theme switching. Pass `null` or `""` to clear. |
| `SetPreviewCssFilesAsync(params string[] urls)` | `Task` | Loads CSS files into the preview window only. |
| `SetPreviewCssAsync(string css)` | `Task` | Applies inline CSS to the preview window only. |
| `ConfigureAsync(Action<IRTBlazorfiedOptions>)` | `Task` | Reapplies button visibility on an already-rendered editor. |

---

## Options — Button Visibility

The `Options` parameter accepts a fluent delegate that controls which toolbar buttons are rendered. Visual styling (colors, fonts, borders, sizes) is handled through CSS variables — see [Styling with CSS Variables](#styling-with-css-variables).

All buttons are **visible by default** except the word/character count status bar (`WordCount`), which is hidden by default and can be toggled by the user with the Toggle Status Bar button.

Call `ClearAll()` first to hide every button, then opt individual buttons back in:

```razor
<RTBlazorfied @bind-Value="@_html" Height="500px" Options="@GetOptions()" />

@code {
    private string _html = string.Empty;

    private Action<IRTBlazorfiedOptions> GetOptions() => options =>
        options.ButtonVisibility(v => v
            .ClearAll()
            .Bold().Italic().Underline()
            .FormatDivider()
            .AlignLeft().AlignCenter().AlignRight()
            .AlignDivider()
            .Undo().Redo()
            .HistoryDivider()
            .HtmlView().Preview());
}
```

To hide only specific buttons while keeping everything else visible, omit `ClearAll()`:

```razor
<RTBlazorfied @bind-Value="@_html" Height="500px" Options="@GetOptions()" />

@code {
    private string _html = string.Empty;

    private Action<IRTBlazorfiedOptions> GetOptions() => options =>
        options.ButtonVisibility(v => v
            .EmbedMedia(false)
            .ImageUpload(false)
            .Table(false));
}
```

To show the word/character count status bar on load:

```razor
<RTBlazorfied @bind-Value="@_html" Height="500px" Options="@GetOptions()" />

@code {
    private string _html = string.Empty;

    private Action<IRTBlazorfiedOptions> GetOptions() => options =>
        options.ButtonVisibility(v => v.WordCount());
}
```

### Changing visibility at runtime

Use `ConfigureAsync` via a `@ref` to reconfigure an already-rendered editor:

```razor
<RTBlazorfied @ref="_editor" @bind-Value="@_html" Height="500px" />

@code {
    private RTBlazorfied _editor = default!;
    private string _html = string.Empty;

    private async Task HideMediaButtons()
    {
        await _editor.ConfigureAsync(options =>
            options.ButtonVisibility(v => v
                .EmbedMedia(false)
                .ImageUpload(false)
                .Table(false)));
    }
}
```

---

## ButtonVisibility Reference

| Method | Controls |
|---|---|
| `ClearAll()` | Sets all buttons to hidden before individual overrides are applied |
| `Font()` | Font family dropdown |
| `Size()` | Font size dropdown |
| `Format()` | Paragraph / heading format dropdown |
| `TextStylesDivider()` | Divider after the three dropdowns |
| `Bold()` | Bold button |
| `Italic()` | Italic button |
| `Underline()` | Underline button |
| `Strikethrough()` | Strikethrough button |
| `Subscript()` | Subscript button |
| `Superscript()` | Superscript button |
| `FormatDivider()` | Divider after text-format buttons |
| `TextColor()` | Text color, background color, and remove-color buttons |
| `TextColorDivider()` | Divider after color buttons |
| `AlignLeft()` | Align left button |
| `AlignCenter()` | Align center button |
| `AlignRight()` | Align right button |
| `AlignJustify()` | Justify button |
| `AlignDivider()` | Divider after alignment buttons |
| `Copy()` | Copy button |
| `Cut()` | Cut button |
| `Paste()` | Paste button |
| `Delete()` | Delete button |
| `SelectAll()` | Select all button |
| `ActionDivider()` | Divider after clipboard buttons |
| `OrderedList()` | Ordered list button |
| `UnorderedList()` | Unordered list button |
| `Indent()` | Increase / decrease indent buttons |
| `ListDivider()` | Divider after list buttons |
| `Link()` | Insert link and remove link buttons |
| `Image()` | Insert image button |
| `ImageUpload()` | Upload / embed image button |
| `Quote()` | Block quote button |
| `CodeBlock()` | Code block button |
| `EmbedMedia()` | Embed media (audio / PDF / iframe) button |
| `Video()` | Video embed button |
| `Table()` | Insert table button |
| `HorizontalRule()` | Insert horizontal rule button |
| `MediaDivider()` | Divider after insert buttons |
| `Undo()` | Undo button |
| `Redo()` | Redo button |
| `HistoryDivider()` | Divider after undo / redo |
| `StatusBarToggle()` | Toggle Status Bar button |
| `SaveHtml()` | Save HTML file button |
| `HtmlView()` | Toggle HTML source view button |
| `Preview()` | Preview button |
| `WordCount()` | Word / character count status bar (hidden by default) |

> **Divider auto-hiding:** A divider is only rendered when at least one button in its group is visible *and* its own method returns `true`.

> **Default parameter:** Every method except `ClearAll()` accepts an optional `bool` (default `true`), so `.Bold()` and `.Bold(true)` are equivalent. Pass `false` to explicitly hide a button without calling `ClearAll()` first.

---

## Preview Window Styling

Load CSS files or inline CSS to style the **preview dialog only**. The editing area is not affected — styles are applied exclusively to the preview window's iframe so what you see in the preview matches your production page.

### Load files via @ref

```razor
<RTBlazorfied @ref="_editor" @bind-Value="@_html" Height="500px" />

@code {
    private RTBlazorfied _editor = default!;
    private string _html = string.Empty;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;
        await _editor.SetPreviewCssFilesAsync(
            "css/preview1.css",
            "css/preview2.css");
    }
}
```

### Inline CSS via @ref

```csharp
await _editor.SetPreviewCssAsync(@"
    h1, h2, h3 { color: #0a2540; }
    blockquote {
        border-left: 4px solid #635bff;
        background: #f8f6ff;
    }
");

// Clear
await _editor.SetPreviewCssAsync(string.Empty);
```

`SetPreviewCssAsync` and `SetPreviewCssFilesAsync` are independent — both can be active simultaneously. File rules are applied first; inline rules are appended after and take precedence on any conflict.

Pass any CSS file paths served by your application. Files in your project's `wwwroot/css/` folder are accessible at `"css/filename.css"`.

---

## Read-Only Mode

Set `ReadOnly="true"` on the component to disable editing on load:

```razor
<RTBlazorfied @bind-Value="@_html" ReadOnly="true" Height="300px" />
```

Toggle at runtime with `@ref`:

```razor
<RTBlazorfied @ref="_editor" @bind-Value="@_html" Height="400px" />
<button @onclick="() => _editor.SetReadOnlyAsync(true)">Lock</button>
<button @onclick="() => _editor.SetReadOnlyAsync(false)">Unlock</button>
```

When read-only, the toolbar is hidden and the content area cannot be edited. The `aria-readonly` attribute is kept in sync for screen readers.

---

## Toolbar Buttons

Buttons appear left-to-right in the order listed. Dividers separate logical groups.

| Button | Action | Shortcut |
|---|---|---|
| Font | Set font family | — |
| Size | Set font size | `Ctrl+Shift+<` / `Ctrl+Shift+>` |
| Format | Apply block format (paragraph, headings 1–6) | `Ctrl+Shift+D` / `Ctrl+Shift+1`–`6` |
| Bold | Bold | `Ctrl+B` |
| Italic | Italic | `Ctrl+I` |
| Underline | Underline | `Ctrl+U` |
| Strikethrough | Strikethrough | `Ctrl+D` |
| Subscript | Subscript | `Ctrl+=` |
| Superscript | Superscript | `Ctrl+Shift++` |
| Text Color | Open text color picker | `Ctrl+Shift+C` |
| Background Color | Open text background color picker | `Ctrl+Shift+B` |
| Remove Color | Strip text and background color | — |
| Align Left | Left-align | `Ctrl+L` |
| Align Center | Center-align | `Ctrl+E` |
| Align Right | Right-align | `Ctrl+R` |
| Justify | Justify | `Ctrl+J` |
| Cut | Cut selection | `Ctrl+X` |
| Copy | Copy selection | `Ctrl+C` |
| Paste | Paste from clipboard | `Ctrl+V` |
| Delete | Delete selection | `Delete` |
| Select All | Select all content | `Ctrl+A` |
| Ordered List | Insert numbered list | `Ctrl+Shift+O` |
| Unordered List | Insert bulleted list | `Ctrl+Shift+U` |
| Increase Indent | Indent / promote list item | `Tab` |
| Decrease Indent | Outdent / demote list item | `Shift+Tab` |
| Insert Link | Open link dialog | `Ctrl+Shift+K` |
| Remove Link | Remove hyperlink | — |
| Insert Image | Open image URL dialog | `Ctrl+Shift+I` |
| Upload Image | Open image upload / embed dialog | `Ctrl+Shift+&` |
| Block Quote | Open block quote dialog | `Ctrl+Shift+Q` |
| Embed Media | Open media embed dialog (audio, PDF, iframe) | `Ctrl+Shift+M` |
| Video | Open video embed dialog | `Ctrl+Shift+V` |
| Insert Table | Open table dialog | `Ctrl+Shift+L` |
| Code Block | Open code block dialog | `Ctrl+Shift+*` |
| Horizontal Rule | Insert `<hr>` at cursor position | `Ctrl+Shift+H` |
| Undo | Undo last action | `Ctrl+Z` |
| Redo | Redo last action | `Ctrl+Y` |
| Toggle Status Bar | Show / hide the word and character count bar | `Ctrl+\` |
| Save HTML | Download editor content as an `.html` file | `Ctrl+Shift+S` |
| HTML Source | Toggle raw HTML source view | `Ctrl+Shift+A` |
| Preview | Open preview dialog | `Ctrl+Shift+P` |

---

## Keyboard Shortcuts

All shortcuts are active when the editor content area has focus.

| Category | Action | Shortcut |
|---|---|---|
| **Formatting** | Bold | `Ctrl+B` |
| | Italic | `Ctrl+I` |
| | Underline | `Ctrl+U` |
| | Strikethrough | `Ctrl+D` |
| | Subscript | `Ctrl+=` |
| | Superscript | `Ctrl+Shift++` |
| **Color** | Text color | `Ctrl+Shift+C` |
| | Text background color | `Ctrl+Shift+B` |
| **Alignment** | Align left | `Ctrl+L` |
| | Align center | `Ctrl+E` |
| | Align right | `Ctrl+R` |
| | Justify | `Ctrl+J` |
| **Editing** | Cut | `Ctrl+X` |
| | Copy | `Ctrl+C` |
| | Paste | `Ctrl+V` |
| | Select all | `Ctrl+A` |
| | Undo | `Ctrl+Z` |
| | Redo | `Ctrl+Y` |
| **Lists** | Ordered list | `Ctrl+Shift+O` |
| | Unordered list | `Ctrl+Shift+U` |
| | Increase indent | `Tab` |
| | Decrease indent | `Shift+Tab` |
| **Insert** | Insert link | `Ctrl+Shift+K` |
| | Insert image | `Ctrl+Shift+I` |
| | Upload image | `Ctrl+Shift+&` |
| | Block quote | `Ctrl+Shift+Q` |
| | Video | `Ctrl+Shift+V` |
| | Embed media | `Ctrl+Shift+M` |
| | Insert table | `Ctrl+Shift+L` |
| | Code block | `Ctrl+Shift+*` |
| | Horizontal rule | `Ctrl+Shift+H` |
| **Format** | Paragraph | `Ctrl+Shift+D` |
| | Heading 1–6 | `Ctrl+Shift+1` – `Ctrl+Shift+6` |
| | Increase font size | `Ctrl+Shift+>` |
| | Decrease font size | `Ctrl+Shift+<` |
| **View** | Toggle status bar | `Ctrl+\` |
| | Toggle HTML source | `Ctrl+Shift+A` |
| | Preview | `Ctrl+Shift+P` |
| | Save HTML | `Ctrl+Shift+S` |

---

## Accessibility

The underlying `rt-native` web component is built with WCAG 2.1 AA compliance in mind:

- **Editor region** — The content area carries `role="textbox"`, `aria-multiline="true"`, and an `aria-label` (defaults to `"Rich text editor"`; override with the `AriaLabel` parameter).
- **Read-only state** — `aria-readonly` is kept in sync with the `ReadOnly` parameter and `SetReadOnlyAsync()`.
- **Toolbar** — The toolbar has `role="toolbar"` and `aria-label="Formatting toolbar"`. Every button has an `aria-label` and an `aria-pressed` attribute that tracks its active/selected state.
- **Status bar** — Carries `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` so word and character count updates are announced non-intrusively.
- **Dialogs** — Every dialog has `aria-modal="true"` and `aria-labelledby` pointing to its title element. Close buttons are native `<button>` elements with descriptive `aria-label` text.
- **HTML source textarea** — Has `aria-label="HTML source"` to distinguish it from the main editor.

---

## Multiple Instances

Each `<RTBlazorfied>` component is fully isolated. You can place as many on a page as needed — each gets its own editor instance, shadow root, and state.

```razor
<RTBlazorfied @bind-Value="@_body"  Height="400px" />
<RTBlazorfied @bind-Value="@_notes" Height="200px" Options="@NotesOptions()" />

@code {
    private string _body  = string.Empty;
    private string _notes = string.Empty;

    private Action<IRTBlazorfiedOptions> NotesOptions() => o => o
        .ButtonVisibility(v => v
            .ClearAll()
            .Bold().Italic().Underline()
            .Undo().Redo());
}
```

---

## Browser Support

Requires browsers with native Web Component support:

| Browser | Minimum version |
|---|---|
| Chrome | 67+ |
| Firefox | 63+ |
| Safari | 12.1+ |
| Edge | 79+ |

Internet Explorer is not supported.
