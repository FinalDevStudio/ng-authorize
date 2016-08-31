(function(window) {
  "use strict";
  var ng = window.angular;
  var config = {
    authorizer: null,
    signInPath: null,
    forbiddenPath: null
  };
  function ngAuthorizeServiceFn($location, $q, $log) {
    function isAllowed(route, allowed) {
      if (route && route.auth && route.auth.allows) {
        var allows = route.auth.allows;
        if (ng.isString(allowed)) {
          allowed = [ allowed ];
        }
        if (ng.isString(allows)) {
          allows = [ allows ];
        }
        for (var i = 0, l = allowed.length; i < l; i++) {
          var val = allowed[i];
          if (allows.indexOf(val) > -1) {
            return true;
          }
        }
        return false;
      }
      return true;
    }
    function canSignIn(route, allowed) {
      return !allowed || !allowed.length;
    }
    function authorize(route, allowed) {
      if (isAllowed(route, allowed)) {
        return true;
      }
      if (canSignIn(route, allowed)) {
        if (config.signInPath) {
          $location.path(config.signInPath);
        } else {
          $log.warn("ngAuthorize: No sign in path defined!");
        }
      } else {
        if (config.forbiddenPath) {
          $location.path(config.forbiddenPath);
        } else {
          $log.warn("ngAuthorize: No forbidden path defined!");
        }
      }
      return false;
    }
    var ngAuthorizeServiceDef = {
      authorize: authorize,
      isAllowed: isAllowed,
      canSignIn: canSignIn
    };
    return ngAuthorizeServiceDef;
  }
  function configure(cfg) {
    if (ng.isArray(cfg.authorizer) || ng.isFunction(cfg.authorizer)) {
      config.authorizer = cfg.authorizer;
    }
    if (ng.isString(cfg.signInPath)) {
      config.signInPath = cfg.signInPath;
    }
    if (ng.isString(cfg.forbiddenPath)) {
      config.forbiddenPath = cfg.forbiddenPath;
    }
  }
  var ngAuthorizeProviderDef = {
    configure: configure,
    $get: [ "$location", "$q", "$log", ngAuthorizeServiceFn ]
  };
  function ngAuthorizeProviderFn() {
    return ngAuthorizeProviderDef;
  }
  function ngAuthorizeRunFn($route) {
    if (!ng.isArray(config.authorizer) && !ng.isFunction(config.authorizer)) {
      throw new Error("ngAuthorize: Please set authorizer function first!");
    }
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
  ng.module("ngAuthorize", []).provider("ngAuthorize", ngAuthorizeProviderFn).run([ "$route", ngAuthorizeRunFn ]);
})(window);