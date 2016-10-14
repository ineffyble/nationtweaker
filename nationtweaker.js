var paths = {
	"signup": "signups/.*",
	"signupEdit": "signups/.*/edit",
	"page": "sites/.*/pages/.*",
	"pageDashboard": "sites/.*/pages/.*/activities",
	"pageNew": "sites/.*/pages/new",
	"pageTemplate": "sites/.*/pages/.*/template",
	"theme": "sites/.*/themes/.*",
	"mailingPreview": "broadcasters/.*/mailings/.*/preview",
	"mailingTheme": "broadcasters/.*/mailings/.*/themes/.*/attachments/.*"
};

var tweaks = [
	{
		"name": "Enable email re-opt-in",
		"description": "Allows you to tick 'receive emails' for people who have opted out",
		"suggestLink": "http://nationbuilder.com/cramereg/overriding_the_unsubscribe",
		"function": "enableReOptIn",
		"matches": [paths.signupEdit],
	},
	{
		"name": "Sort people tags alphabetically",
		"description": "Sort the list of tags on signups <br><i>Not always working correclty in Chrome</i>",
		"suggestLink": "http://nationbuilder.com/tag_order_in_people_profiles_is_not_consistent",
		"function": "sortTags",
		"matches": [paths.signup],
	},
	{
		"name": "Fix attendees link on event dashboard",
		"description": "Make the 'attendees' link on an event actually go to the attendees page",
		"suggestLink": "http://nationbuilder.com/attendees_link_on_event_dashboards_does_not_lead_to_the_attendees_listing",
		"function": "fixAttendeesLink",
		"matches": [paths.pageDashboard]
	},
	{
		"name": "Make page tags link to page tag view",
		"description": "Fix bug where clicking a page tag takes you to a signup tag",
		"suggestLink": "http://nationbuilder.com/fishtron/link_to_all_pages_with_tag",
		"function": "fixPageTagLinks",
		"matches": [paths.page]
	},
	{
		"name": "Hide social capital",
		"description": "Removes nearly all references to political capital from the admin interface",
		"function": "hideCapital",
		"matches": [".*"]
	},
	{
		"name": "Allow removal of point person from volunteers",
		"description": "Lets you clear the point person of a person with the volunteer box ticked",
		"suggestLink": "http://nationbuilder.com/socialupheaval/point_person_and_volunteer_status_should_not_be_connected_in_single_person_view",
		"function": "allowRemovePointPersonFromVolunteers",
		"matches": [paths.signupEdit]
	},
	{
		"name": "Make path names on person view clickable",
		"description": "Makes it so you can click on a path name in person view to view all people on the path",
		"suggestLink": "http://nationbuilder.com/brianpalmer/link_to_path_view_of_a_path_from_single_profile_view",
		"function": "makePathsOnPersonViewClickable",
		"matches": [paths.signup]
	},
	{
		"name": "Uncheck 'add to top nav' by default on new pages",
		"description": "Stop the 'add to top nav' option being the default when creating a new page",
		"suggestLink": "http://nationbuilder.com/ineffyble/include_in_top_nav_should_be_unticked_by_default_when_creating_new_pages",
		"function": "stopNewPagesAddedToNavByDefault",
		"matches": [paths.pageNew]
	},
	{
		"name": "Increase size of email preview windows",
		"description": "Make email previews full width and 600px high",
		"function": "enlargeEmailPreviewWindows",
		"matches": [paths.mailingPreview]
	},
	{
		"name": "Increase size of content editor across NB",
		"description": "No more scrolling for ages just to be able to see your own content in the editor",
		"function": "enlargeContentEditor",
		"matches": [".*"]
	},
	{
		"name": "Increase size of the code editor across NB",
		"description": "Enlarges the template editor windows to 80% of window height by default",
		"function": "enlargeCodeEditor",
		"matches": [paths.theme, paths.pageTemplate, paths.mailingTheme]
	}
];

var init = function() {

	var pathBits = window.location.pathname.split( "/" );
	pathBits.shift();

	if (pathBits[0] === "admin") {
		pathBits.shift();
		chrome.storage.local.get("tweakSettings", function(res) {
			if (res.tweakSettings) {
				tweaks.forEach(function(t, i) {
					if (res.tweakSettings[t.function]) {
						t.enabled = res.tweakSettings[t.function].enabled;
					} else {
						t.enabled = false;
					}
				});
			}
			run(pathBits.join("/"));
		});
	}

};


var run = function(path) {
	tweaks.forEach(function(t, i) {
		if (t.enabled) {
			var exec = false;
			t.matches.forEach(function(p, i) {
				var re = new RegExp(p);
				if (re.test(path)) {
					exec = true;
				}
			});
			if (exec) {
				runTweak(t.function);
			}
		}
	});
	addSettingsToUserMenu();
};

