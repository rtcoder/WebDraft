var events = {
    color: function () {
        //setting first Color
        $("#generalColor").click(function () {
            $("input[type=color]#firstColor").click();
        });
        //setting shadow Color
        $("#shadowColor").click(function () {
            $("input[type=color]#shadowColorVal").click();
        });
        //setting fill Color
        $("#fillColor").click(function () {
            $("input[type=color]#fillColorVal").click();
        });
        //changing first color input
        $("input[type=color]#firstColor").change(function () {
            $("#generalColor .color").css({"background": $(this).val()});
            webDraft.color = $(this).val();
            $("#textRectangle").css('color', $(this).val());
        });
        //changing shadow color input
        $("input[type=color]#shadowColorVal").change(function () {
            $("#shadowColor .color").css({"background": $(this).val()});
            webDraft.shadow.color = $(this).val();
        });
        //changing fill color input
        $("input[type=color]#fillColorVal").change(function () {
            $("#fillColor .color").css({"background": $(this).val()});
            shapes.fill.color = $(this).val();
        });
    },
    info: function () {
        $(".close-info").click(function () {
            $("#info").hide();
        });
    },
    buttons: function () {
        $("input[type=checkbox]#isShadow").change(function () {
            webDraft.shadow.isShadow = $(this).is(":checked");//return true if is :checked or false if not

            if (webDraft.shadow.isShadow) {
                $("#shadowColor, #shadow_slider, #shadowSquare").show();
            } else {
                $("#shadowColor, #shadow_slider, #shadowSquare").hide();
            }
        });
        $("input[type=checkbox]#isFillSet").change(function () {
            shapes.fill.isSet = $(this).is(":checked");//return true if is :checked or false if not

            if (shapes.fill.isSet) {
                $("#fillColor, #fillOpacity_slider").show();
            } else {
                $("#fillColor, #fillOpacity_slider").hide();
            }
        });

        $("#resizeDraw").click(function () {
            $("#resizer").fadeIn();
            $("input[type=number]#drawWidth").val(webDraft.draw.width);
            $("input[type=number]#drawHeight").val(webDraft.draw.height);
            $("#resizeinfo").html(webDraft.draw.width + " <i class='fa fa-times'></i> " + webDraft.draw.height);
        });

        $(".paintTool").click(function () {
            $(".paintTool").removeClass("active");
            $(this).addClass("active");

            var thisId = $(this).attr("id");

            webDraft.selectedTool = thisId;

            if (thisId === COLORSAMPLER) {
                $("#previewColorSampler").show();
            } else {
                $("#previewColorSampler").hide();
            }

            if (thisId === WEB) {
                $("#sensitivityPoints_slider").show();
            } else {
                $("#sensitivityPoints_slider").hide();
            }

            if (thisId === ERASER) {
                $("#eraseRect").show();
                $("#draw, #drawHandler, #eventHandler").css({"cursor": "none"});
            } else {
                $("#eraseRect").hide();
                $("#draw, #drawHandler, #eventHandler").css({"cursor": "default"});
            }

            if (thisId !== RECTANGLE) {
                $("#prepareRect").hide();
            }

            if (thisId !== CIRCLE) {
                $("#prepareCircle").hide();
            }

            if (thisId !== SELECT) {
                $("#selectRectangle").hide();
                $("#hint, .hintGroup#selecting").hide();
            } else {
                $("#hint, .hintGroup#selecting").show();
            }

            if (thisId !== TEXT) {
                $("#textRectangle, #textOptions").hide();
            }

            if (thisId === RECTANGLE || thisId === CIRCLE) {
                $("#fillShapeInput").show();
            } else {
                $("#fillShapeInput").hide();
                $("input#isFillSet").attr('checked', false).change();
            }
        });
    },
    sliders: function () {
        //changing size
        $("input[type=range]#pointSize").on('mousemove touchmove', function () {
            webDraft.size = $(this).val();
            $("#pointSizeValue").text("size:" + $(this).val() + "px");
        });
        //changing shadow blur
        $("input[type=range]#ShadowBlur").on('mousemove touchmove', function () {
            webDraft.shadow.blur = $(this).val();
            $("#ShadowBlurValue").text("blur:" + $(this).val() + "px");
        });
        //changing sensitivity of web points
        $("input[type=range]#sensitivityPoints").on('mousemove touchmove', function () {
            webDraft.sensitivityPoints = $(this).val();
            $("#sensitivityPointsValue").text("sensitivity:" + Math.floor($(this).val() / 100) + "%");
        });
        //changing fill opacity
        $("input[type=range]#fillOpacity").on('mousemove touchmove', function () {
            shapes.fill.opacity = $(this).val();
            $("#fillOpacityValue").text("fill opacity:" + Math.floor($(this).val()) + "%");
        });
    },
    resizer: function () {
        $("#resizer")
                .draggable({
                    snap: true,
                    opacity: 0.75
                })
                .css({"position": "absolute"});
        $("#resizer input[type=number]").change(function () {
            var xSize = parseInt($("input[type=number]#drawWidth").val());
            var ySize = parseInt($("input[type=number]#drawHeight").val());
            $("#resizeinfo").html(xSize + " <i class='fa fa-times'></i> " + ySize);
        }).keyup(function (e) {
            $(this).change();

            if (e.keyCode === 13) {
                $("#apply").click();
            } else if (e.keyCode === 27) {
                $("#cancel").click();
            }
        });

        $("#cancel").click(function () {
            $("#resizer").fadeOut();
            $("input[type=number]#drawWidth").val(webDraft.draw.width);
            $("input[type=number]#drawHeight").val(webDraft.draw.height);
        });
        $("#apply").click(function () {
            $("#resizer").fadeOut();
            if ($("#allLayersResizing").is(":checked")) {
                var w = $("input[type=number]#drawWidth").val(),
                        h = $("input[type=number]#drawHeight").val();

                layers.setLayerSize('', w, h);
            } else {
                var w = $("input[type=number]#drawWidth").val(),
                        h = $("input[type=number]#drawHeight").val();

                layers.setLayerSize(layers.activeId, w, h);
            }
            webDraft.func.positionElements();
        });
    },

};