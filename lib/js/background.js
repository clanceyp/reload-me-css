(function(_, chrome, document, window){
    "use strict";
    var currentTabId;

    window.reloadCSS = {

        drawIcon: function(starty, startx, bg) {
            // if (!document.getElementById('canvas')) {
            //     var element = document.createElement('canvas');
            //     element.id = 'canvas';
            //     document.getElementsByTagName('body')[0].appendChild( element );
            // }
            // var canvas = document.getElementById('canvas'),
            //     context = canvas.getContext('2d'),
            //     img = new Image();
            // img.src = bg;
            // img.onload = function () {
            //     context.drawImage(img,0,2);
            // }
            // context.fillStyle = "rgba(255,0,0,1)";
            // context.fillRect(startx % 19, starty % 19, 10, 10);
            // context.fillStyle = "white";
            // context.font = "11px Arial";
            // context.fillText("3",0,19);
            // return context.getImageData(0, 0, 19, 19);
        },
        content:{
            getCSSList: function(callback){

                // chrome.tabs.sendRequest( currentTabId, "getCSSList", function(ops){
                //    return callback({
                //        list: ops.list
                //    });
                // });
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: "getCSSList"}, function(response) {
                        return callback( response );
                    });
                });
            },
            start:function(ops){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.pageAction.setIcon({
                        // imageData: reloadCSS.drawIcon(10, 0, "/lib/i/48.png"),
                        path: "/lib/i/48.png",
                        tabId: tabs[0].id
                    });
                    chrome.tabs.sendMessage(tabs[0].id, {action: "start", ops: ops}, function(response) {});
                });
            },
            stop:function(){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.pageAction.setIcon({
                        // imageData: reloadCSS.drawIcon(10, 0, "/lib/i/48_bw.png"),
                        path: "/lib/i/48_bw.png",
                        tabId: tabs[0].id
                    });
                    chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {});
                });
            }
        },
        background:{
            getUserOps:function(callback){
                throw new Error("Not implemented");
                callback( reloadCSS.user.getOptions() );
            }
        },
        user: {
            getOptions:function(){
                throw new Error("Not implemented");
                return {
                    scope: DEFAULTS.scope
                }
            }
        },
        init:function(tabId, changeInfo, tab) {
            currentTabId = tabId;
            if ( tab.url.indexOf('chrome://') == 0 ) {
                // don't show on chrome pages
            } else {
                    chrome.tabs.sendMessage(tabId, {action: "getCSSList"}, function(response) {
                        if (response.fileList.length > 0){
                            chrome.pageAction.show(tabId);
                        }
                    });
                
            }
        }
    }
    // Listen for any changes to the URL of any tab.
    chrome.tabs.onUpdated.addListener(reloadCSS.init);


})(window._, window.chrome, document, window);


