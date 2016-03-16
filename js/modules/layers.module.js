var layers = {
    //variables
    activeId : "",
    list : {
        id      : new Array(),
        visible : new Array()
    },
    //functions
    setLayerSize : function(layerId, width, height){
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

        if(layerId == ""){
            webDraft.draw.width  = width;
            webDraft.draw.height = height;
            $("canvas").attr({
                "width"  : webDraft.draw.width,
                "height" : webDraft.draw.height
            });
        }else{
            $("canvas#"+layerId).attr({
                "width"  : width,
                "height" : height
            })
            webDraft.draw.width = 0;
            webDraft.draw.height = 0;
            $("canvas").each(function(){
                w = parseInt($(this).attr("width"));
                h = parseInt($(this).attr("height"))
                if(webDraft.draw.width  < w)
                    webDraft.draw.width  = w;

                if(webDraft.draw.height < h)
                    webDraft.draw.height = h;
            })
        }

        for (var i = 0; i < layers.list.id.length; i++) {
            if (typeof layers.list.id[i] === "string") {
                layers.select(layers.list.id[i]);
                ctx.putImageData(image.img[i], 0, 0);
                layers.saveState();
            }
        }

        if (active !== "")
            layers.select(active);
    },
    saveState : function() {
        var imgSrc = document.getElementById(layers.activeId).toDataURL();
        $(".layerView[data-id=" + layers.activeId + "]").find("img").attr("src", imgSrc).show();
    },
    newLayer : function() {
        if (isNaN(parseInt($(".layerView:last").attr("id")))){
            var i = 0;
            var j = i;
        }else{
            var i = parseInt($(".layerView:last").attr("id"));
            var j = parseInt(i + 1);
        }

        var countViews = $("#listLayers").children(".layerView").length;

        if (countViews < 15) {
            randomId = webDraft.func.makeid();

            $(webDraft.draw.selectorId).append('<canvas id="' + randomId + '" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '" style="top:0;left:0"></canvas>');
            $("#listLayers").append('<div data-id="' + randomId + '" id="' + j + '" class="layerView"><img src="" class="imgLayer"><div title="Hide layer" class="hideLayer fa fa-eye"></div><div style="display:none" title="Show layer" class="showLayer fa fa-eye-slash"></div></div>').perfectScrollbar();

            layers.list.visible[j] = true;
            layers.list.id[j]      = randomId;

            $(".layerView").click(function() {
                if (!$(this).hasClass("hidden")) {
                    $(".layerView").removeClass("active");
                    $(this).addClass("active");

                    var identifier = $(this).attr("data-id");

                    layers.select(identifier);
                }
            });
            $(".hideLayer").click(function() {
                var nr = $(this).parent(".layerView").attr("id");

                $(this).hide();
                $(this).parent(".layerView").find(".showLayer").css({ "display" : "block" });

                layers.hide(nr);
            });
            $(".showLayer").click(function() {
                var nr = $(this).parent(".layerView").attr("id");

                $(this).hide();
                $(this).parent(".layerView").find(".hideLayer").css({ "display" : "block" });

                layers.show(nr);
            });
            $(".layerView[data-id=" + randomId + "]").click();

        }
    },
    delete : function(id, nr) {
        var countViews = $("#listLayers").children().length;

        if (countViews > 1) {
            var i = parseInt(nr);

            $(".layerView#" + i).remove();
            $("canvas#" + id).remove();

            layers.list.id      = new Array();
            layers.list.visible = new Array();

            var j = 0;
            $("canvas").each(function() {
                layers.list.id[j] = $(this).attr("id");
                if($(this).hasClass("invisible"))
                    layers.list.visible[j] = false;
                else
                    layers.list.visible[j] = true;

                j++;
            });

            j = 0;
            $(".layerView").each(function() {
                $(this).attr({
                    "id"      : j,
                    "data-id" : layers.list.id[j]}
                );
                j++;
            });

            $(".layerView[data-id=" + layers.list.id[layers.list.id.length - 1] + "]").click();
            webDraft.draw.width = 0;
            webDraft.draw.height = 0;
            $("canvas").each(function(){
                w = parseInt($(this).attr("width"));
                h = parseInt($(this).attr("height"))
                if(webDraft.draw.width  < w)
                    webDraft.draw.width  = w;

                if(webDraft.draw.height < h)
                    webDraft.draw.height = h;
            })
            webDraft.func.positionElements()
        }
    },
    hide : function(nr) {
        var i = parseInt(nr);

        $(".layerView#" + i).addClass("hidden");
        $("canvas#" + layers.list.id[i]).addClass("invisible");

        layers.list.id      = new Array();
        layers.list.visible = new Array();

        var j = 0;
        $("canvas").each(function() {
            layers.list.id[j] = $(this).attr("id");

            if($(this).hasClass("invisible"))
                layers.list.visible[j] = false;
            else
                layers.list.visible[j] = true;

            j++;
        });

        j = 0;
        $(".layerView").each(function() {
            $(this).attr({
                "id"      : j,
                "data-id" : layers.list.id[j]}
            );
            j++;
        });
        // $(".layerView#" + i).next().not(".hidden").click()
    },
    show : function(nr) {
        var i = parseInt(nr);

        $(".layerView#" + i).removeClass("hidden");
        $("canvas#" + layers.list.id[i]).removeClass("invisible");

        layers.list.id      = new Array();
        layers.list.visible = new Array();

        var j = 0;
        $("canvas").each(function() {
            layers.list.id[j] = $(this).attr("id");

            if($(this).hasClass("invisible"))
                layers.list.visible[j] = false;
            else
                layers.list.visible[j] = true;

            j++;
        });

        j = 0;
        $(".layerView").each(function() {
            $(this).attr({
                "id"      : j,
                "data-id" : layers.list.id[j]}
            );
            j++;
        });
    },
    select : function(id) {
        if (!$(".layerView[data-id=" + id + "]").hasClass("hidden")) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext('2d');

            layers.activeId = id;
        }
    },
    rotate : function(angle) {
        var image = new Image();
        image.src = canvas.toDataURL();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.rotate(angle*Math.PI/180);
        ctx.drawImage(image,-image.width/2,-image.width/2);
        ctx.restore();
		layers.saveState();
    },
    mirror : function(direction) {
        if(direction == 'horizontal' || direction == 'vertical'){
            var image = new Image();
            image.src = canvas.toDataURL();
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.save();
            ctx.translate(canvas.width/2,canvas.height/2);
            if(direction == 'vertical')
                ctx.scale(-1,1);
            else if (direction == 'horizontal')
                ctx.scale(1,-1);
            ctx.drawImage(image,-image.width/2,-image.height/2);
            ctx.restore();
    		layers.saveState();
        }
    },
    negative : function(){
        var destX = 0;
        var destY = 0;

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i]   = 255 - pixels[i];   // red
            pixels[i+1] = 255 - pixels[i+1]; // green
            pixels[i+2] = 255 - pixels[i+2]; // blue
            // i+3 is alpha (the fourth element)
        }

        // overwrite original image
        ctx.putImageData(imageData, 0, 0);//add the function call in the imageObj.onload
        layers.saveState();
    }


}
