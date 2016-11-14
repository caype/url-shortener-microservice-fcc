var express = require("express");
var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
const mlabUrl = process.env.MONGOLAB_URI;
var app = express();
var port = process.env.PORT || 8080;
const applicationPath ="https://gentle-bayou-97721.herokuapp.com/";

app.get('/all',function(req,res){
    mongoClient.connect(mlabUrl,function(err, db) {
        if(err) throw err;
        var tableurl = db.collection('miniurl');
        tableurl.find({}).toArray(function(err,resul){
            if(err) throw(err);
            else{
                res.send(resul);
            }
        });
    })
});

app.get('/delete',function(req,res){
    mongoClient.connect(mlabUrl,function(err, db) {
        if(err) throw err;
        var tableurl = db.collection('miniurl');
        tableurl.remove({},function(err,resu) {
            if(err) throw err;
            res.send(resu);
        });
    });
});

app.get('/add/:urlParam*?',function(req,res){
    if(req.params.urlParam){
        var givenUrl = (req.url).slice(5);
            var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        if (!regex.test(givenUrl)) {
            res.send({error:{description:"Enter a valid URL that matches this pattern :",requiredType:'http://www.example.com || https://example.com'}});
        }else{
                 mongoClient.connect(mlabUrl,function(err, db) {
                     if(err) throw err;
                     else{
                         var urltable = db.collection('miniurl');
                         urltable.find({"original":givenUrl}).toArray(function(err,fetchedResults){
                             if(err) throw err;
                             else if(fetchedResults.length>0){
                                 res.send(fetchedResults);
                             }else{
                                 var newEntry = {original:givenUrl,minified:applicationPath+generateRandomSalt()};
                                 urltable.insert([newEntry],function(err,insertedValue){
                                     if(err) throw err;
                                     else{
                                         res.send(insertedValue.ops);
                                     }
                                 });
                             }
                         });
                     }
                 });
        }
    }else{
        res.send({error:"Invalid or empty url! Please check again."});
    }
});

app.get('/:miniurl*?',function(req,res){
    if(req.params.miniurl){
        mongoClient.connect(mlabUrl,function(err,db){
           if(err) throw err;
           else{
               var targetCollection = db.collection("miniurl");
               targetCollection.find({minified:applicationPath+req.params.miniurl}).toArray(function(err,results) {
                   if(err) throw err;
                   else{
                       if(results.length>0){
                        res.redirect(301,results[0]["original"]);   
                       }else{
                           res.send("{error:'Bad Result. Try Again!'}");
                       }
                   }
               });
           }
        });
    }else{
         res.send({error:"Invalid url! Please check again."});
    }
});



function generateRandomSalt(){
    return Math.floor(Math.random()*10000)+2;
}

app.listen(port,function(){
 console.log("something is happening at https://gentle-bayou-97721.herokuapp.com/ ");
});


