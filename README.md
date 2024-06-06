# RT Blazorfied

Author: Ryan Kueter  
Updated: June, 2024

## About

**RT Blazorfied** is a free .NET library available from the [NuGet Package Manager](https://www.nuget.org/packages/RTBlazorfied) that allows Blazor developers to easily add a rich text box / html editor to their blazor application.

### Targets:
- .NET 8

## Adding a Rich Textbox

### Add the JavaScript Reference

Add the following reference to the end of your index.html file:

```html
<script src="_content/RTBlazorfied/js/RTBlazorfied.js"></script>
```

### Add the Element

In this example, the @Html is the html string.

```html
@using RichTextBlazorfied

<RTBlazorfied @ref="box" Html="@Html" />
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

Then add the options:
```csharp
public Action<IRTBlazorfiedOptions> GetOptions() => (o =>
{
    o.Toolbar(o =>
    {
        o.BackgroundColor = "#00FF00";
        o.BorderColor = "#FF0000";
        o.BorderWidth = "1px";
        o.BorderStyle = "solid";
        o.BorderRadius = "10px 0px";
    });
    o.Button(o =>
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
    o.Editor(o =>
    {
        o.Width = "500px";
        o.Height = "700px";
        o.BorderRadius = "10px";
        o.BoxShadow = "3px 3px 5px 6px #ccc";
        o.BorderStyle = "dotted";
        o.BorderWidth = "10px";
        o.BorderColor = "#FF0000";
    });
    o.Content(o =>
    {
        o.ContentBoxShadow = "inset 0 0 7px #eee";
        o.BackgroundColor = "#FFFF99";
        o.TextColor = "#333";
    });
    o.Scrollbar(o =>
    {
        o.Width = "5px";
        o.Opacity = "0.5";
        o.ThumbBackground = "#0000FF";
        o.ThumbBackgroundHover = "#00FFFF";
        o.BackgroundColor = "transparent";
        o.ThumbBorderRadius = "10px";
    });
});
```

### Configure Buttons

RTBlazorfied also provides the ability to specify what buttons should be included:

```csharp
public Action<IRTBlazorfiedOptions> GetOptions() => (o =>
{
    o.Buttons.Add(RTBlazorfiedButton.Bold);
    o.Buttons.Add(RTBlazorfiedButton.Italic);
    o.Buttons.Add(RTBlazorfiedButton.Underline);
    o.Buttons.Add(RTBlazorfiedButton.Strikethrough);
    o.Buttons.Add(RTBlazorfiedButton.Subscript);
    o.Buttons.Add(RTBlazorfiedButton.Superscript);
    o.Buttons.Add(RTBlazorfiedButton.Alignleft);
    o.Buttons.Add(RTBlazorfiedButton.Aligncenter);
    o.Buttons.Add(RTBlazorfiedButton.Alignright);
    o.Buttons.Add(RTBlazorfiedButton.Alignjustify);
    o.Buttons.Add(RTBlazorfiedButton.Indent);
    o.Buttons.Add(RTBlazorfiedButton.Cut);
    o.Buttons.Add(RTBlazorfiedButton.Copy);
    o.Buttons.Add(RTBlazorfiedButton.Delete);
    o.Buttons.Add(RTBlazorfiedButton.Selectall);
    o.Buttons.Add(RTBlazorfiedButton.Undo);
    o.Buttons.Add(RTBlazorfiedButton.Redo);
});
```

###
## Contributions

This project is being developed for free by me, Ryan Kueter, in my spare time. So, if you would like to contribute, please submit your ideas on the Github project page.