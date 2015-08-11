if(Meteor.isClient) {
  Template.orgEditJobs.created =function() {
    orgEdit.created(this, 'orgEditJobs', {});
  };

  Template.orgEditJobs.rendered =function() {
    orgEdit.init(this, 'orgEditJobs', {});
  };

  Template.orgEditJobs.helpers({
    organization: function() {
      var org =Template.instance().org.get();
      return org;
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });
}