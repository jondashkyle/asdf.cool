function killScroll (event) {
  event.preventDefault()
}

exports.scroll = function(state) {
  var active = false
  if (state === false) {
    if (active) return 
    active = true
    window.addEventListener('mousewheel', killScroll, false)
  } else {
    active = false
    window.removeEventListener('mousewheel', killScroll, false)
  }
}