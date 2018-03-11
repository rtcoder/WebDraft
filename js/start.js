let items = [
    {
        text: 'Clear',
        shortcut: 'ctrl+del',
        icon: 'fas fa-ban',
        onclick: function () {
            webDraft.func.clear();
        }
    },
    {
        text: 'Upload image',
        shortcut: 'ctrl+o',
        icon: 'fas fa-upload',
        onclick: function () {
            $('#fileUploader').click();
        }
    },
    {
        text: 'Save image',
        shortcut: 'ctrl+s',
        icon: 'fas fa-download',
        onclick: function () {
            file.download();
        }
    },
    {
        text: 'Color',
        icon: 'fas fa-tint',
        submenu: [
            {
                text: 'Invert',
                icon: 'fas fa-adjust',
                onclick: function () {
                    layers.negative();
                }
            },
            {
                text: 'Colorpicker',
                icon: 'fas fa-eye-dropper',
                onclick: function () {
                    $('#colorsampler').click();
                }
            }
        ]
    }
];

let context_menu = new Contextmenu(items);
let camera = new Camera();
let file = new File();
let shapes = new Shapes();
let draw = new Draw();
let text = new Text();
let resizer = new Resizer();
let layers = new Layers();
var select = new Select();
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
            $("#selectRectangle, #textRectangle")
                    .draggable({snap: false})
                    .css({"position": "absolute"});

            $("#shadowDot").draggable({
                containment: "#shadowSquare",
                scroll: false,
                drag: function () {
                    let shadowY = parseInt($(this).css('top')) - (parseInt($(this).parent().height()) / 2);
                    let shadowX = parseInt($(this).css('left')) - (parseInt($(this).parent().width()) / 2);
                    webDraft.shadow.offsetX = shadowX;
                    webDraft.shadow.offsetY = shadowY;
                }
            });
            $('#shadowSquare').on('mousedown', function (e) {
                let x = e.pageX - $(this).offset().left;
                let y = e.pageY - $(this).offset().top;

                $("#shadowDot").css({
                    top: (y - 5) + 'px',
                    left: (x - 5) + 'px'
                });

                let shadowY = parseInt($("#shadowDot").css('top')) - (parseInt($("#shadowDot").parent().height()) / 2);
                let shadowX = parseInt($("#shadowDot").css('left')) - (parseInt($("#shadowDot").parent().width()) / 2);
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
