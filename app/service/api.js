const Service = require('egg').Service;
const md5 = require('blueimp-md5');
const jwt = require('../utils/jwt.js');

class ApiService extends Service {
    async login() {     // 登陆请求
        const {ctx} = this;
        let data = ctx.request.body;
        let user = await this.app.mysql.get('user', {username: data.username, password: md5(data.password)});   // 对密码进行md5加密，与数据库中md5加密过的密码比较
        if (user) {
            let token = jwt.sign({
                userId: user.userId,
                exp: Math.floor(Date.now() / 1000) + (60 * 100)     // token有效期100分钟
            });
            let refreshToken = jwt.sign({
                userId: user.userId,
                token,
                exp: Math.floor(Date.now() / 1000) + (60 * 600)     // refreshToken有效期600分钟
            });
            return {
                token,
                refreshToken
            };
        }
    }

    async oauth() {     // 发送token和refreshToken，重新生成token和refreshToken
        const {ctx} = this;
        let data = ctx.request.body;
        let result = jwt.verify(data.refreshToken);
        if (result && result.token === data.token) {
            let token = jwt.sign({      // 生成新的token
                userId: result.userId,
                exp: Math.floor(Date.now() / 1000) + (60 * 100)
            });
            let refreshToken = jwt.sign({
                userId: result.userId,
                token,
                exp: result.exp     // refreshToken的有效期不变
            });
            return {
                token,
                refreshToken
            };
        }
    }

    async saveNote() {
        const {ctx} = this;
        let userInfo = jwt.verify(ctx.request.headers.token);
        let data = ctx.request.body;
        let user;
        let params = {
            noteTitle: data.title,
            md: data.md,
            html: data.html,
            menuId: data.menuId,
            userId: userInfo.userId,
            updateTime: Date.now()
        };
        if (data.noteId) {
            user = await this.app.mysql.update('note', params, {
                where: {
                    noteId: data.noteId
                }
            });
        } else {
            user = await this.app.mysql.insert('note', params);
        }
        if (user) {
            return true;
        }
    }

    async getNote() {
        const {ctx} = this;
        let userInfo = jwt.verify(ctx.request.headers.token);
        return await this.app.mysql.get('note', {userId: userInfo.userId, noteId: ctx.params.noteId});
    }

    async getMenu() {
        const {ctx} = this;
        let userInfo = jwt.verify(ctx.request.headers.token);
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
        return list;
    }

    async saveMenu() {
        const {ctx} = this;
        let data = ctx.request.body;
        let userInfo = jwt.verify(ctx.request.headers.token);
        let self = this;

        async function updateMenuTree(arr, parent) {
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                let data = {
                    menuName: arr[i].menuName,
                    parentId: parent.menuId == null ? parent.insertId : parent.menuId,
                    userId: userInfo.userId,
                };
                if (+arr[i].menuId) {   // 老的数字id，调update
                    let menu = await self.app.mysql.update('menu', data, {where: {menuId: arr[i].menuId}});
                    if (arr[i].children.length) {
                        updateMenuTree(arr[i].children, {menuId: arr[i].menuId});   // 把当前menuId传给children当父id
                    }
                } else {    // 新menu，调insert
                    let menu = await self.app.mysql.insert('menu', data);
                    if (arr[i].children.length) {
                        updateMenuTree(arr[i].children, menu);   // 插入成功menu中会有insertId，做为children当父id
                    }
                }
            }
        }

        updateMenuTree(data.menuTree.children, data.menuTree);
        let len = data.removeList.length;
        while (len) {
            await this.app.mysql.delete('menu', {userId: userInfo.userId, menuId: data.removeList[--len].menuId});
        }
        len = data.removeFileList.length;
        while (len) {
            await this.app.mysql.delete('note', {userId: userInfo.userId, noteId: data.removeFileList[--len].noteId});
        }
        return await this.app.mysql.select('menu', {where: {userId: userInfo.userId}});
    }
}

module.exports = ApiService;