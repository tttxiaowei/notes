const jwt = require('../utils/jwt.js');
module.exports = (options, app) => {
    return async function (ctx, next) {
        ctx.userInfo = ctx.request.headers.token ? jwt.verify(ctx.request.headers.token) : {};
        await next();
    };
};