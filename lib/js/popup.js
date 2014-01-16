$().ready(function(){
    var currentOptions = {
            scope:'',
            frequency:10,
            isActive:false
        },
        background = chrome.extension.getBackgroundPage(),
        urls = [],
        isActive;


    function loadUI(){

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var url = tabs[0].url;
            background.reloadCSS.background.getPageOps(url, function(ops){

                if (ops && ops.scope === 'selected-css'){
                    $(".selected-css").prop('checked', true);
                }
                isActive = ops.isActive || false;

// Overall viewmodel for this screen, along with initial state
                function CSSReloadViewModel() {
                    var self = this;

                    self.frequencies = ko.observableArray();
                    self.frequency = ko.observable( ops.frequency || TIMES[0] );
                    self.urls = ko.observableArray( urls );

                    self.frequency.subscribe(function(frequency) {
                        currentOptions.frequency = frequency;
                    });

                    TIMES.forEach(function(interval){
                        self.frequencies.push( interval );
                    });

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
                            label: item.split('/').pop(),
                            checked: true
                        } );
                       // $("div.css-files").append('<label title="'+ item +'"><input type="checkbox" value="'+ item +'">'+ item.split('/').pop() +'</label>');
                    }
                });
            }
            urls = _.sortBy(urls, function(item){ return item.label })
            loadUI();
        });

        $('button').on('click',function(){
            isActive = !isActive;
            if (isActive){
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