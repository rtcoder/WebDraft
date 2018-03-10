let items = [
    {
        text: 'Clear',
        shortcut: 'ctrl+del',
        icon: 'fa fa-ban',
        onclick: function () {
            webDraft.func.clear();
        }
    },
    {
        text: 'Upload image',
        shortcut: 'ctrl+o',
        icon: 'fa fa-upload',
        onclick: function () {
            $('#fileUploader').click();
        }
    },
    {
        text: 'Save image',
        shortcut: 'ctrl+s',
        icon: 'fa fa-save',
        onclick: function () {
            file.download();
        }
    }
];

$(window)
        .resize(function () {
            webDraft.func.resize();
            webDraft.func.positionElements();
        });
$(document)
        .ready(function (event) {
            if (/mobile/i.test(navigator.userAgent)) {
                webDraft.draw.width = window.innerWidth - 10;
                webDraft.draw.height = window.innerHeight - 30;
            }

            webDraft.func.init();
            var context_menu = new Contextmenu(items);
            var camera = new Camera();
            $("#selectRectangle, #textRectangle")
                    .draggable({snap: false})
                    .css({"position": "absolute"});

            $("#shadowDot").draggable({
                containment: "#shadowSquare",
                scroll: false,
                drag: function () {
                    var shadowY = parseInt($(this).css('top')) - (parseInt($(this).parent().height()) / 2);
                    var shadowX = parseInt($(this).css('left')) - (parseInt($(this).parent().width()) / 2);
                    webDraft.shadow.offsetX = shadowX;
                    webDraft.shadow.offsetY = shadowY;
                }
            });
            $('#shadowSquare').on('mousedown', function (e) {
                var x = e.pageX - $(this).offset().left;
                var y = e.pageY - $(this).offset().top;

                $("#shadowDot").css({
                    top: (y - 5) + 'px',
                    left: (x - 5) + 'px'
                });

                var shadowY = parseInt($("#shadowDot").css('top')) - (parseInt($("#shadowDot").parent().height()) / 2);
                var shadowX = parseInt($("#shadowDot").css('left')) - (parseInt($("#shadowDot").parent().width()) / 2);
                webDraft.shadow.offsetX = shadowX;
                webDraft.shadow.offsetY = shadowY;
            });


        })
        .bind("contextmenu", function (e) {
            if (!DEBUG) {
                e.preventDefault();
            }
        })
        .on('mouseup touchend', webDraft.func._mouseup)
        .on('mousemove touchmove', webDraft.func._mousemove);
