define(
  ['model-datasuitcase', 'feature!data'],
  function (DataSuitcase, Data) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      initialize: function () {
        var collection = this;
        collection.initialize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-DataSuitcase');
        collection.fetch({
          success: function () {
            collection.initialize.resolve();
          },
          error: function () {
            collection.initialize.reject();
          }
        });
      }
    });
    return DataSuitcaseCollection;
  }
);