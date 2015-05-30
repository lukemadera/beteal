// orgsObj ={};

if(Meteor.isClient) {

  /**
  Used to link autocomplete opts.instid to templateInst to be able to go back and forth (for autocomplete API calls / callback function that pass back the instance id and need to use that to get the proper template)
  @example
  orgsPrivate.inst ={
    'inst1': {
      templateInst: templateInst1
    },
    'inst2': {
      templateInst: templateInst2
    }
  };
  */
  orgsObj.inst ={};

  orgsObj.destroy =function(templateInst, params) {
    //remove instid id key
    var xx;
    for(xx in orgsObj.inst) {
      if(orgsObj.inst[xx].templateInst ===templateInst) {
        delete orgObj.inst[xx];
        break;
      }
    }
  };

  orgsObj.getTagPredictions =function(name, params) {
    var ret ={predictions:[]};
    var query ={
      name: {
        $regex: '^'+name,
        $options: 'i'
      }
    };
    var predictions1 =TagsCollection.find(query, {fields: {_id:1, name:1}}).fetch();
    ret.predictions =predictions1.map(function(obj) {
      return {
        value: obj._id,
        name: obj.name
      }
    });
    return ret;
  };

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

  orgsObj.updateFilters =function(doc, params) {
    var ret ={
      locSet: false
    };

    var val;
    var ii;

    if(doc.name !==undefined) {
      orgsObj.setFilter('name', doc.name, {});
    }
    else {
      orgsObj.unsetFilter('name', {}); 
    }

    if(doc.location && doc.locationRadius || doc.locationRemote) {
      ret.locSet =true;
      val ={
        remote: doc.locationRemote
      };
      if(doc.location && doc.locationRadius) {
        val.location =doc.location;
        val.radius =doc.locationRadius;
      }
      orgsObj.setFilter('location', val, {});
    }
    else {
      orgsObj.unsetFilter('location', {}); 
    }

    if(doc.sizeMin !==undefined || doc.sizeMax !==undefined) {
      var val ={
      };
      if(doc.sizeMin !==undefined) {
        val.min =doc.sizeMin;
      }
      if(doc.sizeMax !==undefined) {
        val.max =doc.sizeMax;
      }
      orgsObj.setFilter('size', val, {});
    }
    else {
      orgsObj.unsetFilter('size', {}); 
    }

    if(doc.visitsMin !==undefined || doc.visitsMax !==undefined) {
      var val ={
      };
      if(doc.visitsMin !==undefined) {
        val.min =doc.visitsMin;
      }
      if(doc.visitsMax !==undefined) {
        val.max =doc.visitsMax;
      }
      orgsObj.setFilter('visits', val, {});
    }
    else {
      orgsObj.unsetFilter('visits', {}); 
    }

    if(doc.tags !==undefined && doc.tags.length) {
      var val =[];
      var atLeastOne =false;
      var curTag ={};
      var tt;
      for(ii =0; ii<doc.tags.length; ii++) {
        if(doc.tags[ii].name !==undefined && doc.tags[ii].name.length) {
          atLeastOne =true;
          //convert tag names objects to tag id
          curTag =doc.tags[ii];
          curTag.tagId =[];
          for(tt =0; tt<curTag.name.length; tt++) {
            curTag.tagId.push(curTag.name[tt].value);
          }
          delete curTag.name;
          val.push(curTag);
        }
      }
      if(atLeastOne) {
        orgsObj.setFilter('tags', val, {});
      }
      else {
        orgsObj.unsetFilter('tags', {});
      }
    }
    else {
      orgsObj.unsetFilter('tags', {});
    }

    return ret;
  };

  orgsObj.initForm =function(formId, params) {
    AutoForm.setDefaultTemplateForType('afArrayField', 'type');

    AutoForm.addHooks(formId, {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;

        console.log(insertDoc, updateDoc, currentDoc);

        //without this, it submits the form..
        self.event.preventDefault();
        self.event.stopPropagation();

        var retFilters =orgsObj.updateFilters(insertDoc, {});

        orgsObj.search({});
        //hide inactive filters
        orgsObj.toggleShowInactiveFilters({action:'hide'});

        //hack to re-select location otherwise it is blank next time around.. autoform and/or googleplace bug??   //@todo - fix this properly and remove hack
        if(retFilters.locSet) {
          var templateInst =orgsObj.getMainTemplate({});
          ele =templateInst.find('.orgs-filter-location-input');
          // ele.click();   //not working
          // ele.focus();   //not necessary apparently, which is good
          var eleDropdown =$(ele).next();
          var eleVal =eleDropdown.find('div:nth-child(1)');
          eleVal.click();
        }

        self.done();

        return false;
      }
    }, true);
  };

  orgsObj.formatLocations =function(locations, params) {
    var locFormatted ="";
    if(locations !==undefined && locations.length) {
      var ii;
      for(ii =0; ii<locations.length; ii++) {
        if(ii >0) {
          locFormatted +=" | ";
        }
        if(locations[ii].state !==undefined) {
          locFormatted +=locations[ii].city+", "+locations[ii].state+", "+locations[ii].country;
        }
        else {
          locFormatted +=locations[ii].city+", "+locations[ii].country;
        }
      }
    }
    return locFormatted;
  };

  orgsObj.getOrgs =function(query, params) {
    var templateInst =this.getMainTemplate({});
    var orgs =OrganizationsCollection.find(query).fetch();
    var ii;
    for(ii =0; ii<orgs.length; ii++) {
      orgs[ii].xDisplay ={
        locationFormatted: '',
        links: ''
      };
      orgs[ii].xDisplay.locationFormatted =orgsObj.formatLocations(orgs[ii].locations, {});
      if(orgs[ii].links !==undefined && orgs[ii].links.length) {
        orgs[ii].xDisplay.links =orgs[ii].links[0].url;
      }
    }
    console.log('query: ', query, 'orgs length: ', orgs.length);
    return orgs;
  };

  orgsObj.formQuery =function(params) {
    var query ={
      //joining all with and. While mongo db implicity does this, must explicitly use $and if want to use multiple of the same field (which we are with 'tags')
      '$and': []
    };
    var templateInst =this.getMainTemplate({});
    var filters =templateInst.filters.get();
    var ii, tt, queryTemp, queryNotEmpty;
    for(ii =0; ii<filters.length; ii++) {
      if(filters[ii].active) {
        if(filters[ii].key ==='name') {
          queryTemp ={
            '$or': []
          };
          var regex ={
            $regex: filters[ii].val,
            $options: 'i'
          };
          queryTemp['$or'].push({
            name: regex
          });
          queryTemp['$or'].push({
            'links.url': regex
          });
          query['$and'].push(queryTemp);
        }
        else if(filters[ii].key ==='location') {
          queryTemp ={};
          queryNotEmpty =false;
          var locRemote =filters[ii].val.remote;
          if(locRemote ==='remoteOnly') {
            queryTemp.locations ={
              '$exists': false
            };
            queryNotEmpty =true;
          }
          else {
            var queryLat =false, queryLng =false;
            if(filters[ii].val.radius && filters[ii].val.location) {
              var latLngBounds =orgsObj.computeBoundingLatLng(filters[ii].val.radius, filters[ii].val.location.lat, filters[ii].val.location.lng, {});
              queryLat ={
                '$gte': latLngBounds.latMin,
                '$lte': latLngBounds.latMax
              };
              queryLng ={
                '$gte': latLngBounds.lngMin,
                '$lte': latLngBounds.lngMax
              };
            }

            //hide remote
            if(locRemote ==='hide') {
              if(queryLat && queryLng) {
                queryTemp['locations.lat'] =queryLat;
                queryTemp['locations.lng'] =queryLng;
              }
              else {
                queryTemp.locations ={
                  '$exists': true
                };
              }
              queryNotEmpty =true;
            }
            //show remote
            else {

              if(queryLat && queryLng) {
                if(queryTemp['$or'] ===undefined) {
                  queryTemp['$or'] =[];
                }
                queryTemp['$or'].push(
                  {
                    'locations.lat': queryLat,
                    'locations.lng': queryLng
                  }
                );
                queryTemp['$or'].push(
                  {
                    'locations': {
                      '$exists': false
                    }
                  }
                );
                queryNotEmpty =true;
              }

            }
          }
          if(queryNotEmpty) {
            query['$and'].push(queryTemp);
          }
        }
        else if(filters[ii].key ==='size') {
          queryTemp ={};
          queryNotEmpty =false;
          queryTemp.size ={};
          if(filters[ii].val.min !==undefined) {
            queryTemp.size['$gte'] =filters[ii].val.min;
            queryNotEmpty =true;
          }
          if(filters[ii].val.max !==undefined) {
            queryTemp.size['$lte'] =filters[ii].val.max;
            queryNotEmpty =true;
          }
          if(queryNotEmpty) {
            query['$and'].push(queryTemp);
          }
        }
        else if(filters[ii].key ==='visits') {
          queryTemp ={};
          queryNotEmpty =false;
          queryTemp.visits ={};
          if(filters[ii].val.min !==undefined) {
            queryTemp.visits['$gte'] =filters[ii].val.min;
            queryNotEmpty =true;
          }
          if(filters[ii].val.max !==undefined) {
            queryTemp.visits['$lte'] =filters[ii].val.max;
            queryNotEmpty =true;
          }
          if(queryNotEmpty) {
            query['$and'].push(queryTemp);
          }
        }
        else if(filters[ii].key ==='tags') {
          /*
          db.organizations.find({'$and': [ {'tags': {'$elemMatch': {tagId: { $in: ['umFWWE6qbHfvprwfA'] }, category: { $in: ['skills'] } } } }, { 'tags': { '$elemMatch': { tagId: 'B3dKzeNDxJdHw3Ykd' } } }, { name: 'insert5 edit' } ] },{tags:1, name:1}).pretty();
          
          //works even without the (outer) $and, even though mongoDB docs say it should not? Though note it only returns ONE for elemMatch (though that's not a big deal in this case so is fine?)
          db.organizations.find( { 'tags': { '$elemMatch': { tagId: { $in: ['umFWWE6qbHfvprwfA', 'B3dKzeNDxJdHw3Ykd'] },  category: { $in: ['skills'] } } } }, { 'tags': { '$elemMatch': { tagId: 'B3dKzeNDxJdHw3Ykd' } } }, { name: 'insert5 edit' } ,{tags:1, name:1}).pretty();
          */
          var tags =filters[ii].val;
          var elemMatch, tag1;
          for(tt =0; tt<tags.length; tt++) {
              elemMatch ={};    //reset
              tag1 =tags[tt];
              elemMatch.tagId ={
                '$in': tag1.tagId
              };
              if(tag1.category !==undefined) {
                elemMatch.category ={
                  '$in': tag1.category
                };
              }
              if(tag1.status !==undefined && tag1.status && tag1.status !=='any') {
                elemMatch.status =tag1.status;
              }
              if(tag1.ratingSelfMin !==undefined || tag1.ratingSelfMax !==undefined) {
                elemMatch.rating ={};
                if(tag1.ratingSelfMin !==undefined) {
                  elemMatch.rating['$gte'] =tag1.ratingSelfMin;
                }
                if(tag1.ratingSelfMax !==undefined) {
                  elemMatch.rating['$lte'] =tag1.ratingSelfMax;
                }
              }
              if(tag1.ratingOtherMin !==undefined || tag1.ratingOtherMax !==undefined) {
                elemMatch.ratingOther ={};
                if(tag1.ratingOtherMin !==undefined) {
                  elemMatch.ratingOther['$gte'] =tag1.ratingOtherMin;
                }
                if(tag1.ratingOtherMax !==undefined) {
                  elemMatch.ratingOther['$lte'] =tag1.ratingOtherMax;
                }
              }
              queryTemp ={
                tags: {
                  '$elemMatch': elemMatch
                }
              };
              query['$and'].push(queryTemp);
          }
        }
      }
    }
    if(!query['$and'].length) {
      query ={};
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
          radius: 0,
          remote: ''
        }
      },
      {
        template: 'orgsFilterSize',
        key: 'size',
        val: {
          min: '',
          max: ''
        }
      },
      {
        template: 'orgsFilterVisits',
        key: 'visits',
        val: {
          min: '',
          max: ''
        }
      },
      {
        template: 'orgsFilterTags',
        key: 'tags',
        val: {
          tags: [],
          category: [],
          status: '',
          ratingSelfMin: '',
          ratingSelfMax: '',
          ratingOtherMin: '',
          ratingOtherMax: ''
        }
      },
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
    var formId =templateInst.ids.get().form;
    AutoForm.resetForm(formId, templateInst);
    //clear out tags as well
    var optsAutocomplete =templateInst.optsAutocomplete.get();
    lmAfAutocomplete.removeAllVals({optsInstid:optsAutocomplete.instid});

    // var selectors =['.orgs-filter-name-input', '.orgs-filter-location-radius-input', '.orgs-filter-location-input', '.orgs-filter-location-remote-input', '.orgs-filter-size-min-input', '.orgs-filter-size-max-input', '.orgs-filter-visits-min-input', '.orgs-filter-visits-max-input'];    //hardcoded must match html classes
    // var ele;
    // for(ii =0; ii<selectors.length; ii++) {
    //   ele =templateInst.find(selectors[ii]);
    //   ele.value ='';
    // }
  };
}