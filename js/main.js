var canvas,
    ctx,
    randomId,
    points   = [],
    webDraft = {
        title   : "WebDraft",
        version : "2.2.0",
        click   : {
            left  : false, //left mouse button
            right : false  //right mouse button
        },
        mPosition : {//mouse position on draw
            x : 0,
            y : 0
        },
        draw : {
            width        : 400,
            height       : 400,
            thisParrent  : "#drawHandler",
            selectorId   : "#draw",
            eventHandler : "#eventHandler",
            bg           : "url('pic/transparent.png') repeat"
        },
        shadow : {
            isShadow : false,
            blur     : 1,
            offsetX  : 0,
            offsetY  : 0,
            color    : "#232324"
        },
        sensitivityPoints : 1000,
        size              : 10,
        color             : "#000000",
        selectedTool      : "pencil", //default is pencil
        func : {
            makeid : function() {
                var text     = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 15; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            },
            resize : function() {
                $("html, body, #paint").css({
                    "width"  : $(window).width(),
                    "height" : $(window).height()
                });
                $("#content").css({
                    "width"  : $(window).width(),
                    "height" : $(window).height() - $("#statusbar").height()
                }).perfectScrollbar();
                $("#resizer").css({
                    marginLeft : ($("#content").width() - $("#resizer").width()) / 2 + "px",
                    marginTop  : ($("#content").height() - $("#resizer").height()) / 2 + "px"
                });
                $("#textOptions").css({
                    marginLeft : ($("#content").width() - $("#textOptions").width()) / 2 + "px",
                    marginTop  : ($("#content").height() - $("#textOptions").height()) / 2 + "px"
                });
                $("#listLayers").perfectScrollbar();
            },
            positionElements : function() {
                var image = {
                    id  : new Array(),
                    img : new Array()
                };

                var active = layers.activeId;
                for (var i = 0; i < layers.list.id.length; i++) {
                    if (typeof layers.list.id[i] === "string") {
                        layers.select(layers.list.id[i]);
                        image.img[i] = ctx.getImageData(0, 0, webDraft.draw.width, webDraft.draw.height);
                        image.id[i] = layers.list.id[i];
                    }
                }

                $(webDraft.draw.selectorId + "," + webDraft.draw.eventHandler).css({
                    "width"  : webDraft.draw.width,
                    "height" : webDraft.draw.height
                });
                $(webDraft.draw.thisParrent).css({
                    "background" : webDraft.draw.bg,
                    "width"      : webDraft.draw.width,
                    "height"     : webDraft.draw.height
                });

                if (webDraft.draw.width >= $("#content").width()) {
                    $(webDraft.draw.thisParrent).css({ "margin-left" : "0px" });
                } else {
                    $(webDraft.draw.thisParrent).css({ "margin-left" : ($("#content").width() - webDraft.draw.width) / 2 });
                }

                if (webDraft.draw.height >= $("#content").height()) {
                    $(webDraft.draw.thisParrent).css({ "margin-top" : "0px" });
                } else {
                    $(webDraft.draw.thisParrent).css({ "margin-top" : ($("#content").height() - webDraft.draw.height) / 2 });
                }

                $("#content").perfectScrollbar();
                for (var i = 0; i < layers.list.id.length; i++) {
                    if (typeof layers.list.id[i] === "string") {
                        layers.select(layers.list.id[i]);
                        ctx.putImageData(image.img[i], 0, 0);
                        layers.saveState();
                    }
                }

                if (active !== "")
                    layers.select(active);

                $("title").text(webDraft.title + " v" + webDraft.version);
                $("#layerSize").text(webDraft.draw.width + " x " + webDraft.draw.height);
                $("html, body, #paint").css({ "visibility" : "visible" });
            },
            moveEraseRect : function(event) {
                $("#eraseRect").css({
                    "width"  : webDraft.size,
                    "height" : webDraft.size,
                    "top"    : event.pageY - (webDraft.size / 2) + "px",
                    "left"   : event.pageX - (webDraft.size / 2) + "px"
                });
            },
            erase : function(event) {
                webDraft.func.moveEraseRect(event);
                ctx.clearRect(webDraft.mPosition.x - webDraft.size / 2, webDraft.mPosition.y - webDraft.size / 2, webDraft.size, webDraft.size);

                points = [];
            },
            colorsampler : function(event) {
                var x = webDraft.mPosition.x;
                var y = webDraft.mPosition.y;
                var p = ctx.getImageData(x, y, 1, 1).data;
                var colorCode;
                var r = p[0];
                var g = p[1];
                var b = p[2];
                var alpha = p[3];
                var a = Math.floor((100*alpha)/255)/100;

                if(a <= 0){
                    colorCode = ((r << 16) | (g << 8) | b).toString(16);
                }else {
                    colorCode = "rgba("+r+","+g+","+b+","+a+")";
                }

                if(colorCode === "0")
                    colorCode = "transparent"

                $("#textColorSampler").text(colorCode);
                $("#colorBoxSampler").css({ "background-color" : colorCode });
            },
            colorsamplerSetcolor : function() {
                if ($("#textColorSampler").text() !== 'null') {
                    $("#generalColor .color").css({ "background" : $("#textColorSampler").text() });
                    $("#firstColor").val($("#textColorSampler").text());
                    webDraft.color = $("#textColorSampler").text();
                }
            },
            mousePosition : function(event) {
                var touch = undefined
                
                if (event.originalEvent.touches)
                    touch = event.originalEvent.touches[0]
                
                var pos_x = event.pageX || touch.pageX
                var pos_y = event.pageY || touch.pageY

                webDraft.mPosition.x = pos_x - parseInt($(webDraft.draw.selectorId).offset().left),
                webDraft.mPosition.y = pos_y - parseInt($(webDraft.draw.selectorId).offset().top);

                $("#mousePosition").text(webDraft.mPosition.x + " , " + webDraft.mPosition.y);
            },
            init : function() {
                text.initEvents();
                layers.initEvents();
                layers.newLayer();

                //events on #draw
                $(webDraft.draw.eventHandler)
                    .hover(function() {
                        ctx.beginPath();
                        ctx.stroke();

                        if(webDraft.selectedTool == "eraser")
                            $("#eraseRect").show();
                    })
                    .bind("contextmenu", function(event) {
                        event.preventDefault();
                        webDraft.click.right = true;
                        webDraft.click.left  = false;
                    })
                    .on('mousedown touchstart', function(event) {
                        webDraft.func.mousePosition(event);
                        webDraft.click.left = true;
                        if (!webDraft.click.right && webDraft.click.left) {
                            if(webDraft.selectedTool !== "select")
                                points.push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                            switch (webDraft.selectedTool) {
                                case "pencil" :
                                    draw.drawing();
                                break;
                                case "eraser" :
                                    webDraft.func.erase(event);
                                break;
                                case "select" :
                                    select.initSelect();
                                break;
                                case "rectangle" :
                                    shapes.startShape();
                                break;
                                case "circle" :
                                    shapes.startShape();
                                break;
                                case "text" :
                                    text.initSelect();
                                break;
                                case "colorsampler" :
                                    webDraft.func.colorsamplerSetcolor();
                                    $("#pencil").click();
                                break;
                            }
                        }
                    })
                    .on('mouseup touchend', function() {
                        webDraft.click.left  = false;
                        webDraft.click.right = false;

                        ctx.beginPath();
                        ctx.stroke();

                        switch (webDraft.selectedTool) {
                            case "select" :
                                select.selectOpt();
                            break;
                            case "text" :
                                text.showTextOptions();
                            break;
                            case "rectangle" :
                                shapes.drawRect();
                            break;
                            case "circle" :
                                shapes.drawCircle();
                            break;
                        }

                        layers.saveState();
                    })
                    .on('mousemove touchmove', function(event) {
                        webDraft.func.mousePosition(event);

                        switch (webDraft.selectedTool) {
                            case "eraser" :
                                webDraft.func.moveEraseRect(event);
                            break;
                            case "colorsampler" :
                                webDraft.func.colorsampler();
                            break;
                            case "select" :
                                if(
                                    !select.isSelecting && webDraft.mPosition.x <= parseInt($("#selectRectangle").css("left")) + $("#selectRectangle").width()
                                    && webDraft.mPosition.x >= parseInt($("#selectRectangle").css("left"))
                                    && webDraft.mPosition.y <= parseInt($("#selectRectangle").css("top")) + $("#selectRectangle").height()
                                    && webDraft.mPosition.y >= parseInt($("#selectRectangle").css("top"))
                                ){
                                    select.hoverSelectRectangle = true;
                                    $("#selectRectangle").css({ "z-index" : 5 });
                                }else{
                                    select.hoverSelectRectangle = false;
                                    $("#selectRectangle").css({ "z-index" : 3 });
                                }
                            break;
                            case "text" :
                                if(
                                    !text.isSelecting && webDraft.mPosition.x <= parseInt($("#textRectangle").css("left")) + $("#textRectangle").width()
                                    && webDraft.mPosition.x >= parseInt($("#textRectangle").css("left"))
                                    && webDraft.mPosition.y <= parseInt($("#textRectangle").css("top")) + $("#textRectangle").height()
                                    && webDraft.mPosition.y >= parseInt($("#textRectangle").css("top"))
                                ){
                                    text.hoverSelectRectangle = true;
                                    $("#textRectangle").css({ "z-index" : 5 });
                                }else{
                                    text.hoverSelectRectangle = false;
                                    $("#textRectangle").css({ "z-index" : 3 });
                                }
                            break;
                        }

                        if (webDraft.click.left && !webDraft.click.right) {
                            if(webDraft.selectedTool !== "select")
                                points.push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                            switch (webDraft.selectedTool) {
                                case "pencil" :
                                    draw.drawStyle();
                                    ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
                                    ctx.stroke();
                                break;
                                case "web" :
                                    draw.drawWeb();
                                break;
                                case "eraser" :
                                    webDraft.func.erase(event);
                                break;
                                case "select" :
                                    if(!select.hoverSelectRectangle)
                                        select.startSelect();
                                break;
                                case "text" :
                                    if(!text.hoverSelectRectangle)
                                        text.startSelect();
                                break;
                                case "rectangle" :
                                    shapes.prepareRect();
                                break;
                                case "circle" :
                                    shapes.prepareCircle();
                                break;
                            }
                        }
                    })
                    .mouseleave(function() {
                        $("#mousePosition").empty();
                        ctx.stroke();
                        layers.saveState();
                        if(webDraft.selectedTool == "eraser")
                            $("#eraseRect").hide();
                    })
                    .dblclick(function(){
                        switch (webDraft.selectedTool) {
                            case "select" :
                                $("#selectRectangle")
                                    .css({
                                        "top"  : "0px",
                                        "left" : "0px"
                                    })
                                    .width(0)
                                    .height(0)
                                    .hide();
                            break;
                            case "text" :
                                text.putLayer();

                            break;
                        }
                    });
            }
        }
    };
