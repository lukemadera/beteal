Package.describe({
  name: 'lukemadera:af-array-field-type',
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

  api.use('aldeed:autoform@5.0.0')
  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');

  api.addFiles([
    'af-array-field-type.html'
    // 'af-array-field-type.import.less'
  ], 'client');
  api.addFiles([
    'af-array-field-type.js'
  ]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('lukemadera:af-array-field-type');
  api.addFiles('af-array-field-type-tests.js');
});
