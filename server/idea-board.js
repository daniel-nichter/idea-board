Meteor.methods({
    incCol: function(colNumber, cnt, gt, ne, lt) {
        var find = { col: colNumber };
        if (typeof gt !== 'undefined') {
            find.row = { $gt: gt };
        }
        if (typeof ne !== 'undefined') {
            find._id = { $ne: ne };
        }
        if (lt) {
            find.row.$lt = lt;
        }
        console.log("find:", find, "$inc row:", cnt);
        Ideas.update(
            find,
            { $inc: { row: cnt } },
            { multi: true }
        );
    }
});
