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
}