function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    var a = opacity / 100;
    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';

    return result;
}
$(window)
    .resize(function() {
        webDraft.func.resize();
        webDraft.func.positionElements();
    });
$(document)
    .ready(function(event) {
        if (/mobile/i.test(navigator.userAgent)) {
            webDraft.draw.width = window.innerWidth - 10;
            webDraft.draw.height = window.innerHeight - 30;
        }


        $("#isShadow, #isFillSet").button();

        webDraft.func.init();

        //draggable .tools, #resizer...
        $("#toolsGroup, #layers")
            .draggable({
                snap    : true,
                handle  : ".title.draghandler",
                opacity : 0.75
            })
            .css({ "position" : "absolute" });
        $("#resizer, #textOptions")
            .draggable({
                snap    : true,
                opacity : 0.75
            })
            .css({ "position" : "absolute" });
        $("#selectRectangle, #textRectangle")
            .draggable({snap : false})
            .css({ "position" : "absolute" });

        //switch tool panels visibility
        $(".toggleVisibility").click(function() {
            var icon  = $(this),
                bar   = $(this).parent(),
                panel = bar.parent();

            panel.find(".showHide").slideToggle();

            switch (icon.attr("class")) {
                case "toggleVisibility fa fa-chevron-down" :
                    icon.removeClass("fa fa-chevron-down").addClass("fa fa-chevron-up");
                break;
                case "toggleVisibility fa fa-chevron-up" :
                    icon.removeClass("fa fa-chevron-up").addClass("fa fa-chevron-down");
                break;
            }
        });

        //Save button Click event (save file)
        $("#btnSave").click(function() {
            file.download();
        });
        $(".paintTool").click(function() {
            $(".paintTool").removeClass("active");
            $(this).addClass("active");

            var thisId = $(this).attr("id");

            webDraft.selectedTool = thisId;

            if (thisId === "colorsampler") {
                $("#previewColorSampler").show();
            } else {
                $("#previewColorSampler").hide();
            }

            if (thisId === "web") {
                $("#sensitivityPoints_slider").show();
            } else {
                $("#sensitivityPoints_slider").hide();
            }

            if (thisId === "eraser") {
                $("#eraseRect").show();
                $("#draw, #drawHandler, #eventHandler").css({ "cursor" : "none" });
            } else {
                $("#eraseRect").hide();
                $("#draw, #drawHandler, #eventHandler").css({ "cursor" : "crosshair" });
            }

            if (thisId !== "rectangle") {
                $("#prepareRect").hide();
            }

            if (thisId !== "circle") {
                $("#prepareCircle").hide();
            }

            if (thisId !== "select") {
                $("#selectRectangle").hide();
                $("#hint, .hintGroup#select").hide();
            }else {
                $("#hint, .hintGroup#select").show();
            }

            if (thisId !== "text") {
                $("#textRectangle, #textOptions").hide();
            }

            if (thisId === "rectangle" || thisId === "circle") {
                $("#fillShapeInput").show();
            } else {
                $("#fillShapeInput").hide();
                $("input#isFillSet").attr('checked', false).change();
            }
        });
        $("#fileUploader").click(function() {
            $("input#fileUploaderInput").click();
        })
        $("#resizeDraw").click(function() {
            $("#resizer").fadeIn();
            $("input[type=number]#drawWidth").val(webDraft.draw.width);
            $("input[type=number]#drawHeight").val(webDraft.draw.height);
            $("#resizeinfo").html(webDraft.draw.width + " <i class='fa fa-times'></i> " + webDraft.draw.height);
        });
        $("#cancel").click(function() {
            $("#resizer").fadeOut();
            $("input[type=number]#drawWidth").val(webDraft.draw.width);
            $("input[type=number]#drawHeight").val(webDraft.draw.height);
        });
        $("#apply").click(function() {
            $("#resizer").fadeOut();
            if($("#allLayersResizing").is(":checked")){
                layers.setLayerSize("",webDraft.draw.width, webDraft.draw.height)
            }else {
                var w = $("input[type=number]#drawWidth").val(),
                    h = $("input[type=number]#drawHeight").val();

                layers.setLayerSize(layers.activeId, w, h)
            }
            webDraft.func.positionElements();
        });

        //Clear button Click event
        $("#btnCLear").click(function() {
            $(webDraft.draw.selectorId).empty();
            $("#listLayers").empty();

            points = [];

            webDraft.func.init();
        });


        //changing size
        $("input[type=range]#pointSize").on('mousemove touchmove', function() {
            webDraft.size = $(this).val();
            $("#pointSizeValue").text("size:" + $(this).val() + "px");
        });
        //changing shadow blur
        $("input[type=range]#ShadowBlur").on('mousemove touchmove', function() {
            webDraft.shadow.blur = $(this).val();
            $("#ShadowBlurValue").text("shadow:" + $(this).val() + "px");
        });
        //changing shadow offset X
        $("input[type=range]#ShadowOffSetX").on('mousemove touchmove', function() {
            webDraft.shadow.offsetX = $(this).val();
            $("#ShadowOffSetXValue").text("shadow offset X:" + $(this).val() + "px");
        });
        //changing shadow offset Y
        $("input[type=range]#ShadowOffSetY").on('mousemove touchmove', function() {
            webDraft.shadow.offsetY = $(this).val();
            $("#ShadowOffSetYValue").text("shadow offset Y:" + $(this).val() + "px");
        });
        //changing sensitivity of web points
        $("input[type=range]#sensitivityPoints").on('mousemove touchmove', function() {
            webDraft.sensitivityPoints = $(this).val();
            $("#sensitivityPointsValue").text("sensitivity:" + Math.floor($(this).val() / 100) + "%");
        });
        //changing fill opacity
        $("input[type=range]#fillOpacity").on('mousemove touchmove', function() {
            shapes.fill.opacity = $(this).val();
            $("#fillOpacityValue").text("fill opacity:" + Math.floor($(this).val()) + "%");
        });

        //setting first Color
        $("#generalColor").click(function() {
            $("input[type=color]#firstColor").click();
        });
        //setting shadow Color
        $("#shadowColor").click(function() {
            $("input[type=color]#shadowColorVal").click();
        });
        //setting fill Color
        $("#fillColor").click(function() {
            $("input[type=color]#fillColorVal").click();
        });
        //changing first color input
        $("input[type=color]#firstColor").change(function() {
            $("#generalColor .color").css({ "background" : $(this).val() });
            webDraft.color = $(this).val();
            $("#textRectangle").css('color',$(this).val())
        });
        //changing shadow color input
        $("input[type=color]#shadowColorVal").change(function() {
            $("#shadowColor .color").css({ "background" : $(this).val() });
            webDraft.shadow.color = $(this).val();
        });
        //changing fill color input
        $("input[type=color]#fillColorVal").change(function() {
            $("#fillColor .color").css({ "background" : $(this).val() });
            shapes.fill.color = $(this).val();
        });
        $("#resizer input[type=number]")
            .change(function() {
                var xSize = parseInt($("input[type=number]#drawWidth").val());
                var ySize = parseInt($("input[type=number]#drawHeight").val());
                $("#resizeinfo").html(xSize + " <i class='fa fa-times'></i> " + ySize);
            }).keyup(function(e) {
                var v = $(this).val().replace(/[^\d\.]/g, '');

                $(this).val(v);
                $(this).change();

                if (e.keyCode === 13) {
                    $("#apply").click();
                } else if (e.keyCode === 27) {
                    $("#cancel").click();
                }
            });
        $("input[type=checkbox]#isShadow").change(function() {
            webDraft.shadow.isShadow = $(this).is(":checked");//return true if is :checked or false if not

            if (webDraft.shadow.isShadow) {
                $("#shadowColor, #shadow_slider, #shadow_offsetY_slider, #shadow_offsetX_slider").show();
            } else {
                $("#shadowColor, #shadow_slider, #shadow_offsetY_slider, #shadow_offsetX_slider").hide();
            }
        });
        $("input[type=checkbox]#isFillSet").change(function() {
            shapes.fill.isSet = $(this).is(":checked");//return true if is :checked or false if not

            if(shapes.fill.isSet) {
                $("#fillColor, #fillOpacity_slider").show();
            } else {
                $("#fillColor, #fillOpacity_slider").hide();
            }
        });
    })
    .bind("contextmenu", function(e) {
        e.preventDefault();
    })
    .mouseup(function() {
        webDraft.click.left  = false;
        webDraft.click.right = false;
    });
