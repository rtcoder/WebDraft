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
      x: mousePosition.x,
      y: mousePosition.y
    };
  }

  startSelect() {
    let x, y, width, height;
    if (this.startSelectPoints.x <= mousePosition.x) {
      x = this.startSelectPoints.x;
      width = mousePosition.x - this.startSelectPoints.x;
    } else {
      x = mousePosition.x;
      width = this.startSelectPoints.x - mousePosition.x;
    }
    if (this.startSelectPoints.y <= mousePosition.y) {
      y = this.startSelectPoints.y;
      height = mousePosition.y - this.startSelectPoints.y;
    } else {
      y = mousePosition.y;
      height = this.startSelectPoints.y - mousePosition.y;
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
      const xpos = parseInt($("#selectRectangle").css("left"));
      const ypos = parseInt($("#selectRectangle").css("top"));
      ctx.clearRect(xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height());
    } else { //else clear only selectRectangle background
      $("#selectRectangle").css({ "background": "transparent" });
    }

    saveLayersState();
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
      $(webDraftDraw.selectorId).append('<canvas id="tmpCanvas" width="' + $("#selectRectangle").width() + '" height="' + $("#selectRectangle").height() + '"></canvas>');

      const xpos = parseInt($("#selectRectangle").css("left"));
      const ypos = parseInt($("#selectRectangle").css("top"));
      const testC = document.getElementById("tmpCanvas");
      const testCtx = testC.getContext('2d');

      testCtx.drawImage(canvas, xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height(), 0, 0, $("#selectRectangle").width(), $("#selectRectangle").height());

      const bgImg = testC.toDataURL();

      $("#tmpCanvas").remove();
      $("#selectRectangle").css({ "background": "url(" + bgImg + ") -1px -1px no-repeat" });
    }
  }

  cutSelectedPart() {
    $(webDraftDraw.selectorId).append('<canvas id="tmpCanvas" width="' + $("#selectRectangle").width() + '" height="' + $("#selectRectangle").height() + '"></canvas>');

    const xpos = parseInt($("#selectRectangle").css("left"));
    const ypos = parseInt($("#selectRectangle").css("top"));
    const testC = document.getElementById("tmpCanvas");
    const testCtx = testC.getContext('2d');

    testCtx.drawImage(canvas, xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height(), 0, 0, $("#selectRectangle").width(), $("#selectRectangle").height());

    const bgImg = testC.toDataURL();

    $("#tmpCanvas").remove();
    $("#selectRectangle").css({ "background": "url(" + bgImg + ") -1px -1px no-repeat " });

    ctx.clearRect(xpos, ypos, $("#selectRectangle").width(), $("#selectRectangle").height());
    saveLayersState();
  }

  pasteSelectedPart() {
    if ($("#selectRectangle").css("background-image") !== "none") {
      const xpos = parseInt($("#selectRectangle").css("left"));
      const ypos = parseInt($("#selectRectangle").css("top"));
      const img = new Image();
      const bg = $("#selectRectangle")
          .css("background-image")
          .replace('url(', '')
          .replace(')', '')
          .replace('"', '')
          .replace('"', '');
      img.onload = function () {
        ctx.drawImage(img, xpos, ypos); //save part of image when loaded

        saveLayersState(); //and then update layer preview
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

const select = new Select();