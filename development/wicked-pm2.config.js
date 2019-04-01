module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'api',
      script    : 'bin/api',
      cwd       : '../../wicked.api',
      watch     : true,
      ignore_watch: ['.git', 'node_modules', 'routes/internal_apis/**/swagger.json'],
      env: {
        NODE_ENV: 'portal_local',
        LOG_LEVEL: 'debug',
        PORTAL_CONFIG_BASE: '../wicked-sample-config'
      }
    },
    {
      name      : 'ui',
      script    : 'bin/www',
      cwd       : '../../wicked.ui',
      watch     : true,
      ignore_watch: ['.git', 'node_modules'],
      env: {
        // DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'kong-adapter',
      script    : 'npm',
      args      : 'run build-and-start',
      cwd       : '../../wicked.kong-adapter',
      watch     : true,
      ignore_watch: ['.git', 'node_modules', 'dist'],
      env: {
        // DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'auth',
      script    : 'npm',
      args      : 'run build-and-start',
      cwd       : '../../wicked.auth',
      watch     : true,
      ignore_watch: ['.git', 'node_modules', 'dist'],
      env: {
        // DEBUG: 'wicked-sdk',
        LOG_LEVEL: 'debug'
      }
    }
  ]
};
