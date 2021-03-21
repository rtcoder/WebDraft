function loadEvents() {
  events.buttons();
  events.info();
  events.color();
  events.sliders();
  APP_LOADED = true;
}

function positionElements() {
  const image = {
    id: [],
    img: []
  };

  const active = activeLayerId;
  for (let i = 0; i < layersList.length; i++) {
    if (typeof layersList[i].id === 'string') {
      selectLayer(layersList[i].id);
      image.img[i] = ctx.getImageData(0, 0, webDraftDraw.width, webDraftDraw.height);
      image.id[i] = layersList[i].id;
    }
  }

  $(webDraftDraw.selectorId + ',' + webDraftDraw.eventHandler).css({
    'width': webDraftDraw.width,
    'height': webDraftDraw.height
  });
  $(webDraftDraw.thisParent).css({
    'background': webDraftDraw.bg,
    'width': webDraftDraw.width,
    'height': webDraftDraw.height
  });

  if (webDraftDraw.width >= $('#content').width()) {
    $(webDraftDraw.thisParent).css({ 'margin-left': '0px' });
  } else {
    $(webDraftDraw.thisParent).css({ 'margin-left': ($('#content').width() - webDraftDraw.width) / 2 });
  }

  if (webDraftDraw.height >= $('#content').height()) {
    $(webDraftDraw.thisParent).css({ 'margin-top': '0px' });
  } else {
    $(webDraftDraw.thisParent).css({ 'margin-top': ($('#content').height() - webDraftDraw.height) / 2 });
  }

  for (let i = 0; i < layersList.length; i++) {
    if (typeof layersList[i].id === 'string') {
      selectLayer(layersList[i].id);
      ctx.putImageData(image.img[i], 0, 0);
      saveLayersState();
    }
  }

  if (active !== '') {
    selectLayer(active);
  }

  $('title').text(APP_TITLE + ' [' + webDraftDraw.width + ' x ' + webDraftDraw.height + ']');
  $('html, body, #paint').css({ 'visibility': 'visible' });
}

function setMousePosition(event) {
  let pos_y;
  let pos_x;
  let touch = undefined;

  if (event.originalEvent.touches) {
    touch = event.originalEvent.touches[0];

    pos_x = event.pageX || touch.pageX;
    pos_y = event.pageY || touch.pageY;


  } else {
    pos_x = event.pageX;
    pos_y = event.pageY;
  }

  mousePosition.x = pos_x - parseInt($(webDraftDraw.selectorId).offset().left) - parseInt($(canvas).css('left'));
  mousePosition.y = pos_y - parseInt($(webDraftDraw.selectorId).offset().top) - parseInt($(canvas).css('top'));

  $('#mousePosition').text(mousePosition.x + ' , ' + mousePosition.y);
  if (mousePosition.x < 0 || mousePosition.x > $(webDraftDraw.selectorId).width()
      || mousePosition.y < 0 || mousePosition.y > $(webDraftDraw.selectorId).height()) {
    $('#mousePosition').empty();
  }
}

function clearDraft() {
  $(webDraftDraw.selectorId).empty();
  $('#listLayers').empty();

  points = {};

  initDraft();
}

function initDraft() {
  if (!APP_LOADED) {
    loadEvents();
  } else {
    newLayer();
  }
  //events on #draw
  $(webDraftDraw.eventHandler)
      .hover(() => {
        if (typeof ctx !== 'undefined') {
          ctx.beginPath();
          ctx.stroke();
        }
        if (SELECTED_TOOL === ERASER) {
          $('#eraseRect').show();
        }

      })
      .bind('contextmenu', event => {
        if (!DEBUG) {
          event.preventDefault();
        }
        mouseButtons.right = true;
        mouseButtons.left = false;
      })
      .on('mousedown', onMouseDown)
      .on('mouseup', onMouseUp)
      .on('mousemove', onMouseMove)
      .mouseleave(function () {
        ctx.stroke();
        saveLayersState();
        if (SELECTED_TOOL === ERASER) {
          $('#eraseRect').hide();
        }
      })
      .dblclick(function () {
        switch (SELECTED_TOOL) {
          case SELECT:
            $('#selectRectangle')
                .css({
                  'top': '0px',
                  'left': '0px'
                })
                .width(0)
                .height(0)
                .hide();
            break;
          case TEXT :
            text.putLayer();

            break;
        }
      });
}

