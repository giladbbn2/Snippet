/*
*   read GET parameter
*/

var _get = (function (a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));



/*
*   Event for handling change in html inputs
* 	Requires: JQuery
*   usage: $('input').on('inputchange', function() { console.log(this.value) });
*/

$.event.special.inputchange = {
    setup: function () {
        var self = this, val;
        $.data(this, 'timer', window.setInterval(function () {
            val = self.value;
            if ($.data(self, 'cache') != val) {
                $.data(self, 'cache', val);
                $(self).trigger('inputchange');
            }
        }, 20));
    },
    teardown: function () {
        window.clearInterval($.data(this, 'timer'));
    },
    add: function () {
        $.data(this, 'cache', this.value);
    }
};



/*
*   $.DeferredSeq and $.DeferredAttach functions
* 	Requires: JQuery
*
*   e.g.:

	var a = 0;
    $.DeferredSeq(function(){
      setTimeout(function(){console.log(a);}, 1);	// must be in setTimout to run!
      return $.Deferred(function(defer){
        setTimeout(function(){
          a++;
          var signal = a;
          console.log("check if " + signal + " is greater than 4");
          defer.resolve(signal);
        }, 1000);
      });
    }, function(signal){
	    if (signal > 4){
        	console.log("positive");
            return true;
        }
    	
        console.log("negative");
        return false;
    }, 5, false).then(function(result){
	    if (result === false)
    	    console.log("no more tries");
        else
    	    console.log("final resolved signal is " + result);
    });
	
*	The $.DeferredSeq function keeps executing a deferred function (first arg) consecutively until at least one of two conditions is true:
*		- the "testf" function (second arg) evals to true
*		- even after a maximum number of retries (third arg) the "testf" didn't eval to true, in which case a default result is resolved - the
*		  fourth arg "noMoreTriesResult"
*/
$.DeferredSeq = function (df, testf, maxTries, noMoreTriesResult) {

    if (typeof noMoreTriesResult === "undefined")
        noMoreTriesResult = false;	// resolved when no more tries left

    if (typeof maxTries === "undefined")
        maxTries = 0;				// continue indefinitely

    if (maxTries == 0)
        maxTries = 99998;			// avoid recursion stack overflow

    var n = maxTries;

    var f = function (defer, signal) {
        n--;

        if (testf(signal)) {
            defer.resolve(signal);
            return;
        }

        if (n == 0) {
            defer.resolve(noMoreTriesResult);
            return;
        }

        return $.DeferredAttach(df, f).then(function (signal) {
            defer.resolve(signal);
        });

    };

    return $.DeferredAttach(df, f);
}

$.DeferredAttach = function (df, f) {
    return df().then(function (signal) {
        return $.Deferred(function (defer) {
            f(defer, signal);
        });
    });
}



/*
*   Get a date in the format YYYY-mm-dd
*/
Date.prototype.toISODate = function () {
    var a,
        str = this.getFullYear().toString() + "-";

    a = this.getMonth() + 1;
    if (a.toString().length == 1)
        str += "0";
    str += a.toString() + "-";

    a = this.getDate();
    if (a.toString().length == 1)
        str += "0";
    str += a.toString();

    return str;
};



/*
*	AdBlock checking utility
* 	Requires: JQuery
*/

function isAdBlock(checkBaitTime, checkBaitLoops){
    
    if (typeof checkBaitTime === "undefined")
        checkBaitTime = 50;

    if (typeof checkBaitLoops === "undefined")
        checkBaitLoops = 5;    

    var hnd, 
        bait, 
        checkBaitInterval, 
        checkBaitLoopId = 0,
        isDetected = false;
    
    function createBait(){
        bait = document.createElement('div');
        bait.setAttribute('class', 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links');
        bait.setAttribute('style', 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;');
        hnd = window.document.body.appendChild(bait);
        hnd.offsetParent;
        hnd.offsetHeight;
        hnd.offsetLeft;
        hnd.offsetTop;
        hnd.offsetWidth;
        hnd.clientHeight;
        hnd.clientWidth;
    }

    function destroyBait(){
        window.document.body.removeChild(hnd);
        bait = hnd = null;
    }

    function checkBait(){
        if (window.document.body.getAttribute('abp') !== null
        || hnd.offsetParent === null
        || hnd.offsetHeight == 0
        || hnd.offsetLeft == 0
        || hnd.offsetTop == 0
        || hnd.offsetWidth == 0
        || hnd.clientHeight == 0
        || hnd.clientWidth == 0) {
            isDetected = true;
        }

        if (window.getComputedStyle !== undefined) {
            var baitTemp = window.getComputedStyle(hnd, null);
            if(baitTemp.getPropertyValue('display') == 'none'
            || baitTemp.getPropertyValue('visibility') == 'hidden') {
                isDetected = true;
            }
        }
    }

    return $.Deferred(function(defer){
        createBait();
        checkBaitInterval = setInterval(function(){
            checkBait();
            checkBaitLoopId++;
            if (checkBaitLoopId >= checkBaitLoops){
                clearInterval(checkBaitInterval);
                destroyBait();
                defer.resolve(isDetected);
            }
        }, checkBaitTime);
    });
}



/*
*	NHT checking utility
*/

function isNHT() {
    
    // TODO: check fuzzy mouse movements!

    var isDetected = (function () {
        if (window.document.documentElement.getAttribute("webdriver"))
            return true;

        if ("_Selenium_IDE_Recorder" in window)
            return true;

        if ("__webdriver_script_fn" in document)
            return true;

        if ("navigator" in window && "webdriver" in window.navigator && window.navigator.webdriver === true)
            return true;

        var searchKeys = [
            "selenium",
            "$cdc",
            "$wdc",
            "webdriver"
        ];

        var searchTargets = [
            document,
            window,
            document.cookie,
            window["navigator"]
        ];

        function isSearchKeyFoundIn(k) {
            if (typeof k === "undefined")
                return false;

            k = k.toLowerCase();

            for (var j = 0; j < searchKeys.length; j++) {
                var searchKey = searchKeys[j];
                if (k.search(searchKey) != -1) {
                    //console.log("found " + searchKey + " in " + k);
                    return true;
                }

            }

            return false;
        }

        for (var i = 0; i < searchTargets.length; i++) {
            try {
                var target = searchTargets[i];
                for (k in target)
                    if (target.hasOwnProperty(k) && isSearchKeyFoundIn(k)) {
                        //console.log("found for target:");
                        //console.log(target);
                        return true;
                    }
            } catch (ex1) {
                continue;
            }
        }
    })();

    return $.Deferred(function (defer) {
        defer.resolve(isDetected);
    });
}
