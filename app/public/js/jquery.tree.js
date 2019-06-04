(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        module.exports = factory
    } else {
        if (typeof define === "function") {
            factory(jQuery)
        } else {
            factory(jQuery)
        }
    }
}(function ($) {
    function treeFactory(options) {
        let defaultOps = {
            ele: '',        // 必传，tree容器，'#id'或$('#id')
            treeObj: {},    // tree对象，初始化时可传treeObj或treeList， 以treeObj为准
            treeList: [],   // tree对象的一维数组形式，初始化时可传treeObj或treeList
            rootId: 0,      // 根节点id
            removeList: [], // 操作删除的菜单节点列表
            removeFileList: [], // 操作删除的文件节点列表
            treeKey: {      // treeObj的字段映射
                id: 'id',               // 节点id
                name: 'name',           // 节点内容
                parent: 'parentId',     // 父id
                children: 'children',   // 子数组
            },
            nodePrefix: 'menu',         // 节点data属性前缀
            newNodePrefix: 'newMenu',   // 新增节点前缀
            newNodeIndex: 1,            // 新增节点起始索引
            showClass: 'menu-item',     // 每个节点的class
            activeNodeClass: 'activeMenu',              // 当前选中节点的class
            collapseClass: 'menu-collapse',              // 收起菜单的class
            addPlaceholder: '请输入菜单名，并回车确认',  // 添加节点的输入框提示
            emptyTips: '没有任何菜单',    // 菜单为空时的提示
            fileClass: 'file-item',     // 文件类名
            fileIcon: '<i class="iconfont icon-10file"></i>',
            folderIcon: '<i class="iconfont icon-folder"></i>',
        };

        options.ele = $(options.ele);
        if (!$(options.ele).length) {
            throw  new Error('jquery.tree require element like $.tree("#id") or $.tree($("#id"))');
        }
        options.ele.click(e => this.selectNode(e));
        let ops = Object.assign({}, defaultOps, options);
        this.ops = ops;
        if (Object.keys(ops.treeObj).length) {     // 格式化ops.treeList, ops.treeObj
            this.treeToList(ops.treeList, ops.treeObj);
        } else {
            this.listToTree(ops.treeList, ops.treeObj);
        }
        this.renderTree(ops.treeObj);   // 渲染树
    }

    treeFactory.prototype = {
        updateTree(data) {      // 根据treeObj或treeList更新树
            let ops = this.ops;
            switch (Object.prototype.toString.call(data)) {
                case '[Object Object]':
                    this.treeObj = data;
                    this.treeToList(ops.treeList, ops.treeObj);
                    break;
                case '[Object Array]':
                    this.treeList = data;
                    this.listToTree(ops.treeList, ops.treeObj);
                    break;
            }
            this.removeList.length = 0;
            this.removeFileList.length = 0;
            this.renderTree(this.ops.treeObj);
        },
        addNode(type) {     // 添加节点
            let ops = this.ops;
            ops.ele.find('.addNodeInput').remove();
            ops.ele.find('.empty').remove();
            let ele = ops.ele.find('.' + ops.activeNodeClass);
            let parentNode = ele.parent();
            if (ele.hasClass(ops.fileClass)) {
                return $.message('warning', '请选择菜单');
            }
            let parentNodeId = parentNode.attr('data') ? parentNode.attr('data').slice(ops.nodePrefix.length) : ops.rootId;
            if (!parentNodeId) {
                parentNode = ops.ele;
            }
            if (parentNode.hasClass(ops.collapseClass)) {
                parentNode.removeClass(ops.collapseClass);
            }
            parentNode.append('<input type="text" class="form-control addNodeInput" placeholder="' + ops.addPlaceholder + '">');
            let addNodeInput = ops.ele.find('.addNodeInput');
            addNodeInput.trigger('focus');
            addNodeInput.keyup(({keyCode}) => {
                if (keyCode == 13) {
                    let value = addNodeInput.val();
                    if (!value) {
                        return;
                    }
                    let isMenu = type === 'menu';
                    let newNode = isMenu ? {
                        [ops.treeKey.id]: '' + ops.newNodePrefix + ops.newNodeIndex++,
                        [ops.treeKey.name]: value,
                        [ops.treeKey.parent]: parentNodeId,
                        [ops.treeKey.children]: []
                    } : {
                        noteTitle: value,
                        noteId: 'newNote' + ops.newNodeIndex++,
                    };
                    let parent = this.findNode(ops.treeObj, null, parentNodeId).obj[ops.treeKey.children];
                    let html = '';
                    if (isMenu) {
                        html = `<div data="${ops.nodePrefix}${newNode[ops.treeKey.id]}"  style="margin-left:10px"><div class="${ops.showClass}">${ops.folderIcon} ${newNode[ops.treeKey.name]}</div></div>`;
                        parent.push(newNode);
                    } else {
                        html = `<div data="fileData${newNode.noteId}" style="margin-left: 10px" class="${ops.fileClass}">${ops.fileIcon} ${newNode.noteTitle}</div>`;
                        if (parent.noteList) {
                            parent.noteList.push(newNode);
                        } else {
                            parent.noteList = [newNode];
                        }
                    }
                    this.treeToList(ops.treeList, ops.treeObj);
                    addNodeInput.remove();
                    parentNode.append(html);
                }
            });
        },
        removeNode() {  // 删除节点
            let ops = this.ops;
            let selectedNode = ops.ele.find('.' + ops.activeNodeClass);
            if (!selectedNode.length) {
                return $.message('warning', '请选择要删除的菜单');
            }
            let isMenu = !selectedNode.hasClass(ops.fileClass);
            let menu = selectedNode.parent();
            let result = this.findNode(ops.treeObj, null, menu.attr('data').slice(ops.nodePrefix.length));
            if (+result.obj[ops.treeKey.id]) {
                if (isMenu) {
                    let arr = [];
                    this.treeToList(arr, result.obj);
                    ops.removeList.push(...arr);
                    menu.remove();
                    result.parent[ops.treeKey.children].splice(result.index, 1);
                } else {
                    let id = selectedNode.attr('data').slice(8);
                    let list = result.obj.noteList;
                    let len = list.length;
                    let i = 0;
                    for (; i < len; i++) {
                        if (list[i]['noteId'] == id) {
                            break;
                        }
                    }
                    if (!isNaN(+id)) {
                        ops.removeFileList.push(list[i]);
                    }
                    selectedNode.remove();
                    list.splice(i, 1);
                }
            }
            this.treeToList(ops.treeList, ops.treeObj);
        },
        treeToList(list, tree) {
            let ops = this.ops;
            let len = tree[ops.treeKey.children].length;
            if (len) {
                while (len--) {
                    this.treeToList(list, tree[ops.treeKey.children][len]);
                }
                list.push(tree);
                return true;
            } else {
                list.push(tree);
                return true;
            }
        },
        listToTree(list, tree) {    // 数组转为树
            let ops = this.ops;
            if (!Object.keys(tree).length) {   // 根节点
                tree[ops.treeKey.id] = ops.rootId;
            }
            tree[ops.treeKey.children] = list.filter(v => {
                if (v[ops.treeKey.parent] === tree[ops.treeKey.id]) {
                    this.listToTree(list, v);
                    return true;
                }
            });
        },
        renderTree() {  // 渲染树
            let ops = this.ops;
            let html = '<div class="empty">' + ops.emptyTips + '</div>';
            if (ops.treeList.length) {
                html = $('<div></div>');
                this.createNodeHtml(ops.treeObj, html);
            }
            ops.ele.html(html);
        },
        createNodeHtml(treeObj, parent) {   //创建树的html
            let ops = this.ops;
            treeObj[ops.treeKey.children].forEach(v => {
                let html = `<div data="${ops.nodePrefix}${v[ops.treeKey.id]}" style="margin-left:10px"><div class="${ops.showClass}">${ops.folderIcon} ${v[ops.treeKey.name]}</div>`;
                if (v.noteList && v.noteList.length) {
                    let html2 = '';
                    v.noteList.forEach(v => {
                        html2 += `<div data="fileData${v.noteId}" style="margin-left: 10px" class="${ops.fileClass}">${ops.fileIcon} ${v.noteTitle}</div>`;
                    });
                    html += html2;
                }
                html += '</div>';
                let p = $(html);
                let el = parent.children('.' + ops.showClass).eq(0);
                if (el.length) {
                    p.insertAfter(el);
                } else {
                    parent.append(p);
                }
                if (v[ops.treeKey.children].length) {
                    this.createNodeHtml(v, p);
                }
            });
        },
        findNode(obj, index, id) {  // 根据id从树中找节点
            let ops = this.ops;
            let obj1 = index === null ? obj : obj[ops.treeKey.children][index];
            if (obj1[ops.treeKey.id] == id) {
                return {
                    parent: obj,
                    index,
                    obj: obj1
                };
            }
            let len = obj1[ops.treeKey.children].length;
            for (let i = 0; i < len; i++) {
                let item = this.findNode(obj1, i, id);
                if (item) {
                    return item;
                }
            }
        },
        selectNode(e) {     // 点击树节点
            let ops = this.ops;
            let ele = ops.ele.find(e.target);
            let isFile = ele.hasClass(ops.fileClass);
            let active = ops.ele.find('.' + ops.activeNodeClass);
            if (ele.hasClass(ops.showClass) || isFile) {
                if (isFile && ops.selectFile) {
                    let menuNode = this.findNode(ops.treeObj, null, ele.parent().attr('data').slice(ops.nodePrefix.length)).obj;
                    let id = ele.attr('data').slice(8);
                    let list = menuNode.noteList;
                    let len = list.length;
                    let i = 0;
                    for (; i < len; i++) {
                        if (list[i]['noteId'] == id) {
                            break;
                        }
                    }
                    ops.selectFile.call(ops.scope, list[i]);
                } else {
                    if (ele.hasClass(ops.showClass)) {
                        ele.parent().toggleClass(ops.collapseClass);
                    }
                }
                if (e.target !== active[0]) {
                    active.removeClass(ops.activeNodeClass);
                    ele.addClass(ops.activeNodeClass);
                }
            } else {
                ops.ele.find('.' + ops.activeNodeClass).removeClass(ops.activeNodeClass);
            }
        },
    };

    return $.tree = function (options) {   // 每次调用返回一个树组件实例
        return new treeFactory(options);
    };
}));