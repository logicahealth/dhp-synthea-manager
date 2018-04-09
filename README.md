# synthea-manager

> Synthea Manager

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

***Environment Build Configuration ***

Local Development:
-configuration: root/config/dev.env.js
-environment parameter: dev

Docker Deployment Development:
-configuration: root/config/devdeploy.env.js
-environment parameter: devdeploy

Demo Deployment:
-configuration: root/config/demo.env.js
-environment parameter: demo

Production Stage Deployment:
-configuration: root/config/prodstage.env.js
-environment parameter: prodstage

Production: Deployment: prod
-configuration: root/config/prod.env.js
-environment parmaeter: prod

Modify config/{environment_parameter}.env.js file

Set SYNTHEA_URL to approparate URL
Example: SYNTHEA_URL: '"https://synthea-service-url/"',
// To turn off OHC functionality, Either remove V20_URL or set it equal to spaces:  V2O_URL: '""'
V2O_URL: '"https://vista-to-ohc-url/"'

*** Docker Installation/Deployment ***

Build/Deploy
deploy.sh {env_parameter}

Example:
chmod +x build.sh compile.sh create-container.sh deploy.sh docker-env.sh
./build.sh devdeploy
