function loadTweaks() {
	chrome.storage.local.get("tweakSettings", function(res) {
		if (res.tweakSettings) {
			console.log(res.tweakSettings);
			tweaks.forEach(function(t, i) {
				if (res.tweakSettings[t.function]) {
					t.enabled = res.tweakSettings[t.function].enabled;
				} else {
					t.enabled = false;
				}
			});
		}
		makeTweaksForm();
	});
}

function makeTweaksForm() {
	form = document.querySelector('#tweaks');
	tweaks.forEach(function(t, i) {
		console.log(t);
		html = "";
		html += '<label for="' + t.function + '">' + t.name + "</label>";
		html += '<input type="checkbox" name="' + t.function + '" ';
		if (t.enabled) {
			html += "checked";
		}
		html += '><br>';
		html += '<span class="description">' + t.description + '</span><br>';
		html += '<a class="suggest" href="' + t.suggestLink + '" target="_blank">Tell NationBuilder to properly implement this</a><br><br>';
		form.innerHTML = html + form.innerHTML;
	});
}

function saveTweaks(e) {
	tweakSettings = {};

	tweaks.forEach(function(t, i) {
		tweakSettings[t.function] = {"enabled": document.querySelector('input[name="' + t.function + '"]').checked};
	});

	chrome.storage.local.set({
	tweakSettings: tweakSettings
	});
}

document.addEventListener("DOMContentLoaded", loadTweaks);
document.querySelector("form").addEventListener("submit", saveTweaks);