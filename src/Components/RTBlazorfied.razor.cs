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
            padding-left: 3px;
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
            outline: none;
            cursor: pointer;
            transition: 0.3s;
            min-height: calc({{_buttonTextSize}} + 14px);
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
            z-index: 10000;
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
            transition: 0.1s;
        }
        /*
        ::selection {
            background-color: green;
            color: black;
        }
        */

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
          box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.2);
          z-index: 10001;
          font-family: Arial, sans-serif;
        }

        .rich-text-box-dropdown-btn {
            font-size: {{_buttonTextSize}};
            min-height: calc({{_buttonTextSize}} + 14px);
            padding: 0 10px;
        }

        .rich-text-box-format-button {
            
        }
        .rich-text-box-format-content {
            min-width: 185px;
        }

        .rich-text-box-font-button {
            
        }
        .rich-text-box-font-content {
          min-width: 180px;
        }

        .rich-text-box-size-button {
            
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

        .rich-text-box-modal {
          display: none;
          position: fixed;
          z-index: 10001;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          /* background-color: rgba(0,0,0,0.1); */
        }

        .rich-text-box-modal-content {
          position: relative;
          top: 20%;
          background-color: {{_modalBackgroundColor}};
          color: {{_modalTextColor}};
          margin: auto;
          border: 1px solid #888;
          width: 600px;
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
          -webkit-animation-name: animatezoom;
          -webkit-animation-duration: 0.1s;
          animation-name: animatezoom;
          animation-duration: 0.1s;
          border-radius: 5px;
        }

        @-webkit-keyframes animatezoom {
            from {-webkit-transform: scale(0); opacity:0} 
            to {-webkit-transform: scale(1)}
        }

        @keyframes animatezoom {
            from {transform: scale(0); opacity:0} 
            to {transform: scale(1)}
        }

        @media screen and (max-width: 768px) {
            .rich-text-box-modal-content {
                width: 100%;
            }
        }
        
        .rich-text-box-modal-close {
          color: {{_modalTextColor}};
          font-size: 24px;
          cursor: pointer;
        }

        .rich-text-box-modal-close:hover,
        .rich-text-box-modal-close:focus {
          color: {{_modalTextColor}};
          text-decoration: none;
          cursor: pointer;
        }

        .rich-text-box-modal-body {
          padding: 2px 16px;
        }
        input[type=text], select, textarea {
          width: 100%;
          padding: 10px;
          font-size: 14px;
          background-color: {{_modalTextboxBackgroundColor}};
          color: {{_modalTextboxTextColor}};
          border-width: 1px;
          border-style: solid;
          border-color: {{_modalTextboxBorderColor}};
          outline: 0;
          border-radius: 0px;
          box-sizing: border-box;
          margin-top: 0px;
          margin-bottom: 16px;
          resize: vertical;
        }

        input[type="checkbox"] {
          outline: 0;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          accent-color: {{_modalCheckboxAccentColor}}; 
        }
        
        .rich-text-box-form-button {
          padding: 10px 20px !important;
          font-size: 16px !important;
        }

        .blazing-rich-text-color-picker-container {
            position: relative;
        }

        .blazing-rich-text-color-picker-button {
            min-height: calc({{_buttonTextSize}} + 14px);
        }

        .blazing-rich-text-color-picker-dropdown {
            width: 80px;
            padding: 10px 10px 6px 10px;
        }

        .blazing-rich-text-color-option {
            width: 15px;
            height: 15px;
            margin: 2px;
            cursor: pointer;
            display: inline-block;
            border: 2px solid transparent;
        }

        .blazing-rich-text-color-option:hover {
            border-color: #000;
        }
        .blazing-rich-text-color-selection {
            width: 100%;
            border-style: solid;
            border-width: 1px;
            border-color: #999;
            height: 40px;
            cursor: pointer;
            display: inline-block;
        }
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

    // Modal
    private string? _modalBackgroundColor { get; set; } = "#fefefe";
    private string? _modalTextColor { get; set; } = "#000";
    private string? _modalTextboxBackgroundColor { get; set; } = "#fff";
    private string? _modalTextboxTextColor { get; set; } = "#000";
    private string? _modalCheckboxAccentColor { get; set; } = "#007bff";
    private string? _modalTextboxBorderColor { get; set; } = "#CCC";
    #endregion

    public async Task<string?> GetPlainTextAsync() =>
        await js.InvokeAsync<string>("RTBlazorfied_Method", "plaintext", id);

    public async Task<string?> GetHtmlAsync() =>
        await js.InvokeAsync<string>("RTBlazorfied_Method", "html", id);

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
        GetModalOptions();
        GetButtons();
    }

    #region ButtonVisibility
    private bool? _font;
    private bool? _size;
    private bool? _format;
    private bool? _textstylesdivider;
    private bool? _bold;
    private bool? _italic;
    private bool? _underline;
    private bool? _strikethrough;
    private bool? _subscript;
    private bool? _superscript;
    private bool? _formatdivider;
    private bool? _textcolor;
    private bool? _textcolordivider;
    private bool? _alignleft;
    private bool? _aligncenter;
    private bool? _alignright;
    private bool? _alignjustify;
    private bool? _indent;
    private bool? _aligndivider;
    private bool? _copy;
    private bool? _cut;
    private bool? _delete;
    private bool? _selectall;
    private bool? _actiondivider;
    private bool? _undo;
    private bool? _redo;
    private bool? _historydivider;
    private bool? _link;
    private bool? _image;
    private bool? _insertdivider;
    private bool? _orderedlist;
    private bool? _unorderedlist;
    private bool? _listdivider;
    #endregion
    private void GetButtons()
    {
        var buttons = _options.GetButtonVisibilityOptions();
        if (buttons is null)
        {
            SetDividerDefaults();
            SetButtonDefaults();
        }
        else
        {
            if (buttons._clearAll is true)
            {
                SetDividerDefaults(false);
                SetButtonDefaults(false);
            }
            else
            {
                SetDividerDefaults();
                SetButtonDefaults();
            }

            GetTextStyleButtons(buttons);
            GetTextFormatButtons(buttons);
            GetTextColorButtons(buttons);
            GetAlignButtons(buttons);
            GetActionsButtons(buttons);
            GetUndoRedoButtons(buttons);
            GetInsertButtons(buttons);
            GetListButtons(buttons);
        }
    }

    private void GetListButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
        if (buttons.Orderedlist is not null)
        {
            _orderedlist = buttons.Orderedlist;
        }
        if (buttons.Unorderedlist is not null)
        {
            _unorderedlist = buttons.Unorderedlist;
        }
        // If the user did not specify false, keep the button
        if (buttons.Orderedlist == true
            || buttons.Unorderedlist == true)
        {
            _listdivider = true;
        }
    }

    private void GetInsertButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
        if (buttons.Link is not null)
        {
            _link = buttons.Link;
        }
        if (buttons.Image is not null)
        {
            _image = buttons.Image;
        }
        // If the user did not specify false, keep the button
        if (buttons.Link == true
            || buttons.Image == true)
        {
            _insertdivider = true;
        }
    }

    private void GetUndoRedoButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
        if (buttons.Undo is not null)
        {
            _undo = buttons.Undo;
        }
        if (buttons.Redo is not null)
        {
            _redo = buttons.Redo;
        }

        // If the user did not specify false, keep the button
        if (buttons.Undo == true
            || buttons.Redo == true)
        {
            _historydivider = true;
        }
    }

    private void GetActionsButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
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
        if (buttons.Copy == true
            || buttons.Cut == true
            || buttons.Delete == true
            || buttons.Selectall == true)
        {
            _actiondivider = true;
        }
    }

    private void GetAlignButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
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

        // If the user did not specify false, keep the button
        if (buttons.Alignleft == true
            || buttons.Aligncenter == true
            || buttons.Alignright == true
            || buttons.Alignjustify == true)
        {
            _aligndivider = true;
        }
    }

    private void GetTextColorButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
        if (buttons.TextColor is not null)
        {
            _textcolor = buttons.TextColor;
        }

        if (buttons.TextColor == true)
        {
            _textcolordivider = true;
        }
    }

    private void GetTextFormatButtons(RichTextboxButtonVisibilityOptions? buttons)
    {
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
        if (buttons.Bold == true
            || buttons.Italic == true
            || buttons.Underline == true
            || buttons.Strikethrough == true
            || buttons.Subscript == true
            || buttons.Superscript == true)
        {
            _formatdivider = true;
        }
    }

    private void GetTextStyleButtons(RichTextboxButtonVisibilityOptions buttons)
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

        if (buttons.Font == true
            || buttons.Size == true
            || buttons.Format == true)
        {
            _textstylesdivider = true;
        }
    }

    private void SetDividerDefaults(bool setting = true)
    {
        _textstylesdivider = setting;
        _formatdivider = setting;
        _textcolordivider = setting;
        _aligndivider = setting;
        _actiondivider = setting;
        _historydivider = setting;
        _insertdivider = setting;
        _listdivider = setting;
    }

    private void SetButtonDefaults(bool setting = true)
    {
        _font = setting;
        _size = setting;
        _format = setting;
        _bold = setting;
        _italic = setting;
        _underline = setting;
        _strikethrough = setting;
        _subscript = setting;
        _superscript = setting;
        _textcolor = setting;
        _alignleft = setting;
        _aligncenter = setting;
        _alignright = setting;
        _alignjustify = setting;
        _indent = setting;
        _copy = setting;
        _cut = setting;
        _delete = setting;
        _selectall = setting;
        _undo = setting;
        _redo = setting;
        _link = setting;
        _image = setting;
        _orderedlist = setting;
        _unorderedlist = setting;
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
    private void GetModalOptions()
    {
        var modalOptions = _options.GetModalOptions();
        if (modalOptions is not null)
        {
            if (modalOptions.BackgroundColor is not null)
            {
                _modalBackgroundColor = modalOptions.BackgroundColor;
            }
            if (modalOptions.TextColor is not null)
            {
                _modalTextColor = modalOptions.TextColor;
            }
            if (modalOptions.TextboxBackgroundColor is not null)
            {
                _modalTextboxBackgroundColor = modalOptions.TextboxBackgroundColor;
            }
            if (modalOptions.TextboxTextColor is not null)
            {
                _modalTextboxTextColor = modalOptions.TextboxTextColor;
            }
            if (modalOptions.CheckboxAccentColor is not null)
            { 
                _modalCheckboxAccentColor = modalOptions.CheckboxAccentColor;
            }
            if (modalOptions.TextboxBorderColor is not null)
            {
                _modalTextboxBorderColor = modalOptions.TextboxBorderColor;
            }
        }
    }
    #endregion

    #region Fonts
    private List<string> Fonts { get; set; } = new List<string>
    {
        "None",
        "Arial",
        "Arial Narrow",
        "Baskerville",
        "Brush Script",
        "Calibri",
        "Cambria",
        "Candara",
        "Century Gothic",
        "Claude Garamond",
        "Comic Sans MS",
        "Copperplate",
        "Courier",
        "Didot",
        "Georgia",
        "Gill Sans",
        "Helvetica",
        "Impact",
        "Lucida Bright",
        "Monospace",
        "Optima",
        "Palatino",
        "Segoe UI",
        "Tahoma",
        "Times New Roman",
        "Trebuchet MS",
        "Verdana"
    };
    private async Task Font(string fontName) => await js.InvokeVoidAsync("RTBlazorfied_Method", "font", id, fontName);
    private List<string> Sizes { get; set; } = new List<string>
    {
        "None",
        "8",
        "9",
        "10",
        "11",
        "12",
        "14",
        "16",
        "18",
        "20",
        "22",
        "24",
        "26",
        "28",
        "36",
        "48",
        "64"
    };
    private async Task Size(string size) => await js.InvokeVoidAsync("RTBlazorfied_Method", "size", id, size == "None" ? size : $"{size}px");
    #endregion

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await Initialize();
        }
    }

    private string id = Guid.NewGuid().ToString();
    private async Task Initialize()
    {
        Mode = "html";
        IsDisabled = false;
        OpenEditorStyles = "rich-text-box-menu-item-special selected";
        OpenCodeStyles = "rich-text-box-menu-item-special";

        await js.InvokeVoidAsync("RTBlazorfied_Initialize", id, $"{id}_Shadow", $"{id}_Toolbar", GetStyles(), Html);
    }

    public async Task Reinitialize() 
    {
        if (Mode == "html")
        {
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadHtml", id, Html);
        }
        else
        {
            await js.InvokeVoidAsync("RTBlazorfied_Method", "loadInnerText", id, Html);
        }
    }

    #region Buttons
    private async Task Bold() => await js.InvokeVoidAsync("RTBlazorfied_Method", "bold", id);
    private async Task Italic() => await js.InvokeVoidAsync("RTBlazorfied_Method", "italic", id);
    private async Task Underline() => await js.InvokeVoidAsync("RTBlazorfied_Method", "underline", id);
    private async Task Strikethrough() => await js.InvokeVoidAsync("RTBlazorfied_Method", "strikethrough", id);
    private async Task Subscript() => await js.InvokeVoidAsync("RTBlazorfied_Method", "subscript", id);
    private async Task Superscript() => await js.InvokeVoidAsync("RTBlazorfied_Method", "superscript", id);
    private async Task Alignleft() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignleft", id);
    private async Task Aligncenter() => await js.InvokeVoidAsync("RTBlazorfied_Method", "aligncenter", id);
    private async Task Alignright() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignright", id);
    private async Task Alignjustify() => await js.InvokeVoidAsync("RTBlazorfied_Method", "alignjustify", id);
    private async Task Indent() => await js.InvokeVoidAsync("RTBlazorfied_Method", "indent", id);
    private async Task Copy() => await js.InvokeVoidAsync("RTBlazorfied_Method", "copy", id);
    private async Task Cut() => await js.InvokeVoidAsync("RTBlazorfied_Method", "cut", id);
    private async Task Delete() => await js.InvokeVoidAsync("RTBlazorfied_Method", "delete", id);
    private async Task Selectall() => await js.InvokeVoidAsync("RTBlazorfied_Method", "selectall", id);
    private async Task OrderedList() => await js.InvokeVoidAsync("RTBlazorfied_Method", "orderedlist", id);
    private async Task UnorderedList() => await js.InvokeVoidAsync("RTBlazorfied_Method", "unorderedlist", id);
    private async Task OpenLinkDialog() => await js.InvokeVoidAsync("RTBlazorfied_Method", "openLinkDialog", id);
    private async Task RemoveLink() => await js.InvokeVoidAsync("RTBlazorfied_Method", "removeLink", id);
    private async Task InsertLink() => await js.InvokeVoidAsync("RTBlazorfied_Method", "insertLink", id);
    private async Task CloseDialog(string dialog_id) => await js.InvokeVoidAsync("RTBlazorfied_Method", "closeDialog", id, dialog_id);
    private async Task OpenImageDialog() => await js.InvokeVoidAsync("RTBlazorfied_Method", "openImageDialog", id);
    private async Task InsertImage() => await js.InvokeVoidAsync("RTBlazorfied_Method", "insertImage", id);
    private async Task Undo() => await js.InvokeVoidAsync("RTBlazorfied_Method", "undo", id);
    private async Task Redo() => await js.InvokeVoidAsync("RTBlazorfied_Method", "redo", id);
    private async Task OpenTextColorPicker() => await js.InvokeVoidAsync("RTBlazorfied_Method", "openTextColorPicker", id);
    private async Task OpenTextColorDialog() => await js.InvokeVoidAsync("RTBlazorfied_Method", "openTextColorDialog", id);
    private async Task SelectTextColor(string color) => await js.InvokeVoidAsync("RTBlazorfied_Method", "selectTextColor", id, color);
    private async Task InsertTextColor() => await js.InvokeVoidAsync("RTBlazorfied_Method", "insertTextColor", id);
    private async Task RemoveTextColor() => await js.InvokeVoidAsync("RTBlazorfied_Method", "removeTextColor", id);

    private async Task OpenDropdown(string id) =>
        await js.InvokeVoidAsync("RTBlazorfied_Method", "dropdown", this.id, id);
    private async Task FormatText(string format) =>
        await js.InvokeVoidAsync("RTBlazorfied_Method", "format", id, format);
    private async Task OpenCode()
    {
        if (Mode == "html")
        {
            Mode = "code";
            IsDisabled = true;
            OpenEditorStyles = "rich-text-box-menu-item-special";
            OpenCodeStyles = "rich-text-box-menu-item-special selected";
            await js.InvokeVoidAsync("RTBlazorfied_Method", "getHtml", id);
        }
        else
        {
            Mode = "html";
            IsDisabled = false;
            OpenEditorStyles = "rich-text-box-menu-item-special selected";
            OpenCodeStyles = "rich-text-box-menu-item-special";
            await js.InvokeVoidAsync("RTBlazorfied_Method", "getCode", id);
        }
    }
    #endregion
}
