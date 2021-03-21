class Resizer {
  constructor() {
    $('#resizer input[type=number]').keyup((e) => {
      this.onkeyup(e);
    });
  }

  cancel() {
    $('#resizer').hide();
    $('input[type=number]#drawWidth').val(webDraftDraw.width);
    $('input[type=number]#drawHeight').val(webDraftDraw.height);
  }

  onkeyup(e) {
    this.onchange();

    if (e.keyCode === KEY_CODES.Enter) {
      $('#apply').click();
    }
  }

  onchange() {
    const xSize = parseInt($('input[type=number]#drawWidth').val());
    const ySize = parseInt($('input[type=number]#drawHeight').val());
    q('#resizeinfo').innerHtml = xSize + ' <i class=\'fas fa-times\'></i> ' + ySize;
  }
}

const resizer = new Resizer();

function showResizer() {
  $('#resizer').show();
  $('input[type=number]#drawWidth').val(webDraftDraw.width);
  $('input[type=number]#drawHeight').val(webDraftDraw.height);
  $('#resizeinfo').html(webDraftDraw.width + ' <i class=\'fas fa-times\'></i> ' + webDraftDraw.height);
}

function applyNewSizes() {
  $('#resizer').hide();

  const w = $('input[type=number]#drawWidth').val();
  const h = $('input[type=number]#drawHeight').val();
  const layerId = $('#allLayersResizing').is(':checked')
      ? ''
      : activeLayerId;

  setLayerSize(layerId, w, h);

  positionElements();
}