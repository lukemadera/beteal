if(Meteor.isClient) {
  Template.orgEditSkillsSeeking.created =function() {
    orgEdit.created(this, 'orgEditSkillsSeeking', {});
  };

  Template.orgEditSkillsSeeking.rendered =function() {
    orgEdit.init(this, 'orgEditSkillsSeeking', {});
  };

  Template.orgEditSkillsSeeking.helpers({
    organization: function() {
      var org =Template.instance().org.get();
      org.tags =orgEdit.tagsFilterCategoryStatus(org.tags, 'skills', 'seeking', {});
      return org;
    },
    ids: function() {
      return Template.instance().ids.get();
    },
    optsTags: function() {
      return {
        category: 'skills',
        status: 'seeking'
      }
    }
  });
}