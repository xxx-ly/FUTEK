var DocUtil = {
    get: function(id, doc) {
        if (doc) return id ? (doc.all ? doc.all[id] : doc.getElementById(id)) : null;
        return id ? (document.all ? document.all[id] : document.getElementById(id)) : null;
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
var ActionUtil = {
    help: {
        path: 'doc/help',
        files: [
            'Message-Center.pdf',
            'Buying-Tools.pdf',
            'Selling-Tool.pdf',
            'Trade-Match.pdf',
            'Account-Management.pdf',
            'Subscription.pdf',
            'My-Tradeeasy-Overview.pdf'
        ],
        activeFile: 0,
        go: function() {
            if (this.activeFile < 0 || this.activeFile > this.files.length - 1) return;
            if (!this.files[this.activeFile]) return;
            ActionUtil.popup(0, 0, 800, 600, this.path + '/' + this.files[this.activeFile], 'help', true, true);
        }
    },
    order: {
        init: function(f) {
            if (f.init) return;
            this.charge = new Array();
            this.charge['Air'] = 35;
            this.charge['Surface'] = 20;
            this.initM(f.m1y1);
            this.initM(f.m1y2);
            this.initM(f.m2y1);
            this.initM(f.m2y2);
            this.initC(f.delivery_by);
            var y = new Date().getYear() + (document.all ? 0 : 1900);
            this.initY(f, y, 'y1');
            this.initY(f, y + 1, 'y2');
        },
        initY: function(f, y, cy) {
            f.elements[cy].value = y;
            DocUtil.get('c' + cy + 'm1').innerHTML = y;
            DocUtil.get('c' + cy + 'm2').innerHTML = y;
        },
        initM: function(a) {
            for (var i = 0; i < a.length; i++) {
                a[i].onchange = function() {
                    ActionUtil.order.recalc(this.form);
                }
            }
        },
        initC: function(a) {
            for (var i = 0; i < a.length; i++) {
                a[i].onclick = function() {
                    ActionUtil.order.recalc(this.form);
                }
            }
        },
        recalc: function(f) {
            var chrg = this.recalcC(f.delivery_by);
            var amtm1 = this.recalcM(f, chrg, 'y1', 'm1') + this.recalcM(f, chrg, 'y2', 'm1');
            var amtm2 = this.recalcM(f, chrg, 'y1', 'm2') + this.recalcM(f, chrg, 'y2', 'm2');
            f.m1_subtotal.value = amtm1;
            f.m2_subtotal.value = amtm2;
            f.total.value = this.round(amtm1 + amtm2);
            //alert('m1=\n'+f.m1_order.value+'\nm2=\n'+f.m2_order.value);
        },
        recalcM: function(f, chrg, y, m) {
            var amt = 0;
            var a = f.elements[m + y];
            var modr = f.elements[m + '_order'];
            var yr = f.elements[y].value;
            if (y == 'y1') modr.value = '';
            for (var i = 0; i < a.length; i++) {
                if (a[i].value > 0) {
                    amt += a[i].value * chrg;
                    if (modr.value) modr.value += '\n';
                    modr.value += a[i].value + ' x ' + yr + ' Vol.' + (i + 1);
                }
            }
            return this.round(amt);
        },
        recalcC: function(a) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].checked) {
                    return this.charge[a[i].value];
                }
            }
        },
        round: function(amt) {
            return Math.round(amt * 1000) / 1000;
        }
    },
    resize: {
        height: function(h) {
            var w = document.body.parentNode.clientWidth + (document.all ? 10 : 8);
            window.resizeTo(w, h);
        },
        width: function(w) {
            var h = document.body.parentNode.clientHeight + (document.all ? 29 : 27);
            window.resizeTo(w, h);
        }
    },
    makeHomepage: function(href) {
        if (!href) href = location.href;
        if (document.all) { //ie
            var e = document.createElement('a');
            e.style.behavior = 'url(#default#homepage)';
            e.setHomePage(href);
        } else if (document.getElementById) { //firefox
            var msg = 'To make Tradeeasy.com as your home page, simply drag <br><a href="' +
                href + '" target="parent">this link onto your Home button</a>.';
            this.dialog.ack('/p/portal/home/html/', msg);
        }
    },
    bookmark: function(title, href) {
        if (!title) title = document.title;
        if (!href) href = location.href;
        if (window.sidebar) { // Firefox
            try {
                window.sidebar.addPanel(title, href, '');
            } catch (e) {
                alert("Sorry, your browser does not support programmatic bookmark function!\nHowever, you can press [" + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + "+D] to bookmark this page.");
            }
        } else if (window.opera && window.print) { // Opera
            var e = document.createElement('a');
            e.setAttribute('href', url);
            e.setAttribute('title', title);
            e.setAttribute('rel', 'sidebar');
            e.click();
        } else if (document.all) { // IE
            window.external.AddFavorite(location.href, title ? title : document.title);
        } else alert("Sorry, your browser does not support programmatic bookmark function!\nHowever, you can press [" + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + "+D] to bookmark this page.");
    },
    go: function(href) {
        if (this.dialog.msg) href += '?' + this.dialog.msg;
        window.location.href = href;
    },
    popup: function(x, y, w, h, href, target, resize, scroll) {
        var p = 'top=' + y + ',left=' + x + ',width=' + w + ',height=' + h;
        var isdefault = true;
        if (resize || scroll) isdefault = false;
        Ajax.popup(target, href, y, x, w, h, isdefault);
    },
    popupSubmit: function(x, y, w, h, href, target, fname, resize, scroll) { //sumit a form and popup
        var f = FormUtil.get(fname);
        if (!target) target = 'popup';
        var p = 'top=' + y + ',left=' + x + ',width=' + w + ',height=' + h;
        if (resize) p += ',resizable=1';
        if (scroll) p += ',scrollbars=1';
        var t = f.target,
            a = f.action; //save the original values
        f.target = target, f.action = href;
        DocUtil.antiNIS();
        var c = open('', target, p);
        f.submit();
        c.focus();
        f.target = t, f.action = a; //resume the original values
    },
    dialog: {
        id: 'dialog-box',
        msg: null,
        err: function(path, msg) {
            if (!path) path = '';
            this.open(path + 'dialog-err.htm', msg);
        },
        ack: function(path, msg) {
            if (!path) path = '';
            this.open(path + 'dialog-ack.htm', msg);
        },
        open: function(href, msg, w, h) {
            if (!w) w = 500;
            if (!h) h = 200;
            if (!msg) msg = this.msg;
            if (document.all) { //for IE
                var p = 'dialogHeight:' + h + 'px;dialogWidth:' + w + 'px;status:0;scroll:0';
                var o = window.showModalDialog(href, msg, p);
            } else { //for FF
                var f = DocUtil.get(this.id);
                var wx = window.pageXOffset,
                    wy = window.pageYOffset;
                var ww = window.innerWidth,
                    wh = window.innerHeight;
                var x = wx + (ww - w) / 2,
                    y = wy + (wh - h) / 2;
                if (!f) {
                    f = document.createElement("IFRAME");
                    f.setAttribute('id', this.id);
                    f.setAttribute('scrolling', 'no');
                    document.body.appendChild(f);
                    window.onscroll = window.onresize = function() {
                        var f = DocUtil.get(ActionUtil.dialog.id);
                        if (f) {
                            var wx = this.pageXOffset,
                                wy = this.pageYOffset;
                            var ww = this.innerWidth,
                                wh = this.innerHeight;
                            var x = wx + (ww - w) / 2,
                                y = wy + (wh - h) / 2;
                            f.style.top = y + 'px';
                            f.style.left = x + 'px';
                        }
                    }
                }
                f.style.top = y + 'px';
                f.style.left = x + 'px';
                f.style.width = w + 'px';
                f.style.height = h + 'px';
                f.src = href + '?' + escape(msg);
                f.focus();
            }
        },
        fill: function(n, w) {
            var d = DocUtil.get(n);
            if (!d) return;
            if (!w.dialogArguments) {
                var p = w.location.href.indexOf('?');
                if (p > 0) d.innerHTML = unescape(w.location.href.substring(p + 1));
                d = DocUtil.get('dialog');
                if (d) d.className = 'show-border';
                if (parent) {
                    d = DocUtil.get(this.id, parent.document);
                    if (d) d.style.height = (document.body.offsetHeight + 4) + 'px';
                }
            } else {
                d.innerHTML = w.dialogArguments;
                w.dialogHeight = (document.body.offsetHeight + 29) + 'px';
            }
        },
        close: function() {
            if (document.all) self.close();
            else if (parent) {
                var d = DocUtil.get(this.id, parent.document);
                if (d) parent.document.body.removeChild(d);
            }
        }
    },
    servMenu: {
        activateServ: function(serv, sublevel) {
            var o = DocUtil.get('serv-' + serv);
            if (o) o.className = o.className + ' active';
            if (sublevel || sublevel == 0) {
                o = DocUtil.get(serv);
                if (o) o.className = o.className + ' active';
                if (sublevel > 0) {
                    o = DocUtil.get(serv + '-' + sublevel);
                    if (o) o.className = o.className + ' active';
                }
            }
            if (serv == 'new-prod') $('#prod-line-widget .new-prod').addClass('active');
            else if (serv == 'hot-prod') $('#prod-line-widget .hot-prod').addClass('active');
            else if (serv == 'prod-cata') $('#prod-line-widget .prod-cata:nth-child(' + sublevel + ')').addClass('active');
        }
    },
    tabMenu: {
        lastTab: new Array(),
        activateTab: function(tab, target) {
            this.deactivateTab(target);
            var t = DocUtil.get(target);
            var o = DocUtil.get('portlet-head-' + tab);
            if (o) o.className = o.className + ' open';
            o = DocUtil.get(tab);
            if (o && t) t.innerHTML = o.innerHTML;
            this.lastTab[target] = tab;
        },
        deactivateTab: function(target) {
            if (!this.lastTab[target]) return;
            var o = DocUtil.get('portlet-head-' + this.lastTab[target]);
            if (o) o.className = o.className.replace(' open', '');
        },
        randomTab: function(tabs, target) {
            if (!tabs.length || tabs.length == 0) return;
            var n = Math.round(Math.random() * 1000) % tabs.length;
            this.activateTab(tabs[n], target);
        }
    },
    showHideViewContent: function(obj) {
        if (!obj) return;
        var target = DocUtil.get(obj);
        if (target) target.className = target.className == 'hide-content' ? 'view-content' : 'hide-content';
    }
}

var jCaptcha = {
    _id: 'captcha',
    _srn: function(q) {
        return (q ? '?' : '&') + 'sn=' + new Date().getTime()
    },
    _url: function($c) {
        return $c.attr('data-src')
    },
    init: function() {
        $('#' + this._id).each(function() {
            var
                $captcha = $(this),
                $img = $('<img/>');
            $img
                .attr('src', jCaptcha._url($captcha))
                .click(function() {
                    $img.attr('src', $captcha.attr('data-src') + jCaptcha._srn(true))
                })
                .error(function() {
                    var
                        url = jCaptcha._url($captcha) + '?mode=svg',
                        $embed = $('<embed type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/"/>');
                    $embed.attr('src', url);
                    $captcha.html($embed);
                });
            $captcha.html($img);
        });
    }
}