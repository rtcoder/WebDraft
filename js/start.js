let randomId;


$(window)
    .resize(() => {
      positionElements();
    });
$(document)
    .ready(event => {
      if (/mobile/i.test(navigator.userAgent)) {
        webDraftDraw.width = window.innerWidth - 10;
        webDraftDraw.height = window.innerHeight - 30;
      }

      initDraft();
      $('#selectRectangle, #textRectangle')
          .draggable({ snap: false })
          .css({ 'position': 'absolute' });

      $('#shadowDot').draggable({
        containment: '#shadowSquare',
        scroll: false,
        drag: function () {
          const shadowY = parseInt($(this).css('top')) - (parseInt($(this).parent().height()) / 2);
          const shadowX = parseInt($(this).css('left')) - (parseInt($(this).parent().width()) / 2);
          DRAW_SETTINGS.shadow.offsetX = shadowX;
          DRAW_SETTINGS.shadow.offsetY = shadowY;
        }
      });
      $('#shadowSquare').on('mousedown', function (e) {
        const x = e.pageX - $(this).offset().left;
        const y = e.pageY - $(this).offset().top;

        $('#shadowDot').css({
          top: (y - 5) + 'px',
          left: (x - 5) + 'px'
        });

        const shadowY = parseInt($('#shadowDot').css('top')) - (parseInt($('#shadowDot').parent().height()) / 2);
        const shadowX = parseInt($('#shadowDot').css('left')) - (parseInt($('#shadowDot').parent().width()) / 2);
        DRAW_SETTINGS.shadow.offsetX = shadowX;
        DRAW_SETTINGS.shadow.offsetY = shadowY;
      });


    })
    .bind('contextmenu', e => {
      if (!DEBUG) {
        e.preventDefault();
      }
    })
    .on('mouseup touchend', onMouseUp)
    .on('mousemove touchmove', onMouseMove);

