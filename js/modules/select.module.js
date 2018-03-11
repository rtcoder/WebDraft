var select = {
    hoverSelectRectangle: false,
    isSelecting: false,
    startSelectPoints: [0, 0],
    // functions
    initSelect: function () {
        select.startSelectPoints = [webDraft.mPosition.x, webDraft.mPosition.y];
    },
    startSelect: function () {
        if (select.startSelectPoints[0] <= webDraft.mPosition.x) {
            var x = select.startSelectPoints[0],
                    width = webDraft.mPosition.x - select.startSelectPoints[0];
        } else {
            var x = webDraft.mPosition.x,
                    width = select.startSelectPoints[0] - webDraft.mPosition.x;
        }
        if (select.startSelectPoints[1] <= webDraft.mPosition.y) {
            var y = select.startSelectPoints[1],
                    height = webDraft.mPosition.y - select.startSelectPoints[1];
        } else {
            var y = webDraft.mPosition.y,
                    height = select.startSelectPoints[1] - webDraft.mPosition.y;
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
        select.isSelecting = true;
    },
    selectOpt: function () {
        select.isSelecting = false;
    },
    delSelectedPart: function () {
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
    },
    copySelectedPart: function () {
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
    },
    cutSelectedPart: function () {
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
    },
    pasteSelectedPart: function () {
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
};