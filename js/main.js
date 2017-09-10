var canvas,
    ctx,
    randomId,
    points   = {},
    webDraft = {
        
        isLoaded : false,
        title   : "WebDraft",
        version : "2.2.6",
        click   : {
            left  : false, //left mouse button
            right : false  //right mouse button
        },
        mPosition : {//mouse position on draw
            x : 0,
            y : 0
        },
        draw : {
            width        : 600,
            height       : 600,
            thisParent  : "#drawHandler",
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
               
            },
            positionElements : function() {
                var image = {
                    id  : new Array(),
                    img : new Array()
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
                    "width"  : webDraft.draw.width,
                    "height" : webDraft.draw.height
                });
                $(webDraft.draw.thisParent).css({
                    "background" : webDraft.draw.bg,
                    "width"      : webDraft.draw.width,
                    "height"     : webDraft.draw.height
                });

                if (webDraft.draw.width >= $("#content").width()) {
                    $(webDraft.draw.thisParent).css({ "margin-left" : "0px" });
                } else {
                    $(webDraft.draw.thisParent).css({ "margin-left" : ($("#content").width() - webDraft.draw.width) / 2 });
                }

                if (webDraft.draw.height >= $("#content").height()) {
                    $(webDraft.draw.thisParent).css({ "margin-top" : "0px" });
                } else {
                    $(webDraft.draw.thisParent).css({ "margin-top" : ($("#content").height() - webDraft.draw.height) / 2 });
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

                points[layers.activeId] = [];
//                do poprawy
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
                    colorCode = "transparent";

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
                var touch = undefined;
                
                if (event.originalEvent.touches){
                    touch = event.originalEvent.touches[0];
                
                    var pos_x = event.pageX || touch.pageX;
                    var pos_y = event.pageY || touch.pageY;
                
                
                }else{
                    var pos_x = event.pageX;
                    var pos_y = event.pageY;
                }

                webDraft.mPosition.x = pos_x - parseInt($(webDraft.draw.selectorId).offset().left);
                webDraft.mPosition.y = pos_y - parseInt($(webDraft.draw.selectorId).offset().top);

                webDraft.mPosition.y = webDraft.mPosition.y - parseInt($(canvas).css('top'));
                webDraft.mPosition.x = webDraft.mPosition.x - parseInt($(canvas).css('left'));

                $("#mousePosition").text(webDraft.mPosition.x + " , " + webDraft.mPosition.y);
                if(webDraft.mPosition.x < 0 || webDraft.mPosition.x > $(webDraft.draw.selectorId).width()
                || webDraft.mPosition.y < 0 || webDraft.mPosition.y > $(webDraft.draw.selectorId).height()){
                    $("#mousePosition").empty();
                }
            },
            _mousedown:function(event){
                webDraft.func.mousePosition(event);
                if ("buttons" in event) {
                    if(event.buttons == 1){
                        webDraft.click.left = true;
                    }
                }
                var button = event.which || event.button;
                if(button == 1){
                    webDraft.click.left = true;
                }
                if (!webDraft.click.right && webDraft.click.left) {
                    if(webDraft.selectedTool !== "select")
                        points[layers.activeId].push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                    switch (webDraft.selectedTool) {
                        case "pencil" :
                        case "eraser" :
                            draw.drawing();
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
            },
            _mouseup:function(event){
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
            },
            _mousemove:function(event){
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
                        points[layers.activeId].push({x: webDraft.mPosition.x, y: webDraft.mPosition.y});

                    switch (webDraft.selectedTool) {
                        case "pencil" :
                        case "eraser" :
                            draw.drawStyle();
                            ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
                            ctx.stroke();
                        break;
                        case "web" :
                            draw.drawWeb();
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
            },
            loadParts: function(){
                $.get('parts/buttons.part.html', function (data){
                    $('[data-id=buttons]').html(data);
                    events.buttons();
                });
                $.get('parts/info.part.html', function (data){
                    $('#info').html(data);
                    events.info();
                });
                $.get('parts/color-picker.part.html', function (data){
                    $('[data-id=color-picker]').html(data);
                    events.color();
                });
                $.get('parts/text-options.part.html', function (data){
                    $('#textOptions').html(data);
                    events.textOptions();
                });
                $.get('parts/sliders.part.html', function (data){
                    $('[data-id=sliders]').html(data);
                    events.sliders();
                });
                $.get('parts/resizer.part.html', function (data){
                    $('#resizer').html(data);
                    events.resizer();
                });
                webDraft.isLoaded = true;
            },
            init : function() {
                if(!webDraft.isLoaded){
                    webDraft.func.loadParts();
                }
                
                layers.initEvents();
                layers.newLayer();

                //events on #draw
                $(webDraft.draw.eventHandler)
                    .hover(function() {
                        ctx.beginPath();
                        ctx.stroke();

                        if(webDraft.selectedTool === "eraser")
                            $("#eraseRect").show();

                    })
                    .bind("contextmenu", function(event) {
                        event.preventDefault();
                        webDraft.click.right = true;
                        webDraft.click.left  = false;
                    })
                    .on('mousedown touchstart', webDraft.func._mousedown)
                    .on('mouseup touchend', webDraft.func._mouseup)
                    .on('mousemove touchmove', webDraft.func._mousemove)
                    .mouseleave(function() {
                        ctx.stroke();
                        layers.saveState();
                        if(webDraft.selectedTool === "eraser")
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

        webDraft.func.init();

        $("#resizer")
            .draggable({
                snap    : true,
                opacity : 0.75
            })
            .css({ "position" : "absolute" });
        $("#selectRectangle, #textRectangle")
            .draggable({snap : false})
            .css({ "position" : "absolute" });

        $( "#shadowDot" ).draggable({
            containment: "#shadowSquare",
            scroll: false,
            drag: function() {
                var shadowY = parseInt($(this).css('top')) - (parseInt($(this).parent().height())/2);
                var shadowX = parseInt($(this).css('left')) - (parseInt($(this).parent().width())/2);
                webDraft.shadow.offsetX = shadowX;
                webDraft.shadow.offsetY = shadowY;
            }
        });
        $('#shadowSquare').on('mousedown', function(e){
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            
            $( "#shadowDot" ).css({
                top: (y-5)+'px',
                left: (x-5)+'px'
            });
            
            var shadowY = parseInt($( "#shadowDot" ).css('top')) - (parseInt($( "#shadowDot" ).parent().height())/2);
            var shadowX = parseInt($( "#shadowDot" ).css('left')) - (parseInt($( "#shadowDot" ).parent().width())/2);
            webDraft.shadow.offsetX = shadowX;
            webDraft.shadow.offsetY = shadowY;
        });


    })
    .bind("contextmenu", function(e) {
        e.preventDefault();
    })
    .on('mouseup touchend', webDraft.func._mouseup)
    .on('mousemove touchmove', webDraft.func._mousemove);
