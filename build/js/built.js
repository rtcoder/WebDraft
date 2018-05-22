class Camera {
    constructor() {
        this.cameraStream = null;
        this.filters = {
            'sepia': false,
            'noise': false,
            'greyscale': false,
            'negative': false
        };
        let $this = this;
        this.filterInterval = null;
        $.get('parts/camera.part.html', function (data) {
            $('body').append('<div id="camera"></div>');

            $('#camera').html(data);

            $('#snap').click($this.snap);
            $('#saveSnapOnComputer').click($this.saveOnComputer);
            $('#applySnap').click($this.applySnap);
            $('#cancelSnap').click($this.cancelSnap);
            $('#switchFullscreen').click(function (e) {
                $('#camera').toggleClass('fullscreen');
            })
            $('#closeCamera').click(function () {
                $this.stop();
            });
            $('.filter-checkbox').change(function (e) {
                let filterName = $(this).parent().find('.filter').data('id');
                $this.filters[filterName] = $(this).is(':checked');
            });
        });
    }

    init() {
        let $this = this;
        $('#camera').addClass('opened');
        let video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
                $this.cameraStream = stream;
                $('#camera #cameraTitle').text($this.cameraStream.getTracks()[0].label);
                $this.setFilter();
            });
        }
    }

    stop() {
        let $this = this;
        let track = $this.cameraStream.getTracks()[0];
        track.stop();
        $this.cameraStream = null;
        $('#camera').removeClass('opened');
    }

    snap() {
        let snapImage = document.getElementById('snapImage');
        let snapImageContext = snapImage.getContext('2d');
        let video = document.getElementById('video');
        let additionalLayer = document.getElementById('additional');
        let additionalLayerContext = additionalLayer.getContext('2d');
        let videoImageData = additionalLayerContext.getImageData(0, 0, additionalLayer.width, additionalLayer.height);
        snapImageContext.putImageData(videoImageData, 0, 0);
        $('#camera').addClass('snapped');
    }

    saveOnComputer() {
        file.downloadFromCamera('snapImage');
    }

    cancelSnap() {
        let snapImage = document.getElementById('snapImage');
        let snapImageContext = snapImage.getContext('2d');
        snapImageContext.clearRect(0, 0, snapImage.width, snapImage.height);
        $('#camera').removeClass('snapped');
        if (this.filterInterval) {
            clearInterval(this.filterInterval);
        }
    }

    applySnap() {
        let snapImage = document.getElementById('snapImage');
        layers.newLayer();
        layers.setLayerSize(layers.activeId, snapImage.width, snapImage.height);
        webDraft.positionElements();
        ctx.drawImage(snapImage, 0, 0);
        layers.saveState();
        $('#camera').removeClass('snapped');
    }

    setFilter() {
        let additionalLayer = document.getElementById('additional');
        let additionalLayerContext = additionalLayer.getContext('2d');
        let frame = document.getElementById('frame');
        let frameContext = frame.getContext('2d');
        let video = document.getElementById('video');
        let videoImageData = additionalLayerContext.getImageData(0, 0, additionalLayer.width, additionalLayer.height);
        if (this.filterInterval) {
            clearInterval(this.filterInterval);
        }
        let $this = this;
        setInterval(function (e) {
            frameContext.drawImage(video, 0, 0, video.width, video.height);
            videoImageData = frameContext.getImageData(0, 0, video.width, video.height);

            for (let i in $this.filters) {
                if ($this.filters[i]) {
                    videoImageData = $this[i + 'Filter'](videoImageData);
                }
            }

            additionalLayerContext.putImageData(videoImageData, 0, 0);
        }, 1)
    }

    negativeFilter(imageData) {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];   // red
            pixels[i + 1] = 255 - pixels[i + 1]; // green
            pixels[i + 2] = 255 - pixels[i + 2]; // blue
        }

        return imageData;
    }

    greyscaleFilter(imageData) {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let avg = 0.3 * r + 0.59 * g + 0.11 * b;

            pixels[i] = avg;   // red
            pixels[i + 1] = avg; // green
            pixels[i + 2] = avg; // blue
        }

        return imageData;
    }

    noiseFilter(imageData) {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let rand =  (0.5 - Math.random()) * 100;
            pixels[i] +=rand;   // red
            pixels[i + 1] +=rand; // green
            pixels[i + 2] +=rand; // blue
        }

        return imageData;
    }

    sepiaFilter(imageData) {
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let avg = 0.3 * r + 0.59 * g + 0.11 * b;

            pixels[i] = avg + 100;   // red
            pixels[i + 1] = avg + 50; // green
            pixels[i + 2] = avg; // blue
        }

        return imageData;
    }
}

