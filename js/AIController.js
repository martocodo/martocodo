AIController = function(config) {
	// Setup vars for controller
	this.config = config;
	this.levelEl = $(this.config.wrapperEl);
	this.bots = [];
	this.movementTimers = {};
	// Initial setup
	this.init = function() {
		// Listen to document events
		this.listenForEvents();
	}
	// Listen for custom and dom events
	this.listenForEvents = function() {
		// DOM events
		$(document).on('LEVEL_READY', jQuery.proxy(this,"levelReadyEventHandler"));
		$(document).on('LEVEL_GAMEOVER', jQuery.proxy(this,"levelGameOverEventHandler"));
		// Player events
		$(document).on('PLAYER_MOVE',  jQuery.proxy(this,"playerCollisionTest"));
	}
	// Level ready for AI components
	this.levelReadyEventHandler = function() {
		// Loop through paths and spawn bots
		for (var p=0; p<this.config.ai.paths.length; p++) {
			var currentPath = this.config.ai.paths[p];
			this.spawnAI(p,currentPath,this.config.ai.speed[p]);
		}
	}
	// Game over event handler
	this.levelGameOverEventHandler = function() {
		var relThis = this;
		// Turn off all bots
		for(var b=0; b<this.bots.length; b++) {
			clearInterval(relThis.movementTimers[b]);
			relThis.movementTimers[b] = null;
		}

	}
	// Create an AI with path route and listener to player movement
	this.spawnAI = function(id, path, speed) {
		var relThis = this;
		var startingRow = path[0][0];
		var startingCol = path[0][1];
		// Locate starting square (minus 1 compensates for zero based array)
		$( ".col" ).each(function( index ) {
  			if (($(this).attr('data-row-id') ==  (startingRow - 1) && $(this).attr('data-col-id') == (startingCol - 1))) {
  				// Located space so test if type is space
  				if ($(this).attr('data-space-type') == 's') {
  					// Valid so start bot
  					$(this).html('<div id="bot_' + id + '" class="bot">' + relThis.config.views.ai.robot + '</div>');
  					// Create bot data object
  					var bot = {
  						id: id,
  						path: path,
  						position: 0,
  						direction: 'forward'
  					}
  					// Store in local var
  					relThis.bots.push(bot);
  					// Begin movement timer
  					relThis.movementTimers[id] = setInterval(jQuery.proxy(relThis, "moveAI",id),speed);
  				} else {
  					// Invalid space so log error 
  					console.log('Error: Path ' + id + ' invalid for AI - creation aborted!');
  				}
  			}
		});


	}
	// Move AI based on timer or player movement
	this.moveAI = function(id) {
		var relThis = this;
		var bot = this.bots[id];
		// Test if bot is not at end of path
		if (bot.direction == 'forward') {
			if (bot.position < bot.path.length-1) {
				// Move to next position
				bot.position++;
			}  else {
				// Reverse bot
				bot.direction = 'reverse';
				bot.position = bot.path.length - 1;
			}
		} else if (bot.direction == 'reverse') {
			if (bot.position > 0) {
				// Move to next position
				bot.position--;
			}  else {
				// Reverse bot
				bot.direction = 'forward';
				bot.position = 0;
			}
		}
		// Move the bot to new space
		var newRow = bot.path[bot.position][0];
		var newCol = bot.path[bot.position][1];
		$( ".col" ).each(function( index ) {
  			if (($(this).attr('data-row-id') ==  (newRow - 1) && $(this).attr('data-col-id') == (newCol - 1))) {
  				// Located space so test if type is space
  				if ($(this).attr('data-space-type') == 's') {
  					// Valid so move bot
  					var botEl = $('#bot_' + id).detach();
					$(this).append(botEl);
					// Trigger collision test with player
					relThis.playerCollisionTest();
  				// If a wall is now blocking the way the AI needs to switch direction
  				} else if ($(this).attr('data-space-type') == 'w') {
  					bot.direction = (bot.direction == 'forward' ? 'reverse' : 'forward');
  				}
  			}
		});
	}
	// Test for collision with player
	this.playerCollisionTest = function() {
		var playerSquare = $('.player').parent('.col');
		// Loop through bots and look for collisions
		$.each(this.bots, function( index, bot ) {
			var botSquare = $('#bot_' + bot.id).parent('.col');
			// Compare the two parents to see if they match
			if (botSquare.is(playerSquare)) {
				$(document).trigger('LEVEL_GAMEOVER');
			}
		});

	}
	// Lets rock
	this.init();
}