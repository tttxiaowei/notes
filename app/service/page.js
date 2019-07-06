const Service = require('egg').Service;
const md5 = require('blueimp-md5');
const jwt = require('../utils/jwt.js');

class PageService extends Service {
    async blog() {
        const {ctx} = this;
        const userInfo = await this.app.mysql.get('user', {     // 根据浏览器地址栏用户名获取用户信息
            username: ctx.params.user
        });
        if (!userInfo) {    // 如果没有查到用户，直接返回
            return {list: [], note: {}};
        }
        const note = await this.app.mysql.get('note', {     // 获取本次请求的笔记内容
            userId: userInfo.userId,
            noteId: ctx.params.id,
            isPublic: 1
        });
        if (!note) {    // 如果没有查到公开笔记，直接返回
            return {list: [], note: {}};
        }
        let list = await this.app.mysql.select('menu', {    // 获取用户笔记的菜单树
            where: {
                userId: userInfo.userId,
                isPublic: 1
            }
        });
        let len = list.length;
        while (len) {
            let index = --len;
            list[index].noteList = await this.app.mysql.select('note', {        // 遍历菜单树，获取每个菜单下的笔记
                where: {
                    userId: userInfo.userId,
                    menuId: list[index].menuId,
                    isPublic: 1,
                },
                columns: ['noteId', 'noteTitle'],
            });
        }
        return {list, note};
    }

    async manage() {
        const {ctx} = this;
        return user;
    }
}

module.exports = PageService;