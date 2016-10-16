var paths = {
	"signup": "signups/.*",
	"signupList": "signups$",
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
		"suggestLink": "#",
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
		"matches": [paths.signup, paths.signupList]
	},
	{
		"name": "Uncheck 'add to top nav' by default on new pages",
		"description": "Stop the 'add to top nav' option being the default when creating a new page",
		"suggestLink": "http://nationbuilder.com/ineffyble/include_in_top_nav_should_be_unticked_by_default_when_creating_new_pages",
		"function": "stopNewPagesAddedToNavByDefault",
		"matches": [paths.pageNew]
	},
	{
		"name": "Stop page numbers being passed from filter/list to person, breaking activity stream",
		"description": "Makes it so clicking on a person on the second page of filter results will allow you to see their activities without refreshing",
		"suggestLink": "http://nationbuilder.com/brianpalmer/page_token_is_mistakenly_passed_onto_other_things_on_a_page",
		"function": "stopIncorrectlyPassedPageNumbers",
		"matches": [paths.signupList]
	},
	{
		"name": "Hide US and Canadian states from the filter list",
		"description": "Remove unwanted US states from filter view",
		"suggestLink": "http://nationbuilder.com/tws_tony/add_country_as_a_settings_option",
		"function": "hideAmericanAndCanadianStatesFromFilter",
		"matches": [paths.signupList]
        },
        {
		"name": "Increase size of email preview windows",
		"description": "Make email previews full width and 600px high",
		"suggestLink": "#",
		"function": "enlargeEmailPreviewWindows",
		"matches": [paths.mailingPreview]
	},
	{
		"name": "Increase size of page and post content editor windows",
		"description": "No more scrolling for ages just to be able to see your own content in the editor",
		"suggestLink": "#",
		"function": "enlargeContentEditor",
		"matches": [".*"]
	},
	{
		"name": "Increase size of the template/theme code editor",
		"description": "Enlarges the template editor windows to 80% of window height by default",
		"suggestLink": "#",
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
		case "hideCapital": runCssTweak("hideCapital"); break;
		case "allowRemovePointPersonFromVolunteers": allowRemovePointPersonFromVolunteers(); break;
		case "makePathsOnPersonViewClickable": makePathsOnPersonViewClickable(); break;
		case "stopNewPagesAddedToNavByDefault": stopNewPagesAddedToNavByDefault(); break;
		case "sortTags": sortTags(); break;
		case "stopIncorrectlyPassedPageNumbers": stopIncorrectlyPassedPageNumbers(); break;
		case "hideAmericanAndCanadianStatesFromFilter": hideAmericanAndCanadianStatesFromFilter(); break;
		case "enlargeEmailPreviewWindows": enlargeEmailPreviewWindows(); break;
		case "enlargeContentEditor": runCssTweak("enlargeContentEditor"); break;
		case "enlargeCodeEditor": runCssTweak("enlargeCodeEditor"); break;
	}
};

var runCssTweak = function(name) {
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("css/" + name + ".css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.body.appendChild(link);	
}

var addSettingsToUserMenu = function() {
	var user_menu = document.querySelector(".user-menu");
	if (user_menu) {
		var settings_link = chrome.extension.getURL('nationtweaker_settings.html');
		user_menu.insertAdjacentHTML("beforeEnd", '<li class="support-action"><a href="' + settings_link + '" target="_new">NationTweaker</a></li>');
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
	var tags = [].slice.call(document.querySelectorAll(".tags a"));
	tags.forEach(function(tag, i) {
		var tag_id = tag.href.split("=")[1];
		tag.href = "/admin/sites/" + site_id + "/pages/?tag_id=" + tag_id;
	});
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
						var a = document.createElement("a");
						a.href = "/admin/signups?query=%7B%22type%22%3A%22all%22%2C%22conditions%22%3A%5B%5D%2C%22clauses%22%3A%5B%5D%2C%22id%22%3Anull%2C%22searchContext%22%3A%22path%22%2C%22errors%22%3A%5B%5D%2C%22filters%22%3A%7B%22pathId%22%3A" + encodeURIComponent(path.id) + "%2C%22journeyStatus%22%3A0%2C%22signupType%22%3A%5B0%2C1%5D%7D%7D";
						a.textContent = pp.textContent;
						pp.textContent = "";
						pp.appendChild(a);
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

var stopIncorrectlyPassedPageNumbers = function() {
	var pageNumber = /page=[0-9]&/;
	var removePageParameter = function() {
		var personLinks = [].slice.call(document.querySelectorAll(".signup-row a"));
		personLinks.forEach(function(link, i) {
			link.href = link.href.replace(pageNumber, "");
		});
	};
	var results = document.getElementById("results-container");
	var observer = new MutationObserver(removePageParameter);
	observer.observe(results, {childList: true, subtree: true});
};

var hideAmericanAndCanadianStatesFromFilter = function() {
	var unwantedStates = ["Wyoming","Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Palau","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virgin Island","Virginia","Washington","West Virginia","Wisconsin","Alabama","Alaska","America Samoa","Arizona","Arkansas","Armed Forces Americas","Armed Forces Europe","Armed Forces Pacific","California","Colorado","Connecticut","Delaware","District of Columbia","Federated States of Micronesia","Florida","Georgia","Guam","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Marshall Islands","Maryland","Massachusetts","Michigan"];

	var removeUnwantedStates = function() {
		var results = [].slice.call(document.querySelectorAll(".select2-results li"));
		results.forEach(function(result, i) {
			if (unwantedStates.indexOf(result.textContent) > -1) {
				result.parentNode.removeChild(result);
			}
		});
	};

	var observer = new MutationObserver(removeUnwantedStates);
	observer.observe(document.body, {childList: true, subtree: true});

};

var enlargeEmailPreviewWindows = function() {
	var previews = [].slice.call(document.querySelectorAll('.span-12'));
	previews.forEach(function(el){
		el.className = 'span-24'
	});
	
	document.getElementById('html_mailing_preview').style.height = "600px";
	document.getElementById('text_mailing_preview').style.height = "600px";
};

init();