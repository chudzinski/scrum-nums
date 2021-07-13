if(typeof(ScrumNums) !== "object") ScrumNums = {};

ScrumNums.Slide = function(options) {
	if (!options.slideDiv) throw "Just what are we sliding here?";
	if (!options.pages) throw "Just how many pages are we sliding here?";
	if (!options.width) this.width = $(window).width();
	if (!options.height) this.height = $(window).height();

	for (var x in options) this[x] = options[x];

	// handlers
	document.body.addEventListener("touchstart", this.touchStart.bind(this), false);
	document.body.addEventListener("touchmove", this.touchMove.bind(this), false);
	document.body.addEventListener("touchend", this.touchEnd.bind(this), false);

	this.slideFrame = document.getElementById(this.slideDiv);
	this.setSlideWidth();

	// cached selectors for pages to be scrollable
	this.scrollPageSelectors = new Array(this.pages);
	if (this.scrollPages && this.scrollPages.length <= this.pages) {
		for (var i = 0; i < this.scrollPages.length; ++i) {
			if (this.scrollPages[i]) this.scrollPageSelectors[i] = document.getElementById(this.scrollPages[i]);
		}
	}

	// cached selectors for opacity changes during sliding
	for (var j = 0; j < this.pages; ++j) {
		this.pageOpacities[j] = document.querySelectorAll(".slide-opacity-" + j);
	}
	this.setPageOpacity(this.curPage, 1); // set current page opacities to full
};

