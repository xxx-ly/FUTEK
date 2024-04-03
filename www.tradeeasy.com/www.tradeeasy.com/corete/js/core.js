/* document based utilities */
var DocUtil = {
    version: '1.0.2 [2020-04-07]',
    get: function(id, doc) { /* get document element by id */
        if (doc) return id ? (doc.all ? doc.all[id] : doc.getElementById(id)) : null;
        return id ? (document.all ? document.all[id] : document.getElementById(id)) : null;
    },
    disableObj: function(id, disabled, notnull) { /* argument notnull is now deprecated */
        var obj = this.get(id);
        if (!obj) return;
        obj.disabled = disabled;
        if (disabled) {
            if (!obj.className || obj.className.indexOf('disabled') == -1) {
                if (!obj.className) obj.className = 'disabled';
                else obj.className += ' disabled';
            }
        } else {
            if (obj.className == 'disabled') obj.className = '';
            else obj.className = obj.className.replace('disabled', '');
        }
    },
    disableImg: function(id, disabled) {
        var obj = this.get(id);
        if (!obj) return;
        if (disabled) {
            if (obj.src.indexOf('-dis') == -1) obj.src = obj.src.replace('\.', '-dis.');
            if (obj.onclick) {
                obj.origOnclick = obj.onclick;
                obj.onclick = null;
            }
        } else {
            obj.src = obj.src.replace('-dis', '');
            if (obj.origOnclick) obj.onclick = obj.origOnclick;
        }
    },
    encodeRegex: function(s) {
        try {
            if (s) return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
        } catch (e) {
            alert('Failed to encode regular expression: \n' + e);
        }
        return s;
    },
    escapeUrl: function(val) { /*eacape speci char*/
        reg0 = /\//g;
        reg1 = /\\/g;
        reg2 = /!/g;
        reg3 = /#/g;
        reg4 = /\$/g;
        reg5 = /%/g;
        reg6 = /\^/g;
        reg7 = /\&/g;
        reg8 = /\(/g;
        reg9 = /\)/g;
        reg10 = /\|/g;
        reg11 = /\?/g;
        reg12 = /\*/g;
        reg13 = /\+/g;
        reg14 = /\-/g;
        val = val.replace(reg5, '%25');
        val = val.replace(reg7, '%26');
        val = val.replace(reg10, '%7C');
        val = val.replace(reg9, '%29');
        val = val.replace(reg8, '%28');
        val = val.replace(reg6, '%5E');
        val = val.replace(reg4, '%24');
        val = val.replace(reg3, '%23');
        val = val.replace(reg2, '%21');
        val = val.replace(reg1, '%5C');
        val = val.replace(reg0, '%2F');
        val = val.replace(reg11, "%3f");
        val = val.replace(reg12, "%2a");
        val = val.replace(reg13, "%2b");
        val = val.replace(reg14, "%2d");
        return val;
    },
    getByName: function(name) { /* get document element by name */
        var o = name ? (document.all ? document.all[name] : document.getElementsByName(name)) : null;
        if (!o) return null;
        if (typeof(o.length) == 'undefined') return o;
        if (o.length == 0) return null;
        if (o.length == 1) return o[0];
        return o;
    },
    getByTagName: function(obj, tn) { /* find all elements under element obj with tagName=tn */
        var list = new Array();
        tn = StrUtil.trim(StrUtil.lower(tn));
        if (obj && tn) {
            if (StrUtil.lower(obj.tagName) == tn) list.push(obj);
            if (obj.childNodes) {
                for (var i = 0; i < obj.childNodes.length; i++) {
                    var node = obj.childNodes[i];
                    if (node) {
                        var newlist = this.getByTagName(node, tn);
                        if (newlist) list = list.concat(newlist);
                    }
                }
            }
        }
        return list;
    },
    visibleArea: { /* visible area of document in window */
        top: function() {
            return document.all ? document.body.scrollTop : window.pageYOffset;
        },
        left: function() {
            return document.all ? document.body.scrollLeft : window.pageXOffset;
        },
        width: function() {
            return document.all ? document.body.offsetWidth : window.innerWidth;
        },
        height: function() {
            return document.all ? document.body.offsetHeight : window.innerHeight;
        }
    },
    showHide: function(obj, targetid, show, href) { /* show/hide target document object */
        if (!obj) obj = new Object();
        if (!obj.showHide) {
            obj.showHide = {
                target: this.get(targetid),
                toggle: function(sh, href) {
                    if (!this.target) return;
                    if (typeof(sh) == 'undefined' || sh == null) {
                        this.target.style.display = this.target.style.display == 'none' ? '' : 'none';
                    } else this.target.style.display = sh ? '' : 'none';
                    if (href && !this.target.style.display)
                        Ajax.send(this, this.target.id, href);
                }
            }
        }
        obj.showHide.toggle(show, href);
    },
    bulkShowHide: function(elementsToHide, show) {
        if (elementsToHide && elementsToHide.length > 0) {
            for (var i = 0; i < elementsToHide.length; i++) {
                var elementId = elementsToHide[i];
                if (elementId && elementId.length > 0) {
                    var element = DocUtil.get(elementId);
                    if (element) {
                        element.style.display = ((show) ? '' : 'none');
                    }
                }
            }
        }
    },
    copyAndPaste: { /* enable / disable copy & paste functions in document */
        enable: function() {
            document.body.ondragstart = null;
            document.body.onselectstart = null;
        },
        disable: function() {
            document.body.ondragstart = function() {
                return false;
            }
            document.body.onselectstart = function() {
                return false;
            }
        }
    },
    synSelectorValue: function(id, objs) {
        this.synElementFieldValue(id, objs);
    },
    synCheckButton: function(refElementlist, elementlist) {
        if (refElementlist != null && refElementlist.length > 0 && elementlist && elementlist.length > 0) {
            for (var i = 0; i < elementlist.length; i++) {
                var element = elementlist[i];
                if (element && (element.type == 'checkbox' || element.type == 'radio')) {
                    for (var j = 0; j < refElementlist.length; j++) {
                        var refElement = refElementlist[j];
                        if (refElement && refElement.value && refElement.value.length > 0) {
                            if (refElement.value == element.value) {
                                FormUtil.checkUnCheckButtonList([element], true, false);
                            }
                        }
                    }
                }
            }
        }
    },
    synElementFieldValue: function(id, objs) {
        if (id && objs) {
            var obja = document.getElementById(id);
            if (obja)
                for (var i = 0; i < objs.length; i++)
                    if (objs[i]) objs[i].value = obja.value;
        }
    },
    syncFieldValueById: function(id, ids) {
        if (id && ids) {
            var objs = new Array();
            for (var i = 0; i < ids.length; i++)
                if (ids[i]) objs.push(document.getElementById(ids[i]));
            this.synElementFieldValue(id, objs);
        }
    },
    syncFieldValue: function(name, value) {
        var objs = document.getElementsByName(name);
        if (objs)
            for (var i = 0; i < objs.length; i++)
                if (objs[i]) objs[i].value = value;
    },
    initGroupSyncFieldValue: function(name, ename) {
        if (name && ename) {
            var a = document.getElementsByName(name);
            if (a) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i]) {
                        if (ename == 'onkeyup') a[i].onkeyup = function() {
                            DocUtil.syncFieldValue(this.name, this.value);
                        }
                        else if (ename == 'onchange') a[i].onchange = function() {
                            DocUtil.syncFieldValue(this.name, this.value);
                        }
                    }
                }
            }
        }
    },
    alertErrMsg: function(errMsg) {
        errMsg = StrUtil.trim(errMsg);
        if (errMsg) alert('Unable to submit your request as the following error(s) were detected:\n\n' + errMsg + '\n\nPlease fix and submit again!');
    },
    isAllCheckedUnChecked: function(objArray, checked) {
        if (objArray && objArray.length > 0) {
            for (var i = 0; i < objArray.length; i++) {
                var obj = objArray[i];
                if (obj && (obj.type == 'checkbox' || obj.type == 'radio')) {
                    if ((obj.checked && !checked) || (!obj.checked && checked)) {
                        return false;
                    }
                }
            }
        }
        return true;
    },
    isAllEnabledDisabled: function(objArray, disabled) {
        if (objArray && objArray.length > 0) {
            for (var i = 0; i < objArray.length; i++) {
                var obj = objArray[i];
                if (obj) {
                    if ((obj.disabled && !disabled) || (!obj.disabled && disabled)) {
                        return false;
                    }
                }
            }
        }
        return true;
    },
    isAllDisabled: function(objArray) {
        return this.isAllEnabledDisabled(objArray, true);
    },
    isAllEnabled: function(objArray) {
        return this.isAllEnabledDisabled(objArray, false);
    },
    replace: function(id, content) {
        var o = this.get(id);
        if (o) o.innerHTML = content;
    },
    antiNIS: function() {
        try {
            if (SymRealWinOpen) {
                window.open = SymRealWinOpen;
                SymRealWinOpen = null;
            }
        } catch (e) {}
    }
}
/* mouse utilities */
var Mouse = {
    pointer: {
        x: 0,
        y: 0
    },
    trigger: { /* event trigger of detecting mouse movement event */
        target: null,
        enable: function(obj) { /* enable mouse event trigger */
            this.target = obj;
            document.onmousemove = function(ev) { /* capture mouse event */
                var ox = Mouse.pointer.x,
                    oy = Mouse.pointer.y;
                if (document.all) {
                    Mouse.pointer.x = window.event.x + document.body.scrollLeft;
                    Mouse.pointer.y = window.event.y + document.body.scrollTop;
                } else {
                    Mouse.pointer.x = ev.pageX;
                    Mouse.pointer.y = ev.pageY;
                }
                if (ox != Mouse.pointer.x || oy != Mouse.pointer.y)
                    if (Mouse.trigger.target && Mouse.trigger.target.doEvent) Mouse.trigger.target.doEvent();
            }
        },
        disable: function() { /* disable mouse event trigger */
            document.onmousemove = null;
            this.target = null;
        }
    }
}
/* object based utilities */
var ObjUtil = {
    version: '1.0.0',
    findParentNode: function(obj, parentId) { /* find parent node by id */
        var p = obj;
        while ((p = p.parentNode) != null)
            if (p.id == parentId) return p;
        return null;
    },
    absolutePosition: {
        top: function(obj) {
            var p = obj.offsetTop;
            while ((obj = obj.offsetParent) != null) p += obj.offsetTop;
            return p;
        },
        left: function(obj) {
            var p = obj.offsetLeft;
            while ((obj = obj.offsetParent) != null) p += obj.offsetLeft;
            return p;
        },
        width: function(obj) {
            var p = obj.offsetWidth;
            while ((obj = obj.offsetParent) != null) p += obj.offsetWidth;
            return p;
        },
        height: function(obj) {
            var p = obj.offsetHeight;
            while ((obj = obj.offsetParent) != null) p += obj.offsetHeight;
            return p;
        }
    },
    showHideParentNode: function(obj, parentId, show, upone) { /* show/hide parent node by id */
        if (!obj) obj = new Object();
        if (!obj.showHide) {
            obj.showHide = {
                target: this.findParentNode(obj, parentId),
                upOne: upone ? true : false,
                toggle: function(sh) {
                    var o = this.upOne ? this.target.parentNode : this.target;
                    if (!sh && o.hide) o.hide();
                    else {
                        if (typeof(sh) == 'undefined') {
                            o.style.display = o.style.display == 'none' ? '' : 'none';
                        } else o.style.display = sh ? '' : 'none';
                    }
                }
            }
        }
        obj.showHide.toggle(show);
    },
    showHints: function(obj, targetid, hints) {
        if (!obj.showHints) {
            obj.showHints = {
                target: DocUtil.get(targetid),
                top: this.absolutePosition.top(obj) + obj.offsetHeight + 2,
                left: this.absolutePosition.left(obj),
                show: function(hints) {
                    this.target.innerHTML = hints;
                    this.target.style.display = '';
                    this.target.style.top = this.top;
                    this.target.style.left = this.left;
                }
            }
            obj.onmouseout = function() {
                this.showHints.target.style.display = 'none';
            }
        }
        obj.showHints.show(hints);
    },
    deleteNodesByIds: function(obj, ids) { /* delete any child nodes by list of id */
        if (!ids) return;
        for (var i = 0; i < ids.length; i++) this.deleteNodesById(obj, ids[i]);
    },
    deleteNodesById: function(obj, id) { /* delete any child nodes by id */
        var c = obj.childNodes;
        if (!c) return;
        for (var i = 0; i < c.length; i++) {
            if (id == c[i].id) {
                obj.removeChild(c[i]);
                c--;
            } else if (c[i].childNodes.length > 0) this.deleteNodesById(c[i], id);
        }
    },
    deleteNodesByName: function(name) { /* delete nodes by name */
        if (name && name.length > 0) {
            var nodes = document.getElementsByName(name);
            if (nodes != null && nodes.length > 0) {
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node != null) {
                        var parent = node.parentNode;
                        if (parent && parent.hasChildNodes()) {
                            parent.removeChild(node);
                        }
                    }
                }
            }
        }
    },
    removeAllChildNodes: function(obj) { /* delete all child nodes of a node */
        if (obj) {
            while (obj.hasChildNodes()) {
                obj.removeChild(obj.firstChild);
            }
        }
    },
    createNode: function(type, attrs, mother, son) {
        var node = document.createElement(type);
        if (attrs)
            for (n in attrs) node.setAttribute(n, attrs[n]);
        if (son) {
            if (typeof(son) == 'string') this.createTextNode(son, node);
            else node.appendChild(son);
        }
        if (mother) mother.appendChild(node);
        return node;
    },
    createTextNode: function(txt, mother) {
        var node = document.createTextNode(txt);
        if (mother) mother.appendChild(node);
        return node;
    }
}

