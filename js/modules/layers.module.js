var layers = {
    //variables
    activeId : "",
    list : {
        id : new Array(),
        zIndex : new Array(),
        visible : new Array()
    },
    //functions
    saveState : function() {
        var imgSrc = document.getElementById(layers.activeId).toDataURL();
        $(".layerView[data-id=" + layers.activeId + "]").find("img").attr("src", imgSrc).show();
    },
    newLayer : function() {
        if (isNaN(parseInt($(".layerView:last").attr("id")))){
            var i = 0;
            j = i;
        }else{
            var i = parseInt($(".layerView:last").attr("id"));
            j = parseInt(i + 1);
        }

        var countViews = $("#listLayers").children(".layerView").length;

        if (countViews < 15) {
            randomId = webDraft.func.makeid();

            $(webDraft.draw.selectorId).append('<canvas id="' + randomId + '" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '"></canvas>');
            $("#listLayers").append('<div data-id="' + randomId + '" id="' + j + '" class="layerView"><img src="" class="imgLayer"><div title="Hide layer" class="hideLayer fa fa-eye"></div><div style="display:none" title="Show layer" class="showLayer fa fa-eye-slash"></div></div>').perfectScrollbar();

            layers.list.visible[j] = true;
            layers.list.id[j] = randomId;

            $(".layerView").click(function() {
                if (!$(this).hasClass("hidden")) {
                    $(".layerView").removeClass("active");
                    $(this).addClass("active");
                    var identifier = $(this).attr("data-id");
                    layers.select(identifier);
                }
            });
            $(".hideLayer").click(function() {
                identifier = $(this).parent(".layerView").attr("data-id");
                nr = $(this).parent(".layerView").attr("id");
                $(this).hide();
                $(this).parent(".layerView").find(".showLayer").css("display", "block");
                layers.hide(identifier, nr);
            });
            $(".showLayer").click(function() {
                identifier = $(this).parent(".layerView").attr("data-id");
                nr = $(this).parent(".layerView").attr("id");
                $(this).hide();
                $(this).parent(".layerView").find(".hideLayer").css("display", "block");
                layers.show(identifier, nr);
            });
            $(".layerView[data-id=" + randomId + "]").click();
        }
    },
    delete : function(identifier, nr) {
        var countViews = $("#listLayers").children().length;

        if (countViews > 1) {
            var i = parseInt(nr);

            $(".layerView#" + i).remove();
            $("canvas#" + identifier).remove();

            layers.list.id = new Array();
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

            j=0;
            $(".layerView").each(function() {
                $(this).attr({
                    "id" : j,
                    "data-id" : layers.list.id[j]}
                );
                j++;
            });

            $(".layerView[data-id=" + layers.list.id[layers.list.id.length - 1] + "]").click();
        }
    },
    hide : function(identifier, nr) {
        var i = parseInt(nr);

        $(".layerView#" + i).addClass("hidden");
        $("canvas#" + layers.list.id[i]).addClass("invisible");

        layers.list.id = new Array();
        layers.list.visible = new Array();

        var j=0;
        $("canvas").each(function() {
            layers.list.id[j] = $(this).attr("id");

            if($(this).hasClass("invisible"))
                layers.list.visible[j] = false;
            else
                layers.list.visible[j] = true;

            j++;
        });

        j=0;
        $(".layerView").each(function() {
            $(this).attr({
                "id" : j,
                "data-id" : layers.list.id[j]}
            );
            j++;
        });
        // $(".layerView#" + i).next().not(".hidden").click()
    },
    show : function(identifier, nr) {
        var i = parseInt(nr);

        $(".layerView#" + i).removeClass("hidden");
        $("canvas#" + layers.list.id[i]).removeClass("invisible");

        layers.list.id = new Array();
        layers.list.visible = new Array();

        var j=0;
        $("canvas").each(function() {
            layers.list.id[j] = $(this).attr("id");

            if($(this).hasClass("invisible"))
                layers.list.visible[j] = false;
            else
                layers.list.visible[j] = true;

            j++;
        });

        j=0;
        $(".layerView").each(function() {
            $(this).attr({
                "id" : j,
                "data-id" : layers.list.id[j]}
            );
            j++;
        });
    },
    select : function(identifier) {
        if (!$(".layerView[data-id=" + identifier + "]").hasClass("hidden")) {
            canvas = document.getElementById(identifier);
            ctx = canvas.getContext('2d');
            layers.activeId = identifier;
        }
    }
}
