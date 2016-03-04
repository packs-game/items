var express = require('express');
var lib = require('packs-lib');

var BackpackModel = require('./models/backpack');
var mongoose = require('mongoose');
var services = lib.services;

mongoose.connect(services.mongo);

var allItems = require('./src/items');

var restApp = require('./src/rest-server');

var checkAuth = lib.checkAuth;
restApp.post('/backpack', checkAuth, function(req, res) {
	BackpackModel.findOne({ownerId: req.body.id}, function(err,bp){
		if (err) { return res.sendStatus(400).send(err); }
		res.json(bp);
	});
});

restApp.post('/buy', checkAuth, function(req, res) {
	var toBuy = req.body.buy;
	if (!toBuy || !allItems[toBuy]) { return res.sendStatus(400).send('no to-buy specified'); }
	BackpackModel.findOne({ownerId: req.body.id}, function(err,bp){
		if (err) { return res.sendStatus(400).send(err); }
		if (bp.power < allItems[toBuy].cost) { return res.sendStatus(400).send('insuficient funds'); }
		//PERFORM BUY
		bp.power -= allItems[toBuy].cost;
		bp.items.push(toBuy);
		bp.save(function(err,newBP){
			if (err) { res.sendStatus(400).send(err); }
			res.send(newBP);
		});
	});
});

restApp.post('/open', checkAuth, function(req, res) {
	var toOpen = req.body.toOpen;
	if (!toOpen || !allItems[toOpen]) { return res.sendStatus(400).send('invalid open item'); }
	BackpackModel.findOne({ownerId: req.body.id}, function(err,bp){
		if (err) { return res.sendStatus(400).send(err); }
		var itemIndex = bp.items.indexOf(toOpen);
		if (itemIndex === -1) { return res.sendStatus(400).send('you dont own one of those...how did that happen?'); }
		//PERFORM OPEN
		var newStuff = bp.items[itemIndex].open();
		
		bp.items.splice(itemIndex,1);
		bp.save(function(err,newBP){
			if (err) { res.sendStatus(400).send(err); }
			res.send(newStuff);
		});
	});
});

function notifyPlayer(newBackpack, change) {
	var toSend = {
		type: 'backpack:change-power',
		to: [newBackpack.ownerId],
		data: Math.abs(change)
	};
	queue.send('socket', toSend);
}


function handleGrant(data, done) {
	var player = data.playerId;

	switch (data.type) {
		case 'addRandomPower':
			BackpackModel.findOne({ownerId: player}, function(err,bp){
				if (err) { console.log(err); return; }
				if (!bp) {
					bp = new BackpackModel({});
					bp.ownerId = player;
				}
				var orig = bp.power || 0;
				bp.addRandomPower(data.min,data.max);
				var diff = orig - bp.power;

				bp.save(function(err, savedBP) {
					if (err) { console.log(err); return; }
					notifyPlayer(savedBP, diff)
				});
			});
			return done();
	}

	console.log('ERR', data, 'NOT HANDLED');
	return done({
		err: 'not_handled_by_service'
	});
}

var queue = lib.queue;
var itemQueueProcessor = queue.listen('items', handleGrant);

restApp.listen(3008);