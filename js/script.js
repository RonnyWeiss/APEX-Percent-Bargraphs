var apexSkillBar = (function () {
    "use strict";
    var scriptVersion = "1.0.3";
    var util = {
        version: "1.3.2",
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        debug: {
            info: function (str) {
                if (util.isAPEX()) {
                    apex.debug.info(str);
                }
            },
            error: function (str) {
                if (util.isAPEX()) {
                    apex.debug.error(str);
                } else {
                    console.error(str);
                }
            }
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
            if (util.isAPEX()) {
                return apex.util.escapeHTML(String(str));
            } else {
                str = String(str);
                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;")
                    .replace(/\//g, "&#x2F;");
            }
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                if (util.isAPEX()) {
                    apex.util.showSpinner($(id));
                } else {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader");
                    faLoader.css("text-align", "center");
                    faLoader.css("width", "100%");
                    faLoader.css("display", "block");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-2x fa-anim-spin");
                    faRefresh.css("background", "rgba(121,121,121,0.6)");
                    faRefresh.css("border-radius", "100%");
                    faRefresh.css("padding", "15px");
                    faRefresh.css("color", "white");

                    /* append loader */
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
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
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "35px 0")
                    .addClass("dominfomessagediv");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass(icon || "fa-info-circle-o")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px")
                    .css("color", color || "inhherit");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("text-overflow", "ellipsis")
                    .css("overflow", "hidden")
                    .css("white-space", "nowrap")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

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
        var value = 0;
        $.each(pData, function (idx, data) {
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
        render: function (regionID, ajaxID, noDataFoundMessage, items2Submit, escapeRequired, refreshTime, offlineData) {
            var parentID = "#" + regionID + "-p";

            /************************************************************************
             **
             ** Used to get data from APEX
             **
             ***********************************************************************/
            function getData() {
                $(parentID).css("min-height", "120px");
                util.loader.start(parentID);

                var submitItems = items2Submit;
                try {
                    apex.server.plugin(
                        ajaxID, {
                            pageItems: submitItems
                        }, {
                            success: function (pData) {
                                prepareData(parentID, pData, noDataFoundMessage, escapeRequired)
                            },
                            error: function (d) {
                                console.error(d.responseText);
                            },
                            dataType: "json"
                        });
                } catch (e) {
                    console.error("Error while try to get Data from APEX");
                    console.error(e);
                    // try to work offline
                    try {
                        if (offlineData) {
                            prepareData(parentID, offlineData, noDataFoundMessage, escapeRequired);
                        }
                    } catch (e) {
                        console.error("Error while try to run native mode");
                        console.error(e);
                    }
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
                console.error("Error while try to bind APEX refresh event");
                console.error(e);
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
