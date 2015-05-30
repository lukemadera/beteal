if(Meteor.isClient) {
  Template.orgEditMission.created =function() {
    orgEdit.created(this, 'orgEditMission', {});
  };

  Template.orgEditMission.rendered =function() {
    orgEdit.init(this, 'orgEditMission', {});
  };

  Template.orgEditMission.helpers({
    organization: function() {
      var org =Template.instance().org.get();
      org.tags =orgEdit.tagsFilterCategoryStatus(org.tags, 'mission', 'any', {});
      return org;
    },
    ids: function() {
      return Template.instance().ids.get();
    },
    optsTags: function() {
      return {
        category: 'mission',
        status: 'any'
      }
    }
  });
}