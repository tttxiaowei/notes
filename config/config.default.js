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
        'formatResponse',
        'formatRequest',
        'oauth',
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
        bodyParser: {
            jsonLimit: '1mb'
        },
    };

    return {
        ...config,
        ...userConfig,
    };
};
