module.exports = (options, app) => {
    return async function (ctx, next) {
        await next();
        if (typeof ctx.body === 'object') {
            if (!ctx.body.data) {
                ctx.body.data = {};
            }
            if (!ctx.body.message) {
                ctx.body.message = '';
            }
        }
    };
};