class Contextmenu {
    constructor(items) {
        this.items = items;
        let $this = this;
        $('body').append('<menu id="contextmenu"></menu>');
        $('#contextmenu').html('<ul></ul>');
        for (let i in items) {
            let li = this.buildItem(this.items[i]);

            $('#contextmenu ul').append(li);

            if (this.items[i].onclick) {
                $('#contextmenu ul li').last().click(function (e) {
                    $this.items[i].onclick();
                    $this.hide(e);
                });
            }

            if (this.items[i].submenu && this.items[i].submenu.length > 0) {
                $('#contextmenu ul li').last().prepend('<ul class="submenu"></ul>');
                for (let j in this.items[i].submenu) {

                    let li = this.buildItem(this.items[i].submenu[j]);

                    $('#contextmenu ul li ul.submenu').append(li);

                    if (this.items[i].submenu[j].onclick) {
                        $('#contextmenu ul li').last().click(function (e) {
                            $this.items[i].submenu[j].onclick();
                            $this.hide(e);
                        });
                    }
                }
            }
        }

        $('body').contextmenu(function (e) {
            e.preventDefault();
            $this.show(e);
        }).click(function (e) {
            if (!$('#contextmenu').is(":hover")) {
                $this.hide(e);
            }
        });
    }
    show(e) {
        let t = e.pageY;
        let l = e.pageX;
        $('#contextmenu').removeClass('left-submenu');
        if (t + $('#contextmenu').height() > $(window).height()) {
            t = $(window).height() - $('#contextmenu').height();
        }
        if (l + $('#contextmenu').width() > $(window).width()) {
            l = $(window).width() - $('#contextmenu').width();
        }
        if (l + ($('#contextmenu').width() * 2) > $(window).width()) {
            $('#contextmenu').addClass('left-submenu');
        }
        $('#contextmenu').css({
            top: t + "px",
            left: l + "px"
        }).show();
    }
    hide(e) {
        $('#contextmenu').hide();
    }
    buildItem(item) {
        let arrowLeft = '<span class="arrow left-arrow"><i class="fas fa-chevron-left"></i></span>';
        let arrowRight = '<span class="arrow right-arrow"><i class="fas fa-chevron-right"></i></span>';
        let shortcut = '<span class="shortcut">';
        let text = '<span class="text">';
        let icon = '<span class="icon"><i';

        if (typeof item.shortcut !== 'undefined' && item.shortcut !== '') {
            shortcut += item.shortcut;
        }
        if (typeof item.text !== 'undefined' && item.text !== '') {
            text += item.text;
        }
        if (typeof item.icon !== 'undefined' && item.icon !== '') {
            icon += ' class="' + item.icon + '"';
        }

        shortcut += '</span>';
        text += '</span>';
        icon += '></i></span>';
        return '<li><span class="content">' + arrowLeft + icon + text + shortcut + arrowRight + '</span></li>';
    }
}
class Draw {
    drawStyle() {
        ctx.lineWidth = webDraft.size;

        if (webDraft.selectedTool === RECTANGLE) {
            ctx.lineJoin = ctx.lineCap = 'miter';
        } else {
            ctx.lineJoin = ctx.lineCap = 'round';
        }

        if (shapes.fill.isSet === true) {
            ctx.fillStyle = hexToRgba(shapes.fill.color, shapes.fill.opacity);
        } else {
            ctx.fillStyle = "transparent";
        }

        if (webDraft.selectedTool === ERASER) {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
        }

        if (webDraft.shadow.isShadow === true && webDraft.selectedTool !== ERASER) {
            ctx.shadowBlur = webDraft.shadow.blur;
            ctx.shadowColor = webDraft.shadow.color;
            ctx.shadowOffsetX = webDraft.shadow.offsetX;
            ctx.shadowOffsetY = webDraft.shadow.offsetY;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        ctx.strokeStyle = webDraft.color;//line color
    }
    drawing() {
        ctx.beginPath();
        ctx.moveTo(webDraft.mPosition.x, webDraft.mPosition.y);
        this.drawStyle();
        ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
        ctx.stroke();
    }
    drawWeb() {
        ctx.beginPath();
        this.drawStyle();
        ctx.moveTo(points[layers.activeId][points[layers.activeId].length - 2].x, points[layers.activeId][points[layers.activeId].length - 2].y);
        ctx.lineTo(points[layers.activeId][points[layers.activeId].length - 1].x, points[layers.activeId][points[layers.activeId].length - 1].y);
        ctx.stroke();
        let dx, dy, d;
        let len = points[layers.activeId].length;
        for (let i = 0; i < len; i++) {
            dx = points[layers.activeId][i].x - points[layers.activeId][points[layers.activeId].length - 1].x;
            dy = points[layers.activeId][i].y - points[layers.activeId][points[layers.activeId].length - 1].y;
            d = dx * dx + dy * dy;
            if (d < webDraft.sensitivityPoints) {
                ctx.beginPath();
                this.drawStyle();
                ctx.moveTo(points[layers.activeId][points[layers.activeId].length - 1].x + (dx * 0.2), points[layers.activeId][points[layers.activeId].length - 1].y + (dy * 0.2));
                ctx.lineTo(points[layers.activeId][i].x - (dx * 0.2), points[layers.activeId][i].y - (dy * 0.2));
                ctx.stroke();
            }
        }
    }
}
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
class File {
    constructor() {
        $('body').append('<input type="file" name="file" id="fileUploaderInput" accept="image/*" onchange="file.upload(event)">');
    }

