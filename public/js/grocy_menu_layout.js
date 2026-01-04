$('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
	template: '<div class="tooltip navbar-sidenav-tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
})

$("#sidenavToggler").click(function(e)
{
	e.preventDefault();
	$("body").toggleClass("sidenav-toggled");
	$(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
	$(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");

	if ($("body").hasClass("sidenav-toggled"))
	{
		window.localStorage.setItem("sidebar_state", "collapsed");
		$(".container-fluid").removeClass("pl-md-3");
	}
	else
	{
		window.localStorage.setItem("sidebar_state", "expanded");
		$(".container-fluid").addClass("pl-md-3");
	}
});

$(".navbar-sidenav .nav-link-collapse").click(function(e)
{
	e.preventDefault();
	$("body").removeClass("sidenav-toggled");
	window.localStorage.setItem("sidebar_state", "expanded");
});

if (window.localStorage.getItem("sidebar_state") === "collapsed")
{
	$("#sidenavToggler").click();
}

// Make sure the current active menu item is visible
var activeMenuItem = $("li.active-page");
if (activeMenuItem.length > 0)
{
	if (!activeMenuItem.isVisibleInViewport(75))
	{
		activeMenuItem[0].scrollIntoView();
	}
}

function UpdateResponsiveLogo()
{
	var clockEnabled = false;

	// Check setting directly if available (e.g. after toggle)
	// Otherwise check global user settings
	var checkbox = $("#show-clock-in-header");
	if (checkbox.length > 0)
	{
		clockEnabled = checkbox.is(":checked");
	}
	else
	{
		// Default to true if setting is missing (safe fallback), or read from Grocy.UserSettings
		// Grocy.UserSettings values are strings "1" or "0" typically, or booleans?
		// In default.blade.php it is json_encoded.
		if (typeof Grocy.UserSettings !== 'undefined' && typeof Grocy.UserSettings.show_clock_in_header !== 'undefined')
		{
			clockEnabled = Grocy.UserSettings.show_clock_in_header.toString() === "1" || Grocy.UserSettings.show_clock_in_header === true;
		}
	}

	var threshold = clockEnabled ? 520 : 360;
	var width = $(window).width();

	if (width <= threshold)
	{
		$(".logo-full").addClass("d-none");
		$(".logo-icon").removeClass("d-none");
	}
	else
	{
		$(".logo-full").removeClass("d-none");
		$(".logo-icon").addClass("d-none");
	}
}

$(window).on("resize", function()
{
	UpdateResponsiveLogo();
});

$(document).ready(function()
{
	UpdateResponsiveLogo();
});

$(document).on("change", "#show-clock-in-header", function()
{
	// Update the global setting object so immediate re-checks work even if not saved/reloaded yet
	// (Although SaveUserSetting does this too, we want to be sure)
	Grocy.UserSettings.show_clock_in_header = $(this).is(":checked");
	UpdateResponsiveLogo();
});
