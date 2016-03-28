var file = {

    upload : function (event) {
        var input = event.target;
        var widthImg;
        var heightImg;
        var output = new Image();

        output.src = URL.createObjectURL(input.files[0]);

        output.onload = function() {
            widthImg  = this.width;
            heightImg = this.height;

            layers.newLayer();
            layers.setLayerSize(layers.activeId, widthImg, heightImg);
            webDraft.func.positionElements();

            ctx.drawImage(output, 0, 0);

            layers.saveState();
        }
    },
    download : function(){
        $(webDraft.draw.selectorId).append('<canvas id="tmpCanvas" width="' + webDraft.draw.width + '" height="' + webDraft.draw.height + '"></canvas>');

        var temp_c   = document.getElementById("tmpCanvas");
        var temp_ctx = temp_c.getContext("2d");

        for (var i = 0; i <= layers.list.id.length; i++) {
            if (typeof layers.list.id[i] === "string" && layers.list.visible[i] === true) {
                var imgData = document.getElementById(layers.list.id[i]);
                var top  = parseInt($("#"+layers.list.id[i]).css("top"));
                var left = parseInt($("#"+layers.list.id[i]).css("left"));
                temp_ctx.drawImage(imgData, top, left);
                console.log(top+"::"+left)
            }
        }

        $("#tmpCanvas").width(webDraft.draw.width).height(webDraft.draw.height)
        temp_c.toBlob(function(blob) {
          saveAs(blob, "plik.png");
        });

        $("#tmpCanvas").remove();



    }
}
