class File {
    constructor() {
        $('body').append('<input type="file" name="file" id="fileUploaderInput" accept="image/*" onchange="file.upload(event)">');
    }

    upload(event) {
        let input = event.target;
        let widthImg;
        let heightImg;
        let output = new Image();

        output.src = URL.createObjectURL(input.files[0]);

        output.onload = function () {
            widthImg = this.width;
            heightImg = this.height;

            layers.newLayer();
            layers.setLayerSize(layers.activeId, widthImg, heightImg);
            webDraft.positionElements();

            ctx.drawImage(output, 0, 0);

            layers.saveState();
            keys.O = false;
        };
    }
    download() {
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '"></canvas>');

        let temp_c = document.getElementById("tmpCanvas");
        let temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(webDraft.draw.width).height(webDraft.draw.height);

        for (let i = 0; i < layers.list.length; i++) {
            if (typeof layers.list[i].id === "string" && layers.list[i].visible === true) {
                let imgData = document.getElementById(layers.list[i].id);
                let top = parseInt($("#" + layers.list[i].id).css("top"));
                let left = parseInt($("#" + layers.list[i].id).css("left"));
                temp_ctx.drawImage(imgData, top, left);
            }
        }

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-image.png");
        });

        $("#tmpCanvas").remove();
    }
    downloadFromCamera(id = null) {
        let imgData = document.getElementById(id);
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + imgData.width + '" height="' + imgData.height + '"></canvas>');

        let temp_c = document.getElementById("tmpCanvas");
        let temp_ctx = temp_c.getContext("2d");
        $("#tmpCanvas").width(imgData.width).height(imgData.height);

        temp_ctx.drawImage(imgData, 0, 0);

        temp_c.toBlob(function (blob) {
            saveAs(blob, "WebDraft-camera-photo.png");
        });

        $("#tmpCanvas").remove();

    }
}