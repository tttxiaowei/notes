const jwt = require('../utils/jwt.js');

module.exports = (options, app) => {
    return async function (ctx, next) {
        if (/\/notes\/api\//.test(ctx.url) && !/\/notes\/api\/(login|oauth)/.test(ctx.url)) {     // 对/notes/api/请求进行鉴权，/notes/api/login和/notes/api/oauth不需要鉴权
            let oauth = jwt.verify(ctx.request.headers.token);
            if (oauth.exp) {
                return await next();
            } else {
                return ctx.body = {
                    code: 401,
                    message: '未登陆或登陆已失效，请重新登陆！',
                    data: {oauth}
                };
            }
        }
        await next();
    }
};