ScrumNums.Slide.prototype = {
	curPage: 0,
	stopTranslate: 0,
	scroll: 0,
	enabled: true,
	pageOpacities: [],

	setSlideWidth: function(newSlideWidth) {
		if (newSlideWidth) { // optional reset
			this.slideWidth = newSlideWidth;
			this.stopTranslate = 0;
		}

		// if not all slide widths passed, use this.width for those missing
		if (!this.slideWidth || !$.isArray(this.slideWidth)) this.slideWidth = [];
		for (var i = this.slideWidth.length; i <= this.pages; ++i) this.slideWidth[i] = this.width;

		// sum slide widths to find stopTranslate for curPage
		for (var j = 0; j <= this.curPage; ++j)
			this.stopTranslate -= this.slideWidth[j];

		// set position of slideFrame
		this.translate(this.stopTranslate);
	},

	setPageOpacity: function(page, opacity, transition) {
		if (page < 0 || page >= this.pages) return;

		for (var i = 0; i < this.pageOpacities[page].length; ++i) { // for each slide-opacity selector of page
			this.pageOpacities[page][i].style.opacity = opacity; // set opacity
			if (transition) this.pageOpacities[page][i].style.transition = transition; // and optional transition
		}
	},

	translate: function(translate) {
		var transform = "translate(" + translate + "px, 0px)";

		this.slideFrame.style.webkitTransform = transform;
		this.slideFrame.style.mozTransform = transform;
		this.slideFrame.style.msTransform = transform;
		this.slideFrame.style.oTransform = transform;
		this.slideFrame.style.transform = transform;
	},

	touchStart: function(event) {
		this.isScroll = null;
		this.newSlide = true;

		this.startTime = (new Date()).getTime();
		this.startPos = {
			x: event.targetTouches[0].pageX,
			y: event.targetTouches[0].pageY
		};

		// if curPage is scrollable make sure bounce top/bottom is possible
		if (this.scrollPageSelectors[this.curPage]) {
			var scrollTop = this.scrollPageSelectors[this.curPage].scrollTop;
			var scrollHeight = this.scrollPageSelectors[this.curPage].scrollHeight - this.height;

			// if scoll div is at top or bottom of scrolling, move away by 1 pixel
			if (scrollTop <= 0) {
				this.scrollPageSelectors[this.curPage].scrollTop = scrollTop + 1;
			} else if (scrollTop >= scrollHeight) {
				this.scrollPageSelectors[this.curPage].scrollTop = scrollTop - 1;
			}
		}
	},
	
	touchMove: function(event) {
		this.delta = {
			x: event.targetTouches[0].pageX - this.startPos.x,
			y: event.targetTouches[0].pageY - this.startPos.y
		};

		if (this.isScroll === null) this.isScroll = (Math.abs(this.delta.y) > Math.abs(this.delta.x));

		if ( // prevent default if (only need default behavoir for scrolling)
			!this.enabled
		 || !this.isScroll
		 || this.transitionTimeout // previous transition has not finished
		 || !this.scrollPageSelectors[this.curPage] // curPage is not scrollble
		 || this.scrollPageSelectors[this.curPage] != event.targetTouches[0].target // finger is not on scroll div
			&& !this.scrollPageSelectors[this.curPage].contains(event.targetTouches[0].target)

		 // turn on if need to prevent entire page scroll at limits
		 // || this.scrollPageSelectors[this.curPage].scrollTop <= 0 && this.delta.y > 0
		 // || this.scrollPageSelectors[this.curPage].scrollTop >= this.scrollPageSelectors[this.curPage].scrollHeight && this.delta.y < 0
		 ) event.preventDefault();

		if (!this.enabled || this.isScroll) return; // no slide

		// if previous transition has not finished
		if (this.transitionTimeout) {
			this.startPos = { // ignore all touch movement up untill now
				x: event.targetTouches[0].pageX,
				y: event.targetTouches[0].pageY
			};
			return; // no slide
		}

		// call slideChange once and only when slideFrame will actually slide
		if (this.newSlide) {
			if (typeof(this.slideChange) == "function") this.slideChange(this.curPage, false);
			this.newSlide = false;
		}

		this.sign = (this.delta.x < 0) ? 1 : -1;
		this.slideMax = this.slideWidth[this.curPage + ((this.sign == 1) ? 1 : 0)]; // slide length upper bound based on direction
		this.slide = this.sign * Math.min(Math.abs(this.delta.x), this.slideMax); // slide no greater than slideMax

		this.end = (this.slide < 0 && this.curPage == 0) || (this.slide > 0 && this.curPage == (this.pages - 1));
		if (this.end && this.slideMax) { // if end and slidable, reduce slide amount proportionally
			this.slide = this.slide/( Math.abs(this.slide)/this.slideMax + 1 ); // approach slide/2 as slide approaches slideMax
		}

		this.translate(this.stopTranslate - this.slide);

		var opacity = Math.abs(this.slide)/this.slideMax; // proportional opacity
		this.setPageOpacity(this.curPage, 1 - opacity); // page sliding away from
		this.setPageOpacity(this.curPage + this.sign, opacity); // page sliding to
	},

	touchEnd: function(event) {
		if (!this.enabled || this.newSlide || this.isScroll) return; // not a real slide

		var slideAbs = Math.abs(this.slide);
		var slideTime = (new Date()).getTime() - this.startTime;

		// if reached midway point or page was flicked and not at end, transition to new page
		if ((slideAbs > this.slideMax/2 || (slideTime < 250 && slideAbs >= 50)) && !this.end) {
			this.curPage += this.sign;
			this.endSlide(this.sign * this.slideMax);
		} else { // else go back
			this.endSlide(0);
		}
	},

	endSlide: function(translate) {
		// new stop point
		this.stopTranslate -= translate;

		// slide transtion
		this.slideFrame.style.transitionDuration = "300ms";
		this.slideFrame.style.transitionTimingFunction = "cubic-bezier(0.1, 0.5, 0.5, 1)";
		this.translate(this.stopTranslate);

		// opacity transition sliding...
		this.setPageOpacity(this.curPage + this.sign, 0, "opacity 300ms cubic-bezier(0.1, 0.5, 0.5, 1)"); // away
		this.setPageOpacity(this.curPage - this.sign, 0, "opacity 300ms cubic-bezier(0.1, 0.5, 0.5, 1)"); // away
		this.setPageOpacity(this.curPage, 1, "opacity 300ms cubic-bezier(0.1, 0.5, 0.5, 1)"); // to

		// post transition clean up
		this.transitionTimeout = setTimeout((function() {
			if (typeof(this.slideChange) == "function") this.slideChange(this.curPage, true);
			this.transitionTimeout = null;

			// reset CSS transtions
			this.slideFrame.style.transitionDuration = "0ms";
			for (var i = 0; i < this.pageOpacities.length; ++i) {
				for (var j = 0; j < this.pageOpacities[i].length; ++j) {
					this.pageOpacities[i][j].style.transition = "";
				}
			}
		}).bind(this), 300);
	},

	// direct transition back
	prevSlide: function() {
		if (this.curPage <= 0) return;
		if (typeof(this.slideChange) == "function") this.slideChange(this.curPage, false);

		this.sign = -1;
		this.endSlide(-this.slideWidth[this.curPage--]);
	},

	// direct transition forward
	nextSlide: function() {
		if (this.curPage >= this.pages - 1) return;
		if (typeof(this.slideChange) == "function") this.slideChange(this.curPage, false);

		this.sign = 1;
		this.endSlide(this.slideWidth[++this.curPage]);
	}
};