/* window based utilities */
var WinUtil = {
    version: '1.0.1 [2006-08-21]',
    opera: /opera/i.test(navigator.userAgent),
    ie: document.all && !this.opera,
    confirm: function(question, action, isdouble) {
        question = question || ('Are you sure you want to ' + action + ' the selected item(s) from the system?');
        return confirm(question) && (!isdouble || confirm('** Double Confirmation **\n\nAre you sure to take this action?'));

    },
    sleep: function(ms) { /* sleep for ms milliseconds */
        var start = new Date().getTime();
        while (true) {
            if (new Date().getTime() - start > ms) return;
        }
    },
    autoSizer: { /* trigger of auto resize function on specified objects when resizing window */
        targets: null,
        disable: function() { /* disable auto resize function */
            window.onresize = null;
            this.targets = null;
        },
        enable: function() { /* enable auto resize function */
            this.targets = null;
            window.onresize = function() {
                var targets = WinUtil.autoSizer.targets;
                if (targets) {
                    var w = DocUtil.visibleArea.width(),
                        h = DocUtil.visibleArea.height();
                    for (var i = 0; i < targets.length; i++)
                        if (targets[i].autoSizer) targets[i].autoSizer.resize(w, h);
                }
            }
        },
        add: function(obj, refereeId, minOffset) { /* add object for auto resize */
            if (!obj) return;
            if (obj.autoSizer || !document.all) return;
            minOffset = minOffset ? minOffset : 0;
            var referee = refereeId ? DocUtil.get(refereeId) : obj.parentNode;
            var w = DocUtil.visibleArea.width();
            var offset = Math.max(referee.offsetWidth > w ? 0 : (w - referee.offsetWidth), minOffset);
            var objw = referee.offsetWidth > w ? (w - offset) : (referee.offsetWidth - minOffset);
            obj.style.width = objw - 25;
            //alert('referee.offsetWidth='+referee.offsetWidth+'\nw='+w+'\nobj.style.width='+obj.style.width);
            obj.autoSizer = {
                offset: offset,
                target: obj,
                resize: function(w, h) {
                    if (!this.target || w - this.offset < 0) return;
                    this.target.style.width = w - this.offset - 25;
                }
            }
            if (!this.targets) this.targets = new Array();
            this.targets[this.targets.length] = obj;
        }
    }
}
/* code block evaluator */
var Eval = {
    version: '1.0.0',
    script: null,
    linefeed: {
        swap: function(str) {
            return str.replace(/\n|(\r\n)|(\n\r)/gim, '@!@');
        },
        restore: function(str) {
            return str.replace(/@!@/gim, '\n');
        }
    },
    parseHTML: function(src) { /* split HTML source & scripts and return HTML source to caller */
        var tt = this.linefeed.swap(src).replace(/\s/gim, ' ');
        var ot = tt.replace(/<script\b[^>]*>(.*?)<\/script>/gim, '');
        var rg = /<script\b[^>]*>(.*?)<\/script>/gim;
        this.script = new Array();
        while ((rs = rg.exec(tt)) != null)
            this.script[this.script.length] = this.linefeed.restore(this.decodeHTMLEntities(rs[1]));
        return this.linefeed.restore(ot);
    },
    hasScript: function() { /* check whether has any scripts contained in last parsed source */
        return this.script && this.script.length > 0;
    },
    exec: function() { /* execute extracted scripts in last parsed source */
        if (!this.script) return;
        var i = 0,
            js = '';
        var jscript = this.script;
        try {
            for (i = 0; i < jscript.length; i++) {
                js = jscript[i];
                if (js.indexOf('SymWinOpen') == -1 && js.indexOf('SymWinOpen') == -1) { /* protect against NIS inject popup blocker code into code block */
                    eval(js);
                }
            }
        } catch (e) {
            alert(e.message)
            alert('Failed to execute below javascript codeblock:\n\nError: ' + e.message + '\nSource:\n' + js);
        } finally {
            this.script = null;
        }
    },
    decodeHTMLEntities: function(str) { /* decode HTML entity to its native character */
        if (!str) return '';
        return str.replace(/&#(\d+);/g, function() {
            return String.fromCharCode(+arguments[1]);
        });
    }
}
/* Ajax HTTP requestor */
var Ajax = {
    version: '1.0.9 [2007-07-07] - add control to hide responded contents in target holder',
    defaultHolder: null,
    tokenBar: null,
    tknBarAnimationHandle: null,
    errorDialog: null,
    ackDialog: null,
    init: function(holderId, tokenId, errorBoxId, ackBoxId) { /* init environment for Ajax call */
        this.defaultHolder = DocUtil.get(holderId);
        this.tokenBar = DocUtil.get(tokenId);
        this.errorDialog = DocUtil.get(errorBoxId);
        this.ackDialog = DocUtil.get(ackBoxId);
    },
    convertUniqueUrl: function(href) { /* convert incoming url to an unique url by appending a parameter unique request no. (urn) */
        var ohref = href += (href.indexOf('?') == -1 ? '?' : '&') + 'urn=' + new Date().getTime();
        return ohref;
    },
    animation: function() { /* play a animation when loading */
        if (this.tokenBar == null) return;
        var message = this.tokenBar.innerHTML;
        var messageHead = message.split('.')[0];
        if (message.length - messageHead.length < 3) {
            this.tokenBar.innerHTML = message + '.';
        } else {
            this.tokenBar.innerHTML = messageHead;
        }
    },
    setAnimation: function() { /* trigger the animation */
        this.clearAnimation();
        this.tknBarAnimationHandle = window.setInterval('Ajax.animation()', 800);
    },
    clearAnimation: function() { /* clear the animation */
        if (this.tknBarAnimationHandle) {
            window.clearInterval(this.tknBarAnimationHandle);
        }
    },
    request: { /* struct to store current request */
        http: null,
        caller: null,
        holder: null,
        initHttp: function() {
            //if(this.http)return true;
            this.http = null;
            var classes = [
                function() {
                    return new XMLHttpRequest();
                },
                function() {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                },
                function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ];
            for (var i = 0; i < classes.length; i++) {
                var f = classes[i];
                try {
                    this.http = f();
                    // force exit if required http object has been successfully established
                    if (this.http && this.http.open) break;
                } catch (e) {}
            }
            return this.http;
        },
        response: function(content, nocache) { /* modified by KFC @7/7/2007 */
            if (!nocache) this.caller.content = content;
            if (this.holder.hideHTML)
                this.holder.hiddenSource = content;
            else {
                var ct = Eval.parseHTML(content);
                //alert(ct);
                this.holder.innerHTML = ct;
                this.holder.style.display = '';
            }
            if (Eval.hasScript()) Eval.exec();
            if (Ajax.activePad) Ajax.activePad.content = Ajax.defaultHolder.innerHTML;
            if (Ajax.tokenBar) Ajax.token();
            try {
                hideNotify()
            } catch (e) {}
            scroll(0, 0);
            Ajax.batch.job.busy = false;
        }
    },
    sendOnPad: function(obj) { /* send HTTP request onclick of menu pad */
        this.activePad = obj;
        this.send(obj);
    },
    post: function(obj, holder, href, paras) { /* send HTTP request by post method */
        try {
            if (!document.all)
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        } catch (e) {
            //alert("Permission UniversalBrowserRead denied.");
        }
        this.batch.job.busy = true;
        this.alert(null);
        this.ack(null);
        if (!obj) obj = new Object();
        this.request.holder = holder ? DocUtil.get(holder) : this.defaultHolder;
        if (!this.request.initHttp()) alert('Required HTTP Request Handler not initialized!');
        else {
            try {
                showNotify('Processing...');
            } catch (e) {
                this.token('Processing');
            }
            if (this.request.holder) { //disable all child buttons in the holder
                FormUtil.disableAllButtonsInNode(this.request.holder);
            }
            this.request.caller = obj;
            try {
                this.request.http.open('post', this.convertUniqueUrl(href || obj.href), true);
                this.request.http.onreadystatechange = function() {
                    if (Ajax.request.http.readyState == 4) {
                        if (Ajax.request.holder) {
                            var c = Ajax.request.http.responseText;
                            if (c) Ajax.request.response(c, true);
                        }
                    }
                }
                this.request.http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                //        this.request.http.setRequestHeader('Content-type','multipart/form-data; boundary='+'AaB03x');
                //this.request.http.setRequestHeader('Content-length',paras.length);
                //this.request.http.setRequestHeader('Connection','close');
                this.request.http.send(paras);
            } catch (e) {
                var msg = 'Unknown request page or unknown action or unable to execute your requested action. Please try again!';
                msg += '<br><br>URL=' + href || obj.href;
                this.alert(msg);
                if (Ajax.tokenBar) Ajax.token();
                if (this.request.holder) { //enable all child buttons in the holder
                    //FormUtil.enableAllButtonsInNode(this.request.holder);
                }
                this.batch.job.busy = false;
            } finally {}
        }
        return;
    },
    postConfirm: function(obj, holder, href, paras, action, isdouble) { /* send HTTP request by post method w/- confirmation */
        if (WinUtil.confirm(null, action, isdouble)) {
            this.post(obj, holder, href, paras);
            return true;
        }
        return false;
    },
    postDblConfirm: function(obj, holder, href, paras, action) { /* send HTTP request by post method w/- double confirmation */
        return this.postConfirm(obj, holder, href, paras, action, true);
    },
    send: function(obj, holder, href, nocache, skipcache) { /* send HTTP request */
        this.alert(null);
        this.ack(null);
        if (!obj) obj = new Object();
        this.request.holder = holder ? DocUtil.get(holder) : this.defaultHolder;
        href = href || obj.href;
        if (!href) {
            obj.href = '';
            this.request.holder.innerHTML = '';
            this.request.holder.style.display = 'none';
            return;
        }
        this.batch.job.busy = true;
        if (!skipcache && obj.href == href && obj.content) {
            this.request.response(obj.content, true);
            return;
        }
        obj.href = href;
        if (!this.request.initHttp()) alert('Required HTTP Request Handler not initialized!');
        else {
            try {
                showNotify('Loading...');
            } catch (e) {
                this.token('Loading');
            }
            this.request.caller = obj;
            try {
                this.request.http.open('get', this.convertUniqueUrl(href), true);
                this.request.http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                this.request.http.onreadystatechange = function() {
                    if (Ajax.request.http.readyState == 4) {
                        if (Ajax.request.holder) {
                            var c = Ajax.request.http.responseText;
                            if (c) Ajax.request.response(c, nocache);
                        }
                    }
                }
                this.request.http.send(null);
            } catch (e) {
                var msg = 'Unknown request page or unknown action or unable to execute your request. Please try again!';
                msg += '<br><br>URL=' + href;
                this.alert(msg);
                if (Ajax.tokenBar) Ajax.token();
                try {
                    hideNotify()
                } catch (e) {}
                this.batch.job.busy = false;
            } finally {}
        }
        return;
    },
    sendConfirm: function(obj, holder, href, action, nocache, skipcache, isdouble) { /* send HTTP request w/- confirmation */
        if (WinUtil.confirm(null, action, isdouble)) {
            this.send(obj, holder, href, nocache, skipcache);
            return true;
        }
        return false;
    },
    sendDblConfirm: function(obj, holder, href, action, nocache, skipcache) { /* send HTTP request w/- double confirmation */
        return this.sendConfirm(obj, holder, href, action, nocache, skipcache, true);
    },
    open: function(alias, href, para) { /* open new window w/- specified URL */
        DocUtil.antiNIS();
        var c = open(this.convertUniqueUrl(href), alias, para);
        c.focus();
    },
    openConfirm: function(alias, href, para, action, isdouble) { /* open new window w/- specified URL w/- confirmation */
        if (WinUtil.confirm(null, action, isdouble)) {
            this.open(alias, href, para);
            return true;
        }
        return false;
    },
    openDblConfirm: function(alias, href, para, action) { /* open new window w/- specified URL w/- double confirmation */
        return this.openConfirm(alias, href, para, action, true);
    },
    popup: function(alias, href, top, left, width, height, isdefault, noresize, status) { /* popup new window w/- specified URL */
        var p = isdefault ? '' : 'hotkeys=0,toolbar=0,location=0,directories=0,menubar=0';
        p += noresize ? ',scrollbars=0,resizable=0' : ',scrollbars=1,resizable=1';
        p += status ? ',status=1' : ',status=0';
        if (typeof(top) != 'undefined' & top != null) p += ',top=' + top;
        if (typeof(left) != 'undefined' & left != null) p += ',left=' + left;
        if (typeof(width) != 'undefined' & width != null) p += ',width=' + width;
        if (typeof(height) != 'undefined' & height != null) p += ',height=' + height;
        var ref = document.referrer;
        alias = alias ? alias : 'popup';
        DocUtil.antiNIS();
        if (document.all && ref) { //ie
            var w = open(ref, alias, p);
            w.document.write("<title>" + alias + "</title>");
            w.document.write("<a id='go' href='" + this.convertUniqueUrl(href) + "' style='display:none;' target='" + alias + "'>a</a>");
            w.document.getElementById("go").click();
            w.focus();
        } else {
            var c = open(this.convertUniqueUrl(href), alias, p);
            c.focus();
        }
    },
    popupConfirm: function(alias, href, top, left, width, height, action, isdouble, isdefault, noresize, status) { /* popup new window w/- confirmation */
        if (WinUtil.confirm(null, action, isdouble)) {
            this.popup(alias, href, top, left, width, height, isdefault, noresize, status);
            return true;
        }
        return false;
    },
    popupDblConfirm: function(alias, href, top, left, width, height, action, isdefault) { /* popup new window w/- double confirmation */
        return this.popupConfirm(alias, href, top, left, width, height, action, true, isdefault);
    },
    show: function(obj, targetid, href, form, elementsToHide) { /* show contents of URL in specified container */
        if (!obj) return;
        if (!obj.showHide) {
            obj.showHide = {
                href: href,
                holder: DocUtil.get(targetid),
                form: form ? document.forms[form] : null,
                elements: elementsToHide,
                toggle: function(name, disp) {
                    var e = this.form.elements[name];
                    if (e) e.style.display = disp;
                }
            };
            obj.show = function() {
                var sh = this.showHide;
                if (sh.form && sh.elements) {
                    for (var i = 0; i < sh.elements.length; i++)
                        sh.toggle(sh.elements[i], 'none');
                }
                Ajax.send(obj, obj.showHide.holder.id, obj.showHide.href);
            }
            if (obj.showHide.holder) {
                obj.showHide.holder.caller = obj;
                obj.showHide.holder.hide = function() {
                    this.style.display = 'none';
                    var sh = this.caller.showHide;
                    if (sh.form && sh.elements) {
                        for (var i = 0; i < sh.elements.length; i++)
                            sh.toggle(sh.elements[i], '');
                    }
                }
            }
        }
        if (obj.showHide.href != href) obj.showHide.href = href;
        obj.show();
    },
    showHide: function(obj, targetid, href, form, elementsToHide) { /* show/hide contents of URL in specified container */
        if (!obj) return;
        if (!obj.showHide) {
            obj.showHide = {
                href: href,
                holder: DocUtil.get(targetid),
                form: form ? document.forms[form] : null,
                elements: elementsToHide,
                toggle: function(name, disp) {
                    var e = this.form.elements[name];
                    if (e) e.style.display = disp;
                }
            };
            obj.mover = function() { /* on mouseover */
                var sh = this.showHide;
                if (sh.form && sh.elements) {
                    for (var i = 0; i < sh.elements.length; i++)
                        sh.toggle(sh.elements[i], 'none');
                }
                Ajax.send(obj, obj.showHide.holder.id, obj.showHide.href);
            }
            obj.onmouseout = function() { /* on mouseout */
                var sh = this.showHide;
                sh.holder.style.display = 'none';
                if (sh.form && sh.elements) {
                    for (var i = 0; i < sh.elements.length; i++)
                        sh.toggle(sh.elements[i], '');
                }
            }
        }
        obj.mover();
    },
    resize: function(parent, child) { /* resize the width of perent node according to the size of its child */
        var p = DocUtil.get(parent),
            c = DocUtil.get(child);
        if (!p || !c) return;
        p.style.width = c.offsetWidth;
    },
    alert: function(msg) { /* show alert/error message */
        if (msg) {
            this.errorDialog = this.errorDialog || DocUtil.get('error-dialog');
            if (this.errorDialog) $(this.errorDialog).remove();
            this.errorDialog = $('<div id="error-dialog" class="err-box" style="display:none"></div>').appendTo('body')[0];
            this.messageBox(this.errorDialog, msg);
        }
    },
    ack: function(msg) { /* show acknowledgement message */
        if (msg) {
            this.ackDialog = this.ackDialog || DocUtil.get('ack-dialog');
            if (this.ackDialog) $(this.ackDialog).remove();
            this.ackDialog = $('<div id="ack-dialog" class="ack-box" style="display:none"></div>').appendTo('body')[0];
            this.messageBox(this.ackDialog, msg);
        }
    },
    clear: function() {
        $('.ack-box, .err-box').remove();
        /*
        console.log('call clear')
        this.errorDialog=this.errorDialog||DocUtil.get('error-dialog');
        if (this.errorDialog) $(this.errorDialog).remove();
        this.ackDialog=this.ackDialog||DocUtil.get('ack-dialog');
        if (this.ackDialog)  $(this.ackDialog).remove();
        */
    },
    messageBox: function(obj, msg) {
        if (!obj) return;
        var $box = $(obj);
        if (!msg) $box.hide();
        else {
            $box.html('Please be informed that <center>' + msg + '</center>').show();
            setTimeout(function() {
                $box.click();
            }, 10000)
        }
    },
    token: function(msg) {
        if (this.tokenBar) { //start a animation
            if (msg) {
                this.tokenBar.innerHTML = msg;
                this.setAnimation();
            } else {
                this.tokenBar.innerHTML = '';
                this.clearAnimation();
            }
        }
    },
    batch: {
        job: {
            MODE: {
                SEND: 1,
                POST: 2,
                OPEN: 3,
                POPUP: 4,
                EVAL: 5,
                REPLACE: 6,
                CLEAR: 7,
                ACK: 8,
                ALERT: 9,
                RUN: 10
            },
            thread: null,
            busy: false,
            next: 0,
            delay: 10,
            requests: new Array(),
            add: function(req) {
                this.requests[this.requests.length] = req;
            },
            insert: function(req) {
                this.requests.splice(this.next, 0, req);
            },
            queueNext: function() {
                if (this.requests.length == 0 || this.next >= this.requests.length) return;
                this.thread = setTimeout('Ajax.batch.job.submitNext()', this.delay);
            },
            submitNext: function() {
                this.thread = null;
                if (this.requests.length == 0 || this.next >= this.requests.length) {
                    this.clear();
                    return;
                }
                if (!this.busy) {
                    var req = this.requests[this.next];
                    switch (req.mode) {
                        case this.MODE.SEND:
                            Ajax.send(req.args[0], req.args[1], req.args[2], req.args[3], req.args[4]);
                            break;
                        case this.MODE.POST:
                            Ajax.post(req.args[0], req.args[1], req.args[2], req.args[3]);
                            break;
                        case this.MODE.OPEN:
                            Ajax.open(req.args[0], req.args[1], req.args[2]);
                            break;
                        case this.MODE.POPUP:
                            Ajax.popup(req.args[0], req.args[1], req.args[2], req.args[3], req.args[4], req.args[5]);
                            break;
                        case this.MODE.EVAL:
                            eval(req.args[0]);
                            break;
                        case this.MODE.REPLACE:
                            DocUtil.replace(req.args[0], req.args[1]);
                            break;
                        case this.MODE.CLEAR:
                            DocUtil.replace(req.args[0], '');
                            break;
                        case this.MODE.ACK:
                            Ajax.ack(req.args[0]);
                            break;
                        case this.MODE.ALERT:
                            Ajax.alert(req.args[0]);
                            break;
                        case this.MODE.RUN:
                            req.args[0]();
                            break;
                    }
                    this.next++;
                }
                this.queueNext();
            }
        },
        clear: function() {
            if (this.job.thread) {
                clearTimeout(this.job.thread);
                this.job.thread = null;
            }
            this.job.next = 0;
            this.job.busy = false;
            this.job.requests = new Array();
            return this;
        },
        add: function(mode, a0, a1, a2, a3, a4, a5) {
            this.job.add({
                mode: mode,
                args: [a0, a1, a2, a3, a4, a5]
            });
            return this;
        },
        insert: function(mode, a0, a1, a2, a3, a4, a5) {
            this.job.insert({
                mode: mode,
                args: [a0, a1, a2, a3, a4, a5]
            });
            return this;
        },
        setDelay: function(delay) {
            this.job.delay = delay;
        },
        submit: function() {
            this.job.queueNext();
        },
        isDone: function() {
            return this.job.requests.length == 0 || this.job.next >= this.job.requests.length;
        }
    },
    bgSend: function(href, nocache, skipcache) { /* send HTTP request in background, no front end notification and holder */
        this.alert(null);
        this.ack(null);
        var obj = new Object();
        if (!href) {
            return;
        }
        this.batch.job.busy = true;
        if (!skipcache && obj.href == href && obj.content) {
            this.request.response(obj.content, true);
            return;
        }
        obj.href = href;
        if (this.request.initHttp()) {
            this.request.caller = obj;
            try {
                this.request.http.open('get', this.convertUniqueUrl(href), true);
                this.request.http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                this.request.http.send(null);
            } catch (e) {
                this.batch.job.busy = false;
            } finally {}
        }
        return;
    }
}
/* Tab menu utilities */
var TabMenu = {
    version: '1.0.1 [2006-08-17]',
    activeTab: null,
    tabBodyId: null,
    init: function(holderid) {
        this.tabBodyId = holderid;
    },
    open: function(obj, link) { /* goto tab body */
        if (!obj) return;
        if (this.activeTab) this.activeTab.className = 'tab';
        obj.className = 'active-tab';
        this.activeTab = obj;
        Ajax.send(null, this.tabBodyId, link);
    },
    openByPos: function(menuid, pos, link) { /* goto tab body by tab position */
        var m = DocUtil.get(menuid);
        if (!m || !m.rows || m.rows[0].cells.length <= pos) return;
        m.onmouseover();
        m.rows[0].cells[pos].onclick();
    }
}

