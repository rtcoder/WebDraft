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
    this.startShapePoints.x = mousePosition.x;
    this.startShapePoints.y = mousePosition.y;
  }

  prepareRect() {
    let x, y, width, height;
    if (this.startShapePoints.x <= mousePosition.x) {
      x = this.startShapePoints.x;
      width = mousePosition.x - this.startShapePoints.x;
    } else {
      x = mousePosition.x;
      width = this.startShapePoints.x - mousePosition.x;
    }
    if (this.startShapePoints.y <= mousePosition.y) {
      y = this.startShapePoints.y;
      height = mousePosition.y - this.startShapePoints.y;
    } else {
      y = mousePosition.y;
      height = this.startShapePoints.y - mousePosition.y;
    }
    $("#prepareRect")
        .show()
        .css({
          "top": y + parseInt($(canvas).css('top')) + "px",
          "left": x + parseInt($(canvas).css('left')) + "px",
          "width": width + "px",
          "height": height + "px",
          "border": DRAW_SETTINGS.size + "px solid " + DRAW_SETTINGS.color
        });
    if (this.fill.isSet) {
      $("#prepareRect").css({ "background": hexToRgba(this.fill.color, this.fill.opacity) });
    } else {
      $("#prepareRect").css({ "background": "transparent" });
    }
    if (DRAW_SETTINGS.shadow.isShadow) {
      $("#prepareRect").css({ "box-shadow": DRAW_SETTINGS.shadow.offsetX + "px " + DRAW_SETTINGS.shadow.offsetY + "px " + DRAW_SETTINGS.shadow.blur + "px " + DRAW_SETTINGS.shadow.color });
    } else {
      $("#prepareRect").css({ "box-shadow": "none" });
    }
  }

  drawRect() {
    let x, y, width, height;
    if (this.startShapePoints.x >= 0 && this.startShapePoints.y >= 0) {
      if (this.startShapePoints.x <= mousePosition.x) {
        x = this.startShapePoints.x;
        width = mousePosition.x - this.startShapePoints.x;
      } else {
        x = mousePosition.x;
        width = this.startShapePoints.x - mousePosition.x;
      }
      if (this.startShapePoints.y <= mousePosition.y) {
        y = this.startShapePoints.y;
        height = mousePosition.y - this.startShapePoints.y;
      } else {
        y = mousePosition.y;
        height = this.startShapePoints.y - mousePosition.y;
      }
      $("#prepareRect").hide();
      ctx.beginPath();
      getDrawStyle();
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

    if (x <= mousePosition.x) {
      width = mousePosition.x - x;
    } else {
      width = x - mousePosition.x;
    }

    if (y <= mousePosition.y) {
      height = mousePosition.y - y;
    } else {
      height = y - mousePosition.y;
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
          "border": DRAW_SETTINGS.size + "px solid " + DRAW_SETTINGS.color,
          "border-radius": "100%"
        });

    if (this.fill.isSet) {
      $("#prepareCircle").css({ "background": hexToRgba(this.fill.color, this.fill.opacity) });
    } else {
      $("#prepareCircle").css({ "background": "transparent" });
    }

    if (DRAW_SETTINGS.shadow.isShadow) {
      $("#prepareCircle").css({ "box-shadow": DRAW_SETTINGS.shadow.offsetX + "px " + DRAW_SETTINGS.shadow.offsetY + "px " + DRAW_SETTINGS.shadow.blur + "px " + DRAW_SETTINGS.shadow.color });
    } else {
      $("#prepareCircle").css({ "box-shadow": "none" });
    }
  }

  drawCircle() {
    let x, y, width, height, radius;
    x = this.startShapePoints.x;
    y = this.startShapePoints.y;

    if (x >= 0 && y >= 0) {

      if (x <= mousePosition.x) {
        width = mousePosition.x - x;
      } else {
        width = x - mousePosition.x;
      }
      if (y <= mousePosition.y) {
        height = mousePosition.y - y;
      } else {
        height = y - mousePosition.y;
      }
      if (width > height) {
        radius = width;
      } else {
        radius = height;
      }
      $("#prepareCircle").hide();

      ctx.beginPath();
      getDrawStyle();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    }
    this.startShapePoints.x = -1;
    this.startShapePoints.y = -1;
  }
}
const shapes = new Shapes();