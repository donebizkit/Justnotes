var View = View || {};
View.Editor = {};

View.Editor.Editor = function(container) {
	Events(this);
	var self = this;

	this.$note = $("<div></div>");
	this.$title = undefined;
	this.$help = $("<div></div>");
	this.$selection_hint = $("<div></div>");
	// flag triggered by leaf nodes
	this.editing = false;
	this.kb = new Keyboard;

	// collection of elements in the note
	var nodes = undefined;

	function keydown(e, key) {
		if (key.ctrl && key.shift) {
			if (self.editing) {
				nodes.active(nodes.active());
			}
			else if (!self.editing && key.char === "S") {
				var skeleton = nodes.to_skeleton();
				var o = {
					nodes: skeleton
				}
				self.trigger("save", o);
			}
			else if (key.esc) {
				self.trigger("close", o);
			}
			else if (key.char === "N") {
				nodes.add("brb");
			}
			else if (key.char === "C")
			// hidden option
			{
				nodes.encapsulate_in_column();
			}
		}
		else if (key.tab) {
			if (key.shift) {
				if (nodes.is_active_node_in_td()) {
					var field = nodes.add("tr", true);
					if (field) field.edit();
				}
			}
			else {
				if (nodes.is_active_node_in_td()) {
					var field = nodes.add("td", true);
					if(field) field.edit();
				}
				else if (nodes.is_active_node_in_column()) {
					var field = nodes.add("column", true);
					if(field) field.edit();
				}
			}
		}
		else if (key.esc) {
			if (self.editing) {
				nodes.active(nodes.active());
			}
			else if (!nodes.active())
				self.trigger("close");
			else if (nodes.active().parent.type === "root")
				nodes.active(null);
			else {
				nodes.active(nodes.active().parent);
				if (["td", "tr", "column"].indexOf(nodes.active().type) !== -1)
					keydown(undefined, {esc: true});
			}
		}
		else if (!self.editing) {
			if (key.char) key.char = key.char.toUpperCase();

			if (key.char === "F") {
				var field = nodes.add("text", true);
				field.edit();
			}
			if (key.char === "H") {
				var field = nodes.add("heading", true);
				field.edit();
			}
			else if (key.char === "U") {
				var url = nodes.switch_field("url");
				if (url) {
					url.edit();
					url.edit(false);
					nodes.active(url);
				}
			}
			else if (key.char === "I") {
				var img = nodes.switch_field("img");
				if (img) {
					img.edit();
					img.edit(false);
					nodes.active(img);
				}
			}
			else if (key.char === "T") {
				var field = nodes.add("table", true);
				field.edit();
			}
			else if (key.char === "C") {
				var field = nodes.add("columns", true);
				field.edit();
			}
			else if (key.backspace) {
				nodes.remove();
			}
			else if (key.enter)
				nodes.active().edit();
			else if (key.char === "N") {
				nodes.add("br");
			}
			else if (key.arrow) {
				if (key.arrow === "LEFT") {
					var prev = nodes.prev_field();
				}
				else if (key.arrow === "RIGHT") {
					var next = nodes.next_field();
				}
				else if (key.arrow === "UP") {
					var prev = nodes.prev_jump_field();
				}
				else if (key.arrow === "DOWN") {
					var next = nodes.next_jump_field();
				}
			}
		}

		update_help();

		//! FIXME: In ie, if an element is being edited, update_help makes it loose focus and the two lines below hung IE check why
		//if (nodes.active() && nodes.active().is_edited && !nodes.active().$edit.find("textarea").is(":focus"))
			//nodes.active().$edit.find("textarea").focus();
	}

	function update_help() {
		var help = [];
		var level = 0;
		self.$help.html("");

		var active_node = nodes.active();

		if (active_node) {
			if (active_node.is_edited) {
				level++;
				help.push([level, ["ctrl shift", "esc"], "Exit Edit Mode", {esc: true}]);
			}

			if (!active_node.is_edited) {
				if (["table", "tr", "td", "columns", "column", "br"].indexOf(active_node.type) === -1) {
					level++;
					help.push([level, "ENTER", "Edit", {enter: true}]);
				}

				if (active_node.type != "title") {
					help.push([level, "BACKSPACE", "Delete Field", {backspace: true}]);
				}

				if (!active_node.is_edited && ["text", "img", "url"].indexOf(active_node.type) != -1) {
					level++;
					help.push([level, "U", "Switch to URL Field", {char: "U"}]);
					help.push([level, "I", "Switch to IMG Field", {char: "I"}]);
				}
			}

			if (active_node.parent && active_node.parent.type === "td") {
				level++;
				help.push([level, "tab", "Insert Cell", {tab: true}]);
				help.push([level, "shift tab", "Insert Row", {shift: true, tab: true}]);
			}

			if (active_node.parent && active_node.parent.type === "column") {
				level++;
				help.push([level, "tab", "Insert Column", {tab: true}]);
			}
		}

		if (!active_node || !active_node.is_edited) {
			level++;
			help.push([level, "N", "New Line", {char: "N"}]);
			help.push([level, "F", "New Field", {char: "F"}]);
			help.push([level, "T", "New Table", {char: "T"}]);
			help.push([level, "C", "New Column", {char: "C"}]);

			level++;
			help.push([level, "ctrl shift S", "Save Note", {ctrl:true, shift: true, char: "S"}]);
			help.push([level, "ctrl shift ESC", "Close Editor", {ctrl:true, shift: true, esc: true}]);
		}


		var old_level = help[0][0], labels;
		$.each(help, function(index, item) {
			if (old_level != item[0]) {
				self.$help.append(
					$("<hr/>")
				)
				old_level = item[0];
			}

			labels = $("<span></span>").css("margin-left", "10px");
			if (typeof item[1] === "string")
				item[1] = [item[1]];
			for (var i=0; i < item[1].length; i++) {
				if (i > 0) {
					labels .append(
						$("<span><span>")
						.html("||")
					)
				}

				labels
				.append(
					$("<span><span>")
					.addClass("label label-inverse")
					.html(item[1][i])
					.css("cursor", !item[3] ? "" : "pointer")
					.click(function(){
						if (item[3])
							keydown(null, item[3]);
					})
				)
			}

			self.$help.append(
				$("<div></div>")
				.append(
					$("<div><div>")
					.css("width", "150px")
					.css("display", "inline-block")
					.css("border-bottom", !item[3] ? "" : "1px solid #eee")
					.css("cursor", !item[3] ? "" : "pointer")
					.html(item[2])
					.click(function(){
						if (item[3])
							keydown(null, item[3]);
					})
				)
				.append(
					labels
				)
			)
		})
	}

	this.apply = function(skeleton) {
		nodes.from_skeleton(skeleton);
		update_help();
	}

	this.destroy = function() {
		this.kb.destroy();
		this.$note.remove();
		this.$help.remove();
	}

	//# INIT
	container
	.addClass("note-editor")
	.html("");

	//! gave up on cross browser issues and used tables.
	// tried floats and inside-blocks and it craps when trying to NOT break the help div
	// to a newline when the note is too large
	container
	.append(
		$("<table></table>").append($("<tr></tr>")
			.append(
				$("<td></td>")
				.append(
					$("<div></div>")
					.append(
						this.$note
						.addClass("note")
					)
				)
			)
			.append(
				$("<td></td>")
				.append(
					$("<div></div>")
					.addClass("help")
					.append(
						this.$selection_hint
						.addClass("help-selection")
					)
					.append(
						this.$help
						.addClass("help-body")
					)
				)
			)
		)
	)

	nodes = new View.Editor.Nodes(this);
	nodes.init();
	this.$title = nodes.add("title");
	this.$title.edit();
	setTimeout(function() {
		// Hack to refocus title field in case the home page does any DOM manip after adding the editor
		if (nodes.active())
			nodes.active().$edit.find("textarea").focus();
	}, 300)
	update_help();

	this.kb.bind("keydown", keydown);
}

