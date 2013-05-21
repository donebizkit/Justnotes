var Events = function(o) {
	if (o.$) return;
	o.$ = $(o);
	o.trigger = function(type, paramters) {
		this.$.trigger(type, paramters);
	}
	o.bind = function(type, handler) {
		this.$.bind(type, handler);
	}
	o.unbind = function(type) {
		if (type)
			this.$.unbind(type);
		else
			this.$.unbind();
	}
	o.unbindh = function(type, handler) {
		this.$.unbind(type, handler);
	}
}