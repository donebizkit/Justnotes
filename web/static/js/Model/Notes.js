var Model = Model || {};

Model.Notes = new function() {
    var self = this;
    this.notes = undefined;
    var playground_fake_id = 1000;

    this.load = function(callback) {
        $.get("/ajax/data?req=get_notes", function(response) {
            self.notes = [];
            for (var i=0; i < response.length; i++) {
                response[i].config = JSON.parse(response[i].config);
                self.notes.push(response[i])
            }

            callback(self.notes);
        })
    }

    this.byid = function(id) {
        if (!this.notes) return undefined;
        if (typeof id === "string") id *= 1;
        for (var i=0; i < this.notes.length; i++) {
            if (this.notes[i].note_id === id)
                return this.notes[i];
        }
        return undefined;
    }

    this.index_byid = function(id) {
        if (!this.notes) return undefined;
        if (typeof id === "string") id *= 1;
        for (var i=0; i < this.notes.length; i++) {
            if (this.notes[i].note_id === id)
                return i;
        }
        return undefined;
    }

    this.save = function(id, config, callback) {
        var note = {
            note_id: id,
            update_date: new Date(),
            config: config
        }

        $.post("/ajax/data?req=save", JSON.stringify(note), function(response) {
            if (!id) {
                if (window.location.pathname === "/play") {
                    // hack :(
                    response = {id: playground_fake_id};
                    playground_fake_id++;
                }

                self.add(response.id, note.config);
                note.note_id = response.id * 1;
            } else {
                self.update(note.note_id, note.config);
            }
            callback(note);
        })
    }

    this.remove = function(id, callback) {
        $.post("/ajax/data?req=delete", JSON.stringify({note_id: id}), function(response) {
            self.notes.splice(self.index_byid(id), 1);
            callback();
        })
    }

    this.add = function(id, config) {
        this.notes.splice(0, 0, {
            note_id: id,
            config: config
        });
    }

    this.update = function(id, config) {
        var note = this.byid(id);
        note.config = config;
    }

    this.search  = function(q) {
        var results = [];
        var regex = new RegExp(q, "i");

        function recursive(node) {
            if (node.text && regex.test(node.text)) {
                return true;
            }

            if (node.sub) {
                for (var i=0; i < node.sub.length; i++) {
                    if (recursive(node.sub[i]))
                        return true;
                }
            }

            return false;
        }

        for (var i=0; i < this.notes.length; i++) {
            if (recursive(this.notes[i].config.nodes)) {
                results.push(this.notes[i].note_id);
            }
        }
        return results;
    }
}
