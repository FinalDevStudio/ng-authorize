'use strict';

/* Test the directive */
describe('The ngAuthorize service', function () {
  var $auth;

  beforeEach(module('ngAuthorize'));
  beforeEach(module('ngRoute'));

  beforeEach(module([
    'ngAuthorizeProvider',

    function (ngAuthorizeProvider) {
      ngAuthorizeProvider.configure({
        authorizer: function () {}
      });
    }
  ]));

  beforeEach(inject(function ($injector) {
    $auth = $injector.get('ngAuthorize');
  }));

  it('Should actually load', function () {
    expect($auth).to.be.an('object');
  });
});
