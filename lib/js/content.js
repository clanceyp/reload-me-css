(function($, _, context){
    var link = document.getElementsByTagName( 'link' ),
        arrayMethods = Object.getOwnPropertyNames( Array.prototype ),
        isActive = false,
        state = 0,
        counter = 2,
        usersettings = {
            timermessage:"CSS reloading in"
        };

    arrayMethods.forEach( attachArrayMethodsToNodeList );

    function attachArrayMethodsToNodeList(methodName) {
        NodeList.prototype[methodName] = Array.prototype[methodName];
    };
    var reloadcss = {
        options : {
            frequency:DEFAULTS.frequency,
            scope:DEFAULTS.scope,
            fileList :[]
        },
        isValidCSSFile:function( href ){
            if (href && href.length && href.indexOf('reload-me-css.css') === -1 && href.indexOf('.css') !== -1 && href.indexOf('chrome-extension://') === -1){
                return true;
            }
            return false;
        },
        makeLabel:function(href){
            return href.split('/').pop().split('?').shift() ;
        },
        isChecked: function(href){
            var checked = false,
                  i =   _.where( reloadcss.options.fileList , {url: href, checked: true}).length ;
            if (i > 0 ){
                checked = true;
            }
            return checked;
        },
        log: function( message ){
            if (DEBUG){
                console.log( message );
            }
        }
    }
    function init(){

        document.querySelector('body').addEventListener('dblclick', toggleActive, false);
        Zepto('body').append('<div id="reload-me-css" class="reload-css-notstarted">'+ usersettings.timermessage +' '+ counter + ' </div>');
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

            if (request.action && request.action === "getCSSList"){
                var list = [],
                      fileList = reloadcss.options.fileList;
                if (fileList.length === 0){
                    $('link').each(function(index){
                        var href = $(this).attr('href');
                        if ( reloadcss.isValidCSSFile( href ) ){
                            // debugger;
                            list.push(href);
                            fileList.push({
                                url:href,
                                label: reloadcss.makeLabel( href ),
                                checked: reloadcss.isChecked( href )
                            });
                        }
                    });
                }
                sendResponse( { // this will be executed in the popup scope
                    list: list,
                    fileList: reloadcss.options.fileList,
                    scope: reloadcss.options.scope,
                    frequency: reloadcss.options.frequency,
                    isActive: isActive
                } );
                console.log('out',{ // this will be executed in the popup scope
                    list: list,
                    fileList: reloadcss.options.fileList,
                    scope: reloadcss.options.scope,
                    frequency: reloadcss.options.frequency,
                    isActive: isActive
                } )
            } else if (request.action && request.action === "start"){
                console.log('in', request);
                counter = 2;
                state = 1;
                isActive = true;
                reloadcss.options.frequency = request.ops.frequency;
                reloadcss.options.scope = request.ops.scope;
                reloadcss.options.fileList = request.ops.fileList;

                $("#reload-me-css").removeClass('reload-css-notstarted');
                window._chromeExtension_updateCssHrefInterval = window.setInterval(incrementCounter, 1000);
                
            } else if (request.action && request.action === "stop"){
                state = 0;
                counter = 2;
                isActive = false;
                $("#reload-me-css").addClass('reload-css-notstarted');
                window.clearInterval( window._chromeExtension_updateCssHrefInterval );
            } else {
                // console.log(request);
            }
        });
    }
    function incrementCounter(){

        if (state === 0){
            return false;
        }
        counter--;

        if (counter < 0 && isActive){
            counter = reloadcss.options.frequency ;
            $("#reload-me-css").text(usersettings.timermessage +' '+ counter);
            updateCssHref();
        } else if (!isActive){
            $("#reload-me-css").text("CSS reloading disabled");
        }else {
            $("#reload-me-css").text(usersettings.timermessage +' '+ counter);
        }
        return true;
    }
    function updateCssHref(){

        if (!isActive || link.length === 0 ) {
            console.log('CSS Reload', link.length, isActive);
            return false;
        }

        var date = new Date,
            t = date.getTime(),
            l = link.length;
        link.forEach(function( sheet , index ){
            var href = sheet.getAttribute( 'oHref' ) || sheet.getAttribute( 'href' ),
                  hrefParsed = href,
                  reload = (reloadcss.isChecked( href ) || reloadcss.options.scope === "all-css"),
                  isValidCSSFile = reloadcss.isValidCSSFile( href );
            if (!sheet.getAttribute( 'oHref' )){
                sheet.setAttribute( 'oHref' , href );
            }
            if (reload && isValidCSSFile)    { // update href if it exists
                hrefParsed = (href.indexOf('_reload-css-nocache=')  >= 0 ) ? href.substring(0, href.indexOf('_reload-css-nocache=')-1 ) : href;// remove nocashe if exists

                hrefParsed = hrefParsed + (hrefParsed.indexOf("?") >= 0 ? "&" : "?") + "_reload-css-nocache=" + (new Date).getTime();
                sheet.setAttribute( 'href' , hrefParsed );
                if (DEBUG){
                    console.log('Updated stylesheet  at ' , date  , href);
                }
            // } else {
                // console.log(' else ',reload, isValidCSSFile, href);
            }
        });
        /*
        link.forEach(function( sheet , index ){
            var href = sheet.getAttribute( 'href' );

            if (href && href.indexOf('reload-me-css.css') === -1 ){ // update href if it exists
                href = (href.indexOf('_reload-css-nocache=')  >= 0 ) ? href.substring(0, href.indexOf('_reload-css-nocache=')-1 ) : href;// remove nocashe if exists

                href = href + (href.indexOf("?") >= 0 ? "&" : "?") + "_reload-css-nocache=" + (new Date).getTime();
                sheet.setAttribute( 'href' , href );
                if (l-1 === index){
                    console.log(  (l-1) +' stylesheets updated at ' , date, href );
                }
            }
        });
        */
        return true;
    }

    function toggleActive(){
        isActive = (!isActive) ;
        if (isActive){
            $("#reload-me-css").removeClass('reload-css-disabled');
        } else {
            $("#reload-me-css").addClass('reload-css-disabled');
        }
        console.log(  'Css reload is now ', isActive );
    }

    init();


})(window.$, window._, window);