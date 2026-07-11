const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'gu'],
  },
  localePath: path.resolve('./public/locales'),
  ns: ['common', 'dashboard', 'complaints'],
  defaultNS: 'common',
};