function onMouseDown(event) {
  setMousePosition(event);
  if ('buttons' in event) {
    if (event.buttons === 1) {
      mouseButtons.left = true;
    }
  }
  const button = event.which || event.button;
  if (button === 1) {
    mouseButtons.left = true;
  }
  if (!mouseButtons.right && mouseButtons.left) {
    if (SELECTED_TOOL !== SELECT) {
      points[activeLayerId].push({ x: mousePosition.x, y: mousePosition.y });
    }

    switch (SELECTED_TOOL) {
      case PENCIL :
      case ERASER :
        draw.drawing();
        break;
      case SELECT :
        select.initSelect();
        break;
      case RECTANGLE :
      case CIRCLE :
        shapes.startShape();
        break;
      case TEXT :
        text.initSelect();
        break;
      case COLOR_SAMPLER :
        colorSamplerSetColor();
        $('#pencil').click();
        break;
    }
  }
}

function onMouseMove(event) {
  setMousePosition(event);

  switch (SELECTED_TOOL) {
    case ERASER:
      moveEraseRect(event);
      break;
    case COLOR_SAMPLER :
      colorSampler();
      break;
    case SELECT :
      if (
          !select.isSelecting && mousePosition.x <= parseInt($('#selectRectangle').css('left')) + $('#selectRectangle').width()
          && mousePosition.x >= parseInt($('#selectRectangle').css('left'))
          && mousePosition.y <= parseInt($('#selectRectangle').css('top')) + $('#selectRectangle').height()
          && mousePosition.y >= parseInt($('#selectRectangle').css('top'))
      ) {
        select.hoverSelectRectangle = true;
        $('#selectRectangle').css({ 'z-index': 5 });
      } else {
        select.hoverSelectRectangle = false;
        $('#selectRectangle').css({ 'z-index': 3 });
      }
      break;
    case TEXT :
      if (
          !text.isSelecting && mousePosition.x <= parseInt($('#textRectangle').css('left')) + $('#textRectangle').width()
          && mousePosition.x >= parseInt($('#textRectangle').css('left'))
          && mousePosition.y <= parseInt($('#textRectangle').css('top')) + $('#textRectangle').height()
          && mousePosition.y >= parseInt($('#textRectangle').css('top'))
      ) {
        text.hoverSelectRectangle = true;
        $('#textRectangle').css({ 'z-index': 5 });
      } else {
        text.hoverSelectRectangle = false;
        $('#textRectangle').css({ 'z-index': 3 });
      }
      break;
  }

  if (mouseButtons.left && !mouseButtons.right) {
    if (SELECTED_TOOL !== SELECT) {
      points[activeLayerId].push({ x: mousePosition.x, y: mousePosition.y });
    }

    switch (SELECTED_TOOL) {
      case PENCIL :
      case ERASER :
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.stroke();
        break;
      case WEB :
        draw.drawWeb();
        break;
      case SELECT :
        if (!select.hoverSelectRectangle) {
          select.startSelect();
        }
        break;
      case TEXT :
        if (!text.hoverSelectRectangle) {
          text.startSelect();
        }
        break;
      case RECTANGLE :
        shapes.prepareRect();
        break;
      case CIRCLE :
        shapes.prepareCircle();
        break;
    }
  }
}

function onMouseUp() {
  mouseButtons.left = false;
  mouseButtons.right = false;

  ctx.beginPath();
  ctx.stroke();

  switch (SELECTED_TOOL) {
    case SELECT:
      select.selectOpt();
      break;
    case TEXT :
      text.showTextOptions();
      break;
    case RECTANGLE :
      shapes.drawRect();
      break;
    case CIRCLE :
      shapes.drawCircle();
      break;
  }

  saveLayersState();
}

function colorSamplerSetColor() {
  if ($('#textColorSampler').text() !== 'null') {
    $('#generalColor .color').css({ 'background': $('#textColorSampler').text() });
    $('#firstColor').val($('#textColorSampler').text());
    DRAW_SETTINGS.color = $('#textColorSampler').text();
  }
}

function colorSampler() {
  const x = mousePosition.x;
  const y = mousePosition.y;
  const p = ctx.getImageData(x, y, 1, 1).data;
  const r = p[0];
  const g = p[1];
  const b = p[2];
  const alpha = p[3];
  const a = Math.floor((100 * alpha) / 255) / 100;
  let colorCode = getColoRFromRgba(r, g, b, a);

  $('#textColorSampler').text(colorCode);
  $('#colorBoxSampler').css({ 'background-color': colorCode });
}

function moveEraseRect(event) {
  $('#eraseRect').css({
    'width': DRAW_SETTINGS.size,
    'height': DRAW_SETTINGS.size,
    'top': event.pageY - (DRAW_SETTINGS.size / 2) + 'px',
    'left': event.pageX - (DRAW_SETTINGS.size / 2) + 'px'
  });
}