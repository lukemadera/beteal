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
    },
    schemaNames: function() {
      //dynamically form input / schema names for this array index item
      var prefix =this.name+'.';
      var names ={
        tags: {
          name: prefix+'name',
          category: prefix+'category',
          status: prefix+'status',
          ratingSelfMin: prefix+'ratingSelfMin',
          ratingSelfMax: prefix+'ratingSelfMax',
          ratingOtherMin: prefix+'ratingOtherMin',
          ratingOtherMax: prefix+'ratingOtherMax',
        }
      };
      return names;
    }
  });
}