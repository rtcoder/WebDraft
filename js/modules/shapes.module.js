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
                    "top": y + "px",
                    "left": x + "px",
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
                    "top": y - radius + "px",
                    "left": x - radius + "px",
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