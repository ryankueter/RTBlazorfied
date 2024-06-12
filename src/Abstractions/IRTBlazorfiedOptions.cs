/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public interface IRTBlazorfiedOptions
{
    public void ModalStyles(Action<RichTextboxModalOptions> modal);
    public void ToolbarStyles(Action<RichTextboxToolbarOptions> style);
    public void ButtonStyles(Action<RichTextboxButtonOptions> style);
    public void EditorStyles(Action<RichTextboxEditorOptions> style);
    public void ScrollbarStyles(Action<RichTextboxScrollOptions> style);
    public void ContentStyles(Action<RichTextboxContentOptions> style);
    public void ButtonVisibility(Action<RichTextboxButtonVisibilityOptions> style);
    internal RichTextboxToolbarOptions? GetToolbarOptions();
    internal RichTextboxButtonOptions? GetButtonOptions();
    internal RichTextboxButtonVisibilityOptions? GetButtonVisibilityOptions();
    internal RichTextboxEditorOptions? GetEditorOptions();
    internal RichTextboxContentOptions? GetContentOptions();
    internal RichTextboxScrollOptions? GetScrollOptions();
    internal RichTextboxModalOptions? GetModalOptions();
}
