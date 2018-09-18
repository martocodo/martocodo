PlayerController = function(config) {
	// Setup vars for controller
	this.config = config;
	this.levelEl = $(this.config.wrapperEl);
	this.playerEl = null;
	// Initial setup
	this.init = function() {
		// Listen to document events
		this.listenForEvents();
	}
	// Listen for custom and dom events
	this.listenForEvents = function() {
		// Global LEVEL events
		$(document).on('LEVEL_READY', jQuery.proxy(this,"levelReadyEventHandler"));
		$(document).on('LEVEL_GAMEOVER', jQuery.proxy(this,"levelGameOverEventHandler"));
		// Setup player keyboard movement controls
		$(document).on('keydown', jQuery.proxy(this,"playerMovementHandler"));
		// Setup player powers controls
		$(document).on('click', '.btnControl', jQuery.proxy(this,"specialControlsHandler"));
	}
	// Level is game over so stop player controls
	this.levelGameOverEventHandler = function() {
		$(document).off('keydown');
	}
	// Level setup complete begin player setup
	this.levelReadyEventHandler = function() {
		// Build player dom element
		var player = this.buildPlayer();
		// Determine random starting position (used for random flag and fallback)
		var totalSpaces = $('div.col[data-space-type="s"]').length;
		var randomPosition = Math.floor((Math.random() * totalSpaces) + 1);
		// Position player in selected space
		var randomStartEl = $('div.col[data-space-type="s"]')[randomPosition];
		// Is random start set for player
		if (this.config.randomPlayerStart == true) {
			// Flag true so put player in random area
			$(randomStartEl).html(player);
		} else {
			// Use starting position if available
			var startingRow = this.config.playerStart.row;
			var startingCol = this.config.playerStart.col;
			// Locate starting square (minus 1 compensates for zero based array)
			$( ".col" ).each(function( index ) {
  				if (($(this).attr('data-row-id') ==  (startingRow - 1) && $(this).attr('data-col-id') == (startingCol - 1))) {
  					// Located space so test if type is space
  					if ($(this).attr('data-space-type') == 's') {
  						// Valid so start player
  						$(this).html(player);
  					} else {
  						// Invalid space so log notice and choose random space
  						console.log('Notice: Invalid starting space so random space selected.');
  						$(randomStartEl).html(player);
  					}
  				}
			});
		}
		// Assign to local var for access later
		this.playerEl = $('.player');
	}
	// Special Controls */
	this.specialControlsHandler = function(e) {
		// Block default and set vars
		e.preventDefault();
		var relThis = this;
		var btnEl = $(e.currentTarget);
		// Toggle button active class
		btnEl.toggleClass('active');
		// Toggle special controls
		var type = btnEl.attr('data-control-type');
		this.config.controls[type] = (this.config.controls[type] == true ? false : true);
		// If true update view
		if (this.config.controls[type] == true) {
			this.playerEl.html(this.config.views.player[type]);
		} else {
			// Check if others are enabled
			var statusFlag = false;
			// Loop through controls object and check for flag
			Object.keys(this.config.controls).forEach(function(key) {
				if (relThis.config.controls[key] == true) {
					// Apply Template
					relThis.playerEl.html(relThis.config.views.player[key]);
					// Mark flag
					statusFlag = true;
				}
			});
			// No statuses then back to default
			if (statusFlag == false) {
				this.playerEl.html(this.config.views.player['default']);
			}
		}
	}
	// Player is moved by keyboard
	this.playerMovementHandler = function(e) {
		// Get current position and set defaults for target space
		var currentPlayerCol = this.playerEl.parent('.col').attr('data-col-id');
		var currentPlayerRow = this.playerEl.parent('.col').attr('data-row-id');
		// Setup single position object and default targets
		var positionData = {
			current: {
				col: parseInt(currentPlayerCol),
				row: parseInt(currentPlayerRow)
			},
			target: {
				col: parseInt(currentPlayerCol),
				row: parseInt(currentPlayerRow)
			}
		}
		// Check key pressed
		e = e || window.event;
		var key = e.keyCode
		switch(key) {
			case 37:
				// Left
				positionData.target.col--;
				this.testPlayerMove(positionData,'faceLeft');
			break;
			case 38:
				// Up
				positionData.target.row--;
				this.testPlayerMove(positionData,'faceUp');
			break;
			case 39:
				// Right
				positionData.target.col++;
				this.testPlayerMove(positionData,'faceRight');
			break;
			case 40:
				// Down
				positionData.target.row++;
				this.testPlayerMove(positionData,'faceDown');
			break;
		}
	}
	// Test player movement
	this.testPlayerMove = function(positionData,directionClass) {
		
		var result = this.testNextSpaceMovement(positionData,directionClass);

		// Valid block
		if (result.valid == true) {
			// Determine block type
			if (result.type == 's' || result.type == 'x') {
				// Valid space or exit door
				this.executePlayerMovement(result.target,directionClass);
				// Exit found - success?
				if (result.type == 'x') {
					$(document).trigger('LEVEL_COMPLETE');
				}
			} else if (result.type == 'w') {
				// Can pass through walls if ghost mode enabled
				if (this.config.controls.ghost == true) {
					
					// Valid space or exit door
					this.executePlayerMovement(result.target,directionClass);

				} else if (this.config.controls.push == true) {
					// Test additional space beyond wall to test if wall can be moved
					var nextSpacePositionData = positionData;
					// Test based on movement
					switch(directionClass) {
						case 'faceLeft':
							// Left
							nextSpacePositionData.target.col--;
							var nextSpaceResult = this.testNextSpaceMovement(nextSpacePositionData,'faceLeft');
						break;
						case 'faceUp':
							// Up
							nextSpacePositionData.target.row--;
							var nextSpaceResult = this.testNextSpaceMovement(nextSpacePositionData,'faceUp');
						break;
						case 'faceRight':
							// Right
							nextSpacePositionData.target.col++;
							var nextSpaceResult = this.testNextSpaceMovement(nextSpacePositionData,'faceRight');
						break;
						case 'faceDown':
							// Down
							nextSpacePositionData.target.row++;
							var nextSpaceResult = this.testNextSpaceMovement(nextSpacePositionData,'faceDown');
						break;
					}
					// Result
					// If next space is open we can push block into it
					if (nextSpaceResult.type == 's') {
						// Convert next block to space and further movement to wall
						$(result.target).attr('data-space-type','s').html('');
						$(nextSpaceResult.target).attr('data-space-type','w').html(this.config.views.wall);
						// Move player into newly created space
						this.executePlayerMovement(result.target,directionClass);
					}
				}
			}
		}
	}
	// Return value of next block in direction of movement
	this.testNextSpaceMovement = function(positionData, directionClass) {
		// Get next predicted space
		var target = $('div.col[data-row-id="' + positionData.target.row + '"][data-col-id="' + positionData.target.col + '"]');
		// Is valid?
		if (target.length==0) {
			return {valid: false, type: null}
		} else {
			// Get type of space to return alongside validity
			var targetType = $(target).attr('data-space-type');
			return {valid: true, type: targetType, target: target}
		}
	}
	// Build player element
	this.buildPlayer = function() {
		var playerHtml = '<div class="player faceDown">' + this.config.views.player.default + '</div>';
		return playerHtml;
	}
	// Move player icon into target space and apply display classes
	this.executePlayerMovement = function(target,directionClass) {
		var player = this.playerEl.detach();
		$(target).append(player);
		// Valid space clear previous classes and add new direction indicator class
		this.playerEl.removeClass('faceLeft faceUp faceRight faceDown').addClass(directionClass);
		// Notify DOM player movement 
		$(document).trigger('PLAYER_MOVE');
	}
	// Let's rock
	this.init();
}