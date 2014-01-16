(function(){
    var link = document.getElementsByTagName( 'link' ),
        arrayMethods = Object.getOwnPropertyNames( Array.prototype ),
        isActive = false,
        state = 0,
        counter = 0,
        usersettings = {
            timer:5,
            timermessage:"CSS reloading in"
        };

    arrayMethods.forEach( attachArrayMethodsToNodeList );

    function attachArrayMethodsToNodeList(methodName) {
        NodeList.prototype[methodName] = Array.prototype[methodName];
    };

    function init(){
        counter = usersettings.timer;

        document.querySelector('body').addEventListener('dblclick', toggleActive, false);
        Zepto('body').append('<div id="reload-me-css" class="reload-css-notstarted">'+ usersettings.timermessage +' ?</div>');
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
            if (request.action && request.action === "getCSSList"){
                var list = [];

                $('link').each(function(index){
                    var href = $(this).attr('href');
                    if (href && href.length){
                        list.push(href);
                    }
                });

                sendResponse( { // this will be executed in the popup scope
                    list: list
                });
            } else if (request.action && request.action === "start"){
                state = 1;
                isActive = true;
                $("#reload-me-css").removeClass('reload-css-notstarted');
                window._chromeExtension_updateCssHrefInterval = window.setInterval(incrementCounter, 1000);
            } else if (request.action && request.action === "stop"){
                state = 0;
                $("#reload-me-css").addClass('reload-css-notstarted');
                window.clearInterval( window._chromeExtension_updateCssHrefInterval );
            } else {
                console.log(request);
            }
        });
    }
    function incrementCounter(){

        if (state === 0){
            return false;
        }
        counter--;

        if (counter < 0 && isActive){
            counter = usersettings.timer;
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


})();