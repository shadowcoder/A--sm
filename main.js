var fs = require('fs');
var expression = require('./parser');

var assignment = /^\s*([a-z]+)\s*([\+\-\*\/]?)=\s*([^\n;]*)/;

var lines = fs.readFileSync(process.argv[2]).toString().split('\n');

for(var i = 0; i < lines.length; ++i) {
    if(assignment.test(lines[i])) {
        var assignmentParams = lines[i].match(assignment);
        var reg = assignmentParams[1],
            mod = assignmentParams[2],
            exp = assignmentParams[3];
        if(mod.length) exp = reg+mod+exp;
        
        var eexp = expression(exp, "cx");
                
        console.log(eexp[0].join('\n'));
        
        if(["cs","fs","ds","ss","gs","ef"].indexOf(reg)) {
            console.log("push ax");
            console.log("mov ax, "+eexp[1][0]);
            console.log("mov "+reg+", ax");
            console.log("pop ax");
        } else {
            console.log("mov "+reg+", "+eexp[1][0]); 
        }
    } else {
        console.log(lines[i]);
    }
}