if(Meteor.isClient) {
  Template.afArrayField_type.helpers({
    typeIs: function(type) {
      var ret =false;
      if(Template.instance().data.atts.type ===undefined || !Template.instance().data.atts.type) {
        if(type ===undefined || !type) {
          ret =true;
        }
      }
      else {
        ret =Template.instance().data.atts.type ===type;
      }
      return ret;
    }
  });
}