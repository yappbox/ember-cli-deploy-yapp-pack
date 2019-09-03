'use strict';

module.exports = {
  name: require('./package').name,
  getConfiguration: function(prefix, appName, deployTarget) {
    var RSVP = require('rsvp');

    var VALID_DEPLOY_TARGETS = [
      'dev',
      'devindex',
      'qa',
      'prod'
    ];
    var ENV = {};
    ENV.build = {};
    ENV.gzip = {};
    ENV.redis = {
      allowOverwrite: true,
      keyPrefix: prefix + ':index'
    };
    ENV.s3 = {
      prefix: prefix,
      region: 'us-east-1'
    };
    ENV.slack = {
      webhookURL: process.env.YAPP_SLACK_TECH_CHANNEL_WEBHOOK,
      didDeploy:function(){},
      didFail:function(){}
    };
    ENV.pipeline = {};

    if (VALID_DEPLOY_TARGETS.indexOf(deployTarget) === -1) {
      throw new Error('Invalid deployTarget ' + deployTarget);
    }

    if (deployTarget === 'dev') {
      ENV.build.environment = 'development';
      ENV.redis.revisionKey = 'dev';
      ENV.redis.url = process.env.YAPP_REDIS_URL_DEVELOPMENT || 'redis://0.0.0.0:6379/';
      ENV.pipeline.disabled = {
        allExcept: ['build', 'redis']
      };
    }

    if (deployTarget === 'devindex') {
      ENV.pipeline.activateOnDeploy = true;
      ENV.build.environment = 'development';
      ENV.redis.distDir = function(context) {
        return context.commandOptions.buildDir || 'dist';
      };
      ENV.redis.revisionKey = 'dev';
      ENV.redis.url = process.env.YAPP_REDIS_URL_DEVELOPMENT || 'redis://0.0.0.0:6379/';
      ENV.pipeline.disabled = { // special case to support postBuild and `npm run dev:index` usage
        allExcept: ['redis']
      };
    }

    var domain;
    var herokuAppName;
    if (deployTarget === 'qa') {
      ENV.s3.bucket = 'yapp-assets';
      ENV.redis.url = process.env.REDISTOGO_URL; // optional, falls back to reading from heroku below
      domain = "www.yappqa.us";
      herokuAppName = 'qa-yapp-cedar';
    }

    if (deployTarget === 'prod') {
      ENV.s3.bucket = 'yapp-assets';
      ENV.redis.url = process.env.REDISTOGO_URL; // optional, falls back to reading from heroku below
      domain = "www.yapp.us";
      herokuAppName = 'yapp-cedar';
    }

    if (deployTarget === 'qa' || deployTarget === 'prod') {
      ENV.build.environment = 'production';
      ENV.s3.accessKeyId = process.env.YAPP_AWS_KEY;
      ENV.s3.secretAccessKey = process.env.YAPP_AWS_SECRET;
      ENV.slack.didDeploy = function(context) {
        return function(slack){
          var message;
          var revisionKey = context.revisionData.revisionKey;
          if (revisionKey && !context.revisionData.activatedRevisionKey) {
            message = "Deployed " + appName + " to " + process.env.DEPLOY_TARGET + " but did not activate it.\n"
                 + "Preview: https://" + domain + "/" + prefix + "/?manifest_id=" + revisionKey + "\n"
                 + "Activate: `ember deploy:activate " + process.env.DEPLOY_TARGET + ' --revision='+ revisionKey + "`\n";
          } else {
            message = '*' + appName + ' > *' + process.env.DEPLOY_TARGET + '* -- _Deployed & activated_ -- (revision: `' + revisionKey + '`)';
          }
          return slack.notify(message);
        };
      };
      ENV.slack.didActivate = function(context) {
        if (context.commandOptions.revision) {
          return function(slack){
            var message = "Activated " + appName + " revision on " + process.env.DEPLOY_TARGET + ": " + context.revisionData.activatedRevisionKey + "\n";
            return slack.notify(message);
          };
        }
      };
      ENV.redis.didDeployMessage = function(context) {
        if (context.revisionData.revisionKey && !context.revisionData.activatedRevisionKey) {
          var revisionKey = context.revisionData.revisionKey;
          return "Deployed but did not activate revision " + revisionKey + ".\n"
               + "To preview:\n"
               + "https://" + domain + "/" + prefix + "/?manifest_id=" + revisionKey + "\n"
               + "To activate:\n"
               + "ember deploy:activate " + process.env.DEPLOY_TARGET + ' --revision='+ revisionKey + "\n";
        }
      };
    }

    return RSVP.resolve().then(function(){
      if (deployTarget === 'qa' || deployTarget === 'prod') {
        if (!ENV.redis.url || ENV.redis.url === '') {
          return new RSVP.Promise(function(resolve, reject){
            var exec = require('child_process').exec;
            exec('heroku config:get REDISTOGO_URL --app ' + herokuAppName, function (error, stdout, stderr) {
              ENV.redis.url = stdout.replace(/\n/, '').replace(/\/\/redistogo:/, '//:');
              resolve(ENV);
            });
          });
        }
      }
      return ENV;
    });
  }
};
