var $ = require('cash-dom')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var velocity = require('velocity-animate')
var extend = require('extend')
var validator = require('validator')

var template = fs.readFileSync(__dirname + '/template.html', 'utf8')

module.exports = function (opts) {
  var options = extend(true, {
    container: '[data-panel]',
    content: null
  }, opts)

  var $container = $(template)
  $container.appendTo('body')

  var events = new EventEmitter()
  var editing = false

  var view = {
    active: false,
    open: function () {
      if (view.active) return
      view.active = true
      velocity($container, 'transition.slideDownIn', {
        complete: function() {
          $container.find('[name="title"]')[0].focus()
        },
        duration: 250
      })
      events.emit('open')
    },
    close: function () {
      if (!view.active) return
      view.active = false
      velocity($container, 'transition.slideDownOut', {
        complete: reset,
        duration: 500
      })
      events.emit('close')
    },
    toggle: function () {
      if (view.active) {
        view.close()
      } else {
        view.open()
      }
    }
  }

  function edit (_data) {
    $container.addClass('options-panel-edit')
    if (_data.id) {
      $container.find('[name="id"]').val(_data.id)
    }
    if (_data.title) {
      $container.find('[name="title"]').val(_data.title)
    }
    if (_data.url) {
      $container.find('[name="url"]').val(_data.url)
    }
    if (_data.tags) {
      if (typeof _data.tags === 'array') {
        $container.find('[name="tags"]').val(_data.tags.join(', '))
      } else {
        $container.find('[name="tags"]').val(_data.tags)
      }
    }
    view.open()
  }

  function reset() {
    $container.removeClass('options-panel-edit')
    $container
      .find('input[type="text"]')
      .val('')
    $container
      .find('input[type="hidden"]')
      .val('')
  }

  function submit (event) {
    var _id = $container.find('[name="id"]').val() || new Date().getTime()
    var _title = $container.find('[name="title"]').val()
    var _url = $container.find('[name="url"]').val()
    var _tags = $container.find('[name="tags"]').val().split(',')
    _tags = _tags.map(function(s) { return s.trim() })

    event.preventDefault()

    if (_id === '') {
      alert('No ID')
      return
    }

    if (_title === '') {
      alert('Please enter a title')
      return
    }

    if (! validator.isURL(_url) || _url === '') {
      alert('Please enter a valid URL')
      return
    }

    events.emit('submit', {
      id: _id,
      title: _title,
      url: _url,
      tags: _tags
    })

    view.close()
  }

  function remove () {
    var _id = $container.find('[name="id"]').val()
    if (! _id) return
    view.close()
    events.emit('remove', _id)
  }

  $('body')
    .on('click', '[data-panel-open]', view.open)
    .on('click', '[data-panel-close]', view.close)
    .on('click', '[data-panel-toggle]', view.toggle)
    .on('click', '[data-panel-remove]', remove)

  $container
    .find('.options-panel')
    .on('submit', submit)

  $container.on('click', function(event) {
    if ($(event.target).attr('class') === 'content-panel') {
      view.close()
    }
  })

  function on (ev, cb) {
    events.on(ev, cb)
  }

  function off (ev, cb) {
    events.events.removeListener(ev, cb)
  }

  return {
    open: view.open,
    close: view.close,
    toggle: view.toggle,
    edit: edit,
    on: on,
    off: off
  }
}
