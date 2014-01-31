define([
  'angular',
  'underscore'
],
  function(ng, _) {
    'use strict';

    ng.module('kibana.services').service('dataTransform', function($injector) {
      var validTransforms = {
        count: {

        },
        field: {

        },
        replace: {

        },
        sum: {
          type: 'calc'
        }
      };

      this.transform = function(queries, results) {
        var transformNames = _.keys(validTransforms);

        _.forEach(queries, function(query) {
          if (query.transforms) {
            _.forEach(query.transforms, function(transform) {
              if (transformNames.indexOf(transform.command) == -1) {
                throw "invalid transform "+transform.command;
              }

              var service = $injector.get(transform.command+'Transform'),
                args = [results.hits].concat(transform.args);

              results.hits.calc = results.hits.calc || {};
              results.hits.hits = service.transform.apply(null, args);
            });
          }
        });
      };

      this.listTransforms = function(searchTypes) {
        if (_.isUndefined(searchTypes)) {
          searchTypes = 'all';
        }

        if (!_.isArray(searchTypes)) {
          searchTypes = [searchTypes];
        }

        var transforms = [];
        _.each(validTransforms, function(obj, name) {
          var transformType = obj.type || 'all';
          if (_.indexOf(searchTypes, transformType) != -1) {
            transforms.push(name);
          }
        });

        return transforms;
      };

      this.getField = function(hit, field) {
        var result = hit._source,
          parts = field.split('.'), part;

        while (parts.length > 0) {
          part = parts.shift();
          if (!result[part]) {
            result = null;
            break;
          }

          result = result[part];
        }

        return result;
      };

      this.parseRegex = function(param) {
        if (_.isString(param)) {
          return new RegExp(param, 'g');
        }

        return param;
      };

      this.sort = function(list, getter, sortAsc) {
        sortAsc = sortAsc || false;

        list.sort(function(a, b) {
          var val1 = getter(a),
            val2 = getter(b), result;

          if (val1 == val2) {
            result = 0;
          } else if (sortAsc) {
            result = val1 < val2 ? -1 : 1;
          } else {
            result = val1 < val2 ? 1 : -1;
          }

          return result;
        });
      };

      this.objectListToString = function(objectList, getter) {
        var result = "", first = true, getterData;

        _.forEach(objectList, function(obj) {
          if (first) {
            first = false;
          } else {
            result += ", ";
          }

          getterData = getter(obj);
          result += getterData[0]+": "+getterData[1];
        });

        return result;
      }
    });
  });