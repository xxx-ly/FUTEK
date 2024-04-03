function getChkBoxIDs(chkBox) {
    if (chkBox == null || chkBox.length < 1) {
        chkBox = "item";
    }
    var objForm = document.forms["fm"];
    var checkbx = objForm[chkBox];
    var ids = "";
    var count = 0;
    //alert("checkbx: " + checkbx + ', checkbx.value: ' + checkbx.length)
    if (typeof(checkbx.value) == 'undefined' || !checkbx.value) {
        for (var i = 0; i < checkbx.length; i++) {
            if (checkbx[i].checked) {
                if (checkbx[i].value.length > 0 && checkbx[i].value != "true" && checkbx[i].value != "on") {
                    ids = ids + (count > 0 ? "," : "") + checkbx[i].value;
                    count++;
                }
            }
        }
    } else {
        if (checkbx.checked) {
            if (checkbx.value.length > 0 && checkbx.value != "true" && checkbx.value != "on") {
                ids = checkbx.value;
            }
        }
    }
    return ids;
}


/**
	the following "miscURL" var has been defined in top1.JSP
	The JSP must have a form named "fm", and a chekBox named "item".
*/
function addToBasket(modelName, chkBox) {
    var miscURL = getMiscURL(); //from top1.JSP
    var strids = getChkBoxIDs(chkBox);

    if (strids == null || strids.length < 1) {
        return;
    }

    miscURL = miscURL.replace("%controller%", "multiinquiry");
    miscURL = miscURL.replace("%method%", "additem");
    miscURL = miscURL.replace("@name@", modelName);
    miscURL = miscURL.replace("@idValue@", strids);

    document.urlform.action = miscURL;
    document.urlform.method = 'post';
    document.urlform.forwardURL.value = window.location.href;
    document.urlform.submit();
}


function inquiryNow(modelName, chkBox) {
    var miscURL = getMiscURL(); //from top1.JSP
    var strids = getChkBoxIDs(chkBox);

    if (strids == null || strids.length < 1) {
        return;
    }

    miscURL = miscURL.replace("%controller%", "inquirysender");
    if (modelName == 'buyingleads') {
        miscURL = miscURL.replace("%method%", "buyer");
    } else {
        miscURL = miscURL.replace("%method%", "supplier");
    }
    miscURL = miscURL.replace("@name@", modelName);
    miscURL = miscURL.replace("@idValue@", strids);
    ActionUtil.go(miscURL);
}


function addToBasket4SR(ID, modelName) {
    var miscURL = getMiscURL(); //from top1.JSP
    miscURL = miscURL.replace("%controller%", "multiinquiry");
    miscURL = miscURL.replace("%method%", "additem");
    miscURL = miscURL.replace("@name@", modelName);
    miscURL = miscURL.replace("@idValue@", ID);

    document.urlform.action = miscURL;
    document.urlform.method = 'post';
    document.urlform.forwardURL.value = window.location.href;
    document.urlform.submit();
}



function inquiryNow4SR(ID, modelName) {
    var miscURL = getMiscURL(); //from top1.JSP
    miscURL = miscURL.replace("%controller%", "inquirysender");

    if (modelName == 'buyingleads') {
        miscURL = miscURL.replace("%method%", "buyer");
    } else {
        miscURL = miscURL.replace("%method%", "supplier");
    }
    miscURL = miscURL.replace("@name@", modelName);
    miscURL = miscURL.replace("@idValue@", ID);
    ActionUtil.go(miscURL);
}

function mailpage() {
    var mail_str;
    mail_str = "mailto:?subject=Tradeeasy: " + document.title;
    mail_str += "&body= " + location.href;
    location.href = mail_str;
}