var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Backpack = new Schema({
	ownerId: Schema.Types.ObjectId,
	power: Number
});

Backpack.methods.addRandomPower = function(min,max) {
	min = Number(min);
	max = Number(max);
	if (!min || !max || isNaN(min) || isNaN(max) || max < min) { return false; }
	var amnt = min + Math.floor(Math.random()*(max-min));
	this.power = (this.power ? this.power : 0) + amnt;
	return this;
};

module.exports = mongoose.model('Backpack', Backpack, 'backpacks');