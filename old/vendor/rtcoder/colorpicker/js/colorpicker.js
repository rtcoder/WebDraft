class InvalidTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidTypeError';
    }
}

class InvalidValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidValueError';
    }
}

var guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
};

class Convert {
    /**
     *
     * @param integer unit
     * @return {Convert.unitConversion.hexconv|String}
     */
    unitConversion(unit) {
        let hexconv = unit.toString(16);
        return hexconv.length === 1 ? '0' + hexconv : hexconv;
    }
    /**
     *
     * @param integer h
     * @param integer u
     * @param integer e
     * @return integer
     */
    hue2rgb(h, u, e) {
        if (e < 0)
            e += 1;
        if (e > 1)
            e -= 1;
        if (e < 1 / 6)
            return h + (u - h) * 6 * e;
        if (e < 1 / 2)
            return u;
        if (e < 2 / 3)
            return h + (u - h) * (2 / 3 - t) * 6;
        return h;
    }
    /**
     *
     * @param integer r
     * @param integer g
     * @param integer b
     * @return string
     */
    RGBtoHex(r, g, b) {
        let hexString = "#" + this.unitConversion(r) + this.unitConversion(g) + this.unitConversion(b);
        return hexString;
    }
    /**
     *
     * @param integer r
     * @param integer g
     * @param integer b
     * @return array
     */
    rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    }
}

