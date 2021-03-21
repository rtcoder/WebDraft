class Layers {
  constructor() {
    newLayer();
  }
}

const layers = new Layers();

function selectLayer(id) {
  if (!hasClass(`.layerView[data-id="${id}"]`, 'hidden')) {
    canvas = document.getElementById(id);
    ctx = canvas.getContext('2d');

    activeLayerId = id;
  }
}

function mirrorLayer(direction) {
  if (direction === 'horizontal' || direction === 'vertical') {
    const image = new Image();
    image.src = canvas.toDataURL();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (direction === 'vertical') {
      ctx.scale(-1, 1);
    } else if (direction === 'horizontal') {
      ctx.scale(1, -1);
    }
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
    saveLayersState();
  }
}

function horizontalMirrorLayer() {
  mirrorLayer('horizontal');
}

function verticalMirrorLayer() {
  mirrorLayer('vertical');
}

function saveLayersState() {
  const imgSrc = document.getElementById(activeLayerId).toDataURL();
  $('.layerView[data-id=' + activeLayerId + ']').find('img').attr('src', imgSrc).show();
}

function setLayerPosition(layerId, top, left) {
  $('canvas#' + layerId).css({
    'top': top,
    'left': left
  });
}

function newLayer() {
  let j;
  if (isNaN(parseInt($('.layerView:last').attr('id')))) {
    j = 0;
  } else {
    j = parseInt($('.layerView:last').attr('id')) + 1;
  }

  let countViews = $('#listLayers').children('.layerView').length;

  if (countViews >= 15) {
    return;
  }
  const randomId = getRandomString();

  $(webDraftDraw.selectorId).append('<canvas class="canvas-draw" id="' + randomId + '" width="' + webDraftDraw.width + '" height="' + webDraftDraw.height + '" style="top:0;left:0"></canvas>');
  $('#listLayers').append(`
                <div data-id="${randomId}" id="${j}" class="layerView">
                    <div class="imgLayerContainer">
                        <img src="" class="imgLayer">
                    </div>
                    <div title="Hide layer" class="hideLayer fas fa-eye"></div>
                    <div style="display:none" title="Show layer" class="showLayer far fa-eye-slash"></div>
                </div>`
  );

  let new_layer = {
    visible: true,
    id: randomId,
    top: 0,
    left: 0
  };
  layersList.push(new_layer);

  $('.layerView').click(function () {
    if (!$(this).hasClass('hidden')) {
      $('.layerView').removeClass('active');
      $(this).addClass('active');

      let identifier = $(this).attr('data-id');

      selectLayer(identifier);
    }
  });
  $('.hideLayer').click(function () {
    let nr = $(this).parent('.layerView').attr('id');

    $(this).hide();
    $(this)
        .parent('.layerView')
        .find('.showLayer')
        .css({ 'display': 'block' });

    hideLayer(nr);
  });
  $('.showLayer').click(function () {
    let nr = $(this).parent('.layerView').attr('id');

    $(this).hide();
    $(this)
        .parent('.layerView')
        .find('.hideLayer')
        .css({ 'display': 'block' });

    showLayer(nr);
  });
  $('.layerView[data-id=' + randomId + ']').click();
  points[randomId] = [];
}

function deleteLayer() {
  let identifier = $('.layerView.active').attr('data-id');
  let nr = $('.layerView.active').attr('id');

  let countViews = $('.layerView').length;

  if (countViews > 1) {
    let i = parseInt(nr);
    $('.layerView#' + i).remove();
    $('canvas#' + identifier).remove();
    for (i in layersList) {
      if (!$('canvas#' + layersList[i].id).length) {
        layersList.splice(i, 1);
      }
    }

    let j = 0;
    [...qAll('.layerView')].forEach(node => {
      setNodeAttributes(node, {
        'id': j,
        'data-id': layersList[j].id
      });
      j++;
    });

    webDraftDraw.width = 0;
    webDraftDraw.height = 0;
    $('canvas.canvas-draw').each(function () {
      const w = parseInt($(this).attr('width'));
      const h = parseInt($(this).attr('height'));
      if (webDraftDraw.width < w) {
        webDraftDraw.width = w;
      }

      if (webDraftDraw.height < h) {
        webDraftDraw.height = h;
      }
    });
    $('.layerView').first().click();
    positionElements();
  }
}

