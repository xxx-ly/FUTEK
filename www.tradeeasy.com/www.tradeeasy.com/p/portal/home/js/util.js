function get(o) {
    return document.all ? document.all[o] : document.getElementById(o);
}

function get1(o) {
    return document.all ? document.all[o] : document.getElementsByName(o);
}

function binit(f) {
    var p = f.elements;
    for (var i = 0; i < p.length; i++) {
        if (p[i].type == 'button' || p[i].type == 'submit') {
            if (!p[i].className || p[i].className.indexOf('xbutton') == -1) {
                p[i].onmouseover = bover;
                p[i].onmouseout = bout;
            }
        }
    }
}

function wpup(l, a, w, h) {
    var p = "hotkeys=0,toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0,top=0,left=0,width=" + w + ",height=" + h;
    var c = open(l, a, p);
    c.focus();
}

function bover() {
    this.oldclass = this.className;
    this.className = 'bov' + this.oldclass;
}

function bout() {
    this.className = this.oldclass;
}

function tbl(n, s, e) { // table name, skip, endskip
    var o = get(n);
    if (!o) return;
    var tr = o.rows,
        sos = 0 + s,
        eos = 0 + e;
    for (var i = sos; i < tr.length - eos; i++) {
        tr[i].index = i - sos;
        tr[i].className = tr[i].index % 2 == 0 ? 'od' : 'ev';
        tr[i].onmouseover = over;
        tr[i].onmouseout = out;
    }
}

function over() {
    this.className = 'ov';
}

function out() {
    this.className = this.index % 2 == 0 ? 'od' : 'ev';
}

function disel(e) {
    if (!e) return;
    e.disabled = true;
    e.className = 'dc';
}

function disbts(f) {
    if (!f) return;
    var e = f.elements;
    for (var i = 0; i < e.length; i++) {
        if (e[i].tagName == 'BUTTON') {
            e[i].disabled = true;
            e[i].className = 'dc';
        } else if (e[i].tagName == 'INPUT' && (e[i].type == 'button' || e[i].type == 'submit')) {
            e[i].disabled = true;
        }
    }
}

function page(p) {
    window.location.href = p;
}
var lsh = null;

function sh(n, so) {
    var o = get(n);
    if (!o) return;
    if (so) {
        if (lsh && lsh != o) {
            lsh.style.visibility = 'hidden';
            lsh.style.display = 'none';
            lsh = null;
        }
        o.style.visibility = 'visible';
        o.style.display = '';
        lsh = o;
    } else {
        o.style.visibility = 'hidden';
        o.style.display = 'none';
        lsh = null;
    }
}

//add item into select object
function addToList(listField, newText, newValue) {
    if ((newValue == "") || (newText == "")) {
        //alert("You cannot add blank values!");
    } else {
        var add = true;
        if (listField == null) return;
        for (var i = 0; i < listField.length; i++) {
            if (listField.options[i].value == newValue) {
                add = false;
            }
        }
        if (add) {
            var len = listField.length++; // Increase the size of list and return the size
            listField.options[len].value = newValue;
            listField.options[len].text = newText;
            listField.selectedIndex = len; // Highlight the one just entered (shows the user that it was entered)
        }
    } // Ends the check to see if the value entered on the form is empty
}


// for AJAX
// global flag
var isIE = false;

// global request and XML document objects
var req;
var objId;
// retrieve XML document (reusable generic function);
// parameter is URL string (relative or complete) to
// an .xml file whose Content-Type is a valid XML
// type, such as text/xml; XML source must be from
// same domain as HTML file
//params 0 : url,url of linking server side
//params 1 : id, id of object that reveals return from server.
function loadXMLDoc(url, id) {
    objId = id;
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
        req.onreadystatechange = processReqChange;
        req.open("GET", url, true);
        req.send(null);
        // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        isIE = true;
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) {
            req.onreadystatechange = processReqChange;
            req.open("GET", url, true);
            req.send();
        }
    }
}

// handle onreadystatechange event of req object
function processReqChange() {
    // only if req shows "loaded"
    if (req.readyState == 4) {
        // only if "OK"
        document.getElementById(objId).innerHTML = "<p><center><font color=red>Loading...</font></center></p>";
        if (req.status == 200) {
            document.getElementById(objId).innerHTML = req.responseText;
        } else {
            alert("There was a problem retrieving the XML data:\n" +
                req.statusText);
        }
    }
}

//function tg(on,n) {
//  if(document.fm.elements['itemToggle']){
//	  document.fm.elements['itemToggle'].checked = on;
//  }
//  var o=n?document.fm.elements[n]:document.fm.item;
//  if(o.length==null){
//	o.checked=on;
//  }else{
//	for (var i=0;i<o.length;i++) o[i].checked=on;
//  }
//}

function cct(o, c) {
    document.fm.elements[c].value = o.value.length;
}

function pup(n, s, u) {
    var o = get(n);
    if (!o) return;
    if (s) {
        o.src = u;
        o.style.visibility = 'visible';
        o.style.display = '';
        if (myte.pupl && myte.pupl != o) {
            myte.pupl.style.visibility = 'hidden';
            myte.pupl.style.display = 'none';
        }
        myte.pupl = o;
    } else {
        o.style.visibility = 'hidden';
        o.style.display = 'none';
        myte.pupl = null;
    }
}

/**
 *	create a request with Post method asynchronously
 */
function ajaxSynGet(url) {
    var http_request;
    if (window.XMLHttpRequest) {
        http_request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        http_request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    http_request.open("POST", url, false);
    http_request.send(null);
}

function wpup(l, a, w, h) {
    var p = "hotkeys=0,toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0,top=0,left=0,width=" + w + ",height=" + h;
    var c = open(l, a, p);
    c.focus();
}

function resetACursor(area) {
    /* http://www.bazon.net/mishoo/articles.epl?art_id=1292 */
    if (area.createTextRange) {
        var range = area.createTextRange();
        range.moveEnd('textedit', -1);
        range.select();
    } else {
        area.selectionEnd = -1;
    }
}