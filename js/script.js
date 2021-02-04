var apexSkillBar = (function () {
    "use strict";
    var util = {
        featureDetails: {
            name: "APEX Percent Bargraph",
            scriptVersion: "1.1",
            utilVersion: "1.4",
            url: "https://github.com/RonnyWeiss",
            license: "MIT"
        },
        escapeHTML: function (str) {
            if (str === null) {
                return null;
            }
            if (typeof str === "undefined") {
                return;
            }
            if (typeof str === "object") {
                try {
                    str = JSON.stringify(str);
                } catch (e) {
                    /*do nothing */
                }
            }
            return apex.util.escapeHTML(String(str));
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                apex.util.showSpinner($(id));
            },
            stop: function (id, removeMinHeight) {
                if (removeMinHeight) {
                    $(id).css("min-height", "");
                }
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        printDOMMessage: {
            show: function (id, text, icon, color) {
                if ($(id).height() >= 150) {
                    var div = $("<div></div>")
                        .css("margin", "12px")
                        .css("text-align", "center")
                        .css("padding", "10px 0")
                        .addClass("dominfomessagediv");

                    var subDiv = $("<div></div>");

                    var iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .addClass("fa-2x")
                        .css("height", "32px")
                        .css("width", "32px")
                        .css("margin-bottom", "16px")
                        .css("color", color || "#D0D0D0");

                    subDiv.append(iconSpan);

                    var textSpan = $("<span></span>")
                        .text(text)
                        .css("display", "block")
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px");

                    div
                        .append(subDiv)
                        .append(textSpan);
                } else {
                    var div = $("<div></div>")
                        .css("margin", "10px")
                        .css("text-align", "center")
                        .addClass("dominfomessagediv");

                    var iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .css("font-size", "22px")
                        .css("line-height", "26px")
                        .css("margin-right", "5px")
                        .css("color", color || "#D0D0D0");

                    var textSpan = $("<span></span>")
                        .text(text)
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px")
                        .css("line-height", "20px");

                    div
                        .append(iconSpan)
                        .append(textSpan);
                }
                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.dominfomessagediv').remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-search");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        }
    };
    /************************************************************************
     **
     ** Used to render the html into region
     **
     ***********************************************************************/
    function renderHTML(pParentID, pData, pEscapeHTML) {

        apex.debug.info({
            "fct": util.featureDetails.name + " - " + "renderHTML",
            "pParentID": pParentID,
            "pData": pData,
            "pEscapeHTML": pEscapeHTML,
            "featureDetails": util.featureDetails
        });

        $.each(pData, function (idx, data) {
            var value = 0;
            if (data.VALUE && data.VALUE <= 100 && data.VALUE >= 0) {
                value = data.VALUE
            }

            // create whole bar div
            var skillBar = $("<div></div>");
            skillBar.addClass("skillbar");
            skillBar.addClass("clearfix");
            skillBar.attr("data-percent", value + "%");

            // create title div
            var skillBarTitle = $("<div></div>");
            skillBarTitle.addClass("skillbar-title");
            if (data.TITLE_COLOR) {
                skillBarTitle.css("background", util.escapeHTML(data.TITLE_COLOR));
            }

            // create span for title div
            var span = $("<span></span>");

            if (pEscapeHTML !== false) {
                span.text(data.TITLE);
            } else {
                span.html(data.TITLE);
            }

            skillBarTitle.append(span);

            skillBar.append(skillBarTitle);

            // create bar
            var skillBarBar = $("<div></div>");
            skillBarBar.addClass("skillbar-bar");
            if (data.BAR_COLOR) {
                skillBarBar.css("background", util.escapeHTML(data.BAR_COLOR));
            }

            skillBar.append(skillBarBar);

            // create percent bar
            var skillBarPercent = $("<div></div>");
            skillBarPercent.addClass("skill-bar-percent");
            skillBarPercent.text(value + "%");

            skillBar.append(skillBarPercent);

            $(pParentID).append(skillBar);

        });

        $(pParentID).find(".skillbar").each(function () {
            $(this).find('.skillbar-bar').animate({
                width: $(this).attr('data-percent')
            }, 1500);
        });
    }
    /************************************************************************
     **
     ** Used to check data and to call rendering
     **
     ***********************************************************************/
    function prepareData(pParentID, pData, pNoDataFound, pEscapeHTML) {
        /* empty container for new stuff */
        $(pParentID).empty();

        if (pData.row && pData.row.length > 0) {
            renderHTML(pParentID, pData.row, pEscapeHTML);
        } else {
            $(pParentID).css("min-height", "");
            util.noDataMessage.show(pParentID, pNoDataFound);
        }
        util.loader.stop(pParentID);
    }

    return {
        render: function (regionID, ajaxID, noDataFoundMessage, items2Submit, escapeRequired, refreshTime) {

            apex.debug.info({
                "fct": util.featureDetails.name + " - " + "initialize",
                "arguments": {
                    "regionID": regionID,
                    "ajaxID": ajaxID,
                    "noDataFoundMessage": noDataFoundMessage,
                    "items2Submit": items2Submit,
                    "escapeRequired": escapeRequired,
                    "refreshTime": refreshTime
                },
                "featureDetails": util.featureDetails
            });

            var parentID = "#" + regionID + "-p";

            /************************************************************************
             **
             ** Used to get data from APEX
             **
             ***********************************************************************/
            function getData() {
                $(parentID).css("min-height", "150px");
                util.loader.start(parentID);

                var submitItems = items2Submit;
                try {
                    apex.server.plugin(
                        ajaxID, {
                            pageItems: submitItems
                        }, {
                            success: function (pData) {
                                apex.debug.info({
                                    "fct": util.featureDetails.name + " - " + "getData",
                                    "msg": "AJAX data received",
                                    "pData": pData,
                                    "featureDetails": util.featureDetails
                                });
                                prepareData(parentID, pData, noDataFoundMessage, escapeRequired)
                            },
                            error: function (d) {
                                apex.debug.error({
                                    "fct": util.featureDetails.name + " - " + "getData",
                                    "msg": "AJAX data error",
                                    "response": d,
                                    "featureDetails": util.featureDetails
                                });
                            },
                            dataType: "json"
                        });
                } catch (e) {
                    apex.debug.error({
                        "fct": util.featureDetails.name + " - " + "getData",
                        "msg": "Error while try to get Data from APEX",
                        "err": e,
                        "featureDetails": util.featureDetails
                    });
                }
            }

            // load data
            getData();

            /************************************************************************
             **
             ** Used to bind APEx Refresh event (DA's)
             **
             ***********************************************************************/
            try {
                apex.jQuery("#" + regionID).bind("apexrefresh", function () {
                    getData();
                });
            } catch (e) {
                apex.debug.error({
                    "fct": util.featureDetails.name + " - " + "initialize",
                    "msg": "Error while try to bind APEX refresh event",
                    "err": e,
                    "featureDetails": util.featureDetails
                });
            }

            /************************************************************************
             **
             ** Used to refresh by a timer
             **
             ***********************************************************************/
            if (refreshTime && refreshTime > 0) {
                setInterval(function () {
                    getData();
                }, refreshTime * 1000);
            }
        }
    }
})();
