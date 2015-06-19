var prePrice
function WebSocketTest()
{
  if ("WebSocket" in window)
  {
     console.log("WebSocket is supported by your Browser!");
     // Let us open a web socket
     var ws = new WebSocket("ws://silver.wicwin.com/ws");
     ws.onopen = function()
     {
        // Web Socket is connected, send data using send()
        console.log("WebSocket opened!");
     };
     ws.onmessage = function (evt)
     {
        var received_msg = evt.data;
		sj=JSON.parse(received_msg)
		if (prePrice==0){
			ic="../icon.png"
		}else if(prePrice==sj.price){
			return
		}else if(prePrice<sj.price){
			ic="../up.png"
		}else{
			ic="../down.png"
		}
		show("¥"+sj.price+"元",ic,"时间："+getTimeString(sj.time))
		prePrice=sj.price
     };
     ws.onclose = function()
     {
        // websocket is closed.
        console.log("Connection is closed...");
		WebSocketTest();
     };
  }
  else
  {
     // The browser doesn't support WebSocket
     show("WebSocket NOT supported by your Browser!");
  }
}
function show(title,ic,text){
		new Notification(title,{icon:ic,body:text});
}
if(window.Notification){
	prePrice=0
	//WebSocketTest()
}