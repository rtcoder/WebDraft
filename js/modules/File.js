function uploadImage(event) {
  const input = event.target;
  const output = new Image();

  output.src = URL.createObjectURL(input.files[0]);

  output.onload = function () {
    const widthImg = this.width;
    const heightImg = this.height;

    newLayer();
    setLayerSize(activeLayerId, widthImg, heightImg);
    positionElements();

    ctx.drawImage(output, 0, 0);

    saveLayersState();
    keys.O = false;
  };
}

function downloadImage() {
  $(webDraftDraw.selectorId).append('<canvas id="tmpCanvas" width="' + webDraftDraw.width + '" height="' + webDraftDraw.height + '"></canvas>');

  const temp_c = document.getElementById('tmpCanvas');
  const temp_ctx = temp_c.getContext('2d');
  $('#tmpCanvas').width(webDraftDraw.width).height(webDraftDraw.height);

  for (let i = 0; i < layersList.length; i++) {
    if (typeof layersList[i].id === 'string' && layersList[i].visible === true) {
      const imgData = document.getElementById(layersList[i].id);
      const top = parseInt($('#' + layersList[i].id).css('top'));
      const left = parseInt($('#' + layersList[i].id).css('left'));
      temp_ctx.drawImage(imgData, top, left);
    }
  }

  temp_c.toBlob(function (blob) {
    saveAs(blob, 'WebDraft-image.png');
  });

  $('#tmpCanvas').remove();
}


function downloadFromCamera(id = null) {
  const imgData = document.getElementById(id);
  if (!imgData) {
    throw new Error('Cannot find image to download id:' + id);
  }
  const { width, height } = imgData;
  q(webDraftDraw.selectorId).innerHtml += `<canvas id="tmpCanvas" width="${width}" height="${height}" ></canvas>`;

  const temp_c = document.getElementById('tmpCanvas');
  const temp_ctx = temp_c.getContext('2d');
  $('#tmpCanvas').width(width).height(height);

  temp_ctx.drawImage(imgData, 0, 0);

  temp_c.toBlob(function (blob) {
    saveAs(blob, 'WebDraft-camera-photo.png');
  });

  $('#tmpCanvas').remove();

}