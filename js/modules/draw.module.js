var draw = {

    // functions
    drawStyle : function() {
        ctx.lineWidth = webDraft.size;

        if (webDraft.selectedTool === "rectangle") {
            ctx.lineJoin = ctx.lineCap = 'miter';
        } else {
            ctx.lineJoin = ctx.lineCap = 'round';
        }

        if (shapes.fill.isSet === true) {
            ctx.fillStyle = hexToRgba(shapes.fill.color, shapes.fill.opacity);
        } else {
            ctx.fillStyle = "transparent";
        }

        if (webDraft.shadow.isShadow === true && webDraft.selectedTool !== 'eraser') {
            ctx.shadowBlur    = webDraft.shadow.blur;
            ctx.shadowColor   = webDraft.shadow.color;
            ctx.shadowOffsetX = webDraft.shadow.offsetX;
            ctx.shadowOffsetY = webDraft.shadow.offsetY;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = webDraft.color;//line color
    },
    drawing : function() {
        ctx.beginPath();
        ctx.moveTo(webDraft.mPosition.x, webDraft.mPosition.y);
        draw.drawStyle();
        ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
        ctx.stroke();
    },
    drawWeb : function() {
        ctx.beginPath();
        draw.drawStyle();
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
        for (var i = 0, len = points.length; i < len; i++) {
            dx = points[i].x - points[points.length - 1].x;
            dy = points[i].y - points[points.length - 1].y;
            d  = dx * dx + dy * dy;
            if (d < webDraft.sensitivityPoints) {
                ctx.beginPath();
                draw.drawStyle();
                ctx.moveTo(points[points.length - 1].x + (dx * 0.2), points[points.length - 1].y + (dy * 0.2));
                ctx.lineTo(points[i].x - (dx * 0.2), points[i].y - (dy * 0.2));
                ctx.stroke();
            }
        }
    }
}
