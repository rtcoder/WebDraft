const PENCIL = 'pencil';
const SELECT = 'select';
const ERASER = 'eraser';
const WEB = 'web';
const TEXT = 'text';
const RECTANGLE = 'rectangle';
const CIRCLE = 'circle';
const COLORSAMPLER = 'colorsampler';
var canvas,
        ctx,
        randomId,
        points = {},
        webDraft = {
            isLoaded: false,
            title: "WebDraft",
            version: "2.3.0",
            click: {
                left: false, //left mouse button
                right: false  //right mouse button
            },
            mPosition: {//mouse position on draw
                x: 0,
                y: 0
            },
            draw: {
                width: 600,
                height: 600,
                thisParent: "#drawHandler",
                selectorId: "#draw",
                eventHandler: "#eventHandler",
                bg: "url('pic/transparent.png') repeat"
            },
            shadow: {
                isShadow: false,
                blur: 1,
                offsetX: 0,
                offsetY: 0,
                color: "#232324"
            },
            sensitivityPoints: 1000,
            size: 10,
            color: "#000000",
            selectedTool: PENCIL,
            func: {
                resize: function () {},
                makeid: function () {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for (var i = 0; i < 15; i++)
                        text += possible.charAt(Math.floor(Math.random() * possible.length));

                    return text;
                },
                positionElements: function () {
                    var image = {
                        id: new Array(),
                        img: new Array()
                    };

                    var active = layers.activeId;
                    for (var i = 0; i < layers.list.length; i++) {
                        if (typeof layers.list[i].id === "string") {
                            layers.select(layers.list[i].id);
                            image.img[i] = ctx.getImageData(0, 0, webDraft.draw.width, webDraft.draw.height);
                            image.id[i] = layers.list[i].id;
                        }
                    }

                    $(webDraft.draw.selectorId + "," + webDraft.draw.eventHandler).css({
                        "width": webDraft.draw.width,
                        "height": webDraft.draw.height
                    });
                    $(webDraft.draw.thisParent).css({
                        "background": webDraft.draw.bg,
                        "width": webDraft.draw.width,
                        "height": webDraft.draw.height
                    });

                    if (webDraft.draw.width >= $("#content").width()) {
                        $(webDraft.draw.thisParent).css({"margin-left": "0px"});
                    } else {
                        $(webDraft.draw.thisParent).css({"margin-left": ($("#content").width() - webDraft.draw.width) / 2});
                    }

                    if (webDraft.draw.height >= $("#content").height()) {
                        $(webDraft.draw.thisParent).css({"margin-top": "0px"});
                    } else {
                        $(webDraft.draw.thisParent).css({"margin-top": ($("#content").height() - webDraft.draw.height) / 2});
                    }

                    for (var i = 0; i < layers.list.length; i++) {
                        if (typeof layers.list[i].id === "string") {
                            layers.select(layers.list[i].id);
                            ctx.putImageData(image.img[i], 0, 0);
                            layers.saveState();
                        }
                    }

                    if (active !== "")
                        layers.select(active);

                    $("title").text(webDraft.title + " v" + webDraft.version + ' [' + webDraft.draw.width + " x " + webDraft.draw.height + ']');
                    $("html, body, #paint").css({"visibility": "visible"});
                },
                moveEraseRect: function (event) {
                    $("#eraseRect").css({
                        "width": webDraft.size,
                        "height": webDraft.size,
                        "top": event.pageY - (webDraft.size / 2) + "px",
                        "left": event.pageX - (webDraft.size / 2) + "px"
                    });
                },
                erase: function (event) {
                    webDraft.func.moveEraseRect(event);
                    ctx.clearRect(webDraft.mPosition.x - webDraft.size / 2, webDraft.mPosition.y - webDraft.size / 2, webDraft.size, webDraft.size);

                    points[layers.activeId] = [];
//                do poprawy
                },
                clear: function () {
                    $(webDraft.draw.selectorId).empty();
                    $("#listLayers").empty();

                    points = {};

                    webDraft.func.init();
                },
                colorsampler: function (event) {
                    var x = webDraft.mPosition.x;
                    var y = webDraft.mPosition.y;
                    var p = ctx.getImageData(x, y, 1, 1).data;
                    var colorCode;
                    var r = p[0];
                    var g = p[1];
                    var b = p[2];
                    var alpha = p[3];
                    var a = Math.floor((100 * alpha) / 255) / 100;

                    if (a <= 0) {
                        colorCode = ((r << 16) | (g << 8) | b).toString(16);
                    } else {
                        colorCode = "rgba(" + r + "," + g + "," + b + "," + a + ")";
                    }

                    if (colorCode === "0")
                        colorCode = "transparent";

                    $("#textColorSampler").text(colorCode);
                    $("#colorBoxSampler").css({"background-color": colorCode});
                },
                colorsamplerSetcolor: function () {
                    if ($("#textColorSampler").text() !== 'null') {
                        $("#generalColor .color").css({"background": $("#textColorSampler").text()});
                        $("#firstColor").val($("#textColorSampler").text());
                        webDraft.color = $("#textColorSampler").text();
                    }
                },
                mousePosition: function (event) {
                    var touch = undefined;

                    if (event.originalEvent.touches) {
                        touch = event.originalEvent.touches[0];

                        var pos_x = event.pageX || touch.pageX;
                        var pos_y = event.pageY || touch.pageY;


                    } else {
                        var pos_x = event.pageX;
                        var pos_y = event.pageY;
                    }

                    webDraft.mPosition.x = pos_x - parseInt($(webDraft.draw.selectorId).offset().left) - parseInt($(canvas).css('left'));
                    webDraft.mPosition.y = pos_y - parseInt($(webDraft.draw.selectorId).offset().top) - parseInt($(canvas).css('top'));

                    $("#mousePosition").text(webDraft.mPosition.x + " , " + webDraft.mPosition.y);
                    if (webDraft.mPosition.x < 0 || webDraft.mPosition.x > $(webDraft.draw.selectorId).width()
                            || webDraft.mPosition.y < 0 || webDraft.mPosition.y > $(webDraft.draw.selectorId).height()) {
                        $("#mousePosition").empty();
                    }
                },
                _mousedown: function (event) {
                    webDraft.func.mousePosition(event);
                    if ("buttons" in event) {
                        if (event.buttons == 1) {
                            webDraft.click.left = true;
                        }
                    }
                    var button = event.which || event.button;
                    if (button == 1) {
                        webDraft.click.left = true;
                    }
                    if (!webDraft.click.right && webDraft.click.left) {
                        if (webDraft.selectedTool !== SELECT)
                            points[layers.activeId].push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                        switch (webDraft.selectedTool) {
                            case PENCIL :
                            case ERASER :
                                draw.drawing();
                                break;
                            case SELECT :
                                select.initSelect();
                                break;
                            case RECTANGLE :
                            case CIRCLE :
                                shapes.startShape();
                                break;
                            case TEXT :
                                text.initSelect();
                                break;
                            case COLORSAMPLER :
                                webDraft.func.colorsamplerSetcolor();
                                $("#pencil").click();
                                break;
                        }
                    }
                },
                _mouseup: function (event) {
                    webDraft.click.left = false;
                    webDraft.click.right = false;

                    ctx.beginPath();
                    ctx.stroke();

                    switch (webDraft.selectedTool) {
                        case SELECT :
                            select.selectOpt();
                            break;
                        case TEXT :
                            text.showTextOptions();
                            break;
                        case RECTANGLE :
                            shapes.drawRect();
                            break;
                        case CIRCLE :
                            shapes.drawCircle();
                            break;
                    }

                    layers.saveState();
                },
                _mousemove: function (event) {
                    webDraft.func.mousePosition(event);

                    switch (webDraft.selectedTool) {
                        case ERASER :
                            webDraft.func.moveEraseRect(event);
                            break;
                        case COLORSAMPLER :
                            webDraft.func.colorsampler();
                            break;
                        case SELECT :
                            if (
                                    !select.isSelecting && webDraft.mPosition.x <= parseInt($("#selectRectangle").css("left")) + $("#selectRectangle").width()
                                    && webDraft.mPosition.x >= parseInt($("#selectRectangle").css("left"))
                                    && webDraft.mPosition.y <= parseInt($("#selectRectangle").css("top")) + $("#selectRectangle").height()
                                    && webDraft.mPosition.y >= parseInt($("#selectRectangle").css("top"))
                                    ) {
                                select.hoverSelectRectangle = true;
                                $("#selectRectangle").css({"z-index": 5});
                            } else {
                                select.hoverSelectRectangle = false;
                                $("#selectRectangle").css({"z-index": 3});
                            }
                            break;
                        case TEXT :
                            if (
                                    !text.isSelecting && webDraft.mPosition.x <= parseInt($("#textRectangle").css("left")) + $("#textRectangle").width()
                                    && webDraft.mPosition.x >= parseInt($("#textRectangle").css("left"))
                                    && webDraft.mPosition.y <= parseInt($("#textRectangle").css("top")) + $("#textRectangle").height()
                                    && webDraft.mPosition.y >= parseInt($("#textRectangle").css("top"))
                                    ) {
                                text.hoverSelectRectangle = true;
                                $("#textRectangle").css({"z-index": 5});
                            } else {
                                text.hoverSelectRectangle = false;
                                $("#textRectangle").css({"z-index": 3});
                            }
                            break;
                    }

                    if (webDraft.click.left && !webDraft.click.right) {
                        if (webDraft.selectedTool !== SELECT)
                            points[layers.activeId].push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                        switch (webDraft.selectedTool) {
                            case PENCIL :
                            case ERASER :
                                ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
                                ctx.stroke();
                                break;
                            case WEB :
                                draw.drawWeb();
                                break;
                            case SELECT :
                                if (!select.hoverSelectRectangle)
                                    select.startSelect();
                                break;
                            case TEXT :
                                if (!text.hoverSelectRectangle)
                                    text.startSelect();
                                break;
                            case RECTANGLE :
                                shapes.prepareRect();
                                break;
                            case CIRCLE :
                                shapes.prepareCircle();
                                break;
                        }
                    }
                },
                loadParts: function () {
                    $.get('parts/buttons.part.html', function (data) {
                        $('[data-id=buttons]').html(data);
                        events.buttons();
                    });
                    $.get('parts/info.part.html', function (data) {
                        $('#info').html(data);
                        events.info();
                    });
                    $.get('parts/color-picker.part.html', function (data) {
                        $('[data-id=color-picker]').html(data);
                        events.color();
                    });
                    $.get('parts/sliders.part.html', function (data) {
                        $('[data-id=sliders]').html(data);
                        events.sliders();
                    });
                    webDraft.isLoaded = true;
                },
                init: function () {
                    if (!webDraft.isLoaded) {
                        webDraft.func.loadParts();
                    } else {
                        events.layers();
                        layers.newLayer();
                    }
                    //events on #draw
                    $(webDraft.draw.eventHandler)
                            .hover(function () {
                                ctx.beginPath();
                                ctx.stroke();

                                if (webDraft.selectedTool === ERASER) {
                                    $("#eraseRect").show();
                                }

                            })
                            .bind("contextmenu", function (event) {
                                event.preventDefault();
                                webDraft.click.right = true;
                                webDraft.click.left = false;
                            })
                            .on('mousedown touchstart', webDraft.func._mousedown)
                            .on('mouseup touchend', webDraft.func._mouseup)
                            .on('mousemove touchmove', webDraft.func._mousemove)
                            .mouseleave(function () {
                                ctx.stroke();
                                layers.saveState();
                                if (webDraft.selectedTool === ERASER)
                                    $("#eraseRect").hide();
                            })
                            .dblclick(function () {
                                switch (webDraft.selectedTool) {
                                    case SELECT :
                                        $("#selectRectangle")
                                                .css({
                                                    "top": "0px",
                                                    "left": "0px"
                                                })
                                                .width(0)
                                                .height(0)
                                                .hide();
                                        break;
                                    case TEXT :
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