View.Editor.Nodes = function(ed) {
	var self = this;

	this.ed = ed;

	var root = undefined;
	var active_node = undefined;

	this.init = function() {
		root = new View.Editor.Node(this, "root");
		ed.$note.append(root.el);
		this.active(root);
	}

	/**
	 * smart_mode === true :
	 *	 - auto insert sub elements when we add, table, tr, td, columns, column
	 *   - replace empty field with inserted fields insteading of appending them after
	 */
	this.add = function(type, smart_mode) {
		var node;

		if (!active_node) {
			this.active(root.sub[root.sub.length - 1]);
		}

		var placeholder;
		if (active_node.type === "placeholder")
			placeholder = active_node;
		else if (["heading", "text"].indexOf(active_node.type) !== -1 && active_node.text === "")
			placeholder = active_node;

		if (type === "title")
		{
			node = new View.Editor.Node(this, type);
			active_node.el.append(node.el);
			this.pushin(node);
			this.active(node);
		}
		else if (type === "br")
		{
			var node = new View.Editor.Node(this, "br");
			node.el.insertAfter(active_node.el);
			this.push(node);
			this.active(node);
		}
		else if (type === "brb")
		{
			if(!active_node || active_node.type === "title") return;

			var node = new View.Editor.Node(this, "br");
			node.el.insertBefore(active_node.el);
			this.push(node, true);
			this.active(node);
		}
		else if (type === "text")
		{
			node = new View.Editor.Node(this, type);
			node.el.insertAfter(active_node.el);
			this.push(node);
			//...
			if (placeholder) {
				this.active(placeholder);
				this.remove();
			}
			//...
			this.active(node);
		}
		else if (type === "heading")
		{
			node = new View.Editor.Node(this, type);
			node.el.insertAfter(active_node.el);
			this.push(node);
			//...
			if (placeholder) {
				this.active(placeholder);
				this.remove();
			}
			//...
			this.active(node);
		}
		else if (type === "table")
		{
			var table = new View.Editor.Node(this, "table");
			table.el.insertAfter(active_node.el);
			this.push(table);
			//...
			if (placeholder) {
				this.active(placeholder);
				this.remove();
			}
			//...
			this.active(table);

			if (!smart_mode) {
				node = table;
				this.active(node);
			} else {
				var tr = new View.Editor.Node(this, "tr");
				table.el.append(tr.el);
				this.pushin(tr);
				this.active(tr);

				var td = new View.Editor.Node(this, "td");
				tr.el.append(td.el);
				this.pushin(td);
				this.active(td);

				node = new View.Editor.Node(this, "text");
				td.el.append(node.el);
				this.pushin(node);
				this.active(node);
			}
		}
		else if (type === "tr")
		{
			var tr;
			if (active_node.type === "table") {
				tr = new View.Editor.Node(this, "tr");
				active_node.el.append(tr.el);
				this.pushin(tr);
				this.active(tr);

			}
			else if (active_node.parent && active_node.parent.type === "td") {
				this.active(active_node.parent.parent);

				tr = new View.Editor.Node(this, "tr");
				tr.el.insertAfter(active_node.el)
				this.push(tr);
				this.active(tr);
			}
			else
				//if (!active_node.parent || active_node.parent.type !== "td") return false;
				return false;

			if (!smart_mode) {
				node = tr;
				this.active(node);
			} else {
				var td = new View.Editor.Node(this, "td");
				tr.el.append(td.el);
				this.pushin(td);
				this.active(td);

				node = new View.Editor.Node(this, "text");
				td.el.append(node.el);
				this.pushin(node);
				this.active(node);
			}
		}
		else if (type === "td")
		{
			var td;
			if (active_node.type === "tr") {
				td = new View.Editor.Node(this, "td");
				active_node.el.append(td.el);
				this.pushin(td);
				this.active(td);
			}
			else if (active_node.parent && active_node.parent.type === "td") {
				this.active(active_node.parent);

				td = new View.Editor.Node(this, "td");
				td.el.insertAfter(active_node.el);
				this.push(td);
				this.active(td);
			}
			else
				//if (!active_node.parent || active_node.parent.type !== "td") return false;
				return false;

			if (!smart_mode) {
				node = td;
				this.active(node);
			} else {
				node = new View.Editor.Node(this, "text");
				td.el.append(node.el);
				this.pushin(node);
				this.active(node);
			}
		}
		else if (type === "columns")
		{
			var columns = new View.Editor.Node(this, "columns");
			this.push(columns);
			columns.el.insertAfter(active_node.el);
			//...
			if (placeholder) {
				this.active(placeholder);
				this.remove();
			}
			//...
			this.active(columns);

			if (!smart_mode) {
				node = columns;
				this.active(node);
			} else {
				var column = new View.Editor.Node(this, "column");
				columns.el.prepend(column.el);
				this.pushin(column);
				this.active(column);

				node = new View.Editor.Node(this, "text");
				column.el.append(node.el);
				this.pushin(node);
				this.active(node);
			}
		}
		else if (type === "column")
		{
			var column;
			if (active_node.type === "columns") {
				column = new View.Editor.Node(this, "column");
				active_node.el.append(column.el);
				this.pushin(column);
				this.active(column);
			}
			else if (active_node.parent && active_node.parent.type === "column") {
				this.active(active_node.parent);

				column = new View.Editor.Node(this, "column");
				column.el.insertAfter(active_node.el);
				this.push(column);
				this.active(column);
			}
			else
				//if (!active_node.parent || active_node.parent.type !== "column") return false;
				return false;


			if (!smart_mode) {
				node = column;
				this.active(node);
			} else {
				node = new View.Editor.Node(this, "text");
				column.el.append(node.el);
				this.pushin(node);
				this.active(node);
			}
		}
		else if (type === "placeholder") {
			node = new View.Editor.Node(this, type);
			active_node.el.append(node.el);
			this.pushin(node);
			this.active(node);
		}

		return node;
	}

	this.switch_field = function(type) {
		if (!active_node || ["text", "url", "img"].indexOf(active_node.type) < 0) return;

		var node = active_node;
		node.edit(false);
		node.set_type(type);
		return node;
	}

	this.remove = function() {
		if(!active_node || active_node.type === "title") return;

		if (active_node.prev)
			active_node.prev.next = active_node.next;
		if (active_node.next)
			active_node.next.prev = active_node.prev;

		var idx = active_node.parent.sub.indexOf(active_node);
		active_node.parent.sub.splice(idx, 1);
		//...
		active_node.el.remove();

		if (active_node.prev) {
			this.active(active_node.prev);
			if (["tr", "td", "column"].indexOf(active_node.type) !== -1)
				self.prev_field();
		}
		else if (active_node.next) {
			this.active(active_node.next);
			if (["tr", "td", "column"].indexOf(active_node.type) !== -1)
				self.next_field();
		}
		else {
			this.active(active_node.parent);
			this.remove();
		}
	}

	this.push = function(node, before) {
		if (!active_node) throw new Error("There are no active nodes.");

		var parent = active_node.parent;

		if (before === true) {
			node.prev = active_node.prev;
			if (node.prev) node.prev.next = node;
			node.next = active_node;
			if (node.next) node.next.prev = node;
			node.parent = parent;
		} else {
			node.next = active_node.next;
			if (node.next) node.next.prev = node;
			node.prev = active_node;
			if (node.prev) node.prev.next = node;
			node.parent = parent;
		}

		node._index = parent.sub.indexOf(node.prev) + 1;
		parent.sub.splice(node._index, 0, node);
	}

	this.pushin = function(node) {
		if (!active_node) throw new Error("There are no active nodes.");
		if (active_node.sub.length != 0) throw new Error("Active node is not empty.");

		node.parent = active_node;
		active_node.sub = [node];
	}

	this.active = function(node) {
		if (node !== undefined)
		//! a value of null is allowed to deactivate everything
		{
			if(active_node) {
				active_node.highlight(false);
				active_node.edit(false);
			}
			active_node = node === null ? undefined : node;
			if (active_node)
				active_node.highlight();

			if (!active_node)
				ed.$selection_hint.html("no selection");
			else {
				var hint = {};
				hint.title = "Title";
				hint.text = "Text field";
				hint.url = "Url field";
				hint.img = "Image field";
				hint.table = "Table";
				hint.td = "Cell";
				hint.columns = "Columns";
				hint.column = "Column";
				hint.br = "Empty Line";
				hint.heading = "Heading";

				var text = hint[active_node.type];
				var cur = active_node;
				while (cur = cur.parent) {
					if (hint[cur.type])
						text = hint[cur.type] + " / " + text;
				}
				ed.$selection_hint.html(text);
			}
		}

		return active_node;
	}

	this.next = function() {
		if (!active_node)
			return this.active(root.sub[0]);

		if (active_node.sub.length)
			return this.active(active_node.sub[0]);

		var cur = active_node;
		while (!cur.next && cur.type !== "root")
			cur = cur.parent;

		if (cur.type === "root")
			return this.active(root.sub[0]);
		else
			return this.active(cur.next);
	}

	this.next_field = function() {
		var next = this.next();
		while(["title", "heading", "text", "img", "url", "br"].indexOf(next.type) < 0)
			next = this.next();
	}

	this.prev = function() {
		if (!active_node)
			return this.active(root.sub[root.sub.length - 1]);

		if(active_node.sub.length)
			return this.active(active_node.sub[active_node.sub.length - 1]);

		var cur = active_node;
		while (!cur.prev && cur.type !== "root")
			cur = cur.parent;

		if (cur.type === "root")
			return this.active(root.sub[root.sub.length - 1]);
		else
			return this.active(cur.prev);
	}

	this.prev_field = function() {
		var prev = this.prev();
		while(["title", "heading", "text", "img", "url", "br"].indexOf(prev.type) < 0)
			prev = this.prev();
	}

	this.next_jump = function() {
		if (!active_node)
			return this.active(root.sub[0]);

		if (active_node.next)
			return this.active(active_node.next);
		else {
			var cur = active_node;
			while (!cur.next && cur.type !== "root")
				cur = cur.parent;

			if (cur.type === "root")
				return this.active(root.sub[0]);
			else
				return this.active(cur.next);
		}
	}

	this.next_jump_field = function() {
		var next = this.next_jump();
		while(["table", "columns", "title", "heading", "text", "img", "url", "br"].indexOf(next.type) < 0)
			next = this.next_jump();
	}

	this.prev_jump = function() {
		if (!active_node)
			return this.active(root.sub[root.sub.length - 1]);

		if (active_node.prev)
			return this.active(active_node.prev);
		else {
			var cur = active_node;
			while (!cur.prev && cur.type !== "root")
				cur = cur.parent;

			if (cur.type === "root")
				return this.active(root.sub[root.sub.length - 1]);
			else
				return this.active(cur.prev);
		}
	}

	this.prev_jump_field = function() {
		var prev = this.prev_jump();
		while(["table", "columns", "title", "heading", "text", "img", "url", "br"].indexOf(prev.type) < 0)
			prev = this.prev_jump();
	}

	this.to_skeleton = function() {
		if (active_node) this.active(null);

		var recursive = function(node) {
			if (["title", "heading", "text", "url", "img", "br"].indexOf(node.type) != -1) {
				var data = {type: node.type, text: node.text};
				return data;
			}
			else if (node.sub.length) {
				var data = {type: node.type, sub: []}
				for (var i=0; i < node.sub.length; i++)
					data.sub.push(recursive(node.sub[i]))
				return data;
			}
		}

		var data = recursive(root);
		return data;
	}

	this.from_skeleton = function(skeleton) {
		var recursive = function(node, level) {
			var n;

			//console.log("inserting:", node.type);
			//console.log("active:", active_node ? active_node.type : "none");

			if (node.type === "root") {
				self.active(null);
			}
			else if (node.type === "title")
			{
				ed.$title.text = node.text;
				ed.$title.edit(); ed.$title.edit(false);
				self.active(ed.$title);
			}
			else
			{
				if (["url", "img"].indexOf(node.type) != -1) {
					n = self.add("text");
					self.switch_field(node.type);
				}
				else {
					n = self.add(node.type);

					if (["td", "column"].indexOf(node.type) != -1) {
						// force content to go in those fields instead of after it
						self.add("placeholder");
					}
				}

				if (node.text) {
					n.text = node.text;
					// trigger text update in UI
					n.edit(); n.edit(false);
				}
			}

			node.$n = n;

			if (node.sub) {
				//console.group();
				for (var i=0; i < node.sub.length; i++) {
					recursive(node.sub[i]);
					//console.log("done > active:", active_node ? active_node.type : "none")
					//console.log("done > activating:", node.sub[i].type)

					if (["tr", "td", "column"].indexOf(node.sub[i].type) === -1)
						self.active(node.sub[i].$n);
				}
				//console.groupEnd();
			}
		}

		recursive(skeleton.nodes, 1);
		self.active(null);
	}

	this.is_active_node_in_td = function() {
		if (active_node && active_node.parent && active_node.parent.type === "td")
			return true;
		return false;
	}

	this.is_active_node_in_column = function() {
		if (active_node && active_node.parent && active_node.parent.type === "column")
			return true;
		return false;
	}

	this.encapsulate_in_column = function() {
		var body = root.sub.splice(1);
		self.active(root.sub[0])

		var columns = this.add("columns");
		self.active(columns);
		var column = this.add("column");
		self.active(column);

		for (var i=0; i < body.length; i++) {
			column.el.append(body[i].el);
			if (i === 0)
				this.pushin(body[i]);
			else
				this.push(body[i]);
			self.active(body[i]);
		}
	}

	this.print = function() {
		console.clear();
		function recursive(nodes, level) {

			for (var i=0; i < nodes.length; i++) {
				var txt = ""
				for (var j=0; j < level; j++)
					txt += "-";
				console.log(txt + " " + nodes[i].type + " " + (nodes[i].text || ""))
				if (nodes[i].sub)
					recursive(nodes[i].sub, level + 1);
			}
		}
		recursive(root.sub, 1);
	}
}

