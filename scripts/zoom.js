if(typeof(ScrumNums) !== "object") ScrumNums = {};

ScrumNums.Zoom = function(options) {
	for (var x in options) this[x] = options[x];

	// for each click on a .num div, call zoomNum passing in the div as a parameter
	var self = this;
	$(".num").each(function() {
		$(this).click(self.zoomNum.bind(self, this));
	});

	// selectors for divs where backface-visibility will need to be changed
	this.backFaceElements = document.querySelectorAll(".page-1, .page-2, .left-blank, .middle-blank, .right-blank, .shadow");
};

ScrumNums.Zoom.prototype = {
	enabled: true,
	zoomed: false,

	zoomOrigin: function(center, scale) {
		/*
			For the portion of the page that will be visible after zooming, the height above the
			zoom origin will be 1/(scale - 1) of the height of the porition of the page above that
			is no longer visible. So the distance from the top of this visible div to the zoom
			origin can be found by taking the ratio of the offsets of this div:
				div.height * offset.top / (offset.top + offset.bottom)

			So
				zoomOrigin.y = offset.top + div.height * offset.top / (offset.top + offset.bottom)

			Setting
				div.height = $(window).height()/scale
				offset.top = center.y - div.height/2
				offset.bottom = $(window).height() - center.y - div.height/2
			and simplifying gives
				zoomOrigin.y = (2*scale*center.y - $(window).height())/(2*(scale - 1))
		*/

		return (scale == 1) ? center : { // do not divide by zero
			x: (2*scale*center.x - $(window).width())/(2*(scale - 1)),
			y: (2*scale*center.y - $(window).height())/(2*(scale - 1))
		};
	},

	zoomAnimation: function(frame, options) {
		if (typeof(this.zoomChange) == "function") this.zoomChange("ZOOMING");
		this.zoomed = !this.zoomed;

		/* Webkit handles mixing hidden backface-visibility and scaling poorly.
		   Changing backface-visibility midway through the transition seems
		   to result in smoother border fade and quicker post scale redraw. */
		setTimeout(function() {
			for (var i = 0; i < this.backFaceElements.length; ++i) {
				this.backFaceElements[i].style.WebkitBackfaceVisibility = options.backfaceVisibility;
				this.backFaceElements[i].style.backfaceVisibility = options.backfaceVisibility;
			}
		}.bind(this), options.backfaceVisibilityTimeout);

		frame.addClass(options.keyframeClass); // start animation
		setTimeout(function() { // post animation clean up
			if (typeof(this.zoomChange) == "function") this.zoomChange(options.finalState);

			frame.css({ // final static view
				"-webkit-transform": options.transform,
				"-moz-transform": options.transform,
				"-ms-transform": options.transform,
				"-o-transform": options.transform,
				"transform": options.transform
			});
			frame.removeClass(options.keyframeClass);
		}.bind(this), 300);
	},

	zoomNum: function(num) {
		if (!this.enabled) return;

		var numCircle = $(num).closest(".num-circle");
		var frame = $(num).closest(".zoom-frame");

		if (this.zoomed) {
			this.zoomAnimation(frame, {
				keyframeClass: "zoom-out",
				transform: "scale(1)",
				finalState: "FULLVIEW",
				backfaceVisibility: "hidden",
				backfaceVisibilityTimeout: 300
			});

			// when zooming out delay cirle border color fade-in since it is 100ms shorter
			setTimeout(function() {
				numCircle.css("border-color", this.color);
			}.bind(this), 100);
		} else {
			// get and set transform origin before zoom in
			var divCenter = {
				x: $(num).offset().left - $(window).scrollLeft() + $(num).width()/2,
				y: $(num).offset().top - $(window).scrollTop() + $(num).height()/2
			};
			var origin = this.zoomOrigin(divCenter, 5);

			var transformOrigin = origin.x + "px " + origin.y + "px";
			frame.css({
				"-webkit-transform-origin": transformOrigin,
				"-moz-transform-origin": transformOrigin,
				"-ms-transform-origin": transformOrigin,
				"-o-transform-origin": transformOrigin,
				"transform-origin": transformOrigin,
			});

			this.zoomAnimation(frame, {
				keyframeClass: "zoom-in",
				transform: "scale(5)",
				finalState: "SINGLEVIEW",
				backfaceVisibility: "visible",
				backfaceVisibilityTimeout: 250
			});
			numCircle.css("border-color", this.backgroundColor);
		}
	}
};