Package.describe({
  name: 'beteal:autoform-tag',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('aldeed:autoform@4.0.0 || 5.0.0');
  api.use('reactive-var@1.0.5');
  api.use('nrane9:banner-alert@0.0.2');

  api.addFiles([
    'autoform-tag.html',
    'autoform-tag.css'
  ], 'client');
  api.addFiles([
    'autoform-tag.js'
  ]);

  api.export('afTagSchema');
  api.export('afTag');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('beteal:autoform-tag');
  api.addFiles('autoform-tag-tests.js');
});
