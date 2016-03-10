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
    V      : false
}

$(document)
    .keydown(function(event) {
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

        if (keys.f12 === true || event.keyCode === 123) {
            event.preventDefault();
        }

        if (keys.f11 === true || event.keyCode === 122) {
            event.preventDefault();
        }

        if (keys.Ctrl === true || event.keyCode === 17) {
            event.preventDefault();
        }

        if (keys.delete === true || event.keyCode === 46) {
            event.preventDefault();

            if(webDraft.selectedTool === "select"){
                select.delSelectedPart();
            }
        }

        if (keys.C === true || event.keyCode === 67) {
            event.preventDefault();

            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.copySelectedPart();
            }
        }

        if (keys.X === true || event.keyCode === 88) {
            event.preventDefault();

            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.cutSelectedPart();
            }
        }

        if (keys.V === true || event.keyCode === 86) {
            event.preventDefault();

            if(webDraft.selectedTool === "select" && keys.Ctrl){
                select.pasteSelectedPart();
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
