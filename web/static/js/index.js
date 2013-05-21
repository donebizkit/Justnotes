$(function() {

	var browser = get_browser();
	var errbrow = undefined;
	if (browser.IE6) errbrow = "IE6";
	else if (browser.IE7) errbrow = "IE7";
	//else if (browser.OPERA) errbrow = "OPERA";
	if (errbrow) {
		$("#menu").hide();
		$("#browser-msg").html("<h3>We appologize but your browser is not currently supported. We are working on fixing compatibility issues on " + errbrow + "</h3>")
		return;
	}

	$("#btn-signup").click(function() {
		$("#msg").children().hide();
		$("#txt-email").val("");
		$("#txt-password").val("");
		$("#form-sign").removeClass("hide")
		$("#btn-sign-label").html("SIGN&nbsp;UP");
		$("#btn-sign-label").off();
		$(window).scrollTop(200);

		$("#txt-email").focus();

		$("#btn-sign-label").click(function() {
			var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
			if(!pattern.test($("#txt-email").val())) {
				alert("Invalid email.");
				return false;
			}
			if ($("#txt-password").val().length === 0) {
				alert("Password needs to be at least one character long.");
				return false;
			}

			$("#hid").val("signup");
			document.forms[0].submit();
		})
	});

	$("#btn-login").click(function() {
		$("#msg").children().hide();
		$("#txt-email").val("");
		$("#txt-password").val("");
		$("#form-sign").removeClass("hide");
		$("#btn-sign-label").html("LOG&nbsp;IN");
		$("#btn-sign-label").off();
		$(window).scrollTop(200);

		$("#txt-email").focus();

		$("#btn-sign-label").click(function() {
			var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
			if(!pattern.test($("#txt-email").val())) {
				alert("Invalid email.");
				return false;
			}
			if ($("#txt-password").val().length === 0) {
				alert("Password needs to be at least one character long.");
				return false;
			}

			$("#hid").val("login");
			document.forms[0].submit();
		})
	});

	$("#btn-play").click(function() {
		$("#hid").val("play");
		document.forms[0].submit();
	})

	var hash = window.location.hash;
	if (hash[0] === "#")
		hash = hash.substring(1);
	if (hash.length != 0) {
		try {
			hash = JSON.parse($.base64.decode(hash));
			if (hash.id === 1) {
				$("#btn-login").trigger("click");
				$("#msg-1").show();
				$("#txt-email").val(hash.e);
				$("#txt-password").val(hash.p);
				setTimeout(function(){$(window).scrollTop(200);}, 100);
			}
			else if (hash.id === 2) {
				$("#btn-signup").trigger("click");
				$("#msg-2").show();
				$("#txt-email").val(hash.e);
				$("#txt-password").val(hash.p);
				setTimeout(function(){$(window).scrollTop(200);}, 100);
			}
		} catch(e) {
			console.log(e)
		}
	}
	window.location.hash = "";
});

(function() {
	var cookies = document.cookie.split(';');
	var _cookie = [];
	for(var cookie in cookies) {
		if (!cookies.hasOwnProperty(cookie)) continue;
		var cookie_part = cookies[cookie].trim().split('=')
		if (cookie_part.length === 2)
			_cookie[cookie_part[0].trim()] = cookie_part[1].trim();
	}
	if (_cookie["GA"] === "true")
		enable_google_analytics();
})();