var runTweak = function(t) {
	switch (t) {
		case "enableReOptIn": enableReOptIn(); break;
		case "fixAttendeesLink": fixAttendeesLink(); break;
		case "fixPageTagLinks": fixPageTagLinks(); break;
		case "hideCapital": hideCapital(); break;
		case "allowRemovePointPersonFromVolunteers": allowRemovePointPersonFromVolunteers(); break;
		case "makePathsOnPersonViewClickable": makePathsOnPersonViewClickable(); break;
		case "stopNewPagesAddedToNavByDefault": stopNewPagesAddedToNavByDefault(); break;
		case "sortTags": sortTags(); break;
		case "enlargeEmailPreviewWindows": enlargeEmailPreviewWindows() break;
	}
};

/**
 * Utility function to add style block to a page
 */
var addCssToPage = function() {
	if (typeof GM_addStyle != "undefined") {
	GM_addStyle(css);
	} else if (typeof PRO_addStyle != "undefined") {
	 PRO_addStyle(css);
	} else if (typeof addStyle != "undefined") {
		addStyle(css);
	} else {
		var node = document.createElement("style");
		node.type = "text/css";
		node.appendChild(document.createTextNode(css));
		var heads = document.getElementsByTagName("head");
		if (heads.length > 0) {
			heads[0].appendChild(node);
		} else {
			// no head yet, stick it whereever
			document.documentElement.appendChild(node);
		}
	}
};

var addSettingsToUserMenu = function() {
	var user_menu = document.querySelector(".user-menu");
	if (user_menu) {
		var settings_link = chrome.extension.getURL('nationtweaker_settings.html');
		user_menu.innerHTML = user_menu.innerHTML + '<li class="support-action"><a href="' + settings_link + '" target="_new">NationTweaker</a></li>';
	}
}

var enableReOptIn = function() {
	var opt_in_checkbox = document.querySelector("#signup_email_opt_in");
	if (opt_in_checkbox && opt_in_checkbox.getAttribute("disabled")) {
			opt_in_checkbox.removeAttribute("disabled");
	}
};

var fixAttendeesLink = function() {
	var attendees_link = document.querySelectorAll("a[href$='rsvps'")[1];
	if (attendees_link) {
		attendees_link.href = attendees_link.href.replace("rsvps", "rsvps/attendees");
	}
};

var fixPageTagLinks = function() {
	var site_id = window.location.pathname.split( "/" )[3];
	document.querySelector(".tags").innerHTML = document.querySelector(".tags").innerHTML.replace("signups", "sites/" + site_id + "/pages");
};

var sortTags = function() {
	var tag_list = document.querySelector(".tags");
	var tags = tag_list.children;
	[].slice.call(tags).sort(function(a, b) {
		return a.textContent > b.textContent;
	}).forEach(function(val, index) {
		tag_list.appendChild(val);
	});
};

var hideCapital = function() {
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("css/hideCapital.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.body.appendChild(link);
};

var allowRemovePointPersonFromVolunteers = function() {
	var addAllowClearToPersonSelect = function() {
		var point_person_select = document.querySelector("#s2id_signup_parent_id");
		if (point_person_select.classList) {
			point_person_select.classList.add("select2-allowclear");
		} else {
			point_person_select.className += " " + "select2-allowclear";
		}
	};
	addAllowClearToPersonSelect();
	var volunteer_checkbox = document.querySelector("#signup_is_volunteer");
	volunteer_checkbox.addEventListener("click", addAllowClearToPersonSelect);
};

var makePathsOnPersonViewClickable = function() {
	var request = new XMLHttpRequest();
	request.onload = function() {
		if (request.status === 200) {
			var paths = JSON.parse(request.responseText);
			var personsPaths = [].slice.call(document.querySelectorAll(".path-name"));
			paths.forEach(function(path, i) {
				personsPaths.forEach(function(pp) {
					if (pp.textContent === path.name) {
						pp.innerHTML = '<a href="/admin/signups?query=%7B%22type%22%3A%22all%22%2C%22conditions%22%3A%5B%5D%2C%22clauses%22%3A%5B%5D%2C%22id%22%3Anull%2C%22searchContext%22%3A%22path%22%2C%22errors%22%3A%5B%5D%2C%22filters%22%3A%7B%22pathId%22%3A' + path.id + '%2C%22journeyStatus%22%3A0%2C%22signupType%22%3A%5B0%2C1%5D%7D%7D">' + pp.textContent + '</a>';
					}
				});
			});
		}
	};
	request.open("GET", window.location.origin + "/admin/paths/paths_with_steps", true);
	request.send();
};

var stopNewPagesAddedToNavByDefault = function() {
	var include_in_top_nav_checkbox = document.querySelector("#page_is_nav");
	include_in_top_nav_checkbox.checked = false;
};

var enlargeEmailPreviewWindows = function() {
	document.querySelectorAll('.span-12').forEach(function(el){el.className = 'span-24'});
	document.getElementById('html_mailing_preview').style.height = "600px";
	document.getElementById('text_mailing_preview').style.height = "600px";
};

var enlargeContentEditor = function() {
	var css = [
		".mceIframeContainer iframe, .mce-container iframe { ",
		"  min-height: 50vh !important; ",
		"} "
	].join("\n");
	addCssToPage(css);
};

var enlargeCodeEditor = function() {
	var css = [
		".CodeMirror, .CodeMirror-scroll {",
		"  height: 80vh !important;",
		"}"
	].join("\n");
	addCssToPage(css);
};

init();
