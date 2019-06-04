const Controller = require('egg').Controller;

class PageController extends Controller {
    async blog() {
        const {ctx} = this;
        let {list, note} = await ctx.service.page.blog();
        let tree = {};
        let html = renderTree(list, tree);
        let menu = await ctx.renderString(html);
        await ctx.render('blog', {menu, note});
    }

    async login() {
        const {ctx} = this;
        await ctx.render('login');
    }

    async manage() {
        const {ctx} = this;
        await ctx.render('manage');
    }
}

function listToTree(list, tree) {    // 数组转为树
    if (!Object.keys(tree).length) {   // 根节点
        tree.menuId = 0;
    }
    tree.children = list.filter(v => {
        if (v.parentId === tree.menuId) {
            listToTree(list, v);
            return true;
        }
    });
}

function renderTree(list, tree) {  // 渲染树
    listToTree(list, tree);
    let html = '<div class="empty">没有任何菜单</div>';
    if (list.length) {
        html = '<div>' + createNodeHtml(tree) + '</div>';
    }
    return html;
}

function createNodeHtml(tree) {   //创建树的html
    let len = tree.children.length;
    let html = '';
    for (let i = 0; i < len; i++) {
        let v = tree.children[i];
        html += `<div data="menu${v.menuId}" style="margin-left:10px"><div class="menu-item"><i class="iconfont icon-folder"></i> ${v.menuName}</div>`;
        if (v.children.length) {
            html += createNodeHtml(v);
        }
        if (v.noteList && v.noteList.length) {
            let html2 = '';
            v.noteList.forEach(v => {
                html2 += `<a style="margin-left: 10px" class="file-item" href="/notes/xiaowei/${v.noteId}"><i class="iconfont icon-10file"></i> ${v.noteTitle}</a>`;
            });
            html += html2;
        }
        html += '</div>';
    }
    return html;
}

module.exports = PageController;
