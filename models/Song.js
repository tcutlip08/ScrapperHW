var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  list: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Song = mongoose.model("Song", SongSchema);

module.exports = Song;
