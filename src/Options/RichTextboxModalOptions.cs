/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public class RichTextboxModalOptions
{
    internal bool? removeCSSInputs { get; set; }
    public void RemoveCSSInputs() {
        removeCSSInputs = true;
    }
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }
    public string? TextboxBackgroundColor { get; set; }
    public string? TextboxTextColor { get; set; }
    public string? TextboxBorderColor { get; set; }
    public string? CheckboxAccentColor { get; set; }
}
