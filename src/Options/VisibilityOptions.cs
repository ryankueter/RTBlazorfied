namespace RichTextBlazorfied;

internal sealed class VisibilityOptions : IVisibilityOptions
{
    private bool  _clearAll;

    // Dropdowns
    private bool? _font;
    private bool? _size;
    private bool? _format;
    private bool? _textStylesDivider;

    // Text formatting
    private bool? _bold;
    private bool? _italic;
    private bool? _underline;
    private bool? _strikethrough;
    private bool? _subscript;
    private bool? _superscript;
    private bool? _formatDivider;

    // Color
    private bool? _textColor;
    private bool? _textColorDivider;

    // Alignment
    private bool? _alignLeft;
    private bool? _alignCenter;
    private bool? _alignRight;
    private bool? _alignJustify;
    private bool? _alignDivider;

    // Clipboard / selection
    private bool? _copy;
    private bool? _cut;
    private bool? _paste;
    private bool? _delete;
    private bool? _selectAll;
    private bool? _actionDivider;

    // Lists & indent
    private bool? _orderedList;
    private bool? _unorderedList;
    private bool? _indent;
    private bool? _listDivider;

    // Insert
    private bool? _link;
    private bool? _image;
    private bool? _imageUpload;
    private bool? _quote;
    private bool? _codeBlock;
    private bool? _embedMedia;
    private bool? _video;
    private bool? _table;
    private bool? _horizontalRule;
    private bool? _mediaDivider;

    // History
    private bool? _undo;
    private bool? _redo;
    private bool? _historyDivider;

    // View
    private bool? _saveHtml;
    private bool? _htmlView;
    private bool? _preview;
    private bool? _statusBarToggle;

    // Status bar
    private bool? _wordCount;

    public IVisibilityOptions ClearAll()                        { _clearAll         = true;  return this; }

    public IVisibilityOptions Font(bool value = true)           { _font             = value; return this; }
    public IVisibilityOptions Size(bool value = true)           { _size             = value; return this; }
    public IVisibilityOptions Format(bool value = true)         { _format           = value; return this; }
    public IVisibilityOptions TextStylesDivider(bool value = true) { _textStylesDivider = value; return this; }

    public IVisibilityOptions Bold(bool value = true)           { _bold             = value; return this; }
    public IVisibilityOptions Italic(bool value = true)         { _italic           = value; return this; }
    public IVisibilityOptions Underline(bool value = true)      { _underline        = value; return this; }
    public IVisibilityOptions Strikethrough(bool value = true)  { _strikethrough    = value; return this; }
    public IVisibilityOptions Subscript(bool value = true)      { _subscript        = value; return this; }
    public IVisibilityOptions Superscript(bool value = true)    { _superscript      = value; return this; }
    public IVisibilityOptions FormatDivider(bool value = true)  { _formatDivider    = value; return this; }

    public IVisibilityOptions TextColor(bool value = true)      { _textColor        = value; return this; }
    public IVisibilityOptions TextColorDivider(bool value = true) { _textColorDivider = value; return this; }

    public IVisibilityOptions AlignLeft(bool value = true)      { _alignLeft        = value; return this; }
    public IVisibilityOptions AlignCenter(bool value = true)    { _alignCenter      = value; return this; }
    public IVisibilityOptions AlignRight(bool value = true)     { _alignRight       = value; return this; }
    public IVisibilityOptions AlignJustify(bool value = true)   { _alignJustify     = value; return this; }
    public IVisibilityOptions AlignDivider(bool value = true)   { _alignDivider     = value; return this; }

    public IVisibilityOptions Copy(bool value = true)           { _copy             = value; return this; }
    public IVisibilityOptions Cut(bool value = true)            { _cut              = value; return this; }
    public IVisibilityOptions Paste(bool value = true)          { _paste            = value; return this; }
    public IVisibilityOptions Delete(bool value = true)         { _delete           = value; return this; }
    public IVisibilityOptions SelectAll(bool value = true)      { _selectAll        = value; return this; }
    public IVisibilityOptions ActionDivider(bool value = true)  { _actionDivider    = value; return this; }

