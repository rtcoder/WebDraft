class Text {
  constructor() {
    $('#selectFontType').change(function () {
      $('#textRectangle').css('font-family', $(this).val());
    });
    $('#selectFontSize').change(function () {
      $('#textRectangle').css('font-size', $(this).val() + 'px');
    });
    $('.textPostionTool').click(function () {
      $('.textPostionTool').removeClass('active');
      $(this).addClass('active');
      $('#textRectangle').css('text-align', $(this).attr('id'));
    });
    $('.styleTool').click(function () {
      $(this).toggleClass('active');
      switch ($(this).attr('id')) {
        case 'bold':
          if ($(this).hasClass('active')) {
            $('#textRectangle').css('font-weight', 'bold');
          } else {
            $('#textRectangle').css('font-weight', 'normal');
          }
          break;
        case 'italic':
          if ($(this).hasClass('active')) {
            $('#textRectangle').css('font-style', 'italic');
          } else {
            $('#textRectangle').css('font-style', 'normal');
          }
          break;
        case 'underline':
        case 'line-through':
          let textDecoration = '';
          $('.textDecoration.active').each(function () {
            textDecoration += $(this).attr('id') + ' ';
          });
          if ($('.textDecoration.active').length > 0) {
            $('#textRectangle').css('text-decoration', textDecoration);
          } else {
            $('#textRectangle').css('text-decoration', 'none');
          }
          break;
        default:

      }
    });
    this.hoverSelectRectangle = false;
    this.isSelecting = false;
    this.startTextPoints = {
      x: 0,
      y: 0
    };
  }

  initSelect() {
    this.startTextPoints = {
      x: mousePosition.x,
      y: mousePosition.y
    };
    console.log(this.startTextPoints);
  }

  startSelect() {
    if ($('#textRectangle').empty()) {
      let x, y, width, height;
      if (this.startTextPoints.x <= mousePosition.x) {
        x = this.startTextPoints.x;
        width = mousePosition.x - this.startTextPoints.x;
      } else {
        x = mousePosition.x;
        width = this.startTextPoints.x - mousePosition.x;
      }
      if (this.startTextPoints.y <= mousePosition.y) {
        y = this.startTextPoints.y;
        height = mousePosition.y - this.startTextPoints.y;
      } else {
        y = mousePosition.y;
        height = this.startTextPoints.y - mousePosition.y;
      }
      $('#textRectangle')
          .empty()
          .show()
          .css({
            top: y + parseInt($(canvas).css('top')) + 'px',
            left: x + parseInt($(canvas).css('left')) + 'px',
            'min-height': height + 'px',
            width: width + 'px',
            height: height + 'px',
            border: '1px dashed #fff',
            background: 'transparent'
          });
      this.isSelecting = true;
    }
  }

  showTextOptions() {
    this.isSelecting = false;
    $('#textOptions').show();
  }

  putLayer() {
    $('#textRectangle').css('border', 'none');

    if ($('#textRectangle').html() === '') {
      return false;
    }

    let top = parseInt($('#textRectangle').css('top'));
    let left = parseInt($('#textRectangle').css('left'));
    html2canvas($('#textRectangle'), {
      onrendered: function (canvas) {
        let widthImg = canvas.width;
        let heightImg = canvas.height;
        newLayer();
        setLayerSize(activeLayerId, widthImg, heightImg);
        setLayerPosition(activeLayerId, top, left);
        positionElements();

        ctx.drawImage(canvas, 0, 0);

        saveLayersState();
        $('#textRectangle')
            .css({
              top: '0px',
              left: '0px',
              border: '1px dashed rgb(255, 255, 255)'
            })
            .width(0)
            .height(0)
            .hide()
            .empty();
      }
    });
  }
}

const text = new Text();