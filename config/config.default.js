/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
    /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1558891844532_722';

    // add your middleware config here
    config.middleware = [
        'oauth',
        'formatResponse',
    ];

    // add your user config here
    const userConfig = {
        // myAppName: 'egg',
        view: {
            cache: true,
            defaultExtension: '.html',
            defaultViewEngine: 'nunjucks',
            mapping: {
                '.html': 'nunjucks'
            }
        },
        mysql: {
            // 单数据库信息配置
            client: {
            },
            // 是否加载到 app 上，默认开启
            app: true,
            // 是否加载到 agent 上，默认关闭
            agent: false,
        },
        bodyParser: {
            jsonLimit: '1mb'
        },
    };

    return {
        ...config,
        ...userConfig,
    };
};
