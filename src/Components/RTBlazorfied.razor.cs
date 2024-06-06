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
            background-color: {{_toolbarBackgroundColor}} !important;
            border-style: {{_toolbarBorderStyle}} !important;
            border-width: {{_toolbarBorderWidth}} !important;
            border-color: {{_toolbarBorderColor}};
            border-radius: {{_toolbarBorderRadius}} !important;
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
            outline: none;
            cursor: pointer;
            padding: 3px 8px;
            transition: 0.3s;
            margin: 4px;
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

        .rich-text-box-container {
            resize: both;
            overflow: hidden;
            border-style: {{_editorBorderStyle}} !important;
            border-width: {{_editorBorderWidth}} !important;
            border-color: {{_editorBorderColor}} !important;
            border-radius: {{_editorBorderRadius}} !important;
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
        }
        .rich-text-box-content {
            padding: 10px;
            width: 100%;
            min-height: 25px;
            background-color: {{_contentBackgroundColor}} !important;
            color: {{_contentTextColor}} !important;
            box-shadow: {{_contentBoxShadow}};
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
            padding: 3px 8px;
            transition: 0.3s;
            margin: 4px;
        }
        .rich-text-box-divider-btn[disabled], .rich-text-box-divider-btn[disabled]:hover, .rich-text-box-divider-btn[disabled]:focus, .rich-text-box-divider-btn[disabled]:active {
            background: unset;
            color: unset;
            cursor: default;
        }
        .rich-text-box-divider {
            min-height: 25px;
            height: {{_buttonTextSize}} !important;
            width: 1px;
            background-color: {{_buttonTextColor}} !important;
            display: block;
            border-left: 1px solid rgba(255, 255, 255, 0.6);
            opacity: .5;
        }
        .rich-text-box-scroll::-webkit-scrollbar {
            width: {{_scrollWidth}} !important;
            opacity: {{_scrollOpacity}} !important;
        }
        .rich-text-box-scroll::-webkit-scrollbar-track {
            background-color: {{_scrollBackgroundColor}} !important;
        }
        .rich-text-box-scroll::-webkit-scrollbar-thumb {
            background: {{_scrollThumbBackgroundHover}} !important;
            border-radius: {{_scrollThumbBorderRadius}} !important;
        }
        .rich-text-box-scroll::-webkit-scrollbar-thumb:hover {
            background: {{_scrollThumbBackgroundHover}} !important;
        }
        """;

    #region Separators
    private List<RTBlazorfiedButton>? _textStyle;
    private List<RTBlazorfiedButton>? _textAlign;
    private List<RTBlazorfiedButton>? _textAction;
    private List<RTBlazorfiedButton>? _textList;
    private List<RTBlazorfiedButton>? _textLink;
    private List<RTBlazorfiedButton>? _textHistory;
    #endregion

    #region Styles
    // Toolbar
    private string? _toolbarBackgroundColor { get; set; } = "#f1f1f1";
    private string? _toolbarBorderStyle { get; set; } = "none";
    private string? _toolbarBorderWidth { get; set; } = "0px";
    private string? _toolbarBorderColor { get; set; } = "#000000";
    private string? _toolbarBorderRadius { get; set; } = "0px";

    // Buttons
    private string? _buttonTextColor { get; set; } = "#000";
    private string? _buttonTextSize { get; set; } = "20px";
    private string? _buttonBackgroundColor { get; set; } = "inherit";
    private string? _buttonBackgroundColorHover { get; set; } = "#DDDDDD";
    private string? _buttonBackgroundColorSelected { get; set; } = "#CCCCCC";
    private string? _buttonBorderRadius { get; set; } = "10px";
    private string? _buttonBorderStyle { get; set; } = "none";
    private string? _buttonBorderWidth { get; set; } = "0px";
    private string? _buttonBorderColor { get; set; } = "inherit";
    private string? _buttonBorderColorHover { get; set; } = "inherit";
    private string? _buttonBorderColorSelected { get; set; } = "inherit";
    // Content
    private string? _contentBackgroundColor { get; set; } = "#FFFFFF";
    private string? _contentTextColor { get; set; } = "#000000";
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

            if (_options.Buttons is null || _options.Buttons.Count == 0)
            {
                _options.Buttons = DefaultButtons();
            }
        }
        else
        {
            _options = new RichTextboxOptions
            {
                Buttons = DefaultButtons()
            };
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
        GetCustomButtons();
    }

    private void GetCustomButtons()
    {
        _textStyle = _options!.Buttons.Where(b =>
            b == RTBlazorfiedButton.Bold ||
            b == RTBlazorfiedButton.Italic ||
            b == RTBlazorfiedButton.Underline ||
            b == RTBlazorfiedButton.Strikethrough ||
            b == RTBlazorfiedButton.Subscript ||
            b == RTBlazorfiedButton.Superscript)
            .OrderBy(b => b)
            .ToList();

        _textAlign = _options!.Buttons.Where(b =>
            b == RTBlazorfiedButton.Alignleft ||
            b == RTBlazorfiedButton.Aligncenter ||
            b == RTBlazorfiedButton.Alignright ||
            b == RTBlazorfiedButton.Alignjustify ||
            b == RTBlazorfiedButton.Indent)
            .OrderBy(b => b)
            .ToList();

        _textAction = _options!.Buttons.Where(b =>
           b == RTBlazorfiedButton.Cut ||
           b == RTBlazorfiedButton.Copy ||
           b == RTBlazorfiedButton.Delete ||
           b == RTBlazorfiedButton.Selectall)
            .OrderBy(b => b)
            .ToList();

        //_textList = _options!.Buttons.Where(b =>
        //    b == RichTextboxButton.Orderedlist ||
        //    b == RichTextboxButton.Unorderedlist).ToList();

        //_textLink = _options!.Buttons.Where(b =>
        //    b == RichTextboxButton.Link).ToList();

        _textHistory = _options!.Buttons.Where(b =>
            b == RTBlazorfiedButton.Undo ||
            b == RTBlazorfiedButton.Redo)
            .OrderBy(b => b)
            .ToList();
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
        }
    }
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

        await js.InvokeVoidAsync("RTBlazorfied_Initialize", content_id, shadow_id, toolbar_id, GetStyles());
        await js.InvokeVoidAsync("RTBlazorfied_Method", "loadHtml", content_id, Html);
    }

    public async Task Reinitialize()
    {
        await js.InvokeVoidAsync("RTBlazorfied_Method", "loadHtml", content_id, Html);
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
    private async Task OpenCode()
    {
        if (Mode == "html")
        {
            Mode = "code";
            IsDisabled = true;
            OpenEditorStyles = "rich-text-box-menu-item-special";
            OpenCodeStyles = "rich-text-box-menu-item-special selected";
            var web = await js.InvokeAsync<string>("RTBlazorfied_Method", "html", content_id);
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadInnerText", content_id, web);
        }
        else
        {
            Mode = "html";
            IsDisabled = false;
            OpenEditorStyles = "rich-text-box-menu-item-special selected";
            OpenCodeStyles = "rich-text-box-menu-item-special";
            var plaintext = await js.InvokeAsync<string>("RTBlazorfied_Method", "plaintext", content_id);
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadHtml", content_id, plaintext);

        }
    }
    #endregion

    private List<RTBlazorfiedButton> DefaultButtons() =>
        new List<RTBlazorfiedButton>
            {
            RTBlazorfiedButton.Bold,
            RTBlazorfiedButton.Italic,
            RTBlazorfiedButton.Strikethrough,
            RTBlazorfiedButton.Subscript,
            RTBlazorfiedButton.Superscript,
            RTBlazorfiedButton.Indent,
            RTBlazorfiedButton.Underline,
            RTBlazorfiedButton.Aligncenter,
            RTBlazorfiedButton.Alignjustify,
            RTBlazorfiedButton.Alignleft,
            RTBlazorfiedButton.Alignright,
            RTBlazorfiedButton.Selectall,
            RTBlazorfiedButton.Cut,
            RTBlazorfiedButton.Copy,
            RTBlazorfiedButton.Delete,
            //RichTextboxButton.Orderedlist,
            //RichTextboxButton.Unorderedlist,
            //RichTextboxButton.Link,
            RTBlazorfiedButton.Undo,
            RTBlazorfiedButton.Redo
            };
}
