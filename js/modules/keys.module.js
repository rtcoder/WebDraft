var keys = {
    Ctrl   : false, //press Control (Ctrl)
    Shift  : false, //press Shift
    Alt    : false, //press Alt
    Enter  : false, //press Enter
    Esc    : false, //press Escape (Esc)
    f11    : false, //press F11
    f12    : false, //press F12
    delete : false, //press delete
    C      : false,
    X      : false,
    V      : false,
    O      : false
}

$(document)
    .keydown(function(event) {
        if(webDraft.selectedTool != 'text' && $('#resizer').is('hidden')){
            event.preventDefault();
        }

        console.log(event.keyCode)
        switch (event.keyCode) {
            case 13 :
                keys.Enter = true;
            break;
            case 16 :
                keys.Shift = true;
            break;
            case 17 :
                keys.Ctrl = true;
            break;
            case 18 :
                keys.Alt = true;
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
            if(webDraft.selectedTool === "select"){
                select.delSelectedPart();
            }
        }

        if (keys.f12 || keys.f11 || keys.Ctrl || keys.delete) {
            event.preventDefault();
        }

        if (keys.C) {
            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.copySelectedPart();
            }
        }

        if (keys.X) {
            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.cutSelectedPart();
            }
        }

        if (keys.V) {
            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.pasteSelectedPart();
            }
        }
        if (keys.O) {
            if(keys.Ctrl){
                $("#fileUploader").click();
            }
        }
        if (keys.S) {
            if(keys.Ctrl){
                file.download()
            }
        }

    })
    .keyup(function(event) {
        switch (event.keyCode) {
            case 13 :
                keys.Enter = false;
            break;
            case 16 :
                keys.Shift = false;
            break;
            case 17 :
                keys.Ctrl = false;
            break;
            case 18 :
                keys.Alt = false;
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
    })

$(window).bind('mousewheel DOMMouseScroll', function(event) {
    if (keys.Ctrl === true) {
        // event.preventDefault();

        if (event.originalEvent.wheelDelta / 120 > 0) {
            if (webDraft.size < 250)
                webDraft.size++;
        }
        else {
            if (webDraft.size > 1)
                webDraft.size--;
        }

        $("input#pointSize").val(webDraft.size);
        $("#pointSizeValue").text("size:" + webDraft.size + "px");
    }

    if (keys.Alt === true) {
        // event.preventDefault();
    }
});