    upload(event) {
        let input = event.target;
        let widthImg;
        let heightImg;
        let output = new Image();

        output.src = URL.createObjectURL(input.files[0]);

        output.onload = function () {
            widthImg = this.width;
            heightImg = this.height;

            layers.newLayer();
            layers.setLayerSize(layers.activeId, widthImg, heightImg);
            webDraft.positionElements();

            ctx.drawImage(output, 0, 0);

            layers.saveState();
            keys.O = false;
        };
    }
    download() {
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '"></canvas>');

        let temp_c = document.getElementById("tmpCanvas");
        let temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(webDraft.draw.width).height(webDraft.draw.height);

        for (let i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string" && layers.list[i].visible === true) {
                let imgData = document.getElementById(layers.list[i].id);
                let top = parseInt($("#" + layers.list[i].id).css("top"));
                let left = parseInt($("#" + layers.list[i].id).css("left"));
                temp_ctx.drawImage(imgData, top, left);
            }
        }

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-image.png");
        });

        $("#tmpCanvas").remove();
    }
    downloadFromCamera(id = null) {
        let imgData = document.getElementById(id);
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + imgData.width + '" height="' + imgData.height + '"></canvas>');

        let temp_c = document.getElementById("tmpCanvas");
        let temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(imgData.width).height(imgData.height);

        temp_ctx.drawImage(imgData, 0, 0);

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-camera-photo.png");
        });

        $("#tmpCanvas").remove();

    }
}
var keys = {
    Enter: false, //press Enter
    Esc: false, //press Escape (Esc)
    f11: false, //press F11
    f12: false, //press F12
    delete: false, //press delete
    C: false,
    X: false,
    V: false,
    O: false,
    I: false
};

$(document)
        .keydown(function (event) {
            if (webDraft.selectedTool !== TEXT && $('#resizer').is('hidden')) {
                event.preventDefault();
            }

            switch (event.keyCode) {
                case 13 :
                    keys.Enter = true;
                    break;
                case 27 :
                    keys.Esc = true;
                    break;
                case 46 :
                    keys.delete = true;
                    break;
                case 67 :
                    keys.C = true;
                    break;
                case 73 :
                    keys.I = true;
                    break;
                case 79 :
                    keys.O = true;
                    break;
                case 83 :
                    keys.S = true;
                    break;
                case 86 :
                    keys.V = true;
                    break;
                case 88 :
                    keys.X = true;
                    break;
                case 122 :
                    keys.f11 = true;
                    break;
                case 123 :
                    keys.f12 = true;
                    break;
            }
            if (keys.delete) {
                if (webDraft.selectedTool === SELECT) {
                    select.delSelectedPart();
                }
                if (event.ctrlKey) {
                    webDraft.clear();
                }
            }

            if (keys.f12 || keys.f11 || event.ctrlKey || keys.delete) {
                event.preventDefault();
            }

            if (keys.C) {
                if (webDraft.selectedTool === SELECT && event.ctrlKey) {
                    select.copySelectedPart();
                }
            }

            if (keys.I) {
                if (event.ctrlKey) {
                    $("#info").toggle();
                }
            }

            if (keys.X) {
                if (webDraft.selectedTool === SELECT && event.ctrlKey) {
                    select.cutSelectedPart();
                }
            }

            if (keys.V) {
                if (webDraft.selectedTool === SELECT && event.ctrlKey) {
                    select.pasteSelectedPart();
                }
            }
            if (keys.O) {
                if (event.ctrlKey) {
                    $("#fileUploader").click();
                }
            }
            if (keys.S) {
                if (event.ctrlKey) {
                    file.download();
                }
            }

        })
        .keyup(function (event) {
            switch (event.keyCode) {
                case 13 :
                    keys.Enter = false;
                    break;
                case 27 :
                    keys.Esc = false;
                    break;
                case 46 :
                    keys.delete = false;
                    break;
                case 67 :
                    keys.C = false;
                    break;
                case 73 :
                    keys.I = false;
                    break;
                case 79 :
                    keys.O = false;
                    break;
                case 83 :
                    keys.S = false;
                    break;
                case 86 :
                    keys.V = false;
                    break;
                case 88 :
                    keys.X = false;
                    break;
                case 122 :
                    keys.f11 = false;
                    break;
                case 123 :
                    keys.f12 = false;
                    break;
            }
        });

