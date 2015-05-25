if(Meteor.isClient) {
  Template.orgEditLocations.created =function() {
    orgEdit.created(this, 'orgEditLocations', {});
  };

  Template.orgEditLocations.rendered =function() {
    orgEdit.init(this, 'orgEditLocations', {});
  };

  Template.orgEditLocations.helpers({
    organization: function() {
      return Template.instance().org.get();
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });
}