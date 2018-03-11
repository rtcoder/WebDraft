class Contextmenu {
    constructor(items) {
        this.items = items;
        let $this = this;
        $('body').append('<menu id="contextmenu"></menu>');
        $('#contextmenu').html('<ul></ul>');
        for (let i in items) {
            let li = this.buildItem(this.items[i]);

            $('#contextmenu ul').append(li);

            if (this.items[i].onclick) {
                $('#contextmenu ul li').last().click(function (e) {
                    $this.items[i].onclick();
                    $this.hide(e);
                });
            }

            if (this.items[i].submenu && this.items[i].submenu.length > 0) {
                $('#contextmenu ul li').last().prepend('<ul class="submenu"></ul>');
                for (let j in this.items[i].submenu) {

                    let li = this.buildItem(this.items[i].submenu[j]);

                    $('#contextmenu ul li ul.submenu').append(li);

                    if (this.items[i].submenu[j].onclick) {
                        $('#contextmenu ul li').last().click(function (e) {
                            $this.items[i].submenu[j].onclick();
                            $this.hide(e);
                        });
                    }
                }
            }
        }

        $('body').contextmenu(function (e) {
            e.preventDefault();
            $this.show(e);
        }).click(function (e) {
            if (!$('#contextmenu').is(":hover")) {
                $this.hide(e);
            }
        });
    }
    show(e) {
        let t = e.pageY;
        let l = e.pageX;
        $('#contextmenu').removeClass('left-submenu');
        if (t + $('#contextmenu').height() > $(window).height()) {
            t = $(window).height() - $('#contextmenu').height();
        }
        if (l + $('#contextmenu').width() > $(window).width()) {
            l = $(window).width() - $('#contextmenu').width();
        }
        if (l + ($('#contextmenu').width() * 2) > $(window).width()) {
            $('#contextmenu').addClass('left-submenu');
        }
        $('#contextmenu').css({
            top: t + "px",
            left: l + "px"
        }).show();
    }
    hide(e) {
        $('#contextmenu').hide();
    }
    buildItem(item) {
        let arrowLeft = '<span class="arrow left-arrow"><i class="fa fa-chevron-left"></i></span>';
        let arrowRight = '<span class="arrow right-arrow"><i class="fa fa-chevron-right"></i></span>';
        let shortcut = '<span class="shortcut">';
        let text = '<span class="text">';
        let icon = '<span class="icon"><i';

        if (typeof item.shortcut !== 'undefined' && item.shortcut !== '') {
            shortcut += item.shortcut;
        }
        if (typeof item.text !== 'undefined' && item.text !== '') {
            text += item.text;
        }
        if (typeof item.icon !== 'undefined' && item.icon !== '') {
            icon += ' class="' + item.icon + '"';
        }

        shortcut += '</span>';
        text += '</span>';
        icon += '></i></span>';
        return '<li><span class="content">' + arrowLeft + icon + text + shortcut + arrowRight + '</span></li>';
    }
}