/**
 * 
 */
var mongoose = require('./db')
var async=require('async');
var arraybot=[];
var arrayadmin=[];
var timeforapi;
var myMap = new Map();
var http = require('https');
var RevisionSchema = new mongoose.Schema(
		{ 
			 sha1: String,
			 title: String, 
			 timestamp:String, 
			 parsedcomment:String, 
			 revid:Number, 
			 anon:String,
			 user:String, 
			 parentid:Number, 
			 bot:String,
			 admin:String,
			 size:Number},
		 {
			    versionKey: false 
		})
var rf=require("fs");  
//给bot[]赋值
rf.readFile("C:/test/bot.txt","utf-8",function(err,data){  
    if(err){  
        console.log("error");  
    }else{  
    	arraybot = data.split('\r\n')  
    }  
});
//给admin[]赋值
rf.readFile("C:/test/admin.txt","utf-8",function(err,data){  
    if(err){  
        console.log("error");  
    }else{  
    	arrayadmin = data.split('\r\n')  
    
    }  
});
//The article with the most number of revisions.
//db.getCollection('revisions').aggregate([
//	{$group:{_id:"$title", numOfEdits: {$sum:1}}},
//	{$sort:{numOfEdits:-1}},
//	{$limit:1}
//        ])
//为为整个数据库创建map轴
RevisionSchema.statics.createmapforwholeset= function(cb){
	myMap=new Map([]);
	async.series([
        function(callback) {
          
            Revision.findnewesttime(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                     
                        newest = result[0].timestamp.trim().substring(0,4);
                        newyear=parseInt(newest);
              
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
               
                        oldest = result[0].timestamp.trim().substring(0,4);
                        oldyear=parseInt(oldest);
                      
                        callback(null);
                    }
                }
            )
        },

    ],
//optional callback
    function(err, results) {
        for(var i=oldyear;i<=newyear;i++)
        	{
        	myMap.set(i, {"anon": 0,
        		"bot": 0,"regular": 0,"admin": 0});
        	}
        cb(null);
        
    });
}
//为每个文章创建map轴
RevisionSchema.statics.createmapforarticle= function(title,cb){
	myMap=new Map([]);
	async.series([
        function(callback) {
 
            Revision.findnewesttimeByarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        newest = result[0].timestamp.trim().substring(0,4);
                        newyear=parseInt(newest);
                    
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            // do some stuff ...
            console.log("aT");
            Revision.findoldesttimeByarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                     
                        oldest = result[0].timestamp.trim().substring(0,4);
                        oldyear=parseInt(oldest);
                       
                        callback(null);
                    }
                }
            )
        },

    ],
//optional callback
    function(err, results) {
        for(var i=oldyear;i<=newyear;i++)
        	{
        	myMap.set(i, {"anon": 0,
        		"bot": 0,"regular": 0,"admin": 0});
        	}
        cb(null);
        
    });
}

//找到整个数据库的最新更新时间
RevisionSchema.statics.findnewesttime= function(callback){
	return this.find()
	.sort({'timestamp':-1})
	.limit(1)
	.exec(callback)
}
//找到数据库中某一篇文章的最新更新时间
RevisionSchema.statics.findnewesttimeByarticle = function(title,callback){
	return this.find({'title':title})
	.sort({'timestamp':-1})
	.limit(1)
	.exec(callback)
}
//找到所有标题
var findalltitlecode = [
	{'$group':{'_id':"$title", 'numOfEdits': {$sum:1}}}	
]
RevisionSchema.statics.findalltitle = function(callback){
	return this.aggregate(findalltitlecode)
	.exec(callback)
}
RevisionSchema.statics.findrevtimeByarticle = function(title,callback){
	return this.find({'title':title})
	.count()
	.exec(callback)
}
//找到整个数据库的最晚创建时间
RevisionSchema.statics.findoldesttime = function(callback){
	return this.find()
	.sort({'timestamp':1})
	.limit(1)
	.exec(callback)
}
//找到数据库中某一篇文章的最晚创建时间
RevisionSchema.statics.findoldesttimeByarticle = function(title,callback){
	return this.find({'title':title})
	.sort({'timestamp':1})
	.limit(1)
	.exec(callback)
}
//查询api
RevisionSchema.statics.apiquery =function(title,timeforapi,callback){
		 titles=title.trim();
		 titles=titles.replace(/ /g,"+");
	     rvend=timeforapi;
		var options = {
			hostname: 'en.wikipedia.org',

			///w/api.php?action=query&format=json&prop=revisions&titles=Australia&formatversion=2&rvprop=timestamp%7Cuser%7Cuserid&rvlimit=max&rvend=2016-10-25T09%3A00%3A29.000Z
			path: '/w/api.php?action=query&format=json&prop=revisions&titles='+titles+'&formatversion=2&rvprop=timestamp%7Cuser&rvlimit=max&rvend='+rvend
	};
	http.request(options, function(res){
		var data = '';
		res.on('data', function(chunk){
		data += chunk;
		});
		res.on('end', function(){
		data = JSON.parse(data);
		callback(null,data)
		});
		}).end()//.exec(callback);
}
//找到有最多rev的文章
var findmostrev = [
	{'$group':{'_id':"$title", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:-1}},
	{'$limit':1}	
]

