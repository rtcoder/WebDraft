class Contextmenu {
    constructor(items) {
        this.items = items;
        let $this = this;
        $('body').append('<menu id="contextmenu"></menu>');
        $('#contextmenu').html('<ul></ul>');
        for (let i in items) {
            let shortcut = '<span class="shortcut">' + this.items[i].shortcut + '</span>';
            let text = '<span class="text">' + this.items[i].text + '</span>';
            let icon = '<span class="icon"><i class="' + this.items[i].icon + '"></i></span>';
            let li = '<li>' + icon + text + shortcut + '</li>';
            $('#contextmenu ul').append(li);
            $('#contextmenu ul li').last().click(function (e) {
                $this.items[i].onclick();
                $this.hide(e);
            });
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

        if (t + $('#contextmenu').height() > $(window).height()) {
            t = $(window).height() - $('#contextmenu').height();
        }
        if (l + $('#contextmenu').width() > $(window).width()) {
            l = $(window).width() - $('#contextmenu').width();
        }
        $('#contextmenu').css({
            top: t + "px",
            left: l + "px"
        }).show();
    }
    hide(e) {
        $('#contextmenu').hide();
    }
}