# ng-authorize

Route authorization module for AngularJS.

## Installation

Using bower, install with this command:

```sh
bower install --save ng-authorize
```

Then add either the `dist/ng-authorize.js` for development or the `dist/ng-authorize.min.js` for production to your application scripts.

And finally, add the `ngAuthorize` module to your AngularJS application dependencies.

## Usage

This module defines a `session` object into the root scope, so you can access the values directly with `$rootScope.session` from your controllers or directives or with `$root.session` from your templates.

### Configuration

To configure this module use it's provider during the `config` stage of your application.

### Routes

Your routes definition can now have an `auth` object with an `allows` property that can be either an array of or a single `String`.

```js
angular.module('MyApp').config([
  '$routeProvider', 'ngAuthorizeProvider',

  function ($routeProvider, ngAuthorizeProvider) {
    $routeProvider.when('/restricted', {
      templateUrl: '/assets/templates/restricted.html',
      controller: 'RestrictedController',
      auth: {
        allows: ['ROLE.ADMIN']
      }
    });
  }
]);
```

### Provider

Use the provider to assign the values:

```javascript
angular.module('MyApp').config([
  'ngAuthorizeProvider',

  function (ngAuthorizeProvider) {
    ngAuthorizeProvider.configure({
      forbiddenPath: '/forbidden',
      signInPath: '/users/sign-in',
      authorizer: function () {}
    });
  }
]);
```

### The authorizer method

The authorizer method is assigned to all routes as a resolve function so it can be a `Function` or an annotated method for AngularJS.

#### Simple example

This is the bare minimum required configuration:

```javascript
angular.module('MyApp').config([
  '$routeProvider', 'ngAuthorizeProvider',

  function ($routeProvider, ngAuthorizeProvider) {
    $routeProvider.when('/restricted', {
      templateUrl: '/assets/templates/restricted.html',
      controller: 'RestrictedController',
      auth: {
        allows: ['ROLE.ADMIN']
      }
    });

    ngAuthorizeProvider.configure({
      forbiddenPath: '/forbidden',
      signInPath: '/users/sign-in',
      authorizer: [
        '$q', '$route', '$auth',

        function ($q, $route, $auth) {
          var deferred = $q.defer();

          var allowed = $auth.authorize($route.current.$$route, ['ROLE.USER']);

          if (allowed) {
            deferred.resolve();
          } else {
            deferred.reject();
          }

          return deferred.promise;
        }
      ]
    });
  }
]);
```

#### Advanced example

This example uses the [ngAuthorize](https://github.com/FinalDevStudio/ng-authorize) and [ngFlashes](https://github.com/FinalDevStudio/ng-flashes) modules for improved functionality:

```javascript
angular.module('MyApp').config([
  '$routeProvider', 'ngAuthorizeProvider',

  function ($routeProvider, ngAuthorizeProvider) {
    $routeProvider.when('/restricted', {
      templateUrl: '/assets/templates/restricted.html',
      controller: 'RestrictedController',
      auth: {
        allows: ['ROLE.ADMIN']
      }
    });

    /** Authorizer function */
    function ngAuthorizeAuthorizerFn($q, $route, $auth, $session, $location, $flash) {
      var deferred = $q.defer();

      /* Run ngAuthorize authorize function */
      function authorize() {
        return $auth.authorize($route.current.$$route, $session.user('roles'));
      }

      /* Check if the allowed values are allowed by the route */
      function checkAllowed(allowed) {
        if (allowed) {
          return deferred.resolve();
        }

        $flash.warning('Hey!', 'Sign in first!');
      }

      /* Session update error */
      function sessionUpdateError() {
        $session.signOut();
        deferred.reject();
        $location.path('/');
        $flash.danger('Holy!', 'Couldn\'t retrieve your session!');
      }

      $session.update()
        .then(authorize)
        .then(checkAllowed)
        .catch(sessionUpdateError);

      return deferred.promise;
    }

    /* Configure ngAuthorize */
    ngAuthorizeProvider.configure({
      forbiddenPath: '/panel/forbidden',
      signInPath: '/panel/users/sign-in',
      authorizer: [
        '$q', '$route', 'ngAuthorize', 'ngAuthorize', 'ngFlashes',

        ngAuthorizeAuthorizerFn
      ]
    });
  }
]);
```

### Service

The `ngAuthorize` service exposes various methods but these are intended to be used on route resolves:

Method      | Arguments                           | Description
----------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`authorize` | `route`:`Object`, `allowed`:`Mixed` | Performs authorization and redirection accordingly. Argument `route` must be the AngularJs' current route object. Argument `allowed` must be the current allowed values for the user.
`isAllowed` | `route`:`Object`, `allowed`:`Mixed` | Checks if the current allowed values are allowed for the route. Argument `route` must be the AngularJs' current route object. Argument `allowed` must be the current allowed values for the user.
`canSignIn` | `route`:`Object`, `allowed`:`Mixed` | Checks if the current user can sign in to access this route. This works by checking if there are allowed values or not. Argument `route` must be the AngularJs' current route object. Argument `allowed` must be the current allowed values for the user.

## Documentation

To learn more please view the [API Docs](docs/ng-authorize.md).
