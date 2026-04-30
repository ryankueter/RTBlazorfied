/**
 * RTBlazorfied.js — Blazor interop bridge for the rt-native web component.
 *
 * Author: Ryan A. Kueter
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * Add a single script tag to your host page and this file handles everything:
 *   <script src="_content/RTBlazorfied/js/RTBlazorfied.js"></script>
 *
 * rt-native.js is loaded automatically from the same directory — no second
 * script tag is needed.
 */
(function () {
    'use strict';

    // ── Load rt-native.js once ───────────────────────────────────────────────
    // Capture the script's own URL before any async work so we can resolve
    // a sibling path even if document.currentScript is later cleared.
    var _base = (function () {
        var s = document.currentScript;
        if (s && s.src) return s.src.substring(0, s.src.lastIndexOf('/') + 1);
        return '_content/RTBlazorfied/js/';
    }());

    var _ready = new Promise(function (resolve, reject) {
        if (customElements.get('rt-native')) {
            resolve(); // already registered by a previous load
            return;
        }
        var script = document.createElement('script');
        script.src    = _base + 'rt-native.js';
        script.onload  = resolve;
        script.onerror = function () {
            reject(new Error('RTBlazorfied: failed to load rt-native.js from ' + script.src));
        };
        document.head.appendChild(script);
    });

    // ── Interop functions ────────────────────────────────────────────────────

    /**
     * Wires up a change listener and applies initial state to the editor element.
     * Awaits _ready so that rt-native.js is fully loaded and the custom element
     * is registered before any RichTextBox methods are called.
     */
    async function initialize(element, dotNetRef, value, placeholder, readOnly, ariaLabel, options) {
        await _ready;
        if (!element) return;

        element.addEventListener('change', function (e) {
            dotNetRef.invokeMethodAsync('OnValueChanged', e.detail?.value ?? '');
        });

        // Patch _applyContentStyles to a no-op on this element instance so that
        // setPreviewCssFiles / setPreviewCss only affect the preview dialog iframe.
        // The preview dialog already receives the CSS through the cssLinks mechanism
        // built from _previewCssUrls in the preview template (populated by
        // _syncToInstance(), which is NOT patched and continues to run normally).
        // Suppressing _applyContentStyles prevents the same CSS from also being
        // scoped and injected into the editor's shadow DOM (the editing area).
        element._applyContentStyles = function () {};

        if (value)       element.setValue(value);
        if (placeholder) element.setAttribute('placeholder', placeholder);
        if (readOnly)    element.setAttribute('readonly', '');
        if (ariaLabel)   element.setAttribute('aria-label', ariaLabel);

        // configure() must be called AFTER the web component's own _initialize() has
        // run, not before. The toolbar HTML is built by _render() in connectedCallback.
        // If configure() is called while _initialized is still false, it updates
        // _visibility but _reinitialize() is never triggered, so the toolbar keeps its
        // default button set. Waiting one animation frame lets the _initialize() rAF
        // fire first, setting _initialized = true. configure() then finds an initialized
        // element and correctly calls _reinitialize() to rebuild the toolbar.
        if (options) {
            await new Promise(function (resolve) { requestAnimationFrame(resolve); });
            element.configure(options);
        }
    }

    function getValue(element)   { return element?.getValue()   ?? ''; }
    function setValue(element, html) { element?.setValue(html   ?? ''); }
    function getPlainText(element)   { return element?.getPlainText() ?? ''; }

    // The remaining mutating functions also await _ready so they are safe when
    // called concurrently with initialisation (e.g. from the host page's own
    // OnAfterRenderAsync running alongside the component's OnAfterRenderAsync).

    async function setReadOnly(element, on) {
        await _ready;
        element?.setReadOnly(on);
    }

    async function setPreviewCssFiles(element, urls) {
        await _ready;
        if (element && urls) element.setPreviewCssFiles(...urls);
    }

    async function setPreviewCss(element, css) {
        await _ready;
        element?.setPreviewCss(css ?? '');
    }

    async function configure(element, options) {
        await _ready;
        if (element && options) element.configure(options);
    }

    /**
     * Replaces the className on the rt-native host element, enabling runtime
     * theme switching.  Pass an empty string to clear all classes.
     */
    function setClass(element, cssClass) {
        if (!element) return;
        element.className = cssClass ?? '';
    }

    // ── Expose global ────────────────────────────────────────────────────────

    window.RTBlazorfiedInterop = {
        initialize,
        getValue,
        setValue,
        getPlainText,
        setReadOnly,
        setPreviewCssFiles,
        setPreviewCss,
        configure,
        setClass,
    };
}());
