var camera = {
    init: function () {
        var video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            });
        }
    },
    snap: function () {

    },
    saveOnComputer: function () {

    },
    cancelSnap: function () {

    },
    applySnap: function () {

    }
};