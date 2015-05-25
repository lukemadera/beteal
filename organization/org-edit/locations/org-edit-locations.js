if(Meteor.isClient) {
  Template.orgEditLocations.created =function() {
    orgEdit.created(this, 'orgEditLocations', {});
  };

  Template.orgEditLocations.rendered =function() {
    orgEdit.init(this, {});
  };

  Template.orgEditLocations.helpers({
    organization: function() {
      return Template.instance().org.get();
    },
    afMethod: function() {
      return orgEdit.getAFMethod(Template.instance(), this, {});
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });
}