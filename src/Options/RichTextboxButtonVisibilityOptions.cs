/**
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace RichTextBlazorfied;

public class RichTextboxButtonVisibilityOptions
{
    internal bool? _clearAll;
    public void ClearAll()
    {
        _clearAll = true;
    }
    public bool? Font { get; set; }
    public bool? Size { get; set; }
    public bool? Format { get; set; }
    public bool? Bold { get; set; }
    public bool? Italic { get; set; }
    public bool? Underline { get; set; }
    public bool? Strikethrough { get; set; }
    public bool? Subscript { get; set; }
    public bool? Superscript { get; set; }
    public bool? TextColor { get; set; }
    public bool? Alignleft { get; set; }
    public bool? Aligncenter { get; set; }
    public bool? Alignright { get; set; }
    public bool? Alignjustify { get; set; }
    //public bool? Indent { get; set; }
    public bool? Copy { get; set; }
    public bool? Cut { get; set; }
    public bool? Delete { get; set; }
    public bool? Selectall { get; set; }
    public bool? Undo { get; set; }
    public bool? Redo { get; set; }
    public bool? Link { get; set; }
    public bool? Image { get; set; }
    public bool? Orderedlist { get; set; }
    public bool? Unorderedlist { get; set; }
    public bool? Quote { get; set; }
    public bool? CodeBlock { get; set; }
    public bool? EmbedMedia { get; set; }
    public bool? TextStylesDivider { get; set; }
    public bool? FormatDivider { get; set; }
    public bool? TextColorDivider { get; set; }
    public bool? AlignDivider { get; set; }
    public bool? ActionDivider { get; set; }
    public bool? ListDivider { get; set; }
    public bool? MediaDivider { get; set; }
    public bool? HistoryDivider { get; set; }
}
