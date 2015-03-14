require('components-webfontloader')

var WebFontConfig = {
  classes: false,
  custom: {
    families: ['Fira Sans', 'Fira Mono'],
    urls: ['/assets/fonts/fonts.css']
  },
  active: function() {
    
  }
}

WebFont.load(WebFontConfig)