    public IVisibilityOptions OrderedList(bool value = true)    { _orderedList      = value; return this; }
    public IVisibilityOptions UnorderedList(bool value = true)  { _unorderedList    = value; return this; }
    public IVisibilityOptions Indent(bool value = true)         { _indent           = value; return this; }
    public IVisibilityOptions ListDivider(bool value = true)    { _listDivider      = value; return this; }

    public IVisibilityOptions Link(bool value = true)           { _link             = value; return this; }
    public IVisibilityOptions Image(bool value = true)          { _image            = value; return this; }
    public IVisibilityOptions ImageUpload(bool value = true)    { _imageUpload      = value; return this; }
    public IVisibilityOptions Quote(bool value = true)          { _quote            = value; return this; }
    public IVisibilityOptions CodeBlock(bool value = true)      { _codeBlock        = value; return this; }
    public IVisibilityOptions EmbedMedia(bool value = true)     { _embedMedia       = value; return this; }
    public IVisibilityOptions Video(bool value = true)          { _video            = value; return this; }
    public IVisibilityOptions Table(bool value = true)          { _table            = value; return this; }
    public IVisibilityOptions HorizontalRule(bool value = true) { _horizontalRule   = value; return this; }
    public IVisibilityOptions MediaDivider(bool value = true)   { _mediaDivider     = value; return this; }

    public IVisibilityOptions Undo(bool value = true)           { _undo             = value; return this; }
    public IVisibilityOptions Redo(bool value = true)           { _redo             = value; return this; }
    public IVisibilityOptions HistoryDivider(bool value = true) { _historyDivider   = value; return this; }

    public IVisibilityOptions SaveHtml(bool value = true)       { _saveHtml         = value; return this; }
    public IVisibilityOptions HtmlView(bool value = true)       { _htmlView         = value; return this; }
    public IVisibilityOptions Preview(bool value = true)        { _preview          = value; return this; }
    public IVisibilityOptions StatusBarToggle(bool value = true){ _statusBarToggle  = value; return this; }

    public IVisibilityOptions WordCount(bool value = true)      { _wordCount        = value; return this; }

    internal Dictionary<string, object?> Build()
    {
        var d = new Dictionary<string, object?>();
        if (_clearAll) d["clearAll"] = true;

        void Add(string key, bool? val) { if (val.HasValue) d[key] = val.Value; }

        Add("font",             _font);
        Add("size",             _size);
        Add("format",           _format);
        Add("textStylesDivider",_textStylesDivider);

        Add("bold",             _bold);
        Add("italic",           _italic);
        Add("underline",        _underline);
        Add("strikethrough",    _strikethrough);
        Add("subscript",        _subscript);
        Add("superscript",      _superscript);
        Add("formatDivider",    _formatDivider);

        Add("textColor",        _textColor);
        Add("textColorDivider", _textColorDivider);

        Add("alignLeft",        _alignLeft);
        Add("alignCenter",      _alignCenter);
        Add("alignRight",       _alignRight);
        Add("alignJustify",     _alignJustify);
        Add("alignDivider",     _alignDivider);

        Add("copy",             _copy);
        Add("cut",              _cut);
        Add("paste",            _paste);
        Add("delete",           _delete);
        Add("selectAll",        _selectAll);
        Add("actionDivider",    _actionDivider);

        Add("orderedList",      _orderedList);
        Add("unorderedList",    _unorderedList);
        Add("indent",           _indent);
        Add("listDivider",      _listDivider);

        Add("link",             _link);
        Add("image",            _image);
        Add("imageUpload",      _imageUpload);
        Add("quote",            _quote);
        Add("codeBlock",        _codeBlock);
        Add("embedMedia",       _embedMedia);
        Add("video",            _video);
        Add("table",            _table);
        Add("horizontalRule",   _horizontalRule);
        Add("mediaDivider",     _mediaDivider);

        Add("undo",             _undo);
        Add("redo",             _redo);
        Add("historyDivider",   _historyDivider);

        Add("saveHtml",         _saveHtml);
        Add("htmlView",         _htmlView);
        Add("preview",          _preview);
        Add("statusBarToggle",  _statusBarToggle);

        Add("wordCount",        _wordCount);

        return d;
    }
}
