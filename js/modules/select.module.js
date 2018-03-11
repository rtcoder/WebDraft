class Select {
    constructor() {
        $('#drawHandler').append('<div id="selectRectangle"></div>');
        this.hoverSelectRectangle = false;
        this.isSelecting = false;
        this.startSelectPoints = {
            x: 0,
            y: 0
        };
    }
    initSelect() {
        this.startSelectPoints = {
            x: webDraft.mPosition.x,
            y: webDraft.mPosition.y
        };
    }
    startSelect() {
        let x, y, width, height;
        if (this.startSelectPoints.x <= webDraft.mPosition.x) {
            x = this.startSelectPoints.x;
            width = webDraft.mPosition.x - this.startSelectPoints.x;
        } else {
            x = webDraft.mPosition.x;
            width = this.startSelectPoints.x - webDraft.mPosition.x;
        }
        if (this.startSelectPoints.y <= webDraft.mPosition.y) {
            y = this.startSelectPoints.y;
            height = webDraft.mPosition.y - this.startSelectPoints.y;
        } else {
            y = webDraft.mPosition.y;
            height = this.startSelectPoints.y - webDraft.mPosition.y;
        }
        $("#selectRectangle")
                .show()
                .css({
                    "top": y + parseInt($(canvas).css('top')) + "px",
                    "left": x + parseInt($(canvas).css('left')) + "px",
                    "width": width + "px",
                    "height": height + "px",
                    "border": "1px dashed #fff",
                    "background": "transparent"
                });
        this.isSelecting = true;
    }
    selectOpt() {
        this.isSelecting = false;
    }
    delSelectedPart() {
        if ($("#selectRectangle").css("background-image") === "none") {//if selectRectangle is empty then clear part of image hovered by it
            xpos = parseInt($("#selectRectangle").css("left"));
            ypos = parseInt($("#selectRectangle").css("top"));
            ctx.clearRect(xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height());
        } else { //else clear only selectRectangle background
            $("#selectRectangle").css({"background": "transparent"});
        }

        layers.saveState();
        $("#selectRectangle")
                .css({
                    "top": "0px",
                    "left": "0px",
                    "background": "transparent"
                })
                .width(0)
                .height(0)
                .hide();
    }
    copySelectedPart() {
        if ($("#selectRectangle").css("background-image") === "none") {
            $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + $("#selectRectangle").width() + '" height="' + $("#selectRectangle").height() + '"></canvas>');

            var xpos = parseInt($("#selectRectangle").css("left"));
            var ypos = parseInt($("#selectRectangle").css("top"));
            var testC = document.getElementById("tmpCanvas");
            var testCtx = testC.getContext('2d');

            testCtx.drawImage(canvas, xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height(), 0, 0, $("#selectRectangle").width(), $("#selectRectangle").height());

            var bgImg = testC.toDataURL();

            $("#tmpCanvas").remove();
            $("#selectRectangle").css({"background": "url(" + bgImg + ") -1px -1px no-repeat"});
        }
    }
    cutSelectedPart() {
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + $("#selectRectangle").width() + '" height="' + $("#selectRectangle").height() + '"></canvas>');

        var xpos = parseInt($("#selectRectangle").css("left"));
        var ypos = parseInt($("#selectRectangle").css("top"));
        var testC = document.getElementById("tmpCanvas");
        var testCtx = testC.getContext('2d');

        testCtx.drawImage(canvas, xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height(), 0, 0, $("#selectRectangle").width(), $("#selectRectangle").height());

        var bgImg = testC.toDataURL();

        $("#tmpCanvas").remove();
        $("#selectRectangle").css({"background": "url(" + bgImg + ") -1px -1px no-repeat "});

        ctx.clearRect(xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height());
        layers.saveState();
    }
    pasteSelectedPart() {
        if ($("#selectRectangle").css("background-image") !== "none") {
            var xpos = parseInt($("#selectRectangle").css("left"));
            var ypos = parseInt($("#selectRectangle").css("top"));
            var img = new Image();
            var bg = $("#selectRectangle")
                    .css("background-image")
                    .replace('url(', '')
                    .replace(')', '')
                    .replace('"', '')
                    .replace('"', '');
            img.onload = function () {
                ctx.drawImage(img, xpos, ypos); //save part of image when loaded

                layers.saveState(); //and then update layer preview
            };
            img.src = bg;
            $("#selectRectangle")
                    .css({
                        "top": "0px",
                        "left": "0px",
                        "background": "transparent"
                    })
                    .width(0)
                    .height(0)
                    .hide();
        }
    }
}
;