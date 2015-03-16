var db = require('store')
var _ = require('underscore')
var normalizeUrl = require('normalize-url')
var EventEmitter = require('events').EventEmitter
var events = new EventEmitter()
var extend = require('extend')

var data = db.get('links') || [ ]
var settings = db.get('settings')

function move (_from, _to) {
  if (_to !== undefined && _from !== undefined) {
    data.splice(_to, 0, data.splice(_from, 1)[0])
    update()
  }
}

function replace (_data) {
  if (typeof _data === 'array' ) {
    data = normalize(_data)
    update()
  }
}

function add (_data) {
  var result = false
  var _id = parseInt(_data.id)
  _.some(data, function(link) {
    if (parseInt(link.id) === _id) {
      result = link
      link = extend(link, _data)
      update()
    }
    return link.id === _id
  })
  if (!result) {
    prepend(_data)
  }
}

function prepend (_data) {
  if (typeof _data === 'object' ) {
    data.unshift(normalize(_data))
    update()
  }
}

function remove (id) {
  data = data.filter(function (link) {
    return parseInt(link.id) !== parseInt(id)
  })
  update()
}

function settingsUpdate(_settings) {
  db.set('settings', _settings)
}

function update () {
  db.set('links', data)
  events.emit('update')
}

function normalize (_data) {
  if (_data.url) {
    _data.url = normalizeUrl(_data.url)
  }
  return _data
}

function checkVisited() {
  return db.get('visited')
}

function setVisited() {
  db.set('visited', true)
}

/**
 * Initialize
 */
replace(db.get('links'))

/**
 * Public methods
 */

exports.move = move
exports.add = add
exports.remove = remove
exports.prepend = prepend
exports.settingsUpdate = settingsUpdate
exports.setVisited = setVisited
exports.checkVisited = checkVisited

exports.reset = function () {
  data = [ ]
  update()
}

exports.get = function(req) {
  if (req) {
    return db.get(req)
  } else {
    return data
  }
}

exports.getLink = function(id) {
  var result = false
  id = parseInt(id)
  _.some(data, function(link) {
    if (parseInt(link.id) === id) {
      result = link
    }
    return link.id === id
  })
  return result
}

exports.isEmpty = function () {
  if (data.length > 0) {
    return false
  } else {
    return true
  }
}

exports.on = function (ev, cb) {
  events.on(ev, cb)
}

exports.off = function (ev, cb) {
  events.off(ev, cb)
}