const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		wallet: { type: Number, required: false },
		share: {type: Map, of: Number, required: false},
		token: { type: String }
	}
);

module.exports = mongoose.model('User', UserSchema);

