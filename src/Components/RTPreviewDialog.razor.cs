using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace RichTextBlazorfied.Components;

public partial class RTPreviewDialog
{
    [Inject]
    private IJSRuntime js { get; set; } = default!;

    [Parameter]
    public string? InstanceId { get; set; }
    [Parameter]
    public string? DialogId { get; set; }
    [Parameter]
    public string? Title { get; set; }
    [Parameter]
    public EventCallback OnClick { get; set; }

    private RTBlazorfied? _instance;

    protected override void OnInitialized()
    {
        _instance = Global.Instances[InstanceId];
    }
    private async Task CloseDialog(string dialog_id) => await js.InvokeVoidAsync("RTBlazorfied_Method", "closePreview", InstanceId, _instance.GetPreviewId());
}
