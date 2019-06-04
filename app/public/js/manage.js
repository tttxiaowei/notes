$(function () {
    let manage = {
        editorIns: {},      // 不编辑器实例
        treeIns: {},        // 树插件实例
        removeList: [],     // 删除的菜单
        removeFileList: [],     // 删除的文件菜单
        menuTree: {},         // 菜单树数据
        menuList: [],         // 菜单树数据的一维数组形式
        submitNote() {      // 提交笔记
            let file = $('.activeMenu');
            let noteId;
            if (file.hasClass('file-item')) {
                noteId = +file.attr('data').slice(8);
            }
            let menuId = +file.parent().attr('data').slice(4);
            let title = $('#noteTitle').val();
            let md = this.editorIns.getMarkdown();
            let html = this.editorIns.getHTML();
            if (!title || !md || !menuId) {
                return $.message('warning', '标题或笔记不能为空!');
            }
            let data = {
                menuId,
                title,
                md,
                html
            };
            if (!isNaN(noteId)) {
                data.noteId = noteId;
            }
            sendAjax({
                url: '/notes/api/note',
                method: 'post',
                data,
                success: (res) => {
                    $.message('success', 'Submit Success');
                }
            });
        },
        getMenuList() {     // 获取菜单列表
            this.removeList = [];
            this.menuTree = {};
            this.menuList = [];
            sendAjax({
                url: '/notes/api/menu',
                method: 'get',
                success: (res) => {
                    this.menuList = res.data.list;
                    this.treeIns = $.tree({
                        ele: '#menuList',
                        treeObj: this.menuTree,
                        treeList: this.menuList,
                        removeList: this.removeList,
                        removeFileList: this.removeFileList,
                        treeKey: {
                            id: 'menuId',
                            name: 'menuName',
                            parent: 'parentId',
                            children: 'children',
                        },
                        menuClsPrefix: 'menu',
                        newMenuClsPrefix: 'newMenu',
                        newMenuClsPrefixIndex: 1,
                        selectFile: this.selectFile,
                        scope: this,
                    });
                }
            });
        },
        saveMenu() {    // 保存新菜单
            sendAjax({
                url: '/notes/api/menu',
                method: 'post',
                data: {
                    menuTree: this.menuTree,
                    removeList: this.removeList,
                    removeFileList: this.removeFileList,
                },
                success: (res) => {
                    $.message('success', '保存菜单成功！');
                    this.getMenuList();
                }
            });
        },
        getNote(id) {     // 获取文档
            sendAjax({
                url: '/notes/api/note/' + id,
                method: 'get',
                success: (res) => {
                    $('#noteTitle').val(res.data.noteTitle);
                    this.editorIns.setMarkdown(res.data.md)
                }
            });
        },
        selectFile(obj) {
            $('#noteTitle').val(obj.noteTitle);
            if (+obj.noteId && confirm('将要从数据库获取文档内容，将会覆盖现有文档，是否获取？')) {
                this.getNote(obj.noteId);
            }
        },
        getPageData() {     // 获取页面数据
            this.getMenuList();
        },
        initEvent() {       // 绑定页面事件
            $('#saveMenuBtn').click(e => this.saveMenu(e));   // 绑定事件函数中的this
            $('#submitBtn').click(e => this.submitNote(e));
            $('#addMenuBtn').click(e => this.treeIns.addNode('menu'));
            $('#addFileBtn').click(e => this.treeIns.addNode('file'));
            $('#removeMenuBtn').click(e => this.treeIns.removeNode(e));
            $('#fullscreenBtn').click(e => this.editorIns.fullscreen(e));
        },
        initPage() {
            this.getPageData();
            this.initEvent();
            let md = '';
            this.editorIns = editormd("noteEditormd", {
                width: '100%',
                height: '100%',
                path: '/public/js/editormd/lib/',
                theme: "dark",
                previewTheme: "dark",
                editorTheme: "pastel-on-dark",
                markdown: md,
                codeFold: true,
                //syncScrolling : false,
                saveHTMLToTextarea: true,    // 保存 HTML 到 Textarea
                searchReplace: true,
                //watch : false,                // 关闭实时预览
                htmlDecode: "style,script,iframe|on*",            // 开启 HTML 标签解析，为了安全性，默认不开启
                //toolbar  : false,             //关闭工具栏
                //previewCodeHighlight : false, // 关闭预览 HTML 的代码块高亮，默认开启
                emoji: true,
                taskList: true,
                tocm: true,         // Using [TOCM]
                tex: true,                   // 开启科学公式TeX语言支持，默认关闭
                flowChart: true,             // 开启流程图支持，默认关闭
                sequenceDiagram: true,       // 开启时序/序列图支持，默认关闭,
                //dialogLockScreen : false,   // 设置弹出层对话框不锁屏，全局通用，默认为true
                //dialogShowMask : false,     // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
                //dialogDraggable : false,    // 设置弹出层对话框不可拖动，全局通用，默认为true
                //dialogMaskOpacity : 0.4,    // 设置透明遮罩层的透明度，全局通用，默认值为0.1
                //dialogMaskBgColor : "#000", // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
                imageUpload: true,
                imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
                imageUploadURL: "./php/upload.php",
                onload: function () {
                    console.log('onload', this);
                    //this.fullscreen();
                    //this.unwatch();
                    //this.watch().fullscreen();

                    //this.setMarkdown("#PHP");
                    //this.width("100%");
                    //this.height(480);
                    //this.resize("100%", 640);
                }
            });
        },
    };
    manage.initPage();
});
