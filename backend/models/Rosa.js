// backend/models/Rosa.js
const mongoose = require('mongoose');
const shortid = require('shortid');

const RosaSchema = new mongoose.Schema({
  code: {
    type: String,
    default: () => shortid.generate(),
    unique: true
  },
  color:     { type: String, required: true },
  mensaje:   { type: String, required: true },
  remitente: { type: String, required: true },
  intencion: { type: String, required: true },
  imagen:    { type: String, required: true },
  video:     { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rosa', RosaSchema);
