	document.addEventListener('DOMContentLoaded', function () {
	init();
	initChart(getChart("PriceChart"));
	  go();
	});
	
function WebSocketService(addr)
{
  if ("WebSocket" in window)
  {
     console.log("WebSocket is supported by your Browser!");
     // Let us open a web socket
     ws = new WebSocket(addr);
     ws.onopen = function()
     {
        // Web Socket is connected, send data using send()
        console.log("WebSocket opened!");
     };
     ws.onmessage = msgRecived
     ws.onclose = function()
     {
        // websocket is closed.
        console.log("Connection is closed...");
		WebSocketService(addr);
     };
  }
  else
  {
     // The browser doesn't support WebSocket
     show("WebSocket NOT supported by your Browser!");
  }
}
function init(){
	document.getElementById("InfoLayer").addEventListener("mousemove",dispalyInfo);
	document.getElementById("InfoLayer").addEventListener("mouseout",clearInfo);
	document.getElementById("InfoLayer").addEventListener("click",select);
	document.getElementById("InfoLayer").addEventListener("dblclick",reInit);
	cellheight=getChart("PriceChart").height-2*padding;
	cellwidth=getChart("PriceChart").width-2*padding;
	mam=new Object();
}
var ws;	//websocket 

function msgRecived(evt)
{
	console.log("WebSocket Recived!");
	var received_msg = evt.data;
//	console.log(received_msg)
	curprice=JSON.parse(received_msg)
	pj.unshift(curprice)
	SortSilver(pj)
	document.getElementById("resp").innerHTML = "当前价格:"+curprice.price+"涨幅:"+sprintf("%.2f",((curprice.price-pj[pj.length-1].price)/pj[pj.length-1].price)*100)+"%";
	if(!selectMode){
		reInit(evt)
	}
};

function SortSilver(ss)
{
	ss.sort(function(a,b){
		return parseDate(b.time).getTime()-parseDate(a.time).getTime()
		})
	return ss
}

var pj=[];
var istart;
var iend;
var cellwidth;
var cellheight;
var selectMode=false;
var selectStart
var selectEnd
var selected=false;
var pjSub=[];
var mam;
var padding=30;


function reInit(e){
	selected=false;
	selectMode=false;
	selectStart=0;
	selectEnd=0;
	pjSub=pj.slice(0,pj.length-1);
	clearSrc(getChart("PriceChart"));
	initChart(getChart("PriceChart"));
	darwChart(pj,getChart("PriceChart"));
}
function select(e){
	if(selected){
		index=getIndexFromX(pjSub,e.offsetX);
		if(selectMode==false){
			selectStart=index;
			selectMode=true;
			return;
		}
	}else{
		index=getIndexFromX(pj,e.offsetX);
	}
	if(selectMode==true){
		if(index<=selectStart){
			selectEnd=selectStart;
			selectStart=index;
		}else{
			selectEnd=index;
		}
		pjSub=pjSub.slice(selectStart,selectEnd);
		c=getChart("PriceChart");
		clearSrc(c);
		selected=true;
		selectMode=false;
		initChart(getChart("PriceChart"));
		darwChart(pjSub,getChart("PriceChart"));
	}else{
		selectStart=index;
		selected=false;
		selectMode=true;
	}
}
function go(){
	document.getElementById("resp").innerHTML = "加载中...";
	WebSocketService("ws://silver.wicwin.com/ws");
}
function disCurPrice(price){
	return price[0].price
}
function getChart(id){
	var chart=document.getElementById(id);
	
	return chart;
}
function getIndexFromX(js,x){
	for(var i=0;i<(js.length-1);i++){
		date=parseDate(js[i].time);
		datenext=parseDate(js[i+1].time)
		price=js[i].price;
		//mam.max=js[imam.max].price;
		//mam.min=js[imam.min].price;
		jsx=getXbyTime(date,cellwidth)+padding;
		jsxnext=getXbyTime(datenext,cellwidth)+padding;
		if((x<=jsx)&&(x>=jsxnext)){
			return i+1;
		}
		//console.log("x:%f,jsx:%f,jsxnext:%f",x,jsx,jsxnext);
		//y=getYbyPrice(price,chart.height,mam);
	}
	if(x>=getXbyTime(parseDate(js[0].time),cellwidth)+padding){
		return 0;
	}else if(x<=getXbyTime(parseDate(js[js.length-1].time),cellwidth)+padding){
		return js.length-1
	}
	return -1;
}
function dispalyInfo(e){
	c=getChart("InfoLayer");
	clearSrc(c);
	if(selected){
		json=pjSub;	
	}else{
		json=pj;
	}
	index=getIndexFromX(json,e.offsetX);
	x=getXbyTime(parseDate(json[index].time),cellwidth)+padding;
	if(selectMode){
		x1=getXbyTime(parseDate(json[selectStart].time),cellwidth)+padding;
		drawSelectRange(getChart("InfoLayer"),x1,x);
		disInfo(json[selectStart],x1,c.height-padding+10);
	}
	drawLine(c,x,"#000000");
	disInfo(json[index],x,c.height-padding+10);
	
}

