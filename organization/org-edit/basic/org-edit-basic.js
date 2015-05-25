if(Meteor.isClient) {
  Template.orgEditBasic.created =function() {
    orgEdit.created(this, 'orgEditBasic', {});
  };

  Template.orgEditBasic.rendered =function() {
    orgEdit.init(this, {});
  };

  Template.orgEditBasic.helpers({
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