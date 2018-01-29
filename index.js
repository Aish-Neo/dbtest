/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}
let sparkline = [];
let sparklineTime = [];
let sortOrder = 'ASC';
let s_no =1;
let arr = [];
function connectCallback() {
    client.subscribe("/fx/prices", function(data) {
        var quote = JSON.parse(data.body);

        if(arr.indexOf(quote.name)==-1){
            document.getElementById('rows').
            appendChild(document.createElement('tr')).setAttribute('id',quote.name);
            arr.push(quote.name);
        }
        if(!sparkline[quote.name]){
            sparkline[quote.name]=[];
            sparklineTime[quote.name]  = [];
        }
        document.getElementById(quote.name).innerHTML = '';
        var name = document.createElement('td');
        name.innerHTML = quote.name;
        document.getElementById(quote.name).appendChild(name);
        var bestBid = document.createElement('td');
        bestBid.innerHTML = quote.bestBid.toFixed(2);
        document.getElementById(quote.name).appendChild(bestBid);
        var bestAsk = document.createElement('td');
        bestAsk.innerHTML = quote.bestAsk.toFixed(2);;
        document.getElementById(quote.name).appendChild(bestAsk);
        var openBid = document.createElement('td');
        openBid.innerHTML = quote.openBid.toFixed(2);;
        document.getElementById(quote.name).appendChild(openBid);
        var openAsk = document.createElement('td');
        openAsk.innerHTML = quote.openAsk.toFixed(2);;
        document.getElementById(quote.name).appendChild(openAsk);
        var lastChangeBid = document.createElement('td');
        lastChangeBid.innerHTML = quote.lastChangeBid.toFixed(2);;
        document.getElementById(quote.name).appendChild(lastChangeBid);
        var lastChangeAsk = document.createElement('td');
        lastChangeAsk.innerHTML = quote.lastChangeAsk.toFixed(2);;
        document.getElementById(quote.name).appendChild(lastChangeAsk);


        sparkline[quote.name].push((quote.bestBid+quote.bestAsk)/2);
        let date = new Date();
        sparklineTime[quote.name].push(date.getTime()+30000);

        document.getElementById(quote.name).appendChild(document.createElement('td')).setAttribute('id',"line-"+quote.name);
        document.getElementById('rows').appendChild(document.getElementById(quote.name));

        sortTableRow();

        drawSparkline("line-"+quote.name,sparkline[quote.name])
    });

    document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
}

document.getElementById('lastChangedAsk').addEventListener("click", function(){
    sortOrder = (sortOrder=="ASC")?"DESC":"ASC";
});
function in_array(array, quote) {
    for(var i=0;i < array.length;i++) {
        //alert(array[i]['name'] + "===" +quote.name);
        if(array[i]['name'] === quote.name){
            array[i]['bestBid'] = quote.bestBid;
            array[i]['bestAsk'] = quote.bestAsk;
            array[i]['openBid'] = quote.openBid;
            array[i]['openAsk'] = quote.openAsk;
        }
        return (array[i]['name'] === quote.name)
    }
    return false;
}
client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
});

// sorting table based on dynamic value
function sortTableRow(){
    let tbody = document.getElementById("rows");
    let row, lastPrice, lastName, nextPrice, nextName;
    // check each rows
    for (let i = 0; row = tbody.rows[i]; i++) {
        // remove element after 30 sec time
        checkExitingEleAndRemove(tbody.rows[i].cells[0].innerText);//bidName
        // compare data with each row
        for (let j = 0; j < tbody.rows.length-i-1; j++) {

            lastPrice     = tbody.rows[j].cells[6].innerText;
            lastName      = tbody.rows[j].cells[0].innerText;
            nextPrice = tbody.rows[j+1].cells[6].innerText;
            nextName  = tbody.rows[j+1].cells[0].innerText;
            if(sortOrder=="ASC"){
                if(lastPrice < nextPrice){
                    let parent  = document.getElementById(nextName).parentNode;
                    parent.insertBefore(document.getElementById(lastName), document.getElementById(nextName).nextSibling);
                }
            }else{
                if(lastPrice > nextPrice){
                    let parent  = document.getElementById(nextName).parentNode;
                    parent.insertBefore(document.getElementById(lastName), document.getElementById(nextName).nextSibling);
                }
            }
        }
    }

};


// drawing sparkline on dynamic values
function drawSparkline(id, lines_points){
    let element = document.getElementById(id);
    let sparkline = new Sparkline(element, {
        lineColor: "#666",
        startColor: "orange",
        endColor: "blue",
        maxColor: "red",
        minColor: "green",
        dotRadius: 3,
        width: 200
    });
    sparkline.draw(lines_points);
};


function checkExitingEleAndRemove(bidName){
    let currentDate = new Date();
    let currentTime = currentDate.getTime();
    for(let n=0;n<sparklineTime[bidName].length;n++){
        if(currentTime >= sparklineTime[bidName][n]){
            sparklineTime[bidName].shift();
            sparkline[bidName].shift();
        }
    }
}
