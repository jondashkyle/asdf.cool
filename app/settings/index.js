var $ = require('cash-dom')
var vein = require('../modules/vein')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var extend = require('extend')
var velocity = require('velocity-animate')

var template = fs.readFileSync(__dirname + '/template.html', 'utf8')

module.exports = function(opts) {
  var options = extend(true, {
    font: 'Bau-Medium',
    columns: false,
    color: 'light',
    colWidth: 275,
    padding: 50,
    zoom: 50
  }, opts)

  var active = false

  var events = new EventEmitter()
  var $container = $(template)
  $container.prependTo('body')

  function fitColumns (_opts) {
    var _options = extend(true, {
      parentWidth: 0,
      colWidth: 0,
      roundUp: true
    }, _opts)
    if (_options.roundUp) {
      return Math.floor(_options.parentWidth / _options.colWidth)
    } else {
      return Math.ceil(_options.parentWidth / _options.colWidth)
    }
  }

  function resize () {
    if (options.columns) {
      var colWidth = fitColumns({
        parentWidth: $('[data-col-container]').width(),
        colWidth: options.colWidth
      })
      vein.inject('[data-col-container] [data-col]', {
        'width' : (100 / colWidth) + '%'
      })
    }
  }

  function setColWidth (width) {
    if (this.nodeType) {
      width = this.value
    } else {
      width = width || options.colWidth
    }

    options.colWidth = parseInt(width)
    $('input[name="colWidth"]').val(options.colWidth)

    resize()
    events.emit('update', options)
  }

  function toggleColumns (toggle) {
    if (this.nodeType) {
      toggle = $(this).is(':checked')
    } else {
      toggle = toggle || options.columns
    }

    options.columns = toggle

    if (toggle) {
      $('input[name="colWidth"]').removeAttr('disabled')
      $('input[name="columns"]')[0].checked = true
      resize()
    } else {
      $('input[name="colWidth"]').attr('disabled', true)
      $('input[name="columns"]')[0].checked = false
      vein.inject('[data-col-container] [data-col]', {
        width: ''
      })
    }

    events.emit('update', options)
  }

  function zoom (zoom) {
    if (this.nodeType) {
      zoom = this.value
    } else {
      zoom = zoom || options.zoom
    }

    options.zoom = parseInt(zoom)

    $('input[name="zoom"]').val(options.zoom)

    vein.inject('html', {
      'font-size': zoom + '%'
    })

    events.emit('update', options)
  }

  function padding (padding) {
    if (this.nodeType) {
      padding = this.value
    } else {
      padding = padding || options.padding
    }

    var _temp = (padding/100) * 5
    options.padding = parseInt(padding)
    $('input[name="padding"]').val(options.padding)

    vein.inject('.container-links', {
      'padding': _temp + 'em ' + _temp * 0.75 + 'em '
    })

    vein.inject('.entry', {
      'padding': _temp * 0.5 + 'em ' + _temp + 'em '
    })

    events.emit('update', options)
  }

  function color (color) {
    if (this.nodeType) {
      color = $(this).val()
    } else {
      color = color || options.color
    }

    if ( color !== 'dark' && color !== 'light' ) {
      color = 'light'
    }

    options.color = color
    $('body').attr('data-design-color', color)
    $('[data-color-container]').removeClass('active')
    $('[data-color-container="' + color + '"]').addClass('active')

    events.emit('update', options)
  }

  function font (font) {
    if (this.nodeType) {
      font = this.value
    } else {
      font = font || options.font
    }

    options.font = font
    vein.inject('[data-container-links]', {
      'font-family': font + ', sans-serif'
    })

    events.emit('update', options)
  }

  function scrollToTop () {
    velocity($('body'), 'scroll', {
      duration: 250,
      easing: 'easeOutQuad'
    })
  }

  function sourceHide () {
    $('.container-settings-source').removeClass('active')
    $('.container-settings-source textarea').text('')
  }

  function sourceShow () {
    var _el = $('.container-settings-source')
    _el.addClass('active')
    events.emit('sourceShow', _el)
  }

  function refresh (_data) {
    options = extend(options, _data)
    resize()
  }

  function start () {
    zoom()
    color()
    setColWidth()
    toggleColumns()
    padding()
    font()

    $('input[name="font"]').val(options.font)

    window.addEventListener('resize', resize, false)
  }

  function stop () {
    window.removeEventListener('resize', resize, false)
  }

  function show () {
    if (active) return
    active = true
    var height = $('[data-container-settings]').height()

    velocity($('[data-container-settings]'), {
      translateZ: [0, 0],
      translateY: ['0%', '-100%']
    }, {
      display: 'block',
      duration: 750,
      easing: 'easeOutQuint'
    })

    velocity($('[data-settings-header]'), {
      translateZ: [0, 0],
      translateY: [60, 0]
    }, {
      duration: 750,
      easing: 'easeOutQuint'
    })

    velocity($('[data-container-links]'), {
      translateZ: [0, 0],
      translateY: height
    }, {
      duration: 750,
      easing: 'easeOutQuint',
      complete: function() {
        velocity($(this), { 
          translateY: 0,
          'marginTop': height
        }, 0)
      }
    })

    velocity($('.background-edit'), {
      opacity: [0.2, 0]
    }, {
      display: 'block',
      duration: 750,
      easing: 'easeOutQuint'
    })

    scrollToTop()
    events.emit('show')
  }

  function hide () {
    if (! active) return
    active = false
    var height = $('[data-container-settings]').height()

    $('[data-container-links]').css({ 'margin-top': 0 })

    velocity($('[data-container-settings]'), 'stop')
    velocity($('[data-container-settings]'), {
      translateZ: [0, 0],
      translateY: ['-100%', '0%']
    }, {
      display: 'block',
      duration: 750,
      easing: 'easeOutQuint'
    })

    velocity($('[data-settings-header]'), 'stop')
    velocity($('[data-settings-header]'), {
      translateZ: [0, 0],
      translateY: [0, 60]
    }, {
      duration: 750,
      easing: 'easeOutQuint'
    })

    velocity($('[data-container-links]'), 'stop')
    velocity($('[data-container-links]'), {
      translateZ: [0, 0],
      translateY: [0, height]
    }, {
      duration: 750,
      easing: 'easeOutQuint',
      begin: function() {
        $(this).css({ 'margin-top': 0 })
      }
    })

    velocity($('.background-edit'), {
      opacity: [0, 0.2]
    }, {
      display: 'none',
      duration: 750,
      easing: 'easeOutQuint'
    })

    sourceHide()
    events.emit('hide')
  }

  function toggle () {
    if (active) {
      hide()
    } else {
      show()
    }
  }

  function isActive() {
    return active
  }

  function on (ev, cb) {
    events.on(ev, cb)
  }

  function off (ev, cb) {
    events.events.removeListener(ev, cb)
  }

  /**
   * Initialize and public methods
   */

  $('input[name="zoom"]').on('input', zoom)
  $('input[name="padding"]').on('input', padding)
  $('input[name="colWidth"]').on('input', setColWidth)
  $('input[name="columns"]').on('change', toggleColumns)
  $('input[name="color"]').on('click', color)
  $('input[name="font"]').on('keyup', font)
  $('[data-settings-close]').on('click', hide)
  $('[data-source-show]').on('click', sourceShow)
  $('[data-source-hide]').on('click', sourceHide)
  $('[data-source-import]').on('click', function() {
    alert('Coming soon :)')
  })

  $('body')
    .on('click', '[data-settings-show]', show)
    .on('click', '[data-settings-hide]', hide)

  $('[data-settings-header]').on('click', function() {
    if (window.pageYOffset == 0) {
      hide()
    } else {
      scrollToTop()
    }
  })

  return {
    on: on,
    off: off,
    start: start,
    stop: stop,
    show: show,
    hide: hide,
    toggle: toggle,
    refresh: refresh,
    isActive: isActive
  }
}