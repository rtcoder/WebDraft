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