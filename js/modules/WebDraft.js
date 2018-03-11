class WebDraft {
    constructor() {
        this.isLoaded = false;
        this.title = "WebDraft";
        this.click = {
            left: false, //left mouse button
            right: false  //right mouse button
        };
        this.mPosition = {//mouse position on draw
            x: 0,
            y: 0
        };
        this.draw = {
            width: 600,
            height: 600,
            thisParent: "#drawHandler",
            selectorId: "#draw",
            eventHandler: "#eventHandler",
            bg: "url('pic/transparent.png') repeat"
        };
        this.shadow = {
            isShadow: false,
            blur: 1,
            offsetX: 0,
            offsetY: 0,
            color: "#232324"
        };
        this.sensitivityPoints = 1000;
        this.size = 10;
        this.color = "#000000";
        this.selectedTool = PENCIL;
    }
    resize() {}
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 15; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    positionElements() {
        var image = {
            id: new Array(),
            img: new Array()
        };

        var active = layers.activeId;
        for (var i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string") {
                layers.select(layers.list[i].id);
                image.img[i] = ctx.getImageData(0, 0, this.draw.width, this.draw.height);
                image.id[i] = layers.list[i].id;
            }
        }

        $(this.draw.selectorId + "," + this.draw.eventHandler).css({
            "width": this.draw.width,
            "height": this.draw.height
        });
        $(this.draw.thisParent).css({
            "background": this.draw.bg,
            "width": this.draw.width,
            "height": this.draw.height
        });

        if (this.draw.width >= $("#content").width()) {
            $(this.draw.thisParent).css({"margin-left": "0px"});
        } else {
            $(this.draw.thisParent).css({"margin-left": ($("#content").width() - this.draw.width) / 2});
        }

        if (this.draw.height >= $("#content").height()) {
            $(this.draw.thisParent).css({"margin-top": "0px"});
        } else {
            $(this.draw.thisParent).css({"margin-top": ($("#content").height() - this.draw.height) / 2});
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

        $("title").text(this.title + " v" + this.version + ' [' + this.draw.width + " x " + this.draw.height + ']');
        $("html, body, #paint").css({"visibility": "visible"});
    }
    moveEraseRect(event) {
        $("#eraseRect").css({
            "width": this.size,
            "height": this.size,
            "top": event.pageY - (this.size / 2) + "px",
            "left": event.pageX - (this.size / 2) + "px"
        });
    }
    erase(event) {
        this.moveEraseRect(event);
        ctx.clearRect(this.mPosition.x - this.size / 2, this.mPosition.y - this.size / 2, this.size, this.size);

        points[layers.activeId] = [];
//                do poprawy
    }
    clear() {
        $(this.draw.selectorId).empty();
        $("#listLayers").empty();

        points = {};

        this.init();
    }
    colorsampler(event) {
        var x = this.mPosition.x;
        var y = this.mPosition.y;
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
    }
    colorsamplerSetcolor() {
        if ($("#textColorSampler").text() !== 'null') {
            $("#generalColor .color").css({"background": $("#textColorSampler").text()});
            $("#firstColor").val($("#textColorSampler").text());
            this.color = $("#textColorSampler").text();
        }
    }
    mousePosition(event) {
        var touch = undefined;

        if (event.originalEvent.touches) {
            touch = event.originalEvent.touches[0];

            var pos_x = event.pageX || touch.pageX;
            var pos_y = event.pageY || touch.pageY;


        } else {
            var pos_x = event.pageX;
            var pos_y = event.pageY;
        }

        this.mPosition.x = pos_x - parseInt($(this.draw.selectorId).offset().left) - parseInt($(canvas).css('left'));
        this.mPosition.y = pos_y - parseInt($(this.draw.selectorId).offset().top) - parseInt($(canvas).css('top'));

        $("#mousePosition").text(this.mPosition.x + " , " + this.mPosition.y);
        if (this.mPosition.x < 0 || this.mPosition.x > $(this.draw.selectorId).width()
                || this.mPosition.y < 0 || this.mPosition.y > $(this.draw.selectorId).height()) {
            $("#mousePosition").empty();
        }
    }
    _mousedown(event) {
        this.mousePosition(event);
        if ("buttons" in event) {
            if (event.buttons == 1) {
                this.click.left = true;
            }
        }
        var button = event.which || event.button;
        if (button == 1) {
            this.click.left = true;
        }
        if (!this.click.right && this.click.left) {
            if (this.selectedTool !== SELECT)
                points[layers.activeId].push({x: this.mPosition.x, y: this.mPosition.y});

            switch (this.selectedTool) {
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
                    this.colorsamplerSetcolor();
                    $("#pencil").click();
                    break;
            }
        }
    }
    _mouseup(event) {
        this.click.left = false;
        this.click.right = false;

        ctx.beginPath();
        ctx.stroke();

        switch (this.selectedTool) {
            case SELECT:
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
    }
    _mousemove(event) {
        this.mousePosition(event);

        switch (this.selectedTool) {
            case ERASER:
                this.moveEraseRect(event);
                break;
            case COLORSAMPLER :
                this.colorsampler();
                break;
            case SELECT :
                if (
                        !select.isSelecting && this.mPosition.x <= parseInt($("#selectRectangle").css("left")) + $("#selectRectangle").width()
                        && this.mPosition.x >= parseInt($("#selectRectangle").css("left"))
                        && this.mPosition.y <= parseInt($("#selectRectangle").css("top")) + $("#selectRectangle").height()
                        && this.mPosition.y >= parseInt($("#selectRectangle").css("top"))
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
                        !text.isSelecting && this.mPosition.x <= parseInt($("#textRectangle").css("left")) + $("#textRectangle").width()
                        && this.mPosition.x >= parseInt($("#textRectangle").css("left"))
                        && this.mPosition.y <= parseInt($("#textRectangle").css("top")) + $("#textRectangle").height()
                        && this.mPosition.y >= parseInt($("#textRectangle").css("top"))
                        ) {
                    text.hoverSelectRectangle = true;
                    $("#textRectangle").css({"z-index": 5});
                } else {
                    text.hoverSelectRectangle = false;
                    $("#textRectangle").css({"z-index": 3});
                }
                break;
        }

        if (this.click.left && !this.click.right) {
            if (this.selectedTool !== SELECT)
                points[layers.activeId].push({x: this.mPosition.x, y: this.mPosition.y});

            switch (this.selectedTool) {
                case PENCIL :
                case ERASER :
                    ctx.lineTo(this.mPosition.x, this.mPosition.y);
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
    }
    loadParts() {
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
        this.isLoaded = true;
    }
    init() {
        let $this = this;
        if (!this.isLoaded) {
            this.loadParts();
        } else {
            layers.newLayer();
        }
        //events on #draw
        $(this.draw.eventHandler)
                .hover(function () {
                    ctx.beginPath();
                    ctx.stroke();

                    if (this.selectedTool === ERASER) {
                        $("#eraseRect").show();
                    }

                })
                .bind("contextmenu", function (event) {
                    if (!DEBUG) {
                        event.preventDefault();
                    }
                    this.click.right = true;
                    this.click.left = false;
                })
                .on('mousedown', function (e) {
                    $this._mousedown(e);
                })
                .on('mouseup', function (e) {
                    $this._mouseup(e);
                })
                .on('mousemove', function (e) {
                    $this._mousemove(e);
                })
                .mouseleave(function () {
                    ctx.stroke();
                    layers.saveState();
                    if (this.selectedTool === ERASER)
                        $("#eraseRect").hide();
                })
                .dblclick(function () {
                    switch (this.selectedTool) {
                        case SELECT:
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