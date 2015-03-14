var $ = require('cash-dom')
var _ = require('underscore')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var extend = require('extend')
var sortable = require('./sortable')
var score = require('string_score')

var $empty = $(fs.readFileSync(__dirname + '/emptynote.html', 'utf8'))
var $entry = $(fs.readFileSync(__dirname + '/entry.html', 'utf8'))

module.exports = function (opts) {
  var options = extend(true, {
    container: '[data-container-links]',
    content: null
  }, opts)

  var events = new EventEmitter()
  var editing = false

  function entry (self, i) {
    var $this = $entry.clone()
    $this
      .attr('data-id', self.id)
      .attr('data-index', i + '')
    $this.find('.entry-title').html(self.title)
    $this.find('.entry-link').attr('href', self.url)
    $this.find('.entry-url').html(self.url)
    $this.appendTo(options.container)
  }

  function filter(filter) {
    var results = [ ]
    _.each(options.content, function(self) {
      if ( self.title.score(filter) > 0.4 || self.tags.score(filter) > 0.4 ) {
        results.push(self)
      }
    })
    return results
  }

  function refresh (content) {
    if (content) {
      options.content = content
    }
    $(options.container).html('')
    _.each(options.content, entry)
    if (editing) editEnable()
  }

  function editEnable() {
    editing = true
    $('[data-id]').attr('data-edit', 'true')
  }

  function editDisable() {
    editing = false
    $('[data-id]').removeAttr('data-edit')
  }

  function on (ev, cb) {
    events.on(ev, cb)
  }

  function off (ev, cb) {
    events.events.removeListener(ev, cb)
  }

  function emptyNoteOn(video) {
    if (video) {
      $empty.appendTo('body')
    } else {
      $empty.find('.container-empty-video').remove()
      $empty.appendTo('body')
    }
  }

  function emptyNoteOff() {
    $('[data-empty-note]').remove()
  }

  refresh()

  sortable($(options.container)[0], {
      change: function (el) {
        events.emit('sort', {
          element: $(el)
        })
      }
    })

  return {
    refresh: refresh,
    editEnable: editEnable,
    editDisable: editDisable,
    emptyNoteOn: emptyNoteOn,
    emptyNoteOff: emptyNoteOff,
    on: on,
    off: off
  }
}
