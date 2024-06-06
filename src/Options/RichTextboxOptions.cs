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
    private RichTextboxStyleOptions? _style;
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
    public void Style(Action<RichTextboxStyleOptions> style)
    {
        var options = new RichTextboxStyleOptions();
        if (style is not null)
            style(options);
        _style = options;
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
    public RichTextboxStyleOptions? GetStyleOptions() => _style;
    public RichTextboxScrollOptions? GetScrollOptions() => _scroll;
}
