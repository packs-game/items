var express = require('express');
var lib = require('packs-lib');

var BackpackModel = require('./models/backpack');
var mongoose = require('mongoose');
var services = lib.services;

mongoose.connect(services.mongo);

var restApp = require('./src/rest-server');

var checkAuth = lib.checkAuth;
restApp.post('/backpack', checkAuth, function(req, res) {
	BackpackModel.findOne({ownerId: req.body.id}, function(err,bp){
		if (err) { return res.sendStatus(400).send(err); }
		res.json(bp);
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