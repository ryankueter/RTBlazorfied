/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public class RichTextboxModalOptions
{
    internal bool? removeCSSClassInputs { get; set; }
    public void RemoveCSSClassInputs() {
        removeCSSClassInputs = true;
    }
    public string? TextColor { get; set; }
    public string? TextSize { get; set; }
    public string? TextFont { get; set; }
    public string? BackgroundColor { get; set; }
    public string? TextboxBackgroundColor { get; set; }
    public string? TextboxTextColor { get; set; }
    public string? TextboxBorderColor { get; set; }
    public string? CheckboxAccentColor { get; set; }
}
