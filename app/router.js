module.exports = app => {
    const {router, controller} = app;
    router.redirect('/', '/blog/xiaowei/1', 302);
    router.get('/blog/:user/:id', controller.page.blog);
    router.get('/notes/login', controller.page.login);
    router.get('/notes/manage', controller.page.manage);

    router.post('/notes/api/oauth', controller.api.oauth);
    router.post('/notes/api/login', controller.api.login);
    router.post('/notes/api/note', controller.api.saveNote);
    router.get('/notes/api/note/:noteId', controller.api.getNote);
    router.get('/notes/api/menu', controller.api.getMenu);
    router.post('/notes/api/menu', controller.api.saveMenu);
};
