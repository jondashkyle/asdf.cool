var $ = require('cash-dom')
var key = require('keymaster')
require('velocity-animate')
require('velocity-animate/velocity.ui')

key.filter = function (event) {
  return true
}

var Container = require('./container')
var Panel = require('./panel')
var Tags = require('./tags')
var Settings = require('./settings')
var cache = require('./cache')
var db = require('./database')
var helpers = require('./helpers')
require('./typography')

/**
 * Setup
 */

var container = Container({
  content: db.get()
})

var tags = Tags({
  content: db.get()
})

var panel = Panel()

var settings = Settings(db.get('settings'))

/**
 * Methods
 */

function refresh() {
  var data = db.get()
  container.refresh(data)
  tags.refresh(data)
  settings.refresh(db.get('settings'))
  checkEmpty()
}

function checkEmpty() {
  var showVideo = false

  if (! db.checkVisited()) {
    showVideo = true
  }

  if (db.isEmpty()) {
    container.emptyNoteOn(showVideo)
  } else {
    container.emptyNoteOff()
  }

  db.setVisited()

}

/**
 * Container / Panel interaction
 */

settings.on('update', function(_settings) {
  db.settingsUpdate(_settings)
})

container.on('sort', function (data) {
  var $el = $(data.element)
  var from = parseInt($el.attr('data-index-start'), 0)
  var to = parseInt($el.index(), 0)
  db.move(from, to)
  refresh()
})

panel.on('submit', function (data) {
  db.add(data)
  refresh()
})

settings.on('sourceShow', function(el) {
  el.find('textarea').text(JSON.stringify(db.get(), null, 2))
})

/**
 * Keyboard shortcuts
 */

key('esc', 'panel', panel.close)
key('ctrl+s', 'panel', function() {
  panel.close()
  settings.show()
})
key('ctrl+n', 'panel', function(event) {
  panel.close()
  event.preventDefault()
})

key('esc', 'settings', settings.hide)
key('ctrl+n', 'settings', function(event) {
  panel.open()
  event.preventDefault()
})
key('ctrl+s', 'settings', settings.toggle)

key('ctrl+s', 'list', settings.toggle)
key('ctrl+n', 'list', function(event) {
  panel.open()
  event.preventDefault()
})

panel.on('open', function () {
  key.setScope('panel')
  helpers.scroll(false)
})

panel.on('close', function () {
  if (settings.isActive()) {
    key.setScope('settings')
  } else {
    key.setScope('list')
  }
  helpers.scroll()
})

settings.on('show', function() {
  key.setScope('settings')
  container.editEnable()
})

settings.on('hide', function() {
  key.setScope('list')
  container.editDisable()
})

panel.on('remove', function (id) {
  db.remove(id)
  refresh()
})

key.setScope('list')

/**
 * Initialize
 */

window.addEventListener('load', function() {
  settings.refresh(db.get('settings'))
  settings.start()
  checkEmpty()
  $('body').css('visibility', 'visible')
})

$('body').on('click', '[data-edit][data-id]', function() {
  var id = $(this).attr('data-id')
  var linkData = db.getLink(id)
  if (linkData) {
    panel.edit(linkData)
  }
})

$('body')
  .on('click', '[data-view]', function() {
    var view = $(this).attr('data-view')
    if (view === 'panel') {
      panel.toggle()
    } else if (view === 'settings') {
      panel.close()
      settings.toggle()
    }
  })
  .on('click', '[data-reset-links]', function() {
    var check = confirm('Are you sure you want to reset? This is permanent.')
    if ( check ) {
      var check2 = confirm('For real? ok.')
      if (check && check2) {
        db.reset()
        refresh()
      }
    }
  })