function disInfo(node,x,y){
	time=getTimeString(node.time);
	price=String(node.price);
	chart=getChart("InfoLayer");
	var c=chart.getContext("2d");
	printTextWithBlock(time,x,y,chart);
	printTextWithBlock(price,x,y-cellheight-padding,chart);
//	c.fillText(time,x,y);
}

function printTextWithBlock(text,x,y,chart){
	var c=chart.getContext("2d");
	c.fillStyle="#777777"
	c.fillRect(x-(c.measureText(text).width/2)-1,y-9,c.measureText(text).width+2,10);
	c.fillStyle="#ffffff"
//	c.textBaseline="top";
	c.textAlign="center";
	c.fillText(text,x,y);	
}

function clearInfo(){
	c=getChart("InfoLayer");
	clearSrc(c);
}
function clearSrc(chart){
	var ctx=chart.getContext("2d");
	ctx.clearRect(0,0,chart.width,chart.height);
	//ctx.stroke();
}
function drawSelectRange(chart,xstart,xend){
	var c=chart.getContext("2d");
	//console.log("selectStart:%d",xstart);
	c.fillStyle="rgba(0,0,0,0.1)";
	istart=getIndexFromX(pjSub,xstart);
	estart=getIndexFromX(pjSub,xend);
	if(istart>=estart){
		t=istart;
		istart=estart;
		estart=t;
	}
	tempJs=pjSub.slice(istart,estart);
	tempimam=getMaxMinPrice(tempJs);
	y1=getYbyPrice(tempJs[tempimam.max].price,cellheight,mam)+padding;
	h=getYbyPrice(tempJs[tempimam.min].price,cellheight,mam)-getYbyPrice(tempJs[tempimam.max].price,cellheight,mam);
	c.fillRect(xstart,y1,xend-xstart,h);
}
function drawLine(chart,x,color){
	var ctx=chart.getContext("2d");
	ctx.strokeStyle=color;
	ctx.lineWidth = 1;
	ctx.lineCap = "butt";
	ctx.beginPath();
	ctx.moveTo(x-0.5,padding-0.5);
	
	ctx.lineTo(x-0.5,chart.height-padding-0.5);
	ctx.stroke();
	ctx.closePath();
}