$(window).bind('mousewheel DOMMouseScroll', function (event) {
    if (event.ctrlKey === true) {
        event.preventDefault();

        if (event.originalEvent.wheelDelta / 120 > 0) {
            if (webDraft.size < 250) {
                webDraft.size += 2;
            } else {
                webDraft.size = 250;
            }
        } else {
            if (webDraft.size > 1) {
                webDraft.size -= 2;
            } else {
                webDraft.size = 1;
            }
        }
        $("#eraseRect").css({
            "width": webDraft.size,
            "height": webDraft.size,
            "top": event.pageY - (webDraft.size / 2) + "px",
            "left": event.pageX - (webDraft.size / 2) + "px"
        });
        $("input#pointSize").val(webDraft.size);
        $("#pointSizeValue").text("size:" + webDraft.size + "px");
    }

    if (event.altKey === true) {
        // event.preventDefault();
    }
});
class Layers {
    constructor() {
        $.get('parts/layers.part.html', function (data) {
            $('#layers').html(data);
            layers.newLayer();
        });

        this.activeId = "";
        this.list = [];
    }
    setLayerPosition(layerId, top, left) {
        $("canvas#" + layerId).css({
            "top": top,
            "left": left
        });
    }
    setLayerSize(layerId, width, height) {
        let image = {
            id: new Array(),
            img: new Array()
        };

        let active = layers.activeId;
        for (let i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string") {
                layers.select(layers.list[i].id);
                image.img[i] = ctx.getImageData(0, 0, webDraft.draw.width, webDraft.draw.height);
                image.id[i] = layers.list[i].id;
            }
        }

        if (layerId === "") {
            webDraft.draw.width = width;
            webDraft.draw.height = height;
            $("canvas").attr({
                "width": webDraft.draw.width,
                "height": webDraft.draw.height
            });
        } else {
            $("canvas#" + layerId).attr({
                "width": width,
                "height": height
            });
            webDraft.draw.width = 0;
            webDraft.draw.height = 0;
            $("canvas").each(function () {
                let w = parseInt($(this).attr("width"));
                let h = parseInt($(this).attr("height"));
                if (webDraft.draw.width < w)
                    webDraft.draw.width = w;

                if (webDraft.draw.height < h)
                    webDraft.draw.height = h;
            });
        }

