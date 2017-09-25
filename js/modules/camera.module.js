var camera = {
    cameraStream: null,
    init: function () {
        $('#camera').addClass('opened');
        var video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
                camera.cameraStream = stream;
                $('#camera #cameraTitle').text(camera.cameraStream.getTracks()[0].label)
            });
        }
    },
    stop: function () {
        var track = camera.cameraStream.getTracks()[0];
        track.stop();
        camera.cameraStream = null;
        $('#camera').removeClass('opened');
    },
    snap: function () {
        var snapImage = document.getElementById('snapImage');
        var snapImageContext = snapImage.getContext('2d');
        var video = document.getElementById('video');
        snapImageContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        $('#camera').addClass('snapped');
    },
    saveOnComputer: function () {
        file.downloadFromCamera('snapImage');
    },
    cancelSnap: function () {
        var snapImage = document.getElementById('snapImage');
        var snapImageContext = snapImage.getContext('2d');
        snapImageContext.clearRect(0, 0, snapImage.width, snapImage.height);
        $('#camera').removeClass('snapped');
    },
    applySnap: function () {
        var snapImage = document.getElementById('snapImage');

        layers.newLayer();
        layers.setLayerSize(layers.activeId, snapImage.width, snapImage.height);
        webDraft.func.positionElements();

        ctx.drawImage(snapImage, 0, 0);

        layers.saveState();

        $('#camera').removeClass('snapped');
    }
};