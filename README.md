# RT Blazorfied

Author: Ryan Kueter  
Updated: July, 2024

## About

**RT Blazorfied** is a free .NET library available from the [NuGet Package Manager](https://www.nuget.org/packages/RTBlazorfied) that allows Blazor developers to easily add a rich text box / html editor to their Blazor application. The editor uses [Google's Font Icons](https://fonts.google.com/icons). It does not reference the icon library. However, it does embed .svg versions of those icons so they are customizable. It also uses the shadow DOM to isolate the styles from being polluted by existing page styles. Because of that, it applies some of its own styling to help the user to visualize the components. Users are also able to add CSS classes to many components allowing them to customize their appearance.

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

<RTBlazorfied @ref="box" @bind-Value="@Html" Height="500px" Width="1000px" />
```

The element reference provides another way to get the html or plaintext:
```csharp
private RTBlazorfied? box { get; set; }

private async Task<string?> GetHtml() =>
        await box!.GetHtmlAsync();

private async Task<string?> GetPlainText() =>
        await box!.GetPlainTextAsync();
```

### Configure the Options

RTBlazorfied was designed to allow developers to highly customize the appearance of the rich textbox with the following configuration options:
```html
<RTBlazorfied @bind-Value="@Html" Options="@GetOptions()" />
```

CSS variables, e.g., var(--my-variable) are interchangeable with these styles. And omitting the ButtonVisibility options will display all the buttons.
```csharp
public Action<IRTBlazorfiedOptions> GetOptions() => (o =>
{
    o.ToolbarStyles(o =>
    {
        o.BackgroundColor = "#00FF00";
        o.BorderColor = "var(--border-color)";
        o.BorderWidth = "1px";
        o.BorderStyle = "solid";
        o.BorderRadius = "10px 0px";
        o.DropdownBackgroundColor = "var(--background-color)";
        o.DropdownTextColor = "#FFFFFF";
        o.DropdownBackgroundColorHover = "#777777";
        o.DropdownTextColorHover = "#FFFFAA";
    });
    o.ModalStyles(o =>
    {
        o.RemoveCSSClassInputs();
        o.BackgroundColor = "#333333";
        o.TextColor = "#FFFFAA";
        o.TextSize = "20px";
        o.TextFont = "Comic Sans MS";
        o.TextboxBackgroundColor = "#333333"; // Texbox refers to inputs
        o.TextboxTextColor = "#FFFFAA";
        o.TextboxBorderColor = "#FFFFAA";
        o.CheckboxAccentColor = "#FFFFAA";
    });
    o.ButtonStyles(o =>
    {
        o.TextColor = "#ff0000";
        o.TextSize = "30px";
        o.TextFont = "Comic Sans MS";
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
        o.TextColor = "#FFFFAA";
        o.TextSize = "30px";
        o.TextFont = "Comic Sans MS";
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
        o.AlignLeft = true;
        o.AlignCenter = true;
        o.AlignRight = true;
        o.AlignJustify = true;
        o.Copy = true;
        o.Cut = true;
        o.Delete = true;
        o.SelectAll = true;
        o.Image = true;
        o.Link = true;
        o.OrderedList = true;
        o.UnorderedList = true;
        o.Indent = true;
        o.Undo = true;
        o.Redo = true;
        o.Quote = true;
        o.CodeBlock = true;
        o.EmbedMedia = true;

        // Dividers
        o.TextStylesDivider = false;
        o.FormatDivider = false;
        o.TextColorDivider = false;
        o.AlignDivider = false;
        o.ActionDivider = false;
        o.ListDivider = false;
        o.MediaDivider = false;
        o.HistoryDivider = false;
    });
});
```
### Shortcut Keys

Bold: Ctrl + B  
Italic: Ctrl + I   
Underline: Ctrl + U   
Strikethrough: Ctrl + D  
Subscript: Ctrl + =  
Superscript: Ctrl + Shift + [+]  
Text Color: Ctrl + Shift + C  
Text Background Color: Ctrl + shift + B  
Align Left: Ctrl + L  
Align Center: Ctrl + E  
Align Right: Ctrl + R  
Align Justify: Ctrl + J  
Cut: Ctrl + X  
Copy: Ctrl + C  
Paste: Ctrl + V  
Select All: Ctrl + A  
Ordered List: Ctrl + Shift + O  
Unordered List: Ctrl + Shift + U  
Increase Indent: Tab  
Decrease Indent: Shift + Tab  
Insert Link: Ctrl + Shift + K  
Insert Image: Ctrl + Shift + I  
Insert Quote: Ctrl + Shift + Q  
Insert Media: Ctrl + Shift + M  
Insert Table: Ctrl + Shift + L  
Insert Code Block: Ctrl + Shift + [*]  
Undo: Ctrl + Z  
Redo: Ctrl + Y  
Format: Ctrl + Shift + [D, P, 1, 2, 3, and so on]  
Size: Ctrl + Shift + [<, >]  
Toggle Code and HTML: Ctrl + Shift + A  


###
## Contributions

This project is being developed for free by me, Ryan Kueter, in my spare time. So, if you would like to contribute, please submit your ideas on the Github project page.