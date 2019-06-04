$(function () {
    $('#loginBtn').click(() => {
        sendAjax({
            url: '/notes/api/login',
            method: 'post',
            data: {
                username: $('#usernameInput').val(),
                password: $('#passwordInput').val()
            },
            success(res) {
                sessionStorage.setItem('token', res.data.token);
                sessionStorage.setItem('refreshToken', res.data.refreshToken);
                location.href = '/notes/manage';
            }
        });
    });
});