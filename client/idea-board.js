Template.ideas.onCreated(function() {
    Session.set("edit", {});
});

Template.ideas.onRendered(function() {
    $(document).ready(function() {
        $('.column').sortable({
            connectWith: '.column',
            handle: 'h2',
            cursor: 'move',
            placeholder: 'placeholder',
            forcePlaceholderSize: true,
            opacity: 0.5,
            stop: function(event, ui) {
                var before = ui.item.prev().get(0);
                var after = ui.item.next().get(0);
                var e = ui.item.get(0);
                var id = ideaId(e.id);
                var fromCol = colNumber(event.target.id);
                var toCol = colNumber(e.parentElement.id);
                var idea = Blaze.getData(e);
                var set;
                if (!before && !after) {
                    if (fromCol == toCol) {
                        return; // only idea in the same column
                    }
                    console.log("only idea in col", toCol);
                    set = {col: toCol, row: 1};
                } else {
                    var prevIdea, nextIdea;
                    if (before && after) {
                        prevIdea = Blaze.getData(before);
                        nextIdea = Blaze.getData(after);
                        console.log("idea between", prevIdea, "and", nextIdea, "in col", toCol);
                        Meteor.call('incCol', toCol, 1, prevIdea.row, idea._id);
                        set = {col: toCol, row: prevIdea.row + 1};
                    } else if (before) {
                        prevIdea = Blaze.getData(before);
                        if (fromCol == toCol && (idea.row == prevIdea.row + 1)) {
                            return;
                        }
                        console.log("idea at tail of col", toCol, "after", prevIdea);
                        set = {col: toCol, row: prevIdea.row + 1};
                    } else {
                        if (fromCol == toCol && (idea.row == 1)) {
                            return;
                        }
                        nextIdea = Blaze.getData(after);
                        console.log("idea at head of col", toCol, "before", nextIdea);
                        var lt;
                        if (fromCol == toCol) {
                            lt = idea.row;
                        }
                        Meteor.call('incCol', toCol, 1, 0, idea._id, lt);
                        set = {col: toCol, row: 1};
                    }
                }
                if (set) {
                    console.log("moving", idea);
                    if (fromCol != toCol) { // idea moved to new column
                        Meteor.call('incCol', fromCol, -1, idea.row);
                    }
                    Ideas.update(
                        { _id: idea._id },
                        { $set: set }
                    );
                }
             },
        }).disableSelection();
    });
});

Template.ideas.helpers({
    'ideas': function(col) {
        return Ideas.find({col:col}, {sort:["row"]});
    }
});

Template.ideas.events({
    'dblclick div.idea': function(event) {
        event.preventDefault();
        var id = ideaId(event.target.id);
        var edit = Session.get("edit");
        edit[id] = true;
        Session.set("edit", edit);
    },
    'click a.edit-cancel': function(event) {
        event.preventDefault();
        var id = ideaId(event.target.id);
        var edit = Session.get("edit");
        delete edit[id];
        Session.set("edit", edit);
    },
    'click a.edit-remove': function(event) {
        event.preventDefault();
        var id = ideaId(event.target.id);
        var edit = Session.get("edit");
        var idea = Blaze.getData(event.target);
        delete edit[id];
        Session.set("edit", edit);
        Ideas.remove({_id:id}, function (err) {
            if (err) {
                console.log(err);
            }
        });
        Meteor.call('incCol', idea.col, -1);
    },
    'click button.edit-save': function(event) {
        event.preventDefault();
        var id = ideaId(event.target.id);
        var text = document.getElementById(id+".text");
        var edit = Session.get("edit");
        delete edit[id];
        Session.set("edit", edit);
        var m = text.value.match(/^.+$/m);
        var set = {
            title: m[0].trim(),
            text: text.value.replace(/^.+$/m, "").trim(),
        };
        Ideas.update({_id:id}, {'$set':set}, function (err) {
            if (err) {
                console.log(err);
            }
        });
    },
    'click a#new-idea': function(e) {
        event.preventDefault();
        Meteor.call('incCol', 3, 1);
        var newIdea = {
            title: "Brilliant New Idea",
            text: "<mark>Double click here to edit</mark>. Use HTML for <em>emphasis</em>...",
            col: 3,
            row: 1,
        };
        Ideas.insert(newIdea, function(err, id) {
            if (err) {
                console.log(err);
            } else {
                /*
                var edit = Session.get("edit");
                edit[id] = true;
                Session.set("edit", edit);
                */
            }
        });
    },
});

Template.idea.helpers({
    'editIdea': function(id) {
        var edit = Session.get("edit");
        return edit[id];
    },
});

var ideaId = function(elementId) {
    var f = elementId.split(".");
    return f[0];
};

var colNumber = function(colName) {
    var s = colName.match(/\d+$/);
    return s * 1;
};
