const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const path = require('path')
const config = getSentryExpoConfig(path.dirname(require.main.filename))

module.exports = config
