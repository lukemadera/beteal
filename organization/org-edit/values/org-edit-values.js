if(Meteor.isClient) {
  Template.orgEditValues.created =function() {
    orgEdit.created(this, 'orgEditValues', {});
  };

  Template.orgEditValues.rendered =function() {
    orgEdit.init(this, 'orgEditValues', {});
  };

  Template.orgEditValues.helpers({
    organization: function() {
      var org =Template.instance().org.get();
      org.tags =orgEdit.tagsFilterCategoryStatus(org.tags, 'values', 'both', {});
      return org;
    },
    ids: function() {
      return Template.instance().ids.get();
    },
    optsTags: function() {
      return {
        category: 'values',
        status: 'both'
      }
    }
  });
}