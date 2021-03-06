define([
  'Squire', 'backbone', 'bic/enum-model-status', 'sinon', 'chai', 'underscore'
], function (Squire, Backbone, MODEL_STATUS, sinon, chai, _) {
  'use strict';

  var CONTEXT = 'tests/unit/view/form/controls.js';
  var should = chai.should();

  describe('View - Form Controls ', function () {
    var injector, View, apiStub;
    var mockApp;
    var mockAPI;
    var Forms;
    var pageid = 0;
    var pageObject = {
      length: 4,
      current: {
        'index': function () { return pageid; }
      },
      'goto': function (num) {
        pageid = num;
      }
    };

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      Forms = {
        current: new Backbone.Model({
          pages: pageObject,
          _view: { goToElement: function () {} }
        })
      };
      _.extend(Forms.current, {
        data: function () { return; },
        getInvalidElements: function () { return; }
      });
      injector.mock('bic/promise-forms', function () {
        return Promise.resolve(Forms);
      });

      apiStub = sinon.stub(Forms.current, 'data');
      apiStub.onCall(0).returns(
        Promise.resolve({
          'text_box': '123456789',
          'number': 90,
          '_action': 'add',
          'subform': []
        })
      );
      apiStub.onCall(1).returns(
        Promise.resolve({
          'text_box': 'Devyani',
          'number': 99,
          '_action': 'add',
          'subform': []
        })
      );
      apiStub.onCall(2).returns(
        Promise.resolve({
          'text_box': 'Anandita',
          'number': 109,
          '_action': 'add',
          'subform': []
        })
      );
      apiStub.returns(
        Promise.resolve({
          'text_box': '123456789',
          'number': 90,
          '_action': 'add',
          'subform': []
        })
      );
      mockApp = new Backbone.Model();
      mockApp.attributes.currentForm = Forms.current;

      mockAPI = {
        setPendingItem: function () {}
      };

      injector.mock('bic/model/application', mockApp);
      injector.mock('bic/model/pending', Backbone.Model);
      injector.mock('text!bic/template/form/controls.mustache', 'string');
      injector.mock('bic/api', mockAPI);
      injector.mock('bic/lib/ui-tools', {
        disableElement: function () {},
        enableElement: function () {},
        hideLoadingAnimation: function () {},
        showLoadingAnimation: function () {}
      });
      injector.require(['bic/view/form/controls'], function (required) {
        View = required;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('pages collection', function () {
      var gotoSpy;
      var indexSpy;
      var view;

      beforeEach(function (done) {
        //setup spys
        indexSpy = sinon.spy(pageObject.current, 'index');
        gotoSpy = sinon.spy(pageObject, 'goto');

        injector.require(['bic/model/application'], function (app) {
          view = new View({ model: app });
          done();
        });
      });

      afterEach(function () {
        //remove spy
        pageObject.current.index.restore();
        pageObject.goto.restore();
      });

      it('nextFormPage', function () {
        //move to next page
        view.nextFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, 1);
      });

      it('firstFormPage', function () {
        //move to first page
        view.firstFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, 0);

        //should not re-render the page because already on first page
        view.firstFormPage();
        assert.equal(indexSpy.callCount, 2);
        assert.equal(gotoSpy.callCount, 1);
      });

      it('lastFormPage', function () {
        //move to last page
        view.lastFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, pageObject.length - 1);

        //should not re-render the page because already on last page
        view.lastFormPage();
        assert.equal(indexSpy.callCount, 2);
        assert.equal(gotoSpy.callCount, 1);
      });

      it('previousFormPage', function () {
        //move to second last page
        view.previousFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, pageObject.length - 2);
      });
    });

    describe('addToQueue', function () {
      var view, processQueueStub;
      var errorStub;

      before(function (done) {
        injector.require(['bic/model/application'], function (app) {
          view = new View({ model: app });
          app.view = {
            pendingQueue: sinon.stub()
          };

          app.getArgument = sinon.stub();
          app.getArgument.withArgs('pid').returns('1');
          app.setArgument = sinon.stub();
          app.setArgument.withArgs('pid').returns('1');

          injector.require(['bic/model/pending'], function (PendingItem) {
            var PCol = Backbone.Collection.extend({ model: PendingItem });
            app.pending = new PCol();
            app.pending.processQueue = function () { return; };
            processQueueStub = sinon.stub(app.pending, 'processQueue');
            done();
          });
        });
      });

      beforeEach(function () {
        errorStub = sinon.stub(Forms.current, 'getInvalidElements', function () {
          return [ 1, 2, 3 ];
        });
      });

      afterEach(function () {
        errorStub.restore();
      });

      it('functions on view', function () {
        expect(view.formSubmit).to.be.an.instanceOf(Function);
        expect(view.formClose).to.be.an.instanceOf(Function);
        expect(view.previousFormPage).to.be.an.instanceOf(Function);
        expect(view.nextFormPage).to.be.an.instanceOf(Function);
        expect(view.firstFormPage).to.be.an.instanceOf(Function);
        expect(view.lastFormPage).to.be.an.instanceOf(Function);
        expect(view.formSave).to.be.an.instanceOf(Function);
        expect(view.formDiscard).to.be.an.instanceOf(Function);
        expect(view.addToQueue).to.be.an.instanceOf(Function);
      });

      it('should add item with status Pending in pending queue', function (done) {
        var pendingQueue;
        //checking stubs are not called
        should.exist(view.model);
        expect(apiStub.called).to.equal(false);
        expect(errorStub.called).to.equal(false);
        expect(processQueueStub.called).to.equal(false);

        mockApp.set('args', []);
        view.addToQueue(MODEL_STATUS.PENDING, true).then(function () {
          expect(apiStub.called).to.equal(true);
          pendingQueue = mockApp.pending.where({status: MODEL_STATUS.PENDING});
          expect(pendingQueue.length).to.equal(1);
          expect(pendingQueue[0].get('data').text_box).to.equal('123456789');
          done();
        });
      });

      it('should add item with status Draft in pending queue', function (done) {
        var draftQueue;

        mockApp.set('args', []);
        view.addToQueue(MODEL_STATUS.DRAFT, true).then(function () {
          return view.addToQueue(MODEL_STATUS.DRAFT, true);
        }).then(function () {
          draftQueue = mockApp.pending.where({status: MODEL_STATUS.DRAFT});
          expect(draftQueue.length).to.equal(2);
          expect(draftQueue[0].get('data').text_box).to.equal('Devyani');
          expect(draftQueue[1].get('data').text_box).to.equal('Anandita');
          done();
        });
      });

      it('should not check for errors when saving a draft', function (done) {
        view.addToQueue(MODEL_STATUS.DRAFT, true)
          .then(function (updatedModel) {
            done();
          })
          .catch(function (invalidElements) {
            done('Should not of thrown error');
          });
      });
    });

    describe('formSave2', function () {
      var view;
      before(function (done) {
        injector.require(['bic/model/application'], function (app) {
          view = new View({ model: app });
          app.view = view;

          app.getArgument = sinon.stub();
          app.getArgument.withArgs('pid').returns(view.model.attributes.pid);

          app.setArgument = function (name, value) {
            view.model.attributes.pid = value;
          };
          injector.require(['bic/model/pending'], function (PendingItem) {
            var PCol = Backbone.Collection.extend({ model: PendingItem });
            app.pending = new PCol();
            app.pending.create = function (attrs, options) {
              options.success({id: 1234});
            };
            done();
          });
        });
      });

      it('should set the pending id (pid) of the model', function (done) {
        view.formSave2().then(function (updatedModel) {
          assert.equal(view.model.attributes.pid, updatedModel.id);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
    });

    describe('formLeave', function () {
      var viewInstance;
      var modelGetStub;
      var interactionGetStub;

      beforeEach(function () {
        var mockModel;

        interactionGetStub = sinon.stub(Forms.current, 'get');

        mockModel = new Backbone.Model({
          currentForm: Forms.current
        });

        modelGetStub = sinon.stub(mockModel, 'get')
                            .returns('add');

        viewInstance = new View({ model: mockModel });
      });

      afterEach(function () {
        modelGetStub.restore();
        interactionGetStub.restore();
      });

      it('should go home', function () {
        var viewMock;
        var expectation;

        mockApp.history = [];
        mockApp.view = {
          home: function () {}
        };

        viewMock = sinon.mock(mockApp.view);
        expectation = viewMock.expects('home');
        expectation.once();

        interactionGetStub.returns(undefined);

        viewInstance.formLeave();

        expectation.verify();
      });

      it('should execute the onLeave action', function () {
        var afterInteraction;
        var afterInteractionMock;
        var afterInteractionExpectation;

        afterInteraction = {
          add: function () {}
        };

        afterInteractionMock = sinon.mock(afterInteraction);
        afterInteractionExpectation = afterInteractionMock.expects('add');
        afterInteractionExpectation.once();

        interactionGetStub.returns(afterInteraction);

        viewInstance.formLeave();

        afterInteractionExpectation.verify();

        afterInteractionMock.restore();
      });
    });

    describe('formSubmit', function () {
      var oldGetInvalidElements;
      var setPendingItemStub;
      var view;

      beforeEach(function () {
        var mockModel;

        mockModel = new Backbone.Model({
          currentForm: Forms.current
        });
        _.extend(mockModel, {
          trigger: function () {}
        });

        oldGetInvalidElements = Forms.current.getInvalidElements;
        Forms.current.getInvalidElements = function () {
          return [ 1, 2, 3 ];
        };

        mockApp.hasStorage = function () { return false; };

        setPendingItemStub = sinon.stub(mockAPI, 'setPendingItem');

        view = new View({ model: mockModel });
      });

      afterEach(function () {
        Forms.current.getInvalidElements = oldGetInvalidElements;
        setPendingItemStub.restore();
      });

      it('should not call formLeave() when validation failed', function (done) {
        var formLeaveStub = sinon.stub(view, 'formLeave');

        // Forms.current is already wired to have a validation error
        assert(Forms.current.getInvalidElements().length);

        view.formSubmit();

        setTimeout(function () {
          console.log('formLeaveStub.called', formLeaveStub.called);
          expect(formLeaveStub.called).to.equal(false);
          console.log('setPendingItemStub.called', setPendingItemStub.called);
          expect(setPendingItemStub.called).to.equal(false);
          done();
        }, 1e3);
      });
    });
  });
});
