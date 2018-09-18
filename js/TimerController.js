TimerController = function(config) {
	// Setup controller vars
	this.config = config;
	this.levelEl = $(this.config.wrapperEl);
	this.timerEl = $(this.config.timerEl);
	this.timer = null;
	this.startTimestamp = null;
	this.running = false;
	this.times = [ 0, 0, 0];
	// Initial setup
	this.init = function() {
		this.setupTimer();
		// Global LEVEL events
		$(document).on('LEVEL_READY', jQuery.proxy(this,"levelReadyEventHandler"));
	}
	// Level setup complete begin player setup
	this.levelReadyEventHandler = function() {
		// Level is ready to start the timer component
		this.startTimer();
	}
	// Build timer DOM
	this.setupTimer = function() {
		this.timerEl.html(this.times[0] + ':' + this.times[1] + ':' + this.times[2]);
	}
	// Starting timer
	this.startTimer = function() {
		// If not started then start
		if (this.running == false) {
			// Record current time
			this.startTimestamp = Math.floor(Date.now());
			this.timer = setInterval(jQuery.proxy(this,"updateTimer"),100);
			this.running = true;
		}
	}
	// Update the time element
	this.updateTimer = function() {
		// Retrieve difference between start time and current
		var newTimestamp = Math.floor(Date.now());
		var diff = newTimestamp - this.startTimestamp;
		// Format into sections
		//diff = diff / 1000;
		//this.times[2] += diff / 10;
		/*var hundredthsDiff = Math.round(diff/10);
		var secondsDiff = Math.round(diff/1000);
		var minutesDiff = Math.round((diff/1000)/60);*/

		 // Hundredths of a second are 100 ms
        /*this.times[2] += diff / 100;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }*/

		//var secondsDiff = Math.floor(diff/1000);
		//this.times[2] = hundredthsDiff;
		//this.times[1] = secondsDiff;
		//this.times[0] = minutesDiff;

		/*if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }

		if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }*/
		/*if (secondsDiff >= 60) {
			this.times[0]++;
			this.times[1]-=60;
		}*/
		//var seconds = ((Math.floor(diff/1000)) > 59 ? 0 : Math.floor(diff/1000));
		// Hundredths of a second are 100 ms
   		
        // Seconds are 100 hundredths of a second
       /* if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }*/
        //console.log(this.times);
		this.timerEl.html(this.times[0] + ':' + this.times[1] + ':' + this.times[2]);
	}
	// Lets rock
	this.init();
}