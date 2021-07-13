if(typeof(ScrumNums) !== "object") ScrumNums = {};

ScrumNums.App = function() {
	this.state = this.states.FULLVIEW;
	FastClick.attach(document.body);

	this.zoom = new ScrumNums.Zoom({
		zoomChange: this.setState.bind(this)
	});
	this.themes = new ScrumNums.Themes({
		themeChange: this.themeChange.bind(this)
	});
	this.slide = new ScrumNums.Slide({
		slideDiv: "slide-frame",
		pages: 3,
		curPage: 1,
		slideWidth: [ 0, Math.round(0.95 * $(window).width()) ],
		scrollPages: [ "settings" ],
		slideChange: this.slideChange.bind(this)
	});

	// next prev page buttons
	$(".prev").click(this.slide.prevSlide.bind(this.slide));
	$(".next").click(this.slide.nextSlide.bind(this.slide));

	// flexible layout
	this.setSize();
	$(window).resize(this.reset.bind(this));

	// blank screen fade-out on start
	setTimeout(function() {
		$(".blank-start").css("opacity", 0);
	}, 1);
	setTimeout(function() {
		$(".blank-start").hide();
	}, 300);
};

ScrumNums.App.prototype = {
	states: {
		FULLVIEW  : 0,
		ZOOMING   : 1,
		SINGLEVIEW: 2,
		SLIDING   : 3
	},

	setState: function(newState) {
		if (!this.states.hasOwnProperty(newState)) return;
		this.state = this.states[newState];

		switch(this.state) {
			case this.states.FULLVIEW:
				this.zoom.enabled = true;
				this.slide.enabled = true;
				break;
			case this.states.SLIDING:
				this.zoom.enabled = false;
				this.slide.enabled = true;
				break;
			case this.states.ZOOMING:
				this.zoom.enabled = false;
				this.slide.enabled = false;
				break;
			case this.states.SINGLEVIEW:
				this.zoom.enabled = true;
				this.slide.enabled = false;
				break;
			default:
				break;
		}
	},

	themeChange: function(color) {
		for (var x in color) this.zoom[x] = color[x];
	},

	slideChange: function(page, active) {
		if (active) { // if page is active (if slide finised) enable clicks
			this.setState("FULLVIEW");
			$(".prev").click(this.slide.prevSlide.bind(this.slide));
			$(".next").click(this.slide.nextSlide.bind(this.slide));

			if (page === 0) {
				$(".settings").css("z-index", 20);
				$(".slide-frame").click(this.slide.nextSlide.bind(this.slide));
				$(".slide-frame:hover").css("cursor", "pointer");
			// } else { // include to scroll settings to top when not visible
			// 	$(".settings").scrollTop(0);
			}
		} else { // otherwise sliding, so disable clicks
			this.setState("SLIDING");
			$(".settings").css("z-index", -20);
			$(".prev").off("click");
			$(".next").off("click");
			$(".slide-frame").off("click");
			$(".slide-frame:hover").css("cursor", "default");
		}
	},

	setSize: function(win) {
		if (!win) var win = {
			width: $(window).width(),
			height: $(window).height()
		};

		// differen layout values for portrait and landscape
		var sizes = (win.width <= win.height) ? {
			"leftRightWidth": "42%",
			"numCircleMargin": Math.max(0.01 * win.height, Math.min(0.05 * win.height, (0.25 * win.height - 0.25 * win.width)/2)) + "px",
			"numCirclePadding": "12.5%",
			"numFontSize": 0.125 * win.width + "px",
			"smallNumFontSize": 0.1 * win.width + "px"
		} : {
			"leftRightWidth": (0.3 * win.height + 0.045 * win.width) + "px",
			"numCircleMargin": "1%",
			"numCirclePadding": 0.10 * win.height + "px",
			"numFontSize": 0.10 * win.height + "px",
			"smallNumFontSize": 0.08 * win.height + "px"
		};

		// set sizes
		$(".left, .right").width(sizes.leftRightWidth);
		$(".num-circle").css({
			"margin-top": sizes.numCircleMargin,
			"margin-bottom": sizes.numCircleMargin
		});
		$(".num-circle").css("padding", sizes.numCirclePadding);
		$(".num").css("font-size", sizes.numFontSize);
		$(".small-num").css("font-size", sizes.smallNumFontSize);
	},

	reset: function() {
		// undo zoom, if any
		this.setState("FULLVIEW");
		$(".zoom-frame").css({
			"-webkit-transform": "scale(1)",
			"-moz-transform": "scale(1)",
			"-ms-transform": "scale(1)",
			"-o-transform": "scale(1)",
			"transform": "scale(1)"
		});
		this.zoom.zoomed = false;
		$(".num-circle").css("border-color", this.zoom.color);

		// set sizes
		var win = {
			width: $(window).width(),
			height: $(window).height()
		};
		this.setSize(win);

		// set slide position and widths
		this.slide.width = win.width;
		this.slide.height = win.height;
		this.slide.setSlideWidth([ 0, Math.round(0.95 * win.width) ]);
	}
};

$(function() {
	app = new ScrumNums.App();
});