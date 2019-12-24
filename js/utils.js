function submitForm(url, params, method, target){

    var formEl = document.getElementById("FlowSubmitForm");

    if (formEl)
        document.getElementsByTagName('body')[0].removeChild(formEl);

    formEl = document.createElement("form");
    formEl.setAttribute("id", "FlowSubmitForm");
    formEl.setAttribute("action", url);
    formEl.setAttribute("method", method);
    
    if (typeof target !== "undefined")
        formEl.setAttribute("target", target);

    var inputEl;

    for (var k in params)
        if (params.hasOwnProperty(k)){
            inputEl = document.createElement("input");
            inputEl.setAttribute("type", "hidden");
            inputEl.setAttribute("name", k);
            inputEl.setAttribute("value", params[k]);
            formEl.appendChild(inputEl);
        }

    document.getElementsByTagName('body')[0].appendChild(formEl);

    formEl = document.getElementById("FlowSubmitForm");
    
    formEl.submit();

}

function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function ip2long(IP) {
    var i = 0;
    IP = IP.match(/^([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?$/i);
    if (!IP) { return false; }
    IP[0] = 0;
    for (i = 1; i < 5; i += 1) {
        IP[0] += !!((IP[i] || '').length);
        IP[i] = parseInt(IP[i]) || 0;
    }
    IP.push(256, 256, 256, 256);
    IP[4 + IP[0]] *= Math.pow(256, 4 - IP[0]);
    if (IP[1] >= IP[5] || IP[2] >= IP[6] || IP[3] >= IP[7] || IP[4] >= IP[8]) { return 0; }
    return IP[1] * (IP[0] === 1 || 16777216) + IP[2] * (IP[0] <= 2 || 65536) + IP[3] * (IP[0] <= 3 || 256) + IP[4] * 1;
}

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
*   Get a date in the format YYYY-mm-dd
*/
Date.prototype.toISODate = function () {
    var a;
    var str = this.getFullYear().toString() + "-";

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

function isAdBlock(cbFinish, checkBaitTime, checkBaitLoops){
    
    if (typeof cbFinish !== "function")
        cbFinish = function(isDetected){};

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

    createBait();
    checkBaitInterval = setInterval(function(){
        checkBait();
        checkBaitLoopId++;
        if (checkBaitLoopId >= checkBaitLoops){
            clearInterval(checkBaitInterval);
            destroyBait();

            cbFinish(isDetected);
        }
    }, checkBaitTime);
}

function isNHT(cbFinish) {
    
    if (typeof cbFinish !== "function")
        cbFinish = function(isDetected){};

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

        return false;
    })();

    cbFinish(isDetected);
}

function getInternalIP(cbFunc) {

    var addresses = null;

    // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23

    if (typeof window.webkitRTCPeerConnection === "undefined" && typeof window.mozRTCPeerConnection === "undefined"){
        cbFunc(null);
        return;
    }
    
    var addrs = {
        "0.0.0.0": false
    };

    function updateDisplay(newAddr) {
        
        if (newAddr in addrs) 
            return;
        else 
            addrs[newAddr] = true;

        var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
        
        addresses = displayAddrs;

        cbFunc(addresses);
        return;
    }
    
    function grepSDP(sdp) {

        var hosts = [];

        sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39

            if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13

                var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                    addr = parts[4],
                    type = parts[7];

                if (type === 'host')
                    updateDisplay(addr);
                
            } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7

                var parts = line.split(' '),
                    addr = parts[2];

                updateDisplay(addr);
                
            }
        });
    }
    
    var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection; // || window.RTCPeerConnection
    
    var rtc = new RTCPeerConnection({ iceServers: [] });
    
    try {

        //if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
            rtc.createDataChannel('', { reliable: false });
        //};

    } catch (err) {

        cbFunc(null);
        return;

    }

    rtc.onicecandidate = function (evt) {
        // convert the candidate to SDP so we can run it through our general parser
        // see https://twitter.com/lancestout/status/525796175425720320 for details

        if (evt.candidate && addresses === null)
            grepSDP("a=" + evt.candidate.candidate);
        
    };

    rtc.createOffer(function (offerDesc) {

        if (addresses === null)
            grepSDP(offerDesc.sdp);

        rtc.setLocalDescription(offerDesc);

    }, function (e) {

        //console.warn("offer failed", e); 

    });
    
}
