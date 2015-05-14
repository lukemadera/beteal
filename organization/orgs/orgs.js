OrgsFiltersSchema = new SimpleSchema({
  name: {
    type: String
  }
});

if(Meteor.isServer) {
  Meteor.publish('organizations', function() {
    return OrganizationsCollection.find({}, {fields: {name:1, locations:1, links:1, purpose:1, tags:1} });
  });
}

if(Meteor.isClient) {

  var orgsObj ={
    getMainTemplate: function(params) {
      var view =Blaze.currentView;
      if(view.name !=="Template.orgs") {
        //get parent template instance if not on correct one - http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
        while (view && view.name !=="Template.orgs") {
          view = view.parentView;
        }
      }
      return view.templateInstance();
    },

    getOrgs: function(query, params) {
      var templateInst =this.getMainTemplate({});
      var orgs =OrganizationsCollection.find(query).fetch();
      var ii;
      for(ii =0; ii<orgs.length; ii++) {
        orgs[ii].xDisplay ={
          location: orgs[ii].locations[0]
        };
      }
      console.log('query: ', query, 'orgs: ', orgs);
      return orgs;
    },

    formQuery: function(params) {
      var query ={};
      var templateInst =this.getMainTemplate({});
      var filters =templateInst.filters.get();
      var ii;
      for(ii =0; ii<filters.length; ii++) {
        if(filters[ii].active) {
          if(filters[ii].key ==='name') {
            query.name ={
              $regex: filters[ii].val,
              $options: 'i'
            }
          }
        }
      }
      return query;
    },

    search: function(params) {
      var query =this.formQuery({});
      var orgs =this.getOrgs(query, {});
      var templateInst =this.getMainTemplate({});
      templateInst.orgs.set(orgs);
    },

    initFilters: function(params) {
      var filters =[
        {
          template: 'orgsFilterName',
          key: 'name',
          val: ''
        }
      ];
      var ii;
      for(ii =0; ii<filters.length; ii++) {
        filters[ii].active =false;
        filters[ii].visible =false;
      }
      return filters;
    },

    setFilter: function(key, val, params) {
      var templateInst =this.getMainTemplate({});
      var filters =templateInst.filters.get();
      var index1 =nrArray.findArrayIndex(filters, 'key', key, {});
      filters[index1].val =val;
      filters[index1].active =true;
      filters[index1].visible =true;
      templateInst.filters.set(filters);
    },

    unsetFilter: function(key, params) {
      var templateInst =this.getMainTemplate({});
      var filters =templateInst.filters.get();
      var index1 =nrArray.findArrayIndex(filters, 'key', key, {});
      // filters[index1].val ='';
      filters[index1].active =false;
      var showFiltersInactive =templateInst.showFiltersInactive.get();
      if(!showFiltersInactive) {
        filters[index1].visible =false;
      }
      templateInst.filters.set(filters);
    },

    toggleShowInactiveFilters: function(params) {
      var templateInst =this.getMainTemplate({});
      var visible =templateInst.showFiltersInactive.get();
      visible =!visible;

      var filters =templateInst.filters.get();
      var ii;
      for(ii =0; ii<filters.length; ii++) {
        if(!filters[ii].active) {
          filters[ii].visible =visible;
        }
      }

      templateInst.filters.set(filters);
      templateInst.showFiltersInactive.set(visible);
    }
  };

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
}