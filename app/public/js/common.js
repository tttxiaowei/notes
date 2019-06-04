function sendAjax(options) {
    options = Object.assign({}, options, {
        headers: {
            'x-csrf-token': document.cookie ? document.cookie.match(/csrfToken=([^;]+);*/)[1] : '',
            token: sessionStorage.getItem('token')
        },
    });
    if (!options.headers.token && options.url !== '/notes/api/login') {     // 保证每个ajax请求带token（除了login）
        return $.message('error', '未登陆系统！');      // 需要return，否则会继续执行下面的代码
    }
    if (Object.prototype.toString.call(options.data) === '[object Object]') {
        options.body = JSON.stringify(options.data);
        options.headers['Content-Type'] = 'application/json';
    } else if (Object.prototype.toString.call(options.data) === '[object FormData]') {
        options.body = options.data;
    }
    fetch(options.url, options)
        .catch(err => {
            $.message('error', '网络故障时或请求被阻止');
            options.error ? options.error(err) : void 0;
            options.complete ? options.complete(err) : void 0;
        })
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                options.success ? options.success(res) : void 0;   // 只有res.code为200时才会执行success回调函数
                options.complete ? options.complete(void 0, res) : void 0;
            } else {
                if (res.code === 401 && res.data.oauth && res.data.oauth.name === 'TokenExpiredError') { // token过期，使用refreshToken更新token，更新成功就重发请求
                    sendAjax({
                        url: '/notes/api/oauth',    // 请求更新token
                        method: 'post',
                        data: {
                            token: sessionStorage.getItem('token'),
                            refreshToken: sessionStorage.getItem('refreshToken')
                        },
                        success(result) {
                            sessionStorage.setItem('token', result.data.token);
                            sessionStorage.setItem('refreshToken', result.data.refreshToken);
                            sendAjax(options);      // 刷新token成功，重新发送之前失败的请求
                        },
                        error() {
                            $.message('error', '未登陆或登陆已失效，请重新登陆！');
                        }
                    });
                } else {
                    $.message('error', res.message);
                    options.error ? options.error(void 0, res) : void 0;
                    options.complete ? options.complete(void 0, res) : void 0;
                }
            }
        });
}

$.message = function (type, html) {
    $('#' + type + 'Alert').html(html).removeClass('d-none');
    setTimeout(() => {
        $('#' + type + 'Alert').addClass('d-none');
    }, 3000);
};