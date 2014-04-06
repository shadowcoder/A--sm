var fs = require('fs');
var expression = require('./parser');

var assignment = /^\s*([a-z]+)\s*([\+\-\*\/]?)=\s*([^\n;]*)/;
var functionCall = /^\s*([^\(\s]+)\(([^\)]*)\)(?:[^:]?)/;
var functionDecl = /^([^\(\s]+)\(([^\)]*)\):/;
var ifElse = /^\s*if \(([a-z0-9\[\]]*)\s*(==|>=|<=|&&|)\s*([^\)]*)\):([^?\n^]*)(?:\?\s*([^\n]*))?/;

var lines = fs.readFileSync(process.argv[2]).toString().split('\n');

var literalStrings = [];

for(var i = 0; i < lines.length; ++i) {
    if(assignment.test(lines[i])) {
        var assignmentParams = lines[i].match(assignment);
        var reg = assignmentParams[1],
            mod = assignmentParams[2],
            exp = assignmentParams[3];
        if(mod.length) exp = reg+mod+exp;
        
        var eexp = expression(exp, "cx");
                
        console.log(eexp[0].join('\n'));
        
        if(["cs","fs","ds","ss","gs","es"].indexOf(reg) > -1) {
            console.log("push ax");
            console.log("mov ax, "+eexp[1][0]);
            console.log("mov "+reg+", ax");
            console.log("pop ax");
        } else {
            console.log("mov "+reg+", "+eexp[1][0]); 
        }
    } else if(functionDecl.test(lines[i])) {
        var declParams = lines[i].match(functionDecl);
        console.log(declParams[1]+":");
        
        var dparams = declParams[2].split(",");
        for(var g = dparams.length-1;g>-1; --g) {
            console.log("pop "+dparams[g]);
        }
    } else if(functionCall.test(lines[i])) {
        var callParams = lines[i].match(functionCall);
        var params = callParams[2].split(",");
        for(var f = params.length-1; f > -1; --f) {
            var p = params[f].trim();
            if(p[0] == '\"' && p[p.length-1] == '\"') {
                literalStrings.push(p);
                console.log("push literalString"+literalStrings.length);
            } else {
                console.log("push "+p);
            }
        }
        console.log("call "+callParams[1]);
    } else if(ifElse.test(lines[i]) {
        
    } else if(lines[i].trim() == "LITERALS") {
        for(var q = 0; q < literalStrings.length; ++q) console.log("literalString"+q+" db '"+literalStrings[q]+"', 0");
        literalStrings = [];
    } else {
        console.log(lines[i]);
    }
}