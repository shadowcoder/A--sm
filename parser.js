function numFix(num) {
    if(typeof num === 'string') num = num.trim(); 
    if(/(?:[0-9A-Fa-f]+)[hH]/.test(num)) return parseInt(num.slice(0,-1), 16);
    return num;
}

var asm = [];


function parseExpression(expression, reg, bottom) {
   
    if(!bottom){ 
        asm = []; 
        asm.push("push "+reg);
    }
    
    var stack = [];

    var index = 0;
    var current = "";
       
    while(index < expression.length) {
        if(expression[index] == '(') {
            var nextScope = "";
            var parans = 1;
            while(parans) {
                if(expression[++index] == ')') parans--;
                else if(expression[index] == '(') parans++;
                if(parans) nextScope += expression[index];
            }
            stack = stack.concat(parseExpression(nextScope, reg,  true))
        } else if("+-/*".indexOf(expression[index]) > -1) {
            if(current.length) stack.push(current);
            stack.push(expression[index]);
            current = "";
        } else {
            current += expression[index];
        }
        ++index;
    }
    stack.push(current);   
    
    while(stack.length > 1) {
        var triggers = ["*/", "+-"];
        var triggerI = 0;
    
        while(trigger = triggers[triggerI++]) {
            index = 0;
            while(index < stack.length) {
                if(trigger.indexOf(stack[index]) > -1) {
                    var operation = stack[index],
                        op1 = numFix(stack[index-1]),
                        op2 = numFix(stack[index+1]);
                    if(op1*1 && op2 * 1) stack[index-1] = eval(op1+operation+op2);
                    else {
                        stack[index-1] = reg;

                        if(['x','l','h'].indexOf(op2.slice(-1)) > -1 && (operation == '+' || operation == '*')) {
                            var t = op1;
                            op1 = op2;
                            op2 = t;
                        }
                    
                        var instructs = {'+': 'add',
                                        '-': 'sub',
                                        '*': 'mul',
                                        '/': 'div'}

                        switch(operation) {
                        case '+':
                        case '-':
                            if(reg != op1) asm.push("mov "+reg+","+op1);
                            asm.push(instructs[operation]+" "+reg+","+op2);
                            break;
                        case '*':
                        case '/':
                            if('ax' != op1) {
                                 asm.push("push ax");
                                 asm.push("mov ax,"+op1);
                            }
                            asm.push(instructs[operation]+" "+op2);
                            if('ax' != op1) {
                                asm.push("mov "+reg+", ax");
                                asm.push("pop ax");
                            }
                            break;
                        default:
                            console.log("invalid operation "+operation);
                        }
                    
                    }
                    stack.splice(index, 2);
                
                }
                ++index;
            }
        }
        
        while(stack[stack.length-1] == ' ') stack.splice(stack.length-1, 1);    
        
    }
    
    if(!bottom && stack[0] != reg) asm.splice(0,1);
    
    return stack;
    
}

module.exports = parseExpression;