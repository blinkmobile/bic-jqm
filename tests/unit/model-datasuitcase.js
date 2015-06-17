define(['Squire'], function (Squire) {
  'use strict';
  describe('Model - DataSuitcase', function () {
    var Model, apiStub;

    before(function (done) {
      var injector = new Squire();

      apiStub = sinon.stub();
      apiStub.returns(Promise.resolve());

      injector.mock('bic/api-web', {
        getDataSuitcase: apiStub
      });

      injector.require(['bic/model-datasuitcase'], function (model) {
        Model = model;
        done();
      }, function () {
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe('idAttribute', function () {
      it('should be set to _id', function () {
        var model = new Model({_id: 'TestID'});
        model.idAttribute.should.be.string('_id');
      });

      it('should be picked up by the model', function () {
        var model = new Model({_id: 'TestID'});
        model.id.should.be.string('TestID');
      });
    });

    describe('#populate', function () {
      var model;

      beforeEach(function (done) {
        model = new Model({_id: 'TestID'});
        apiStub.reset();
        done();
      });

      it('should do nothing if offline');

      it('should request a Data Suitcase from the api', function (done) {
        model.populate();
        expect(apiStub.called).to.equal(true);
        done();
      });

      it('should use a default contentTime of 0');

      it('should pass through the contentTime of last update if available');

      it('should stop on a blank response');

      it('should persist the fetched Data Suitcase');
    });
  });
});