/* Pad menu utilities */
var PadMenu = {
    version: '1.0.2 [2015-10-22]',
    activeItem: null,
    init: function(holderid, navid, tokenid) { /* init holder/token for pad menu target */
        Ajax.init(holderid, tokenid);
        this.navHolder = DocUtil.get(navid);
    },
    toggle: function(obj, menuid) { /* toggle collapse/expend pad menu */
        if (!obj.menu) obj.menu = DocUtil.get('menu' + menuid);
        var $pad = $(obj),
            $menu = $(obj.menu),
            $cxmenu = $pad.closest('.cx-menu');
        // pad menu already expended
        if ($pad.hasClass('pad-expended')) return;
        // hide old pad menu
        $cxmenu.find('.pad-expended').removeClass('pad-expended').addClass('pad-collapsed').parent().removeClass('expended');
        $cxmenu.find('.menu-expended').removeClass('menu-expended').addClass('menu-collapsed');
        // show selected pad menu
        $pad.removeClass('pad-collapsed').addClass('pad-expended').parent().addClass('expended');
        $menu.removeClass('menu-collapsed').addClass('menu-expended');
        /*
        if(obj.className.indexOf('collapsed')==-1){
          obj.className=obj.className.replace('expended','collapsed');
          obj.menu.className=obj.menu.className.replace('expended','collapsed');
        }else{
          obj.className=obj.className.replace('collapsed','expended');
          obj.menu.className=obj.menu.className.replace('collapsed','expended');
        }
        */
    },
    open: function(obj, padid, servname, link, targetid) { /* goto page */
        if (this.navHolder) this.navHolder.innerHTML = servname;
        if (!obj.pad) obj.pad = DocUtil.get('pad' + padid);
        if (this.activeItem) {
            try {
                var o = this.activeItem;
                o.className = o.className.substring(0, o.className.indexOf('-active'));
                o = this.activeItem.pad.offsetParent;
                o.className = o.className.substring(0, o.className.indexOf('-active'));
            } catch (e) {}
        }
        obj.className += '-active';
        if (obj.pad && obj.pad.offsetParent) obj.pad.offsetParent.className += '-active';
        Ajax.send(null, targetid, link);
        this.activeItem = obj;
        $('.menu-tab').trigger(TRIGGER_FORCE_HIDE_MENU);
    },
    activate: function(menuid, pos) { /* activate menu item by pos */
        var m = DocUtil.get(menuid);
        if (!m) return;
        var r = m.rows[pos];
        if (!r) return;
        r.cells[0].onclick();
    }
}

