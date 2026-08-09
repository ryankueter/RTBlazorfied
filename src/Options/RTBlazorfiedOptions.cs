namespace RichTextBlazorfied;

internal sealed class RTBlazorfiedOptions : IRTBlazorfiedOptions
{
    private VisibilityOptions? _visibility;
    private bool? _spellCheckEnabled;
    private bool _useHunspell;
    private string? _hunspellDictionaryKey;

    public IRTBlazorfiedOptions ButtonVisibility(Action<IVisibilityOptions> configure)
    {
        _visibility = new VisibilityOptions();
        configure(_visibility);
        return this;
    }

    public IRTBlazorfiedOptions SpellCheckEnabled(bool enabled = true)
    {
        _spellCheckEnabled = enabled;
        return this;
    }

    public IRTBlazorfiedOptions UseHunspellSpellChecker(string? dictionaryKey = null)
    {
        _useHunspell = true;
        _hunspellDictionaryKey = dictionaryKey;
        return this;
    }

    /// <summary>
    /// Builds the options object serialized and passed to the web component's
    /// <c>configure()</c> method. Returns null when nothing was configured.
    /// </summary>
    internal Dictionary<string, object?>? Build()
    {
        var visibility = _visibility?.Build();
        var result = new Dictionary<string, object?>();

        if (visibility is not null && visibility.Count > 0)
            result["visibility"] = visibility;

        if (_spellCheckEnabled.HasValue)
            result["spellCheckEnabled"] = _spellCheckEnabled.Value;

        if (_useHunspell)
            result["hunspell"] = new Dictionary<string, object?> { ["dictionaryKey"] = _hunspellDictionaryKey };

        return result.Count > 0 ? result : null;
    }
}
