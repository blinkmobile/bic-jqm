define(
  [],
  function () {
    "use strict";

    var Data = function () {
      this.data = {};
    };

    _.extend(Data.prototype, {
      create: function () {
        return new $.Deferred().reject().promise();
      },

      update: function () {
        return new $.Deferred().reject().promise();
      },

      read: function () {
        return new $.Deferred().reject().promise();
      },

      readAll: function () {
        return new $.Deferred().reject().promise();
      },

      delete: function () {
        return new $.Deferred().reject().promise();
      }
    });

    return Data;
  }
);