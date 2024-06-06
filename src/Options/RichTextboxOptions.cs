/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public class RichTextboxOptions : IRTBlazorfiedOptions
{
    public string? ToolbarColor { get; set; }
    public string? ToolbarStyle { get; set; }
    private RichTextboxToolbarOptions? _toolbar;
    private RichTextboxButtonOptions? _button;
    private RichTextboxEditorOptions? _editor;
    private RichTextboxContentOptions? _content;
    private RichTextboxScrollOptions? _scroll;
    public void Toolbar(Action<RichTextboxToolbarOptions> style)
    {
        var options = new RichTextboxToolbarOptions();
        if (style is not null)
            style(options);
        _toolbar = options;
    }
    public void Button(Action<RichTextboxButtonOptions> style)
    {
        var options = new RichTextboxButtonOptions();
        if (style is not null)
            style(options);
        _button = options;
    }
    public void Editor(Action<RichTextboxEditorOptions> style)
    {
        var options = new RichTextboxEditorOptions();
        if (style is not null)
            style(options);
        _editor = options;
    }
    public void Content(Action<RichTextboxContentOptions> style)
    {
        var options = new RichTextboxContentOptions();
        if (style is not null)
            style(options);
        _content = options;
    }
    public void Scrollbar(Action<RichTextboxScrollOptions> scroll)
    {
        var options = new RichTextboxScrollOptions();
        if (scroll is not null)
            scroll(options);
        _scroll = options;
    }
    public List<RTBlazorfiedButton> Buttons { get; set; } = new List<RTBlazorfiedButton>();
    public RichTextboxToolbarOptions? GetToolbarOptions() => _toolbar;
    public RichTextboxButtonOptions? GetButtonOptions() => _button;
    public RichTextboxEditorOptions? GetEditorOptions() => _editor;
    public RichTextboxContentOptions? GetContentOptions() => _content;
    public RichTextboxScrollOptions? GetScrollOptions() => _scroll;
}
