var View = View || {};
var Controller = Controller || {};

View.Page = new function() {
    this.close_sub_menu = function() {
        $("#sub-menu").children().hide();
    }

    this.show_sub_menu = function(i) {
        this.close_sub_menu();
        $("#hint-" + i).show();
    }

    this.is_hidden = function(i) {
        return $("#hint-" + i).css("display") === "none" ? true : false;
    }

    this.shade_color = function(color, percent) {
        var num = parseInt(color.slice(1),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
    }

    this.pretty_date = function(date)
    {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        var day = date.getDate() + "";
        var month = months[date.getMonth()] + "";
        var year = (date.getFullYear() + "").substring(2);
        if (new Date().getFullYear() - date.getFullYear() == 0) year = "";
        var hours = date.getHours() + "";
        if (hours.length === 1) hours = "0" + hours;
        var minutes = date.getMinutes() + "";
        if (minutes.length === 1) minutes = "0" + minutes;
        return day + "<br/>" + month + "<br/>" + year + "<br/>" + hours + ":" + minutes;
    }
}

Controller.Page = new function() {
    var self = this;

    $("button.close").click(function() {
        View.Page.close_sub_menu();
    })

    $("#help").click(function() {
        if (View.Page.is_hidden(1))
            View.Page.show_sub_menu(1);
        else
            View.Page.close_sub_menu();
    })

    $("#view-demo").click(function() {
        window.open("http://youtu.be/NIOyv6Z-5_o");
    })

    $("#contact").click(function() {
        if (View.Page.is_hidden(2))
            View.Page.show_sub_menu(2);
        else
            View.Page.close_sub_menu();
    })

    $("#menu-brand").click(function() {
        window.location = "/";
    })

    $("#logout").click(function() {
        $("#form-key").val("1")
        $("#form").submit();
    })

    $("#search").blur(function() {
        self.kb.edit_mode(false);
    })

    this._searchkey = "";
    $("#search").val("");
    $("#search").keyup(function() {
        if (self.searchTimeout)
            clearTimeout(self.searchTimeout);

        self._searchkey = $(this).val();
        self.searchTimeout = setTimeout(function() {
            if (self._searchkey.trim().length != 0) {
                var ids = Model.Notes.search(self._searchkey.trim());
                Controller.Dashboard.filter(ids);
            } else {
                Controller.Dashboard.filter(null);
            }
        }, 500)
    })

    this.kb = new Keyboard;
    this.kb.bind("keydown", function(e, key) {
        if ((key.ctrl && key.shift && key.char === "N") || (key.ctrl && key.shift && key.char === "Z")) {
            self.kb.disable();
            Controller.Editor.open_new();
        }
        else if (
            (key.ctrl && key.shift && key.char === "E") ||
            (key.enter)
        ) {
            if (!View.Dashboard.activate()) return;
            self.kb.disable();
            Controller.Editor.close();
            Controller.Editor.open_edit();
        }
        else if (
            (key.ctrl && key.shift && key.char === "D") ||
            (key.ctrl && key.shift && key.backspace)
        ) {
            var active_node = View.Dashboard.activate();
            if (!active_node) return;
            var yes = confirm("Are you sure you want to delete the selected note?");
            if(yes)
                Controller.Dashboard.remove(active_node.attr("note-id"));
        }
        else if (key.arrow) {
            if (Controller.Editor.is_open()) return;
            if (key.arrow === "RIGHT" || key.arrow === "DOWN")
                View.Dashboard.next();
            else if (key.arrow === "LEFT" || key.arrow === "UP")
                View.Dashboard.prev();
        }
        else if (key.esc) {
            $("#search").blur();
            View.Dashboard.activate(null);
        }
        else if (key.ctrl && key.shift && key.char === "M") {
            if ($("#map").hasClass("hide"))
                $("#map").removeClass("hide")
            else
                $("#map").addClass("hide")
        }
        else if (!key.ctrl && !key.shift) {
            self.kb.edit_mode(true);
            if (!$("#search").is(":focus")) {
                $("#search").focus();
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
                     //! FIX ME: firefox dosn't propagate the key after focus. find a cleaner solution
                     $("#search").val($("#search").val() + key.char);
             }
        }
    })

    if (window.location.pathname === "/play") {
        $("#logout span").html("| exit playground");
    }
}

$(function() {
    var browser = get_browser();
    var errbrow = undefined;
    if (browser.IE6) errbrow = "IE6";
    else if (browser.IE7) errbrow = "IE7";
    //else if (browser.OPERA) errbrow = "OPERA";
    if (errbrow) {
        window.location = '/';
        return;
    }
    // diable caching
    $.ajaxSetup({ cache: false });

    Controller.Dashboard.render();
});

(function() {
    var cookies = document.cookie.split(';');
    var _cookie = [];
    for(var cookie in cookies) {
        if (!cookies.hasOwnProperty(cookie)) continue;
        var cookie_part = cookies[cookie].trim().split('=')
        if (cookie_part.length === 2)
            _cookie[cookie_part[0].trim()] = cookie_part[1].trim();
    }
    if (_cookie["GA"] === "true")
        enable_google_analytics();
})();