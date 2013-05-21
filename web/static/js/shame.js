// for ie's sake
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}
if (typeof Array.prototype.indexOf !== 'function') {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

function get_browser(is) {
	return {
		//Browsers
		IE6: false,
		IE7: (document.all && !window.opera && window.XMLHttpRequest && navigator.userAgent.toString().toLowerCase().indexOf('trident/4.0') == -1) ? true : false,
		IE8: (navigator.userAgent.toString().toLowerCase().indexOf('trident/4.0') != -1),
		IE9: navigator.userAgent.toString().toLowerCase().indexOf("trident/5")>-1,
		IE10: navigator.userAgent.toString().toLowerCase().indexOf("trident/6")>-1,
		SAFARI: (navigator.userAgent.toString().toLowerCase().indexOf("safari") != -1) && (navigator.userAgent.toString().toLowerCase().indexOf("chrome") == -1),
		FIREFOX: (navigator.userAgent.toString().toLowerCase().indexOf("firefox") != -1),
		CHROME: (navigator.userAgent.toString().toLowerCase().indexOf("chrome") != -1),
		MOBILE_SAFARI: ((navigator.userAgent.toString().toLowerCase().indexOf("iphone")!=-1) || (navigator.userAgent.toString().toLowerCase().indexOf("ipod")!=-1) || (navigator.userAgent.toString().toLowerCase().indexOf("ipad")!=-1)) ? true : false,
		OPERA: window.opera,

		//Platforms
		MAC: (navigator.userAgent.toString().toLowerCase().indexOf("mac")!=-1) ? true: false,
		WINDOWS: (navigator.appVersion.indexOf("Win")!=-1) ? true : false,
		LINUX: (navigator.appVersion.indexOf("Linux")!=-1) ? true : false,
		UNIX: (navigator.appVersion.indexOf("X11")!=-1) ? true : false
	}
}