        for (let i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string") {
                layers.select(layers.list[i].id);
                ctx.putImageData(image.img[i], 0, 0);
                layers.saveState();
            }
        }

        if (active !== "")
            layers.select(active);
    }
    saveState() {
        let imgSrc = document.getElementById(layers.activeId).toDataURL();
        $(".layerView[data-id=" + layers.activeId + "]").find("img").attr("src", imgSrc).show();
    }
    newLayer() {
        let j;
        if (isNaN(parseInt($(".layerView:last").attr("id")))) {
            j = 0;
        } else {
            j = parseInt($(".layerView:last").attr("id")) + 1;
        }

        let countViews = $("#listLayers").children(".layerView").length;

        if (countViews < 15) {
            randomId = webDraft.makeid();

            $(webDraft.draw.selectorId).append('<canvas id="' + randomId + '" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '" style="top:0;left:0"></canvas>');
            $("#listLayers").append(`
                <div data-id="` + randomId + `" id="` + j + `" class="layerView">
                    <div class="imgLayerContainer">
                        <img src="" class="imgLayer">
                    </div>
                    <div title="Hide layer" class="hideLayer fas fa-eye"></div>
                    <div style="display:none" title="Show layer" class="showLayer far fa-eye-slash"></div>
                </div>`
                    );

            let new_layer = {
                visible: true,
                id: randomId,
                top: 0,
                left: 0
            };
            layers.list.push(new_layer);

            $(".layerView").click(function () {
                if (!$(this).hasClass("hidden")) {
                    $(".layerView").removeClass("active");
                    $(this).addClass("active");

                    let identifier = $(this).attr("data-id");

                    layers.select(identifier);
                }
            });
            $(".hideLayer").click(function () {
                let nr = $(this).parent(".layerView").attr("id");

                $(this).hide();
                $(this)
                        .parent(".layerView")
                        .find(".showLayer")
                        .css({"display": "block"});

                layers.hide(nr);
            });
            $(".showLayer").click(function () {
                let nr = $(this).parent(".layerView").attr("id");

                $(this).hide();
                $(this)
                        .parent(".layerView")
                        .find(".hideLayer")
                        .css({"display": "block"});

                layers.show(nr);
            });
            $(".layerView[data-id=" + randomId + "]").click();
            points[randomId] = [];

        }
    }
    delete() {
        let identifier = $(".layerView.active").attr("data-id");
        let nr = $(".layerView.active").attr("id");

        let countViews = $(".layerView").length;

        if (countViews > 1) {
            let i = parseInt(nr);
            $(".layerView#" + i).remove();
            $("canvas#" + id).remove();
            for (i in layers.list) {
                if (!$('canvas#' + layers.list[i].id).length) {
                    layers.list.splice(i, 1);
                }
            }

            let j = 0;
            $(".layerView").each(function () {
                $(this).attr({
                    "id": j,
                    "data-id": layers.list[j].id}
                );
                j++;
            });

            webDraft.draw.width = 0;
            webDraft.draw.height = 0;
            $("canvas").each(function () {
                w = parseInt($(this).attr("width"));
                h = parseInt($(this).attr("height"));
                if (webDraft.draw.width < w)
                    webDraft.draw.width = w;

                if (webDraft.draw.height < h)
                    webDraft.draw.height = h;
            });
            $(".layerView").first().click();
            webDraft.positionElements();
        }
    }
    hide(nr) {
        let i = parseInt(nr);

        $(".layerView#" + i).addClass("hidden");
        $("canvas#" + layers.list[i].id).addClass("invisible");

        let j = 0;
        $("canvas").not('#snapImage').each(function () {
            layers.list[j].id = $(this).attr("id");

            if ($(this).hasClass("invisible"))
                layers.list[j].visible = false;
            else
                layers.list[j].visible = true;

            j++;
        });

        j = 0;
        $(".layerView").each(function () {
            $(this).attr({
                "id": j,
                "data-id": layers.list[j].id}
            );
            j++;
        });
        // $(".layerView#" + i).next().not(".hidden").click()
    }
    show(nr) {
        let i = parseInt(nr);

        $(".layerView#" + i).removeClass("hidden");
        $("canvas#" + layers.list[i].id).removeClass("invisible");

        let j = 0;
        $("canvas").not('#snapImage').each(function () {
            layers.list[j].id = $(this).attr("id");

            if ($(this).hasClass("invisible"))
                layers.list[j].visible = false;
            else
                layers.list[j].visible = true;

            j++;
        });

        j = 0;
        $(".layerView").each(function () {
            $(this).attr({
                "id": j,
                "data-id": layers.list[j].id}
            );
            j++;
        });
    }
    select(id) {
        if (!$(".layerView[data-id=" + id + "]").hasClass("hidden")) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext('2d');

            layers.activeId = id;
        }
    }
    rotate(angle) {
        let image = new Image();
        image.src = canvas.toDataURL();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(image, -image.width / 2, -image.width / 2);
        ctx.restore();
        layers.saveState();
    }
    mirror(direction) {
        if (direction === 'horizontal' || direction === 'vertical') {
            let image = new Image();
            image.src = canvas.toDataURL();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            if (direction === 'vertical')
                ctx.scale(-1, 1);
            else if (direction === 'horizontal')
                ctx.scale(1, -1);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
            ctx.restore();
            layers.saveState();
        }
    }
    negative() {
        let destX = 0;
        let destY = 0;

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];   // red
            pixels[i + 1] = 255 - pixels[i + 1]; // green
            pixels[i + 2] = 255 - pixels[i + 2]; // blue
            // i+3 is alpha (the fourth element)
        }

        // overwrite original image
        ctx.putImageData(imageData, 0, 0);//add the function call in the imageObj.onload
        layers.saveState();
    }
    moveUp() {
        let firstID = $(".layerView").first().attr("data-id");
        if (firstID !== layers.activeId) {
            let thisNr = $(".layerView[data-id=" + layers.activeId + "]").attr("id");
            let prevNr = parseInt(thisNr) - 1;
            let prevId = $(".layerView#" + prevNr).attr("data-id");
            let thisLayer = $(".layerView#" + thisNr);
            let prevLayer = $(".layerView#" + prevNr);

            thisLayer.insertBefore(".layerView#" + prevNr);
            thisLayer.removeAttr("id").attr("id", prevNr);
            prevLayer.removeAttr("id").attr("id", thisNr);

            $("canvas#" + layers.activeId).insertBefore("canvas#" + prevId);

            let j = 0;
            $("canvas").each(function () {
                layers.list[j].id = $(this).attr("id");

                if ($(this).hasClass("invisible"))
                    layers.list[j].visible = false;
                else
                    layers.list[j].visible = true;

                j++;
            });

            return true;
        }
        return false;
    }
    moveDown() {
        let lastID = $(".layerView").last().attr("data-id");
        if (lastID !== layers.activeId) {
            let thisNr = $(".layerView[data-id=" + layers.activeId + "]").attr("id");
            let nextNr = parseInt(thisNr) + 1;
            let nextId = $(".layerView#" + nextNr).attr("data-id");
            let thisLayer = $(".layerView#" + thisNr);
            let prevLayer = $(".layerView#" + nextNr);

            thisLayer.insertAfter(".layerView#" + nextNr);
            thisLayer.removeAttr("id").attr("id", nextNr);
            prevLayer.removeAttr("id").attr("id", thisNr);

            $("canvas#" + layers.activeId).insertAfter("canvas#" + nextId);
            let j = 0;
            $("canvas").each(function () {
                layers.list[j].id = $(this).attr("id");

                if ($(this).hasClass("invisible"))
                    layers.list[j].visible = false;
                else
                    layers.list[j].visible = true;

                j++;
            });

            return true;
        }
        return false;
    }
}
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
        webDraft.positionElements();
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
class Shapes {
    constructor() {
        $('#drawHandler').append(`
                <div id="prepareRect"></div>
                <div id="prepareCircle"></div>`);
        this.startShapePoints = {
            x: 0,
            y: 0
        };
        this.fill = {
            isSet: false,
            color: "#ffffff",
            opacity: 100
        };
    }