/* Bar/pad menu utilities */
var BarMenu = {
    version: '1.0.0',
    elements: new Array(),
    deploy: function(menuId, obj, padMenu, parent, href) {
        if (!obj.mover) this.init(menuId, obj, padMenu, parent, href);
        obj.mover();
    },
    init: function(menuId, obj, padMenu, parent, href) { /* init bar/pad menu item */
        if (!this.elements[menuId]) {
            this.elements[menuId] = new Object();
            this.elements[menuId].active = null;
        }
        obj.menuId = menuId;
        obj.mover = function() { /* on mouseover */
            if (this.className == 'pad') {
                this.style.cursor = 'pointer';
                this.className = 'mo-pad';
            }
        }
        obj.onmouseout = function() { /* on mouseout */
            if (this.className == 'mo-pad') this.className = 'pad';
        }
        obj.href = href;
        obj.parent = DocUtil.get(parent);
        obj.subMenu = DocUtil.get(padMenu);
        obj.onclick = function() { /* on click */
            var p = BarMenu.elements[this.menuId].active;
            if (p) {
                p.className = 'pad';
                if (p.subMenu) p.subMenu.style.display = 'none';
            }
            this.className = 'active-pad';
            if (this.subMenu) {
                this.subMenu.style.display = '';
                if (this.subMenu.activePad) this.subMenu.activePad.onclick();
            } else if (this.href) {
                if (this.parent) this.parent.activePad = this;
                Ajax.sendOnPad(this);
            }
            BarMenu.elements[this.menuId].active = this;
        }
    }
}
/* table utilities */
var TableUtil = {
    version: '1.0.0',
    findParentRowIndex: function(obj, rowId) {
        var r = ObjUtil.findParentNode(obj, rowId);
        return r ? r.rowIndex : -1;
    },
    initForListing: function(tobj, skipRows, skipBottomRows, ovClass) { /* init table for listing */
        if (tobj.initialized) return;
        ovClass = StrUtil.trim(ovClass) || 'ov';
        var tr = tobj.rows,
            sos = 0 + skipRows,
            eos = 0 + skipBottomRows;
        for (var i = sos; i < tr.length - eos; i++) {
            //tr[i].index=i-sos;
            //tr[i].className=StrUtil.trim(tr[i].className);
            //tr[i].origClass=StrUtil.trim(tr[i].origClass);
            tr[i].onmouseover = function() { /* on mouseover <TR> */
                $(this).addClass(ovClass);
                //if(!this.origClass || !StrUtil.contain(this.className,ovClass))this.origClass=this.className;
                //this.className+=' '+ovClass;
            }
            tr[i].onmouseout = function() { /* on mouseout <TR> */
                $(this).removeClass(ovClass);
                //this.className=this.origClass;
            }
        }
        tobj.initialized = true;
    },
    initSelector: function(tobj, forTBody, skipRows, skipBottomRows) { /* init table for selector functions */
        if (this.selector) return;
        this.selector = {
            table: tobj,
            forTBody: forTBody,
            skipRows: skipRows,
            skipBottomRows: skipBottomRows,
            moveUp: function(idx) { /* move specified row/tbody upward one index point */
                this.move(idx, -1);
            },
            moveDown: function(idx) { /* move specified row/tbody downward one index point */
                this.move(idx, 1);
            },
            move: function(idx, dn) { /* move specified row/tbody up/down one index point */
                var ary = this.forTBody ? this.table.tBodies : this.table.rows;
                if (idx == -1 || idx + dn < this.skipRows || idx >= ary.length - this.skipBottomRows - dn) return;
                var o1 = ary[idx],
                    o2 = ary[idx + dn];
                var o1id = o1.id;
                o1.id = o2.id;
                o2.id = o1id;
                if (o1.rows) {
                    for (var j = 0; j < o1.rows.length; j++)
                        this.interChange(o1.rows[j], o2.rows[j]);
                } else this.interChange(o1, o2);
            },
            interChange: function(r1, r2) { /* interchange the contents of two rows */
                for (var x = 0; x < r1.cells.length; x++) {
                    var c = r1.cells[x].innerHTML;
                    r1.cells[x].innerHTML = r2.cells[x].innerHTML;
                    r2.cells[x].innerHTML = c;
                }
            },
            append: function(idx, id, nodeIdsToDel) { /* append a new row; this version does not support appending new tbody object to table */
                if (idx == -1 || this.forTBody) return;
                var r = this.table.insertRow(idx + 1),
                    o = this.table.rows[idx];
                r.id = id;
                for (var i = 0; i < o.cells.length; i++) {
                    var c = r.insertCell(i);
                    c.innerHTML = o.cells[i].innerHTML;
                    c.className = o.cells[i].className;
                    c.align = o.cells[i].align;
                    c.vAlign = o.cells[i].vAlign;
                    c.width = o.cells[i].width;
                    c.height = o.cells[i].height;
                    c.rowSpan = o.cells[i].rowSpan;
                    c.colSpan = o.cells[i].colSpan;
                    ObjUtil.deleteNodesByIds(c, nodeIdsToDel);
                    FormUtil.resetFormElementsInNode(c);
                }
            },
            remove: function(idx) { /* delete the specified row; this version does not support deleting tbody object from table */
                if (idx == -1 || this.forTBody) return;
                this.table.deleteRow(idx);
            }
        };
    },
    countNoOfCheckBox: function(fname) {
        var count = 0;
        var f = FormUtil.get(fname);
        if (!f) return;
        for (var i = 0; i < f.elements.length; i++) {
            var e = f.elements[i];
            if (e.type == 'checkbox') {
                count++;
            }
        }
        return count;
    },
    countNoOfSelectedCheckBox: function(fname, element) {
        var count = 0;
        var f = FormUtil.get(fname);
        if (!f) return;
        for (var i = 0; i < f.elements.length; i++) {
            var e = f.elements[i];
            if (e.name == element && e.type == 'checkbox' && e.checked) {
                count++;
            }
        }
        return count;
    }
}
/* input form utilities */
var FormUtil = {
    version: '1.0.4 [2007-06-29] - add a function to convert form elements into para pairs',
    get: function(fname, element, checked) { /* get form or form element(s) or checked form element (for radio set) by name */
        var f = document.forms[fname];
        if (!element) return f;
        if (!f) return null;
        var e = f.elements[element];
        if (checked && e) {
            if (e.length) {
                for (var i = 0; i < e.length; i++)
                    if (e[i].checked) return e[i];
                return null;
            }
            if (!e.checked) return null;
        }
        return e;
    },
    getElementsByNamePrefix: function(fname, prefix) {
        var elementArray = new Array();
        if (prefix && prefix.length > 0) {
            var elements = document.forms[fname].elements;
            if (elements && elements.length > 0) {
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element && element.name && element.name.length > 0 && StrUtil.startWith(element.name, prefix)) {
                        elementArray.push(element);
                    }
                }
            }
        }
        return elementArray;
    },
    getElementsByNameSuffix: function(fname, suffix) {
        var elementArray = new Array();
        if (suffix && suffix.length > 0) {
            var elements = document.forms[fname].elements;
            if (elements && elements.length > 0) {
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element && element.name && element.name.length > 0 && StrUtil.endWith(element.name, suffix)) {
                        elementArray.push(element);
                    }
                }
            }
        }
        return elementArray;
    },
    getElementsByNameRegExp: function(fname, regexp) {
        var elementArray = new Array();
        if (regexp) {
            var elements = document.forms[fname].elements;
            if (elements && elements.length > 0) {
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element && element.name && element.name.length > 0 && matchPattern(element.name, regexp)) {
                        elementArray.push(element);
                    }
                }
            }
        }
        return elementArray;
    },
    initForm: function(fname) { /* init form & elements */
        var f = this.get(fname);
        if (!f) return null;
        for (var i = 0; i < f.elements.length; i++) {
            var e = f.elements[i];
            if (e.type == 'checkbox' || e.type == 'radio') continue;
            if (e.type == 'button' || e.type == 'submit' || e.type == 'reset') {
                e.onmouseover = function() {
                    FormUtil.initButton(this);
                }
            } else {
                if (e.type != 'select-one') {
                    e.onfocus = function() {
                        if (!this.className) this.className = 'active';
                        else this.className += ' active';
                    }
                    e.onblur = function() {
                        if (this.className == 'active') this.className = '';
                        else this.className = this.className.replace(' active', '');
                    }
                }
            }
        }
        return f;
    },
    checkAll: function(fname, element, reset) { /* check all input checkbox/radio elements */
        var e;
        if (typeof fname === 'object') {
            var $o = $(fname);
            if ($o.is('form')) $e = $o.find('[name="' + element + '"]');
            else $e = $o.closest('form').find('[name="' + element + '"]');
        } else $e = $('form[name="' + fname + '"] [name="' + element + '"]');
        if (reset) $e.filter(':checked').prop('checked', false);
        else $e.filter(':not(:checked)').prop('checked', true);
        /*
        var e=this.get(fname,element);
        if(!e.length)e.checked=chk;
        else for(var i=0;i<e.length;i++) {
          if(!e[i].disabled)e[i].checked=reset?false:true;
        }
        */
    },
    uncheckAll: function(fname, element) { /* uncheck all input checkbox/radio elements */
        this.checkAll(fname, element, true);
    },
    disable: function(fname, element, reset) { /* disable form element */
        var e = this.get(fname, element);
        if (!e) return;
        if (e.type) {
            this.toggleDisable(e, !reset);
            if (reset) e.focus();
        } else {
            for (var i = 0; i < e.length; i++) this.toggleDisable(e[i], !reset);
            if (reset) e[0].focus();
        }
    },
    enable: function(fname, element) { /* enable form element */
        this.disable(fname, element, true);
        this.get(fname, element).focus();
    },
    disableElements: function(fname, elements, reset) { /* disable selective elements */
        var f = this.get(fname);
        if (!f) return;
        for (var i = 0; i < elements.length; i++) {
            var e = f.elements[elements[i]];
            if (e) {
                if (e.type) this.toggleDisable(e, !reset);
                else
                    for (var j = 0; j < e.length; j++) this.toggleDisable(e[j], !reset);
            }
        }
    },
    enableElements: function(fname, elements) { /* enable selective element */
        this.disableElements(fname, elements, true);
        this.get(fname, elements[0]).focus();
    },
    disableAll: function(fname, reset) { /* disable all form elements */
        var f = this.get(fname);
        if (!f) return;
        var e = f.elements;
        for (var i = 0; i < e.length; i++) this.toggleDisable(e[i], !reset);
    },
    enableAll: function(fname) { /* enable all form elements */
        this.disableAll(fname, true);
    },
    disableAllButtonsInNode: function(obj) { /* disable all buttons within the specified object */
        var c = obj.childNodes;
        if (c.length > 0) {
            for (var i = 0; i < c.length; i++) {
                if (c[i].type) {
                    if (c[i].type == 'submit' || c[i].type == 'button') {
                        c[i].disabled = true;
                    }
                } else if (c[i].tagName == 'BUTTON') {
                    c[i].disabled = true;
                } else if (c[i].childNodes.length > 0) this.disableAllButtonsInNode(c[i]);
            }
        }
    },
    enableAllButtonsInNode: function(obj) { /* enable all buttons within the specified object */
        var c = obj.childNodes;
        if (c.length > 0) {
            for (var i = 0; i < c.length; i++) {
                if (c[i].type) {
                    if (c[i].type == 'submit' || c[i].type == 'button') {
                        c[i].disabled = false;
                    }
                } else if (c[i].tagName == 'BUTTON') {
                    c[i].disabled = false;
                } else if (c[i].childNodes.length > 0) this.enableAllButtonsInNode(c[i]);
            }
        }
    },
    toggleDisable: function(obj, dis) { /* toggle disable/enable element */
        if (dis) {
            obj.disabled = true;
            if (!obj.className || !StrUtil.contain(obj.className, 'disabled')) {
                if (!obj.className) obj.className = 'disabled';
                else obj.className += ' disabled';
            }
        } else {
            obj.disabled = false;
            if (obj.className) obj.className = obj.className.replace(/disabled/gi, '');
        }
    },
    enableDisableButtonList: function(elementlist, enable) {
        if (elementlist)
            for (var i = 0; i < elementlist.length; i++)
                if (elementlist[i]) this.toggleDisable(elementlist[i], !enable);
    },
    checkUnCheckButtonList: function(elementlist, check, includeDisable) {
        if (elementlist && elementlist.length > 0) {
            var checkedRadio = false;
            for (var i = 0; i < elementlist.length; i++) {
                var element = elementlist[i];
                if (element && (!element.disabled || (element.disabled && includeDisable))) {
                    if (check && !checkedRadio) {
                        element.checked = true;
                        if (element.type == 'radio') {
                            checkedRadio = true;
                        }
                    } else {
                        element.checked = false;
                    }
                }
            }
        }
    },
    getCheckBoxList: function(elementName, check, disable) {
        var checkedElementList = new Array();
        if (elementName && elementName.length > 0) {
            var elementlist = document.getElementsByName(elementName);
            if (elementlist != null && elementlist.length > 0) {
                for (var i = 0; i < elementlist.length; i++) {
                    var element = elementlist[i];
                    if (element && (element.type == 'checkbox' || element.type == 'radio')) {
                        if ((check != true && check != false) || element.checked == check) {
                            if ((disable != true && disable != false) || element.disabled == disable) {
                                checkedElementList.push(element);
                            }
                        }
                    }
                }
            }
        }
        return checkedElementList;
    },
    countText: function(obj, ctr) { /* count number of characters in textarea element and should in the object*/
        var val = obj.value.replace(/(\r\n)/gim, '\n');
        var cnt = val.replace(/[^\x00-\xff]/g, "**").length;
        if (ctr) {
            if (!obj.counter) {
                var e = obj.form.elements[ctr];
                if (!e) e = DocUtil.get(ctr);
                obj.counter = e;
            }
            if (typeof(obj.counter.value) != 'undefined')
                obj.counter.value = cnt;
            else if (typeof(obj.counter.innerHTML) != 'undefined')
                obj.counter.innerHTML = cnt;
        }
        return cnt;
    },
    initButton: function(bobj) { /* init button */
        if (!bobj.mover) {
            bobj.mover = function() { /* on mouseover */
                if (!bobj.className || bobj.className.indexOf('mover') == -1) {
                    if (!bobj.className) bobj.className = 'mover';
                    else bobj.className += ' mover';
                }
            }
            bobj.onmouseout = function() { /* on mouseout */
                if (bobj.className == 'mover') bobj.className = '';
                else bobj.className = bobj.className.replace(' mover', '');
            }
        }
        bobj.mover();
    },
    resetFormElementsInNode: function(obj) { /* reset all input form elements within the specified object */
        var c = obj.childNodes;
        if (c.length > 0) {
            for (var i = 0; i < c.length; i++) {
                if (c[i].type) {
                    if (c[i].type == 'text' || c[i].type == 'file') c[i].value = '';
                    if (c[i].type == 'textarea') c[i].value = '';
                    else if (c[i].type == 'radio' || c[i].type == 'checkbox') c[i].checked = false;
                } else if (c[i].childNodes.length > 0) this.resetFormElementsInNode(c[i]);
            }
        }
    },
    pair: function(name, val, toUTF8) {
        if (name) {
            val = ((val) ? val.replace(/(\r\n)/gim, '\n') : '');
            if (toUTF8) val = encodeURI(val);
            return name + '=' + DocUtil.escapeUrl(val) + '&';
        }
        return '';
    },
    convertParasByName: function(fname, includeDisabled) { /* convert form elements into name-value para pairs by specified form name*/
        var f = this.get(fname);
        if (!f) return '';
        return this.convertParas(f, includeDisabled);
    },
    convertParas: function(f, includeDisabled, toUTF8) { /* convert form elements into name-value para pairs */
        var paras = '',
            e;
        for (var i = 0; i < f.elements.length; i++) {
            e = f.elements[i];
            if (e.disabled && !includeDisabled) continue;
            if (e.type == 'select-multiple') {
                for (var j = 0; j < e.options.length; j++) {
                    //if(e.options[j].selected)paras+=this.pair(e.name, (toUTF8) ? encodeURI(e.options[j].value) : e.options[j].value);
                    if (e.options[j].selected) paras += this.pair(e.name, e.options[j].value, toUTF8);
                }
            } else if (e.type == 'select-one') {
                //if(e.selectedIndex!=-1)paras+=this.pair(e.name, (toUTF8) ? encodeURI(e.options[e.selectedIndex].value) : e.options[e.selectedIndex].value);
                if (e.selectedIndex != -1) paras += this.pair(e.name, e.options[e.selectedIndex].value, toUTF8);
            } else if (e.type == 'radio' || e.type == 'checkbox') {
                //if(e.checked)paras+=this.pair(e.name, (toUTF8) ? encodeURI(e.value) : e.value);
                if (e.checked) paras += this.pair(e.name, e.value, toUTF8);
            } else {
                //paras+=this.pair(e.name, (toUTF8) ? encodeURI(e.value) : e.value);
                paras += this.pair(e.name, e.value, toUTF8);
            }
        }
        if (paras) paras = paras.substring(0, paras.length - 1);
        return paras;
    },
    convertParasFromCheckBoxName: function(checkboxName, checked, paraName, includeDisable) {
        if (checkboxName && checkboxName.length > 0) {
            var checkboxArray = document.getElementsByName(checkboxName);
            return this.convertParasFromCheckList(checkboxArray, checked, paraName, includeDisable);
        }
    },
    convertParasFromCheckBoxNamePrefix: function(fname, prefix, checked, paraName, includeDisable) {
        if (fname && fname.length > 0 && prefix && prefix.length > 0) {
            var checkboxArray = FormUtil.getElementsByNamePrefix(fname, prefix);
            return this.convertParasFromCheckList(checkboxArray, checked, paraName, includeDisable);
        }
    },
    convertParasFromCheckBoxNameSuffix: function(fname, suffix, checked, paraName, includeDisable) {
        if (fname && fname.length > 0 && suffix && suffix.length > 0) {
            var checkboxArray = FormUtil.getElementsByNameSuffix(fname, suffix);
            return this.convertParasFromCheckList(checkboxArray, checked, paraName, includeDisable);
        }
    },
    convertParasFromCheckBoxNameRegExp: function(fname, regexp, checked, paraName, includeDisable) {
        if (fname && fname.length > 0 && regexp) {
            var checkboxArray = FormUtil.getElementsByNameRegExp(fname, regexp);
            return this.convertParasFromCheckList(checkboxArray, checked, paraName, includeDisable);
        }
    },
    convertParasFromCheckList: function(checkboxArray, checked, paraName, includeDisable) {
        var paras = '';
        if (checkboxArray && checkboxArray.length > 0 && paraName && paraName.length > 0) {
            for (var i = 0; i < checkboxArray.length; i++) {
                var checkbox = checkboxArray[i];
                if (checkbox && checkbox.checked == checked && (!checkbox.disabled || (checkbox.disabled && includeDisable))) {
                    paras += this.pair(paraName, checkbox.value);
                }
            }
        }
        return paras;
    },
    submit: function(fname, holder, href) { /* submitting form using Ajax post method */
        var f = this.get(fname);
        if (!f || !href) return;
        /*
        var paras='',e;
        for(var i=0;i<f.elements.length;i++){
          e=f.elements[i];
          if(e.disabled)continue;
          if(e.type=='select-multiple'){
            for(var j=0;j<e.options.length;j++){
              if(e.options[j].selected)paras+=this.pair(e.name,e.options[j].value);
            }
          }else if(e.type=='select-one'){
            if(e.selectedIndex!=-1)paras+=this.pair(e.name,e.options[e.selectedIndex].value);
          }else if(e.type=='radio'||e.type=='checkbox'){
            if(e.checked)paras+=this.pair(e.name,e.value);
          }else{
            paras+=this.pair(e.name,e.value);
          }
        }
        if(paras)paras=paras.substring(0,paras.length-1);
        Ajax.post(f,holder,href,paras);
        */
        Ajax.post(f, holder, href, this.convertParas(f, false));
    },
    submitIncludeDisabled: function(fname, holder, href) { /* Same as above "this.submit()", just include the disabled elements */
        var f = this.get(fname);
        if (!f || !href) return;
        /*
        var paras='',e;
        for(var i=0;i<f.elements.length;i++){
          e=f.elements[i];
          if(e.type=='select-multiple'){
            for(var j=0;j<e.options.length;j++){
              if(e.options[j].selected)paras+=this.pair(e.name,e.options[j].value);
            }
          }else if(e.type=='select-one'){
            if(e.selectedIndex!=-1)paras+=this.pair(e.name,e.options[e.selectedIndex].value);
          }else if(e.type=='radio'||e.type=='checkbox'){
            if(e.checked)paras+=this.pair(e.name,e.value);
          }else{
            paras+=this.pair(e.name,e.value);
          }
        }
        if(paras)paras=paras.substring(0,paras.length-1);
        Ajax.post(f,holder,href,paras);
        */
        Ajax.post(f, holder, href, this.convertParas(f, true));
    },
    submitParaedURL: function(fname, holder, href) { /* Same as above "this.submit()", just add all the Paras into URL */
        var f = this.get(fname);
        if (!f || !href) return;
        /*
        var paras='',e;
        for(var i=0;i<f.elements.length;i++){
          e=f.elements[i];
          if(e.type=='select-multiple'){
            for(var j=0;j<e.options.length;j++){
              if(e.options[j].selected)paras+=this.pair(e.name,e.options[j].value);
            }
          }else if(e.type=='select-one'){
            if(e.selectedIndex!=-1)paras+=this.pair(e.name,e.options[e.selectedIndex].value);
          }else if(e.type=='radio'||e.type=='checkbox'){
            if(e.checked)paras+=this.pair(e.name,e.value);
          }else{
            paras+=this.pair(e.name,e.value);
          }
        }
        if(paras){
        	paras=paras.substring(0,paras.length-1);
        	href=href+'?'+paras;
        }
        Ajax.post(f,holder,href,null);
        */
        var paras = this.convertParas(f, false);
        if (paras) href += '?' + paras;
        Ajax.post(f, holder, href, null);
    },
    submitConfirm: function(fname, holder, href, action, isdouble) { /* send HTTP request by post method w/- confirmation */
        if (WinUtil.confirm(null, action, isdouble)) this.submit(fname, holder, href);
    },
    submitDblConfirm: function(fname, holder, href, action) { /* send HTTP request by post method w/- double confirmation */
        this.submitConfirm(fname, holder, href, action, true);
    },
    dump: function(fname) { /* dump element-value pairs in form to alert box */
        var f = this.get(fname),
            ct = '';
        for (var i = 0; i < f.elements.length; i++)
            ct += f.elements[i].name + '[' + f.elements[i].type + ']=' + f.elements[i].value + '\n';
        alert('Element summary of form - ' + fname + '\n\n' + ct);
    }
}
/* option selector - move options from one select to another one or move selected options up/down*/
var Selector = {
    version: '1.0.1 [9/1/2007]',
    init: function(form, target, stepper, upbtn, downbtn, source, curDiv, limDiv, mkbtn, umkbtn, prefix) { /* init selector; modified by kfc @19 Apr, 2007 */
        var f = FormUtil.get(form);
        if (!f) return;
        this.prefix = prefix
        this.stepper = f.elements[stepper];
        var ub = DocUtil.get(upbtn),
            db = DocUtil.get(downbtn);
        if (ub) {
            ub.onclick = function() {
                Selector.move(-1);
            }
            ub.onmouseover = function() {
                FormUtil.initButton(this);
            }
        }
        if (db) {
            db.onclick = function() {
                Selector.move(1);
            }
            db.onmouseover = function() {
                FormUtil.initButton(this);
            }
        }
        this.used = DocUtil.get(curDiv);
        this.quota = DocUtil.get(limDiv);
        var mb = DocUtil.get(mkbtn),
            umb = DocUtil.get(umkbtn);
        if (mb) {
            mb.onclick = function() {
                Selector.mark();
            }
            mb.onmouseover = function() {
                FormUtil.initButton(this);
            }
        }
        if (umb) {
            umb.onclick = function() {
                Selector.unmark();
            }
            umb.onmouseover = function() {
                FormUtil.initButton(this);
            }
        }
        this.initSource(form, source);
        this.initTarget(form, target);
        this.recalc();
    },
    initSource: function(form, source, recalc) { /* added by kfc @19 Apr, 2007 */
        var f = FormUtil.get(form);
        if (!f) return;
        this.source = f.elements[source];
        if (recalc) this.recalc();
    },
    initTarget: function(form, target, recalc) { /* added by kfc @19 Apr, 2007 */
        var f = FormUtil.get(form);
        if (!f) return;
        this.target = f.elements[target];
        this.removedItems = new Array();
        if (recalc) this.recalc();
    },
    move: function(dn) { /* move selected options up/down */
        if (!this.target || !this.stepper || this.target.selectedIndex == -1) return;
        var t = this.target.options,
            ov, oh, s, e, dy = 0;
        dn = (0 + this.stepper.value) * dn;
        if (dn == 0) return;
        var loop = dn > 0 ? {
            start: t.length - 1,
            end: -1,
            sign: -1
        } : {
            start: 0,
            end: t.length,
            sign: 1
        };
        for (var k = loop.start; k != loop.end; k += loop.sign) {
            if (t[k].selected) {
                ov = t[k].value;
                oh = t[k].text;
                s = k;
                e = Math.abs(Math.max(loop.sign * (s + dn), loop.sign * (loop.start + (loop.sign * dy))));
                for (var j = s; j != e; j += (-loop.sign)) {
                    t[j].value = t[j - loop.sign].value;
                    t[j].text = t[j - loop.sign].text;
                    t[j].selected = t[j - loop.sign].selected;
                }
                t[e].value = ov;
                t[e].text = oh;
                t[e].selected = true;
                dy++;
            }
        }
    },
    mark: function() { /* mark all selected options from source to target select element */
        if (!this.source || !this.target) return;
        var s = this.source.options,
            t = this.target.options,
            f;
        var q = this.quota ? parseInt(this.quota.innerHTML) : -1;
        for (var i = 0; i < s.length; i++) {
            if (s[i].selected && s[i].value) {
                if (this.quota && t.length >= q) {
                    alert('No more available space for assignment!');
                    return;
                }
                found = false;
                for (var j = 0; j < t.length; j++)
                    if (t[j].value == s[i].value) {
                        found = true;
                        break;
                    }
                if (!found) {
                    this.stabilize(t, true);
                    t[t.length] = this.newOption(s[i]);
                }
                s[i].selected = false;
                s[i].disabled = true;
                s[i].className = 'dx';
                this.toggleQuotaAlarm();
                if (this.used) this.used.innerHTML = t.length;
            }
        }
    },
    unmark: function() { /* unmark all selected options from target select element */
        if (!this.target || this.target.selectedIndex == -1 || !this.source | this.source.disabled) return;
        var t = this.target.options,
            s = this.source.options
        for (var i = 0; i < t.length; i++) {
            if (t[i].selected && t[i].value) {
                this.addRemovedItem(t[i]);
                for (var j = 0; j < s.length; j++) {
                    if (this.match(s[j].value, t[i].value)) {
                        s[j].disabled = false;
                        s[j].className = '';
                    }
                }
                for (var j = i; j < t.length - 1; j++) {
                    t[j].value = t[j + 1].value;
                    t[j].text = t[j + 1].text;
                    t[j].selected = t[j + 1].selected;
                }
                t.length--;
                i--;
            }
        }
        this.stabilize(t, false);
        if (this.used) this.used.innerHTML = t.length;
        this.toggleQuotaAlarm();
    },
    recalc: function() { /* recalculate elements marked in target select element; modified by kfc @19 Apr, 2007 */
        if (!this.source || !this.target) return;
        var t = this.target.options,
            s = this.source.options;
        if (this.used) this.used.innerHTML = t.length;
        for (var i = 0; i < s.length; i++) {
            var matched = false;
            for (var j = 0; j < t.length; j++) {
                if (this.match(s[i].value, t[j].value)) {
                    s[i].disabled = true;
                    s[i].className = 'dx';
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                s[i].disabled = false;
                s[i].className = '';
            }
        }
        this.toggleQuotaAlarm();
    },
    match: function(s, t) { /* added by kfc @19 Apr, 2007; check whether x & y are equal */
        return s && (s == t || (this.prefix && (t == 'ex:' + s || t == 'nw:' + s)));
    },
    newOption: function(s) { /* added by kfc @19 Apr, 2007; create new option w/- approprate value */
        if (!this.prefix) return new Option(s.text, s.value);
        var o = this.removedItems;
        for (var i = 0; i < o.length; i++) {
            if (s.value == o[i]) {
                for (var j = i; j < o.length - 1; j++) o[j] = o[j + 1];
                o.length = o.length - 1;
                return new Option(s.text, 'ex:' + s.value);
            }
        }
        return new Option(s.text, 'nw:' + s.value);
    },
    addRemovedItem: function(s) { /* added by kfc @19 Apr, 2007; add the removed option to removedItem array */
        if (!this.prefix) return;
        if (s.value.indexOf('nw:') != -1) return;
        var o = this.removedItems;
        o[o.length] = s.value.substring(3);
        //alert('removedItems.length='+o.length);
    },
    formatParams: function(id, del_id) { /* added by kfc @19 Apr, 2007; to convert target and removedItems to parameter string */
        var ct = '',
            t = this.target.options,
            o = this.removedItems;
        for (var i = 0; i < t.length; i++)
            if (t[i].value) ct += '&' + id + '=' + t[i].value;
        for (var i = 0; i < o.length; i++)
            if (o[i]) ct += '&' + del_id + '=' + o[i];
        return ct;
    },
    toggleQuotaAlarm: function() { /* added by kfc @19 Apr, 2007; toggle on/off quota full alarm */
        var qt = this.quota,
            ut = this.used;
        if (!qt) return;
        var q = parseInt(qt.innerHTML);
        if (typeof(ut.origClass) == 'undefined') ut.origClass = ut.className;
        if (this.target.options.length >= q) ut.className = ut.origClass + ' full';
        else ut.className = ut.origClass;
    },
    stabilize: function(o, foradd) { /* added by kfc @20 Apr, 2007; stabilize incoming select options */
        if (foradd && o.length == 1 && !o[0].value) o.length--;
        else if (!foradd && o.length == 0) o[0] = new Option('No records found.', '');
    }
}
/* layered file explorer */
var Explorer = {
    sizer: null,
    explorer: null,
    active: null,
    holderId: null,
    editMode: false,
    init: function(sizerId, explorerId, holderId) { /* initialize explorer */
        if (this.sizer) return;
        this.holderId = holderId;
        this.sizer = DocUtil.get(sizerId);
        this.explorer = DocUtil.get(explorerId);
        if (this.explorer.style.width.indexOf('px') > -1)
            this.explorer.style.width = this.explorer.style.width.replace('px', '');
        this.sizer.onmousedown = function() { /* on mousedown */
            DocUtil.copyAndPaste.disable();
            if (!this.origClass && this.className != 'md') this.origClass = this.className;
            this.className = 'md';
            Explorer.explorer.wOffset = Mouse.pointer.x - parseInt(Explorer.explorer.style.width);
            Explorer.explorer.doEvent = function() {
                var nw = Mouse.pointer.x - this.wOffset;
                if (nw > 50 && nw < 500) {
                    this.style.width = nw;
                    this.parentNode.style.width = nw;
                }
            }
        }
        this.sizer.onmouseup = function() { /* on mouseup */
            this.className = this.origClass;
            if (Explorer.explorer) {
                Explorer.explorer.doEvent = null;
                DocUtil.copyAndPaste.enable();
            }
        }
        Mouse.trigger.enable(this.explorer);
    },
    activate: function(obj, href) { /* activate contents of specified object */
        if (this.active && this.active == obj) {
            if (!this.editMode) this.editCaption(obj);
            return;
        }
        this.inactivate(obj);
        for (var i = 0; i < obj.cells.length; i++) {
            if (obj.cells[i].className == 'exp-object' && obj.cells[i].innerHTML.indexOf('folder') > -1)
                obj.cells[i].innerHTML = obj.cells[i].innerHTML.replace('folder', 'folder-opened');
            if (obj.cells[i].className == 'exp-caption')
                obj.cells[i].className = 'exp-caption-active';
        }
        Ajax.send(obj, this.holderId, href);
    },
    inactivate: function(obj) { /* inactivate last active object and set the specified one as new */
        if (this.active) {
            for (var i = 0; i < this.active.cells.length; i++) {
                if (this.active.cells[i].className == 'exp-object')
                    this.active.cells[i].innerHTML = this.active.cells[i].innerHTML.replace('folder-opened', 'folder');
                if (this.active.cells[i].className == 'exp-caption-active')
                    this.active.cells[i].className = 'exp-caption';
            }
        }
        this.active = obj;
    },
    editCaption: function(obj) { /* turn caption into edit mode */
        for (var i = 0; i < obj.cells.length; i++) {
            var o = obj.cells[i];
            if (o.className == 'exp-caption-active') {
                var e = document.createElement('INPUT');
                if (!e) return;
                e.type = 'text';
                e.value = o.innerHTML;
                e.origValue = o.innerHTML;
                e.size = o.innerHTML.length + 3;
                e.onblur = function() {
                    Explorer.back2View(this);
                }
                e.onkeyup = function(e) {
                    if (!e) e = event;
                    if (e.keyCode == 13) Explorer.back2View(this);
                    else if (e.keyCode == 27) {
                        this.value = this.origValue;
                        Explorer.back2View(this);
                    }
                }
                o.innerHTML = '';
                o.appendChild(e);
                this.editMode = true;
                e.focus();
                e.select();
            }
        }
    },
    back2View: function(obj) {
        var c = obj.parentNode;
        if (obj.value) c.innerHTML = obj.value;
        else c.innerHTML = obj.origValue;
        this.editMode = false;
    },
    toggle: function(obj, targetId) { /* toggle expend / collapse specified target level */
        if (!obj.toggle) {
            obj.target = DocUtil.get(targetId);
            obj.toggle = function() {
                var expended = this.src.indexOf('expended') > -1;
                if (expended) {
                    this.target.style.display = 'none';
                    this.src = this.src.replace('expended', 'collapsed');
                } else {
                    this.target.style.display = '';
                    this.src = this.src.replace('collapsed', 'expended');
                }
            }
        }
        obj.toggle();
    }
}

/* TableAction utilities for removing rows and appending row as the last*/
var TableActionUtil = {
    table: null,
    tbody: null,
    ids: null,
    seqno: 1,
    tokenBar: null,
    initTable: function(tokenBar, tableObj, tbodyObj, seqno, ids, NumOfSkippedRows) {
        this.tokenBar = DocUtil.get(tokenBar);
        this.table = DocUtil.get(tableObj);
        this.tbody = DocUtil.get(tbodyObj);
        if (seqno > 0) {
            this.seqno = seqno;
        }
        this.ids = ids;
    },
    getSeqno: function() {
        return this.seqno;
    },
    removeRow: function(curRow) {
        var tbody = curRow;
        while (tbody && tbody.tagName != 'TBODY') {
            tbody = tbody.parentNode;
        }

        if (tbody) {
            FormUtil.resetFormElementsInNode(tbody);
            tbody.style.display = 'none';
        }
    },
    findTr: function() {
        var reftbody = this.tbody;
        if (reftbody) {
            for (var k = 0; k < reftbody.childNodes.length; k++) {
                var reftr = reftbody.childNodes[k];
                if (reftr && reftr.tagName == 'TR') {
                    return reftr;
                }
            }
        }
        return null;
    },
    replaceId: function(cell, ids) {
        var content = cell.innerHTML;
        if (cell.tagName == 'TD' && this.ids.length == ids.length) {
            for (var j = 0; j < ids.length; j++) {
                while (content.indexOf(this.ids[j]) != -1) {
                    content = content.replace(this.ids[j], ids[j]);
                }
            }
        }
        return content;
    },
    appendRow: function(ids) {
        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');

        var reftr = this.findTr();
        if (reftr) {
            for (var i = 0; i < reftr.cells.length; i++) {
                var td = (reftr.cells[i].tagName == 'TH') ? document.createElement('TH') : document.createElement('TD');
                var content = reftr.cells[i].innerHTML;

                /*** replace reference ids with input ids***/
                if (ids) {
                    content = this.replaceId(reftr.cells[i], ids);
                }

                td.innerHTML = content;
                td.className = reftr.cells[i].className;
                td.align = reftr.cells[i].align;
                td.vAlign = reftr.cells[i].vAlign;
                td.width = reftr.cells[i].width;
                td.height = reftr.cells[i].height;
                td.rowSpan = reftr.cells[i].rowSpan;
                td.colSpan = reftr.cells[i].colSpan;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
            this.table.appendChild(tbody);
            this.seqno++;
            FormUtil.resetFormElementsInNode(td);
        }
    },
    animation: function() { /* play a animation when loading */
        if (this.tokenBar == null) return;
        var message = this.tokenBar.innerHTML;
        var messageHead = message.split('.')[0];
        if (message.length - messageHead.length < 3) {
            this.tokenBar.innerHTML = message + '.';
        } else {
            this.tokenBar.innerHTML = messageHead;
        }
    },
    setAnimation: function() { /* trigger the animation */
        this.clearAnimation();
        this.tknBarAnimationHandle = window.setInterval('TableActionUtil.animation()', 800);
    },
    clearAnimation: function() { /* clear the animation */
        if (this.tknBarAnimationHandle) {
            window.clearInterval(this.tknBarAnimationHandle);
        }
    }
}

var ValidatorUtil = {
    getStrLength: function(strObj) {
        // When the string is submitted, it is converted to UTF-8 which is in %uXXXX format and length = 6
        var str = escape(strObj);
        var index = str.indexOf("%u");
        if (index != -1) return str.length;
        else return strObj.length;
    },
    validateKeywords: function(kws, fobj) {
        if (!kws) return;
        var rg = /([^a-zA-Z0-9\s\-\'])/,
            perr = false,
            derr = false;
        var validateOne = function(kwe, isFirst) {
            kw = StrUtil.trim(kwe.value);
            if (isFirst && !kw) fobj.appendErrorMessage('The frist keyword is required.');
            if (!perr && kw && kw.match(rg)) {
                fobj.appendErrorMessage('No punctuation is accepted for keywords.');
                perr = true;
            }
            return kw;
        };
        if (kws.length) {
            for (var i = 0; i < kws.length; i++) {
                var kw = validateOne(kws[i], i == 0);
                if (kw && i < kws.length - 1) {
                    for (var j = i + 1; j < kws.length; j++) {
                        var kw2 = StrUtil.trim(kws[j].value);
                        if (!derr && kw == kw2) {
                            fobj.appendErrorMessage('Keywords are duplicated - ' + kw);
                            derr = true;
                            break;
                        }
                    }
                }
            }
        } else validateOne(kws, true);
    },
    validateText: function(txt, fobj, len, req, caption) {
        if (!txt) return;
        var capt = caption ? caption : txt.name,
            val = StrUtil.trim(txt.value);
        if (req && !val) fobj.appendErrorMessage(capt + ' is required.');
        else if (val && val.length > len)
            fobj.appendErrorMessage(capt + ' exceeds max length - ' + len + ' characters.');
    },
    checkNoInput: function(idArray) { // check if all elements have empty value
        var isAllEmpty = true;
        if (idArray && idArray.length > 0) {
            for (var i = 0; i < idArray.length; i++) {
                var id = idArray[i];
                if (id && id.length > 0) {
                    var idObj = DocUtil.get(id);
                    if (idObj && idObj.value.length > 0) {
                        isAllEmpty = false;
                    }
                }
            }
        }
        return isAllEmpty;
    },
    checkInputTextLength: function(target, minLength, maxLength, notNull, numberic, name) {
        var errMsg = "";
        var obj = document.getElementById(target);
        var value = (obj) ? obj.value : '';
        return this.checkTextLength(value, minLength, maxLength, notNull, numberic, name);
    },
    checkTextLength: function(text, minLength, maxLength, notNull, numberic, name) {
        var errMsg = "";
        name = (name) ? StrUtil.trim(name) : 'A field';
        text = (text) ? StrUtil.trim(text) : '';
        if (!text) {
            if (notNull) {
                errMsg += '@fieldName@ is required.\n';
                errMsg = errMsg.replace("@fieldName@", name);
            }
        } else {
            if (numberic && isNaN(text)) errMsg += name + ' must be numberic.\n';
            if (maxLength && !isNaN(maxLength) && this.getStrLength(text) > maxLength) {
                errMsg += '@fieldName@ cannot be greater than @maxLength@ characters.\n';
                errMsg = errMsg.replace("@fieldName@", name);
                errMsg = errMsg.replace("@maxLength@", maxLength);
            }
            if (minLength && !isNaN(minLength) && this.getStrLength(text) < minLength) {
                errMsg += '@fieldName@ cannot be less than @minLength@ characters.\n';
                errMsg = errMsg.replace("@fieldName@", name);
                errMsg = errMsg.replace("@minLength@", minLength);
            }
        }
        return errMsg;
    },
    checkIfHTML: function(val) {
        var tag = "p|br|hr|b|center|div|h[1-6]{1}|font|table|tr|td|th|span|style|script|a|img|body|html";
        var mask1 = new RegExp("<[/]?(" + tag + "){1}\\s*[/]?>{1}");
        var mask2 = new RegExp("<[/]?(" + tag.toUpperCase() + "){1}\\s*[/]?>{1}");
        var mask3 = new RegExp("<[/]?(" + tag + "){1}\\s+[^<>]*\\s*>{1}");
        var mask4 = new RegExp("<[/]?(" + tag.toUpperCase() + "){1}\\s+[^<>]*\\s*>{1}");
        return mask1.exec(StrUtil.trim(val)) || mask2.exec(StrUtil.trim(val)) || mask3.exec(StrUtil.trim(val)) || mask4.exec(StrUtil.trim(val));
    },
    isValidDate: function(day, month, year) {
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if ((month == 4 || month == 6 || month == 9 || month == 11) && (day == 31)) return false;
        if (month == 2) {
            var leap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
            if (day > 29 || (day == 29 && !leap)) return false;
        }
        return true;
    },
    isValidTime: function(hour, min, second) {
        if (hour && (hour < 0 || hour > 24)) return false;
        if (min && (min < 0 || min > 59)) return false;
        if (second && (second < 0 || second > 59)) return false;
        return true;
    },
    checkTime: function(target, timePattern) {
        var HOUR = "HH";
        var MIN = "mm";
        var orderHour = timePattern.indexOf(HOUR);
        var orderMin = timePattern.indexOf(MIN);
        var iDelim1 = orderHour + HOUR.length;
        var delim1 = timePattern.substring(iDelim1, iDelim1 + 1);
        if (iDelim1 == orderMin)
            timeRegexp = new RegExp("^(\\d{2})(\\d{2})$");
        else
            timeRegexp = new RegExp("^(\\d{2})[" + delim1 + "](\\d{2})$");
        matched = timeRegexp.exec(target);
        if (matched != null) return this.isValidTime(matched[1], matched[2]);
        else return false;
    },
    checkDate: function(target, datePattern) {
        var MONTH = "MM";
        var DAY = "dd";
        var YEAR = "yyyy";
        var orderMonth = datePattern.indexOf(MONTH);
        var orderDay = datePattern.indexOf(DAY);
        var orderYear = datePattern.indexOf(YEAR);
        var matched = false;
        if ((orderDay < orderYear && orderDay > orderMonth)) {
            var iDelim1 = orderMonth + MONTH.length;
            var iDelim2 = orderDay + DAY.length;
            var delim1 = datePattern.substring(iDelim1, iDelim1 + 1);
            var delim2 = datePattern.substring(iDelim2, iDelim2 + 1);
            if (iDelim1 == orderDay && iDelim2 == orderYear) {
                dateRegexp = new RegExp("^(\\d{2})(\\d{2})(\\d{4})$");
            } else if (iDelim1 == orderDay) {
                dateRegexp = new RegExp("^(\\d{2})(\\d{2})[" + delim2 + "](\\d{4})$");
            } else if (iDelim2 == orderYear) {
                dateRegexp = new RegExp("^(\\d{2})[" + delim1 + "](\\d{2})(\\d{4})$");
            } else {
                dateRegexp = new RegExp("^(\\d{2})[" + delim1 + "](\\d{2})[" + delim2 + "](\\d{4})$");
            }
            matched = dateRegexp.exec(target);
        } else if ((orderMonth < orderYear && orderMonth > orderDay)) {
            var iDelim1 = orderDay + DAY.length;
            var iDelim2 = orderMonth + MONTH.length;
            var delim1 = datePattern.substring(iDelim1, iDelim1 + 1);
            var delim2 = datePattern.substring(iDelim2, iDelim2 + 1);
            if (iDelim1 == orderMonth && iDelim2 == orderYear) {
                dateRegexp = new RegExp("^(\\d{2})(\\d{2})(\\d{4})$");
            } else if (iDelim1 == orderMonth) {
                dateRegexp = new RegExp("^(\\d{2})(\\d{2})[" + delim2 + "](\\d{4})$");
            } else if (iDelim2 == orderYear) {
                dateRegexp = new RegExp("^(\\d{2})[" + delim1 + "](\\d{2})(\\d{4})$");
            } else {
                dateRegexp = new RegExp("^(\\d{2})[" + delim1 + "](\\d{2})[" + delim2 + "](\\d{4})$");
            }
            matched = dateRegexp.exec(target);
        } else if ((orderMonth > orderYear && orderMonth < orderDay)) {
            var iDelim1 = orderYear + YEAR.length;
            var iDelim2 = orderMonth + MONTH.length;
            var delim1 = datePattern.substring(iDelim1, iDelim1 + 1);
            var delim2 = datePattern.substring(iDelim2, iDelim2 + 1);
            if (iDelim1 == orderMonth && iDelim2 == orderDay) {
                dateRegexp = new RegExp("^(\\d{4})(\\d{2})(\\d{2})$");
            } else if (iDelim1 == orderMonth) {
                dateRegexp = new RegExp("^(\\d{4})(\\d{2})[" + delim2 + "](\\d{2})$");
            } else if (iDelim2 == orderDay) {
                dateRegexp = new RegExp("^(\\d{4})[" + delim1 + "](\\d{2})(\\d{2})$");
            } else {
                dateRegexp = new RegExp("^(\\d{4})[" + delim1 + "](\\d{2})[" + delim2 + "](\\d{2})$");
            }
            matched = dateRegexp.exec(target);
        }
        if (matched != null) return this.isValidDate(matched[3], matched[2], matched[1]);
        else return false;
    }
}

var ViewBoxUtil = {
    viewBoxMinHeight: 15,
    viewBoxMaxHeight: 300,
    viewBoxLineHeight: 25,
    viewBoxThreadList: new Array(),

    createViewBoxObj: function(viewLinkObj, viewBoxId, elementsToHide) {
        var viewBox = new Object();
        viewBox.viewLinkObj = viewLinkObj;
        viewBox.viewBoxId = viewBoxId;
        viewBox.elementsToHide = elementsToHide;
        viewBox.thread = null;
        return viewBox;
    },
    clearBoxTimer: function(viewBoxId) {
        var target = null;
        if (viewBoxId && viewBoxId.length > 0) {
            if (ViewBoxUtil.viewBoxThreadList && ViewBoxUtil.viewBoxThreadList.length > 0) {
                for (var i = 0; i < ViewBoxUtil.viewBoxThreadList.length; i++) {
                    var viewBox = ViewBoxUtil.viewBoxThreadList[i];
                    if (viewBox && viewBox.viewBoxId == viewBoxId) {
                        if (viewBox.thread) {
                            clearTimeout(viewBox.thread);
                            viewBox.thread = null;
                        }
                        target = viewBox;
                        ViewBoxUtil.viewBoxThreadList.splice(i, 1);
                    }
                }
            }
        }
        return target;
    },
    clearTimeout: function(viewBoxId) {
        var viewBox = ViewBoxUtil.clearBoxTimer(viewBoxId);
        if (viewBox != null && viewBox.viewLinkObj && viewBox.viewBoxId == viewBoxId) {
            var viewBoxObj = DocUtil.get(viewBoxId);
            if (viewBoxObj) {
                viewBoxObj.onmouseover = '';
                viewBoxObj.onmouseout = '';
            }
            DocUtil.showHide(viewBox.viewLinkObj, viewBox.viewBoxId, false);
            DocUtil.bulkShowHide(viewBox.elementsToHide, true);
        }
    },
    setTimeout: function(viewLinkObj, viewBoxId, elementsToHide, delay) {
        ViewBoxUtil.clearBoxTimer(viewBoxId);
        if (viewLinkObj && viewBoxId && viewBoxId.length > 0) {
            var viewBox = ViewBoxUtil.createViewBoxObj(viewLinkObj, viewBoxId, elementsToHide);
            viewBox.thread = setTimeout('ViewBoxUtil.clearTimeout("' + viewBoxId + '")', delay || 100);
            ViewBoxUtil.viewBoxThreadList.push(viewBox);
        }
    },
    createViewTable: function(contentArray, tableHolder) {
        var table = document.createElement('TABLE');
        table.setAttribute('cellpadding', 0);
        table.setAttribute('cellspacing', 0);
        table.setAttribute('width', '100%');

        var rowNum = 0;

        for (var i = 0; i < contentArray.length; i++) {
            if (contentArray[i] && StrUtil.trim(contentArray[i]).length > 0) {
                var newRow = table.insertRow(rowNum);
                var newCell = newRow.insertCell(0);
                newCell.width = 10;
                newCell.innerHTML = (rowNum + 1) + ".";
                var newCell2 = newRow.insertCell(1);
                newCell2.innerHTML = contentArray[i];
                rowNum++;
            }
        }

        ObjUtil.removeAllChildNodes(tableHolder);
        tableHolder.appendChild(table);
        var height = ViewBoxUtil.viewBoxMaxHeight;
        if (rowNum <= 15) {
            sugHeight = (rowNum <= 0 ? 1 : rowNum) * ViewBoxUtil.viewBoxLineHeight;
            if (sugHeight < height) {
                height = sugHeight;
            }
        }
        tableHolder.style.height = height + "px";
    },
    showDetailByOnmouseover: function(obj, viewBoxId, tableHolderId, contentArray, elementsToHide) {
        var viewBox = DocUtil.get(viewBoxId);
        var tableHolder = DocUtil.get(tableHolderId);
        ViewBoxUtil.clearBoxTimer(viewBoxId);

        if (obj && viewBox && tableHolder) {
            if (viewBox.style.display == 'none') {
                tableHolder.style.height = ViewBoxUtil.viewBoxMinHeight + "px";

                if (contentArray && contentArray.length > 0) {
                    ViewBoxUtil.createViewTable(contentArray, tableHolder);
                }

                viewBox.onmouseover = function() {
                    ViewBoxUtil.clearBoxTimer(viewBoxId);
                }
                viewBox.onmouseout = function() {
                    ViewBoxUtil.setTimeout(obj, viewBoxId);
                }
                DocUtil.showHide(obj, viewBoxId, true);
                DocUtil.bulkShowHide(elementsToHide, false);
            }
        }
    },
    showDetailByOnclick: function(obj, viewBoxId, tableHolderId, contentArray, elementsToHide) {
        var viewBox = DocUtil.get(viewBoxId);
        var tableHolder = DocUtil.get(tableHolderId);
        ViewBoxUtil.clearBoxTimer(viewBoxId);

        if (obj && viewBox && tableHolder) {
            if (viewBox.style.display == 'none') {
                tableHolder.style.height = ViewBoxUtil.viewBoxMinHeight + "px";

                if (contentArray && contentArray.length > 0) {
                    ViewBoxUtil.createViewTable(contentArray, tableHolder);
                }

                DocUtil.showHide(obj, viewBoxId, true);
                DocUtil.bulkShowHide(elementsToHide, false);
            } else {
                DocUtil.showHide(obj, viewBoxId, false);
                DocUtil.bulkShowHide(elementsToHide, true);
            }
        }
    }
}
var PlainBoxUtil = {
    createTable: function(contentArray, tableHolder) {
        ObjUtil.removeAllChildNodes(tableHolder);

        var rowNum = 0;
        for (var i = 0; i < contentArray.length; i++) {
            if (contentArray[i] && StrUtil.trim(contentArray[i]).length > 0) {
                var row = document.createElement('DIV');
                row.className = 'pt3 small';
                row.innerHTML = (++rowNum) + ") " + contentArray[i];
                tableHolder.appendChild(row);
            }
        }
    }
}
var functionHolder = new Object();

/**
 * Perfect Popup, auto resize popup windows to suitable size.
 * http://www.howtocreate.co.uk/perfectPopups.html
 */
/*-- AutoResize @start  --*/
function getRefToDivMod(divID, oDoc) {
    if (!oDoc) {
        oDoc = document;
    }
    if (document.layers) {
        if (oDoc.layers[divID]) {
            return oDoc.layers[divID];
        } else {
            for (var x = 0, y; !y && x < oDoc.layers.length; x++) {
                y = getRefToDivMod(divID, oDoc.layers[x].document);
            }
            return y;
        }
    }
    if (document.getElementById) {
        return oDoc.getElementById(divID);
    }
    if (document.all) {
        return oDoc.all[divID];
    }
    return document[divID];
}

function resizeWinTo(idOfDiv, targetWidth) {
    var oH = getRefToDivMod(idOfDiv);
    if (!oH) {
        return false;
    }
    var oW = oH.clip ? oH.clip.width : oH.offsetWidth;
    var oH = oH.clip ? oH.clip.height : oH.offsetHeight;
    if (!oH) {
        return false;
    }
    var x = window;
    x.resizeTo(targetWidth ? targetWidth : oW + 50, oH + 50);
    var myW = 0,
        myH = 0,
        d = x.document.documentElement,
        b = x.document.body;
    if (x.innerWidth) {
        myW = x.innerWidth;
        myH = x.innerHeight;
    } else if (d && d.clientWidth) {
        myW = d.clientWidth;
        myH = d.clientHeight;
    } else if (b && b.clientWidth) {
        myW = b.clientWidth;
        myH = b.clientHeight;
    }
    if (window.opera && !document.childNodes) {
        myW += 16;
    }
    x.resizeTo(targetWidth ? targetWidth : (oW + ((oW + 50) - myW)), oH + ((oH + 50) - myH));
}
/*-- AutoResize @end  --*/

/**
 * A GMail-like "Loading" Notifier
 * http://www.pointwriter.com/blog/index.php?/archives/2-A-GMail-like-Loading-Notifier.html
 */
/*-- Loading Notifier @start  --*/
function getScrollTop() {
    if (document.documentElement.scrollTop)
        return document.documentElement.scrollTop;

    return document.body.scrollTop;
}

function scrollHandler() {
    var e = document.getElementById('rc_notify');
    e.style.top = getScrollTop();
}

function showNotify(str) {
    $('#rc_notify').html(str || 'Processing...').show();
    /*
    var elem = document.getElementById('rc_notify');
    elem.style.display = 'block';
    elem.style.visibility = 'visible';

    if ( elem.currentStyle &&
         elem.currentStyle.position == 'absolute' )
    {
      elem.style.top = getScrollTop();
      window.onscroll = scrollHandler;
    }

    elem.innerHTML = str || 'Processing...';
    */
}

function hideNotify() {
    $('#rc_notify').hide();
    /*
    var elem = document.getElementById('rc_notify');
    elem.style.display = 'none';
    elem.style.visibility = 'hidden';
    window.onscroll = null;
    */
}
/*-- Loading Notifier @end  --*/

function showhideGMap() {
    var $addr = $('.maps-address');
    var $maps = $addr.parent().find('.maps');
    // define local function
    var gmap = function() {
        var addr = $addr.is(':input') ? $addr.val() : $addr.html().replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/gm, " ");
        if (addr && addr.trim()) {
            //console.log('addr before',addr)
            addr = addr.replace(/\r?\n,/i, " ").replace(/([^,]+),/i, "").replace(/.+(\/F|Floor)[\.,]*/i, "").replace(/Blk[\.]*/i, "Block").replace(/No.[\s]*([0-9\-]+)[,]*/i, "$1").trim();
            //console.log('addr after',addr)
            var callgeocode = function(geoaddr) {
                console.log('geoaddr: ' + geoaddr);
                var geocodeurl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(geoaddr.replace(/ /gi, '+')) + "&key=AIzaSyB0nlwn_8naYzD_eq9FocUIjBj_eRg34Hk";
                $.ajax({
                    url: geocodeurl,
                    success: function(json) {
                        console.log(json);
                        var done = false;
                        var url = "https://maps.google.com/maps?hl=en&ie=UTF8&t=m&z=17&iwloc=B&iwd=1&output=embed&q=" + encodeURIComponent(geoaddr).replace(/%20/g, '+');
                        if (json.status == 'OK' && json.results && json.results.length > 0) {
                            var results = json.results[json.results.length - 1];
                            if (results.geometry) {
                                var geocode = results.geometry.location.lat + ',' + results.geometry.location.lng;
                                url += '&ll=' + geocode;
                                done = true;
                            }
                        }
                        // oop, request denied, simply use the original address
                        else if (json.status == 'REQUEST_DENIED') {
                            console.log('massaged address: ' + addr);
                            url = "https://maps.google.com/maps?hl=en&ie=UTF8&t=m&z=17&iwloc=B&iwd=1&output=embed&q=" + encodeURIComponent(addr).replace(/%20/g, '+');
                            done = true;
                        }
                        if (!done) {
                            var pos = geoaddr.indexOf(',');
                            if (pos != -1) {
                                callgeocode(geoaddr.substring(pos + 1).trim());
                            } else {
                                done = true;
                            }
                        }
                        if (done) {
                            $maps.prop('src', url).show();
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
                        var url = "https://maps.google.com/maps?hl=en&ie=UTF8&t=m&z=17&iwloc=B&iwd=1&output=embed&q=" + encodeURIComponent(addr.trim()).replace(/%20/g, '+');
                        $maps.prop('src', url).show();
                    }
                });
            }
            callgeocode(addr.trim());
        } else $maps.hide();
    }
    if ($addr.is(':input')) {
        $addr.on('change', function() {
            gmap();
        }).change();
    } else gmap();
}
/* ensure dialog box could be close / hidden when click */
$(document).on('click', '.ack-box, .err-box', function() {
    $(this).hide();
})

/* define error object */
var Error = function() {
    this.data = [];
    this.delimitor = " ";
}
Error.prototype.setDelimitor = function(delim) {
    this.delimitor = delim;
}
Error.prototype.set = function(err) {
    this.data.push(err);
}
Error.prototype.get = function() {
    return this.data.join(this.delimitor);
}
Error.prototype.hasError = function() {
    return (this.data.length > 0);
}

/* Register main menu for responsive screen */
var TRIGGER_FORCE_HIDE_MENU = 'force.hide.menu';

function mxMenu(id) {
    var
        $menu = $('#' + (id || 'mx-menu')),
        $menutab = $menu.children('.menu-tab'),
        $body = $('body'),
        swmenu = function(mode) {
            $menu[mode]('opened');
            $body[mode]('menu-opened');
        };
    // register click event for menu control
    $menu.find('.menu-control').on('click', function() {
        $(this).text($body.hasClass('hide-menu') ? 'Collapse Menu' : 'Expend Menu');
        $body.toggleClass('hide-menu');
        $menutab.trigger(TRIGGER_FORCE_HIDE_MENU);
    })
    // register events for menu tab
    $menutab
        .on('mouseover', function(e) {
            if (!$menu.hasClass('opened')) swmenu('addClass');
        })
        .on('click', function(e) {
            swmenu('toggleClass');
        })
        .on(TRIGGER_FORCE_HIDE_MENU, function(e) {
            if ($body.hasClass('menu-opened')) swmenu('removeClass');
        });
    // register mouseup event
    $(document).on('mouseup touchend', function(e) {
        if ($body.hasClass('menu-opened') && !$menu.is(e.target) && $menu.has(e.target).length === 0) swmenu('removeClass');
    });
    // register keyboard event
    $(document).on('keydown', function(e) {
        if ($body.hasClass('menu-opened') && e.which == 27) swmenu('removeClass');
    });
}

// Function used to patch href of client websites
function patchWebsiteHref() {
    // scan for each website url
    $('.website-url').each(function() {
        var $a = $(this),
            href = $a.attr('href');
        // unexpected http https mixed prefix was found
        if (href.startsWith('http://https://')) {
            // correct it
            href = href.replace('http://https://', 'https://');
            $a.attr('href', href);
            $a.text(href);
        }
    })
}

/* File Manager utilities */
const FMUtil = {
    stabilize: (path) => {
        const $head = $('head');
        if ($head.find('script[src$="filemanager.js"]').length == 0) {
            console.log('loading filemanager.js')
            $head.append(`<script type="text/javascript" src="${path}app/front/view/javascript/filemanager/filemanager.js"><\/script>`);
        } else {
            console.log('filemanager.js already loaded')
        }
    },
    startup: (callback, options) => {
        const startupfm = () => {
            if (typeof filemanager === 'undefined') {
                console.log('filemanager.js not loaded yet')
                setTimeout(startupfm, 100);
            } else {
                filemanager(callback, options);
            }
        }
        startupfm();
    }
}