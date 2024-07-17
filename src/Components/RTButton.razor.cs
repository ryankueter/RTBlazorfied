using Microsoft.AspNetCore.Components;

namespace RichTextBlazorfied.Components;

public partial class RTButton
{
    [Parameter]
    public EventCallback OnClick { get; set; }
    [Parameter]
    public string? Id { get; set; }
    [Parameter]
    public string? Title { get; set; }
    [Parameter]
    public string? TextSize { get; set; }
    [Parameter]
    public string? TextColor { get; set; }
    [Parameter]
    public string? Icon { get; set; }
}