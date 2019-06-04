const Service = require('egg').Service;
const md5 = require('blueimp-md5');
const jwt = require('../utils/jwt.js');

class PageService extends Service {
    async blog() {
        const {ctx} = this;
        const userInfo = await this.app.mysql.get('user', {username: ctx.params.user});
        if (!userInfo) {
            return {list: [], note: {}};
        }
        const note = await this.app.mysql.get('note', {userId: userInfo.userId, noteId: ctx.params.id});
        if (userInfo && note) {
            let list = await this.app.mysql.select('menu', {where: {userId: userInfo.userId}});
            let len = list.length;
            while (len) {
                let index = --len;
                list[index].noteList = await this.app.mysql.select('note', {
                    where: {
                        userId: userInfo.userId,
                        menuId: list[index].menuId
                    },
                    columns: ['noteId', 'noteTitle'],
                });
            }
            return {list, note};
        }
    }

    async manage() {
        const {ctx} = this;
        return user;
    }
}

module.exports = PageService;