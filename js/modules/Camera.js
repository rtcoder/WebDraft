class Camera {
  constructor() {
    this.cameraStream = null;
    this.filters = {
      'sepia': false,
      'noise': false,
      'greyscale': false,
      'negative': false
    };
    let $this = this;
    this.filterInterval = null;

    $('#snap').click($this.snap);
    $('#saveSnapOnComputer').click($this.saveOnComputer);
    $('#applySnap').click($this.applySnap);
    $('#cancelSnap').click($this.cancelSnap);
    $('#switchFullscreen').click(() => {
      $('#camera').toggleClass('fullscreen');
    });
    $('#closeCamera').click(() => {
      $this.stop();
    });
    $('.filter-checkbox').change(() => {
      let filterName = $(this).parent().find('.filter').data('id');
      $this.filters[filterName] = $(this).is(':checked');
    });
  }

  init() {
    let $this = this;
    $('#camera').addClass('opened');
    let video = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.src = window.URL.createObjectURL(stream);
        video.play();
        $this.cameraStream = stream;
        $('#camera #cameraTitle').text($this.cameraStream.getTracks()[0].label);
        $this.setFilter();
      });
    }
  }

  stop() {
    let $this = this;
    let track = $this.cameraStream.getTracks()[0];
    track.stop();
    $this.cameraStream = null;
    $('#camera').removeClass('opened');
  }

  snap() {
    const snapImage = document.getElementById('snapImage');
    const snapImageContext = snapImage.getContext('2d');
    const video = document.getElementById('video');
    const additionalLayer = document.getElementById('additional');
    const additionalLayerContext = additionalLayer.getContext('2d');
    const videoImageData = additionalLayerContext.getImageData(0, 0, additionalLayer.width, additionalLayer.height);
    snapImageContext.putImageData(videoImageData, 0, 0);
    addClass('#camera', 'snapped');
  }

  saveOnComputer() {
    downloadFromCamera('snapImage');
  }

  cancelSnap() {
    const snapImage = document.getElementById('snapImage');
    const snapImageContext = snapImage.getContext('2d');
    snapImageContext.clearRect(0, 0, snapImage.width, snapImage.height);
    $('#camera').removeClass('snapped');
    if (this.filterInterval) {
      clearInterval(this.filterInterval);
    }
  }

  applySnap() {
    const snapImage = document.getElementById('snapImage');
    newLayer();
    setLayerSize(activeLayerId, snapImage.width, snapImage.height);
    positionElements();
    ctx.drawImage(snapImage, 0, 0);
    saveLayersState();
    $('#camera').removeClass('snapped');
  }

  setFilter() {
    const additionalLayer = document.getElementById('additional');
    const additionalLayerContext = additionalLayer.getContext('2d');
    const frame = document.getElementById('frame');
    const frameContext = frame.getContext('2d');
    const video = document.getElementById('video');
    let videoImageData = additionalLayerContext.getImageData(0, 0, additionalLayer.width, additionalLayer.height);
    if (this.filterInterval) {
      clearInterval(this.filterInterval);
    }
    let $this = this;
    setInterval(function (e) {
      frameContext.drawImage(video, 0, 0, video.width, video.height);
      videoImageData = frameContext.getImageData(0, 0, video.width, video.height);

      for (let i in $this.filters) {
        if ($this.filters[i]) {
          videoImageData = $this[i + 'Filter'](videoImageData);
        }
      }

      additionalLayerContext.putImageData(videoImageData, 0, 0);
    }, 1);
  }

  negativeFilter(imageData) {
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];   // red
      pixels[i + 1] = 255 - pixels[i + 1]; // green
      pixels[i + 2] = 255 - pixels[i + 2]; // blue
    }

    return imageData;
  }

  greyscaleFilter(imageData) {
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      let avg = 0.3 * r + 0.59 * g + 0.11 * b;

      pixels[i] = avg;   // red
      pixels[i + 1] = avg; // green
      pixels[i + 2] = avg; // blue
    }

    return imageData;
  }

  noiseFilter(imageData) {
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      let rand = (0.5 - Math.random()) * 100;
      pixels[i] += rand;   // red
      pixels[i + 1] += rand; // green
      pixels[i + 2] += rand; // blue
    }

    return imageData;
  }

  sepiaFilter(imageData) {
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      let avg = 0.3 * r + 0.59 * g + 0.11 * b;

      pixels[i] = avg + 100;   // red
      pixels[i + 1] = avg + 50; // green
      pixels[i + 2] = avg; // blue
    }

    return imageData;
  }
}
const camera = new Camera();