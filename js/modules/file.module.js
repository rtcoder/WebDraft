var file = {
    upload: function (event) {
        var input = event.target;
        var widthImg;
        var heightImg;
        var output = new Image();

        output.src = URL.createObjectURL(input.files[0]);

        output.onload = function () {
            widthImg = this.width;
            heightImg = this.height;

            layers.newLayer();
            layers.setLayerSize(layers.activeId, widthImg, heightImg);
            webDraft.func.positionElements();

            ctx.drawImage(output, 0, 0);

            layers.saveState();
            keys.O = false;
        };
    },
    download: function () {
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '"></canvas>');

        var temp_c = document.getElementById("tmpCanvas");
        var temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(webDraft.draw.width).height(webDraft.draw.height);

        for (var i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string" && layers.list[i].visible === true) {
                var imgData = document.getElementById(layers.list[i].id);
                var top = parseInt($("#" + layers.list[i].id).css("top"));
                var left = parseInt($("#" + layers.list[i].id).css("left"));
                temp_ctx.drawImage(imgData, top, left);
            }
        }

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-image.png");
        });

        $("#tmpCanvas").remove();
    },
    downloadFromCamera: function (id = null) {
        var imgData = document.getElementById(id);
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + imgData.width + '" height="' + imgData.height + '"></canvas>');

        var temp_c = document.getElementById("tmpCanvas");
        var temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(imgData.width).height(imgData.height);

        temp_ctx.drawImage(imgData, 0, 0);

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-camera-photo.png");
        });

        $("#tmpCanvas").remove();

    }
};