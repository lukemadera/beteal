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
      //@todo - strip out tags that are not values category / status
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