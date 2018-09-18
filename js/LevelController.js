LevelController = function(config) {
	// Setup controller vars
	this.config = config;
	this.levelEl = $(this.config.wrapperEl);
	// Initial setup
	this.init = function() {
		// Build level from template
		this.convertLevelToData();
		// Listen to global level events
		$(document).on('LEVEL_COMPLETE', jQuery.proxy(this,"levelCompleteEventHandler"));
		$(document).on('LEVEL_GAMEOVER', jQuery.proxy(this,"levelGameOverEventHandler"));
	}
	// Convert maze to data array
	this.convertLevelToData = function() {
		// Get maze design from template file
		$.ajax({
		  url: this.config.template.file,
		  success: jQuery.proxy(this,'parseTemplate'),
		  dataType: 'text'
		});
	}
	// Construct data template from map file
	this.parseTemplate = function(map) {
		// Reset Template
		this.config.template.rows = [];
		var colLimit = this.config.template.size.width;
		var row = [];
		var rowCounter = 0;
		var colCounter = 0;
		// Create blank array ready for map space data
		this.config.template.rows.push([])
		// Loop through map and construct template array
		for (var i = 0, len = map.length; i < len; i++) {
			if (colCounter > colLimit) {
				rowCounter++;
				this.config.template.rows[rowCounter] = [];
				colCounter = 0;
			}
			// Get space indicator flag
			if (map[i] == '#') {
				var spaceCol = 'w';
			} else if (map[i] == ' ') {
				var spaceCol = 's';
			} else if (map[i] == 'X') {
				var spaceCol = 'x';
			}
			colCounter++;
			this.config.template.rows[rowCounter].push(spaceCol);
		}
		// Build level dom elements
		this.constructLevel();
	
	}
	// Level builder
	this.constructLevel = function() {
		// Check we have a template to build the level
		if (this.config.template != "") {
			// Full HTML storage
			var levelHtml = "";
			// Evaluate template to build level outline
			// First loop through each row
			for (var r=0; r<this.config.template.rows.length;r++) {
				var rowHtml = '<div class="row" data-row-id="' + r + '">';
				var currentRow = this.config.template.rows[r];
				var colCount = 0;
					// Now loop through our space (col)
					for (var d=0; d<currentRow.length-1; d++) {

						var spaceType = currentRow[d];
							// Content for space or wall or exit(could add more types later on)
							if (spaceType == 'w') {
								var content = this.config.views.wall;
							} else if (spaceType == 'x') {
								var content = this.config.views.exit;
							} else {
								var content = '';
							}
							// Build column space with type and row and col id needed for movement testing later
							rowHtml += '<div class="col" data-space-type="' + spaceType + '" data-row-id="' + r + '" data-col-id="' + colCount + '">' + content + '</div>';
							// Update col count for next loop
							colCount++;
						
					}
				// If final row add a single square
				if (r == this.config.template.rows.length-1) {
					rowHtml += '<div class="col" data-space-type="w" data-row-id="' + r + '" data-col-id="' + colCount + 1 + '">' + this.config.views.wall + '</div>';
				}
				rowHtml += '</div>';
				levelHtml += rowHtml;
			}
			// Apply level elements to dom
			this.levelEl.html(levelHtml + '<div class="clear"></div>');
		}
		// Trigger level is ready
		$(document).trigger('LEVEL_READY');
	}
	// Level complete handler and success notifications
	this.levelCompleteEventHandler = function() {
		this.levelEl.append('<h1 class="notify">Level Complete!</h1>');		
		this.levelEl.addClass('success');
	}
	// Level Game Over
	this.levelGameOverEventHandler = function() {
		this.levelEl.append('<h1 class="notify">Game Over!</h1>');		
		this.levelEl.addClass('error');	
		$('.player').html(this.config.views.player['gameover']);
	}
	/*
	this.constructLevel = function() {
		var result = false;
		// Check we have a template to build the level
		if (this.config.template != "") {
			// Full HTML storage
			var levelHtml = "";
			// Evaluate template to build level outline
			// First loop through our rows
			for (var r=0; r<this.config.template.rows.length;r++) {
				var rowHtml = '<div class="row" data-row-id="' + r + '">';
				var currentRow = this.config.template.rows[r];
				var colCount = 0;
					// Now loop through our space definitions
					for (var d=0; d<currentRow.length; d++) {
						var currentDefinition = currentRow[d];
						var spaceType = currentDefinition[0];
						var amount = currentDefinition[1];
						for (i=0; i<amount; i++) {
							// Content for space or wall (could add more types later on)
							if (spaceType == 'w') {
								var content = '#';
							} else {
								var content = '';
							}
							// Build column space with type and row and col id needed for movement testing later
							rowHtml += '<div class="col" data-space-type="' + spaceType + '" data-row-id="' + r + '" data-col-id="' + colCount + '">' + content + '</div>';
							// Update col count for next loop
							colCount++;
						}
					}
				rowHtml += '</div>';
				levelHtml += rowHtml;
			}
			// Apply level elements to dom
			this.levelEl.html(levelHtml);
			// Valid setup
			result = true;
		}
		// Return outcome
		return result;
	} */
	// Let's rock
	this.init();
}