function initChart(chart){
	var ctx=chart.getContext("2d");
	ctx.strokeStyle="#000000";
	ctx.lineWidth = 1;
	ctx.lineCap = "butt";
	ctx.beginPath();
	ctx.moveTo(padding-0.5,padding-0.5);
	ctx.lineTo(padding-0.5,chart.height-padding-0.5);
	ctx.lineTo(chart.width-padding-0.5,chart.height-padding-0.5);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.strokeStyle="#B4EEB4";
	ctx.moveTo(padding-0.5,(chart.height/2)-0.5);
	ctx.lineTo(chart.width-padding-0.5,(chart.height/2)-0.5);
	ctx.stroke();
	ctx.closePath();
	var pxPerHours=(chart.width-2*padding)/24
	ctx.textAlign="center";
	if(!selected){
		for(var i=2;i<24;i=i+2){
			ctx.fillStyle="#000000"
			ctx.fillText(pad(i,2)+":00",i*pxPerHours+padding,chart.height)
		}
	}else{
		stime=parseDate(pjSub[pjSub.length-1].time);
		etime=parseDate(pjSub[0].time);
		d=etime.getTime()-stime.getTime();
		for(var i=0;i<=cellwidth;i=i+(cellwidth/6)){
			ti=stime.getTime()+((i*d)/cellwidth);
			t=new Date(ti);
			ctx.fillStyle="#000000"
			ctx.fillText(pad(t.getUTCHours(),2)+":"+pad(t.getUTCMinutes(),2),i+padding,chart.height)
			//console.log("%s,wpx:%d,hpx:%d",pad(t.getUTCHours(),2)+":"+pad(t.getUTCMinutes(),2),i+padding,chart.height);

		}
	}
}
function darwChart(js,chart){
	imam=getMaxMinPrice(js);
	var c=chart.getContext("2d");
	c.strokeStyle="red";
	c.lineWidth = 1;
	imax=js.length-1;
	var ex;
	ex1=js[imam.max].price-js[imax].price;
	ex2=js[imax].price-js[imam.min].price;
	if(ex1>=ex2){
		ex=ex1;
		//console.log("ex:%f,imax:%f,max:%f",ex.js[imax].price,js[imam.max].price);
	}else{
		ex=ex2;
		//console.log("ex:%f,imax:%f,min:%f",ex.js[imax].price,js[imam.min].price);
	}
	if(selected){
		mam.max=js[imam.max].price;
		mam.min=js[imam.min].price;
	}else{
	mam.max=js[imax].price+ex;
	mam.min=js[imax].price-ex;	
	}
	date=parseDate(js[imax].time);
	price=js[imax].price;
	var x=getXbyTime(date,cellwidth)+padding-0.5;
	var y=getYbyPrice(price,cellheight,mam)+padding-0.5;
	c.beginPath();
	c.lineTo(x,y);
	c.font="12px Arial"
	if (imam.max==imax){
		printTextWithBlock(String(js[imax].price),x,y,chart)
	}
	for(var i=imax-1;i>=0;i--){
		date=parseDate(js[i].time);
		price=js[i].price;
		x=getXbyTime(date,cellwidth)+padding-0.5;
		y=getYbyPrice(price,cellheight,mam)+padding-0.5;
		c.lineTo(x,y);
		if (imam.max==i){
			printTextWithBlock(String(js[i].price),x,y,chart)
		}else if(imam.min==i){
			printTextWithBlock(String(js[i].price),x,y+12,chart)
		}else if(i==0){
			printTextWithBlock(String(js[i].price),x+c.measureText(String(js[i].price)).width/2,y,chart)
		}
		
		
	}
	c.stroke();
	c.closePath();
}
function getXbyTime(date,max){
	var x=0;
	if(!selected){
		hh=date.getUTCHours();
		mm=date.getUTCMinutes();
		ss=date.getUTCSeconds();
		ph=(max/24);	//1??????
		pm=(ph/60);		//1??????
		ps=(pm/60);		//1??????
		x=(hh*ph)+(mm*pm)+(ss*ps)+0;
	}else{
		stime=parseDate(pjSub[pjSub.length-1].time);
		etime=parseDate(pjSub[0].time);
		d=etime.getTime()-stime.getTime();
		t=date.getTime()-stime.getTime();
		x=(t/d)*max;
	}
	return x;
}
function getYbyPrice(price,max,mam){
	cha=mam.max-mam.min;
	raw=price-mam.min;
	y=max-((raw/cha)*(max));
//	console.log("cha:%f-%f-%d",cha,raw,y);
	return y;
}
function getMaxMinPrice(arr){    
    var max  = 0;
	var min =0;
    for(var x = 1;x<arr.length;x++){
        if(arr[x].price>arr[max].price)
			max = x;
		if(arr[x].price<arr[min].price)
			min = x;
    }
	maxmin=new Object();
	maxmin.max=max;
	maxmin.min=min;
    return maxmin;
}

