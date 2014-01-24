$().ready(function(){
    var currentOptions = {
            scope: DEFAULTS.scope,
            frequency:0,
            isActive:false,
            urls:[]
        },
        background = chrome.extension.getBackgroundPage(),
        urls = [];

    var popup = {

    }
    function loadUI(){

        //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
         //   var url = tabs[0].url;
         //   background.reloadCSS.background.getPageOps(url, function(ops){

               // if (ops && ops.scope === 'selected-css'){
                //    $(".selected-css").prop('checked', true);
               // }
                // currentOptions.isActive = ops.isActive || false;


                function CSSReloadViewModel() {
                    var self = this;
                    //currentOptions.frequency = ops.frequency || TIMES[0] ; 
                    //currentOptions.scope = ops.scope || currentOptions.scope;

                    self.frequencies = ko.observableArray( TIMES );
                    self.frequency = ko.observable( currentOptions.frequency  );
                    self.urls = ko.observableArray( urls );
                    self.fileList = ko.observableArray( currentOptions.fileList );
                    self.scope = ko.observable(  currentOptions.scope );


                    self.frequency.subscribe(function(frequency) {
                        currentOptions.frequency = frequency;
                    });
                    self.urls.subscribe(function(urls) {
                        currentOptions.urls = urls;
                    });
                    self.fileList.subscribe(function(fileList) {
                        currentOptions.fileList = fileList;
                    });
                    self.scope.subscribe(function(scope) {
                        currentOptions.scope = scope;
                    });

                    //TIMES.forEach(function(interval){
                     //   self.frequencies.push( interval );
                    //});

                    return self;
                }

                ko.applyBindings(new CSSReloadViewModel());
                $('button').text( currentOptions.isActive ? "Stop" : "Start"  );
                
           // });
        //});
    }

    popup.init = function(){

        background.reloadCSS.content.getCSSList(function(ops){

            // if (ops.list && ops.list.length ){
            //     ops.list.forEach(function(item){
            //         if (item.indexOf('.css') !== -1 && item.indexOf('chrome-extension://') === -1 ){
            //             urls.push( {
            //                 url: item,
            //                 label: item.split('/').pop().split('?').shift(),
            //                 checked: true
            //             } );
            //            // $("div.css-files").append('<label title="'+ item +'"><input type="checkbox" value="'+ item +'">'+ item.split('/').pop() +'</label>');
            //         }
            //         currentOptions.urls = urls;
            //     });
            // }
            currentOptions.fileList = _.sortBy(ops.fileList , function(item){ return item.label });
            currentOptions.scope = ops.scope;
            currentOptions.frequency = ops.frequency;
            currentOptions.isActive = ops.isActive;

            // urls = _.sortBy(urls, function(item){ return item.label });
            // currentOptions.fileList  = _.sortBy(currentOptions.fileList, function(item){ return item.label });
            console.log( 'ops',  ops )
            loadUI();
        });

        $('button').on('click',function(){
            currentOptions.isActive  = !currentOptions.isActive ;
            if (currentOptions.isActive ){
                console.log(  currentOptions );
                background.reloadCSS.content.start( currentOptions );
                $('button').text('Stop');
            } else {
                background.reloadCSS.content.stop();
                $('button').text('Start');
            }
        });

    };
    window.popup = popup;
    popup.init();

});