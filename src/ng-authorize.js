/**
 * ngAuthorize
 *
 * @description Route authorization module for AngularJS.
 * @module ngAuthorize
 * @author Final Development Studio
 * @license MIT
 */

(function (window) {
  'use strict';

  var ng = window.angular;

  var config = {
    authorizer: null,
    signInPath: null,
    forbiddenPath: null
  };

  /**
   * ngAuthorize factory function.
   *
   * @private
   */
  function ngAuthorizeServiceFn($location, $q, $log) {
    /**
     * @module ngAuthorize
     * @description ngAuthorize Service
     */

    /**
     * Checks if the current route can be accessed.
     *
     * @param {Object} route The current route object to check for.
     * @param {Mixed} allowed The current session allowed values.
     *
     * @returns {Boolean} Whether the current session allowed values are allowed
     * to acces the current route.
     *
     * @example
     * ngAuthorize.isAllowed($route.current.$$route, ['ROLE.USER']); // => true/false
     */
    function isAllowed(route, allowed) {
      if (route && route.auth && route.auth.allows) {
        var allows = route.auth.allows;

        if (ng.isString(allowed)) {
          allowed = [allowed];
        }

        if (ng.isString(allows)) {
          allows = [allows];
        }

        for (var i = 0, l = allowed.length; i < l; i++) {
          var val = allowed[i];

          if (allows.indexOf(val) > -1) {
            return true;
          }
        }

        /* Return false by default if route allows is set */
        return false;
      }

      /* Allow all by default */
      return true;
    }

    /**
     * Checks if there's no session allowed values and user can sign in.
     *
     * @param {Object} route The current route object to check for.
     * @param {Mixed} allowed The current session allowed values.
     *
     * @return {Boolean} Wether the user is already signed in.
     *
     * @example
     * ngAuthorize.canSignIn($route.current.$$route, ['ROLE.USER']); // => true/false
     */
    function canSignIn(route, allowed) {
      return !allowed || !allowed.length;
    }

    /**
     * Main authorize function.
     *
     * Receives the current route object and the current allowed values from the
     * authorizer function and checks for user allowance.
     *
     * @param {Object} route The current route object.
     * @param {Mixed} allowed The current session allowed value(s) to check
     * against the route's `allows` value(s).
     *
     * @returns {Boolean} Wether the allowed values are authorized.
     *
     * @example
     * ngAuthorize.authorize($route.current.$$route, ['ROLE.USER']); // => true/false
     */
    function authorize(route, allowed) {
      if (isAllowed(route, allowed)) {
        return true;
      }

      if (canSignIn(route, allowed)) {
        if (config.signInPath) {
          $location.path(config.signInPath);
        } else {
          $log.warn('ngAuthorize: No sign in path defined!');
        }
      } else {
        if (config.forbiddenPath) {
          $location.path(config.forbiddenPath);
        } else {
          $log.warn('ngAuthorize: No forbidden path defined!');
        }
      }

      return false;
    }

    /* ngAuthorize service definition */
    var ngAuthorizeServiceDef = {
      authorize: authorize,
      isAllowed: isAllowed,
      canSignIn: canSignIn
    };

    return ngAuthorizeServiceDef;
  }

  /**
   * @module ngAuthorizeProvider
   * @description ngAuthorize Provider
   */

  /**
   * Configuration method.
   *
   * @param {Object} cfg The configuration object.
   *
   * @example
   * ngAuthorizeProvider.configure({
   *   forbiddenPath: '/forbidden',
   *   signInPath: '/users/sign-in',
   *   authorizer: function () {}
   * });
   */
  function configure(cfg) {
    /* Set the authorizer function */
    if (ng.isArray(cfg.authorizer) || ng.isFunction(cfg.authorizer)) {
      config.authorizer = cfg.authorizer;
    }

    /* Set the sign in path */
    if (ng.isString(cfg.signInPath)) {
      config.signInPath = cfg.signInPath;
    }

    /* Set the forbidden path */
    if (ng.isString(cfg.forbiddenPath)) {
      config.forbiddenPath = cfg.forbiddenPath;
    }
  }

  /**
   * ngSession provider definition.
   *
   * @private
   */
  var ngAuthorizeProviderDef = {
    configure: configure,

    $get: [
      '$location', '$q', '$log',

      ngAuthorizeServiceFn
    ]
  };

  /**
   * ngAuthorize provider function.
   *
   * @private
   */
  function ngAuthorizeProviderFn() {
    return ngAuthorizeProviderDef;
  }

  /**
   * ngAuthorize run function.
   *
   * @private
   */
  function ngAuthorizeRunFn($route) {
    if (!ng.isArray(config.authorizer) && !ng.isFunction(config.authorizer)) {
      throw new Error('ngAuthorize: Please set authorizer function first!');
    }

    /* Assign authorizer resolves if necessary */
    for (var path in $route.routes) {
      var route = $route.routes[path];

      if (ng.isObject(route.auth)) {
        if (!ng.isObject(route.resolve)) {
          route.resolve = {};
        }

        var authorizer = route.resolve.authorizer;

        if (!ng.isArray(authorizer) || !ng.isFunction(authorizer)) {
          route.resolve.authorizer = config.authorizer;
        }
      }
    }
  }

  /* Define AngularJS module */
  ng.module('ngAuthorize', [])

  /* Define AngularJS module provider */
  .provider('ngAuthorize', ngAuthorizeProviderFn)

  /* Define run function for this module */
  .run(['$route', ngAuthorizeRunFn]);

}(window));
