if(typeof(ScrumNums) !== "object") ScrumNums = {};

ScrumNums.Themes = function(options) {
	for (var x in options) this[x] = options[x];

	// use supplied theme, load theme, or set default
	if (!this.theme && localStorage && localStorage.theme) {
		this.theme = localStorage.theme;
	} else {
		this.theme = "deep-navy";
	}

	var self = this;
	$(".theme-link").each(function() {
		var theme = $(this).attr("colorName");
		var colorBox = $(this).children().first();

		// set color in settings
		colorBox.css({
			"color": self.themes[theme]["background-color"],
			"background-color": self.themes[theme]["background-color"]
		});

		// attach click handle
		$(this).click(self.setTheme.bind(self, theme, colorBox));

		// set first theme
		if (self.theme == theme) {
			self.setTheme.call(self, theme, colorBox);

			// only set transition after first theme is set so that no color transition is visible on start
			$(".page-1").css("transition", "color 250ms linear, background-color 250ms linear");
		}
	});
};

ScrumNums.Themes.prototype = {
	setTheme: function(theme, colorBox) {
		$(".page-1, .page-2, .left-blank, .middle-blank, .right-blank").css({
			"color": this.themes[theme]["color"],
			"background-color": this.themes[theme]["background-color"]
		});
		$(".num-circle").css({
			"border-color": this.themes[theme]["color"],
			"border-width": this.themes[theme]["border-width"],
			"margin-left": this.themes[theme]["margin"],
			"margin-right": this.themes[theme]["margin"],
			"font-family": this.themes[theme]["font"]
		});
		$(".num, .num-circle").css({
			"border-radius": this.themes[theme]["border-radius"]
		});
		$(".num-circle a:link, .num-circle a:visited").css("color", this.themes[theme]["color"]);

		// set which check is visible in settings
		if (this.colorBox) this.colorBox.css("color", this.themes[this.theme]["background-color"]); // hide old check
		colorBox.css("color", this.themes[theme]["color"]); // show new check

		// save new settings
		this.colorBox = colorBox;
		this.theme = theme;
		try { // Safari will throw an exception in private mode or when storage quota is exceeded
			localStorage.theme = theme;
		} catch (e) {}

		if (typeof(this.themeChange) == "function") this.themeChange({
			color: this.themes[theme]["color"],
			backgroundColor: this.themes[theme]["background-color"]
		});
	},

	themes: {
		"deep-navy": {
			"name": "Deep Navy",
			"color": "rgb(245, 245, 230)",
			"background-color": "rgb(4, 8, 16)",
			"font": "FiraSans-Light",
			"border-width": "2px",
			"border-radius": "50%",
			"margin": "2%"
		},
		"ivory": {
			"name": "Ivory",
			"color": "rgb(4, 8, 32)",
			"background-color": "rgb(235, 235, 230)",
			"font": "FiraSans-Regular",
			"border-width": "3px",
			"border-radius": "50%",
			"margin": "1.75%"
		},
		"citrus-sinensis": {
			"name": "Citrus Sinensis",
			"color": "rgb(32, 32, 32)",
			"background-color": "rgb(225, 64, 0)",
			"font": "FiraSans-Regular",
			"border-width": "3px",
			"border-radius": "5%",
			"margin": "1.75%"
		},
		"purple-not-pink": {
			"name": "Purple Not Pink",
			"color": "rgb(144, 235, 0)",
			"background-color": "rgb(205, 0, 128)",
			"font": "FiraSans-Medium",
			"border-width": "4px",
			"border-radius": "50%",
			"margin": "1.5%"
		},
		"laser": {
			"name": "Laser",
			"color": "rgb(245, 16, 0)",
			"background-color": "rgb(16, 16, 24)",
			"font": "FiraSans-Light",
			"border-width": "2px",
			"border-radius": "0",
			"margin": "2%"
		},
		"clinical": {
			"name": "Clinical",
			"color": "rgb(0, 135, 120)",
			"background-color": "rgb(245, 245, 245)",
			"font": "FiraSans-Regular",
			"border-width": "3px",
			"border-radius": "25%",
			"margin": "1.75%"
		},
		"slate": {
			"name": "Slate",
			"color": "rgb(245, 245, 245)",
			"background-color": "rgb(72, 72, 84)",
			"font": "FiraSans-Regular",
			"border-width": "3px",
			"border-radius": "50%",
			"margin": "1.75%"
		},
		"voice-of-fire": {
			"name": "Voice of Fire",
			"color": "rgb(225, 16, 4)",
			"background-color": "rgb(4, 16, 64)",
			"font": "FiraSans-Medium",
			"border-width": "4px",
			"border-radius": "50%",
			"margin": "1.5%"
		}
	}
};