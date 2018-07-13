/**
 * ParamQuery Pro v4.0.0
 *
 * Copyright (c) 2012-2017 Paramvir Dhindsa (http://paramquery.com)
 * Released under Commercial license
 * http://paramquery.com/pro/license
 *
 */
(function() {
    var pq = window.pq = window.pq || {},
        mixin = pq.mixin = {};
    mixin.render = {
        getRenderVal: function(objP, render, iGV) {
            var column = objP.column,
                cer = column.exportRender;
            if ((render && cer !== false || cer) && (column.render || column._render || column.format)) {
                return iGV.renderCell(objP)
            } else {
                return [objP.rowData[objP.dataIndx], ""]
            }
        }
    }
})();
(function($) {
    "use strict";
    var _p = $.ui.autocomplete.prototype;
    var _renderMenu = _p._renderMenu;
    var _renderItem = _p._renderItem;
    _p._renderMenu = function(ul, items) {
        _renderMenu.call(this, ul, items);
        var o = this.options,
            SI = o.selectItem;
        if (SI && SI.on) {
            var cls = SI.cls,
                cls = cls === undefined ? "ui-state-highlight" : cls;
            var val = this.element.val();
            if (val && cls) {
                $("a", ul).filter(function() {
                    return $(this).text() === val
                }).addClass(cls)
            }
        }
    };
    _p._renderItem = function(ul, item) {
        var li = _renderItem.call(this, ul, item);
        var o = this.options,
            HI = o.highlightText;
        if (HI && HI.on) {
            var val = this.element.val();
            if (val) {
                var re = new RegExp("(" + val + ")", "i"),
                    text = item.label;
                if (re.test(text)) {
                    var style = HI.style,
                        style = style === undefined ? "font-weight:bold;" : style,
                        cls = HI.cls,
                        cls = cls === undefined ? "" : cls;
                    text = text.replace(re, "<span style='" + style + "' class='" + cls + "'>$1</span>");
                    li.find("a").html(text)
                }
            }
        }
        return li
    };
    var _pq = $.paramquery = $.paramquery || {};
    var handleListeners = function(that, arg_listeners, evt, data) {
        var listeners = arg_listeners.slice(),
            i = 0,
            len = listeners.length,
            ret, removals = [];
        for (; i < len; i++) {
            var listener = listeners[i],
                cb = listener.cb,
                one = listener.one;
            if (one) {
                if (listener._oncerun) {
                    continue
                }
                listener._oncerun = true
            }
            ret = cb.call(that, evt, data);
            if (ret === false) {
                evt.preventDefault();
                evt.stopPropagation()
            }
            if (one) {
                removals.push(i)
            }
            if (evt.isImmediatePropagationStopped()) {
                break
            }
        }
        if (len = removals.length) {
            for (i = len - 1; i >= 0; i--) {
                listeners.splice(removals[i], 1)
            }
        }
    };
    _pq._trigger = function(type, evt, data) {
        var self = this,
            prop, orig, this_listeners = self.listeners,
            listeners = this_listeners[type],
            o = self.options,
            allEvents = o.allEvents,
            bubble = o.bubble,
            $ele = self.element,
            callback = o[type];
        data = data || {};
        evt = $.Event(evt);
        evt.type = self.widgetName + ":" + type;
        evt.target = $ele[0];
        orig = evt.originalEvent;
        if (orig) {
            for (prop in orig) {
                if (!(prop in evt)) {
                    evt[prop] = orig[prop]
                }
            }
        }
        if (allEvents) {
            if (typeof allEvents == "function") {
                allEvents.call(self, evt, data)
            }
        }
        if (listeners && listeners.length) {
            handleListeners(self, listeners, evt, data);
            if (evt.isImmediatePropagationStopped()) {
                return !evt.isDefaultPrevented()
            }
        }
        // 全てのpgGridでtrigerして欲しいので、`|| true`を追加してます。
        // 本来であれば、pgGrid使うところでOptionを都度指定したほうが良いが、
        // 今のところ、triggerしたくないケースがないのでライブラリのコードを修正してます。
        if (o.trigger || true) {
            // こちらも本来であれば、`o.bubble` をtrueにすべきだが、
            // triggerを使うように強制しても問題ないのでライブラリのコードを修正してます。
            $ele[true ? "trigger" : "triggerHandler"](evt, data);
            if (evt.isImmediatePropagationStopped()) {
                return !evt.isDefaultPrevented()
            }
        }
        if (callback) {
            var ret = callback.call(self, evt, data);
            if (ret === false) {
                evt.preventDefault();
                evt.stopPropagation()
            }
        }
        listeners = this_listeners[type + "Done"];
        if (listeners && listeners.length) {
            handleListeners(self, listeners, evt, data)
        }
        return !evt.isDefaultPrevented()
    };
    var event_on = function(that, type, cb, one, first) {
        var listeners = that.listeners[type];
        if (!listeners) {
            listeners = that.listeners[type] = []
        }
        listeners[first ? "unshift" : "push"]({
            cb: cb,
            one: one
        })
    };
    _pq.on = function() {
        var arg = arguments;
        if (typeof arg[0] == "boolean") {
            var first = arg[0],
                type = arg[1],
                cb = arg[2],
                one = arg[3]
        } else {
            var type = arg[0],
                cb = arg[1],
                one = arg[2]
        }
        var arr = type.split(" ");
        for (var i = 0; i < arr.length; i++) {
            var _type = arr[i];
            if (_type) {
                event_on(this, _type, cb, one, first)
            }
        }
        return this
    };
    _pq.one = function() {
        var len = arguments.length,
            arr = [];
        for (var i = 0; i < len; i++) {
            arr[i] = arguments[i]
        }
        arr[len] = true;
        return this.on.apply(this, arr)
    };
    var event_off = function(that, evtName, cb) {
        if (cb) {
            var listeners = that.listeners[evtName];
            if (listeners) {
                var removals = [];
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var listener = listeners[i],
                        cb2 = listener.cb;
                    if (cb == cb2) {
                        removals.push(i)
                    }
                }
                if (removals.length) {
                    for (var i = removals.length - 1; i >= 0; i--) {
                        listeners.splice(removals[i], 1)
                    }
                }
            }
        } else {
            delete that.listeners[evtName]
        }
    };
    _pq.off = function(type, cb) {
        var arr = type.split(" ");
        for (var i = 0; i < arr.length; i++) {
            var _type = arr[i];
            if (_type) {
                event_off(this, _type, cb)
            }
        }
        return this
    };
    var fn = {
        options: {
            items: "td.pq-has-tooltip,td[title]",
            position: {
                my: "center top",
                at: "center bottom"
            },
            content: function() {
                var $td = $(this),
                    $grid = $td.closest(".pq-grid"),
                    grid = $grid.pqGrid("instance"),
                    obj = grid.getCellIndices({
                        $td: $td
                    }),
                    rowIndx = obj.rowIndx,
                    dataIndx = obj.dataIndx,
                    pq_valid = grid.data({
                        rowIndx: rowIndx,
                        dataIndx: dataIndx,
                        data: "pq_valid"
                    }).data;
                if (pq_valid) {
                    var icon = pq_valid.icon,
                        title = pq_valid.msg;
                    title = title != null ? title : "";
                    var strIcon = icon == "" ? "" : "<span class='ui-icon " + icon + " pq-tooltip-icon'></span>";
                    return strIcon + title
                } else {
                    return $td.attr("title")
                }
            }
        }
    };
    fn._create = function() {
        this._super();
        var $ele = this.element,
            eventNamespace = this.eventNamespace;
        $ele.on("pqtooltipopen" + eventNamespace, function(evt, ui) {
            var $grid = $(evt.target),
                $td = $(evt.originalEvent.target);
            $td.on("remove.pqtt", function(evt) {
                $grid.pqTooltip("close", evt, true)
            });
            if ($grid.is(".pq-grid")) {
                var grid = $grid.pqGrid("instance"),
                    obj = grid.getCellIndices({
                        $td: $td
                    }),
                    rowIndx = obj.rowIndx,
                    dataIndx = obj.dataIndx,
                    a, rowData = grid.getRowData({
                        rowIndx: rowIndx
                    });
                if ((a = rowData) && (a = a.pq_celldata) && (a = a[dataIndx]) && (a = a["pq_valid"])) {
                    var valid = a,
                        style = valid.style,
                        cls = valid.cls;
                    ui.tooltip.addClass(cls);
                    var olds = ui.tooltip.attr("style");
                    ui.tooltip.attr("style", olds + ";" + style)
                }
                $grid.find(".pq-sb-horiz,.pq-sb-vert").on("pqscrollbardrag.pqtt", function(evt, ui) {
                    evt.currentTarget = $td[0];
                    $grid.pqTooltip("close", evt, true)
                })
            }
        });
        $ele.on("pqtooltipclose" + eventNamespace, function(evt, ui) {
            var $grid = $(evt.target),
                $td = $(evt.originalEvent.target);
            $td.off(".pqtt");
            if ($grid.is(".pq-grid")) {
                $grid.find(".pq-sb-horiz,.pq-sb-vert").off(".pqtt")
            }
        })
    };
    $.widget("paramquery.pqTooltip", $.ui.tooltip, fn)
})(jQuery);
(function($) {
    $.paramquery.onResizeDiv = function(el, cb) {
        var oldHt = el.offsetHeight,
            newHt, style = 'style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;visibility:hidden;z-index:-1;"',
            div = ["<div ", style, " >", "<div ", style, " >", "<div style='width:10000px;height:10000px;'></div>", "</div>", "<div ", style, " >", "<div style='width:999%;height:999%;'></div>", "</div>", "</div>"].join(""),
            $div = $(div),
            id;
        $(el).append($div);
        div = $div[0];

        function onResize() {
            oldHt = newHt;
            cb()
        }

        function reset() {
            $div.children().scrollLeft(1e4).scrollTop(1e4)
        }
        reset();
        $div.children().on("scroll", function() {
            cancelAnimationFrame(id);
            newHt = el.offsetHeight;
            if (newHt != oldHt) {
                id = requestAnimationFrame(onResize);
                reset()
            }
        })
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        _proto_ = Array.prototype;
    !_proto_.find && (_proto_.find = function(fn, context) {
        for (var i = 0, len = this.length, item; i < len; i++) {
            item = this[i];
            if (fn.call(context, item, i, this)) {
                return item
            }
        }
    });
    !_proto_.findIndex && (_proto_.findIndex = function(fn, context) {
        for (var i = 0, len = this.length, item; i < len; i++) {
            item = this[i];
            if (fn.call(context, item, i, this)) {
                return i
            }
        }
        return -1
    });
    var pq = $.extend(window.pq, {
        arrayUnique: function(arr, key) {
            var newarr = [],
                i, len = arr.length,
                str, obj = {},
                key2;
            for (i = 0; i < len; i++) {
                str = arr[i];
                key2 = key ? str[key] : str;
                if (obj.hasOwnProperty(key2)) {
                    continue
                }
                obj[key2] = 1;
                newarr.push(str)
            }
            return newarr
        },
        escapeHtml: function(val) {
            return val.replace(/&/g, "&amp;").replace(/</g, "&lt;")
        },
        escapeXml: function(val) {
            return val.replace(/&/g, "&amp;").replace(/</g, "&lt;")
        },
        excelToJui: function() {
            var cache = {};
            return function(format) {
                var f = cache[format];
                if (!f) {
                    f = format.replace(/yy/g, "y").replace(/dddd/g, "DD").replace(/ddd/g, "D").replace(/mmmm/g, "MM").replace(/mmm/g, "M");
                    cache[format] = f
                }
                return f
            }
        }(),
        excelToNum: function() {
            var cache = {};
            return function(format) {
                var f = cache[format];
                if (!f) {
                    f = format.replace(/\\/g, "");
                    cache[format] = f
                }
                return f
            }
        }(),
        flatten: function(arr, arr2) {
            var i = 0,
                len = arr.length,
                val;
            arr2 = arr2 || [];
            for (; i < len; i++) {
                val = arr[i];
                if (val != null) {
                    if (val.push) {
                        pq.flatten(val, arr2)
                    } else {
                        arr2.push(val)
                    }
                }
            }
            return arr2
        },
        getFn: function() {
            var obj = {};
            return function(cb) {
                var fn = cb;
                if (typeof cb === "string") {
                    if (!(fn = obj[cb])) {
                        fn = window;
                        cb.split(".").forEach(function(part) {
                            fn = fn[part]
                        });
                        obj[cb] = fn
                    }
                }
                return fn
            }
        }(),
        isDateFormat: function() {
            var cache = {};
            return function(format) {
                var f = cache[format];
                if (f == null) {
                    f = cache[format] = /^[mdy\s-\/]*$/i.test(format)
                }
                return f
            }
        }(),
        isEmpty: function(cell) {
            for (var key in cell) {
                return false
            }
            return true
        },
        juiToExcel: function() {
            var cache = {};
            return function(format) {
                var f = cache[format];
                if (!f) {
                    f = format.replace(/y/g, "yy").replace(/DD/g, "dddd").replace(/D/g, "ddd").replace(/MM/g, "mmmm").replace(/M/g, "mmm");
                    cache[format] = f
                }
                return f
            }
        }(),
        numToExcel: function() {
            var cache = {};
            return function(format) {
                var f = cache[format];
                if (!f) {
                    f = format.replace(/[^#0,.]/g, function(a) {
                        return "\\" + a
                    });
                    cache[format] = f
                }
                return f
            }
        }(),
        searchSeqArray: function(arr, val) {
            var len = arr.length,
                b = val,
                indx = val,
                count = 0,
                indx = indx > len - 1 ? len - 1 : indx,
                _val;
            do {
                _val = arr[indx];
                count++;
                if (_val < val) {
                    if (indx == len - 1) {
                        indx = -1;
                        break
                    }
                    indx = Math.ceil((indx + b) / 2);
                    indx = indx > len - 1 ? len - 1 : indx
                } else if (_val > val) {
                    b = indx;
                    indx = Math.floor(indx / 2)
                } else {
                    break
                }
                if (count > 100) {
                    throw "too many iterations"
                }
            } while (1);
            return indx
        },
        unescapeXml: function() {
            var obj = {
                amp: "&",
                lt: "<",
                gt: ">",
                quot: '"',
                apos: "'"
            };
            return function(val) {
                return val.replace(/&(amp|lt|gt|quot|apos);/g, function(a, b) {
                    return obj[b]
                })
            }
        }()
    });
    _pq.select = function(objP) {
        var attr = objP.attr,
            opts = objP.options,
            groupIndx = objP.groupIndx,
            labelIndx = objP.labelIndx,
            valueIndx = objP.valueIndx,
            jsonFormat = labelIndx != null && valueIndx != null,
            grouping = groupIndx != null,
            prepend = objP.prepend,
            dataMap = objP.dataMap,
            groupV, groupVLast, jsonF, dataMapFn = function() {
                var jsonObj = {};
                for (var k = 0; k < dataMap.length; k++) {
                    var key = dataMap[k];
                    jsonObj[key] = option[key]
                }
                return "data-map='" + JSON.stringify(jsonObj) + "'"
            },
            buffer = ["<select ", attr, " >"];
        if (prepend) {
            for (var key in prepend) {
                buffer.push('<option value="', key, '">', prepend[key], "</option>")
            }
        }
        if (opts && opts.length) {
            for (var i = 0, len = opts.length; i < len; i++) {
                var option = opts[i];
                if (jsonFormat) {
                    var value = option[valueIndx],
                        disabled = option.pq_disabled ? 'disabled="disabled" ' : "",
                        selected = option.pq_selected ? 'selected="selected" ' : "";
                    if (value == null) {
                        continue
                    }
                    jsonF = dataMap ? dataMapFn() : "";
                    if (grouping) {
                        var disabled_group = option.pq_disabled_group ? 'disabled="disabled" ' : "";
                        groupV = option[groupIndx];
                        if (groupVLast != groupV) {
                            if (groupVLast != null) {
                                buffer.push("</optgroup>")
                            }
                            buffer.push('<optgroup label="', groupV, '" ', disabled_group, " >");
                            groupVLast = groupV
                        }
                    }
                    if (labelIndx == valueIndx) {
                        buffer.push("<option ", selected, disabled, jsonF, ">", value, "</option>")
                    } else {
                        var label = option[labelIndx];
                        buffer.push("<option ", selected, disabled, jsonF, ' value="', value, '">', label, "</option>")
                    }
                } else if (typeof option == "object") {
                    for (var key in option) {
                        buffer.push('<option value="', key, '">', option[key], "</option>")
                    }
                } else {
                    buffer.push("<option>", option, "</option>")
                }
            }
            if (grouping) {
                buffer.push("</optgroup>")
            }
        }
        buffer.push("</select>");
        return buffer.join("")
    };
    $.fn.pqval = function(obj) {
        if (obj) {
            if (obj.incr) {
                var val = this.data("pq_value");
                this.prop("indeterminate", false);
                if (val) {
                    val = false;
                    this.prop("checked", false)
                } else if (val === false) {
                    val = null;
                    this.prop("indeterminate", true);
                    this.prop("checked", false)
                } else {
                    val = true;
                    this.prop("checked", true)
                }
                this.data("pq_value", val);
                return val
            } else {
                var val = obj.val;
                this.data("pq_value", val);
                this.prop("indeterminate", false);
                if (val == null) {
                    this.prop("indeterminate", true);
                    this.prop("checked", false)
                } else if (val) {
                    this.prop("checked", true)
                } else {
                    this.prop("checked", false)
                }
                return this
            }
        } else {
            return this.data("pq_value")
        }
    };
    _pq.xmlToArray = function(data, obj) {
        var itemParent = obj.itemParent;
        var itemNames = obj.itemNames;
        var arr = [];
        var $items = $(data).find(itemParent);
        $items.each(function(i, item) {
            var $item = $(item);
            var arr2 = [];
            $(itemNames).each(function(j, itemName) {
                arr2.push($item.find(itemName).text().replace(/\r|\n|\t/g, ""))
            });
            arr.push(arr2)
        });
        return arr
    };
    _pq.xmlToJson = function(data, obj) {
        var itemParent = obj.itemParent;
        var itemNames = obj.itemNames;
        var arr = [];
        var $items = $(data).find(itemParent);
        $items.each(function(i, item) {
            var $item = $(item);
            var arr2 = {};
            for (var j = 0, len = itemNames.length; j < len; j++) {
                var itemName = itemNames[j];
                arr2[itemName] = $item.find(itemName).text().replace(/\r|\n|\t/g, "")
            }
            arr.push(arr2)
        });
        return arr
    };
    _pq.tableToArray = function(tbl) {
        var $tbl = $(tbl),
            colModel = [],
            data = [],
            $trs = $tbl.children("tbody").children("tr"),
            $trfirst = $trs.length ? $($trs[0]) : $(),
            $trsecond = $trs.length > 1 ? $($trs[1]) : $();
        $trfirst.children("th,td").each(function(i, td) {
            var $td = $(td),
                title = $td.html(),
                width = $td.width(),
                align = "left",
                dataType = "string";
            if ($trsecond.length) {
                var $tdsec = $trsecond.find("td:eq(" + i + ")"),
                    halign = $tdsec.attr("align"),
                    align = halign ? halign : align
            }
            var obj = {
                title: title,
                width: width,
                dataType: dataType,
                align: align,
                dataIndx: i
            };
            colModel.push(obj)
        });
        $trs.each(function(i, tr) {
            if (i == 0) {
                return
            }
            var $tr = $(tr);
            var arr2 = [];
            $tr.children("td").each(function(j, td) {
                arr2.push($.trim($(td).html()))
            });
            data.push(arr2)
        });
        return {
            data: data,
            colModel: colModel
        }
    };
    var _getNumFormat = function(_nformats) {
        return function(format, negative) {
            var obj, arr, re, m;
            if (format) {
                arr = format.split(":");
                format = negative && arr.length > 1 ? arr[1] : arr[0];
                if (obj = _nformats[format]) {
                    return obj
                }
                re = /^([^#]*|&#[^#]*)?[\,\.#0]*?([\,\s\.]?)([#0]*)([\,\s\.]?)([0]*?)(\s*[^#^0]*|&#[^#]*)?$/;
                m = format.match(re);
                if (m && m.length) {
                    obj = {
                        symbol: m[1] || "",
                        thouSep: m[2],
                        thousand: m[3].length,
                        decSep: m[4],
                        decimal: m[5].length,
                        symbolEnd: m[6] || ""
                    };
                    _nformats[format] = obj
                }
            }
            obj = obj || {
                symbol: "",
                symbolEnd: "",
                thouSep: ",",
                thousand: 3,
                decSep: ".",
                decimal: 2
            };
            return obj
        }
    }({});
    _pq.formatCurrency = function(o_val, format) {
        var val = parseFloat(o_val);
        if (isNaN(val)) {
            return
        }
        var negative = val < 0,
            obj = _getNumFormat(format, negative),
            symbol = obj.symbol,
            symbolEnd = obj.symbolEnd,
            thousand = obj.thousand,
            thouSep = obj.thouSep,
            decSep = obj.decSep,
            decimal = obj.decimal;
        val = val.toFixed(decimal);
        var len = val.length,
            sublen = decimal + decSep.length,
            fp = val.substring(0, len - sublen),
            lp = val.substring(len - sublen + decSep.length, len),
            arr = fp.match(/\d/g).reverse(),
            arr2 = [];
        for (var i = 0; i < arr.length; i++) {
            if (i > 0 && i % thousand == 0) {
                arr2.push(thouSep)
            }
            arr2.push(arr[i])
        }
        arr2 = arr2.reverse();
        fp = arr2.join("");
        return (negative ? "-" : "") + symbol + fp + decSep + lp + symbolEnd
    };
    pq.formatNumber = _pq.formatCurrency;
    pq.validation = {
        is: function(type, val) {
            if (type == "string" || !type) {
                return true
            }
            type = type.substring(0, 1).toUpperCase() + type.substring(1, type.length);
            return this["is" + type](val)
        },
        isFloat: function(val) {
            var pf = parseFloat(val);
            if (!isNaN(pf) && pf == val) {
                return true
            } else {
                return false
            }
        },
        isInteger: function(val) {
            var pi = parseInt(val);
            if (!isNaN(pi) && pi == val) {
                return true
            } else {
                return false
            }
        },
        isDate: function(val) {
            var pd = Date.parse(val);
            if (!isNaN(pd)) {
                return true
            } else {
                return false
            }
        }
    };
    var NumToLetter = [],
        letterToNum = {};
    var toLetter = pq.toLetter = function(num) {
        var letter = NumToLetter[num];
        if (!letter) {
            num++;
            var mod = num % 26,
                pow = num / 26 | 0,
                out = mod ? String.fromCharCode(64 + mod) : (--pow, "Z");
            letter = pow ? toLetter(pow - 1) + out : out;
            num--;
            NumToLetter[num] = letter;
            letterToNum[letter] = num
        }
        return letter
    };

    function _toNum(letter) {
        return letter.charCodeAt(0) - 64
    }
    pq.toNumber = function(letter) {
        var num = letterToNum[letter],
            len, i, _let, _num, indx;
        if (num == null) {
            len = letter.length;
            num = -1;
            i = 0;
            for (; i < len; i++) {
                _let = letter[i];
                _num = _toNum(_let);
                indx = len - i - 1;
                num += _num * Math.pow(26, indx)
            }
            NumToLetter[num] = letter;
            letterToNum[letter] = num
        }
        return num
    };
    pq.generateData = function(rows, cols) {
        var alp = [];
        for (var i = 0; i < cols; i++) {
            alp[i] = toLetter(i)
        }
        var data = [];
        for (var i = 0; i < rows; i++) {
            var row = data[i] = [];
            for (var j = 0; j < cols; j++) {
                row[j] = alp[j] + (i + 1)
            }
        }
        return data
    }
})(jQuery);
(function($) {
    pq.validations = {
        minLen: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value.length >= reqVal) {
                return true
            }
        },
        nonEmpty: function(value) {
            if (value != null && value !== "") {
                return true
            }
        },
        maxLen: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value.length <= reqVal) {
                return true
            }
        },
        gt: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value > reqVal) {
                return true
            }
        },
        gte: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value >= reqVal) {
                return true
            }
        },
        lt: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value < reqVal) {
                return true
            }
        },
        lte: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value <= reqVal) {
                return true
            }
        },
        neq: function(value, reqVal, getValue) {
            value = getValue(value);
            reqVal = getValue(reqVal);
            if (value !== reqVal) {
                return true
            }
        },
        regexp: function(value, reqVal) {
            if (new RegExp(reqVal).test(value)) {
                return true
            }
        }
    };
    var _pq = $.paramquery;
    _pq.cValid = function(that) {
        this.that = that
    };
    var _piv = _pq.cValid.prototype;
    _piv._isValidCell = function(objP) {
        var that = this.that,
            column = objP.column,
            valids = column.validations;
        if (!valids || !valids.length) {
            return {
                valid: true
            }
        }
        var value = objP.value,
            fn, dataType = column.dataType,
            getValue = function(val) {
                return that.getValueFromDataType(val, dataType, true)
            },
            rowData = objP.rowData;
        if (!rowData) {
            throw "rowData required."
        }
        for (var j = 0; j < valids.length; j++) {
            var valid = valids[j],
                on = valid.on,
                type = valid.type,
                _valid = false,
                msg = valid.msg,
                reqVal = valid.value;
            if (on === false) {
                continue
            }
            if (fn = pq.validations[type]) {
                _valid = value == null ? false : fn(value, reqVal, getValue)
            } else if (type) {
                var obj2 = {
                    column: column,
                    value: value,
                    rowData: rowData,
                    msg: msg
                };
                if (that.callFn(type, obj2) === false) {
                    _valid = false;
                    msg = obj2.msg
                } else {
                    _valid = true
                }
            } else {
                _valid = true
            }
            if (!_valid) {
                return {
                    valid: false,
                    msg: msg,
                    column: column,
                    warn: valid.warn,
                    dataIndx: column.dataIndx,
                    validation: valid
                }
            }
        }
        return {
            valid: true
        }
    };
    _piv.isValidCell = function(objP) {
        var that = this.that,
            rowData = objP.rowData,
            rowIndx = objP.rowIndx,
            value = objP.value,
            valueDef = objP.valueDef,
            column = objP.column,
            focusInvalid = objP.focusInvalid,
            o = that.options,
            bootstrap = o.bootstrap,
            allowInvalid = objP.allowInvalid,
            dataIndx = column.dataIndx,
            gValid = o.validation,
            gWarn = o.warning,
            EM = o.editModel,
            errorClass = EM.invalidClass,
            warnClass = EM.warnClass,
            ae = document.activeElement;
        if (objP.checkEditable) {
            if (that.isEditableCell({
                    rowIndx: rowIndx,
                    dataIndx: dataIndx
                }) == false) {
                return {
                    valid: true
                }
            }
        }
        var objvalid = this._isValidCell({
                column: column,
                value: value,
                rowData: rowData
            }),
            _valid = objvalid.valid,
            warn = objvalid.warn,
            msg = objvalid.msg;
        if (!_valid) {
            var pq_valid = $.extend({}, warn ? gWarn : gValid, objvalid.validation),
                css = pq_valid.css,
                cls = pq_valid.cls,
                icon = pq_valid.icon,
                style = pq_valid.style
        } else {
            if (that.data({
                    rowData: rowData,
                    dataIndx: dataIndx,
                    data: "pq_valid"
                })) {
                that.removeClass({
                    rowData: rowData,
                    rowIndx: rowIndx,
                    dataIndx: dataIndx,
                    cls: warnClass + " " + errorClass
                });
                that.removeData({
                    rowData: rowData,
                    dataIndx: dataIndx,
                    data: "pq_valid"
                })
            }
        }
        if (allowInvalid || warn) {
            if (!_valid) {
                that.addClass({
                    rowData: rowData,
                    rowIndx: rowIndx,
                    dataIndx: dataIndx,
                    cls: warn ? warnClass : errorClass
                });
                that.data({
                    rowData: rowData,
                    dataIndx: dataIndx,
                    data: {
                        pq_valid: {
                            css: css,
                            icon: icon,
                            style: style,
                            msg: msg,
                            cls: cls
                        }
                    }
                });
                return objvalid
            } else {
                return {
                    valid: true
                }
            }
        } else {
            if (!_valid) {
                if (rowIndx == null) {
                    var objR = that.getRowIndx({
                            rowData: rowData,
                            dataUF: true
                        }),
                        rowIndx = objR.rowIndx;
                    if (rowIndx == null || objR.uf) {
                        objvalid.uf = objR.uf;
                        return objvalid
                    }
                }
                if (focusInvalid) {
                    var $td;
                    if (!valueDef) {
                        that.goToPage({
                            rowIndx: rowIndx
                        });
                        var uin = {
                                rowIndx: rowIndx,
                                dataIndx: dataIndx
                            },
                            uin = that.normalize(uin);
                        $td = that.getCell(uin);
                        that[o.selectionModel.type == "cell" ? "setSelection" : "scrollCell"](uin);
                        that.focus(uin)
                    } else {
                        if ($(ae).hasClass("pq-editor-focus")) {
                            var indices = o.editModel.indices;
                            if (indices) {
                                var rowIndx2 = indices.rowIndx,
                                    dataIndx2 = indices.dataIndx;
                                if (rowIndx != null && rowIndx != rowIndx2) {
                                    throw "incorrect usage of isValid rowIndx: " + rowIndx
                                }
                                if (dataIndx != dataIndx2) {
                                    throw "incorrect usage of isValid dataIndx: " + dataIndx
                                }
                                that.editCell({
                                    rowIndx: rowIndx2,
                                    dataIndx: dataIndx
                                })
                            }
                        }
                    }
                    var cell;
                    if ($td || (cell = that.getEditCell()) && cell.$cell) {
                        var $cell = $td || cell.$cell;
                        $cell.attr("title", msg);
                        var tooltipFn = "tooltip",
                            tooltipShowFn = "open";
                        if (bootstrap.on && bootstrap.tooltip) {
                            tooltipFn = bootstrap.tooltip;
                            tooltipShowFn = "show"
                        }
                        try {
                            $cell[tooltipFn]("destroy")
                        } catch (ex) {}
                        $cell[tooltipFn]({
                            trigger: "manual",
                            position: {
                                my: "left center+5",
                                at: "right center"
                            },
                            content: function() {
                                var strIcon = icon == "" ? "" : "<span class='ui-icon " + icon + " pq-tooltip-icon'></span>";
                                return strIcon + msg
                            },
                            open: function(evt, ui) {
                                var tt = ui.tooltip;
                                if (cls) {
                                    tt.addClass(cls)
                                }
                                if (style) {
                                    var olds = tt.attr("style");
                                    tt.attr("style", olds + ";" + style)
                                }
                                if (css) {
                                    tt.tooltip.css(css)
                                }
                            }
                        })[tooltipFn](tooltipShowFn)
                    }
                }
                return objvalid
            }
            if (valueDef) {
                var cell = that.getEditCell();
                if (cell && cell.$cell) {
                    var $cell = cell.$cell;
                    $cell.removeAttr("title");
                    try {
                        $cell.tooltip("destroy")
                    } catch (ex) {}
                }
            }
            return {
                valid: true
            }
        }
    };
    _piv.isValid = function(objP) {
        objP = objP || {};
        var that = this.that,
            allowInvalid = objP.allowInvalid,
            focusInvalid = objP.focusInvalid,
            checkEditable = objP.checkEditable,
            allowInvalid = allowInvalid == null ? false : allowInvalid,
            dataIndx = objP.dataIndx;
        if (dataIndx != null) {
            var column = that.columns[dataIndx],
                rowData = objP.rowData || that.getRowData(objP),
                valueDef = objP.hasOwnProperty("value"),
                value = valueDef ? objP.value : rowData[dataIndx],
                objValid = this.isValidCell({
                    rowData: rowData,
                    checkEditable: checkEditable,
                    rowIndx: objP.rowIndx,
                    value: value,
                    valueDef: valueDef,
                    column: column,
                    allowInvalid: allowInvalid,
                    focusInvalid: focusInvalid
                });
            if (!objValid.valid && !objValid.warn) {
                return objValid
            } else {
                return {
                    valid: true
                }
            }
        } else if (objP.rowIndx != null || objP.rowIndxPage != null || objP.rowData != null) {
            var rowData = objP.rowData || that.getRowData(objP),
                CM = that.colModel,
                cells = [],
                warncells = [];
            for (var i = 0, len = CM.length; i < len; i++) {
                var column = CM[i],
                    hidden = column.hidden;
                if (hidden) {
                    continue
                }
                var dataIndx = column.dataIndx,
                    value = rowData[dataIndx],
                    objValid = this.isValidCell({
                        rowData: rowData,
                        value: value,
                        column: column,
                        rowIndx: objP.rowIndx,
                        checkEditable: checkEditable,
                        allowInvalid: allowInvalid,
                        focusInvalid: focusInvalid
                    });
                if (!objValid.valid && !objValid.warn) {
                    if (allowInvalid) {
                        cells.push({
                            rowData: rowData,
                            dataIndx: dataIndx,
                            column: column
                        })
                    } else {
                        return objValid
                    }
                }
            }
            if (allowInvalid && cells.length) {
                return {
                    cells: cells,
                    valid: false
                }
            } else {
                return {
                    valid: true
                }
            }
        } else {
            var data = objP.data ? objP.data : that.options.dataModel.data,
                cells = [];
            if (!data) {
                return null
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var rowData = data[i],
                    rowIndx;
                if (checkEditable) {
                    rowIndx = this.getRowIndx({
                        rowData: rowData
                    }).rowIndx;
                    if (rowIndx == null || that.isEditableRow({
                            rowData: rowData,
                            rowIndx: rowIndx
                        }) == false) {
                        continue
                    }
                }
                var objRet = this.isValid({
                    rowData: rowData,
                    rowIndx: rowIndx,
                    checkEditable: checkEditable,
                    allowInvalid: allowInvalid,
                    focusInvalid: focusInvalid
                });
                var objRet_cells = objRet.cells;
                if (allowInvalid === false) {
                    if (!objRet.valid) {
                        return objRet
                    }
                } else if (objRet_cells && objRet_cells.length) {
                    cells = cells.concat(objRet_cells)
                }
            }
            if (allowInvalid && cells.length) {
                return {
                    cells: cells,
                    valid: false
                }
            } else {
                return {
                    valid: true
                }
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var fnPG = {};
    fnPG.options = {
        bootstrap: {
            on: false,
            pager: "",
            nextIcon: "glyphicon glyphicon-forward",
            prevIcon: "glyphicon glyphicon-backward",
            firstIcon: "glyphicon glyphicon-step-backward",
            lastIcon: "glyphicon glyphicon-step-forward",
            refreshIcon: "glyphicon glyphicon-refresh"
        },
        curPage: 0,
        totalPages: 0,
        totalRecords: 0,
        msg: "",
        rPPOptions: [10, 20, 30, 40, 50, 100],
        rPP: 20
    };
    fnPG._regional = {
        strDisplay: "Displaying {0} to {1} of {2} items.",
        strFirstPage: "First Page",
        strLastPage: "Last Page",
        strNextPage: "Next Page",
        strPage: "Page {0} of {1}",
        strPrevPage: "Previous Page",
        strRefresh: "Refresh",
        strRpp: "Records per page:{0}"
    };
    $.extend(fnPG.options, fnPG._regional);

    function createButton(bootstrap, str, icon) {
        if (bootstrap) {
            return $("<span tabindex='0' rel='tooltip' data-placement='top' title='" + str + "' class='btn btn-xs " + icon + "'></span>")
        } else {
            return $("<span class='pq-ui-button ui-widget-header' tabindex='0' rel='tooltip' title='" + str + "'>" + "<span class='ui-icon ui-icon-" + icon + "'></span></span>")
        }
    }

    function bind($ele, fn) {
        $ele.bind("click keydown", function(evt) {
            if (evt.type == "keydown" && evt.keyCode != $.ui.keyCode.ENTER) {
                return
            }
            return fn.call(this, evt)
        })
    }
    fnPG._create = function() {
        var that = this,
            options = this.options,
            $ele = this.element,
            bootstrap = options.bootstrap,
            btp_on = bootstrap.on;
        this.listeners = {};
        $ele.addClass("pq-pager " + (btp_on ? bootstrap.pager : ""));
        this.first = createButton(btp_on, options.strFirstPage, btp_on ? bootstrap.firstIcon : "seek-first").appendTo($ele);
        bind(this.first, function(evt) {
            if (options.curPage > 1) {
                that._onChange(evt, 1)
            }
        });
        this.prev = createButton(btp_on, options.strPrevPage, btp_on ? bootstrap.prevIcon : "seek-prev").appendTo($ele);
        bind(this.prev, function(evt) {
            if (options.curPage > 1) {
                var curPage = options.curPage - 1;
                that._onChange(evt, curPage)
            }
        });
        $("<span class='pq-separator'></span>").appendTo($ele);
        this.pageHolder = $("<span class='pq-page-placeholder'></span>").appendTo($ele);
        $("<span class='pq-separator'></span>").appendTo($ele);
        this.next = createButton(btp_on, options.strNextPage, btp_on ? bootstrap.nextIcon : "seek-next").appendTo($ele);
        bind(this.next, function(evt) {
            if (options.curPage < options.totalPages) {
                var val = options.curPage + 1;
                that._onChange(evt, val)
            }
        });
        this.last = createButton(btp_on, options.strLastPage, btp_on ? bootstrap.lastIcon : "seek-end").appendTo($ele);
        bind(this.last, function(evt) {
            if (options.curPage !== options.totalPages) {
                var val = options.totalPages;
                that._onChange(evt, val)
            }
        });
        $("<span class='pq-separator'></span>").appendTo($ele);
        this.rPPHolder = $("<span class='pq-page-placeholder'></span>").appendTo($ele);
        this.$refresh = createButton(btp_on, options.strRefresh, btp_on ? bootstrap.refreshIcon : "refresh").appendTo($ele);
        bind(this.$refresh, function(evt) {
            if (that._trigger("beforeRefresh", evt) === false) {
                return false
            }
            that._trigger("refresh", evt)
        });
        $("<span class='pq-separator'></span>").appendTo($ele);
        this.$msg = $("<span class='pq-pager-msg'></span>").appendTo($ele);
        this._refresh()
    };

    function setDisable(bts_on, $btn, disabled) {
        $btn[disabled ? "addClass" : "removeClass"]("disabled").css("pointer-events", disabled ? "none" : "").attr("tabindex", disabled ? "" : "0")
    }
    fnPG._destroy = function() {
        this.element.empty().removeClass("pq-pager").enableSelection()
    };
    fnPG._setOption = function(key, value) {
        if (key == "curPage" || key == "totalPages") {
            value = value * 1
        }
        this._super(key, value)
    };
    fnPG._setOptions = function(options) {
        var key, refresh = false,
            o = this.options;
        for (key in options) {
            var value = options[key],
                type = typeof value;
            if (type == "string" || type == "number") {
                if (value != o[key]) {
                    this._setOption(key, value);
                    refresh = true
                }
            } else if (typeof value.splice == "function" || $.isPlainObject(value)) {
                if (JSON.stringify(value) != JSON.stringify(o[key])) {
                    this._setOption(key, value);
                    refresh = true
                }
            } else {
                if (value != o[key]) {
                    this._setOption(key, value);
                    refresh = true
                }
            }
        }
        if (refresh) {
            this._refresh()
        }
        return this
    };
    $.widget("paramquery.pqPager", fnPG);
    pq.pager = function(selector, options) {
        var $p = $(selector).pqPager(options),
            p = $p.data("paramqueryPqPager") || $p.data("paramquery-pqPager");
        return p
    };
    var _pq = $.paramquery;
    _pq.pqPager.regional = {};
    _pq.pqPager.regional["en"] = fnPG._regional;
    fnPG = _pq.pqPager.prototype;
    _pq.pqPager.defaults = fnPG.options;
    fnPG._refreshPage = function() {
        var that = this;
        this.pageHolder.empty();
        var options = this.options,
            bts = options.bootstrap,
            strPage = options.strPage,
            arr = strPage.split(" "),
            str = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var ele = arr[i];
            if (ele == "{0}") {
                str.push("<input type='text' tabindex='0' class='pq-pager-input ", bts.on ? "" : "ui-corner-all", "' />")
            } else if (ele == "{1}") {
                str.push("<span class='total'></span>")
            } else {
                str.push("<span>", ele, "</span>")
            }
        }
        var str2 = str.join("");
        var $temp = $(str2).appendTo(this.pageHolder);
        this.page = $temp.filter("input").bind("keydown", function(evt) {
            if (evt.keyCode === $.ui.keyCode.ENTER) {
                $(this).trigger("change")
            }
        }).bind("change", function(evt) {
            var $this = $(this),
                val = $this.val();
            if (isNaN(val) || val < 1) {
                $this.val(options.curPage);
                return false
            }
            val = parseInt(val);
            if (val === options.curPage) {
                return
            }
            if (val > options.totalPages) {
                $this.val(options.curPage);
                return false
            }
            if (that._onChange(evt, val) === false) {
                $this.val(options.curPage);
                return false
            }
        });
        this.$total = $temp.filter("span.total")
    };
    fnPG._onChange = function(evt, val) {
        if (this._trigger("beforeChange", evt, {
                curPage: val
            }) === false) {
            return false
        }
        if (this._trigger("change", evt, {
                curPage: val
            }) === false) {
            return false
        } else {
            this.option({
                curPage: val
            })
        }
    };
    fnPG._refresh = function() {
        this._refreshPage();
        var $rPP = this.$rPP,
            that = this,
            options = this.options,
            bts = options.bootstrap;
        this.rPPHolder.empty();
        if (options.strRpp) {
            var opts = options.rPPOptions,
                strRpp = options.strRpp;
            if (strRpp.indexOf("{0}") != -1) {
                var selectArr = ["<select class='", bts.on ? "" : "ui-corner-all", "'>"];
                for (var i = 0, len = opts.length; i < len; i++) {
                    var opt = opts[i];
                    selectArr.push('<option value="', opt, '">', opt, "</option>")
                }
                selectArr.push("</select>");
                var selectStr = selectArr.join("");
                strRpp = strRpp.replace("{0}", "</span>" + selectStr);
                strRpp = "<span>" + strRpp + "<span class='pq-separator'></span>"
            } else {
                strRpp = "<span>" + strRpp + "</span><span class='pq-separator'></span>"
            }
            this.$rPP = $(strRpp).appendTo(this.rPPHolder).filter("select").val(options.rPP).change(function(evt) {
                var $select = $(this),
                    val = $select.val();
                if (that._trigger("beforeChange", evt, {
                        rPP: val
                    }) === false) {
                    $select.val(that.options.rPP);
                    return false
                }
                if (that._trigger("change", evt, {
                        rPP: val
                    }) !== false) {
                    that.options.rPP = val
                }
            })
        }
        var bts_on = options.bootstrap.on;
        var isDisabled = options.curPage >= options.totalPages;
        setDisable(bts_on, this.next, isDisabled);
        setDisable(bts_on, this.last, isDisabled);
        var isDisabled = options.curPage <= 1;
        setDisable(bts_on, this.first, isDisabled);
        setDisable(bts_on, this.prev, isDisabled);
        this.page.val(options.curPage);
        this.$total.text(options.totalPages);
        if (this.options.totalRecords > 0) {
            var rPP = options.rPP,
                curPage = options.curPage,
                totalRecords = options.totalRecords,
                begIndx = (curPage - 1) * rPP,
                endIndx = curPage * rPP;
            if (endIndx > totalRecords) {
                endIndx = totalRecords
            }
            var strDisplay = options.strDisplay;
            strDisplay = strDisplay.replace("{0}", begIndx + 1);
            strDisplay = strDisplay.replace("{1}", endIndx);
            strDisplay = strDisplay.replace("{2}", totalRecords);
            this.$msg.html(strDisplay)
        } else {
            this.$msg.html("")
        }
    };
    fnPG.getInstance = function() {
        return {
            pager: this
        }
    };
    fnPG._trigger = _pq._trigger;
    fnPG.on = _pq.on;
    fnPG.one = _pq.one;
    fnPG.off = _pq.off
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    var fnSB = {};
    fnSB.options = {
        length: 200,
        num_eles: 3,
        trigger: false,
        cur_pos: 0,
        ratio: 0,
        timeout: 350,
        pace: "optimum",
        direction: "vertical",
        vertical_gap: 0, // 17
        holizontal_gap: 0, // 17
        bootstrap: {
            on: false,
            slider: "btn btn-default",
            up: "glyphicon glyphicon-chevron-up",
            down: "glyphicon glyphicon-chevron-down",
            left: "glyphicon glyphicon-chevron-left",
            right: "glyphicon glyphicon-chevron-right"
        },
        theme: false
    };
    fnSB._destroy = function() {
        $(document).off("." + this.eventNamespace);
        this.element.removeClass("pq-sb pq-sb-vert pq-sb-vert-t pq-sb-vert-wt").enableSelection().removeClass("pq-sb-horiz pq-sb-horiz-t pq-sb-horiz-wt").unbind("click.pq-scrollbar").empty();
        this.element.removeData()
    };
    fnSB._create = function() {
        this.listeners = {};
        this._createLayout()
    };
    fnSB._setOption = function(key, value) {
        var options = this.options;
        if (key == "disabled") {
            this._super(key, value);
            if (value == true) {
                this.$slider.draggable("disable")
            } else {
                this.$slider.draggable("enable")
            }
        } else if (key == "theme") {
            options[key] = value;
            this._createLayout()
        } else if (key == "ratio") {
            if (value >= 0 && value <= 1) {
                options[key] = value
            } else {}
        } else {
            options[key] = value
        }
    };
    fnSB._setOptions = function() {
        this._super.apply(this, arguments);
        this.refresh()
    };
    $.widget("paramquery.pqScrollBar", fnSB);
    pq.scrollbar = function(selector, options) {
        var $s = $(selector).pqScrollBar(options),
            s = $s.data("paramqueryPqScrollBar") || $s.data("paramquery-pqScrollBar");
        return s
    };
    var fnSB = _pq.pqScrollBar.prototype;
    _pq.pqScrollBar.defaults = fnSB.options;

    function createButton(bts_on, icon) {
        return bts_on ? "<div class='" + icon + "'></div>" : "<div class='ui-icon ui-icon-" + icon + "'></div>"
    }
    fnSB._createLayout = function() {
        var that = this,
            options = this.options,
            bts = options.bootstrap,
            bts_on = bts.on,
            direction = options.direction,
            eventNamespace = this.eventNamespace,
            theme = options.theme;
        var ele = this.element.empty();
        if (direction == "vertical") {
            ele.removeClass("pq-sb-vert-t pq-sb-vert-wt").addClass("pq-sb pq-sb-vert");
            if (theme) {
                ele.addClass("pq-sb-vert-t");
                ele[0].innerHTML = ["<div class='top-btn pq-sb-btn ", bts_on ? "" : "ui-state-default ui-corner-top", "'>", createButton(bts_on, bts_on ? bts.up : "triangle-1-n"), "</div>", "<div class='pq-sb-slider ", bts_on ? bts.slider : "ui-corner-all ui-state-default", "'>", "</div>", "<div class='bottom-btn pq-sb-btn ", bts_on ? "" : "ui-state-default ui-corner-bottom", "'>", createButton(bts_on, bts_on ? bts.down : "triangle-1-s"), "</div>"].join("")
            } else {
                ele.addClass("pq-sb-vert-wt");
                ele[0].innerHTML = ["<div class='top-btn pq-sb-btn'></div>", "<div class='pq-sb-slider'>", "<div class='vert-slider-top'></div>", "<div class='vert-slider-bg'></div>", "<div class='vert-slider-center'></div>", "<div class='vert-slider-bg'></div>", "<div class='vert-slider-bottom'></div>", "</div>", "<div class='bottom-btn pq-sb-btn'></div>"].join("")
            }
        } else {
            ele.removeClass("pq-sb-horiz-t pq-sb-horiz-wt").addClass("pq-sb pq-sb-horiz");
            if (theme) {
                ele.addClass("pq-sb-horiz-t");
                ele[0].innerHTML = ["<div class='left-btn pq-sb-btn ", bts_on ? "" : "ui-state-default ui-corner-left", "'>", createButton(bts_on, bts_on ? bts.left : "triangle-1-w"), "</div>", "<div class='pq-sb-slider pq-sb-slider-h ", bts_on ? bts.slider : "ui-state-default ui-corner-all", "'>", "</div>", "<div class='right-btn pq-sb-btn ", bts_on ? "" : "ui-state-default ui-corner-right", "'>", createButton(bts_on, bts_on ? bts.right : "triangle-1-e"), "</div>"].join("")
            } else {
                ele.addClass("pq-sb-horiz-wt");
                ele.width(this.width);
                ele[0].innerHTML = ["<div class='left-btn pq-sb-btn'></div>", "<div class='pq-sb-slider pq-sb-slider-h'>", "<span class='horiz-slider-left'></span>", "<span class='horiz-slider-bg'></span>", "<span class='horiz-slider-center'></span>", "<span class='horiz-slider-bg'></span>", "<span class='horiz-slider-right'></span>", "</div>", "<div class='right-btn pq-sb-btn'></div>"].join("")
            }
        }
        ele.disableSelection().unbind(".pq-scrollbar").on("mousedown.pq-scrollbar", function(evt) {
            if (options.disabled) {
                return
            }
            if (that.$slider.is(":hidden")) {
                return
            }
            $(document).off("." + eventNamespace).on("mouseup." + eventNamespace, function(evt) {
                that._mouseup(evt)
            });
            if (direction == "vertical") {
                var clickY = evt.pageY,
                    top_this = that.element.offset().top,
                    bottom_this = top_this + options.length,
                    $slider = that.$slider,
                    topSlider = $slider.offset().top,
                    heightSlider = $slider.height(),
                    o = options,
                    botSlider = topSlider + heightSlider;
                if (clickY < topSlider && clickY > top_this + o.vertical_gap) { // REPLACE 17 to o.vertical_gap
                    that._setTimerPageLeft(clickY, heightSlider, evt, 0)
                } else if (clickY > botSlider && clickY < bottom_this - o.vertical_gap) { // REPLACE 17 to o.vertical_gap
                    that._setTimerPageRight(clickY, heightSlider, evt, 0)
                    
                }
            } else {
                var clickX = evt.pageX,
                    top_this = that.element.offset().left,
                    bottom_this = top_this + options.length,
                    topSlider = that.$slider.offset().left,
                    o = options,
                    botSlider = topSlider + that.$slider.width();
                if (clickX < topSlider && clickX > top_this + o.holizontal_gap) { // REPLACE 17 to o.holizontal_gap
                    that.$slider.css("left", clickX - that.element.offset().left);
                    that._updateCurPosAndTrigger(evt)
                } else if (clickX > botSlider && clickX < bottom_this - o.holizontal_gap) { // REPLACE 17 to o.holizontal_gap
                    that.$slider.css("left", clickX - that.element.offset().left - that.$slider.width());
                    that._updateCurPosAndTrigger(evt)
                }
            }
        });
        var $slider = this.$slider = $("div.pq-sb-slider", this.element);
        this._bindSliderEvents($slider);
        this.$top_btn = $("div.top-btn,div.left-btn", this.element).click(function(evt) {
            if (that.options.disabled) {
                return
            }
            that.decr_cur_pos(evt);
            return false
        }).mousedown(function(evt) {
            if (that.options.disabled) {
                return
            }
            that.mousedownTimeout = setTimeout(function() {
                that.mousedownInterval = setInterval(function() {
                    that.decr_cur_pos(evt)
                }, 0)
            }, that.options.timeout);
            return false
        }).bind("mouseup mouseout", function(evt) {
            that._mouseup(evt)
        });
        this.$bottom_btn = $("div.bottom-btn,div.right-btn", this.element).click(function(evt) {
            if (that.options.disabled) {
                return
            }
            that.incr_cur_pos(evt);
            return false
        }).mousedown(function(evt) {
            if (that.options.disabled) {
                return
            }
            that.mousedownTimeout = setTimeout(function() {
                that.mousedownInterval = setInterval(function() {
                    that.incr_cur_pos(evt)
                }, 0)
            }, that.options.timeout);
            return false
        }).bind("mouseup mouseout", function(evt) {
            that._mouseup(evt)
        });
        this.refresh()
    };
    var counter = 0;
    fnSB._setTimerPageLeft = function(clickY, heightSlider, evt, interval) {
        var that = this,
            o = that.options;
        this.mousedownTimeout = window.setTimeout(function() {
            if (clickY >= that.$slider.offset().top) {
                that._mouseup()
            } else {
                that._pageLeft(evt);
                var intt = counter ? 0 : o.timeout;
                counter++;
                that._setTimerPageLeft(clickY, heightSlider, evt, intt)
            }
        }, interval)
    };
    fnSB._setTimerPageRight = function(clickY, heightSlider, evt, interval) {
        var that = this;
        this.mousedownTimeout = window.setTimeout(function() {
            if (clickY <= that.$slider.offset().top + heightSlider) {
                that._mouseup()
            } else {
                that._pageRight(evt);
                var intt = counter ? 0 : that.options.timeout;
                counter++;
                that._setTimerPageRight(clickY, heightSlider, evt, intt)
            }
        }, interval)
    };
    fnSB._bindSliderEvents = function($slider) {
        var that = this,
            direction = this.options.direction,
            axis = "x";
        if (direction == "vertical") {
            axis = "y"
        }
        $slider.draggable({
            axis: axis,
            helper: function(evt, ui) {
                that._setDragLimits();
                return this
            },
            start: function(evt) {
                that.topWhileDrag = null;
                that.dragging = true
            },
            drag: function(evt) {
                that.dragging = true;
                var pace = that.options.pace;
                if (pace == "optimum") {
                    that._setNormalPace(evt)
                } else if (pace == "fast") {
                    that._updateCurPosAndTrigger(evt)
                }
            },
            stop: function(evt) {
                if (that.options.pace != "fast") {
                    that._updateCurPosAndTrigger(evt)
                }
                that.dragging = false;
                that.refresh()
            }
        }).on("keydown.pq-scrollbar", function(evt) {
            var keyCode = evt.keyCode,
                o = that.options,
                cur_pos = o.cur_pos,
                ratio = o.ratio,
                num_eles = o.num_eles,
                KC = $.ui.keyCode;
            if (that.keydownTimeout == null) {
                that.keydownTimeout = window.setTimeout(function() {
                    if (keyCode == KC.DOWN || keyCode == KC.RIGHT) {
                        that.incr_cur_pos(evt)
                    } else if (keyCode == KC.UP || keyCode == KC.LEFT) {
                        that.decr_cur_pos(evt)
                    } else if (keyCode == KC.HOME) {
                        if (o.steps) {
                            if (cur_pos > 0) {
                                o.cur_pos = 0;
                                that.updateSliderPos();
                                that.scroll(evt)
                            }
                        } else {
                            if (ratio > 0) {
                                o.ratio = 0;
                                that.updateSliderPos();
                                that.drag(evt)
                            }
                        }
                    } else if (keyCode == KC.END) {
                        if (o.steps) {
                            if (cur_pos < num_eles) {
                                o.cur_pos = num_eles;
                                that.updateSliderPos();
                                that.scroll(evt)
                            }
                        } else {
                            if (ratio < 1) {
                                o.ratio = 1;
                                that.updateSliderPos();
                                that.drag(evt)
                            }
                        }
                    } else if (o.direction == "vertical") {
                        if (keyCode == KC.PAGE_DOWN) {
                            that._pageRight(evt)
                        } else if (keyCode == KC.PAGE_UP) {
                            that._pageLeft(evt)
                        }
                    }
                    that.keydownTimeout = null
                }, 0)
            }
            if (keyCode == KC.DOWN || keyCode == KC.RIGHT || keyCode == KC.UP || keyCode == KC.LEFT || keyCode == KC.PAGE_DOWN || keyCode == KC.PAGE_UP || keyCode == KC.HOME || keyCode == KC.END) {
                evt.preventDefault();
                return false
            }
        })
    };
    fnSB.decr_cur_pos = function(evt) {
        var that = this,
            o = that.options,
            steps = o.steps;
        if (steps) {
            if (o.cur_pos > 0) {
                o.cur_pos--;
                that.updateSliderPos();
                that.scroll(evt)
            }
        } else {
            if (o.ratio > 0) {
                var ratio = o.ratio - 1 / (o.num_eles - 1);
                if (ratio < 0) {
                    ratio = 0
                }
                o.ratio = ratio;
                that.updateSliderPos();
                that.drag(evt)
            }
        }
    };
    fnSB.incr_cur_pos = function(evt) {
        var that = this,
            o = that.options,
            steps = o.steps;
        if (steps) {
            if (o.cur_pos < o.num_eles - 1) {
                o.cur_pos++
            }
            that.updateSliderPos();
            that.scroll(evt)
        } else {
            if (o.ratio < 1) {
                var ratio = o.ratio + 1 / (o.num_eles - 1);
                if (ratio > 1) {
                    ratio = 1
                }
                o.ratio = ratio
            }
            that.updateSliderPos();
            that.drag(evt)
        }
    };
    fnSB._mouseup = function(evt) {
        if (this.options.disabled) {
            return
        }
        counter = 0;
        var that = this;
        window.clearTimeout(that.mousedownTimeout);
        that.mousedownTimeout = null;
        window.clearInterval(that.mousedownInterval);
        that.mousedownInterval = null
    };
    fnSB._setDragLimits = function() {
        var o = this.options;
        if (o.direction == "vertical") {
            var top = this.element.offset().top + o.vertical_gap; // REPLACE 17 to o.vertical_gap
            var bot = top + o.length - o.vertical_gap - this.slider_length; // REPLACE 34 to o.vertical_gap
            this.$slider.draggable("option", "containment", [0, top, 0, bot])
        } else {
            top = this.element.offset().left + o.holizontal_gap; // REPLACE 17 to o.holizontal_gap
            bot = top + o.length - o.holizontal_gap - this.slider_length; // REPLACE 34 to o.holizontal_gap
            this.$slider.draggable("option", "containment", [top, 0, bot, 0])
        }
    };
    fnSB._validateCurPos = function() {
        var o = this.options;
        if (o.cur_pos >= o.num_eles) {
            o.cur_pos = o.num_eles - 1
        }
        if (o.cur_pos < 0) {
            o.cur_pos = 0
        }
    };
    fnSB._updateSliderPosRatio = function() {
        var that = this,
            o = this.options,
            direction = o.direction,
            ratio = o.ratio,
            slider = that.$slider[0],
            scroll_space = o.length - this.slider_length; // DELETE -34
        if (ratio == null) {
            throw "updateSliderPosRatio ratio N/A"
        }
        if (direction == "vertical") {
            scroll_space -= o.vertical_gap; // REPLACE 34 to o.vertical_gap
            var top = ratio * scroll_space;
            slider.style.top = top + o.vertical_gap + "px"
        } else {
            scroll_space -= o.holizontal_gap; // REPLACE 34 to o.holizontal_gap
            var left = ratio * scroll_space;
            slider.style.left = left + o.holizontal_gap + "px"
        }
    };
    fnSB._updateSliderPosCurPos = function() {
        var o = this.options,
            slider = this.$slider[0];
        var sT = this.scroll_space * o.cur_pos / (o.num_eles - 1);
        if (o.direction == "vertical") {
            slider.style.top = o.vertical_gap + sT + "px" // REPLACE 17 to o.vertical_gap
        } else {
            slider.style.left = o.holizontal_gap + sT + "px" // REPLACE 17 to o.holizontal_gap
        }
    };
    fnSB.updateSliderPos = function() {
        var o = this.options;
        if (o.steps === undefined) {
            throw "updateSliderPos. steps N/A"
        }
        if (o.steps) {
            this._updateSliderPosCurPos()
        } else {
            this._updateSliderPosRatio()
        }
    };
    fnSB.scroll = function(evt) {
        var o = this.options;
        this._trigger("scroll", evt, {
            cur_pos: o.cur_pos,
            num_eles: o.num_eles
        })
    };
    fnSB.drag = function(evt) {
        var that = this,
            o = that.options;
        this._trigger("drag", evt, {
            ratio: o.ratio
        })
    };
    fnSB._pageRight = function(evt) {
        this._trigger("pageRight", evt, null)
    };
    fnSB._pageLeft = function(evt) {
        this._trigger("pageLeft", evt, null)
    };
    fnSB._setSliderBgLength = function() {
        var o = this.options,
            theme = o.theme,
            $slider = this.$slider,
            outerHeight = o.length,
            innerHeight = o.num_eles * 40 + outerHeight,
            avail_space = outerHeight - o.vertical_gap, // REPLACE 34 to o.vertical_gap
            slider_height = avail_space * outerHeight / innerHeight,
            slider_bg_ht = Math.round((slider_height - (8 + 3 + 3)) / 2);
        if (slider_bg_ht < 1) {
            slider_bg_ht = 1
        }
        var slider_length = 8 + 3 + 3 + 2 * slider_bg_ht;
        this.scroll_space = o.length - o.vertical_gap - slider_length; // REPLACE 34 to o.vertical_gap
        if (slider_length !== this.slider_length) {
            this.slider_length = slider_length;
            var obj = o.direction === "vertical" ? {
                dim: "height",
                cls: ".vert-slider-bg"
            } : {
                dim: "width",
                cls: ".horiz-slider-bg"
            };
            if (theme) {
                $slider[obj.dim](slider_length - 2)
            } else {
                $(obj.cls, this.element)[obj.dim](slider_bg_ht);
                $slider[obj.dim](slider_length)
            }
        }
    };
    fnSB._updateCurPosAndTrigger = function(evt, top) {
        var that = this,
            o = this.options,
            direction = o.direction,
            $slider = that.$slider;
        if (top == null) {
            top = parseInt($slider[0].style[direction === "vertical" ? "top" : "left"])
        }
        var scroll_space = o.length - o.vertical_gap - this.slider_length; // REPLACE 34 to o.vertical_gap
        var ratio = (top - o.vertical_gap) / scroll_space; // REPLACE 17 to o.vertical_gap
        if (o.steps) {
            var cur_pos = ratio * (o.num_eles - 1);
            cur_pos = Math.round(cur_pos);
            if (o.cur_pos != cur_pos) {
                if (this.dragging) {
                    if (this.topWhileDrag != null) {
                        if (this.topWhileDrag < top && o.cur_pos > cur_pos) {
                            return
                        } else if (this.topWhileDrag > top && o.cur_pos < cur_pos) {
                            return
                        }
                    }
                    this.topWhileDrag = top
                }
                that.options.cur_pos = cur_pos;
                this.scroll(evt)
            }
        } else {
            o.ratio = ratio;
            this.drag(evt)
        }
    };
    fnSB._setNormalPace = function(evt) {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null
        }
        var that = this,
            o = this.options,
            direction = o.direction;
        that.timer = window.setInterval(function() {
            var $slider = that.$slider;
            var top = parseInt($slider[0].style[direction === "vertical" ? "top" : "left"]);
            if (that.prev_top === top) {
                that._updateCurPosAndTrigger(evt, top);
                window.clearInterval(that.timer);
                that.timer = null
            }
            that.prev_top = top
        }, 20)
    };
    fnSB.refresh = function() {
        var o = this.options,
            slider = this.$slider[0],
            $sb = this.element;
        if (o.num_eles <= 1) {
            $sb[0].style.display = "none";
            return
        } else {
            $sb[0].style.display = ""
        }
        this._validateCurPos();
        if (!this.dragging) {
            $sb[o.direction === "vertical" ? "height" : "width"](o.length);
            this._setSliderBgLength();
            if (this.scroll_space < 4 || o.num_eles <= 1) {
                slider.style.display = "none"
            } else {
                slider.style.display = ""
            }
        }
        this.updateSliderPos()
    };
    fnSB._trigger = _pq._trigger;
    fnSB.on = _pq.on;
    fnSB.one = _pq.one;
    fnSB.off = _pq.off
})(jQuery);
(function($) {
    "use strict";
    var cClass = function() {};
    cClass.prototype = {
        belongs: function(evt) {
            if (evt.target == this.that.element[0]) {
                return true
            }
        },
        setTimer: function(fn, interval) {
            var self = this;
            clearTimeout(self._timeID);
            self._timeID = setTimeout(function() {
                fn()
            }, interval)
        }
    };
    var _pq = $.paramquery;
    _pq.cClass = cClass;
    var fni = {
        widgetEventPrefix: "pqgrid"
    };
    fni._create = function() {
        var that = this,
            o = this.options,
            element = this.element,
            DM = o.dataModel,
            bts = o.bootstrap,
            bts_on = bts.on,
            roundCorners = o.roundCorners && !bts_on,
            jui = o.ui,
            SM = o.sortModel;
        $(document).triggerHandler("pqGrid:bootup", {
            instance: this
        });
        this.BS_on = bts_on;
        if (!o.collapsible) {
            o.collapsible = {
                on: false,
                collapsed: false
            }
        }
        if (o.flexHeight) {
            o.height = "flex"
        }
        if (o.flexWidth) {
            o.width = "flex"
        }
        if (DM.sortIndx) {
            SM.on = o.sortable;
            SM.type = DM.sorting;
            var sorter = [],
                sortIndx = DM.sortIndx,
                sortDir = DM.sortDir;
            if ($.isArray(sortIndx)) {
                for (var i = 0; i < sortIndx.length; i++) {
                    var dir = sortDir && sortDir[i] ? sortDir[i] : "up";
                    sorter.push({
                        dataIndx: sortIndx[i],
                        dir: dir
                    })
                }
                SM.single = false
            } else {
                var dir = sortDir ? sortDir : "up";
                sorter.push({
                    dataIndx: sortIndx,
                    dir: dir
                });
                SM.single = true
            }
            SM.sorter = sorter
        }
        if (o.virtualXHeader === false) {
            o.virtualXHeader = null
        }
        this.iGenerateView = new _pq.cGenerateView(this);
        this.iRefresh = new _pq.cRefresh(this);
        this.iKeyNav = new _pq.cKeyNav(this);
        this.iValid = new _pq.cValid(this);
        this.tables = [];
        this.$tbl = null;
        this.iColModel = new _pq.cColModel(this);
        this.iSort = new _pq.cSort(this);
        this.iHeader = new _pq.cHeader(this);
        this._initTypeColumns();
        element.on("scroll" + this.eventNamespace, function() {
            this.scrollLeft = 0;
            this.scrollTop = 0
        });
        var jui_grid = bts_on ? bts.grid : jui.grid,
            jui_header_o = bts_on ? "" : jui.header_o,
            jui_bottom = bts_on ? "" : jui.bottom,
            jui_top = bts_on ? bts.top : jui.top;
        element.empty().addClass("pq-grid " + jui_grid + " " + (roundCorners ? " ui-corner-all" : "")).html(["<div class='pq-grid-top ", jui_top, " ", roundCorners ? " ui-corner-top" : "", "'>", "<div class='pq-grid-title", roundCorners ? " ui-corner-top" : "", "'>&nbsp;</div>", "</div>", "<div class='pq-grid-center' >", "<div class='pq-header-outer ", jui_header_o, "'>", "</div>", "<div class='pq-grid-cont-outer' >", "<div class='pq-grid-cont'></div>", "</div>", "</div>", "<div class='pq-grid-bottom ", jui_bottom, " ", roundCorners ? " ui-corner-bottom" : "", "'>", "<div class='pq-grid-footer'></div>", "</div>"].join(""));
        this.$bottom = $("div.pq-grid-bottom", element);
        this._trigger("render", null, {
            dataModel: this.options.dataModel,
            colModel: this.colModel
        });
        this.$top = $("div.pq-grid-top", element);
        if (!o.showTop) {
            this.$top.css("display", "none")
        }
        this.$title = $("div.pq-grid-title", element);
        if (!o.showTitle) {
            this.$title.css("display", "none")
        }
        var $grid_center = this.$grid_center = $("div.pq-grid-center", element).on("scroll", function() {
            this.scrollTop = 0
        });
        this.$header_o = $("div.pq-header-outer", this.$grid_center).on("scroll", function() {
            this.scrollTop = 0;
            this.scrollLeft = 0
        });
        this.$footer = $("div.pq-grid-footer", element);
        this.$cont_o = $(".pq-grid-cont-outer", $grid_center);
        var $cont = this.$cont = $("div.pq-grid-cont", $grid_center);
        $(window).bind("resize" + that.eventNamespace + " " + "orientationchange" + that.eventNamespace, function(evt, ui) {
            that.onWindowResize(evt, ui)
        });
        $cont.on("click", ".pq-grid-cell,.pq-grid-number-cell", function(evt) {
            if ($.data(evt.target, that.widgetName + ".preventClickEvent") === true) {
                return
            }
            if (that.evtBelongs(evt)) {
                return that._onClickCell(evt)
            }
        });
        $cont.on("click", "tr.pq-grid-row", function(evt) {
            if ($.data(evt.target, that.widgetName + ".preventClickEvent") === true) {
                return
            }
            if (that.evtBelongs(evt)) {
                return that._onClickRow(evt)
            }
        }).on("contextmenu", "td.pq-grid-cell", function(evt) {
            if (that.evtBelongs(evt)) {
                return that._onRightClickCell(evt)
            }
        }).on("contextmenu", "tr.pq-grid-row", function(evt) {
            if (that.evtBelongs(evt)) {
                return that._onRightClickRow(evt)
            }
        }).on("dblclick", "td.pq-grid-cell", function(evt) {
            if (that.evtBelongs(evt)) {
                return that._onDblClickCell(evt)
            }
        }).on("dblclick", "tr.pq-grid-row", function(evt) {
            if (that.evtBelongs(evt)) {
                return that._onDblClickRow(evt)
            }
        });
        $cont.on("blur", function() {
            that.onblur()
        }).on("focus", function(evt) {
            that.onfocus(evt)
        }).on("focusout", function(evt) {}).on("focusin", function(evt) {}).on("mousedown", that._onMouseDown(that)).on("change", that._onChange(that));
        $cont.on("mouseenter", "td.pq-grid-cell", that._onCellMouseEnter(that)).on("mouseenter", "tr.pq-grid-row", that._onRowMouseEnter(that)).on("mouseleave", "td.pq-grid-cell", that._onCellMouseLeave(that)).on("mouseleave", "tr.pq-grid-row", that._onRowMouseLeave(that)).on("keyup", that._onKeyUp(that));
        $grid_center.bind("mousewheel DOMMouseScroll", that._onMouseWheel(that));
        var prevVScroll = 0;
        this.$hvscroll = $("<div class='pq-hvscroll-square ui-widget-content'></div>").appendTo($grid_center);
        var $vscroll = $("<div class='pq-vscroll'></div>").appendTo($grid_center);
        this.prevVScroll = 0;
        var scrollModel = o.scrollModel;
        if (scrollModel.lastColumn === undefined) {
            if (o.virtualX) {
                scrollModel.lastColumn = "auto"
            }
        }
        this.vscroll = pq.scrollbar($vscroll, {
            pace: scrollModel.pace,
            theme: scrollModel.theme,
            bootstrap: o.bootstrap,
            steps: o.virtualY,
            direction: "vertical",
            cur_pos: 0,
            pageRight: function() {
                that.iKeyNav.pageDown()
            },
            pageLeft: function() {
                that.iKeyNav.pageUp()
            },
            drag: function(evt, obj) {
                that.iMouseSelection.syncViewWithScrollBarVert(obj.ratio)
            },
            scroll: function(evt, obj) {
                that.iRefresh.refreshVscroll(obj)
            }
        });
        var $hscroll = $("<div class='pq-hscroll'></div>").appendTo($grid_center);
        if (o.height === "flex") {
            $hscroll.css("position", "relative")
        }
        this.hscroll = pq.scrollbar($hscroll, {
            direction: "horizontal",
            pace: scrollModel.pace,
            bootstrap: o.bootstrap,
            theme: scrollModel.theme,
            steps: o.virtualX,
            cur_pos: 0,
            drag: function(evt, obj) {
                that.iMouseSelection.syncViewWithScrollBarHor(obj.ratio)
            },
            scroll: function() {
                if (o.virtualX) {
                    that.refresh({
                        skipColWidths: true
                    })
                }
            }
        });
        if (!o.selectionModel["native"]) {
            this.disableSelection()
        }
        $grid_center.bind("keydown.pq-grid", that._onKeyPressDown(that));
        this._refreshTitle();
        this.iRows = new _pq.cRows(this);
        this.generateLoading();
        this._initPager();
        this._refreshResizable();
        this._refreshDraggable();
        this.iResizeColumns = new _pq.cResizeColumns(this);
        this._mouseInit()
    };
    fni._mouseDown = function(evt) {
        var that = this;
        if ($(evt.target).closest(".pq-editor-focus").length) {
            this._blurEditMode = true;
            window.setTimeout(function() {
                that._blurEditMode = false
            }, 0);
            return
        }
        this._saveDims();
        this._mousePQUpDelegate = function(event) {
            return that._mousePQUp(event)
        };
        $(document).bind("mouseup" + this.eventNamespace, this._mousePQUpDelegate);
        return this._super(evt)
    };
    fni.destroy = function() {
        this._trigger("destroy");
        this._super();
        window.clearInterval(this._refreshEditorPosTimer);
        if (this.autoResizeTimeout) {
            clearTimeout(this.autoResizeTimeout)
        }
        for (var key in this) {
            delete this[key]
        }
        this.options = undefined;
        $.fragments = {}
    };
    fni._setOption = function(key, value) {
        var options = this.options,
            DM = options.dataModel;
        if (key === "height") {
            if (value === "flex") {
                var vscroll = this.vscroll;
                if (value && vscroll && vscroll.widget().hasClass("pq-sb-vert")) {
                    if (options.virtualY) {
                        vscroll.option("cur_pos", 0)
                    } else {
                        vscroll.option("ratio", 0)
                    }
                }
                this.hscroll.widget().css("position", "relative")
            } else if (options.height === "flex") {
                this.hscroll.widget().css("position", "")
            }
            options[key] = value
        } else if (key === "width" && value == "flex") {
            options[key] = value;
            var hscroll = this.hscroll;
            if (value && hscroll && hscroll.widget().hasClass("pq-sb-horiz")) {
                if (options.virtualX) {
                    hscroll.option("cur_pos", 0)
                } else {
                    hscroll.option("ratio", 0)
                }
            }
        } else if (key == "title") {
            options[key] = value;
            this._refreshTitle()
        } else if (key == "roundCorners") {
            options[key] = value;
            if (value) {
                this.element.addClass("ui-corner-all");
                this.$top.addClass("ui-corner-top");
                this.$bottom.addClass("ui-corner-bottom")
            } else {
                this.element.removeClass("ui-corner-all");
                this.$top.removeClass("ui-corner-top");
                this.$bottom.removeClass("ui-corner-bottom")
            }
        } else if (key == "virtualX") {
            options[key] = value;
            this.hscroll.option("steps", value)
        } else if (key == "virtualY") {
            options[key] = value;
            this.vscroll.option("steps", value)
        } else if (key == "freezeCols") {
            value = parseInt(value);
            if (!isNaN(value) && value >= 0 && value <= this.colModel.length - 2) {
                options[key] = value
            }
        } else if (key == "freezeRows") {
            value = parseInt(value);
            if (!isNaN(value) && value >= 0) {
                options[key] = value
            }
        } else if (key == "resizable") {
            options[key] = value;
            this._refreshResizable()
        } else if (key == "draggable") {
            options[key] = value;
            this._refreshDraggable()
        } else if (key == "scrollModel") {
            options[key] = value
        } else if (key == "dataModel") {
            if (value.data !== DM.data) {
                if (DM.dataUF) {
                    DM.dataUF.length = 0
                }
            }
            options[key] = value
        } else if (key == "groupModel") {
            throw "use groupOption() to set groupModel options."
        } else if (key == "treeModel") {
            throw "use treeOption() to set treeModel options."
        } else if (key == "pageModel") {
            options[key] = value
        } else if (key === "selectionModel") {
            options[key] = value
        } else if (key === "colModel" || key == "columnTemplate") {
            options[key] = value;
            this.iColModel.init()
        } else if (key === "disabled") {
            this._super(key, value);
            if (value === true) {
                this._disable()
            } else {
                this._enable()
            }
        } else if (key === "numberCell") {
            options[key] = value;
            this.iRefresh.decidePanes()
        } else if (key === "strLoading") {
            options[key] = value;
            this._refreshLoadingString()
        } else if (key === "showTop") {
            options[key] = value;
            this.$top.css("display", value ? "" : "none")
        } else if (key === "showTitle") {
            options[key] = value;
            this.$title.css("display", value ? "" : "none")
        } else if (key === "showToolbar") {
            options[key] = value;
            var $tb = this._toolbar.widget();
            $tb.css("display", value ? "" : "none")
        } else if (key == "toolbar") {
            options[key] = value
        } else if (key === "collapsible") {
            options[key] = value;
            this._createCollapse()
        } else if (key === "showBottom") {
            options[key] = value;
            this.$bottom.css("display", value ? "" : "none")
        } else {
            options[key] = value
        }
        return this
    };
    fni.options = {
        cancel: "input,textarea,button,select,option,.pq-no-capture,.ui-resizable-handle",
        trigger: false,
        bootstrap: {
            on: false,
            thead: "table table-striped table-condensed table-bordered",
            tbody: "table table-condensed",
            grid: "panel panel-default",
            top: "",
            btn: "btn btn-default",
            groupModel: {
                icon: ["glyphicon-triangle-bottom", "glyphicon-triangle-right"]
            },
            header_active: "active"
        },
        ui: {
            on: true,
            grid: "ui-widget ui-widget-content",
            top: "ui-widget-header",
            bottom: "ui-widget-header",
            header_o: "ui-widget-header",
            header: "ui-state-default",
            header_active: "ui-state-active"
        },
        cls: {
            cont_inner: "pq-grid-cont-inner",
            cont_inner_b: "pq-grid-cont-inner-b"
        },
        distance: 3,
        collapsible: {
            on: true,
            toggle: true,
            collapsed: false,
            _collapsed: false,
            refreshAfterExpand: true,
            css: {
                zIndex: 1e3
            }
        },
        colModel: null,
        columnBorders: true,
        dataModel: {
            data: [],
            dataUF: [],
            cache: false,
            dataType: "JSON",
            location: "local",
            sorting: "local",
            sortDir: "up",
            method: "GET"
        },
        direction: "",
        draggable: false,
        editable: true,
        editModel: {
            cellBorderWidth: 0,
            pressToEdit: true,
            clicksToEdit: 2,
            filterKeys: true,
            keyUpDown: true,
            reInt: /^([\-]?[1-9][0-9]*|[\-]?[0-9]?)$/,
            reFloat: /^[\-]?[0-9]*\.?[0-9]*$/,
            onBlur: "validate",
            saveKey: $.ui.keyCode.ENTER,
            onSave: "nextFocus",
            onTab: "nextFocus",
            allowInvalid: false,
            invalidClass: "pq-cell-red-tr pq-has-tooltip",
            warnClass: "pq-cell-blue-tr pq-has-tooltip",
            validate: true
        },
        editor: {
            select: false,
            type: "textbox"
        },
        summaryOptions: {
            number: "avg,max,min,stdev,stdevp,sum",
            date: "count,max,min",
            string: "count"
        },
        summaryTitle: {
            avg: "Avg: {0}",
            count: "Count: {0}",
            max: "Max: {0}",
            min: "Min: {0}",
            stdev: "Stdev: {0}",
            stdevp: "Stdevp: {0}",
            sum: "Sum: {0}"
        },
        validation: {
            icon: "ui-icon-alert",
            cls: "ui-state-error",
            style: "padding:3px 10px;"
        },
        warning: {
            icon: "ui-icon-info",
            cls: "",
            style: "padding:3px 10px;"
        },
        freezeCols: 0,
        freezeRows: 0,
        freezeBorders: true,
        calcDataIndxFromColIndx: true,
        height: 400,
        hoverMode: "null",
        _maxColWidth: "99%",
        _minColWidth: 50,
        minWidth: 100,
        numberCell: {
            width: 30,
            title: "",
            resizable: true,
            minWidth: 30,
            maxWidth: 100,
            show: true
        },
        pageModel: {
            curPage: 1,
            totalPages: 0,
            rPP: 10,
            rPPOptions: [10, 20, 50, 100]
        },
        resizable: false,
        roundCorners: true,
        rowBorders: true,
        rowHeight: 25,
        scrollModel: {
            pace: "fast",
            smooth: false,
            horizontal: true,
            lastColumn: "auto",
            autoFit: false,
            theme: true
        },
        selectionModel: {
            type: "cell",
            onTab: "nextFocus",
            row: true,
            mode: "block"
        },
        swipeModel: {
            on: "touch",
            speed: 20,
            ratio: .15,
            repeat: 20
        },
        showBottom: true,
        showHeader: true,
        showTitle: true,
        showToolbar: true,
        showTop: true,
        sortable: true,
        sql: false,
        stripeRows: true,
        title: "&nbsp;",
        treeModel: null,
        virtualX: true,
        virtualY: true,
        width: "auto",
        wrap: true,
        hwrap: true
    };
    var _regional = {
        strAdd: "Add",
        strDelete: "Delete",
        strEdit: "Edit",
        strGroup_header: "Drag a column here to group by that column",
        strGroup_merge: "Merge cells",
        strGroup_fixCols: "Fix columns",
        strGroup_grandSummary: "Grand summary",
        strLoading: "Loading",
        strNoRows: ""
    };
    $.extend(true, fni.options, _regional);
    $.widget("paramquery._pqGrid", $.ui.mouse, fni);
    var fn = _pq._pqGrid.prototype;
    fn.refreshCM = function(CM) {
        if (CM) {
            this.option("colModel", CM)
        } else {
            this.iColModel.init()
        }
    };
    fn.evtBelongs = function(evt) {
        return $(evt.target).closest(".pq-grid")[0] == this.element[0]
    };
    fn.readCell = function(rowData, column, iMerge, ri, ci) {
        if (iMerge && iMerge.isRootCell(ri, ci, "o") === false) {
            return undefined
        }
        return rowData[column.dataIndx]
    };
    fn.saveCell = function(rowData, column, val) {
        var dataIndx = column.dataIndx;
        rowData[dataIndx] = val
    };
    fn._destroyResizable = function() {
        var ele = this.element,
            data = ele.data();
        if (data.resizable || data.uiResizable || data["ui-resizable"]) {
            ele.resizable("destroy")
        }
    };
    fn._disable = function() {
        if (this.$disable == null) this.$disable = $("<div class='pq-grid-disable'></div>").css("opacity", .2).appendTo(this.element)
    };
    fn._enable = function() {
        if (this.$disable) {
            this.element[0].removeChild(this.$disable[0]);
            this.$disable = null
        }
    };
    fn._destroy = function() {
        if (this.loading) {
            this.xhr.abort()
        }
        this._destroyResizable();
        this._destroyDraggable();
        this._mouseDestroy();
        this.element.off(this.eventNamespace);
        $(window).unbind(this.eventNamespace);
        $(document).unbind(this.eventNamespace);
        this.element.empty().css("height", "").css("width", "").removeClass("pq-grid ui-widget ui-widget-content ui-corner-all").removeData()
    };
    fn.addColumn = function(ui) {
        var columns = ui.columns || [ui.column],
            o = this.options,
            CM = o.colModel,
            CM2 = CM.concat(columns);
        this.refreshCM(CM2);
        this._trigger("addColumn");
        if (ui.refresh !== false) {
            this.refresh()
        }
    };
    fn.deleteColumn = function(ui) {
        var colList = ui.colList || [{
                colIndx: ui.colIndx
            }],
            history = ui.history !== false,
            o = this.options,
            CM = o.colModel;
        for (var i = colList.length - 1; i >= 0; i--) {
            var co = colList[i],
                colIndx = co.colIndx,
                column = CM.splice(colIndx, 1)[0];
            co.column = column
        }
        this.iColModel.init();
        if (history) {
            this.iHistory.increment();
            colList.type = "delete";
            this.iHistory.push({
                colList: colList
            })
        }
        this._trigger("deleteColumn", null, {
            colList: colList
        });
        if (ui.refresh !== false) {
            this.refreshView()
        }
    };
    fn._onKeyUp = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                that._trigger("keyUp", evt, null)
            }
        }
    };
    fn.onKeyPressDown = function(evt) {
        var that = this,
            $header = $(evt.target).closest(".pq-grid-header");
        if ($header.length) {
            return that._trigger("headerKeyDown", evt, null)
        } else {
            if (that.iKeyNav.bodyKeyPressDown(evt) === false) {
                return
            }
            if (that._trigger("keyDown", evt, null) == false) {
                return
            }
        }
    };
    fn._onKeyPressDown = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                that.onKeyPressDown(evt, that)
            }
        }
    };
    fn.collapse = function(objP) {
        var that = this,
            ele = this.element,
            o = this.options,
            CP = o.collapsible,
            $icon = CP.$collapse.children("span"),
            postCollapse = function() {
                ele.css("overflow", "hidden");
                $icon.addClass("ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-n");
                if (ele.hasClass("ui-resizable")) {
                    ele.resizable("destroy")
                }
                if (that._toolbar) that._toolbar.disable();
                CP.collapsed = true;
                CP._collapsed = true;
                CP.animating = false;
                that._trigger("collapse")
            };
        objP = objP ? objP : {};
        if (CP._collapsed) {
            return false
        }
        CP.htCapture = ele.height();
        if (objP.animate === false) {
            ele.height(23);
            postCollapse()
        } else {
            CP.animating = true;
            ele.animate({
                height: "23px"
            }, function() {
                postCollapse()
            })
        }
    };
    fn.expand = function(objP) {
        var that = this,
            ele = this.element,
            o = this.options,
            CP = o.collapsible,
            htCapture = CP.htCapture,
            $icon = CP.$collapse.children("span"),
            postExpand = function() {
                ele.css("overflow", "");
                CP._collapsed = false;
                CP.collapsed = false;
                that._refreshResizable();
                if (CP.refreshAfterExpand) {
                    that.refresh()
                }
                $icon.addClass("ui-icon-circle-triangle-n").removeClass("ui-icon-circle-triangle-s");
                if (that._toolbar) that._toolbar.enable();
                CP.animating = false;
                that._trigger("expand")
            };
        objP = objP ? objP : {};
        if (CP._collapsed === false) {
            return false
        }
        if (objP.animate === false) {
            ele.height(htCapture);
            postExpand()
        } else {
            CP.animating = true;
            ele.animate({
                height: htCapture
            }, function() {
                postExpand()
            })
        }
    };

    function createButton(icon) {
        return "<span class='btn btn-xs glyphicon glyphicon-" + icon + "' ></span>"
    }

    function createUIButton(icon) {
        return "<span class='ui-widget-header pq-ui-button'><span class='ui-icon ui-icon-" + icon + "'></span></span>"
    }
    fn._createCollapse = function() {
        var that = this,
            $top = this.$top,
            o = this.options,
            BS_on = this.BS_on,
            CP = o.collapsible;
        if (!CP.$stripe) {
            var $stripe = $(["<div class='pq-slider-icon pq-no-capture'  >", "</div>"].join("")).appendTo($top);
            CP.$stripe = $stripe
        }
        if (CP.on) {
            if (!CP.$collapse) {
                CP.$collapse = $(BS_on ? createButton("collapse-down") : createUIButton("circle-triangle-n")).appendTo(CP.$stripe).click(function(evt) {
                    if (CP.collapsed) {
                        that.expand()
                    } else {
                        that.collapse()
                    }
                })
            }
        } else if (CP.$collapse) {
            CP.$collapse.remove();
            delete CP.$collapse
        }
        if (CP.collapsed && !CP._collapsed) {
            that.collapse({
                animate: false
            })
        } else if (!CP.collapsed && CP._collapsed) {
            that.expand({
                animate: false
            })
        }
        if (CP.toggle) {
            if (!CP.$toggle) {
                CP.$toggle = $(BS_on ? createButton("fullscreen") : createUIButton("arrow-4-diag")).prependTo(CP.$stripe).click(function(evt) {
                    that.toggle()
                })
            }
        } else if (CP.$toggle) {
            CP.$toggle.remove();
            delete CP.$toggle
        }
    };
    fn.toggle = function() {
        var o = this.options,
            CP = o.collapsible,
            $grid = this.element,
            state, maxim = this._maxim,
            state = maxim ? "min" : "max",
            $doc = $(document.body);
        if (this._trigger("beforeToggle", null, {
                state: state
            }) === false) {
            return false
        }
        if (state == "min") {
            var eleObj = maxim.eleObj,
                docObj = maxim.docObj;
            this.option({
                height: eleObj.height,
                width: eleObj.width,
                maxHeight: eleObj.maxHeight,
                maxWidth: eleObj.maxWidth
            });
            $grid[0].style.cssText = eleObj.cssText;
            $doc[0].style.cssText = docObj.cssText;
            $("html").css({
                overflow: "visible"
            });
            window.scrollTo(docObj.scrollLeft, docObj.scrollTop);
            this._maxim = null
        } else {
            var eleObj = {
                height: o.height,
                width: o.width,
                cssText: $grid[0].style.cssText,
                maxHeight: o.maxHeight,
                maxWidth: o.maxWidth
            };
            this.option({
                height: "100%",
                width: "100%",
                maxHeight: null,
                maxWidth: null
            });
            $grid.css($.extend({
                position: "fixed",
                left: 0,
                top: 0,
                margin: 0
            }, CP.css));
            var docObj = {
                scrollLeft: $(window).scrollLeft(),
                scrollTop: $(window).scrollTop(),
                cssText: $doc[0].style.cssText
            };
            $doc.css({
                height: 0,
                width: 0,
                overflow: "hidden",
                position: "static"
            });
            $("html").css({
                overflow: "hidden"
            });
            window.scrollTo(0, 0);
            this._maxim = {
                eleObj: eleObj,
                docObj: docObj
            }
        }
        this._trigger("toggle", null, {
            state: state
        });
        this._refreshResizable();
        this.refresh();
        $(window).trigger("resize", {
            $grid: $grid,
            state: state
        })
    };
    fn._mouseCapture = function(evt) {
        var o = this.options;
        if (!evt.target) {
            return false
        }
        if (this.evtBelongs(evt)) {
            var SW = o.swipeModel;
            if (SW.on == false || SW.on == "touch" && !$.support.touch) {
                return false
            }
            return true
        }
        return false
    };
    fn._saveDims = function() {
    	/*
        var $cont = this.$cont;
        var $tblb = this.$tbl,
            $tblh = this.$tbl_header;
        if ($tblb) {
            for (var i = 0; i < $tblb.length; i++) {
                var tbl = $tblb[i],
                    $tbl = $(tbl);
                $tbl.data("offsetHeight", Math.round(tbl.offsetHeight) - 1);
                $tbl.data("scrollWidth", Math.round(tbl.scrollWidth))
            }
        }
        if ($tblh) {
            for (var i = 0; i < $tblh.length; i++) {
                var tbl = $tblh[i],
                    $tblParent = $(tbl).parent();
                $tblParent.data("offsetHeight", Math.round(tbl.offsetHeight));
                $tblParent.data("scrollWidth", Math.round(tbl.scrollWidth))
            }
        }
        */
    };
    fn._mousePQUp = function(evt) {
        $(document).unbind("mouseup" + this.eventNamespace, this._mousePQUpDelegate);
        this._trigger("mousePQUp", evt, null)
    };
    fn._mouseStart = function(evt) {
        this.blurEditor({
            force: true
        });
        return true
    };
    fn._mouseDrag = function(evt) {
        if (this._trigger("mouseDrag", evt, null) == false) {
            return false
        }
        return true
    };
    fn._mouseStop = function(evt) {
        if (this._trigger("mouseStop", evt, null) == false) {
            return false
        }
        return true
    };
    fn.onWindowResize = function(evt, ui) {
        var that = this,
            o = that.options,
            $grid = that.element,
            $parent = $grid.parent(),
            lastParentHeight = "_lastParentHt",
            lastParentWidth = "_lastParentWd",
            autoResizeTimeout = "autoResizeTimeout",
            newParentHeight, newParentWidth;
        if (ui) {
            var ui_grid = ui.$grid;
            if (ui_grid) {
                if (ui_grid == $grid || $grid.closest(ui_grid).length == 0) {
                    return
                }
            }
        }
        if (!$parent.length) {
            return
        }
        if ($parent[0] == document.body || $grid.css("position") == "fixed") {
            newParentHeight = window.innerHeight ? window.innerHeight : $(window).height();
            newParentWidth = $(window).width()
        } else {
            newParentHeight = $parent.height();
            newParentWidth = $parent.width()
        }
        if (that[lastParentHeight] != null && newParentHeight == that[lastParentHeight] && newParentWidth == that[lastParentWidth]) {
            return
        } else {
            that[lastParentHeight] = newParentHeight;
            that[lastParentWidth] = newParentWidth
        }
        if ($.support.touch && o.editModel.indices && $(document.activeElement).is(".pq-editor-focus")) {
            return
        }
        if (that[autoResizeTimeout]) {
            clearTimeout(that[autoResizeTimeout])
        }
        that[autoResizeTimeout] = window.setTimeout(function() {
            that._refreshAfterResize();
            delete that[autoResizeTimeout]
        }, o.autoSizeInterval || 0)
    };
    fn._onMouseWheel = function(that) {
        return function(_evt) {
            that._saveDims();
            var o = that.options,
                num = 0,
                horizontal = false,
                evt = _evt.originalEvent,
                wheelDeltaX = evt.wheelDeltaX,
                wheelDeltaY = evt.wheelDeltaY,
                wheelDelta = evt.wheelDelta;
            if (wheelDeltaX && Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
                if (o.width == "flex") {
                    return true
                }
                horizontal = true;
                num = wheelDeltaX / 120
            } else if (wheelDelta) {
                if (!that.iRefresh.vscroll) {
                    return true
                }
                num = wheelDelta / 120
            } else if (evt.detail) {
                if (!that.iRefresh.vscroll) {
                    return true
                }
                num = evt.detail * -1 / 3
            }
            num *= 3;
            var scroll = horizontal ? that.hscroll : that.vscroll,
                cur_pos = parseInt(scroll.option("cur_pos")),
                num_eles = parseInt(scroll.option("num_eles"));
            if (!o.scrollModel.smooth && (horizontal && o.virtualX || !horizontal && o.virtualY)) {
                if (num > 0) {
                    num = Math[num < 1 ? "ceil" : "floor"](num)
                } else {
                    num = Math[num < -1 ? "ceil" : "floor"](num)
                }
                var new_pos = cur_pos - num;
                if (new_pos < 0) {
                    new_pos = 0
                } else if (new_pos > num_eles - 1) {
                    new_pos = num_eles - 1
                }
                if (new_pos == cur_pos) {
                    return true
                }
                scroll.option("cur_pos", cur_pos - num);
                scroll.scroll()
            } else {
                var ratio = scroll.option("ratio");
                var new_ratio = ratio - num / (num_eles - 1);
                if (new_ratio > 1) {
                    new_ratio = 1
                } else if (new_ratio < 0) {
                    new_ratio = 0
                }
                if (ratio == new_ratio) {
                    return true
                }
                scroll.option("ratio", new_ratio);
                scroll.drag()
            }
            return false
        }
    };
    fn._onDblClickCell = function(evt) {
        var that = this,
            $td = $(evt.currentTarget),
            obj = that.getCellIndices({
                $td: $td
            }),
            rowIndxPage = obj.rowIndxPage,
            offset = that.riOffset,
            rowIndx = rowIndxPage + offset,
            colIndx = obj.colIndx;
        if (colIndx == null) {
            return
        }
        if (that._trigger("cellDblClick", evt, {
                $td: $td,
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndx,
                colIndx: colIndx,
                column: that.colModel[colIndx],
                rowData: that.pdata[rowIndxPage]
            }) == false) {
            return false
        }
        if (that.options.editModel.clicksToEdit > 1 && this.isEditableRow({
                rowIndx: rowIndx
            }) && this.isEditableCell({
                colIndx: colIndx,
                rowIndx: rowIndx
            })) {
            that.editCell({
                rowIndxPage: rowIndxPage,
                colIndx: colIndx
            })
        }
    };
    fn._onClickCont = function(evt) {
        var that = this
    };
    fn._onClickRow = function(evt) {
        var that = this;
        var $tr = $(evt.currentTarget);
        var rowIndxPage = parseInt($tr.attr("pq-row-indx")),
            offset = that.riOffset,
            rowIndx = rowIndxPage + offset;
        if (isNaN(rowIndxPage)) {
            return
        }
        var objP = {
                rowIndx: rowIndx,
                evt: evt
            },
            options = this.options;
        if (that._trigger("rowClick", evt, {
                $tr: $tr,
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndx,
                rowData: that.pdata[rowIndxPage]
            }) == false) {
            return false
        }
        return
    };
    fn._onRightClickRow = function(evt) {
        var that = this,
            $tr = $(evt.currentTarget),
            rowIndxPage = parseInt($tr.attr("pq-row-indx")),
            offset = that.riOffset,
            rowIndx = rowIndxPage + offset;
        if (isNaN(rowIndxPage)) {
            return
        }
        var options = this.options;
        if (that._trigger("rowRightClick", evt, {
                $tr: $tr,
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndx,
                rowData: that.pdata[rowIndxPage]
            }) == false) {
            return false
        }
    };
    fn._onDblClickRow = function(evt) {
        var that = this;
        var $tr = $(evt.currentTarget);
        var rowIndxPage = parseInt($tr.attr("pq-row-indx")),
            offset = that.riOffset,
            rowIndx = rowIndxPage + offset;
        if (that._trigger("rowDblClick", evt, {
                $tr: $tr,
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndx,
                rowData: that.pdata[rowIndxPage]
            }) == false) {
            return false
        }
    };
    fn.getValueFromDataType = function(val, dataType, validation) {
        if ((val + "")[0] == "=") {
            return val
        }
        var val2;
        if (dataType == "date") {
            val2 = Date.parse(val);
            if (isNaN(val2)) {
                return ""
            } else {
                if (validation) {
                    return val2
                } else {
                    return val
                }
            }
        } else if (dataType == "object") {
            return val
        } else if (dataType == "integer") {
            val2 = parseInt(val)
        } else if (dataType == "float") {
            val2 = parseFloat(val)
        } else if (dataType == "bool") {
            val2 = $.trim(val).toLowerCase();
            if (val2.length == 0) {
                return null
            }
            if (val2 == "true" || val2 == "yes" || val2 == "1") {
                return true
            } else if (val2 == "false" || val2 == "no" || val2 == "0") {
                return false
            } else {
                return Boolean(val2)
            }
        } else {
            return val == null ? val : $.trim(val)
        }
        if (isNaN(val2) || val2 == null) {
            if (val == null) {
                return val
            } else {
                return null
            }
        } else {
            return val2
        }
    };
    fn.isValid = function(objP) {
        return this.iValid.isValid(objP)
    };
    fn.isValidChange = function(ui) {
        ui = ui || {};
        var changes = this.getChanges(),
            al = changes.addList,
            ul = changes.updateList,
            list = ul.concat(al);
        ui.data = list;
        return this.isValid(ui)
    };
    fn.isEditableRow = function(objP) {
        var gEditable = this.options.editable;
        if (gEditable != null) {
            if (typeof gEditable == "function") {
                return gEditable.call(this, this.normalize(objP))
            } else {
                return gEditable
            }
        } else {
            return true
        }
    };
    fn.isEditableCell = function(ui) {
        var objP, column = ui.column,
            cEditable;
        if (!column) {
            objP = this.normalize(ui);
            column = objP.column
        }
        cEditable = column.editable;
        if (ui.checkVisible && column.hidden) {
            return false
        }
        if (cEditable != null) {
            if (typeof cEditable == "function") {
                objP = objP || this.normalize(ui);
                return this.callFn(cEditable, objP)
            } else {
                return cEditable
            }
        } else {
            return true
        }
    };
    fn._onMouseDownCont = function(evt) {
        this.blurEditor({
            blurIfFocus: true
        });
        var that = this,
            pdata, cont;
        if (that._trigger("contMouseDown", evt, null) === false) {
            return false
        }
        pdata = that.pdata;
        if (!pdata || !pdata.length) {
            cont = that.$cont[0];
            cont.setAttribute("tabindex", 0);
            cont.focus()
        }
        return true
    };
    fn._onMouseDown = function(that) {
        return function(evt) {
            if (evt.which == 1 && that.evtBelongs(evt)) {
                var ret, $target = $(evt.target),
                    $td = $target.closest(".pq-grid-cell,.pq-grid-number-cell:not(.pq-detail-child)");
                if ($td.length) {
                    evt.currentTarget = $td[0];
                    ret = that._onMouseDownCell(evt);
                    if (ret === false) {
                        return false
                    }
                }
                if (evt.isPropagationStopped()) {
                    return
                }
                var $tr = $target.closest(".pq-grid-row");
                if ($tr.length) {
                    evt.currentTarget = $tr[0];
                    ret = that._onMouseDownRow(evt);
                    if (ret === false) {
                        return false
                    }
                }
                if (evt.isPropagationStopped()) {
                    return
                }
                return that._onMouseDownCont(evt)
            }
        }
    };
    fn._onMouseDownCell = function(evt) {
        var that = this,
            $td = $(evt.currentTarget),
            _obj = that.getCellIndices({
                $td: $td
            }),
            objP;
        if (_obj.rowIndx != null) {
            _obj = this.iMerge.getRootCell(_obj.rowIndx, _obj.colIndx, "o");
            objP = that.normalize(_obj);
            objP.$td = $td;
            if (that._trigger("cellMouseDown", evt, objP) == false) {
                return false
            }
            return true
        }
    };
    fn._onMouseDownRow = function(evt) {
        var that = this,
            $tr = $(evt.currentTarget),
            objP = that.getRowIndx({
                $tr: $tr
            });
        objP.$tr = $tr;
        if (that._trigger("rowMouseDown", evt, objP) == false) {
            return false
        }
        return true
    };
    fn._onCellMouseEnter = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                var $td = $(this),
                    o = that.options,
                    objP = that.getCellIndices({
                        $td: $td
                    });
                if (objP.rowIndx == null || objP.colIndx == null) {
                    return
                }
                if (that._trigger("cellMouseEnter", evt, objP) === false) {
                    return false
                }
                if (o.hoverMode == "cell") {
                    that.highlightCell($td)
                }
                return true
            }
        }
    };
    fn._onChange = function(that) {
        var clickEvt, changeEvt, ui;
        that.on("cellClickDone", function(evt) {
            clickEvt = evt.originalEvent;
            triggerEvt()
        });

        function triggerEvt() {
            if (clickEvt && changeEvt && changeEvt.target == clickEvt.target) {
                var key, keys = {
                    ctrlKey: 0,
                    metaKey: 0,
                    shiftKey: 0,
                    altKey: 0
                };
                for (key in keys) {
                    changeEvt[key] = clickEvt[key]
                }
                that._trigger("valChange", changeEvt, ui);
                changeEvt = clickEvt = undefined
            }
        }
        return function(evt) {
            if (that.evtBelongs(evt)) {
                var $inp = $(evt.target),
                    $td = $inp.closest(".pq-grid-cell");
                if ($td.length) {
                    ui = that.getCellIndices({
                        $td: $td
                    });
                    ui = that.normalize(ui);
                    ui.input = $inp[0];
                    changeEvt = evt;
                    triggerEvt()
                }
            }
        }
    };
    fn._onRowMouseEnter = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                var $tr = $(this),
                    o = that.options,
                    objRI = that.getRowIndx({
                        $tr: $tr
                    }),
                    rowIndxPage = objRI.rowIndxPage;
                if (that._trigger("rowMouseEnter", evt, objRI) === false) {
                    return false
                }
                if (o.hoverMode == "row") {
                    that.highlightRow(rowIndxPage)
                }
                return true
            }
        }
    };
    fn._onCellMouseLeave = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                var $td = $(this);
                if (that.options.hoverMode == "cell") {
                    that.unHighlightCell($td)
                }
                return true
            }
        }
    };
    fn._onRowMouseLeave = function(that) {
        return function(evt) {
            if (that.evtBelongs(evt)) {
                var $tr = $(this),
                    obj = that.getRowIndx({
                        $tr: $tr
                    }),
                    rowIndxPage = obj.rowIndxPage;
                if (that._trigger("rowMouseLeave", evt, {
                        $tr: $tr,
                        rowIndx: obj.rowIndx,
                        rowIndxPage: rowIndxPage
                    }) === false) {
                    return false
                }
                if (that.options.hoverMode == "row") {
                    that.unHighlightRow(rowIndxPage)
                }
                return true
            }
        }
    };
    fn.enableSelection = function() {
        this.element.removeClass("pq-disable-select").off("selectstart" + this.eventNamespace)
    };
    fn.disableSelection = function() {
        this.element.addClass("pq-disable-select").on("selectstart" + this.eventNamespace, function(evt) {
            var target = evt.target;
            if (!target) {
                return
            }
            var $target = $(evt.target);
            if ($target.is("input,textarea,select")) {
                return true
            } else if ($target.closest(".pq-native-select").length) {
                return true
            } else {
                evt.preventDefault()
            }
        })
    };
    fn._onClickCell = function(evt) {
        var that = this,
            o = this.options,
            EM = o.editModel,
            $td = $(evt.currentTarget),
            __obj = that.getCellIndices({
                $td: $td
            }),
            _obj = this.iMerge.getRootCell(__obj.rowIndx, __obj.colIndx, "o"),
            objP = this.normalize(_obj),
            rowIndx = objP.rowIndx,
            colIndx = objP.colIndx;
        objP.$td = $td;
        objP.evt = evt;
        if (that._trigger("beforeCellClick", evt, objP) == false) {
            return false
        }
        that._trigger("cellClick", evt, objP);
        if (colIndx == null || colIndx < 0) {
            return
        }
        if (EM.clicksToEdit == 1 && this.isEditableRow({
                rowIndx: rowIndx
            }) && this.isEditableCell({
                colIndx: colIndx,
                rowIndx: rowIndx
            })) {
            that.editCell(objP)
        }
    };
    fn._onRightClickCell = function(evt) {
        var $td = $(evt.currentTarget);
        var objP = this.getCellIndices({
            $td: $td
        });
        var that = this,
            rowIndxPage = objP.rowIndxPage,
            offset = this.riOffset,
            rowIndx = rowIndxPage + offset,
            colIndx = objP.colIndx,
            CM = this.colModel,
            options = this.options,
            DM = options.DM;
        if (colIndx == null) {
            return
        }
        var column = CM[colIndx],
            dataIndx = column.dataIndx;
        if (this._trigger("cellRightClick", evt, {
                $td: $td,
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndx,
                colIndx: colIndx,
                dataIndx: dataIndx,
                column: column,
                rowData: that.pdata[rowIndxPage]
            }) == false) {
            return false
        }
    };
    fn.highlightCell = function($td) {
        $td.addClass("pq-grid-cell-hover ui-state-hover")
    };
    fn.unHighlightCell = function($td) {
        $td.removeClass("pq-grid-cell-hover ui-state-hover")
    };
    fn.highlightRow = function(varr) {
        if (isNaN(varr)) {} else {
            var $tr = this.getRow({
                rowIndxPage: varr
            });
            if ($tr) $tr.addClass("pq-grid-row-hover ui-state-hover")
        }
    };
    fn.unHighlightRow = function(varr) {
        if (isNaN(varr)) {} else {
            var $tr = this.getRow({
                rowIndxPage: varr
            });
            if ($tr) $tr.removeClass("pq-grid-row-hover ui-state-hover")
        }
    };
    fn._getCreateEventData = function() {
        return {
            dataModel: this.options.dataModel,
            data: this.pdata,
            colModel: this.options.colModel
        }
    };
    fn._findCellFromEvt = function(evt) {
        var $targ = $(evt.target);
        var $td = $targ.closest(".pq-grid-cell");
        if ($td == null || $td.length == 0) {
            return {
                rowIndxPage: null,
                colIndx: null,
                $td: null
            }
        } else {
            var obj = this.getCellIndices({
                $td: $td
            });
            obj.$td = $td;
            return obj
        }
    };
    fn._initPager = function() {
        var that = this,
            o = that.options,
            PM = o.pageModel;
        if (PM.type) {
            var obj2 = {
                bootstrap: o.bootstrap,
                change: function(evt, ui) {
                    that.blurEditor({
                        force: true
                    });
                    var DM = that.options.pageModel;
                    if (ui.curPage != undefined) {
                        DM.prevPage = DM.curPage;
                        DM.curPage = ui.curPage
                    }
                    if (ui.rPP != undefined) DM.rPP = ui.rPP;
                    if (DM.type == "remote") {
                        that.remoteRequest({
                            callback: function() {
                                that._onDataAvailable({
                                    apply: true,
                                    header: false
                                })
                            }
                        })
                    } else {
                        that.refreshView({
                            header: false,
                            source: "pager"
                        })
                    }
                },
                refresh: function(evt) {
                    that.refreshDataAndView()
                }
            };
            obj2 = $.extend(obj2, PM);
            this.pagerW = pq.pager(PM.appendTo ? PM.appendTo : this.$footer, obj2)
        } else {}
    };
    fn.generateLoading = function() {
        if (this.$loading) {
            this.$loading.remove()
        }
        this.$loading = $("<div class='pq-loading'></div>").appendTo(this.element);
        $(["<div class='pq-loading-bg'></div><div class='pq-loading-mask ui-state-highlight'><div>", this.options.strLoading, "...</div></div>"].join("")).appendTo(this.$loading);
        this.$loading.find("div.pq-loading-bg").css("opacity", .2)
    };
    fn._refreshLoadingString = function() {
        this.$loading.find("div.pq-loading-mask").children("div").html(this.options.strLoading)
    };
    fn.showLoading = function() {
        if (this.showLoadingCounter == null) {
            this.showLoadingCounter = 0
        }
        this.showLoadingCounter++;
        this.$loading.show()
    };
    fn.hideLoading = function() {
        if (this.showLoadingCounter > 0) {
            this.showLoadingCounter--
        }
        if (!this.showLoadingCounter) {
            this.$loading.hide()
        }
    };
    fn.getTotalRows = function() {
        var o = this.options,
            DM = o.dataModel,
            data = DM.data || [],
            dataUF = DM.dataUF || [],
            PM = o.pageModel;
        if (PM.location == "remote") {
            return PM.totalRecords
        } else {
            return data.length + dataUF.length
        }
    };
    fn.refreshDataFromDataModel = function(obj) {
        obj = obj || {};
        var that = this,
            thisOptions = that.options,
            DM = thisOptions.dataModel,
            PM = thisOptions.pageModel,
            DMdata = DM.data,
            begIndx, endIndx, totalPages, totalRecords, paging = PM.type,
            rowIndxOffset, qTriggers = that._queueATriggers;
        for (var key in qTriggers) {
            var t = qTriggers[key];
            delete qTriggers[key];
            that._trigger(key, t.evt, t.ui)
        }
        that._trigger("beforeRefreshData", null, {});
        if (paging == "local") {
            totalRecords = PM.totalRecords = DMdata.length;
            PM.totalPages = totalPages = Math.ceil(totalRecords / PM.rPP);
            if (PM.curPage > totalPages) {
                PM.curPage = totalPages
            }
            if (totalPages && !PM.curPage) {
                PM.curPage = 1
            }
            begIndx = (PM.curPage - 1) * PM.rPP;
            begIndx = begIndx >= 0 ? begIndx : 0;
            endIndx = PM.curPage * PM.rPP;
            if (endIndx > DMdata.length) {
                endIndx = DMdata.length
            }
            that.pdata = DMdata.slice(begIndx, endIndx);
            rowIndxOffset = begIndx
        } else if (paging == "remote") {
            PM.totalPages = totalPages = Math.ceil(PM.totalRecords / PM.rPP);
            if (PM.curPage > totalPages) {
                PM.curPage = totalPages
            }
            if (totalPages && !PM.curPage) {
                PM.curPage = 1
            }
            var endIndx = PM.rPP;
            if (endIndx > DMdata.length) {
                endIndx = DMdata.length
            }
            that.pdata = DMdata.slice(0, endIndx);
            rowIndxOffset = PM.rPP * (PM.curPage - 1)
        } else {
            if (thisOptions.backwardCompat) {
                that.pdata = DMdata.slice(0)
            } else {
                that.pdata = DMdata
            }
        }
        that.riOffset = rowIndxOffset >= 0 ? rowIndxOffset : 0;
        that._trigger("dataReady", null, {
            source: obj.source
        })
    };
    fn.getQueryStringCRUD = function() {
        return ""
    };
    fn.remoteRequest = function(objP) {
        if (this.loading) {
            this.xhr.abort()
        }
        objP = objP || {};
        var that = this,
            url = "",
            dataURL = "",
            o = this.options,
            raiseFilterEvent = false,
            thisColModel = this.colModel,
            DM = o.dataModel,
            SM = o.sortModel,
            FM = o.filterModel,
            PM = o.pageModel;
        if (typeof DM.getUrl == "function") {
            var objk = {
                colModel: thisColModel,
                dataModel: DM,
                sortModel: SM,
                groupModel: o.groupModel,
                pageModel: PM,
                filterModel: FM
            };
            var objURL = DM.getUrl.call(this, objk);
            if (objURL && objURL.url) {
                url = objURL.url
            }
            if (objURL && objURL.data) {
                dataURL = objURL.data
            }
        } else if (typeof DM.url == "string") {
            url = DM.url;
            var sortQueryString = {},
                filterQueryString = {},
                pageQueryString = {};
            if (SM.type == "remote") {
                if (!objP.initBySort) {
                    this.sort({
                        initByRemote: true
                    })
                }
                var sortingQS = this.iSort.getQueryStringSort();
                if (sortingQS) {
                    sortQueryString = {
                        pq_sort: sortingQS
                    }
                }
            }
            if (PM.type == "remote") {
                pageQueryString = {
                    pq_curpage: PM.curPage,
                    pq_rpp: PM.rPP
                }
            }
            var filterQS;
            if (FM.type != "local") {
                filterQS = this.iFilterData.getQueryStringFilter();
                if (filterQS) {
                    raiseFilterEvent = true;
                    filterQueryString = {
                        pq_filter: filterQS
                    }
                }
            }
            var postData = DM.postData,
                postDataOnce = DM.postDataOnce;
            if (postData && typeof postData == "function") {
                postData = postData.call(this, {
                    colModel: thisColModel,
                    dataModel: DM
                })
            }
            dataURL = $.extend({
                pq_datatype: DM.dataType
            }, filterQueryString, pageQueryString, sortQueryString, postData, postDataOnce)
        }
        if (!url) {
            return
        }
        this.loading = true;
        this.showLoading();
        this.xhr = $.ajax({
            url: url,
            dataType: DM.dataType,
            async: DM.async == null ? true : DM.async,
            cache: DM.cache,
            contentType: DM.contentType,
            type: DM.method,
            data: dataURL,
            beforeSend: function(jqXHR, settings) {
                if (typeof DM.beforeSend == "function") {
                    return DM.beforeSend.call(that, jqXHR, settings)
                }
            },
            success: function(responseObj, textStatus, jqXHR) {
                that.onRemoteSuccess(responseObj, textStatus, jqXHR, raiseFilterEvent, objP)
            },
            error: function(jqXHR, textStatus, errorThrown) {
                that.hideLoading();
                that.loading = false;
                if (typeof DM.error == "function") {
                    DM.error.call(that, jqXHR, textStatus, errorThrown)
                } else if (errorThrown != "abort") {
                    throw "Error : " + errorThrown
                }
            }
        })
    };
    fn.onRemoteSuccess = function(response, textStatus, jqXHR, raiseFilterEvent, objP) {
        var that = this,
            o = that.options,
            retObj, CM = that.colModel,
            PM = o.pageModel,
            DM = o.dataModel;
        if (typeof DM.getData == "function") {
            retObj = DM.getData.call(that, response, textStatus, jqXHR)
        } else {
            retObj = response
        }
        DM.data = retObj.data;
        if (PM.type == "remote") {
            if (retObj.curPage != null) PM.curPage = retObj.curPage;
            if (retObj.totalRecords != null) {
                PM.totalRecords = retObj.totalRecords
            }
        }
        that.hideLoading();
        that.loading = false;
        that._trigger("load", null, {
            dataModel: DM,
            colModel: CM
        });
        if (raiseFilterEvent) {
            that._queueATriggers["filter"] = {
                ui: {}
            }
        }
        if (objP.callback) {
            objP.callback()
        }
    };
    fn._refreshTitle = function() {
        this.$title.html(this.options.title)
    };
    fn._destroyDraggable = function() {
        var ele = this.element;
        var $parent = ele.parent(".pq-wrapper");
        if ($parent.length && $parent.data("draggable")) {
            $parent.draggable("destroy");
            this.$title.removeClass("pq-draggable pq-no-capture");
            ele.unwrap(".pq-wrapper")
        }
    };
    fn._refreshDraggable = function() {
        var o = this.options,
            ele = this.element,
            $title = this.$title;
        if (o.draggable) {
            $title.addClass("pq-draggable pq-no-capture");
            var $wrap = ele.parent(".pq-wrapper");
            if (!$wrap.length) {
                ele.wrap("<div class='pq-wrapper' />")
            }
            ele.parent(".pq-wrapper").draggable({
                handle: $title
            })
        } else {
            this._destroyDraggable()
        }
    };
    fn._refreshResizable = function() {
        var that = this,
            $ele = this.element,
            o = this.options,
            widthPercent = (o.width + "").indexOf("%") > -1,
            heightPercent = (o.height + "").indexOf("%") > -1,
            autoWidth = o.width == "auto",
            flexWidth = o.width == "flex",
            flexHeight = o.height == "flex";
        if (o.resizable && (!(flexHeight || heightPercent) || !(flexWidth || widthPercent || autoWidth))) {
            var handles = "e,s,se";
            if (flexHeight || heightPercent) {
                handles = "e"
            } else if (flexWidth || widthPercent || autoWidth) {
                handles = "s"
            }
            var initReq = true;
            if ($ele.hasClass("ui-resizable")) {
                var handles2 = $ele.resizable("option", "handles");
                if (handles == handles2) {
                    initReq = false
                } else {
                    this._destroyResizable()
                }
            }
            if (initReq) {
                $ele.resizable({
                    helper: "ui-state-default",
                    handles: handles,
                    minWidth: o.minWidth,
                    minHeight: o.minHeight ? o.minHeight : 100,
                    delay: 0,
                    start: function(evt, ui) {
                        $(ui.helper).css({
                            opacity: .5,
                            background: "#ccc",
                            border: "1px solid steelblue"
                        })
                    },
                    resize: function(evt, ui) {},
                    stop: function(evt, ui) {
                        var $ele = that.element,
                            ele = $ele[0],
                            width = o.width,
                            height = o.height,
                            widthPercent = (width + "").indexOf("%") > -1,
                            heightPercent = (height + "").indexOf("%") > -1,
                            autoWidth = width == "auto",
                            flexWidth = width == "flex",
                            flexHeight = height == "flex",
                            refreshRQ = false;
                        ele.style.width = ele.offsetWidth + 3 + "px";
                        ele.style.height = ele.offsetHeight + 3 + "px";
                        if (!heightPercent && !flexHeight) {
                            refreshRQ = true;
                            o.height = ele.offsetHeight
                        }
                        if (!widthPercent && !autoWidth && !flexWidth) {
                            refreshRQ = true;
                            o.width = ele.offsetWidth
                        }
                        that.refresh();
                        $ele.css("position", "relative");
                        if (refreshRQ) {
                            $(window).trigger("resize")
                        }
                    }
                })
            }
        } else {
            this._destroyResizable()
        }
    };
    fn._refreshAfterResize = function() {
        var o = this.options;
        var wd = o.width,
            ht = o.height,
            widthPercent = (wd + "").indexOf("%") != -1 ? true : false,
            autoWidth = wd === "auto",
            heightPercent = (ht + "").indexOf("%") != -1 ? true : false;
        if (widthPercent || autoWidth || heightPercent) {
            this.refresh()
        }
    };
    fn.refresh = function(objP) {
      this.iRefresh.refresh(objP)
    };
    fn.refreshView = function(obj) {
        if (this.options.editModel.indices != null) {
            this.blurEditor({
                force: true
            })
        }
        this.refreshDataFromDataModel(obj);
        this.refresh(obj)
    };
    fn._refreshPager = function() {
        var options = this.options,
            PM = options.pageModel,
            paging = PM.type ? true : false,
            rPP = PM.rPP,
            totalRecords = PM.totalRecords;
        if (paging) {
            var obj = options.pageModel;
            if (!this.pagerW) {
                this._initPager()
            }
            this.pagerW.option(obj);
            if (totalRecords > rPP) {
                this.$bottom.css("display", "")
            } else if (!options.showBottom) {
                this.$bottom.css("display", "none")
            }
        } else {
            if (this.pagerW) {
                this.pagerW.destroy();
                this.pagerW = null
            }
            if (options.showBottom) {
                this.$bottom.css("display", "")
            } else {
                this.$bottom.css("display", "none")
            }
        }
    };
    fn.getInstance = function() {
        return {
            grid: this
        }
    };
    fn.refreshDataAndView = function(objP) {
        var DM = this.options.dataModel;
        if (DM.location == "remote") {
            var self = this;
            this.remoteRequest({
                callback: function() {
                    self._onDataAvailable(objP)
                }
            })
        } else {
            this._onDataAvailable(objP)
        }
    };
    fn.getColIndx = function(ui) {
        var dataIndx = ui.dataIndx,
            column = ui.column,
            colIndx, searchByColumn, searchByDI;
        if (column) {
            searchByColumn = true
        } else if (dataIndx !== undefined) {
            searchByDI = true
        } else {
            throw "dataIndx / column NA"
        }
        var CM = this.colModel,
            len = CM.length;
        if (searchByColumn) {
            for (var i = 0; i < len; i++) {
                if (CM[i] == column) {
                    return i
                }
            }
        } else {
            colIndx = this.colIndxs[dataIndx];
            if (colIndx != null) {
                return colIndx
            }
        }
        return -1
    };
    fn.getColumn = function(obj) {
        if (obj.dataIndx == null) {
            throw "dataIndx N/A"
        }
        return this.columns[obj.dataIndx]
    };
    fn._generateCellRowOutline = function() {
        var o = this.options,
            EM = o.editModel;
        if (this.$div_focus) {
            if (o.debug) {
                throw "this.$div_focus already present assert failed"
            }
            return
        } else {
            var $parent = this.element;
            if (EM.inline) {
                $parent = this.getCell(EM.indices);
                $parent.css("padding", 0).empty()
            }
            this.$div_focus = $(["<div class='pq-editor-outer'>", "<div class='pq-editor-inner'>", "</div>", "</div>"].join("")).appendTo($parent)
        }
        var obj = $.extend({
            all: true
        }, EM.indices);
        var $td = this.getCell(obj);
        $td.css("height", $td[0].offsetHeight);
        $td.empty();
        this.refreshEditorPos()
    };
    fn._removeEditOutline = function(objP) {
        function destroyDatePicker($editor) {
            if ($editor.hasClass("hasDatepicker")) {
                $editor.datepicker("hide").datepicker("destroy")
            }
        }
        if (this.$div_focus) {
            var $editor = this.$div_focus.find(".pq-editor-focus");
            destroyDatePicker($editor);
            if ($editor[0] == document.activeElement) {
                var prevBlurEditMode = this._blurEditMode;
                this._blurEditMode = true;
                $editor.blur();
                this._blurEditMode = prevBlurEditMode
            }
            this.$div_focus.remove();
            delete this.$div_focus;
            var EM = this.options.editModel;
            var obj = $.extend({}, EM.indices);
            EM.indices = null;
            obj.rowData = undefined;
            this.refreshCell(obj)
        }
    };
    fn.refreshEditorPos = function() {};
    fn.get$Tbl = function(rowIndxPage, colIndx) {
        var $tbl = this.$tbl,
            tbl = [];
        if (!$tbl || !$tbl.length) {
            return
        }
        var pqpanes = this.pqpanes,
            o = this.options,
            fr = o.freezeRows,
            fc = o.freezeCols;
        if (pqpanes.h && pqpanes.v) {
            if (colIndx == null)
                if (rowIndxPage >= fr) {
                    tbl.push($tbl[2], $tbl[3])
                } else {
                    tbl.push($tbl[0], $tbl[1])
                }
            else {
                if (colIndx >= fc && rowIndxPage >= fr) {
                    tbl = $tbl[3]
                } else if (colIndx < fc && rowIndxPage >= fr) {
                    tbl = $tbl[2]
                } else if (colIndx >= fc && rowIndxPage < fr) {
                    tbl = $tbl[1]
                } else {
                    tbl = $tbl[0]
                }
            }
        } else if (pqpanes.v) {
            if (colIndx == null) tbl = $tbl;
            else {
                if (colIndx >= fc) {
                    tbl = $tbl[1]
                } else {
                    tbl = $tbl[0]
                }
            }
        } else if (pqpanes.h) {
            if (rowIndxPage >= fr) {
                tbl = $tbl[1]
            } else {
                tbl = $tbl[0]
            }
        } else {
            tbl = $tbl[0]
        }
        if (tbl) {
            return $(tbl)
        }
    };
    fn.scrollCell = function(obj) {
        this.scrollRow(obj);
        this.scrollColumn(obj)
    };
    fn.scrollY = function(curPos) {
        this.vscroll.option("cur_pos", curPos);
        this.vscroll.scroll()
    };
    fn.scrollRow = function(obj) {
        var o = this.options,
            obj = this.normalize(obj),
            rip = obj.rowIndxPage,
            rd = obj.rowData;
        if (!this.pdata || rip >= this.pdata.length) {
            return false
        }
        if (!rd || rd.pq_hidden) {
            return false
        }
        if (o.virtualY) {
            this._scrollRowVirtual(obj)
        } else {
            this.iMouseSelection.scrollRowNonVirtual(obj)
        }
    };
    fn._scrollRowVirtual = function(obj) {
        var o = this.options,
            rowIndxPage = obj.rowIndxPage,
            nested = this.iHierarchy ? true : false,
            rowIndx = obj.rowIndx,
            vscroll = this.vscroll,
            scrollCurPos = this.scrollCurPos,
            rowIndxPage = rowIndxPage == null ? rowIndx - this.riOffset : rowIndxPage,
            freezeRows = parseInt(o.freezeRows);
        if (rowIndxPage < freezeRows) {
            return
        }
        var calcCurPos = this._calcCurPosFromRowIndxPage(rowIndxPage);
        if (calcCurPos == null) {
            return
        }
        if (calcCurPos < scrollCurPos) {
            vscroll.option("cur_pos", calcCurPos);
            vscroll.scroll()
        }
        var $tbl = this.get$Tbl(rowIndxPage);
        if (!$tbl || !$tbl.length) {
            return null
        }
        var $trs = $tbl.children("tbody").children("tr[pq-row-indx=" + rowIndxPage + "]"),
            $tr = $trs.last(),
            $tr_first = $tr;
        if ($trs.length > 1) {
            $tr_first = $trs.first()
        }
        var tr = $tr[0],
            tbl_marginTop = parseInt($tbl.css("marginTop"));
        if (tr == undefined) {
            vscroll.option("cur_pos", calcCurPos);
            vscroll.scroll()
        } else {
            var td_bottom = tr.offsetTop + tr.offsetHeight,
                htCont = this.iRefresh.getEContHt(),
                marginTop = tbl_marginTop,
                htSB = this._getSBHeight(),
                $tr_prev = $tr_first.prev("tr");
            if ($tr_prev.hasClass("pq-row-hidden") || $tr_prev.hasClass("pq-last-frozen-row")) {
                return
            } else if (td_bottom > htCont - marginTop) {
                var diff = td_bottom - (htCont - htSB - marginTop),
                    $trs = $tbl.children().children("tr"),
                    ht = 0,
                    indx = 0,
                    $tr_next;
                if (freezeRows) {
                    $tr_next = $trs.filter("tr.pq-last-frozen-row").last().next();
                    if ($tr_next.length == 0) {
                        $tr_next = $trs.filter("tr.pq-row-hidden").next()
                    }
                } else {
                    $tr_next = $trs.filter("tr.pq-row-hidden").next()
                }
                do {
                    if (!$tr_next.length) {
                        break
                    }
                    ht += $tr_next[0].offsetHeight;
                    if ($tr_next[0] == $tr[0]) {
                        break
                    } else if (!nested || $tr_next.hasClass("pq-detail-child") == false) {
                        indx++;
                        if (ht >= diff) {
                            break
                        }
                    } else if (ht >= diff) {
                        break
                    }
                    $tr_next = $tr_next.next()
                } while (1 === 1);
                var cur_pos = scrollCurPos + indx;
                if (cur_pos > calcCurPos) {
                    cur_pos = calcCurPos
                }
                var num_eles = vscroll.option("num_eles");
                if (num_eles < cur_pos + 1) {
                    num_eles = cur_pos + 1
                }
                vscroll.option({
                    num_eles: num_eles,
                    cur_pos: cur_pos
                });
                vscroll.scroll()
            }
        }
    };
    fn.blurEditor = function(objP) {
        if (this.$div_focus) {
            var $editor = this.$div_focus.find(".pq-editor-focus");
            if (objP && objP.blurIfFocus) {
                if (document.activeElement == $editor[0]) {
                    $editor.blur()
                }
            } else {
                return $editor.triggerHandler("blur", objP)
            }
        }
    };
    fn._scrollColumnVirtual = function(objP) {
        var colIndx = objP.colIndx,
            hscroll = this.hscroll,
            colIndx = colIndx == null ? this.colIndxs[objP.dataIndx] : colIndx,
            freezeCols = this.options.freezeCols;
        var td_right = this._calcRightEdgeCol(colIndx).width,
            contWd = this.iRefresh.getEContWd();
        if (td_right > contWd) {
            var diff = this.calcWidthCols(-1, colIndx + 1) - contWd,
                CM = this.colModel,
                CMLength = CM.length,
                wd = 0,
                initH = 0;
            for (var i = freezeCols; i < CMLength; i++) {
                var column = CM[i];
                if (!column.hidden) {
                    wd += column.outerWidth
                }
                if (i == colIndx) {
                    initH = i - freezeCols - this._calcNumHiddenUnFrozens(i);
                    break
                } else if (wd >= diff) {
                    initH = i - freezeCols - this._calcNumHiddenUnFrozens(i) + 1;
                    break
                }
            }
            hscroll.option("cur_pos", initH);
            hscroll.scroll();
            return true
        } else if (colIndx >= freezeCols && colIndx < this.initH) {
            var cur_pos = colIndx - freezeCols - this._calcNumHiddenUnFrozens(colIndx);
            hscroll.option("cur_pos", cur_pos);
            hscroll.scroll();
            return true
        }
        return false
    };
    fn.scrollColumn = function(objP) {
        var o = this.options,
            virtualX = o.virtualX;
        if (o.width === "flex" && !o.maxWidth) {
            return false
        }
        if (virtualX) {
            return this._scrollColumnVirtual(objP)
        } else {
            return this.iMouseSelection.scrollColumnNonVirtual(objP)
        }
    };
    fn.Selection = function() {
        return this.iSelection
    };
    fn.goToPage = function(obj) {
        var DM = this.options.pageModel;
        if (DM.type == "local" || DM.type == "remote") {
            var rowIndx = obj.rowIndx,
                rPP = DM.rPP,
                page = obj.page == null ? Math.ceil((rowIndx + 1) / rPP) : obj.page,
                curPage = DM.curPage;
            if (page != curPage) {
                DM.curPage = page;
                if (DM.type == "local") {
                    this.refreshView()
                } else {
                    this.refreshDataAndView()
                }
            }
        }
    };
    fn.setSelection = function(obj) {
        if (obj == null) {
            this.iSelection.removeAll();
            this.iRows.removeAll({
                all: true
            });
            return true
        }
        var data = this.pdata;
        if (!data || !data.length) {
            return false
        }
        obj = this.normalize(obj);
        var rowIndx = obj.rowIndx,
            rowIndxPage = obj.rowIndxPage,
            colIndx = obj.colIndx;
        if (obj.rowData && rowIndx == null) {
            var obj2 = this.getRowIndx(obj);
            obj.rowIndx = rowIndx = obj2.rowIndx;
            obj.rowIndxPage = rowIndxPage = obj2.rowIndxPage
        }
        if (rowIndx == null || rowIndx < 0 || colIndx < 0 || colIndx >= this.colModel.length) {
            return false
        }
        this.goToPage(obj);
        rowIndxPage = rowIndx - this.riOffset;
        this.scrollRow({
            rowIndxPage: rowIndxPage
        });
        if (colIndx == null) {
            this.iRows.add({
                rowIndx: rowIndx
            })
        } else {
            this.scrollColumn({
                colIndx: colIndx
            });
            this.Range({
                r1: rowIndx,
                c1: colIndx
            }).select()
        }
        if (obj.focus !== false) {
            this.focus({
                rowIndxPage: rowIndxPage,
                colIndx: colIndx == null ? this.getFirstVisibleCI() : colIndx
            })
        }
    };
    fn.getColModel = function() {
        return this.colModel
    };
    fn.saveEditCell = function(objP) {
        var o = this.options;
        var EM = o.editModel;
        if (!EM.indices) {
            return null
        }
        var obj = $.extend({}, EM.indices),
            evt = objP ? objP.evt : null,
            offset = this.riOffset,
            colIndx = obj.colIndx,
            rowIndxPage = obj.rowIndxPage,
            rowIndx = rowIndxPage + offset,
            thisColModel = this.colModel,
            column = thisColModel[colIndx],
            dataIndx = column.dataIndx,
            pdata = this.pdata,
            rowData = pdata[rowIndxPage],
            DM = o.dataModel,
            oldVal;
        if (rowData == null) {
            return null
        }
        if (rowIndxPage != null) {
            var newVal = this.getEditCellData();
            if ($.isPlainObject(newVal)) {
                oldVal = {};
                for (var key in newVal) {
                    oldVal[key] = rowData[key]
                }
            } else {
                oldVal = this.readCell(rowData, column)
            }
            if (newVal == "<br>") {
                newVal = ""
            }
            if (oldVal == null && newVal === "") {
                newVal = null
            }
            var objCell = {
                rowIndx: rowIndx,
                rowIndxPage: rowIndxPage,
                dataIndx: dataIndx,
                column: column,
                newVal: newVal,
                value: newVal,
                oldVal: oldVal,
                rowData: rowData,
                dataModel: DM
            };
            if (this._trigger("cellBeforeSave", evt, objCell) === false) {
                return false
            }
            if (1 == 1) {
                var newRow = {},
                    refresh = false;
                if ($.isPlainObject(newVal)) {
                    newRow = newVal;
                    refresh = true
                } else {
                    newRow[dataIndx] = newVal
                }
                var ret = this.updateRow({
                    row: newRow,
                    rowIndx: rowIndx,
                    refresh: refresh,
                    silent: true,
                    source: "edit",
                    checkEditable: false
                });
                if (ret === false) {
                    return false
                }
                this._trigger("cellSave", evt, objCell)
            }
            return true
        }
    };
    fn._addInvalid = function(ui) {};
    fn._digestNewRow = function(newRow, oldRow, rowIndx, rowData, type, rowCheckEditable, validate, allowInvalid, source) {
        var that = this,
            getValueFromDataType = that.getValueFromDataType,
            dataIndx, columns = that.columns,
            colIndxs = that.colIndxs,
            column, colIndx;
        for (dataIndx in newRow) {
            column = columns[dataIndx];
            colIndx = colIndxs[dataIndx];
            if (column) {
                if (rowCheckEditable && column.editable != null && that.isEditableCell({
                        rowIndx: rowIndx,
                        colIndx: colIndx,
                        dataIndx: dataIndx
                    }) === false) {
                    delete newRow[dataIndx];
                    oldRow && delete oldRow[dataIndx];
                    continue
                }
                var dataType = column.dataType,
                    newVal = getValueFromDataType(newRow[dataIndx], dataType),
                    oldVal = oldRow ? oldRow[dataIndx] : undefined,
                    oldVal = oldVal !== undefined ? getValueFromDataType(oldVal, dataType) : undefined;
                newRow[dataIndx] = newVal;
                if (validate && column.validations) {
                    if (source == "edit" && allowInvalid === false) {
                        var objRet = this.isValid({
                            focusInvalid: true,
                            dataIndx: dataIndx,
                            rowIndx: rowIndx,
                            value: newVal
                        });
                        if (objRet.valid == false && !objRet.warn) {
                            return false
                        }
                    } else {
                        var wRow = type == "add" ? newRow : rowData,
                            objRet = this.iValid.isValidCell({
                                column: column,
                                rowData: wRow,
                                allowInvalid: allowInvalid,
                                value: newVal
                            });
                        if (objRet.valid === false) {
                            if (allowInvalid === false && !objRet.warn) {
                                delete newRow[dataIndx]
                            }
                        }
                    }
                }
                if (type == "update" && newVal === oldVal) {
                    delete newRow[dataIndx];
                    delete oldRow[dataIndx];
                    continue
                }
            }
        }
        if (type == "update") {
            if (!pq.isEmpty(newRow)) {
                return true
            }
        } else {
            return true
        }
    };
    fn._digestData = function(ui) {
        if (ui.rowList) {
            throw "not supported"
        } else {
            addList = ui.addList = ui.addList || [], ui.updateList = ui.updateList || [], ui.deleteList = ui.deleteList || [];
            if (addList.length && addList[0].rowData) {
                throw "rd in addList"
            }
        }
        if (this._trigger("beforeValidate", null, ui) === false) {
            return false
        }
        var that = this,
            options = that.options,
            EM = options.editModel,
            DM = options.dataModel,
            data = DM.data,
            CM = options.colModel,
            PM = options.pageModel,
            HM = options.historyModel,
            validate = ui.validate == null ? EM.validate : ui.validate,
            remotePaging = PM.type == "remote",
            allowInvalid = ui.allowInvalid == null ? EM.allowInvalid : ui.allowInvalid,
            TM = options.trackModel,
            track = ui.track,
            track = track == null ? options.track == null ? TM.on : options.track : track,
            history = ui.history == null ? HM.on : ui.history,
            iHistory = this.iHistory,
            iUCData = this.iUCData,
            checkEditable = ui.checkEditable == null ? true : ui.checkEditable,
            checkEditableAdd = ui.checkEditableAdd == null ? checkEditable : ui.checkEditableAdd,
            source = ui.source,
            iRefresh = that.iRefresh,
            offset = this.riOffset,
            addList = ui.addList,
            updateList = ui.updateList,
            deleteList = ui.deleteList,
            i, len, addListNew = [],
            updateListNew = [];
        !data && (data = DM.data = []);
        for (i = 0, len = updateList.length; i < len; i++) {
            var rowListObj = updateList[i],
                newRow = rowListObj.newRow,
                rowData = rowListObj.rowData,
                rowCheckEditable = rowListObj.checkEditable,
                rowIndx = rowListObj.rowIndx,
                oldRow = rowListObj.oldRow,
                ret;
            rowCheckEditable == null && (rowCheckEditable = checkEditable);
            if (!oldRow) {
                throw "oldRow required while update"
            }
            if (rowCheckEditable && options.editable !== true && that.isEditableRow({
                    rowIndx: rowIndx,
                    rowData: rowData
                }) === false) {
                continue
            }
            ret = this._digestNewRow(newRow, oldRow, rowIndx, rowData, "update", rowCheckEditable, validate, allowInvalid, source);
            if (ret === false) {
                return false
            }
            ret && updateListNew.push(rowListObj)
        }
        for (i = 0, len = addList.length; i < len; i++) {
            var rowListObj = addList[i],
                newRow = rowListObj.newRow,
                rowData, rowCheckEditable = rowListObj.checkEditable,
                rowIndx = rowListObj.rowIndx,
                oldRow;
            rowCheckEditable == null && (rowCheckEditable = checkEditableAdd);
            CM.forEach(function(column) {
                var dataIndx = column.dataIndx;
                newRow[dataIndx] = newRow[dataIndx]
            });
            ret = this._digestNewRow(newRow, oldRow, rowIndx, rowData, "add", rowCheckEditable, validate, allowInvalid, source);
            if (ret === false) {
                return false
            }
            ret && addListNew.push(rowListObj)
        }
        addList = ui.addList = addListNew;
        updateList = ui.updateList = updateListNew;
        if (!addList.length && !updateList.length && !deleteList.length) {
            if (source == "edit") {
                return null
            }
            return false
        }
        if (history) {
            iHistory.increment();
            iHistory.push(ui)
        }
        that._digestUpdate(updateList, iUCData, track);
        if (addList.length) {
            that._digestAdd(addList, iUCData, track, data, PM, remotePaging, offset);
            iRefresh.addRowIndx()
        }
        if (deleteList.length) {
            that._digestDelete(deleteList, iUCData, track, data, PM, remotePaging, offset);
            iRefresh.addRowIndx()
        }
        that._trigger("change", null, ui);
        return true
    };
    fn._digestUpdate = function(rowList, iUCData, track) {
        var i = 0,
            len = rowList.length,
            column, newVal, dataIndx, columns = this.columns,
            saveCell = this.saveCell;
        for (; i < len; i++) {
            var rowListObj = rowList[i],
                newRow = rowListObj.newRow,
                rowData = rowListObj.rowData;
            if (track) {
                iUCData.update({
                    rowData: rowData,
                    row: newRow,
                    refresh: false
                })
            }
            for (dataIndx in newRow) {
                column = columns[dataIndx];
                newVal = newRow[dataIndx];
                saveCell(rowData, column, newVal)
            }
        }
    };
    fn._digestAdd = function(rowList, iUCData, track, data, PM, remotePaging, offset) {
        var i = 0,
            len = rowList.length,
            indx, rowIndxPage;
        for (; i < len; i++) {
            var rowListObj = rowList[i],
                newRow = rowListObj.newRow,
                rowIndx = rowListObj.rowIndx;
            if (track) {
                iUCData.add({
                    rowData: newRow
                })
            }
            if (rowIndx == null) {
                data.push(newRow)
            } else {
                rowIndxPage = rowIndx - offset;
                indx = remotePaging ? rowIndxPage : rowIndx;
                data.splice(indx, 0, newRow)
            }
            rowListObj.rowData = newRow;
            if (remotePaging) {
                PM.totalRecords++
            }
        }
    };
    fn._digestDelete = function(rowList, iUCData, track, data, PM, remotePaging, offset) {
        var i = 0,
            len = rowList.length;
        for (; i < len; i++) {
            var rowListObj = rowList[i],
                rowData = rowListObj.rowData,
                rowIndxObj = this.getRowIndx({
                    rowData: rowData,
                    dataUF: true
                }),
                uf = rowIndxObj.uf,
                rowIndx = rowIndxObj.rowIndx;
            rowListObj.uf = uf;
            rowListObj.rowIndx = rowIndx
        }
        rowList.sort(function(a, b) {
            return b.rowIndx - a.rowIndx
        });
        for (i = 0; i < len; i++) {
            var rowListObj = rowList[i],
                rowData = rowListObj.rowData,
                uf = rowListObj.uf,
                rowIndx = rowListObj.rowIndx;
            if (track) {
                iUCData["delete"]({
                    rowIndx: rowIndx,
                    rowData: rowData
                })
            }
            var rowIndxPage = rowIndx - offset,
                indx = remotePaging ? rowIndxPage : rowIndx;
            if (uf) {
                DM.dataUF.splice(rowIndx, 1)
            } else {
                var remArr = data.splice(indx, 1);
                if (remArr && remArr.length && remotePaging) {
                    PM.totalRecords--
                }
            }
        }
    };
    fn.cacheRIs = function() {
        var DM = this.options.dataModel;
        DM.data.forEach(function(rd, i) {
            rd.pq_ri = i
        });
        DM.dataUF.forEach(function(rd, i) {
            rd.pq_ri_uf = i
        })
    };
    fn.getRI = function(rd) {
        return rd.pq_ri != null ? rd.pq_ri : rd.pq_ri_uf
    };
    fn.refreshColumn = function(ui) {
        var obj = this.normalize(ui);
        var initV = this.initV,
            finalV = this.finalV,
            freezeRows = this.options.freezeRows,
            colIndx = obj.colIndx,
            dataIndx = obj.dataIndx,
            column = obj.column;
        obj.skip = true;
        for (var rip = 0; rip <= finalV; rip++) {
            if (rip < initV && rip >= freezeRows) {
                rip = initV
            }
            obj.rowIndxPage = rip;
            this.refreshCell(obj)
        }
        this._trigger("refreshColumn", null, {
            column: column,
            colIndx: colIndx,
            dataIndx: dataIndx
        });
      this.iRefresh.softRefresh()
    };
    fn.refreshCell = function(ui) {
        var obj = this.normalize(ui);
        if (!this.pdata) return;
        var skip = obj.skip,
            ri = obj.rowIndx,
            rip = obj.rowIndxPage,
            ci = obj.colIndx,
            iM = this.iMerge,
            rowData = obj.rowData;
        if (!rowData) {
            return
        }
        var $td = this.getCell({
            all: true,
            rowIndxPage: rip,
            colIndx: ci
        });
        if ($td && $td.length > 0) {
            var objRender = obj;
            if (iM.ismergedCell(ri, ci)) {
                objRender = iM.getRootCell(ri, ci, "a")
            }
            var tdStr = this.iGenerateView.renderCell(objRender),
                _fe;
            if (!tdStr) {
                return
            }
            $td.replaceWith(tdStr);
            if ((_fe = this._focusEle) && _fe.rowIndxPage == rip) {
                this.focus()
            }
            this._trigger("refreshCell", null, obj);
            if (!skip) {
                this.iRefresh.softRefresh()
            }
        }
    };
    fn.refreshRow = function(_obj) {
        var obj = this.normalize(_obj);
        if (!this.pdata) return;
        var that = this,
            ri = obj.rowIndx,
            rip = obj.rowIndxPage,
            o = that.options,
            freezeRows = o.freezeRows,
            rowData = obj.rowData;
        if (!rowData || rowData.pq_hidden || rip > that.finalV || rip < that.initV && rip >= freezeRows) {
            return null
        }
        var $trOld = this.getRow({
                all: true,
                rowIndxPage: rip
            }),
            _fe, buffer = [];
        that.iGenerateView.refreshRow(rip, buffer);
        var trStr = buffer.join("");
        if ($trOld && $trOld.length) {
            $trOld.replaceWith(trStr)
        } else if (o.virtualY) {
            if (rip == that.finalV) {
                that.$tbl.append(trStr)
            } else if (rip == that.initV) {
                var $tbls = that.$tbl;
                for (var i = 0; i < $tbls.length; i++) {
                    $($tbls[i]).children("tbody").children(freezeRows ? ".pq-last-frozen-row" : "tr:first").after(trStr)
                }
            } else {
                throw "refreshRow > rip not found"
            }
        } else {
            return false
        }
        if ((_fe = this._focusEle) && _fe.rowIndxPage == rip) {
            that.focus()
        }
        this._trigger("refreshRow", null, {
            rowData: rowData,
            rowIndx: ri,
            rowIndxPage: rip
        });
        if (obj.refresh !== false) {
            this.iRefresh.softRefresh()
        }
        return true
    };
    fn.quitEditMode = function(objP) {
        if (this._quitEditMode) {
            return
        }
        var that = this,
            old = false,
            silent = false,
            fireOnly = false,
            o = this.options,
            EM = o.editModel,
            EMIndices = EM.indices,
            evt = undefined;
        that._quitEditMode = true;
        if (objP) {
            old = objP.old;
            silent = objP.silent;
            fireOnly = objP.fireOnly;
            evt = objP.evt
        }
        if (EMIndices) {
            if (!silent && !old) {
                this._trigger("editorEnd", evt, EMIndices)
            }
            if (!fireOnly) {
                this._removeEditOutline(objP);
                EM.indices = null
            }
        }
        that._quitEditMode = null
    };
    fn.getViewPortRowsIndx = function() {
        return {
            beginIndx: this.initV,
            endIndx: this.finalV
        }
    };
    fn.getViewPortIndx = function() {
        return {
            initV: this.initV,
            finalV: this.finalV,
            initH: this.initH,
            finalH: this.finalH
        }
    };
    fn.getRIOffset = function() {
        return this.riOffset
    };
    fn.getEditCell = function() {
        var EM = this.options.editModel;
        if (EM.indices) {
            var $td = this.getCell(EM.indices),
                $cell = this.$div_focus.children(".pq-editor-inner"),
                $editor = $cell.find(".pq-editor-focus");
            return {
                $td: $td,
                $cell: $cell,
                $editor: $editor
            }
        } else {
            return {}
        }
    };
    fn.editCell = function(ui) {
        var obj = this.normalize(ui);
        var iM = this.iMerge,
            ri = obj.rowIndx,
            ci = obj.colIndx;
        if (iM.ismergedCell(ri, ci)) {
            var obj2 = iM.getRootCell(ri, ci, "o");
            if (obj2.rowIndx != obj.rowIndx || obj2.colIndx != obj.colIndx) {
                return false
            }
        }
        this.scrollRow(obj);
        this.scrollColumn(obj);
        var $td = this.getCell(obj);
        if ($td && $td.length) {
            return this._editCell(obj)
        }
    };
    fn.getFirstEditableColIndx = function(objP) {
        if (objP.rowIndx == null) {
            throw "rowIndx NA"
        }
        if (!this.isEditableRow(objP)) {
            return -1
        }
        var CM = this.colModel;
        for (var i = 0; i < CM.length; i++) {
            objP.colIndx = i;
            if (!this.isEditableCell(objP)) {
                continue
            } else if (CM[i].hidden) {
                continue
            }
            return i
        }
        return -1
    };
    fn.editFirstCellInRow = function(objP) {
        var obj = this.normalize(objP),
            ri = obj.rowIndx,
            colIndx = this.getFirstEditableColIndx({
                rowIndx: ri
            });
        if (colIndx != -1) {
            this.editCell({
                rowIndx: ri,
                colIndx: colIndx
            })
        }
    };
    fn._editCell = function(_objP) {
        var objP = this.normalize(_objP);
        var that = this,
            evt = objP.evt,
            rip = objP.rowIndxPage,
            ci = objP.colIndx,
            pdata = that.pdata;
        if (!pdata || rip >= pdata.length) {
            return false
        }
        var that = this,
            o = this.options,
            EM = o.editModel,
            rowData = pdata[rip],
            rowIndx = objP.rowIndx,
            CM = this.colModel,
            column = CM[ci],
            dataIndx = column.dataIndx,
            cellData = that.readCell(rowData, column),
            objCall = {
                rowIndx: rowIndx,
                rowIndxPage: rip,
                cellData: cellData,
                rowData: rowData,
                dataIndx: dataIndx,
                colIndx: ci,
                column: column
            },
            ceditor = column.editor,
            grid = this,
            type_editor = typeof ceditor,
            ceditor = type_editor == "function" || type_editor == "string" ? grid.callFn(ceditor, objCall) : ceditor;
        if (ceditor === undefined && typeof o.geditor == "function") {
            ceditor = o.geditor.call(grid, objCall)
        }
        if (ceditor === false) {
            return
        }
        if (ceditor && ceditor.getData) {
            EM._getData = ceditor.getData
        }
        var geditor = o.editor,
            editor = ceditor ? $.extend({}, geditor, ceditor) : geditor,
            contentEditable = false;
        if (EM.indices) {
            var indxOld = EM.indices;
            if (indxOld.rowIndxPage == rip && indxOld.colIndx == ci) {
                this.refreshEditorPos();
                var $focus = this.$div_focus.find(".pq-editor-focus");
                $focus[0].focus();
                if (document.activeElement != $focus[0]) {
                    window.setTimeout(function() {
                        $focus.focus()
                    }, 0)
                }
                return false
            } else {
                if (this.blurEditor({
                        evt: evt
                    }) === false) {
                    return false
                }
                this.quitEditMode({
                    evt: evt
                })
            }
        }
        EM.indices = {
            rowIndxPage: rip,
            rowIndx: rowIndx,
            colIndx: ci,
            column: column,
            dataIndx: dataIndx
        };
        this._generateCellRowOutline();
        var $div_focus = this.$div_focus,
            $cell = $div_focus.children(".pq-editor-inner");
        $cell.addClass("pq-align-" + (column.align || "left"));
        objCall.$cell = $cell;
        var inp, edtype = editor.type,
            edSelect = objP.select == null ? editor.select : objP.select,
            edInit = editor.init,
            ed_valueIndx = editor.valueIndx,
            ed_dataMap = editor.dataMap,
            ed_mapIndices = editor.mapIndices,
            ed_mapIndices = ed_mapIndices ? ed_mapIndices : {},
            edcls = editor.cls || "",
            edcls = typeof edcls === "function" ? edcls.call(grid, objCall) : edcls,
            cls = "pq-editor-focus " + edcls,
            cls2 = cls + " pq-cell-editor ",
            attr = editor.attr || "",
            attr = typeof attr === "function" ? attr.call(grid, objCall) : attr,
            edstyle = editor.style || "",
            edstyle = typeof edstyle === "function" ? edstyle.call(grid, objCall) : edstyle,
            styleCE = edstyle ? "style='" + edstyle + "'" : "",
            style = styleCE,
            styleChk = styleCE;
        objCall.cls = cls;
        objCall.attr = attr;
        if (typeof edtype == "function") {
            inp = edtype.call(grid, objCall);
            if (inp) {
                edtype = inp
            }
        }
        geditor._type = edtype;
        if (edtype == "checkbox") {
            var subtype = editor.subtype;
            var checked = cellData ? "checked='checked'" : "";
            inp = "<input " + checked + " class='" + cls2 + "' " + attr + " " + styleChk + " type=checkbox name='" + dataIndx + "' />";
            $cell.html(inp);
            var $ele = $cell.children("input");
            if (subtype == "triple") {
                $ele.pqval({
                    val: cellData
                });
                $cell.click(function(evt) {
                    $(this).children("input").pqval({
                        incr: true
                    })
                })
            }
        } else if (edtype == "textarea" || edtype == "select" || edtype == "textbox") {
            if (edtype == "textarea") {
                inp = "<textarea class='" + cls2 + "' " + attr + " " + style + " name='" + dataIndx + "' ></textarea>"
            } else if (edtype == "select") {
                var options = editor.options || [];
                if (options.constructor !== Array) {
                    options = that.callFn(options, objCall)
                }
                var attrSelect = [attr, " class='", cls2, "' ", style, " name='", dataIndx, "'"].join("");
                inp = _pq.select({
                    options: options,
                    attr: attrSelect,
                    prepend: editor.prepend,
                    labelIndx: editor.labelIndx,
                    valueIndx: ed_valueIndx,
                    groupIndx: editor.groupIndx,
                    dataMap: ed_dataMap
                })
            } else {
                inp = "<input class='" + cls2 + "' " + attr + " " + style + " type=text name='" + dataIndx + "' />"
            }
            $(inp).appendTo($cell).val(edtype == "select" && ed_valueIndx != null && (ed_mapIndices[ed_valueIndx] || this.columns[ed_valueIndx]) ? ed_mapIndices[ed_valueIndx] ? rowData[ed_mapIndices[ed_valueIndx]] : rowData[ed_valueIndx] : cellData)
        } else if (!edtype || edtype == "contenteditable") {
            inp = "<div contenteditable='true' tabindx='0' " + styleCE + " " + attr + " class='" + cls2 + "'></div>";
            $cell.html(inp);
            $cell.children().html(cellData);
            contentEditable = true
        }
        if (edInit) {
            objCall.$editor = $cell.children(".pq-editor-focus");
            this.callFn(edInit, objCall)
        }
        var $focus = $cell.children(".pq-editor-focus"),
            FK = EM.filterKeys,
            cEM = column.editModel;
        if (cEM && cEM.filterKeys !== undefined) {
            FK = cEM.filterKeys
        }
        var objTrigger = {
            $cell: $cell,
            $editor: $focus,
            $td: that.getCell(EM.indices),
            dataIndx: dataIndx,
            column: column,
            colIndx: ci,
            rowIndx: rowIndx,
            rowIndxPage: rip,
            rowData: rowData
        };
        EM.indices = objTrigger;
        $focus.data({
            FK: FK
        }).on("click", function(evt) {
            $(this).focus();
            that._trigger("editorClick", null, objTrigger)
        }).on("keydown", function(evt) {
            that.iKeyNav.keyDownInEdit(evt)
        }).on("keypress", function(evt) {
            return that.iKeyNav.keyPressInEdit(evt, {
                FK: FK
            })
        }).on("keyup", function(evt) {
            return that.iKeyNav.keyUpInEdit(evt, {
                FK: FK
            })
        }).on("blur", function(evt, objP) {
            var o = that.options,
                EM = o.editModel,
                onBlur = EM.onBlur,
                saveOnBlur = onBlur == "save",
                validateOnBlur = onBlur == "validate",
                cancelBlurCls = EM.cancelBlurCls,
                force = objP ? objP.force : false;
            if (that._quitEditMode || that._blurEditMode) {
                return
            }
            if (!EM.indices) {
                return
            }
            var $this = $(evt.target);
            if (!force) {
                if (that._trigger("editorBlur", evt, objTrigger) === false) {
                    return
                }
                if (!onBlur) {
                    return
                }
                if (cancelBlurCls && $this.hasClass(cancelBlurCls)) {
                    return
                }
                if ($this.hasClass("hasDatepicker")) {
                    var $datepicker = $this.datepicker("widget");
                    if ($datepicker.is(":visible")) {
                        return false
                    }
                } else if ($this.hasClass("ui-autocomplete-input")) {
                    if ($this.autocomplete("widget").is(":visible")) {
                        return
                    }
                } else if ($this.hasClass("ui-multiselect")) {
                    if ($(".ui-multiselect-menu").is(":visible") || $(document.activeElement).closest(".ui-multiselect-menu").length) {
                        return
                    }
                } else if ($this.hasClass("pq-select-button")) {
                    if ($(".pq-select-menu").is(":visible") || $(document.activeElement).closest(".pq-select-menu").length) {
                        return
                    }
                }
            }
            that._blurEditMode = true;
            var silent = force || saveOnBlur || !validateOnBlur;
            if (!that.saveEditCell({
                    evt: evt,
                    silent: silent
                })) {
                if (!force && validateOnBlur) {
                    that._deleteBlurEditMode();
                    return false
                }
            }
            that.quitEditMode({
                evt: evt
            });
            that._deleteBlurEditMode()
        }).on("focus", function(evt) {
            that._trigger("editorFocus", evt, objTrigger)
        });
        that._trigger("editorBegin", evt, objTrigger);
        $focus.focus();
        window.setTimeout(function() {
            var $ae = $(document.activeElement);
            if ($ae.hasClass("pq-editor-focus") === false) {
                var $focus = that.element ? that.element.find(".pq-editor-focus") : $();
                $focus.focus()
            }
        });
        if (edSelect) {
            if (contentEditable) {
                try {
                    var el = $focus[0];
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range)
                } catch (ex) {}
            } else {
                $focus.select()
            }
        }
    };
    fn._deleteBlurEditMode = function(objP) {
        var that = this,
            objP = objP ? objP : {};
        if (that._blurEditMode) {
            if (objP.timer) {
                window.setTimeout(function() {
                    delete that._blurEditMode
                }, 0)
            } else {
                delete that._blurEditMode
            }
        }
    };
    fn.getRow = function(_obj) {
        var obj = this.normalize(_obj),
            rip = obj.rowIndxPage,
            $tbl = obj.all ? this.$tbl : this.get$Tbl(rip),
            $tr = $();
        if ($tbl && $tbl.length) {
            var $tbody = $tbl.children("tbody");
            if (rip != null) {
                $tr = $tbody.children("tr[pq-row-indx=" + rip + "]");
                if ($tr.length > $tbl.length) {
                    $tr = $tr.filter(".pq-detail-master")
                }
            }
        }
        return $tr
    };
    fn.getCell = function(_obj) {
        var all = _obj.all,
            o = this.options,
            obj = this.normalize(_obj),
            rip = obj.rowIndxPage,
            r1 = obj.rowIndx,
            ci = obj.colIndx;
        var iM = this.iMerge,
            isMerged = iM.ismergedCell(r1, ci);
        if (isMerged) {
            var uiM_a = iM.getRootCell(r1, ci, "a"),
                uiM_o = iM.getRootCell(r1, ci, "o");
            if ((rip !== uiM_o.rowIndxPage || ci !== uiM_o.colIndx) && (rip !== uiM_a.rowIndxPage || ci !== uiM_a.colIndx)) {
                return $()
            }
            rip = uiM_a.rowIndxPage;
            ci = uiM_o.colIndx
        } else {
            if (rip >= o.freezeRows && (rip < this.initV || rip > this.finalV) || ci >= o.freezeCols && (ci < this.initH || ci > this.finalH)) {
                return $()
            }
            if (!obj.rowData || !obj.column || obj.rowData.pq_hidden || obj.column.hidden) {
                return $()
            }
        }
        var $tbl = all ? this.$tbl : this.get$Tbl(rip, ci),
            $td;
        if ($tbl && $tbl.length) {
            $td = $tbl.children().children("tr[pq-row-indx=" + rip + "]").children("[pq-col-indx=" + ci + "]")
        } else {
            $td = $()
        }
        return $td
    };
    fn.getCellHeader = function(obj) {
        var colIndx = obj.colIndx,
            dataIndx = obj.dataIndx,
            colIndx = colIndx == null ? this.colIndxs[dataIndx] : colIndx,
            $tbl = this.$tbl_header,
            $td, options = this.options,
            freezeCols = options.freezeCols;
        if ($tbl) {
            if ($tbl.length > 1) {
                if (colIndx >= freezeCols) {
                    $tbl = $($tbl[1])
                } else {
                    $tbl = $($tbl[0])
                }
            }
            var $td = $tbl.find("[pq-col-indx=" + colIndx + "].pq-grid-col-leaf");
            return $td
        } else {
            return $()
        }
    };
    fn.getEditorIndices = function() {
        var obj = this.options.editModel.indices;
        if (!obj) {
            return null
        } else {
            return $.extend({}, obj)
        }
    };
    fn.getEditCellData = function() {
        var o = this.options,
            EM = o.editModel,
            obj = EM.indices;
        if (!obj) {
            return null
        }
        var colIndx = obj.colIndx,
            rowIndxPage = obj.rowIndxPage,
            rowIndx = obj.rowIndx,
            column = this.colModel[colIndx],
            ceditor = column.editor,
            geditor = o.editor,
            editor = ceditor ? $.extend({}, geditor, ceditor) : geditor,
            ed_valueIndx = editor.valueIndx,
            ed_labelIndx = editor.labelIndx,
            ed_mapIndices = editor.mapIndices,
            ed_mapIndices = ed_mapIndices ? ed_mapIndices : {},
            dataIndx = column.dataIndx,
            $div_focus = this.$div_focus,
            $cell = $div_focus.children(".pq-editor-inner"),
            dataCell;
        var getData = EM._getData || editor.getData;
        EM._getData = undefined;
        if (getData) {
            dataCell = this.callFn(getData, {
                $cell: $cell,
                rowData: obj.rowData,
                dataIndx: dataIndx,
                rowIndx: rowIndx,
                rowIndxPage: rowIndxPage,
                column: column,
                colIndx: colIndx
            })
        } else {
            var edtype = geditor._type;
            if (edtype == "checkbox") {
                var $ele = $cell.children();
                if (editor.subtype == "triple") {
                    dataCell = $ele.pqval()
                } else {
                    dataCell = $ele.is(":checked") ? true : false
                }
            } else if (edtype == "contenteditable") {
                dataCell = $cell.children().html()
            } else {
                var $ed = $cell.find('*[name="' + dataIndx + '"]');
                if ($ed && $ed.length) {
                    if (edtype == "select" && ed_valueIndx != null) {
                        if (!ed_mapIndices[ed_valueIndx] && !this.columns[ed_valueIndx]) {
                            dataCell = $ed.val()
                        } else {
                            dataCell = {};
                            dataCell[ed_mapIndices[ed_valueIndx] ? ed_mapIndices[ed_valueIndx] : ed_valueIndx] = $ed.val();
                            dataCell[ed_mapIndices[ed_labelIndx] ? ed_mapIndices[ed_labelIndx] : ed_labelIndx] = $ed.find("option:selected").text();
                            var dataMap = editor.dataMap;
                            if (dataMap) {
                                var jsonMap = $ed.find("option:selected").data("map");
                                if (jsonMap) {
                                    for (var k = 0; k < dataMap.length; k++) {
                                        var key = dataMap[k];
                                        dataCell[ed_mapIndices[key] ? ed_mapIndices[key] : key] = jsonMap[key]
                                    }
                                }
                            }
                        }
                    } else {
                        dataCell = $ed.val()
                    }
                } else {
                    var $ed = $cell.find(".pq-editor-focus");
                    if ($ed && $ed.length) {
                        dataCell = $ed.val()
                    }
                }
            }
        }
        return dataCell
    };
    fn.getCellIndices = function(objP) {
        var $td = objP.$td;
        if ($td == null || $td.length == 0 || $td.closest(".pq-grid")[0] != this.element[0]) {
            return {}
        }
        var $tr = $td.parent("tr");
        var rowIndxPage = $tr.attr("pq-row-indx"),
            rowIndx;
        if (rowIndxPage != null) {
            rowIndxPage = parseInt(rowIndxPage);
            rowIndx = rowIndxPage + this.riOffset
        }
        var colIndx = $td.attr("pq-col-indx"),
            dataIndx;
        if (colIndx != null) {
            colIndx = parseInt(colIndx);
            if (colIndx >= 0) {
                dataIndx = this.colModel[colIndx].dataIndx
            }
        }
        return this.iMerge.getRootCell(rowIndx, colIndx, "o")
    };
    fn.getRowsByClass = function(obj) {
        var options = this.options,
            DM = options.dataModel,
            PM = options.pageModel,
            remotePaging = PM.type == "remote",
            offset = this.riOffset,
            data = DM.data,
            rows = [];
        if (data == null) {
            return rows
        }
        for (var i = 0, len = data.length; i < len; i++) {
            var rd = data[i];
            if (rd.pq_rowcls) {
                obj.rowData = rd;
                if (this.hasClass(obj)) {
                    var row = {
                            rowData: rd
                        },
                        ri = remotePaging ? i + offset : i,
                        rip = ri - offset;
                    row.rowIndx = ri;
                    row.rowIndxPage = rip;
                    rows.push(row)
                }
            }
        }
        return rows
    };
    fn.getCellsByClass = function(obj) {
        var that = this,
            options = this.options,
            DM = options.dataModel,
            PM = options.pageModel,
            remotePaging = PM.type == "remote",
            offset = this.riOffset,
            data = DM.data,
            cells = [];
        if (data == null) {
            return cells
        }
        for (var i = 0, len = data.length; i < len; i++) {
            var rd = data[i],
                ri = remotePaging ? i + offset : i,
                cellcls = rd.pq_cellcls;
            if (cellcls) {
                for (var di in cellcls) {
                    var ui = {
                        rowData: rd,
                        rowIndx: ri,
                        dataIndx: di,
                        cls: obj.cls
                    };
                    if (that.hasClass(ui)) {
                        var cell = that.normalize(ui);
                        cells.push(cell)
                    }
                }
            }
        }
        return cells
    };
    fn.data = function(objP) {
        var dataIndx = objP.dataIndx,
            colIndx = objP.colIndx,
            dataIndx = colIndx != null ? this.colModel[colIndx].dataIndx : dataIndx,
            data = objP.data,
            readOnly = data == null || typeof data == "string" ? true : false,
            rowData = objP.rowData || this.getRowData(objP);
        if (!rowData) {
            return {
                data: null
            }
        }
        if (dataIndx == null) {
            var rowdata = rowData.pq_rowdata;
            if (readOnly) {
                var ret;
                if (rowdata != null) {
                    if (data == null) {
                        ret = rowdata
                    } else {
                        ret = rowdata[data]
                    }
                }
                return {
                    data: ret
                }
            }
            var finalData = $.extend(true, rowData.pq_rowdata, data);
            rowData.pq_rowdata = finalData
        } else {
            var celldata = rowData.pq_celldata;
            if (readOnly) {
                var ret;
                if (celldata != null) {
                    var a = celldata[dataIndx];
                    if (data == null || a == null) {
                        ret = a
                    } else {
                        ret = a[data]
                    }
                }
                return {
                    data: ret
                }
            }
            if (!celldata) {
                rowData.pq_celldata = {}
            }
            var finalData = $.extend(true, rowData.pq_celldata[dataIndx], data);
            rowData.pq_celldata[dataIndx] = finalData
        }
    };
    fn.attr = function(objP) {
        var rowIndx = objP.rowIndx,
            dataIndx = objP.dataIndx,
            colIndx = objP.colIndx,
            dataIndx = colIndx != null ? this.colModel[colIndx].dataIndx : dataIndx,
            attr = objP.attr,
            readOnly = attr == null || typeof attr == "string" ? true : false,
            offset = this.riOffset,
            refresh = objP.refresh,
            rowData = objP.rowData || this.getRowData(objP);
        if (!rowData) {
            return {
                attr: null
            }
        }
        if (!readOnly && refresh !== false && rowIndx == null) {
            rowIndx = this.getRowIndx({
                rowData: rowData
            }).rowIndx
        }
        if (dataIndx == null) {
            var rowattr = rowData.pq_rowattr;
            if (readOnly) {
                var ret;
                if (rowattr != null) {
                    if (attr == null) {
                        ret = rowattr
                    } else {
                        ret = rowattr[attr]
                    }
                }
                return {
                    attr: ret
                }
            }
            var finalAttr = $.extend(true, rowData.pq_rowattr, attr);
            rowData.pq_rowattr = finalAttr;
            if (refresh !== false && rowIndx != null) {
                var $tr = this.getRow({
                    rowIndxPage: rowIndx - offset
                });
                if ($tr) {
                    var strFinalAttr = this.stringifyAttr(finalAttr);
                    $tr.attr(strFinalAttr)
                }
            }
        } else {
            var cellattr = rowData.pq_cellattr;
            if (readOnly) {
                var ret;
                if (cellattr != null) {
                    var a = cellattr[dataIndx];
                    if (attr == null || a == null) {
                        ret = a
                    } else {
                        ret = a[attr]
                    }
                }
                return {
                    attr: ret
                }
            }
            if (!cellattr) {
                rowData.pq_cellattr = {}
            }
            var finalAttr = $.extend(true, rowData.pq_cellattr[dataIndx], attr);
            rowData.pq_cellattr[dataIndx] = finalAttr;
            if (refresh !== false && rowIndx != null) {
                var $td = this.getCell({
                    rowIndxPage: rowIndx - offset,
                    dataIndx: dataIndx
                });
                if ($td) {
                    var strFinalAttr = this.stringifyAttr(finalAttr);
                    $td.attr(strFinalAttr)
                }
            }
        }
    };
    fn.stringifyAttr = function(attr) {
        var newAttr = {};
        for (var key in attr) {
            var val = attr[key];
            if (val) {
                if (key == "title") {
                    val = val.replace(/\"/g, "&quot;");
                    newAttr[key] = val
                } else if (key == "style" && typeof val == "object") {
                    var val2 = [],
                        val22;
                    for (var kk in val) {
                        val22 = val[kk];
                        if (val22) {
                            val2.push(kk + ":" + val22)
                        }
                    }
                    val = val2.join(";") + (val2.length ? ";" : "");
                    if (val) {
                        newAttr[key] = val
                    }
                } else {
                    if (typeof val == "object") {
                        val = JSON.stringify(val)
                    }
                    newAttr[key] = val
                }
            }
        }
        return newAttr
    };
    fn.removeData = function(objP) {
        var dataIndx = objP.dataIndx,
            colIndx = objP.colIndx,
            dataIndx = colIndx != null ? this.colModel[colIndx].dataIndx : dataIndx,
            data = objP.data,
            data = data == null ? [] : data,
            datas = typeof data == "string" ? data.split(" ") : data,
            datalen = datas.length,
            rowData = objP.rowData || this.getRowData(objP);
        if (!rowData) {
            return
        }
        if (dataIndx == null) {
            var rowdata = rowData.pq_rowdata;
            if (rowdata) {
                if (datalen) {
                    for (var i = 0; i < datalen; i++) {
                        var key = datas[i];
                        delete rowdata[key]
                    }
                }
                if (!datalen || $.isEmptyObject(rowdata)) {
                    delete rowData.pq_rowdata
                }
            }
        } else {
            var celldata = rowData.pq_celldata;
            if (celldata && celldata[dataIndx]) {
                var a = celldata[dataIndx];
                if (datalen) {
                    for (var i = 0; i < datalen; i++) {
                        var key = datas[i];
                        delete a[key]
                    }
                }
                if (!datalen || $.isEmptyObject(a)) {
                    delete celldata[dataIndx]
                }
            }
        }
    };
    fn.removeAttr = function(objP) {
        var rowIndx = objP.rowIndx,
            dataIndx = objP.dataIndx,
            colIndx = objP.colIndx,
            dataIndx = colIndx != null ? this.colModel[colIndx].dataIndx : dataIndx,
            attr = objP.attr,
            attr = attr == null ? [] : attr,
            attrs = typeof attr == "string" ? attr.split(" ") : attr,
            attrlen = attrs.length,
            rowIndxPage = rowIndx - this.riOffset,
            refresh = objP.refresh,
            rowData = objP.rowData || this.getRowData(objP);
        if (!rowData) {
            return
        }
        if (refresh !== false && rowIndx == null) {
            rowIndx = this.getRowIndx({
                rowData: rowData
            }).rowIndx
        }
        if (dataIndx == null) {
            var rowattr = rowData.pq_rowattr;
            if (rowattr) {
                if (attrlen) {
                    for (var i = 0; i < attrlen; i++) {
                        var key = attrs[i];
                        delete rowattr[key]
                    }
                } else {
                    for (var key in rowattr) {
                        attrs.push(key)
                    }
                }
                if (!attrlen || $.isEmptyObject(rowattr)) {
                    delete rowData.pq_rowattr
                }
            }
            if (refresh !== false && rowIndx != null && attrs.length) {
                attr = attrs.join(" ");
                var $tr = this.getRow({
                    rowIndxPage: rowIndxPage
                });
                if ($tr) {
                    $tr.removeAttr(attr)
                }
            }
        } else {
            var cellattr = rowData.pq_cellattr;
            if (cellattr && cellattr[dataIndx]) {
                var a = cellattr[dataIndx];
                if (attrlen) {
                    for (var i = 0; i < attrlen; i++) {
                        var key = attrs[i];
                        delete a[key]
                    }
                } else {
                    for (var key in a) {
                        attrs.push(key)
                    }
                }
                if (!attrlen || $.isEmptyObject(a)) {
                    delete cellattr[dataIndx]
                }
            }
            if (refresh !== false && rowIndx != null && attrs.length) {
                attr = attrs.join(" ");
                var $td = this.getCell({
                    rowIndxPage: rowIndxPage,
                    dataIndx: dataIndx
                });
                if ($td) {
                    $td.removeAttr(attr)
                }
            }
        }
    };
    fn.normalize = function(ui, data) {
        var obj = {},
            offset, CM, key;
        for (key in ui) {
            obj[key] = ui[key]
        }
        var ri = obj.rowIndx,
            rip = obj.rowIndxPage,
            di = obj.dataIndx,
            ci = obj.colIndx;
        if (rip != null || ri != null) {
            offset = this.riOffset;
            ri = ri == null ? rip * 1 + offset : ri;
            rip = rip == null ? ri * 1 - offset : rip;
            obj.rowIndx = ri;
            obj.rowIndxPage = rip;
            obj.rowData = obj.rowData || data && data[ri] || this.getRowData(obj)
        }
        if (ci != null || di != null) {
            CM = this.colModel;
            di = di == null ? CM[ci] ? CM[ci].dataIndx : undefined : di, ci = ci == null ? this.colIndxs[di] : ci;
            obj.column = CM[ci];
            obj.colIndx = ci;
            obj.dataIndx = di
        }
        return obj
    };
    fn.normalizeList = function(list) {
        var self = this,
            data = self.get_p_data();
        return list.map(function(rObj) {
            return self.normalize(rObj, data)
        })
    };
    fn.addClass = function(_objP) {
        var objP = this.normalize(_objP),
            rip = objP.rowIndxPage,
            dataIndx = objP.dataIndx,
            uniqueArray = pq.arrayUnique,
            objcls = objP.cls,
            newcls, refresh = objP.refresh,
            rowData = objP.rowData;
        if (!rowData) {
            return
        }
        if (refresh !== false && rip == null) {
            rip = this.getRowIndx({
                rowData: rowData
            }).rowIndxPage
        }
        if (dataIndx == null) {
            var rowcls = rowData.pq_rowcls;
            if (rowcls) {
                newcls = rowcls + " " + objcls
            } else {
                newcls = objcls
            }
            newcls = uniqueArray(newcls.split(/\s+/)).join(" ");
            rowData.pq_rowcls = newcls;
            if (refresh !== false && rip != null) {
                var $tr = this.getRow({
                    rowIndxPage: rip
                });
                if ($tr) {
                    $tr.addClass(objcls)
                }
            }
        } else {
            var dataIndxs = [];
            if (typeof dataIndx.push != "function") {
                dataIndxs.push(dataIndx)
            } else {
                dataIndxs = dataIndx
            }
            var pq_cellcls = rowData.pq_cellcls;
            if (!pq_cellcls) {
                pq_cellcls = rowData.pq_cellcls = {}
            }
            for (var j = 0, len = dataIndxs.length; j < len; j++) {
                dataIndx = dataIndxs[j];
                var cellcls = pq_cellcls[dataIndx];
                if (cellcls) {
                    newcls = cellcls + " " + objcls
                } else {
                    newcls = objcls
                }
                newcls = uniqueArray(newcls.split(/\s+/)).join(" ");
                pq_cellcls[dataIndx] = newcls;
                if (refresh !== false && rip != null) {
                    var $td = this.getCell({
                        rowIndxPage: rip,
                        dataIndx: dataIndx
                    });
                    if ($td) {
                        $td.addClass(objcls)
                    }
                }
            }
        }
    };
    fn.removeClass = function(_objP) {
        var objP = this.normalize(_objP);
        var rowIndx = objP.rowIndx,
            rowData = objP.rowData,
            dataIndx = objP.dataIndx,
            cls = objP.cls,
            refresh = objP.refresh;
        if (!rowData) {
            return
        }
        var pq_cellcls = rowData.pq_cellcls,
            pq_rowcls = rowData.pq_rowcls;
        if (refresh !== false && rowIndx == null) {
            rowIndx = this.getRowIndx({
                rowData: rowData
            }).rowIndx
        }
        if (dataIndx == null) {
            if (pq_rowcls) {
                rowData.pq_rowcls = this._removeClass(pq_rowcls, cls);
                if (rowIndx != null && refresh !== false) {
                    var $tr = this.getRow({
                        rowIndx: rowIndx
                    });
                    if ($tr) {
                        $tr.removeClass(cls)
                    }
                }
            }
        } else if (pq_cellcls) {
            var dataIndxs = [];
            if (typeof dataIndx.push != "function") {
                dataIndxs.push(dataIndx)
            } else {
                dataIndxs = dataIndx
            }
            for (var i = 0, len = dataIndxs.length; i < len; i++) {
                var dataIndx = dataIndxs[i];
                var cellClass = pq_cellcls[dataIndx];
                if (cellClass) {
                    rowData.pq_cellcls[dataIndx] = this._removeClass(cellClass, cls);
                    if (rowIndx != null && refresh !== false) {
                        var $td = this.getCell({
                            rowIndx: rowIndx,
                            dataIndx: dataIndx
                        });
                        if ($td) {
                            $td.removeClass(cls)
                        }
                    }
                }
            }
        }
    };
    fn.hasClass = function(obj) {
        var dataIndx = obj.dataIndx,
            cls = obj.cls,
            rowData = this.getRowData(obj),
            re = new RegExp("\\b" + cls + "\\b"),
            str;
        if (rowData) {
            if (dataIndx == null) {
                str = rowData.pq_rowcls;
                if (str && re.test(str)) {
                    return true
                } else {
                    return false
                }
            } else {
                var objCls = rowData.pq_cellcls;
                if (objCls && objCls[dataIndx] && re.test(objCls[dataIndx])) {
                    return true
                } else {
                    return false
                }
            }
        } else {
            return null
        }
    };
    fn._removeClass = function(str, str2) {
        if (str && str2) {
            var arr = str.split(/\s+/),
                arr2 = str2.split(/\s+/),
                arr3 = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var cls = arr[i],
                    found = false;
                for (var j = 0, len2 = arr2.length; j < len2; j++) {
                    var cls2 = arr2[j];
                    if (cls === cls2) {
                        found = true;
                        break
                    }
                }
                if (!found) {
                    arr3.push(cls)
                }
            }
            if (arr3.length > 1) {
                return arr3.join(" ")
            } else if (arr3.length === 1) {
                return arr3[0]
            } else {
                return null
            }
        }
    };
    fn.getRowIndx = function(obj) {
        var $tr = obj.$tr,
            rowData = obj.rowData,
            rowIndxPage, rowIndx, ri, offset = this.riOffset;
        if (rowData) {
            if ((ri = rowData.pq_ri) != null) {
                return {
                    rowData: rowData,
                    rowIndx: ri,
                    rowIndxPage: ri - offset
                }
            }
            var data = this.get_p_data(),
                uf = false,
                dataUF = obj.dataUF ? this.options.dataModel.dataUF : null,
                _found = false;
            if (data) {
                for (var i = 0, len = data.length; i < len; i++) {
                    if (data[i] == rowData) {
                        _found = true;
                        break
                    }
                }
            }
            if (!_found && dataUF) {
                uf = true;
                for (var i = 0, len = dataUF.length; i < len; i++) {
                    if (dataUF[i] == rowData) {
                        _found = true;
                        break
                    }
                }
            }
            if (_found) {
                rowIndxPage = i - offset;
                rowIndx = i;
                return {
                    rowIndxPage: uf ? undefined : rowIndxPage,
                    uf: uf,
                    rowIndx: rowIndx,
                    rowData: rowData
                }
            } else {
                return {}
            }
        } else {
            if ($tr == null || $tr.length == 0) {
                return {}
            }
            rowIndxPage = $tr.attr("pq-row-indx");
            if (rowIndxPage == null) {
                return {}
            }
            rowIndxPage = parseInt(rowIndxPage);
            return {
                rowIndxPage: rowIndxPage,
                rowIndx: rowIndxPage + offset
            }
        }
    };
    fn.search = function(ui) {
        var o = this.options,
            row = ui.row,
            first = ui.first,
            DM = o.dataModel,
            PM = o.pageModel,
            paging = PM.type,
            rowList = [],
            offset = this.riOffset,
            remotePaging = paging == "remote",
            data = DM.data;
        for (var i = 0, len = data.length; i < len; i++) {
            var rowData = data[i],
                _found = true;
            for (var dataIndx in row) {
                if (row[dataIndx] !== rowData[dataIndx]) {
                    _found = false
                }
            }
            if (_found) {
                var ri = remotePaging ? i + offset : i,
                    obj = this.normalize({
                        rowIndx: ri
                    });
                rowList.push(obj);
                if (first) {
                    break
                }
            }
        }
        return rowList
    };
    fn._calcNumHiddenFrozens = function() {
        var num_hidden = 0,
            freezeCols = this.options.freezeCols;
        for (var i = 0; i < freezeCols; i++) {
            if (this.colModel[i].hidden) {
                num_hidden++
            }
        }
        return num_hidden
    };
    fn._calcNumHiddenUnFrozens = function(colIndx) {
        var num_hidden = 0,
            freezeCols = this.options.freezeCols;
        var len = colIndx != null ? colIndx : this.colModel.length;
        for (var i = freezeCols; i < len; i++) {
            if (this.colModel[i].hidden) {
                num_hidden++
            }
        }
        return num_hidden
    };
    fn._getSBHeight = function() {
        return this.iRefresh.getSBHeight()
    };
    fn._getSBWidth = function() {
        return this.iRefresh.getSBWidth()
    };
    fn.getFirstVisibleRIP = function(view) {
        var data = this.pdata;
        for (var i = view ? this.initV : 0, len = data.length; i < len; i++) {
            if (!data[i].pq_hidden) {
                return i
            }
        }
    };
    fn.getLastVisibleRIP = function() {
        var data = this.pdata;
        for (var i = data.length - 1; i >= 0; i--) {
            if (!data[i].pq_hidden) {
                return i
            }
        }
        return null
    };
    fn.getFirstVisibleCI = function(view) {
        var CM = this.colModel,
            CMLength = CM.length;
        for (var i = view ? this.initH : 0; i < CMLength; i++) {
            var hidden = CM[i].hidden;
            if (!hidden) {
                return i
            }
        }
        return null
    };
    fn.getLastVisibleCI = function() {
        var CM = this.colModel,
            CMLength = CM.length;
        for (var i = CMLength - 1; i >= 0; i--) {
            var hidden = CM[i].hidden;
            if (!hidden) {
                return i
            }
        }
        return null
    };
    fn.getTotalVisibleColumns = function() {
        var CM = this.colModel,
            CMLength = CM.length,
            j = 0;
        for (var i = 0; i < CMLength; i++) {
            var column = CM[i],
                hidden = column.hidden;
            if (!hidden) {
                j++
            }
        }
        return j
    };
    fn._calcCurPosFromRowIndxPage = function(rip) {
        return rip < this.options.freezeRows ? 0 : pq.searchSeqArray(this.iRefresh.vrows, rip)
    };
    fn._calcCurPosFromColIndx = function(ci) {
        return ci < this.options.freezeCols ? 0 : pq.searchSeqArray(this.iRefresh.vcols, ci)
    };
    fn.calcWidthCols = function(colIndx1, colIndx2, _direct) {
        var wd = 0,
            o = this.options,
            cbWidth = 0,
            numberCell = o.numberCell,
            CM = this.colModel;
        if (colIndx1 == -1) {
            if (numberCell.show) {
                if (_direct) {
                    wd += numberCell.width * 1
                } else {
                    wd += numberCell.outerWidth
                }
            }
            colIndx1 = 0
        }
        if (_direct) {
            for (var i = colIndx1; i < colIndx2; i++) {
                var column = CM[i];
                if (column && !column.hidden) {
                    if (!column._width) {
                        throw "assert failed"
                    }
                    wd += column._width + cbWidth
                }
            }
        } else {
            for (var i = colIndx1; i < colIndx2; i++) {
                var column = CM[i];
                if (column && !column.hidden) {
                    wd += column.outerWidth
                }
            }
        }
        return wd
    };
    fn.calcHeightFrozenRows = function() {
        var $tbl = this.$tbl,
            ht = 0;
        if ($tbl && $tbl.length) {
            var $tr = $($tbl[0]).find("tr.pq-last-frozen-row");
            if ($tr && $tr.length) {
                var tr = $tr[0];
                ht = tr.offsetTop + tr.offsetHeight
            }
        }
        return ht
    };
    fn._calcRightEdgeCol = function(colIndx) {
        var wd = 0,
            cols = 0,
            CM = this.colModel,
            initH = this.initH,
            o = this.options,
            freezeCols = o.freezeCols,
            numberCell = o.numberCell;
        if (numberCell.show) {
            wd += numberCell.outerWidth;
            cols++
        }
        for (var col = 0; col <= colIndx; col++) {
            if (col < initH && col >= freezeCols) {
                col = initH
            }
            var column = CM[col];
            if (!column.hidden) {
                wd += column.outerWidth;
                cols++
            }
        }
        return {
            width: wd,
            cols: cols
        }
    };
    fn._createHeader = function() {
        this.iHeader.createHeader();
        if (this.options.showHeader) {
            this._trigger("createHeader")
        }
    };
    fn.createTable = function(objP) {
        objP.other = true;
        var iGV = this.iGenerateView;
        iGV.generateView(objP);
        iGV.scrollView()
    }
})(jQuery);
(function($) {
    "use strict";
    var cKeyNav = $.paramquery.cKeyNav = function(that) {
        this.that = that
    };
    cKeyNav.prototype = {
        bodyKeyPressDown: function(evt) {
            var that = this.that,
                offset = that.riOffset,
                rowIndx, rowIndxPage, colIndx, o = that.options,
                FM = o.formulasModel,
                iM = that.iMerge,
                _fe = that._focusEle,
                SM = o.selectionModel,
                EM = o.editModel,
                ac = document.activeElement,
                $target, ctrlMeta = evt.ctrlKey || evt.metaKey,
                KC = $.ui.keyCode,
                keyCode = evt.keyCode;
            if (EM.indices) {
                that.$div_focus.find(".pq-cell-focus").focus();
                return
            }
            $target = $(evt.target);
            if ($target.hasClass("pq-grid-cell")) {
                _fe = that.getCellIndices({
                    $td: $target
                })
            } else {
                if (ac.id != "pq-grid-excel" && ac.className != "pq-grid-cont") {
                    return
                }
            }
            var cell = that.normalize(_fe),
                rowIndxPage = cell.rowIndxPage,
                rowIndx = cell.rowIndx,
                colIndx = cell.colIndx,
                pqN, rip2, pdata = that.pdata,
                uiTrigger = cell,
                preventDefault = true;
            if (rowIndx == null || colIndx == null || cell.rowData == null) {
                return
            }
            if (iM.ismergedCell(rowIndx, colIndx)) {
                uiTrigger = iM.getRootCell(rowIndx, colIndx, "o");
                cell = uiTrigger;
                rowIndxPage = cell.rowIndxPage;
                rowIndx = cell.rowIndx;
                colIndx = cell.colIndx;
                if (keyCode == KC.PAGE_UP || keyCode == KC.PAGE_DOWN || keyCode == KC.HOME || keyCode == KC.END) {
                    if (pqN = iM.getData(rowIndx, colIndx, "proxy_cell")) {
                        rip2 = pqN.rowIndx - offset;
                        if (!pdata[rip2].pq_hidden) {
                            rowIndxPage = rip2;
                            rowIndx = rowIndxPage + offset
                        }
                    }
                }
            }
            if (that._trigger("beforeCellKeyDown", evt, uiTrigger) == false) {
                return false
            }
            that._trigger("cellKeyDown", evt, uiTrigger);
            if (keyCode == KC.LEFT || keyCode == KC.RIGHT || keyCode == KC.UP || keyCode == KC.DOWN || SM.onTab && keyCode == KC.TAB) {
                var obj = null;
                if (keyCode == KC.LEFT || keyCode == KC.TAB && evt.shiftKey) {
                    obj = this.incrIndx(rowIndxPage, colIndx, false)
                } else if (keyCode == KC.RIGHT || keyCode == KC.TAB && !evt.shiftKey) {
                    obj = this.incrIndx(rowIndxPage, colIndx, true)
                } else if (keyCode == KC.UP) {
                    obj = this.decrRowIndx2(rowIndxPage, colIndx)
                } else if (keyCode == KC.DOWN) {
                    obj = this.incrRowIndx2(rowIndxPage, colIndx)
                }
                if (obj) {
                    rowIndx = obj.rowIndxPage + offset;
                    this.select({
                        rowIndx: rowIndx,
                        colIndx: obj.colIndx,
                        evt: evt
                    })
                }
            } else if (keyCode == KC.PAGE_DOWN || keyCode == KC.PAGE_UP) {
                var fn = keyCode == KC.PAGE_UP ? "pageUp" : "pageDown",
                    objPage = this[fn](rowIndxPage);
                if (objPage) {
                    rowIndxPage = objPage.rowIndxPage;
                    if (rowIndxPage != null) {
                        rowIndx = rowIndxPage + offset;
                        this.select({
                            rowIndx: rowIndx,
                            colIndx: colIndx,
                            evt: evt
                        })
                    }
                }
            } else if (keyCode == KC.HOME) {
                if (ctrlMeta) {
                    rowIndx = that.getFirstVisibleRIP() + offset
                } else {
                    colIndx = that.getFirstVisibleCI()
                }
                this.select({
                    rowIndx: rowIndx,
                    colIndx: colIndx,
                    evt: evt
                })
            } else if (keyCode == KC.END) {
                if (ctrlMeta) {
                    rowIndx = that.getLastVisibleRIP() + offset
                } else {
                    colIndx = that.getLastVisibleCI()
                }
                this.select({
                    rowIndx: rowIndx,
                    colIndx: colIndx,
                    evt: evt
                })
            } else if (keyCode == KC.ENTER) {
                rowIndxPage = uiTrigger.rowIndxPage;
                colIndx = uiTrigger.colIndx;
                var $td = that.getCell({
                    rowIndxPage: rowIndxPage,
                    colIndx: colIndx
                });
                if ($td && $td.length > 0) {
                    var rowIndx = rowIndxPage + offset,
                        isEditableRow = that.isEditableRow({
                            rowIndx: rowIndx
                        }),
                        isEditableCell = that.isEditableCell({
                            rowIndx: rowIndx,
                            colIndx: colIndx
                        });
                    if (isEditableRow && isEditableCell) {
                        that.editCell({
                            rowIndxPage: rowIndxPage,
                            colIndx: colIndx
                        })
                    } else {
                        var $button = $td.find("button");
                        if ($button.length) {
                            $($button[0]).click()
                        }
                    }
                }
            } else if (ctrlMeta && keyCode == "65") {
                var iSel = that.iSelection;
                if (SM.type == "row" && SM.mode != "single") {
                    that.iRows.toggleAll({
                        all: SM.all
                    })
                } else if (SM.type == "cell" && SM.mode != "single") {
                    iSel.selectAll({
                        type: "cell",
                        all: SM.all
                    })
                }
            } else if (EM.pressToEdit && (this.isEditKey(keyCode) || FM.on && keyCode == 187) && !ctrlMeta) {
                if (keyCode == 46) {
                    that.clear()
                } else {
                    rowIndxPage = uiTrigger.rowIndxPage;
                    colIndx = uiTrigger.colIndx;
                    $td = that.getCell({
                        rowIndxPage: rowIndxPage,
                        colIndx: colIndx
                    });
                    if ($td && $td.length) {
                        rowIndx = rowIndxPage + offset;
                        isEditableRow = that.isEditableRow({
                            rowIndx: rowIndx
                        });
                        isEditableCell = that.isEditableCell({
                            rowIndx: rowIndx,
                            colIndx: colIndx
                        });
                        if (isEditableRow && isEditableCell) {
                            that.editCell({
                                rowIndxPage: rowIndxPage,
                                colIndx: colIndx,
                                select: true
                            })
                        }
                    }
                    preventDefault = false
                }
            } else {
                preventDefault = false
            }
            if (preventDefault) {
                evt.preventDefault()
            }
        },
        decrPageSize: function() {
            var that = this.that,
                $tbl = that.$tbl,
                $trs = $tbl.children("tbody").children(".pq-grid-row"),
                freezeRows = that.options.freezeRows,
                pdata = that.pdata,
                lastRIP, rip = 0;
            if ($trs.length) {
                var $tr;
                if (freezeRows) {
                    $tr = $trs.filter("tr.pq-last-frozen-row");
                    if ($tr.length) {
                        $tr = $tr.next()
                    }
                } else if ($trs.length >= 2) {
                    $tr = $($trs[1])
                }
                if ($tr && $tr.length) {
                    var rip = that.getRowIndx({
                            $tr: $tr
                        }).rowIndxPage,
                        lastRIP = rip,
                        counter = 0,
                        pageSize = that.pageSize - 3;
                    for (var i = rip; i >= 0; i--) {
                        var rd = pdata[i];
                        if (!rd.pq_hidden) {
                            counter++;
                            lastRIP = i;
                            if (counter >= pageSize) {
                                break
                            }
                        }
                    }
                }
            }
            return {
                rowIndxPage: lastRIP
            }
        },
        decrRowIndx: function(rowIndxPage, noRows) {
            var that = this.that,
                newRowIndx = rowIndxPage,
                data = that.pdata,
                noRows = 1,
                counter = 0;
            for (var i = rowIndxPage - 1; i >= 0; i--) {
                var hidden = data[i].pq_hidden;
                if (!hidden) {
                    counter++;
                    newRowIndx = i;
                    if (counter == noRows) {
                        return newRowIndx
                    }
                }
            }
            return newRowIndx
        },
        decrRowIndx2: function(rip, ci) {
            var that = this.that,
                offset = that.riOffset,
                ri = rip + offset,
                iM = that.iMerge,
                merge, pqN, data = that.pdata;
            if (merge = iM.ismergedCell(ri, ci)) {
                var uiIM_a = iM.getRootCell(ri, ci, "a"),
                    pqN = iM.getData(ri, ci, "proxy_cell"),
                    ci = uiIM_a.colIndx;
                ci = pqN ? pqN.colIndx : ci
            }
            for (var i = rip - 1; i >= 0; i--) {
                var hidden = data[i].pq_hidden;
                if (!hidden) {
                    rip = i;
                    break
                }
            }
            return {
                rowIndxPage: rip,
                colIndx: ci
            }
        },
        getMergeCell: function(rowIndx, colIndx) {
            var that = this.that,
                o = that.options,
                iM = that.iMerge,
                obj, obj_o;
            if (iM.ismergedCell(rowIndx, colIndx)) {
                obj_o = iM.getRootCell(rowIndx, colIndx, "o");
                iM.setData(obj_o.rowIndx, obj_o.colIndx, {
                    proxy_cell: {
                        rowIndx: rowIndx,
                        colIndx: colIndx
                    }
                });
                if (o.virtualY) {
                    obj = iM.getRootCell(rowIndx, colIndx, "a")
                }
            }
            if (!obj) {
                rowIndx = this.getVisibleRowIndx(rowIndx);
                colIndx = this.getVisibleColIndx(colIndx);
                obj = that.normalize({
                    rowIndx: rowIndx,
                    colIndx: colIndx
                })
            }
            return obj
        },
        getValText: function($editor) {
            var nodeName = $editor[0].nodeName.toLowerCase(),
                valsarr = ["input", "textarea", "select"],
                byVal = "text";
            if ($.inArray(nodeName, valsarr) != -1) {
                byVal = "val"
            }
            return byVal
        },
        getVisibleRowIndx: function(ri) {
            var that = this.that,
                pdata = that.pdata,
                pdLen = pdata.length,
                offset = that.riOffset,
                rip = ri - offset,
                rd = that.getRowData({
                    rowIndx: ri
                });
            while (rd.pq_hidden && rip < pdLen - 1) {
                rip++;
                ri++;
                rd = that.getRowData({
                    rowIndx: ri
                })
            }
            return ri
        },
        getVisibleColIndx: function(ci) {
            var that = this.that,
                CM = that.colModel,
                CMLen = CM.length,
                column = CM[ci];
            while (column.hidden && ci < CMLen - 1) {
                ci++;
                column = CM[ci]
            }
            return ci
        },
        incrEditIndx: function(rowIndxPage, colIndx, incr) {
            var that = this.that,
                CM = that.colModel,
                CMLength = CM.length,
                iM = that.iMerge,
                column, offset = that.riOffset,
                lastRowIndxPage = that[incr ? "getLastVisibleRIP" : "getFirstVisibleRIP"]();
            do {
                var rowIndx = rowIndxPage + offset,
                    merged = iM.ismergedCell(rowIndx, colIndx);
                if (merged) {
                    var pqN = iM.getData(rowIndx, colIndx, "proxy_edit_cell");
                    if (pqN) {
                        rowIndx = pqN.rowIndx;
                        rowIndxPage = rowIndx - offset
                    }
                    colIndx = incr ? colIndx + merged.colspan : colIndx - 1
                } else {
                    colIndx = incr ? colIndx + 1 : colIndx - 1
                }
                if (incr && colIndx >= CMLength || !incr && colIndx < 0) {
                    if (rowIndxPage == lastRowIndxPage) {
                        return null
                    }
                    do {
                        rowIndxPage = this[incr ? "incrRowIndx" : "decrRowIndx"](rowIndxPage);
                        var isEditableRow = that.isEditableRow({
                            rowIndxPage: rowIndxPage
                        });
                        if (rowIndxPage == lastRowIndxPage && isEditableRow == false) {
                            return null
                        }
                    } while (isEditableRow == false);
                    colIndx = incr ? 0 : CMLength - 1
                }
                rowIndx = rowIndxPage + offset;
                merged = iM.ismergedCell(rowIndx, colIndx);
                if (merged) {
                    var uiIM = iM.getRootCell(rowIndx, colIndx, "o");
                    iM.setData(uiIM.rowIndx, uiIM.colIndx, {
                        proxy_edit_cell: {
                            rowIndx: rowIndx,
                            colIndx: colIndx
                        }
                    });
                    rowIndx = uiIM.rowIndx;
                    colIndx = uiIM.colIndx
                }
                column = CM[colIndx];
                var isEditableCell = that.isEditableCell({
                        rowIndx: rowIndx,
                        colIndx: colIndx,
                        checkVisible: true
                    }),
                    ceditor = column.editor,
                    ceditor = typeof ceditor == "function" ? ceditor.call(that, that.normalize({
                        rowIndx: rowIndx,
                        colIndx: colIndx
                    })) : ceditor;
                rowIndxPage = rowIndx - offset
            } while (column && (column.hidden || isEditableCell == false || ceditor === false));
            return {
                rowIndxPage: rowIndxPage,
                colIndx: colIndx
            }
        },
        incrIndx: function(rowIndxPage, colIndx, incr) {
            var that = this.that,
                iM = that.iMerge,
                merged, pqN, rowIndx, rip2, column, pdata = that.pdata,
                offset = that.riOffset,
                lastRowIndxPage = that[incr ? "getLastVisibleRIP" : "getFirstVisibleRIP"](),
                CM = that.colModel,
                CMLength = CM.length;
            if (colIndx == null) {
                if (rowIndxPage == lastRowIndxPage) {
                    return null
                }
                rowIndxPage = this[incr ? "incrRowIndx" : "decrRowIndx"](rowIndxPage);
                return {
                    rowIndxPage: rowIndxPage
                }
            }
            do {
                rowIndx = rowIndxPage + offset;
                if (merged = iM.ismergedCell(rowIndx, colIndx)) {
                    if (!column && (pqN = iM.getData(rowIndx, colIndx, "proxy_cell"))) {
                        rip2 = pqN.rowIndx - offset;
                        if (!pdata[rip2].pq_hidden) {
                            rowIndxPage = rip2
                        }
                    }
                    if (pdata[rowIndxPage].pq_hidden) {
                        rowIndxPage = iM.getRootCell(rowIndx, colIndx).rowIndxPage
                    }
                    if (!column && incr) {
                        colIndx = colIndx + (merged && merged.colspan ? merged.colspan - 1 : 0)
                    }
                }
                colIndx = incr ? colIndx + 1 : colIndx - 1;
                if (incr && colIndx >= CMLength || !incr && colIndx < 0) {
                    if (rowIndxPage == lastRowIndxPage) {
                        return null
                    }
                    rowIndxPage = this[incr ? "incrRowIndx" : "decrRowIndx"](rowIndxPage);
                    colIndx = incr ? 0 : CMLength - 1
                }
                column = CM[colIndx]
            } while (column && column.hidden);
            return {
                rowIndxPage: rowIndxPage,
                colIndx: colIndx
            }
        },
        incrPageSize: function() {
            var that = this.that,
                $tbl = that.$tbl,
                $trs = $tbl.children("tbody").children(".pq-grid-row"),
                marginTop = parseInt($tbl.css("marginTop")),
                htContR = that.iRefresh.getEContHt() - marginTop;
            for (var i = $trs.length - 1; i >= 0; i--) {
                var tr = $trs[i];
                if (tr.offsetTop < htContR) {
                    break
                }
            }
            var rowIndxPage = that.getRowIndx({
                $tr: $(tr)
            }).rowIndxPage;
            return {
                rowIndxPage: rowIndxPage
            }
        },
        incrRowIndx: function(rowIndxPage, noRows) {
            var that = this.that,
                newRowIndx = rowIndxPage,
                noRows = 1,
                data = that.pdata,
                counter = 0;
            for (var i = rowIndxPage + 1, len = data.length; i < len; i++) {
                var hidden = data[i].pq_hidden;
                if (!hidden) {
                    counter++;
                    newRowIndx = i;
                    if (counter == noRows) {
                        return newRowIndx
                    }
                }
            }
            return newRowIndx
        },
        incrRowIndx2: function(rip, ci) {
            var that = this.that,
                offset = that.riOffset,
                ri = rip + offset,
                iM = that.iMerge,
                merge, pqN, data = that.pdata;
            if (merge = iM.ismergedCell(ri, ci)) {
                var uiIM_a = iM.getRootCell(ri, ci, "a"),
                    pqN = iM.getData(ri, ci, "proxy_cell"),
                    ci = uiIM_a.colIndx;
                rip = merge.rowspan ? rip + merge.rowspan - 1 : 0;
                ci = pqN ? pqN.colIndx : ci
            }
            for (var i = rip + 1, len = data.length; i < len; i++) {
                var hidden = data[i].pq_hidden;
                if (!hidden) {
                    rip = i;
                    break
                }
            }
            return {
                rowIndxPage: rip,
                colIndx: ci
            }
        },
        isEditKey: function(keyCode) {
            return keyCode >= 32 && keyCode <= 127 || keyCode == 189
        },
        keyDownInEdit: function(evt) {
            var that = this.that,
                o = that.options;
            var EMIndx = o.editModel.indices;
            if (!EMIndx) {
                return
            }
            var $this = $(evt.target),
                keyCodes = $.ui.keyCode,
                gEM = o.editModel,
                obj = $.extend({}, EMIndx),
                rowIndxPage = obj.rowIndxPage,
                colIndx = obj.colIndx,
                column = obj.column,
                cEM = column.editModel,
                EM = cEM ? $.extend({}, gEM, cEM) : gEM;
            var byVal = this.getValText($this);
            $this.data("oldVal", $this[byVal]());
            if (that._trigger("editorKeyDown", evt, obj) == false) {
                return false
            }
            if (evt.keyCode == keyCodes.TAB || evt.keyCode == EM.saveKey) {
                var onSave = evt.keyCode == keyCodes.TAB ? EM.onTab : EM.onSave,
                    obj = {
                        rowIndxPage: rowIndxPage,
                        colIndx: colIndx,
                        incr: onSave ? true : false,
                        edit: onSave == "nextEdit"
                    };
                return this.saveAndMove(obj, evt)
            } else if (evt.keyCode == keyCodes.ESCAPE) {
                that.quitEditMode({
                    evt: evt
                });
                that.focus({
                    rowIndxPage: rowIndxPage,
                    colIndx: colIndx
                });
                evt.preventDefault();
                return false
            } else if (evt.keyCode == keyCodes.PAGE_UP || evt.keyCode == keyCodes.PAGE_DOWN) {
                evt.preventDefault();
                return false
            } else if (EM.keyUpDown && !evt.altKey) {
                if (evt.keyCode == keyCodes.DOWN) {
                    var obj = this.incrRowIndx2(rowIndxPage, colIndx);
                    return this.saveAndMove(obj, evt)
                } else if (evt.keyCode == keyCodes.UP) {
                    var obj = this.decrRowIndx2(rowIndxPage, colIndx);
                    return this.saveAndMove(obj, evt)
                }
            }
            return
        },
        keyPressInEdit: function(evt, _objP) {
            var that = this.that,
                o = that.options,
                EMIndx = o.editModel.indices,
                objP = _objP || {},
                FK = objP.FK,
                column = EMIndx.column,
                KC = $.ui.keyCode,
                allowedKeys = ["BACKSPACE", "LEFT", "RIGHT", "UP", "DOWN", "DELETE", "HOME", "END"].map(function(kc) {
                    return KC[kc]
                }),
                dataType = column.dataType;
            if ($.inArray(evt.keyCode, allowedKeys) >= 0) {
                return true
            }
            if (that._trigger("editorKeyPress", evt, $.extend({}, EMIndx)) === false) {
                return false
            }
            if (FK && (dataType == "float" || dataType == "integer")) {
                var val = EMIndx.$editor.val(),
                    charsPermit = dataType == "float" ? "0123456789.-=" : "0123456789-=",
                    charC = evt.charCode || evt.keyCode,
                    chr = String.fromCharCode(charC);
                if (val[0] !== "=" && chr && charsPermit.indexOf(chr) == -1) {
                    return false
                }
            }
            return true
        },
        keyUpInEdit: function(evt, _objP) {
            var that = this.that,
                o = that.options,
                objP = _objP || {},
                FK = objP.FK,
                EM = o.editModel,
                EMIndices = EM.indices;
            that._trigger("editorKeyUp", evt, $.extend({}, EMIndices));
            var column = EMIndices.column,
                dataType = column.dataType;
            if (FK && (dataType == "float" || dataType == "integer")) {
                var $this = $(evt.target),
                    re = dataType == "integer" ? EM.reInt : EM.reFloat;
                var byVal = this.getValText($this);
                var oldVal = $this.data("oldVal");
                var newVal = $this[byVal]();
                if (re.test(newVal) == false && newVal[0] !== "=") {
                    if (re.test(oldVal)) {
                        $this[byVal](oldVal)
                    } else {
                        var val = dataType == "float" ? parseFloat(oldVal) : parseInt(oldVal);
                        if (isNaN(val)) {
                            $this[byVal](0)
                        } else {
                            $this[byVal](val)
                        }
                    }
                }
            }
        },
        pageNonVirtual: function(rowIndxPage, type) {
            var that = this.that,
                contHt = that.$cont[0].offsetHeight - that._getSBHeight();
            var $tr = that.getRow({
                rowIndxPage: rowIndxPage
            });
            var htTotal = 0,
                counter = 0,
                tr, $tr_prevAll = $($tr[0])[type]("tr.pq-grid-row"),
                len = $tr_prevAll.length;
            if (len > 0) {
                do {
                    tr = $tr_prevAll[counter];
                    var ht = tr.offsetHeight;
                    htTotal += ht;
                    if (htTotal >= contHt) {
                        break
                    }
                    counter++
                } while (counter < len);
                counter = counter > 0 ? counter - 1 : counter;
                do {
                    var $tr = $($tr_prevAll[counter]);
                    rowIndxPage = that.getRowIndx({
                        $tr: $tr
                    }).rowIndxPage;
                    if (rowIndxPage != null) {
                        break
                    } else {
                        counter--
                    }
                } while (counter >= 0)
            }
            return rowIndxPage
        },
        pageDown: function(rowIndxPage) {
            var that = this.that,
                o = that.options,
                vscroll = that.vscroll,
                old_cur_pos = vscroll.option("cur_pos"),
                num_eles = vscroll.option("num_eles"),
                ratio = vscroll.option("ratio");
            if (o.virtualY) {
                if (old_cur_pos < num_eles - 1) {
                    var rowIndxPage = this.incrPageSize().rowIndxPage,
                        calcCurPos = that._calcCurPosFromRowIndxPage(rowIndxPage);
                    if (calcCurPos == null) {
                        return
                    }
                    vscroll.option("cur_pos", calcCurPos);
                    vscroll.scroll()
                }
            } else {
                if (rowIndxPage != null) {
                    rowIndxPage = this.pageNonVirtual(rowIndxPage, "nextAll")
                } else if (ratio < 1) {
                    var contHt = that.iRefresh.getEContHt(),
                        iMS = that.iMouseSelection;
                    iMS.updateTableY(-1 * contHt);
                    iMS.syncScrollBarVert()
                }
            }
            return {
                rowIndxPage: rowIndxPage,
                curPos: calcCurPos
            }
        },
        pageUp: function(rowIndxPage) {
            var that = this.that,
                o = that.options,
                vscroll = that.vscroll;
            if (o.virtualY) {
                var old_cur_pos = vscroll.option("cur_pos");
                if (old_cur_pos > 0) {
                    var rowIndxPage = this.decrPageSize().rowIndxPage,
                        calcCurPos = that._calcCurPosFromRowIndxPage(rowIndxPage);
                    if (calcCurPos == null) {
                        return
                    }
                    vscroll.option("cur_pos", calcCurPos);
                    vscroll.scroll()
                }
            } else {
                var ratio = vscroll.option("ratio");
                if (rowIndxPage != null) {
                    rowIndxPage = this.pageNonVirtual(rowIndxPage, "prevAll")
                } else if (ratio > 0) {
                    var contHt = that.iRefresh.getEContHt(),
                        iMS = that.iMouseSelection;
                    iMS.updateTableY(contHt);
                    iMS.syncScrollBarVert()
                }
            }
            return {
                rowIndxPage: rowIndxPage,
                curPos: calcCurPos
            }
        },
        saveAndMove: function(objP, evt) {
            if (objP == null) {
                evt.preventDefault();
                return false
            }
            var that = this.that,
                rowIndxPage = objP.rowIndxPage,
                colIndx = objP.colIndx;
            that._blurEditMode = true;
            if (that.saveEditCell({
                    evt: evt
                }) === false || !that.pdata) {
                if (!that.pdata) {
                    that.quitEditMode(evt)
                }
                that._deleteBlurEditMode({
                    timer: true,
                    msg: "saveAndMove saveEditCell"
                });
                evt.preventDefault();
                return false
            }
            that.quitEditMode(evt);
            if (objP.incr) {
                var obj = this[objP.edit ? "incrEditIndx" : "incrIndx"](rowIndxPage, colIndx, !evt.shiftKey);
                rowIndxPage = obj ? obj.rowIndxPage : rowIndxPage;
                colIndx = obj ? obj.colIndx : colIndx
            }
            that.scrollRow({
                rowIndxPage: rowIndxPage
            });
            that.scrollColumn({
                colIndx: colIndx
            });
            var rowIndx = rowIndxPage + that.riOffset;
            this.select({
                rowIndx: rowIndx,
                colIndx: colIndx,
                evt: evt
            });
            if (objP.edit) {
                that._editCell({
                    rowIndxPage: rowIndxPage,
                    colIndx: colIndx
                })
            }
            that._deleteBlurEditMode({
                timer: true,
                msg: "saveAndMove"
            });
            evt.preventDefault();
            return false
        },
        select: function(objP) {
            var that = this.that,
                self = this,
                rowIndx = objP.rowIndx,
                colIndx = objP.colIndx,
                evt = objP.evt,
                objP = this.getMergeCell(rowIndx, colIndx),
                rowIndx = objP.rowIndx,
                colIndx = objP.colIndx,
                rowIndxPage = objP.rowIndxPage,
                o = that.options,
                iSel = that.iSelection,
                SM = o.selectionModel,
                type = SM.type,
                type_row = type == "row",
                type_cell = type == "cell",
                fn = o.realFocus ? function(fn2) {
                    clearTimeout(self.timeoutID);
                    self.timeoutID = setTimeout(function() {
                        if (that.options) {
                            fn2()
                        }
                    }, 0)
                } : function(fn2) {
                    fn2()
                };
            fn(function() {
                that.scrollCell({
                    rowIndx: rowIndx,
                    colIndx: colIndx
                });
                var areas = iSel.address();
                if (evt.shiftKey && evt.keyCode !== $.ui.keyCode.TAB && SM.type && SM.mode != "single" && (areas.length || type_row)) {
                    if (type_row) {
                        that.iRows.extend({
                            rowIndx: rowIndx,
                            evt: evt
                        })
                    } else {
                        var last = areas[areas.length - 1],
                            firstR = last.firstR,
                            firstC = last.firstC,
                            type = last.type,
                            expand = false;
                        if (type == "column") {
                            last.c1 = firstC;
                            last.c2 = colIndx;
                            last.r1 = last.r2 = last.type = undefined
                        } else {
                            areas = {
                                _type: "block",
                                r1: firstR,
                                r2: rowIndx,
                                c1: firstC,
                                c2: colIndx,
                                firstR: firstR,
                                firstC: firstC
                            };
                            expand = true
                        }
                        that.Range(areas, expand).select()
                    }
                } else {
                    if (type_row) {} else if (type_cell) {
                        that.Range({
                            r1: rowIndx,
                            c1: colIndx,
                            firstR: rowIndx,
                            firstC: colIndx
                        }).select()
                    }
                }
                that.focus({
                    rowIndxPage: rowIndxPage,
                    colIndx: colIndx
                })
            })
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        cGenerateView = _pq.cGenerateView = function(that) {
            this.that = that;
            var o = this.options = that.options,
                self = this;
            if (o.postRenderInterval != null) {
                that.on("refresh", function() {
                    if (self.prColDef.length) {
                        self.postRenderAll()
                    }
                }).on("refreshRow", function(evt, ui) {
                    if (self.prColDef.length) {
                        self.postRenderRow(ui)
                    }
                }).on("refreshCell", function(evt, ui) {
                    if (ui.column.postRender) {
                        self.postRenderRow(ui)
                    }
                }).on("refreshColumn", function(evt, ui) {
                    if (ui.column.postRender) {
                        self.setTimerPostRender(0, ui.colIndx, ui.column)
                    }
                })
            }
            if (!o.mergeModel.flex) {
                that.on("refresh refreshCell refreshRow refreshColumn", self.onRefreshMerge(that))
            }
        };
    cGenerateView.prototype = {
        appendRow: function(noRows) {
            var that = this.that,
                data = that.pdata,
                CM = that.colModel,
                finalV = that.finalV;
            if (finalV + noRows > data.length) {
                noRows = data.length - finalV
            }
            if (noRows) {
                if (noRows > 1) {
                    throw "noRows > 1"
                }
                that._trigger("beforeTableView", null, {
                    pageData: data,
                    initV: finalV,
                    finalV: finalV,
                    initH: that.initH,
                    finalH: that.finalH,
                    colModel: CM
                });
                that.refreshRow({
                    rowIndxPage: finalV,
                    refresh: false
                })
            }
            return noRows
        },
        createColDefs: function() {
            var that = this.that,
                CM = that.colModel,
                initH = that.initH,
                finalH = that.finalH,
                o = that.options,
                freezeCols = o.freezeCols,
                colDef = [],
                prColDef = [];
            for (var col = 0; col <= finalH; col++) {
                if (col < initH && col >= freezeCols) {
                    col = initH;
                    if (col > finalH) {
                        throw "initH>finalH";
                        break
                    }
                }
                var column = CM[col];
                if (column.hidden) {
                    continue
                }
                colDef.push({
                    column: column,
                    colIndx: col
                });
                if (column.postRender) {
                    prColDef.push({
                        column: column,
                        colIndx: col
                    })
                }
            }
            this.colDef = colDef;
            this.prColDef = prColDef
        },
        format: function() {
            var dp = $.datepicker,
                formatNumber = pq.formatNumber;
            return function(cellData, format) {
                if (pq.isDateFormat(format)) {
                    if (cellData == parseInt(cellData)) {
                        return pq.formulas.TEXT(cellData, pq.juiToExcel(format))
                    } else if (isNaN(Date.parse(cellData))) {
                        return
                    }
                    return dp.formatDate(format, new Date(cellData))
                } else {
                    return formatNumber(cellData, format)
                }
            }
        }(),
        generateTables: function(initV, finalV, objP) {
            objP = objP || {};
            var that = this.that,
                o = that.options,
                bootstrap = o.bootstrap,
                numberCell = o.numberCell,
                iRefresh = that.iRefresh,
                freezeRows = o.freezeRows * 1,
                row = 0,
                other = objP.other,
                finalRow = other ? objP.data.length - 1 : finalV,
                data;
            if (other) {
                data = objP.data
            } else {
                data = that.pdata;
                this.setFrozenRip(data, freezeRows)
            }
            if (!other && (initV == null || finalRow == null)) {
                return
            }
            var tblClass = ["pq-grid-table"];
            if (bootstrap.on) {
                tblClass.push(bootstrap.tbody)
            }
            if (o.columnBorders) {
                tblClass.push("pq-td-border-right")
            }
            if (o.rowBorders) {
                tblClass.push("pq-td-border-top")
            }
            tblClass.push(o.wrap ? "pq-wrap" : "pq-no-wrap");
            var buffer = ["<table class='" + tblClass.join(" ") + "' >"]; {
                buffer.push("<tr class='pq-row-hidden'>");
                if (numberCell.show) {
                    var wd = numberCell.width;
                    buffer.push("<td style='width:" + wd + "px;' ></td>")
                }
                var colDef = this.colDef;
                for (var i = 0, len = colDef.length; i < len; i++) {
                    var colD = colDef[i],
                        col = colD.colIndx,
                        column = colD.column,
                        wd = column.outerWidth;
                    buffer.push("<td style='width:", wd, "px;' pq-col-indx='", col, "'></td>")
                }
                buffer.push("</tr>")
            }
            for (var row = 0; row <= finalRow; row++) {
                if (row < initV && row >= freezeRows) {
                    row = initV
                }
                var rowData = data[row],
                    rip = row,
                    rowHidden = rowData ? rowData.pq_hidden : false;
                if (rowHidden) {
                    continue
                }
                var nestedshow = rowData.pq_detail && rowData.pq_detail.show;
                this.generateRow(rowData, rip, buffer, other, nestedshow);
                if (nestedshow) {
                    this.generateDetailRow(rowData, rip, buffer)
                }
            }
            buffer.push("</table>");
            return buffer.join("")
        },
        generateView: function(ui) {
            ui = ui || {};
            var self = this,
                that = this.that,
                o = that.options,
                flexWidth = o.width === "flex",
                flexHeight = o.height === "flex",
                cls = o.cls,
                cont_inner_cls = cls.cont_inner,
                cont_inner_b_cls = cls.cont_inner_b,
                initV, finalV, initH = that.initH,
                finalH = that.finalH,
                pqpanes = that.pqpanes;
            if (ui.$cont) {
                var strTbl = this.generateTables(null, null, ui),
                    $cont = ui.$cont;
                $cont.empty();
                if (pqpanes.v) {
                    $cont[0].innerHTML = ["<div class='", cont_inner_cls, "'>", strTbl, "</div>", "<div class='", cont_inner_cls, "'>", strTbl, "</div>"].join("")
                } else {
                    $cont[0].innerHTML = ["<div class='", cont_inner_cls, "'>", strTbl, "</div>"].join("")
                }
                var $div_child = $cont.children("div"),
                    $tbl = $div_child.children("table");
                that.tables[0] = {
                    $tbl: $tbl,
                    $cont: $cont
                }
            } else {
                initV = that.initV;
                finalV = that.finalV;
                var data = that.pdata;
                var $cont = that.$cont;
                if (o.editModel.indices != null) {
                    that.blurEditor({
                        force: true
                    })
                }
                var uiEvent = {
                    pageData: data,
                    initV: initV,
                    finalV: finalV,
                    initH: initH,
                    finalH: finalH,
                    source: ui.source
                };
                that._trigger("beforeTableView", null, uiEvent);
                var strTbl = self.generateTables(initV, finalV, ui);
                $cont.empty();
                if (that.totalVisibleRows === 0) {
                    $cont.append("<div class='" + cont_inner_cls + " pq-grid-norows' >" + o.strNoRows + "</div>")
                } else {
                    var style = flexHeight || flexWidth ? "style='position:relative;'" : "",
                        styleTbl = "";
                    if (pqpanes.h && pqpanes.v) {
                        $cont[0].innerHTML = ["<div class='", cont_inner_cls, "'>", strTbl, "</div>", "<div class='", cont_inner_cls, "'>", strTbl, "</div>", "<div class='", cont_inner_cls, " ", cont_inner_b_cls, "'>", strTbl, "</div>", "<div class='", cont_inner_cls, " ", cont_inner_b_cls, "'>", strTbl, "</div>"].join("")
                    } else if (pqpanes.v) {
                        $cont[0].innerHTML = ["<div class='", cont_inner_cls, "' ", style, " >", strTbl, "</div>", "<div class='", cont_inner_cls, "' >", strTbl, "</div>"].join("")
                    } else if (pqpanes.h) {
                        $cont[0].innerHTML = ["<div class='", cont_inner_cls, "' style='position:static;' >", strTbl, "</div>", "<div class='", cont_inner_cls, " ", cont_inner_b_cls, "' style='position:static;' >", strTbl, "</div>"].join("")
                    } else {
                        $cont[0].innerHTML = ["<div class='", cont_inner_cls, "' ", style, " >", strTbl, "</div>"].join("")
                    }
                }
                that.$tbl = $cont.children("div").children("table");
                if (o.scrollModel.flexContent && that.$tbl[0]) {
                    _pq.onResizeDiv(that.$tbl[0], function() {
                        that._trigger("resizeTable")
                    })
                }
                this.setPaneEvents();
                that._trigger("refresh", null, uiEvent)
            }
            this.setPanes()
        },
      generateRow: function(rowData, rip, buffer, other, nestedshow) {
            var row_cls = ["pq-grid-row"];
            if (this.frozenRip === rip) {
                row_cls.push("pq-last-frozen-row")
            }
            if (nestedshow) {
                row_cls.push("pq-detail-master")
            }
            if ("pq_children" in rowData) {
                row_cls.push("pq-grid-row-group")
            }
            var that = this.that,
                o = this.options,
                rowInit = o.rowInit,
                numberCell = o.numberCell,
                attr = "",
                style = "",
                offset = that.riOffset,
                ri = rip + offset;
            if (rowInit) {
                var retui = rowInit.call(that, {
                    rowData: rowData,
                    rowIndxPage: rip,
                    rowIndx: ri
                });
                if (retui) {
                    if (retui.cls) {
                        row_cls.push(retui.cls)
                    }
                    attr += retui.attr ? " " + retui.attr : "";
                    style += retui.style ? retui.style : ""
                }
            }
            o.stripeRows && row_cls.push("pq-striped");
            if (rowData.pq_rowselect) {
                row_cls.push(that.iRows.hclass)
            }
            var pq_rowcls = rowData.pq_rowcls;
            if (pq_rowcls != null) {
                row_cls.push(pq_rowcls)
            }
            var rowattr = rowData.pq_rowattr;
            if (rowattr) {
                var newrowattr = that.stringifyAttr(rowattr);
                for (var key in newrowattr) {
                    var val = newrowattr[key];
                    attr += " " + key + '="' + val + '"'
                }
            }
            style = style ? "style='" + style + "'" : "";
            buffer.push("<tr pq-row-indx='", rip, "' class='", row_cls.join(" "), "' ", attr, " ", style, " >");
            if (numberCell.show) {
                buffer.push(["<td pq-col-indx='-1' class='pq-grid-number-cell'>", other ? "&nbsp;" : ri + 1, "</td>"].join(""))
            }
            var objRender = {
                rowIndx: rip + offset,
                rowIndxPage: rip,
                other: other,
                rowData: rowData
            };
            var colDef = this.colDef;
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    col = colD.colIndx,
                    column = colD.column;
                objRender.column = column;
                objRender.colIndx = col;
                buffer.push(this.renderCell(objRender))
            }
            buffer.push("</tr>");
            return buffer
        },
        generateDetailRow: function(rowData, rip, buffer) {
            var row_cls = ["pq-grid-row pq-detail-child"],
                that = this.that,
                o = that.options,
                pq_rowcls = rowData.pq_rowcls,
                numberCell = o.numberCell,
                const_cls = "pq-grid-cell";
            o.stripeRows && row_cls.push("pq-striped");
            rowData.pq_rowselect && row_cls.push(that.iRows.hclass);
            pq_rowcls && row_cls.push(pq_rowcls);
            buffer.push("<tr pq-row-indx='" + rip + "' class='" + row_cls.join(" ") + "' >");
            if (numberCell.show) {
                buffer.push(["<td class='pq-grid-number-cell'>", "&nbsp;</td>"].join(""))
            }
            buffer.push("<td class='" + const_cls + " pq-detail-child' colSpan='20'></td>");
            buffer.push("</tr>");
            return buffer
        },
        onRefreshMerge: function(that) {
            return function onRefreshMerge() {
                var $cells = that.$cont.find(".pq-merge-cell-div"),
                    ele, par, paddingTop, paddingLeft, parHeight, i = $cells.length,
                    height, width, heights = [],
                    widths = [];
                while (i--) {
                    ele = $cells[i];
                    par = ele.parentNode;
                    if (!paddingTop) {
                        paddingTop = 2 * parseInt($(par).css("paddingTop"));
                        paddingLeft = 2 * parseInt($(par).css("paddingLeft"))
                    }
                    parHeight = Math.max(par.offsetHeight, 28);
                    height = parHeight - paddingTop;
                    width = par.offsetWidth - paddingLeft;
                    heights[i] = height - 1 + "px";
                    widths[i] = width + "px"
                }
                i = $cells.length;
                while (i--) {
                    ele = $cells[i];
                    ele.style.height = heights[i];
                    ele.style.width = widths[i]
                }
            }
        },
        postRenderAll: function() {
            var that = this.that,
                self = this,
                data = that.pdata,
                intv = that.options.postRenderInterval,
                fn = function(cb) {
                    return intv == -1 ? cb() : setTimeout(cb, intv)
                };
            if (!data || !data.length) {
                return
            }
            clearTimeout(self.postRenderTimeoutID);
            self.postRenderTimeoutID = fn(function() {
                self.setTimerPostRender(0)
            })
        },
        postRenderRow: function(ui) {
            var that = this.that,
                colDef = this.prColDef,
                iM = that.iMerge,
                ri = ui.rowIndx,
                grid = that,
                postRender;
            if (ui.colIndx != null) {
                colDef = [{
                    colIndx: ui.colIndx,
                    column: ui.column
                }]
            }
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    postRender = colD.column.postRender,
                    ci = colD.colIndx;
                if (iM.ismergedCell(ri, ci)) {
                    if (iM.isRootCell(ri, ci, "a")) {
                        ui = iM.getRootCell(ri, ci);
                        grid.callFn(postRender, ui)
                    }
                } else {
                    ui = that.normalize({
                        rowIndx: ri,
                        colIndx: ci
                    });
                    grid.callFn(postRender, ui)
                }
            }
        },
        prependRow: function(noRows) {
            var that = this.that,
                fr = that.options.freezeRows,
                frVisible = that.calcVisibleRows(that.pdata, 0, fr),
                data = that.pdata,
                initV = that.initV,
                CM = that.colModel;
            if (that._mergeCells) {
                if (frVisible) {
                    for (var i = 0; i < fr; i++) {
                        that.refreshRow({
                            rowIndxPage: i,
                            refresh: false
                        })
                    }
                }
                that.refreshRow({
                    rowIndxPage: initV + 1,
                    refresh: false
                })
            }
            that._trigger("beforeTableView", null, {
                pageData: data,
                initV: initV,
                finalV: initV,
                initH: that.initH,
                finalH: that.finalH,
                colModel: CM
            });
            that.refreshRow({
                rowIndxPage: initV,
                refresh: false
            });
            return noRows
        },
        removeTopRow: function(noRows) {
            var that = this.that,
                fr = that.options.freezeRows,
                frVisible = that.calcVisibleRows(that.pdata, 0, fr),
                $tbls = that.$tbl,
                $rows2 = $([]);
            for (var i = 0; i < $tbls.length; i++) {
                var $tbl = $($tbls[i]),
                    $tbody = $tbl.children("tbody"),
                    $rows = $tbody.children("tr:gt(0)").slice(frVisible, noRows + frVisible);
                $rows2 = $rows2.add($rows)
            }
            $rows2.remove();
            if (that._mergeCells) {
                if (frVisible) {
                    for (var i = 0; i < fr; i++) {
                        that.refreshRow({
                            rowIndxPage: i,
                            refresh: false
                        })
                    }
                }
                that.refreshRow({
                    rowIndxPage: that.initV,
                    refresh: false
                })
            }
        },
        removeBottomRow: function(noRows) {
            var that = this.that,
                $tbls = that.$tbl;
            if (noRows) {
                for (var i = 0; i < $tbls.length; i++) {
                    var $tbl = $($tbls[i]),
                        $tbody = $tbl.children("tbody");
                    var $rows = $tbody.children("tr:gt(0)").slice(-noRows);
                    $rows.remove()
                }
            }
        },
        renderCell: function(objP) {
            var that = this.that,
                attr = [],
                style = [],
                dattr, dstyle, dcls, Export = objP.Export,
                mergeOverlay = false,
                o = this.options,
                cls = ["pq-grid-cell"];
            if (!objP.other && !Export && that._mergeCells) {
                objP = that.iMerge.renderCell(objP);
                if (objP == null) {
                    return ""
                }
                if (objP.rowspan) {
                    attr.push("rowspan='" + objP.rowspan + "'", "colspan='" + objP.colspan + "'");
                    if (!o.mergeModel.flex) {
                        mergeOverlay = true;
                        cls.push("pq-merge-cell")
                    }
                }
                if (objP.style) {
                    style.push(objP.style)
                }
                if (objP.cls) {
                    cls.push(objP.cls)
                }
            }
            var rowData = objP.rowData,
                column = objP.column,
                dataType = column.dataType,
                colIndx = objP.colIndx,
                dataIndx = column.dataIndx,
                freezeCols = o.freezeCols,
                render, columnBorders = o.columnBorders;
            if (!rowData) {
                return
            }
            if (!Export) {
                attr.push("pq-col-indx='" + colIndx + "'");
                column.align && cls.push("pq-align-" + column.align);
                if (colIndx == freezeCols - 1 && columnBorders) {
                    cls.push("pq-last-frozen-col")
                }
                column.cls && cls.push(column.cls)
            }
            var dataCell, cellData = rowData[dataIndx],
                cellData = typeof cellData == "string" && dataType != "html" ? pq.escapeHtml(cellData) : cellData,
                cellF, _cf = column.format || (cellF = rowData.pq_format) && (cellF = cellF[dataIndx]),
                formatVal = _cf ? this.format(cellData, _cf, dataType) : cellData;
            objP.dataIndx = dataIndx;
            objP.cellData = cellData;
            objP.formatVal = formatVal;
            if (render = column.render) {
                dataCell = that.callFn(render, objP);
                if (dataCell && typeof dataCell != "string") {
                    (dattr = dataCell.attr) && attr.push(dattr);
                    (dcls = dataCell.cls) && cls.push(dcls);
                    (dstyle = dataCell.style) && style.push(dstyle);
                    dataCell = dataCell.text
                }
            }
            if (dataCell == null && (render = column._render)) {
                dataCell = render.call(that, objP)
            }
            if (dataCell && typeof dataCell != "string") {
                (dattr = dataCell.attr) && attr.push(dattr);
                (dcls = dataCell.cls) && cls.push(dcls);
                (dstyle = dataCell.style) && style.push(dstyle);
                dataCell = dataCell.text
            }
            if (dataCell == null) {
                dataCell = formatVal || cellData
            }
            if (Export) {
                return [dataCell, dstyle]
            } else {
                var pq_cellcls = rowData.pq_cellcls;
                if (pq_cellcls) {
                    var cellClass = pq_cellcls[dataIndx];
                    if (cellClass) {
                        cls.push(cellClass)
                    }
                }
                var pq_cellattr = rowData.pq_cellattr;
                if (pq_cellattr) {
                    var cellattr = pq_cellattr[dataIndx];
                    if (cellattr) {
                        var newcellattr = that.stringifyAttr(cellattr);
                        for (var key in newcellattr) {
                            var val = newcellattr[key];
                            if (key == "style") {
                                style.push(val)
                            } else {
                                attr.push(key + '="' + val + '"')
                            }
                        }
                    }
                }
                style = style.length ? " style='" + style.join("") + "' " : "";
                var title = "";
                if(typeof column.tooltip != 'undefined' && column.tooltip == false){
                    ;
                } else {
                    if(String(dataCell).indexOf('<br/>') == -1){
                        title = String(dataCell).replace(/(<([^>]+)>)/gi, "");
                    }
                    title = title.replace(/"/g,"\"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
                }
                if (dataCell === "" || dataCell == undefined) {
                    dataCell = "&nbsp;"
                }

                var str = ["<td class='", cls.join(" "), "' ", attr.join(" "), style, " title=",title," >", mergeOverlay ? "<div class='pq-merge-cell-div'><div><div class='pq-merge-inner'>" : "", dataCell, mergeOverlay ? "</div></div></div>" : "", "</td>"].join("");
                return str
            }
        },
        refreshRow: function(rip, buffer) {
            var that = this.that,
                rowData = that.pdata[rip],
                nestedshow = rowData.pq_detail && rowData.pq_detail.show;
            this.generateRow(rowData, rip, buffer, null, nestedshow)
        },
        setTimerPostRender: function(rip, colIndx, column) {
            var that = this.that,
                self = this,
                pdata = that.pdata,
                fn = function(cb) {
                    return that.options.postRenderInterval == -1 ? cb() : setTimeout(cb, 0)
                };
            if (!pdata || !pdata.length) {
                return
            }
            self.postRenderTimeoutID = fn(function() {
                var initV = that.initV,
                    fr = that.options.freezeRows;
                if (rip < initV && rip >= fr) {
                    rip = initV
                }
                var rowData = pdata[rip];
                if (!rowData.pq_hidden) {
                    self.postRenderRow({
                        column: column,
                        colIndx: colIndx,
                        rowIndx: rip + that.riOffset
                    })
                }
                rip++;
                if (rip <= that.finalV) {
                    self.setTimerPostRender(rip)
                }
            })
        },
        scrollView: function() {
            var that = this.that,
                o = this.options,
                virtualX = o.virtualX,
                virtualY = o.virtualY;
            if (!virtualX) {
                that.hscroll.drag()
            }
            if (!virtualY) {
                that.vscroll.drag()
            }
        },
        setFrozenRip: function(data, fr) {
            if (!data) return;
            var rd;
            while (fr-- && (rd = data[fr]) && rd.pq_hidden) {}
            this.frozenRip = fr
        },
        setPaneEvents: function() {
            var that = this.that,
                $cont = that.$cont,
                pqpanes = that.pqpanes,
                $div_child = $cont.children("div"),
                iMS = that.iMouseSelection,
                $tbl = that.$tbl;
            if ($tbl && $tbl.length) {
                if (pqpanes.h && pqpanes.v) {
                    var $cont_lt = $($div_child[0]),
                        $cont_rt = $($div_child[1]),
                        $cont_lb = $($div_child[2]),
                        $cont_rb = $($div_child[3]);
                    $cont_lt.on("scroll", function(evt) {
                        this.scrollTop = 0;
                        this.scrollLeft = 0
                    });
                    $cont_rt.on("scroll", function(evt) {
                        this.scrollTop = 0;
                        this.scrollLeft = iMS.getScrollLeft(true)
                    });
                    $cont_lb.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = 0
                    });
                    $cont_rb.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = iMS.getScrollLeft(true)
                    })
                } else if (pqpanes.v) {
                    var $cont_l = $($div_child[0]),
                        $cont_r = $($div_child[1]);
                    $cont_l.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = 0
                    });
                    $cont_r.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = iMS.getScrollLeft(true)
                    })
                } else if (pqpanes.h) {
                    var $cont_t = $($div_child[0]),
                        $cont_b = $($div_child[1]);
                    $cont_t.on("scroll", function(evt) {
                        this.scrollTop = 0;
                        this.scrollLeft = iMS.getScrollLeft(true)
                    });
                    $cont_b.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = iMS.getScrollLeft(true)
                    })
                } else {
                    $div_child.on("scroll", function(evt) {
                        this.scrollTop = iMS.getScrollTop(true);
                        this.scrollLeft = iMS.getScrollLeft(true)
                    })
                }
            }
        },
        setPanes: function() {
            var that = this.that,
                $cont = that.$cont,
                pqpanes = that.pqpanes,
                $div_child = $cont.children("div"),
                iR = that.iRefresh,
                $tbl = that.$tbl,
                o = that.options,
                freezeCols = o.freezeCols * 1,
                initH = that.initH,
                offset = 1,
                wd = that.calcWidthCols(-1, freezeCols) + offset,
                flexWidth = o.width === "flex",
                contWd = flexWidth && !o.maxWidth ? "" : iR.getEContWd(),
                lft, ht;
            if (that.tables.length) {
                var $tblS = that.tables[0].$tbl,
                    $contS = that.tables[0].$cont,
                    $div_childS = $tblS.parent("div");
                if (pqpanes.v) {
                    $($div_childS[0]).css({
                        width: wd
                    });
                    $($div_childS[1]).css({
                        left: wd,
                        width: contWd - wd
                    });
                    $($tblS[1]).css({
                        left: -1 * wd
                    })
                } else {
                    $($div_childS[0]).css({
                        width: contWd
                    })
                }
                $contS.height($tblS[0].scrollHeight - 1);
                iR.setContHeight()
            }
            if ($tbl && $tbl.length) {
                var flexHeight = o.height === "flex",
                    contHt = flexHeight && !o.maxHeight ? "" : iR.getEContHt();
                if (pqpanes.h && pqpanes.v) {
                    var $cont_lt = $($div_child[0]),
                        $cont_rt = $($div_child[1]),
                        $tbl_rt = $($tbl[1]),
                        $cont_lb = $($div_child[2]),
                        $tbl_lb = $($tbl[2]),
                        $cont_rb = $($div_child[3]),
                        $tbl_rb = $($tbl[3]),
                        ht = that.calcHeightFrozenRows(),
                        htFrozenPane = ht;
                    $cont_lt.css({
                        width: wd,
                        height: htFrozenPane
                    });
                    $cont_rt.css({
                        left: wd,
                        width: contWd - wd,
                        height: htFrozenPane
                    });
                    $tbl_rt.css({
                        left: -1 * wd
                    });
                    $cont_lb.css({
                        width: wd,
                        top: htFrozenPane,
                        height: contHt - htFrozenPane
                    });
                    $tbl_lb.css({
                        top: -(htFrozenPane + 1)
                    });
                    $cont_rb.css({
                        left: wd,
                        width: contWd - wd,
                        top: htFrozenPane,
                        height: contHt - htFrozenPane
                    });
                    $tbl_rb.css({
                        top: -(htFrozenPane + 1),
                        left: -1 * wd
                    })
                } else if (pqpanes.v) {
                    var $cont_l = $($div_child[0]),
                        $cont_r = $($div_child[1]),
                        $tbl_r = $($tbl[1]);
                    $cont_l.css({
                        width: wd,
                        height: contHt
                    });
                    $cont_r.css({
                        left: wd,
                        width: contWd - wd,
                        height: contHt
                    });
                    $tbl_r.css({
                        left: -1 * wd
                    })
                } else if (pqpanes.h) {
                    var $cont_t = $($div_child[0]),
                        $cont_b = $($div_child[1]),
                        $tbl_b = $($tbl[1]),
                        ht = that.calcHeightFrozenRows(),
                        htFrozenPane = ht;
                    $cont_t.css({
                        height: htFrozenPane,
                        width: contWd
                    });
                    $cont_b.css({
                        width: contWd,
                        top: htFrozenPane,
                        height: contHt - htFrozenPane
                    });
                    $tbl_b.css({
                        top: -(htFrozenPane + 1)
                    })
                } else {
                    $div_child.css({
                        width: contWd,
                        height: contHt
                    })
                }
            }
            if (o.showHeader) {
                if (pqpanes.v) {
                    that.$header_left.css({
                        width: wd
                    });
                    that.$header_right.css({
                        left: wd,
                        width: contWd - wd
                    });
                    that.$header_right_inner.css({
                        left: -wd
                    })
                } else {
                    that.$header_left.css({
                        width: contWd
                    })
                }
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        fn = _pq._pqGrid.prototype;
    fn.getHeadCell = function($td) {
        var ci = $td.attr("pq-col-indx"),
            ri = $td.attr("pq-row-indx"),
            isParent, column, o_ci, cCM;
        if (ci != null && ri != null) {
            ci = ci * 1;
            ri = ri * 1;
            column = this.headerCells[ri][ci];
            if (column) {
                cCM = column.colModel;
                o_ci = column.leftPos
            }
        }
        if (cCM && cCM.length) {
            isParent = true
        }
        return {
            col: column,
            ci: ci,
            o_ci: o_ci,
            ri: ri,
            isParent: isParent
        }
    };
    fn.flex = function(ui) {
        this.iResizeColumns.flex(ui)
    };

    function getColIndx(headerCells, row, column) {
        var hc = headerCells[row];
        for (var i = 0; i < hc.length; i++) {
            if (hc[i] == column) {
                return i
            }
        }
    }

    function calcVisibleColumns(CM, colIndx1, colIndx2) {
        var num = 0;
        for (var i = colIndx1; i < colIndx2; i++) {
            var column = CM[i];
            if (column.hidden !== true) {
                num++
            }
        }
        return num
    }
    _pq.cHeader = function(that) {
        var self = this;
        self.that = that;
        self.td_cls = "pq-grid-col";
        that.on("headerKeyDown", self.onKeyDown(self, that)).on("beforeRefreshHeader", self.onBeforeRefreshH(self, that)).on("refreshHeader", self.onRefreshH(self, that))
    };
    _pq.cHeader.prototype = $.extend({
        onBeforeRefreshH: function(self, that) {
            return function() {
                var ae = document.activeElement,
                    cls = ae ? ae.className : "",
                    focusUI = self.focusUI,
                    $ae = $(ae);
                if (focusUI) {
                    focusUI.nofocus = cls.indexOf("pq-grid-col-leaf") == -1 || !$ae.closest(that.element).length
                }
            }
        },
        onRefreshH: function(self) {
            return function(evt) {
                self.setTimer(function() {
                    if (self.that.options) {
                        self.focus()
                    }
                }, 100)
            }
        },
        colCollapse: function(column, evt) {
            var that = this.that,
                ui = {
                    column: column
                },
                collapsible = column.collapsible;
            if (that._trigger("beforeColumnCollapse", evt, ui) !== false) {
                collapsible.on = !collapsible.on;
                if (that._trigger("columnCollapse", evt, ui) !== false) {
                    that.refresh({
                        colModel: true
                    })
                }
            }
        },
        onKeyDown: function(self, that) {
            var KC = $.ui.keyCode;
            return function(evt) {
                var target = evt.originalEvent.target,
                    ui;
                var $th = $(target).closest(".pq-grid-col-leaf"),
                    obj, ci, ci2, kc = evt.keyCode;
                if ($th.length) {
                    obj = that.getHeadCell($th);
                    ci = obj.ci;
                    if (kc == KC.RIGHT) {
                        ci2 = self.getNextVisibleCI(ci)
                    } else if (kc == KC.LEFT) {
                        ci2 = self.getPrevVisibleCI(ci)
                    } else if (kc == KC.ENTER) {
                        self._onHeaderCellClick(obj.col, ci, evt)
                    }
                    if (ci2 != null && ci2 != ci) {
                        $th.removeAttr("tabindex");
                        ui = {
                            colIndx: ci2
                        };
                        that.scrollColumn(ui);
                        self.focus(ui)
                    }
                }
            }
        },
        getNextVisibleCI: function(ci) {
            var CM = this.that.colModel,
                len = CM.length,
                i = ci + 1;
            for (; i < len; i++) {
                if (!CM[i].hidden) {
                    return i
                }
            }
            return ci
        },
        getPrevVisibleCI: function(ci) {
            var CM = this.that.colModel,
                i = ci - 1;
            for (; i >= 0; i--) {
                if (!CM[i].hidden) {
                    return i
                }
            }
            return ci
        },
        focus: function(_ui) {
            var ui = _ui || this.focusUI,
                that = this.that,
                $th;
            if (ui && ui.colIndx != null) {
                this.focusUI = ui;
                $th = that.getCellHeader(ui);
                $th.attr("tabindex", 0);
                if (!ui.nofocus) {
                    $th.focus()
                }
            }
        },
        createHeader: function() {
            var that = this.that,
                self = this,
                o = that.options,
                bootstrap = o.bootstrap,
                tblClass = (bootstrap.on ? bootstrap.thead : "") + " pq-grid-header-table ",
                jui = o.ui,
                jui_header = bootstrap.on ? "" : jui.header,
                hwrap = o.hwrap,
                pqpanes = that.pqpanes,
                freezeCols = parseInt(o.freezeCols),
                numberCell = o.numberCell,
                thisColModel = that.colModel,
                SM = o.sortModel,
                SSS = self.getSortSpaceSpans(SM),
                depth = that.depth,
                virtualX = o.virtualX,
                colDef = that.iGenerateView.colDef,
                initH = that.initH,
                finalH = that.finalH,
                headerCells = that.headerCells,
                $header_o = that.$header_o;
            that._trigger("beforeRefreshHeader");
            $header_o.empty();
            if (o.showHeader === false) {
                $header_o.css("display", "none");
                return
            } else {
                $header_o.css("display", "")
            }
            if (hwrap) {
                tblClass += "pq-wrap "
            } else {
                tblClass += "pq-no-wrap "
            }
            var buffer = ["<table class='" + tblClass + "' >"];
            if (depth >= 1) {
                buffer.push("<tr class='pq-row-hidden'>");
                if (numberCell.show) {
                    buffer.push("<td style='width:" + numberCell.width + "px;' ></td>")
                }
                for (var i = 0, len = colDef.length; i < len; i++) {
                    var colD = colDef[i],
                        col = colD.colIndx,
                        column = colD.column;
                    var wd = column.outerWidth;
                    buffer.push("<td style='width:" + wd + "px;' pq-col-indx=" + col + "></td>")
                }
                buffer.push("</tr>")
            }
            for (var row = 0; row < depth; row++) {
                buffer.push("<tr class='pq-grid-title-row'>");
                if (row == 0 && numberCell.show) {
                    buffer.push(["<th pq-col-indx='-1' class='pq-grid-number-col' rowspan='", depth, "'>", "<div class='pq-td-div'>", numberCell.title ? numberCell.title : "&nbsp;", "</div></th>"].join(""))
                }
                for (var col = 0; col <= finalH; col++) {
                    if (col < initH && col >= freezeCols && virtualX) {
                        col = initH;
                        if (col > finalH) {
                            throw "initH>finalH";
                            break
                        }
                    }
                    self.createHeaderCell(row, col, headerCells, buffer, freezeCols, initH, depth, SSS)
                }
                buffer.push("</tr>")
            }
            that.ovCreateHeader(buffer);
            buffer.push("</table>");
            var strTbl = buffer.join("");
            if (pqpanes.v) {
                $header_o[0].innerHTML = ["<span class='pq-grid-header pq-grid-header-left ", jui_header, "'>", "<div class='pq-grid-header-inner'>", strTbl, "</div>", "</span>", "<span class='pq-grid-header ", jui_header, "'>", "<div class='pq-grid-header-inner'>", strTbl, "</div>", "</span>"].join("")
            } else {
                $header_o[0].innerHTML = ["<span class='pq-grid-header ", jui_header, "'>", "<div class='pq-grid-header-inner'>", strTbl, "</div>", "</span>"].join("")
            }
            var $header = that.$header = $header_o.children(".pq-grid-header"),
                $header_i = $header.children(".pq-grid-header-inner");
            that.$tbl_header = $header_i.children("table");
            that.$header_left = $($header[0]);
            that.$header_left_inner = $($header_i[0]);
            if (pqpanes.v) {
                that.$header_right = $($header[1]);
                that.$header_right_inner = $($header_i[1])
            }
            $header.click(function(evt) {
                return self._onHeaderClick(evt)
            });
            self._refreshResizeColumn(initH, finalH, thisColModel);
            that._trigger("refreshHeader", null, null)
        },
        _onHeaderClick: function(evt) {
            var self = this,
                that = this.that,
                $td, column, obj, $target, iDG = that.iDragColumns;
            if (iDG && iDG.status != "stop") {
                return
            }
            $target = $(evt.target);
            if ($target.is("input,label")) {
                return true
            }
            $td = $target.closest(".pq-grid-col");
            if ($td.length) {
                obj = that.getHeadCell($td);
                column = obj.col;
                if (column) {
                    if ($target.hasClass("pq-col-collapse")) {
                        self.colCollapse(column, evt)
                    } else if (!obj.isParent) {
                        return self._onHeaderCellClick(column, obj.ci, evt)
                    }
                }
            }
        },
        createHeaderCell: function(row, col, headerCells, buffer, freezeCols, initH, depth, SSS) {
            var that = this.that,
                sheet = that.options.sheet,
                const_cls = this.td_cls,
                column = headerCells[row][col],
                CM = that.colModel,
                orig_colIndx, collapsedStr, collapsible = column.collapsible,
                tabindex = "",
                rowIndxDD, colIndxDD, colSpan = column.colSpan;
            if (column.hidden || colSpan === 0) {
                return
            }
            if (row > 0 && column == headerCells[row - 1][col]) {
                return
            } else if (col > 0 && column == headerCells[row][col - 1]) {
                if (col > initH) {
                    return
                } else {
                    orig_colIndx = getColIndx(headerCells, row, column);
                    if (orig_colIndx < freezeCols) {
                        return
                    }
                    colSpan = colSpan - calcVisibleColumns(CM, orig_colIndx, col)
                }
            } else if (freezeCols && col < freezeCols && col + colSpan > freezeCols) {
                var colSpan1 = colSpan - calcVisibleColumns(CM, freezeCols, initH),
                    colSpan2 = calcVisibleColumns(CM, col, freezeCols);
                colSpan = Math.max(colSpan1, colSpan2)
            }
            var align = column.halign || column.align,
                ccls = column.cls,
                cls = [const_cls],
                title = column.title,
                type = column.type,
                title = typeof title == "function" ? title.call(that, {
                    column: column,
                    colIndx: col,
                    dataIndx: column.dataIndx
                }) : title,
                title = sheet ? _pq.toLetter(col) : title,
                title = title != null ? title : type == "checkbox" && column.cb.header ? "<input type='checkbox'/>" : column.dataIndx;
            column.pqtitle = title;
            if (align) {
                cls.push("pq-align-" + align)
            }
            if (col == freezeCols - 1 && depth == 1) {
                cls.push("pq-last-frozen-col")
            }
            if (col <= freezeCols - 1) {
                cls.push("pq-left-col")
            } else if (col >= initH) {
                cls.push("pq-right-col")
            }
            if (ccls) {
                cls.push(ccls)
            }
            if (column.colModel == null || column.colModel.length == 0) {
                cls.push("pq-grid-col-leaf");
                tabindex = col == initH ? "tabindex='0' " : ""
            } else {
                SSS = "";
                if (collapsible) {
                    cls.push("pq-collapsible-th");
                    collapsedStr = ["<div class='pq-col-collapse'>", collapsible.on ? "+" : "-", "</div>"].join("")
                }
            }
            rowIndxDD = "pq-row-indx=" + row;
            colIndxDD = "pq-col-indx=" + col;
            if(column.sortable !== undefined && column.sortable == false) {
            	SSS="";
            }

            buffer.push(["<th ", colIndxDD, " ", rowIndxDD, " ", tabindex, " class='", cls.join(" "), "' rowspan=", column.rowSpan, " colspan=", colSpan, ">", "<div class='pq-td-div'>", title, SSS, "</div>", collapsedStr, "</th>"].join(""))
        },
        getSortSpaceSpans: function(SM) {
            var pq_space = SM.space ? " pq-space" : "";
            return ["<span class='pq-col-sort-icon", pq_space, "'></span>", SM.number ? "<span class='pq-col-sort-count" + pq_space + "'></span>" : ""].join("")
        },
        _onHeaderCellClick: function(column, colIndx, evt) {
            var that = this.that,
                o = that.options,
                SM = o.sortModel,
                dataIndx = column.dataIndx;
            if (that._trigger("headerCellClick", evt, {
                    column: column,
                    colIndx: colIndx,
                    dataIndx: dataIndx
                }) === false) {
                return
            }
            if (o.selectionModel.column && evt.target.className.indexOf("pq-td-div") == -1) {
                var address = {
                        c1: colIndx,
                        firstC: colIndx
                    },
                    oldaddress = that.iSelection.address();
                if (evt.shiftKey) {
                    var alen = oldaddress.length;
                    if (alen && oldaddress[alen - 1].type == "column") {
                        var last = oldaddress[alen - 1];
                        last.c1 = last.firstC;
                        last.c2 = colIndx;
                        last.r1 = last.r2 = last.type = undefined
                    }
                    address = oldaddress
                }
                that.Range(address, false).select();
                that.focus({
                    rowIndxPage: that.getFirstVisibleRIP(true),
                    colIndx: colIndx
                })
            } else if (SM.on) {
                if (column.sortable == false) {
                    return
                }
                that.sort({
                    sorter: [{
                        dataIndx: dataIndx
                    }],
                    addon: true,
                    tempMultiple: SM.multiKey && evt[SM.multiKey],
                    evt: evt
                });
                this.focus({
                    colIndx: colIndx
                })
            }
        },
        _refreshResizeColumn: function(initH, finalH, model) {
            var that = this.that,
                options = that.options,
                FMficon = options.filterModel.ficon ? true : false,
                numberCell = options.numberCell,
                freezeCols = parseInt(options.freezeCols),
                buffer1 = [],
                buffer2 = [],
                pqpanes_vH = that.pqpanes.v,
                lftCol = 0,
                lft = 0;
            if (numberCell.show) {
                lftCol = numberCell.outerWidth;
                if (numberCell.resizable) {
                    lft = lftCol - 5;
                    buffer1.push("<div pq-col-indx='-1' style='left:", lft, "px;'", " class='pq-grid-col-resize-handle'>&nbsp;</div>")
                }
            }
            var colDef = that.iGenerateView.colDef;
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    col = colD.colIndx,
                    column = colD.column;
                var cficon = column.ficon,
                    ficon = cficon || cficon == null && FMficon,
                    buffer = buffer1;
                lftCol += column.outerWidth;
                if (column.resizable !== false || ficon) {
                    if (pqpanes_vH && col >= freezeCols) {
                        buffer = buffer2
                    }
                    lft = lftCol - 5;
                    buffer.push("<div pq-col-indx='", col, "' style='left:", lft, "px;'", " class='pq-grid-col-resize-handle'>&nbsp;</div>")
                }
            }
            if (buffer2.length) {
                that.$header_right_inner.append(buffer2.join(""))
            }
            that.$header_left_inner.append(buffer1.join(""))
        },
        refreshHeaderSortIcons: function() {
            var that = this.that,
                o = that.options,
                BS = o.bootstrap,
                jui = o.ui,
                $header = that.$header;
            if (!$header) {
                return
            }
            var sorters = that.iSort.getSorter(),
                sorterLen = sorters.length,
                number = false,
                SM = that.options.sortModel;
            if (SM.number && sorterLen > 1) {
                number = true
            }
            for (var i = 0; i < sorterLen; i++) {
                var sorter = sorters[i],
                    dataIndx = sorter.dataIndx,
                    colIndx = that.getColIndx({
                        dataIndx: dataIndx
                    }),
                    dir = sorter.dir,
                    addClass = BS.on ? BS.header_active : jui.header_active + " pq-col-sort-" + (dir == "up" ? "asc" : "desc"),
                    cls2 = BS.on ? " glyphicon glyphicon-arrow-" + dir : "ui-icon ui-icon-triangle-1-" + (dir == "up" ? "n" : "s");
                var $th = $header.find(".pq-grid-col-leaf[pq-col-indx=" + colIndx + "]");
                $th.addClass(addClass);
                $th.find(".pq-col-sort-icon").addClass(cls2);
                if (number) {
                    $th.find(".pq-col-sort-count").html(i + 1)
                }
            }
        }
    }, new _pq.cClass);
    _pq.cResizeColumns = function(that) {
        this.that = that;
        var self = this;
        that.$header_o.on({
            mousedown: function(evt) {
                if (!evt.pq_composed) {
                    var $target = $(evt.target);
                    self.setDraggables(evt);
                    evt.pq_composed = true;
                    var e = $.Event("mousedown", evt);
                    $target.trigger(e)
                }
            },
            dblclick: function(evt) {
                self.doubleClick(evt)
            }
        }, ".pq-grid-col-resize-handle");
        var o = that.options,
            flex = o.flex;
        if (flex.on && flex.one) {
            that.one("ready", function() {
                self.flex()
            })
        }
    };
    _pq.cResizeColumns.prototype = {
        doubleClick: function(evt) {
            var that = this.that,
                o = that.options,
                flex = o.flex,
                $target = $(evt.target),
                colIndx = parseInt($target.attr("pq-col-indx"));
            if (isNaN(colIndx)) {
                return
            }
            if (flex.on) {
                this.flex(flex.all && !o.scrollModel.autoFit ? {} : {
                    colIndx: [colIndx]
                })
            }
        },
        _initFlexTable: function($tbl, takeNextRow) {
            if ($tbl.length) {
                $tbl.find(".pq-grid-cell").css("white-space", "nowrap");
                var $tr = $tbl.css({
                        tableLayout: "auto",
                        width: ""
                    }).addClass("pq-no-wrap").removeClass("pq-wrap").children("tbody").children(".pq-row-hidden"),
                    th, $ths = $tr.children("td").css("width", "");
                if (takeNextRow) {
                    var $tds = $tr.next().children("td"),
                        j = 0,
                        widths = [],
                        colspan, skip = [];
                    $tds.each(function(i, td) {
                        colspan = td.getAttribute("colspan") * 1;
                        if (colspan > 1) {
                            j += colspan - 1;
                            widths[j] = td.offsetWidth;
                            th = $ths[j];
                            if (!th || !th.offsetWidth) {
                                for (var k = j - (colspan - 1); k < j; k++) {
                                    skip[k] = true
                                }
                            }
                        }
                        j++
                    })
                }
            }
            return [$ths || $(), skip || [], widths]
        },
        flex: function(objP) {
            objP = objP || {};
            var that = this.that,
                o = that.options;
            var $ogrid = that.element,
                numberCell = o.numberCell,
                colIndx = objP.colIndx,
                lenColIndx, dataIndx = objP.dataIndx,
                refresh = objP.refresh == null ? true : objP.refresh,
                widthDirty = false,
                cbWidth = 0,
                $tbl = that.$tbl,
                $tbl_header = that.$tbl_header,
                $tblB = $tbl && $tbl.length ? $($tbl[0]).clone() : $(),
                $tblS = that.tables && that.tables.length ? that.tables[0].$tbl : null,
                $tblS = $tblS ? $($tblS[0]).clone() : $(),
                $tblH = $tbl_header && $tbl_header.length ? $($tbl_header[0]).clone() : $(); {
                var $merged = $tblB.find(".pq-merge-cell");
                $merged.each(function(i, ele) {
                    ele.innerHTML = $(ele).find(".pq-merge-inner")[0].innerHTML;
                    ele.style.whiteSpace = "noWrap"
                })
            }
            if (dataIndx != null) {
                colIndx = [];
                for (var i = 0, len = dataIndx.length; i < len; i++) {
                    var colIndx2 = that.colIndxs[dataIndx[i]];
                    if (colIndx2 != null) {
                        colIndx.push(colIndx2)
                    }
                }
            }
            if (colIndx != null) {
                colIndx.sort(function(a, b) {
                    return a - b
                });
                lenColIndx = colIndx.length
            }
            $tblH.find("tr.pq-grid-header-search-row").remove();
            var $grid = $("<div class='pq-grid' style='width:1px;height:1px;position:absolute;left:0px;top:0px;'>").append($tblH).append($tblS).append($tblB);
            $grid.addClass($ogrid.attr("class"));
            $ogrid.parent().append($grid);
            var obj = this._initFlexTable($tblB, true),
                $tdsB = obj[0],
                skipArr = obj[1],
                widths = obj[2],
                widthTaken = 0,
                $tdsS = this._initFlexTable($tblS)[0],
                $tdsH = this._initFlexTable($tblH)[0],
                j = numberCell.show ? 0 : -1;
            for (var i = 0, colDef = that.iGenerateView.colDef, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    ci = colD.colIndx,
                    column = colD.column;
                j++;
                if (colIndx) {
                    if (!colIndx.length) {
                        break
                    } else if (colIndx[0] === ci) {
                        colIndx.splice(0, 1)
                    } else {
                        continue
                    }
                }
                var tdB = $tdsB[j],
                    tdH = $tdsH[j],
                    tdS = $tdsS[j],
                    skipBody = skipArr[j],
                    widthB = tdB ? tdB.offsetWidth : 0,
                    widthS = tdS ? tdS.offsetWidth : 0,
                    widthH = tdH ? tdH.offsetWidth : 0;
                if (skipBody) {
                    widthB = 0
                } else if (widthTaken) {
                    widthB = widths[j] - widthTaken;
                    widthTaken = 0
                }
                var width = Math.max(widthB, widthS, widthH) - cbWidth + 1;
                if (skipBody) {
                    widthTaken += width
                }
                if (column._width !== width) {
                    widthDirty = true;
                    column.width = width;
                    if (lenColIndx === 1) {
                        column._resized = true
                    }
                }
            }
            $grid.remove();
            if (widthDirty && refresh) {
                that.refresh({
                    source: "flex",
                    colModel: true
                })
            }
        },
        setDraggables: function(evt) {
            var $div = $(evt.target),
                self = this;
            var drag_left, drag_new_left, cl_left;
            $div.draggable({
                axis: "x",
                helper: function(evt, ui) {
                    var $target = $(evt.target),
                        indx = parseInt($target.attr("pq-col-indx"));
                    self._setDragLimits(indx);
                    self._getDragHelper(evt, ui);
                    return $target
                },
                start: function(evt, ui) {
                    drag_left = ui.position.left;
                    cl_left = parseInt(self.$cl[0].style.left)
                },
                drag: function(evt, ui) {
                    drag_new_left = ui.position.left;
                    var dx = drag_new_left - drag_left;
                    self.$cl[0].style.left = cl_left + dx + "px"
                },
                stop: function(evt, ui) {
                    return self.resizeStop(evt, ui, drag_left)
                }
            })
        },
        _getDragHelper: function(evt) {
            var that = this.that,
                o = that.options,
                freezeCols = parseInt(o.freezeCols),
                $target = $(evt.target),
                $grid_center = that.$grid_center,
                indx = parseInt($target.attr("pq-col-indx")),
                ht = $grid_center.outerHeight();
            this.$cl = $("<div class='pq-grid-drag-bar'></div>").appendTo($grid_center);
            this.$clleft = $("<div class='pq-grid-drag-bar'></div>").appendTo($grid_center);
            this.$cl.height(ht);
            this.$clleft.height(ht);
            var ele = $("[pq-col-indx=" + indx + "]", that.$header)[0];
            var lft = ele.offsetLeft;
            if (that.pqpanes.v) {
                if (indx >= freezeCols) {
                    lft -= that.$header[1].scrollLeft
                }
            } else {
                lft += that.$header[0].offsetLeft;
                lft -= that.$header[0].scrollLeft
            }
            this.$clleft.css({
                left: lft
            });
            lft = lft + ele.offsetWidth;
            this.$cl.css({
                left: lft
            })
        },
        _setDragLimits: function(colIndx) {
            if (colIndx < 0) {
                return
            }
            var that = this.that,
                CM = that.colModel,
                column = CM[colIndx],
                o = that.options,
                $head = that.$header_left;
            if (colIndx >= o.freezeCols && that.pqpanes.v) {
                $head = that.$header_right
            }
            var $pQuery_col = $head.find("th[pq-col-indx='" + colIndx + "']");
            var cont_left = $pQuery_col.offset().left + column._minWidth;
            var cont_right = cont_left + column._maxWidth - column._minWidth;
            var $pQuery_drag = $head.find("div.pq-grid-col-resize-handle[pq-col-indx=" + colIndx + "]");
            if ($pQuery_drag.draggable("instance")) {
                $pQuery_drag.draggable("option", "containment", [cont_left, 0, cont_right, 0])
            }
        },
        resizeStop: function(evt, ui, drag_left) {
            var that = this.that,
                CM = that.colModel,
                thisOptions = that.options,
                self = this,
                numberCell = thisOptions.numberCell;
            self.$clleft.remove();
            self.$cl.remove();
            var drag_new_left = ui.position.left;
            var dx = drag_new_left - drag_left;
            var $target = $(ui.helper),
                colIndx = parseInt($target.attr("pq-col-indx")),
                column;
            if (colIndx == -1) {
                column = null;
                var oldWidth = parseInt(numberCell.width),
                    newWidth = oldWidth + dx;
                numberCell.width = newWidth
            } else {
                column = CM[colIndx];
                var oldWidth = parseInt(column.width),
                    newWidth = oldWidth + dx;
                column.width = newWidth;
                column._resized = true
            }
            that._trigger("columnResize", evt, {
                colIndx: colIndx,
                column: column,
                dataIndx: column ? column.dataIndx : null,
                oldWidth: oldWidth,
                newWidth: column ? column.width : numberCell.width
            });
            that.refresh()
        }
    };
    _pq.cDragColumns = function(that) {
        var self = this;
        self.that = that;
        self.$drag_helper = null;
        var dragColumns = that.options.dragColumns,
            topIcon = dragColumns.topIcon,
            bottomIcon = dragColumns.bottomIcon;
        self.status = "stop";
        //self.$arrowTop = $("<div class='pq-arrow-down ui-icon " + topIcon + "'></div>").appendTo(that.element);
        //self.$arrowBottom = $("<div class='pq-arrow-up ui-icon " + bottomIcon + "' ></div>").appendTo(that.element);
        self.$arrowBottom = $("<div class='pq-drag-line'><div>").appendTo(that.element);
        self.hideArrows();
        if (dragColumns && dragColumns.enabled) {
            that.$header_o.on("mousedown", ".pq-grid-col", self.onColMouseDown(self, that))
        }
    };
    _pq.cDragColumns.prototype = {
        onColMouseDown: function(self, that) {
            return function(evt) {
                var colobj, col, parent, e, $td = $(this);
                if (!evt.pq_composed) {
                    if ($(evt.target).is("input,select,textarea")) {
                        return
                    }
                    colobj = that.getHeadCell($td);
                    col = colobj.col;
                    parent = col ? col.parent : null;
                    if (!col || col.nodrag || col._nodrag || parent && parent.colSpan == 1) {
                        return
                    }
                    if (self.setDraggable(evt, col, colobj)) {
                        evt.pq_composed = true;
                        e = $.Event("mousedown", evt);
                        $(evt.target).trigger(e)
                    }
                }
            }
        },
        showFeedback: function($td, leftDrop) {
            var that = this.that,
                td = $td[0],
                offParent = td.offsetParent.offsetParent,
                grid_center_top = that.$grid_center[0].offsetTop,
                left = td.offsetLeft - offParent.offsetParent.scrollLeft + (!leftDrop ? td.offsetWidth : 0),// - 8,
                top = grid_center_top + td.offsetTop - 16,
                top2 = grid_center_top + that.$header[0].offsetHeight,
                height = $td.height();
            /*
            this.$arrowTop.css({
                left: left,
                top: top,
                display: ""
            });
            */
            this.$arrowBottom.css({
                left: left,
                //top: top2,
                top: grid_center_top + td.offsetTop,
                height: that.$grid_center.height(),
                display: ""
            })
        },
        showArrows: function() {
            //this.$arrowTop.show();
            this.$arrowBottom.show()
        },
        hideArrows: function() {
            //this.$arrowTop.hide();
            this.$arrowBottom.hide()
        },
        updateDragHelper: function(accept) {
            var that = this.that,
                dragColumns = that.options.dragColumns,
                acceptIcon = dragColumns.acceptIcon,
                rejectIcon = dragColumns.rejectIcon,
                $drag_helper = this.$drag_helper;
            if (!$drag_helper) {
                return
            }
            /*if (accept) {
                $drag_helper.children("span.pq-drag-icon").addClass(acceptIcon).removeClass(rejectIcon);
                $drag_helper.removeClass("ui-state-error")
            } else {
                $drag_helper.children("span.pq-drag-icon").removeClass(acceptIcon).addClass(rejectIcon);
                $drag_helper.addClass("ui-state-error")
            }*/
        },
        setDraggable: function(evt, column, colobj) {
            var $td = $(evt.currentTarget),
                self = this,
                that = self.that;
            if (!$td.hasClass("ui-draggable")) {
                $td.draggable({
                    distance: 10,
                    /*
                    cursorAt: {
                        top: -18,
                        left: -10
                    },
                    */
                    cursorAt: {
                        top: ($td.height()/2),
                        left: ($td.width()/2)
                    },
                    zIndex: "1000",
                    appendTo: that.element,
                    revert: "invalid",
                    helper: self.dragHelper(self, that, column),
                    start: self.onStart(self, that, column, colobj),
                    drag: self.onDrag(self, that),
                    stop: function() {
                        if (that.element) {
                            self.status = "stop";
                            that.$header.find(".pq-grid-col-resize-handle").show();
                            self.hideArrows()
                        }
                    }
                });
                return true
            }
        },
        onStart: function(self, that, column, colobj) {
            return function(evt) {
                if (that._trigger("columnDrag", evt.originalEvent, {
                        column: column
                    }) === false) {
                    return false
                }
                self.setDroppables(colobj)
            }
        },
        onDrag: function(self, that) {
            return function(evt, ui) {
                self.status = "drag";
                var $td = $(".pq-drop-hover", that.$header);
                console.log($td.length);
                if ($td.length > 0) {
                    self.showArrows();
                    self.updateDragHelper(true);
                    var wd = $td.width();
                    var lft = evt.clientX - $td.offset().left + $(document).scrollLeft();
                    if (lft < wd / 2) {
                        self.leftDrop = true;
                        self.showFeedback($td, true)
                    } else {
                        self.leftDrop = false;
                        self.showFeedback($td, false)
                    }
                } else {
                    self.hideArrows();
                    var $group = $(".pq-drop-hover", that.$top);
                    if ($group.length) {
                        self.updateDragHelper(true)
                    } else {
                        self.updateDragHelper()
                    }
                }
            }
        },
        dragHelper: function(self, that, column) {
            var rejectIcon = that.options.dragColumns.rejectIcon;
            return function() {
                self.status = "helper";
                that.$header.find(".pq-grid-col-resize-handle").hide();
                //var $drag_helper = $("<div class='pq-col-drag-helper ui-widget-content ui-corner-all panel panel-default' >" + "<span class='pq-drag-icon ui-icon " + rejectIcon + " glyphicon glyphicon-remove'></span>" + column.pqtitle + "</div>");

                var height = that.$header.height();
                var width = column.width;

                var $drag_helper = $("<div class='pq-col-drag-helper pq-grid-col pq-align-center pq-right-col' style='width:"+width+"px;height:"+height+"px;'>" + column.pqtitle + "</div>");
                self.$drag_helper = $drag_helper;
                return $drag_helper[0]
            }
        },
        _columnIndexOf: function(colModel, column) {
            for (var i = 0, len = colModel.length; i < len; i++) {
                if (colModel[i] == column) {
                    return i
                }
            }
            return -1
        },
        setDroppables: function(colObj) {
            var self = this,
                that = self.that,
                col_o = colObj.col,
                ri_o = colObj.ri,
                ci_o1 = colObj.o_ci,
                ci_o2 = ci_o1 + col_o.o_colspan,
                obj, ri, ci, col, $td, td_isDroppable, $header_left = that.$header_left,
                i, onDrop = self.onDrop(),
                objDrop = {
                    hoverClass: "pq-drop-hover ui-state-highlight",
                    accept: ".pq-grid-col",
                    tolerance: "pointer",
                    drop: onDrop
                },
                $tds = $header_left.find(".pq-left-col"),
                $tds2 = that.pqpanes.v || that.pqpanes.vH ? that.$header_right.find(".pq-right-col") : $header_left.find(".pq-right-col");
            $tds = $tds.add($tds2);
            i = $tds.length;
            while (i--) {
                $td = $($tds[i]);
                td_isDroppable = $td.hasClass("ui-droppable");
                obj = that.getHeadCell($td);
                col = obj.col;
                ri = obj.ri;
                ci = obj.ci;
                if (col == col_o || col.nodrop || col._nodrop || ri_o < ri && ci >= ci_o1 && ci < ci_o2) {
                    if (td_isDroppable) {
                        $td.droppable("destroy")
                    }
                } else if (!td_isDroppable) {
                    $td.droppable(objDrop)
                }
            }
        },
        onDrop: function() {
            var self = this,
                that = this.that;
            return function(evt, ui) {
                if (self.dropPending) {
                    return
                }
                var colIndxDrag = ui.draggable.attr("pq-col-indx") * 1,
                    rowIndxDrag = ui.draggable.attr("pq-row-indx") * 1,
                    $this = $(this),
                    colIndxDrop = $this.attr("pq-col-indx") * 1,
                    rowIndxDrop = $this.attr("pq-row-indx") * 1,
                    left = self.leftDrop;
                var column = self.moveColumn(colIndxDrag, colIndxDrop, left, rowIndxDrag, rowIndxDrop);
                self.dropPending = true;
                window.setTimeout(function() {
                    that.iColModel.init();
                    var ret = that._trigger("columnOrder", null, {
                        dataIndx: column.dataIndx,
                        column: column,
                        oldcolIndx: colIndxDrag,
                        colIndx: that.getColIndx({
                            column: column
                        })
                    });
                    if (ret !== false) {
                        that.refresh()
                    }
                    self.dropPending = false
                }, 0)
            }
        },
        getRowIndx: function(hc, colIndx, lastRowIndx) {
            var column, column2;
            while (lastRowIndx) {
                column = hc[lastRowIndx][colIndx];
                column2 = hc[lastRowIndx - 1][colIndx];
                if (column != column2) {
                    break
                }
                lastRowIndx--
            }
            return lastRowIndx
        },
        moveColumn: function(colIndxDrag, colIndxDrop, leftDrop, rowIndxDrag, rowIndxDrop) {
            var that = this.that,
                self = this,
                optCM = that.options.colModel,
                hc = that.headerCells,
                lastRowIndx = that.depth - 1,
                rowIndxDrag = rowIndxDrag == null ? self.getRowIndx(hc, colIndxDrag, lastRowIndx) : rowIndxDrag,
                rowIndxDrop = rowIndxDrop == null ? self.getRowIndx(hc, colIndxDrop, lastRowIndx) : rowIndxDrop,
                columnDrag = hc[rowIndxDrag][colIndxDrag],
                columnDrop = hc[rowIndxDrop][colIndxDrop],
                colModelDrag = rowIndxDrag ? hc[rowIndxDrag - 1][colIndxDrag].colModel : optCM,
                colModelDrop = rowIndxDrop ? hc[rowIndxDrop - 1][colIndxDrop].colModel : optCM;
            var indxDrag = self._columnIndexOf(colModelDrag, columnDrag),
                decr = leftDrop ? 1 : 0;
            var column = colModelDrag.splice(indxDrag, 1)[0],
                indxDrop = self._columnIndexOf(colModelDrop, columnDrop) + 1 - decr;
            colModelDrop.splice(indxDrop, 0, column);
            return column
        }
    };
    _pq.cHeaderSearch = function(that) {
        var self = this;
        self.that = that;
        self.td_cls = "pq-grid-col";
        self.dataHS = {};
        that.on("headerKeyDown", function(evt, ui) {
            return self.onHeaderKeyDown(evt, ui)
        }).on("createHeader", function(evt, ui) {
            return self.onCreateHeader(evt, ui)
        })
    };
    _pq.cHeaderSearch.prototype = {
        get$Ele: function(colIndx, dataIndx) {
            var that = this.that,
                freezeCols = that.options.freezeCols,
                $tbl_left = $(that.$tbl_header[0]),
                $inp, selector = ".pq-grid-hd-search-field[name='" + dataIndx + "']",
                $tbl_right = $(that.$tbl_header[that.$tbl_header.length == 2 ? 1 : 0]);
            if (colIndx >= freezeCols) {
                $inp = $tbl_right.find(selector)
            } else {
                $inp = $tbl_left.find(selector)
            }
            return $inp
        },
        _onKeyDown: function(evt, ui, $this) {
            var that = this.that,
                keyCode = evt.keyCode,
                keyCodes = $.ui.keyCode,
                selector;
            if (keyCode === keyCodes.TAB) {
                var dataIndx = $this.attr("name"),
                    colIndx = that.getColIndx({
                        dataIndx: dataIndx
                    }),
                    CM = that.colModel,
                    $inp, shiftKey = evt.shiftKey,
                    column = CM[colIndx];
                if (column.filter.condition == "between") {
                    that.scrollColumn({
                        colIndx: colIndx
                    });
                    var $ele = this.get$Ele(colIndx, dataIndx);
                    if ($ele[0] == $this[0]) {
                        if (!shiftKey) {
                            $inp = $ele[1]
                        }
                    } else {
                        if (shiftKey) {
                            $inp = $ele[0]
                        }
                    }
                    if ($inp) {
                        $inp.focus();
                        evt.preventDefault();
                        return false
                    }
                }
                do {
                    if (shiftKey) {
                        colIndx--
                    } else {
                        colIndx++
                    }
                    if (colIndx < 0 || colIndx >= CM.length) {
                        break
                    }
                    var column = CM[colIndx],
                        cFilter = column.filter;
                    if (column.hidden) {
                        continue
                    }
                    if (!cFilter) {
                        continue
                    }
                    that.scrollColumn({
                        colIndx: colIndx
                    });
                    var $inp, dataIndx = column.dataIndx,
                        $inp = this.get$Ele(colIndx, dataIndx);
                    if (cFilter.condition == "between") {
                        if (shiftKey) {
                            $inp = $($inp[1])
                        } else {
                            $inp = $($inp[0])
                        }
                    }
                    if ($inp) {
                        $inp.focus();
                        evt.preventDefault();
                        return false
                    } else {
                        break
                    }
                } while (1 === 1)
            } else {
                return true
            }
        },
        onHeaderKeyDown: function(evt, ui) {
            var $src = $(evt.originalEvent.target);
            if ($src.hasClass("pq-grid-hd-search-field")) {
                return this._onKeyDown(evt, ui, $src)
            } else {
                return true
            }
        },
        _bindFocus: function() {
            var that = this.that,
                self = this;

            function handleFocus(e) {
                var $target = $(e.target),
                    $inp = $target.closest(".pq-grid-hd-search-field"),
                    dataIndx = $inp.attr("name");
                if (that.scrollColumn({
                        dataIndx: dataIndx
                    })) {
                    var colIndx = that.getColIndx({
                        dataIndx: dataIndx
                    });
                    var $ele = self.get$Ele(colIndx, dataIndx);
                    $ele.focus()
                }
            }
            var $trs = that.$header.find(".pq-grid-header-search-row");
            for (var i = 0; i < $trs.length; i++) {
                $($trs[i]).on("focusin", handleFocus)
            }
        },
        createListener: function(type) {
            var obj = {},
                that = this.that;
            obj[type] = function(evt, ui) {
                that.filter({
                    rules: [{
                        dataIndx: ui.dataIndx,
                        value: ui.value,
                        value2: ui.value2
                    }]
                })
            };
            return obj
        },
        onCreateHeader: function() {
            var self = this,
                that = this.that,
                options = that.options,
                FM = options.filterModel;
            if (!FM.header) {
                return
            }
            this._bindFocus();
            var CM = that.colModel,
                freezeCols = options.freezeCols,
                $tbl_header = that.$tbl_header,
                $tbl_left = $($tbl_header[0]),
                $tbl_right = $($tbl_header[1]),
                selector = "input,select";
            if ($tbl_header.length > 1) {
                $tbl_left.find(selector).css("visibility", "hidden");
                for (var i = 0; i < freezeCols; i++) {
                    var column = CM[i],
                        dIndx = column.dataIndx,
                        selector = "*[name='" + dIndx + "']";
                    $tbl_left.find(selector).css("visibility", "visible");
                    $tbl_right.find(selector).css("visibility", "hidden")
                }
            }
            var colDef = that.iGenerateView.colDef,
                i = 0,
                len = colDef.length;
            for (; i < len; i++) {
                var colD = colDef[i],
                    col = colD.colIndx,
                    column = colD.column,
                    filter = column.filter;
                if (filter) {
                    self.postRenderCell(column, col)
                }
            }
        },
        postRenderCell: function(column, col) {
            var dataIndx = column.dataIndx,
                filter = column.filter,
                self = this,
                that = self.that,
                freezeCols = that.options.freezeCols,
                $tbl_header = that.$tbl_header,
                $tbl_left = $($tbl_header[0]),
                $tbl_right = $($tbl_header[1]),
                events = {
                    button: "click",
                    select: "change",
                    checkbox: "change",
                    textbox: "timeout"
                },
                $tbl_h = col >= freezeCols && $tbl_header.length > 1 ? $tbl_right : $tbl_left,
                $cell = $tbl_h.find(".pq-col-" + col),
                $ele = $cell.find("*[name='" + dataIndx + "']");
            if ($ele.length == 0) {
                return
            }
            var ftype = filter.type,
                value = filter.value;
            if (ftype == "checkbox" && filter.subtype == "triple") {
                $ele.pqval({
                    val: value
                })
            } else if (ftype == "select") {
                if (value != null) {
                    $ele.val(value)
                }
            }
            var finit = filter.init,
                flistener = filter.listener,
                listeners = filter.listeners || [flistener ? flistener : events[ftype]];
            if (finit) {
                that.callFn(finit, {
                    dataIndx: dataIndx,
                    column: column,
                    $cell: $cell,
                    $editor: $ele
                })
            }
            for (var j = 0; j < listeners.length; j++) {
                var listener = listeners[j],
                    typeL = typeof listener,
                    obj = {};
                if (typeL == "string") {
                    listener = self.createListener(listener)
                } else if (typeL == "function") {
                    obj[events[ftype]] = listener;
                    listener = obj
                }
                for (var event in listener) {
                    self.bindListener($ele, event, listener[event], column)
                }
            }
        },
        fakeEvent: function($ele, event) {
            if (event == "timeout") {
                var to, timeout = this.that.options.filterModel.timeout;
                $ele.bind("keyup change", function() {
                    clearTimeout(to);
                    to = setTimeout(function() {
                        $ele.triggerHandler("timeout")
                    }, timeout)
                })
            }
        },
        bindListener: function($ele, event, handler, column) {
            var that = this.that,
                oval = column.filter.value,
                oval2 = column.filter.value2;
            this.fakeEvent($ele, event);
            $ele.on(event, function(evt) {
                var value, value2, filter = column.filter;
                if (filter.type == "checkbox") {
                    if (filter.subtype == "triple") {
                        value = $ele.pqval({
                            incr: true
                        })
                    } else {
                        value = $ele.is(":checked") ? true : false
                    }
                } else if (filter.condition == "between") {
                    value = $($ele[0]).val();
                    value2 = $($ele[1]).val()
                } else {
                    value = $ele.val()
                }
                value = value === "" ? undefined : value;
                value2 = value2 === "" ? undefined : value2;
                if (oval !== value || oval2 !== value2) {
                    oval = value;
                    oval2 = value2;
                    handler = pq.getFn(handler);
                    return handler.call(that, evt, {
                        column: column,
                        dataIndx: column.dataIndx,
                        value: value,
                        value2: value2
                    })
                }
            })
        },
        betweenTmpl: function(input1, input2) {
            var strS = ["<div class='pq-from-div'>", input1, "</div>", "<span class='pq-from-to-center'>-</span>", "<div class='pq-to-div'>", input2, "</div>"].join("");
            return strS
        },
        createDOM: function(buffer) {
            var that = this.that,
                self = this,
                thisOptions = that.options,
                dataHS = this.dataHS,
                numberCell = thisOptions.numberCell;
            buffer.push("<tr class='pq-grid-header-search-row'>");
            if (numberCell.show) {
                buffer.push(["<td pq-col-indx='-1' class='pq-grid-number-col' rowspan='1'>", "<div class='pq-td-div'>&nbsp;</div></td>"].join(""))
            }
            var colDef = that.iGenerateView.colDef;
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    ci = colD.colIndx,
                    column = colD.column;
                buffer.push(self.renderCell(column, ci))
            }
            buffer.push("</tr>")
        },
        renderCell: function(column, ci) {
            var td_cls = [this.td_cls],
                self = this,
                td, that = self.that,
                filter = column.filter,
                FM = that.options.filterModel,
                ccls = column.cls,
                corner_cls = " ui-corner-all",
                align = column.halign || column.align;
            align && td_cls.push("pq-align-" + align);
            ccls && td_cls.push(ccls);
            if (filter) {
                var dataIndx = column.dataIndx,
                    type = filter.type,
                    value = filter.value,
                    value2, condition = filter.condition,
                    cls = "pq-grid-hd-search-field " + (filter.cls || ""),
                    style = filter.style || "",
                    attr = filter.attr || "",
                    strS = "";
                if (condition == "between") {
                    value2 = filter.value2;
                    value2 = value2 != null ? value2 : ""
                }
                if (type === "textbox") {
                    value = value ? value : "";
                    cls = cls + " pq-search-txt" + corner_cls;
                    if (condition == "between") {
                        strS = this.betweenTmpl(this._input(dataIndx, value, cls + " pq-from", style, attr, FM), this._input(dataIndx, value2, cls + " pq-to", style, attr, FM))
                    } else {
                        strS = this._input(dataIndx, value, cls, style, attr, FM)
                    }
                } else if (type === "textarea") {
                    value = value ? value : "";
                    cls = cls + " pq-search-txt" + corner_cls;
                    if (condition == "between") {
                        strS = this.betweenTmpl(this._textarea(dataIndx, value, cls + " pq-from", style, attr), this._textarea(dataIndx, value2, cls + " pq-to", style, attr))
                    } else {
                        strS = this._textarea(dataIndx, value, cls, style, attr)
                    }
                } else if (type === "select") {
                    if (filter.cache) {
                        strS = filter.cache
                    } else {
                        var opts = filter.options,
                            type_opts = typeof opts;
                        if (type_opts == "string" || type_opts == "function") {
                            opts = that.callFn(opts, {
                                column: column,
                                value: value,
                                dataIndx: dataIndx,
                                cls: cls,
                                style: style,
                                attr: attr
                            })
                        }
                        cls = cls + corner_cls;
                        var attrSelect = ["name='", dataIndx, "' class='", cls, "' style='", style, "' ", attr].join("");
                        strS = _pq.select({
                            options: opts,
                            attr: attrSelect,
                            prepend: filter.prepend,
                            valueIndx: filter.valueIndx,
                            labelIndx: filter.labelIndx,
                            groupIndx: filter.groupIndx
                        });
                        filter.cache = strS
                    }
                } else if (type == "checkbox") {
                    var checked = value == null || value == false ? "" : "checked=checked";
                    strS = ["<input ", checked, " name='", dataIndx, "' type=checkbox class='" + cls + "' style='" + style + "' " + attr + "/>"].join("")
                } else if (typeof type == "string") {
                    strS = type
                } else if (typeof type == "function") {
                    strS = type.call(that, {
                        width: column.outerWidth,
                        value: value,
                        value2: value2,
                        column: column,
                        dataIndx: dataIndx,
                        cls: cls,
                        attr: attr,
                        style: style
                    })
                }
                if (strS) {
                    td_cls.push("pq-col-" + ci)
                }
                td = ["<td class='", td_cls.join(" "), "'><div class='pq-td-div' >", "", strS, "</div></td>"].join("")
            } else {
                td = ["<td class='", td_cls.join(" "), "'><div class='pq-td-div' >", "&nbsp;", "</div></td>"].join("")
            }
            return td
        },
        _input: function(dataIndx, value, cls, style, attr, FM) {
            return ["<input ", , , ' value="', value, "\" name='", dataIndx, "' type=text style='", style, "' class='", cls, "' ", attr, " />"].join("")
        },
        _textarea: function(dataIndx, value, cls, style, attr) {
            return ["<textarea name='", dataIndx, "' style='" + style + "' class='" + cls + "' " + attr + " >", value, "</textarea>"].join("")
        }
    }
})(jQuery);
(function($) {
    "use strict";

    function cHierarchy(that, column) {
        this.that = that;
        var self = this,
            o = that.options;
        this.type = "detail";
        this.refreshComplete = true;
        this.detachView = false;
        that.on("cellClick", function(evt, ui) {
            return self.toggle(evt, ui)
        }).on("cellKeyDown", function(evt, ui) {
            if (evt.keyCode == $.ui.keyCode.ENTER) {
                return self.toggle(evt, ui)
            }
        }).on("refresh", function(evt, ui) {
            return self.aftertable()
        }).on("beforeTableView", function(evt, ui) {
            return self.beforeTableView(evt, ui)
        }).on("tableWidthChange", function(evt, ui) {
            return self.tableWidthChange(evt, ui)
        });
        column._render = function(ui) {
            var DTM = o.detailModel,
                cellData = ui.cellData,
                rd = ui.rowData,
                hicon;
            if (rd.pq_gsummary || rd.pq_gtitle) {
                return
            }
            hicon = cellData && cellData["show"] ? DTM.expandIcon : DTM.collapseIcon;
            return "<div class='ui-icon " + hicon + "'></div>"
        }
    }
    $.paramquery.cHierarchy = cHierarchy;
    var _pHierarchy = cHierarchy.prototype;
    _pHierarchy.tableWidthChange = function() {
        if (!this.refreshComplete) {
            return
        }
        this.refreshComplete = false;
        var that = this.that,
            $tds = that.$tbl.children("tbody").children("tr.pq-detail-child").children("td.pq-detail-child");
        for (var i = 0, tdLen = $tds.length; i < tdLen; i++) {
            var td = $tds[i],
                $td = $(td);
            var $grids = $td.find(".pq-grid");
            for (var j = 0, gridLen = $grids.length; j < gridLen; j++) {
                var $grid = $($grids[j]);
                if ($grid.is(":visible")) {
                    $grid.pqGrid("onWindowResize")
                }
            }
        }
        this.refreshComplete = true
    };
    _pHierarchy.aftertable = function($trs) {
        var that = this.that,
            initDetail = that.options.detailModel.init,
            data = that.pdata;
        if (!this.refreshComplete) {
            return
        }
        this.refreshComplete = false;
        $trs = $trs ? $trs : that.$tbl.children("tbody").children("tr.pq-detail-child");
        for (var i = 0, trLen = $trs.length; i < trLen; i++) {
            var tr = $trs[i],
                $tr = $(tr),
                rowIndxPage = $tr.attr("pq-row-indx"),
                rowData = data[rowIndxPage],
                newCreate = false,
                $detail = rowData.pq_detail.child;
            if (!$detail) {
                if (typeof initDetail == "function") {
                    newCreate = true;
                    $detail = initDetail.call(that, {
                        rowData: rowData
                    });
                    rowData.pq_detail["child"] = $detail;
                    rowData.pq_detail.height = 25
                }
            }
            var $td = $tr.children("td.pq-detail-child");
            $td.append($detail);
            var $grids = $td.find(".pq-grid");
            for (var j = 0, gridLen = $grids.length; j < gridLen; j++) {
                var $grid = $($grids[j]);
                if (newCreate) {
                    if ($grid.hasClass("pq-pending-refresh") && $grid.is(":visible")) {
                        $grid.removeClass("pq-pending-refresh");
                        $grid.pqGrid("refresh")
                    }
                } else if ($grid.is(":visible")) {
                    $grid.pqGrid("onWindowResize")
                }
            }
        }
        this.refreshComplete = true;
        this.detachView = false
    };
    _pHierarchy.beforeTableView = function(evt, ui) {
        if (!this.detachView) {
            this.detachInitView();
            this.detachView = true
        }
    };
    _pHierarchy.detachInitView = function($trs) {
        var that = this.that,
            $tbl = that.$tbl;
        if (!$tbl || !$tbl.length) {
            return
        }
        $trs = $trs ? $trs : $tbl.children("tbody").children("tr.pq-detail-child");
        for (var i = 0; i < $trs.length; i++) {
            var tr = $trs[i],
                $tr = $(tr),
                $child = $tr.children("td.pq-detail-child").children();
            $child.detach()
        }
    };
    _pHierarchy.toggle = function(evt, ui) {
        var that = this.that,
            column = ui.column,
            rowData = ui.rowData,
            rowIndx = ui.rowIndx,
            type = this.type;
        if (rowData.pq_gtitle || rowData.pq_gsummary) {
            return
        }
        if (column && column.type === type) {
            var dataIndx = "pq_detail",
                obj = {
                    rowIndx: rowIndx,
                    focus: true
                };
            if (rowData[dataIndx] == null) {
                that.rowExpand(obj)
            } else if (rowData[dataIndx]["show"] === false) {
                that.rowExpand(obj)
            } else {
                this.rowCollapse(obj)
            }
        }
    };
    _pHierarchy.rowExpand = function(objP) {
        this.normalize(objP);
        var that = this.that,
            o = that.options,
            rowData = objP.rowData,
            rowIndx = objP.rowIndx,
            rowIndxPage = objP.rowIndxPage,
            detM = o.detailModel,
            dataIndx = "pq_detail";
        if (rowData == null) {
            return
        }
        if (that._trigger("beforeRowExpand", null, objP) === false) {
            return false
        }
        if (rowData[dataIndx] == null) {
            rowData[dataIndx] = {
                show: true
            }
        } else if (rowData[dataIndx]["show"] === false) {
            rowData[dataIndx]["show"] = true
        }
        if (!detM.cache) {
            this.rowInvalidate(objP)
        }
        that.refreshRow({
            rowIndx: rowIndx
        });
        var buffer = [];
        that.iGenerateView.generateDetailRow(rowData, rowIndxPage, buffer);
        var $tr = that.getRow({
            rowIndxPage: rowIndxPage
        });
        $tr.after(buffer.join(""));
        this.aftertable($tr.next());
        if (objP.focus) {
            that.getCell({
                rowIndx: rowIndx,
                dataIndx: dataIndx
            }).attr("tabindex", "0").focus()
        }
        if (objP.scrollRow) {
            this.scrollRow({
                rowIndx: rowIndx
            })
        }
    };
    _pHierarchy.rowInvalidate = function(objP) {
        var that = this.that,
            rowData = that.getRowData(objP),
            dataIndx = "pq_detail",
            pq_detail = rowData[dataIndx],
            $temp = pq_detail ? pq_detail["child"] : null;
        if ($temp) {
            $temp.remove();
            rowData[dataIndx]["child"] = null;
            rowData[dataIndx]["height"] = 0
        }
    };
    _pHierarchy.normalize = function(objP) {
        var that = this.that,
            rowI = objP.rowIndx,
            rowIP = objP.rowIndxPage,
            rowIO = that.riOffset;
        objP.rowIndx = rowI == null ? rowIP + rowIO : rowI;
        objP.rowIndxPage = rowIP == null ? rowI - rowIO : rowIP;
        objP.rowData = that.getRowData(objP)
    };
    _pHierarchy.rowCollapse = function(objP) {
        this.normalize(objP);
        var that = this.that,
            o = that.options,
            rowData = objP.rowData,
            rowIndx = objP.rowIndx,
            rowIndxPage = objP.rowIndxPage,
            detM = o.detailModel,
            dataIndx = "pq_detail";
        if (rowData == null || rowData[dataIndx] == null) {
            return
        } else if (rowData[dataIndx]["show"] === true) {
            if (!detM.cache) {
                this.rowInvalidate(objP)
            }
            rowData[dataIndx]["show"] = false;
            if (o.virtualY) {
                that.refresh()
            } else {
                var $tr = that.getRow({
                    rowIndxPage: rowIndxPage
                }).next("tr.pq-detail-child");
                if ($tr.length) {
                    this.detachInitView($tr);
                    $tr.remove();
                    that.refreshRow({
                        rowIndx: rowIndx
                    })
                }
                if (objP.focus) {
                    that.getCell({
                        rowIndx: rowIndx,
                        dataIndx: dataIndx
                    }).attr("tabindex", "0").focus()
                }
            }
            if (objP.scrollRow) {
                var rowIndx = objP.rowIndx;
                this.scrollRow({
                    rowIndx: rowIndx
                })
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var cRefresh = function(that) {
        var self = this;
        self.vrows = [];
        self.that = that;
        that.on("dataReadyDone", function() {
            self.calcVisibleV();
            self.addRowIndx()
        }).on("CMInit", function() {
            self.calcVisibleH()
        }).on("refresh", function() {
            self.summaryTable()
        }).on("resizeTable", function() {
            if (!self.ignoreTResize) {
                self.softRefresh()
            }
        })
    };
    $.paramquery.cRefresh = cRefresh;

    function getStyle(el, prop) {
        if (window.getComputedStyle) {
            return getComputedStyle(el)[prop]
        } else {
            var val = el.currentStyle[prop];
            return val == "auto" ? 0 : val
        }
    }
    cRefresh.prototype = {
        _computeOuterWidths: function() {
            var that = this.that,
                o = that.options,
                CBWidth = 0,
                numberCell = o.numberCell,
                thisColModel = that.colModel,
                CMLength = thisColModel.length;
            for (var i = 0; i < CMLength; i++) {
                var column = thisColModel[i];
                column.outerWidth = column._width + CBWidth
            }
            if (numberCell.show) {
                numberCell.outerWidth = numberCell.width
            }
        },
        _refreshFrozenLine: function() {
            var that = this.that,
                o = that.options,
                numberCell = o.numberCell,
                $container = that.$cont_o,
                freezeBorders = o.freezeBorders,
                freezeCols = o.freezeCols,
                freezeRows = o.freezeRows;
            if (this.$freezeLine) {
                this.$freezeLine.remove()
            }
            if (this.$freezeLineH) {
                this.$freezeLineH.remove()
            }
            if (freezeBorders) {
                if (freezeCols) {
                    var lft = that.calcWidthCols(-1, freezeCols);
                    if (isNaN(lft) || lft === 0) {} else if (lft > 0 && numberCell.show && lft === numberCell.width) {} else {
                        this.$freezeLine = $(["<div class='pqg-vert-frozen-line' ", " style = 'left:", lft - 1, "px;' >", "</div>"].join("")).appendTo($container)
                    }
                }
                if (freezeRows) {
                    var $tbl = that.$tbl;
                    if ($tbl) {
                        var tr = $tbl.children("tbody").children(".pq-last-frozen-row")[0];
                        if (tr) {
                            var top = tr.offsetTop + tr.offsetHeight - 1;
                            this.$freezeLineH = $("<div class='pqg-horiz-frozen-line' style='top:" + (top - 1) + "px;' ></div>").appendTo($container)
                        }
                    }
                }
            }
        },
        _setScrollVLength: function(ui) {
            ui = ui || {};
            var that = this.that,
                o = that.options;
            if (o.height !== "flex" || o.maxHeight) {
                var htSB = this.getSBHeight(),
                    len = this.contHt - htSB + this.headerHt - 2;
                that.vscroll.widget().css("bottom", htSB);
                that.vscroll.option("length", len)
            }
        },
        addRowIndx: function() {
            var that = this.that,
                data = that.get_p_data(),
                i = data.length,
                rd;
            while (i--) {
                rd = data[i];
                rd && (rd.pq_ri = i)
            }
        },
        autoFit: function() {
            var that = this.that,
                CM = that.colModel,
                CMLength = CM.length,
                wdAllCols = that.calcWidthCols(-1, CMLength, true),
                wdCont = this.contWd - this.getSBWidth();
            if (wdAllCols !== wdCont) {
                var diff = wdAllCols - wdCont,
                    columnResized, availWds = [];
                for (var i = 0; i < CMLength; i++) {
                    var column = CM[i],
                        colPercent = column._percent,
                        resizable = column.resizable !== false,
                        resized = column._resized,
                        hidden = column.hidden;
                    if (!hidden && !colPercent && !resized) {
                        var availWd;
                        if (diff < 0) {
                            availWd = column._maxWidth - column._width;
                            if (availWd) {
                                availWds.push({
                                    availWd: -1 * availWd,
                                    colIndx: i
                                })
                            }
                        } else {
                            availWd = column._width - column._minWidth;
                            if (availWd) {
                                availWds.push({
                                    availWd: availWd,
                                    colIndx: i
                                })
                            }
                        }
                    }
                    if (resized) {
                        columnResized = column;
                        delete column._resized
                    }
                }
                availWds.sort(function(obj1, obj2) {
                    if (obj1.availWd > obj2.availWd) {
                        return 1
                    } else if (obj1.availWd < obj2.availWd) {
                        return -1
                    } else {
                        return 0
                    }
                });
                for (var i = 0, len = availWds.length; i < len; i++) {
                    var obj = availWds[i],
                        availWd = obj.availWd,
                        colIndx = obj.colIndx,
                        part = Math.round(diff / (len - i)),
                        column = CM[colIndx],
                        wd, colWd = column._width;
                    if (Math.abs(availWd) > Math.abs(part)) {
                        wd = colWd - part;
                        diff = diff - part
                    } else {
                        wd = colWd - availWd;
                        diff = diff - availWd
                    }
                    column.width = column._width = wd
                }
                if (diff != 0 && columnResized) {
                    var wd = columnResized._width - diff;
                    if (wd > columnResized._maxWidth) {
                        wd = columnResized._maxWidth
                    } else if (wd < columnResized._minWidth) {
                        wd = columnResized._minWidth
                    }
                    columnResized.width = columnResized._width = wd
                }
            }
        },
        autoLastColumn: function() {
            var that = this.that,
                o = that.options,
                flexWidth = o.width === "flex",
                cbWidth = 0,
                SM = o.scrollModel,
                wdCont;
            if (flexWidth || !(SM.lastColumn === "auto" && o.virtualX)) {
                return
            }
            wdCont = this.contWd - this.getSBWidth();
            if (isNaN(wdCont)) {
                return
            }
            var freezeCols = o.freezeCols,
                CM = that.colModel,
                CMLength = CM.length,
                wd1 = that.calcWidthCols(-1, freezeCols, true),
                rem = wdCont - wd1,
                _found = false,
                lastColIndx = that.getLastVisibleCI();
            if (lastColIndx == null) {
                return
            }
            var lastColumn = CM[lastColIndx];
            if (lastColumn._percent) {
                return
            }
            var lastColWd = lastColumn._width,
                wd, lastColMinWidth = lastColumn._minWidth,
                lastColMaxWidth = lastColumn._maxWidth;
            for (var i = CMLength - 1; i >= freezeCols; i--) {
                var column = CM[i];
                if (column.hidden) {
                    continue
                }
                var outerWd = column._width + cbWidth;
                rem = rem - outerWd;
                if (rem < 0) {
                    _found = true;
                    if (lastColWd + rem >= lastColMinWidth) {
                        wd = lastColWd + rem
                    } else {
                        wd = lastColWd + outerWd + rem
                    }
                    break
                }
            }
            if (!_found) {
                wd = lastColWd + rem
            }
            if (wd > lastColMaxWidth) {
                wd = lastColMaxWidth
            } else if (wd < lastColMinWidth) {
                wd = lastColMinWidth
            }
            lastColumn.width = lastColumn._width = wd;
            lastColumn.outerWidth = lastColumn._width + cbWidth
        },
        numericVal: function(width, totalWidth) {
            var val;
            if ((width + "").indexOf("%") > -1) {
                val = parseInt(width) * totalWidth / 100
            } else {
                val = parseInt(width)
            }
            return Math.round(val)
        },
        refreshColumnWidths: function(ui) {
            ui = ui || {};
            var that = this.that,
                o = that.options,
                numberCell = o.numberCell,
                flexWidth = o.width === "flex",
                cbWidth = 0,
                CM = that.colModel,
                SM = o.scrollModel,
                autoFit = SM.autoFit,
                contWd = this.contWd,
                CMLength = CM.length,
                sbWidth = this.getSBWidth(),
                minColWidth = o._minColWidth,
                maxColWidth = o._maxColWidth;
            var numberCellWidth = 0;
            if (numberCell.show) {
                if (numberCell.width < numberCell.minWidth) {
                    numberCell.width = numberCell.minWidth
                }
                numberCellWidth = numberCell.outerWidth = numberCell.width
            }
            var availWidth = flexWidth ? null : contWd - sbWidth - numberCellWidth,
                minColWidth = Math.floor(this.numericVal(minColWidth, availWidth)),
                maxColWidth = Math.ceil(this.numericVal(maxColWidth, availWidth)),
                rem = 0;
            if (!flexWidth && availWidth < 5 || isNaN(availWidth)) {
                if (o.debug) {
                    throw "availWidth N/A"
                }
                return
            }
            delete that.percentColumn;
            for (var i = 0; i < CMLength; i++) {
                var column = CM[i],
                    hidden = column.hidden;
                if (hidden) {
                    continue
                }
                var colWidth = column.width,
                    colWidthPercent = (colWidth + "").indexOf("%") > -1 ? true : null,
                    colMinWidth = column.minWidth,
                    colMaxWidth = column.maxWidth,
                    colMinWidth = colMinWidth ? this.numericVal(colMinWidth, availWidth) : minColWidth,
                    colMaxWidth = colMaxWidth ? this.numericVal(colMaxWidth, availWidth) : maxColWidth;
                if (colMaxWidth < colMinWidth) {
                    colMaxWidth = colMinWidth
                }
                if (colWidth != undefined) {
                    var wdFrac, wd = 0;
                    if (!flexWidth && colWidthPercent) {
                        that.percentColumn = true;
                        column.resizable = false;
                        column._percent = true;
                        wdFrac = this.numericVal(colWidth, availWidth) - cbWidth;
                        wd = Math.floor(wdFrac);
                        rem += wdFrac - wd;
                        if (rem >= 1) {
                            wd += 1;
                            rem -= 1
                        }
                    } else if (colWidth) {
                        wd = colWidth * 1
                    }
                    if (wd < colMinWidth) {
                        wd = colMinWidth
                    } else if (!flexWidth && wd > colMaxWidth) {
                        wd = colMaxWidth
                    }
                    column._width = wd
                } else {
                    column._width = colMinWidth
                }
                if (!colWidthPercent) {
                    column.width = column._width
                }
                column._minWidth = colMinWidth;
                column._maxWidth = flexWidth ? 1e3 : colMaxWidth
            }
            if (flexWidth === false && ui.refreshWidth !== false) {
                if (autoFit) {
                    this.autoFit()
                }
                this.autoLastColumn()
            }
            this._computeOuterWidths()
        },
        estRowsInViewPort: function() {
            var noRows = Math.ceil(this.contHt / this.rowHt);
            this.that.pageSize = noRows;
            return noRows
        },
        setScrollVNumEles: function(ui) {
            ui = ui || {};
            var that = this.that,
                vscroll = that.vscroll,
                o = that.options;
            if (!o.maxHeight && o.height === "flex") {
                vscroll.option("num_eles", 0);
                return 0
            }
            var nested = that.iHierarchy ? true : false,
                num_eles = parseInt(vscroll.option("num_eles")),
                cur_pos = parseInt(vscroll.option("cur_pos")),
                htView = this.getEContHt(),
                data = that.pdata;
            var totalVisibleRows = data ? that.totalVisibleRows : 0;
            var tbl, $tbl, htTbl = 0;
            if (that.$tbl && that.$tbl.length > 0) {
                tbl = that.$tbl[that.$tbl.length - 1];
                htTbl = tbl.scrollHeight;
                $tbl = $(tbl)
            }
            if (htTbl > 0) {
                var $trs = $tbl.children().children("tr");
                var ht = 0,
                    visibleRows = 0;
                for (var i = 1; i < $trs.length; i++) {
                    var tr = $trs[i];
                    ht += tr.offsetHeight;
                    if (ht >= htView) {
                        if (nested && $(tr).hasClass("pq-detail-child")) {
                            visibleRows = visibleRows > 1 ? visibleRows - 1 : 1
                        } else {}
                        break
                    } else {
                        if (nested) {
                            if ($(tr).hasClass("pq-detail-child") === false) {
                                visibleRows++
                            }
                        } else {
                            visibleRows++
                        }
                    }
                }
                num_eles = totalVisibleRows - visibleRows + 1
            } else {
                num_eles = cur_pos + 1
            }
            if (num_eles > totalVisibleRows) {
                num_eles = totalVisibleRows
            }
            if (ht > htView && nested) {
                num_eles++
            }
            vscroll.option("num_eles", num_eles);
            return num_eles
        },
        setHeaderHeight: function() {
            var that = this.that,
                $header = that.$header,
                type = "scrollHeight",
                selector = ".pq-grid-header-search-row",
                htHD0, htHD1, htHD;
            if ($header && $header.length) {
                if ($header.length > 1) {
                    htHD0 = $header[0][type];
                    htHD1 = $header[1][type];
                    htHD = Math.max(htHD0, htHD1);
                    if (htHD0 !== htHD1) {
                        var $tr0 = $($header[0]).find(selector),
                            $tr1 = $($header[1]).find(selector);
                        if ($tr0.length) {
                            $tr0.css("height", "");
                            $tr1.css("height", "");
                            htHD0 = $header[0][type];
                            htHD1 = $header[1][type];
                            htHD = Math.max(htHD0, htHD1);
                            if (htHD0 < htHD) {
                                $tr0.height($tr1[0][type])
                            } else {
                                $tr1.height($tr0[0][type])
                            }
                        }
                    }
                } else {
                    htHD0 = $header[0][type];
                    htHD = htHD0
                }
                that.$header_o.height(htHD - 3);
                this.headerHt = htHD - 1
            } else {
                that.$header_o.height(0);
                this.headerHt = 0
            }

            // SET vertical gap to header height
            that.vscroll.options.vertical_gap = this.headerHt;
        },
        initContHeight: function() {
            var that = this.that,
                o = that.options,
                flexHeight = o.height == "flex";
            if (!flexHeight || o.maxHeight) {
                this.contHt = this.height - (o.showHeader ? this.rowHt : 0) - (o.showTop ? that.$top[0].offsetHeight : 0) - (o.showBottom ? that.$bottom[0].offsetHeight : 0)
            }
        },
        initContWidth: function() {
            var that = this.that,
                o = that.options;
            this.contWd = this.width;
            that._trigger("contWd")
        },
        setContHeight: function(ui) {
            ui = ui || {};
            var that = this.that,
                $top = that.$top,
                o = that.options;
            var ht = this.height - that.$header_o[0].offsetHeight - (o.showTop ? $top[0].offsetHeight + parseInt(getStyle($top[0], "marginTop")) : 0) - that.$bottom[0].offsetHeight + 1;
            ht = ht >= 0 ? ht : "";
            that.$cont.height(ht);
            this.contHt = ht
        },
        setContAndGridHeightForFlex: function() {
            var that = this.that,
                $hscroll = that.hscroll.widget();
            if (this.vscroll) {
                $hscroll.css("position", "")
            } else {
                $hscroll.css("position", "relative");
                var $cont = that.$cont,
                    cls = that.options.cls,
                    $bottom_cont = $cont.children("." + cls.cont_inner_b);
                $cont.height("");
                if (!$bottom_cont.length) {
                    $bottom_cont = $cont.children("." + cls.cont_inner)
                }
                $bottom_cont.height("");
                that.element.height("");
                that.$grid_center.height("")
            }
        },
        setContAndGridWidthForFlex: function() {
            var that = this.that,
                o = that.options,
                maxWidth = o.maxWidth,
                maxWidthPixel = this.maxWidthPixel,
                wdTbl = that.calcWidthCols(-1, that.colModel.length),
                $grid = that.element,
                wdSB = this.getSBWidth(),
                contWd = wdTbl + wdSB;
            if (maxWidth && contWd >= maxWidthPixel) {
                contWd = maxWidthPixel
            }
            this.contWd = contWd;
            that._trigger("contWd");
            $grid.width(contWd + "px")
        },
        getTotalVisibleRows: function(cur_pos, freezeRows, data) {
            var that = this.that,
                vrows = this.vrows,
                rowsVP = this.estRowsInViewPort(),
                tvRows = 0,
                dataLength = data ? data.length : 0,
                initV = freezeRows,
                finalV = 0,
                visible = 0,
                lastFrozenRow = null,
                nesting = that.iHierarchy ? true : false,
                o = that.options,
                DTMoff = o.detailModel.offset,
                htTotal = 0,
                rowHeight = this.rowHt,
                htCont = nesting ? this.contHt : undefined;
            if (data == null || dataLength == 0) {
                return {
                    initV: null,
                    finalV: null,
                    tvRows: tvRows,
                    lastFrozenRow: null
                }
            }
            for (var i = 0, len = dataLength > freezeRows ? freezeRows : dataLength; i < len; i++) {
                var rowData = data[i],
                    hidden = rowData.pq_hidden;
                if (!hidden) {
                    lastFrozenRow = i;
                    tvRows++;
                    if (nesting) {
                        var cellData = rowData["pq_detail"];
                        if (cellData && cellData["show"]) {
                            var ht = cellData["height"] || 0;
                            if (ht > DTMoff) ht = DTMoff;
                            htTotal += ht + rowHeight
                        } else {
                            htTotal += rowHeight
                        }
                    }
                }
            }
            if (dataLength < freezeRows) {
                return {
                    initV: lastFrozenRow,
                    finalV: lastFrozenRow,
                    tvRows: tvRows,
                    lastFrozenRow: lastFrozenRow
                }
            }
            rowsVP = rowsVP - tvRows;
            initV = finalV = vrows[cur_pos];
            visible = 0;
            for (var i = initV, len = dataLength; i < len; i++) {
                var rowData = data[i],
                    hidden = rowData.pq_hidden;
                if (hidden) {
                    finalV++
                } else if (visible === rowsVP) {
                    break
                } else {
                    finalV++;
                    visible++
                }
                if (nesting && !hidden) {
                    var cellData = rowData["pq_detail"];
                    if (cellData && cellData["show"]) {
                        var ht = cellData["height"] || 0;
                        if (ht > DTMoff) ht = DTMoff;
                        htTotal += ht + rowHeight
                    } else {
                        htTotal += rowHeight
                    }
                    if (htTotal > htCont) {
                        break
                    }
                }
            }
            tvRows += vrows.length;
            initV = initV >= dataLength ? dataLength - 1 : initV;
            finalV = finalV >= dataLength ? dataLength - 1 : finalV;
            finalV = finalV < initV ? initV : finalV;
            return {
                initV: initV,
                finalV: finalV,
                tvRows: tvRows,
                lastFrozenRow: lastFrozenRow
            }
        },
        setInitH: function(initH, finalH) {
            var that = this.that;
            that.initH = initH;
            that.finalH = finalH
        },
        setInitV: function(initV, finalV) {
            var that = this.that,
                vrows;
            if (initV == null || finalV == null) {
                vrows = this.vrows;
                if (vrows && vrows.length) {
                    initV = finalV = vrows[vrows.length - 1]
                }
            }
            that.initV = initV;
            that.finalV = finalV
        },
        calcVisibleV: function() {
            var that = this.that,
                o = that.options,
                fr = o.freezeRows,
                data = that.pdata || [],
                i, len = data.length,
                arr = [],
                j = 0;
            fr = fr > len ? len : fr;
            for (i = 0; i < fr; i++) {
                if (!data[i].pq_hidden) {
                    arr[j++] = i
                }
            }
            this.vfrows = arr;
            j = 0;
            arr = [];
            for (i = fr; i < len; i++) {
                if (!data[i].pq_hidden) {
                    arr[j++] = i
                }
            }
            this.vrows = arr
        },
        calcVisibleH: function() {
            var that = this.that,
                o = that.options,
                fc = o.freezeCols,
                i, arrC = [],
                j = 0,
                CM = that.colModel;
            for (var i = fc, len = CM.length; i < len; i++) {
                if (!CM[i].hidden) {
                    arrC[j++] = i
                }
            }
            this.vcols = arrC
        },
        calcInitFinal: function() {
            var that = this.that,
                o = that.options,
                virtualY = o.virtualY,
                freezeRows = o.freezeRows,
                initV, finalV, flexHeight = o.height === "flex",
                data = that.pdata;
            if (data == null || data.length === 0) {
                var objTVR = this.getTotalVisibleRows(cur_pos, freezeRows, data);
                that.totalVisibleRows = objTVR.tvRows;
                initV = objTVR.initV;
                finalV = objTVR.finalV;
                that.lastFrozenRow = objTVR.lastFrozenRow
            } else if (!virtualY) {
                var objTVR = this.getTotalVisibleRows(0, freezeRows, data);
                that.lastFrozenRow = objTVR.lastFrozenRow;
                that.totalVisibleRows = objTVR.tvRows;
                initV = 0;
                finalV = data.length - 1
            } else {
                var cur_pos = parseInt(that.vscroll.option("cur_pos"));
                if (isNaN(cur_pos) || cur_pos < 0) {
                    throw "cur_pos NA"
                }
                that.scrollCurPos = cur_pos;
                var objTVR = this.getTotalVisibleRows(cur_pos, freezeRows, data);
                that.totalVisibleRows = objTVR.tvRows;
                initV = objTVR.initV;
                that.lastFrozenRow = objTVR.lastFrozenRow;
                if (flexHeight && !o.maxHeight) {
                    finalV = data.length - 1
                } else {
                    finalV = objTVR.finalV
                }
            }
            this.setInitV(initV, finalV)
        },
        calcInitFinalH: function() {
            var that = this.that,
                o = that.options,
                initH, finalH, virtualX = o.virtualX,
                CM = that.colModel,
                CMLength = CM.length;
            if (!virtualX) {
                initH = 0;
                finalH = CMLength - 1
            } else {
                var cur_pos = parseInt(that.hscroll.option("cur_pos")),
                    freezeCols = parseInt(o.freezeCols),
                    flexWidth = o.width === "flex",
                    initH, vcols = this.vcols;
                if (!vcols) {
                    this.calcVisibleH();
                    vcols = this.vcols
                }
                cur_pos >= vcols.length && (cur_pos = vcols.length - 1);
                initH = vcols[cur_pos];
                if (initH > CMLength - 1) {
                    initH = CMLength - 1
                }
                if (initH < 0 || initH == null) {
                    initH = 0
                }
                if (flexWidth && !o.maxWidth) {
                    finalH = CMLength - 1
                } else {
                    var wd = that.calcWidthCols(-1, freezeCols),
                        wdCont = this.getEContWd();
                    for (var i = initH; i < CMLength; i++) {
                        var column = CM[i];
                        if (!column.hidden) {
                            var wdCol = column.outerWidth;
                            if (!wdCol) {
                                if (o.debug) {
                                    throw "outerwidth N/A"
                                }
                            }
                            wd += wdCol;
                            if (wd > wdCont) {
                                break
                            }
                        }
                    }
                    finalH = i;
                    if (finalH > CMLength - 1) {
                        finalH = CMLength - 1
                    }
                    if (finalH < freezeCols - 1) {
                        finalH = freezeCols - 1
                    }
                }
            }
            this.setInitH(initH, finalH)
        },
        _calcOffset: function(val) {
            var re = /(-|\+)([0-9]+)/;
            var match = re.exec(val);
            if (match && match.length === 3) {
                return parseInt(match[1] + match[2])
            } else {
                return 0
            }
        },
        setMax: function(prop) {
            var that = this.that,
                $grid = that.element,
                o = that.options,
                val = o[prop];
            if (val) {
                if (val == parseInt(val)) {
                    val += "px"
                }
                $grid.css(prop, val)
            } else {
                $grid.css(prop, "")
            }
        },
        refreshGridWidthAndHeight: function() {
            var that = this.that,
                o = that.options,
                wd, ht, widthPercent = (o.width + "").indexOf("%") > -1 ? true : false,
                heightPercent = (o.height + "").indexOf("%") > -1 ? true : false,
                maxHeightPercent = (o.maxHeight + "").indexOf("%") > -1 ? true : false,
                flexHeight = o.height == "flex",
                maxHeightPercentAndFlexHeight = maxHeightPercent && flexHeight,
                maxWidthPercent = (o.maxWidth + "").indexOf("%") > -1 ? true : false,
                flexWidth = o.width == "flex",
                maxWidthPercentAndFlexWidth = maxWidthPercent && flexWidth,
                element = that.element;
            if (widthPercent || heightPercent || maxHeightPercentAndFlexHeight || maxWidthPercentAndFlexWidth) {
                var parent = element.parent();
                if (!parent.length) {
                    return
                }
                var wdParent, htParent;
                if (parent[0] == document.body || element.css("position") == "fixed") {
                    wdParent = $(window).width();
                    htParent = window.innerHeight ? window.innerHeight : $(window).height()
                } else {
                    wdParent = parent.width();
                    htParent = parent.height()
                }
                var superParent = null,
                    calcOffset = this._calcOffset,
                    widthOffset = widthPercent ? calcOffset(o.width) : 0,
                    heightOffset = heightPercent ? calcOffset(o.height) : 0;
                if (maxWidthPercentAndFlexWidth) {
                    wd = parseInt(o.maxWidth) * wdParent / 100
                } else if (widthPercent) {
                    wd = parseInt(o.width) * wdParent / 100 + widthOffset
                }
                if (maxHeightPercentAndFlexHeight) {
                    ht = parseInt(o.maxHeight) * htParent / 100
                } else if (heightPercent) {
                    ht = parseInt(o.height) * htParent / 100 + heightOffset
                }
            }
            if (!wd) {
                if (flexWidth && o.maxWidth) {
                    if (!maxWidthPercent) {
                        wd = o.maxWidth
                    }
                } else if (!widthPercent) {
                    wd = o.width
                }
            }
            if (o.maxWidth) {
                this.maxWidthPixel = wd
            }
            if (!ht) {
                if (flexHeight && o.maxHeight) {
                    if (!maxHeightPercent) {
                        ht = o.maxHeight
                    }
                } else if (!heightPercent) {
                    ht = o.height
                }
            }
            if (parseFloat(wd) == wd) {
                wd = wd < o.minWidth ? o.minWidth : wd;
                element.css("width", wd)
            } else if (wd === "auto") {
                element.width(wd)
            }
            if (parseFloat(ht) == ht) {
                ht = ht < o.minHeight ? o.minHeight : ht;
                element.css("height", ht)
            }
            this.width = Math.round(element.width());
            this.height = Math.round(element.height())
        },
        decidePanes: function() {
            var that = this.that,
                pqpanes = that.pqpanes = {
                    v: false,
                    h: false
                },
                o = that.options,
                virtualX = o.virtualX,
                virtualY = o.virtualY,
                flexHeight = o.height == "flex" && !o.maxHeight,
                flexWidth = o.width == "flex" && !o.maxWidth,
                numberCell = o.numberCell,
                freezeRows = o.freezeRows,
                freezeCols = o.freezeCols;
            if (freezeRows && !flexHeight && (freezeCols || numberCell.show) && !flexWidth) {
                if (!virtualY) {
                    pqpanes.h = true
                }
                if (!virtualX) {
                    pqpanes.v = true
                }
            } else if (freezeRows && !flexHeight) {
                if (!virtualY) {
                    pqpanes.h = true
                }
            } else if ((freezeCols || numberCell.show) && !flexWidth) {
                if (!virtualX) {
                    pqpanes.v = true
                }
            }
        },
        _storeColumnWidths: function(full) {
            var that = this.that,
                o = that.options,
                CM = that.colModel,
                virtualX = o.virtualX,
                freezeCols = o.freezeCols,
                initH = that.initH,
                finalH = full ? CM.length - 1 : that.finalH,
                CMOld = [];
            for (var i = 0; i <= finalH; i++) {
                if (!full && virtualX && i < initH && i >= freezeCols) {
                    i = initH
                }
                CMOld[i] = {
                    outerWidth: CM[i].outerWidth
                }
            }
            return CMOld
        },
        _isColumnWidthChanged: function(CMOld) {
            var that = this.that,
                CM = that.colModel;
            var colDef = that.iGenerateView.colDef;
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    col = colD.colIndx;
                if (CM[col].outerWidth !== CMOld[col].outerWidth) {
                    return true
                }
            }
            return false
        },
        softRefresh: function() {
            var that = this.that,
                o = that.options;
            this.refreshScrollbars();
            that.iGenerateView.setPanes();
            that._saveDims();
            that.iMouseSelection.syncScrollBarVert();
            if (o.height == "flex") {
                this.setContAndGridHeightForFlex()
            }
            if (o.width == "flex") {
                this.setContAndGridWidthForFlex()
            }
            this._refreshFrozenLine()
        },
        refreshScrollbars: function(ui) {
            ui = ui || {};
            var self = this,
                that = self.that,
                o = that.options,
                CMOld, GV = that.iGenerateView,
                num_eles, hscroll, vscroll, flexHeight = o.height === "flex",
                flexWidth = o.width === "flex";
            if (!flexHeight && !self.contHt || !flexWidth && !self.contWd || that.totalVisibleRows === null) {
                return
            }
            num_eles = self.setScrollVNumEles(ui);
            vscroll = num_eles > 1 ? true : false;
            if ((!flexHeight || o.maxHeight) && vscroll !== self.vscroll) {
                self.vscroll = vscroll;
                if (o.scrollModel.autoFit || o.virtualX || flexWidth) {
                    CMOld = self._storeColumnWidths();
                    self.refreshColumnWidths();
                    if (self._isColumnWidthChanged(CMOld) || flexWidth) {
                        self.ignoreTResize = true;
                        self._refreshTableWidths(CMOld, {
                            table: true,
                            header: true
                        });
                        delete self.ignoreTResize;
                        self.setHeaderHeight();
                        self.setContHeight();
                        GV.setPanes();
                        num_eles = self.setScrollVNumEles(true), vscroll = num_eles > 1 ? true : false;
                        self.vscroll = vscroll
                    }
                    CMOld = null
                } else {
                    GV.setPanes()
                }
            }
            num_eles = self.setScrollHNumEles();
            hscroll = num_eles > 1 ? true : false;
            if (self.hscroll != hscroll) {
                self.hscroll = hscroll;
                GV.setPanes()
            }
            self._setScrollHLength();
            self._setScrollVLength(ui);
            self._setScrollHVLength()
        },
        _setScrollHVLength: function() {
            var that = this.that;
            if (!this.vscroll || !this.hscroll) {
                that.$hvscroll.css("visibility", "hidden")
            }
        },
        _setScrollHLength: function() {
            var that = this.that,
                $hscroll = that.hscroll.widget(),
                $hvscroll = that.$hvscroll,
                options = that.options;
            if (!options.scrollModel.horizontal) {
                $hscroll.css("visibility", "hidden");
                $hvscroll.css("visibility", "hidden");
                return
            } else {
                $hscroll.css("visibility", "");
                $hvscroll.css("visibility", "")
            }
            var contWd = this.contWd,
                wdSB = this.getSBWidth();
            $hscroll.css("right", wdSB === 0 ? 0 : "");
            that.hscroll.option("length", contWd - wdSB)
        },
        estVscroll: function() {
            var that = this.that;
            var vscroll = true;
            if (that.totalVisibleRows == null || this.contHt == null) {
                vscroll = false
            } else if (that.totalVisibleRows * this.rowHt < this.contHt) {
                vscroll = false
            }
            this.vscroll = vscroll
        },
        getSBWidth: function() {
            if (this.vscroll == null) {
                this.estVscroll()
            }
            // return this.vscroll ? 17 : 0
            return 0; // REPLACE case of 17 to 0
        },
        estHscroll: function() {
            var that = this.that;
            if (this.contWd == null) {
                throw "failed"
            }
            var hscroll = false;
            var num_eles = this.calcColsOutsideCont(that.colModel) + 1;
            if (num_eles > 1) {
                hscroll = true
            }
            this.hscroll = hscroll
        },
        getSBHeight: function() {
            if (this.hscroll == null) {
                this.estHscroll()
            }
            // return this.hscroll ? 17 : 0
            return 0; // REPLACE case of 17 to 0
        },
        getEContHt: function() {
            if (this.contHt == null) {
                throw "contHt N/A"
            }
            return this.contHt - this.getSBHeight()
        },
        getEContWd: function() {
            if (this.contWd == null) {
                throw "contWd N/A"
            }
            return this.contWd - this.getSBWidth()
        },
        calcColsOutsideCont: function(model) {
            var that = this.that,
                o = that.options,
                numberCell = o.numberCell,
                CMlen = model.length,
                column, freezeCols = o.freezeCols,
                contWd = this.contWd - this.getSBWidth(),
                tblWd = 0;
            if (numberCell.show) {
                tblWd += numberCell.outerWidth
            }
            for (var i = 0; i < CMlen; i++) {
                column = model[i];
                if (!column.hidden) {
                    tblWd += column.outerWidth
                }
            }
            var wd = 0,
                noCols = 0;
            var tblremainingWidth = Math.round(tblWd);
            if (tblremainingWidth > contWd) {
                noCols++
            }
            for (i = freezeCols; i < CMlen; i++) {
                column = model[i];
                if (!column.hidden) {
                    wd += column.outerWidth;
                    tblremainingWidth = tblWd - wd;
                    if (tblremainingWidth > contWd) {
                        noCols++
                    } else {
                        break
                    }
                }
            }
            return noCols
        },
        setScrollHNumEles: function() {
            var that = this.that,
                options = that.options,
                CM = that.colModel,
                SM = options.scrollModel,
                hscroll = that.hscroll,
                cur_pos = hscroll.option("cur_pos") * 1,
                num_eles = 0;
            if (options.width !== "flex" || options.maxWidth) {
                if (SM.lastColumn === "fullScroll") {
                    num_eles = CM.length - options.freezeCols - that._calcNumHiddenUnFrozens()
                } else {
                    num_eles = this.calcColsOutsideCont(CM) + 1
                }
            }
            if (cur_pos && num_eles <= cur_pos) {
                num_eles = cur_pos + 1
            }
            hscroll.option("num_eles", num_eles);
            return num_eles
        },
        init: function() {
            var that = this.that,
                o = that.options;
            this.hscroll = this.vscroll = this.contHt = this.contWd = null;
            that.initH = that.initV = that.finalH = that.finalV = null;
            that.totalVisibleRows = that.lastFrozenRow = null;
            this.rowHt = o.rowHeight;
            this.headerHt = 0;
            this.height = null
        },
        refresh: function(ui) {
            ui = ui || {};
            var self = this,
                that = self.that,
                header = ui.header,
                table = ui.table,
                pager = ui.pager,
                o, GV = that.iGenerateView,
                $grid = that.element;
            if (ui.colModel) {
                that.refreshCM()
            }
            if (!$grid[0].offsetWidth) {
                $grid.addClass("pq-pending-refresh");
                return
            }
            if (ui.toolbar) {
                that.refreshToolbar()
            }
            that.iMouseSelection.resetMargins();
            self.init();
            o = that.options;
            self.decidePanes();
            o.collapsible._collapsed = false;
            self.setMax("maxHeight");
            self.setMax("maxWidth");
            self.refreshGridWidthAndHeight();
            self.initContHeight();
            self.initContWidth();
            self.calcInitFinal();
            if (header === false || table === false) {
                var CMOld = self._storeColumnWidths(true)
            }
            if (!ui.skipColWidths) {
                self.refreshColumnWidths()
            }
            self.autoLastColumn();
            self.calcInitFinalH();
            GV.createColDefs();
            if (header !== false) {
                that._createHeader()
            } else {
                if (self._isColumnWidthChanged(CMOld)) {
                    self._refreshTableWidths(CMOld, {
                        header: true
                    })
                }
            }
            that._refreshHeaderSortIcons();
            if (pager !== false) {
                that._refreshPager()
            }
            self.setHeaderHeight();
            self.setContHeight();
            if (table !== false) {
                GV.generateView({
                    source: ui.source
                })
            } else {
                self._refreshTableWidths(CMOld, {
                    table: true
                });
                GV.setPanes()
            }
            that._saveDims();
            GV.scrollView();
            self.refreshScrollbars();
            if (o.height == "flex") {
                self.setContAndGridHeightForFlex()
            }
            if (o.width == "flex") {
                self.setContAndGridWidthForFlex()
            }
            self._refreshFrozenLine();
            that._createCollapse();
            o.dataModel.postDataOnce = undefined
        },
        summaryTable: function() {
            var self = this,
                $summary = self.$summary,
                that = self.that,
                data = that.options.summaryData,
                obj;
            if (data) {
                if (!$summary) {
                    $summary = self.$summary = $("<div class='pq-grid-summary'></div>").prependTo(that.$bottom)
                }
                obj = {
                    data: data,
                    $cont: $summary
                };
                that.createTable(obj)
            } else if ($summary && $summary[0].innerHTML) {
                $summary.empty()
            }
        },
        refreshVscroll: function(obj) {
            var that = this.that,
                num_eles, GV = that.iGenerateView,
                o = that.options;
            if (o.virtualY) {
                var initV = that.initV,
                    finalV = that.finalV;
                this.calcInitFinal();
                var diff = initV - that.initV,
                    diffF = finalV - that.finalV;
                if (!o.fullrefreshOnScroll && !o.detailModel.init && !that._mergeCells && Math.abs(diff) == 1 && Math.abs(diffF) == 1) {
                    if (diff == -1) {
                        GV.removeTopRow(1);
                        GV.appendRow(that.finalV - finalV)
                    } else if (diff == 1) {
                        GV.prependRow();
                        GV.removeBottomRow(finalV - that.finalV)
                    }
                } else if (initV != that.initV || finalV != that.finalV) {
                    GV.generateView()
                }
                that._saveDims();
                GV.scrollView();
                num_eles = this.setScrollVNumEles();
                if (num_eles <= 1) {
                    this.refreshScrollbars()
                }
            }
        },
        _refreshTableWidths: function(CMOld, objP) {
            var that = this.that,
                $tbl_header = that.$tbl_header,
                header = objP.header && $tbl_header,
                $tbl = that.$tbl,
                table = objP.table && $tbl,
                $trH = header ? $tbl_header.children().children(".pq-row-hidden") : null,
                $draggables = header ? that.$header.find(".pq-grid-col-resize-handle") : null,
                $tr2 = table && $tbl ? $tbl.children().children(".pq-row-hidden") : null,
                $tdH, $td2, _bodyTableChanged = false,
                incr = 0;
            if (table && that.tables.length) {
                var $tr3 = that.tables[0].$tbl.children().children(".pq-row-hidden");
                $tr2 = $tr2 ? $tr2.add($tr3) : $tr3
            }
            var colDef = that.iGenerateView.colDef;
            for (var i = 0, len = colDef.length; i < len; i++) {
                var colD = colDef[i],
                    col = colD.colIndx,
                    column = colD.column;
                var columnOld = CMOld[col],
                    oldWidth = columnOld.outerWidth,
                    outerwidth = column.outerWidth;
                if (outerwidth !== oldWidth) {
                    if (header) {
                        $tdH = $trH.find("td[pq-col-indx=" + col + "]");
                        $tdH.width(outerwidth)
                    }
                    if ($tr2) {
                        $td2 = $tr2.find("td[pq-col-indx=" + col + "]");
                        if ($td2.length) {
                            _bodyTableChanged = true;
                            $td2.width(outerwidth)
                        }
                    }
                }
                incr += outerwidth - oldWidth;
                if (header && incr !== 0) {
                    var $draggable = $draggables.filter("[pq-col-indx=" + col + "]"),
                        oldLeft = parseInt($draggable.css("left"));
                    $draggable.css("left", oldLeft + incr)
                }
            }
            if (_bodyTableChanged) {
                that._trigger("tableWidthChange")
            }
            that._saveDims()
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var ISIE = true;
    $(function() {
        var $inp = $("<input type='checkbox' style='position:fixed;left:-50px;top:-50px;'/>").appendTo(document.body);
        $inp[0].indeterminate = true;
        $inp.on("change", function() {
            ISIE = false
        });
        $inp.click();
        $inp.remove()
    });
    var cCheckBoxColumn = $.paramquery.cCheckBoxColumn = function(that, column) {
        var self = this;
        this.that = that;
        this.options = that.options;
        this.column = column;
        var defObj = {
                all: false,
                header: false,
                select: false,
                check: true,
                uncheck: false
            },
            cb = column.cb = $.extend({}, defObj, column.cb),
            di = this.dataIndx = column.dataIndx;
        column._render = self.cellRender(column);
        that.on("dataAvailable", function() {
            that.one("dataReady", function() {
                return self.onDataReady()
            })
        }).on("dataReady", function() {
            self.setValCBox()
        }).on("valChange", self.onCheckBoxChange(self, that)).on("cellKeyDown", function(evt, ui) {
            return self.onCellKeyDown(evt, ui)
        }).on("refreshHeader", function(evt, ui) {
            return self.refreshHeader(evt, ui)
        });
        if (column.cb.select) {
            that.on("rowSelect", self.onRowSelect(self, that)).on("beforeRowSelectDone", self.onBeforeRowSelect(self, that, di, cb.check, cb.uncheck)).on("change", self.onChange(self, that, di, cb.check, cb.uncheck))
        }
    };
    cCheckBoxColumn.prototype = {
        cellRender: function(column) {
            return function(ui) {
                var rd = ui.rowData,
                    checked;
                if (rd.pq_gtitle || rd.pq_gsummary) {
                    return
                }
                checked = column.cb.check === ui.cellData ? "checked" : "";
                return "<input type='checkbox' " + checked + " />"
            }
        },
        hasHeaderChkBox: function() {
            return this.column.cb.header
        },
        isEditableCell: function(ri, rd, col, ci, di) {
            var that = this.that;
            if (that.isEditableRow({
                    rowIndx: ri,
                    rowData: rd
                }) && (!col || that.isEditableCell({
                    rowIndx: ri,
                    rowData: rd,
                    column: col,
                    colIndx: ci,
                    dataIndx: di
                }))) {
                return true
            }
        },
        onBeforeRowSelect: function(self, that, cb_di, cb_check, cb_uncheck) {
            return function(evt, ui) {
                if (ui.source != "checkbox") {
                    var fn = function(rows) {
                        var ri, rd, row, i = rows.length,
                            col = that.columns[cb_di],
                            ci = that.colIndxs[cb_di];
                        while (i--) {
                            row = rows[i];
                            ri = row.rowIndx;
                            rd = row.rowData;
                            if (self.isEditableCell(ri, rd, col, ci, cb_di)) {
                                rd[cb_di] = rd.pq_rowselect ? cb_uncheck : cb_check
                            } else {
                                rows.splice(i, 1)
                            }
                        }
                    };
                    fn(ui.addList);
                    fn(ui.deleteList)
                }
            }
        },
        onCellKeyDown: function(evt, ui) {
            if (ui.dataIndx == this.dataIndx) {
                if (evt.keyCode == 13 || evt.keyCode == 32) {
                    var $inp = $(evt.originalEvent.target).find("input");
                    $inp.click();
                    return false
                }
            }
        },
        onChange: function(self, that, di, check, uncheck) {
            return function(evt, ui) {
                if (ui.source != "checkbox") {
                    var addList = [],
                        deleteList = [],
                        fn = function(rlist) {
                            rlist.forEach(function(list) {
                                var newRow = list.newRow,
                                    oldRow = list.oldRow,
                                    val;
                                if (newRow.hasOwnProperty(di)) {
                                    val = newRow[di];
                                    if (val === check) {
                                        addList.push(list)
                                    } else if (oldRow && oldRow[di] === check) {
                                        deleteList.push(list)
                                    }
                                }
                            })
                        };
                    fn(ui.addList);
                    fn(ui.updateList);
                    that.SelectRow().update({
                        addList: addList,
                        deleteList: deleteList
                    })
                }
            }
        },
        onCheckBoxChange: function(self, that) {
            return function(_evt, ui) {
                if (ui.dataIndx != self.dataIndx) {
                    return
                }
                var cb = self.column.cb,
                    evt = _evt.originalEvent,
                    rowData = ui.rowData,
                    rowIndx = ui.rowIndx,
                    dataIndx = ui.dataIndx,
                    inpChk = ui.input.checked,
                    newRow = {},
                    oldRow = {};
                newRow[dataIndx] = inpChk ? cb.check : cb.uncheck;
                oldRow[dataIndx] = rowData[dataIndx];
                var rowList = [{
                    rowData: rowData,
                    rowIndx: rowIndx,
                    oldRow: oldRow,
                    newRow: newRow
                }];
                ui.check = inpChk;
                ui.rows = rowList;
                if (that._trigger("beforeCheck", evt, ui) === false) {
                    that.refreshCell({
                        rowIndx: rowIndx,
                        dataIndx: dataIndx
                    });
                    return false
                }
                var dui = {
                    source: "checkbox",
                    updateList: rowList
                };
                dui.history = dui.track = cb.select ? false : null;
                if (that._digestData(dui) === false) {
                    that.refreshCell({
                        rowIndx: rowIndx,
                        dataIndx: dataIndx
                    });
                    return false
                }
                that.refreshRow({
                    rowIndx: rowIndx
                });
                rowList = ui.rows = dui.updateList;
                that._trigger("check", evt, ui);
                if (cb.select) {
                    that.iRows[inpChk ? "add" : "remove"]({
                        rows: rowList,
                        source: "checkbox"
                    })
                }
                self.setValCBox()
            }
        },
        onDataReady: function() {
            var that = this.that,
                rowData, data = that.get_p_data(),
                i = 0,
                len = data.length,
                column = this.column,
                cb = column.cb,
                dataIndx = column.dataIndx;
            if (dataIndx != null && data) {
                if (cb.select) {
                    for (; i < len; i++) {
                        if (rowData = data[i]) {
                            if (rowData[dataIndx] === cb.check) {
                                rowData.pq_rowselect = true
                            } else if (rowData.pq_rowselect) {
                                rowData[dataIndx] = cb.check
                            }
                        }
                    }
                }
            }
        },
        onHeaderChange: function(evt) {
            var $inp = $(evt.target),
                that = this.that,
                column = this.column,
                dataIndx = column.dataIndx,
                options = that.options,
                cb = column.cb,
                cbAll = cb.all,
                data = cbAll ? options.dataModel.data : that.pdata,
                remotePage = options.pageModel.type == "remote",
                offset = remotePage || !cbAll ? that.riOffset : 0,
                rowList = [],
                ui = {
                    column: column,
                    dataIndx: dataIndx,
                    source: "header"
                },
                inpChk = $inp[0].checked;
            for (var i = 0, len = data.length; i < len; i++) {
                var rowIndx = i + offset,
                    rowData = data[i],
                    newRow = {},
                    oldRow = {};
                newRow[dataIndx] = inpChk ? cb.check : cb.uncheck;
                oldRow[dataIndx] = rowData[dataIndx];
                rowList.push({
                    rowIndx: rowIndx,
                    rowData: rowData,
                    newRow: newRow,
                    oldRow: oldRow
                })
            }
            var dui = {
                updateList: rowList,
                source: "checkbox"
            };
            dui.history = dui.track = cb.select ? false : null;
            ui.check = inpChk;
            ui.rows = rowList;
            if (that._trigger("beforeCheck", evt, ui) === false) {
                that.refreshHeader();
                return false
            }
            if (that._digestData(dui) === false) {
                that.refreshHeader();
                return false
            }
            that.refresh({
                header: false
            });
            rowList = ui.rows = dui.updateList;
            that._trigger("check", evt, ui);
            if (cb.select) {
                that.iRows[inpChk ? "add" : "remove"]({
                    rows: rowList,
                    source: "checkbox"
                })
            }
        },
        onRowSelect: function(self, that) {
            return function(evt, ui) {
                if (ui.source != "checkbox") {
                    (ui.addList.length || ui.deleteList.length) && that.refresh()
                }
            }
        },
        refreshHeader: function(evt, ui) {
            var self = this;
            if (!this.hasHeaderChkBox()) {
                return
            }
            var that = this.that,
                data = that.pdata;
            if (!data) {
                return
            }
            var $td = that.getCellHeader({
                dataIndx: this.dataIndx
            });
            if (!$td) {
                return
            }
            var $inp = this.$inp = $td.find("input");
            this.setValCBox();
            if (ISIE) {
                $inp.on("click", function(evt) {
                    if ($inp.data("pq_value") == null) {
                        $inp[0].checked = true;
                        $inp.data("pq_value", true);
                        self.onHeaderChange(evt)
                    }
                })
            }
            $inp.on("change", function(evt) {
                self.onHeaderChange(evt)
            })
        },
        setValCBox: function() {
            if (!this.hasHeaderChkBox() || !this.$inp) {
                return
            }
            var that = this.that,
                options = this.options,
                di = this.dataIndx,
                col = this.column,
                ci = that.colIndxs[di],
                cb = col.cb,
                cbAll = cb.all,
                remotePage = options.pageModel.type == "remote",
                offset = remotePage || !cbAll ? that.riOffset : 0,
                data = cbAll ? options.dataModel.data : that.pdata,
                val = null,
                selFound = 0,
                rd, ri, rows = 0,
                unSelFound = 0;
            if (!data) {
                return
            }
            for (var i = 0, len = data.length; i < len; i++) {
                rd = data[i];
                ri = i + offset;
                if (this.isEditableCell(ri, rd, col, ci, di)) {
                    rows++;
                    if (rd[di] === cb.check) {
                        selFound++
                    } else {
                        unSelFound++
                    }
                }
            }
            if (selFound == rows && rows) {
                val = true
            } else if (unSelFound == rows) {
                val = false
            }
            this.$inp.pqval({
                val: val
            })
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    var fni = {};
    fni.options = {
        flex: {
            on: true,
            one: false,
            all: true
        },
        detailModel: {
            cache: true,
            offset: 100,
            expandIcon: "ui-icon-triangle-1-se glyphicon glyphicon-minus",
            collapseIcon: "ui-icon-triangle-1-e glyphicon glyphicon-plus"
        },
        dragColumns: {
            enabled: true,
            acceptIcon: "ui-icon-check glyphicon-ok",
            rejectIcon: "ui-icon-closethick glyphicon-remove",
            topIcon: "ui-icon-circle-arrow-s glyphicon glyphicon-circle-arrow-down",
            bottomIcon: "ui-icon-circle-arrow-n glyphicon glyphicon-circle-arrow-up"
        },
        track: null,
        mergeModel: {
            flex: false
        },
        realFocus: true,
        sortModel: {
            on: true,
            type: "local",
            multiKey: "shiftKey",
            number: true,
            single: true,
            cancel: true,
            sorter: [],
            useCache: true,
            ignoreCase: false
        },
        filterModel: {
            on: true,
            type: "local",
            mode: "AND",
            header: false,
            timeout: 400
        }
    };
    fni._create = function() {
        var that = this,
            o = that.options;
        that.listeners = {};
        that._queueATriggers = {};
        that.iHistory = new _pq.cHistory(that);
        that.iGroup = new _pq.cGroup(that);
        that.iMerge = new _pq.cMerge(that);
        that.iFilterData = new _pq.cFilterData(that);
        that.iSelection = new pq.Selection(that);
        that.iHeaderSearch = new _pq.cHeaderSearch(that);
        that.iUCData = new _pq.cUCData(that);
        that.iMouseSelection = new _pq.cMouseSelection(that);
        that._super();
        new _pq.cFormula(that);
        that.iDragColumns = new _pq.cDragColumns(that);
        that.refreshToolbar();
        if (o.dataModel.location === "remote") {
            that.refresh({
                table: true
            })
        }
        that.on("dataAvailable", function() {
            that.one("refreshDone", function() {
                that._trigger("ready");
                setTimeout(function() {
                    if (that.element) {
                        that._trigger("complete")
                    }
                }, 0)
            })
        });
        that.refreshDataAndView({
            header: true
        })
    };
    $.widget("paramquery.pqGrid", _pq._pqGrid, fni);
    $.widget.extend = function() {
        var arr_shift = Array.prototype.shift,
            isPlainObject = $.isPlainObject,
            isArray = $.isArray,
            w_extend = $.widget.extend,
            target = arr_shift.apply(arguments),
            deep, _deep;
        if (typeof target == "boolean") {
            deep = target;
            target = arr_shift.apply(arguments)
        }
        var inputs = arguments,
            i = 0,
            len = inputs.length,
            input, key, val;
        if (deep == null) {
            deep = len > 1 ? true : false
        }
        for (; i < len; i++) {
            input = inputs[i];
            for (key in input) {
                val = input[key];
                if (val !== undefined) {
                    _deep = i > 0 ? false : true;
                    if (isPlainObject(val)) {
                        target[key] = target[key] || {};
                        w_extend(_deep, target[key], val)
                    } else if (isArray(val)) {
                        target[key] = deep && _deep ? val.slice() : val
                    } else {
                        target[key] = val
                    }
                }
            }
        }
        return target
    };
    var pq = window.pq = window.pq || {};
    pq.grid = function(selector, options) {
        var $g = $(selector).pqGrid(options),
            g = $g.data("paramqueryPqGrid") || $g.data("paramquery-pqGrid");
        return g
    };
    pq.grid.render = {};
    _pq.pqGrid.regional = {};
    var fn = _pq.pqGrid.prototype;
    _pq.pqGrid.defaults = fn.options;
    fn.focus = function(_ui) {
        var ui = _ui || {},
            that = this,
            o = that.options,
            $td = ui.$td,
            td, ae = document.activeElement,
            fe, objC, nofocus, $cont = that.$cont,
            cont = $cont[0],
            data, rip = ui.rowIndxPage,
            ri, iM, cord, ci = ui.colIndx;
        if ($td) {
            if (rip == null || ci == null) {
                objC = this.getCellIndices({
                    $td: $td
                });
                rip = objC.rowIndxPage;
                ci = objC.colIndx
            }
        } else {
            if (rip == null || ci == null) {
                fe = this._focusEle;
                if (ae && ae != document.body && ae.id != "pq-grid-excel" && ae.className != "pq-grid-cont") {
                    nofocus = true;
                    return
                }
                if (fe) {
                    rip = fe.rowIndxPage;
                    ci = fe.colIndx
                } else {
                    nofocus = true
                }
            }
            if (rip != null) {
                iM = that.iMerge;
                ri = rip + that.riOffset;
                if (iM.ismergedCell(ri, ci)) {
                    cord = iM.getRootCell(ri, ci, "o");
                    rip = cord.rowIndxPage;
                    ci = cord.colIndx
                }
                $td = that.getCell({
                    rowIndxPage: rip,
                    colIndx: ci
                })
            }
        }
        if (o.realFocus) {
            cont.removeAttribute("tabindex");
            fe = this._focusEle = this._focusEle || {};
            if ($td && (td = $td[0]) && td.nodeName.toUpperCase() == "TD" && !td.edited) {
                if (fe.$ele) {
                    fe.$ele[0].removeAttribute("tabindex")
                }
                fe.$ele = $td;
                fe.rowIndxPage = rip;
                fe.colIndx = ci;
                td.setAttribute("tabindex", 0);
                if (!nofocus) {
                    td.focus()
                }
            } else {
                data = o.dataModel.data;
                if (!data || !data.length) {
                    cont.setAttribute("tabindex", 0)
                } else {
                    $td = $cont.find(".pq-grid-row:first > .pq-grid-cell");
                    $td.length && $td[0].setAttribute("tabindex", 0)
                }
            }
        } else {
            fe = this._focusEle;
            if (fe) {
                this.removeClass({
                    rowIndxPage: fe.rowIndxPage,
                    colIndx: fe.colIndx,
                    cls: "pq-focus",
                    refresh: false
                });
                this.element.find(".pq-focus").removeClass("pq-focus")
            }
            if ($td) {
                this.addClass({
                    rowIndxPage: rip,
                    colIndx: ci,
                    cls: "pq-focus"
                });
                this._focusEle = {
                    $ele: $td,
                    rowIndxPage: rip,
                    colIndx: ci
                }
            }
        }
    };
    fn.onfocus = function(evt) {
        if (!this.options.realFocus) {
            var fe = this._focusEle;
            if (fe) {
                var rip = fe.rowIndxPage,
                    ci = fe.colIndx;
                this.addClass({
                    rowIndxPage: rip,
                    colIndx: ci,
                    cls: "pq-focus"
                })
            }
        }
    };
    fn.onblur = function() {
        if (!this.options.realFocus) {
            var fe = this._focusEle;
            if (fe) {
                var rip = fe.rowIndxPage,
                    ci = fe.colIndx;
                this.removeClass({
                    rowIndxPage: rip,
                    colIndx: ci,
                    cls: "pq-focus"
                })
            }
        }
    };
    fn.callFn = function(cb, ui) {
        return pq.getFn(cb).call(this, ui)
    };
    fn.rowExpand = function(objP) {
        this.iHierarchy.rowExpand(objP)
    };
    fn.rowInvalidate = function(objP) {
        this.iHierarchy.rowInvalidate(objP)
    };
    fn.rowCollapse = function(objP) {
        this.iHierarchy.rowCollapse(objP)
    };
    fn.saveState = function(ui) {
        ui = ui || {};
        var self = this,
            $grid = self.element,
            extend = $.extend,
            o = self.options,
            oSM = o.sortModel,
            sSM = extend(true, {}, {
                sorter: oSM.sorter
            }),
            oPM = o.pageModel,
            sPM = {
                rPP: oPM.rPP,
                curPage: oPM.curPage
            },
            CM = self.colModel,
            sCM = [],
            column, filter, sCol, i = 0,
            CMlen = CM.length,
            oGM = o.groupModel,
            sGM = extend(true, {}, {
                dataIndx: oGM.dataIndx,
                dir: oGM.dir,
                collapsed: oGM.collapsed,
                merge: oGM.merge,
                grandSummary: oGM.grandSummary
            }),
            id = $grid[0].id;
        for (; i < CMlen; i++) {
            column = CM[i];
            sCol = {
                width: column.width,
                dataIndx: column.dataIndx,
                hidden: column.hidden
            };
            if (filter = column.filter) {
                sCol.filter = {
                    value: filter.value,
                    value2: filter.value2,
                    on: filter.on
                }
            }
            sCM[i] = sCol
        }
        var state = {
            colModel: sCM,
            height: o.height,
            datestamp: Date.now(),
            width: o.width,
            groupModel: sGM,
            pageModel: sPM,
            sortModel: sSM,
            freezeRows: o.freezeRows,
            freezeCols: o.freezeCols
        };
        if (ui.stringify !== false) {
            state = JSON.stringify(state);
            if (ui.save !== false && typeof Storage !== "undefined") {
                localStorage.setItem("pq-grid" + (id || ""), state)
            }
        }
        return state
    };
    fn.loadState = function(ui) {
        ui = ui || {};
        var self = this,
            obj, $grid = self.element,
            wextend = $.widget.extend,
            jextend = $.extend,
            id = $grid[0].id,
            state = ui.state || (typeof Storage === "undefined" ? undefined : localStorage.getItem("pq-grid" + (id || "")));
        if (!state) {
            return false
        } else if (typeof state == "string") {
            state = JSON.parse(state)
        }
        var CMstate = state.colModel,
            columnSt, column, dataIndx, widths = [],
            dataIndxs = [],
            colIndxs = [],
            filters = [],
            hidden = [],
            o = self.options,
            isColGroup = self.depth > 1,
            oCM = isColGroup ? self.colModel : o.colModel;
        for (var i = 0, len = CMstate.length; i < len; i++) {
            columnSt = CMstate[i];
            dataIndx = columnSt.dataIndx;
            dataIndxs[dataIndx] = true;
            colIndxs[dataIndx] = i;
            widths[dataIndx] = columnSt.width;
            filters[dataIndx] = columnSt.filter;
            hidden[dataIndx] = columnSt.hidden
        }
        if (!isColGroup) {
            oCM.sort(function(col1, col2) {
                return colIndxs[col1.dataIndx] - colIndxs[col2.dataIndx]
            })
        }
        for (var i = 0, len = oCM.length; i < len; i++) {
            column = oCM[i];
            dataIndx = column.dataIndx;
            if (dataIndxs[dataIndx]) {
                column.width = widths[dataIndx] || column.width;
                column.filter = jextend(column.filter, filters[dataIndx]);
                column.hidden = hidden[dataIndx]
            }
        }
        self.iColModel.init();
        wextend(o.sortModel, state.sortModel);
        wextend(o.pageModel, state.pageModel);
        self.Group().option(state.groupModel, false);
        obj = {
            freezeRows: state.freezeRows,
            freezeCols: state.freezeCols
        };
        if (!isNaN(o.height * 1) && !isNaN(state.height * 1)) {
            obj.height = state.height
        }
        if (!isNaN(o.width * 1) && !isNaN(state.width * 1)) {
            obj.width = state.width
        }
        self.option(obj);
        if (ui.refresh !== false) {
            self.refreshDataAndView()
        }
        return true
    };
    fn.refreshToolbar = function() {
        var that = this,
            options = that.options,
            tb = options.toolbar,
            _toolbar;
        if (that._toolbar) {
            _toolbar = that._toolbar;
            _toolbar.destroy()
        }
        if (tb) {
            var cls = tb.cls,
                cls = cls ? cls : "",
                style = tb.style,
                style = style ? style : "",
                attr = tb.attr,
                attr = attr ? attr : "",
                items = tb.items,
                $toolbar = $("<div class='" + cls + "' style='" + style + "' " + attr + " ></div>");
            if (_toolbar) {
                _toolbar.widget().replaceWith($toolbar)
            } else {
                that.$top.append($toolbar)
            }
            _toolbar = pq.toolbar($toolbar, {
                items: items,
                gridInstance: that,
                bootstrap: options.bootstrap
            });
            if (!options.showToolbar) {
                $toolbar.css("display", "none")
            }
            that._toolbar = _toolbar
        }
    };
    fn.isLeftOrRight = function(colIndx) {
        var thisOptions = this.options,
            freezeCols = this.freezeCols;
        if (colIndx > freezeCols) {
            return "right"
        } else {
            return "left"
        }
    };
    fn.ovCreateHeader = function(buffer) {
        if (this.options.filterModel.header) {
            this.iHeaderSearch.createDOM(buffer)
        }
    };
    fn.filter = function(objP) {
        return this.iFilterData.filter(objP)
    };
    fn._initTypeColumns = function() {
        var CM = this.colModel;
        for (var i = 0, len = CM.length; i < len; i++) {
            var column = CM[i],
                type = column.type;
            if (type === "checkBoxSelection" || type == "checkbox") {
                column.type = "checkbox";
                new _pq.cCheckBoxColumn(this, column)
            } else if (type === "detail") {
                column.dataIndx = "pq_detail";
                this.iHierarchy = new _pq.cHierarchy(this, column)
            }
        }
    };
    fn.refreshHeader = function() {
        this._createHeader();
        this.iGenerateView.setPanes();
        this._refreshHeaderSortIcons()
    };
    fn.refreshHeaderFilter = function(ui) {
        var obj = this.normalize(ui),
            ci = obj.colIndx,
            column = obj.column,
            iH = this.iHeaderSearch,
            $td = this.$header.find(".pq-grid-header-search-row > .pq-col-" + ci);
        $td.replaceWith(iH.renderCell(column, ci));
        iH.postRenderCell(column, ci)
    };
    fn._refreshHeaderSortIcons = function() {
        this.iHeader.refreshHeaderSortIcons()
    };
    fn.getLargestRowCol = function(arr) {
        var rowIndx, colIndx;
        for (var i = 0; i < arr.length; i++) {
            var sel = arr[i];
            var rowIndx2 = sel.rowIndx;
            if (rowIndx == null) {
                rowIndx = sel.rowIndx
            } else if (rowIndx2 > rowIndx) {
                rowIndx = rowIndx2
            }
            rowIndx = sel.rowIndx
        }
    };
    fn.bringCellToView = function(obj) {
        this._bringCellToView(obj)
    };
    fn._setUrl = function(queryStr) {
        this.options.dataModel.getUrl = function() {
            return {
                url: this.url + (queryStr != null ? queryStr : "")
            }
        }
    };
    fn.pageData = function() {
        return this.pdata
    };

    function _getData(data, dataIndices, arr) {
        for (var i = 0, len = data.length; i < len; i++) {
            var rowData = data[i],
                row = {},
                dataIndx, j = 0,
                dILen = dataIndices.length;
            for (; j < dILen; j++) {
                dataIndx = dataIndices[j];
                row[dataIndx] = rowData[dataIndx]
            }
            arr.push(row)
        }
    }
    fn.getData = function(ui) {
        ui = ui || {};
        var dataIndices = ui.dataIndx,
            dILen = dataIndices ? dataIndices.length : 0,
            data = ui.data,
            DM = this.options.dataModel,
            DMData = DM.data || [],
            DMDataUF = DM.dataUF || [],
            arr = [];
        if (dILen) {
            if (data) {
                _getData(data, dataIndices, arr)
            } else {
                _getData(DMData, dataIndices, arr);
                _getData(DMDataUF, dataIndices, arr)
            }
        } else {
            return DMDataUF.length ? DMData.concat(DMDataUF) : DMData
        }
        var sorters = [];
        for (var j = 0; j < dILen; j++) {
            var dataIndx = dataIndices[j],
                column = this.getColumn({
                    dataIndx: dataIndx
                });
            sorters.push({
                dataIndx: dataIndx,
                dir: "up",
                dataType: column.dataType,
                sortType: column.sortType
            })
        }
        arr = this.iSort._sortLocalData(sorters, arr);
        var arr2 = [],
            item2 = undefined;
        for (var i = 0, len = arr.length; i < len; i++) {
            var rowData = arr[i],
                item = JSON.stringify(rowData);
            if (item !== item2) {
                arr2.push(rowData);
                item2 = item
            }
        }
        return arr2
    };
    fn.get_p_data = function() {
        var o = this.options,
            PM = o.pageModel,
            paging = PM.type,
            remotePaging, data = o.dataModel.data,
            pdata = this.pdata,
            rpp, offset, arr = [],
            arr2;
        if (paging) {
            rpp = PM.rPP;
            offset = this.riOffset;
            remotePaging = paging == "remote";
            arr = remotePaging ? new Array(offset) : data.slice(0, offset);
            arr2 = remotePaging ? [] : data.slice(offset + rpp);
            return arr.concat(pdata, arr2)
        } else {
            return pdata || data
        }
    };
    fn._onDataAvailable = function(objP) {
        objP = objP || {};
        var options = this.options,
            apply = !objP.data,
            source = objP.source,
            sort = objP.sort,
            data = [],
            FM = options.filterModel,
            DM = options.dataModel,
            SM = options.sortModel,
            location = DM.location;
        if (apply !== false) {
            if (objP.trigger !== false) {
                this._trigger("dataAvailable", objP.evt, {
                    source: source
                })
            }
        }
        if (FM && FM.on && FM.type == "local") {
            data = this.iFilterData.filterLocalData(objP).data
        } else {
            data = DM.data
        }
        if (SM.type == "local") {
            if (sort !== false) {
                if (apply) {
                    this.sort({
                        refresh: false
                    })
                } else {
                    data = this.iSort.sortLocalData(data)
                }
            }
        }
        if (apply === false) {
            return data
        }
        this.refreshView(objP)
    };
    fn.reset = function(ui) {
        ui = ui || {};
        var self = this,
            sort = ui.sort,
            CM, i = 0,
            len, o = self.options,
            refresh = ui.refresh !== false,
            extend = $.extend,
            sortModel, groupModel, filter = ui.filter,
            cfilter, group = ui.group;
        if (!sort && !filter && !group) {
            return
        }
        if (sort) {
            sortModel = sort === true ? {
                sorter: []
            } : sort;
            extend(o.sortModel, sortModel)
        }
        if (filter) {
            !refresh && this.iFilterData.clearFilters(self.colModel)
        }
        if (group) {
            groupModel = group === true ? {
                dataIndx: []
            } : group;
            self.groupOption(groupModel, false)
        }
        if (refresh) {
            if (filter) {
                self.filter({
                    oper: "replace",
                    rules: []
                });
                self.refreshHeader()
            } else if (sort) {
                self.sort()
            } else {
                self.refreshView()
            }
        }
    };
    fn._trigger = _pq._trigger;
    fn.on = _pq.on;
    fn.one = _pq.one;
    fn.off = _pq.off;
    fn.pager = function() {
        return this.pagerW
    };
    fn.vscrollbar = function() {
        return this.vscroll
    };
    fn.hscrollbar = function() {
        return this.hscroll
    };
    fn.toolbar = function() {
        return this._toolbar.element
    };
    fn.Columns = function() {
        return this.iColModel
    };
    _pq.cColModel = function(that) {
        this.that = that;
        this.init()
    };
    _pq.cColModel.prototype = {
        alignColumns: function(CM, CMLength) {
            for (var i = 0; i < CMLength; i++) {
                var column = CM[i];
                if (!column.align) {
                    var dataType = column.dataType;
                    if (dataType && (dataType == "integer" || dataType == "float")) {
                        column.align = "right"
                    }
                }
            }
        },
        alter: function(cb) {
            var that = this.that;
            cb.call(that);
            that.refreshCM();
            that.refresh()
        },
        assignRowSpan: function() {
            var that = this.that,
                CMLength = that.colModel.length,
                headerCells = that.headerCells,
                depth = that.depth;
            for (var col = 0; col < CMLength; col++) {
                for (var row = 0; row < depth; row++) {
                    var colModel = headerCells[row][col];
                    if (col > 0 && colModel == headerCells[row][col - 1]) {
                        continue
                    } else if (row > 0 && colModel == headerCells[row - 1][col]) {
                        continue
                    }
                    var rowSpan = 1;
                    for (var row2 = row + 1; row2 < depth; row2++) {
                        var colModel2 = headerCells[row2][col];
                        if (colModel == colModel2) {
                            rowSpan++
                        }
                    }
                    colModel.rowSpan = rowSpan
                }
            }
            return headerCells
        },
        autoGenColumns: function() {
            var that = this.that,
                o = that.options,
                CT = o.columnTemplate || {},
                CT_dataType = CT.dataType,
                CT_title = CT.title,
                CT_width = CT.width,
                data = o.dataModel.data,
                val = pq.validation,
                CM = [];
            if (data && data.length) {
                var rowData = data[0];
                $.each(rowData, function(indx, cellData) {
                    var dataType = "string";
                    if (val.isInteger(cellData)) {
                        if (cellData + "".indexOf(".") > -1) {
                            dataType = "float"
                        } else {
                            dataType = "integer"
                        }
                    } else if (val.isDate(cellData)) {
                        dataType = "date"
                    } else if (val.isFloat(cellData)) {
                        dataType = "float"
                    }
                    CM.push({
                        dataType: CT_dataType ? CT_dataType : dataType,
                        dataIndx: indx,
                        title: CT_title ? CT_title : indx,
                        width: CT_width ? CT_width : 100
                    })
                })
            }
            o.colModel = CM
        },
        cacheIndices: function() {
            var that = this.that,
                isJSON = this.getDataType() == "JSON" ? true : false,
                columns = {},
                colIndxs = {},
                validations = {},
                CM = that.colModel,
                i = 0,
                CMLength = CM.length;
            for (; i < CMLength; i++) {
                var column = CM[i],
                    dataIndx = column.dataIndx;
                if (dataIndx == null) {
                    dataIndx = column.type == "detail" ? "pq_detail" : isJSON ? "dataIndx_" + i : i;
                    if (dataIndx == "pq_detail") {
                        column.dataType = "object"
                    }
                    column.dataIndx = dataIndx
                }
                columns[dataIndx] = column;
                colIndxs[dataIndx] = i;
                var valids = column.validations;
                if (valids) {
                    validations[dataIndx] = validations
                }
            }
            that.columns = columns;
            that.colIndxs = colIndxs;
            that.validations = validations
        },
        collapse: function(column, collapsible) {
            var on = collapsible.on,
                CM = column.colModel || [],
                len = CM.length,
                indx = collapsible.last ? len - 1 : 0;
            if (len) {
                this.each(function(col) {
                    col.hidden = on
                }, CM);
                this.each(function(col) {
                    col.hidden = false
                }, [CM[indx]])
            }
        },
        each: function(cb, cm) {
            var that = this.that;
            (cm || that.options.colModel).forEach(function(col) {
                cb.call(that, col);
                col.colModel && this.each(cb, col.colModel)
            }, this)
        },
        extend: function(CM, CMT) {
            var key, val, extend = $.extend,
                i = CM.length;
            while (i--) {
                var column = CM[i];
                for (key in CMT) {
                    if (column[key] === undefined) {
                        val = CMT[key];
                        if (val && typeof val == "object") {
                            column[key] = extend(true, {}, val)
                        } else {
                            column[key] = val
                        }
                    }
                }
            }
        },
        find: function(cb, _cm) {
            var that = this.that,
                CM = _cm || that.options.colModel,
                i = 0,
                len = CM.length,
                col, ret;
            for (; i < len; i++) {
                col = CM[i];
                if (cb.call(that, col)) {
                    return col
                }
                if (col.colModel) {
                    ret = this.find(cb, col.colModel);
                    if (ret) return ret
                }
            }
        },
        getHeadersCells: function() {
            var that = this.that,
                optColModel = that.options.colModel,
                CMLength = that.colModel.length,
                depth = that.depth,
                arr = [];
            for (var row = 0; row < depth; row++) {
                arr[row] = [];
                var k = 0,
                    childCountSum = 0;
                for (var col = 0; col < CMLength; col++) {
                    var colModel;
                    if (row == 0) {
                        colModel = optColModel[k]
                    } else {
                        var parentColModel = arr[row - 1][col],
                            children = parentColModel.colModel;
                        if (!children || children.length == 0) {
                            colModel = parentColModel
                        } else {
                            var diff = col - parentColModel.leftPos,
                                childCountSum2 = 0,
                                tt = 0;
                            for (var t = 0; t < children.length; t++) {
                                childCountSum2 += children[t].childCount > 0 ? children[t].childCount : 1;
                                if (diff < childCountSum2) {
                                    tt = t;
                                    break
                                }
                            }
                            colModel = children[tt]
                        }
                    }
                    var childCount = colModel.childCount ? colModel.childCount : 1;
                    if (col == childCountSum) {
                        colModel.leftPos = col;
                        arr[row][col] = colModel;
                        childCountSum += childCount;
                        if (optColModel[k + 1]) {
                            k++
                        }
                    } else {
                        arr[row][col] = arr[row][col - 1]
                    }
                }
            }
            that.headerCells = arr;
            return arr
        },
        getDataType: function() {
            var CM = this.colModel;
            if (CM && CM[0]) {
                var dataIndx = CM[0].dataIndx;
                if (typeof dataIndx == "string") {
                    return "JSON"
                } else {
                    return "ARRAY"
                }
            }
        },
        init: function() {
            var that = this.that,
                o = that.options,
                obj, CMT = o.columnTemplate,
                CM, CMLength, oCM = o.colModel;
            if (!oCM) {
                this.autoGenColumns();
                oCM = o.colModel
            }
            obj = this.nestedCols(oCM);
            that.depth = obj.depth;
            CM = that.colModel = obj.colModel;
            CMLength = CM.length;
            if (CMT) {
                this.extend(CM, CMT)
            }
            this.getHeadersCells();
            this.alignColumns(CM, CMLength);
            this.assignRowSpan();
            this.cacheIndices();
            that._trigger("CMInit")
        },
        nestedCols: function(colMarr, _depth, _hidden, parent) {
            var len = colMarr.length,
                arr = [];
            if (_depth == null) _depth = 1;
            var new_depth = _depth,
                colSpan = 0,
                width = 0,
                childCount = 0,
                o_colspan = 0;
            for (var i = 0; i < len; i++) {
                var column = colMarr[i],
                    child_CM = column.colModel,
                    collapsible = column.collapsible;
                column.parent = parent ? parent : undefined;
                if (_hidden === true) {
                    column.hidden = _hidden
                }
                if (child_CM && child_CM.length) {
                    collapsible && this.collapse(column, collapsible);
                    var obj = this.nestedCols(child_CM, _depth + 1, column.hidden, column);
                    arr = arr.concat(obj.colModel);
                    if (obj.colSpan > 0) {
                        if (obj.depth > new_depth) {
                            new_depth = obj.depth
                        }
                        column.colSpan = obj.colSpan;
                        colSpan += obj.colSpan
                    } else {
                        column.colSpan = 0
                    }
                    o_colspan += obj.o_colspan;
                    column.o_colspan = obj.o_colspan;
                    column.childCount = obj.childCount;
                    childCount += obj.childCount
                } else {
                    if (column.hidden) {
                        column.colSpan = 0
                    } else {
                        column.colSpan = 1;
                        colSpan++
                    }
                    o_colspan++;
                    column.o_colspan = 1;
                    column.childCount = 0;
                    childCount++;
                    arr.push(column)
                }
            }
            return {
                depth: new_depth,
                colModel: arr,
                colSpan: colSpan,
                width: width,
                childCount: childCount,
                o_colspan: o_colspan
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var cCells = function(that) {
        var self = this;
        self.that = that;
        self.class = "pq-grid-select-overlay";
        self.ranges = [];
        that.on("refresh refreshRow resizeTable", self.onRefresh(self, that))
    };
    $.paramquery.cCells = cCells;
    cCells.prototype = {
        addBlock: function(range, remove) {
            if (!range || !this.addUnique(this.ranges, range)) {
                return
            }
            var that = this.that,
                r1 = range.r1,
                c1 = range.c1,
                r2 = range.r2,
                c2 = range.c2,
                cls = this.serialize(r1, c1, r2, c2) + " " + range.type,
                getCoord = this.getCoord,
                gc = function(ri, ci) {
                    return that.getCell({
                        rowIndx: ri,
                        colIndx: ci
                    })
                },
                tmp = this.shiftRC(r1, c1, r2, c2);
            if (!tmp) {
                return
            }
            r1 = tmp[0];
            c1 = tmp[1];
            r2 = tmp[2];
            c2 = tmp[3];
            var $tdLT = gc(r1, c1),
                tblLT = $tdLT.closest("table")[0],
                $tdTR, tblTR, $tdRB = gc(r2, c2),
                tblRB = $tdRB.closest("table")[0],
                $tdBL, tblBL, parLT_ht, parLT_wd, parLT, left, top, right, bottom, ht, wd;
            if ($tdLT[0]) {
                tmp = getCoord($tdLT);
                left = tmp[0];
                top = tmp[1];
                tmp = getCoord($tdRB);
                right = tmp[2];
                bottom = tmp[3];
                ht = bottom - top, wd = right - left;
                if (tblLT == tblRB) {
                    this.addLayer(left, top, ht, wd, cls, tblLT)
                } else {
                    $tdTR = gc(r1, c2);
                    tblTR = $tdTR.closest("table")[0];
                    $tdBL = gc(r2, c1);
                    tblBL = $tdBL.closest("table")[0];
                    parLT = $(tblLT).parent()[0];
                    parLT_wd = parLT.offsetWidth;
                    parLT_ht = parLT.offsetHeight;
                    if (tblBL == tblLT) {
                        this.addLayer(left, top, ht, parLT_wd - left, cls, tblLT, "border-right:0;");
                        this.addLayer(0, top, ht, right, cls, tblRB, "border-left:0;")
                    } else if (tblLT == tblTR) {
                        this.addLayer(left, top, parLT_ht - top, wd, cls, tblLT, "border-bottom:0;");
                        this.addLayer(left, 0, bottom, wd, cls, tblRB, "border-top:0;")
                    } else {
                        this.addLayer(left, top, parLT_ht - top, parLT_wd - left, cls, tblLT, "border-right:0;border-bottom:0");
                        this.addLayer(0, top, parLT_ht - top, right, cls, tblTR, "border-left:0;border-bottom:0");
                        this.addLayer(left, 0, bottom, parLT_wd - left, cls, tblBL, "border-right:0;border-top:0");
                        this.addLayer(0, 0, bottom, right, cls, tblRB, "border-left:0;border-top:0")
                    }
                }
            }
        },
        addLayer: function(left, top, ht, wd, cls, tbl, _style) {
            top = top - 1;
            var style = "position:absolute;left:" + left + "px;top:" + top + "px;height:" + ht + "px;width:" + wd + "px;";
            style += "pointer-events:none;";
            if (cls.indexOf("cell") == -1) {
                style += "border:1px solid #999;" + (_style || "")
            }
            $("<svg class='" + this.class + " " + cls + "' style='" + style + "'></svg>").appendTo($(tbl).parent())
        },
        addUnique: function(ranges, range) {
            var found = ranges.filter(function(_range) {
                return range.r1 == _range.r1 && range.c1 == _range.c1 && range.r2 == _range.r2 && range.c2 == _range.c2
            })[0];
            if (!found) {
                ranges.push(range);
                return true
            }
        },
        getCoord: function($td) {
            var $tbl = $td.closest("table"),
                td = $td[0],
                ht = td.offsetHeight,
                wd = td.offsetWidth,
                left = td.offsetLeft + parseInt($tbl.css("left")),
                top = td.offsetTop + parseInt($tbl.css("top"));
            return [left, top, left + wd, top + ht]
        },
        getLastVisibleFrozenCI: function() {
            var that = this.that,
                CM = that.colModel,
                i = that.options.freezeCols - 1;
            for (; i >= 0; i--) {
                if (!CM[i].hidden) {
                    return i
                }
            }
        },
        getLastVisibleFrozenRIP: function() {
            var that = this.that,
                data = that.get_p_data(),
                offset = that.riOffset,
                i = that.options.freezeRows + offset - 1;
            for (; i >= offset; i--) {
                if (!data[i].pq_hidden) {
                    return i - offset
                }
            }
        },
        getSelection: function() {
            var that = this.that,
                data = that.get_p_data(),
                CM = that.colModel,
                cells = [];
            this.ranges.forEach(function(range) {
                var r1 = range.r1,
                    r2 = range.r2,
                    c1 = range.c1,
                    c2 = range.c2,
                    rd, i, j;
                for (i = r1; i <= r2; i++) {
                    rd = data[i];
                    for (j = c1; j <= c2; j++) {
                        cells.push({
                            dataIndx: CM[j].dataIndx,
                            colIndx: j,
                            rowIndx: i,
                            rowData: rd
                        })
                    }
                }
            });
            return cells
        },
        isSelected: function(ui) {
            var that = this.that,
                objP = that.normalize(ui),
                ri = objP.rowIndx,
                ci = objP.colIndx;
            if (ci == null || ri == null) {
                return null
            }
            return !!this.ranges.find(function(range) {
                var r1 = range.r1,
                    r2 = range.r2,
                    c1 = range.c1,
                    c2 = range.c2;
                if (ri >= r1 && ri <= r2 && ci >= c1 && ci <= c2) {
                    return true
                }
            })
        },
      onRefresh: function(self, that) {
            var id;
            return function() {
                clearTimeout(id);
                id = setTimeout(function() {
                    if (that.element) {
                        self.removeAll();
                        that.Selection().address().forEach(function(range) {
                            self.addBlock(range)
                        })
                    }
                }, 50)
            }
        },
        removeAll: function() {
            var $cont = this.that.$cont;
            if ($cont) {
                $cont.children().children("svg").remove()
            }
            this.ranges = []
        },
        removeBlock: function(range) {
            if (range) {
                var r1 = range.r1,
                    c1 = range.c1,
                    r2 = range.r2,
                    c2 = range.c2,
                    indx = this.ranges.findIndex(function(_range) {
                        return r1 == _range.r1 && c1 == _range.c1 && r2 == _range.r2 && c2 == _range.c2
                    });
                if (indx >= 0) {
                    this.ranges.splice(indx, 1);
                    this.that.$cont.find("." + this.class + "." + this.serialize(r1, c1, r2, c2)).remove()
                }
            }
        },
        serialize: function(r1, c1, r2, c2) {
            return "r1" + r1 + "c1" + c1 + "r2" + r2 + "c2" + c2
        },
        shiftRC: function(r1, c1, r2, c2) {
            var that = this.that,
                iM = that.iMerge,
                o = that.options,
                obj, fc = o.freezeCols,
                fr = o.freezeRows,
                initH = that.initH,
                initV = that.initV,
                finalH = that.finalH,
                finalV = that.finalV,
                offset = that.riOffset;
            r1 -= offset;
            r2 -= offset;
            r1 = r1 < fr ? Math.max(r1, Math.min(0, r2)) : Math.max(r1, initV);
            c1 = c1 < fc ? c1 : Math.max(c1, initH);
            if (fr && r2 >= fr && r2 < initV) {
                r2 = this.getLastVisibleFrozenRIP()
            } else if (r2 >= initV) {
                r2 = Math.min(r2, finalV)
            }
            if (fc && c2 >= fc && c2 < initH) {
                c2 = this.getLastVisibleFrozenCI()
            } else if (c2 >= initH) {
                c2 = Math.min(c2, finalH)
            }
            if (c2 < c1 || r2 < r1) {
                return
            }
            r1 += offset;
            r2 += offset;
            if (iM.ismergedCell(r1, c1)) {
                obj = iM.getRootCell(r1, c1, "a");
                r1 = obj.rowIndx;
                c1 = obj.colIndx
            }
            if (iM.ismergedCell(r2, c2)) {
                obj = iM.getRootCell(r2, c2, "a");
                r2 = obj.rowIndx;
                c2 = obj.colIndx
            }
            return [r1, c1, r2, c2]
        }
    }
})(jQuery);
(function($) {
    "use strict";
    $.paramquery.pqGrid.prototype.Range = function(range, expand) {
        return new pq.Range(this, range, "range", expand)
    };
    var pq = window.pq = window.pq || {};
    pq.extend = function(base, sub, methods) {
        var fn = function() {};
        fn.prototype = base.prototype;
        var _p = sub.prototype = new fn;
        var _bp = base.prototype;
        for (var method in methods) {
            var _bpm = _bp[method],
                _spm = methods[method];
            if (_bpm) {
                _p[method] = function(_bpm, _spm) {
                    return function() {
                        var old_super = this._super,
                            ret;
                        this._super = function() {
                            return _bpm.apply(this, arguments)
                        };
                        ret = _spm.apply(this, arguments);
                        this._super = old_super;
                        return ret
                    }
                }(_bpm, _spm)
            } else {
                _p[method] = _spm
            }
        }
        _p.constructor = sub;
        _p._base = base;
        _p._bp = function(method) {
            var args = arguments;
            Array.prototype.shift.call(args);
            return _bp[method].apply(this, args)
        }
    };
    var Range = pq.Range = function(that, range, type, expand) {
        if (that == null) {
            throw "invalid param"
        }
        this.that = that;
        if (this instanceof Range == false) {
            return new Range(that, range, type, expand)
        }
        this._type = type || "range";
        this.init(range, expand)
    };
    Range.prototype = $.extend({
        add: function(range) {
            this.init(range)
        },
        address: function() {
            return this._areas
        },
        addressLast: function() {
            var areas = this.address();
            return areas[areas.length - 1]
        },
        clear: function() {
            return this.copy({
                copy: false,
                cut: true,
                source: "clear"
            })
        },
        clearOther: function(_range) {
            var range = this._normal(_range, true),
                sareas = this.address(),
                i;
            for (i = sareas.length - 1; i >= 0; i--) {
                var srange = sareas[i];
                if (!(srange.r1 == range.r1 && srange.c1 == range.c1 && srange.r2 == range.r2 && srange.c2 == range.c2)) {
                    sareas.splice(i, 1)
                }
            }
        },
        _copyArea: function(r1, r2, c1, c2, CM, buffer, rowList, p_data, cut, copy, render) {
            var that = this.that,
                cv, cv2, str, ri, ci, readCell = that.readCell,
                getRenderVal = this.getRenderVal,
                iMerge = that.iMerge,
                offset = that.riOffset,
                iGV = that.iGenerateView;
            for (ri = r1; ri <= r2; ri++) {
                var rowBuffer = [],
                    rd = p_data[ri],
                    newRow = {},
                    oldRow = {},
                    objR = {
                        rowIndx: ri,
                        rowIndxPage: ri - offset,
                        rowData: rd,
                        Export: true,
                        exportClip: true
                    };
                for (ci = c1; ci <= c2; ci++) {
                    var column = CM[ci],
                        di = column.dataIndx;
                    if (column.copy === false) {
                        continue
                    }
                    cv = rd[di];
                    if (copy) {
                        cv2 = readCell(rd, column, iMerge, ri, ci);
                        if (cv2 === cv) {
                            objR.colIndx = ci;
                            objR.column = column;
                            objR.dataIndx = di;
                            cv2 = getRenderVal(objR, render, iGV)[0]
                        }
                        rowBuffer.push(cv2)
                    }
                    if (cut && cv !== undefined) {
                        newRow[di] = undefined;
                        oldRow[di] = cv
                    }
                }
                if (cut) {
                    rowList.push({
                        rowIndx: ri,
                        rowData: rd,
                        oldRow: oldRow,
                        newRow: newRow
                    })
                }
                str = rowBuffer.join("	");
                rowBuffer = [];
                buffer.push(str)
            }
        },
        copy: function(ui) {
            ui = ui || {};
            var that = this.that,
                dest = ui.dest,
                cut = !!ui.cut,
                copy = ui.copy == null ? true : ui.copy,
                source = ui.source || (cut ? "cut" : "copy"),
                history = ui.history,
                allowInvalid = ui.allowInvalid,
                rowList = [],
                buffer = [],
                p_data = that.get_p_data(),
                CM = that.colModel,
                render = ui.render,
                type, r1, c1, r2, c2, areas = this.address();
            history = history == null ? true : history;
            allowInvalid = allowInvalid == null ? true : allowInvalid;
            render = render == null ? that.options.copyModel.render : render;
            if (!areas.length) {
                return
            }
            areas.forEach(function(area) {
                type = area.type, r1 = area.r1, c1 = area.c1, r2 = type === "cell" ? r1 : area.r2, c2 = type === "cell" ? c1 : area.c2;
                this._copyArea(r1, r2, c1, c2, CM, buffer, rowList, p_data, cut, copy, render)
            }, this);
            if (copy) {
                var str = buffer.join("\n");
                if (ui.clip) {
                    var $clip = ui.clip;
                    $clip.val(str);
                    $clip.select()
                } else {
                    that._setGlobalStr(str)
                }
            }
            if (dest) {
                that.paste({
                    dest: dest,
                    rowList: rowList,
                    history: history,
                    allowInvalid: allowInvalid
                })
            } else if (cut) {
                var ret = that._digestData({
                    updateList: rowList,
                    source: source,
                    history: history,
                    allowInvalid: allowInvalid
                });
                if (ret !== false) {
                    that.refresh({
                        source: "cut"
                    })
                }
            }
        },
        _countArea: function(nrange) {
            var arr = nrange,
                type = nrange.type,
                r1 = arr.r1,
                c1 = arr.c1,
                r2 = arr.r2,
                c2 = arr.c2;
            if (type === "cell") {
                return 1
            } else if (type === "row") {
                return 0
            } else {
                return (r2 - r1 + 1) * (c2 - c1 + 1)
            }
        },
        count: function() {
            var type_range = this._type === "range",
                arr = this.address(),
                tot = 0,
                len = arr.length;
            for (var i = 0; i < len; i++) {
                tot += type_range ? this._countArea(arr[i]) : 1
            }
            return tot
        },
        cut: function(ui) {
            ui = ui || {};
            ui.cut = true;
            return this.copy(ui)
        },
        getIndx: function(_indx) {
            return _indx == null ? this._areas.length - 1 : _indx
        },
        getValue: function() {
            var areas = this.address(),
                area, rd, arr = [],
                val, that = this.that,
                r1, c1, r2, c2, i, j, data;
            if (areas.length) {
                area = areas[0];
                r1 = area.r1;
                c1 = area.c1;
                r2 = area.r2;
                c2 = area.c2;
                data = that.get_p_data();
                for (i = r1; i <= r2; i++) {
                    rd = data[i];
                    for (j = c1; j <= c2; j++) {
                        val = rd[that.colModel[j].dataIndx];
                        arr.push(val)
                    }
                }
                return arr
            }
        },
        hide: function(ui) {
            ui = ui || {};
            var that = this.that,
                CM = that.colModel,
                j, data = that.get_p_data(),
                areas = this._areas;
            areas.forEach(function(area) {
                var type = area.type,
                    r1 = area.r1,
                    r2 = area.r2,
                    c1 = area.c1,
                    c2 = area.c2;
                if (type === "column") {
                    for (j = c1; j <= c2; j++) {
                        CM[j].hidden = true
                    }
                } else if (type === "row") {
                    for (j = r1; j <= r2; j++) {
                        data[j].pq_hidden = true
                    }
                }
            });
            if (ui.refresh !== false) {
                that.refreshView()
            }
        },
        indexOf: function(range) {
            range = this._normal(range);
            var r1 = range.r1,
                c1 = range.c1,
                r2 = range.r2,
                c2 = range.c2,
                areas = this.address(),
                i = 0,
                len = areas.length,
                a;
            for (; i < len; i++) {
                a = areas[i];
                if (a.type !== "row" && r1 >= a.r1 && r2 <= a.r2 && c1 >= a.c1 && c2 <= a.c2) {
                    return i
                }
            }
            return -1
        },
        index: function(range) {
            range = this._normal(range);
            var type = range.type,
                r1 = range.r1,
                c1 = range.c1,
                r2 = range.r2,
                c2 = range.c2,
                areas = this.address(),
                i = 0,
                len = areas.length,
                a;
            for (; i < len; i++) {
                a = areas[i];
                if (type === a.type && r1 === a.r1 && r2 === a.r2 && c1 === a.c1 && c2 === a.c2) {
                    return i
                }
            }
            return -1
        },
        init: function(range, expand) {
            expand = expand !== false;
            if (range) {
                if (typeof range.push == "function") {
                    for (var i = 0, len = range.length; i < len; i++) {
                        this.init(range[i], expand)
                    }
                } else {
                    var nrange = this._normal(range, expand),
                        areas = this._areas = this._areas || [];
                    if (nrange) {
                        areas.push(nrange)
                    }
                }
            }
        },
        merge: function(ui) {
            ui = ui || {};
            var that = this.that,
                o = that.options,
                mc = o.mergeCells,
                areas = this._areas,
                rc, cc, area = areas[0];
            if (area) {
                rc = area.r2 - area.r1 + 1;
                cc = area.c2 - area.c1 + 1;
                if (rc > 1 || cc > 1) {
                    area.rc = rc;
                    area.cc = cc;
                    mc.push(area);
                    if (ui.refresh !== false) {
                        that.refreshView()
                    }
                }
            }
        },
        replace: function(_range, _indx) {
            var range = this._normal(_range),
                sareas = this._areas,
                indx = this.getIndx(_indx);
            sareas.splice(indx, 1, range)
        },
        remove: function(range) {
            var areas = this._areas,
                indx = this.indexOf(range);
            if (indx >= 0) {
                areas.splice(indx, 1)
            }
        },
        resize: function(_range, _indx) {
            var range = this._normal(_range),
                sareas = this._areas,
                indx = this.getIndx(_indx),
                sarea = sareas[indx];
            ["r1", "c1", "r2", "c2", "rc", "cc", "type"].forEach(function(key) {
                sarea[key] = range[key]
            });
            return this
        },
        rows: function(indx) {
            var that = this.that,
                narr = [],
                arr = this.addressLast();
            if (arr) {
                var r1 = arr.r1,
                    c1 = arr.c1,
                    r2 = arr.r2,
                    c2 = arr.c2,
                    type = arr.type,
                    indx1 = indx == null ? r1 : r1 + indx,
                    indx2 = indx == null ? r2 : r1 + indx;
                for (var i = indx1; i <= indx2; i++) {
                    narr.push({
                        r1: i,
                        c1: c1,
                        r2: i,
                        c2: c2,
                        type: type
                    })
                }
            }
            return pq.Range(that, narr, "row")
        },
        _normal: function(range, expand) {
            if (range.type) {
                return range
            }
            var arr;
            if (typeof range.push == "function") {
                arr = [];
                for (var i = 0, len = range.length; i < len; i++) {
                    var ret = this._normal(range[i], expand);
                    if (ret) {
                        arr.push(ret)
                    }
                }
                return arr
            }
            var that = this.that,
                data = that.get_p_data(),
                rmax = data.length - 1,
                CM = that.colModel,
                cmax = CM.length - 1,
                r1 = range.r1,
                c1 = range.c1,
                r1 = r1 > rmax ? rmax : r1,
                c1 = c1 > cmax ? cmax : c1,
                rc = range.rc,
                cc = range.cc,
                r2 = range.r2,
                c2 = range.c2,
                r2 = r2 > rmax ? rmax : r2,
                c2 = c2 > cmax ? cmax : c2,
                r2 = rc ? r1 + rc - 1 : r2,
                c2 = cc ? c1 + cc - 1 : c2,
                tmp, type;
            if (cmax < 0 || rmax < 0) {
                return null
            }
            if (r1 > r2) {
                tmp = r1;
                r1 = r2;
                r2 = tmp
            }
            if (c1 > c2) {
                tmp = c1;
                c1 = c2;
                c2 = tmp
            }
            if (r1 == null && c1 == null) {
                return
            }
            if (r1 == null) {
                r1 = 0;
                r2 = rmax;
                c2 = c2 == null ? c1 : c2;
                type = "column"
            } else if (c1 == null) {
                if (!range._type) {}
                c1 = 0;
                r2 = r2 == null ? r1 : r2;
                c2 = cmax;
                type = range._type || "row"
            } else if (r2 == null || r1 == r2 && c1 == c2) {
                type = "cell";
                r2 = r1;
                c2 = c1
            } else {
                type = "block"
            }
            if (expand) {
                arr = that.iMerge.inflateRange(r1, c1, r2, c2);
                r1 = arr[0];
                c1 = arr[1];
                r2 = arr[2];
                c2 = arr[3]
            }
            range.r1 = r1;
            range.c1 = c1;
            range.r2 = r2;
            range.c2 = c2;
            range.type = range.type || type;
            return range
        },
        select: function() {
            var that = this.that,
                iS = that.iSelection,
                areas = this._areas;
            if (areas.length) {
                iS.removeAll({
                    trigger: false
                });
                areas.forEach(function(area) {
                    iS.add(area, false)
                });
                iS.trigger()
            }
            return this
        },
        unhide: function(ui) {
            ui = ui || {};
            var that = this.that,
                CM = that.colModel,
                data = that.get_p_data(),
                j, areas = this._areas;
            areas.forEach(function(area) {
                var type = area.type,
                    r1 = area.r1,
                    r2 = area.r2,
                    c1 = area.c1,
                    c2 = area.c2;
                if (type === "column") {
                    for (j = c1; j <= c2; j++) {
                        CM[j].hidden = false
                    }
                } else if (type === "row") {
                    for (j = r1; j <= r2; j++) {
                        data[j].pq_hidden = false
                    }
                }
            });
            if (ui.refresh !== false) {
                that.refreshView()
            }
        },
        unmerge: function(ui) {
            ui = ui || {};
            var that = this.that,
                o = that.options,
                mc = o.mergeCells,
                areas = this._areas,
                area = areas[0];
            if (area) {
                for (var i = 0; i < mc.length; i++) {
                    var mcRec = mc[i];
                    if (mcRec.r1 === area.r1 && mcRec.c1 === area.c1) {
                        mc.splice(i, 1);
                        break
                    }
                }
                if (ui.refresh !== false) {
                    that.refreshView()
                }
            }
        },
        value: function(val) {
            var ii = 0,
                that = this.that,
                CM = that.colModel,
                area, r1, c1, r2, c2, rowList = [],
                areas = this.address();
            if (val === undefined) {
                return this.getValue()
            }
            for (var i = 0; i < areas.length; i++) {
                area = areas[i];
                r1 = area.r1;
                c1 = area.c1;
                r2 = area.r2;
                c2 = area.c2;
                for (var j = r1; j <= r2; j++) {
                    var obj = that.normalize({
                            rowIndx: j
                        }),
                        rd = obj.rowData,
                        ri = obj.rowIndx,
                        oldRow = {},
                        newRow = {};
                    for (var k = c1; k <= c2; k++) {
                        var dataIndx = CM[k].dataIndx;
                        newRow[dataIndx] = val[ii++];
                        oldRow[dataIndx] = rd[dataIndx]
                    }
                    rowList.push({
                        rowData: rd,
                        rowIndx: ri,
                        newRow: newRow,
                        oldRow: oldRow
                    })
                }
            }
            if (rowList.length) {
                that._digestData({
                    updateList: rowList,
                    source: "range"
                });
                that.refresh()
            }
            return this
        }
    }, pq.mixin.render);

    function selectEndDelegate(evt) {
        if (!evt.shiftKey || evt.type == "pqGrid:mousePQUp") {
            this._trigger("selectEnd", null, {
                selection: this.Selection()
            });
            this.off("mousePQUp", selectEndDelegate);
            this.off("keyUp", selectEndDelegate)
        }
    }
    var Selection = pq.Selection = function(that, range) {
        if (that == null) {
            throw "invalid param"
        }
        if (this instanceof Selection == false) {
            return new Selection(that, range)
        }
        this._areas = [];
        this.that = that;
        this.iCells = new $.paramquery.cCells(that);
        this._base(that, range)
    };
    pq.extend(Range, Selection, {
        add: function(range, trigger) {
            var narea = this._normal(range, true),
                iC = this.iCells,
                indx = this.indexOf(narea);
            if (indx >= 0) {
                return
            }
            iC.addBlock(narea);
            this._super(narea);
            if (trigger !== false) {
                this.trigger()
            }
        },
        clearOther: function(_range) {
            var iCells = this.iCells,
                range = this._normal(_range, true);
            this.address().forEach(function(srange) {
                if (!(srange.r1 == range.r1 && srange.c1 == range.c1 && srange.r2 == range.r2 && srange.c2 == range.c2)) {
                    iCells.removeBlock(srange)
                }
            });
            this._super(range);
            this.trigger()
        },
        getSelection: function() {
            return this.iCells.getSelection()
        },
        isSelected: function(ui) {
            return this.iCells.isSelected(ui)
        },
        removeAll: function(ui) {
            ui = ui || {};
            if (this._areas.length) {
                this.iCells.removeAll();
                this._areas = [];
                if (ui.trigger !== false) {
                    this.trigger()
                }
            }
        },
        resizeOrReplace: function(range, indx) {
            this.resize(range, indx) || this.replace(range, indx)
        },
        replace: function(_range, _indx) {
            var iCells = this.iCells,
                range = this._normal(_range),
                sareas = this._areas,
                indx = this.getIndx(_indx),
                srange = sareas[indx];
            iCells.removeBlock(srange);
            iCells.addBlock(range);
            this._super(range, indx);
            this.trigger()
        },
        resize: function(_range, _indx) {
            var range = this._normal(_range, true),
                r1 = range.r1,
                c1 = range.c1,
                r2 = range.r2,
                c2 = range.c2,
                sareas = this._areas || [];
            if (!sareas.length) {
                return false
            }
            var indx = this.getIndx(_indx),
                srange = sareas[indx],
                sr1 = srange.r1,
                sc1 = srange.c1,
                sr2 = srange.r2,
                sc2 = srange.c2,
                topLeft = sr1 === r1 && sc1 === c1,
                topRight = sr1 === r1 && sc2 === c2,
                bottomLeft = sr2 === r2 && sc1 === c1,
                bottomRight = sr2 === r2 && sc2 === c2;
            if (topLeft && topRight && bottomLeft && bottomRight) {
                return true
            }
        },
        selectAll: function(ui) {
            ui = ui || {};
            var type = ui.type,
                that = this.that,
                CM = that.colModel,
                all = ui.all,
                r1 = all ? 0 : that.riOffset,
                data_len = all ? that.get_p_data().length : that.pdata.length,
                cm_len = CM.length - 1,
                range, r2 = r1 + data_len - 1;
            if (type === "row") {
                range = {
                    r1: r1,
                    r2: r2
                };
                that.Range(range).select()
            } else {
                range = {
                    r1: r1,
                    c1: 0
                };
                range.r2 = r2;
                range.c2 = cm_len;
                that.Range(range).select()
            }
            return this
        },
        trigger: function() {
            var that = this.that;
            that._trigger("selectChange", null, {
                selection: this
            });
            that.off("mousePQUp", selectEndDelegate);
            that.off("keyUp", selectEndDelegate);
            that.on("mousePQUp", selectEndDelegate);
            that.on("keyUp", selectEndDelegate)
        }
    })
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        fnTB = {};
    fnTB.options = {
        items: [],
        gridInstance: null
    };
    $.widget("paramquery.pqToolbar", fnTB);
    fnTB = _pq.pqToolbar.prototype;
    fnTB.refresh = function() {
        this.element.empty();
        this._create()
    };
    fnTB._create = function() {
        var o = this.options,
            that = o.gridInstance,
            events = {
                button: "click",
                select: "change",
                checkbox: "change",
                textbox: "change",
                file: "change"
            },
            event, listener, bootstrap = o.bootstrap,
            BS_on = bootstrap.on,
            CM = that.colModel,
            items = o.items,
            element = this.element;
        element.addClass("pq-toolbar");
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i],
                type = item.type,
                ivalue = item.value,
                icon = item.icon,
                options = item.options || {},
                label = item.label,
                listener = item.listener,
                listeners = listener ? [listener] : item.listeners,
                listeners = listeners || [function() {}],
                itemcls = item.cls,
                cls = itemcls ? itemcls : "",
                cls = BS_on && type == "button" ? bootstrap.btn + " " + cls : cls,
                cls = cls ? "class='" + cls + "'" : "",
                itemstyle = item.style,
                style = itemstyle ? "style='" + itemstyle + "'" : "",
                itemattr = item.attr,
                attr = itemattr ? itemattr : "",
                strStyleClsAttr = label && type != "button" && type != "file" ? [cls, attr] : [cls, attr, style],
                strStyleClsAttr = strStyleClsAttr.join(" "),
                inp, $ctrl;
            item.options = options;
            if (type == "textbox") {
                $ctrl = $([label ? "<label " + style + ">" + label : "", "<input type='text' " + strStyleClsAttr + ">", label ? "</label>" : ""].join(""))
            } else if (type == "file") {
                $ctrl = $(["<label class='btn btn-default' " + strStyleClsAttr + ">", label || "File", "<input type='file' style='display:none;'>", "</label>"].join(""))
            } else if (type == "textarea") {
                $ctrl = $([label ? "<label " + style + ">" + label : "", "<textarea " + strStyleClsAttr + "></textarea>", label ? "</label>" : ""].join(""))
            } else if (type == "checkbox") {
                $ctrl = $([label ? "<label " + style + ">" : "", "<input type='checkbox' ", ivalue ? "checked='checked' " : "", strStyleClsAttr, ">", label ? label + "</label>" : ""].join(""))
            } else if (type == "separator") {
                $ctrl = $("<span class='pq-separator' " + [attr, style].join(" ") + "></span>")
            } else if (type == "button") {
                var bicon = "";
                if (BS_on) {
                    bicon = icon ? "<span class='glyphicon " + icon + "'></span>" : ""
                }
                $ctrl = $("<button type='button' " + strStyleClsAttr + ">" + bicon + label + "</button>");
                $.extend(options, {
                    label: label ? label : false,
                    icons: {
                        primary: BS_on ? "" : icon
                    }
                });
                $ctrl.button(options)
            } else if (type == "select") {
                if (typeof options === "function") {
                    options = options.call(that, {
                        colModel: CM
                    })
                }
                options = options || [];
                inp = _pq.select({
                    options: options,
                    attr: strStyleClsAttr,
                    prepend: item.prepend,
                    groupIndx: item.groupIndx,
                    valueIndx: item.valueIndx,
                    labelIndx: item.labelIndx
                });
                $ctrl = $([label ? "<label " + style + ">" + label : "", inp, label ? "</label>" : ""].join(""))
            } else if (typeof type == "string") {
                $ctrl = $(type)
            } else if (typeof type == "function") {
                inp = type.call(that, {
                    colModel: CM,
                    cls: cls
                });
                $ctrl = $(inp)
            }
            $ctrl.appendTo(element);
            if (type !== "checkbox" && ivalue !== undefined) {
                if (label) {
                    $($ctrl[0].children[0]).val(ivalue)
                } else {
                    $ctrl.val(ivalue)
                }
            }
            for (var j = 0, lenj = listeners.length; j < lenj; j++) {
                listener = listeners[j];
                var _obj = {};
                if (typeof listener == "function") {
                    _obj[events[type]] = listener
                } else {
                    _obj = listener
                }
                for (event in _obj) {
                    $ctrl.on(event, this._onEvent(that, _obj[event], item))
                }
            }
        }
    };
    fnTB._onEvent = function(that, cb, item) {
        return function(evt) {
            if (item.type == "checkbox") {
                item.value = $(evt.target).prop("checked")
            } else {
                item.value = $(evt.target).val()
            }
            cb.call(that, evt)
        }
    };
    fnTB._destroy = function() {
        this.element.empty().removeClass("pq-toolbar").enableSelection()
    };
    fnTB._disable = function() {
        if (this.$disable == null) this.$disable = $("<div class='pq-grid-disable'></div>").css("opacity", .2).appendTo(this.element)
    };
    fnTB._enable = function() {
        if (this.$disable) {
            this.element[0].removeChild(this.$disable[0]);
            this.$disable = null
        }
    };
    fnTB._setOption = function(key, value) {
        if (key == "disabled") {
            if (value == true) {
                this._disable()
            } else {
                this._enable()
            }
        }
    };
    pq.toolbar = function(selector, options) {
        var $p = $(selector).pqToolbar(options),
            p = $p.data("paramqueryPqToolbar") || $p.data("paramquery-pqToolbar");
        return p
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        fnGrid = _pq.pqGrid.prototype;
    fnGrid.options.trackModel = {
        on: false,
        dirtyClass: "pq-cell-dirty"
    };
    _pq.cUCData = function(that) {
        this.that = that;
        this.udata = [];
        this.ddata = [];
        this.adata = [];
        this.options = that.options;
        that.on("dataAvailable", this.onDA(this))
    };
    _pq.cUCData.prototype = {
        add: function(obj) {
            var that = this.that,
                adata = this.adata,
                ddata = this.ddata,
                rowData = obj.rowData,
                TM = this.options.trackModel,
                dirtyClass = TM.dirtyClass,
                recId = that.getRecId({
                    rowData: rowData
                });
            for (var i = 0, len = adata.length; i < len; i++) {
                var rec = adata[i];
                if (recId != null && rec.recId == recId) {
                    throw "primary key violation"
                }
                if (rec.rowData == rowData) {
                    throw "same data can't be added twice."
                }
            }
            for (var i = 0, len = ddata.length; i < len; i++) {
                if (rowData == ddata[i].rowData) {
                    ddata.splice(i, 1);
                    return
                }
            }
            var dataIndxs = [];
            for (var dataIndx in rowData) {
                dataIndxs.push(dataIndx)
            }
            that.removeClass({
                rowData: rowData,
                dataIndx: dataIndxs,
                cls: dirtyClass
            });
            var obj = {
                recId: recId,
                rowData: rowData
            };
            adata.push(obj)
        },
        commit: function(objP) {
            var that = this.that;
            if (objP == null) {
                this.commitAddAll();
                this.commitUpdateAll();
                this.commitDeleteAll()
            } else {
                var history = objP.history,
                    DM = that.options.dataModel,
                    updateList = [],
                    recIndx = DM.recIndx,
                    objType = objP.type,
                    rows = objP.rows;
                history = history == null ? false : history;
                if (objType == "add") {
                    if (rows) {
                        updateList = this.commitAdd(rows, recIndx)
                    } else {
                        this.commitAddAll()
                    }
                } else if (objType == "update") {
                    if (rows) {
                        this.commitUpdate(rows, recIndx)
                    } else {
                        this.commitUpdateAll()
                    }
                } else if (objType == "delete") {
                    if (rows) {
                        this.commitDelete(rows, recIndx)
                    } else {
                        this.commitDeleteAll()
                    }
                }
                if (updateList.length) {
                    that._digestData({
                        source: "commit",
                        checkEditable: false,
                        track: false,
                        history: history,
                        updateList: updateList
                    });
                    that.refreshView()
                }
            }
        },
        commitAdd: function(rows, recIndx) {
            var that = this.that,
                i, j, k, rowData, row, CM = that.colModel,
                CMLength = CM.length,
                adata = this.adata,
                inArray = $.inArray,
                adataLen = adata.length,
                getVal = that.getValueFromDataType,
                updateList = [],
                rowLen = rows.length,
                _found, foundRowData = [];
            for (j = 0; j < rowLen; j++) {
                row = rows[j];
                for (i = 0; i < adataLen; i++) {
                    rowData = adata[i].rowData;
                    _found = true;
                    if (inArray(rowData, foundRowData) == -1) {
                        for (k = 0; k < CMLength; k++) {
                            var column = CM[k],
                                dataType = column.dataType,
                                dataIndx = column.dataIndx;
                            if (column.hidden || dataIndx == recIndx) {
                                continue
                            }
                            var cellData = rowData[dataIndx],
                                cellData = getVal(cellData, dataType),
                                cell = row[dataIndx],
                                cell = getVal(cell, dataType);
                            if (cellData !== cell) {
                                _found = false;
                                break
                            }
                        }
                        if (_found) {
                            var newRow = {},
                                oldRow = {};
                            newRow[recIndx] = row[recIndx];
                            oldRow[recIndx] = rowData[recIndx];
                            updateList.push({
                                rowData: rowData,
                                oldRow: oldRow,
                                newRow: newRow
                            });
                            foundRowData.push(rowData);
                            break
                        }
                    }
                }
            }
            var remain_adata = [];
            for (i = 0; i < adataLen; i++) {
                rowData = adata[i].rowData;
                if (inArray(rowData, foundRowData) == -1) {
                    remain_adata.push(adata[i])
                }
            }
            this.adata = remain_adata;
            return updateList
        },
        commitDelete: function(rows, recIndx) {
            var ddata = this.ddata,
                i = ddata.length,
                udata = this.udata,
                rowData, recId, j, k;
            while (i--) {
                rowData = ddata[i].rowData;
                recId = rowData[recIndx];
                j = rows.length;
                if (!j) {
                    break
                }
                while (j--) {
                    if (recId == rows[j][recIndx]) {
                        rows.splice(j, 1);
                        ddata.splice(i, 1);
                        k = udata.length;
                        while (k--) {
                            if (udata[k].rowData == rowData) {
                                udata.splice(k, 1)
                            }
                        }
                        break
                    }
                }
            }
        },
        commitUpdate: function(rows, recIndx) {
            var that = this.that,
                i, j, dirtyClass = this.options.trackModel.dirtyClass,
                udata = this.udata,
                udataLen = udata.length,
                rowLen = rows.length,
                foundRowData = [];
            for (i = 0; i < udataLen; i++) {
                var rec = udata[i],
                    rowData = rec.rowData,
                    oldRow = rec.oldRow;
                if ($.inArray(rowData, foundRowData) != -1) {
                    continue
                }
                for (j = 0; j < rowLen; j++) {
                    var row = rows[j];
                    if (rowData[recIndx] == row[recIndx]) {
                        foundRowData.push(rowData);
                        for (var dataIndx in oldRow) {
                            that.removeClass({
                                rowData: rowData,
                                dataIndx: dataIndx,
                                cls: dirtyClass
                            })
                        }
                    }
                }
            }
            var newudata = [];
            for (i = 0; i < udataLen; i++) {
                rowData = udata[i].rowData;
                if ($.inArray(rowData, foundRowData) == -1) {
                    newudata.push(udata[i])
                }
            }
            this.udata = newudata
        },
        commitAddAll: function() {
            this.adata = []
        },
        commitDeleteAll: function() {
            var ddata = this.ddata,
                udata = this.udata,
                j = udata.length,
                rowData, ddataLen = ddata.length;
            for (var i = 0; j > 0 && i < ddataLen; i++) {
                rowData = ddata[i].rowData;
                while (j--) {
                    if (udata[j].rowData == rowData) {
                        udata.splice(j, 1)
                    }
                }
                j = udata.length
            }
            ddata.length = 0
        },
        commitUpdateAll: function() {
            var that = this.that,
                dirtyClass = this.options.trackModel.dirtyClass,
                udata = this.udata;
            for (var i = 0, len = udata.length; i < len; i++) {
                var rec = udata[i],
                    row = rec.oldRow,
                    rowData = rec.rowData;
                for (var dataIndx in row) {
                    that.removeClass({
                        rowData: rowData,
                        dataIndx: dataIndx,
                        cls: dirtyClass
                    })
                }
            }
            this.udata = []
        },
        "delete": function(obj) {
            var that = this.that,
                rowIndx = obj.rowIndx,
                rowIndxPage = obj.rowIndxPage,
                offset = that.riOffset,
                rowIndx = rowIndx == null ? rowIndxPage + offset : rowIndx,
                rowIndxPage = rowIndxPage == null ? rowIndx - offset : rowIndxPage,
                paging = that.options.pageModel.type,
                indx = paging == "remote" ? rowIndxPage : rowIndx,
                adata = this.adata,
                ddata = this.ddata,
                rowData = that.getRowData(obj);
            for (var i = 0, len = adata.length; i < len; i++) {
                if (adata[i].rowData == rowData) {
                    adata.splice(i, 1);
                    return
                }
            }
            ddata.push({
                indx: indx,
                rowData: rowData,
                rowIndx: rowIndx
            })
        },
        getChangesValue: function(ui) {
            ui = ui || {};
            var that = this.that,
                all = ui.all,
                udata = this.udata,
                adata = this.adata,
                ddata = this.ddata,
                mupdateList = [],
                updateList = [],
                oldList = [],
                addList = [],
                mdeleteList = [],
                deleteList = [];
            for (var i = 0, len = ddata.length; i < len; i++) {
                var rec = ddata[i],
                    rowData = rec.rowData,
                    row = {};
                mdeleteList.push(rowData);
                for (var key in rowData) {
                    if (key.indexOf("pq_") != 0) {
                        row[key] = rowData[key]
                    }
                }
                deleteList.push(row)
            }
            for (var i = 0, len = udata.length; i < len; i++) {
                var rec = udata[i],
                    oldRow = rec.oldRow,
                    rowData = rec.rowData;
                if ($.inArray(rowData, mdeleteList) != -1) {
                    continue
                }
                if ($.inArray(rowData, mupdateList) == -1) {
                    var row = {};
                    if (all !== false) {
                        for (var key in rowData) {
                            if (key.indexOf("pq_") != 0) {
                                row[key] = rowData[key]
                            }
                        }
                    } else {
                        for (var key in oldRow) {
                            row[key] = rowData[key]
                        }
                        row[that.options.dataModel.recIndx] = rec.recId
                    }
                    mupdateList.push(rowData);
                    updateList.push(row);
                    oldList.push(oldRow)
                }
            }
            for (var i = 0, len = adata.length; i < len; i++) {
                var rec = adata[i],
                    rowData = rec.rowData,
                    row = {};
                for (var key in rowData) {
                    if (key.indexOf("pq_") != 0) {
                        row[key] = rowData[key]
                    }
                }
                addList.push(row)
            }
            return {
                updateList: updateList,
                addList: addList,
                deleteList: deleteList,
                oldList: oldList
            }
        },
        getChanges: function() {
            var that = this.that,
                udata = this.udata,
                adata = this.adata,
                ddata = this.ddata,
                inArray = $.inArray,
                updateList = [],
                oldList = [],
                addList = [],
                deleteList = [];
            for (var i = 0, len = ddata.length; i < len; i++) {
                var rec = ddata[i],
                    rowData = rec.rowData;
                deleteList.push(rowData)
            }
            for (var i = 0, len = udata.length; i < len; i++) {
                var rec = udata[i],
                    oldRow = rec.oldRow,
                    rowData = rec.rowData;
                if (inArray(rowData, deleteList) != -1) {
                    continue
                }
                if (inArray(rowData, updateList) == -1) {
                    updateList.push(rowData);
                    oldList.push(oldRow)
                }
            }
            for (var i = 0, len = adata.length; i < len; i++) {
                var rec = adata[i],
                    rowData = rec.rowData;
                addList.push(rowData)
            }
            return {
                updateList: updateList,
                addList: addList,
                deleteList: deleteList,
                oldList: oldList
            }
        },
        getChangesRaw: function() {
            var that = this.that,
                udata = this.udata,
                adata = this.adata,
                ddata = this.ddata,
                mydata = {
                    updateList: [],
                    addList: [],
                    deleteList: []
                };
            mydata["updateList"] = udata;
            mydata["addList"] = adata;
            mydata["deleteList"] = ddata;
            return mydata
        },
        isDirty: function(ui) {
            var that = this.that,
                udata = this.udata,
                adata = this.adata,
                ddata = this.ddata,
                dirty = false,
                rowData = that.getRowData(ui);
            if (rowData) {
                for (var i = 0; i < udata.length; i++) {
                    var rec = udata[i];
                    if (rowData == rec.rowData) {
                        dirty = true;
                        break
                    }
                }
            } else if (udata.length || adata.length || ddata.length) {
                dirty = true
            }
            return dirty
        },
        onDA: function(self) {
            return function(evt, ui) {
                if (ui.source != "filter") {
                    self.udata = [];
                    self.ddata = [];
                    self.adata = []
                }
            }
        },
        rollbackAdd: function(PM, data) {
            var adata = this.adata,
                rowList = [],
                paging = PM.type;
            for (var i = 0, len = adata.length; i < len; i++) {
                var rec = adata[i],
                    rowData = rec.rowData;
                rowList.push({
                    type: "delete",
                    rowData: rowData
                })
            }
            this.adata = [];
            return rowList
        },
        rollbackDelete: function(PM, data) {
            var ddata = this.ddata,
                rowList = [],
                paging = PM.type;
            for (var i = ddata.length - 1; i >= 0; i--) {
                var rec = ddata[i],
                    indx = rec.indx,
                    rowIndx = rec.rowIndx,
                    rowData = rec.rowData;
                rowList.push({
                    type: "add",
                    rowIndx: rowIndx,
                    newRow: rowData
                })
            }
            this.ddata = [];
            return rowList
        },
        rollbackUpdate: function(PM, data) {
            var that = this.that,
                dirtyClass = this.options.trackModel.dirtyClass,
                udata = this.udata,
                rowList = [];
            for (var i = 0, len = udata.length; i < len; i++) {
                var rec = udata[i],
                    recId = rec.recId,
                    rowData = rec.rowData,
                    oldRow = {},
                    newRow = rec.oldRow;
                if (recId == null) {
                    continue
                }
                var dataIndxs = [];
                for (var dataIndx in newRow) {
                    oldRow[dataIndx] = rowData[dataIndx];
                    dataIndxs.push(dataIndx)
                }
                that.removeClass({
                    rowData: rowData,
                    dataIndx: dataIndxs,
                    cls: dirtyClass,
                    refresh: false
                });
                rowList.push({
                    type: "update",
                    rowData: rowData,
                    newRow: newRow,
                    oldRow: oldRow
                })
            }
            this.udata = [];
            return rowList
        },
        rollback: function(objP) {
            var that = this.that,
                DM = that.options.dataModel,
                PM = that.options.pageModel,
                refreshView = objP && objP.refresh != null ? objP.refresh : true,
                objType = objP && objP.type != null ? objP.type : null,
                rowListAdd = [],
                rowListUpdate = [],
                rowListDelete = [],
                data = DM.data;
            if (objType == null || objType == "update") {
                rowListUpdate = this.rollbackUpdate(PM, data)
            }
            if (objType == null || objType == "delete") {
                rowListAdd = this.rollbackDelete(PM, data)
            }
            if (objType == null || objType == "add") {
                rowListDelete = this.rollbackAdd(PM, data)
            }
            that._digestData({
                history: false,
                allowInvalid: true,
                checkEditable: false,
                source: "rollback",
                track: false,
                addList: rowListAdd,
                updateList: rowListUpdate,
                deleteList: rowListDelete
            });
            if (refreshView) {
                that.refreshView()
            }
        },
        update: function(objP) {
            var that = this.that,
                TM = this.options.trackModel,
                dirtyClass = TM.dirtyClass,
                rowData = objP.rowData || that.getRowData(objP),
                recId = that.getRecId({
                    rowData: rowData
                }),
                dataIndx = objP.dataIndx,
                refresh = objP.refresh,
                columns = that.columns,
                getVal = that.getValueFromDataType,
                newRow = objP.row,
                udata = this.udata,
                newudata = udata.slice(0),
                _found = false;
            if (recId == null) {
                return
            }
            for (var i = 0, len = udata.length; i < len; i++) {
                var rec = udata[i],
                    oldRow = rec.oldRow;
                if (rec.rowData == rowData) {
                    _found = true;
                    for (var dataIndx in newRow) {
                        var column = columns[dataIndx],
                            dataType = column.dataType,
                            newVal = newRow[dataIndx],
                            newVal = getVal(newVal, dataType),
                            oldVal = oldRow[dataIndx],
                            oldVal = getVal(oldVal, dataType);
                        if (oldRow.hasOwnProperty(dataIndx) && oldVal === newVal) {
                            var obj = {
                                rowData: rowData,
                                dataIndx: dataIndx,
                                refresh: refresh,
                                cls: dirtyClass
                            };
                            that.removeClass(obj);
                            delete oldRow[dataIndx]
                        } else {
                            var obj = {
                                rowData: rowData,
                                dataIndx: dataIndx,
                                refresh: refresh,
                                cls: dirtyClass
                            };
                            that.addClass(obj);
                            if (!oldRow.hasOwnProperty(dataIndx)) {
                                oldRow[dataIndx] = rowData[dataIndx]
                            }
                        }
                    }
                    if ($.isEmptyObject(oldRow)) {
                        newudata.splice(i, 1)
                    }
                    break
                }
            }
            if (!_found) {
                var oldRow = {};
                for (var dataIndx in newRow) {
                    oldRow[dataIndx] = rowData[dataIndx];
                    var obj = {
                        rowData: rowData,
                        dataIndx: dataIndx,
                        refresh: refresh,
                        cls: dirtyClass
                    };
                    that.addClass(obj)
                }
                var obj = {
                    rowData: rowData,
                    recId: recId,
                    oldRow: oldRow
                };
                newudata.push(obj)
            }
            this.udata = newudata
        }
    };
    fnGrid.getChanges = function(obj) {
        this.blurEditor({
            force: true
        });
        if (obj) {
            var format = obj.format;
            if (format) {
                if (format == "byVal") {
                    return this.iUCData.getChangesValue(obj)
                } else if (format == "raw") {
                    return this.iUCData.getChangesRaw()
                }
            }
        }
        return this.iUCData.getChanges()
    };
    fnGrid.rollback = function(obj) {
        this.blurEditor({
            force: true
        });
        this.iUCData.rollback(obj)
    };
    fnGrid.isDirty = function(ui) {
        return this.iUCData.isDirty(ui)
    };
    fnGrid.commit = function(obj) {
        this.iUCData.commit(obj)
    };
    fnGrid.updateRow = function(ui) {
        var that = this,
            len, rowList = ui.rowList || [{
                rowIndx: ui.rowIndx,
                newRow: ui.newRow || ui.row,
                rowData: ui.rowData,
                rowIndxPage: ui.rowIndxPage
            }],
            rowListNew = [];
        that.normalizeList(rowList).forEach(function(rlObj) {
            var newRow = rlObj.newRow,
                rowData = rlObj.rowData,
                dataIndx, oldRow = rlObj.oldRow = {};
            if (rowData) {
                for (dataIndx in newRow) {
                    oldRow[dataIndx] = rowData[dataIndx]
                }
                rowListNew.push(rlObj)
            }
        });
        if (rowListNew.length) {
            var uid = {
                    source: ui.source || "update",
                    history: ui.history,
                    checkEditable: ui.checkEditable,
                    track: ui.track,
                    allowInvalid: ui.allowInvalid,
                    updateList: rowListNew
                },
                ret = this._digestData(uid);
            if (ret === false) {
                return false
            }
            if (ui.refresh !== false) {
                rowListNew = uid.updateList;
                len = rowListNew.length;
                if (len > 1) {
                    that.refresh()
                } else if (len == 1) {
                    that.refreshRow({
                        rowIndx: rowListNew[0].rowIndx
                    })
                }
            }
        }
    };
    fnGrid.getRecId = function(obj) {
        var that = this,
            DM = that.options.dataModel;
        obj.dataIndx = DM.recIndx;
        var recId = that.getCellData(obj);
        if (recId == null) {
            return null
        } else {
            return recId
        }
    };
    fnGrid.getCellData = function(obj) {
        var rowData = obj.rowData || this.getRowData(obj),
            dataIndx = obj.dataIndx;
        if (rowData) {
            return rowData[dataIndx]
        } else {
            return null
        }
    };
    fnGrid.getRowData = function(obj) {
        if (!obj) {
            return null
        }
        var objRowData = obj.rowData,
            recId;
        if (objRowData != null) {
            return objRowData
        }
        recId = obj.recId;
        if (recId == null) {
            var rowIndx = obj.rowIndx,
                rowIndx = rowIndx != null ? rowIndx : obj.rowIndxPage + this.riOffset,
                data = this.get_p_data(),
                rowData = data[rowIndx];
            return rowData
        } else {
            var options = this.options,
                DM = options.dataModel,
                recIndx = DM.recIndx,
                DMdata = DM.data;
            for (var i = 0, len = DMdata.length; i < len; i++) {
                var rowData = DMdata[i];
                if (rowData[recIndx] == recId) {
                    return rowData
                }
            }
        }
        return null
    };
    fnGrid.deleteRow = function(ui) {
        var that = this,
            rowListNew = that.normalizeList(ui.rowList || [{
                rowIndx: ui.rowIndx,
                rowIndxPage: ui.rowIndxPage
            }]);
        if (!rowListNew.length) {
            return false
        }
        this._digestData({
            source: ui.source || "delete",
            history: ui.history,
            track: ui.track,
            deleteList: rowListNew
        });
        if (ui.refresh !== false) {
            that.refreshView()
        }
    };
    fnGrid.addRow = function(ui) {
        var that = this,
            rowIndx, addList, offset = that.riOffset,
            DM = that.options.dataModel,
            data = DM.data = DM.data || [];
        ui.rowData && (ui.newRow = ui.rowData);
        ui.rowIndxPage != null && (ui.rowIndx = ui.rowIndxPage + offset);
        addList = ui.rowList || [{
            rowIndx: ui.rowIndx,
            newRow: ui.newRow
        }];
        if (!addList.length || this._digestData({
                source: ui.source || "add",
                history: ui.history,
                track: ui.track,
                checkEditable: ui.checkEditable,
                addList: addList
            }) === false) {
            return false
        }
        if (ui.refresh !== false) {
            this.refreshView()
        }
        rowIndx = addList[0].rowIndx;
        return rowIndx == null ? data.length - 1 : rowIndx
    };
    fnGrid.loadComplete = function() {
        var that = this;
        that.$cont.find('.pq-grid-norows').show();
    }
})(jQuery);
(function() {
    "use strict";
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(fn) {
        return setTimeout(fn, 10)
    };
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(id) {
        clearTimeout(id)
    }
})();
(function($) {
    "use strict";
    var _pq = $.paramquery;

    function cMouseSelection(that) {
        this.that = that;
        var self = this;
        self.scrollTop = 0;
        self.scrollLeft = 0;
        self.borderRight = 0;
        self.borderRightExtra = 0;
        self.borderTop = 0;
        self.borderTopExtra = 0;
        self.borderLeft = 0;
        self.borderLeftExtra = 0;
        self.borderBottom = 0;
        self.borderBottomExtra = 0;
        self.maxBorder = 5e3;
        self.rowht = that.options.rowHeight;
        self.colwd = 60;
        that.on("contMouseDown", function(evt, ui) {
            return self._onContMouseDown(evt, ui)
        }).on("mouseDrag", function(evt, ui) {
            return self._onMouseDrag(evt, ui)
        }).on("mouseStop", function(evt, ui) {
            return self._onMouseStop(evt, ui)
        }).on("mousePQUp", function(evt, ui) {
            return self._onMousePQUp(evt, ui)
        }).on("cellClick", function(evt, ui) {
            return self._onCellClick(evt, ui)
        }).on("cellMouseDown", function(evt, ui) {
            return self._onCellMouseDown(evt, ui)
        }).on("cellMouseEnter", function(evt, ui) {
            return self._onCellMouseEnter(evt, ui)
        }).on("refresh refreshRow", function() {
            self.setTimer(function() {
                if (that.element) {
                    that.focus()
                }
            }, 300)
        })
    }
    _pq.cMouseSelection = cMouseSelection;
    var _pMouseSelection = cMouseSelection.prototype = new _pq.cClass;
    _pMouseSelection.inViewPort = function($tdr) {
        var that = this.that,
            iR = that.iRefresh,
            htCont = iR.getEContHt(),
            wdCont = iR.getEContWd() + 1,
            tdr = $tdr[0],
            iMS = this,
            marginTop = iMS.marginTop,
            scrollLeft = iMS.scrollLeft;
        if (htCont >= tdr.offsetTop + tdr.offsetHeight + marginTop) {
            if (tdr.nodeName.toUpperCase() === "TD") {
                if (wdCont >= tdr.offsetLeft + tdr.offsetWidth + scrollLeft) {
                    return true
                }
            } else {
                return true
            }
        }
    };
    _pMouseSelection._onCellMouseDown = function(evt, ui) {
        var that = this.that,
            rowIndx = ui.rowIndx,
            iSel = that.iSelection,
            colIndx = ui.colIndx,
            SM = that.options.selectionModel,
            type = SM.type,
            mode = SM.mode,
            last = iSel.addressLast();
        if (type !== "cell") {
            that.focus(ui);
            return
        }
        if (colIndx == null) {
            return
        } else if (colIndx == -1) {
            if (!SM.row) {
                return
            }
            colIndx = undefined
        }
        if (evt.shiftKey && mode !== "single" && last && last.firstR != null) {
            var r1 = last.firstR,
                c1 = last.firstC;
            iSel.resizeOrReplace({
                r1: r1,
                c1: c1,
                r2: rowIndx,
                c2: colIndx,
                firstR: r1,
                firstC: c1
            })
        } else if ((evt.ctrlKey || evt.metaKey) && mode !== "single") {
            this.mousedown = {
                r1: rowIndx,
                c1: colIndx
            };
            that.Selection().add({
                r1: rowIndx,
                c1: colIndx,
                firstR: rowIndx,
                firstC: colIndx
            })
        } else {
            this.mousedown = {
                r1: rowIndx,
                c1: colIndx
            };
            iSel.clearOther({
                r1: rowIndx,
                c1: colIndx
            });
            iSel.resizeOrReplace({
                r1: rowIndx,
                c1: colIndx,
                firstR: rowIndx,
                firstC: colIndx
            })
        }
        that.focus(ui);
        return true
    };
    _pMouseSelection._onCellMouseEnter = function(evt, ui) {
        var that = this.that,
            SM = that.options.selectionModel,
            type = SM.type,
            mousedown = this.mousedown,
            mode = SM.mode;
        if (mousedown) {
            if (mode !== "single") {
                if (type === "cell") {
                    var r1 = mousedown.r1,
                        c1 = mousedown.c1,
                        r2 = ui.rowIndx,
                        c2 = ui.colIndx,
                        iSel = that.Selection();
                    that.scrollCell({
                        rowIndx: r2,
                        colIndx: c2
                    });
                    iSel.resizeOrReplace({
                        r1: r1,
                        c1: c1,
                        r2: r2,
                        c2: c2
                    })
                }
                that.focus(ui)
            }
        }
    };
    _pMouseSelection._onCellClick = function(evt, ui) {
        var that = this.that,
            SM = that.options.selectionModel,
            single = SM.mode == "single",
            toggle = SM.toggle,
            isSelected, iRows = that.iRows;
        if (SM.type == "row") {
            if (!SM.row && ui.colIndx == -1) {
                return
            }
            isSelected = iRows.isSelected(ui);
            if ((!single || isSelected) && !toggle && (evt.metaKey || evt.ctrlKey)) {
                ui.isFirst = true;
                iRows.toggle(ui)
            } else if (!single && evt.shiftKey) {
                iRows.extend(ui)
            } else if (single && (!isSelected || !toggle)) {
                if (!isSelected) {
                    iRows.removeAll();
                    iRows.add(ui)
                }
            } else {
                ui.isFirst = true;
                iRows[toggle ? "toggle" : "add"](ui)
            }
        }
    };
    _pMouseSelection._onContMouseDown = function(evt) {
        var that = this.that,
            SW = that.options.swipeModel,
            swipe = SW.on;
        if (swipe) {
            this._stopSwipe(true);
            this.swipedown = {
                x: evt.pageX,
                y: evt.pageY
            }
        }
        return true
    };
    _pMouseSelection._onMousePQUp = function() {
        this.mousedown = null
    };
    _pMouseSelection._stopSwipe = function(full) {
        var self = this;
        if (full) {
            self.swipedown = null;
            self.swipedownPrev = null
        }
        window.clearInterval(self.intID);
        window.cancelAnimationFrame(self.intID);
        self.intID = null
    };
    _pMouseSelection._onMouseStop = function(evt) {
        var self = this,
            that = this.that;
        if (this.swipedownPrev) {
            var SW = that.options.swipeModel,
                sdP = this.swipedownPrev,
                ts1 = sdP.ts,
                ts2 = (new Date).getTime(),
                tsdiff = ts2 - ts1,
                x1 = sdP.x,
                y1 = sdP.y,
                x2 = evt.pageX,
                y2 = evt.pageY,
                xdiff = x2 - x1,
                ydiff = y2 - y1,
                distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff),
                ratio = distance / tsdiff;
            if (ratio > SW.ratio) {
                var count = 0,
                    count2 = SW.repeat;
                self._stopSwipe();
                var animate = function() {
                    count += SW.speed;
                    count2--;
                    var pageX = x2 + count * xdiff / tsdiff,
                        pageY = y2 + count * ydiff / tsdiff;
                    self._onMouseDrag({
                        pageX: pageX,
                        pageY: pageY
                    });
                    if (count2 > 0) {
                        self.intID = window.requestAnimationFrame(animate)
                    } else {
                        self._stopSwipe(true)
                    }
                };
                animate()
            } else {
                self.swipedown = null;
                self.swipedownPrev = null
            }
        }
    };
    _pMouseSelection._onMouseDrag = function(evt) {
        var that = this.that,
            o = that.options;
        if (this.swipedown) {
            var m = this.swipedown,
                x1 = m.x,
                y1 = m.y,
                x2 = evt.pageX,
                y2 = evt.pageY;
            this.swipedownPrev = {
                x: x1,
                y: y1,
                ts: (new Date).getTime()
            };
            if (!o.virtualY) {
                this.scrollVertSmooth(y1, y2);
                this.syncScrollBarVert()
            }
            if (!o.virtualX) {
                this.scrollHorSmooth(x1, x2);
                this.syncScrollBarHor()
            }
            m.x = x2;
            m.y = y2
        }
        return true
    };
    _pMouseSelection.updateTableY = function(diffY) {
        if (diffY === 0) {
            return false
        }
        var that = this.that,
            $tbl = this.getTableForVertScroll(),
            contHt = that.iRefresh.getEContHt();
        if (!$tbl || !$tbl.length) {
            return false
        }
        var scrollHt = $tbl.data("offsetHeight") - 1,
            scrollTop = this.scrollTop - diffY,
            scrollTop2;
        if (scrollTop < 0) {
            scrollTop2 = 0
        } else if (diffY < 0 && contHt - scrollHt + scrollTop > 0) {
            scrollTop2 = scrollHt - contHt
        } else {
            scrollTop2 = scrollTop
        }
        this.setScrollTop(scrollTop2, $tbl, contHt);
        return true
    };
    _pMouseSelection.setScrollTop = function(scrollTop, $tbl, contHt) {
        if (scrollTop >= 0) {
            scrollTop = Math.round(scrollTop);
            this.scrollTop = scrollTop;
            $tbl.parent("div").scrollTop(scrollTop)
        } else {}
    };
    _pMouseSelection.getScrollLeft = function() {
        return this.scrollLeft
    };
    _pMouseSelection.getScrollTop = function() {
        return this.scrollTop
    };
    _pMouseSelection.setScrollLeft = function(margin, $tbls, $tbl_h, contWd) {
        if (margin >= 0) {
            margin = Math.round(margin);
            this.scrollLeft = margin;
            var $tt = $tbl_h ? $tbl_h.parent() : $();
            $tt = $tt.add($tbls ? $tbls.parent("div") : $());
            $tt.scrollLeft(margin)
        }
    };
    _pMouseSelection.scrollVertSmooth = function(y1, y2) {
        if (y1 === y2) {
            return
        }
        this.updateTableY(y2 - y1)
    };
    _pMouseSelection.scrollHorSmooth = function(x1, x2) {
        if (x1 === x2) {
            return
        }
        var that = this.that,
            o = that.options,
            diffX = x2 - x1,
            $tbl = this.getTableForHorScroll(),
            $tbl_h = this.getTableHeaderForHorScroll(),
            contWd = that.iRefresh.getEContWd();
        if (!$tbl && !$tbl_h) {
            return
        }
        var $tbl_r = $tbl ? $tbl : $tbl_h,
            scrollWd = o.virtualX ? this.getScrollWidth($tbl_r) : $tbl_r.data("scrollWidth"),
            new_scrollLeft, scrollLeft = this.scrollLeft - diffX;
        if (scrollLeft < 0) {
            new_scrollLeft = 0
        } else if (scrollWd - contWd - scrollLeft < 0) {
            new_scrollLeft = scrollWd - contWd
        } else {
            new_scrollLeft = scrollLeft
        }
        this.setScrollLeft(new_scrollLeft, $tbl, $tbl_h, contWd)
    };
    _pMouseSelection.syncViewWithScrollBarVert = function(ratio) {
        if (ratio == null) {
            return
        }
        var that = this.that,
            $tbl = this.getTableForVertScroll();
        if (!$tbl || !$tbl.length) {
            return
        }
        var o = that.options;
        if (o.editModel.indices) {
            that.blurEditor({
                force: true
            })
        }
        var scrollHt = $tbl.data("offsetHeight"),
            contHt = that.iRefresh.getEContHt(),
            excess = scrollHt - contHt,
            scrollTop = excess * ratio;
        if (!scrollTop && scrollTop !== 0) {
            return
        }
        if (scrollTop < 0) {
            scrollTop = 0
        }
        this.setScrollTop(scrollTop, $tbl, contHt)
    };
    _pMouseSelection.syncViewWithScrollBarHor = function(ratio) {
        if (ratio == null) {
            return
        }
        var that = this.that,
            $tbl = this.getTableForHorScroll();
        var $tbl_h = this.getTableHeaderForHorScroll();
        if (!$tbl && !$tbl_h) {
            return
        }
        var o = that.options;
        if (o.editModel.indices) {
            that.blurEditor({
                force: true
            })
        }
        var $tbl_r = $tbl ? $tbl : $tbl_h,
            scrollWd = o.virtualX ? this.getScrollWidth($tbl_r) : $tbl_r.data("scrollWidth"),
            contWd = that.iRefresh.getEContWd(),
            excess = scrollWd - contWd,
            scrollLeft = excess * ratio;
        if (!scrollWd || !contWd) {
            return
        }
        if (scrollLeft < 0) {
            scrollLeft = 0
        }
        this.setScrollLeft(scrollLeft, $tbl, $tbl_h, contWd)
    };
    _pMouseSelection.resetMargins = function() {
        this.scrollLeft = 0;
        this.scrollTop = 0
    };
    _pMouseSelection.syncHeaderViewWithScrollBarHor = function(cur_pos) {
        if (cur_pos == null) {
            return
        }
        var that = this.that,
            $tbl_h = this.getTableHeaderForHorScroll();
        if (!$tbl_h) {
            return
        }
        var o = that.options,
            freezeCols = o.freezeCols;
        if (o.editModel.indices) {
            that.blurEditor({
                force: true
            })
        }
        var $tbl_r = $tbl_h,
            tblWd = $tbl_r.data("scrollWidth"),
            contWd = that.iRefresh.getEContWd(),
            scrollLeft = that.calcWidthCols(freezeCols, cur_pos + freezeCols);
        if (!tblWd || !contWd) {
            return
        }
        if (scrollLeft < 0) {
            scrollLeft = 0
        }
        $tbl_h.css("marginLeft", -scrollLeft)
    };
    _pMouseSelection.syncScrollBarVert = function() {
        var that = this.that,
            $tbl = this.getTableForVertScroll();
        if (!$tbl || !$tbl.length) {
            return
        }
        var tblHt = $tbl.data("offsetHeight"),
            contHt = that.iRefresh.getEContHt(),
            excess = tblHt - contHt,
            scrollTop = Math.abs(this.scrollTop),
            ratio = excess ? scrollTop / excess : 0;
        if (ratio > 1) {
            ratio = 1
        } else if (ratio < 0) {
            ratio = 0
        }
        if (ratio >= 0 && ratio <= 1) {
            if (that.vscroll.widget().hasClass("pq-sb-vert")) {
                that.vscroll.option("ratio", ratio)
            }
        }
    };
    _pMouseSelection.syncScrollBarHor = function() {
        var that = this.that,
            o = that.options,
            $tbl = this.getTableForHorScroll(),
            $tbl_h = this.getTableHeaderForHorScroll();
        if (!$tbl && !$tbl_h) {
            return
        }
        var $tbl_r = $tbl ? $tbl : $tbl_h;
        var scrollWd = o.virtualX ? this.getScrollWidth($tbl_r) : $tbl_r.data("scrollWidth"),
            contWd = that.iRefresh.getEContWd(),
            excess = scrollWd - contWd,
            scrollLeft = this.scrollLeft,
            ratio = scrollLeft / excess;
        if (ratio >= 0 && ratio <= 1) {
            if (that.hscroll.widget().hasClass("pq-sb-horiz")) {
                that.hscroll.option("ratio", ratio)
            }
        }
    };
    _pMouseSelection.getTableForVertScroll = function() {
        var that = this.that,
            pqpanes = that.pqpanes,
            $tbl = that.$tbl;
        if (!$tbl || !$tbl.length) {
            return
        }
        if (pqpanes.h && pqpanes.v) {
            $tbl = $([$tbl[2], $tbl[3]])
        } else if (pqpanes.v) {
            $tbl = $([$tbl[0], $tbl[1]])
        } else if (pqpanes.h) {
            $tbl = $($tbl[1])
        }
        return $tbl
    };
    _pMouseSelection.getTableForHorScroll = function() {
        var that = this.that,
            pqpanes = that.pqpanes,
            tbl = [],
            $tbl = that.$tbl;
        if (!$tbl || !$tbl.length) {
            return
        }
        if (pqpanes.h && pqpanes.v) {
            tbl.push($tbl[1], $tbl[3])
        } else if (pqpanes.v) {
            tbl.push($tbl[1])
        } else if (pqpanes.h) {
            tbl.push($tbl[0], $tbl[1])
        } else {
            tbl.push($tbl[0])
        }
        if (that.tables.length) {
            var $tbl2 = that.tables[0].$tbl;
            if (pqpanes.v) {
                tbl.push($tbl2[1])
            } else {
                tbl.push($tbl2[0])
            }
        }
        return $(tbl)
    };
    _pMouseSelection.getTableHeaderForHorScroll = function() {
        var that = this.that,
            pqpanes = that.pqpanes,
            $tbl = that.$tbl_header;
        if (!$tbl || !$tbl.length) {
            return
        }
        if (pqpanes.v) {
            $tbl = $($tbl[1])
        } else {
            $tbl = $($tbl[0])
        }
        return $tbl.parent()
    };
    _pMouseSelection.scrollRowNonVirtual = function(_obj) {
        var that = this.that,
            o = that.options,
            obj = that.normalize(_obj),
            rowIndxPage = obj.rowIndxPage,
            contHt = that.iRefresh.getEContHt(),
            freezeRows = o.freezeRows * 1;
        if (rowIndxPage < freezeRows) {
            return
        }
        var $tbl = that.get$Tbl(rowIndxPage),
            $tr = that.getRow({
                rowIndxPage: rowIndxPage
            }),
            tr = $tr[0];
        if (!tr) {
            return
        }
        var tblTop = $tbl[0].offsetTop + 1,
            trHt = tr.offsetHeight,
            scrollTop2, scrollTop = this.getScrollTop(),
            trTop = tr.offsetTop - 1,
            marginTop = -1;
        if (tblTop + trTop - scrollTop < 0) {
            scrollTop2 = tblTop + trTop + marginTop;
            scrollTop2 = scrollTop2 < 0 ? 0 : scrollTop2;
            this.setScrollTop(scrollTop2, $tbl, contHt);
            this.syncScrollBarVert()
        } else if (trTop + trHt - scrollTop > contHt) {
            scrollTop2 = trHt + trTop - contHt;
            this.setScrollTop(scrollTop2, $tbl, contHt);
            this.syncScrollBarVert()
        }
    };
    _pMouseSelection.scrollColumnNonVirtual = function(objP) {
        var that = this.that,
            _colIndx = objP.colIndx,
            colIndx = _colIndx == null ? that.getColIndx({
                dataIndx: objP.dataIndx
            }) : _colIndx,
            freezeCols = that.options.freezeCols;
        if (colIndx < freezeCols) {
            return
        }
        var td_right = that._calcRightEdgeCol(colIndx).width,
            scrollLeft2, td_left = that._calcRightEdgeCol(colIndx - 1).width,
            wdFrozen = that._calcRightEdgeCol(freezeCols - 1).width,
            $tbl = this.getTableForHorScroll(),
            $tbl_h = this.getTableHeaderForHorScroll(),
            contWd = that.iRefresh.getEContWd(),
            scrollLeft = this.scrollLeft;
        if (td_right - scrollLeft > contWd) {
            scrollLeft2 = td_right - contWd;
            this.setScrollLeft(scrollLeft2, $tbl, $tbl_h, contWd);
            this.syncScrollBarHor()
        } else if (td_left - wdFrozen < scrollLeft) {
            scrollLeft2 = td_left - wdFrozen;
            this.setScrollLeft(scrollLeft2, $tbl, $tbl_h, contWd);
            this.syncScrollBarHor()
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var iExcel = null,
        pasteProgress = false,
        id_clip = "pq-grid-excel",
        _pq = $.paramquery,
        _pgrid = _pq.pqGrid.prototype,
        pq_options = _pgrid.options,
        copyModel = {
            on: true,
            render: false,
            header: true,
            zIndex: 1e4
        },
        cutModel = {
            on: true
        },
        pasteModel = {
            on: true,
            compare: "byVal",
            select: true,
            validate: true,
            allowInvalid: true,
            type: "replace"
        };
    pq_options.pasteModel = pq_options.pasteModel || pasteModel;
    pq_options.copyModel = pq_options.copyModel || copyModel;
    pq_options.cutModel = pq_options.cutModel || cutModel;
    _pgrid._setGlobalStr = function(str) {
        cExcel.clip = str
    };
    _pgrid.copy = function() {
        return this.iSelection.copy()
    };
    _pgrid.cut = function() {
        return this.iSelection.copy({
            cut: true,
            source: "cut"
        })
    };
    _pgrid.paste = function(ui) {
        iExcel = new cExcel(this);
        iExcel.paste(ui);
        iExcel = null
    };
    _pgrid.clear = function() {
        var iSel = this.iSelection;
        if (iSel.address().length) {
            iSel.clear()
        } else {
            this.iRows.toRange().clear()
        }
    };
    var cExcel = function(that, $ae) {
        this.that = that
    };
    _pq.cExcel = cExcel;
    cExcel.clip = "";
    var _pExcel = cExcel.prototype;
    _pExcel.createClipBoard = function() {
        var $div = $("#pq-grid-excel-div"),
            CPM = this.that.options.copyModel,
            $text = $("#" + id_clip);
        if ($text.length == 0) {
            $div = $("<div id='pq-grid-excel-div' " + " style='position:fixed;top:20px;left:20px;height:1px;width:1px;overflow:hidden;z-index:" + CPM.zIndex + ";'/>").appendTo(document.body);
            $text = $("<textarea id='" + id_clip + "' autocomplete='off' spellcheck='false'" + " style='overflow:hidden;height:10000px;width:10000px;opacity:0' />").appendTo($div);
            $text.css({
                opacity: 0
            })
        }
        $text.on("focusin", function(evt) {
            evt.stopPropagation()
        });
        $text.select()
    };
    _pExcel.destroyClipBoard = function() {
        this.clearClipBoard();
        var that = this.that,
            pageTop = $(window).scrollTop(),
            pageLeft = $(window).scrollLeft();
        that.focus();
        var pageTop2 = $(window).scrollTop(),
            pageLeft2 = $(window).scrollLeft();
        if (pageTop != pageTop2 || pageLeft != pageLeft2) {
            window.scrollTo(pageLeft, pageTop)
        }
    };
    _pExcel.clearClipBoard = function() {
        var $text = $("#" + id_clip);
        $text.val("")
    };
    _pExcel.copy = function(ui) {
        var that = this.that,
            iSel = that.iSelection;
        if (iSel.address().length) {
            return iSel.copy(ui)
        } else {
            that.iRows.toRange().copy(ui)
        }
    };
    _pExcel.paste = function(ui) {
        ui = ui || {};
        var that = this.that,
            dest = ui.dest,
            clip = ui.clip,
            text = clip ? clip.length ? clip.val() : "" : cExcel.clip;
        text = text.replace(/\n$/, "");
        var rows = text.split("\n"),
            rows_length = rows.length,
            CM = that.colModel,
            o = that.options,
            readCell = that.readCell,
            PSTM = o.pasteModel,
            SMType = "row",
            refreshView = false,
            CMLength = CM.length;
        if (!PSTM.on) {
            return
        }
        if (text.length == 0 || rows_length == 0) {
            return
        }
        for (var i = 0; i < rows_length; i++) {
            rows[i] = rows[i].split("	")
        }
        var PMtype = PSTM.type,
            selRowIndx, selColIndx, selEndRowIndx, selEndColIndx, iSel = dest ? that.Range(dest) : that.Selection(),
            _areas = iSel.address(),
            areas = _areas.length ? _areas : that.iRows.toRange().address(),
            area = areas[0],
            tui = {
                rows: rows,
                areas: [area]
            };
        if (that._trigger("beforePaste", null, tui) === false) {
            return false
        }
        if (area && that.getRowData({
                rowIndx: area.r1
            })) {
            SMType = area.type == "row" ? "row" : "cell";
            selRowIndx = area.r1;
            selEndRowIndx = area.r2;
            selColIndx = area.c1;
            selEndColIndx = area.c2
        } else {
            SMType = "cell";
            selRowIndx = 0;
            selEndRowIndx = 0;
            selColIndx = 0;
            selEndColIndx = 0
        }
        var selRowIndx2, modeV;
        if (PMtype == "replace") {
            selRowIndx2 = selRowIndx;
            modeV = selEndRowIndx - selRowIndx + 1 < rows_length ? "extend" : "repeat"
        } else if (PMtype == "append") {
            selRowIndx2 = selEndRowIndx + 1;
            modeV = "extend"
        } else if (PMtype == "prepend") {
            selRowIndx2 = selRowIndx;
            modeV = "extend"
        }
        var modeH, lenV = modeV == "extend" ? rows_length : selEndRowIndx - selRowIndx + 1,
            lenH, lenHCopy;
        var ii = 0,
            addList = [],
            updateList = [],
            rowsAffected = 0;
        for (i = 0; i < lenV; i++) {
            var row = rows[ii],
                rowIndx = i + selRowIndx2,
                rowData = PMtype == "replace" ? that.getRowData({
                    rowIndx: rowIndx
                }) : null,
                oldRow = rowData ? {} : null,
                newRow = {};
            if (row === undefined && modeV === "repeat") {
                ii = 0;
                row = rows[ii]
            }
            ii++;
            var cells = row,
                cellsLength = cells.length;
            if (!lenH) {
                if (SMType == "cell") {
                    modeH = selEndColIndx - selColIndx + 1 < cellsLength ? "extend" : "repeat";
                    lenH = modeH == "extend" ? cellsLength : selEndColIndx - selColIndx + 1;
                    if (isNaN(lenH)) {
                        throw "lenH NaN. assert failed."
                    }
                    if (lenH + selColIndx > CMLength) {
                        lenH = CMLength - selColIndx
                    }
                } else {
                    lenH = CMLength;
                    selColIndx = 0
                }
            }
            var jj = 0,
                j = 0,
                skipped = 0;
            lenHCopy = lenH;
            for (j = 0; j < lenHCopy; j++) {
                if (jj >= cellsLength) {
                    jj = 0
                }
                var colIndx = j + selColIndx,
                    column = CM[colIndx],
                    cell = cells[jj],
                    dataIndx = column.dataIndx;
                if (column.copy === false) {
                    skipped++;
                    if (modeH == "extend") {
                        if (lenHCopy + selColIndx < CMLength) {
                            lenHCopy++
                        }
                    }
                    continue
                } else {
                    jj++;
                    newRow[dataIndx] = cell;
                    if (oldRow) {
                        oldRow[dataIndx] = readCell(rowData, column)
                    }
                }
            }
            if ($.isEmptyObject(newRow) == false) {
                if (rowData == null) {
                    refreshView = true;
                    addList.push({
                        newRow: newRow,
                        rowIndx: rowIndx
                    })
                } else {
                    updateList.push({
                        newRow: newRow,
                        rowIndx: rowIndx,
                        rowData: rowData,
                        oldRow: oldRow
                    })
                }
                rowsAffected++
            }
        }
        var dui = {
            addList: addList,
            updateList: updateList,
            source: "paste",
            allowInvalid: PSTM.allowInvalid,
            validate: PSTM.validate
        };
        that._digestData(dui);
        that[refreshView ? "refreshView" : "refresh"]();
        if (PSTM.select) {
            that.Range({
                r1: selRowIndx2,
                c1: selColIndx,
                r2: selRowIndx2 + rowsAffected - 1,
                c2: modeH == "extend" ? selColIndx + lenH - 1 + skipped : selEndColIndx
            }).select()
        }
        that._trigger("paste", null, tui)
    };
    $(document).unbind(".pqExcel").bind("keydown.pqExcel", function(evt) {
        if (evt.ctrlKey || evt.metaKey) {
            var $ae = $(evt.target);
            if (!$ae.hasClass("pq-grid-row") && !$ae.hasClass("pq-grid-cell") && !$ae.is("#" + id_clip) && !$ae.hasClass("pq-grid-cont")) {
                return
            }
            var $grid = $ae.closest(".pq-grid"),
                that;
            if (iExcel || $ae.length && $grid.length) {
                if (!iExcel) {
                    try {
                        that = $grid.pqGrid("instance");
                        if (that.option("selectionModel.native")) {
                            return true
                        }
                    } catch (ex) {
                        return true
                    }
                    iExcel = new cExcel(that, $ae);
                    iExcel.createClipBoard()
                }
                if (evt.keyCode == "67" || evt.keyCode == "99") {
                    iExcel.copy({
                        clip: $("#" + id_clip)
                    })
                } else if (evt.keyCode == "88") {
                    iExcel.copy({
                        cut: true,
                        clip: $("#" + id_clip)
                    })
                } else if (evt.keyCode == "86" || evt.keyCode == "118") {
                    pasteProgress = true;
                    iExcel.clearClipBoard();
                    window.setTimeout(function() {
                        if (iExcel) {
                            iExcel.paste({
                                clip: $("#" + id_clip)
                            });
                            iExcel.destroyClipBoard();
                            iExcel = null
                        }
                        pasteProgress = false
                    }, 0)
                } else {
                    var $text = $("#" + id_clip);
                    if ($text.length) {
                        var ae = document.activeElement;
                        if (ae == $text[0]) {
                            iExcel.that.onKeyPressDown(evt)
                        }
                    }
                }
            } else {}
        } else {
            var kc = evt.keyCode,
                KC = $.ui.keyCode,
                navKey = kc == KC.UP || kc == KC.DOWN || kc == KC.LEFT || kc == KC.RIGHT || kc == KC.PAGE_UP || kc == KC.PAGE_DOWN;
            if (navKey) {
                if (keyDownInGrid) {
                    return false
                }
                $ae = $(evt.target);
                if ($ae.hasClass("pq-grid-row") || $ae.hasClass("pq-grid-cell")) {
                    keyDownInGrid = true
                }
            }
        }
    }).bind("keyup.pqExcel", function(evt) {
        var keyCode = evt.keyCode;
        if (!pasteProgress && iExcel && !(evt.ctrlKey || evt.metaKey) && $.inArray(keyCode, [17, 91, 93, 224]) != -1) {
            iExcel.destroyClipBoard();
            iExcel = null
        }
        if (keyDownInGrid) {
            var $ae = $(evt.target);
            if (!$ae.hasClass("pq-grid-row") && !$ae.hasClass("pq-grid-cell")) {
                keyDownInGrid = false
            }
        }
    });
    var keyDownInGrid = false
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        pq_options = _pq.pqGrid.prototype.options,
        historyModel = {
            on: true,
            checkEditable: true,
            checkEditableAdd: false,
            allowInvalid: true
        };
    pq_options.historyModel = pq_options.historyModel || historyModel;
    var cHistory = _pq.cHistory = function(that) {
        var self = this;
        this.that = that;
        this.options = that.options;
        this.records = [];
        this.counter = 0;
        this.id = 0;
        that.on("keyDown", function(evt, ui) {
            return self.onKeyDown(evt, ui)
        }).on("dataAvailable", function(evt, ui) {
            if (ui.source != "filter") {
                self.reset()
            }
        })
    };
    cHistory.prototype = {
        onKeyDown: function(evt, ui) {
            var keyCodes = {
                    z: "90",
                    y: "89",
                    c: "67",
                    v: "86"
                },
                ctrlMeta = evt.ctrlKey || evt.metaKey;
            if (ctrlMeta && evt.keyCode == keyCodes.z) {
                if (this.undo()) {}
                return false
            } else if (ctrlMeta && evt.keyCode == keyCodes.y) {
                if (this.redo()) {}
                return false
            }
        },
        resetUndo: function() {
            if (this.counter == 0) {
                return false
            }
            this.counter = 0;
            var that = this.that;
            that._trigger("history", null, {
                type: "resetUndo",
                num_undo: 0,
                num_redo: this.records.length - this.counter,
                canUndo: false,
                canRedo: true
            })
        },
        reset: function() {
            if (this.counter == 0 && this.records.length == 0) {
                return false
            }
            this.records = [];
            this.counter = 0;
            this.id = 0;
            var that = this.that;
            that._trigger("history", null, {
                num_undo: 0,
                num_redo: 0,
                type: "reset",
                canUndo: false,
                canRedo: false
            })
        },
        increment: function() {
            var records = this.records,
                len = records.length;
            if (len) {
                var id = records[len - 1].id;
                this.id = id + 1
            } else {
                this.id = 0
            }
        },
        push: function(objP) {
            var prevCanRedo = this.canRedo();
            var records = this.records,
                counter = this.counter;
            if (records.length > counter) {
                records.splice(counter, records.length - counter)
            }
            records[counter] = $.extend({
                id: this.id
            }, objP);
            this.counter++;
            var that = this.that,
                canUndo, canRedo;
            if (this.counter == 1) {
                canUndo = true
            }
            if (prevCanRedo && this.counter == records.length) {
                canRedo = false
            }
            that._trigger("history", null, {
                type: "add",
                canUndo: canUndo,
                canRedo: canRedo,
                num_undo: this.counter,
                num_redo: 0
            })
        },
        canUndo: function() {
            if (this.counter > 0) return true;
            else return false
        },
        canRedo: function() {
            if (this.counter < this.records.length) return true;
            else return false
        },
        processCol: function(colList, redo) {
            var that = this.that;
            if (colList.length) {
                var type_add = colList.type == "add",
                    type_add = redo ? type_add : !type_add;
                that[type_add ? "addColumn" : "deleteColumn"]({
                    colList: colList,
                    history: false
                })
            }
        },
        undo: function() {
            var prevCanRedo = this.canRedo(),
                that = this.that,
                HM = this.options.historyModel,
                records = this.records;
            if (this.counter > 0) {
                this.counter--
            } else {
                return false
            }
            var counter = this.counter,
                record = records[counter],
                colList = record.colList || [],
                canRedo, canUndo, id = record.id,
                updateList = record.updateList.map(function(rowListObj) {
                    return {
                        rowIndx: that.getRowIndx({
                            rowData: rowListObj.rowData
                        }).rowIndx,
                        rowData: rowListObj.rowData,
                        oldRow: rowListObj.newRow,
                        newRow: rowListObj.oldRow
                    }
                }),
                deleteList = record.addList.map(function(rowListObj) {
                    return {
                        rowData: rowListObj.newRow
                    }
                }),
                addList = record.deleteList.map(function(rowListObj) {
                    return {
                        newRow: rowListObj.rowData,
                        rowIndx: rowListObj.rowIndx
                    }
                });
            if (colList.length) {
                this.processCol(colList)
            } else {
                var ret = that._digestData({
                    history: false,
                    source: "undo",
                    checkEditable: HM.checkEditable,
                    checkEditableAdd: HM.checkEditableAdd,
                    allowInvalid: HM.allowInvalid,
                    addList: addList,
                    updateList: updateList,
                    deleteList: deleteList
                });
                that[updateList.length || deleteList.length ? "refreshView" : "refresh"]({
                    source: "undo"
                })
            }
            if (prevCanRedo === false) {
                canRedo = true
            }
            if (this.counter == 0) {
                canUndo = false
            }
            that._trigger("history", null, {
                canUndo: canUndo,
                canRedo: canRedo,
                type: "undo",
                num_undo: this.counter,
                num_redo: this.records.length - this.counter
            });
            return true
        },
        redo: function() {
            var prevCanUndo = this.canUndo(),
                that = this.that,
                HM = this.options.historyModel,
                counter = this.counter,
                records = this.records;
            if (counter == records.length) {
                return false
            }
            var record = records[counter],
                colList = record.colList || [],
                id = record.id,
                updateList = record.updateList.map(function(rowListObj) {
                    return {
                        rowIndx: that.getRowIndx({
                            rowData: rowListObj.rowData
                        }).rowIndx,
                        rowData: rowListObj.rowData,
                        newRow: rowListObj.newRow,
                        oldRow: rowListObj.oldRow
                    }
                }),
                deleteList = record.deleteList.map(function(rowListObj) {
                    return {
                        rowData: rowListObj.rowData
                    }
                }),
                addList = record.addList.map(function(rowListObj) {
                    return {
                        newRow: rowListObj.newRow,
                        rowIndx: rowListObj.rowIndx
                    }
                });
            if (colList.length) {
                this.processCol(colList, true)
            } else {
                var ret = that._digestData({
                    history: false,
                    source: "redo",
                    checkEditable: HM.checkEditable,
                    checkEditableAdd: HM.checkEditableAdd,
                    allowInvalid: HM.allowInvalid,
                    addList: addList,
                    updateList: updateList,
                    deleteList: deleteList
                });
                that[updateList.length || deleteList.length ? "refreshView" : "refresh"]({
                    source: "redo"
                })
            }
            if (this.counter < records.length) {
                this.counter++
            }
            var canUndo, canRedo;
            if (prevCanUndo == false) {
                canUndo = true
            }
            if (this.counter == this.records.length) {
                canRedo = false
            }
            that._trigger("history", null, {
                canUndo: canUndo,
                canRedo: canRedo,
                type: "redo",
                num_undo: this.counter,
                num_redo: this.records.length - this.counter
            });
            return true
        }
    };
    var fnGrid = _pq.pqGrid.prototype;
    fnGrid.history = function(obj) {
        var method = obj.method;
        return this.iHistory[method](obj)
    };
    fnGrid.History = function() {
        return this.iHistory
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    _pq.filter = function() {
        var conditions = {
            begin: {
                text: "Begins With",
                TR: true,
                string: true
            },
            between: {
                text: "Between",
                TR: true,
                string: true,
                date: true,
                number: true
            },
            notbegin: {
                text: "Does not begin with",
                TR: true,
                string: true
            },
            contain: {
                text: "Contains",
                TR: true,
                string: true
            },
            notcontain: {
                text: "Does not contain",
                TR: true,
                string: true
            },
            equal: {
                text: "Equal To",
                TR: true,
                string: true,
                bool: true
            },
            notequal: {
                text: "Not Equal To",
                TR: true,
                string: true
            },
            empty: {
                text: "Empty",
                TR: false,
                string: true,
                bool: true
            },
            notempty: {
                text: "Not Empty",
                TR: false,
                string: true,
                bool: true
            },
            end: {
                text: "Ends With",
                TR: true,
                string: true
            },
            notend: {
                text: "Does not end with",
                TR: true,
                string: true
            },
            less: {
                text: "Less Than",
                TR: true,
                number: true,
                date: true
            },
            lte: {
                text: "Less than or equal",
                TR: true,
                number: true,
                date: true
            },
            range: {
                TR: true,
                string: true,
                number: true,
                date: true
            },
            regexp: {
                TR: true,
                string: true,
                number: true,
                date: true
            },
            great: {
                text: "Great Than",
                TR: true,
                number: true,
                date: true
            },
            gte: {
                text: "Greater than or equal",
                TR: true,
                number: true,
                date: true
            }
        };
        return {
            conditions: conditions,
            getAllConditions: function() {
                var arr = [];
                for (var key in conditions) {
                    arr.push(key)
                }
                return arr
            }(),
            getConditions: function(type) {
                var arr = [];
                for (var key in conditions) {
                    if (conditions[key][type]) arr.push(key)
                }
                return arr
            },
            getTRConditions: function() {
                var arr = [];
                for (var key in conditions) {
                    if (conditions[key].TR) arr.push(key)
                }
                return arr
            }(),
            getWTRConditions: function() {
                var arr = [];
                for (var key in conditions) {
                    if (!conditions[key].TR) arr.push(key)
                }
                return arr
            }()
        }
    }();
    _pq.filter.rules = {};
    _pq.filter.rules["en"] = {
        begin: "Begins With",
        between: "Between",
        notbegin: "Does not begin with",
        contain: "Contains",
        notcontain: "Does not contain",
        equal: "Equal To",
        notequal: "Not Equal To",
        empty: "Empty",
        notempty: "Not Empty",
        end: "Ends With",
        notend: "Does not end with",
        less: "Less Than",
        lte: "Less than or equal",
        great: "Great Than",
        gte: "Greater than or equal"
    };
    var cFilterData = function(that) {
        this.that = that;
        that.on("load", function() {
            var dataUF = that.options.dataModel.dataUF;
            if (dataUF) {
                dataUF.length = 0
            }
        });
        this.isMatchCell = this.isMatchCellSingle
    };
    _pq.cFilterData = cFilterData;
    cFilterData.conditions = {
        equal: function(cd, value) {
            if (cd == value) {
                return true
            }
        },
        contain: function(cd, value) {
            if (cd.indexOf(value) != -1) {
                return true
            }
        },
        notcontain: function(cd, value) {
            if (cd.indexOf(value) == -1) {
                return true
            }
        },
        empty: function(cd) {
            if (cd.length == 0) {
                return true
            }
        },
        notempty: function(cd) {
            if (cd.length > 0) {
                return true
            }
        },
        begin: function(cd, value) {
            if ((cd + "").indexOf(value) == 0) {
                return true
            }
        },
        notbegin: function(cd, value) {
            if (cd.indexOf(value) != 0) {
                return true
            }
        },
        end: function(cd, value) {
            var lastIndx = cd.lastIndexOf(value);
            if (lastIndx != -1 && lastIndx + value.length == cd.length) {
                return true
            }
        },
        notend: function(cd, value) {
            var lastIndx = cd.lastIndexOf(value);
            if (lastIndx != -1 && lastIndx + value.length == cd.length) {} else {
                return true
            }
        },
        regexp: function(cd, value) {
            if (value.test(cd)) {
                value.lastIndex = 0;
                return true
            }
        },
        notequal: function(cd, value) {
            if (cd != value) {
                return true
            }
        },
        great: function(cd, value) {
            if (cd > value) {
                return true
            }
        },
        gte: function(cd, value) {
            if (cd >= value) {
                return true
            }
        },
        between: function(cd, value, value2) {
            if (cd >= value && cd <= value2) {
                return true
            }
        },
        range: function(cd, value) {
            if ($.inArray(cd, value) != -1) {
                return true
            }
        },
        less: function(cd, value) {
            if (cd < value) {
                return true
            }
        },
        lte: function(cd, value) {
            if (cd <= value) {
                return true
            }
        }
    };
    cFilterData.convert = function(cd, dataType) {
        cd = cd == null ? "" : cd;
        if (dataType == "string") {
            cd = $.trim(cd).toUpperCase()
        } else if (dataType == "date") {
            cd = Date.parse(cd)
        } else if (dataType == "integer") {
            cd = parseInt(cd)
        } else if (dataType == "float") {
            cd = parseFloat(cd)
        } else if (dataType == "bool") {
            cd = String(cd).toLowerCase()
        } else if (dataType == "html") {
            cd = $.trim(cd).toUpperCase()
        }
        return cd
    };
    cFilterData.prototype = {
        isMatchCellSingle: function(s, rowData) {
            var dataIndx = s.dataIndx,
                dataType = s.dataType,
                value = s.value,
                value2 = s.value2,
                condition = s.condition,
                cbFn = s.cbFn,
                cd = rowData[dataIndx];
            var found;

            if (typeof condition == "function") {
                // Modified taeho
                found = s.cbFn(dataIndx, rowData);
            }else{
                if (condition == "regexp") {
                    cd = cd == null ? "" : cd
                } else {
                    cd = cFilterData.convert(cd, dataType)
                }
                found = cbFn(cd, value, value2) ? true : false;
            }
            return found
        },
        isMatchRow: function(rowData, rules, FMmode) {
            if (rules.length == 0) {
                return true
            }
            for (var i = 0; i < rules.length; i++) {
                var s = rules[i],
                    found = this.isMatchCell(s, rowData);
                if (FMmode == "OR" && found) {
                    return true
                }
                if (FMmode == "AND" && !found) {
                    return false
                }
            }
            if (FMmode == "AND") {
                return true
            } else if (FMmode == "OR") {
                return false
            }
        },
        getQueryStringFilter: function() {
            var that = this.that,
                o = that.options,
                stringify = o.stringify,
                FM = o.filterModel,
                FMmode = FM.mode,
                CM = that.colModel,
                rules = this.getRulesFromCM({
                    CM: CM,
                    location: "remote"
                }),
                filter = "";
            if (FM && FM.on && rules) {
                if (rules.length) {
                    var obj = {
                        mode: FMmode,
                        data: rules
                    };
                    if (stringify === false) {
                        filter = obj
                    } else {
                        filter = JSON.stringify(obj)
                    }
                } else {
                    filter = ""
                }
            }
            return filter
        },
        copyRuleToColumn: function(rule, column) {
            var filter = column.filter,
                condition = rule.condition,
                value = rule.value;
            if (!filter) {
                filter = column.filter = {
                    on: true
                }
            } else {
                filter.on = true
            }
            if (condition) {
                filter.condition = condition
            }
            condition = filter.condition;
            filter.value = value;
            if (condition == "between") {
                filter.value2 = rule.value2
            } else if (condition == "range") {
                var arrOpts = [];
                if (value) {
                    if (typeof value == "string") {
                        var options = filter.options;
                        var firstIndx = value.indexOf('"');
                        var lastIndx = value.lastIndexOf('"');
                        value = value.substr(firstIndx, lastIndx + 1);
                        value = JSON.parse("[" + value + "]");
                        if (options) {
                            for (var k = 0, optLen = options.length; k < optLen; k++) {
                                var opt = options[k];
                                if ($.inArray(opt, value) != -1) {
                                    arrOpts.push(opt)
                                }
                            }
                        } else {
                            arrOpts = value.split(",s*")
                        }
                    } else if (typeof value.push == "function") {
                        arrOpts = value
                    }
                }
                filter.value = arrOpts
            }
        },
        filterLocalData: function(objP) {
            objP = objP || {};
            var that = this.that,
                ui, data = objP.data,
                apply = !data,
                CM = apply ? that.colModel : objP.CM,
                arrS = this.getRulesFromCM({
                    CM: CM
                }),
                options = that.options,
                DM = options.dataModel,
                iSort = that.iSort,
                filtered, data1 = data || DM.data,
                data2 = DM.dataUF = DM.dataUF || [],
                data11 = [],
                data22 = [],
                FM = options.filterModel,
                FMmultiple = FM.multiple,
                FMmode = objP.mode || FM.mode;
            if (apply) {
                if (data2.length) {
                    filtered = true;
                    for (var i = 0, len = data2.length; i < len; i++) {
                        data1.push(data2[i])
                    }
                    data2 = DM.dataUF = []
                } else {
                    if (!arrS.length) {
                        return {
                            data: data1,
                            dataUF: data2
                        }
                    } else {
                        iSort.saveOrder()
                    }
                }
            }
            if (FM.on && FMmode && arrS && arrS.length) {
                if (data1.length) {
                    ui = {
                        filters: arrS,
                        mode: FMmode,
                        data: data1
                    };
                    if (that._trigger("customFilter", null, ui) === false) {
                        data11 = ui.dataTmp;
                        data22 = ui.dataUF
                    } else {
                        for (var i = 0, len = data1.length; i < len; i++) {
                            var rowData = data1[i];
                            if (!this.isMatchRow(rowData, arrS, FMmode)) {
                                data22.push(rowData)
                            } else {
                                data11.push(rowData)
                            }
                        }
                    }
                }
                data1 = data11;
                data2 = data22;
                if (iSort.readSorter().length == 0) {
                    data1 = iSort.sortLocalData(data1)
                }
                if (apply) {
                    DM.data = data1;
                    DM.dataUF = data2
                }
            } else if (filtered && apply) {
                ui = {
                    data: data1
                };
                if (that._trigger("clearFilter", null, ui) === false) {
                    data1 = ui.data
                }
                if (iSort.readSorter().length == 0) {
                    data1 = iSort.sortLocalData(data1)
                }
                DM.data = data1;
                that._queueATriggers["filter"] = {
                    ui: {
                        type: "local"
                    }
                }
            }
            if (apply) {
                that._queueATriggers.filter = {
                    ui: {
                        type: "local",
                        filter: arrS
                    }
                }
            }
            return {
                data: data1,
                dataUF: data2
            }
        },
        addMissingConditions: function(rules) {
            var that = this.that;
            rules.forEach(function(rule) {
                rule.condition = rule.condition || that.getColumn({
                    dataIndx: rule.dataIndx
                }).filter.condition
            })
        },
        getRulesFromCM: function(objP) {
            var CM = objP.CM;
            if (!CM) {
                throw "CM N/A"
            }
            var that = this.that,
                CMLength = CM.length,
                i = 0,
                location = objP.location,
                conditions = _pq.filter.getAllConditions,
                TRconditions = _pq.filter.getTRConditions,
                rules = [],
                cFilterData = _pq.cFilterData,
                isCorrect = function(condition, value, value2) {
                    if (typeof condition == "function") {
                        return true
                    } else if (condition == "between") {
                        if ((value == null || value === "") && (value2 == null || value2 === "")) {
                            return false
                        } else {
                            return true
                        }
                    } else if ($.inArray(condition, conditions) != -1) {
                        if (value == null || value === "") {
                            if ($.inArray(condition, TRconditions) != -1) {
                                return false
                            }
                        }
                        return true
                    } else {
                        return true
                    }
                },
                getValue = function(cd, dataType) {
                    if (location == "remote") {
                        cd = cd == null ? "" : cd;
                        return cd.toString()
                    } else {
                        return cFilterData.convert(cd, dataType)
                    }
                };
            for (; i < CMLength; i++) {
                var column = CM[i],
                    filter = column.filter;
                if (filter && filter.on) {
                    var dataIndx = column.dataIndx,
                        dataType = column.dataType,
                        dataType = !dataType || dataType == "stringi" || typeof dataType == "function" ? "string" : dataType,
                        value = filter.value,
                        value2 = filter.value2,
                        condition = filter.condition;
                    if (isCorrect(condition, value, value2)) {
                        if (condition == "between") {
                            if (value === "" || value == null) {
                                condition = "lte";
                                value = getValue(value2, dataType)
                            } else if (value2 === "" || value2 == null) {
                                condition = "gte";
                                value = getValue(value, dataType)
                            } else {
                                value = getValue(value, dataType);
                                value2 = getValue(value2, dataType)
                            }
                        } else if (condition == "regexp") {
                            if (location == "remote") {
                                value = value.toString()
                            } else if (typeof value == "string") {
                                try {
                                    var modifiers = filter.modifiers || "gi";
                                    value = new RegExp(value, modifiers)
                                } catch (ex) {
                                    value = /.*/
                                }
                            }
                        } else if (condition == "range") {
                            if (value == null) {
                                continue
                            } else {
                                if (typeof value == "string") {
                                    value = getValue(value, dataType);
                                    value = value.split(/\s*,\s*/)
                                } else if (value && typeof value.push == "function") {
                                    if (value.length == 0) {
                                        continue
                                    }
                                    value = value.slice();
                                    for (var j = 0, len = value.length; j < len; j++) {
                                        value[j] = getValue(value[j], dataType)
                                    }
                                }
                            }
                        } else {
                            value = getValue(value, dataType)
                        }
                        var cbFn;
                        if (location == "remote") {
                            cbFn = ""
                        } else if (typeof condition == "function") {
                            cbFn = condition
                        } else {
                            cbFn = cFilterData.conditions[condition]
                        }
                        rules.push({
                            dataIndx: dataIndx,
                            value: value,
                            value2: value2,
                            condition: condition,
                            dataType: dataType,
                            cbFn: cbFn
                        })
                    }
                }
            }
            return rules
        },
        getCMFromRules: function(rules) {
            var that = this.that;
            return rules.map(function(rule) {
                return $.extend(true, {}, that.getColumn({
                    dataIndx: rule.dataIndx
                }))
            })
        },
        clearFilters: function(CM) {
            CM.forEach(function(column) {
                var filter = column.filter;
                if (filter) {
                    filter.value = filter.value2 = undefined
                }
            })
        },
        filter: function(objP) {
            objP = objP || {};
            this.compatibilityCheck(objP);
            var that = this.that,
                o = that.options,
                header = false,
                data = objP.data,
                rules = objP.rules || [objP.rule],
                rule, column, apply = !data,
                DM = o.dataModel,
                FM = o.filterModel,
                mode = objP.mode || FM.mode,
                replace = objP.oper == "replace",
                CM = apply ? that.colModel : this.getCMFromRules(rules),
                j = 0,
                rulesLength = rules.length;
            this.addMissingConditions(rules);
            if (apply) {
                if (that._trigger("beforeFilter", null, objP) === false) {
                    return
                }
                objP.header != null && (header = objP.header);
                if (replace) {
                    this.clearFilters(CM)
                }
                for (; j < rulesLength; j++) {
                    rule = rules[j];
                    column = that.getColumn({
                        dataIndx: rule.dataIndx
                    });
                    this.copyRuleToColumn(rule, column)
                }
            } else {
                for (; j < rulesLength; j++) {
                    rule = rules[j];
                    column = CM[j];
                    this.copyRuleToColumn(rule, column)
                }
            }
            var obj2 = {
                header: header,
                CM: CM,
                data: data,
                rules: rules,
                mode: mode
            };
            if (DM.location == "remote" && FM.type != "local") {
                that.remoteRequest({
                    apply: apply,
                    CM: CM,
                    callback: function() {
                        return that._onDataAvailable(obj2)
                    }
                })
            } else {
                obj2.source = "filter";
                obj2.trigger = false;
                return that._onDataAvailable(obj2)
            }

            that.loadComplete();
        },
        compatibilityCheck: function(ui) {
            var data = ui.data,
                rule, str = "Incorrect filter parameters. Please check upgrade guide";
            if (data) {
                if (rule = data[0]) {
                    if (rule.hasOwnProperty("dataIndx") && rule.hasOwnProperty("value")) {
                        throw str
                    }
                } else if (!ui.rules) {
                    throw str
                }
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        cSort = _pq.cSort = function(that) {
            var self = this;
            self.that = that;
            self.sorters = [];
            self.tmpPrefix = "pq_tmp_";
            self.cancel = false
        };
    _pq.pqGrid.prototype.sort = function(ui) {
        ui = ui || {};
        var that = this,
            options = this.options,
            DM = options.dataModel,
            data = DM.data,
            SM = options.sortModel,
            type = SM.type;
        if ((!data || !data.length) && type == "local") {
            return
        }
        var EM = options.editModel,
            iSort = this.iSort,
            oldSorter = iSort.getSorter(),
            newSorter, evt = ui.evt,
            single = ui.single == null ? iSort.readSingle() : ui.single,
            cancel = iSort.readCancel();
        if (ui.sorter) {
            if (ui.addon) {
                ui.single = single;
                ui.cancel = cancel;
                newSorter = iSort.addon(ui)
            } else {
                newSorter = ui.sorter
            }
        } else {
            newSorter = iSort.readSorter()
        }
        if (!newSorter.length && !oldSorter.length) {
            return
        }
        if (EM.indices) {
            that.blurEditor({
                force: true
            })
        }
        var ui2 = {
            dataIndx: newSorter.length ? newSorter[0].dataIndx : null,
            oldSorter: oldSorter,
            sorter: newSorter,
            source: ui.source,
            single: single
        };
        if (that._trigger("beforeSort", evt, ui2) === false) {
            iSort.cancelSort();
            return
        }
        iSort.resumeSort();
        if (type == "local") {
            iSort.saveOrder()
        }
        iSort.setSorter(newSorter);
        iSort.setSingle(single);
        iSort.writeSorter(newSorter);
        iSort.writeSingle(single);
        if (type == "local") {
            DM.data = iSort.sortLocalData(data);
            this._queueATriggers["sort"] = {
                evt: evt,
                ui: ui2
            };
            if (ui.refresh !== false) {
                this.refreshView()
            }
        } else if (type == "remote") {
            this._queueATriggers["sort"] = {
                evt: evt,
                ui: ui2
            };
            if (!ui.initByRemote) {
                this.remoteRequest({
                    initBySort: true,
                    callback: function() {
                        that._onDataAvailable()
                    }
                })
            }
        }
    };
    var _pSort = cSort.prototype;
    _pSort.cancelSort = function() {
        this.cancel = true
    };
    _pSort.resumeSort = function() {
        this.cancel = false
    };
    _pSort.readSorter = function() {
        var that = this.that,
            o = that.options,
            columns = that.columns,
            len, sorters = [];
        var SM = o.sortModel,
            SMsorter = SM.sorter;
        if (SMsorter && (len = SMsorter.length)) {
            while (len--) {
                if (columns[SMsorter[len].dataIndx] == null) {
                    SMsorter.splice(len, 1)
                }
            }
            sorters = sorters.concat(SMsorter)
        }
        sorters = pq.arrayUnique(sorters, "dataIndx");
        return sorters
    };
    _pSort.setSingle = function(m) {
        this.single = m
    };
    _pSort.getSingle = function() {
        return this.single
    };
    _pSort.readSingle = function() {
        return this.that.options.sortModel.single
    };
    _pSort.writeSingle = function(m) {
        this.that.options.sortModel.single = m
    };
    _pSort.setCancel = function(m) {
        this.cancel = m
    };
    _pSort.getCancel = function() {
        return this.cancel
    };
    _pSort.readCancel = function() {
        return this.that.options.sortModel.cancel
    };
    _pSort.writeCancel = function(m) {
        this.that.options.sortModel.cancel = m
    };
    _pSort.writeSorter = function(sorter) {
        var o = this.that.options,
            SM = o.sortModel;
        SM.sorter = sorter
    };
    _pSort.addon = function(ui) {
        ui = ui || {};
        var sorter = ui.sorter,
            uiDataIndx = sorter[0].dataIndx,
            uiDir = sorter[0].dir,
            single = ui.single,
            cancel = ui.cancel,
            GMLength = 0,
            sorters = this.readSorter();
        if (single == null) {
            throw "sort single N/A"
        }
        if (uiDataIndx != null) {
            if (single && !ui.tempMultiple) {
                sorters = sorters.length ? [sorters[0]] : [];
                if (sorters[GMLength] && sorters[GMLength].dataIndx == uiDataIndx) {
                    var oldDir = sorters[GMLength].dir;
                    var sortDir = oldDir === "up" ? "down" : cancel && oldDir === "down" ? "" : "up";
                    if (sortDir === "") {
                        sorters.length--
                    } else {
                        sorters[GMLength].dir = sortDir
                    }
                } else {
                    sortDir = uiDir ? uiDir : "up";
                    sorters[GMLength] = {
                        dataIndx: uiDataIndx,
                        dir: sortDir
                    }
                }
            } else {
                var indx = this.inSorters(sorters, uiDataIndx);
                if (indx > -1) {
                    oldDir = sorters[indx].dir;
                    if (oldDir == "up") {
                        sorters[indx].dir = "down"
                    } else if (cancel && oldDir == "down") {
                        sorters.splice(indx, 1)
                    } else if (sorters.length == 1) {
                        sorters[indx].dir = "up"
                    } else {
                        sorters.splice(indx, 1)
                    }
                } else {
                    sorters.push({
                        dataIndx: uiDataIndx,
                        dir: "up"
                    })
                }
            }
        }
        return sorters
    };
    _pSort.saveOrder = function(data) {
        var that = this.that,
            DM = that.options.dataModel,
            data = DM.data;
        if (data && data.length) {
            if (!DM.dataUF || !DM.dataUF.length) {
                if (!this.getSorter().length || data[0].pq_order == null) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        data[i].pq_order = i
                    }
                }
            }
        }
    };
    _pSort.getQueryStringSort = function() {
        if (this.cancel) {
            return ""
        }
        var that = this.that,
            sorters = this.sorters,
            options = that.options,
            stringify = options.stringify;
        if (sorters.length) {
            if (stringify === false) {
                return sorters
            } else {
                return JSON.stringify(sorters)
            }
        } else {
            return ""
        }
    };
    _pSort.getSorter = function() {
        var sorter = this.sorters;
        return sorter
    };
    _pSort.setSorter = function(sorters) {
        this.sorters = sorters.slice(0)
    };
    _pSort.inSorters = function(sorters, dataIndx) {
        for (var i = 0; i < sorters.length; i++) {
            if (sorters[i].dataIndx == dataIndx) {
                return i
            }
        }
        return -1
    };
    _pSort.sortLocalData = function(data) {
        var sorters = this.sorters;
        if (!sorters.length) {
            sorters = [{
                dataIndx: "pq_order",
                dir: "up",
                dataType: "integer"
            }]
        }
        return this._sortLocalData(sorters, data)
    };
    _pSort.compileSorter = function(sorters, data) {
        var self = this,
            that = self.that,
            columns = that.columns,
            o = that.options,
            arrFn = [],
            arrDI = [],
            arrDir = [],
            tmpPrefix = self.tmpPrefix,
            SM = o.sortModel,
            o_useCache = SM.useCache,
            ignoreCase = SM.ignoreCase,
            sortersLength = sorters.length;
        data = data ? data : o.dataModel.data;
        for (var i = 0; i < sortersLength; i++) {
            var sorter = sorters[i],
                dataIndx = sorter.dataIndx,
                column = columns[dataIndx] || {},
                _dir = sorter.dir = sorter.dir || "up",
                dir = _dir == "up" ? 1 : -1,
                sortType = column.sortType,
                sortType = pq.getFn(sortType),
                dataType = column.dataType || sorter.dataType || "string",
                dataType = dataType == "string" && ignoreCase ? "stringi" : dataType,
                useCache = o_useCache && dataType == "date",
                _dataIndx = useCache ? tmpPrefix + dataIndx : dataIndx;
            arrDI[i] = _dataIndx;
            arrDir[i] = dir;
            if (sortType) {
                arrFn[i] = function(sortType, sort_custom) {
                    return function(obj1, obj2, dataIndx, dir) {
                        return sort_custom(obj1, obj2, dataIndx, dir, sortType)
                    }
                }(sortType, sortObj.sort_sortType)
            } else if (dataType == "integer") {
                arrFn[i] = sortObj.sort_number
            } else if (dataType == "float") {
                arrFn[i] = sortObj.sort_number
            } else if (typeof dataType == "function") {
                arrFn[i] = function(dataType, sort_custom) {
                    return function(obj1, obj2, dataIndx, dir) {
                        return sort_custom(obj1, obj2, dataIndx, dir, dataType)
                    }
                }(dataType, sortObj.sort_dataType)
            } else if (dataType == "date") {
                arrFn[i] = sortObj["sort_date" + (useCache ? "_fast" : "")]
            } else if (dataType == "bool") {
                arrFn[i] = sortObj.sort_bool
            } else if (dataType == "stringi") {
                arrFn[i] = sortObj.sort_locale
            } else {
                arrFn[i] = sortObj.sort_string
            }
            if (useCache) {
                self.useCache(data, dataType, dataIndx, _dataIndx)
            }
        }
        return self._composite(arrFn, arrDI, arrDir, sortersLength)
    };
    _pSort._composite = function(arrFn, arrDI, arrDir, len) {
        return function sort_composite(obj1, obj2) {
            var ret = 0,
                i = 0;
            for (; i < len; i++) {
                ret = arrFn[i](obj1, obj2, arrDI[i], arrDir[i]);
                if (ret != 0) {
                    break
                }
            }
            return ret
        }
    };
    _pSort._sortLocalData = function(sorters, data) {
        if (!data) {
            return []
        }
        if (!data.length || !sorters || !sorters.length) {
            return data
        }
        var self = this,
            that = self.that,
            SM = that.options.sortModel,
            sort_composite = self.compileSorter(sorters),
            ui = {
                sort_composite: sort_composite,
                data: data
            };
        if (that._trigger("customSort", null, ui) !== false) {
            data.sort(sort_composite)
        } else {
            data = ui.data
        }
        if (SM.useCache) {
            setTimeout(self.removeCache(sorters, data), 0)
        }
        return data
    };
    _pSort.useCache = function(data, dataType, dataIndx, _dataIndx) {
        var valueFn = sortObj["get_" + dataType],
            j = data.length;
        while (j--) {
            var rowData = data[j];
            rowData[_dataIndx] = valueFn(rowData[dataIndx])
        }
    };
    _pSort.removeCache = function(sorters, data) {
        var tmpPrefix = this.tmpPrefix;
        return function() {
            var i = sorters.length;
            while (i--) {
                var sorter = sorters[i],
                    _dataIndx = tmpPrefix + sorter.dataIndx,
                    j = data.length;
                if (j && data[0].hasOwnProperty(_dataIndx)) {
                    while (j--) {
                        delete data[j][_dataIndx]
                    }
                }
            }
        }
    };
    var sortObj = {
        get_date: function(val) {
            var val2;
            return val ? isNaN(val2 = Date.parse(val)) ? 0 : val2 : 0
        },
        sort_number: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx],
                val2 = obj2[dataIndx];
            val1 = val1 ? val1 * 1 : 0;
            val2 = val2 ? val2 * 1 : 0;
            return (val1 - val2) * dir
        },
        sort_date: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx],
                val2 = obj2[dataIndx];
            val1 = val1 ? Date.parse(val1) : 0;
            val2 = val2 ? Date.parse(val2) : 0;
            return (val1 - val2) * dir
        },
        sort_date_fast: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx],
                val2 = obj2[dataIndx];
            return (val1 - val2) * dir
        },
        sort_dataType: function(obj1, obj2, dataIndx, dir, dataType) {
            var val1 = obj1[dataIndx],
                val2 = obj2[dataIndx];
            return dataType(val1, val2) * dir
        },
        sort_sortType: function(obj1, obj2, dataIndx, dir, sortType) {
            return sortType(obj1, obj2, dataIndx) * dir
        },
        sort_string: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx] || "",
                val2 = obj2[dataIndx] || "",
                ret = 0;
            if (val1 > val2) {
                ret = 1
            } else if (val1 < val2) {
                ret = -1
            }
            return ret * dir
        },
        sort_locale: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx] || "",
                val2 = obj2[dataIndx] || "";
            return val1.localeCompare(val2) * dir
        },
        sort_bool: function(obj1, obj2, dataIndx, dir) {
            var val1 = obj1[dataIndx],
                val2 = obj2[dataIndx],
                ret = 0;
            if (val1 && !val2 || val1 === false && val2 === null) {
                ret = 1
            } else if (val2 && !val1 || val2 === false && val1 === null) {
                ret = -1
            }
            return ret * dir
        }
    };
    pq.sortObj = sortObj
})(jQuery);
(function($) {
    "use strict";

    function cMerge(that) {
        this.that = that;
        this.mc = null;
        var self = this;
        that.on("dataReady columnOrder groupShowHide", function(evt, ui) {
            if (that.options.mergeCells && ui.source !== "pager") {
                self.init()
            }
        })
    }
    $.paramquery.cMerge = cMerge;
    var _pMerge = cMerge.prototype;
    _pMerge.findNextVisibleColumn = function(CM, ci, cs) {
        var i = ci,
            column;
        for (; i < ci + cs; i++) {
            column = CM[i];
            if (!column) {
                return -1
            }
            if (!column.hidden) {
                return i
            }
        }
    };
    _pMerge.findNextVisibleRow = function(pdata, rip, rs) {
        var i = rip,
            rowdata;
        for (; i < rip + rs; i++) {
            rowdata = pdata[i];
            if (!rowdata) {
                return -1
            }
            if (!rowdata.pq_hidden) {
                return i
            }
        }
    };
    _pMerge.init = function() {
        var that = this.that,
            findNextVisibleColumn = this.findNextVisibleColumn,
            findNextVisibleRow = this.findNextVisibleRow,
            calcVisibleColumns = this.calcVisibleColumns,
            calcVisibleRows = this.calcVisibleRows,
            CM = that.colModel,
            mc_o = that.options.mergeCells || [],
            data = that.get_p_data(),
            arr2 = [],
            arr = [];
        for (var i = 0, len = mc_o.length; i < len; i++) {
            var rec = mc_o[i],
                r1 = rec.r1,
                v_r1 = r1,
                rowdata = data[r1],
                c1 = rec.c1,
                v_c1 = c1,
                column = CM[c1],
                rs = rec.rc,
                cs = rec.cc,
                cs2, rs2;
            if (!column || !rowdata) {
                continue
            }
            if (column.hidden) {
                v_c1 = findNextVisibleColumn(CM, c1, cs)
            }
            cs2 = calcVisibleColumns(CM, c1, c1 + cs);
            if (rowdata.pq_hidden) {
                v_r1 = findNextVisibleRow(data, r1, rs)
            }
            rs2 = calcVisibleRows(data, r1, r1 + rs);
            if (rs2 < 1 || cs2 < 1) {
                continue
            }
            arr2.push({
                r1: r1,
                c1: c1,
                rc: rs,
                cc: cs,
                e_rc: rs2,
                e_cc: cs2
            });
            arr[v_r1] = arr[v_r1] || [];
            arr[v_r1][v_c1] = {
                show: true,
                rowspan: rs2,
                colspan: cs2,
                o_rowspan: rs,
                o_colspan: cs,
                style: rec.style,
                cls: rec.cls,
                attr: rec.attr,
                r1: r1,
                c1: c1,
                v_r1: v_r1,
                v_c1: v_c1
            };
            var hidden_obj = {
                show: false,
                r1: r1,
                c1: c1,
                v_r1: v_r1,
                v_c1: v_c1
            };
            for (var j = r1; j < r1 + rs; j++) {
                arr[j] = arr[j] || [];
                for (var k = c1; k < c1 + cs; k++) {
                    if (j == v_r1 && k == v_c1) {
                        continue
                    }
                    arr[j][k] = hidden_obj
                }
            }
        }
        that._mergeCells = arr.length > 0;
        this.mc = arr;
        this.mc2 = arr2
    };
    _pMerge.isHidden = function(ri, ci) {
        var that = this.that,
            mcRec, mc = this.mc;
        if (mc && mc[ri] && (mcRec = mc[ri][ci])) {
            if (!mcRec.show) {
                return true
            }
        }
        return false
    };
    _pMerge.setData = function(ri, ci, data) {
        var that = this.that,
            mcRec, mc = this.mc;
        if (mc[ri] && (mcRec = mc[ri][ci])) {
            mcRec.data = data
        }
    };
    _pMerge.getData = function(ri, ci, key) {
        var that = this.that,
            mcRec, mc = this.mc;
        if (mc[ri] && (mcRec = mc[ri][ci])) {
            var data = mcRec.data;
            return data ? data[key] : null
        }
    };
    _pMerge.removeData = function(ri, ci, key) {
        var that = this.that,
            mcRec, mc = this.mc;
        if (mc && mc[ri] && (mcRec = mc[ri][ci])) {
            var data = mcRec.data;
            if (data) {
                data[key] = null
            }
        }
    };
    _pMerge.ismergedCell = function(ri, ci) {
        var that = this.that,
            mc = this.mc,
            mcRec;
        if (mc && mc[ri] && (mcRec = mc[ri][ci])) {
            var v_ri = mcRec.v_r1,
                v_ci = mcRec.v_c1,
                mcRoot = mc[v_ri][v_ci];
            if (ri == mcRoot.r1 && ci == mcRoot.c1) {
                return {
                    rowspan: mcRoot.o_rowspan,
                    colspan: mcRoot.o_colspan
                }
            } else {
                return true
            }
        } else {
            return false
        }
    };
    _pMerge.isRootCell = function(r1, c1, type) {
        var that = this.that,
            mc = this.mc,
            mcRec;
        if (mc && mc[r1] && (mcRec = mc[r1][c1])) {
            if (type == "o") {
                return r1 == mcRec.r1 && c1 == mcRec.c1
            }
            var v_r1 = mcRec.v_r1,
                v_c1 = mcRec.v_c1;
            if (type == "a") {
                var mcRoot = mc[v_r1][v_c1];
                return mcRoot.a_r1 == r1 && mcRoot.a_c1 == c1
            } else {
                if (v_r1 == r1 && v_c1 == c1) {
                    var mcRoot = mc[v_r1][v_c1];
                    return {
                        rowspan: mcRoot.rowspan,
                        colspan: mcRoot.colspan
                    }
                }
            }
        }
    };
    _pMerge.getRootCell = function(r1, ci, type) {
        var that = this.that,
            mc = this.mc,
            mcRec;
        if (mc && mc[r1] && (mcRec = mc[r1][ci])) {
            if (type == "a") {
                r1 = mcRec.v_r1;
                ci = mcRec.v_c1;
                var mcRoot = mc[r1][ci];
                if (mcRoot.a_r1) {
                    r1 = mcRoot.a_r1;
                    ci = mcRoot.a_c1
                }
            } else if (type == "o") {
                r1 = mcRec.r1;
                ci = mcRec.c1
            } else {
                r1 = mcRec.v_r1;
                ci = mcRec.v_c1
            }
            var CM = that.colModel,
                column = CM[ci],
                offset = that.riOffset,
                rip = r1 - offset;
            if (rip < 0) {
                rip = 0;
                r1 = offset
            }
            return {
                rowIndxPage: rip,
                colIndx: ci,
                column: column,
                dataIndx: column.dataIndx,
                rowData: that.getRowData({
                    rowIndx: r1
                }),
                rowIndx: r1,
                rowspan: mcRec.rowspan,
                colspan: mcRec.colspan
            }
        } else {
            return that.normalize({
                rowIndx: r1,
                colIndx: ci
            })
        }
    };
    _pMerge.inflateRange = function(r1, c1, r2, c2) {
        var that = this.that,
            expand = false,
            o = that.options,
            GM = o.groupModel,
            max_ri2 = GM.on ? that.riOffset + that.pdata.length - 1 : o.dataModel.data.length - 1,
            max_ci2 = that.colModel.length - 1,
            mc = this.mc2;
        if (!mc) {
            return [r1, c1, r2, c2]
        }
        expando: for (var i = 0, len = mc.length; i < len; i++) {
            var rec = mc[i],
                ri1 = rec.r1,
                ci1 = rec.c1,
                ri2 = ri1 + rec.rc - 1,
                ci2 = ci1 + rec.cc - 1,
                ri2 = ri2 > max_ri2 ? max_ri2 : ri2,
                ci2 = ci2 > max_ci2 ? max_ci2 : ci2,
                topEdge = ri1 < r1 && ri2 >= r1,
                botEdge = ri1 <= r2 && ri2 > r2,
                leftEdge = ci1 < c1 && ci2 >= c1,
                rightEdge = ci1 <= c2 && ci2 > c2;
            if ((topEdge || botEdge) && ci2 >= c1 && ci1 <= c2 || (leftEdge || rightEdge) && ri2 >= r1 && ri1 <= r2) {
                expand = true;
                r1 = ri1 < r1 ? ri1 : r1;
                c1 = ci1 < c1 ? ci1 : c1;
                r2 = ri2 > r2 ? ri2 : r2;
                c2 = ci2 > c2 ? ci2 : c2;
                break expando
            }
        }
        if (expand) {
            return this.inflateRange(r1, c1, r2, c2)
        } else {
            return [r1, c1, r2, c2]
        }
    };
    _pMerge.calcVisibleColumns = function(CM, ci1, ci2) {
        var num = 0,
            len = CM.length;
        ci2 = ci2 > len ? len : ci2;
        for (; ci1 < ci2; ci1++) {
            if (CM[ci1].hidden !== true) {
                num++
            }
        }
        return num
    };

    function calcVisibleRows(pdata, rip1, rip2) {
        var num = 0,
            rd, i = rip1,
            len = pdata.length;
        rip2 = rip2 > len ? len : rip2;
        for (; i < rip2; i++) {
            rd = pdata[i];
            if (rd.pq_hidden !== true) {
                num++
            }
        }
        return num
    }
    _pMerge.calcVisibleRows = calcVisibleRows;
    var fn = $.paramquery.pqGrid.prototype;
    fn.calcVisibleRows = calcVisibleRows;
    _pMerge.renderCell = function(ui) {
        var that = this.that,
            a_r1 = ui.rowIndx,
            a_rip = ui.rowIndxPage,
            calcVisibleColumns = this.calcVisibleColumns,
            calcVisibleRows = this.calcVisibleRows,
            a_ci = ui.colIndx,
            nui, mc = this.mc,
            mcRec;
        if (mc[a_r1] && (mcRec = mc[a_r1][a_ci])) {
            var r1 = mcRec.v_r1,
                ci = mcRec.v_c1,
                o_r1 = mcRec.r1,
                o_ci = mcRec.c1,
                o = that.options,
                CM = that.colModel,
                offset = that.riOffset,
                fc = o.freezeCols,
                fr = o.freezeRows,
                fr_off = fr ? fr + offset : 0,
                initH = that.initH,
                initV = that.initV;
            var firstRowPage = a_ci == ci && a_rip == initV && r1 >= fr_off,
                topEdge = a_ci == ci && a_r1 == initV && r1 >= fr_off,
                leftEdge = a_r1 == r1 && a_ci == initH && ci >= fc,
                bothEdges = a_r1 == initV && a_ci == initH && ci >= fc && r1 >= fr_off;
            if (!mcRec.show && !firstRowPage && !topEdge && !leftEdge && !bothEdges) {
                return null
            } else {
                var o_rip = o_r1 - offset,
                    pdata = that.pdata,
                    data = that.get_p_data(),
                    rd = data[o_r1],
                    column = CM[o_ci];
                nui = {
                    rowData: rd,
                    rowIndx: o_r1,
                    colIndx: o_ci,
                    column: column,
                    rowIndxPage: o_rip
                };
                var mcRoot = mc[r1][ci],
                    colspan = mcRoot.colspan,
                    rowspan = mcRoot.rowspan,
                    fcVisible = calcVisibleColumns(CM, a_ci, fc),
                    frVisible = calcVisibleRows(pdata, a_r1 - offset, fr);
                if (fc && a_ci < fc && colspan > fcVisible) {
                    var colspan1 = colspan - calcVisibleColumns(CM, fc, initH),
                        colspan2 = fcVisible;
                    colspan = Math.max(colspan1, colspan2)
                } else {
                    colspan = colspan - calcVisibleColumns(CM, ci, a_ci)
                }
                if (fr && a_r1 > offset && a_r1 < fr_off && rowspan > frVisible) {
                    var rowspan1 = rowspan - calcVisibleRows(pdata, fr, initV),
                        rowspan2 = frVisible;
                    rowspan = Math.max(rowspan1, rowspan2)
                } else {
                    rowspan = rowspan - calcVisibleRows(data, r1, a_r1)
                }
                mcRoot.a_r1 = a_r1;
                mcRoot.a_c1 = a_ci;
                nui.rowspan = rowspan;
                nui.colspan = colspan;
                nui.style = mcRoot.style;
                nui.attr = mcRoot.attr;
                nui.cls = mcRoot.cls
            }
        }
        return nui ? nui : ui
    };
    _pMerge.getMergeCells = function(hcLen, curPage, dataLen) {
        var that = this.that,
            mcarr = that.options.mergeCells,
            mc, r1, c1, offset = that.riOffset,
            offset2 = offset + dataLen,
            arr = [],
            mcLen = mcarr ? mcarr.length : 0;
        for (var i = 0; i < mcLen; i++) {
            mc = mcarr[i];
            r1 = mc.r1;
            c1 = mc.c1;
            if (!curPage || r1 >= offset && r1 < offset2) {
                if (curPage) {
                    r1 -= offset
                }
                r1 += hcLen;
                arr.push({
                    r1: r1,
                    c1: c1,
                    r2: r1 + mc.rc - 1,
                    c2: c1 + mc.cc - 1
                })
            }
        }
        return arr
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    _pq.pqGrid.defaults.groupModel = {
        on: false,
        title: [],
        titleDefault: "{0} ({1})",
        header: true,
        headerMenu: true,
        menuItems: ["merge", "fixCols", "grandSummary"],
        fixCols: true,
        icon: ["ui-icon-triangle-1-se", "ui-icon-triangle-1-e"],
        dataIndx: [],
        collapsed: [],
        showSummary: [],
        calcSummary: [],
        summaryInTitleRow: "collapsed",
        summaryEdit: true,
        refreshOnChange: true
    };
    pq.aggregate = {
        sum: function(arr) {
            var s = 0,
                i = arr.length,
                val;
            while (i--) {
                val = arr[i];
                if (val != null) {
                    s += val - 0
                }
            }
            return s
        },
        avg: function(arr, column) {
            try {
                var avg = pq.formulas.AVERAGE(arr)
            } catch (ex) {
                avg = ex
            }
            return avg
        },
        flatten: function(arr) {
            return arr.filter(function(val) {
                return val != null
            })
        },
        max: function(arr, column) {
            var ret, dataType = column.dataType;
            arr = this.flatten(arr);
            if (dataType == "float" || dataType == "integer") {
                ret = Math.max.apply(Math, arr)
            } else if (dataType == "date") {
                arr.sort(function(a, b) {
                    a = Date.parse(a);
                    b = Date.parse(b);
                    return b - a
                });
                ret = arr[0]
            } else {
                arr.sort();
                ret = arr[arr.length - 1]
            }
            return ret
        },
        min: function(arr, column) {
            var ret, dataType = column.dataType,
                dateArr, dateO, i;
            arr = this.flatten(arr);
            if (dataType == "integer" || dataType == "float") {
                ret = Math.min.apply(Math, arr)
            } else if (dataType == "date") {
                i = arr.length;
                dateArr = [];
                while (i--) {
                    dateO = arr[i];
                    dateArr.push({
                        dateO: dateO,
                        dateP: Date.parse(dateO)
                    })
                }
                dateArr.sort(function(a, b) {
                    return a.dateP - b.dateP
                });
                ret = dateArr.length ? dateArr[0].dateO : undefined
            } else {
                arr.sort();
                ret = arr[0]
            }
            return ret
        },
        count: function(arr) {
            return this.flatten(arr).length
        },
        stdev: function(arr) {
            try {
                var v = pq.formulas.STDEV(arr)
            } catch (ex) {
                v = ex
            }
            return v
        },
        stdevp: function(arr) {
            try {
                var v = pq.formulas.STDEVP(arr)
            } catch (ex) {
                v = ex
            }
            return v
        }
    };
    var cGroup = _pq.cGroup = function(that) {
        var self = this;
        self.that = that;
        if (that.options.groupModel.on) {
            self.init()
        }
    };
    cGroup.beforeTrigger = function(evt, that) {
        return function(state) {
            return that._trigger("beforeGroupExpand", evt, state) === false
        }
    };
    cGroup.onGroupItemClick = function(self) {
        return function(evt) {
            var $target = $(evt.target),
                dataIndx = $(this).data("indx");
            if ($target.hasClass("pq-group-remove")) {
                self.removeGroup(dataIndx)
            } else {
                self.toggleLevel(dataIndx, evt)
            }
        }
    };

    function tmpl(arr, GM, option, o) {
        arr.push("<li data-option='", option, "' class='pq-menu-item'>", "<label>", "<input type='checkbox' ", GM[option] ? "checked" : "", "/>", o["strGroup_" + option], "</label></li>")
    }

    function findOffset(tree, l, rip, indx) {
        var _tree = tree[l],
            ripT, i = indx;
        if (!_tree) {
            return
        }
        do {
            ripT = _tree[i].rip;
            i++
        } while (ripT < rip);
        return i - 1
    }
    cGroup.prototype = {
        addGroup: function(dataIndx, indx) {
            var that = this.that,
                GM = that.options.groupModel,
                arr = GM.dataIndx = GM.dataIndx || [];
            if (dataIndx != null && $.inArray(dataIndx, arr) === -1) {
                if (indx == null) {
                    arr.push(dataIndx)
                } else {
                    arr.splice(indx, 0, dataIndx)
                }
                this._triggerChange = true;
                this.refreshFull()
            }
        },
        createHeader: function() {
            var self = this,
                that = self.that,
                $h = self.$header,
                o = that.options,
                BS = o.bootstrap,
                columns = that.columns,
                BS_on = BS.on,
                GM = o.groupModel,
                GMdataIndx = GM.dataIndx,
                len = GMdataIndx.length;
            while (len--) {
                if (columns[GMdataIndx[len]] == null) {
                    GMdataIndx.splice(len, 1)
                }
            }
            len = GMdataIndx.length;
            if (GM.header && GM.on) {
                if ($h) {
                    $h.empty()
                } else {
                    $h = self.$header = $("<div class='pq-group-header ui-helper-clearfix' ></div>").appendTo(that.$top);
                    $h.on("click", ".pq-group-item", cGroup.onGroupItemClick(self))
                }
                if (len) {
                    var arr = [];
                    for (var i = 0; i < len; i++) {
                        var dataIndx = GMdataIndx[i],
                            column = columns[dataIndx],
                            collapsed = GM.collapsed,
                            icon = BS_on ? BS.groupModel.icon : GM.icon,
                            cicon = collapsed[i] ? icon[1] : icon[0];
                        arr.push("<div tabindex='0' class='pq-group-item' data-indx='", dataIndx, "' >", "<span class='", self.toggleIcon, cicon, "' ></span>", column.pqtitle || (typeof column.title == "string" ? column.title : dataIndx), "<span class='", self.groupRemoveIcon, "' ></span></div>")
                    }
                    $h[0].innerHTML = arr.join("")
                }
                self.initHeader(o, GM)
            } else if ($h) {
                $h.remove();
                self.$header = null
            }
        },
        concat: function() {
            return function concat(ndata, arr2, titleRow) {
                arr2.forEach(function(rd) {
                    ndata.push(rd)
                });
                titleRow.pq_children = arr2;
                return ndata
            }
        },
        collapseTo: function(address) {
            this.expandTo(address, true)
        },
        editorSummary: function(o, GM) {
            var map = o.summaryOptions,
                self = this;
            return function(ui) {
                var rd = ui.rowData;
                if (rd.pq_gsummary || rd.pq_gtitle) {
                    var _aggr = pq.aggregate,
                        column = ui.column,
                        csummary = column.summary,
                        cs_edit = csummary ? csummary.edit : null,
                        inArray, dt = column.dataType,
                        allow, arr = [""];
                    if ($.inArray(ui.dataIndx, GM.dataIndx) > -1) {
                        return false
                    }
                    if (!GM.summaryEdit && !cs_edit || cs_edit === false) {
                        return false
                    }
                    if (dt == "integer" || dt == "float") {
                        dt = "number"
                    } else if (dt !== "date") {
                        dt = "string"
                    }
                    allow = map[dt].split(",");
                    inArray = $.inArray;
                    for (var key in _aggr) {
                        if (inArray(key, allow) > -1) {
                            arr.push(key)
                        }
                    }
                    if (arr.length == 1) {
                        return false
                    }
                    return {
                        type: "select",
                        prepend: GM.prepend,
                        options: GM.options || arr,
                        valueIndx: GM.valueIndx,
                        labelIndx: GM.labelIndx,
                        init: GM.init || self.editorInit,
                        getData: GM.getData || self.editorGetData
                    }
                }
            }
        },
        editorInit: function(ui) {
            var summary = ui.column.summary,
                type;
            if (!summary) {
                summary = ui.column.summary = {}
            }
            type = summary.type;
            ui.$cell.find("select").val(type)
        },
        editorGetData: function(ui) {
            var column = ui.column,
                dt = column.dataType,
                val = ui.$cell.find("select").val();
            column.summary.type = val;
            this.one("beforeValidate", function(evt, ui) {
                ui.allowInvalid = true;
                ui.track = false;
                ui.history = false;
                column.dataType = "string";
                this.one(true, "change", function(evt, ui) {
                    column.dataType = dt
                })
            });
            return val
        },
        expandTo: function(address, _close) {
            var that = this.that,
                close = !!_close,
                indices = address.split(","),
                len = indices.length,
                tree = this.tree,
                rip, rd, rdFinal, offset = 0,
                node, indx, data = that.pdata;
            if (len > tree.length) {
                return
            }
            for (var l = 0; l < len; l++) {
                indx = indices[l] * 1 + offset;
                node = tree[l][indx];
                if (!node) {
                    if (l == 0) {
                        return
                    }
                    break
                }
                rip = node.rip;
                if (!close || close && l == len - 1) {
                    rd = data[rip];
                    if (rd.pq_close != close) {
                        rdFinal = rd;
                        rd.pq_close = close
                    }
                }
                offset = findOffset(tree, l + 1, rip, indx)
            }
            if (rdFinal) {
                if (that._trigger("group", null, {
                        indx: indx,
                        close: close
                    }) !== false) {
                    this.saveState(true)
                }
            }
        },
        collapseAll: function(level) {
            this.expandAll(level, true)
        },
        expandAll: function(level, close) {
            if (this.trigger({
                    all: true,
                    close: !!close,
                    level: level || 0
                }) !== false) {
                this.that.refreshView()
            }
        },
        collapse: function(level) {
            this.expand(level, true)
        },
        expand: function(level, close) {
            if (this.trigger({
                    close: !!close,
                    level: level || 0
                }) !== false) {
                this.that.refreshView()
            }
        },
        firstCol: function() {
            return this.that.colModel.find(function(col) {
                return !col.hidden
            })
        },
        flatten: function(columns, group, GM, summary) {
            var GMDataIndx = GM.dataIndx,
                titleInFirstCol = GM.titleInFirstCol,
                diFirstCol = titleInFirstCol ? this.firstCol().dataIndx : null,
                concat = this.concat(),
                tree = this.tree = [],
                GMLen = GMDataIndx.length,
                ndata = [];
            return function flatten(data, _level, parent) {
                if (!GMLen) {
                    return data
                }
                var level = _level || 0,
                    di = GMDataIndx[level],
                    collapsed = GM.collapsed[level],
                    calcSummary = GM.calcSummary[level] !== false,
                    showSummary = GM.showSummary[level],
                    _tree = tree[level] = tree[level] || [],
                    arr = group(data, di, columns[di]);
                arr.forEach(function(_arr) {
                    var titleRow, arr2 = _arr[1],
                        summaryRow = showSummary ? {
                            pq_gsummary: true,
                            pq_level: level,
                            pq_rowcls: "pq-summary-row"
                        } : 0,
                        items = arr2.length,
                        rip = ndata.length;
                    titleRow = {
                        pq_gtitle: true,
                        pq_level: level,
                        pq_close: collapsed,
                        pq_items: items,
                        pq_children: []
                    };
                    titleRow[titleInFirstCol ? diFirstCol : di] = _arr[0];
                    ndata.push(titleRow);
                    parent && parent.push(titleRow);
                    calcSummary && summary(arr2, titleRow, summaryRow);
                    if (level + 1 < GMLen) {
                        flatten(arr2, level + 1, titleRow.pq_children)
                    } else {
                        ndata = concat(ndata, arr2, titleRow)
                    }
                    summaryRow && ndata.push(summaryRow);
                    _tree.push({
                        rip: rip,
                        rip2: ndata.length
                    })
                });
                return ndata
            }
        },
        getVal: function(ignoreCase) {
            var trim = $.trim;
            return function(rd, dataIndx, column) {
                var val = rd[dataIndx],
                    chg = column.groupChange;
                if (chg) {
                    chg = pq.getFn(chg);
                    return chg(val)
                } else {
                    val = trim(val);
                    return ignoreCase ? val.toUpperCase() : val
                }
            }
        },
        getSumCols: function() {
            return this._sumCols
        },
        getSumDIs: function() {
            return this._sumDIs
        },
        group: function(getVal) {
            return function group(data, di, column) {
                var obj = {},
                    arr = [];
                data.forEach(function(rd) {
                    rd.pq_hidden = undefined;
                    var title = getVal(rd, di, column),
                        indx = obj[title];
                    if (indx == null) {
                        obj[title] = indx = arr.length;
                        arr[indx] = [title, []]
                    }
                    arr[indx][1].push(rd)
                });
                return arr
            }
        },
        groupData: function() {
            var self = this,
                that = self.that,
                o = that.options,
                GM = o.groupModel,
                getVal = self.getVal(GM.ignoreCase),
                GMdataIndx = GM.dataIndx,
                pdata = that.pdata,
                columns = that.columns,
                arr = this.setSumCols(GMdataIndx),
                summaryFn = this.summary(arr[0], arr[1]);
            if (GM.grandSummary) {
                var grandSummaryRow = {
                    pq_grandsummary: true,
                    pq_gsummary: true
                };
                summaryFn(pdata, grandSummaryRow);
                self.summaryData = o.summaryData = [grandSummaryRow]
            } else {
                self.summaryData.length = 0
            }
            that.pdata = this.flatten(columns, this.group(getVal), GM, summaryFn)(pdata)
        },
        init: function() {
            var self = this,
                o, GM, BS, BS_on, base_icon, that;
            if (!self._init) {
                self.mc = [];
                self.tree = [];
                self.summaryData = [];
                that = self.that;
                o = that.options;
                GM = o.groupModel;
                BS = o.bootstrap;
                BS_on = BS.on;
                base_icon = BS_on ? "glyphicon " : "ui-icon ";
                self.groupRemoveIcon = "pq-group-remove " + base_icon + (BS_on ? "glyphicon-remove" : "ui-icon-close");
                self.toggleIcon = "pq-group-toggle " + base_icon;
                that.on("cellClick", self.onCellClick(self)).on("cellKeyDown", self.onCellKeyDown(self, GM)).on(true, "cellMouseDown", self.onCellMouseDown()).on("change", self.onChange(self, GM)).on("dataReady", self.onDataReady(self, that)).on("columnDragDone", self.onColumnDrag(self)).on("columnOrder", self.onColumnOrder(self, GM));
                self._init = true
            }
        },
        initHeadSortable: function() {
            var self = this,
                that = self.that,
                $h = self.$header,
                o = that.options;
            $h.sortable({
                axis: "x",
                distance: 3,
                tolerance: "pointer",
                cancel: ".pq-group-menu",
                stop: self.onSortable(self, o)
            })
        },
        initHeadDroppable: function() {
            var self = this,
                that = self.that,
                $h = self.$header;
            if ($h) {
                $h.droppable({
                    accept: function($td) {
                        var colIndxDrag = $td.attr("pq-col-indx") * 1;
                        if (isNaN(colIndxDrag) || !that.colModel[colIndxDrag]) {
                            return
                        }
                        return self.acceptDrop
                    },
                    tolerance: "pointer",
                    hoverClass: "pq-drop-hover",
                    drop: self.onDrop(that, self)
                });
                self.acceptDrop = true
            }
        },
        initHeader: function(o, GM) {
            var self = this;
            if (self.$header) {
                var $h = self.$header,
                    $items = $h.find(".pq-group-item");
                if ($h.data("uiSortable")) {} else {
                    self.initHeadSortable()
                }
                if (!$items.length) {
                    $h.append("<span class='pq-group-placeholder'>" + o.strGroup_header + "</span>")
                }
                if (GM.headerMenu) {
                    self.initHeaderMenu()
                }
            }
        },
        initHeaderMenu: function() {
            var self = this,
                that = self.that,
                BS_on = that.BS_on,
                o = that.options,
                $h = self.$header,
                arr = ["<ul class='pq-group-menu'><li>", BS_on ? "<span class='glyphicon glyphicon-chevron-left'></span>" : "", "<ul>"],
                GM = o.groupModel,
                menuItems = GM.menuItems,
                $menu;
            for (var i = 0, len = menuItems.length; i < len; i++) {
                tmpl(arr, GM, menuItems[i], o)
            }
            arr.push("</ul></li></ul>");
            $menu = $(arr.join("")).appendTo($h);
            $menu.menu({
                icons: {
                    submenu: "ui-icon-carat-1-w"
                },
                position: {
                    my: "right top",
                    at: "left top"
                }
            });
            $menu.change(function(evt) {
                if (evt.target.nodeName == "INPUT") {
                    var $target = $(evt.target),
                        option = $target.closest("li").data("option"),
                        ui = {};
                    ui[option] = !o.groupModel[option];
                    self.option(ui)
                }
            })
        },
        initmerge: function() {
            var that = this.that,
                o = that.options,
                GM = o.groupModel,
                GMdataIndx = GM.dataIndx,
                colIndxs = that.colIndxs,
                merge = GM.merge,
                summaryInTitleRow = GM.summaryInTitleRow,
                titleInFirstCol = GM.titleInFirstCol,
                tree = this.tree,
                offset = that.riOffset,
                _tree, node, ci, rip, rip2, items, ri, rd, CMLength = that.colModel.length,
                mc = [],
                pdata = that.pdata;
            for (var lev = 0; lev < tree.length; lev++) {
                _tree = tree[lev];
                ci = colIndxs[GMdataIndx[lev]];
                for (var i = 0, len = _tree.length; i < len; i++) {
                    node = _tree[i];
                    rip = node.rip;
                    if (rip == null) {
                        break
                    }
                    if (merge) {
                        rip2 = node.rip2;
                        items = rip2 - rip;
                        ri = rip + offset;
                        mc.push({
                            r1: ri,
                            rc: items,
                            c1: ci,
                            cc: 1
                        })
                    } else {
                        ri = rip + offset;
                        rd = pdata[rip];
                        if (!summaryInTitleRow || !rd.pq_close && summaryInTitleRow === "collapsed") {
                            mc.push({
                                r1: ri,
                                rc: 1,
                                c1: titleInFirstCol ? 0 : ci,
                                cc: CMLength
                            })
                        }
                    }
                }
            }
            if (mc.length) {
                this.mc = o.mergeCells = mc;
                that.iMerge.init()
            } else if (this.mc.length) {
                this.mc.length = 0;
                that.iMerge.init()
            }
        },
        initcollapsed: function() {
            var that = this.that,
                GM = that.options.groupModel,
                merge = GM.merge,
                o_pdata = this.pdata,
                pdata = that.pdata,
                rowData, pq_gtitle, o_rd, o_collapsed, level, collapsed;
            if (!pdata) {
                return
            }
            for (var i = 0, len = pdata.length; i < len; i++) {
                rowData = pdata[i];
                pq_gtitle = rowData.pq_gtitle;
                if (pq_gtitle !== undefined) {
                    level = rowData.pq_level;
                    collapsed = null;
                    if (o_pdata) {
                        o_rd = o_pdata[i];
                        o_collapsed = o_rd ? o_rd.pq_close : null;
                        if (o_collapsed != null) {
                            collapsed = rowData.pq_close = o_collapsed
                        }
                    }
                    if (collapsed == null) {
                        collapsed = rowData.pq_close
                    }
                    if (collapsed) {
                        this.showHideRows(i + 1, level, GM)
                    } else if (merge) {
                        rowData.pq_hidden = true
                    }
                }
            }
            delete this.pdata
        },
        onCellClick: function(self) {
            return function(evt, ui) {
                if (ui.rowData.pq_gtitle && $(evt.originalEvent.target).hasClass("pq-group-icon")) {
                    self.toggleRow(ui.rowIndxPage, evt)
                }
            }
        },
        onCellMouseDown: function() {
            return function(evt, ui) {
                if (ui.rowData.pq_gtitle && $(evt.originalEvent.target).hasClass("pq-group-icon")) {
                    evt.stopImmediatePropagation()
                }
            }
        },
        onCellKeyDown: function(self, GM) {
            return function(evt, ui) {
                if (ui.rowData.pq_gtitle) {
                    if ($.inArray(ui.dataIndx, GM.dataIndx) >= 0 && evt.keyCode == $.ui.keyCode.ENTER) {
                        self.toggleRow(ui.rowIndxPage, evt);
                        return false
                    }
                }
            }
        },
        onChange: function(self, GM) {
            return function() {
                self.saveState(GM.refreshOnChange)
            }
        },
        onColumnDrag: function(self) {
            return function(evt, ui) {
                var col = ui.column,
                    CM = col.colModel;
                if (CM && CM.length || col.groupable === false) {
                    self.acceptDrop = false
                } else {
                    self.initHeadDroppable()
                }
            }
        },
        onDrop: function(that, self) {
            return function(evt, ui) {
                var colIndxDrag = ui.draggable.attr("pq-col-indx") * 1,
                    dataIndx = that.colModel[colIndxDrag].dataIndx;
                self.addGroup(dataIndx);
                self.acceptDrop = false
            }
        },
        onSortable: function(self, o) {
            return function() {
                var arr = [],
                    GM = o.groupModel,
                    GMDataIndx = GM.dataIndx,
                    refresh, $items = $(this).find(".pq-group-item"),
                    $item, dataIndx, i = 0;
                for (; i < $items.length; i++) {
                    $item = $($items[i]);
                    dataIndx = $item.data("indx");
                    if (GMDataIndx[i] !== dataIndx) {
                        refresh = true
                    }
                    arr.push(dataIndx)
                }
                if (refresh) {
                    GM.dataIndx = arr;
                    self._triggerChange = true;
                    self.refreshFull()
                }
            }
        },
        onDataReady: function(self, that) {
            return function() {
                self.tree.length = 0;
                var GM = that.options.groupModel,
                    GMLen = GM.dataIndx.length;
                if (GM.on) {
                    if (GMLen || GM.grandSummary) {
                        self.groupData();
                        self.refreshColumns();
                        if (GMLen) {
                            self.initcollapsed();
                            self.initmerge()
                        }
                    }
                }
                self.createHeader()
            }
        },
        onColumnOrder: function(self, GM) {
            return function() {
                if (GM.titleInFirstCol) {
                    self.refreshFull();
                    return false
                } else {
                    self.initmerge()
                }
            }
        },
        option: function(ui, refresh) {
            var di = ui.dataIndx,
                that = this.that,
                diLength = di ? di.length : 0,
                iGV = this,
                o = that.options,
                GM = o.groupModel,
                GMdataIndx = GM.dataIndx,
                on = ui.on || ui.on == null && GM.on;
            if (on) {
                iGV.init()
            }
            if (GM.on && GMdataIndx.length && (ui.on === false || diLength === 0)) {
                iGV.showRows()
            }
            $.extend(GM, ui);
            iGV.setOption();
            if (refresh !== false) {
                that.refreshView()
            }
        },
        showRows: function() {
            this.that.options.dataModel.data.forEach(function(rd) {
                if (rd.pq_hidden) {
                    rd.pq_hidden = undefined
                }
            })
        },
        renderCell: function(o, GM) {
            var renderTitle = this.renderTitle(o, GM),
                renderSummary = this.renderSummary(o);
            return function(column, isTitle) {
                column._render = column._renderG = function(ui) {
                    var rd = ui.rowData,
                        gtitle = rd.pq_gtitle;
                    if (isTitle && gtitle) {
                        return renderTitle(ui)
                    } else if (gtitle || rd.pq_gsummary) {
                        return renderSummary(ui)
                    }
                }
            }
        },
        renderSummary: function(o) {
            var that = this.that;
            return function(ui) {
                var rd = ui.rowData,
                    val, column = ui.column,
                    summary = column.summary,
                    type, title;
                if (summary && (type = summary.type)) {
                    title = o.summaryTitle[type];
                    if (typeof title == "function") {
                        return title.call(that, ui)
                    } else {
                        val = ui.formatVal;
                        if (val == null) {
                            val = ui.cellData;
                            val = val == null ? "" : val
                        }
                        if (typeof val == "number" && !column.format && parseInt(val) !== val) {
                            val = val.toFixed(2)
                        }
                        if (title) {
                            return title.replace("{0}", val)
                        } else {
                            return val
                        }
                    }
                }
            }
        },
        renderTitle: function(o, GM) {
            var that = this.that,
                BS = o.bootstrap,
                indent = GM.indent || 0,
                bts_on = BS.on,
                icon = bts_on ? BS.groupModel.icon : GM.icon,
                icons = bts_on ? ["glyphicon " + icon[0], "glyphicon " + icon[1]] : ["ui-icon " + icon[0], "ui-icon " + icon[1]];
            return function(ui) {
                var rd = ui.rowData,
                    collapsed, level, title, indx;
                if (ui.cellData != null) {
                    collapsed = rd.pq_close;
                    level = rd.pq_level;
                    title = GM.title;
                    title = title[level] || GM.titleDefault;
                    title = typeof title === "function" ? title.call(that, ui) : title.replace("{0}", ui.cellData).replace("{1}", rd.pq_items);
                    indx = collapsed ? 1 : 0;
                    return {
                        text: (ui.Export ? "" : "<span style='margin-left:" + indent * level + "px;' class='pq-group-icon " + icons[indx] + "'></span>") + title,
                        cls: "pq-group-title-cell",
                        style: "text-align:left;"
                    }
                }
            }
        },
        removeGroup: function(dataIndx) {
            var self = this,
                that = self.that,
                i = 0,
                GM = that.options.groupModel,
                groupIndx = GM.dataIndx;
            for (; i < groupIndx.length; i++) {
                if (dataIndx === groupIndx[i]) {
                    groupIndx.splice(i, 1);
                    break
                }
            }
            if (!groupIndx.length) {
                self.showRows();
                self.mc.length = 0
            }
            self._triggerChange = true;
            self.refreshFull()
        },
        refreshColumns: function() {
            var that = this.that,
                o = that.options,
                GM = o.groupModel,
                GM_on = GM.on,
                fixCols = GM.fixCols,
                renderCell = this.renderCell(o, GM),
                column, csummary, groupIndx = GM.dataIndx,
                groupIndxLen = groupIndx.length,
                colIndx, CM = that.colModel,
                i = CM.length;
            while (i--) {
                column = CM[i];
                if (column._renderG) {
                    delete column._render;
                    delete column._renderG
                }
                if (column._nodrag) {
                    delete column._nodrag;
                    delete column._nodrop
                }
                if (GM_on && (csummary = column.summary) && csummary.type) {
                    renderCell(column)
                }
            }
            o.geditor = GM_on ? this.editorSummary(o, GM) : undefined;
            if (GM_on) {
                if (GM.titleInFirstCol) {
                    column = this.firstCol();
                    renderCell(column, true)
                } else {
                    for (i = groupIndxLen - 1; i >= 0; i--) {
                        column = that.getColumn({
                            dataIndx: groupIndx[i]
                        });
                        renderCell(column, true)
                    }
                }
            }
            if (fixCols && GM_on) {
                for (i = 0; i < groupIndxLen; i++) {
                    colIndx = that.getColIndx({
                        dataIndx: groupIndx[i]
                    });
                    column = CM[colIndx];
                    column._nodrag = column._nodrop = true;
                    if (colIndx != i) {
                        that.iDragColumns.moveColumn(colIndx, i, true);
                        that.iColModel.init()
                    }
                }
            }
        },
        refreshFull: function() {
            var that = this.that;
            if (this._triggerChange) {
                that._trigger("groupChange");
                this._triggerChange = false
            }
            that.refreshView()
        },
        refreshView: function() {
            this.that.refreshView()
        },
        showHideRows: function(initIndx, level, GM) {
            var that = this.that,
                rd, hide = true,
                data = that.pdata;
            for (var i = initIndx, len = data.length; i < len; i++) {
                rd = data[i];
                if (rd.pq_gsummary) {
                    if (GM.merge || GM.summaryInTitleRow) {
                        if (rd.pq_level >= level) {
                            rd.pq_hidden = hide
                        }
                    } else {
                        if (rd.pq_level > level) {
                            rd.pq_hidden = hide
                        }
                    }
                } else if (rd.pq_gtitle) {
                    if (rd.pq_level <= level) {
                        break
                    } else {
                        rd.pq_hidden = hide
                    }
                } else {
                    rd.pq_hidden = hide
                }
            }
        },
        saveState: function(refresh) {
            var that = this.that,
                GM = that.options.groupModel;
            if (GM.on && GM.dataIndx.length) {
                var pdata = that.pdata,
                    len = pdata.length,
                    ndata = new Array(len),
                    i = 0;
                for (; i < len; i++) {
                    ndata[i] = pdata[i]
                }
                this.pdata = ndata;
                if (refresh) {
                    that.refreshView()
                }
            }
        },
        setSumCols: function(GMdataIndx) {
            var inArray = $.inArray,
                sumCols = [],
                sumDIs = [];
            this.that.colModel.forEach(function(column) {
                var summary = column.summary,
                    di;
                if (summary && summary.type) {
                    di = column.dataIndx;
                    if (inArray(di, GMdataIndx) === -1) {
                        sumCols.push(column);
                        sumDIs.push(di)
                    }
                }
            });
            this._sumCols = sumCols;
            this._sumDIs = sumDIs;
            return [sumCols, sumDIs]
        },
        summary: function(sumCols, sumDIs) {
            var pq_aggr = pq.aggregate,
                stype = sumCols.map(function(col) {
                    return col.summary.type
                });
            return function summary(arr2, titleRow, summaryRow) {
                sumDIs.forEach(function(di, i) {
                    var cells = [],
                        summaryCell;
                    arr2.forEach(function(rd, j) {
                        cells[j] = rd[di]
                    });
                    summaryCell = pq_aggr[stype[i]](cells, sumCols[i]);
                    titleRow[di] == null && (titleRow[di] = summaryCell);
                    summaryRow && (summaryRow[di] = summaryCell)
                })
            }
        },
        setOption: function() {
            var self = this;
            if (self._init) {
                self.refreshColumns();
                self.summaryData.length = 0;
                self.tree.length = 0;
                self.initmerge()
            }
        },
        toggleLevel: function(dataIndx, evt) {
            var GM = this.that.options.groupModel,
                collapsed = GM.collapsed,
                level = $.inArray(dataIndx, GM.dataIndx),
                all = evt.ctrlKey ? "All" : "",
                close = collapsed[level];
            this[(close ? "expand" : "collapse") + all](level)
        },
        trigger: function(ui) {
            var evt = ui.evt,
                rd = ui.rd,
                _level = ui.level,
                all = ui.all,
                close = ui.close,
                that = this.that,
                level, di, val, i, GM = that.options.groupModel,
                groupIndx = GM.dataIndx,
                collapsed = GM.collapsed,
                _before = cGroup.beforeTrigger(evt, that),
                state = {};
            if (rd) {
                level = rd.pq_level;
                di = groupIndx[level], val = rd[di];
                close = !rd.pq_close;
                state = {
                    level: level,
                    close: close,
                    group: val
                };
                if (_before(state)) {
                    return false
                }
                rd.pq_close = close
            } else if (all) {
                state = {
                    all: true,
                    close: close,
                    level: _level
                };
                if (_before(state)) {
                    return false
                }
                for (i = _level; i < groupIndx.length; i++) {
                    collapsed[i] = close
                }
            } else if (_level != null) {
                state = {
                    level: _level,
                    close: close
                };
                if (_before(state)) {
                    return false
                }
                collapsed[_level] = close
            }
            return that._trigger("group", null, state)
        },
        toggleRow: function(rip, evt) {
            var that = this.that,
                pdata = that.pdata,
                rd = pdata[rip];
            if (this.trigger({
                    evt: evt,
                    rd: rd
                }) !== false) {
                this.saveState(true)
            }
        }
    };
    var fn = _pq.pqGrid.prototype;
    fn.Group = function(ui) {
        var iGV = this.iGroup;
        if (ui == null) {
            return iGV
        } else {
            iGV.expandTo(ui.indx)
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    $(document).on("pqGrid:bootup", function(evt, ui) {
        var grid = ui.instance;
        grid.iFillHandle = new cFillHandle(grid)
    });
    _pq.pqGrid.defaults.fillHandle = "all";
    _pq.pqGrid.defaults.autofill = true;
    var cFillHandle = _pq.cFillHandle = function(that) {
        var self = this;
        self.$wrap;
        self.locked;
        self.sel;
        self.that = that;
        that.on("selectChange", self.onSelectChange(self)).on("selectEnd", self.onSelectEnd(self)).on("refresh refreshRow resizeTable", self.onRefresh(self))
    };
    cFillHandle.prototype = {
        onSelectChange: function(self) {
            return function() {
                this.options.fillHandle && self.create()
            }
        },
        onSelectEnd: function(self) {
            return function() {
                if (this.options.fillHandle) {
                    self.setDraggable();
                    self.setDoubleClickable()
                }
            }
        },
        onRefresh: function(self) {
            var id;
            return function() {
                if (this.options.fillHandle) {
                    clearTimeout(id);
                    id = setTimeout(function() {
                        if (self.that.element) {
                            self.create();
                            self.setDraggable()
                        }
                    }, 50)
                }
            }
        },
        remove: function() {
            var $wrap = this.$wrap;
            $wrap && $wrap.remove()
        },
        create: function() {
            var self = this;
            if (self.locked) return;
            self.remove();
            var that = self.that,
                area = that.Selection().address();
            if (area.length !== 1) return;
            var area = area[0],
                r2 = area.r2,
                c2 = area.c2,
                ui = {
                    rowIndx: r2,
                    colIndx: c2
                },
                iM = that.iMerge,
                isMerged = iM.ismergedCell(r2, c2),
                uiM_a = isMerged ? iM.getRootCell(r2, c2, "a") : ui,
                $td = that.getCell(uiM_a);
            if (!$td.length) return;
            if (that._trigger("beforeFillHandle", null, that.normalize(uiM_a)) !== false) {
                var td = $td[0],
                    $cont = $td.closest(".pq-grid-cont-inner"),
                    cont = $cont[0],
                    topCont = cont.offsetTop,
                    leftCont = cont.offsetLeft,
                    left = td.offsetLeft + td.offsetWidth - 8 - leftCont,
                    top = td.offsetTop + td.offsetHeight - 8 - topCont,
                    $wrap = $("<div class='pq-fill-handle'></div>").appendTo($cont);
                $wrap.css({
                    position: "absolute",
                    top: top,
                    left: left,
                    height: 10,
                    width: 10,
                    background: "#333",
                    cursor: "crosshair",
                    border: "2px solid #fff"
                });
                self.$wrap = $wrap
            }
        },
        setDoubleClickable: function() {
            var self = this,
                $wrap = self.$wrap;
            $wrap && $wrap.on("dblclick", self.onDblClick(self.that, self))
        },
        setDraggable: function() {
            var self = this,
                $wrap = self.$wrap,
                $cont = self.that.$cont;
            $wrap && $wrap.draggable({
                helper: function() {
                    return "<div style='height:10px;width:10px;cursor:crosshair;'></div>"
                },
                appendTo: $cont,
                start: function() {
                    self.onStart()
                },
                drag: function(evt) {
                    self.onDrag(evt)
                },
                stop: function() {
                    self.onStop()
                }
            })
        },
        patternDate: function(a) {
            var self = this;
            return function(x) {
                var dateObj = new Date(a);
                dateObj.setDate(dateObj.getDate() + (x - 1));
                return self.formatDate(dateObj)
            }
        },
        formatDate: function(dateObj) {
            return dateObj.getMonth() + 1 + "/" + dateObj.getDate() + "/" + dateObj.getFullYear()
        },
        patternDate2: function(c0, c1) {
            var d0 = new Date(c0),
                d1 = new Date(c1),
                diff, self = this,
                incrDate = d1.getDate() - d0.getDate(),
                incrMonth = d1.getMonth() - d0.getMonth(),
                incrYear = d1.getFullYear() - d0.getFullYear();
            if (!incrMonth && !incrYear || !incrDate && !incrMonth || !incrYear && !incrDate) {
                return function(x) {
                    var dateObj = new Date(c0);
                    if (incrDate) {
                        dateObj.setDate(dateObj.getDate() + incrDate * (x - 1))
                    } else if (incrMonth) {
                        dateObj.setMonth(dateObj.getMonth() + incrMonth * (x - 1))
                    } else {
                        dateObj.setFullYear(dateObj.getFullYear() + incrYear * (x - 1))
                    }
                    return self.formatDate(dateObj)
                }
            }
            d0 = Date.parse(d0);
            diff = Date.parse(d1) - d0;
            return function(x) {
                var dateObj = new Date(d0 + diff * (x - 1));
                return self.formatDate(dateObj)
            }
        },
        pattern: function(cells, dt) {
            if (!(dt == "date" || dt == "integer" || dt == "float")) {
                return
            }
            var a, b, c, len = cells.length,
                date = dt === "date";
            if (len === 1) {
                a = cells[0];
                return date ? this.patternDate(a) : function(x) {
                    return a + (x - 1)
                }
            }
            if (len === 2) {
                if (date) {
                    return this.patternDate2(cells[0], cells[1])
                }
                a = cells[1] - cells[0];
                b = cells[0] - a;
                return function(x) {
                    return a * x + b
                }
            }
            if (len === 3) {
                a = (cells[2] - 2 * cells[1] + cells[0]) / 2;
                b = cells[1] - cells[0] - 3 * a;
                c = cells[0] - a - b;
                return function(x) {
                    return a * x * x + b * x + c
                }
            }
            return false
        },
        autofillVal: function(sel1, sel2, patternArr, xDir) {
            var that = this.that,
                r1 = sel1.r1,
                c1 = sel1.c1,
                r2 = sel1.r2,
                c2 = sel1.c2,
                r21 = sel2.r1,
                c21 = sel2.c1,
                r22 = sel2.r2,
                c22 = sel2.c2,
                val = [],
                k, i, j, sel3, x;
            if (xDir) {
                sel3 = {
                    r1: r1,
                    r2: r2
                };
                sel3.c1 = c21 < c1 ? c21 : c2 + 1;
                sel3.c2 = c21 < c1 ? c1 - 1 : c22;
                x = c21 - c1;
                for (i = c21; i <= c22; i++) {
                    x++;
                    if (i < c1 || i > c2) {
                        k = 0;
                        for (j = r1; j <= r2; j++) {
                            val.push(patternArr[k](x, i));
                            k++
                        }
                    }
                }
            } else {
                sel3 = {
                    c1: c1,
                    c2: c2
                };
                sel3.r1 = r21 < r1 ? r21 : r2 + 1;
                sel3.r2 = r21 < r1 ? r1 - 1 : r22;
                x = r21 - r1;
                for (i = r21; i <= r22; i++) {
                    x++;
                    if (i < r1 || i > r2) {
                        k = 0;
                        for (j = c1; j <= c2; j++) {
                            val.push(patternArr[k](x, i));
                            k++
                        }
                    }
                }
            }
            that.Range(sel3).value(val);
            return true
        },
        autofill: function(sel1, sel2) {
            var that = this.that,
                CM = that.colModel,
                col, dt, cells, di, i, j, obj, data = that.get_p_data(),
                pattern, patternArr = [],
                r1 = sel1.r1,
                c1 = sel1.c1,
                r2 = sel1.r2,
                c2 = sel1.c2,
                xDir = sel2.c1 != c1 || sel2.c2 != c2;
            if (xDir) {
                for (i = r1; i <= r2; i++) {
                    obj = {
                        sel: {
                            r: i,
                            c: c1
                        },
                        x: true
                    };
                    that._trigger("autofillSeries", null, obj);
                    if (pattern = obj.series) {
                        patternArr.push(pattern)
                    } else {
                        return
                    }
                }
                return this.autofillVal(sel1, sel2, patternArr, xDir)
            } else {
                for (j = c1; j <= c2; j++) {
                    col = CM[j];
                    dt = col.dataType;
                    di = col.dataIndx;
                    cells = [];
                    for (i = r1; i <= r2; i++) {
                        cells.push(data[i][di])
                    }
                    obj = {
                        cells: cells,
                        sel: {
                            r1: r1,
                            c: j,
                            r2: r2,
                            r: r1
                        }
                    };
                    that._trigger("autofillSeries", null, obj);
                    if (pattern = obj.series || this.pattern(cells, dt)) {
                        patternArr.push(pattern)
                    } else {
                        return
                    }
                }
                return this.autofillVal(sel1, sel2, patternArr)
            }
        },
        onStop: function() {
            var self = this,
                that = self.that,
                autofill = that.options.autofill,
                sel1 = self.sel,
                sel2 = that.Selection().address()[0];
            if (sel1.r1 != sel2.r1 || sel1.c1 != sel2.c1 || sel1.r2 != sel2.r2 || sel1.c2 != sel2.c2) {
                self.locked = false;
                if (!(autofill && self.autofill(sel1, sel2))) {
                    that.Range(sel1).copy({
                        dest: sel2
                    })
                }
            }
        },
        onStart: function() {
            this.locked = true;
            this.sel = this.that.Selection().address()[0]
        },
        onDrag: function(evt) {
            var self = this,
                that = self.that,
                fillHandle = that.options.fillHandle,
                all = fillHandle == "all",
                hor = all || fillHandle == "horizontal",
                vert = all || fillHandle == "vertical",
                x = evt.clientX - 10,
                y = evt.clientY,
                ele = document.elementFromPoint(x, y),
                $td = $(ele).closest(".pq-grid-cell");
            if ($td.length) {
                var cord = that.getCellIndices({
                        $td: $td
                    }),
                    sel = self.sel,
                    r1 = sel.r1,
                    c1 = sel.c1,
                    r2 = sel.r2,
                    c2 = sel.c2,
                    range = {
                        r1: r1,
                        c1: c1,
                        r2: r2,
                        c2: c2
                    },
                    update = function(key, val) {
                        range[key] = val;
                        that.Range(range).select()
                    },
                    ri = cord.rowIndx,
                    ci = cord.colIndx;
                if (all && ri <= r2 && ri >= r1 || hor && !vert) {
                    if (ci > c2) {
                        update("c2", ci)
                    } else if (ci < c1) {
                        update("c1", ci)
                    }
                } else if (vert) {
                    if (ri > r2) {
                        update("r2", ri)
                    } else if (ri < r1) {
                        update("r1", ri)
                    }
                }
            }
        },
        onDblClick: function(that, self) {
            return function() {
                var o = that.options,
                    fillHandle = o.fillHandle;
                if (fillHandle == "all" || fillHandle == "vertical") {
                    var sel = that.Selection().address()[0],
                        rd, c2 = sel.c2,
                        ri = sel.r2 + 1,
                        data = o.dataModel.data,
                        di = that.getColModel()[c2].dataIndx;
                    while (rd = data[ri]) {
                        if (rd[di] == null || rd[di] === "") {
                            ri++
                        } else {
                            ri--;
                            break
                        }
                    }
                    self.onStart();
                    that.Range({
                        r1: sel.r1,
                        c1: sel.c1,
                        r2: ri,
                        c2: c2
                    }).select();
                    self.onStop()
                }
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    $(document).on("pqGrid:bootup", function(evt, ui) {
        new cScroll(ui.instance)
    });
    var cScroll = _pq.cScroll = function(that) {
        var self = this,
            $doc = $(document),
            ns = ".pqgrid-csroll";
        self.that = that;
        that.one("refresh", self.oneRefresh(that, self, $doc, ns))
    };
    _pq.cScroll = cScroll;
    var _p = cScroll.prototype;
    _p.oneRefresh = function(that, self, $doc, ns) {
        return function() {
            that.$cont.on("mousedown", function(evt) {
                if (!$(evt.target).closest(".pq-sb").length) {
                    $doc.on("mousemove" + ns, function(evt) {
                        self.onMouseDrag(evt)
                    });
                    $doc.on("mouseup" + ns, function() {
                        $doc.off(ns)
                    })
                }
            })
        }
    };
    _p.onMouseDrag = function(evt) {
        var self = this,
            that = self.that,
            $cont = that.$cont,
            cont_ht = $cont[0].offsetHeight,
            cont_wd = $cont[0].offsetWidth,
            off = $cont.offset(),
            cont_top = off.top,
            cont_left = off.left,
            cont_bot = cont_top + cont_ht,
            cont_right = cont_left + cont_wd,
            pageY = evt.pageY,
            pageX = evt.pageX,
            diffY = pageY - cont_bot,
            diffX = pageX - cont_right,
            diffY2 = cont_top - pageY,
            diffX2 = cont_left - pageX;
        if (pageX > cont_left && pageX < cont_right && (diffY > 0 || diffY2 > 0)) {
            if (diffY > 0) {
                self.scrollV(diffY, true)
            } else if (diffY2 > 0) {
                self.scrollV(diffY2)
            }
        } else if (pageY > cont_top && pageY < cont_bot) {
            if (diffX > 0) {
                self.scrollH(diffX, true)
            } else if (diffX2 > 0) {
                self.scrollH(diffX2)
            }
        }
    };
    _p.scrollH = function(diff, down) {
        var self = this,
            virtualX = self.that.options.virtualX;
        self[virtualX ? "scrollVirtual" : "scrollNV"](diff, down, true)
    };
    _p.scrollV = function(diff, down) {
        var self = this,
            virtualY = self.that.options.virtualY;
        self[virtualY ? "scrollVirtual" : "scrollNV"](diff, down)
    };
    _p.scrollVirtual = function(diff, down, x) {
        var that = this.that,
            scrollBar = x ? that.hscrollbar() : that.vscrollbar(),
            options = scrollBar.options,
            cur_pos = options.cur_pos,
            num_eles = options.num_eles,
            pow = Math.ceil(diff / 10),
            incr = Math.pow(5, pow - 1) * (down ? 1 : -1),
            cur_pos = cur_pos + incr;
        if (cur_pos < 0) {
            cur_pos = 0
        } else if (cur_pos >= num_eles) {
            cur_pos = num_eles - 1
        }
        scrollBar.option("cur_pos", cur_pos).scroll()
    };
    _p.scrollNV = function(diff, down, x) {
        var that = this.that,
            tbl = that.$tbl[0],
            ht = tbl[x ? "offsetWidth" : "offsetHeight"],
            scrollBar = x ? that.hscrollbar() : that.vscrollbar(),
            options = scrollBar.options,
            ratio = options.ratio,
            pos = ratio * ht,
            pos2 = pos + (down ? diff : -diff),
            ratio2 = pos2 / ht;
        if (ratio2 > 1) {
            ratio2 = 1
        } else if (ratio2 < 0) {
            ratio2 = 0
        }
        scrollBar.option("ratio", ratio2).drag()
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    _pq.cFormula = function(that) {
        var self = this;
        self.that = that;
        self.oldF = [];
        that.one("ready", function() {
            that.on("CMInit", self.onCMInit(self))
        }).on("dataAvailable", function() {
            self.onDA()
        }).on(true, "change", function(evt, ui) {
            self.onChange(ui)
        })
    };
    _pq.cFormula.prototype = {
        onCMInit: function(self) {
            return function() {
                if (self.isFormulaChange(self.oldF, self.formulas())) {
                    self.calcMainData()
                }
            }
        },
        callRow: function(rowData, formulas, flen) {
            var that = this.that,
                j = 0;
            if (rowData) {
                for (j = 0; j < flen; j++) {
                    var fobj = formulas[j],
                        column = fobj[0],
                        formula = fobj[1];
                    rowData[column.dataIndx] = formula.call(that, rowData, column)
                }
            }
        },
        onDA: function() {
            this.calcMainData()
        },
        isFormulaChange: function(oldF, newF) {
            var diff = false,
                i = 0,
                ol = oldF.length,
                nl = newF.length;
            if (ol == nl) {
                for (; i < ol; i++) {
                    if (oldF[i][0] != newF[i][0]) {
                        diff = true;
                        break
                    }
                }
            } else {
                diff = true
            }
            return diff
        },
        calcMainData: function() {
            var formulas = this.formulaSave(),
                that = this.that,
                flen = formulas.length;
            if (flen) {
                var o = that.options,
                    data = o.dataModel.data,
                    i = data.length;
                while (i--) {
                    this.callRow(data[i], formulas, flen)
                }
                that._trigger("formulaComputed")
            }
        },
        onChange: function(ui) {
            var formulas = this.formulas(),
                flen = formulas.length,
                self = this,
                fn = function(rObj) {
                    self.callRow(rObj.rowData, formulas, flen)
                };
            if (flen) {
                ui.addList.forEach(fn);
                ui.updateList.forEach(fn)
            }
        },
        formulas: function() {
            var that = this.that,
                arr = [],
                column, formula, formulas = that.options.formulas || [];
            formulas.forEach(function(_arr) {
                column = that.getColumn({
                    dataIndx: _arr[0]
                });
                if (column) {
                    formula = _arr[1];
                    if (formula) {
                        arr.push([column, formula])
                    }
                }
            });
            return arr
        },
        formulaSave: function() {
            var arr = this.formulas();
            this.oldF = arr;
            return arr
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    _pq.pqGrid.defaults.treeModel = {
        cbId: "pq_tree_cb",
        childstr: "children",
        iconCollapse: ["ui-icon-triangle-1-se", "ui-icon-triangle-1-e"],
        iconFolder: ["ui-icon-folder-open", "ui-icon-folder-collapsed"],
        iconFile: "ui-icon-document",
        id: "id",
        indent: 18,
        parentId: "parentId",
        refreshOnChange: true
    };
    _pq.pqGrid.prototype.Tree = function() {
        return this.iTree
    };
    $(document).on("pqGrid:bootup", function(evt, ui) {
        var grid = ui.instance;
        grid.iTree = new cTree(grid)
    });
    var cTree = _pq.cTree = function(that) {
        this.that = that;
        this.fns = {};
        this.init();
        this.cache = {};
        this.di_prev
    };
    cTree.prototype = {
        _cascadeNest: function(data, select) {
            var self = this,
                cbId = self.cbId,
                prop = self.prop,
                parentId = self.parentId,
                childstr = self.childstr,
                len = data.length,
                parentAffected, i = 0,
                rd, child;
            for (; i < len; i++) {
                rd = data[i];
                if (rd[prop]) {
                    parentAffected = true;
                    self.eachChild(rd, self.chkEachChild(cbId, select, rd[cbId], prop));
                    delete rd[prop]
                }(child = rd[childstr]) && child.length && self._cascadeNest(child, select)
            }
            if (parentAffected && rd[parentId] != null) {
                self.eachParent(rd, self.chkEachParent(cbId, select, prop))
            }
        },
        addNodes: function(nodes, parent) {
            var self = this,
                that = self.that,
                DM = that.options.dataModel,
                parentIdstr = self.parentId,
                parentId = parent ? parent[self.id] : null,
                i = 0,
                len, rd1, addList = [];
            if (nodes) {
                len = nodes.length;
                for (; i < len; i++) {
                    rd1 = nodes[i];
                    parentId != null && (rd1[parentIdstr] = parentId);
                    addList.push({
                        newRow: rd1
                    })
                }
                that._digestData({
                    addList: addList,
                    history: false
                });
                DM.data = self.groupById(DM.data);
                self.buildCache();
                that.refreshView()
            }
        },
        buildCache: function() {
            var self = this,
                o = self.that.options,
                data = o.dataModel.data,
                cache = self.cache,
                id = self.id,
                rd, rId;
            for (var i = 0, len = data.length; i < len; i++) {
                rd = data[i];
                rId = rd[id];
                if (rId != null) {
                    cache[rId] = rd
                } else {
                    throw "unknown id of row"
                }
            }
        },
        checkNodes: function(arr, evt, _check) {
            var check = _check == null ? true : _check,
                rd, ri, i = 0,
                len = arr.length,
                rows = [],
                ui = {},
                self = this,
                that = self.that,
                offset = that.riOffset,
                cbId = self.cbId,
                prop = self.prop,
                main_data, TM = that.options.treeModel,
                cascadeCheck = TM.cascade,
                select = TM.select;
            for (; i < len; i++) {
                rd = arr[i];
                ri = rd.pq_ri;
                rows.push({
                    rowData: rd,
                    rowIndx: ri,
                    rowIndxPage: ri - offset
                })
            }
            ui.rows = rows;
            if (that._trigger("beforeCheck", evt, ui) !== false) {
                rows = ui.rows;
                len = rows.length;
                for (i = 0; i < len; i++) {
                    rd = rows[i].rowData;
                    rd[cbId] = check;
                    select && (rd.pq_rowselect = check);
                    cascadeCheck && (rd[prop] = true)
                }
                main_data = self.getRoots();
                cascadeCheck && self._cascadeNest(main_data, select);
                that._trigger("check", evt, ui);
                that.refresh()
            }
        },
        chkEachChild: function(cbId, select, inpChk, prop) {
            return function(rd) {
                if (!prop || !rd[prop]) {
                    rd[cbId] = inpChk;
                    select && (rd.pq_rowselect = inpChk)
                }
            }
        },
        chkEachParent: function(cbId, select) {
            var childstr = this.childstr;
            return function(rd) {
                var child = rd[childstr],
                    countTrue = 0,
                    countFalse = 0,
                    chk, chk2;
                for (var i = 0, len = child.length; i < len; i++) {
                    chk2 = child[i][cbId];
                    if (chk2) {
                        countTrue++
                    } else if (chk2 === null) {
                        chk = null;
                        break
                    } else {
                        countFalse++
                    }
                    if (countTrue && countFalse) {
                        chk = null;
                        break
                    }
                }
                if (chk === undefined) {
                    chk = countTrue ? true : false
                }
                rd[cbId] = chk;
                select && (rd.pq_rowselect = chk)
            }
        },
        collapseAll: function(open) {
            this[open ? "expandNodes" : "collapseNodes"](this.that.options.dataModel.data)
        },
        collapseNodes: function(nodes, evt, open) {
            var i = 0,
                that = this.that,
                len = nodes.length,
                node, nodes2 = [],
                ui, close = !open;
            for (; i < len; i++) {
                node = nodes[i];
                if (this.isFolder(node) && this.isCollapsed(node) !== close) {
                    nodes2.push(node)
                }
            }
            if (nodes2.length) {
                ui = {
                    close: close,
                    nodes: nodes2
                };
                if (that._trigger("beforeTreeExpand", evt, ui) !== false) {
                    len = nodes2.length;
                    for (i = 0; i < len; i++) {
                        node = nodes2[i];
                        node.pq_close = close
                    }
                    that._trigger("treeExpand", evt, ui);
                    that.refreshView()
                }
            }
        },
        eachParent: function(node, fn) {
            while (node = this.getParent(node)) {
                fn(node)
            }
        },
        eachChild: function(node, fn) {
            fn(node);
            var childstr = this.childstr,
                child = node[childstr] || [],
                rd;
            for (var i = 0, len = child.length; i < len; i++) {
                rd = child[i];
                fn(rd);
                if (rd[childstr]) {
                    this.eachChild(rd, fn)
                }
            }
        },
        expandAll: function() {
            this.collapseAll(true)
        },
        expandNodes: function(nodes, evt) {
            this.collapseNodes(nodes, evt, true)
        },
        expandTo: function(node) {
            var nodes = [];
            do {
                if (node.pq_close) {
                    nodes.push(node)
                }
            } while (node = this.getParent(node));
            this.expandNodes(nodes)
        },
        exportCell: function(cellData, level) {
            var str = "",
                i = 0;
            for (; i < level; i++) {
                str += "- "
            }
            return str + (cellData == null ? "" : cellData)
        },
        filter: function(data, arrS, iF, FMmode, dataTmp, dataUF) {
            var rd, ret, found, childstr = this.childstr,
                nodes;
            for (var i = 0, len = data.length; i < len; i++) {
                rd = data[i];
                ret = false;
                if (nodes = rd[childstr]) {
                    ret = this.filter(nodes, arrS, iF, FMmode, dataTmp, dataUF);
                    if (ret) {
                        found = true;
                        dataTmp.push(rd)
                    }
                }
                if (!ret) {
                    if (!iF.isMatchRow(rd, arrS, FMmode)) {
                        dataUF.push(rd)
                    } else {
                        found = true;
                        dataTmp.push(rd)
                    }
                }
            }
            return found
        },
        _flatten: function(data, parentRD, level, data2) {
            var self = this,
                len = data.length,
                id = self.id,
                pId = self.parentId,
                i = 0,
                rd, child, childstr = self.childstr;
            for (; i < len; i++) {
                rd = data[i];
                rd.pq_level = level;
                data2.push(rd);
                if (parentRD) {
                    rd[pId] = parentRD[id]
                }
                child = rd[childstr];
                if (child) {
                    self._flatten(child, rd, level + 1, data2)
                }
            }
        },
        flatten: function(data) {
            var data2 = [];
            this._flatten(data, null, 0, data2);
            return data2
        },
        getFormat: function() {
            var self = this,
                data = self.that.options.dataModel.data,
                format = "flat",
                i = 0,
                len = data.length,
                parentId = self.parentId,
                childstr = self.childstr,
                rd, children;
            for (; i < len; i++) {
                rd = data[i];
                if (rd[parentId] != null) {
                    break
                } else if ((children = rd[childstr]) && children.length) {
                    return self.getParent(children[0]) == rd ? "flat" : "nested"
                }
            }
            return format
        },
        getAllChildren: function(rd, _data) {
            var childstr = this.childstr,
                nodes = rd[childstr] || [],
                len = nodes.length,
                i = 0,
                rd2, data = _data || [];
            for (; i < len; i++) {
                rd2 = nodes[i];
                data.push(rd2);
                if (rd2[childstr]) {
                    this.getAllChildren(rd2, data)
                }
            }
            return data
        },
        getCheckedNodes: function() {
            var data = this.that.options.dataModel.data,
                len = data.length,
                i = 0,
                rd, arr = [],
                cbId = this.cbId;
            for (; i < len; i++) {
                rd = data[i];
                if (rd[cbId]) {
                    arr.push(rd)
                }
            }
            return arr
        },
        getLevel: function(rd) {
            return rd.pq_level
        },
        getNode: function(id) {
            return this.cache[id]
        },
        getParent: function(rd) {
            var pId = rd[this.parentId];
            return this.cache[pId]
        },
        getRoots: function(_data) {
            var that = this.that,
                data = _data || that.options.dataModel.data,
                len = data.length,
                i = 0,
                rd, data2 = [];
            for (; i < len; i++) {
                rd = data[i];
                if (!rd.pq_level) {
                    data2.push(rd)
                }
            }
            return data2
        },
        _groupById: function(data, _id, children, groups, level) {
            var self = this,
                gchildren, childstr = self.childstr,
                i = 0,
                len = children.length;
            for (; i < len; i++) {
                var rd = children[i],
                    id = rd[_id];
                rd.pq_level = level;
                data.push(rd);
                if (gchildren = groups[id]) {
                    rd[childstr] = gchildren;
                    self._groupById(data, _id, gchildren, groups, level + 1)
                } else {
                    delete rd[childstr]
                }
            }
        },
        groupById: function(data) {
            var self = this,
                id = self.id,
                pId, parentId = self.parentId,
                groups = {},
                group, data2 = [],
                i = 0,
                len = data.length,
                rd;
            for (; i < len; i++) {
                rd = data[i];
                pId = rd[parentId];
                pId == null && (pId = "");
                if (!(group = groups[pId])) {
                    group = groups[pId] = []
                }
                group.push(rd)
            }
            self._groupById(data2, id, groups[""] || [], groups, 0);
            return data2
        },
        init: function() {
            var self = this,
                that = self.that,
                o = that.options,
                TM = o.treeModel,
                cbId = TM.cbId,
                di = self.dataIndx = TM.dataIndx;
            self.cbId = cbId;
            self.prop = "pq_tree_prop";
            self.id = TM.id;
            self.parentId = TM.parentId;
            self.childstr = TM.childstr;
            if (di) {
                if (!self._init) {
                    self.on("CMInit", self.onColInit(self, that, TM)).on("dataAvailable", self.onDataAvailable(self, that, TM)).on("dataReady", self.onDataReady(self, that, TM)).on("beforeCellKeyDown", self.onBeforeCellKeyDown(self, that)).on("customSort", self.onCustomSort(self, that)).on("customFilter", self.onCustomFilter(self, that)).on("clearFilter", self.onClearFilter(self)).on("change", self.onChange(self, that, TM)).on("cellClick", self.onCellClick(self, that)).on("refresh refreshRow", self.onRefresh(self, TM)).on("valChange", self.onCheckbox(self, TM));
                    self._init = true
                }
            } else if (self._init) {
                this.off();
                self._init = false
            }
            if (self._init) {
                o.groupModel.on = TM.summary
            }
        },
        initData: function() {
            var self = this,
                that = self.that,
                o = that.options,
                DM = o.dataModel,
                data = DM.data;
            if (self.getFormat() == "flat") {
                data = self.groupById(data)
            } else {
                data = self.flatten(data)
            }
            DM.data = data;
            self.buildCache()
        },
        isFolder: function(rd) {
            return rd.pq_close != null || !!rd[this.childstr]
        },
        isCollapsed: function(rd) {
            return !!rd.pq_close
        },
        off: function() {
            var obj = this.fns,
                that = this.that,
                key;
            for (key in obj) {
                that.off(key, obj[key])
            }
            this.fns = {}
        },
        on: function(evt, fn) {
            this.fns[evt] = fn;
            this.that.on(evt, fn);
            return this
        },
        onCustomSort: function(self) {
            return function(evt, ui) {
                var data = self.getRoots(ui.data);
                self.sort(data, ui.sort_composite);
                ui.data = self.flatten(data);
                return false
            }
        },
        onColInit: function(self) {
            return function() {
                self.setCellRender()
            }
        },
        onCellClick: function(self) {
            return function(evt, ui) {
                if (ui.dataIndx == self.dataIndx && $(evt.originalEvent.target).hasClass("pq-group-icon")) {
                    self.toggleNode(ui.rowData, evt)
                }
            }
        },
        onBeforeCellKeyDown: function(self, that) {
            return function(evt, ui) {
                var rd = ui.rowData,
                    $inp, di = ui.dataIndx,
                    close, keyCode = evt.keyCode,
                    KC = $.ui.keyCode;
                if (di == self.dataIndx) {
                    if (self.isFolder(rd)) {
                        close = rd.pq_close;
                        if (keyCode == KC.ENTER && !that.isEditableCell({
                                rowData: rd,
                                dataIndx: di
                            }) || !close && keyCode == KC.LEFT || close && keyCode == KC.RIGHT) {
                            self.toggleNode(rd);
                            return false
                        }
                    }
                    if (keyCode == KC.SPACE) {
                        $inp = that.getCell(ui).find("input[type='checkbox']");
                        if ($inp.length) {
                            $inp.click();
                            return false
                        }
                    }
                }
            }
        },
        onChange: function(self, that, TM) {
            return function() {
                TM.summary && TM.refreshOnChange && that.refreshView()
            }
        },
        onRefresh: function(self, TM) {
            return function() {
                if (TM.checkbox) {
                    var $inp = this.$cont.find(".pq_indeter"),
                        i = $inp.length;
                    while (i--) {
                        $inp[i].indeterminate = true
                    }
                }
            }
        },
        onClearFilter: function(self) {
            return function(evt, ui) {
                ui.data = self.groupById(ui.data);
                return false
            }
        },
        onCustomFilter: function(self, that) {
            return function(evt, ui) {
                var data = self.groupById(ui.data),
                    iF = that.iFilterData,
                    arrS = ui.filters,
                    dataTmp = [],
                    dataUF = [],
                    FMmode = ui.mode;
                self.filter(self.getRoots(data), arrS, iF, FMmode, dataTmp, dataUF);
                ui.dataTmp = self.groupById(dataTmp);
                ui.dataUF = dataUF;
                return false
            }
        },
        onCheckbox: function(self, TM) {
            return function(evt, ui) {
                if (TM.checkbox && ui.dataIndx == TM.dataIndx) {
                    self.checkNodes([ui.rowData], evt, ui.input.checked)
                }
            }
        },
        onDataAvailable: function(self) {
            return function() {
                self.initData()
            }
        },
        onDataReady: function(self, that, TM) {
            return function() {
                if (TM.summary) {
                    self.summary(self)
                }
                self.showHideRows()
            }
        },
        option: function(ui, refresh) {
            var self = this,
                that = self.that,
                TM = that.options.treeModel,
                di_prev = TM.dataIndx,
                di;
            $.extend(TM, ui);
            di = TM.dataIndx;
            self.setCellRender();
            self.init();
            if (!di_prev && di) {
                self.initData()
            }
            refresh !== false && that.refreshView()
        },
        _summary: function(dataT, pdata, dxs, summaryTypes, columns, rdParent) {
            var self = this,
                childstr = self.childstr,
                i = 0,
                len = dataT.length,
                f = 0,
                cells = {},
                aggr = {},
                aggr2, rd, nodes, summaryType, dataIndx, id = self.id,
                parentId = self.parentId,
                dxsLen = dxs.length,
                _aggr = pq.aggregate;
            for (; f < dxsLen; f++) {
                dataIndx = dxs[f];
                cells[dataIndx] = []
            }
            for (; i < len; i++) {
                rd = dataT[i];
                aggr2 = null;
                pdata.push(rd);
                if (nodes = rd[childstr]) {
                    aggr2 = self._summary(nodes, pdata, dxs, summaryTypes, columns, rd)
                }
                for (f = 0; f < dxsLen; f++) {
                    dataIndx = dxs[f];
                    aggr2 && cells[dataIndx].push(aggr2[dataIndx]);
                    cells[dataIndx].push(rd[dataIndx])
                }
            }
            for (f = 0; f < dxsLen; f++) {
                dataIndx = dxs[f];
                summaryType = summaryTypes[f];
                aggr[dataIndx] = _aggr[summaryType](cells[dataIndx], columns[f])
            }
            if (rd.pq_level) {
                aggr.pq_level = rd.pq_level;
                aggr.pq_gsummary = true;
                rdParent && (aggr[parentId] = rdParent[id]);
                pdata.push(aggr)
            }
            return aggr
        },
        summary: function(self) {
            var that = self.that,
                roots = self.getRoots(),
                pdata = [],
                summaryTypes = [],
                dxs = [],
                columns = [],
                v = 0,
                column, summary, CM = that.colModel,
                CMLength = CM.length;
            for (; v < CMLength; v++) {
                column = CM[v];
                summary = column.summary;
                if (summary && summary.type) {
                    dxs.push(column.dataIndx);
                    columns.push(column);
                    summaryTypes.push(summary.type)
                }
            }
            self._summary(roots, pdata, dxs, summaryTypes, columns);
            that.pdata = pdata
        },
        _iconCls: function(rd, isFolder, TM) {
            if (TM.icons) {
                var iconFolder;
                if (isFolder && (iconFolder = TM.iconFolder)) {
                    return rd.pq_close ? iconFolder[1] : iconFolder[0]
                } else if (!rd.pq_gsummary) {
                    return TM.iconFile
                }
            }
        },
        renderCB: function(checkbox, rd, styleWidth, cbId) {
            if (rd.pq_gsummary) {
                return ""
            }
            var that = this.that,
                checked = "",
                indeter = "";
            if (typeof checkbox == "function") {
                checkbox = checkbox.call(that, rd)
            }
            if (checkbox) {
                rd[cbId] && (checked = "checked");
                rd[cbId] === null && (indeter = "class='pq_indeter'");
                return "<input type='checkbox' " + styleWidth + " " + indeter + " " + checked + "/>"
            }
        },
        renderCell: function(self, TM) {
            return function(ui) {
                var rd = ui.rowData,
                    that = self.that,
                    indent = TM.indent,
                    render = TM.render,
                    iconCollapse = TM.iconCollapse,
                    checkbox = TM.checkbox,
                    isFolder = self.isFolder(rd),
                    iconCls = self._iconCls(rd, isFolder, TM),
                    level = rd.pq_level || 0,
                    textIndent = level * indent,
                    textIndentLeaf = textIndent + indent * 1,
                    icon, _icon, icon2, clsArr = ["pq-group-title-cell"],
                    attr, styleArr = ["text-indent:", isFolder ? textIndent : textIndentLeaf, "px;"],
                    styleWidth = "style='width:" + indent + "px;'",
                    cellData = ui.cellData,
                    chk;
                if (render) {
                    var ret = that.callFn(render, ui);
                    if (ret != null) {
                        if (typeof ret != "string") {
                            ret.iconCls && (iconCls = ret.iconCls);
                            ret.text != null && (cellData = ret.text);
                            attr = ret.attr;
                            clsArr.push(ret.cls);
                            styleArr.push(ret.style)
                        } else {
                            cellData = ret
                        }
                    }
                }
                if (ui.Export) {
                    return self.exportCell(cellData, level)
                } else {
                    if (checkbox) {
                        chk = self.renderCB(checkbox, rd, styleWidth, TM.cbId)
                    }
                    if (isFolder) {
                        _icon = rd.pq_close ? iconCollapse[1] : iconCollapse[0];
                        icon = "<span " + styleWidth + " class='pq-group-icon ui-icon " + _icon + "'></span>"
                    }
                    if (iconCls) {
                        icon2 = "<span " + styleWidth + " class='pq-tree-icon ui-icon " + iconCls + "'></span>"
                    }
                    return {
                        cls: clsArr.join(" "),
                        attr: attr,
                        style: styleArr.join(""),
                        text: [icon, icon2, chk, cellData].join("")
                    }
                }
            }
        },
        setCellRender: function() {
            var self = this,
                that = self.that,
                TM = that.options.treeModel,
                di, column, columns = that.columns;
            TM.summary && that.iGroup.refreshColumns();
            if (di = self.di_prev) {
                column = columns[di];
                column && (column._render = null);
                self.di_prev = null
            }
            if (di = TM.dataIndx) {
                column = columns[di];
                column._render = self.renderCell(self, TM);
                self.di_prev = di
            }
        },
        _showHideRows: function(p_data, _data, _hide) {
            var self = this,
                data = _data || self.getRoots(),
                childstr = self.childstr,
                rd, hidec, hide = _hide || false,
                children, len = data.length,
                i = 0;
            for (; i < len; i++) {
                rd = data[i];
                rd.pq_hidden = hide;
                if (children = rd[childstr]) {
                    hidec = hide || rd.pq_close;
                    self._showHideRows(p_data, children, hidec)
                }
            }
        },
        showHideRows: function() {
            var self = this,
                that = self.that,
                i = 0,
                data = that.get_p_data(),
                len, rd, summary = that.options.treeModel.summary;
            self._showHideRows(data);
            if (summary) {
                data = that.pdata;
                len = data.length;
                for (; i < len; i++) {
                    rd = data[i];
                    if (rd.pq_gsummary) {
                        rd.pq_hidden = self.getParent(rd).pq_hidden
                    }
                }
            }
        },
        sort: function(_data, sort_composite) {
            var childstr = this.childstr;
            (function sort(data) {
                data.sort(sort_composite);
                var len = data.length,
                    i = 0,
                    nodes;
                for (; i < len; i++) {
                    if (nodes = data[i][childstr]) {
                        sort(nodes)
                    }
                }
            })(_data)
        },
        toggleNode: function(rd, evt) {
            this[rd.pq_close ? "expandNodes" : "collapseNodes"]([rd], evt)
        },
        unCheckNodes: function(arr, evt) {
            this.checkNodes(arr, evt, false)
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        fn = _pq.pqGrid.prototype,
        cRows = function(that) {
            this.that = that;
            var o = that.options;
            this.options = o;
            this.selection = [];
            this.hclass = " pq-state-select " + (o.bootstrap.on ? "" : "ui-state-highlight")
        };
    _pq.cRows = cRows;
    fn.SelectRow = function() {
        return this.iRows
    };
    cRows.prototype = {
        _add: function(row, remove) {
            var that = this.that,
                $tr, rowIndxPage = row.rowIndxPage,
                add = !remove,
                rowData = row.rowData,
                inView = this.inViewRow(rowIndxPage);
            if (!rowData.pq_hidden && inView) {
                $tr = that.getRow(row);
                if ($tr.length) {
                    $tr[add ? "addClass" : "removeClass"](this.hclass);
                    !add && $tr.removeAttr("tabindex")
                }
            }
            rowData.pq_rowselect = add;
            return row
        },
        _data: function(ui) {
            ui = ui || {};
            var that = this.that,
                all = ui.all,
                offset = that.riOffset,
                ri = all ? 0 : offset,
                data = that.get_p_data(),
                len = all ? data.length : that.pdata.length,
                end = ri + len;
            return [data, ri, end]
        },
        add: function(objP) {
            var rows = objP.addList = objP.rows || [{
                rowIndx: objP.rowIndx
            }];
            if (objP.isFirst) {
                this.setFirst(rows[0].rowIndx)
            }
            this.update(objP)
        },
        extend: function(objP) {
            var r2 = objP.rowIndx,
                arr = [],
                i, item, begin, end, r1 = this.getFirst(),
                isSelected;
            if (r1 != null) {
                isSelected = this.isSelected({
                    rowIndx: r1
                });
                if (isSelected == null) {
                    return
                }
                if (r1 > r2) {
                    r1 = [r2, r2 = r1][0];
                    begin = r1;
                    end = r2 - 1
                } else {
                    begin = r1 + 1;
                    end = r2
                }
                for (i = begin; i <= end; i++) {
                    item = {
                        rowIndx: i
                    };
                    arr.push(item)
                }
                this.update(isSelected ? {
                    addList: arr
                } : {
                    deleteList: arr
                })
            }
        },
        getFirst: function() {
            return this._firstR
        },
        getSelection: function() {
            var that = this.that,
                data = that.get_p_data(),
                rd, i = 0,
                len = data.length,
                rows = [];
            for (; i < len; i++) {
                rd = data[i];
                if (rd.pq_rowselect) {
                    rows.push({
                        rowIndx: i,
                        rowData: rd
                    })
                }
            }
            return rows
        },
        inViewRow: function(rowIndxPage) {
            var that = this.that,
                options = that.options,
                freezeRows = options.freezeRows,
                finalV = that.finalV;
            if (rowIndxPage < freezeRows) {
                return true
            }
            return rowIndxPage >= that.initV && rowIndxPage <= finalV
        },
        isSelected: function(objP) {
            var rowData = objP.rowData || this.that.getRowData(objP);
            return rowData ? rowData.pq_rowselect === true : null
        },
        isSelectedAll: function(ui) {
            var arr = this._data(ui),
                data = arr[0],
                ri = arr[1],
                end = arr[2],
                rd;
            for (; ri < end; ri++) {
                rd = data[ri];
                if (rd && !rd.pq_rowselect) {
                    return false
                }
            }
            return true
        },
        removeAll: function(ui) {
            this.selectAll(ui, true)
        },
        remove: function(objP) {
            var rows = objP.deleteList = objP.rows || [{
                rowIndx: objP.rowIndx
            }];
            if (objP.isFirst) {
                this.setFirst(rows[0].rowIndx)
            }
            this.update(objP)
        },
        selectAll: function(_ui, remove) {
            var that = this.that,
                rd, rows = [],
                offset = that.riOffset,
                arr = this._data(_ui),
                data = arr[0],
                ri = arr[1],
                end = arr[2];
            for (; ri < end; ri++) {
                rd = data[ri];
                if (rd) {
                    rows.push({
                        rowIndx: ri,
                        rowIndxPage: ri - offset,
                        rowData: rd
                    })
                }
            }
            this.update(remove ? {
                deleteList: rows
            } : {
                addList: rows
            }, true)
        },
        setFirst: function(v) {
            this._firstR = v
        },
        toRange: function() {
            var areas = [],
                that = this.that,
                data = that.get_p_data(),
                rd, i = 0,
                len = data.length,
                r1, r2;
            for (; i < len; i++) {
                rd = data[i];
                if (rd.pq_rowselect) {
                    if (r1 != null) {
                        r2 = i
                    } else {
                        r1 = r2 = i
                    }
                } else if (r1 != null) {
                    areas.push({
                        r1: r1,
                        r2: r2
                    });
                    r1 = r2 = null
                }
            }
            if (r1 != null) {
                areas.push({
                    r1: r1,
                    r2: r2
                })
            }
            return that.Range(areas)
        },
        toggle: function(ui) {
            this[this.isSelected(ui) ? "remove" : "add"](ui)
        },
        toggleAll: function(ui) {
            this[this.isSelectedAll(ui) ? "removeAll" : "selectAll"](ui)
        },
        update: function(objP, normalized) {
            var self = this,
                that = self.that,
                ui = {
                    source: objP.source
                },
                norm = function(list) {
                    return normalized ? list : that.normalizeList(list)
                },
                addList = norm(objP.addList || []),
                deleteList = norm(objP.deleteList || []);
            addList = addList.filter(function(rObj) {
                return self.isSelected(rObj) === false
            });
            deleteList = deleteList.filter(function(rObj) {
                return self.isSelected(rObj)
            });
            if (addList.length || deleteList.length) {
                ui.addList = addList;
                ui.deleteList = deleteList;
                if (that._trigger("beforeRowSelect", null, ui) === false) {
                    return
                }
                ui.addList.forEach(function(rObj) {
                    self._add(rObj)
                });
                ui.deleteList.forEach(function(rObj) {
                    self._add(rObj, true)
                });
                that._trigger("rowSelect", null, ui)
            }
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    $(document).on("pqGrid:bootup", function(evt, ui) {
        var grid = ui.instance;
        grid.iImport = new cImport(grid)
    });
    _pq.pqGrid.prototype.importWb = function(obj) {
        return this.iImport.importWb(obj)
    };
    var cImport = _pq.cImport = function(that) {
        this.that = that
    };
    cImport.prototype = {
        fillRows: function(data, i, obj) {
            var j = data.length;
            for (; j < i; j++) {
                data.push(obj ? {} : [])
            }
        },
        generateCols: function(numCols, columns, CMrow) {
            var toLetter = pq.toLetter,
                CM = [],
                i = 0,
                column1, column2, colWidthDefault = pq.excel.colWidth,
                cells = CMrow ? CMrow.cells : [],
                titles = [];
            cells.forEach(function(cell, i) {
                var indx = cell.indx || i;
                titles[indx] = cell.value
            });
            columns = columns || [];
            columns.forEach(function(col, i) {
                var indx = col.indx || i;
                CM[indx] = {
                    hidden: col.hidden,
                    width: col.width,
                    title: titles[indx] || ""
                }
            });
            numCols = Math.max(numCols, columns.length);
            for (; i < numCols; i++) {
                column1 = CM[i] || {};
                column2 = {
                    title: column1.title || toLetter(i),
                    width: column1.width || colWidthDefault,
                    halign: "center"
                };
                column1.hidden && (column2.hidden = true);
                CM[i] = column2
            }
            return CM
        },
        toRC: function(part) {
            var arr = part.match(/([A-Z]+)(\d+)/),
                c = pq.toNumber(arr[1]),
                r = arr[2] - 1;
            return [r, c]
        },
        getAddress: function(addr) {
            var parts = addr.split(":"),
                part1 = this.toRC(parts[0]),
                r1 = part1[0],
                c1 = part1[1],
                part2 = this.toRC(parts[1]),
                r2 = part2[0],
                c2 = part2[1],
                rc = r2 - r1 + 1,
                cc = c2 - c1 + 1;
            return {
                r1: r1,
                c1: c1,
                rc: rc,
                cc: cc
            }
        },
        importS: function(sheet, extraRows, extraCols, keepCM, headerRowIndx) {
            var mergeCells = sheet.mergeCells,
                self = this,
                data = [],
                that = this.that,
                numCols = 0,
                rows = sheet.rows,
                frozenRows = sheet.frozenRows || 0,
                len = rows.length,
                i = 0,
                row, rindx, rd, cindx, di, CMrow, CM = that.options.colModel,
                CMExists = CM && CM.length;
            if (headerRowIndx != null) {
                CMrow = rows[headerRowIndx];
                rows = rows.slice(headerRowIndx + 1);
                frozenRows = frozenRows - (headerRowIndx + 1);
                frozenRows = frozenRows > 0 ? frozenRows : 0
            }
            for (i = 0, len = rows.length; i < len; i++) {
                row = rows[i];
                rindx = row.indx || i;
                rd = {};
                if (rindx != i) {
                    this.fillRows(data, rindx, true)
                }
                row.cells.forEach(function(cell, j) {
                    cindx = cell.indx || j;
                    di = keepCM && CMExists && CM[cindx] ? CM[cindx].dataIndx : cindx;
                    rd[di] = cell.value;
                    self.copyStyle(rd, di, cell);
                    cell.format && self.copyFormat(rd, di, cell.format);
                    cell.formula && self.copyFormula(rd, di, cell.formula);
                    numCols <= cindx && (numCols = cindx + 1)
                });
                row.hidden && (rd.pq_hidden = true);
                data[rindx] = rd
            }
            sheet.name && that.option("title", sheet.name);
            extraRows && this.fillRows(data, data.length + extraRows, true);
            that.option("dataModel.data", data);
            numCols += extraCols || 0;
            that.refreshCM(this.generateCols(numCols, sheet.columns, CMrow));
            that.option("mergeCells", (mergeCells || []).map(function(mc) {
                return self.getAddress(mc)
            }));
            that.option({
                freezeRows: frozenRows,
                freezeCols: sheet.frozenCols
            });
            that.refreshDataAndView();
            that._trigger("importWb")
        },
        copyFormula: function(rd, di, formula) {
            var pq_fn = rd.pq_fn = rd.pq_fn || {};
            pq_fn[di] = formula
        },
        copyFormat: function(rd, di, format) {
            var pq_format = rd.pq_format = rd.pq_format || {};
            format = pq.isDateFormat(format) ? pq.excelToJui(format) : pq.excelToNum(format);
            pq_format[di] = format
        },
        copyStyle: function(rd, di, cell) {
            var tmp, style = [],
                cellattr;
            (tmp = cell.font) && style.push("font-family:" + tmp);
            (tmp = cell.fontSize) && style.push("font-size:" + tmp + "px");
            (tmp = cell.color) && style.push("color:" + tmp);
            (tmp = cell.bgColor) && style.push("background:" + tmp);
            cell.bold && style.push("font-weight:bold");
            cell.italic && style.push("font-style:italic");
            cell.underline && style.push("text-decoration:underline");
            (tmp = cell.align) && style.push("text-align:" + tmp);
            (tmp = cell.valign) && style.push("vertical-align:" + tmp);
            cell.wrap && style.push("white-space:normal");
            if (style = style.join(";")) {
                cellattr = rd.pq_cellattr = rd.pq_cellattr || {};
                cellattr[di] = {
                    style: style
                }
            }
        },
        importWb: function(obj) {
            var w = obj.workbook,
                sheet = obj.sheet || 0,
                s = w.sheets.filter(function(_sheet, i) {
                    return sheet == i || sheet == _sheet.name
                })[0];
            s && this.importS(s, obj.extraRows, obj.extraCols, obj.keepCM, obj.headerRowIndx)
        }
    }
})(jQuery);
(function($) {
    "use strict";
    pq.excelImport = {
        attr: function() {
            var re = new RegExp('([a-z]+)\\s*=\\s*"([^"]*)"', "gi");
            return function(str) {
                str = str || "";
                str = str.slice(0, str.indexOf(">"));
                var attrs = {};
                str.replace(re, function(a, b, c) {
                    attrs[b] = c
                });
                return attrs
            }
        }(),
        cacheStyles: function() {
            var self = this,
                fontSizeDefault, fontDefault, format, $styles = $($.parseXML(self.getStyleText())),
                formats = $.extend(true, {}, self.preDefFormats),
                styles = [],
                fonts = [""],
                fills = ["", ""];
            $styles.find("numFmts>numFmt").each(function(i, numFmt) {
                var $numFmt = $(numFmt),
                    f = $numFmt.attr("formatCode");
                formats[$numFmt.attr("numFmtId")] = f
            });
            $styles.find("fills>fill>patternFill>fgColor[rgb]").each(function(i, fgColor) {
                var color = self.getColor($(fgColor).attr("rgb"));
                fills.push(color)
            });
            $styles.find("fonts>font").each(function(i, font) {
                var $font = $(font),
                    fontSize = $font.find("sz").attr("val") * 1,
                    _font = $font.find("name").attr("val"),
                    color = $font.find("color").attr("rgb"),
                    fontObj = {};
                if (i === 0) {
                    fontSizeDefault = fontSize;
                    fontDefault = _font.toUpperCase();
                    return
                }
                if ($font.find("b").length) fontObj.bold = true;
                if (color) fontObj.color = self.getColor(color);
                if (_font && _font.toUpperCase() != fontDefault) fontObj.font = _font;
                if (fontSize && fontSize != fontSizeDefault) fontObj.fontSize = fontSize;
                if ($font.find("u").length) fontObj.underline = true;
                if ($font.find("i").length) fontObj.italic = true;
                fonts.push(fontObj)
            });
            $styles.find("cellXfs>xf").each(function(i, xf) {
                var $xf = $(xf),
                    numFmtId = $xf.attr("numFmtId") * 1,
                    fillId = $xf.attr("fillId") * 1,
                    $align = $xf.children("alignment"),
                    align, valign, wrap, fontId = $xf.attr("fontId") * 1,
                    key, fontObj = fontId ? fonts[fontId] : {},
                    style = {};
                if ($align.length) {
                    align = $align.attr("horizontal");
                    align && (style.align = align);
                    valign = $align.attr("vertical");
                    valign && (style.valign = valign);
                    wrap = $align.attr("wrapText");
                    wrap == "1" && (style.wrap = true)
                }
                if (numFmtId) {
                    format = formats[numFmtId];
                    if (/(?=.*m.*)(?=.*d.*)(?=.*y.*)/i.test(format)) {
                        format = format.replace(/(\[.*\]|[^mdy\/\-\s])/gi, "")
                    }
                    style.format = format
                }
                if (fillId && fills[fillId]) {
                    style.bgColor = fills[fillId]
                }
                for (key in fontObj) {
                    style[key] = fontObj[key]
                }
                styles.push(style)
            });
            self.getStyle = function(s) {
                return styles[s]
            };
            $styles = 0
        },
        getMergeCells: function($sheet) {
            var self = this,
                mergeCells = $sheet.match(/<mergeCell\s+.*?(\/>|<\/mergeCell>)/g) || [];
            return mergeCells.map(function(mc) {
                return self.attr(mc).ref
            })
        },
        getFrozen: function($sheet) {
            var $pane = this.match($sheet, /<pane.*?(\/>|<\/pane>)/, 0),
                attr = this.attr($pane),
                xSplit = attr.xSplit * 1,
                ySplit = attr.ySplit * 1;
            return {
                r: ySplit || 0,
                c: xSplit || 0
            }
        },
        getFormula: function(self) {
            var obj = {},
                shiftRC = $.paramquery.cFormulas.shiftRC();
            return function(children, ri, ci) {
                if (children.substr(0, 2) === "<f") {
                    var f = self.match(children, /^<f.*?>(.*?)<\/f>/, 1),
                        obj2, attr = self.attr(children);
                    if (attr.t == "shared") {
                        if (f) {
                            obj[attr.si] = {
                                r: ri,
                                c: ci,
                                f: f
                            }
                        } else {
                            obj2 = obj[attr.si];
                            f = shiftRC(obj2.f, ci - obj2.c, ri - obj2.r)
                        }
                    }
                    return f
                }
            }
        },
        getCols: function($sheet) {
            var self = this,
                cols = [],
                $cols = $sheet.match(/<col\s.*?\/>/g) || [],
                factor = pq.excel.colRatio;
            $cols.forEach(function(col, i) {
                var attrs = self.attr(col),
                    min = attrs.min * 1,
                    max = attrs.max * 1,
                    hidden = attrs.hidden * 1,
                    width = attrs.width * 1,
                    _col;
                for (i = min; i <= max; i++) {
                    _col = {};
                    if (hidden) _col.hidden = true;
                    else _col.width = (width * factor).toFixed(2) * 1;
                    if (i !== cols.length + 1) _col.indx = i - 1;
                    cols.push(_col)
                }
            });
            return cols
        },
        getColor: function(color) {
            return "#" + color.slice(2)
        },
        getPath: function(key) {
            return this.paths[key]
        },
        getPathSheets: function() {
            return this.pathSheets
        },
        getFileTextFromKey: function(key) {
            return this.getFileText(this.getPath(key))
        },
        getFileText: function(path) {
            return this.files[path.replace(/^\//, "")].asText()
        },
        getSheetText: function(sheetNameOrIndx) {
            sheetNameOrIndx = sheetNameOrIndx || 0;
            var path = this.pathSheets.filter(function(path, i) {
                return path.name === sheetNameOrIndx || i === sheetNameOrIndx
            })[0].path;
            return this.getFileText(path)
        },
        getStyleText: function() {
            return this.getFileTextFromKey("st")
        },
        getSI: function(str) {
            var si = [],
                arr, unescapeXml = pq.unescapeXml,
                count = this.attr(this.match(str, /<sst.*?>.*?<\/sst>/, 0)).uniqueCount * 1;
            str.replace(/<si>(.*?)<\/si>/g, function(a, b) {
                arr = [];
                b.replace(/<t.*?>(.*?)<\/t>/g, function(c, d) {
                    arr.push(d)
                });
                si.push(unescapeXml(arr.join("")))
            });
            if (count && count !== si.length) {
                throw "si misatch"
            }
            return si
        },
        getWorkBook: function(buffer, type, sheets1) {
            var self = this,
                typeObj = {};
            if (type) typeObj[type] = true;
            else if (typeof buffer == "string") typeObj.base64 = true;
            self.files = new JSZip(buffer, typeObj).files;
            this.readPaths();
            this.cacheStyles();
            var pathSS = this.getPath("ss"),
                sheets = [],
                si = pathSS ? this.getSI(this.getFileText(pathSS)) : [];
            self.getPathSheets().forEach(function(obj, i) {
                if (!sheets1 || sheets1.indexOf(i) > -1 || sheets1.indexOf(obj.name) > -1) {
                    var $sheet = self.getFileText(obj.path),
                        $sheetData = self.match($sheet, /<sheetData.*?>(.*?)<\/sheetData>/, 1),
                        s = self.getWorkSheet($sheet, $sheetData, si, obj.name);
                    sheets.push(s)
                }
            });
            delete self.files;
            return {
                sheets: sheets
            }
        },
        getWorkSheet: function($sheet, $sheetData, si, sheetName) {
            var self = this,
                key, cell, f, format, cell2, data = [],
                rd, cells, t, s, v, cr, num_cols = 0,
                cell_children, rattr, cattr, toNumber = pq.toNumber,
                getFormula = this.getFormula(self),
                isEmpty = pq.isEmpty,
                formulas = pq.formulas,
                isDateFormat = pq.isDateFormat,
                mc = self.getMergeCells($sheet),
                rows = $sheetData.match(/<row.*?<\/row>/g) || [],
                row, r, rowr, i = 0,
                rowsLen = rows.length;
            for (; i < rowsLen; i++) {
                rd = {
                    cells: []
                };
                row = rows[i];
                rattr = self.attr(row);
                rowr = rattr.r;
                r = rowr ? rowr - 1 : i;
                r !== i && (rd.indx = r);
                rattr.hidden && (rd.hidden = true);
                cells = row.match(/(<c[^<]*?\/>|<c.*?<\/c>)/g) || [];
                for (var j = 0, cellsLen = cells.length; j < cellsLen; j++) {
                    cell = cells[j];
                    cattr = self.attr(cell);
                    t = cattr.t;
                    cell_children = self.match(cell, /<c.*?>(.*?)(<\/c>)?$/, 1);
                    cell2 = {};
                    if (t == "inlineStr") {
                        v = cell_children.match(/<t><!\[CDATA\[(.*?)\]\]><\/t>/)[1]
                    } else {
                        v = self.match(cell_children, /<v>(.*?)<\/v>/, 1) || undefined;
                        if (v != null) {
                            if (t == "s") {
                                v = si[v]
                            } else if (t == "str") {
                                v = pq.unescapeXml(v)
                            } else if (t == "b") {
                                v = v == "1"
                            } else {
                                v = formulas.VALUE(v)
                            }
                        }
                    }
                    cr = cattr.r;
                    if (cr) {
                        cr = cr.replace(/\d+/, "");
                        cr = toNumber(cr)
                    } else {
                        cr = j
                    }
                    num_cols = num_cols > cr ? num_cols : cr;
                    v !== undefined && (cell2.value = v);
                    cr !== j && (cell2.indx = cr);
                    f = getFormula(cell_children, r, cr);
                    f && (cell2.formula = pq.unescapeXml(f));
                    s = cattr.s;
                    if (s && (s = this.getStyle(s))) {
                        for (key in s) {
                            cell2[key] = s[key]
                        }
                        format = cell2.format;
                        if (!f && format && isDateFormat(format)) {
                            cell2.value = formulas.TEXT(v, "m/d/yyyy");
                        }
                    }!isEmpty(cell2) && rd.cells.push(cell2)
                }
                data.push(rd)
            }
            var sheetData = {
                    rows: data,
                    name: sheetName
                },
                columns = self.getCols($sheet),
                frozen = self.getFrozen($sheet);
            mc.length && (sheetData.mergeCells = mc);
            columns.length && (sheetData.columns = columns);
            frozen.r && (sheetData.frozenRows = frozen.r);
            frozen.c && (sheetData.frozenCols = frozen.c);
            return sheetData
        },
        Import: function(obj, fn) {
            var self = this,
                file = obj.file,
                content = obj.content,
                reader, rnd, url = obj.url,
                cb = function(data, type) {
                    fn(self.getWorkBook(data, obj.type || type, obj.sheets))
                },
                xhr;
            if (url) {
                rnd = "?" + Math.random();
                if (!window.Uint8Array) {
                    JSZipUtils.getBinaryContent(url + rnd, function(err, data) {
                        cb(data, "binary")
                    })
                } else {
                    xhr = new XMLHttpRequest;
                    xhr.open("GET", url + rnd, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function(e) {
                        if (this.status == 200) {
                            cb(xhr.response)
                        }
                    };
                    xhr.send()
                }
            } else if (file) {
                reader = new FileReader;
                reader.onload = function(e) {
                    cb(e.target.result)
                };
                reader.readAsArrayBuffer(file)
            } else if (content) {
                cb(content)
            }
        },
        match: function(str, re, indx) {
            var m = str.match(re);
            return m ? m[indx] : ""
        },
        preDefFormats: {
            1: "0",
            2: "0.00",
            3: "#,##0",
            4: "#,##0.00",
            5: "$#,##0_);($#,##0)",
            6: "$#,##0_);[Red]($#,##0)",
            7: "$#,##0.00_);($#,##0.00)",
            8: "$#,##0.00_);[Red]($#,##0.00)",
            9: "0%",
            10: "0.00%",
            11: "0.00E+00",
            12: "# ?/?",
            13: "# ??/??",
            14: "m/d/yyyy",
            15: "d-mmm-yy",
            16: "d-mmm",
            17: "mmm-yy",
            18: "h:mm AM/PM",
            19: "h:mm:ss AM/PM",
            20: "h:mm",
            21: "h:mm:ss",
            22: "m/d/yyyy h:mm",
            37: "#,##0_);(#,##0)",
            38: "#,##0_);[Red](#,##0)",
            39: "#,##0.00_);(#,##0.00)",
            40: "#,##0.00_);[Red](#,##0.00)",
            45: "mm:ss",
            46: "[h]:mm:ss",
            47: "mm:ss.0",
            48: "##0.0E+0",
            49: "@"
        },
        readPaths: function() {
            var files = this.files,
                $ContentType = $($.parseXML(files["[Content_Types].xml"].asText())),
                paths = this.paths = {
                    wb: "sheet.main",
                    ws: "worksheet",
                    st: "styles",
                    ss: "sharedStrings"
                };
            for (var key in paths) {
                paths[key] = $ContentType.find('[ContentType$="' + paths[key] + '+xml"]').attr("PartName")
            }
            for (key in files) {
                if (/workbook.xml.rels$/.test(key)) {
                    paths["wbrels"] = key;
                    break
                }
            }
            var $wbrels = $(this.getFileTextFromKey("wbrels")),
                $w = $(this.getFileTextFromKey("wb")),
                pathSheets = this.pathSheets = [];
            $w.find("sheet").each(function(i, sheet) {
                var $sheet = $(sheet),
                    rId = $sheet.attr("r:id"),
                    name = $sheet.attr("name"),
                    partial_path = $wbrels.find('[Id="' + rId + '"]').attr("Target"),
                    full_path = $ContentType.find('Override[PartName$="' + partial_path + '"]').attr("PartName");
                pathSheets.push({
                    name: name,
                    rId: rId,
                    path: full_path
                })
            })
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery,
        fn = _pq._pqGrid.prototype;
    fn.exportExcel = function(obj) {
        obj = obj || {};
        obj.format = "xlsx";
        return this.exportData(obj)
    };
    fn.exportCsv = function(obj) {
        obj = obj || {};
        obj.format = "csv";
        return this.exportData(obj)
    };
    fn.exportData = function(obj) {
        var e = new cExport(this, obj);
        return e.Export(obj)
    };
    var cExport = _pq.cExport = function(that, obj) {
        this.that = that
    };
    cExport.prototype = $.extend({
        copyStyle: function(cell, style) {
            var bg, fontSize, font, color, align, valign, arr;
            if (typeof style == "string") {
                arr = style.split(";");
                style = {};
                arr.forEach(function(_style) {
                    if (_style) {
                        arr = _style.split(":");
                        if (arr[0] && arr[1]) style[arr[0].trim()] = arr[1].trim()
                    }
                })
            }(bg = style.background) && (cell.bgColor = bg);
            (fontSize = style["font-size"]) && (cell.fontSize = parseFloat(fontSize));
            (color = style.color) && (cell.color = color);
            style["white-space"] == "normal" && (cell.wrap = true);
            (align = style["text-align"]) && (cell.align = align);
            (valign = style["vertical-align"]) && (cell.valign = valign);
            style["font-weight"] == "bold" && (cell.bold = true);
            (font = style["font-family"]) && (cell.font = font);
            style["font-style"] == "italic" && (cell.italic = true);
            style["text-decoration"] == "underline" && (cell.underline = true)
        },
        Export: function(obj) {
            var self = this,
                that = self.that,
                o = that.options,
                ret, GM = o.groupModel,
                remotePage = o.pageModel.type == "remote",
                offset = that.riOffset,
                iGV = that.iGenerateView,
                iMerge = that.iMerge,
                CM = that.colModel,
                CMLen = CM.length,
                hc = that.headerCells,
                hcLen = hc.length,
                TM = o.treeModel,
                curPage = GM.on && GM.dataIndx.length || remotePage || TM.dataIndx && TM.summary,
                data = curPage ? that.pdata : o.dataModel.data,
                data = o.summaryData ? data.concat(o.summaryData) : data,
                dataLen = data.length,
                render = obj.render,
                header = !obj.noheader,
                format = obj.format;
            if (that._trigger("beforeExport", null, obj) === false) {
                return false
            }
            if (format == "xlsx") {
                var w = self.getWorkbook(CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header, obj.sheetName);
                if (that._trigger("workbookReady", null, {
                        workbook: w
                    }) === false) {
                    return w
                }
                if (obj.workbook) {
                    return w
                }
                obj.workbook = w;
                return pq.excel.exportWb(obj)
            } else if (format == "json") {
                obj.data = self.getJsonContent(obj, data)
            } else if (format == "csv") {
                obj.data = self.getCSVContent(obj, CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header)
            } else {
                obj.data = self.getHtmlContent(obj, CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header)
            }
            ret = ret || self.postRequest(obj);
            that._trigger("exportData", null, obj);
            return ret
        },
        getTitle: function(cell, colIndx) {
            var title = cell.title;
            if (title) {
                if (typeof title == "function") {
                    title = title.call(this.that, {
                        colIndx: colIndx,
                        column: cell,
                        dataIndx: cell.dataIndx,
                        Export: true
                    })
                }
            } else {
                title = ""
            }
            return title
        },
        getXlsMergeCells: function(mc, hcLen, iMerge, dataLen) {
            mc = mc.concat(iMerge.getMergeCells(hcLen, this.curPage, dataLen));
            var mcs = [],
                toLetter = pq.toLetter,
                mcLen = mc.length;
            for (var i = 0; i < mcLen; i++) {
                var obj = mc[i];
                obj = toLetter(obj.c1) + (obj.r1 + 1) + ":" + toLetter(obj.c2) + (obj.r2 + 1);
                mcs.push(obj)
            }
            return mcs
        },
        getXlsCols: function(CM, CMLen) {
            var cols = [],
                col, column, width, i = 0,
                colWidthDefault = pq.excel.colWidth;
            for (; i < CMLen; i++) {
                column = CM[i];
                if (column.copy === false) {
                    continue
                }
                width = (column._width || colWidthDefault).toFixed(2) * 1;
                col = {};
                width !== colWidthDefault && (col.width = width);
                column.hidden && (col.hidden = true);
                if (!pq.isEmpty(col)) {
                    cols.length !== i && (col.indx = i);
                    cols.push(col)
                }
            }
            return cols
        },
        getXlsHeader: function(hc, hcLen, mc) {
            var self = this,
                rows = [];
            for (var i = 0; i < hcLen; i++) {
                var row = hc[i],
                    cells = [];
                for (var ci = 0, lenj = row.length; ci < lenj; ci++) {
                    var cell = row[ci];
                    if (cell.copy === false) {
                        continue
                    }
                    var colspan = cell.o_colspan,
                        rowspan = cell.rowSpan,
                        title = self.getTitle(cell, ci);
                    if (i > 0 && cell == hc[i - 1][ci]) {
                        title = ""
                    } else if (ci > 0 && cell == hc[i][ci - 1]) {
                        title = ""
                    } else if (colspan > 1 || rowspan > 1) {
                        mc.push({
                            r1: i,
                            c1: ci,
                            r2: i + rowspan - 1,
                            c2: ci + colspan - 1
                        })
                    }
                    cells.push({
                        value: title,
                        bgColor: "#eeeeee"
                    })
                }
                rows.push({
                    cells: cells
                })
            }
            return rows
        },
        getXlsBody: function(CM, CMLen, data, dataLen, remotePage, offset, iMerge, render, iGV) {
            var self = this,
                that = self.that,
                mergeCell, i, j, cv, f, value, column, objR, arr, dstyle, rows = [],
                cells, rowData, ri, rip, di, row, cell, cellattr, format;
            for (i = 0; i < dataLen; i++) {
                rowData = data[i];
                cells = [];
                ri = remotePage ? i + offset : i;
                rip = ri - offset;
                objR = {
                    rowIndx: ri,
                    rowIndxPage: rip,
                    rowData: rowData,
                    Export: true
                };
                for (j = 0; j < CMLen; j++) {
                    column = CM[j];
                    di = column.dataIndx;
                    cellattr = rowData.pq_cellattr;
                    value = rowData[di];
                    cv = value;
                    if (column.copy === false) {
                        continue
                    }
                    f = that.getFormula(rowData, di);
                    mergeCell = false;
                    if (iMerge.ismergedCell(ri, j)) {
                        if (!iMerge.isRootCell(ri, j, "o")) {
                            mergeCell = true
                        }
                    }
                    if (!mergeCell && !f) {
                        objR.colIndx = j;
                        objR.column = column;
                        objR.dataIndx = di;
                        arr = self.getRenderVal(objR, render, iGV);
                        cv = arr[0];
                        dstyle = arr[1]
                    }
                    format = self.getCellFormat(rowData, di) || column.format;
                    if (format) {
                        if (pq.isDateFormat(format)) {
                            if (cv !== value && $.datepicker.formatDate(format, new Date(value)) === cv) {
                                cv = value
                            }
                            format = pq.juiToExcel(format)
                        } else {
                            if (cv !== value && pq.formatNumber(value, format) === cv) {
                                cv = value
                            }
                            format = pq.numToExcel(format)
                        }
                    }
                    cell = {};
                    cv !== undefined && (cell.value = cv);
                    if (cellattr && (cellattr = cellattr[di]) && (cellattr = cellattr.style)) {
                        self.copyStyle(cell, cellattr)
                    }
                    dstyle && self.copyStyle(cell, dstyle);
                    f && (cell.formula = f);
                    format && (cell.format = format);
                    if (!pq.isEmpty(cell)) {
                        cell.dataIndx = di;
                        cells.length !== j && (cell.indx = j);
                        cells.push(cell)
                    }
                }
                row = {};
                cells.length && (row.cells = cells);
                rowData.pq_hidden && (row.hidden = true);
                if (!pq.isEmpty(row)) {
                    rows.length !== i && (row.indx = i);
                    rows.push(row)
                }
            }
            return rows
        },
        getCellFormat: function(rowData, di) {
            var format = rowData.pq_format;
            return format && format[di]
        },
        getWorkbook: function(CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header, sheetName) {
            var self = this,
                cols = self.getXlsCols(CM, CMLen),
                mc = [],
                tmp, o = self.that.options,
                fc = o.freezeCols,
                fr = o.freezeRows || 0,
                fr = header ? hcLen + fr : fr,
                _header = header ? self.getXlsHeader(hc, hcLen, mc) : [],
                mergeCells = self.getXlsMergeCells(mc, header ? hcLen : 0, iMerge, dataLen),
                body = self.getXlsBody(CM, CMLen, data, dataLen, remotePage, offset, iMerge, render, iGV),
                sheet = {
                    columns: cols,
                    rows: _header.concat(body)
                };
            mergeCells.length && (sheet.mergeCells = mergeCells);
            (tmp = _header.length) && (sheet.headerRows = tmp);
            fr && (sheet.frozenRows = fr);
            fc && (sheet.frozenCols = fc);
            (sheetName || (sheetName = o.title)) && (sheet.name = sheetName);
            return {
                sheets: [sheet]
            }
        },
        getHtmlHeader: function(hc, hcLen) {
            var self = this,
                header = [],
                cell, colspan, rowspan, title, align;
            for (var i = 0; i < hcLen; i++) {
                var row = hc[i],
                    laidCell = null;
                header.push("<tr>");
                for (var ci = 0, lenj = row.length; ci < lenj; ci++) {
                    cell = row[ci];
                    colspan = cell.colSpan;
                    if (cell.hidden || !colspan || cell.copy === false) {
                        continue
                    }
                    rowspan = cell.rowSpan;
                    if (i > 0 && cell == hc[i - 1][ci]) {} else if (laidCell && ci > 0 && cell == laidCell) {} else {
                        title = self.getTitle(cell, ci);
                        laidCell = cell;
                        align = cell.halign || cell.align;
                        align = align ? "align=" + align : "";
                        header.push("<th colspan=", colspan, " rowspan=", rowspan, " ", align, ">", title, "</th>")
                    }
                }
                header.push("</tr>")
            }
            return header.join("")
        },
        getHtmlBody: function(CM, CMLen, data, dataLen, remotePage, offset, iMerge, render, iGV) {
            var self = this,
                response = [],
                i, j, column, objN, objM, arr, dstyle, objR, rowData, ri, rip, cellData, attr, align;
            for (i = 0; i < dataLen; i++) {
                rowData = data[i];
                if (rowData.pq_hidden) {
                    continue
                }
                ri = remotePage ? i + offset : i;
                rip = ri - offset;
                objR = {
                    rowIndx: ri,
                    rowIndxPage: rip,
                    rowData: rowData,
                    Export: true
                };
                response.push("<tr>");
                for (j = 0; j < CMLen; j++) {
                    column = CM[j];
                    if (column.hidden || column.copy === false) {
                        continue
                    }
                    objN = null;
                    objM = null;
                    attr = "";
                    if (iMerge.ismergedCell(ri, j)) {
                        if (objM = iMerge.isRootCell(ri, j)) {
                            objN = iMerge.getRootCell(ri, j, "o");
                            objN.Export = true;
                            arr = self.getRenderVal(objN, render, iGV);
                            cellData = arr[0];
                            dstyle = arr[1]
                        } else {
                            continue
                        }
                        attr = "rowspan=" + objM.rowspan + " colspan=" + objM.colspan + " "
                    } else {
                        objR.colIndx = j;
                        objR.column = column;
                        objR.dataIndx = column.dataIndx;
                        arr = self.getRenderVal(objR, render, iGV);
                        cellData = arr[0];
                        dstyle = arr[1]
                    }
                    align = column.align;
                    attr += align ? "align=" + align : "";
                    cellData = cellData == null ? "" : cellData;
                    response.push("<td ", attr, dstyle ? ' style="' + dstyle + '"' : "", ">", cellData, "</td>")
                }
                response.push("</tr>")
            }
            return response.join("")
        },
        getHtmlContent: function(obj, CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header) {
            var self = this,
                that = self.that,
                cssRules = obj.cssRules || "",
                $tbl = that.element.find(".pq-grid-table"),
                fontFamily = $tbl.css("font-family"),
                fontSize = $tbl.css("font-size"),
                styleTable = "table{empty-cells:show;font-family:" + fontFamily + ";font-size:" + fontSize + ";border-collapse:collapse;}",
                response = [];
            response.push("<!DOCTYPE html><html><head>", '<meta charset="utf-8" />', "<title>", obj.title ? obj.title : "ParamQuery Pro", "</title>", "</head><body>", "<style>", styleTable, "td,th{padding: 5px;border:1px solid #ccc;}", cssRules, "</style>", "<table>");
            response.push(header ? self.getHtmlHeader(hc, hcLen, CM) : "");
            response.push(self.getHtmlBody(CM, CMLen, data, dataLen, remotePage, offset, iMerge, render, iGV));
            response.push("</table></body></html>");
            return response.join("")
        },
        getCsvHeader: function(hc, hcLen, CM, separator) {
            var self = this,
                header = [],
                csvRows = [],
                column, cell, title;
            for (var i = 0; i < hcLen; i++) {
                var row = hc[i],
                    laidCell = null;
                for (var ci = 0, lenj = row.length; ci < lenj; ci++) {
                    column = CM[ci];
                    if (column.hidden || column.copy === false) {
                        continue
                    }
                    cell = row[ci];
                    if (i > 0 && cell == hc[i - 1][ci]) {
                        header.push("")
                    } else if (laidCell && ci > 0 && cell == laidCell) {
                        header.push("")
                    } else {
                        title = self.getTitle(cell, ci);
                        title = title ? title.replace(/\"/g, '""') : "";
                        laidCell = cell;
                        header.push('"' + title + '"')
                    }
                }
                csvRows.push(header.join(separator));
                header = []
            }
            return csvRows
        },
        getCSVContent: function(obj, CM, CMLen, hc, hcLen, data, dataLen, remotePage, offset, iMerge, render, iGV, header) {
            var self = this,
                objM, objN, cv, i, j, separator = obj.separator || ",",
                objR, rowData, ri, rip, column, csvRows, response = [];
            csvRows = header ? self.getCsvHeader(hc, hcLen, CM, separator) : [];
            for (i = 0; i < dataLen; i++) {
                rowData = data[i];
                if (rowData.pq_hidden) {
                    continue
                }
                ri = remotePage ? i + offset : i;
                rip = ri - offset;
                objR = {
                    rowIndx: ri,
                    rowIndxPage: rip,
                    rowData: rowData,
                    Export: true
                };
                for (var j = 0; j < CMLen; j++) {
                    column = CM[j];
                    if (!column.hidden && column.copy !== false) {
                        objN = null;
                        objM = null;
                        if (iMerge.ismergedCell(ri, j)) {
                            if (objM = iMerge.isRootCell(ri, j)) {
                                objN = iMerge.getRootCell(ri, j, "o");
                                objN.Export = true;
                                cv = self.getRenderVal(objN, render, iGV)[0]
                            } else {
                                cv = ""
                            }
                        } else {
                            objR.colIndx = j;
                            objR.column = column;
                            objR.dataIndx = column.dataIndx;
                            cv = self.getRenderVal(objR, render, iGV)[0]
                        }
                        var cellData = (cv == null ? "" : cv) + "";
                        cellData = cellData.replace(/\"/g, '""');
                        response.push('"' + cellData + '"')
                    }
                }
                csvRows.push(response.join(separator));
                response = []
            }
            return csvRows.join("\n")
        },
        getJsonContent: function(obj, data) {
            function replacer(key, val) {
                if ((key + "").indexOf("pq_") === 0) {
                    return undefined
                }
                return val
            }
            return obj.nostringify ? data : JSON.stringify(data, obj.nopqdata ? replacer : null, obj.nopretty ? null : 2)
        },
        postRequest: function(obj) {
            var format = obj.format,
                data, decodeBase, url = obj.url,
                filename = obj.filename || "pqGrid";
            if (obj.zip && format != "xlsx") {
                var zip = new JSZip;
                zip.file(filename + "." + obj.format, obj.data);
                data = zip.generate({
                    type: "base64",
                    compression: "DEFLATE"
                });
                decodeBase = true;
                format = "zip"
            } else {
                decodeBase = obj.decodeBase ? true : false;
                data = obj.data
            }
            if (url) {
                $.ajax({
                    url: url,
                    type: "POST",
                    cache: false,
                    data: {
                        pq_ext: format,
                        pq_data: data,
                        pq_decode: decodeBase,
                        pq_filename: filename
                    },
                    success: function(filename) {
                        url = url + ((url.indexOf("?") > 0 ? "&" : "?") + "pq_filename=" + filename);
                        $(document.body).append("<iframe height='0' width='0' frameborder='0' src=\"" + url + '"></iframe>')
                    }
                })
            }
            return data
        }
    }, pq.mixin.render)
})(jQuery);
"use strict";
var objEx = pq.excel = {
    _tmpl: {
        rels: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="workbook.xml"/></Relationships>'
    },
    eachRow: function(sheetData, fn) {
        var rows = sheetData.rows,
            i = 0,
            len = rows.length;
        for (; i < len; i++) {
            fn(rows[i], i)
        }
    },
    exportWb: function(obj) {
        var workbook = obj.workbook,
            templates = this._tmpl,
            self = this,
            names = [],
            sheets = workbook.sheets,
            no = sheets.length,
            zip = new JSZip;
        zip.file("[Content_Types].xml", this.getContentTypes(no));
        sheets.forEach(function(sheet, i) {
            var $cols = self.getCols(sheet.columns),
                $frozen = self.getFrozen(sheet.frozenRows, sheet.frozenCols),
                $body = self.getBody(sheet.rows),
                $merge = self.getMergeCells(sheet.mergeCells);
            names.push(sheet.name);
            zip.file("worksheet" + (i + 1) + ".xml", self.getSheet($frozen, $cols, $body, $merge))
        });
        zip.file("workbook.xml", this.getWBook(names));
        zip.file("styles.xml", self.getStyle());
        var rels = zip.folder("_rels");
        rels.file(".rels", templates.rels);
        rels.file("workbook.xml.rels", this.getWBookRels(no));
        if (obj.url) {
            obj.data = zip.generate({
                type: "base64",
                compression: "DEFLATE"
            });
            obj.decodeBase = true;
            return pq.postRequest(obj)
        } else {
            return zip.generate({
                type: obj.type || "blob",
                compression: "DEFLATE"
            })
        }
    },
    eachCell: function(coll, fn) {
        coll.forEach(function(item) {
            var items;
            if (items = item.cells) {
                items.forEach(fn)
            } else if (items = item.rows) {
                this.eachCell(items, fn)
            }
        }, this)
    },
    getArray: function(sheetData) {
        var str = [],
            self = this;
        this.eachRow(sheetData, function(row) {
            var rowstr = [];
            row.cells.forEach(function(cell) {
                rowstr.push(self.getCell(cell))
            });
            str.push(rowstr)
        });
        return str
    },
    getBody: function(rows) {
        var self = this,
            formulas = pq.formulas,
            body = [],
            i, j, ri, ci, r, t, s, v, f, cell, cells, value, row, bgColor, color, font, fontSize, align, wrap, valign, bold, italic, uline, rowsLen = rows.length,
            cellsLen, hidden, format, formatFinal;
        for (i = 0; i < rowsLen; i++) {
            row = rows[i];
            cells = row.cells;
            cellsLen = cells.length;
            hidden = row.hidden ? 'hidden="1"' : "";
            ri = (row.indx || i) + 1;
            r = 'r="' + ri + '"';
            body.push("<row " + hidden + " " + r + ">");
            for (j = 0; j < cellsLen; j++) {
                cell = cells[j];
                value = cell.value;
                ci = cell.indx || j;
                t = "";
                s = "";
                r = ci === j ? "" : 'r="' + pq.toLetter(ci) + ri + '"';
                format = cell.format;
                bgColor = cell.bgColor;
                color = cell.color;
                font = cell.font;
                fontSize = cell.fontSize;
                bold = cell.bold;
                italic = cell.italic;
                uline = cell.underline;
                align = cell.align;
                wrap = cell.wrap;
                valign = cell.valign;
                f = cell.formula;
                f = f ? "<f>" + pq.escapeXml(f) + "</f>" : "";
                if (value == null) {
                    v = "<v></v>"
                } else if (value == parseFloat(value)) {
                    v = "<v>" + value + "</v>"
                } else if (format && formulas.isDate(value)) {
                    v = "<v>" + formulas.VALUE(value) + "</v>"
                } else if (typeof value == "boolean") {
                    v = "<v>" + (value ? "1" : "0") + "</v>";
                    t = 't="b"'
                } else {
                    t = 't="inlineStr"';
                    v = "<is><t><![CDATA[" + value + "]]></t></is>"
                }
                if (format || bgColor || color || fontSize || align || valign || wrap || bold || italic || uline) {
                    s = 's="' + self.getStyleIndx(format, bgColor, color, font, fontSize, align, valign, wrap, bold, italic, uline) + '"'
                }
                body.push("<c " + t + " " + r + " " + s + ">" + f + v + "</c>")
            }
            body.push("</row>")
        }
        return body.join("")
    },
    getCell: function(cell) {
        var f = cell.format,
            v = cell.value;
        return f ? pq.formulas.TEXT(v, f) : v
    },
    getCSV: function(sheetData) {
        var str = [],
            self = this;
        this.eachRow(sheetData, function(row) {
            var rowstr = [];
            row.cells.forEach(function(cell) {
                rowstr.push(self.getCell(cell))
            });
            str.push(rowstr.join(","))
        });
        return str.join("\r\n")
    },
    getColor: function() {
        var colors = {},
            padd = function(val) {
                return val.length === 1 ? "0" + val : val
            };
        return function(color) {
            var m, a, c = colors[color];
            if (!c) {
                if (/^#[0-9,a,b,c,d,e,f]{6}$/i.test(color)) {
                    a = color.replace("#", "")
                } else if (m = color.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i)) {
                    a = padd((m[1] * 1).toString(16)) + padd((m[2] * 1).toString(16)) + padd((m[3] * 1).toString(16))
                }
                if (a && a.length === 6) {
                    c = colors[color] = "ff" + a
                }
            }
            if (c) return c;
            else throw "invalid color: " + color
        }
    }(),
    _getCol: function(cols, min, max, hidden, width) {
        if (width) {
            if (width == this.colWidth && !hidden) {
                return
            }
            width = (width / this.colRatio).toFixed(2) * 1;
            width = ' customWidth="1" width="' + width + '"'
        }
        cols.push('<col min="', min, '" max="', max, '" hidden="', hidden, '"', width, "/>")
    },
    getCols: function(CM) {
        if (!CM || !CM.length) {
            return ""
        }
        var cols = [],
            min, max, oldWidth, oldHidden, col = 0,
            oldCol = 0,
            i = 0,
            len = CM.length;
        cols.push("<cols>");
        for (; i < len; i++) {
            var column = CM[i],
                hidden = column.hidden ? 1 : 0,
                width = column.width,
                indx = column.indx;
            col = (indx || col) + 1;
            if (oldWidth === width && oldHidden === hidden && col == oldCol + 1) {
                max = col
            } else {
                if (oldWidth != null) {
                    this._getCol(cols, min, max, oldHidden, oldWidth);
                    min = null
                }
                max = col;
                min == null && (min = col)
            }
            oldWidth = width;
            oldHidden = hidden;
            oldCol = col
        }
        this._getCol(cols, min, max, oldHidden, oldWidth);
        cols.push("</cols>");
        return cols.join("")
    },
    getContentTypes: function(no) {
        var arr = [],
            i = 1;
        for (; i <= no; i++) {
            arr.push('<Override PartName="/worksheet' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
        }
        return ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">', '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>', '<Override PartName="/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>', arr.join(""), '<Override PartName="/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>', "</Types>"].join("")
    },
    getFillIndx: function(bgColor) {
        var self = this,
            fs = self.fills = self.fills || {
                length: 2
            };
        return self.getIndx(fs, bgColor)
    },
    getFontIndx: function(color, font, fontSize, bold, italic, uline) {
        var self = this,
            fs = self.fonts = self.fonts || {
                length: 1
            };
        return self.getIndx(fs, (color || "") + "_" + (font || "") + "_" + (fontSize || "") + "_" + (bold || "") + "_" + (italic || "") + "_" + (uline || ""))
    },
    getFormatIndx: function(format) {
        var self = this,
            fs = self.formats = self.formats || {
                length: 164
            };
        return self.getIndx(fs, format)
    },
    getFrozen: function(r, c) {
        r = r || 0;
        c = c || 0;
        var topLeftCell = pq.toLetter(c) + (r + 1);
        return ['<sheetViews><sheetView workbookViewId="0">', '<pane xSplit="', c, '" ySplit="', r, '" topLeftCell="', topLeftCell, '" activePane="bottomLeft" state="frozen"/>', "</sheetView></sheetViews>"].join("")
    },
    getIndx: function(fs, val) {
        var indx = fs[val];
        if (indx == null) {
            indx = fs[val] = fs.length;
            fs.length++
        }
        return indx
    },
    getMergeCells: function(mc) {
        mc = mc || [];
        var mcs = [],
            i = 0,
            mcLen = mc.length;
        mcs.push('<mergeCells count="' + mcLen + '">');
        for (; i < mcLen; i++) {
            mcs.push('<mergeCell ref="', mc[i], '"/>')
        }
        mcs.push("</mergeCells>");
        return mcLen ? mcs.join("") : ""
    },
    getWBook: function(names) {
        return ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>', names.map(function(name, id) {
            id++;
            return ['<sheet name="', name ? pq.escapeXml(name) : "sheet" + id, '" sheetId="', id, '" r:id="rId', id, '"/>'].join("")
        }).join(""), "</sheets></workbook>"].join("")
    },
    getWBookRels: function(no) {
        var arr = [],
            i = 1;
        for (; i <= no; i++) {
            arr.push('<Relationship Id="rId' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="/worksheet' + i + '.xml"/>')
        }
        return ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">', arr.join(""), '<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="/styles.xml"/>', "</Relationships>"].join("")
    },
    getSheet: function($frozen, $cols, $body, $merge) {
        return ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">', $frozen, $cols, "<sheetData>", $body, "</sheetData>", $merge, "</worksheet>"].join("")
    },
    getStyleIndx: function(format, bgColor, color, font, fontSize, align, valign, wrap, bold, italic, uline) {
        var self = this,
            formatIndx = format ? self.getFormatIndx(format) : "",
            fillIndx = bgColor ? self.getFillIndx(bgColor) : "",
            fontIndx = color || font || fontSize || bold || italic || uline ? self.getFontIndx(color, font, fontSize, bold, italic, uline) : "",
            val = formatIndx + "_" + fillIndx + "_" + fontIndx + "_" + (align || "") + "_" + (valign || "") + "_" + (wrap || ""),
            fs = self.styles = self.styles || {
                length: 1
            };
        return self.getIndx(fs, val)
    },
    getStyle: function() {
        var formats = this.formats,
            color, fontSize, _font, fills = this.fills,
            fonts = this.fonts,
            bold, italic, uline, arr, formatIndx, fillIndx, fontIndx, align, valign, wrap, styles = this.styles,
            applyFill, applyFormat, applyFont, applyAlign, f1 = [],
            fill = [],
            font = [],
            xf = ['<xf numFmtId="0" applyNumberFormat="1"/>'],
            f;
        if (formats) {
            delete formats.length;
            for (f in formats) {
                f1.push('<numFmt numFmtId="' + formats[f] + '" formatCode="' + f + '"/>')
            }
            delete this.formats
        }
        if (fills) {
            delete fills.length;
            for (f in fills) {
                fill.push('<fill><patternFill patternType="solid"><fgColor rgb="' + this.getColor(f) + '"/></patternFill></fill>')
            }
            delete this.fills
        }
        if (fonts) {
            delete fonts.length;
            for (f in fonts) {
                arr = f.split("_");
                color = "<color " + (arr[0] ? 'rgb="' + this.getColor(arr[0]) + '"' : 'theme="1"') + " />";
                _font = '<name val="' + (arr[1] || "Calibri") + '"/>';
                fontSize = '<sz val="' + (arr[2] || 11) + '"/>';
                bold = arr[3] ? "<b/>" : "";
                italic = arr[4] ? "<i/>" : "";
                uline = arr[5] ? "<u/>" : "";
                font.push("<font>", bold, italic, uline, fontSize, color, _font, '<family val="2"/></font>')
            }
            delete this.fonts
        }
        if (styles) {
            delete styles.length;
            for (f in styles) {
                arr = f.split("_");
                formatIndx = arr[0];
                fillIndx = arr[1];
                fontIndx = arr[2];
                align = arr[3];
                valign = arr[4];
                wrap = arr[5];
                applyFill = fillIndx ? ' applyFill="1" fillId="' + fillIndx + '" ' : "";
                applyFont = fontIndx ? ' applyFont="1" fontId="' + fontIndx + '" ' : "";
                applyFormat = formatIndx ? ' applyNumberFormat="1" numFmtId="' + formatIndx + '"' : "";
                align = align ? ' horizontal="' + align + '" ' : "";
                valign = valign ? ' vertical="' + valign + '" ' : "";
                wrap = wrap ? ' wrapText="1" ' : "";
                applyAlign = align || valign || wrap ? ' applyAlignment="1"><alignment ' + align + valign + wrap + "/></xf>" : "/>";
                xf.push("<xf " + applyFormat + applyFill + applyFont + applyAlign)
            }
            delete this.styles
        }
        f1 = f1.join("\n");
        xf = xf.join("\n");
        fill = fill.join("\n");
        font = font.join("");
        return ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">', "<numFmts>", f1, "</numFmts>", "<fonts>", '<font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font>', font, "</fonts>", '<fills><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>', fill, "</fills>", '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>', '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>', "</cellStyleXfs>", "<cellXfs>", xf, "</cellXfs>", '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>', '<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>', "</styleSheet>"].join("")
    },
    importXl: function() {
        var o = pq.excelImport;
        return o.Import.apply(o, arguments)
    }
};
objEx.colRatio = 8;
objEx.colWidth = objEx.colRatio * 8.43;
pq.postRequest = function(obj) {
    var format = obj.format,
        data, decodeBase, url = obj.url,
        filename = obj.filename || "pqGrid";
    if (obj.zip && format != "xlsx") {
        var zip = new JSZip;
        zip.file(filename + "." + obj.format, obj.data);
        data = zip.generate({
            type: "base64",
            compression: "DEFLATE"
        });
        decodeBase = true;
        format = "zip"
    } else {
        decodeBase = obj.decodeBase ? true : false;
        data = obj.data
    }
    if (url) {
        $.ajax({
            url: url,
            type: "POST",
            cache: false,
            data: {
                pq_ext: format,
                pq_data: data,
                pq_decode: decodeBase,
                pq_filename: filename
            },
            success: function(filename) {
                url = url + ((url.indexOf("?") > 0 ? "&" : "?") + "pq_filename=" + filename);
                $(document.body).append("<iframe height='0' width='0' frameborder='0' src=\"" + url + '"></iframe>')
            }
        })
    }
    return data
};
(function($) {
    var _pq = $.paramquery;
    _pq.pqGrid.defaults.formulasModel = {
        on: true
    };
    _pq.pqGrid.prototype.getFormula = function(rd, di) {
        var fnW = this.iFormulas.getFnW(rd, di);
        return fnW ? fnW.fn : undefined
    };
    $(document).on("pqGrid:bootup", function(evt, ui) {
        var grid = ui.instance,
            FM = grid.options.formulasModel;
        if (FM.on) {
            grid.iFormulas = new cFormulas(grid)
        }
    });
    var cFormulas = _pq.cFormulas = function(that) {
        var self = this;
        self.that = that;
        self.fn = {};
        that.on("dataReadyDone", function() {
            self.onDataReadyDone()
        }).on("columnOrder", function() {
            self.onColumnOrder()
        }).on("beforeValidateDone", function(evt, ui) {
            self.onBeforeValidateDone(ui)
        }).on("autofillSeries", function(evt, ui) {
            self.onAutofill(ui)
        }).on("editorBegin", function(evt, ui) {
            self.onEditorBegin(ui)
        }).on("editorEnd", function() {
            self.onEditorEnd()
        }).on("editorKeyUp editorClick", function(evt, ui) {
            self.onEditorKeyUp(evt, ui)
        }).on(true, "change", function(evt, ui) {
            self.onChange(ui)
        })
    };
    $.extend(cFormulas, {
        deString: function(fn, cb, exec) {
            var arr = [];
            fn = fn.replace(/"(([^"]|"")+)"/g, function(a, b) {
                arr.push(b);
                return "#" + (arr.length - 1) + "#"
            });
            fn = cb(fn);
            arr.forEach(function(_str, i) {
                exec && (_str = _str.replace(/""/g, '\\"'));
                fn = fn.replace("#" + i + "#", '"' + _str + '"')
            });
            return fn
        },
        selectExp: function(val, pos) {
            var valPos = val.slice(0, pos).replace(/"[^"]*"/g, ""),
                m1, m2, remain, exp;
            if (!/"[^"]+$/.test(valPos)) {
                remain = val.slice(pos);
                if ((m1 = valPos.match(/.*?([a-z0-9:$]+)$/i)) && (remain === "" && (m2 = []) || (m2 = remain.match(/^([a-z0-9:$]+)?.*/i)))) {
                    exp = (m1[1] + (m2[1] == null ? "" : m2[1])).replace(/\$/g, "").toUpperCase();
                    return exp
                }
            }
        },
        shiftRC: function(that) {
            var self = cFormulas,
                maxRI = that ? that.get_p_data().length - 1 : 0,
                maxCI = that ? that.colModel.length - 1 : 0;
            return function(fn, diffX, diffY) {
                diffX && (fn = self.shiftC(fn, diffX, maxCI));
                diffY && (fn = self.shiftR(fn, diffY, maxRI));
                return fn
            }
        },
        shiftR: function(fn, diff, maxRI) {
            return cFormulas.deString(fn, function(_fn) {
                _fn = _fn.replace(/(\$?)([A-Z]+)(\$?)([\d]+)/g, function(full, dollar1, letter, dollar2, i) {
                    if (dollar2) {
                        return full
                    } else {
                        var ri = i * 1 + diff - 1;
                        ri = ri < 0 ? 0 : maxRI && ri > maxRI ? maxRI : ri;
                        return dollar1 + letter + (ri + 1)
                    }
                });
                return _fn.replace(/(\$?)([0-9]+):(\$?)([0-9]+)/g, function(full, dollar1, ri1, dollar2, ri2) {
                    var ri;
                    if (!dollar1) {
                        ri = ri1 * 1 + diff - 1;
                        ri = ri < 0 ? 0 : maxRI && ri > maxRI ? maxRI : ri;
                        ri1 = ri + 1
                    }
                    if (!dollar2) {
                        ri = ri2 * 1 + diff - 1;
                        ri = ri < 0 ? 0 : maxRI && ri > maxRI ? maxRI : ri;
                        ri2 = ri + 1
                    }
                    return dollar1 + ri1 + ":" + dollar2 + ri2
                })
            })
        },
        shiftC: function(fn, diff, maxCI) {
            return cFormulas.deString(fn, function(_fn) {
                _fn = _fn.replace(/(\$?)([A-Z]+)(\$?)([\d]+)/g, function(full, dollar1, letter, dollar2, i) {
                    if (dollar1) {
                        return full
                    } else {
                        var ci = pq.toNumber(letter) + diff;
                        ci = ci < 0 ? 0 : maxCI && ci > maxCI ? maxCI : ci;
                        return pq.toLetter(ci) + dollar2 + i
                    }
                });
                return _fn.replace(/(\$?)([A-Z]+):(\$?)([A-Z]+)/g, function(full, dollar1, letter1, dollar2, letter2) {
                    var c;
                    if (!dollar1) {
                        c = pq.toNumber(letter1) + diff;
                        c = c < 0 ? 0 : maxCI && c > maxCI ? maxCI : c;
                        letter1 = pq.toLetter(c)
                    }
                    if (!dollar2) {
                        c = pq.toNumber(letter2) + diff;
                        c = c < 0 ? 0 : maxCI && c > maxCI ? maxCI : c;
                        letter2 = pq.toLetter(c)
                    }
                    return dollar1 + letter1 + ":" + dollar2 + letter2
                })
            })
        }
    });
    cFormulas.prototype = {
        addRowIndx: function(addList) {
            addList.forEach(function(rObj) {
                var rd = rObj.newRow,
                    pq_fn = rd.pq_fn,
                    fn, key;
                if (pq_fn) {
                    for (key in pq_fn) {
                        fn = pq_fn[key];
                        fn.ri = fn.riO = rd.pq_ri
                    }
                }
            })
        },
        cell: function(exp) {
            var cell = this.toCell(exp),
                r = cell.r,
                c = cell.c;
            return this.valueArr(r, c)[0]
        },
        check: function(fn) {
            return cFormulas.deString(fn, function(fn) {
                fn = fn.split(" ").join("");
                return fn.toUpperCase().replace(/([A-Z]+)([0-9]+)\:([A-Z]+)([0-9]+)/g, function(full, c1, r1, c2, r2) {
                    c1 = pq.toNumber(c1);
                    c2 = pq.toNumber(c2);
                    if (c1 > c2) {
                        c1 = [c2, c2 = c1][0]
                    }
                    if (r1 * 1 > r2 * 1) {
                        r1 = [r2, r2 = r1][0]
                    }
                    return pq.toLetter(c1) + r1 + ":" + pq.toLetter(c2) + r2
                })
            })
        },
        computeAll: function() {
            var self = this,
                that = self.that,
                present;
            self.initObj();
            self.eachFormula(function(fnW) {
                fnW.clean = 0;
                present = true
            });
            if (present) {
                self.eachFormula(function(fnW, rd, di, ri, isMain) {
                    rd[di] = self.execIfDirty(fnW);
                    isMain && that.isValid({
                        rowIndx: ri,
                        rowData: rd,
                        dataIndx: di,
                        allowInvalid: true
                    })
                })
            }
        },
        eachFormula: function(fn) {
            var self = this,
                isMain = true,
                that = self.that,
                cb = function(rd, ri, pq_fn) {
                    var di, fnW;
                    for (di in pq_fn) {
                        fnW = pq_fn[di];
                        if (typeof fnW != "string") {
                            fn(fnW, rd, di, ri, isMain)
                        }
                    }
                },
                cb2 = function(data) {
                    data = data || [];
                    var i = data.length,
                        rd, pq_fn;
                    while (i--)(rd = data[i]) && (pq_fn = rd.pq_fn) && cb(rd, i, pq_fn)
                };
            cb2(that.get_p_data());
            isMain = false;
            cb2(that.options.summaryData)
        },
        execIfDirty: function(fnW) {
            if (!fnW.clean) {
                fnW.clean = .5;
                fnW.val = this.exec(fnW.fn, fnW.ri, fnW.ci);
                fnW.clean = 1
            } else if (fnW.clean == .5) {
                return
            }
            return fnW.val
        },
        exec: function(_fn, r, c) {
            var self = this,
                obj = self.obj,
                fn = cFormulas.deString(_fn, function(fn) {
                    fn = fn.replace(/(\$?([A-Z]+)?\$?([0-9]+)?\:\$?([A-Z]+)?\$?([0-9]+)?)/g, function(a, b) {
                        obj[b] = obj[b] || self.range(b);
                        return "obj['" + b + "']"
                    });
                    fn = fn.replace(/(?:[^:]|^)(\$?[A-Z]+\$?[0-9]+)(?!:)/g, function(a, b) {
                        obj[b] = obj[b] || self.cell(b);
                        var first = a.charAt(0);
                        return (a === b ? "" : first == "$" ? "" : first) + b
                    });
                    fn = fn.replace(/{/g, "[").replace(/}/g, "]").replace(/(?:[^><])(=+)/g, function(a, b) {
                        return a + (b.length === 1 ? "=" : "")
                    }).replace(/<>/g, "!=").replace(/&/g, "+");
                    return fn
                }, true);
            obj.getRange = function() {
                return {
                    r1: r,
                    c1: c
                }
            };
            with(obj) {
                try {
                    var v = eval(fn);
                    if (typeof v == "function") {
                        v = "#NAME?"
                    } else if (typeof v == "string") {
                        cFormulas.deString(v, function(fn) {
                            if (fn.indexOf("function") >= 0) {
                                v = "#NAME?"
                            }
                        })
                    }
                    v !== v && (v = null)
                } catch (ex) {
                    v = typeof ex == "string" ? ex : ex.message
                }
                return v
            }
        },
        initObj: function() {
            this.obj = $.extend({
                iFormula: this
            }, pq.formulas)
        },
        onAutofill: function(ui) {
            var sel = ui.sel,
                self = this,
                that = self.that,
                r = sel.r,
                c = sel.c,
                xDir = ui.x,
                rd = that.getRowData({
                    rowIndx: r
                }),
                CM = that.colModel,
                maxCi = CM.length - 1,
                maxRi = that.get_p_data().length - 1,
                di = CM[c].dataIndx,
                fnW = self.getFnW(rd, di);
            fnW && (ui.series = function(x) {
                return "=" + (xDir ? cFormulas.shiftC(fnW.fn, x - 1, maxCi) : cFormulas.shiftR(fnW.fn, x - 1, maxRi))
            })
        },
        onBeforeValidateDone: function(ui) {
            var self = this,
                colIndxs = this.that.colIndxs,
                fn = function(list) {
                    list.forEach(function(rObj) {
                        var newRow = rObj.newRow,
                            val, di, rd = rObj.rowData,
                            fnW;
                        for (di in newRow) {
                            val = newRow[di];
                            if (typeof val == "string" && val[0] === "=") {
                                ui.allowInvalid = true;
                                var fn = self.check(val),
                                    fnWOld = rd ? self.getFnW(rd, di) : null;
                                if (fnWOld) {
                                    if (fn !== fnWOld.fn) {
                                        rObj.oldRow[di] = "=" + fnWOld.fn;
                                        self.save(rd, di, fn, rObj.rowIndx, colIndxs[di])
                                    }
                                } else {
                                    self.save(rd || newRow, di, fn, rObj.rowIndx, colIndxs[di])
                                }
                            } else if (rd) {
                                if (fnW = self.remove(rd, di)) {
                                    rObj.oldRow[di] = "=" + fnW.fn
                                }
                            }
                        }
                    })
                };
            fn(ui.addList);
            fn(ui.updateList)
        },
        onChange: function(ui) {
            this.addRowIndx(ui.addList);
            if (!ui.addList.length && !ui.deleteList.length) {
                this.computeAll();
                ui.source === "edit" && this.that.refresh()
            }
        },
        onColumnOrder: function() {
            var self = this,
                ciNew, diff, that = self.that,
                shift = cFormulas.shiftRC(that),
                colIndxs = that.colIndxs;
            self.eachFormula(function(fnW, rd, di) {
                ciNew = colIndxs[di];
                if (fnW.ci != ciNew) {
                    diff = ciNew - fnW.ciO;
                    fnW.ci = ciNew;
                    fnW.fn = shift(fnW.fnOrig, diff, fnW.ri - fnW.riO)
                }
            });
            ciNew != null && self.computeAll()
        },
        onEditorBegin: function(ui) {
            var fnW = this.getFnW(ui.rowData, ui.dataIndx);
            fnW && ui.$editor.val("=" + fnW.fn)
        },
        onEditorEnd: function() {
            pq.intel.hide()
        },
        onEditorKeyUp: function(evt, ui) {
            var $ed = ui.$editor,
                ed = $ed[0],
                val = ed.value,
                i = pq.intel,
                pos = ed.selectionEnd;
            if (val && val.indexOf("=") === 0) {
                i.popup(val, pos, $ed);
                this.select(val, pos)
            }
        },
        onDataReadyDone: function() {
            var self = this,
                present, that = self.that,
                shift = cFormulas.shiftRC(that),
                colIndxs = that.colIndxs,
                cb = function(rd, riNew, pq_fn) {
                    var fnW, di, diff;
                    for (di in pq_fn) {
                        fnW = pq_fn[di];
                        present = true;
                        if (typeof fnW == "string") {
                            self.save(rd, di, self.check(fnW), riNew, colIndxs[di])
                        } else if (fnW.ri != riNew) {
                            diff = riNew - fnW.riO;
                            fnW.ri = riNew;
                            fnW.fn = shift(fnW.fnOrig, fnW.ci - fnW.ciO, diff)
                        }
                    }
                },
                cb2 = function(data) {
                    data = data || [];
                    var i = data.length,
                        rd, pq_fn;
                    while (i--)(rd = data[i]) && (pq_fn = rd.pq_fn) && cb(rd, i, pq_fn)
                };
            cb2(that.get_p_data());
            cb2(that.options.summaryData);
            self.initObj();
            present && self.computeAll()
        },
        getFnW: function(rd, di) {
            var fn;
            if (fn = rd.pq_fn) {
                return fn[di]
            }
        },
        remove: function(rd, di) {
            var pq_fn = rd.pq_fn,
                fnW;
            if (pq_fn && (fnW = pq_fn[di])) {
                delete pq_fn[di];
                if (pq.isEmpty(pq_fn)) {
                    delete rd.pq_fn
                }
                return fnW
            }
        },
        range: function(exp) {
            var arr = exp.split(":"),
                that = this.that,
                cell1 = this.toCell(arr[0]),
                r1 = cell1.r,
                c1 = cell1.c,
                cell2 = this.toCell(arr[1]),
                r2 = cell2.r,
                c2 = cell2.c;
            return this.valueArr(r1 == null ? 0 : r1, c1 == null ? 0 : c1, r2 == null ? that.get_p_data().length - 1 : r2, c2 == null ? that.colModel.length - 1 : c2)
        },
        save: function(rd, di, fn, ri, ci) {
            var fns, fn_checked = fn.replace(/^=/, ""),
                fnW = {
                    clean: 0,
                    fn: fn_checked,
                    fnOrig: fn_checked,
                    riO: ri,
                    ciO: ci,
                    ri: ri,
                    ci: ci
                };
            fns = rd.pq_fn = rd.pq_fn || {};
            fns[di] = fnW;
            return fnW
        },
        selectRange: function(val, pos) {
            var exp = cFormulas.selectExp(val, pos),
                arr, m1, m2, range;
            if (exp) {
                if (/^([a-z0-9]+):([a-z0-9]+)$/i.test(exp)) {
                    arr = exp.split(":");
                    m1 = this.toCell(arr[0]);
                    m2 = this.toCell(arr[1]);
                    range = {
                        r1: m1.r,
                        c1: m1.c,
                        r2: m2.r,
                        c2: m2.c
                    }
                } else if (/^[a-z]+[0-9]+$/i.test(exp)) {
                    m1 = this.toCell(exp);
                    range = {
                        r1: m1.r,
                        c1: m1.c
                    }
                }
                return range
            }
        },
        select: function(val, pos) {
            var range = this.selectRange(val, pos),
                that = this.that;
            range ? that.Range(range).select() : that.Selection().removeAll()
        },
        toCell: function(address) {
            var m = address.match(/\$?([A-Z]+)?\$?(\d+)?/);
            return {
                c: m[1] ? pq.toNumber(m[1]) : null,
                r: m[2] ? m[2] - 1 : null
            }
        },
        valueArr: function(r1, c1, r2, c2) {
            var that = this.that,
                CM = that.colModel,
                clen = CM.length,
                ri, ci, rd, di, fnW, val, arr = [],
                arr2 = [],
                _arr2 = [],
                data = that.get_p_data(),
                dlen = data.length;
            r2 = r2 == null ? r1 : r2;
            c2 = c2 == null ? c1 : c2;
            r1 = r1 < 0 ? 0 : r1;
            c1 = c1 < 0 ? 0 : c1;
            r2 = r2 >= dlen ? dlen - 1 : r2;
            c2 = c2 >= clen ? clen - 1 : c2;
            for (ri = r1; ri <= r2; ri++) {
                rd = data[ri];
                for (ci = c1; ci <= c2; ci++) {
                    di = CM[ci].dataIndx;
                    if (fnW = this.getFnW(rd, di)) {
                        val = this.execIfDirty(fnW)
                    } else {
                        val = rd[di]
                    }
                    arr.push(val);
                    _arr2.push(val)
                }
                arr2.push(_arr2);
                _arr2 = []
            }
            arr.get2Arr = function() {
                return arr2
            };
            arr.getRange = function() {
                return {
                    r1: r1,
                    c1: c1,
                    r2: r2,
                    c2: c2
                }
            };
            return arr
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var pq = window.pq = window.pq || {};
    pq.intel = {
        removeFn: function(text) {
            var len = text.length,
                len2;
            text = text.replace(/[a-z]*\([^()]*\)/gi, "");
            len2 = text.length;
            return len === len2 ? text : this.removeFn(text)
        },
        removeStrings: function(text) {
            text = text.replace(/"[^"]*"/g, "");
            return text.replace(/"[^"]*$/, "")
        },
        getMatch: function(text, exact) {
            var obj = pq.formulas,
                arr = [],
                fn;
            text = text.toUpperCase();
            for (fn in obj) {
                if (exact) {
                    if (fn === text) {
                        return [fn]
                    }
                } else if (fn.indexOf(text) === 0) {
                    arr.push(fn)
                }
            }
            return arr
        },
        intel: function(text) {
            text = this.removeStrings(text);
            text = this.removeFn(text);
            var re = /^=(.*[,+\-&*\s(><=])?([a-z]+)((\()[^)]*)?$/i,
                m, fn, exact;
            if (m = text.match(re)) {
                fn = m[2];
                m[4] && (exact = true)
            }
            return [fn, exact]
        },
        movepos: function(val) {
            var m;
            if (m = val.match(/([^a-z].*)/i)) {
                return val.indexOf(m[1]) + 1
            }
            return val.length
        },
        intel3: function(val, pos) {
            if (pos < val.length && /=(.*[,+\-&*\s(><=])?[a-z]+$/i.test(val.slice(0, pos))) {
                pos += this.movepos(val.slice(pos))
            }
            var valPos = val.substr(0, pos),
                fn = this.intel(valPos);
            return fn
        },
        item: function(fn) {
            var desc = this.that.options.strFormulas;
            desc = desc ? desc[fn] : null;
            return "<div>" + (desc ? desc[0] : fn) + "</div>" + (desc ? "<div style='font-size:0.9em;color:#888;margin-bottom:5px;'>" + desc[1] + "</div>" : "")
        },
        popup: function(val, pos, $editor) {
            var $grid = $editor.closest(".pq-grid"),
                $old_intel = $(".pq-intel"),
                $parent = $grid,
                fn, fns, content, arr = this.intel3(val, pos);
            this.that = $grid.pqGrid("instance");
            $old_intel.remove();
            if (fn = arr[0]) {
                fns = this.getMatch(fn, arr[1]);
                content = fns.map(this.item, this).join("");
                if (content) {
                    $("<div class='pq-intel' style='width:350px;max-height:300px;overflow:auto;background:#fff;border:1px solid gray;box-shadow: 4px 4px 2px #aaaaaa;padding:5px;'></div>").appendTo($parent).html(content).position({
                        my: "center top",
                        at: "center bottom",
                        collision: "flipfit",
                        of: $editor,
                        within: $parent
                    })
                }
            }
        },
        hide: function() {
            $(".pq-intel").remove()
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var _pq = $.paramquery;
    $(document).on("pqGrid:bootup", function(evt, ui) {
        var grid = ui.instance;
        new _pq.cEditor(grid)
    });
    _pq.cEditor = function cEditor(that) {
        var self = this;
        self.that = that;
        that.on("editorBeginDone", function(evt, ui) {
            ui.$td[0].edited = true;
            self.fixWidth(ui)
        }).on("editorEnd", function(evt, ui) {
            ui.$td[0].edited = false;
            cancelAnimationFrame(self.id)
        }).on("editorKeyDown", function(evt, ui) {
            self.id = requestAnimationFrame(function() {
                self.fixWidth(ui)
            })
        })
    };
    _pq.cEditor.prototype = {
        escape: function(val) {
            return val.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/</g, "&lt;")
        },
        fixWidth: function(ui) {
            var self = this,
                that = self.that,
                $td = ui.$td,
                widthTD = $td[0].offsetWidth,
                $editor = ui.$editor;
            if ($editor[0].type == "text") {
                var val = self.escape($editor.val()),
                    $grid = that.widget(),
                    gridWd = $grid.width(),
                    $span = $("<span style='position:absolute;top:0;left:0;visibilty:hidden;'><pre>" + val + "</pre></span>").appendTo($grid),
                    width = parseInt($span.width()) + 25;
                $span.remove();
                width = width > gridWd ? gridWd : width > widthTD ? width : widthTD
            } else {
                width = widthTD
            }
            $editor.css("width", width + "px");
            self.position($editor, $grid, $td)
        },
        position: function($editor, $grid, $td) {
            $editor.closest(".pq-editor-outer").css("border-width", "0").position({
                my: "left center",
                at: "left center",
                of: $td,
                collision: "fit",
                within: $grid
            })
        }
    }
})(jQuery);
(function($) {
    "use strict";
    var f = pq.formulas = {
        evalify: function(arr, cond) {
            var m = cond.match(/([><=]{1,2})?(.*)/),
                m1 = m[1] || "=",
                m2 = m[2],
                reg, isNumber, self = this;
            if (/(\*|\?)/.test(m2)) {
                reg = m2.replace(/\*/g, ".*").replace(/\?/g, "\\S").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
            } else {
                m1 = m1 === "=" ? "==" : m1 === "<>" ? "!=" : m1;
                isNumber = this.isNumber(m2)
            }
            return arr.map(function(val) {
                if (reg) {
                    val = val == null ? "" : val;
                    val = (m1 === "<>" ? "!" : "") + "/^" + reg + '$/i.test("' + val + '")'
                } else if (isNumber) {
                    if (self.isNumber(val)) {
                        val = val + m1 + m2
                    } else {
                        val = "false"
                    }
                } else {
                    val = val == null ? "" : val;
                    val = '"' + (val + "").toUpperCase() + '"' + m1 + '"' + (m2 + "").toUpperCase() + '"'
                }
                return val
            })
        },
        get2Arr: function(arr) {
            return arr.get2Arr ? arr.get2Arr() : arr
        },
        isNumber: function(val) {
            return parseFloat(val) == val
        },
        _reduce: function(arr, arr2) {
            var len = arr.length,
                _arr = [],
                _arr2 = arr2.map(function(a) {
                    return []
                });
            arr.forEach(function(val, indx) {
                if (val != null) {
                    val = val * 1;
                    if (!isNaN(val)) {
                        _arr.push(val);
                        _arr2.forEach(function(_a, i) {
                            _a.push(arr2[i][indx])
                        })
                    }
                }
            });
            return [_arr, _arr2]
        },
        reduce: function(arg) {
            arg = this.toArray(arg);
            var arr = arg.shift(),
                arr2 = arg.filter(function(_arr, indx) {
                    return indx % 2 == 0
                }),
                a = this._reduce(arr, arr2);
            arr = a[0];
            arr2 = a[1];
            return [arr].concat(arg.map(function(item, indx) {
                return indx % 2 == 0 ? arr2[indx / 2] : arg[indx]
            }))
        },
        strDate1: "(\\d{1,2})/(\\d{1,2})/(\\d{2,4})",
        strDate2: "(\\d{4})-(\\d{1,2})-(\\d{1,2})",
        strTime: "(\\d{1,2})(:(\\d{1,2}))?(:(\\d{1,2}))?(\\s(AM|PM))?",
        isDate: function(val) {
            return this.reDate.test(val) && Date.parse(val) || val && val.constructor == Date
        },
        toArray: function(arg) {
            var arr = [],
                i = 0,
                len = arg.length;
            for (; i < len; i++) {
                arr.push(arg[i])
            }
            return arr
        },
        valueToDate: function(val) {
            var dt = new Date(Date.UTC(1900, 0, 1));
            dt.setUTCDate(dt.getUTCDate() + val - 2);
            return dt
        },
        varToDate: function(val) {
            var val2, mt, m, d, y;
            if (this.isNumber(val)) {
                val2 = this.valueToDate(val)
            } else if (val.getTime) {
                val2 = val
            } else if (typeof val == "string") {
                if (mt = val.match(this.reDateTime)) {
                    if (mt[12]) {
                        y = mt[13] * 1;
                        d = mt[15] * 1;
                        m = mt[14] * 1
                    } else {
                        m = mt[2] * 1;
                        d = mt[3] * 1;
                        y = mt[4] * 1
                    }
                } else if (mt = val.match(this.reDate2)) {
                    y = mt[1] * 1;
                    d = mt[3] * 1;
                    m = mt[2] * 1
                } else if (mt = val.match(this.reDate1)) {
                    m = mt[1] * 1;
                    d = mt[2] * 1;
                    y = mt[3] * 1
                }
                if (mt) {
                    val = Date.UTC(y, m - 1, d)
                } else {
                    throw "#N/A date"
                }
                val2 = new Date(val)
            }
            return val2
        },
        _IFS: function(arg, fn) {
            var len = arg.length,
                i = 0,
                arr = [],
                a = 0;
            for (; i < len; i = i + 2) {
                arr.push(this.evalify(arg[i], arg[i + 1]))
            }
            var condsIndx = arr[0].length,
                lenArr = len / 2,
                j;
            while (condsIndx--) {
                for (j = 0; j < lenArr; j++) {
                    if (!eval(arr[j][condsIndx])) {
                        break
                    }
                }
                a += j === lenArr ? fn(condsIndx) : 0
            }
            return a
        },
        ABS: function(val) {
            return Math.abs(val.map ? val[0] : val)
        },
        ACOS: function(val) {
            return Math.acos(val)
        },
        AND: function() {
            var arr = this.toArray(arguments);
            return eval(arr.join(" && "))
        },
        ASIN: function(val) {
            return Math.asin(val)
        },
        ATAN: function(val) {
            return Math.atan(val)
        },
        _AVERAGE: function(arr) {
            var count = 0,
                sum = 0;
            arr.forEach(function(val) {
                if (parseFloat(val) == val) {
                    sum += val * 1;
                    count++
                }
            });
            if (count) {
                return sum / count
            }
            throw "#DIV/0!"
        },
        AVERAGE: function() {
            return this._AVERAGE(pq.flatten(arguments))
        },
        AVERAGEIF: function(range, cond, avg_range) {
            return this.AVERAGEIFS(avg_range || range, range, cond)
        },
        AVERAGEIFS: function() {
            var args = this.reduce(arguments),
                count = 0,
                avg_range = args.shift(),
                sum = this._IFS(args, function(condIndx) {
                    count++;
                    return avg_range[condIndx]
                });
            if (!count) {
                throw "#DIV/0!"
            }
            return sum / count
        },
        TRUE: true,
        FALSE: false,
        CEILING: function(val) {
            return Math.ceil(val)
        },
        CHAR: function(val) {
            return String.fromCharCode(val)
        },
        CHOOSE: function() {
            var arr = pq.flatten(arguments),
                num = arr[0];
            if (num > 0 && num < arr.length) {
                return arr[num]
            } else {
                throw "#VALUE!"
            }
        },
        CODE: function(val) {
            return (val + "").charCodeAt(0)
        },
        COLUMN: function(val) {
            return (val || this).getRange().c1 + 1
        },
        COLUMNS: function(arr) {
            var r = arr.getRange();
            return r.c2 - r.c1 + 1
        },
        CONCATENATE: function() {
            var arr = pq.flatten(arguments),
                str = "";
            arr.forEach(function(val) {
                str += val
            });
            return str
        },
        COS: function(val) {
            return Math.cos(val)
        },
        _COUNT: function(arg) {
            var arr = pq.flatten(arg),
                self = this,
                empty = 0,
                values = 0,
                numbers = 0;
            arr.forEach(function(val) {
                if (val == null || val === "") {
                    empty++
                } else {
                    values++;
                    if (self.isNumber(val)) {
                        numbers++
                    }
                }
            });
            return [empty, values, numbers]
        },
        COUNT: function() {
            return this._COUNT(arguments)[2]
        },
        COUNTA: function() {
            return this._COUNT(arguments)[1]
        },
        COUNTBLANK: function() {
            return this._COUNT(arguments)[0]
        },
        COUNTIF: function(range, cond) {
            return this.COUNTIFS(range, cond)
        },
        COUNTIFS: function() {
            return this._IFS(arguments, function() {
                return 1
            })
        },
        DATE: function(year, month, date) {
            if (year < 0 || year > 9999) {
                throw "#NUM!"
            } else if (year <= 1899) {
                year += 1900
            }
            return this.VALUE(new Date(Date.UTC(year, month - 1, date)))
        },
        DATEVALUE: function(val) {
            return this.DATEDIF("1/1/1900", val, "D") + 2
        },
        DATEDIF: function(start, end, unit) {
            var to = this.varToDate(end),
                from = this.varToDate(start),
                months, endTime = to.getTime(),
                startTime = from.getTime(),
                diffDays = (endTime - startTime) / (1e3 * 60 * 60 * 24);
            if (unit === "Y") {
                return parseInt(diffDays / 365)
            } else if (unit === "M") {
                months = to.getUTCMonth() - from.getUTCMonth() + 12 * (to.getUTCFullYear() - from.getUTCFullYear());
                if (from.getUTCDate() > to.getUTCDate()) {
                    months--
                }
                return months
            } else if (unit === "D") {
                return diffDays
            } else {
                throw "unit N/A"
            }
        },
        DAY: function(val) {
            return this.varToDate(val).getUTCDate()
        },
        DAYS: function(end, start) {
            return this.DATEDIF(start, end, "D")
        },
        DEGREES: function(val) {
            return 180 / Math.PI * val
        },
        EOMONTH: function(val, i) {
            i = i || 0;
            var dt = this.varToDate(val);
            dt.setUTCMonth(dt.getUTCMonth() + i + 1);
            dt.setUTCDate(0);
            return this.VALUE(dt)
        },
        EXP: function(val) {
            return Math.exp(val)
        },
        FIND: function(val, str, start) {
            return str.indexOf(val, start ? start - 1 : 0) + 1
        },
        FLOOR: function(val, num) {
            if (val * num < 0) {
                return "#NUM!"
            }
            return parseInt(val / num) * num
        },
        HLOOKUP: function(val, arr, row, approx) {
            approx == null && (approx = true);
            arr = this.get2Arr(arr);
            var col = this.MATCH(val, arr[0], approx ? 1 : 0);
            return this.INDEX(arr, row, col)
        },
        HOUR: function(val) {
            if (Date.parse(val)) {
                var d = new Date(val);
                return d.getHours()
            } else {
                return val * 24
            }
        },
        IF: function(cond, truthy, falsy) {
            return cond ? truthy : falsy
        },
        INDEX: function(arr, row, col) {
            arr = this.get2Arr(arr);
            row = row || 1;
            col = col || 1;
            if (typeof arr[0].push == "function") {
                return arr[row - 1][col - 1]
            } else {
                return arr[row > 1 ? row - 1 : col - 1]
            }
        },
        INDIRECT: function(ref) {
            var iF = this.iFormula;
            return iF.cell(ref.toUpperCase())
        },
        LARGE: function(arr, n) {
            arr.sort();
            return arr[arr.length - (n || 1)]
        },
        LEFT: function(val, x) {
            return val.substr(0, x || 1)
        },
        LEN: function(val) {
            val = (val.map ? val : [val]).map(function(val) {
                return val.length
            });
            return val.length > 1 ? val : val[0]
        },
        LOOKUP: function(val, arr1, arr2) {
            arr2 = arr2 || arr1;
            var col = this.MATCH(val, arr1, 1);
            return this.INDEX(arr2, 1, col)
        },
        LOWER: function(val) {
            return (val + "").toLocaleLowerCase()
        },
        _MAXMIN: function(arr, factor) {
            var max, self = this;
            arr.forEach(function(val) {
                if (val != null) {
                    val = self.VALUE(val);
                    if (self.isNumber(val) && (val * factor > max * factor || max == null)) {
                        max = val
                    }
                }
            });
            return max != null ? max : 0
        },
        MATCH: function(val, arr, type) {
            var isNumber = this.isNumber(val),
                _isNumber, sign, indx, _val, i = 0,
                len = arr.length;
            type == null && (type = 1);
            val = isNumber ? val : val.toUpperCase();
            if (type === 0) {
                arr = this.evalify(arr, val + "");
                for (i = 0; i < len; i++) {
                    _val = arr[i];
                    if (eval(_val)) {
                        indx = i + 1;
                        break
                    }
                }
            } else {
                for (i = 0; i < len; i++) {
                    _val = arr[i];
                    _isNumber = this.isNumber(_val);
                    _val = arr[i] = _isNumber ? _val : _val ? _val.toUpperCase() : "";
                    if (val == _val) {
                        indx = i + 1;
                        break
                    }
                }
                if (!indx) {
                    for (i = 0; i < len; i++) {
                        _val = arr[i];
                        _isNumber = this.isNumber(_val);
                        if (type * (_val < val ? -1 : 1) === 1 && isNumber == _isNumber) {
                            indx = i;
                            break
                        }
                    }
                    indx = indx == null ? i : indx
                }
            }
            if (indx) {
                return indx
            }
            throw "#N/A"
        },
        MAX: function() {
            var arr = pq.flatten(arguments);
            return this._MAXMIN(arr, 1)
        },
        MEDIAN: function() {
            var arr = pq.flatten(arguments).filter(function(val) {
                    return val * 1 == val
                }).sort(function(a, b) {
                    return b - a
                }),
                len = arr.length,
                len2 = len / 2;
            return len2 === parseInt(len2) ? (arr[len2 - 1] + arr[len2]) / 2 : arr[(len - 1) / 2]
        },
        MID: function(val, x, num) {
            if (x < 1 || num < 0) {
                throw "#VALUE!"
            }
            return val.substr(x - 1, num)
        },
        MIN: function() {
            var arr = pq.flatten(arguments);
            return this._MAXMIN(arr, -1)
        },
        MODE: function() {
            var arr = pq.flatten(arguments),
                obj = {},
                freq, rval, rfreq = 0;
            arr.forEach(function(val) {
                freq = obj[val] = obj[val] ? obj[val] + 1 : 1;
                if (rfreq < freq) {
                    rfreq = freq;
                    rval = val
                }
            });
            if (rfreq < 2) {
                throw "#N/A"
            }
            return rval
        },
        MONTH: function(val) {
            return this.varToDate(val).getUTCMonth() + 1
        },
        OR: function() {
            var arr = this.toArray(arguments);
            return eval(arr.join(" || "))
        },
        PI: function() {
            return Math.PI
        },
        POWER: function(num, pow) {
            return Math.pow(num, pow)
        },
        PRODUCT: function() {
            var arr = pq.flatten(arguments),
                a = 1;
            arr.forEach(function(val) {
                a *= val
            });
            return a
        },
        PROPER: function(val) {
            val = val.replace(/(\S+)/g, function(val) {
                return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase()
            });
            return val
        },
        RADIANS: function(val) {
            return Math.PI / 180 * val
        },
        RAND: function() {
            return Math.random()
        },
        RANK: function(val, arr, order) {
            var r = JSON.stringify(arr.getRange()),
                self = this,
                key = r + "_range";
            arr = this[key] || function() {
                self[key] = arr;
                return arr.sort(function(a, b) {
                    return a - b
                })
            }();
            var i = 0,
                len = arr.length;
            for (; i < len; i++) {
                if (val === arr[i]) {
                    return order ? i + 1 : len - i
                }
            }
        },
        RATE: function() {},
        REPLACE: function(val, start, num, _char) {
            val += "";
            return val.substr(0, start - 1) + _char + val.substr(start + num - 1)
        },
        REPT: function(val, num) {
            var str = "";
            while (num--) {
                str += val
            }
            return str
        },
        RIGHT: function(val, x) {
            x = x || 1;
            return val.substr(-1 * x, x)
        },
        _ROUND: function(val, digits, fn) {
            var multi = Math.pow(10, digits),
                val2 = val * multi,
                _int = parseInt(val2),
                frac = val2 - _int;
            return fn(_int, frac) / multi
        },
        ROUND: function(val, digits) {
            return this._ROUND(val, digits, function(_int, frac) {
                var absFrac = Math.abs(frac);
                return _int + (absFrac >= .5 ? absFrac / frac : 0)
            })
        },
        ROUNDDOWN: function(val, digits) {
            return this._ROUND(val, digits, function(_int) {
                return _int
            })
        },
        ROUNDUP: function(val, digits) {
            return this._ROUND(val, digits, function(_int, frac) {
                return _int + (frac ? Math.abs(frac) / frac : 0)
            })
        },
        ROW: function(val) {
            return (val || this).getRange().r1 + 1
        },
        ROWS: function(arr) {
            var r = arr.getRange();
            return r.r2 - r.r1 + 1
        },
        SEARCH: function(val, str, start) {
            val = val.toUpperCase();
            str = str.toUpperCase();
            return str.indexOf(val, start ? start - 1 : 0) + 1
        },
        SIN: function(val) {
            return Math.sin(val)
        },
        SMALL: function(arr, n) {
            arr.sort();
            return arr[(n || 1) - 1]
        },
        SQRT: function(val) {
            return Math.sqrt(val)
        },
        _STDEV: function(arr) {
            arr = pq.flatten(arr);
            var len = arr.length,
                avg = this._AVERAGE(arr),
                sum = 0;
            arr.forEach(function(x) {
                sum += (x - avg) * (x - avg)
            });
            return [sum, len]
        },
        STDEV: function() {
            var arr = this._STDEV(arguments);
            if (arr[1] === 1) {
                throw "#DIV/0!"
            }
            return Math.sqrt(arr[0] / (arr[1] - 1))
        },
        STDEVP: function() {
            var arr = this._STDEV(arguments);
            return Math.sqrt(arr[0] / arr[1])
        },
        SUBSTITUTE: function(text, old, new_text, indx) {
            var a = 0;
            return text.replace(new RegExp(old, "g"), function(m) {
                a++;
                return indx ? a === indx ? new_text : old : new_text
            })
        },
        SUM: function() {
            var arr = pq.flatten(arguments),
                sum = 0,
                self = this;
            arr.forEach(function(val) {
                val = self.VALUE(val);
                if (self.isNumber(val)) {
                    sum += parseFloat(val)
                }
            });
            return sum
        },
        SUMIF: function(range, cond, sum_range) {
            return this.SUMIFS(sum_range || range, range, cond)
        },
        SUMIFS: function() {
            var args = this.reduce(arguments),
                sum_range = args.shift();
            return this._IFS(args, function(condIndx) {
                return sum_range[condIndx]
            })
        },
        SUMPRODUCT: function() {
            var arr = this.toArray(arguments);
            arr = arr[0].map(function(val, i) {
                var prod = 1;
                arr.forEach(function(_arr) {
                    var val = _arr[i];
                    prod *= parseFloat(val) == val ? val : 0
                });
                return prod
            });
            return pq.aggregate.sum(arr)
        },
        TAN: function(val) {
            return Math.tan(val)
        },
        TEXT: function(val, format) {
            if (this.isNumber(val) && format.indexOf("#") >= 0) {
                return pq.formatNumber(val, format)
            } else {
                return $.datepicker.formatDate(pq.excelToJui(format), this.varToDate(val))
            }
        },
        TIME: function(h, m, s) {
            return (h + m / 60 + s / 3600) / 24
        },
        TIMEVALUE: function(val) {
            var m = val.match(this.reTime);
            if (m && m[1] != null && (m[3] != null || m[7] != null)) {
                var mH = m[1] * 1,
                    mM = (m[3] || 0) * 1,
                    mS = (m[5] || 0) * 1,
                    am = (m[7] || "").toUpperCase(),
                    v = mH + mM / 60 + mS / 3600
            }
            if (0 <= v && (am && v < 13 || !am && v < 24)) {
                if (am == "PM" && mH < 12) {
                    v += 12
                } else if (am == "AM" && mH == 12) {
                    v -= 12
                }
                return v / 24
            }
            throw "#VALUE!"
        },
        TODAY: function() {
            var d = new Date;
            return this.VALUE(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))
        },
        TRIM: function(val) {
            return val.replace(/^\s+|\s+$/gm, "")
        },
        TRUNC: function(val, num) {
            num = Math.pow(10, num || 0);
            return ~~(val * num) / num
        },
        UPPER: function(val) {
            return (val + "").toLocaleUpperCase()
        },
        VALUE: function(val) {
            var m, val2;
            if (!val) {
                val2 = 0
            } else if (parseFloat(val) == val) {
                val2 = parseFloat(val)
            } else if (this.isDate(val)) {
                val2 = this.DATEVALUE(val)
            } else if (m = val.match(this.reDateTime)) {
                var dt = m[1] || m[12],
                    t = val.substr(dt.length + 1);
                val2 = this.DATEVALUE(dt) + this.TIMEVALUE(t)
            } else if (m = val.match(this.reTime)) {
                val2 = this.TIMEVALUE(val)
            } else {
                val2 = val.replace(/[^0-9\-.]/g, "");
                val2 = val2.replace(/(\.[1-9]*)0+$/, "$1").replace(/\.$/, "")
            }
            return val2
        },
        VAR: function() {
            var arr = this._STDEV(arguments);
            return arr[0] / (arr[1] - 1)
        },
        VARP: function() {
            var arr = this._STDEV(arguments);
            return arr[0] / arr[1]
        },
        VLOOKUP: function(val, arr, col, approx) {
            approx == null && (approx = true);
            arr = this.get2Arr(arr);
            var arrCol = arr.map(function(arr) {
                    return arr[0]
                }),
                row = this.MATCH(val, arrCol, approx ? 1 : 0);
            return this.INDEX(arr, row, col)
        },
        YEAR: function(val) {
            return this.varToDate(val).getUTCFullYear()
        }
    };
    f.reDate1 = new RegExp("^" + f.strDate1 + "$");
    f.reDate2 = new RegExp("^" + f.strDate2 + "$");
    f.reDate = new RegExp("^" + f.strDate1 + "$|^" + f.strDate2 + "$");
    f.reTime = new RegExp("^" + f.strTime + "$", "i");
    f.reDateTime = new RegExp("^(" + f.strDate1 + ")\\s" + f.strTime + "$|^(" + f.strDate2 + ")\\s" + f.strTime + "$")
})(jQuery);
