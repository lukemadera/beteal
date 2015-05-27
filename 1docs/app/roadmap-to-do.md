# Roadmap

- refactor (update schema?) for tags (and other nested arrays?) for organizations (and other similar collections - people?) to be an object instead of an array?
  - currently it's a mess of hacks to get autoform to work with afArrayField and we need to break the modifier db update query into $pull, $push, $set and manually re-form the query. Would be much cleaner (and better for performance) to be able to just update and remove by _id and then just add new ones too. Order doesn't matter and no manual (slow) searching through an array for the proper indices and having to hardcode in filters for category and status to avoid removing tags we don't want to..
  - files: `org-edit.js` and sub-files..