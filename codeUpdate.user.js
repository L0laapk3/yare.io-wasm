// ==UserScript==
// @name         Yare AutoUpload
// @namespace    https://github.com/L0laapk3/yare.io-wasm
// @version      1.1
// @description  Automatically upload code to yare.io.
// @author       L0laapk3
// @downloadURL  https://github.com/L0laapk3/yare.io-wasm/raw/master/codeUpdate.user.js
// @icon         https://www.google.com/s2/favicons?domain=yare.io
// @require      https://greasyfork.org/scripts/421384-gm-fetch/code/GM_fetch.js?version=898562
// @match        https://yare.io/d1/*
// @match        https://yare.io/set_code
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      127.0.0.1

// ==/UserScript==


(function() {
    'use strict';

    const UPDATE_ONLY_ACTIVE_TABS = false;


    async function poll() {
        setTimeout(poll, 2000);
        console.log("polling");
        if (focus) {
            const req = GM_fetch("http://127.0.0.1:8194");
            req.catch(_ => {}).then(async r => {
                console.log(r);
                if (!r)
                    return;
                const code = await (r.text());
                localStorage.code_code = code;
                if (window.location.pathname == "/set_code")
                    window.close();
                editor.setValue(code);
                update_code();
            });
        }
    }
    let focus = true;
    function checkPanel() {
        const panel = document.getElementById("panel");
        console.log("panel", unsafeWindow.editor_container_el);
        if (!panel || !unsafeWindow.editor_container_el)
            return setTimeout(checkPanel, 50);
        panel.style.width = "20px";
        unsafeWindow.editor_container_el.style.width = "20px";
        unsafeWindow.editor.resize();

        poll();
    }
    if (window.location.pathname == "/set_code")
        poll();
    else {
        if (UPDATE_ONLY_ACTIVE_TABS) {
            window.onblur = _ => focus = false;
            window.onfocus = _ => focus = true;
        }
        checkPanel();
    }

})();