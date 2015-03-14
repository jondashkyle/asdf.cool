var storeWithExpiration = {
    set: function(key, val, exp) {
        store.set(key, { val:val, exp:exp, time:new Date().getTime() })
    },
    get: function(key) {
        var info = store.get(key)
        if (!info) { return null }
        if (new Date().getTime() - info.time > info.exp) { return null }
        return info.val
    }
}
storeWithExpiration.set('foo', 'bar', 1000)
setTimeout(function() { console.log(storeWithExpiration.get('foo')) }, 500) // -> "bar" 
setTimeout(function() { console.log(storeWithExpiration.get('foo')) }, 1500) // -> null 