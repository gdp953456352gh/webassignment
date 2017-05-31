var Revision = require("../models/revision")
var async=require('async');

module.exports.home=function(req,res){
	res.render("entry.pug");
}
module.exports.showOverview=function(req,res){
	var returnjsonforwholeset={};
	async.series([
        function(callback) {
            Revision.findalltitle( function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         console.log(result);
                        console.log("aTelse");
                        returnjsonforwholeset.alltitle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findleast( function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         console.log(result);
                        console.log("aTelse");
                        returnjsonforwholeset.leastarticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findmost(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        console.log(result)
                        returnjsonforwholeset.mostarticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findmostpopular(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        console.log(result);
                        returnjsonforwholeset.mostpopulararticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findlesspopular(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        returnjsonforwholeset.lesspopulararticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findoldesttime(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	returnjsonforwholeset.longestarticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findtheshortestagearticle(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	returnjsonforwholeset.shortestarticle = result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.addbotadmincolumn(function (err,result) {
                if (err){
                    console.log("Cannot find most revision!")
                }else{
                    callback(null);
                }
            } );
        },
        function(callback) {
            Revision.countwholeset(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	returnjsonforwholeset.wholemap = result;
                        callback(null);
                    }
                }
            )
        },

    ],
//optional callback
    function(err, results) {
        // results is now equal to ['one', 'two']
        // console.log(results);
		var admintotal=0,bottotal=0,regulartotal=0,anontotal=0;
		var temp=returnjsonforwholeset.wholemap;
		var bdata= [];
    	var i=1;
    	bdata[0]=['Timestamp', 'Administrator', 'Anonymous', 'Bot', 'Regular user'];
    	for(var [year,value] of temp )
		{
		oneelement=[];
		oneelement[0]=year.toString();
		oneelement[1]=temp.get(year).admin;
		admintotal=admintotal+oneelement[1];
		oneelement[2]=temp.get(year).anon;
		anontotal=anontotal+oneelement[2];
		oneelement[3]=temp.get(year).bot;
	    bottotal=bottotal+oneelement[3];
		oneelement[4]=temp.get(year).regular-oneelement[1]-oneelement[2]-oneelement[3];
		regulartotal=regulartotal+oneelement[4];
		bdata[i]=oneelement;
		i++;
		}
    	cdata = {'Regular user': regulartotal, 'Bot': bottotal, 'Anonymous': anontotal, 'Administrator': admintotal};
    	returnjsonforwholeset.bdata=bdata;
    	returnjsonforwholeset.cdata=cdata;
        console.log(returnjsonforwholeset);
        res.json(returnjsonforwholeset);
    });

}
module.exports.indipage=function(req,res){
	title = req.query.title;
	console.log("Cannot find most revision!"+title);
	var regular_users=[];
	var setofmap=[];
	var returnjson={};
	returnjson.title=title;
	async.series([
        function(callback) {
            Revision.asyncqueryapi(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	returnjson.revlength=result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            // do some stuff ...
            Revision.countarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         console.log(result);
                        console.log("aTelse");
                        returnjson.barchartforarticle= result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            Revision.findrevtimeByarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         console.log(result);
                        returnjson.revtimeByarticle= result;
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            // do some stuff ...
            Revision.findtop5user(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         //console.log(result);
                         //console.log(result.length);
                         for(var k=0;k<result.length;k++)
                        	 {
                        	 regular_users[k]=result[k]._id;
                        	 console.log(result[k]._id);
                        	 }
                         returnjson.top5user=result;
                         //console.log(regular_users[0]);
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            // do some stuff ...
        		Revision.countrevbyuserandarticle(regular_users[0],title, function (err,result)
        				{
		        			  if (err){
		                          console.log("Cannot find most revision!")
		                      }else{
		                    	  console.log(result);
		                    	  //console.log("gh");
		                    	  setofmap[0]=result;
		                          callback(null);
		                      }
        				})
        },
        function(callback) {
            // do some stuff ...
        		Revision.countrevbyuserandarticle(regular_users[1],title, function (err,result)
        				{
		        			  if (err){
		                          console.log("Cannot find most revision!")
		                      }else{
		                    	  console.log(result);
		                    	  //console.log("gh");
		                    	  setofmap[1]=result;
		                          callback(null);
		                      }
        				})
        },
        function(callback) {
            // do some stuff ...
        		Revision.countrevbyuserandarticle(regular_users[2],title, function (err,result)
        				{
		        			  if (err){
		                          console.log("Cannot find most revision!")
		                      }else{
		                    	  console.log(result);
		                    	  //console.log("gh");
		                    	  setofmap[2]=result;
		                          callback(null);
		                      }
        				})
        },
        function(callback) {
            // do some stuff ...
        		Revision.countrevbyuserandarticle(regular_users[3],title, function (err,result)
        				{
		        			  if (err){
		                          console.log("Cannot find most revision!")
		                      }else{
		                    	  console.log(result);
		                    	  //console.log("gh");
		                    	  setofmap[3]=result;
		                          callback(null);
		                      }
        				})
        },
        function(callback) {
            // do some stuff ...
        		Revision.countrevbyuserandarticle(regular_users[4],title, function (err,result)
        				{
		        			  if (err){
		                          console.log("Cannot find most revision!")
		                      }else{
		                    	  setofmap[4]=result;
		                          callback(null);
		                      }
        				})
        },

    ],
//optional callback
    function(err, results) {
		var admintotal=0,bottotal=0,regulartotal=0,anontotal=0;
		var temp=returnjson.barchartforarticle;
		var bdata= [];
    	var i=1;
    	bdata[0]=['Timestamp', 'Administrator', 'Anonymous', 'Bot', 'Regular user'];
    	for(var [year,value] of temp )
		{
		var oneelement=[];
		oneelement[0]=year.toString();
		oneelement[1]=temp.get(year).admin;
		admintotal=admintotal+oneelement[1];
		oneelement[2]=temp.get(year).anon;
		anontotal=anontotal+oneelement[2];
		oneelement[3]=temp.get(year).bot;
	    bottotal=bottotal+oneelement[3];
		oneelement[4]=temp.get(year).regular-oneelement[1]-oneelement[2]-oneelement[3];
		regulartotal=regulartotal+oneelement[4];
		bdata[i]=oneelement;
		i++;
		}
    	var cdata = {'Regular user': regulartotal, 'Bot': bottotal, 'Anonymous': anontotal, 'Administrator': admintotal};
    	returnjson.bdata=bdata;
    	returnjson.cdata=cdata;
    	
		returnjson.mapforuser=setofmap;
		var barchartforuser=[];
		for(var k=0;k<setofmap.length;k++)
			{
				var barchart  = []; 
				barchart[0]=['Year','Revision distribution'];
				var j=1;
				var yearofalluser;
		    	for(var [year,value] of setofmap[k] )
				{
		    		var oneelement=[];
		    		oneelement[0]=year.toString();
		    		oneelement[1]=setofmap[k].get(year).count;	
		    		barchart[j]=oneelement;
		    		j++;
				}
		    	barchartforuser[k]=barchart;
			}
		temp=returnjson.barchartforuser;
		var tdata= [];
    	var i=1;
    	tdata[0]=['Timestamp',regular_users[0] ,regular_users[1] , regular_users[2],regular_users[3],regular_users[4] ];
    	var min="2017";
    	var max="2001"
    	for(var x=0;x<5;x++)
    		{
    		for(var y=1;y<barchartforuser[x].length;y++)
    			{
    				if(barchartforuser[x][y][0]<min)
    					{
    					min=barchartforuser[x][y][0];
    					}
    				if(barchartforuser[x][y][0]>max)
    					{
    					max=barchartforuser[x][y][0];
    					}
    					
    			}
    		}
    	min=parseInt(min);
    	console.log(min);
    	max=parseInt(max);
    	console.log(max);
		var tdata= [];
    	tdata[0]=['Timestamp',regular_users[0] ,regular_users[1] , regular_users[2],regular_users[3],regular_users[4] ];
    
    	var countline=1;
    	for(var x=min;x<=max;x++)
    		{
    		var oneelement=[];
    		oneelement[0]=x.toString();
    		   if(returnjson.mapforuser[0].has(x))
    			   {
    			   oneelement[1]=returnjson.mapforuser[0].get(x).count;
    			   }
    		   else
    			   {
    			   oneelement[1]=0;
    			   }
    		   if(returnjson.mapforuser[1].has(x))
			   {
			   oneelement[2]=returnjson.mapforuser[1].get(x).count;
			   }
		   else
			   {
			   oneelement[2]=0;
			   }
    		   if(returnjson.mapforuser[2].has(x))
			   {
			   oneelement[3]=returnjson.mapforuser[2].get(x).count;
			   }
		   else
			   {
			   oneelement[3]=0;
			   }
    		   if(returnjson.mapforuser[3].has(x))
			   {
			   oneelement[4]=returnjson.mapforuser[3].get(x).count;
			   }
		   else
			   {
			   oneelement[4]=0;
			   }
    		   if(returnjson.mapforuser[4].has(x))
			   {
			   oneelement[5]=returnjson.mapforuser[4].get(x).count;
			   }
		   else
			   {
			   oneelement[5]=0;
			   }
    		   tdata[countline]=oneelement;
	    		countline++;
    		   
    		}
    	
    	
    	returnjson.tdata=tdata;
		returnjson.barchartforuser=barchartforuser;
        console.log(returnjson);
        console.log(returnjson.barchartforuser[0]);
        res.json(returnjson);
    });

}
