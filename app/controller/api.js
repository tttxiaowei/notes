const Controller = require('egg').Controller;

class ApiController extends Controller {
    async login() {
        const {ctx} = this;
        let result = await ctx.service.api.login();
        if (result && result.token) {
            ctx.body = {
                code: 200,
                data: result
            };
        } else {
            ctx.body = {
                code: 500,
                message: '登陆失败!',
            };
        }
    }

    async oauth() {
        const {ctx} = this;
        let result = await ctx.service.api.oauth();
        if (result && result.token) {
            ctx.body = {
                code: 200,
                data: result
            };
        } else {
            ctx.body = {
                code: 500,
                message: '重新获取token失败!请重新登陆',
            };
        }
    }

    async saveNote() {
        const {ctx} = this;
        let token = await ctx.service.api.saveNote();
        if (token) {
            ctx.body = {
                code: 200,
            };
        } else {
            ctx.body = {
                code: 500,
                message: '保存笔记失败！',
            };
        }
    }

    async getNote() {
        const {ctx} = this;
        let note = await ctx.service.api.getNote() || [];
        ctx.body = {
            code: 200,
            data: note
        };
    }

    async getMenu() {
        const {ctx} = this;
        let list = await ctx.service.api.getMenu() || [];
        ctx.body = {
            code: 200,
            data: {list}
        };
    }

    async saveMenu() {
        const {ctx} = this;
        let list = await ctx.service.api.saveMenu();
        if (list) {
            ctx.body = {
                code: 200,
                data: {list}
            };
        } else {
            ctx.body = {
                code: 500,
                message: '保存笔记失败！'
            };
        }
    }
}

module.exports = ApiController;
