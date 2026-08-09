namespace RichTextBlazorfied;

/// <summary>
/// Configuration for the <see cref="RTBlazorfied"/> component.
/// Covers options that require JavaScript — visual styling is handled
/// through CSS variables on the <c>rt-native</c> host element instead.
/// </summary>
public interface IRTBlazorfiedOptions
{
    /// <summary>
    /// Controls which toolbar buttons are visible. Call
    /// <see cref="IVisibilityOptions.ClearAll"/> inside the delegate to start
    /// from a blank toolbar, then enable only the buttons you need.
    /// </summary>
    IRTBlazorfiedOptions ButtonVisibility(Action<IVisibilityOptions> configure);

    /// <summary>
    /// Enables or disables spellcheck marking (default <c>true</c>). Has no
    /// effect until a spellchecker is supplied via
    /// <see cref="UseHunspellSpellChecker"/> or
    /// <see cref="RTBlazorfied.UseHunspellSpellCheckerAsync"/>.
    /// </summary>
    IRTBlazorfiedOptions SpellCheckEnabled(bool enabled = true);

    /// <summary>
    /// Configures the real Hunspell engine (compiled to WebAssembly, running fully
    /// offline) as the editor's spellchecker as soon as the editor loads, enabling
    /// the "Spelling" section in the right-click context menu by default. Requires
    /// the host page to have already loaded the Hunspell script assets — see the
    /// RTBlazorfied README's "Spellcheck (Hunspell)" section for the exact
    /// &lt;script&gt; tags. When this option is not used, no spellchecker is
    /// configured and the "Spelling" context menu section stays hidden.
    /// </summary>
    /// <param name="dictionaryKey">
    /// The key of the dictionary to use, matching a property on
    /// <c>window.HunspellDictionaries</c> (e.g. <c>"en_US"</c>). Defaults to the
    /// vendored en_US dictionary when omitted.
    /// </param>
    IRTBlazorfiedOptions UseHunspellSpellChecker(string? dictionaryKey = null);
}
