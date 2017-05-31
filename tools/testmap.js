var t1 = new Date().getTime();
var a= "2017-05-20T09:00:29Z";
var   d   =   new   Date(Date.parse(a));
console.log(Date.parse(d));
console.log(t1-d);
var a= "Typhoon Gay (1992)";
var b= a.replace(/ /g,"+");
console.log(b);
