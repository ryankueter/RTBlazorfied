# RT Blazorfied

Author: Ryan Kueter  
Updated: July, 2024

## About

**RT Blazorfied** is a free .NET library available from the [NuGet Package Manager](https://www.nuget.org/packages/RTBlazorfied) that allows Blazor developers to easily add a rich text box / html editor to their blazor application.


The editor also uses [Google's Font Icons](https://fonts.google.com/icons). It does not reference the icon library. However, it does embed .svg versions of those icons so they are customizable.

### Targets:
- .NET 8

## Adding a Rich Textbox

### Add the JavaScript Reference

Add the following reference to the end of your index.html file:

```html
<script src="_content/RTBlazorfied/js/RTBlazorfied.js"></script>
```

### Add the Element

In this example, the @Html is the html string. This height and width will override those specified in the configuration options.

```html
@using RichTextBlazorfied

<RTBlazorfied @ref="box" Html="@Html" Height="500px" Width="1000px" />
```

The element reference can be used to get the html or plaintext for saving.

```csharp
private RTBlazorfied box { get; set; } = new();
private string? html { get; set; }
private string? plaintext { get; set; }

private async Task GetHtml() => 
    html = await box.GetHtmlAsync();

private async Task GetPlainText() => 
    plaintext = await box.GetPlainTextAsync();
```

The element reference also provides a method for restoring the text to the beginning:
```csharp
box.Reinitialize();
```

### Configure the Options

RTBlazorfied was designed to allow developers to highly customize the appearance of the rich textbox with the following configuration options:
```html
<RTBlazorfied Html="@Html" Options="@GetOptions()" />
```

CSS variables, e.g., var(--my-variable) are interchangeable with these styles. And omitting the ButtonVisibility options will display all the buttons.
```csharp
public Action<IRTBlazorfiedOptions> GetOptions() => (o =>
{
    o.ToolbarStyles(o =>
    {
        o.BackgroundColor = "#00FF00";
        o.BorderColor = "#FF0000";
        o.BorderWidth = "1px";
        o.BorderStyle = "solid";
        o.BorderRadius = "10px 0px";
        o.DropdownBackgroundColor = "#333333";
        o.DropdownTextColor = "#FFFFFF";
        o.DropdownBackgroundColorHover = "#777777";
        o.DropdownTextColorHover = "#FFFFAA";
    });
    o.ModalStyles(o =>
    {
        o.BackgroundColor = "#333333";
        o.TextColor = "#FFFFAA";
        o.TextboxBackgroundColor = "#333333";
        o.TextboxTextColor = "#FFFFAA";
        o.TextboxBorderColor = "#FFFFAA";
        o.CheckboxAccentColor = "#FFFFAA";
    });
    o.ButtonStyles(o =>
    {
        o.TextColor = "#ff0000";
        o.TextSize = "30px";
        o.BackgroundColor = "#0000FF";
        o.BackgroundColorHover = "inherit";
        o.BackgroundColorSelected = "inherit";
        o.BorderColor = "#FFF000";
        o.BorderColorHover = "#FF0000";
        o.BorderColorSelected = "#0000FF";
        o.BorderStyle = "solid";
        o.BorderRadius = "0px";
        o.BorderWidth = "1px";
    });
    o.EditorStyles(o =>
    {
        o.Width = "500px";
        o.Height = "700px";
        o.BorderRadius = "10px";
        o.BoxShadow = "3px 3px 5px 6px #ccc";
        o.BorderStyle = "dotted";
        o.BorderWidth = "10px";
        o.BorderColor = "#FF0000";
    });
    o.ContentStyles(o =>
    {
        o.ContentBoxShadow = "inset 0 0 7px #eee";
        o.BackgroundColor = "#FFFF99";
        o.TextColor = "#333";
    });
    o.ScrollbarStyles(o =>
    {
        o.Width = "5px";
        o.Opacity = "0.5";
        o.ThumbBackground = "#0000FF";
        o.ThumbBackgroundHover = "#00FFFF";
        o.BackgroundColor = "transparent";
        o.ThumbBorderRadius = "10px";
    });
    o.ButtonVisibility(o =>
    {
        o.ClearAll();
        o.Size = true;
        o.Font = true;
        o.Format = true;
        o.Bold = true;
        o.Italic = true;
        o.Underline = true;
        o.Strikethrough = true;
        o.Subscript = true;
        o.Superscript = true;
        o.TextColor = true;
        o.Alignleft = true;
        o.Aligncenter = true;
        o.Alignright = true;
        o.Alignjustify = true;
        o.Copy = true;
        o.Cut = true;
        o.Delete = true;
        o.Selectall = true;
        o.Image = true;
        o.Link = true;
        o.Undo = true;
        o.Redo = true;
        o.Quote = true;
        o.CodeBlock = true;
        o.EmbedMedia = true;
    });
});
```

###
## Contributions

This project is being developed for free by me, Ryan Kueter, in my spare time. So, if you would like to contribute, please submit your ideas on the Github project page.