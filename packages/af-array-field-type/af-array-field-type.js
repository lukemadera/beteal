if(Meteor.isClient) {
  Template.afArrayField_type.helpers({
    typeIs: function(type) {
      return Template.instance().data.atts.type ===type;
    }
  });
}