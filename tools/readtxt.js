var root_path="E:/test/bot.txt";
var rf=require("fs");  
var res=[];
function callBack(err,data){  
    if(err){  
        console.log("error");  
    }else{  
    	res = data.split('\r\n')
        console.log(res);  
    	console.log(res.indexOf('User'));
    }  
}

rf.readFile(root_path,"utf-8",callBack);  
var a=1
var myMap = new Map();
myMap.set(0, 0);
myMap.set(1, 1);
myMap.set(2, 1);
if(myMap.has(2))
{console.log("ghghgh");
	}
else
	{
	console.log("fuck");
	}
console.log(res.indexOf('User'));