var $ = require('cash-dom')
var _ = require('underscore')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var extend = require('extend')

var $entry = $(fs.readFileSync(__dirname + '/template.html', 'utf8'))

module.exports = function (opts) {
  var options = extend(true, {
    container: '[data-container-links]',
    content: null,
    tags: null
  }, opts)

  var events = new EventEmitter()

  function getTags() {
    options.tags = _.uniq(_.pluck(_.flatten(options.content), 'tags'))
    options.tags = options.tags.sort(function (a, b) {
      if (a < b) return -1
      if (b < a) return 1
      return 0;
    })
    return options.tags
  }

  function refresh(content) {
    if (content) {
      options.content = content
      getTags()
    }
  }

  function on (ev, cb) {
    events.on(ev, cb)
  }

  function off (ev, cb) {
    events.events.removeListener(ev, cb)
  }

  return {
    on: on,
    off: off,
    refresh: refresh,
    get: getTags
  }
}