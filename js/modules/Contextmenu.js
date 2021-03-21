class Contextmenu {
  constructor() {
    let $this = this;

    $('body').contextmenu(function (e) {
      e.preventDefault();
      $this.show(e);
    }).click(function (e) {
      if (!$('#contextmenu').is(':hover')) {
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
      top: t + 'px',
      left: l + 'px'
    }).show();
  }

  hide(e) {
    $('#contextmenu').hide();
  }
}

const context_menu = new Contextmenu();