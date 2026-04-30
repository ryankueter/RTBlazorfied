namespace RichTextBlazorfied;

/// <summary>
/// Controls which toolbar buttons and dividers are visible.
/// Call <see cref="ClearAll"/> first to start from a blank toolbar, then
/// selectively enable only the buttons you want.
/// </summary>
public interface IVisibilityOptions
{
    /// <summary>Sets all buttons to hidden before applying individual overrides.</summary>
    IVisibilityOptions ClearAll();

    // ── Dropdowns ────────────────────────────────────────────────────────────
    IVisibilityOptions Font(bool value = true);
    IVisibilityOptions Size(bool value = true);
    IVisibilityOptions Format(bool value = true);
    IVisibilityOptions TextStylesDivider(bool value = true);

    // ── Text formatting ───────────────────────────────────────────────────────
    IVisibilityOptions Bold(bool value = true);
    IVisibilityOptions Italic(bool value = true);
    IVisibilityOptions Underline(bool value = true);
    IVisibilityOptions Strikethrough(bool value = true);
    IVisibilityOptions Subscript(bool value = true);
    IVisibilityOptions Superscript(bool value = true);
    IVisibilityOptions FormatDivider(bool value = true);

    // ── Color ─────────────────────────────────────────────────────────────────
    IVisibilityOptions TextColor(bool value = true);
    IVisibilityOptions TextColorDivider(bool value = true);

    // ── Alignment ─────────────────────────────────────────────────────────────
    IVisibilityOptions AlignLeft(bool value = true);
    IVisibilityOptions AlignCenter(bool value = true);
    IVisibilityOptions AlignRight(bool value = true);
    IVisibilityOptions AlignJustify(bool value = true);
    IVisibilityOptions AlignDivider(bool value = true);

    // ── Clipboard / selection ─────────────────────────────────────────────────
    IVisibilityOptions Copy(bool value = true);
    IVisibilityOptions Cut(bool value = true);
    IVisibilityOptions Paste(bool value = true);
    IVisibilityOptions Delete(bool value = true);
    IVisibilityOptions SelectAll(bool value = true);
    IVisibilityOptions ActionDivider(bool value = true);

    // ── Lists & indent ────────────────────────────────────────────────────────
    IVisibilityOptions OrderedList(bool value = true);
    IVisibilityOptions UnorderedList(bool value = true);
    IVisibilityOptions Indent(bool value = true);
    IVisibilityOptions ListDivider(bool value = true);

    // ── Insert ────────────────────────────────────────────────────────────────
    IVisibilityOptions Link(bool value = true);
    IVisibilityOptions Image(bool value = true);
    IVisibilityOptions ImageUpload(bool value = true);
    IVisibilityOptions Quote(bool value = true);
    IVisibilityOptions CodeBlock(bool value = true);
    IVisibilityOptions EmbedMedia(bool value = true);
    IVisibilityOptions Video(bool value = true);
    IVisibilityOptions Table(bool value = true);
    IVisibilityOptions HorizontalRule(bool value = true);
    IVisibilityOptions MediaDivider(bool value = true);

    // ── History ───────────────────────────────────────────────────────────────
    IVisibilityOptions Undo(bool value = true);
    IVisibilityOptions Redo(bool value = true);
    IVisibilityOptions HistoryDivider(bool value = true);

    // ── View ──────────────────────────────────────────────────────────────────
    IVisibilityOptions SaveHtml(bool value = true);
    IVisibilityOptions HtmlView(bool value = true);
    IVisibilityOptions Preview(bool value = true);
    IVisibilityOptions StatusBarToggle(bool value = true);

    // ── Status bar ────────────────────────────────────────────────────────────
    /// <summary>Shows the word/character count status bar on load (hidden by default).</summary>
    IVisibilityOptions WordCount(bool value = true);
}
