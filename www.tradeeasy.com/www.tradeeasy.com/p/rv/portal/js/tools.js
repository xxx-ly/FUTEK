(function($, window) {
    'use strict';

    // Dummy for deployment test 

    // Global variables for debug
    var debug = true;

    /***************************************************************************
     * Below section is for IE compatibility                                   *
     ***************************************************************************/
    // Add trim function to String object
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    // Add indexOf function to Array object
    if (typeof Array.prototype.indexOf !== 'function') {
        Array.prototype.indexOf = function(find, i) {
            if (i === undefined) i = 0;
            if (i < 0) i += this.length;
            if (i < 0) i = 0;
            for (var n = this.length; i < n; i++)
                if (i in this && this[i] === find)
                    return i;
            return -1;
        };
    }

    // Add map function to Array object
    if (typeof Array.prototype.map !== 'function') {
        Array.prototype.map = function(callback, arg) {
            return $.isArray(arg) ? $.map(arg, callback) : [];
        };
    }

    // Detection of IE browser
    var agent = navigator.userAgent.toLowerCase();
    var msie = agent.indexOf('msie');
    if (msie || !!agent.match(/trident\/7\./)) $('body').addClass('msie');
    if (msie && parseInt(agent.substring(msie + 5, agent.indexOf(".", msie))) < 9) $('body').addClass('old-msie');

    /***************************************************************************
     * Below section is to define general purposed functions used within tools *
     ***************************************************************************/

    // Define state constants
    var STATE_SUCCESS = 'success';
    var STATE_ERROR = 'error';
    var STATE_INFO = 'info';
    var STATE_WARNING = 'warning';
    var STATE_LOGGED = 'logged';
    var STATE_NOT_LOGGED = 'not-logged';

    // Define available data-ajax modes
    var DATA_AJAX_DIGEST = 'digest'; // mode to instruct ajax to perform responded data digestion
    var DATA_AJAX_MODALER = 'modaler'; // mode to instruct ajax to use modaler's native remote instead
    var DATA_AJAX_REPLACE = 'replace'; // mode to instruct ajax to replace content of target element by the responded data
    var DATA_AJAX_APPEND = 'append'; // mode to instruct ajax to append the responded data to target element

    // Define intervals
    var INTERVAL_DEFAULT = 5;
    var INTERVAL_ERROR = 10;

    // Define trigger events
    var TRIGGER_USER_STATE = 'user.state';
    var TRIGGER_AUTOCOMPLETE_OFF = 'autocomplete.off';
    var TRIGGER_WIN_SCROLL = 'win.scroll';
    var TRIGGER_TOGGLE_ON_TOP_HINTS = 'toggle.on.top.hints';
    var TRIGGER_GAQ_MODAL_FORM = 'gaq.modal.form';

    // Define URLs
    var URL_VERIFY_USER = String.fromCharCode(47, 112, 111, 114, 116, 97, 108, 47, 115, 105, 103, 110, 105, 110, 47, 115, 105, 103, 110, 105, 110, 47, 118, 101, 114, 105, 102, 121, 46, 115, 112, 103);

    // Define function to randomize an integer by range
    // @param min - min value
    // @param max - max value
    var randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Define trim
    // @param str - string to be trimmed
    var trim = function(str) {
        return str ? str.trim() : str;
    }

    // Define uniqueUrl
    // @param url - url to be unique
    var uniqueUrl = function(url) {
        if (url.indexOf('usn=') == -1) url += (url.indexOf('?') == -1 ? '?' : '&') + 'usn=' + Math.random() + '&revamp=true';
        return url;
    }

    // Define addParam
    // @param url - url to be manipulated
    // @param name - parameter name
    // @param val - parameter value
    var addParam = function(url, name, val) {
        return url + (url.indexOf('?') == -1 ? '?' : '&') + name + '=' + (val || '');
    }

    // Define initcap function to capitalize the first letter of input str
    // @param str - string to be initial cap
    var initcap = function(str) {
        if (str) return str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    }

    // Define userState function to get updated state of session user
    var userState = function() {
        ajax.get(URL_VERIFY_USER, DATA_AJAX_DIGEST)
    }

    // Define Ajax wrapper
    var ajax = {
        // Define get function to get data from remote server
        // @param url - remote url
        // @param callback - callback instruction/function to be involved on successful
        // @param target - target selector for which responded data should be designated
        // @returns jqXHR object
        get: function(url, callback, target) {
            hidealert(); // unconditional hide alert box to clear last message
            var that = this;
            return $.get(uniqueUrl(url), function(data) {
                that.callbackhandler(that, callback, data, target);
            });
        },
        // Define get function to get data from remote server
        // @param url - remote url
        // @param source - either a jQuery form element or serialized data
        // @param callback - callback instruction/function to be involved on successful
        // @param target - target selector for which responded data should be designated
        // @returns jQuery delegator - so you can add your own handlers [fail, done, always]
        post: function(url, source, callback, target) {
            hidealert(); // unconditional hide alert box to clear last message
            var _source = $(source),
                _data = _source.is('form') ? _source.serialize() : source,
                _url = (!url && _source.is('form')) ? _source.attr('action') : url,
                _this = this;
            //log('_url:' + _url);
            //log('_data:' + _data);
            if (_source.is('form') && _source.attr('enctype') == 'multipart/form-data') {
                log('this is a multipart form');
                var files = [],
                    params = _source.find(':input').not(':file').serializeArray();
                _source.find('input:file').map(function() {
                    files.push($(this).attr('id'));
                });
                files = files.join(',');
                //log('multipart/form-data params: ' + params);
                return $.ajaxFileUpload({
                    url: _url,
                    secureuri: false,
                    fileElementId: files,
                    data: params,
                    success: function(data, status) {
                        _this.callbackhandler(_this, callback, data.body.innerHTML, target);
                    }
                });
            } else {
                log('this is a normal post');
                return $.post(uniqueUrl(_url), _data, function(res) {
                    _this.callbackhandler(_this, callback, res, target);
                });
            }
        },
        // Define callback handling function to handle callback process
        // @param el - element, the callback function to be applied
        // @param callback - callback function / instruction
        // @param data - responded/returned data
        // @param target - target selector for which responded data should be designated
        callbackhandler: function(el, callback, data, target) {
            // bind responded data to target
            if (callback == DATA_AJAX_REPLACE || callback == DATA_AJAX_APPEND) {
                var $target = $(target);
                if (callback == DATA_AJAX_REPLACE) $target.empty();
                $target.append(data);
            }
            if (callback instanceof Function) callback.apply(el, [data, target]); // execute callback function
            else if (callback == DATA_AJAX_DIGEST) this.digest(data); // digest returned data
        },
        // Define digest function to digest & evaluate returned data
        // @param data - data to be digest
        // @param selector - (optional) if data is html, try to verify the html w/- this selector. if exists, execute bindfunc
        // @param bindfunc - (optional) for html data, if selector element exists in html data, execute this binding function
        // @note
        // 1) if this is a json object, possible object structure
        // a) return message:        {state:[error|warning|success|info], message[, interval]}
        // b) return user state:     {state:logged|not-logged[, user][, redirectUrl]}
        // c) return custom results: {state, alert[, ...][, redirectUrl]}
        digest: function(data, selector, bindfunc) {
            var state;
            try {
                var result = $.parseJSON(data);
                state = result.state;
                // evaluate state
                if (state == STATE_LOGGED || state == STATE_NOT_LOGGED || result.user) { // returned user state
                    $(document).trigger(TRIGGER_USER_STATE, result.user);
                }
                // show alert message
                if (result.alert) { // message object found in the result object
                    showalertx(result.alert);
                } else if (state == STATE_ERROR || state == STATE_WARNING || state == STATE_SUCCESS || state == STATE_INFO) { // returned alert message
                    showalert(result.message, result.state, result.interval);
                }
                // force redirect
                if (result.redirectUrl) {
                    result.state = 'redirect';
                    window.location.href = result.redirectUrl;
                }
                return result;
            } catch (err) {
                // not json data, html is assumed
                state = 'html';
                // both selector & bindfunc exist
                if (selector && bindfunc) {
                    if ($(data).find(selector).length) {
                        // target element exists in html data, execute binding function
                        bindfunc(data);
                    }
                }
            }
            return {
                state: state
            };
        }
    }

    // Define function to show modal window
    // @param that - caller element
    // @param callback - callback function
    // @note it's assumed that referer object might have the following data / properties
    // - data-href/href (optional) url to get remote modal content
    // - data-secure-href (optional) target url if returned remote data is json data w/- state = 'logged'
    // - data-secure-target (optional) target window of secure href if returned remote data is json data w/- state = 'logged'
    // - data-secure-state (optional) returned state, which should be verified to forward to secure href. default is 'logged'
    var modaler = function(that, callback) {
        var
            $referer = $(that),
            $modal = $('#modaler'),
            url = encodeURI(that.href || $referer.data('href')),
            secureurl = $referer.data('secure-href');
        // remove outdated modal if any & construct modal 
        log('modaler.url: ' + url);
        $modal.remove();
        $modal = $('<div id="modaler" class="modal fade" role="dialog" aria-labelledby="signin-dialog-label" tabindex="-1" data-backdrop="static" aria-hidden="true"/>')
            .append('<div class="modal-dialog"><div class="modal-content"/></div>')
            .appendTo('body')
            .on('shown.bs.modal', callback || function() {
                log('modal content after shown!');
                $(this).find('.modal-body').scrollTop(0);
            });
        // remove outdated datetime picker elements
        log('modaler remove outdated datetimepicker!');
        $('.bootstrap-datetimepicker-widget').remove();
        //alert("secureurl="+secureurl)
        if (secureurl) { // safe mode, should get data then evaluate whether is modal body content or not
            var securestate = $referer.data('secure-state') || STATE_LOGGED;
            var securetarget = $referer.data('secure-target');
            log("securetarget: " + securetarget);
            log("securestate: " + securestate);
            log("secureurl: " + secureurl);
            ajax.get(url, function(data) {
                secureurl = encodeURI(secureurl);
                // digest returned data first
                var result = ajax.digest(data, '.modal-body', function(data) {
                    // reset user info from page
                    //$(document).trigger(TRIGGER_USER_STATE);
                    // bind data to modal content and then show modal 
                    $modal.find('.modal-content').html(data);
                    $modal.modal('show');
                    // forward secure url & secure target to modal
                    $modal.data('on-' + securestate + '-href', secureurl);
                    if (securetarget) $modal.data('on-' + securestate + '-target', securetarget);
                });
                // member logged, goto target page
                if (result.state == securestate) {
                    if (securetarget) window.open(secureurl, securetarget);
                    else window.location.href = secureurl;
                }
            })
        } else { // bind modal w/- remote content
            $modal.modal({
                remote: uniqueUrl(url)
            });
        }
    }

    // Define function to hide alert message box
    var hidealert = function() {
        $('.alert').fadeOut('fast');
    }

    // Define function to show alert message
    // @param message - the alert message to be shown
    // @param type - type of alert message, could be info (default if missing), error, warning, success
    // @param interval - interval of the auto hide timer, default interval is 5 seconds
    var showalert = function(message, type, interval) {
        var
            icon = type == STATE_ERROR ? 'exclamation' : (type == STATE_SUCCESS ? 'ok' : (type || STATE_INFO)),
            interval = (!interval && type == STATE_ERROR) ? INTERVAL_ERROR : interval,
            type = 'alert-' + (type == STATE_ERROR ? 'danger' : (type || STATE_INFO)),
            $alert = $('.alert.' + type);
        // alert div does not exist, create a new one
        if ($alert.length == 0) {
            //$alert = $('<div class="alert ' + type + ' alert-dismissible" role="alert" style="display: none"><span class="close link" data-dismiss="alert" aria-hidden="true">&times;</span><i class="glyphicon"></i> <span class="message"><span></div>').appendTo('body');
            $alert = $('<div class="alert ' + type + ' alert-dismissible" role="alert" style="display: none"></div>').appendTo('body');
            $alert.append('<span class="close link" data-dismiss="alert" aria-hidden="true">&times;</span>');
            $alert.append('<i class="glyphicon glyphicon-' + icon + '-sign"></i>');
            $alert.append('<span class="message"></span>');
            //$alert.find('.glyphicon').addClass('glyphicon-' + icon + '-sign');
        }
        // set timer
        var $close = $alert.find('.close');
        var tout = setTimeout(function() {
            $close.click();
        }, (interval || INTERVAL_DEFAULT) * 1000);
        // register click event on close button & set timer to auto hide alert box
        $close.on('click', function(e) {
            clearTimeout(tout);
            e.preventDefault();
            e.stopPropagation();
            $alert.fadeOut('fast');
        })
        // show alert message
        $alert.find('.message').html(message);
        $alert.fadeIn('slow');
    }

    // Define shortcut functions to show info/error/warning/success alert message
    var showInfo = function(message, interval) {
        return showalert(message, STATE_INFO, interval)
    }
    var showError = function(message, interval) {
        return showalert(message, STATE_ERROR, interval)
    }
    var showWarning = function(message, interval) {
        return showalert(message, STATE_WARNING, interval)
    }
    var showSuccess = function(message, interval) {
        return showalert(message, STATE_SUCCESS, interval)
    }

    // Define extended function to show alert message
    // @param msg - message object {type, message[, interval]}
    var showalertx = function(msg) {
        showalert(msg.message, msg.type, msg.interval);
    }

    // Define log function to log message in console
    var log = function(msg) {
        if (debug && console && typeof console.log === 'function') console.log(msg);
        //alert(msg)
    }

    /**********************************************************************
     * Below section is to define jquery element's addon functions        *
     **********************************************************************/

    // Define captcha function, which enable target element group could be show captcha generated word and input box for code verification
    // Assuming that captcha function should be initialized in target element, which class is captcha
    $.fn.captcha = function() {
        this.find('.captcha').realperson();
        return this;
    }

    // Define event banner function to show event banner on page top and stores user response on this event to sessioh storage such that
    // closed event banner could not be visiable again in same session
    $.fn.eventBanner = function() {
        var
            $banner = $(this),
            settings = {
                prop: 'id',
                name: 'eventBanner'
            },
            id = $banner.prop(settings.prop);
        // banner not closed yet
        if (id != sessionStorage.getItem(settings.name)) {
            var $body = $('body');
            var $header = $body.children('#header');
            var $main = $body.children('#main');
            $header.addClass('has-event-banner');
            $main.addClass('has-event-banner');
            $banner.addClass('not-closed').find('.close').click(function() {
                sessionStorage.setItem(settings.name, id);
                $header.removeClass('has-event-banner');
                $main.removeClass('has-event-banner');
                $banner.removeClass('not-closed').addClass('closed');
                $(window).trigger(TRIGGER_WIN_SCROLL);
            });
            // force window scroll once
            $(window).trigger(TRIGGER_WIN_SCROLL);
        }
    }

    // Define jquery element's fading photo gallery
    // @param options - (optional) the following options may accepted
    // - interval interval of between transitions
    // - percentage percentage of elements to be toggled each time
    // - noRepeat flag indicates whether toggled elements in each time could be repeated or not
    $.fn.gallery = function(options) {
        var
            $gallery = $(this),
            $items = $gallery.children(),
            settings = {
                interval: 3, // interval in seconds
                percentage: 0.5,
                noRepeat: true
            };
        // load custom options
        if (options) {
            $.extend(settings, options);
        }
        var
            count = Math.ceil($items.length * settings.percentage),
            fadinggallery = function() {
                var ary = [],
                    p;
                for (var i = 1; i <= count; i++) {
                    p = 0;
                    while (!p) {
                        var x = randomInt(1, $items.length);
                        if (settings.noRepeat) {
                            if ($.inArray(x, ary) == -1) {
                                ary.push(x);
                                p = x;
                            }
                        } else p = x;
                    }
                    $items.filter(':nth-child(' + p + ')').children().toggleClass('in');
                }
                setTimeout(fadinggallery, settings.interval * 1000);
            };
        fadinggallery();
    }

    // Define jquery element's more and less function
    // @param options - (optional) the following options may accepted
    // - selector selector of more & less toggler parent
    // - rows min number of rows for hide
    // - row_height height of each row
    // - columns number of columns in list
    $.fn.moreless = function(options) {
        // init settings
        var
            $panel = $(this),
            settings = {
                ul_selector: 'ul',
                rows: 8,
                row_height: 20,
                columns: 3
            }
        // load custom options
        if (options) {
            $.extend(settings, options);
        }
        // get ul list
        var
            $ul = $panel.find(settings.ul_selector),
            h = settings.rows * settings.row_height;
        $ul.children('li').css('line-height', settings.row_height + 'px');
        // in case of number of items more than limit, add more/less link
        if ($ul.children().length > settings.rows * settings.columns) {
            // register more and less link to show more / less items
            $('<a class="more-less"/>').on('click', function() {
                $panel.toggleClass('panel-less').toggleClass('panel-more');
                if ($panel.hasClass('panel-less')) $ul.css('height', h + 'px');
                else $ul.css('height', 'auto');
                return false;
            }).appendTo($panel.addClass('panel-more')).click();
        }
    }

    // Define jquery element's adjuster function, which is used to adjust min-height of given elements automatically.
    // @param selector selector of target element, which min-height should be adjusted 
    $.fn.adjuster = function(selector) {
        var $self = $(this);

        // register window resize event to adjust min-height of given elements
        $(window).bind('resize', function() {
            $self.each(function() {
                var $this = $(this),
                    mh = 0;
                $this.children(selector || '.side-col' + ':visible').each(function() {
                    mh = Math.max(mh, $(this).outerHeight(true));
                    //alert($(this).outerHeight(true));
                })
                $this.css('min-height', mh);
            })
        }).resize();
    }

    // Define jquery element's dropdownx function, which is an alternative method to provide dropdown box. Unlike the dropdown function provided by
    // Bootstrap, this dropdown function need not to wrap the dropdown box and the activation pad within ".dropdown" container.
    $.fn.dropdownx = function() {
        var
            $dropdownx = $(this),
            $target = $('[role=' + $dropdownx.data('target') + ']');
        // target not found
        if ($target.length == 0) {
            var $wrapper = $('#' + $dropdownx.data('target-wrapper'));
            $wrapper.addClass('dropdownx-disabled');
            return;
        }

        // register mouseup event
        $(document).mouseup(function(e) {
            if ($dropdownx.is(e.target)) return;
            if (!$target.is(e.target) && $target.has(e.target).length === 0) togglex.apply($target);
        });

        // register dropdownx menu toggle function
        var togglex = function(open) {
            var $body = $('body');
            if (open) {
                this.addClass('open');
                $body.addClass('dropdownx-opened');
            } else {
                this.removeClass('open');
                $body.removeClass('dropdownx-opened');
            }
        };

        // register click event
        $dropdownx.click(function() {
            togglex.apply($target, [!$target.hasClass('open')]);
        })

        // register keydown event to detected [Esc]
        $(document).keydown(function(e) {
            if (e.which == 27) togglex.apply($target);
        });

        // register window resize event to close opened dropdownx menu if dropdownx controller is hidden
        $(window).bind('resize', function() {
            if ($dropdownx.is(':hidden') && $target.hasClass('open')) togglex.apply($target);
        })
    }

    // Define jquery element's markAsActive function, which try to automatically mark the service link of h1 as active
    // Please be noted that if one want to skip mark on any unordered list, simply add skip-mark class to the list to by-pass active service marking
    $.fn.markAsActive = function() {
        $(this).each(function() {
            var $this = $(this);
            var service = $this.children('.label').text() || $this.text();
            var $active = $('[role=main-menu] ul:not(.skip-mark) a').filter(function() {
                return $(this).text() == service;
            });
            $active.parent().addClass('active');
            $active.addClass('active').wrap('<h2></h2>');
        })
    }

    /**********************************************************************
     * Below section is to popup modal dialog for various form operations *
     **********************************************************************/

    // Delegate click event on '.post-bl' elements to popup post buying request form modal dialog
    $(document).on('click', '.post-bl', function(e) {
        e.stopPropagation();
        var
            $referer = $(this),
            callback = function() {
                var
                    $modal = $(this),
                    keyword = $referer.data('keyword');
                if (keyword) {
                    $modal.find('input.product_name').val('BUY ' + keyword + ' Product(s)');
                }
            };
        modaler(this, callback);
        return false;
    })

    // Delegate click event on '.post-ta' elements to popup post trade alert form modal dialog
    $(document).on('click', '.post-ta', function(e) {
        e.stopPropagation();
        var
            $referer = $(this),
            callback = function() {
                var
                    $modal = $(this),
                    keyword = $referer.data('keyword');
                if (keyword) {
                    $modal.find('input[name=keyword]').val(keyword);
                }
            };
        modaler(this, callback);
        return false;
    })

    // Patch redirect url to the secure href if specified
    const patchRedirectUrl = function($referer) {
        var href = $referer.attr('data-secure-href');
        if (href && href.endsWith('redct=url')) {
            href = href + '&url=' + encodeURIComponent(window.location.href);
            $referer.attr('data-secure-href', href);
        }
    }

    // Delegate click event on '.join-now' elements to popup member registration form modal dialog
    $(document).on('click', '.join-now', function(e) {
        e.stopPropagation();
        var
            $referer = $(this),
            callback = function() {
                var
                    $modal = $(this),
                    orgtype = $referer.data('org-type') || 2;
                if (orgtype) {
                    $modal.find('[name=org_type],[name=service]').filter('[value=' + orgtype + ']').click();
                }
            };
        patchRedirectUrl($referer);
        modaler(this, callback);
        return false;
    })

    // Delegate click event on '.sign-in-protected' elements to popup sign in form modal dialog
    $(document).on('click', '.sign-in-protected', function(e) {
        e.stopPropagation();
        var $referer = $(this),
            $body = $('body');
        // for logged member, if logged member's role does not equal to expected role, give up
        if ($body.hasClass(STATE_LOGGED)) {
            if ($body.hasClass('buyer') && $referer.hasClass('role-seller')) return false;
            if ($body.hasClass('seller') && $referer.hasClass('role-buyer')) return false;
        }
        patchRedirectUrl($referer);
        modaler(this, function() {
            var $modal = $(this);
            $modal.find('.modal-title').text('Sign in My Tradeeasy ' + ($referer.text() && $referer.text().toLowerCase() != 'sign in' ? ('(' + $referer.text() + ')') : ''));
            $modal.find('.modal-body').scrollTop(0);
        });
        return false;
    })

    // Delegate click event on '.mc-enroll' elements to popup enroll mc form modal dialog
    $(document).on('click', '.mc-enroll', function(e) {
        e.stopPropagation();
        var
            $referer = $(this),
            callback = function() {
                var
                    $modal = $(this),
                    $mcdate = $modal.find('#mcdate'),
                    $mcfind = $modal.find('#mcfind');
                if ($referer.hasClass('apply-for-pm')) {
                    // for applying a new precurement meeting
                    $mcdate.closest('.form-group').removeClass('col-sm-4').addClass('col-sm-6').next().removeClass('col-sm-8').addClass('col-sm-6');
                    $mcdate.hide();
                    $mcfind.parent().hide();
                } else {
                    // for enrolling an upcoming matching conference
                    var $info = $referer.closest('.event');
                    $modal.find('#modal-title').text('Enrolment of ' + $info.find('.subject').text());
                    $modal.find('#mcvenue').text($info.find('.location').text());
                    $mcdate.text($info.find('.date').text().replace('<br>', ', '));
                    $mcfind.text($info.find('.desc').text());
                    $modal.find('#meet-date').hide().find(':input').prop('disabled', true);
                }
                $modal.find('.modal-body').scrollTop(0);
            };
        modaler(this, callback);
        return false;
    })

    /****************************************************************
     * Below section is dedicated for item listing                  *
     ****************************************************************/

    // Delegate click event on .listing .on-top-hints element
    $(document).on('click', '.listing .on-top-hints', function(e) {
        $(this).toggleClass('active');
    })

    // Delegate click event on '.listing-item :checkbox' elements
    $(document).on('click', '.listing-item :checkbox', function(e) {
        var $self = $(this);
        if ($self.closest('.listing-item').hasClass('no-right')) {
            $self.prop('disabled', true).removeProp('checked');
            return;
        }
        $self.closest('.listing').trigger(TRIGGER_TOGGLE_ON_TOP_HINTS);
        /*
        var cnt = $('.listing-item :checkbox:checked').length;
        var $ontophints = $('.listing .on-top-hints');
        if (cnt > 0) $ontophints.removeClass('hide').find('.count').text(cnt);
        else $ontophints.addClass('hide');
        */
    })

    // Delegate click event on '.contact-now' elements
    $(document).on('click', '.contact-now', function(e) {
        e.stopPropagation();
        var
            $referer = $(this),
            callback = function() {
                var
                    $modal = $(this),
                    items = inquiredItems($modal, $referer);
                if (items.comps.length == 1) items.show();
                else items.showAll();
            };
        if ($referer.hasClass('contact-all')) {
            var ids = [],
                href = $referer.data('href'),
                comp_ids = [],
                $listing = $(this).closest('.listing'),
                $showroom = $listing.closest('.showroom');
            $listing.find('input:checked').each(function() {
                ids.push($(this).val());
            });
            $listing.find('input:checked').closest('.listing-item').each(function() {
                comp_ids.push($showroom.length == 0 ? $(this).data('comp-id') : $showroom.data('comp-id'));
            });
            href = href.replace(/id\^\S*\/cat/, 'id^' + ids.join(',') + '/cat');
            href = href.replace(/comp_id\^\S*\/index/, 'comp_id^' + comp_ids.join(',') + '/index');
            $referer.data('href', href);
        }
        modaler(this, callback);
        return false;
    })

    /****************************************************************
     * Below section is dedicated for form validation               *
     ****************************************************************/

    // Delegate submit event on form with validator enabled
    // @note only those forms set data-toggle=validator would be triggered. additional data paramters are accepted
    // - data-if-error-show (optional) show specified error message if fails in validation
    // - data-ajax (optional) submit post via ajax
    // - data-on-[logged|not-logged|success|error]-href (optional) target href to be forwarded if set and returned state matches
    // - data-close-when (optional) close modal window if returned state matches, default is 'success'
    $(document).on('submit', 'form[data-toggle=validator]', function(e) {
        var form = this,
            $form = $(this);
        if (e.isDefaultPrevented()) { // validation failed
            if ($form.data('if-error-show')) showError($form.data('if-error-show'));
        } else { // validation passed
            // track form submission for google analytics
            $form.trigger(TRIGGER_GAQ_MODAL_FORM, 'submit');
            // for ajax send
            log('form[data-toggle=validator].submit(): data-ajax = ' + $form.data('ajax'))
            if ($form.data('ajax')) {
                e.preventDefault();
                e.stopPropagation();
                // ajax post
                log('form[data-toggle=validator].submit(): action = ' + $form.attr('action'))
                ajax.post(null, $form, function(data) {
                    log('form[data-toggle=validator].submit(): post.return.data = ' + data)
                    var result = this.digest(data);
                    var $modal = $form.closest('#modaler');
                    var when = $form.data('close-when') || STATE_SUCCESS;
                    var href = $modal.data('on-' + result.state + '-href');
                    var target = $modal.data('on-' + result.state + '-target');
                    //alert('result.state=' + result.state + ', on-' + result.state + '-href=' + href)
                    log('form[data-toggle=validator].submit(): post.result.state = ' + result.state)
                    // perform forwarding if href is set
                    if (href) {
                        if (target) window.open(href, target);
                        else
                            setTimeout(function() {
                                window.location.href = href
                            }, (result.state == 'done' ? INTERVAL_DEFAULT : 0.3) * 1000);
                    }
                    // close window & report to google analytics if returned state matches
                    if (when == result.state) {
                        $form.trigger(TRIGGER_GAQ_MODAL_FORM, 'done');
                        // if onsuccess callback is specified, execute callback. otherwise, simple close the modal window
                        if (typeof form.onSuccessCallback === 'function') form.onSuccessCallback($modal, result);
                        else $modal.modal('hide');
                    }
                })
            }
        }
    })

    /*********************************************************************************************
     * Below section is dedicated for multi-select element group                                 *
     * Please be noted that multi-select supports the following data properties                  *
     * data-maxcount - max number of items could be selected, default is -1 (unlimited)          *
     * data-storage - name of the input hidden objects, which stores the value of selected items *
     * data-target-name - name of selected targets                                               * 
     *********************************************************************************************/

    // Define function to update multi-select count
    // @param $mselect multi-select jquery element
    // @param $chosen chosen jquery element
    var updateMselectCount = function($mselect, $chosen) {
        var
            count = $chosen.children('li').length,
            $control = $mselect.find('.form-control');
        if (count > 0)
            $control.val('You have selected ' + count + ' ' + ($mselect.data('target-name') || 'items'));
        else
            $control.val('');
        $control.blur();
    }

    // Delegate click event on '.mselect .form-control' element
    $(document).on('click', '.mselect .form-control', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $mselect = $(this).closest('.mselect').addClass('focus');
        // if first time, init multi-select group
        if (!$mselect.data('init')) {
            // register mouseup event on document
            $(document).mouseup(function(e) {
                if (!$mselect.is(e.target) && $mselect.has(e.target).length === 0) $mselect.removeClass('focus');
            });
            // mark as initialized
            $mselect.data('init', true);
        }
    })

    // Delegate click event on '.mselect-items li' available items
    $(document).on('click', '.mselect-items li', function(e) {
        var
            $self = $(this),
            $mselect = $self.closest('.mselect'),
            $chosen = $mselect.find('.mselect-chosen > ul'),
            val = $self.data('value'),
            maxcount = $mselect.data('maxcount') || -1;
        // it's full or reached max count
        if ($mselect.hasClass('full') || $self.hasClass('selected')) return;
        // add input hidden
        $mselect.append('<input type="hidden" name="' + $mselect.data('storage') + '" value="' + val + '">');
        // add selected item
        $chosen.append('<li data-value="' + val + '">' + $self.text() + ' <span class="deselect"></span></li>');
        // mark itself as selected
        $self.addClass('selected');
        // update selected count
        updateMselectCount($mselect, $chosen);
        // rearches max count
        //alert('count='+$chosen.children('li').length + ', maxcount='+maxcount)
        if (maxcount != -1 && $chosen.children('li').length >= maxcount)
            $mselect.addClass('full');
    })

    // Delegate click event on'.mselect-chosen .deselect' chosen items
    $(document).on('click', '.mselect-chosen .deselect', function(e) {
        var
            $self = $(this).parent(),
            $mselect = $self.closest('.mselect'),
            $chosen = $mselect.find('.mselect-chosen > ul'),
            $items = $mselect.find('.mselect-items'),
            val = $self.data('value');
        // remove input hidden
        $mselect.find(':hidden[value=' + val + ']').remove();
        // remove selected item
        $self.remove();
        // remove selected class
        $items.find('[data-value=' + val + ']').removeClass('selected')
        // update selected count
        updateMselectCount($mselect, $chosen);
        // remove full flag from multi-select element
        $mselect.removeClass('full');
    })

    /****************************************************************
     * Below section is dedicated for multi-inqiury form management *
     ****************************************************************/

    // Define inquiry subjects
    var subjects = [
        "General inquiry about your product",
        "I'm interested in your product",
        "I would like to know more about your product"
    ];

    // Define function to show one selected item for inquiry
    // @param $modal modal object, in which multi-inquiry should be composed
    // @param $referer referer object, which initiates the multi-inquiry
    var inquiredItems = function($modal, $referer) {
        var items = {
            $modal: $modal,
            $form: $modal.find('form'),
            $recipients: $modal.find('#recipients'),
            $subject: $modal.find('#subject'),
            $selectedItems: $modal.find('#selected-items'),
            selectedIndex: null,
            comps: new Array(),
            // show selected/inquired items by comp
            show: function(idx) {
                this.selectedIndex = Math.min(idx || 0, this.comps.length - 1);
                var comp = this.comps[this.selectedIndex];
                // compile recipients
                this.$recipients.html(comp.contact + ', ' + comp.name);
                if (comp.items.length > 0) { // having item selected
                    var $that = this.$selectedItems;
                    $that.empty();
                    $.each(comp.items, function(i, item) {
                        $that.append('<div class="selected-item"><i class="glyphicon glyphicon-record"></i>' + item.name + '</div>')
                    })
                }
                // compile subject
                if (this.inqType == 3) { // reply of selling offers
                    this.$subject.val('Reply of your selling offer');
                } else if (this.inqType == 2) { // reply of sourcing request
                    this.$subject.val('Reply of your sourcing request');
                } else if (comp.items.length > 0) { // general inquiry - product
                    this.$subject.val(subjects[randomInt(0, 2)]);
                } else { // general inquiry - company
                    this.$subject.val(subjects[randomInt(0, 2)] + 's');
                }
                if (comp.items.length == 1) { // 1 item selected
                    var name = comp.items[0].name;
                    if (name.length + this.$subject.val().length < 99)
                        this.$subject.val(this.$subject.val() + ', ' + name);
                    else if (name.length < 87)
                        this.$subject.val((this.inqType > 1 ? 'Reply of ' : 'Inquire about ') + name);
                    else if (name.length < 93)
                        this.$subject.val((this.inqType > 1 ? 'Reply ' : 'Inquire ') + name);
                    else
                        this.$subject.val(name.substring(0, 100));
                } else if (comp.items.length > 1) {
                    this.$subject.val(this.$subject.val() + 's , total ' + comp.items.length + ' items selected');
                }
            },
            // show all (for checked items came from more than one companies) 
            showAll: function() {
                var ci = 0,
                    cc = 0;
                $.each(this.comps, function(i, comp) {
                    cc++;
                    ci += comp.items.length;
                });
                this.selectedIndex = null;
                // compile recipients
                if (ci > 0) this.$recipients.html('All ' + ci + ' selected items from ' + cc + ' companies');
                else this.$recipients.html('All ' + cc + ' selected companies');
                // compile subject
                if (this.inqType == 3) { // reply of selling offers
                    this.$subject.val('Reply of your selling offer(s)');
                } else if (this.inqType == 2) { // reply of sourcing request
                    this.$subject.val('Reply of your sourcing request(s)');
                } else if (ci > 0) { // general inquiry - product
                    this.$subject.val(subjects[randomInt(0, 2)] + '(s)');
                } else { // general inquiry - company
                    this.$subject.val(subjects[randomInt(0, 2)] + 's');
                }
                // empty selected items element
                this.$selectedItems.empty();
            },
            // remove those processed items
            // @param result - last inquiry result
            remove: function(result) {
                var _this = this;
                //var $list = $('#products, #suppliers, #sell-leads, #buy-leads');
                var $list = $('.listing');
                if (this.selectedIndex !== null) {
                    var items = [];
                    this.comps[this.selectedIndex].items.map(function(item) {
                        items.push(item.id);
                    });
                    this.comps.splice(this.selectedIndex, 1);
                    $(this.$form.find('.recipient-selector ul').children().get(this.selectedIndex + 1)).remove();
                    items.map(function(item) {
                        var found = false;
                        for (var i = 0; i < _this.comps.length; i++) {
                            var comp = _this.comps[i];
                            for (var j = 0; j < comp.items.length; j++) {
                                if (comp.items[j].id == item) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            $list.find('input:checkbox:checked[value=' + item + ']').trigger('click');
                            //$('#products input:checkbox:checked[value=' + item + ']').trigger('click');	
                            //$('#suppliers input:checkbox:checked[value=' + item + ']').trigger('click');	
                        }
                    });
                } else {
                    this.comps = [];
                    this.$selectedItems.empty();
                }
                if (this.comps.length === 0) { // no more comps
                    log('inquiredItems.remove: all selected items sent, hide modal window')
                    $list.find('input:checkbox:checked').trigger('click');
                    //$('#products input:checkbox:checked').trigger('click');
                    //$('#suppliers input:checkbox:checked').trigger('click');
                    this.$modal.modal('hide');
                } else {
                    log('inquiredItems.remove: switch to next item, index = ' + this.selectedIndex);
                    this.show(this.selectedIndex);
                    if (result && result.user) { // user logged
                        this.$form.find('#not-logged').hide();
                        var $attach = this.$form.find('.attachments');
                        $attach.find('.btn-file').removeProp('disabled');
                        $attach.children('[name=filename]').attr('placeholder', 'Please choose an Attachment if necessary');
                        if ($attach.find('.btn-cancel').length == 0)
                            $attach.append('<span class="input-group-btn"><button class="btn btn-default btn-cancel" type="button">Cancel</button></span>');
                    }
                }
            }
        };
        // extract selected items
        var $items;
        var $showroom = $referer.closest('.showroom');
        // for listing items
        if ($referer.hasClass('contact-all')) { // multi checked
            $items = $referer.closest('.listing').find(':checked').closest('.listing-item');
        } else if ($showroom.length == 0) {
            // for clicking on contact now button in listed item
            $items = $referer.closest('.listing-item');
        } else {
            // for showroom items
            $items = $showroom;
        }
        // iterate each selected item
        $items.each(function() {
            var
                $item = $(this),
                $comp = $showroom.length == 0 ? $item : $showroom,
                cid = $comp.data('comp-id'),
                iid = $item.data('item-id') === undefined ? $referer.data('item-id') : $item.data('item-id'),
                name = trim($item.find('.name').text()),
                idx = -1;
            // locate comp
            $.each(items.comps, function(i, comp) {
                if (comp.id == cid) idx = i;
            });
            // set inquiry type if not set
            if (!items.inqType) items.inqType = $item.data('inquiry-type') === undefined ? $referer.data('inquiry-type') : $item.data('inquiry-type');
            // extract/set comp object
            var comp;
            if (idx == -1) {
                comp = {
                    id: cid,
                    name: trim($comp.find('.comp').text()),
                    contact: $comp.data('contact'),
                    items: new Array()
                };
                items.comps.push(comp);
            } else {
                comp = items.comps[idx];
            }
            // it's an entity item
            if (iid) comp.items.push({
                id: iid,
                name: name
            });
        })
        // form dropdown selector if more than one company is detected
        if (items.comps.length > 1) {
            var $menu = $modal.find('.recipient-selector').removeClass('hide').find('ul');
            $menu.html('<li><span class="link all">ALL</span></li>');
            // loop for each comp
            $.each(items.comps, function(i, comp) {
                var label = comp.name + (comp.items.length ? (' (' + comp.items.length + ' item(s))') : '');
                $('<li><span class="link" data-index="' + i + '">' + label + '</span></li>').appendTo($menu);
            })
        }
        // cache compiled object to window object
        window._inquiredItems = items;
        return items;
    }

    // Delegate click event on '.recipient-selector li>.link' item link elements
    $(document).on('click', '.recipient-selector li>.link', function(e) {
        if (!window._inquiredItems) return;
        var $item = $(this);
        if ($item.hasClass('all')) window._inquiredItems.showAll();
        else window._inquiredItems.show($item.data('index'));
    })

    /****************************************************************
     * Below section is for event-based misc utilities              *
     ****************************************************************/

    // Register scroll event on window
    $(window).on('scroll swipe', function() {
        $(this).trigger(TRIGGER_WIN_SCROLL);
    })

    // Delegate change event on 'form .country-coder' country selection to mock country code of phone number elements
    // Alternatively, one can use validator's synchronize mode to sync country code of newly selected country to destinated elements
    $(document).on('change', 'form .country-coder', function() {
        var
            $self = $(this),
            $form = $self.closest('form'),
            ccode = $self.children(':selected').data('country-code') || '';
        $form.find('.country-code').text(ccode).val(ccode);
    })

    // Delegate keyp event on 'form.sync-area-code .area-code' area code input element to synchronize changes of area code to other area code elements
    // Alternatively, one can use validator's synchronize mode to sync area code to destinated elements
    $(document).on('keyup', 'form.sync-area-code .area-code', function() {
        var $self = $(this),
            $form = $self.closest('form');
        $form.find('.area-code').text($self.val()).val($self.val());
    })

    // delegate change event on 'form .input-file' elements to show selected file for upload
    $(document).on('change', 'form .input-file', function() {
        var $self = $(this);
        $self.closest('.input-group').find('.input-file-name').val($self.val());
    })

    // Delegate click event on 'form .info-toggler' to show/hide less important information
    $(document).on('click', 'form .info-toggler', function() {
        var
            $self = $(this),
            $form = $self.closest('form');
        $self.html($form.hasClass('hide-less-important') ? 'Hide less important information!' : 'Show all information!');
        $form.toggleClass('hide-less-important');
    })

    // Delegate click event on 'form .whoami' radio buttons to toggle role specific information / form group section
    $(document).on('click', 'form .whoami', function() {
        var $self = $(this);
        $($self.val()).show();
        $($self.closest('[class*="form-group"]').siblings().find(':radio').val()).hide();
    })

    // Delegate keypup event on 'textarea, .input-count' elements to count no. of bytes inputted so far
    $(document).on('keyup', 'textarea, .input-count', function() {
        var
            $self = $(this),
            cnt = $self.val() ? $self.val().length : 0,
            ctrid = ($self.prop('id') || $self.prop('name')) + '-ctr',
            maxlen = $self.prop('maxlength'),
            $ctr = $self.siblings('[id="' + ctrid + '"]');
        // counter does not exist, create a new one
        if ($ctr.length == 0) $ctr = $('<div id="' + ctrid + '" class="input-counter"></div>').insertAfter($self);
        // show inputted bytes so far
        if (cnt == 0) $ctr.addClass('hide');
        else $ctr.removeClass('hide').html(cnt + (maxlen && maxlen > 0 ? ('/' + maxlen) : '') + ' characters');
    })

    // Delegate change event on 'select.placeholder' elements to show placeholder color if no value is selected
    $(document).on('change', 'select.placeholder', function() {
        var $self = $(this);
        if ($self.val() || $self.val() == 0) $self.addClass('selected');
        else $self.removeClass('selected');
    })

    // Delegate click event on 'a[data-ajax], .link[data-ajax], button[data-ajax]' ajax linked elements
    $(document).on('click', 'a[data-ajax], .link[data-ajax], button[data-ajax], .button[data-ajax]', function(e) {
        // prevent default event fire
        e.preventDefault();
        e.stopPropagation();
        // call ajax to process
        var
            $self = $(this),
            mode = $self.data('ajax');
        log('ajax mode: ' + mode);
        if (mode == DATA_AJAX_MODALER) {
            // use modaler to load remote content
            modaler(this);
        } else {
            // use ajax to perform remote data access
            ajax.get(this.href || $self.data('href'), mode, $self.data('ajax-target'));
        }
    })

    // Delegate click event on link button
    $(document).on('click', 'button.link[data-href], input.link[data-href]', function(e) {
        // prevent default event fire
        e.preventDefault();
        e.stopPropagation();
        // locate href
        var href = $(this).data('href');
        if (href) window.location.href = href;
    })

    // Delegate change event on 'select[data-ajax]' element to perform cascade data load
    $(document).on('change', 'select[data-ajax]', function(e) {
        // prevent default event fire
        e.preventDefault();
        e.stopPropagation();
        // call ajax to process
        var
            $self = $(this),
            mode = $self.data('ajax'),
            value = $self.val();
        if (value) {
            // use ajax to perform remote data access
            ajax.get(addParam(this.href || $self.data('href'), $self.prop('name'), value), mode, $self.data('ajax-target'));
        }
    })

    // Register win.scroll trigger event for window scrolling
    $(window).on(TRIGGER_WIN_SCROLL, function() {
        var $body = $('body');
        var $header = $('#header');
        var $ebanner = $('.event-banner');
        var ebheight = $ebanner.is(':visible') ? $ebanner.outerHeight() : 0;
        var scrollTop = $(this).scrollTop();
        if (scrollTop <= ebheight && $body.hasClass('fix-header')) {
            $body.removeClass('fix-header');
            $header.css('top', ebheight + 'px');
        } else if (scrollTop > ebheight && !$body.hasClass('fix-header')) {
            $body.addClass('fix-header');
            $header.css('top', '0px');
        } else if (scrollTop == 0 && ebheight == 0) {
            $header.css('top', '0px');
        }
    })

    // Register user.state trigger event on document
    // @param e - event object
    // @param user - user object {name, role[1,2,3]}
    $(document).on(TRIGGER_USER_STATE, function(e, user) {
        var $body = $('body');
        if (!user) { // not logged
            if ($body.hasClass(STATE_LOGGED)) {
                $body.find('.user-info').empty();
                $body.removeClass('logged buyer seller both');
            }
        } else { // member logged
            if (!$body.hasClass(STATE_LOGGED)) {
                var hours = new Date().getHours();
                $body.find('.user-info').text('Good ' + (hours < 11 ? 'morning' : (hours < 18 ? 'afternoon' : 'evening')) + ', ' + user.name);
                $body.addClass(STATE_LOGGED);
                if (user.role == 1) $body.addClass('seller');
                else if (user.role == 2) $body.addClass('buyer');
                else if (user.role == 3) $body.addClass('both');
            }
        }
    })

    // Register toggle.on.top.hints trigger event on listing
    // @note immediate trigger once after event registration
    $(document).on(TRIGGER_TOGGLE_ON_TOP_HINTS, '.listing', function() {
        var $listing = $(this);
        var cnt = $listing.find('.listing-item :checkbox:checked').length;
        var $ontophints = $listing.find('.on-top-hints');
        if (cnt > 0) $ontophints.removeClass('hide').find('.count').text(cnt);
        else $ontophints.addClass('hide');
    }).find('.listing').trigger(TRIGGER_TOGGLE_ON_TOP_HINTS);

    // Register change event on select element to perform cascade data load
    $(document).on(TRIGGER_AUTOCOMPLETE_OFF, 'form', function(e) {
        var $form = $(this);
        setTimeout(function() {
            $form.find('[autocomplete=off]').val('');
        }, 300);
    })

    // Register gaq.modal.form trigger event on modal form
    // @param e - event object
    // @param label - label of tracker object to be extracted from from data. Use the extracted state name to refer to the tracker object in asynchronous tracking.
    //                possible labels: submit (equivalent to data-ga-submit in form) or done (equivalent to data-ga-done in form) 
    // @note only those modal forms would be our target
    $(document).on(TRIGGER_GAQ_MODAL_FORM, '#modaler form', function(e, label) {
        var $form = $(this),
            service = $form.data('ga');
        log('#modaler form.trigger(TRIGGER_GAQ_MODAL_FORM): service = ' + service + ', label = ' + label)
        // not for google analytics
        if (!service) return;
        // for google analytics
        if (label) {
            var state = $form.data('ga-' + label);
            log('#modaler form.trigger(TRIGGER_GAQ_MODAL_FORM): state = ' + state)
            // expected state not found, simply quit
            if (!state) return;
            // append to tracker service
            service += '_' + state;
        }
        log('#modaler form.trigger(TRIGGER_GAQ_MODAL_FORM): service state to be tracked = ' + service)
        if (typeof _gaq != 'undefined') _gaq.push(['_trackPageview', service]);
    })

    /****************************************************************
     * Below section is dedicated for contact us                    *
     ****************************************************************/
    // Delegate click event on '.contact-us' elements
    $(document).on('click', '.contact-us', function(e) {
        e.stopPropagation();
        modaler(this);
        return false;
    })

    // Wrap window opener
    window.open = function(open) {
        return function(url, name, features) {
            // default _blank if not specified 
            name = name || '_blank';
            log('opening ' + url + ' in new window (' + name + ')');
            return open.call(window, url, name, features);
        };
    }(window.open);

    // autocomplete
    $.fn.autocomplete = function(option) {
        return this.each(function() {
            this.timer = null;
            this.items = new Array();

            $.extend(this, option);

            $(this).attr('autocomplete', 'off');

            // Focus
            $(this).on('focus', function() {
                this.request();
            });

            // Blur
            $(this).on('blur', function() {
                setTimeout(function(object) {
                    object.hide();
                }, 200, this);
            });

            // Keydown
            $(this).on('keydown', function(event) {
                switch (event.keyCode) {
                    case 27: // escape
                        this.hide();
                        break;
                    default:
                        this.request();
                        break;
                }
            });

            // Click
            this.click = function(event) {
                event.preventDefault();

                var value = $(event.target).parent().attr('data-value');

                if (value && this.items[value]) {
                    this.select(this.items[value]);
                }
            }

            // Show
            this.show = function() {
                var pos = $(this).position();

                $(this).siblings('ul.dropdown-menu').css({
                    top: pos.top + $(this).outerHeight(),
                    left: pos.left
                });

                $(this).siblings('ul.dropdown-menu').show();
            }

            // Hide
            this.hide = function() {
                $(this).siblings('ul.dropdown-menu').hide();
            }

            // Request
            this.request = function() {
                clearTimeout(this.timer);

                this.timer = setTimeout(function(object) {
                    object.source($(object).val(), $.proxy(object.response, object));
                }, 200, this);
            }

            // Response
            this.response = function(json) {
                var html = '';

                if (json.length) {
                    for (var i = 0; i < json.length; i++) {
                        this.items[json[i]['value']] = json[i];
                    }

                    for (var i = 0; i < json.length; i++) {
                        if (!json[i]['category']) {
                            html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
                        }
                    }
                }

                if (html) {
                    this.show();
                } else {
                    this.hide();
                }

                $(this).siblings('ul.dropdown-menu').html(html);
            }

            if (!$(this).siblings('ul.dropdown-menu').length) {
                $(this).after('<ul class="dropdown-menu"></ul>');
            }
            $(this).siblings('ul.dropdown-menu').delegate('a', 'click', $.proxy(this.click, this));

        });
    }

    // check referer
    const autoreferer = () => {
        const params = new URLSearchParams(window.location.search);
        const gclid = params.get('gclid');
        const cclid = params.get('cclid');
        const ibsource = params.get('ibsource');
        const hostname = window.location.hostname;
        const requesturl = window.location.origin + window.location.pathname + window.location.search;
        let refererurl = document.referrer;
        let organic = false;
        let referer;
        console.log('window.location.origin', window.location.origin);
        console.log('window.location.protocol', window.location.protocol);
        console.log('window.location.host', window.location.host);
        console.log('window.location.pathname', window.location.pathname);
        console.log('window.location.search', window.location.search);
        console.log('refererurl', refererurl);
        console.log('requesturl', requesturl);
        //console.log('refererurl',refererurl);
        //console.log('gclid',gclid);
        //console.log('hostname',hostname);
        // gclid is detected
        if (gclid) {
            console.log('>> got gclid info from request url', gclid);
            referer = 'google';
            organic = true;
        }
        // cclid is detected
        else if (cclid) {
            console.log('>> got cclid info from request url', cclid);
            referer = 'ieims';
            organic = true;
            if (!refererurl) refererurl = window.location.origin;
        }
        // ibsource is detected
        else if (ibsource) {
            console.log('>> got ibsource info from request url', ibsource);
            referer = ibsource;
            organic = true;
            if (!refererurl) refererurl = window.location.origin;
        }
        // massage refererurl
        else if (refererurl) {
            let self = false;
            // check whether is te itself
            const regex1 = RegExp('tradeeasy|b2s|globalmarket|localhost', 'gi');
            let result;
            if ((result = regex1.exec(refererurl)) != null) {
                console.log('regex result', result);
                console.log(">> this is te (" + result[0] + ") itself!");
                self = true;
            }
            // not te itself
            if (!self) {
                // set organic
                organic = true;
                // check against known search engines
                const regex2 = RegExp('google|bing|yandex|yahoo|duckduckgo|sogou|scsg|baidu|pinterest|facebook|brave|ecosia|reddit|startpage|ya.ru|dev.opencart', 'gi');
                if ((result = regex2.exec(refererurl)) != null) {
                    console.log('regex result', result);
                    console.log(">> got organic referer (" + result[0] + ") from request header");
                    referer = result[0];
                }
                // unknown referer
                if (!referer) {
                    console.log('>> got unknown organic referer from request header');
                    referer = 'unknown';
                }
            }
        }
        // organic case
        if (organic) {
            console.log('found an organic referral request');
            console.log('>> referer', referer);
            console.log('>> gclid', gclid);
            console.log('>> refererurl', refererurl);
            console.log('>> requesturl', requesturl);
            const url = '/portal/misc/referer/screen.spg';
            let data = {
                referer: referer,
                refererurl: refererurl,
                requesturl: requesturl,
                gclid: gclid || ''
            }
            $.post(url, data);
        }
    }

    autoreferer();

    // export to global
    window.ajax = ajax;
    window.userState = userState;
    window.showInfo = showInfo;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showAlert = showalertx;
    window.showSuccess = showSuccess;
    window.hideAlert = hidealert;
    window.log = log;
    window.TRIGGER_AUTOCOMPLETE_OFF = TRIGGER_AUTOCOMPLETE_OFF;
    window.TRIGGER_GAQ_MODAL_FORM = TRIGGER_GAQ_MODAL_FORM;

})(jQuery, window);