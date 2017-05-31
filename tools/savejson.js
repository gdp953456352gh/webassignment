var mongoose = require('./db')
var fs = require('fs');
var root_path="C:/test/a2-test2";
var file="E:/test/BBC.json";
//var result=JSON.parse(fs.readFileSync(file));
function getAllFiles(root){
	  var res = new Array(); 
	  var files = fs.readdirSync(root);
	  files.forEach(function(file){
	    var pathname = root+'/'+file
	    , stat = fs.lstatSync(pathname);

	    if (!stat.isDirectory()){
	       res.push(pathname);
	       console.log(pathname);
	    } else {
	       res = res.concat(getAllFiles(pathname));
	    }
	  });
	  return res
	}
function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
    } else {
        console.info('potatoes were successfully stored.');
    }
}
var RevisionSchema = new mongoose.Schema(
		{title: String, 
		 timestamp:String, 
		 user:String, 
		 num: Number,
		 anon:String},
		 {
			    versionKey: false 
		})

RevisionSchema.statics.findTitleLatestRev = function(title, callback){
	
	return this.find({'title':title})
	.sort({'timestamp':-1})
	.limit(1)
	.exec(callback)
}

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')
var w_content=getAllFiles(root_path);
console.log(w_content[0]);
console.log(w_content.length);
w_content.forEach(function(file){

	    var result=JSON.parse(fs.readFileSync(file));
	    Revision.collection.insert(result, onInsert);
	  });

//var node = new Revision(result)
//node.save(function(err){
//    if(err){
//        console.log(err);
//    }else{
//        console.log('The new node is saved');
//    }
//});

