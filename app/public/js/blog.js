$(function () {
    let container = $('#menuList');
    container.click((e) => {     // 点击树节点
        let ele = $(e.target);
        if (ele.hasClass('menu-item') || ele.hasClass('file-item')) {
            let active = container.find('.activeMenu');
            if (e.target !== active[0]) {
                active.removeClass('activeMenu');
                ele.addClass('activeMenu');
            }
            if (ele.hasClass('menu-item')) {
                ele.parent().toggleClass('menu-collapse');
            }
        } else {
            container.find('.activeMenu').removeClass('activeMenu');
        }
    },)
});