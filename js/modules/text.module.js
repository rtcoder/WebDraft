var text = {
    // variables
    hoverSelectRectangle: false,
    isSelecting: false,
    startSelectPoints: [0, 0],
    // functions
    initSelect: function () {
        text.startTextPoints = [webDraft.mPosition.x, webDraft.mPosition.y];
    },
    startSelect: function () {
        if ($("#textRectangle").empty()) {
            if (text.startTextPoints[0] <= webDraft.mPosition.x) {
                var x = text.startTextPoints[0],
                        width = webDraft.mPosition.x - text.startTextPoints[0];
            } else {
                var x = webDraft.mPosition.x,
                        width = text.startTextPoints[0] - webDraft.mPosition.x;
            }
            if (text.startTextPoints[1] <= webDraft.mPosition.y) {
                var y = text.startTextPoints[1],
                        height = webDraft.mPosition.y - text.startTextPoints[1];
            } else {
                var y = webDraft.mPosition.y,
                        height = text.startTextPoints[1] - webDraft.mPosition.y;
            }
            $("#textRectangle")
                    .empty()
                    .show()
                    .css({
                        "top": y + "px",
                        "left": x + "px",
                        "min-height": height + "px",
                        "width": width + "px",
                        "height": height + "px",
                        "border": "1px dashed #fff",
                        "background": "transparent"
                    });
            text.isSelecting = true;
        }
    },
    showTextOptions: function () {
        text.isSelecting = false;
        $("#textOptions").show();
    },
    putLayer: function () {
        $("#textRectangle").css('border', 'none');

        var top = parseInt($("#textRectangle").css('top'));
        var left = parseInt($("#textRectangle").css('left'));
        html2canvas($('#textRectangle'), {
            onrendered: function (canvas) {
                var widthImg = canvas.width;
                var heightImg = canvas.height;
                layers.newLayer();
                layers.setLayerSize(layers.activeId, widthImg, heightImg);
                layers.setLayerPosition(layers.activeId, top, left);
                webDraft.func.positionElements();

                ctx.drawImage(canvas, 0, 0);

                layers.saveState();
                $("#textRectangle")
                        .css({
                            "top": "0px",
                            "left": "0px",
                            "border": "1px dashed rgb(255, 255, 255)"
                        })
                        .width(0)
                        .height(0)
                        .hide()
                        .empty();
            }
        });
    },
    initEvents: function () {
        $("#selectFontType").change(function () {
            $("#textRectangle").css("font-family", $(this).val());
        });
        $("#selectFontSize").change(function () {
            $("#textRectangle").css("font-size", $(this).val() + "px");
        });
        $(".textPostionTool").click(function () {
            $(".textPostionTool").removeClass("active");
            $(this).addClass("active");
            $("#textRectangle").css("text-align", $(this).attr('id'));
        });
        $(".styleTool").click(function () {
            $(this).toggleClass("active");
            switch ($(this).attr("id")) {
                case 'bold':
                    if ($(this).hasClass('active'))
                        $("#textRectangle").css("font-weight", 'bold');
                    else
                        $("#textRectangle").css("font-weight", 'normal');
                    break;
                case 'italic':
                    if ($(this).hasClass('active'))
                        $("#textRectangle").css("font-style", 'italic');
                    else
                        $("#textRectangle").css("font-style", 'normal');
                    break;
                case 'underline':
                case 'line-through':
                    var textDecoration = "";
                    $(".textDecoration.active").each(function () {
                        textDecoration += $(this).attr("id") + " ";
                    });
                    if ($(".textDecoration.active").length > 0)
                        $("#textRectangle").css("text-decoration", textDecoration);
                    else
                        $("#textRectangle").css("text-decoration", 'none');
                    break;
                default:

            }
        });

    }
};