//The article with the least number of revisions.
//db.getCollection('revisions').aggregate([
//	{$group:{_id:"$title", numOfEdits: {$sum:1}}},
//	{$sort:{numOfEdits:1}},
//	{$limit:1}
//        ])
var findleastrev = [
	{'$group':{'_id':"$title", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:1}},
	{'$limit':1}	
]

//RevisionSchema.statics.findTitleLatestRev = function(title, callback){
//	
//	return this.count()
//	.exec(callback)
//}
//查询维基api
RevisionSchema.statics.asyncqueryapi=function(title,cb){
	var revlength=0;
	async.series([
        function(callback) {
            Revision.findnewesttimeByarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         
                        time = result[0].timestamp;
                        callback(null);
                        
                    }
                }
            )
        },
        function(callback) {
        	//做个if 如果小于24小时，无操作。
        	var timenow = new Date().getTime();
        	var   timeindata   =   new   Date(Date.parse(time));
        	var cha =60000*60*24;
        	var mathresult=timenow-timeindata;
        	
        	if(mathresult>cha)
        		{
                Revision.apiquery(title,time,function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    
                    	for(var i=1;i<result.query.pages[0].revisions.length;i++)
                    		{
                    	
		                        // 新建文档对象实例
							var user1 = new Revision ();
		                        user1.title=result.query.pages[0].title;
		                        user1.user=result.query.pages[0].revisions[i-1].user;
		                        user1.timestamp=result.query.pages[0].revisions[i-1].timestamp;
		                        if(arraybot.indexOf(user1.user)!=-1)
		                        	user1.bot=1;
		                        else if(arrayadmin.indexOf(user1.user)!=-1)
		                        	user1.admin=1;
							
							// 将文档保存到数据库
							user1.save(function(err, user1){
							    if(err){
							        return console.error(err);
							    }else{
							    }
							});

                    		}		                       
                    	revlength = result.query.pages[0].revisions.length-1;
		                        data = result;
		                        callback(null);

                    }
                }
            )
        		}
        	else
        		{
        		console.log("no new data");
        		 callback(null);
        		}

        },

    ],
//optional callback
    function(err, results) {
       cb(null,revlength);
    });

}
RevisionSchema.statics.findmost = function(callback){
	return this.aggregate(findmostrev)
	.exec(callback)
}
RevisionSchema.statics.findleast = function(callback){
	
	return this.aggregate(findleastrev)
	.exec(callback)
}
//return this.find({'title':title})
//.sort({'timestamp':-1})
//.limit(1)
//.exec(callback)
RevisionSchema.statics.findtime = function(title){
    var promise = this.find({'title':title})
	.sort({'timestamp':-1})
    .limit(1)
	.exec(api)
    promise.then(
      function(result) {
  		console.log(result)
      },
      function(err) {
        // on reject
      }
    );
}
//处理json 导入数据库
function parsejson(data,callback)
{
	
	
	}
RevisionSchema.statics.findanon=function(callback){
	return this.find({"anon":{$exists:false}})
	.exec(callback)
}
//加入bot admin 两列 可能要异步
RevisionSchema.statics.addbotadmincolumn = function(cb){
	async.series([
		function(callback) {
			flag=0;
			
			 Revision.update({"user":{$in: arraybot}},{$set:{'bot':1}},{'multi':true},function(err,result){
					if (err){
						console.log("Update error!")
					}else{
						
						flag=1;
						if(flag==1)
							 callback(null)
					}	
				})
			 //callback(null)
		},
		function(callback) {
			flag=0;
			 Revision.update({"user":{$in: arrayadmin}},{$set:{'admin':1}},{'multi':true},function(err,result){
					if (err){
						console.log("Update error!")
					}else{
						
						flag=1;
						if(flag==1)
							 callback(null)
					}	
				})
			// callback(null)
		},

    ],
//optional callback
    function(err, results) {
        console.log("success to update bot and admin");
        cb(null);
    });
}
//统计全部用户数量的四个方法
RevisionSchema.statics.findtotalusernum=function(callback)
{
	return this.find({}).count()
	.exec(callback)
	}
