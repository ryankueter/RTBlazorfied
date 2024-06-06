/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public interface IRTBlazorfiedOptions
{
    public void Toolbar(Action<RichTextboxToolbarOptions> style);
    public void Button(Action<RichTextboxButtonOptions> style);
    public void Style(Action<RichTextboxStyleOptions> style);
    public void Scrollbar(Action<RichTextboxScrollOptions> style);
    public RichTextboxToolbarOptions? GetToolbarOptions();
    public RichTextboxButtonOptions? GetButtonOptions();
    public RichTextboxStyleOptions? GetStyleOptions();
    public RichTextboxScrollOptions? GetScrollOptions();
    public List<RTBlazorfiedButton> Buttons { get; set; }
}
