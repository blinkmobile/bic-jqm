define(['Squire'], function (Squire) {
  'use strict';
  describe('Model - Interaction', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('api', function () { return null; });

      /*eslint-disable no-console*/ // just for testing
      injector.mock('facade', {
        publish: function () { console.log('#publish'); },
        subscribe: function () { console.log('#subscribe'); }
      });
      /*eslint-enable no-console*/

      injector.require(['../src/model-interaction'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe('inherit(config)', function () {
      it('should set the parent of this item for the inheritance chain');
    });

    describe('performXSLT()', function () {
      it('should substitute $args[] in the XSL template');

      it('should substitute blink-stars statements in the XSL template');

      it('should do the transformation and save the result to the model as content');

      it('should throw appropriate errors if the data is malformed');
    });

    describe('prepareView(data)', function () {
      it('should detect if you are on the home screen and load in homeInteraction');

      it('should detect if you are on the home screen and generate a list of items');

      it('should detect if you are on a MADL interaction and fetch result from server');

      it('should save the MADL result for offline access');

      it('should detect if you are on a Stars XSLT interaction and prepare the XML');

      it('should return a promise');
    });
  });
});
