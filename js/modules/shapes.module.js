var shapes = {
    // variables
    startShapePoints : [0, 0],
    fill : {
        isSet   : false,
        color   : "#ffffff",
        opacity : 100
    },

    // functions
    startShape : function() {
        shapes.startShapePoints = [webDraft.mPosition.x, webDraft.mPosition.y];
    },
    prepareRect : function() {
        if (shapes.startShapePoints[0] <= webDraft.mPosition.x) {
            var x = shapes.startShapePoints[0],
                width = webDraft.mPosition.x - shapes.startShapePoints[0];
        } else {
            var x = webDraft.mPosition.x,
                width = shapes.startShapePoints[0] - webDraft.mPosition.x;
        }
        if (shapes.startShapePoints[1] <= webDraft.mPosition.y) {
            var y = shapes.startShapePoints[1],
                height = webDraft.mPosition.y - shapes.startShapePoints[1];
        } else {
            var y = webDraft.mPosition.y,
                height = shapes.startShapePoints[1] - webDraft.mPosition.y;
        }
        $("#prepareRect")
            .show()
            .css({
                "top"    : y + parseInt($(webDraft.draw.selectorId).offset().top) + "px",
                "left"   : x + parseInt($(webDraft.draw.selectorId).offset().left) + "px",
                "width"  : width + "px",
                "height" : height + "px",
                "border" : webDraft.size + "px solid " + webDraft.color
            });
        if (shapes.fill.isSet) {
            $("#prepareRect").css({ "background" : hexToRgba(shapes.fill.color, shapes.fill.opacity) });
        } else {
            $("#prepareRect").css({ "background" : "transparent" });
        }
        if (webDraft.shadow.isShadow) {
            $("#prepareRect").css({ "box-shadow" : webDraft.shadow.offsetX + "px " + webDraft.shadow.offsetY + "px " + webDraft.shadow.blur + "px " + webDraft.shadow.color });
        } else {
            $("#prepareRect").css({ "box-shadow" : "none" });
        }
    },
    drawRect : function() {
        if (shapes.startShapePoints[0] <= webDraft.mPosition.x) {
            var x = shapes.startShapePoints[0],
                width = webDraft.mPosition.x - shapes.startShapePoints[0];
        } else {
            var x = webDraft.mPosition.x,
                width = shapes.startShapePoints[0] - webDraft.mPosition.x;
        }
        if (shapes.startShapePoints[1] <= webDraft.mPosition.y) {
            var y = shapes.startShapePoints[1],
                height = webDraft.mPosition.y - shapes.startShapePoints[1];
        } else {
            var y = webDraft.mPosition.y,
                height = shapes.startShapePoints[1] - webDraft.mPosition.y;
        }
        $("#prepareRect").hide();
        ctx.beginPath();
        draw.drawStyle();
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        shapes.startShapePoints = [];
    },
    prepareCircle : function() {
        var x = shapes.startShapePoints[0],
            y = shapes.startShapePoints[1];

        if (shapes.startShapePoints[0] <= webDraft.mPosition.x) {
            var width = webDraft.mPosition.x - shapes.startShapePoints[0];
        } else {
            var width = shapes.startShapePoints[0] - webDraft.mPosition.x;
        }

        if (shapes.startShapePoints[1] <= webDraft.mPosition.y) {
            var height = webDraft.mPosition.y - shapes.startShapePoints[1];
        } else {
            var height = shapes.startShapePoints[1] - webDraft.mPosition.y;
        }

        if (width > height)
            var radius = width / 2;
        else
            var radius = height / 2;

        $("#prepareCircle")
            .show()
            .css({
                "top"           : y + parseInt($(webDraft.draw.selectorId).offset().top) - radius + "px",
                "left"          : x + parseInt($(webDraft.draw.selectorId).offset().left) - radius + "px",
                "width"         : radius * 2 + "px",
                "height"        : radius * 2 + "px",
                "border"        : webDraft.size + "px solid " + webDraft.color,
                "border-radius" : "100%"
            });

        if (shapes.fill.isSet) {
            $("#prepareCircle").css({ "background" : hexToRgba(shapes.fill.color, shapes.fill.opacity) });
        } else {
            $("#prepareCircle").css({ "background" : "transparent" });
        }

        if (webDraft.shadow.isShadow) {
            $("#prepareCircle").css({ "box-shadow" : webDraft.shadow.offsetX + "px " + webDraft.shadow.offsetY + "px " + webDraft.shadow.blur + "px " + webDraft.shadow.color });
        } else {
            $("#prepareCircle").css({ "box-shadow" : "none" });
        }
    },
    drawCircle : function() {
        var x = shapes.startShapePoints[0],
            y = shapes.startShapePoints[1];

        if (shapes.startShapePoints[0] <= webDraft.mPosition.x) {
            var width = webDraft.mPosition.x - shapes.startShapePoints[0];
        } else {
            var width = shapes.startShapePoints[0] - webDraft.mPosition.x;
        }
        if (shapes.startShapePoints[1] <= webDraft.mPosition.y) {
            var height = webDraft.mPosition.y - shapes.startShapePoints[1];
        } else {
            var height = shapes.startShapePoints[1] - webDraft.mPosition.y;
        }
        if (width > height)
            var radius = width / 2;
        else
            var radius = height / 2;

        $("#prepareCircle").hide();

        ctx.beginPath();
        draw.drawStyle();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }
}
