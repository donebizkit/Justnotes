var Controller = Controller || {};

Controller.Dashboard = new function() {

    this.render = function() {
        Model.Notes.load(function(_notes) {
            for (var i = _notes.length - 1; i >= 0; i--) {
                var $panel = View.Dashboard.add(_notes[i]);
                $panel.attr("note-id", _notes[i].note_id);
            }
        });
    }

    this.remove = function(note_id) {
        Model.Notes.remove(note_id, function() {
            View.Dashboard.remove();
        })
    }

    this.filter  = function(ids) {
        var panels = View.Dashboard.$panels;
        for (var i=0; i < panels.length; i++) {
            panels[i].attr("visible", "true");
            panels[i].show();
            if (ids === null) {
                // signal to remove filter and show everything
            }
            else if (ids.indexOf(+panels[i].attr("note-id")) === -1) {
                panels[i].attr("visible", "false");
                panels[i].hide();
            }
        }
    }
}