function moveUpLayer() {
  const firstID = $('.layerView').first().attr('data-id');
  if (firstID !== activeLayerId) {
    let thisNr = $('.layerView[data-id=' + activeLayerId + ']').attr('id');
    let prevNr = parseInt(thisNr) - 1;
    let prevId = $('.layerView#' + prevNr).attr('data-id');
    let thisLayer = $('.layerView#' + thisNr);
    let prevLayer = $('.layerView#' + prevNr);

    thisLayer.insertBefore('.layerView#' + prevNr);
    thisLayer.removeAttr('id').attr('id', prevNr);
    prevLayer.removeAttr('id').attr('id', thisNr);

    $('canvas#' + activeLayerId).insertBefore('canvas#' + prevId);

    let j = 0;
    [...qAll('canvas.canvas-draw')].forEach((item) => {
      layersList[j].id = item.getAttribute('id');

      layersList[j].visible = !item.classList.contains('invisible');

      j++;
    });

    return true;
  }
  return false;
}

function moveDownLayer() {
  const lastID = $('.layerView').last().attr('data-id');
  if (lastID !== activeLayerId) {
    let thisNr = $('.layerView[data-id=' + activeLayerId + ']').attr('id');
    let nextNr = parseInt(thisNr) + 1;
    let nextId = $('.layerView#' + nextNr).attr('data-id');
    let thisLayer = $('.layerView#' + thisNr);
    let prevLayer = $('.layerView#' + nextNr);

    thisLayer.insertAfter('.layerView#' + nextNr);
    thisLayer.removeAttr('id').attr('id', nextNr);
    prevLayer.removeAttr('id').attr('id', thisNr);

    $('canvas#' + activeLayerId).insertAfter('canvas#' + nextId);
    let j = 0;
    [...qAll('canvas.canvas-draw')].forEach((item) => {
      layersList[j].id = item.getAttribute('id');

      layersList[j].visible = !item.classList.contains('invisible');

      j++;
    });

    return true;
  }
  return false;
}

function setLayerSize(layerId, width, height) {
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

  if (layerId === '') {
    webDraftDraw.width = width;
    webDraftDraw.height = height;
    $('canvas.canvas-draw').attr({
      width: webDraftDraw.width,
      height: webDraftDraw.height
    });
  } else {
    $('canvas#' + layerId).attr({
      width: width,
      height: height
    });
    webDraftDraw.width = 0;
    webDraftDraw.height = 0;
    $('canvas.canvas-draw').each(function () {
      let w = parseInt($(this).attr('width'));
      let h = parseInt($(this).attr('height'));
      if (webDraftDraw.width < w) {
        webDraftDraw.width = w;
      }

      if (webDraftDraw.height < h) {
        webDraftDraw.height = h;
      }
    });
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
}

function hideLayer(nr) {
  let i = parseInt(nr);

  $('.layerView#' + i).addClass('hidden');
  $('canvas#' + layersList[i].id).addClass('invisible');

  let j = 0;
  [...qAll('canvas.canvas-draw:not(#snapImage)')].forEach((item) => {
    layersList[j].id = item.getAttribute('id');

    layersList[j].visible = !item.classList.contains('invisible');

    j++;
  });

  j = 0;
  $('.layerView').each(function () {
    $(this).attr({
          'id': j,
          'data-id': layersList[j].id
        }
    );
    j++;
  });
  // $(".layerView#" + i).next().not(".hidden").click()
}

function showLayer(nr) {
  let i = parseInt(nr);

  $('.layerView#' + i).removeClass('hidden');
  $('canvas#' + layersList[i].id).removeClass('invisible');

  let j = 0;
  [...qAll('canvas.canvas-draw:not(#snapImage)')].forEach((item) => {
    layersList[j].id = item.getAttribute('id');

    layersList[j].visible = !item.classList.contains('invisible');

    j++;
  });
  j = 0;
  [...qAll('.layerView')].forEach(layerView => {
    setNodeAttributes(layerView, {
      id: j,
      'data-id': layersList[j].id
    });
    j++;
  });
}

function rotateLayer(angle) {
  const image = new Image();
  image.src = canvas.toDataURL();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.drawImage(image, -image.width / 2, -image.width / 2);
  ctx.restore();
  saveLayersState();
}

function negativeLayer() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255 - pixels[i];   // red
    pixels[i + 1] = 255 - pixels[i + 1]; // green
    pixels[i + 2] = 255 - pixels[i + 2]; // blue
    // i+3 is alpha (the fourth element)
  }

  // overwrite original image
  ctx.putImageData(imageData, 0, 0);//add the function call in the imageObj.onload
  saveLayersState();
}