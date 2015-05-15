// orgsObj ={};

if(Meteor.isClient) {

  orgsObj.getMainTemplate =function(params) {
    var view =Blaze.currentView;
    if(view.name !=="Template.orgs") {
      //get parent template instance if not on correct one - http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
      while (view && view.name !=="Template.orgs") {
        view = view.parentView;
      }
    }
    return view.templateInstance();
  };

  orgsObj.getOrgs =function(query, params) {
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
  };

  orgsObj.formQuery =function(params) {
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
        else if(filters[ii].key ==='location') {
          var latLngBounds =orgsObj.computeBoundingLatLng(filters[ii].val.radius, filters[ii].val.location.lat, filters[ii].val.location.lng, {});
          query['locations.lat'] ={
            '$gte': latLngBounds.latMin,
            '$lte': latLngBounds.latMax
          };
          query['locations.lng'] ={
            '$gte': latLngBounds.lngMin,
            '$lte': latLngBounds.lngMax
          };
        }
      }
    }
    return query;
  };

  orgsObj.search =function(params) {
    var query =this.formQuery({});
    var orgs =this.getOrgs(query, {});
    var templateInst =this.getMainTemplate({});
    templateInst.orgs.set(orgs);
  };

  orgsObj.initFilters =function(params) {
    var filters =[
      {
        template: 'orgsFilterName',
        key: 'name',
        val: ''
      },
      {
        template: 'orgsFilterLocation',
        key: 'location',
        val: {
          location: {},
          radius: 0
        }
      }
    ];
    var ii;
    for(ii =0; ii<filters.length; ii++) {
      filters[ii].active =false;
      filters[ii].visible =false;
    }
    return filters;
  };

  orgsObj.setFilter =function(key, val, params) {
    var templateInst =this.getMainTemplate({});
    var filters =templateInst.filters.get();
    var index1 =nrArray.findArrayIndex(filters, 'key', key, {});
    filters[index1].val =val;
    filters[index1].active =true;
    filters[index1].visible =true;
    templateInst.filters.set(filters);
  };

  orgsObj.unsetFilter =function(key, params) {
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
  };

  orgsObj.toggleShowInactiveFilters =function(params) {
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
  };
}