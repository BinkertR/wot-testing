// Author: Michael.Lagally@oracle.com
// Created: 19.3.2018
// Last modified: 21.2.2022

"use strict";

function decodeProperties(n, p) {
    if (verbose) console.log("decode: " + n + " " + p);
    var res=[];
    if ((p.type == "object")) {
        for (var q in p.properties) {
            if (verbose) console.log("***** object with #elements:"+Object.keys(p).length);
            res = res.concat(decodeProperties(n+"_"+q, p.properties[q]));
        }
    }
    else if (p.type == "array") {
        for (var i=0; i<q.items.length; i++) {
            if (verbose) console.log("***** array with #elements:"+Object.keys(p).length);
            res = res.concat(decodeProperties(n+"_"+i, p.properties[i]));
        }
    } else {
        var prop={};
        prop.name=n;
        if (p.type) {
            prop.type = p.type.toUpperCase();
        }
        if (p.description) {
            prop.description=p.description;
        }
        else if (p.title) {
            prop.description=p.title;
        }
        if (p.minimum && p.maximum) {
            prop.range=p.minimum+","+p.maximum;
        } else if (p.maximum) {
            prop.range="0,"+p.maximum;
        } else if (p.minimum) {
            prop.range=p.minimum+",0";
        }
        if (p.readOnly) {
            prop.writable=false;
        }
        res.push(prop);
    }
    return res;
}

// ----------------------------------

var fs = require("fs");
var path = require("path");
var baseDir = ".";

//console.log(`td-dm started`);

if (process.argv.length<3) {
	   console.log ("Usage: node td2dm.js <thingDescr.jsonld> [-v]");
	   console.log ("Example: node td2dm.js TDs/Festo_Plant.jsonld");
	   process.exit (-1);
	}


var filename=process.argv[2];

var verbose=process.argv[3] ==="-v";

var content=fs.readFileSync('./'+filename);
var path=filename.substring(0, filename.lastIndexOf("/"));
// get package directory name
var pkg=path.substring(path.lastIndexOf("/")+1);
pkg = "oracle";
// strip path and extension
var plainfn=path.substring(filename.lastIndexOf("/")+1, filename.lastIndexOf("."));

var td=JSON.parse(content);
if (verbose) console.log(td);

if (verbose) console.log("-----");

var dm={};
dm.name=td.title;
dm.description=td.base;
dm.urn="urn:com:"+pkg+":"+td.title;

var now=new Date(Date.now());
dm.createdAsString=now.toISOString();
dm.created=now.valueOf();
dm.lastModifiedAsString=now.toISOString();
dm.lastModified=now.valueOf();
dm.userLastModified="auto-generated by td2dm converter";
dm.attributes=[];
dm.actions=[];
dm.events=[];
//dm.formats=[];
//dm.links=[];

for (var p in td.properties) {
    if (verbose) console.log(td.properties[p]);
    dm.attributes = dm.attributes.concat(decodeProperties(p, td.properties[p]));
}

if (verbose) console.log("--- done properties --");

// TODO: Add parameter handling of actions
for (var a in td.actions) {
    if (verbose) console.log(iac);
    var act={};
    act.name=a;
    var iac=td.actions[a];
    if (iac.label) {
        act.description=iac.label;
    } else {
        act.description=iac.title;
    };

    dm.actions.push(act);
    if (verbose) console.log(act);
}

if (verbose) console.log("-----");

for (var e in td.events) {
    if (verbose) console.log(iac);
    var evt={};
    var iac=td.events[e];
    evt.name=e;
    evt.description=iac.description;
    if (verbose) console.log(evt);
    dm.events.push(evt);
}
if (verbose) console.log("-----");

console.log(JSON.stringify(dm, null, "\t"));

