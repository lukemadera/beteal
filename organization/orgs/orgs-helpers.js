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

  orgsObj.initForm =function(formId, params) {
    AutoForm.addHooks(formId, {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;

        //without this, it submits the form..
        self.event.preventDefault();
        self.event.stopPropagation();

        if(insertDoc.name !==undefined) {
          orgsObj.setFilter('name', insertDoc.name, {});
        }
        else {
          orgsObj.unsetFilter('name', {}); 
        }

        if(insertDoc.location && insertDoc.locationRadius) {
          var val ={
            location: insertDoc.location,
            radius: insertDoc.locationRadius
          };
          orgsObj.setFilter('location', val, {});
        }
        else {
          orgsObj.unsetFilter('location', {}); 
        }

        orgsObj.search({});
        //hide inactive filters
        orgsObj.toggleShowInactiveFilters({action:'hide'});

        self.done();

        return false;
      }
    }, true);
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
    console.log('query: ', query, 'orgs length: ', orgs.length);
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

  /**
  @param {Object} params
    @param {String} [action] 'show' to force show inactive filters, 'hide' to force hide them
  */
  orgsObj.toggleShowInactiveFilters =function(params) {
    var templateInst =this.getMainTemplate({});
    var showFiltersInactive =templateInst.showFiltersInactive.get();
    showFiltersInactive.visible =!showFiltersInactive.visible;
    if(params.action !==undefined) {
      if(params.action ==='show') {
        showFiltersInactive.visible =true;
      }
      else if(params.action ==='hide') {
        showFiltersInactive.visible =false;
      }
    }
    var classVisibility ='hidden';
    if(showFiltersInactive.visible) {
      classVisibility ='visible';
      showFiltersInactive.html ='Hide inactive filters';
    }
    else {
      showFiltersInactive.html ='Show more filters';
    }

    var filters =templateInst.filters.get();
    var ii;
    for(ii =0; ii<filters.length; ii++) {
      //check if need to init
      if(filters[ii].active ===undefined) {
        filters[ii].active =false;
        filters[ii].classes ={
          visibility: 'hidden'
        };
      }
      if(!filters[ii].active) {
        filters[ii].classes.visibility =classVisibility;
      }
    }

    templateInst.filters.set(filters);
    templateInst.showFiltersInactive.set(showFiltersInactive);
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

    //other properties will be init'ed in toggleShowInactiveFilters init call
    
    return filters;
  };

  orgsObj.setFilter =function(key, val, params) {
    var templateInst =this.getMainTemplate({});
    var filters =templateInst.filters.get();
    var index1 =nrArray.findArrayIndex(filters, 'key', key, {});
    filters[index1].val =val;
    filters[index1].active =true;
    filters[index1].classes.visibility ='visible';
    templateInst.filters.set(filters);
  };

  orgsObj.unsetFilter =function(key, params) {
    var templateInst =this.getMainTemplate({});
    var filters =templateInst.filters.get();
    var showFiltersInactive =templateInst.showFiltersInactive.get();
    var index1 =nrArray.findArrayIndex(filters, 'key', key, {});
    filters =this.unsetOneFilter(index1, filters, showFiltersInactive, {});
    templateInst.filters.set(filters);
  };

  orgsObj.unsetOneFilter =function(filterIndex, filters, showFiltersInactive, params) {
    // filters[filterIndex].val ='';
    filters[filterIndex].active =false;
    if(!showFiltersInactive.visible) {
      filters[filterIndex].classes.visibility ='hidden';
    }
    return filters;
  };

  orgsObj.unsetAllFilters =function(params) {
    var templateInst =this.getMainTemplate({});
    var filters =templateInst.filters.get();
    var showFiltersInactive =templateInst.showFiltersInactive.get();
    var ii;
    for(ii =0; ii <filters.length; ii++) {
      filters =this.unsetOneFilter(ii, filters, showFiltersInactive, {});
    }
    templateInst.filters.set(filters);

    //clear html fields / inputs
    var selectors =['.orgs-filter-name-input', '.orgs-filter-location-radius-input', '.orgs-filter-location-input'];    //hardcoded must match html classes
    var ele;
    for(ii =0; ii<selectors.length; ii++) {
      ele =templateInst.find(selectors[ii]);
      ele.value ='';
    }
  };
}