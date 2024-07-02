using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace RichTextBlazorfied.Components;

public partial class RTColorDialog
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
    private async Task SelectTextColor(string color)
    {
        switch (DialogId)
        {
            case "rich-text-box-text-color-modal":
                await js.InvokeVoidAsync("RTBlazorfied_Method", "selectTextColor", InstanceId, color);
                break;
            case "rich-text-box-text-bg-color-modal":
                await js.InvokeVoidAsync("RTBlazorfied_Method", "selectTextBackgroundColor", InstanceId, color);
                break;
        }
        
    }
}
