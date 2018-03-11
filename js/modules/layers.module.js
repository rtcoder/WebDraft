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
                w = parseInt($(this).attr("width"));
                h = parseInt($(this).attr("height"));
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
            randomId = webDraft.func.makeid();

            $(webDraft.draw.selectorId).append('<canvas id="' + randomId + '" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '" style="top:0;left:0"></canvas>');
            $("#listLayers").append(`
                <div data-id="` + randomId + `" id="` + j + `" class="layerView">
                    <div class="imgLayerContainer">
                        <img src="" class="imgLayer">
                    </div>
                    <div title="Hide layer" class="hideLayer fa fa-eye"></div>
                    <div style="display:none" title="Show layer" class="showLayer fa fa-eye-slash"></div>
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
            webDraft.func.positionElements();
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