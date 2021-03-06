var events = {
    color: function () {
        $('#generalColor').colorpicker({
            onSelect: function (color) {
                $('#generalColor .color').css({
                    'background': color.hex
                });
                webDraft.color = color.hex;
            }
        }, './vendor/rtcoder/colorpicker/html/colorpicker.html');

        $('#shadowColor').colorpicker({
            onSelect: function (color) {
                $('#shadowColor .color').css({
                    'background': color.hex
                });
                webDraft.shadow.color = color.hex;
            }
        }, './vendor/rtcoder/colorpicker/html/colorpicker.html');

        $('#fillColor').colorpicker({
            onSelect: function (color) {
                $('#fillColor .color').css({
                    'background': color.hex
                });
                shapes.fill.color = color.hex;
            }
        }, './vendor/rtcoder/colorpicker/html/colorpicker.html');

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
    }

};