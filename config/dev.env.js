var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SYNTHEA_URL: '"http://localhost:8021/"',
  VIZ_URL: '"https://code.osehra.org/synthea/synthea_upload.php"',
  // V2O_URL: '""' or missing for open source
  V2O_URL: '""'
})