(function ($) {
    "use strict";
    /**
     * @param object options Options
     * @param string colorpickerHTML_URL Alternative link for colorpicker html if is used as plugin
     */
    $.fn.colorpicker = function (options, colorpickerHTML_URL) {
        var $this = this;
        this.converter = new Convert();
        this.colorpickerContainer = null;
        this.canvasSelectHSV = null;
        this.canvasHSV = null;
        this.canvasCircle = null;
        this.ctxHSV = null;
        this.ctxSelectHSV = null;
        this.ctxCircle = null;
        this.selectMusedown = false;
        this.selectedColor = {
            rgba: null,
            hsl: null,
            hex: null
        };
        this.colorpickerHTML = null;
        this.selectHistory = [];
        this.colorpickerHTML_URL = colorpickerHTML_URL ? colorpickerHTML_URL : 'html/colorpicker.html';
        this.defaultOptions = {
            colorValues: true,
            closeOn: 'change',
            onChange: function (color) {},
            onShow: function () {},
            onHide: function () {},
            onSelect: function (color) {}
        };

        $.get(this.colorpickerHTML_URL, function (data) {
            $this.colorpickerHTML = $(data);
        });

        this.updateSelectHistory = function (color) {
            if (!color || !color.hex) {
                return;
            }
            for (let c of  this.selectHistory) {
                if (color.hex === c.hex) {
                    return;
                }
            }
            this.selectHistory.push(color);
            if (this.selectHistory.length > 10) {
                this.selectHistory.shift();
            }
            localStorage.selectHistory = JSON.stringify(this.selectHistory);
            $this.generateColorBoxes();
        };
        this.clearSelectHistory = function () {
            $this.selectHistory = [];
            localStorage.selectHistory = JSON.stringify($this.selectHistory);
            $this.generateColorBoxes();
        };
        this.generateColorBoxes = function () {
            let selectHistoryContainer = $this.colorpickerContainer.find('.selectHistory .content');
            selectHistoryContainer.empty();
            if (this.selectHistory.length === 0) {
                selectHistoryContainer.addClass('empty');
                return;
            }
            selectHistoryContainer.removeClass('empty');
            for (let i in this.selectHistory) {
                let color = this.selectHistory[i];
                selectHistoryContainer.append('<div class="item" data-key="' + i + '" style="background: ' + color.hex + '"></div>');
            }
            selectHistoryContainer.find('.item').click(function () {
                let i = $(this).data('key');
                $this.setColor($this.selectHistory[i]);
            });
        };
        this.hide = function () {
            $this.colorpickerContainer.remove();
            this.defaultOptions.onHide();
        };
        this.show = function () {
            this.init(function () {
                $this.colorpickerContainer.show();
                $this.defaultOptions.onShow();
            });
        };
        this.setColor = function (color) {
            $this.selectedColor = color;
            $this.colorpickerContainer.find('.colorSelected').css('background', $this.selectedColor.hex);
            $this.colorpickerContainer.find('.hex input').val($this.selectedColor.hex);
            $this.colorpickerContainer.find('.hsl input').val('hsl(' + $this.selectedColor.hsl.join(', ') + ')');
            $this.colorpickerContainer.find('.rgba input').val('rgba(' + $this.selectedColor.rgba.join(', ') + ')');
        };
        this.colorselect = function (event, obj) {
            let rect = obj.getBoundingClientRect();
            let c = obj.getContext('2d');
            let x = event.pageX - rect.left;
            let y = event.pageY - rect.top;
            let p = c.getImageData(x, y, 1, 1).data;
            let r = p[0];
            let g = p[1];
            let b = p[2];
            let alpha = p[3];
            let a = Math.floor((100 * alpha) / 255) / 100;
            return {
                rgba: [r, g, b, a],
                hsl: $this.converter.rgbToHsl(r, g, b),
                hex: $this.converter.RGBtoHex(r, g, b)
            };
        };
        this.generateHSV = function (hue) {
            for (let row = 0; row < $this.canvasHSV.height; row++) {
                let percent = (row * 100) / $this.canvasHSV.height;
                let grad = $this.ctxHSV.createLinearGradient(0, 0, $this.canvasHSV.width, 0);
                grad.addColorStop(0, 'hsl(' + hue + ', 0%, ' + (100 - percent) + '%)');
                grad.addColorStop(1, 'hsl(' + hue + ', 100%, ' + (100 - percent) + '%)');
                $this.ctxHSV.fillStyle = grad;
                $this.ctxHSV.fillRect(0, row, $this.canvasHSV.width, 1);
            }
        };
        this.generateRangeHSV = function () {
            let gradient = $this.ctxSelectHSV.createLinearGradient(0, 0, 0, $this.canvasSelectHSV.height);

            gradient.addColorStop(0, "rgb(255, 0, 0)");
            gradient.addColorStop(0.15, "rgb(255, 0, 255)");
            gradient.addColorStop(0.33, "rgb(0, 0, 255)");
            gradient.addColorStop(0.49, "rgb(0, 255, 255)");
            gradient.addColorStop(0.67, "rgb(0, 255, 0)");
            gradient.addColorStop(0.84, "rgb(255, 255, 0)");
            gradient.addColorStop(1, "rgb(255, 0, 0)");

            $this.ctxSelectHSV.fillStyle = gradient;

            $this.ctxSelectHSV.fillRect(0, 0, $this.canvasSelectHSV.width, $this.canvasSelectHSV.height);
        };
        this.generateCircleColorpicker = function () {
            this.CX = $this.canvasCircle.width / 2;
            this.CY = $this.canvasCircle.height / 2;

            for (let i = 0; i < 360; i += 0.1) {
                let rad = i * (2 * Math.PI) / 360;
                $this.ctxCircle.strokeStyle = "hsla(" + i + ", 100%, 50%, 1.0)";
                $this.ctxCircle.beginPath();
                $this.ctxCircle.moveTo(this.CX, this.CY);
                $this.ctxCircle.lineTo(this.CX + this.CX * Math.cos(rad), this.CY + this.CY * Math.sin(rad));
                $this.ctxCircle.stroke();
            }
        };
        this.render = function () {
            let gid = guid();
            if ($('.colorpickerContainer').length) {
                $('.colorpickerContainer').remove();
            }
            $('body').append($this.colorpickerHTML);
            $('.colorpickerContainer').attr('data-id', gid);
            $this.colorpickerContainer = $('.colorpickerContainer[data-id=' + gid + ']');
            $this.colorpickerContainer.find('.pickerContainer').first().addClass('active');

            $this.generateColorBoxes();
            if (this.defaultOptions.colorValues === true) {
                $this.colorpickerContainer.attr('colorvalues', 'true');
            }
        };
        this.events = function () {
            $this.colorpickerContainer.find('.tabs ul li').click(function () {
                let id = $(this).data('id');
                $(this).parent().find('li').removeClass('active');
                $(this).addClass('active');
                $('.pickerContainer').removeClass('active');
                $('.pickerContainer[data-id=' + id + ']').addClass('active');
            });

            $this.colorpickerContainer.find('.tabs ul li').first().click();

            $this.colorpickerContainer.find('.close').click(function (e) {
                $this.hide();
            });
            $this.colorpickerContainer.find('.apply').click(function (e) {
                $this.hide();
                $this.updateSelectHistory($this.selectedColor);
                $this.defaultOptions.onSelect($this.selectedColor);
            });
            $this.colorpickerContainer.find('.selectHistory .clearSelectHistory').click(function () {
                $this.clearSelectHistory();
            });
            $this.colorpickerContainer.find('button.copy').click(function () {
                if ($(this).parent().find('input').val() === "") {
                    return;
                }
                $(this).parent().find('input').select();
                document.execCommand("Copy");
            });
            $($this.canvasHSV).add($this.canvasCircle).on('mousemove', function (e) {
                $this.colorpickerContainer.find('.colorPreview').css('background', $this.colorselect(e, this).hex);
            }).on('click', function (e) {
                $this.setColor($this.colorselect(e, this));

                $this.updateSelectHistory($this.selectedColor);
                $this.defaultOptions.onChange($this.selectedColor);
            });
            $($this.canvasSelectHSV).on('mousedown', function (e) {
                $this.selectMusedown = true;
                let rgba = $this.colorselect(e, this);
                $this.generateHSV(rgba.hsl[0]);
            }).on('mouseup', function () {
                $this.selectMusedown = false;
            }).on('mousemove', function (e) {
                let color = $this.colorselect(e, this);
                if ($this.selectMusedown) {
                    $this.generateHSV(color.hsl[0]);
                }
                let rect = this.getBoundingClientRect();
                let y = event.pageY - rect.top - ($this.colorpickerContainer.find('.selectpreview').height() / 2);
                $this.colorpickerContainer.find('.selectpreview').css({
                    top: y + 'px',
                    background: color.hex
                });
            }).mouseleave(function (e) {
                $this.selectMusedown = false;
            });

        };
        this.init = function (callback) {
            this.selectHistory = localStorage.getItem('selectHistory') ? JSON.parse(localStorage.getItem('selectHistory')) : [];
            localStorage.selectHistory = JSON.stringify(this.selectHistory);

            this.render();
            $this.canvasHSV = $this.colorpickerContainer.find('.colorpicker')[0];
            $this.canvasSelectHSV = $this.colorpickerContainer.find('.colorselect')[0];
            $this.ctxHSV = $this.canvasHSV.getContext('2d');
            $this.ctxSelectHSV = $this.canvasSelectHSV.getContext('2d');

            $this.canvasCircle = $this.colorpickerContainer.find('.colorpickerCircle')[0];
            $this.ctxCircle = $this.canvasCircle.getContext('2d');

            this.events();

            this.generateHSV(88);
            this.generateRangeHSV();

            this.generateCircleColorpicker();
            callback();
        };

        if (typeof options !== 'object' && typeof options !== 'undefined') {
            throw new InvalidTypeError("param 'options' must be an Object not " + typeof options);
        }

        $.extend(this.defaultOptions, options);

        if (typeof this.defaultOptions.onChange !== 'function') {
            throw new InvalidTypeError("param 'options.onChange' must be a function not " + typeof this.defaultOptions.onChange);
        }
//        this.init();
        this.click(function () {
            $this.show();
        });
    };
})(jQuery);