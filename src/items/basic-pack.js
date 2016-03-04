function randomTier(tier, excludeNames, allCards) {
	var tierCards = [];
	allCards.forEach(function(c){
		if (c.tier === tier && excludeNames.indexOf(c.name) === -1) {
			tierCards.push(c);
		}
	});
	return tierCards[Math.floor(Math.random()*tierCards.length)];
}

function generatePack(excludeNames, allCards) {
	excludeNames = excludeNames || [];
	var c1 = randomTier(1,excludeNames, allCards);
	excludeNames.push(c1.name);
	var c2 = randomTier(1,excludeNames, allCards);
	excludeNames.push(c2.name);
	var c3 = randomTier(2,excludeNames, allCards);
	excludeNames.push(c3.name);
	var c4 = randomTier(3,excludeNames, allCards);
	excludeNames.push(c4.name);
	var c5 = randomTier(4,excludeNames, allCards);

	return [
		c1,
		c2,
		c3,
		c4,
		c5
	];

}

module.exports = {
	open: generatePack,
	cost: 100
};