if(Meteor.isClient) {
  Template.orgEditTags.created =function() {
    orgEdit.created(this, 'orgEditTags', {});
  };

  Template.orgEditTags.rendered =function() {
    orgEdit.init(this, {});
  };

  Template.orgEditTags.helpers({
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