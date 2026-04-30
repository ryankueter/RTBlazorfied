namespace RichTextBlazorfied;

internal sealed class RTBlazorfiedOptions : IRTBlazorfiedOptions
{
    private VisibilityOptions? _visibility;

    public IRTBlazorfiedOptions ButtonVisibility(Action<IVisibilityOptions> configure)
    {
        _visibility = new VisibilityOptions();
        configure(_visibility);
        return this;
    }

    /// <summary>
    /// Builds the options object serialized and passed to the web component's
    /// <c>configure()</c> method. Returns null when nothing was configured.
    /// </summary>
    internal Dictionary<string, object?>? Build()
    {
        var visibility = _visibility?.Build();
        if (visibility is null || visibility.Count == 0) return null;

        return new Dictionary<string, object?> { ["visibility"] = visibility };
    }
}
