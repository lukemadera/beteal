if(Meteor.isClient) {
  Template.orgEditBasic.created =function() {
    orgEdit.created(this, 'orgEditBasic', {});
  };

  Template.orgEditBasic.rendered =function() {
    orgEdit.init(this, 'orgEditBasic', {});
  };

  Template.orgEditBasic.helpers({
    organization: function() {
      return Template.instance().org.get();
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });
}