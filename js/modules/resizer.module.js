class Resizer {
    constructor() {
        let $this = this;
        $.get('parts/resizer.part.html', function (data) {
            $('#resizer').html(data);

            $("#resizer input[type=number]").keyup(function (e) {
                $this.onkeyup(e);
            });
        });
    }
    show() {
        $("#resizer").show();
        $("input[type=number]#drawWidth").val(webDraft.draw.width);
        $("input[type=number]#drawHeight").val(webDraft.draw.height);
        $("#resizeinfo").html(webDraft.draw.width + " <i class='fas fa-times'></i> " + webDraft.draw.height);
    }
    cancel() {
        $("#resizer").hide();
        $("input[type=number]#drawWidth").val(webDraft.draw.width);
        $("input[type=number]#drawHeight").val(webDraft.draw.height);
    }
    apply() {
        $("#resizer").hide();
        let w, h;
        if ($("#allLayersResizing").is(":checked")) {
            w = $("input[type=number]#drawWidth").val();
            h = $("input[type=number]#drawHeight").val();

            layers.setLayerSize('', w, h);
        } else {
            w = $("input[type=number]#drawWidth").val();
            h = $("input[type=number]#drawHeight").val();

            layers.setLayerSize(layers.activeId, w, h);
        }
        webDraft.func.positionElements();
    }
    onkeyup(e) {
        this.onchange();

        if (e.keyCode === 13) {
            $("#apply").click();
        }
    }
    onchange() {
        let xSize = parseInt($("input[type=number]#drawWidth").val());
        let ySize = parseInt($("input[type=number]#drawHeight").val());
        $("#resizeinfo").html(xSize + " <i class='fas fa-times'></i> " + ySize);
    }
}