var lib = require('packs-lib');

var allCards = [];
var allCardsMap = {};
var loaded = false;
var cbs = [];

function load() {
	lib.api.getCards(function(err,cards){
		if (err) { return setTimeout(load, 1000);}
		allCards.splice(0,allCards.length); //empty the array
		cards.forEach(function(card){
			allCards.push(card);
			allCardsMap[card.name] = card;
		});
		loaded = true;
		cbs.forEach(function(cb){cb();});
	});
}

function onLoad(cb) {
	if (loaded) { return cb(); }
	cbs.push(cb);
}

load();

module.exports = {
	loaded: loaded,
	onLoad: onLoad,
	basicPack: require('./basic-pack')
};