OrgsFiltersTagSchema =new SimpleSchema({
  tagNames: {
    type: [Object],
    blackbox: true,
    optional: true
  },
  // tagCategory: {
  //   type: Array,
  //   optional: true
  // },
  tagRatingSelfMin: {
    type: Number,
    optional: true
  },
  tagRatingSelfMax: {
    type: Number,
    optional: true
  },
  tagRatingOtherMin: {
    type: Number,
    optional: true
  },
  tagRatingOtherMax: {
    type: Number,
    optional: true
  }
});

OrgsFiltersSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  location: {
    type: AddressSchema,
    optional: true
  },
  locationRadius: {
    type: Number,
    optional: true
  },
  locationRemote: {
    type: String,
    optional: true
  },
  sizeMin: {
    type: Number,
    optional: true
  },
  sizeMax: {
    type: Number,
    optional: true
  },
  visitsMin: {
    type: Number,
    optional: true
  },
  visitsMax: {
    type: Number,
    optional: true
  },
  tags: {
    type: [OrgsFiltersTagSchema],
    optional: true
  }
});

if(Meteor.isServer) {
  Meteor.publish('organizations', function() {
    return OrganizationsCollection.find({}, {fields: {name:1, locations:1, links:1, purpose:1, tags:1, size:1, visits:1} });
  });
}

if(Meteor.isClient) {
  
  Template.orgs.created =function() {
    var id1 ="orgs"+(Math.random() + 1).toString(36).substring(7);
    var ids ={
      form: id1+"Form"
    };
    this.ids = new ReactiveVar(ids);

    orgsObj.initForm(ids.form, {});

    /**
    @param {Array} filters Filters to search by; Each is an object of:
      @param {String} template The template to render
      @param {String} key The key of this filter (e.g. 'name')
      @param {String} val The filter value (e.g. 'org name 1')
      @param {Boolean} active True if this filter is currently set / being used
      @param {Object} classes
        @param {String} visibility One of 'hidden', 'visible'
    */
    var filters =orgsObj.initFilters({});
    this.filters =new ReactiveVar(filters);

    //important to do this AFTER filters are init'ed
    this.showFiltersInactive =new ReactiveVar({});
    //init
    orgsObj.toggleShowInactiveFilters({action:'show'});

    orgs =orgsObj.getOrgs({}, {});
    this.orgs =new ReactiveVar(orgs);
  };

  Template.orgs.helpers({
    orgs: function() {
      var orgs =Template.instance().orgs.get();
      var hasOrgs =false;
      if(orgs.length >0) {
        hasOrgs =true;
      }
      return {
        orgs: orgs,
        hasOrgs: hasOrgs
      };
    },
    ids: function() {
      return Template.instance().ids.get();
    },
    filters: function() {
      return Template.instance().filters.get();
    },
    showFiltersInactive: function() {
      return Template.instance().showFiltersInactive.get();
    }
  });

  Template.orgs.events({
    'click .orgs-filters-show-inactive': function(evt, template) {
      orgsObj.toggleShowInactiveFilters({});
    },
    'click .orgs-filters-clear-all': function(evt, template) {
      orgsObj.unsetAllFilters({});
      orgsObj.toggleShowInactiveFilters({action:'show'});
    }
  });

  Template.orgsFilterLocation.helpers({
    optsLocationRemote: function() {
      var ret ={
        opts: [
          {
            value: 'show',
            label: 'Yes'
          },
          {
            value: 'hide',
            label: 'No'
          },
          {
            value: 'remoteOnly',
            label: 'Show remote ONLY'
          }
        ],
        defaultVal: 'show'
      }
      return ret;
    }
  });

  Template.orgsFilterTag.helpers({
    optsTagCategory: function() {
      var ret ={
        opts: [
          {
            value: 'values',
            label: 'Values'
          },
          {
            value: 'mission',
            label: 'Mission'
          },
          {
            value: 'skills',
            label: 'Skills'
          }
        ]
      }
      return ret;
    },
    optsTagStatus: function() {
      var ret ={
        opts: [
          {
            value: 'have',
            label: 'Have'
          },
          {
            value: 'seeking',
            label: 'Seeking'
          }
        ]
      }
      return ret;
    }
  });
}