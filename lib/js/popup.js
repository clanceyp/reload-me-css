$().ready(function(){
    var currentOptions = {
            scope:'selected-files',
            frequency:0,
            isActive:false,
            urls:[]
        },
        background = chrome.extension.getBackgroundPage(),
        urls = [];


    function loadUI(){

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var url = tabs[0].url;
            background.reloadCSS.background.getPageOps(url, function(ops){

               // if (ops && ops.scope === 'selected-css'){
                //    $(".selected-css").prop('checked', true);
               // }
                currentOptions.isActive = ops.isActive || false;

// Overall viewmodel for this screen, along with initial state
                function CSSReloadViewModel() {
                    var self = this;
                    currentOptions.frequency = ops.frequency || TIMES[0] ; 
                    currentOptions.scope = ops.scope || currentOptions.scope;

                    self.frequencies = ko.observableArray( TIMES );
                    self.frequency = ko.observable( currentOptions.frequency  );
                    self.urls = ko.observableArray( urls );
                    self.scope = ko.observable(  currentOptions.scope );


                    self.frequency.subscribe(function(frequency) {
                        currentOptions.frequency = frequency;
                    });
                    self.urls.subscribe(function(urls) {
                        currentOptions.urls = urls;
                    });
                    self.scope.subscribe(function(scope) {
                        currentOptions.scope = scope;
                    });

                    //TIMES.forEach(function(interval){
                     //   self.frequencies.push( interval );
                    //});

                    self.scopeValue = ko.observable( ops.scope || "selected-files" );
                    return self;
                }

                ko.applyBindings(new CSSReloadViewModel());

            });
        });
    }

    function init(){

        background.reloadCSS.content.getCSSList(function(ops){

            if (ops.list && ops.list.length ){
                ops.list.forEach(function(item){
                    if (item.indexOf('.css') !== -1 && item.indexOf('chrome-extension://') === -1 ){
                        urls.push( {
                            url: item,
                            label: item.split('/').pop().split('?').shift(),
                            checked: true
                        } );
                       // $("div.css-files").append('<label title="'+ item +'"><input type="checkbox" value="'+ item +'">'+ item.split('/').pop() +'</label>');
                    }
                    currentOptions.urls = urls;
                });
            }
            urls = _.sortBy(urls, function(item){ return item.label })
            loadUI();
        });

        $('button').on('click',function(){
            currentOptions.isActive  = !currentOptions.isActive ;
            if (currentOptions.isActive ){
                console.log(  currentOptions, currentOptions.urls );
                background.reloadCSS.content.start( currentOptions );
                $('button').text('Stop');
            } else {
                background.reloadCSS.content.stop();
                $('button').text('Start');
            }
        });

    };

    init();

});