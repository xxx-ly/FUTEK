/* number utilities */
if (!window.NumUtil) window.NumUtil = {}
NumUtil.nvl = function(n, def) {
    return n ? n : (def ? def : 0);
}
NumUtil.round = function(n, p) {
    return Math.round(n * Math.pow(10, p)) / Math.pow(10, p);
}
NumUtil.addCommas = function(n) { /* adding commas to a number, and returning a string */
    var x = (n + '').split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) x1 = x1.replace(rgx, '$1' + ',' + '$2');
    return x1 + x2;
}
NumUtil.between = function(num0, num1, num2) { /* check num0 is between num1 and num2 or not using exclude behavior */
    return (num0 != null && num1 != null && num2 != null && parseInt(num0, 10) > parseInt(num1, 10) && parseInt(num0, 10) < parseInt(num2, 10));
}
// check whether range of o1 and o2 is overlapped or not 
// supposed that both o1 & o2 are in the form of {from:value,to:value}
NumUtil.overlap = function(o1, o2) {
    if (o1 && o2 && o1.from != null && o2.from != null && o1.to != null && o2.to != null) {
        if (parseInt(o1.from, 10) < parseInt(o2.to, 10) && parseInt(o1.to, 10) > parseInt(o2.from, 10)) return true;
        if (parseInt(o2.from, 10) < parseInt(o1.to, 10) && parseInt(o2.to, 10) > parseInt(o1.from, 10)) return true;
    }
    return false;
}
/* string utilities */
if (!window.StrUtil) window.StrUtil = {}
StrUtil.nvl = function(s, def) {
    if (s && s != 'null') return s;
    if (def && def != 'null') return def;
    return '';
}
StrUtil.replicate = function(s, n) {
    var out = '';
    for (var i = 0; i < n; i++) out += s;
    return out;
}
StrUtil.replace = function(s, p1, p2) {
    if (!s || !p1) return s;
    var pattern = new RegExp(p1, 'gim');
    return s.replace(pattern, p2);
}
StrUtil.lpad = function(s, len, pad) {
    s = '' + s;
    if (s.length > len) return s.substring(0, len);
    var n = len - s.length;
    for (var i = 0; i < n; i++) s = pad + s;
    return s;
}
StrUtil.rpad = function(s, len, pad) {
    s = '' + s;
    if (s.length > len) return s.substring(0, len);
    var n = len - s.length;
    for (var i = 0; i < n; i++) s += pad;
    return s;
}
StrUtil.trim = function(s) {
    if (!s) return s;
    return s.replace(/^\s+|\s+$/g, '');
}
StrUtil.ltrim = function(s) {
    if (!s) return s;
    return s.replace(/^\s+/, '');
}
StrUtil.rtrim = function(s) {
    if (!s) return s;
    return s.replace(/\s+$/, '');
}
StrUtil.replaceChars = function(s, cs, def) {
    var out = '';
    if (s)
        for (var i = 0; i < s.length; i++)
            if (cs.indexOf(s.charAt(i)) != -1) out += def;
            else out += s.charAt(i);
    return out;
}
StrUtil.startWith = function(s1, s2) { /*check if s1 starts with s2 */
    s1 = this.nvl(s1, '');
    s2 = this.nvl(s2, '');
    if (s1 == s2) return true;
    return s1.length < s2.length ? false : s1.substring(0, s2.length) == s2;
}
StrUtil.endWith = function(s1, s2) { /*check if s1 ends with s2 */
    s1 = this.nvl(s1, '');
    s2 = this.nvl(s2, '');
    if (s1 == s2) return true;
    return s1.length < s2.length ? false : s1.substring(s1.length - s2.length) == s2;
}
StrUtil.hasWhiteSpace = function(s) {
    if (/^[\S]*$/.exec(s)) return false;
    return true;
}
StrUtil.initcaps = function(s) { /* capitalize the initial character of each word */
    s = s.replace(/\n|(\r\n)/gim, ' #!# ');
    s = s.replace(/(\s+)/gim, ' ');
    s = s.replace(/(,|;|:|\.)(\w+)/gim, '$1 $2');
    var a = s.split(' ');
    for (var i = 0; i < a.length; i++)
        a[i] = a[i].charAt(0).toUpperCase() + a[i].substring(1).toLowerCase();
    s = a.join(' ');
    s = s.replace(/ #!# /gim, '\n');
    return s;
}
StrUtil.lower = function(s) {
    s = this.trim(s);
    if (!s) return '';
    return s.toLowerCase();
}
StrUtil.upper = function(s) {
    s = this.trim(s);
    if (!s) return '';
    return s.toUpperCase();
}
StrUtil.contain = function(s1, s2) {
    if (!s1 || !s2) return false;
    var regex = s2.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    var pattern = new RegExp(regex, 'gi');
    var index = s1.search(pattern);
    return (index != -1);
}
StrUtil.count = function(s1, s2, i) {
    var count = 0;
    if (!s1 || !s2) return count;
    var s3 = DocUtil.encodeRegex(s2);
    if (!s3) return count;
    var modifiers = (i) ? 'gim' : 'gm';
    var regexp = new RegExp(s3, modifiers);
    var array = s1.match(regexp);
    return (array && array.length > 0) ? array.length : 0;
}
/* date utilities */
if (!window.DateUtil) window.DateUtil = {}
DateUtil.DATE_DEFAULT_FORMAT = 'yyyy/mm/dd';
DateUtil.DATE_SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
DateUtil.DATE_SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
DateUtil.DATE_MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
DateUtil.DATE_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
DateUtil.DATE_AMPM = ['am', 'pm'];
DateUtil.currYear = function() {
    var out = new Date().getYear();
    if (out < 1900) out += 1900;
    return out;
}
DateUtil.minDate = function(d1, d2) {
    if (!d1) return d2;
    if (!d2) return d1;
    return d1.getTime() < d2.getTime() ? d1 : d2;
}
DateUtil.maxDate = function(d1, d2) {
    if (!d1) return d2;
    if (!d2) return d1;
    return d1.getTime() > d2.getTime() ? d1 : d2;
}
DateUtil.timeDiff = function(d1, d2) { /* positive result if d1>d2 */
    if (!d1) d1 = new Date();
    if (!d2) d2 = new Date();
    return d1.getTime() - d2.getTime();
}
DateUtil.dayDiff = function(d1, d2) { /* Number of days different between d1 & d2; positive result if d1>d2 */
    if (!d1) d1 = new Date();
    if (!d2) d2 = new Date();
    var md = this.monthDiff(d1, d2);
    if (md == 0) return d1.getDate() - d2.getDate();
    var out = 0;
    if (md > 0) {
        out = this.lastDofm(d2).getDate() - d2.getDate();
        for (var i = 0; i < md - 1; i++) out += this.lastDofm(this.addMonths(d2, i + 1)).getDate();
        out += d1.getDate();
    } else {
        out = -(this.lastDofm(d1).getDate() - d1.getDate());
        for (var i = 0; i < md - 1; i++) out -= this.lastDofm(this.addMonths(d1, i + 1)).getDate();
        out -= d2.getDate();
    }
    return out;
}
DateUtil.monthDiff = function(d1, d2) { /* Number of months different between d1 & d2; positive result if d1>d2 */
    if (!d1) d1 = new Date();
    if (!d2) d2 = new Date();
    var yd = d1.getYear() - d2.getYear(),
        md = d1.getMonth() - d2.getMonth();
    return yd * 12 + md;
}
DateUtil.isSameMonth = function(d1, d2) {
    if (!d1 || !d2) return false;
    var dx = new Date(d1.getTime()),
        dy = new Date(d2.getTime());
    return dx.getYear() == dy.getYear() && dx.getMonth() == dy.getMonth();
}
DateUtil.addMonths = function(d, n) {
    if (!d || n == 0) return null;
    var out = this.firstDofm(new Date(d.getTime())),
        days = d.getDate();
    out.setMonth(out.getMonth() + n);
    if (this.lastDofm(out).getDate() < days) out = this.lastDofm(out);
    else out.setDate(days);
    return out;
}
DateUtil.firstDofm = function(d) { /* return the first date of month */
    if (!d) return null;
    var out = new Date(d.getTime());
    out.setDate(1);
    return out;
}
DateUtil.lastDofm = function(d) { /* return the last date of month */
    if (!d) return null;
    var out = new Date(d.getTime());
    out.setDate(1);
    out.setMonth(out.getMonth() + 1);
    out.setDate(0);
    return out;
}
DateUtil.truncDate = function(d) {
    if (!d) return null;
    var out = new Date(d.getTime());
    out.setHours(0);
    out.setMinutes(0);
    out.setSeconds(0);
    out.setMilliseconds(0);
    return out;
}
DateUtil.dtos = function(d, fmt) { /* convert the date to string to specified date format */
    if (!d) return '';
    var rep = StrUtil.replace;
    var out = StrUtil.nvl(fmt, this.DATE_DEFAULT_FORMAT).toLowerCase();
    out = rep(out, 'yyyy', d.getYear() + (document.all ? 0 : 1900));
    out = rep(out, 'mm', StrUtil.lpad(d.getMonth() + 1, 2, '0'));
    out = rep(out, 'month', this.DATE_MONTH[d.getMonth()]);
    out = rep(out, 'mon', this.DATE_SHORT_MONTH[d.getMonth()]);
    out = rep(out, 'dd', StrUtil.lpad(d.getDate(), 2, '0'));
    out = rep(out, 'dayofweek', this.DATE_DAY[d.getDay()]);
    out = rep(out, 'dow', this.DATE_SHORT_DAY[d.getDay()]);
    out = rep(out, 'hh24', StrUtil.lpad(d.getHours(), 2, '0'));
    out = rep(out, 'hh', StrUtil.lpad(d.getHours() % 12, 2, '0'));
    out = rep(out, 'ampm', this.DATE_AMPM[Math.floor(d.getHours() / 12)]);
    out = rep(out, 'mi', StrUtil.lpad(d.getMinutes(), 2, '0'));
    out = rep(out, 'ss', StrUtil.lpad(d.getSeconds(), 2, '0'));
    if (out.indexOf('yy')) {
        var yr = d.getYear() + (document.all ? 0 : 1900);
        yr = '' + yr;
        out = rep(out, 'yy', yr.substring(2));
    }
    return out;
}
DateUtil.stod = function(s, fmt) { /* convert the string to date w/- specified date format */
    if (!s) return null;
    fmt = StrUtil.nvl(fmt, this.DATE_DEFAULT_FORMAT).toLowerCase();
    var out = new Date(),
        p = -1;
    try {
        var hh24 = fmt.indexOf('hh24'),
            ampm = fmt.indexOf('ampm');
        if (hh24 != -1 && ampm != -1) throw "invalid date string";
        var m = fmt.indexOf('mm'),
            n = fmt.indexOf('dd'),
            y = fmt.indexOf('yyyy');
        var h = fmt.indexOf('hh'),
            u = fmt.indexOf('mi'),
            t = fmt.indexOf('ss');
        var ss = function(s, a, b) {
            return s.substring(a, b);
        }
        if (hh24 != -1) {
            if (y != -1) out.setFullYear(y < hh24 ? ss(s, y, y + 4) : ss(s, y - 2, y + 2));
            if (m != -1) out.setMonth(m < hh24 ? ss(s, m, m + 2) - 1 : ss(s, m - 2, m) - 1);
            if (n != -1) out.setDate(n < hh24 ? ss(s, n, n + 2) : ss(s, n - 2, n));
            if (u != -1) out.setMinutes(u < hh24 ? ss(s, u, u + 2) : ss(s, u - 2, u));
            if (t != -1) out.setSeconds(t < hh24 ? ss(s, t, t + 2) : ss(s, t - 2, t));
            out.setHours(ss(s, hh24, hh24 + 2));
        } else if (ampm != -1) {
            if (y != -1) out.setFullYear(y < ampm ? ss(s, y, y + 4) : ss(s, y - 2, y + 2));
            if (m != -1) out.setMonth(m < ampm ? ss(s, m, m + 2) - 1 : ss(s, m - 2, m) - 1);
            if (n != -1) out.setDate(n < ampm ? ss(s, n, n + 2) : ss(s, n - 2, n));
            if (u != -1) out.setMinutes(u < ampm ? ss(s, u, u + 2) : ss(s, u - 2, u));
            if (t != -1) out.setSeconds(t < ampm ? ss(s, t, t + 2) : ss(s, t - 2, t));
            if (h != -1) {
                var hr = parseInt(h < ampm ? ss(s, h, h + 2) : ss(s, h - 2, h));
                hr = hr % 12;
                hr += ss(s, ampm, ampm + 2) == 'pm' ? 12 : 0;
                out.setHours(hr);
            }
        } else {
            if (y != -1) out.setFullYear(ss(s, y, y + 4));
            if (m != -1) out.setMonth(ss(s, m, m + 2) - 1);
            if (n != -1) out.setDate(ss(s, n, n + 2));
            if (u != -1) out.setMinutes(ss(s, u, u + 2));
            if (t != -1) out.setSeconds(ss(s, t, t + 2));
        }
        return out;
    } catch (e) {
        alert('Failed to convert date [' + s + '] to format [' + fmt + ']');
        return null;
    }
}

/* array utilities */
if (!window.AryUtil) window.AryUtil = {}
AryUtil.shallowClone = function(a) {
    var out = new Array();
    if (a && a.length > 0)
        for (var i in a) out.push(a[i]);
    return out;
}
AryUtil.splitAsArray = function(s, sep) {
    var out = new Array();
    if (s && StrUtil.trim(s).length > 0) {
        if (sep && sep.length > 0) {
            sep = sep.charAt(0);
            var sary = s.split(sep);
            if (sary && sary.length > 0) out = this.shallowClone(sary);
        } else out[0] = s;
    }
    return out;
}
AryUtil.contain = function(a, o) {
    if (a && a.length > 0)
        for (var i in a)
            if (a[i] == o) return i;
    return -1;
}
AryUtil.printArray = function(a) {
    if (a && a.length > 0) {
        var msg = '';
        for (var i = 0; i < a.length; i++) msg += '\n' + (i + 1) + '. ' + a[i];
        alert('a[' + a.length + ']:' + msg);
    } else alert('Array is null or empty!');
}
AryUtil.isEmpty = function(a) {
    return !a || a.length == 0;
}
window.ArrayUtil = AryUtil;