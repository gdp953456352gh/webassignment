/**
 * 
 */
var mongoose = require('./db')
var async=require('async');
var bot=[];
var admin=[];
var temp=[];
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
			 size:Number},
		 {
			    versionKey: false 
		})
var rf=require("fs");  
//给bot[]赋值
rf.readFile("E:/test/bot.txt","utf-8",function(err,data){  
    if(err){  
        console.log("error");  
    }else{  
    	bot = data.split('\r\n')  
    }  
});
//给admin[]赋值
rf.readFile("E:/test/admin.txt","utf-8",function(err,data){  
    if(err){  
        console.log("error");  
    }else{  
    	admin = data.split('\r\n')  
    	console.log(admin.indexOf('User'));
    }  
});
//The article with the most number of revisions.
//db.getCollection('revisions').aggregate([
//	{$group:{_id:"$title", numOfEdits: {$sum:1}}},
//	{$sort:{numOfEdits:-1}},
//	{$limit:1}
//        ])
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
RevisionSchema.statics.findalltitle = function(callback){
	return this.find({},{'title':1})
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
RevisionSchema.statics.apiquery =function api(title,timeforapi,callback){
	if (err){
		console.log("Cannot find " + title + ",s latest revision!")
	}else{
		 titles=title;
	     rvstart=timeforapi;
		var options = {
			hostname: 'en.wikipedia.org',
			path: '/w/api.php?action=query&format=json&prop=revisions&titles='+titles+'&rvprop=timestamp%7Cuser&rvlimit=max&rvstart='+rvstart
	};
	http.request(options, function(res){
		var data = '';
		res.on('data', function(chunk){
		data += chunk;
		});
		res.on('end', function(){
		data = JSON.parse(data);
		console.log(data)
		});
		}).end()//.exec(callback);	
		}
	//return rvstart;
}
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
RevisionSchema.statics.asyncqueryapi=function(title,callcack){
	async.series([
        function(callback) {
            Revision.findnewesttimeByarticle(title, function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                         console.log(result);
                         console.log(result[0]);
                        articleTable = result;
                        callback(null);
                        
                    }
                }
            )
        },
        function(callback) {
            // do some more stuff ...
            console.log("mr");
            Revision.apiquery(title,articleTable,function (err,result) {
                    if (err){
                        console.log("Cannot find most revision!")
                    }else{
                        console.log(result)
                        console.log("mrelse");
                        MostRevArticle = result;
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
//        console.log("final");
//        res.render('revision.pug',{title: 'Expresslu', MostRevArticle:MostRevArticle, articleTable:articleTable});
        return {title: 'Expresslu', MostRevArticle:MostRevArticle, articleTable:articleTable};
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
function api(err,result){
	if (err){
		console.log("Cannot find " + title + ",s latest revision!")
	}else{
		console.log(result)
		 titles=result[0].title;
	     rvstart=result[0].timestamp;
		var options = {
			hostname: 'en.wikipedia.org',
			path: '/w/api.php?action=query&format=json&prop=revisions&titles='+titles+'&rvprop=timestamp%7Cuser&rvlimit=max&rvstart='+rvstart
	};
	http.request(options, function(res){
		var data = '';
		res.on('data', function(chunk){
		data += chunk;
		});
		res.on('end', function(){
		data = JSON.parse(data);
		console.log(data)
		});
		}).end();	
		}	
	return rvstart;
}
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
RevisionSchema.statics.apiquery = function(title){
//	return this.find({'title':title})
//	.sort({'timestamp':-1})
//    .limit(1)
//	.exec(api)
//	var temp=500;
//	while(temp==500)
//		{
//    var promise = this.find({'title':title})
//	.sort({'timestamp':-1})
//    .limit(1)
//	.exec(api)
//    promise.then(
//      function(result) {
//    	 temp= result.limits.revisions;
//  		console.log(temp)
//      },
//      function(err) {
//        // on reject
//      }
//    );
//		}
    var promise = this.find({'title':title})
	.sort({'timestamp':-1})
    .limit(1)
	.exec(api)
    promise.then(
      function(result) {
    	 temp= result.limits.revisions;
  		console.log(temp)
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
//加入bot admin 两列 可能要异步
RevisionSchema.statics.addbotadmincolumn = function(callback){
	this.find({"anon":{$exists:false}})
	.exec(function(err,result){
		
		if (err){
			console.log("Cannot find " + title + ",s latest revision!")
		}else{
			temp = result
		}	
	})	
	console.log(temp.length)
	temp.forEach(function(doc){
		if(bot.indexof(doc.user)!=-1)
			{
			doc.bot="";
			}
		if(admin.indexof(doc.user)!=-1)
		{
		doc.admin="";
		}		
		//doc.num=Revision.distinct('user', {title:doc.title }).length
		Revision.save(doc)
	})
	
}
RevisionSchema.statics.findadminusenumr=function(callback)
{
	return this.find({}).count()
	.exec(callback)
	}
RevisionSchema.statics.findadminusenumr=function(callback)
{
	return this.find({"admin": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findbotusenumr=function(callback)
{
	return this.find({"bot": {$exists: true}}).count()
	.exec(callback)
	}
RevisionSchema.statics.findanonusenumr=function(callback)
{
	return this.find({"anon": {$exists: true}}).count()
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


RevisionSchema.statics.findusertypebyyear = function(callback){
	this.find({anon: {$exists: true}})//查询匿名用户 按年份
	.exec(function(err,result){
		
		if (err){
			console.log("Cannot find " + title + ",s latest revision!")
		}else{
			temp = result
		}	
	})	
	temp.forEach(function(doc){
		var year=doc.timestamp.substring(0,4).parseInt("10");
		mymap.set(year,mymap.get(year)+1)
	})
	this.find({anon: {$exists: false}})//查询实名用户 按年份
	.exec(function(err,result){
		
		if (err){
			console.log("Cannot find " + title + ",s latest revision!")
		}else{
			temp = result
		}	
	})
	temp.forEach(function(doc){
		var year=doc.timestamp.substring(0,4).parseInt("10");
		mymap.set(year,mymap.get(year)+1)
		
	})
}

//The article edited by largest group of registered users. Each wiki article is edited by a number of users, some making multiple revisions. The number of unique users is a good indicator of an article’s popularity.
//db.revisions.find({user:'James uk'}). forEach(function(doc){
//doc.num=db.getCollection('revisions').distinct('user', {title:doc.title }).length
//db.revisions.save(doc)
//})
var findpopular = [
	{'$match':{anon:{$exists:false}}},
	{'$group':{'_id':{title:"$title",user:"$user"} }},
	{'$group':{'_id':"$_id.title", 'numOfEdits': {$sum:1}}},
	{'$sort':{numOfEdits:1}},
	{'$limit':1}	
]

RevisionSchema.statics.findlpopular = function(callback){
//	this.find()
//	.exec(function(err,result){
//		
//		if (err){
//			console.log("Cannot find " + title + ",s latest revision!")
//		}else{
//			temp = result
//		}	
//	})	
//	console.log(temp.length)
//	temp.forEach(function(doc){
//		doc.num=Revision.distinct('user', {title:doc.title }).length
//		Revision.save(doc)
//	})
//    return this.find()
//	.sort({'num':-1})
//	.limit(1)
//	.exec(callback)
	return this.aggregate(findpopular)
	.exec(callback)
}

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')

module.exports = Revision