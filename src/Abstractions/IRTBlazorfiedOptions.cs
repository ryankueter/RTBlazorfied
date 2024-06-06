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
    public void Editor(Action<RichTextboxEditorOptions> style);
    public void Scrollbar(Action<RichTextboxScrollOptions> style);
    public void Content(Action<RichTextboxContentOptions> style);
    public void ButtonVisibility(Action<RichTextboxButtonVisibilityOptions> style);
    internal RichTextboxToolbarOptions? GetToolbarOptions();
    internal RichTextboxButtonOptions? GetButtonOptions();
    internal RichTextboxButtonVisibilityOptions? GetButtonVisibilityOptions();
    internal RichTextboxEditorOptions? GetEditorOptions();
    internal RichTextboxContentOptions? GetContentOptions();
    internal RichTextboxScrollOptions? GetScrollOptions();
}
