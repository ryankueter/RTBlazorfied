using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public partial class RTBlazorfied
{
    [Inject]
    private IJSRuntime js { get; set; } = default!;

    [Parameter]
    public string? Html { get; set; }

    private string GetStyles() =>
        $$"""
        .rich-text-box-tool-bar {
            background-color: {{_toolbarBackgroundColor}};
            border-style: {{_toolbarBorderStyle}};
            border-width: {{_toolbarBorderWidth}};
            border-color: {{_toolbarBorderColor}};
            border-radius: {{_toolbarBorderRadius}};
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
        }
        .rich-text-box-tool-bar button {
            background-color: {{_buttonBackgroundColor}};
            border-style: {{_buttonBorderStyle}};
            border-width: {{_buttonBorderWidth}};
            border-color: {{_buttonBorderColor}};
            border-radius: {{_buttonBorderRadius}};
            color: {{_buttonTextColor}};
            font-size: {{_buttonTextSize}};
            outline: none;
            cursor: pointer;
            transition: 0.3s;
            margin: 4px 1px;
        }
        .rich-text-box-tool-bar button:hover {
            background-color: {{_buttonBackgroundColorHover}};
            border-color: {{_buttonBorderColorHover}};
        }

        .rich-text-box-tool-bar button.selected {
            background-color: {{_buttonBackgroundColorSelected}};
            border-color: {{_buttonBorderColorSelected}};
        }

        .rich-text-box-tool-bar button.disabled:hover {
            background-color: inherit;
        }

        .rich-text-box-tool-bar button.disabled:selected {
            background-color: inherit;
        }

        .rich-text-box-menu-item {

        }

        .rich-text-box-menu-item-special {

        }

        .rich-text-box-menu-item svg, .rich-text-box-menu-item-special svg {
          display: block;
          height: auto;
          width: auto;
          max-height: 100%;
          max-width: 100%;
        }

        .rich-text-box-container {
            resize: both;
            overflow: hidden;
            border-style: {{_editorBorderStyle}};
            border-width: {{_editorBorderWidth}};
            border-color: {{_editorBorderColor}};
            border-radius: {{_editorBorderRadius}};
            box-shadow: {{_editorBoxShadow}};
            width: {{_editorWidth}};
            height: {{_editorHeight}};
            display: flex;
            flex-direction: column;
        }
        .rich-text-box-content-container {
            width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            flex-direction: row;
            background-color: {{_contentBackgroundColor}};
            box-shadow: {{_contentBoxShadow}};
        }
        .rich-text-box-content {
            padding: 10px;
            width: 100%;
            min-height: 25px;
            color: {{_contentTextColor}};
        }

        [contenteditable="true"] {
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
        .rich-text-box-divider-btn[disabled], .rich-text-box-divider-btn[disabled]:hover, .rich-text-box-divider-btn[disabled]:focus, .rich-text-box-divider-btn[disabled]:active {
            background: unset;
            color: unset;
            cursor: default;
        }
        .rich-text-box-divider {
            min-height: 25px;
            height: {{_buttonTextSize}};
            background-color: {{_buttonTextColor}};
            display: block;
            border-left: .5px solid rgba(255, 255, 255, 0.6);
            opacity: .5;
        }
        .rich-text-box-scroll::-webkit-scrollbar {
            width: {{_scrollWidth}};
            opacity: {{_scrollOpacity}};
        }
        .rich-text-box-scroll::-webkit-scrollbar-track {
            background-color: {{_scrollBackgroundColor}};
        }
        .rich-text-box-scroll::-webkit-scrollbar-thumb {
            background: {{_scrollThumbBackgroundHover}};
            border-radius: {{_scrollThumbBorderRadius}};
        }
        .rich-text-box-scroll::-webkit-scrollbar-thumb:hover {
            background: {{_scrollThumbBackgroundHover}};
        }

        .rich-text-box-dropdown {
          position: relative;
          display: inline-block;
        }

        .rich-text-box-dropdown-content {
          display: none;
          position: absolute;
          background-color: {{_toolbarDropdownBackgroundColor}};
          border-style: {{_buttonBorderStyle}};
          border-width: {{_buttonBorderWidth}};
          border-color: {{_buttonBorderColor}};
          border-radius: 5px;
          max-height: 200px;
          overflow: auto;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
        }

        .rich-text-box-format-button {
          padding: 6px 10px;
          margin: 6px;
        }
        .rich-text-box-format-content {
          min-width: 180px;
        }

        .rich-text-box-font-button {
          padding: 6px 10px;
          margin: 6px;
        }
        .rich-text-box-font-content {
          min-width: 180px;
        }

        .rich-text-box-size-button {
          padding: 6px 10px;
          margin: 6px;
        }
        .rich-text-box-size-content {
          min-width: 80px;
        }

        .rich-text-box-dropdown-content a {
          color: {{_toolbarDropdownTextColor}};
          font-size: 15px;
          padding: 10px 14px;
          text-decoration: none;
          display: block;
        }

        .rich-text-box-dropdown a:hover {
          background-color: {{_toolbarDropdownBackgroundColorHover}};
          color: {{_toolbarDropdownTextColorHover}};
         }

        .rich-text-box-show {display: block;}
        """;

    #region Styles
    // Toolbar
    private string? _toolbarBackgroundColor { get; set; } = "#f1f1f1";
    private string? _toolbarBorderStyle { get; set; } = "none";
    private string? _toolbarBorderWidth { get; set; } = "0px";
    private string? _toolbarBorderColor { get; set; } = "#000000";
    private string? _toolbarBorderRadius { get; set; } = "0px";
    private string? _toolbarDropdownBackgroundColor { get; set; } = "#f1f1f1";
    private string? _toolbarDropdownTextColor { get; set; } = "#000000";
    private string? _toolbarDropdownBackgroundColorHover { get; set; } = "#ddd";
    private string? _toolbarDropdownTextColorHover { get; set; } = "#000000";

    // Buttons
    private string? _buttonTextColor { get; set; } = "#000";
    private string? _buttonTextSize { get; set; } = "16px";
    private string? _buttonBackgroundColor { get; set; } = "inherit";
    private string? _buttonBackgroundColorHover { get; set; } = "#DDD";
    private string? _buttonBackgroundColorSelected { get; set; } = "#CCC";
    private string? _buttonBorderRadius { get; set; } = "5px";
    private string? _buttonBorderStyle { get; set; } = "none";
    private string? _buttonBorderWidth { get; set; } = "0px";
    private string? _buttonBorderColor { get; set; } = "#AAA";
    private string? _buttonBorderColorHover { get; set; } = "inherit";
    private string? _buttonBorderColorSelected { get; set; } = "inherit";
    // Content
    private string? _contentBackgroundColor { get; set; } = "#FFF";
    private string? _contentTextColor { get; set; } = "#000";
    private string? _contentBoxShadow { get; set; } = "none";

    // Editor
    private string? _editorWidth { get; set; } = "100%";
    private string? _editorHeight { get; set; } = "100%";
    private string? _editorBorderRadius { get; set; } = "0px";
    private string? _editorBorderStyle { get; set; } = "solid";
    private string? _editorBorderWidth { get; set; } = "1px";
    private string? _editorBorderColor { get; set; } = "#EEEEEE";
    private string? _editorBoxShadow { get; set; } = "none";

    // Scroll
    private string? _scrollWidth { get; set; } = "12px";
    private string? _scrollOpacity { get; set; } = "1";
    private string? _scrollBackgroundColor { get; set; } = "transparent";
    private string? _scrollThumbBackgroundHover { get; set; } = "#999";
    private string? _scrollThumbBackground { get; set; } = "#d1d1d1";
    private string? _scrollThumbBorderRadius { get; set; } = "0px";
    #endregion

    public async Task<string?> GetPlainTextAsync() =>
        await js.InvokeAsync<string>("RTBlazorfied_Method", "plaintext", content_id);

    public async Task<string?> GetHtmlAsync() =>
        await js.InvokeAsync<string>("RTBlazorfied_Method", "html", content_id);

    private string? Mode { get; set; }
    private bool IsDisabled { get; set; }
    private string? OpenEditorStyles { get; set; }
    private string? OpenCodeStyles { get; set; }
    private bool Editable { get; set; } = true;
    protected override void OnInitialized()
    {
        // Invoke the Options
        if (Options is not null)
        {
            Options(_options!);
        }
        LoadOptions();
        _ = OpenCode();
    }

    [Parameter]
    public Action<IRTBlazorfiedOptions>? Options { get; set; }
    private RichTextboxOptions _options { get; set; } = new();
    
    #region Options
    private void LoadOptions()
    {
        GetToolbarOptions();
        GetButtonOptions();
        GetEditorOptions();
        GetContentOptions();
        GetScrollOptions();
        GetButtons();
    }

    #region ButtonVisibility
    private bool? _font = true;
    private bool? _size = true;
    private bool? _format = true;
    private bool? _textstylesdivider = false;
    private bool? _bold = true;
    private bool? _italic = true;
    private bool? _underline = true;
    private bool? _strikethrough = true;
    private bool? _subscript = true;
    private bool? _superscript = true;
    private bool? _formatdivider = false;
    private bool? _alignleft = true;
    private bool? _aligncenter = true;
    private bool? _alignright = true;
    private bool? _alignjustify = true;
    private bool? _indent = true;
    private bool? _aligndivider = false;
    private bool? _copy = true;
    private bool? _cut = true;
    private bool? _delete = true;
    private bool? _selectall = true;
    private bool? _actiondivider = false;
    private bool? _undo = true;
    private bool? _redo = true;
    private bool? _historydivider = false;
    #endregion
    private void GetButtons()
    {
        var buttons = _options.GetButtonVisibilityOptions();

        if (buttons is null)
        {
            _textstylesdivider = true;
            _formatdivider = true;
            _aligndivider = true;
            _actiondivider = true;
            _historydivider = true;
        }
        else
        {
            if (buttons.Font is not null)
            {
                _font = buttons.Font;
            }
            if (buttons.Size is not null)
            {
                _size = buttons.Size;
            }
            if (buttons.Format is not null)
            {
                _format = buttons.Format;
            }

            if (buttons.Font is null
                || buttons.Font == true
                || buttons.Size is null
                || buttons.Size == true
                || buttons.Format is null
                || buttons.Format == true)
            {
                _textstylesdivider = true;
            }

            if (buttons.Bold is not null)
            {
                _bold = buttons.Bold;
            }
            if (buttons.Italic is not null)
            {
                _italic = buttons.Italic;
            }
            if (buttons.Underline is not null)
            {
                _underline = buttons.Underline;
            }
            if (buttons.Strikethrough is not null)
            {
                _strikethrough = buttons.Strikethrough;
            }
            if (buttons.Subscript is not null)
            {
                _subscript = buttons.Subscript;
            }
            if (buttons.Superscript is not null)
            {
                _superscript = buttons.Superscript;
            }

            // If the user did not specify false, keep the button
            if (buttons.Bold is null 
                || buttons.Bold == true
                || buttons.Italic is null 
                || buttons.Italic == true
                || buttons.Underline is null 
                || buttons.Underline == true
                || buttons.Strikethrough is null 
                || buttons.Strikethrough == true
                || buttons.Subscript is null 
                || buttons.Subscript == true
                || buttons.Superscript is null 
                || buttons.Superscript == true)
            {
                _formatdivider = true;
            }

            if (buttons.Alignleft is not null)
            {
                _alignleft = buttons.Alignleft;
            }
            if (buttons.Aligncenter is not null)
            {
                _aligncenter = buttons.Aligncenter;
            }
            if (buttons.Alignright is not null)
            {
                _alignright = buttons.Alignright;
            }
            if (buttons.Alignjustify is not null)
            {
                _alignjustify = buttons.Alignjustify;
            }
            if (buttons.Indent is not null)
            {
                _indent = buttons.Indent;
            }

            // If the user did not specify false, keep the button
            if (buttons.Alignleft is null 
                || buttons.Alignleft == true
                || buttons.Aligncenter is null 
                || buttons.Aligncenter == true
                || buttons.Alignright is null 
                || buttons.Alignright == true
                || buttons.Alignjustify is null 
                || buttons.Alignjustify == true
                || buttons.Indent is null 
                || buttons.Indent == true)
            {
                _aligndivider = true;
            }

            if (buttons.Copy is not null)
            {
                _copy = buttons.Copy;
            }
            if (buttons.Cut is not null)
            {
                _cut = buttons.Cut;
            }
            if (buttons.Delete is not null)
            {
                _delete = buttons.Delete;
            }
            if (buttons.Selectall is not null)
            {
                _selectall = buttons.Selectall;
            }

            // If the user did not specify false, keep the button
            if (buttons.Copy is null 
                || buttons.Copy == true
                || buttons.Cut is null 
                || buttons.Cut == true
                || buttons.Delete is null 
                || buttons.Delete == true
                || buttons.Selectall is null 
                || buttons.Selectall == true)
            {
                _actiondivider = true;
            }

            if (buttons.Undo is not null)
            {
                _undo = buttons.Undo;
            }
            if (buttons.Redo is not null)
            {
                _redo = buttons.Redo;
            }

            // If the user did not specify false, keep the button
            if (buttons.Undo is null 
                || buttons.Undo == true
                || buttons.Redo is null 
                || buttons.Redo == true)
            {
                _historydivider = true;
            }
        }
    }

    private void GetScrollOptions()
    {
        var scrollOptions = _options.GetScrollOptions();
        if (scrollOptions is not null)
        {
            if (scrollOptions.Width is not null)
            {
                _scrollWidth = scrollOptions.Width;
            }
            if (scrollOptions.Opacity is not null)
            {
                _scrollOpacity = scrollOptions.Opacity;
            }
            if (scrollOptions.BackgroundColor is not null)
            {
                _scrollBackgroundColor = scrollOptions.BackgroundColor;
            }
            if (scrollOptions.ThumbBackgroundHover is not null)
            {
                _scrollThumbBackgroundHover = scrollOptions.ThumbBackgroundHover;
            }
            if (scrollOptions.ThumbBackground is not null)
            {
                _scrollThumbBackground = scrollOptions.ThumbBackground;
            }
            if (scrollOptions.ThumbBorderRadius is not null)
            {
                _scrollThumbBorderRadius = scrollOptions.ThumbBorderRadius;
            }
        }
    }

    private void GetContentOptions()
    {
        var styleOptions = _options.GetContentOptions();
        if (styleOptions is not null)
        {
            if (styleOptions.BackgroundColor is not null)
            {
                _contentBackgroundColor = styleOptions.BackgroundColor;
            }
            if (styleOptions.TextColor is not null)
            {
                _contentTextColor = styleOptions.TextColor;
            }
            if (styleOptions.ContentBoxShadow is not null)
            {
                _contentBoxShadow = styleOptions.ContentBoxShadow;
            }
        }
    }

    private void GetEditorOptions()
    {
        var styleOptions = _options.GetEditorOptions();
        if (styleOptions is not null)
        {
            if (styleOptions.Width is not null)
            {
                _editorWidth = styleOptions.Width;
            }
            if (styleOptions.Height is not null)
            {
                _editorHeight = styleOptions.Height;
            }
            if (styleOptions.BorderRadius is not null)
            {
                _editorBorderRadius = styleOptions.BorderRadius;
            }
            if (styleOptions.BorderStyle is not null)
            {
                _editorBorderStyle = styleOptions.BorderStyle;
            }
            if (styleOptions.BorderWidth is not null)
            {
                _editorBorderWidth = styleOptions.BorderWidth;
            }
            if (styleOptions.BorderColor is not null)
            {
                _editorBorderColor = styleOptions.BorderColor;
            }
            if (styleOptions.BoxShadow is not null)
            {
                _editorBoxShadow = styleOptions.BoxShadow;
            }
        }
    }

    private void GetButtonOptions()
    {
        var buttonOptions = _options.GetButtonOptions();
        if (buttonOptions is not null)
        {
            if (buttonOptions.TextColor is not null)
            {
                _buttonTextColor = buttonOptions.TextColor;
            }
            if (buttonOptions.TextSize is not null)
            {
                _buttonTextSize = buttonOptions.TextSize;
            }
            if (buttonOptions.BackgroundColor is not null)
            {
                _buttonBackgroundColor = buttonOptions.BackgroundColor;
            }
            if (buttonOptions.BackgroundColorHover is not null)
            {
                _buttonBackgroundColorHover = buttonOptions.BackgroundColorHover;
            }
            if (buttonOptions.BackgroundColorSelected is not null)
            {
                _buttonBackgroundColorSelected = buttonOptions.BackgroundColorSelected;
            }
            if (buttonOptions.BorderStyle is not null)
            {
                _buttonBorderStyle = buttonOptions.BorderStyle;
            }
            if (buttonOptions.BorderWidth is not null)
            {
                _buttonBorderWidth = buttonOptions.BorderWidth;
            }
            if (buttonOptions.BorderColor is not null)
            {
                _buttonBorderColor = buttonOptions.BorderColor;
            }
            if (buttonOptions.BorderColorHover is not null)
            {
                _buttonBorderColorHover = buttonOptions.BorderColorHover;
            }
            if (buttonOptions.BorderColorSelected is not null)
            {
                _buttonBorderColorSelected = buttonOptions.BorderColorSelected;
            }
            if (buttonOptions.BorderRadius is not null)
            {
                _buttonBorderRadius = buttonOptions.BorderRadius;
            }
        }
    }

    private void GetToolbarOptions()
    {
        var toolbarOptions = _options.GetToolbarOptions();
        if (toolbarOptions is not null)
        {
            if (toolbarOptions.BackgroundColor is not null)
            {
                _toolbarBackgroundColor = toolbarOptions.BackgroundColor;
            }
            if (toolbarOptions.BorderStyle is not null)
            {
                _toolbarBorderStyle = toolbarOptions.BorderStyle;
            }
            if (toolbarOptions.BorderWidth is not null)
            {
                _toolbarBorderWidth = toolbarOptions.BorderWidth;
            }
            if (toolbarOptions.BorderColor is not null)
            {
                _toolbarBorderColor = toolbarOptions.BorderColor;
            }
            if (toolbarOptions.BorderRadius is not null)
            {
                _toolbarBorderRadius = toolbarOptions.BorderRadius;
            }
            if (toolbarOptions.DropdownBackgroundColor is not null)
            {
                _toolbarDropdownBackgroundColor = toolbarOptions.DropdownBackgroundColor;
            }
            if (toolbarOptions.DropdownTextColor is not null)
            {
                _toolbarDropdownTextColor = toolbarOptions.DropdownTextColor;
            }

            if (toolbarOptions.DropdownBackgroundColorHover is not null)
            {
                _toolbarDropdownBackgroundColorHover = toolbarOptions.DropdownBackgroundColorHover;
            }
            if (toolbarOptions.DropdownTextColorHover is not null)
            {
                _toolbarDropdownTextColorHover = toolbarOptions.DropdownTextColorHover;
            }
        }
    }
    #endregion

    #region Fonts
    private List<string> Fonts { get; set; } = new List<string>
    {
        "None",
        "Arial",
        "Georgia",
        "Helvetica",
        "Monospace",
        "Segoe UI",
        "Tahoma",
        "Times New Roman",
        "Verdana"
    };
    private async Task Font(string fontName) => await js.InvokeVoidAsync("RTBlazorfied_Method", "font", content_id, fontName);
    private List<string> Sizes { get; set; } = new List<string>
    {
        "None",
        "10",
        "13",
        "16",
        "18",
        "24",
        "32",
        "48"
    };
    private async Task Size(string size) => await js.InvokeVoidAsync("RTBlazorfied_Method", "size", content_id, size == "None" ? size : $"{size}px");
    #endregion

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await Initialize();
        }
    }

    #region Element Ids
    private string content_id = Guid.NewGuid().ToString();
    private string shadow_id = Guid.NewGuid().ToString();
    private string toolbar_id = Guid.NewGuid().ToString();
    #endregion
    private async Task Initialize()
    {
        Mode = "html";
        IsDisabled = false;
        OpenEditorStyles = "rich-text-box-menu-item-special selected";
        OpenCodeStyles = "rich-text-box-menu-item-special";

        await js.InvokeVoidAsync("RTBlazorfied_Initialize", content_id, shadow_id, toolbar_id, GetStyles(), Html);
    }

    public async Task Reinitialize() 
    {
        if (Mode == "html")
        {
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadHtml", content_id, Html);
        }
        else
        {
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadInnerText", content_id, Html);
        }
    }

    #region Buttons
    private async Task Bold() => await js.InvokeVoidAsync("RTBlazorfied_Method", "bold", content_id);
    private async Task Italic() => await js.InvokeVoidAsync("RTBlazorfied_Method", "italic", content_id);
    private async Task Underline() => await js.InvokeVoidAsync("RTBlazorfied_Method", "underline", content_id);
    private async Task Strikethrough() => await js.InvokeVoidAsync("RTBlazorfied_Method", "strikethrough", content_id);
    private async Task Subscript() => await js.InvokeVoidAsync("RTBlazorfied_Method", "subscript", content_id);
    private async Task Superscript() => await js.InvokeVoidAsync("RTBlazorfied_Method", "superscript", content_id);
    private async Task Alignleft() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignleft", content_id);
    private async Task Aligncenter() => await js.InvokeVoidAsync("RTBlazorfied_Method", "aligncenter", content_id);
    private async Task Alignright() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignright", content_id);
    private async Task Alignjustify() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignjustify", content_id);
    private async Task Indent() => await js.InvokeVoidAsync("RTBlazorfied_Method", "indent", content_id);
    private async Task Copy() => await js.InvokeVoidAsync("RTBlazorfied_Method", "copy", content_id);
    private async Task Cut() => await js.InvokeVoidAsync("RTBlazorfied_Method", "cut", content_id);
    private async Task Delete() => await js.InvokeVoidAsync("RTBlazorfied_Method", "delete", content_id);
    private async Task Selectall() => await js.InvokeVoidAsync("RTBlazorfied_Method", "selectall", content_id);
    private async Task OrderedList() => await js.InvokeVoidAsync("RTBlazorfied_Method", "orderedlist", content_id);
    private async Task UnorderedList() => await js.InvokeVoidAsync("RTBlazorfied_Method", "unorderedlist", content_id);
    private async Task CreateLink() => await js.InvokeVoidAsync("RTBlazorfied_Method", "createLink", content_id);
    private async Task Undo() => await js.InvokeVoidAsync("RTBlazorfied_Method", "undo", content_id);
    private async Task Redo() => await js.InvokeVoidAsync("RTBlazorfied_Method", "redo", content_id);

    private async Task OpenDropdown(string id) =>
        await js.InvokeVoidAsync("RTBlazorfied_Method", "dropdown", content_id, id);
    private async Task FormatText(string format) =>
        await js.InvokeVoidAsync("RTBlazorfied_Method", "format", content_id, format);
    private async Task OpenCode()
    {
        if (Mode == "html")
        {
            Mode = "code";
            IsDisabled = true;
            OpenEditorStyles = "rich-text-box-menu-item-special";
            OpenCodeStyles = "rich-text-box-menu-item-special selected";
            await js.InvokeVoidAsync("RTBlazorfied_Method", "getHtml", content_id);
        }
        else
        {
            Mode = "html";
            IsDisabled = false;
            OpenEditorStyles = "rich-text-box-menu-item-special selected";
            OpenCodeStyles = "rich-text-box-menu-item-special";
            await js.InvokeVoidAsync("RTBlazorfied_Method", "getCode", content_id);
        }
    }
    #endregion
}
