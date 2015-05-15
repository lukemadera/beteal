OrgsFiltersSchema = new SimpleSchema({
  name: {
    type: String
  },
  location: {
    type: AddressSchema
  },
  locationRadius: {
    type: Number
  }
});

if(Meteor.isServer) {
  Meteor.publish('organizations', function() {
    return OrganizationsCollection.find({}, {fields: {name:1, locations:1, links:1, purpose:1, tags:1} });
  });
}

if(Meteor.isClient) {
  
  Template.orgs.created =function() {
    var id1 ="orgs"+(Math.random() + 1).toString(36).substring(7);
    this.ids = new ReactiveVar({
      form: id1+"Form"
    });

    /**
    @param {Array} filters Filters to search by; Each is an object of:
      @param {String} template The template to render
      @param {String} key The key of this filter (e.g. 'name')
      @param {String} val The filter value (e.g. 'org name 1')
      @param {Boolean} active True if this filter is currently set / being used
      @param {Boolean} visible True to show (active filters will always be visible but this will allow showing / hiding inactie filters)
    */
    var filters =orgsObj.initFilters({});
    this.filters =new ReactiveVar(filters);
    this.showFiltersInactive =new ReactiveVar(false);

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
    'click .orgs-filters-search': function(evt, template) {
      orgsObj.search({});
    }
  });

  Template.orgsFilterName.events({
    'blur .orgs-filter-name-input': function(evt, template) {
      var val =evt.target.value;
      if(val) {
        orgsObj.setFilter('name', evt.target.value, {});
      }
      else {
        orgsObj.unsetFilter('name', {}); 
      }
    }
  });

  Template.orgsFilterLocation.events({
    'click .orgs-filter-location-btn': function(evt, template) {
      // var valLoc =template.find('.orgs-filter-location-input').
      var valLoc =AutoForm.getFieldValue('location');
      var valRadius =AutoForm.getFieldValue('locationRadius');
      console.log(valLoc, valRadius);
      if(valLoc && valRadius) {
        var val ={
          location: valLoc,
          radius: valRadius
        };
        orgsObj.setFilter('location', val, {});
      }
      else {
        orgsObj.unsetFilter('location', {}); 
      }
    }
  });
}