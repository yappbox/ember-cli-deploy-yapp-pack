# ember-cli-deploy-yapp-pack

> An ember-cli-deploy plugin pack to implement a deployment pattern for Yapp's Ember apps

<hr/>
**WARNING: This plugin pack is only compatible with ember-cli-deploy versions >= 0.5.0**
<hr/>

This plugin pack is prepared for internal use by Yapp and is open-sourced for educational
purposes but will not be supported for shared community use.

This package bundles ember-cli-deploy-lightning-pack and ember-cli-deploy-slack
and a util method to minimize duplicated config code between apps.

It also has a blueprint for your `config/deploy.js` file to get you started.

## Installation

```
ember install ember-cli-deploy
ember install ember-cli-deploy-yapp-pack
```

The necessary set of plugins will be available to ember-cli-deploy and an example `deploy/config.js` file will be generated for you to customize with information about your app.

## What is a plugin pack?

A "plugin pack" is a concept supported by ember-cli-deploy that allows a single addon to make multiple plugins available by adding a single direct depedency to your project.

## What plugins are made available?

* Via [ember-cli-deploy-lightning-pack](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack)
  * [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build)
  * [ember-cli-deploy-gzip](https://github.com/ember-cli-deploy/ember-cli-deploy-gzip)
  * [ember-cli-deploy-redis](https://github.com/ember-cli-deploy/ember-cli-deploy-redis)
  * [ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3)
  * [ember-cli-deploy-manifest](https://github.com/ember-cli-deploy/ember-cli-deploy-manifest)
  * [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data)
* [ember-cli-deploy-slack](https://github.com/ember-cli-deploy/ember-cli-deploy-slack)
