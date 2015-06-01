define(
  ['api'],
  function (API) {
    'use strict';
    var FormRecord = Backbone.Model.extend({
      idAttribute: '_id',

      populate: function (action, callback) {
        var model = this;
        API.getFormRecord(model.get('formName'), action, model.get('id')).then(
          function (data) {
            var nodes, node, record;

            record = {};
            nodes = data.evaluate('//' + model.get('formName'), data);
            node = nodes.iterateNext();

            _.each(node.children, function (key) {
              record[key.nodeName] = key.innerHTML;
            });

            model.set({
              record: record,
              contentTime: Date.now()
            });

            model.save({}, {
              success: callback,
              error: callback
            });
          }
        );
      }
    });

    return FormRecord;
  }
);
