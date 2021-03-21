const keys = {
  Enter: false, //press Enter
  Esc: false, //press Escape (Esc)
  f11: false, //press F11
  f12: false, //press F12
  delete: false, //press delete
  C: false,
  X: false,
  V: false,
  O: false,
  I: false
};

const KEY_CODES = {
  Enter: 13,
  Esc: 27,
  Delete: 46,

  C: 67,
  I: 73,
  O: 79,
  S: 83,
  V: 86,
  X: 88,

  F11: 122,
  F12: 123,
};

$(document)
    .keydown(function (event) {
      if (SELECTED_TOOL !== TEXT && $('#resizer').is('hidden')) {
        event.preventDefault();
      }

      switch (event.keyCode) {
        case KEY_CODES.Enter :
          keys.Enter = true;
          break;
        case KEY_CODES.Esc :
          keys.Esc = true;
          break;
        case KEY_CODES.Delete :
          keys.delete = true;
          break;
        case KEY_CODES.C :
          keys.C = true;
          break;
        case KEY_CODES.I :
          keys.I = true;
          break;
        case KEY_CODES.O :
          keys.O = true;
          break;
        case KEY_CODES.S :
          keys.S = true;
          break;
        case KEY_CODES.V :
          keys.V = true;
          break;
        case KEY_CODES.X :
          keys.X = true;
          break;
        case KEY_CODES.F11 :
          keys.f11 = true;
          break;
        case KEY_CODES.F12 :
          keys.f12 = true;
          break;
      }
      if (keys.delete) {
        if (SELECTED_TOOL === SELECT) {
          select.delSelectedPart();
        }
        if (event.ctrlKey) {
          clearDraft();
        }
      }

      if (keys.f12 || keys.f11 || event.ctrlKey || keys.delete) {
        event.preventDefault();
      }

      if (keys.C) {
        if (SELECTED_TOOL === SELECT && event.ctrlKey) {
          select.copySelectedPart();
        }
      }

      if (keys.I) {
        if (event.ctrlKey) {
          $('#info').toggle();
        }
      }

      if (keys.X) {
        if (SELECTED_TOOL === SELECT && event.ctrlKey) {
          select.cutSelectedPart();
        }
      }

      if (keys.V) {
        if (SELECTED_TOOL === SELECT && event.ctrlKey) {
          select.pasteSelectedPart();
        }
      }
      if (keys.O) {
        if (event.ctrlKey) {
          $('#fileUploader').click();
        }
      }
      if (keys.S) {
        if (event.ctrlKey) {
          downloadImage();
        }
      }

    })
    .keyup(function (event) {
      switch (event.keyCode) {
        case KEY_CODES.Enter :
          keys.Enter = false;
          break;
        case KEY_CODES.Esc :
          keys.Esc = false;
          break;
        case KEY_CODES.Delete :
          keys.delete = false;
          break;
        case KEY_CODES.C :
          keys.C = false;
          break;
        case KEY_CODES.I :
          keys.I = false;
          break;
        case KEY_CODES.O :
          keys.O = false;
          break;
        case KEY_CODES.S :
          keys.S = false;
          break;
        case KEY_CODES.V :
          keys.V = false;
          break;
        case KEY_CODES.X :
          keys.X = false;
          break;
        case KEY_CODES.F11 :
          keys.f11 = false;
          break;
        case KEY_CODES.F12 :
          keys.f12 = false;
          break;
      }
    });

$(window).bind('mousewheel DOMMouseScroll', function (event) {
  if (event.ctrlKey === true) {
    event.preventDefault();

    if (event.originalEvent.wheelDelta / 120 > 0) {
      if (DRAW_SETTINGS.size < 250) {
        DRAW_SETTINGS.size += 2;
      } else {
        DRAW_SETTINGS.size = 250;
      }
    } else {
      if (DRAW_SETTINGS.size > 1) {
        DRAW_SETTINGS.size -= 2;
      } else {
        DRAW_SETTINGS.size = 1;
      }
    }
    $('#eraseRect').css({
      'width': DRAW_SETTINGS.size,
      'height': DRAW_SETTINGS.size,
      'top': event.pageY - (DRAW_SETTINGS.size / 2) + 'px',
      'left': event.pageX - (DRAW_SETTINGS.size / 2) + 'px'
    });
    $('input#pointSize').val(DRAW_SETTINGS.size);
    $('#pointSizeValue').text('size:' + DRAW_SETTINGS.size + 'px');
  }

  if (event.altKey === true) {
    // event.preventDefault();
  }
});