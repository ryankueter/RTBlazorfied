using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace RichTextBlazorfied.Components;

public partial class RTDialog
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
    [Parameter]
    public RenderFragment? ChildContent { get; set; }
    private async Task CloseDialog(string dialog_id) => await js.InvokeVoidAsync("RTBlazorfied_Method", "closeDialog", InstanceId, DialogId);
}
