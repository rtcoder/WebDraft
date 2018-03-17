class Camera {
    constructor() {
        this.cameraStream = null;
        let $this = this;
        $.get('parts/camera.part.html', function (data) {
            $('body').append('<div id="camera"></div>');

            $('#camera').html(data);

            $('#snap').click($this.snap);
            $('#saveSnapOnComputer').click($this.saveOnComputer);
            $('#applySnap').click($this.applySnap);
            $('#cancelSnap').click($this.cancelSnap);
            $('#closeCamera').click(function () {
                $this.stop();
            });
        });
    }
    init() {
        let $this = this;
        $('#camera').addClass('opened');
        let video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
                $this.cameraStream = stream;
                $('#camera #cameraTitle').text($this.cameraStream.getTracks()[0].label);
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
        let snapImage = document.getElementById('snapImage');
        let snapImageContext = snapImage.getContext('2d');
        let video = document.getElementById('video');
        snapImageContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        $('#camera').addClass('snapped');
    }
    saveOnComputer() {
        file.downloadFromCamera('snapImage');
    }
    cancelSnap() {
        let snapImage = document.getElementById('snapImage');
        let snapImageContext = snapImage.getContext('2d');
        snapImageContext.clearRect(0, 0, snapImage.width, snapImage.height);
        $('#camera').removeClass('snapped');
    }
    applySnap() {
        let snapImage = document.getElementById('snapImage');
        layers.newLayer();
        layers.setLayerSize(layers.activeId, snapImage.width, snapImage.height);
        webDraft.positionElements();
        ctx.drawImage(snapImage, 0, 0);
        layers.saveState();
        $('#camera').removeClass('snapped');
    }
}