var context_menu = {
    show: function (e) {
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
    },
    hide: function (e) {
        $('#contextmenu').hide();
    }
};