var formObj = new Object(); //container of validator for form.
function validateFloatRange(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oRange = new formObj.floatRange();
    for (x in oRange) {
        var field = form[oRange[x][0]];
        if (field) {
            if ((field.type == 'text' ||
                    field.type == 'textarea') &&
                (field.value.length > 0)) {

                var fMin = parseFloat(oRange[x][2]("min"));
                var fMax = parseFloat(oRange[x][2]("max"));
                var fValue = parseFloat(field.value);
                if (isNaN(fValue) || !(fValue >= fMin && fValue <= fMax)) {
                    if (i == 0) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oRange[x][1];
                }
            }
        }
    }
    if (fields.length > 0) {
        focusField.focus();
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateByte(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oByte = new formObj.ByteValidations();
    for (x in oByte) {
        var field = form[oByte[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'select-one' ||
                field.type == 'radio' ||
                field.type == 'hidden') {

                var value = '';
                // get field's value
                if (field.type == "select-one") {
                    var si = field.selectedIndex;
                    if (si >= 0) {
                        value = field.options[si].value;
                    }
                } else {
                    value = field.value;
                }

                if (value.length > 0) {
                    if (!isAllDigits(value)) {
                        if ((i == 0) && (field.type != 'hidden')) {
                            focusField = field;
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oByte[x][1];
                    } else {
                        var iValue = parseInt(value);
                        if (isNaN(iValue) || !(iValue >= -128 && iValue <= 127)) {
                            if ((i == 0) && (field.type != 'hidden')) {
                                focusField = field;
                            }
                            formObj.lineNumber++;
                            fields[i++] = formObj.lineNumber + '. ' + oByte[x][1];
                        }
                    }
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateMaxLength(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oMaxLength = new formObj.maxlength();
    for (x in oMaxLength) {
        var field = form[oMaxLength[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'password' ||
                field.type == 'hidden' ||
                field.type == 'select-one') {

                // get field's value
                var value = '';
                if (field.type == 'select-one') {
                    var si = field.selectedIndex;
                    if (si >= 0) {
                        value = field.options[si].value;
                    }
                } else {
                    value = field.value;
                }
                var iMax = parseInt(oMaxLength[x][2]("maxlength"));
                value = value.replace(/(\r\n)/gim, '\n');
                if (getStrLength(value) > iMax) {
                    if ((i == 0) && (field.type != 'hidden')) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oMaxLength[x][1];
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function getStrLength(strObj) {
    // When the string is submitted, it is converted to UTF-8 which is in %uXXXX format and length = 6
    var str = escape(strObj);
    var index = str.indexOf("%u");
    if (index != -1) return str.length;
    else return strObj.length;

    /*var str = escape(strObj);
    var index = str.indexOf("%u"); 
    var count = 0;
    var strlength = 0;
    while(index!=-1){
    	count++;
    	index = str.indexOf("%u",index+1);
    }
    strlength = strObj.length - count + count * 2;
    return strlength;*/
}

function validateRequired(form) {
    var msg = '';
    var focusField = null;
    var fields = new Array();
    oRequired = new formObj.required();

    for (x in oRequired) {
        var result = validateRequiredField(form, oRequired[x], fields);
        fields = result[0];
        focusField = result[1];
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateRequiredIf(form) {
    var msg = '';
    var focusField = null;
    var fields = new Array();
    oRequiredIf = new formObj.requiredif();

    for (x in oRequiredIf) {
        field = form[oRequiredIf[x][2]("fld")];
        value = oRequiredIf[x][2]("fldValue");
        operator = oRequiredIf[x][2]("fldTest");
        if ("EQUAL" == operator) {
            operator = '==';
        } else if ("GREATERTHAN" == operator) {
            operator = '>';
        } else if ("LESSTHAN" == operator) {
            operator = '<';
        }
        fieldreq = form[oRequiredIf[x][0]];
        if (field) {
            if (field.type == 'select-one') {
                if (eval("'" + field.options[field.selectedIndex].value + "'" + operator + "'" + value + "'")) {
                    var result = validateRequiredField(form, oRequiredIf[x], fields);
                    fields = result[0];
                    focusField = result[1];
                }
            } else if (field.type == 'checkbox') {
                if (eval(field.checked + operator + value)) {
                    var result = validateRequiredField(form, oRequiredIf[x], fields);
                    isValid = result[0];
                    fields = result[1];
                    focusField = result[2];
                }
            } else if (field.length > 0) {
                if (field[0].type == 'radio') {
                    for (var i = 0; i < field.length; i++) {
                        if (field[i].checked) {
                            if (eval(field[i].value + operator + value)) {
                                var result = validateRequiredField(form, oRequiredIf[x], fields);
                                fields = result[0];
                                focusField = result[1];
                            }
                        }
                    }
                }
            } else {
                if (eval(field.value + operator + value)) {
                    var result = validateRequiredField(form, oRequiredIf[x], fields);
                    fields = result[0];
                    focusField = result[1];
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateRequiredField(form, oRequired, fields) {
    var i = fields.length;
    var focusField = null;
    var field = form[oRequired[0]];
    if (field && field.length) {
        if (field.type == 'select-one') {
            var value = '';
            var si = field.selectedIndex;
            if (si >= 0) {
                value = field.options[si].value;
            }
            if (trim(value).length == 0) {
                if (i == 0) {
                    focusField = field;
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oRequired[1];
            }
        } else {
            var isempty = true;
            for (var j = 0; j < field.length && isempty; j++) {
                if (field[j].type == 'text') {
                    if (trim(field[j].value).length > 0) {
                        isempty = false;
                        break;
                    }
                } else if (field[j].type == 'radio') {
                    if (field[j].checked) {
                        isempty = false;
                        break;
                    }
                }
            }
            if (isempty) {
                if (i == 0) {
                    focusField = field[0];
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oRequired[1];
            }
        }
    } else if (field) {
        if (field.type == 'text' ||
            field.type == 'textarea' ||
            field.type == 'file' ||
            field.type == 'select-one' ||
            field.type == 'radio' ||
            field.type == 'password' ||
            field.type == 'hidden') {
            var value = '';
            // get field's value
            if (field.type == "select-one") {
                var si = field.selectedIndex;
                if (si >= 0) {
                    value = field.options[si].value;
                }
            } else {
                value = field.value;
            }

            if (trim(value).length == 0) {
                if ((i == 0) && (field.type != 'hidden')) {
                    focusField = field;
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oRequired[1];
            }
        }
    }
    return new Array(fields, focusField); // fields, focusField
}

// Trim whitespace from left and right sides of s.
function trim(s) {
    if (s) return s.replace(/^\s*/, "").replace(/\s*$/, "");
    return s;
}

function validateInteger(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oInteger = new formObj.IntegerValidations();
    for (x in oInteger) {
        var field = form[oInteger[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'select-one' ||
                field.type == 'radio' ||
                field.type == 'hidden') {

                var value = '';
                // get field's value
                if (field.type == "select-one") {
                    var si = field.selectedIndex;
                    if (si >= 0) {
                        value = field.options[si].value;
                    }
                } else {
                    value = field.value;
                }

                if (value.length > 0) {
                    if (!isAllDigits(value)) {
                        if ((i == 0) && (field.type != 'hidden')) {
                            focusField = field;
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oInteger[x][1];
                    } else {
                        var iValue = parseInt(value);
                        if (isNaN(iValue) || !(iValue >= -2147483648 && iValue <= 2147483647)) {
                            if ((i == 0) && (field.type != 'hidden')) {
                                focusField = field;
                            }
                            formObj.lineNumber++;
                            fields[i++] = formObj.lineNumber + '. ' + oInteger[x][1];
                        }
                    }
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function isAllDigits(argvalue) {
    argvalue = argvalue.toString();
    var validChars = "0123456789";
    var startFrom = 0;
    if (argvalue.substring(0, 2) == "0x") {
        validChars = "0123456789abcdefABCDEF";
        startFrom = 2;
    } else if (argvalue.charAt(0) == "0") {
        validChars = "01234567";
        startFrom = 1;
    } else if (argvalue.charAt(0) == "-") {
        startFrom = 1;
    }

    for (var n = startFrom; n < argvalue.length; n++) {
        if (validChars.indexOf(argvalue.substring(n, n + 1)) == -1) return false;
    }
    return true;
}

function validateRange(form) {
    return validateIntRange(form);
}

function validateCreditCard(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oCreditCard = new formObj.creditCard();
    for (x in oCreditCard) {
        if ((form[oCreditCard[x][0]].type == 'text' ||
                form[oCreditCard[x][0]].type == 'textarea') &&
            (form[oCreditCard[x][0]].value.length > 0)) {
            if (!luhnCheck(form[oCreditCard[x][0]].value)) {
                if (i == 0) {
                    focusField = form[oCreditCard[x][0]];
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oCreditCard[x][1];
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

/**
 * Reference: http://www.ling.nwu.edu/~sburke/pub/luhn_lib.pl
 */
function luhnCheck(cardNumber) {
    if (isLuhnNum(cardNumber)) {
        var no_digit = cardNumber.length;
        var oddoeven = no_digit & 1;
        var sum = 0;
        for (var count = 0; count < no_digit; count++) {
            var digit = parseInt(cardNumber.charAt(count));
            if (!((count & 1) ^ oddoeven)) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            };
            sum += digit;
        };
        if (sum == 0) return false;
        if (sum % 10 == 0) return true;
    };
    return false;
}

function isLuhnNum(argvalue) {
    argvalue = argvalue.toString();
    if (argvalue.length == 0) {
        return false;
    }
    for (var n = 0; n < argvalue.length; n++) {
        if ((argvalue.substring(n, n + 1) < "0") ||
            (argvalue.substring(n, n + 1) > "9")) {
            return false;
        }
    }
    return true;
}

function validateDate(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oDate = new formObj.DateValidations();
    for (x in oDate) {
        var value = form[oDate[x][0]].value;
        var datePattern = oDate[x][2]("datePatternStrict");
        if ((form[oDate[x][0]].type == 'text' ||
                form[oDate[x][0]].type == 'textarea' ||
                form[oDate[x][0]].type == 'hidden') &&
            (value.length > 0) &&
            (datePattern.length > 0)) {
            var MONTH = "MM";
            var DAY = "dd";
            var YEAR = "yyyy";
            var orderMonth = datePattern.indexOf(MONTH);
            var orderDay = datePattern.indexOf(DAY);
            var orderYear = datePattern.indexOf(YEAR);
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
                var matched = dateRegexp.exec(value);
                if (matched != null) {
                    if (!isValidDate(matched[2], matched[1], matched[3])) {
                        if (i == 0) {
                            focusField = form[oDate[x][0]];
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                    }
                } else {
                    if (i == 0) {
                        focusField = form[oDate[x][0]];
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                }
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
                var matched = dateRegexp.exec(value);
                if (matched != null) {
                    if (!isValidDate(matched[1], matched[2], matched[3])) {
                        if (i == 0) {
                            focusField = form[oDate[x][0]];
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                    }
                } else {
                    if (i == 0) {
                        focusField = form[oDate[x][0]];
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                }
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
                var matched = dateRegexp.exec(value);
                if (matched != null) {
                    if (!isValidDate(matched[3], matched[2], matched[1])) {
                        if (i == 0) {
                            focusField = form[oDate[x][0]];
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                    }
                } else {
                    if (i == 0) {
                        focusField = form[oDate[x][0]];
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
                }
            } else {
                if (i == 0) {
                    focusField = form[oDate[x][0]];
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oDate[x][1];
            }
        }
    }
    if (fields.length > 0) {
        focusField.focus();
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function isValidDate(day, month, year) {
    if (month < 1 || month > 12) {
        return false;
    }
    if (day < 1 || day > 31) {
        return false;
    }
    if ((month == 4 || month == 6 || month == 9 || month == 11) &&
        (day == 31)) {
        return false;
    }
    if (month == 2) {
        var leap = (year % 4 == 0 &&
            (year % 100 != 0 || year % 400 == 0));
        if (day > 29 || (day == 29 && !leap)) {
            return false;
        }
    }
    return true;
}

function validateIntRange(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oRange = new formObj.intRange();
    for (x in oRange) {
        var field = form[oRange[x][0]];
        if (field) {
            if ((field.type == 'text' ||
                    field.type == 'textarea' ||
                    field.type == 'hidden') &&
                (field.value.length > 0)) {

                var iMin = parseInt(oRange[x][2]("min"));
                var iMax = parseInt(oRange[x][2]("max"));
                var iValue = parseInt(field.value);

                if (isNaN(iValue) || !(iValue >= iMin && iValue <= iMax)) {
                    if ((i == 0) && (field.type != 'hidden')) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oRange[x][1];
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateShort(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oShort = new formObj.ShortValidations();
    for (x in oShort) {
        var field = form[oShort[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'select-one' ||
                field.type == 'radio' ||
                field.type == 'hidden') {

                var value = '';
                // get field's value
                if (field.type == "select-one") {
                    var si = field.selectedIndex;
                    if (si >= 0) {
                        value = field.options[si].value;
                    }
                } else {
                    value = field.value;
                }

                if (value.length > 0) {
                    if (!isAllDigits(value)) {
                        if ((i == 0) && (field.type != 'hidden')) {
                            focusField = field;
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oShort[x][1];
                    } else {
                        var iValue = parseInt(value);
                        if (isNaN(iValue) || !(iValue >= -32768 && iValue <= 32767)) {
                            if ((i == 0) && (field.type != 'hidden')) {
                                focusField = field;
                            }
                            formObj.lineNumber++;
                            fields[i++] = formObj.lineNumber + '. ' + oShort[x][1];
                        }
                    }
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateFloat(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oFloat = new formObj.FloatValidations();
    for (x in oFloat) {
        var field = form[oFloat[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'select-one' ||
                field.type == 'radio' ||
                field.type == 'hidden') {
                var value = '';
                // get field's value
                if (field.type == "select-one") {
                    var si = field.selectedIndex;
                    if (si >= 0) {
                        value = field.options[si].value;
                    }
                } else {
                    value = field.value;
                }

                if (value.length > 0) {
                    var tv = trim(value);
                    if (isNaN(tv) || isNaN(parseFloat(tv))) {
                        if ((i == 0) && (field.type != 'hidden')) {
                            focusField = field;
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oFloat[x][1];
                    }
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateEmail(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oEmail = new formObj.email();
    for (x in oEmail) {
        if ((form[oEmail[x][0]].type == 'text' ||
                form[oEmail[x][0]].type == 'textarea' ||
                form[oEmail[x][0]].type == 'hidden') &&
            (form[oEmail[x][0]].value.length > 0)) {
            if (!checkEmail(form[oEmail[x][0]].value)) {
                if ((i == 0) && (form[oEmail[x][0]].type != 'hidden')) {
                    focusField = form[oEmail[x][0]];
                }
                formObj.lineNumber++;
                fields[i++] = formObj.lineNumber + '. ' + oEmail[x][1];
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

/**
 * Reference: Sandeep V. Tamhankar (stamhankar@hotmail.com),
 * http://javascript.internet.com
 */
function checkEmail(emailStr) {
    if (emailStr.length == 0) {
        return true;
    }
    var results = emailStr.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    console.log('validate email results', results);
    if (results == null) {
        return false;
    }
    /*
    var emailPat=/^(.+)@(.+)$/;
    var specialChars="\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
    var validChars="\[^\\s" + specialChars + "\]";
    var quotedUser="(\"[^\"]*\")";
    var ipDomainPat=/^(\d{1,3})[.](\d{1,3})[.](\d{1,3})[.](\d{1,3})$/;
    var atom=validChars + '+';
    var word="(" + atom + "|" + quotedUser + ")";
    var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
    var domainPat=new RegExp("^" + atom + "(\\." + atom + ")*$");
    var matchArray=emailStr.match(emailPat);
    if (matchArray == null) {
      return false;
    }
    var user=matchArray[1];
    var domain=matchArray[2];
    if (user.match(userPat) == null) {
      return false;
    }
    var IPArray = domain.match(ipDomainPat);
    if (IPArray != null) {
      for (var i = 1; i <= 4; i++) {
        if (IPArray[i] > 255) {
          return false;
        }
      }
      return true;
    }
    var domainArray=domain.match(domainPat);
    if (domainArray == null) {
      return false;
    }
    var atomPat=new RegExp(atom,"g");
    var domArr=domain.match(atomPat);
    var len=domArr.length;
    if ((domArr[domArr.length-1].length < 2) ||
        (domArr[domArr.length-1].length > 3)) {
      return false;
    }
    if (len < 2) {
      return false;
    }
    */
    return true;
}

function validateMask(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oMasked = new formObj.mask();
    for (x in oMasked) {
        var field = form[oMasked[x][0]];

        if (field && field.length) {
            for (var j = 0; j < field.length; j++) {
                if (field[j].type == 'text' && field[j].value.length > 0) {
                    if (!matchPattern(field[j].value, oMasked[x][2]("mask"))) {
                        if ((i == 0)) {
                            focusField = field[j];
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oMasked[x][1];
                        break;
                    }
                }
            }
        } else if (field) {
            if ((field.type == 'text' ||
                    field.type == 'textarea' ||
                    field.type == 'hidden' ||
                    field.type == 'password') &&
                (field.value.length > 0)) {

                if (!matchPattern(field.value, oMasked[x][2]("mask"))) {
                    if ((i == 0) && (field.type != 'hidden')) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oMasked[x][1];
                }
            }
        }
    }

    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function validateKeyword(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oMasked = new formObj.keyword();
    for (x in oMasked) {
        var field = form[oMasked[x][0]];

        if (field && field.length) {
            for (var j = 0; j < field.length; j++) {
                if (field[j].type == 'text' && field[j].value.length > 0) {
                    field[j].value = StrUtil.trim(field[j].value);
                    if (field[j].value.length > 0 && !chkPunctuation(field[j].value)) {
                        if ((i == 0)) {
                            focusField = field[j];
                        }
                        formObj.lineNumber++;
                        fields[i++] = formObj.lineNumber + '. ' + oMasked[x][1];
                        break;
                    }
                }
            }
        } else {
            if ((field.type == 'text' ||
                    field.type == 'textarea' ||
                    field.type == 'hidden') &&
                (field.value.length > 0)) {
                field.value = StrUtil.trim(field.value);
                if (field.value.length > 0 && !chkPunctuation(field.value)) {
                    if ((i == 0) && (field.type != 'hidden')) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oMasked[x][1];
                }
            }
        }
    }

    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}

function chkPunctuation(text) {
    var reg = "^[\\w\\s-_&]*[\\w]$";
    var regex = new RegExp(reg, "i");
    return regex.test(text);
}

function matchPattern(value, mask) {
    return mask.exec(value);
}

function validateMinLength(form) {
    var msg = '';
    var focusField = null;
    var i = 0;
    var fields = new Array();
    oMinLength = new formObj.minlength();
    for (x in oMinLength) {
        var field = form[oMinLength[x][0]];
        if (field) {
            if (field.type == 'text' ||
                field.type == 'textarea' ||
                field.type == 'password' ||
                field.type == 'hidden') {

                var iMin = parseInt(oMinLength[x][2]("minlength"));
                if ((trim(field.value).length > 0) && (getStrLength(field.value) < iMin)) {
                    if ((i == 0) && (field.type != 'hidden')) {
                        focusField = field;
                    }
                    formObj.lineNumber++;
                    fields[i++] = formObj.lineNumber + '. ' + oMinLength[x][1];
                }
            }
        }
    }
    if (fields.length > 0) {
        if (focusField) {
            focusField.focus();
        }
        msg = fields.join('\n');
        msg += '\n';
    }
    return msg;
}