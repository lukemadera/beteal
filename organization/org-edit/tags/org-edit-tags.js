if(Meteor.isClient) {
  Template.orgEditTags.created =function() {
    orgEdit.created(this, 'orgEditTags', {});
  };

  Template.orgEditTags.rendered =function() {
    orgEdit.init(this, 'orgEditTags', {});
  };

  Template.orgEditTags.helpers({
    organization: function() {
      return Template.instance().org.get();
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });
}