RevisionSchema.statics.findtotalusernumbyarticle=function(title,callback)
{
	return this.find({'title':title}).count()
	.exec(callback)
	}
RevisionSchema.statics.findtotalusernumbyyearandarticle=function(title,year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({'title':title,"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findtotalusernumbyyear=function(year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
//统计admin
RevisionSchema.statics.findadminusernum=function(callback)
{
	return this.find({"admin": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findadminusernumbyarticle=function(title,callback)
{
	return this.find({'title':title,"admin": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findadminusernumbyyearandarticle=function(title,year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({'title':title,"admin": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findadminusernumbyyear=function(year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({"admin": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
//统计bot
RevisionSchema.statics.findbotusernum=function(callback)
{
	return this.find({"bot": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findbotusernumbyarticle=function(title,callback)
{
	return this.find({'title':title,"bot": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findbotusernumbyyearandarticle=function(title,year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({'title':title,"bot": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findbotusernumbyyear=function(year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({"bot": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
//统计anon
RevisionSchema.statics.findanonusernum=function(callback)
{
	return this.find({"anon": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findanonusernumbyarticle=function(title,callback)
{
	return this.find({'title':title,"anon": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findanonusernumbyyearandarticle=function(title,year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({'title':title,"anon": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findanonusernumbyyear=function(year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({"anon": {$exists: true},"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findusertype=function(callback)
{
	this.find({"anon": {$exists: true}})//查询匿名用户 按年份
	.exec(function(err,result){
		
		if (err){
			console.log("Cannot find " + title + ",s latest revision!")
		}else{
			temp = result
		}	
	})	
}
//每个文章按年份查询
RevisionSchema.statics.counteachyearbyarticle=function(title,year,cb){
	async.series([
		function(callback) {   
            Revision.findtotalusernumbyyearandarticle(title,year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).regular=result;
               
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
       
            Revision.findadminusernumbyyearandarticle(title,year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).admin=result;
                       // console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
    
            Revision.findbotusernumbyyearandarticle(title,year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).bot=result;
                       // console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
    
            Revision.findanonusernumbyyearandarticle(title,year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).anon=result;
                        //console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
	],
    function(err, results) {
        cb(null,myMap)
        
    });
}
//开始count四个类型用户by每个文章
RevisionSchema.statics.countarticle= function(title,cb){
	async.series([
        function(callback) {
     
            Revision.createmapforarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        //console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
        	flag=0;
            for(var [year,value] of myMap)
        		{
        		 
        		Revision.counteachyearbyarticle(title,year,function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	flag++;
                       
                        if(flag==myMap.size)
                            callback(null);
                    }
                })
        		}
            
            
        },

    ],
//optional callback
    function(err, results) {
        cb(null,myMap);
    });
}
//整个数据库按年份查询
RevisionSchema.statics.counteachyearwholeset=function(year,cb){
	async.series([
		function(callback) {
            Revision.findtotalusernumbyyear(year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).regular=result;
                    
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
         
            Revision.findadminusernumbyyear(year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).admin=result;
                       // console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
            Revision.findbotusernumbyyear(year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).bot=result;
                       // console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
		function(callback) {
   
            Revision.findanonusernumbyyear(year, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	myMap.get(year).anon=result;
                        //console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
	],
    function(err, results) {
   
        cb(null,myMap)
        
    });
}
//开始count四个类型用户整个数据库
RevisionSchema.statics.countwholeset= function(cb){
	async.series([
        function(callback) {
        
            Revision.createmapforwholeset(function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        //console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
        	flag=0;
            // do some stuff ...
            for(var [year,value] of myMap)
        		{
        		Revision.counteachyearwholeset(year,function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	flag++;
                   
                        if(flag==myMap.size)
                            callback(null);
                    }
                })
        		}
            
            
        },

    ],
//optional callback
    function(err, results) {
        cb(null,myMap);
    });
}


//The article edited by largest group of registered users. Each wiki article is edited by a number of users, some making multiple revisions. The number of unique users is a good indicator of an article’s popularity.
//db.revisions.find({user:'James uk'}). forEach(function(doc){
//doc.num=db.getCollection('revisions').distinct('user', {title:doc.title }).length
//db.revisions.save(doc)
//})
//The top 5 regular users ranked by total revision numbers on this article, and the
//respective revision numbers.
var findtop5 = [
	{'$match':{title:"",anon:{$exists:false},bot:{$exists:false},admin:{$exists:false}}},
	{'$group':{'_id':"$user", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:-1}},
	{'$limit':5}	
]
//得到5个user 存在变量regular_users
RevisionSchema.statics.findtop5user = function(titles,callback){
	return this.aggregate([
		{'$match':{title:titles,anon:{$exists:false},bot:{$exists:false},admin:{$exists:false}}},
		{'$group':{'_id':"$user", 'numOfEdits': {$sum:1}}},
		{'$sort':{numOfEdits:-1}},
		{'$limit':5}	
	],callback)
}
//为5个unique user画表
//
RevisionSchema.statics.findrevnumbyyearandarticleanduser=function(user,title,year,callback)
{
	downyear=year.toString()+"-00-00T00:00:00Z";
	up=year+1;
	upyear=up.toString()+"-00-00T00:00:00Z";
	return this.find({'user':user,'title':title,"timestamp": { $gte: downyear,$lt:upyear}}).count()
	.exec(callback)
	}
//为每个user创建map轴
var userMap= new Map();
RevisionSchema.statics.createmapforuser= function(user,title,cb){
	userMap=new Map([]);
	async.series([
        function(callback) {
            Revision.findnewesttimeByuser(user,title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
   
                        newest = result[0].timestamp.trim().substring(0,4);
                        newyear=parseInt(newest);
                     
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
       
            Revision.findoldesttimeByuser(user,title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                 
                        oldest = result[0].timestamp.trim().substring(0,4);
                        oldyear=parseInt(oldest);
                     
                        callback(null);
                    }
                }
            )
        },

    ],
//optional callback
    function(err, results) {
        for(var i=oldyear;i<=newyear;i++)
        	{
        	userMap.set(i, {"count": 0});
        	}
        cb(null);
        
    });
}
//找到数据库中某一个用户的最新更新时间
RevisionSchema.statics.findnewesttimeByuser = function(user,title,callback){
	return this.find({'user':user,'title':title})
	.sort({'timestamp':-1})
	.limit(1)
	.exec(callback)
}
//找到数据库中某一个用户的最晚创建时间
RevisionSchema.statics.findoldesttimeByuser = function(user,title,callback){
	return this.find({'user':user,'title':title})
	.sort({'timestamp':1})
	.limit(1)
	.exec(callback)
}
//做出每个user的map
RevisionSchema.statics.findrevnumbyyearandarticleanduserservice=function(user,title,year,callback)
{
	Revision.findrevnumbyyearandarticleanduser(user,title,year,function (err,result) {
    if (err){
        console.log("Cannot find most revision!")
    }else{
   	 //console.log(result);
 	userMap.get(year).count=result;
 	//console.log("userMap.get(year).count"+userMap.get(year).count);
        callback(null);
    }
}
)
	}

RevisionSchema.statics.countrevbyuserandarticle= function(user,title,cb){
	async.series([
        function(callback) {
     
            Revision.createmapforuser(user,title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        //console.log("createmapforarticle success");
                        callback(null);
                    }
                }
            )
        },
        function(callback) {
            // do some stuff ...
        	flag=0;
            for(var [year,value] of userMap)
        		{
        		Revision.findrevnumbyyearandarticleanduserservice(user,title,year,function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                    	flag++;
                        if(flag==userMap.size)
                            callback(null);
                    }
                })
        		}
            
            
        },
    ],
//optional callback
    function(err, results) {
        cb(null,userMap);
    });
}


//unique user 查询有多少个个特殊的人
var findthemostpopular = [
	{'$match':{anon:{$exists:false}}},
	{'$group':{'_id':{title:"$title",user:"$user"} }},
	{'$group':{'_id':"$_id.title", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:-1}},
	{'$limit':1}	
]

RevisionSchema.statics.findmostpopular = function(callback){
	return this.aggregate(findthemostpopular)
	.exec(callback)
}
var findthelesspopular = [
	{'$match':{anon:{$exists:false}}},
	{'$group':{'_id':{title:"$title",user:"$user"} }},
	{'$group':{'_id':"$_id.title", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:1}},
	{'$limit':1}	
]

RevisionSchema.statics.findlesspopular = function(callback){
	return this.aggregate(findthelesspopular)
	.exec(callback)
}
//db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$min : "$likes"}}}])
var findtheshortestage = [
	{'$group':{'_id':"$title", 'numOfEdits': {$min:"$timestamp"}}},
	{'$sort':{numOfEdits:-1}},
	{'$limit':1}	
]
RevisionSchema.statics.findtheshortestagearticle = function(callback){
	return this.aggregate(findtheshortestage)
	.exec(callback)
}

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')

module.exports = Revision