    startShape() {
        this.startShapePoints.x = webDraft.mPosition.x;
        this.startShapePoints.y = webDraft.mPosition.y;
    }
    prepareRect() {
        let x, y, width, height;
        if (this.startShapePoints.x <= webDraft.mPosition.x) {
            x = this.startShapePoints.x;
            width = webDraft.mPosition.x - this.startShapePoints.x;
        } else {
            x = webDraft.mPosition.x;
            width = this.startShapePoints.x - webDraft.mPosition.x;
        }
        if (this.startShapePoints.y <= webDraft.mPosition.y) {
            y = this.startShapePoints.y;
            height = webDraft.mPosition.y - this.startShapePoints.y;
        } else {
            y = webDraft.mPosition.y;
            height = this.startShapePoints.y - webDraft.mPosition.y;
        }
        $("#prepareRect")
                .show()
                .css({
                    "top": y + parseInt($(canvas).css('top')) + "px",
                    "left": x + parseInt($(canvas).css('left')) + "px",
                    "width": width + "px",
                    "height": height + "px",
                    "border": webDraft.size + "px solid " + webDraft.color
                });
        if (this.fill.isSet) {
            $("#prepareRect").css({"background": hexToRgba(this.fill.color, this.fill.opacity)});
        } else {
            $("#prepareRect").css({"background": "transparent"});
        }
        if (webDraft.shadow.isShadow) {
            $("#prepareRect").css({"box-shadow": webDraft.shadow.offsetX + "px " + webDraft.shadow.offsetY + "px " + webDraft.shadow.blur + "px " + webDraft.shadow.color});
        } else {
            $("#prepareRect").css({"box-shadow": "none"});
        }
    }
    drawRect() {
        let x, y, width, height;
        if (this.startShapePoints.x >= 0 && this.startShapePoints.y >= 0) {
            if (this.startShapePoints.x <= webDraft.mPosition.x) {
                x = this.startShapePoints.x;
                width = webDraft.mPosition.x - this.startShapePoints.x;
            } else {
                x = webDraft.mPosition.x;
                width = this.startShapePoints.x - webDraft.mPosition.x;
            }
            if (this.startShapePoints.y <= webDraft.mPosition.y) {
                y = this.startShapePoints.y;
                height = webDraft.mPosition.y - this.startShapePoints.y;
            } else {
                y = webDraft.mPosition.y;
                height = this.startShapePoints.y - webDraft.mPosition.y;
            }
            $("#prepareRect").hide();
            ctx.beginPath();
            draw.drawStyle();
            ctx.rect(x, y, width, height);
            ctx.fill();
            ctx.stroke();
        }
        this.startShapePoints.x = -1;
        this.startShapePoints.y = -1;
    }
    prepareCircle() {
        let x, y, width, height, radius;
        x = this.startShapePoints.x;
        y = this.startShapePoints.y;

        if (x <= webDraft.mPosition.x) {
            width = webDraft.mPosition.x - x;
        } else {
            width = x - webDraft.mPosition.x;
        }

        if (y <= webDraft.mPosition.y) {
            height = webDraft.mPosition.y - y;
        } else {
            height = y - webDraft.mPosition.y;
        }

        if (width > height) {
            radius = width;
        } else {
            radius = height;
        }
        $("#prepareCircle")
                .show()
                .css({
                    "top": y + parseInt($(canvas).css('top')) - radius + "px",
                    "left": x + parseInt($(canvas).css('left')) - radius + "px",
                    "width": radius * 2 + "px",
                    "height": radius * 2 + "px",
                    "border": webDraft.size + "px solid " + webDraft.color,
                    "border-radius": "100%"
                });

        if (this.fill.isSet) {
            $("#prepareCircle").css({"background": hexToRgba(this.fill.color, this.fill.opacity)});
        } else {
            $("#prepareCircle").css({"background": "transparent"});
        }

        if (webDraft.shadow.isShadow) {
            $("#prepareCircle").css({"box-shadow": webDraft.shadow.offsetX + "px " + webDraft.shadow.offsetY + "px " + webDraft.shadow.blur + "px " + webDraft.shadow.color});
        } else {
            $("#prepareCircle").css({"box-shadow": "none"});
        }
    }
    drawCircle() {
        let x, y, width, height, radius;
        x = this.startShapePoints.x;
        y = this.startShapePoints.y;

        if (x >= 0 && y >= 0) {

            if (x <= webDraft.mPosition.x) {
                width = webDraft.mPosition.x - x;
            } else {
                width = x - webDraft.mPosition.x;
            }
            if (y <= webDraft.mPosition.y) {
                height = webDraft.mPosition.y - y;
            } else {
                height = y - webDraft.mPosition.y;
            }
            if (width > height) {
                radius = width;
            } else {
                radius = height;
            }
            $("#prepareCircle").hide();

            ctx.beginPath();
            draw.drawStyle();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        }
        this.startShapePoints.x = -1;
        this.startShapePoints.y = -1;
    }
}
class Text {
    constructor() {
        $('#drawHandler').append('<div id="textRectangle" contenteditable></div>');

        $.get('parts/text-options.part.html', function (data) {
            $('#textOptions').html(data);


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
        });
        this.hoverSelectRectangle = false;
        this.isSelecting = false;
        this.startSelectPoints = {
            x: 0,
            y: 0
        };
    }
    initSelect() {
        this.startTextPoints = {
            x: webDraft.mPosition.x,
            y: webDraft.mPosition.y
        };
        console.log(this.startTextPoints)
    }
    startSelect() {
        if ($("#textRectangle").empty()) {
            let x, y, width, height;
            if (this.startTextPoints.x <= webDraft.mPosition.x) {
                x = this.startTextPoints.x;
                width = webDraft.mPosition.x - this.startTextPoints.x;
            } else {
                x = webDraft.mPosition.x;
                width = this.startTextPoints.x - webDraft.mPosition.x;
            }
            if (this.startTextPoints.y <= webDraft.mPosition.y) {
                y = this.startTextPoints.y;
                height = webDraft.mPosition.y - this.startTextPoints.y;
            } else {
                y = webDraft.mPosition.y;
                height = this.startTextPoints.y - webDraft.mPosition.y;
            }
            $("#textRectangle")
                    .empty()
                    .show()
                    .css({
                        "top": y + parseInt($(canvas).css('top')) + "px",
                        "left": x + parseInt($(canvas).css('left')) + "px",
                        "min-height": height + "px",
                        "width": width + "px",
                        "height": height + "px",
                        "border": "1px dashed #fff",
                        "background": "transparent"
                    });
            this.isSelecting = true;
        }
    }
    showTextOptions() {
        this.isSelecting = false;
        $("#textOptions").show();
    }
    putLayer() {
        $("#textRectangle").css('border', 'none');

        if ($('#textRectangle').html() === '') {
            return false;
        }

        let top = parseInt($("#textRectangle").css('top'));
        let left = parseInt($("#textRectangle").css('left'));
        html2canvas($('#textRectangle'), {
            onrendered: function (canvas) {
                let widthImg = canvas.width;
                let heightImg = canvas.height;
                layers.newLayer();
                layers.setLayerSize(layers.activeId, widthImg, heightImg);
                layers.setLayerPosition(layers.activeId, top, left);
                webDraft.positionElements();

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
    }
}
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

        $("title").text(this.title + ' [' + this.draw.width + " x " + this.draw.height + ']');
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
                    if (typeof ctx !== 'undefined') {
                        ctx.beginPath();
                        ctx.stroke();
                    }
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

const DEBUG = 0;

const PENCIL = 'pencil';
const SELECT = 'select';
const ERASER = 'eraser';
const WEB = 'web';
const TEXT = 'text';
const RECTANGLE = 'rectangle';
const CIRCLE = 'circle';
const COLORSAMPLER = 'colorsampler';


let items = [
    {
        text: 'Clear',
        shortcut: 'ctrl+del',
        icon: 'fas fa-ban',
        onclick: function () {
            webDraft.clear();
        }
    },
    {
        text: 'Upload image',
        shortcut: 'ctrl+o',
        icon: 'fas fa-upload',
        onclick: function () {
            $('#fileUploader').click();
        }
    },
    {
        text: 'Save image',
        shortcut: 'ctrl+s',
        icon: 'fas fa-download',
        onclick: function () {
            file.download();
        }
    },
    {
        text: 'Color',
        icon: 'fas fa-tint',
        submenu: [
            {
                text: 'Invert',
                icon: 'fas fa-adjust',
                onclick: function () {
                    layers.negative();
                }
            },
            {
                text: 'Colorpicker',
                icon: 'fas fa-eye-dropper',
                onclick: function () {
                    $('#colorsampler').click();
                }
            }
        ]
    }
];

let context_menu = new Contextmenu(items);
let camera = new Camera();
let file = new File();
let shapes = new Shapes();
let draw = new Draw();
let text = new Text();
let resizer = new Resizer();
let layers = new Layers();
let select = new Select();
let webDraft = new WebDraft();


let canvas,
        ctx,
        randomId,
        points = {};


$(window)
        .resize(function () {
            webDraft.resize();
            webDraft.positionElements();
        });
$(document)
        .ready(function (event) {
            if (/mobile/i.test(navigator.userAgent)) {
                webDraft.draw.width = window.innerWidth - 10;
                webDraft.draw.height = window.innerHeight - 30;
            }

            webDraft.init();
            $("#selectRectangle, #textRectangle")
                    .draggable({snap: false})
                    .css({"position": "absolute"});

            $("#shadowDot").draggable({
                containment: "#shadowSquare",
                scroll: false,
                drag: function () {
                    let shadowY = parseInt($(this).css('top')) - (parseInt($(this).parent().height()) / 2);
                    let shadowX = parseInt($(this).css('left')) - (parseInt($(this).parent().width()) / 2);
                    webDraft.shadow.offsetX = shadowX;
                    webDraft.shadow.offsetY = shadowY;
                }
            });
            $('#shadowSquare').on('mousedown', function (e) {
                let x = e.pageX - $(this).offset().left;
                let y = e.pageY - $(this).offset().top;

                $("#shadowDot").css({
                    top: (y - 5) + 'px',
                    left: (x - 5) + 'px'
                });

                let shadowY = parseInt($("#shadowDot").css('top')) - (parseInt($("#shadowDot").parent().height()) / 2);
                let shadowX = parseInt($("#shadowDot").css('left')) - (parseInt($("#shadowDot").parent().width()) / 2);
                webDraft.shadow.offsetX = shadowX;
                webDraft.shadow.offsetY = shadowY;
            });


        })
        .bind("contextmenu", function (e) {
            if (!DEBUG) {
                e.preventDefault();
            }
        })
        .on('mouseup touchend', function (e) {
            webDraft._mouseup(e);
        })
        .on('mousemove touchmove', function (e) {
            webDraft._mousemove(e);
        });

function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    var a = opacity / 100;
    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';

    return result;
}