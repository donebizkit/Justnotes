var View = View || {};

View.Dashboard = new function() {
    var self = this;
    var idx_active_panel = undefined;

    //# panels are appended in the array and prepended in the dashboard
    this.$panels = [];

    this.add = function(_note) {
        var note = render_note(_note.config);

        var $panel = $("<table></table>");
        $panel.attr("pindex", this.$panels.length);
        $panel.attr("visible", "true");
        this.$panels.push($panel);
        //...
        $panel
        .append (
            $("<tr></tr>")
            .append(
                $("<td></td>")
                .css("vertical-align", "top")
                .append(
                    $("<div></div>")
                    .addClass("timestamp")
                    .html(View.Page.pretty_date(new Date(_note.update_date)))
                )
            )
            .append(
                $("<td></td>")
                .css("vertical-align", "top")
                .append(
                    note[0]
                )
            )
        )
        //...
        $("#dashboard").prepend($panel);

        $panel.click(function() {
            if (Controller.Editor.is_open()) return;

            this.activated = this.activated || false;
            if (this.activated)
                self.activate(null);
            else
                self.activate($(this).attr("pindex"));
            this.activated = !this.activated;
        })

        //# map
        function pad(level) {
            var r = "";
            for (var i=0; i <= level; i++)
                r += "&nbsp;"
            return r;
        }
        function recursive(node, level) {
            var s = "", empty = false;
            if (node.title)
                s = "<div><i class='icon-minus icon-white'></i>&nbsp;" + node.title + "</div>";
            else if (node.heading)
                s = "<div>" + pad(level) + "<i class='icon-chevron-right icon-white'></i>&nbsp;" + node.heading + "</div>";
            else
                empty = true;

            if (node.sub) {
                for (var i=0; i < node.sub.length; i++) {
                    s += recursive(node.sub[i], empty ? level : level + 1);
                }
            }

            return s;
        }
        var map = recursive(note[1], 0);
        $("#map").prepend(
            $("<div></div>")
            .addClass("entry")
            .html(map)
        )

        return $panel;
    }

    this.replace = function(_note) {
        if (idx_active_panel === undefined) return;
        this.remove();
        var $panel = this.add(_note);
        return $panel;
    }

    this.remove = function() {
        if (idx_active_panel === undefined) return;
        this.$panels[idx_active_panel].remove();
        delete this.$panels[idx_active_panel];
        idx_active_panel = undefined;
    }

    function render_note(note)
    {
        var $note = $("<div></div>").addClass("note");
        var map = {};
        render_node($note, note.nodes, map);
        return [$note, map];
    }

    function render_node(container, node, map)
    {
        var sub_container = container;
        if (node.type === "root") {
            sub_container = $("<div></div>");
            container.append(
                sub_container
            )
        }
        else if (node.type === "title") {
            container
            .append(
                $("<div></div>")
                .addClass("note-title")
                .html(node.text.replace(/\n/g, "<br/>"))
            )

            map.title = node.text.replace(/\n/g, "<br/>");
        }
        else if (node.type === "heading") {
            container
            .append(
                $("<div></div>")
                .addClass("note-el-heading")
                .append(
                    $("<i></i>")
                    .addClass("icon-chevron-right")
                    .css("margin-right", "5px")
                )
                .append(
                    $("<span></span>")
                    .html(node.text.replace(/\n/g, "<br/>"))
                )
            )

            map.heading = node.text.replace(/\n/g, "<br/>");
        }
        else if (node.type === "text") {
            container
            .append(
                $("<div></div>")
                .html(node.text.replace(/\n/g, "<br/>"))
            )
        }
        else if (node.type === "url") {
            var url = node.text;
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

            container
            .append(
                $("<div></div>")
                .append(
                    $("<div></div>")
                    .addClass("label label-info")
                    .attr("title", url)
                    .css("cursor", "pointer")
                    .html(new_url)
                    .click(function(){
                        if (node.text.indexOf("://") === -1)
                            window.open("http://" + node.text, "_blank")
                        else
                            window.open(node.text, "_blank")
                    })
                )
            )
        }
        else if (node.type === "img") {
            var div = $("<div></div>").css("overflow", "hidden");
            var img = $("<img></img>");
            img.on('load', function(){
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
                $(this).width(w);
                $(this).height(h);
                div.css("width", "");
                div.css("height", "");
            })

            img.click(function() {
                window.open(node.text, "_blank")
            })

            container
            .append(
                div
                .width(200)
                .height(200)
                .append(
                    img
                    .attr("src", node.text)
                    .css("cursor", "pointer")
                    .css("position", "relative")
                )
            )
        }
        else if (node.type === "table") {
            sub_container = $("<table></table>");
            container.append(
                sub_container
                .addClass("note-el-table")
            )
        }
        else if (node.type === "tr") {
            sub_container = $("<tr></tr>");
            container.append(
                sub_container
            )
        }
        else if (node.type === "td") {
            sub_container = $("<td></td>");
            container.append(
                sub_container
            )
        }
        else if (node.type === "columns") {
            sub_container = $("<div></div>");
            container.append(
                sub_container
                .addClass("note-el-columns")
            )
        }
        else if (node.type === "column") {
            sub_container = $("<div></div>");
            container.append(
                sub_container
                .addClass("column")
            )
        }
        else if (node.type === "br") {
            container.append(
                $("<div></div>")
                .html("&nbsp;")
            )
        }

        if (node.sub) {
            map.sub = [];
            for (var i=0; i < node.sub.length; i++) {
                map.sub[i] = {};
                render_node(sub_container, node.sub[i], map.sub[i]);
            }
        }
    }

    this.prev = function() {
        var index = idx_active_panel;
        if (index === undefined)
            index = 0;
        else {
            index++;
            if (index === this.$panels.length)
                return;
        }

        while (true) {
            if (!this.$panels[index] || this.$panels[index].attr("visible") === "false") {
                index++;
                if (index === this.$panels.length)
                    return;
            }
            else
                break;
        }
        this.activate(this.$panels[index].attr("pindex"));
        return this.$panels[index];
    }

    this.next = function() {
        var index = idx_active_panel;
        if (index === undefined)
            index = this.$panels.length - 1;
        else {
            index--;
            if (index === -1)
                return;
        }
        while (true) {
            if (!this.$panels[index] || this.$panels[index].attr("visible") === "false") {
                index--;
                if (index === -1)
                    return;
            }
            else
                break;
        }
        this.activate(this.$panels[index].attr("pindex"));
        return this.$panels[index];
    }

    this.activate = function(index) {
        if (index !== undefined) {
            if (idx_active_panel !== undefined) {
                this.highlight_panel(this.$panels[idx_active_panel], false);
                idx_active_panel = undefined;
            }

            if (index !== null)
                idx_active_panel = index;
            else {
                idx_active_panel = undefined;
            }
        }

        if (idx_active_panel === undefined)
            return undefined;
        else {
            this.highlight_panel(this.$panels[idx_active_panel]);
            return this.$panels[idx_active_panel];
        }
    }

    this.highlight_panel = function($panel, yes) {
        if (yes === false)
            $panel.removeClass("panel-highlight")
        else {
            $panel.addClass("panel-highlight")
            $(window).scrollTop($panel.position().top - 50);
            $(window).scrollLeft(0);
        }
    }
}
