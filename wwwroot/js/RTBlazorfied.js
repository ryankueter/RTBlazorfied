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

        element.addEventListener('custom-button-click', function (e) {
            dotNetRef.invokeMethodAsync('OnCustomButtonClick', e.detail?.id ?? '');
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
            await _applyConfigure(element, options);
        }
    }

    /**
     * Applies options via element.configure(), first pulling out and handling
     * the "hunspell" option (not a rt-native.js configure() key — it drives
     * useHunspellSpellChecker so that RTBlazorfiedOptions.UseHunspellSpellChecker()
     * enables the real spellchecker, and the "Spelling" context menu section,
     * as soon as the editor loads.
     */
    async function _applyConfigure(element, options) {
        var hunspell = options.hunspell;
        if (hunspell) delete options.hunspell;
        if (Object.keys(options).length > 0) element.configure(options);
        if (hunspell) await useHunspellSpellChecker(element, hunspell.dictionaryKey);
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
        if (element && options) await _applyConfigure(element, options);
    }

    /**
     * Replaces the className on the rt-native host element, enabling runtime
     * theme switching.  Pass an empty string to clear all classes.
     */
    function setClass(element, cssClass) {
        if (!element) return;
        element.className = cssClass ?? '';
    }

    async function addCustomButton(element, id, title, svg) {
        await _ready;
        if (element) element.addCustomButton({ id, title, svg });
    }

    async function removeCustomButton(element, id) {
        await _ready;
        element?.removeCustomButton(id);
    }

    async function clearCustomButtons(element) {
        await _ready;
        element?.clearCustomButtons();
    }

    /**
     * Enables or disables spellcheck marking without clearing whichever
     * spellchecker is currently configured (see useHunspellSpellChecker /
     * setSpellChecker). No effect until a spellchecker has been supplied.
     */
    async function setSpellCheckEnabled(element, enabled) {
        await _ready;
        element?.setSpellCheckEnabled(enabled);
    }

    /**
     * Configures the real Hunspell engine (compiled to WebAssembly, running
     * fully offline) as the editor's spellchecker. Requires the host page to
     * have already loaded, via plain <script> tags, in this order:
     *   hunspell/hunspell.js
     *   hunspell/hunspell-loader.js
     *   hunspell/dictionaries/<dictionary>-data.js  (defines window.HunspellDictionaries)
     *   hunspell/hunspell-spellchecker.js           (defines window.HunspellSpellChecker)
     * See the RTBlazorfied README for the full setup.
     */
    async function useHunspellSpellChecker(element, dictionaryKey) {
        await _ready;
        if (!element) return;
        if (typeof window.HunspellSpellChecker !== 'function') {
            throw new Error(
                'RTBlazorfied: window.HunspellSpellChecker was not found. Add the ' +
                'hunspell/*.js <script> tags to your host page before enabling Hunspell ' +
                '(see the RTBlazorfied README\'s "Spellcheck (Hunspell)" section).'
            );
        }
        var options = {};
        if (dictionaryKey && window.HunspellDictionaries) {
            options.dictionary = window.HunspellDictionaries[dictionaryKey];
        }
        element.setSpellChecker(new window.HunspellSpellChecker(options));
    }

    /** Removes the currently configured spellchecker, if any. */
    async function clearSpellChecker(element) {
        await _ready;
        element?.setSpellChecker(null);
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
        addCustomButton,
        removeCustomButton,
        clearCustomButtons,
        setSpellCheckEnabled,
        useHunspellSpellChecker,
        clearSpellChecker,
    };
}());
