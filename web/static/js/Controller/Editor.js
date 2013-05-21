var Controller = Controller || {};

Controller.Editor = new function() {
    var editor = undefined;
    var editing_note_id = undefined;

    this.open_new = function() {
        if (editor) return;

        editing_note_id = undefined;
        var editor = open();
        $(window).scrollTop(0);
        $(window).scrollLeft(0);
        return editor;
    }

    this.open_edit = function() {
        if (editor) return;

        var $active_panel = View.Dashboard.activate();
        editing_note_id = $active_panel.attr("note-id");
        //...
        var _note = Model.Notes.byid(editing_note_id);
        //...
        var editor = open();
        editor.apply(_note.config);
        $(window).scrollTop(0);
        $(window).scrollLeft(0);
    }

    function open() {
        editor = new View.Editor.Editor($("#note-editor-container"));
        $("#note-editor-container").removeClass("hide");

        editor.bind("save", function(e, config) {
            Model.Notes.save(editing_note_id, config, function(note) {
                if (editing_note_id === undefined) {
                    View.Dashboard.activate(null);
                    var $panel = View.Dashboard.add(note);
                    $panel.attr("note-id", note.note_id);
                } else {
                    var $panel = View.Dashboard.replace(note);
                    $panel.attr("note-id", note.note_id);
                }
                Controller.Editor.close();
                View.Dashboard.activate($panel.attr("pindex"));
            });
        })

        editor.bind("close", function(e) {
            var yes = confirm("Any changes will be lost. Do you want to close the editor?");
            if (yes)
                Controller.Editor.close();
        })

        return editor;
    }

    this.close = function() {
        if (!editor) return;
        editor.destroy();
        editor = undefined;
        editing_note_id = undefined;
        $("#note-editor-container").html("");
        $("#note-editor-container").addClass("hide");
        Controller.Page.kb.enable();
    }

    this.is_open = function() {
        return editor !== undefined;
    }
}
