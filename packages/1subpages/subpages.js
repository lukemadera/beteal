lmSubpages ={};
var lmSubpagesPrivate ={};

lmSubpagesPrivate.init =function(templateInst, params) {
  var self =this;
  //only do ONCE and do not do until pages is set!
  if(!templateInst.inited && templateInst.data.pages && templateInst.data.pages.length) {
    if(templateInst.data.opts ===undefined) {
      templateInst.data.opts ={};
    }
    var opts =templateInst.data.opts;

    templateInst.inited =true;
    //push a contents template to the front
    var pages =templateInst.data.pages;
    
    var ii;
    if(opts.contents ===undefined || opts.contents) {
      var contentsPages =[];
      for(ii =0; ii<pages.length; ii++) {
        if(pages[ii].title !=="Contents") {
          contentsPages.push({
            title: pages[ii].title,
            template: pages[ii].template,
            pageIndex: (ii+1)   //+1 since will be adding contents to front
          });
        }
      }
      pages.unshift({
        title: "Contents",
        template: "lmSubpagesContents",
        // pageIndex: 0,
        atts: {
          pages: contentsPages
        }
      });
    }

    for(ii =0; ii<pages.length; ii++) {
      pages[ii].pageIndex =(ii);
      if(pages[ii].atts ===undefined) {
        pages[ii].atts ={};
      }
    }

    templateInst.data.pages =pages;

    var curIndex =0;
    var page1 =pages[curIndex];
    templateInst.curPage.set(page1);
  }
  else {
    //pages not set first time yet when called from rendered.. timing issue?
    setTimeout(function() {
      self.init(templateInst, params);
    }, 500);
  }
};

lmSubpagesPrivate.getMainTemplate =function(params) {
  var view =Blaze.currentView;
  if(view.name !=="Template.lmSubpages") {
    //get parent template instance if not on correct one - http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
    while (view && view.name !=="Template.lmSubpages") {
      view = view.parentView;
    }
  }
  return view.templateInstance();
};

lmSubpages.nav =function(templateInst, direction, params) {
  var curPageIndex =templateInst.curPage.get().pageIndex;
  var pages =templateInst.data.pages;
  var valid =false;
  if(direction ==='prev' && curPageIndex >0) {
    valid =true;
    curPageIndex--;
  }
  else if(direction ==='next' && curPageIndex <(pages.length-1)) {
    valid =true;
    curPageIndex++;
  }

  if(valid) {
    this.goToPage(templateInst, curPageIndex, {});
  }
};

lmSubpages.goToPage =function(templateInst, pageIndex, params) {
  templateInst.curPage.set(templateInst.data.pages[pageIndex]);
};

Template.lmSubpages.created =function() {
  this.curPage =new ReactiveVar(false);
  this.inited =false;
};

Template.lmSubpages.rendered =function() {
  lmSubpagesPrivate.init(this, {});
};

Template.lmSubpages.helpers({
  curPage: function() {
    return Template.instance().curPage.get();
  },
  hasPrevNextPage: function() {
    var ret ={
      prev: true,
      next: true
    };
    var curPage =Template.instance().curPage.get();
    var pages =Template.instance().data.pages;
    if(curPage.pageIndex ===0) {
      ret.prev =false;
    }
    if(curPage.pageIndex >=(pages.length-1)) {
      ret.next =false;
    }
    return ret;
  }
});

Template.lmSubpages.events({
  'click .lm-subpages-prev': function(evt, template) {
    lmSubpages.nav(template, 'prev', {});
  },
  'click .lm-subpages-next': function(evt, template) {
    lmSubpages.nav(template, 'next', {});
  },
  'click .lm-subpages-header-title': function(evt, template) {
    lmSubpages.goToPage(template, 0, {});
  }
});

Template.lmSubpagesContents.events({
  'click .lm-subpages-contents-page': function(evt, template) {
    var templateInst =lmSubpagesPrivate.getMainTemplate();
    lmSubpages.goToPage(templateInst, this.pageIndex, {});
  }
});