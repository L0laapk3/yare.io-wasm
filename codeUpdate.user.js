// ==UserScript==
// @name         Yare AutoUpload
// @namespace    https://github.com/L0laapk3/yare.io-wasm
// @version      0.1
// @description  Automatically upload code to yare.io.
// @author       L0laapk3
// @match        https://yare.io/d1/*
// @icon         https://www.google.com/s2/favicons?domain=yare.io
// @run-at       document-start
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    const UPDATE_ONLY_ACTIVE_TABS = false;


    let focus = true;
    window.onblur = _ => focus = false;
    window.onfocus = _ => focus = true;

    function checkPanel() {
        const panel = document.getElementById("panel");
        if (!panel || !window.editor_container_el || !window.update_code)
            return setTimeout(checkPanel, 50);
        panel.style.width = "20px";
        window.editor_container_el.style.width = "20px";
        window.editor.resize();

        setInterval(async _ => {
            if (focus || !UPDATE_ONLY_ACTIVE_TABS) {
                const req = fetch("http://127.0.0.1:8194");
                req.catch(_ => {}).then(async r => {
                    if (!r)
                        return;
                    editor.setValue(await (r.text()));
                    update_code();
                });
            }
        }, 2000);
    }
    checkPanel();
})();