View.Editor.Node = function(nodes, type) {
	var self = this;
	this.el = undefined;
	this.text = undefined;
	//...
	this.sub = [];
	this.prev = undefined;
	this.next = undefined;
	this.parent = undefined;
	//...
	this.is_highlighted = false;
	this.is_edited = false;

	this.set_type = function(type)
	{
		this.type = type;

		if (this.$display)
			this.$display.remove();
		if (this.$edit)
			this.$edit.remove();

		if (this.type === "root") {
			this.el = $("<div></div>");
		}
		else if (this.type === "title")
		{
			this.el = $("<div></div>").addClass("note-title");
			this.$display = $("<div></div>").addClass("hide");
			this.$edit = $("<div></div>")
						.append(
							$("<textarea></textarea>")
							.attr("rows", "1")
							//.addClass("nowrap")
						)
						.addClass("hide");
			this.$edit_div = $("<div></div>").addClass("edit_div")
			this.el.append(this.$display).append(this.$edit).append(this.$edit_div);

			this.$display.click(function(e) {
				nodes.active(self).edit();
			})
			this.$edit.find("textarea").keyup(function(e){
				var el = $(this);
				this.value = this.value.split("\n")[0];

				self.$edit_div.html(this.value);
				el.width(self.$edit_div.width() + 50);
			})
		}
		else if (this.type === "heading")
		{
			this.el = $("<div></div>").addClass("note-el-heading");
			this.$display = $("<div></div>")
							.addClass("hide")
							.append(
								$("<i></i>")
								.addClass("icon-chevron-right")
								.css("margin-right", "5px")
							)
							.append(
								$("<span></span>")
							)
			this.$edit = $("<div></div>")
						.append(
							$("<textarea></textarea>")
							.attr("rows", "1")
						)
						.addClass("hide");
			this.$edit_div = $("<div></div>").addClass("edit_div")
			this.el.append(this.$display).append(this.$edit).append(this.$edit_div);

			this.$display.click(function(e) {
				nodes.active(self).edit();
			})
			this.$edit.find("textarea").keyup(function(e){
				var el = $(this);
				this.value = this.value.split("\n")[0];

				self.$edit_div.html(this.value);
				el.width(self.$edit_div.width() + 50);
			})
		}
		else if (this.type === "text")
		{
			if (!this.el) this.el = $("<div></div>")
			this.$display = $("<div></div>").addClass("hide");
			this.$edit = $("<div></div>")
						.append(
							$("<textarea></textarea>")
						)
						.addClass("hide");
			this.$edit_div = $("<div></div>").addClass("edit_div")
			this.el.append(this.$display).append(this.$edit).append(this.$edit_div);

			this.$display.click(function(e) {
				nodes.active(self).edit();
			})
			this.$edit.find("textarea").keyup(function(e) {
				var el = $(this);
				this.rows = this.value.split("\n").length + 1;

				self.$edit_div.html(this.value.replace(/\n/g, "<br/>"));
				el.width(self.$edit_div.width() + 50);
			})
		}
		else if (this.type === "url")
		{
			if (!this.el)
				this.el = $("<div></div>");

			this.$display = $("<div></div>").addClass("label label-info hide");
			this.$edit = $("<div></div>")
						.append(
							$("<div></div>")
							.html("url:")
						)
						.append(
							$("<textarea></textarea>")
							.addClass("url")
						)
						.addClass("hide");
			this.el.append(this.$display).append(this.$edit);

			this.$display.click(function(e) {
				nodes.active(self).edit();
			})
			this.$edit.find("textarea").keyup(function(e){
				while (this.rows > 1 && this.scrollHeight < this.offsetHeight)
					this.rows--;
				while (this.scrollHeight > this.offsetHeight)
					this.rows++;
				this.rows++;
			})
		}
		else if (this.type === "img")
		{
			if (!this.el)
				this.el = $("<div></div>")

			this.$display = $("<div></div>")
							.width(200)
							.height(200)
			this.$display.append(
							 $("<img></img>")
						)
			this.$edit = $("<div></div>")
						.append(
							$("<div></div>")
							.html("image url:")
						)
						.append(
							$("<textarea></textarea>")
							.addClass("img")
						)
						.addClass("hide");
			this.el.append(this.$display).append(this.$edit);

			this.$display.click(function(e) {
				nodes.active(self).edit();
			})
			this.$display.children("img").on('load', function(){
				var w = this.width, h = this.height;
				var ratio = w / h;
				if(w >= h && w > 200) {
					w = 200;
					h = w / ratio;
				}
				else if(h > w && h > 200) {
					h = 200;
					w = h * ratio;
				}
				$(this).width(w)
				$(this).height(h)
				self.$display.css("width", "");
				self.$display.css("height", "");
			})
			this.$edit.find("textarea").keyup(function(e){
				while (this.rows > 1 && this.scrollHeight < this.offsetHeight)
					this.rows--;
				while (this.scrollHeight > this.offsetHeight)
					this.rows++;
				this.rows++;
			})
		}
		else if (this.type === "table") {
			if (!this.el) this.el =
				$("<table></table>")
				.addClass("note-el-table");
		}
		else if (this.type === "tr") {
			if (!this.el) this.el = $("<tr></tr>");
		}
		else if (this.type === "td") {
			if (!this.el) this.el = $("<td></td>");
		}
		else if (this.type === "columns") {
			if (!this.el) {
				this.el =
				$("<div></div>")
				.addClass("note-el-columns");
			}
		}
		else if (this.type === "column") {
			if (!this.el) this.el =
				$("<div></div>")
				.addClass("column")
		}
		else if (this.type === "br") {
			if (!this.el) {
				this.el = $("<div></div>");
				this.el.html("&nbsp;")
			}
		}
		else if (this.type === "placeholder") {
			if (!this.el) {
				this.el = $("<div></div>");
				this.el.html("&nbsp;")
			}
		}
	};
	this.set_type(type);

	this.highlight = function(yes) {
		if (yes === false) {
			this.el.removeClass("note-el-highlight");
			this.is_highlighted = false;
		}
		else {
			this.el.addClass("note-el-highlight")
			this.is_highlighted = true;
		}
	}

	this.edit = function(yes) {
		if (["root", "table", "tr", "td", "columns", "column", "br", "placeholder"].indexOf(this.type) >= 0) return;

		if (yes === false)
		//> hide
		{
			this.text = this.$edit.find("textarea").val();
			this.$edit.addClass("hide");
			this.$display.removeClass("hide");

			if (this.type === "url") {
				var url = this.text;
				if (url.indexOf("://") > 0 && url.indexOf("://") < 10)
					url = url.substring(url.indexOf("://") + 3);

				var new_url, url_part = "";
	            var tokens = url.split('/');
	            new_url = tokens[0];
	            if (tokens.length > 1) {
	                url_part = "/" + tokens[1].split('?')[0].split('#')[0];
	                if (url_part === "/")
	                    url_part = "";
	                if (tokens.length > 2)
	                    url_part += "/...";

	                if ((new_url + url_part).length > 30)
	                    url_part = "/...";
	            }
	            new_url += url_part;

				this.$display
				.attr("title", url)
				.html(new_url);
			}
			else if (this.type === "img") {
				this.$display.children("img").attr("src", this.text);
			}
			else if (this.type === "heading") {
				this.$display.children("span").html(this.text);
			}
			else
				this.$display.html(this.text.replace(/\n/g, '<br/>'));

			this.is_edited = false;
			nodes.ed.editing = false;
			nodes.ed.kb.edit_mode(false);
		}
		else
		//> show
		{
			this.highlight(false);
			this.$display.addClass("hide");
			this.$edit.removeClass("hide");
			// without setTimeout the textarea picks up key.char of the command that created the element
			// i.e ctrl-shift F will populate the textarea with "F"
			var self = this;
			setTimeout(function(){ self.$edit.find("textarea").focus() }, 0);
			this.$edit.find("textarea").val(this.text);

			this.is_edited = true;
			nodes.ed.editing = true;
			nodes.ed.kb.edit_mode(true);
		}
	}
}