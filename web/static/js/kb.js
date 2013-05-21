var kbid = 0;
Keyboard = function() {
	Events(this);

	this.kbid = kbid;
	kbid++;

	var self = this;
	var key = undefined;
	var enabled = true;
	var edit_mode = false;

	$(document).bind("keydown." + this.kbid, function(e) {
		if (!enabled) return;
		key = {which: e.which, char: String.fromCharCode(e.which), ctrl: e.ctrlKey, shift: e.shiftKey}

		if(e.which === 8)
			key.backspace = true;
		else if(e.which === 9)
			key.tab = true;
		else if(e.which === 13)
			key.enter = true;
		else if(e.which === 18)
			key.alt = true;
		else if(e.which === 27)
			key.esc = true;
		else if(e.which === 91)
			key.meta = true;
		else if (key.which === 219)
			key.lb = true;
		else if (key.which === 221)
			key.rb = true;
		else if (key.which === 32)
			key.space = true;

		if(e.which === 37)
			key.arrow = "LEFT";
		else if(e.which === 38)
			key.arrow = "UP";
		else if(e.which === 39)
			key.arrow = "RIGHT";
		else if(e.which === 40)
			key.arrow = "DOWN";

		if (edit_mode && ((key.ctrl && key.shift) || key.esc || key.tab /*test.tab*/)) {
			self.trigger("keydown", key);
			e.preventDefault();
			return false;
		} else if (!edit_mode && (key.ctrl || key.esc || key.tab || key.backspace || key.enter || key.arrow)) {
			self.trigger("keydown", key);
			e.preventDefault();
			return false;
		}
	})

	$(document).bind("keypress." + this.kbid, function(e) {
		if (!enabled || e.isDefaultPrevented()) return;
		key.char = String.fromCharCode(e.which);
		self.trigger("keydown", key);
	})

	/**
	 * Edit mode refers to a focused input or textarea.
	 * On edit mode, we let tabs, backspace, enter and arrow keys propagate normally.
	 * If the user is not editing a field, we capture those keys in a special event
	 */
	this.edit_mode = function(flag) {
		edit_mode = flag;
	}

	this.enable = function() {
		enabled = true;
	}

	this.disable = function() {
		enabled = false;
	}

	this.destroy = function() {
		this.unbind();
		$(document).unbind("keydown." + this.kbid);
		$(document).unbind("keypress." + this.kbid);
	}
}