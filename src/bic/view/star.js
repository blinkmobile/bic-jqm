define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');

  // local modules

  var StarView = Backbone.View.extend({
    events: {
      click: 'toggle'
    },

    initialize: function () {
      this.listenTo(this.model, 'change:state', this.render);
    },

    toggle: function (e) {
      e.preventDefault();
      this.model.toggle();
    },

    render: function () {
      if (this.model.get('state')) {
        this.$el.addClass('blink-star-on');
        this.$el.removeClass('blink-star-off');
      } else {
        this.$el.addClass('blink-star-off');
        this.$el.removeClass('blink-star-on');
      }
    }
  });

  return StarView;
});
