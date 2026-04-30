using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace RichTextBlazorfied;

/// <summary>
/// A Blazor wrapper around the <c>rt-native</c> rich text editor web component.
/// Add one script tag to your host page and drop this component into any Blazor
/// page or layout — no other JavaScript setup is required.
/// </summary>
public partial class RTBlazorfied : ComponentBase, IDisposable
{
    [Inject] private IJSRuntime JSRuntime { get; set; } = default!;

    // ── Parameters ───────────────────────────────────────────────────────────

    /// <summary>The HTML content displayed and edited inside the component.</summary>
    [Parameter] public string? Value { get; set; }

    /// <summary>Raised whenever the user changes the editor content.</summary>
    [Parameter] public EventCallback<string> ValueChanged { get; set; }

    /// <summary>
    /// One or more CSS class names applied to the <c>rt-native</c> host element.
    /// Use this to activate a named theme — for example <c>Class="fluent"</c> applies
    /// any <c>rt-native.fluent { --rtb-*: … }</c> rules you have defined in your
    /// stylesheet.  Multiple classes are supported: <c>Class="fluent dark"</c>.
    /// </summary>
    [Parameter] public string? Class { get; set; }

    /// <summary>CSS length for the editor height (e.g. <c>"400px"</c>, <c>"60vh"</c>).</summary>
    [Parameter] public string Height { get; set; } = "300px";

    /// <summary>CSS length for the editor width (e.g. <c>"100%"</c>, <c>"800px"</c>).</summary>
    [Parameter] public string Width { get; set; } = "100%";

    /// <summary>Placeholder text shown when the editor is empty.</summary>
    [Parameter] public string? Placeholder { get; set; }

    /// <summary>When <c>true</c>, the editor content cannot be modified by the user.</summary>
    [Parameter] public bool ReadOnly { get; set; }

    /// <summary>
    /// ARIA label announced by screen readers to identify the editor region.
    /// Defaults to "Rich text editor" when not set.
    /// </summary>
    [Parameter] public string? AriaLabel { get; set; }

    /// <summary>
    /// Fluent configuration delegate for toolbar button visibility.
    /// Visual styling (colors, fonts, borders, etc.) is handled through CSS
    /// variables on the <c>rt-native</c> host element instead.
    /// </summary>
    [Parameter] public Action<IRTBlazorfiedOptions>? Options { get; set; }

    // ── Private state ─────────────────────────────────────────────────────────

    private ElementReference _editorRef;
    private DotNetObjectReference<RTBlazorfied>? _dotNetRef;
    private string _lastKnownValue = string.Empty;
    private bool _initialized;

    // ── Blazor lifecycle ──────────────────────────────────────────────────────

    /// <summary>
    /// Prevents Blazor from re-rendering after first render so it does not
    /// overwrite the DOM managed by the web component.
    /// </summary>
    protected override bool ShouldRender() => !_initialized;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        _dotNetRef = DotNetObjectReference.Create(this);

        await JSRuntime.InvokeVoidAsync(
            "RTBlazorfiedInterop.initialize",
            _editorRef,
            _dotNetRef,
            Value ?? string.Empty,
            Placeholder,
            ReadOnly,
            AriaLabel,
            BuildConfigureOptions());

        _initialized = true;
        _lastKnownValue = Value ?? string.Empty;
    }

    protected override async Task OnParametersSetAsync()
    {
        // Push value updates from Blazor → editor once the editor is ready.
        if (_initialized && Value != _lastKnownValue)
        {
            _lastKnownValue = Value ?? string.Empty;
            await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.setValue", _editorRef, _lastKnownValue);
        }
    }

    // ── JS → Blazor callback ─────────────────────────────────────────────────

    /// <summary>
    /// Called from JavaScript each time the editor content changes.
    /// Updates the bound <see cref="Value"/> via <see cref="ValueChanged"/>.
    /// </summary>
    [JSInvokable]
    public async Task OnValueChanged(string value)
    {
        _lastKnownValue = value;
        if (ValueChanged.HasDelegate)
            await ValueChanged.InvokeAsync(value);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /// <summary>Returns the current HTML content of the editor.</summary>
    public async Task<string> GetValueAsync()
    {
        if (!_initialized) return Value ?? string.Empty;
        return await JSRuntime.InvokeAsync<string>("RTBlazorfiedInterop.getValue", _editorRef);
    }

    /// <summary>Returns the editor content as plain text (HTML tags stripped).</summary>
    public async Task<string> GetPlainTextAsync()
    {
        if (!_initialized) return string.Empty;
        return await JSRuntime.InvokeAsync<string>("RTBlazorfiedInterop.getPlainText", _editorRef);
    }

    /// <summary>Programmatically enables or disables read-only mode.</summary>
    public async Task SetReadOnlyAsync(bool on)
    {
        await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.setReadOnly", _editorRef, on);
    }

    /// <summary>
    /// Loads one or more CSS files into the editor content area and preview window.
    /// Rules are automatically scoped so they never affect the toolbar or dialogs.
    /// </summary>
    public async Task SetPreviewCssFilesAsync(params string[] urls)
    {
        await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.setPreviewCssFiles", _editorRef, urls);
    }

    /// <summary>
    /// Applies inline CSS to the editor content area and preview window.
    /// Call with an empty string to clear previously applied inline styles.
    /// </summary>
    public async Task SetPreviewCssAsync(string css)
    {
        await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.setPreviewCss", _editorRef, css);
    }

    /// <summary>
    /// Applies a new set of visibility options to an already-rendered editor.
    /// </summary>
    public async Task ConfigureAsync(Action<IRTBlazorfiedOptions> configure)
    {
        var opts = new RTBlazorfiedOptions();
        configure(opts);
        var built = opts.Build();
        if (built is not null)
            await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.configure", _editorRef, built);
    }

    /// <summary>
    /// Replaces the CSS class(es) on the editor host element at runtime, enabling
    /// dynamic theme switching.  Pass <c>null</c> or an empty string to remove all
    /// classes.  Example: <c>await editor.SetClassAsync("fluent dark");</c>
    /// </summary>
    public async Task SetClassAsync(string? cssClass)
    {
        await JSRuntime.InvokeVoidAsync("RTBlazorfiedInterop.setClass", _editorRef, cssClass ?? string.Empty);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────

    public void Dispose()
    {
        _dotNetRef?.Dispose();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private object? BuildConfigureOptions()
    {
        if (Options is null) return null;
        var opts = new RTBlazorfiedOptions();
        Options(opts);
        return opts.Build();
    }
}
