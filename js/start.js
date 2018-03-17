const DEBUG = 0;

const PENCIL = 'pencil';
const SELECT = 'select';
const ERASER = 'eraser';
const WEB = 'web';
const TEXT = 'text';
const RECTANGLE = 'rectangle';
const CIRCLE = 'circle';
const COLORSAMPLER = 'colorsampler';

let items = [
    {
        text: 'Clear',
        shortcut: 'ctrl+del',
        icon: 'fas fa-ban',
        onclick: function () {
            webDraft.clear();
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
var webDraft = new WebDraft();


var canvas,
        ctx,
        randomId,
        points = {};


$(window)
        .resize(function () {
            webDraft.resize();
            webDraft.positionElements();
        });
$(document)
        .ready(function (event) {
            if (/mobile/i.test(navigator.userAgent)) {
                webDraft.draw.width = window.innerWidth - 10;
                webDraft.draw.height = window.innerHeight - 30;
            }

            webDraft.init();
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
        .on('mouseup touchend', function (e) {
            webDraft._mouseup(e);
        })
        .on('mousemove touchmove', function (e) {
            webDraft._mousemove(e);
        });

function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    var a = opacity / 100;
    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';

    return result;
}