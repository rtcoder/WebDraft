var text = {
    // variables
    size  : 20,
    align : "left",
    font  : "Arial",
    style : "",
    value : "",
    pos: {
        x : 0,
        y : 0
    },
    // functions
    drawText : function() {
        text.value = $("#textValue").val();
        text.font  = $("#selectFontType").val();
        text.size  = $("#selectFontSize").val();
        if (text.value !== "") {
            text.pos.x    = webDraft.mPosition.x;
            text.pos.y    = webDraft.mPosition.y;
            ctx.font      = text.style + " " + text.size + "mm " + text.font;
            ctx.textAlign = text.align;
            ctx.fillStyle = webDraft.color;

            ctx.fillText(text.value, text.pos.x, text.pos.y);

            text.value = "";
        }
    }
}
