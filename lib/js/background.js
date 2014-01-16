(function($, _, chrome, document, window){
    "use strict";
    var currentTabId;

    _.mixin({
        trimValues : function(array) {
            for(var i = 0, l = array.length; i < l; i++){
                if (typeof array[i] === "string"){
                    array[i] = array[i].trim();
                }
            }
        }
    });

    function init(tabId, changeInfo, tab) {
        // If the letter 'g' is found in the tab's URL...
        currentTabId = tabId;
        if ( tab.url.indexOf('chrome://') == 0 ) {
            // don't show on chrome pages
        } else {
            chrome.pageAction.show(tabId);
            /*
            chrome.pageAction.setIcon({
                path: "/lib/i/48.png"
                ,tabId: tabId
            });
            */
        }
    };

    window.reloadCSS = {
        content:{
            getAll: function(callback){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: "getCSSList"}, function(response) {
                        return callback({
                            list: response.list
                        });
                    });
                });
            },
            getCSSList: function(callback){

                // chrome.tabs.sendRequest( currentTabId, "getCSSList", function(ops){
                //    return callback({
                //        list: ops.list
                //    });
                // });
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: "getCSSList"}, function(response) {
                        return callback({
                            list: response.list
                        });
                    });
                });
            },
            start:function(ops){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.pageAction.setIcon({
                        path: "/lib/i/48.png"
                        ,tabId: tabs[0].id
                    })
                    chrome.tabs.sendMessage(tabs[0].id, {action: "start", ops: ops}, function(response) {});
                });
            },
            stop:function(){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.pageAction.setIcon({
                        path: "/lib/i/48_bw.png"
                        ,tabId: tabs[0].id
                    });
                    chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {});
                });
            }
        },
        background:{
            getUserOps:function(callback){
                callback( reloadCSS.user.getOptions() );
            },
            getPageOps:function(url, callback){
                callback( {} );
            }
        },
        user: {
            getOptions:function(){
                return {
                    scope: 'selected-css'
                }
            }
        }
    }
    // Listen for any changes to the URL of any tab.
    chrome.tabs.onUpdated.addListener(init);


})(window.Zepto, window._, window.chrome, document, window);