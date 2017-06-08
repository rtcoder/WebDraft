var keys = {
    Enter: false, //press Enter
    Esc: false, //press Escape (Esc)
    f11: false, //press F11
    f12: false, //press F12
    delete: false, //press delete
    C: false,
    X: false,
    V: false,
    O: false,
    I: false
};

$(document)
        .keydown(function (event) {
            if (webDraft.selectedTool != 'text' && $('#resizer').is('hidden')) {
                event.preventDefault();
            }

            switch (event.keyCode) {
                case 13 :
                    keys.Enter = true;
                    break;
                case 27 :
                    keys.Esc = true;
                    break;
                case 46 :
                    keys.delete = true;
                    break;
                case 67 :
                    keys.C = true;
                    break;
                case 73 :
                    keys.I = true;
                    break;
                case 79 :
                    keys.O = true;
                    break;
                case 83 :
                    keys.S = true;
                    break;
                case 86 :
                    keys.V = true;
                    break;
                case 88 :
                    keys.X = true;
                    break;
                case 122 :
                    keys.f11 = true;
                    break;
                case 123 :
                    keys.f12 = true;
                    break;
            }
            if (keys.delete) {
                if (webDraft.selectedTool === "select") {
                    select.delSelectedPart();
                }
                if (event.ctrlKey) {
                    $("#btnCLear").click();
                }
            }

            if (keys.f12 || keys.f11 || event.ctrlKey || keys.delete) {
                event.preventDefault();
            }

            if (keys.C) {
                if (webDraft.selectedTool === "select" && event.ctrlKey) {
                    select.copySelectedPart();
                }
            }

            if (keys.I) {
                if (event.ctrlKey) {
                    $("#info").toggle();
                }
            }

            if (keys.X) {
                if (webDraft.selectedTool === "select" && event.ctrlKey) {
                    select.cutSelectedPart();
                }
            }

            if (keys.V) {
                if (webDraft.selectedTool === "select" && event.ctrlKey) {
                    select.pasteSelectedPart();
                }
            }
            if (keys.O) {
                if (event.ctrlKey) {
                    $("#fileUploader").click();
                }
            }
            if (keys.S) {
                if (event.ctrlKey) {
                    file.download();
                }
            }

        })
        .keyup(function (event) {
            switch (event.keyCode) {
                case 13 :
                    keys.Enter = false;
                    break;
                case 27 :
                    keys.Esc = false;
                    break;
                case 46 :
                    keys.delete = false;
                    break;
                case 67 :
                    keys.C = false;
                    break;
                case 73 :
                    keys.I = false;
                    break;
                case 79 :
                    keys.O = false;
                    break;
                case 83 :
                    keys.S = false;
                    break;
                case 86 :
                    keys.V = false;
                    break;
                case 88 :
                    keys.X = false;
                    break;
                case 122 :
                    keys.f11 = false;
                    break;
                case 123 :
                    keys.f12 = false;
                    break;
            }
        });

$(window).bind('mousewheel DOMMouseScroll', function (event) {
    if (event.ctrlKey === true) {
         event.preventDefault();

        if (event.originalEvent.wheelDelta / 120 > 0) {
            if (webDraft.size < 250)
                webDraft.size+=2;
        } else {
            if (webDraft.size > 1)
                webDraft.size-=2;
        }

        $("input#pointSize").val(webDraft.size);
        $("#pointSizeValue").text("size:" + webDraft.size + "px");
    }

    if (event.altKey === true) {
        // event.preventDefault();
    }
});