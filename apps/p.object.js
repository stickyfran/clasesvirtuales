// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function pInference(n, phat, alpha, p0, type, signiflevel, testtype) {

    this.n = (n === '' || n === null) ? NaN : eval(n);
    
    var rawPhat = (phat === '' || phat === null) ? NaN : eval(phat);
    var formSelect = document.getElementById('form0').phatxselect.value;
    
    if(formSelect == 'phat') {
        this.phat = rawPhat;
    } else if (formSelect == 'x') {
        this.phat = rawPhat / this.n;
    }
    
    this.alpha = (alpha === '' || alpha === null) ? NaN : eval(alpha);
    this.p0 = (p0 === '' || p0 === null) ? NaN : eval(p0);
    this.signiflevel = (signiflevel === '' || signiflevel === null) ? NaN : eval(signiflevel);
    
    var showeq = false;
    if(document.getElementById('showeq').checked) {
        showeq = true;
    };

    // Safely exit if missing core calculations
    if (isNaN(this.n) || isNaN(this.phat) || isNaN(this.alpha)) {
        return; 
    }

    if(testtype == 'wald') {
        var se = Math.sqrt(this.phat*(1-this.phat)/this.n);
        var ci_lo = this.phat - jStat.normal.inv(1-this.alpha/2,0,1) * se;
        var ci_hi = this.phat + jStat.normal.inv(1-this.alpha/2,0,1) * se;
        if(ci_lo < 0) ci_lo = 0;
        if(ci_hi > 1) ci_hi = 1;
        if(showeq) {
            var txt = '$$\\begin{eqnarray}\\hat{p} \\pm z_{\\alpha/2}' +
            '\\sqrt{\\frac{\\hat{p} (1-\\hat{p})}{n}} ' +
            '&&= ' + 
            this.phat.toFixed(5) + '\\pm' + 
            jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + 
            '\\sqrt{\\frac{' + this.phat.toFixed(5) + '(1-' + this.phat.toFixed(5) + ')}{' + this.n + '}} \\\\' +
            '&&= ' + this.phat.toFixed(5) + '\\pm' + 
            (jStat.normal.inv(1-this.alpha/2,0,1) * se).toFixed(5) + '\\\\' +
            '&&= (' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')$';        
        }

        var ciOutputEl = document.getElementById("ci_output");
        ciOutputEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([ciOutputEl]); 

        if(!isNaN(this.p0) && !isNaN(this.signiflevel)) {
            var cv, pvalue, cv_txt, pvalue_txt;

            var ts = (this.phat-this.p0)/se;
            if(showeq) {
                var txt = 'Test statistic: $$z^\\ast = ' + 
                '\\frac{\\hat{p}-p_0}' + 
                '{\\sqrt{\\frac{\\hat{p} (1-\\hat{p})}{n}}} = ' + 
                '\\frac{' + this.phat.toFixed(5) +  '-(' + this.p0 + ')}' + 
                '{\\sqrt{\\frac{' + this.phat.toFixed(5) + '(1-' + this.phat.toFixed(5) + ')}{' + this.n + '}}} = ' + 
                ts.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]);

            norm = new normalDistribution(0,1);

            if(type == 'neq') {
                cv = jStat.normal.inv(1-this.signiflevel/2,0,1);
                pvalue = jStat.normal.cdf(-Math.abs(ts),0,1)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm z_{\\alpha/2} = \\pm z_{' 
                        + (this.signiflevel/2) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(Z > |z^\\ast|) = 2P(Z > ' + Math.abs(ts).toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $\\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'twotail',cv); 
            }
            if(type == 'gt') {
                cv = jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = 1-jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $z_{\\alpha} = z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z > z^\\ast) = P(Z > ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'greater',cv); 
            }
            if(type == 'lt') {
                cv = -jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $-z_{\\alpha} = -z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z < z^\\ast) = P(Z < ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'less',cv); 
            }

            var critValEl = document.getElementById("criticalValue");
            critValEl.innerHTML = cv_txt;
            if (window.MathJax) MathJax.typesetPromise([critValEl]);

            var pValueEl = document.getElementById("p_value");
            pValueEl.innerHTML = pvalue_txt;
            if (window.MathJax) MathJax.typesetPromise([pValueEl]);
        }
    }
    
    if(testtype == 'ac') {
        var z2 = Math.pow(jStat.normal.inv(1-this.alpha/2,0,1),2);
        var ntilde = this.n + z2;
        var ptilde = (this.n*this.phat + z2/2) / ntilde;
        var se = Math.sqrt(ptilde*(1-ptilde)/ntilde);
        var ci_lo = ptilde - jStat.normal.inv(1-this.alpha/2,0,1) * se;
        var ci_hi = ptilde + jStat.normal.inv(1-this.alpha/2,0,1) * se;
        if(ci_lo < 0) ci_lo = 0;
        if(ci_hi > 1) ci_hi = 1;

        if(showeq) {
            var txt = '$$\\begin{eqnarray}\\tilde{p} \\pm z_{\\alpha/2}' +
            '\\sqrt{\\frac{\\tilde{p} (1-\\tilde{p})}{\\tilde{n}}} ' +
            '&&= ' + 
            ptilde.toFixed(5) + '\\pm' + 
            jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + 
            '\\sqrt{\\frac{' + ptilde.toFixed(5) + '(1-' + ptilde.toFixed(5) + ')}{' + 
            ntilde.toFixed(3) + '}} \\\\' +
            '&&= ' + ptilde.toFixed(5) + '\\pm' + 
            (jStat.normal.inv(1-this.alpha/2,0,1) * se).toFixed(5) + '\\\\' +
            '&&= (' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$' +
            '$$\\tilde{n} = n + z_{\\alpha/2}^2 = ' + this.n + '+' + 
            jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + '^2 =' + ntilde.toFixed(3) + '$$' + 
            '$$\\tilde{p} = \\frac{n\\hat{p} + 0.5 z_{\\alpha/2}^2}{\\tilde{n}} = ' + 
            '\\frac{' + this.n + '(' + this.phat.toFixed(5) + ')+' + 0.5 + '(' + 
            jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + '^2)}{' + 
            ntilde.toFixed(3) + '} = ' + ptilde.toFixed(5) + '$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')$';        
        }

        var ciOutputEl = document.getElementById("ci_output");
        ciOutputEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([ciOutputEl]);

        if(!isNaN(this.p0) && !isNaN(this.signiflevel)) {
            var cv, pvalue, cv_txt, pvalue_txt;

            var ts = (ptilde-this.p0)/se;
            if(showeq) {
                var txt = 'Test statistic:$$z^\\ast = ' + 
                '\\frac{\\tilde{p}-p_0}' + 
                '{\\sqrt{\\frac{\\tilde{p} (1-\\tilde{p})}{\\tilde{n}}}} = ' + 
                '\\frac{' + ptilde.toFixed(5) +  '-(' + this.p0 + ')}' + 
                '{\\sqrt{\\frac{' + ptilde.toFixed(5) + '(1-' + ptilde.toFixed(5) + ')}{' + 
                ntilde.toFixed(3) + '}}} = ' + 
                ts.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

            norm = new normalDistribution(0,1);

            if(type == 'neq') {
                cv = jStat.normal.inv(1-this.signiflevel/2,0,1);
                pvalue = jStat.normal.cdf(-Math.abs(ts),0,1)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm z_{\\alpha/2} = \\pm z_{' 
                        + (this.signiflevel/2) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(Z > |z^\\ast|) = 2P(Z > ' + Math.abs(ts).toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $\\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'twotail',cv); 
            }
            if(type == 'gt') {
                cv = jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = 1-jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $z_{\\alpha} = z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z > z^\\ast) = P(Z > ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'greater',cv); 
            }
            if(type == 'lt') {
                cv = -jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $-z_{\\alpha} = -z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z < z^\\ast) = P(Z < ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'less',cv); 
            }

            var critValEl = document.getElementById("criticalValue");
            critValEl.innerHTML = cv_txt;
            if (window.MathJax) MathJax.typesetPromise([critValEl]);

            var pValueEl = document.getElementById("p_value");
            pValueEl.innerHTML = pvalue_txt;
            if (window.MathJax) MathJax.typesetPromise([pValueEl]);
        }
    }

    if(testtype == 'score') {
        var z1 = jStat.normal.inv(1-this.alpha/2,0,1);
        var z2 = Math.pow(jStat.normal.inv(this.alpha/2,0,1),2);
        var ci_lo = (this.phat + z2/(2*this.n) - 
            z1 * Math.sqrt(((this.phat*(1-this.phat) + z2/(4*this.n))/this.n))) /
            (1+z2/this.n);
        var ci_hi = (this.phat + z2/(2*this.n) + 
            z1 * Math.sqrt(((this.phat*(1-this.phat) + z2/(4*this.n))/this.n))) /
            (1+z2/this.n);
        if(ci_lo < 0) ci_lo = 0;
        if(ci_hi > 1) ci_hi = 1;

        if(showeq) {
            var txt = '$$\\begin{eqnarray}' +
            '&&\\frac{\\hat{p} + \\frac{z_{\\alpha/2}^2}{2n} ' +
            '\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}+' +
            '\\frac{z_{\\alpha/2}^2}{4n^2}}}{1+\\frac{z_{\\alpha/2}^2}{n}}\\\\' +
            '&&\\quad= \\frac{' + 
            this.phat.toFixed(5) + '+ \\frac{' + z1.toFixed(3) + '^2}{2(' + this.n + ')} \\pm ' +
            jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + 
            '\\sqrt{\\frac{' + this.phat.toFixed(5) + '(1-' + this.phat.toFixed(5) + ')}' +
            '{' + this.n + '}+\\frac{' + z1.toFixed(3) + '^2}{4(' + this.n + 
            ')^2} } } {1+\\frac{' + z1.toFixed(3) + '^2}{' + this.n + '}} \\\\' +
            '&&\\quad=' + ((this.phat + z1*z1/(2*this.n))/(1+z1*z1/this.n)).toFixed(5) + ' \\pm' +
            (z1 * Math.sqrt(((this.phat*(1-this.phat) + 
                z1*z1/(4*this.n))/this.n)) / (1+z2/this.n)).toFixed(5) +
            '\\\\' +
            '&&\\quad= (' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')$';        
        }

        var ciOutputEl = document.getElementById("ci_output");
        ciOutputEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([ciOutputEl]);

        if(!isNaN(this.p0) && !isNaN(this.signiflevel)) {
            var cv, pvalue, cv_txt, pvalue_txt;
            var se = Math.sqrt(this.p0 * (1-this.p0) / this.n);
            var ts = (this.phat-this.p0)/se;

            if(showeq) {
                var txt = 'Test statistic:$$z^\\ast = ' + 
                '\\frac{\\hat{p}-p_0}' + 
                '{\\sqrt{\\frac{p_0 (1-p_0)}{n}}} = ' + 
                '\\frac{' + this.phat.toFixed(5) +  '-' + this.p0 + '}' + 
                '{\\sqrt{\\frac{' + this.p0 + '(1-' + this.p0 + ')}{' + this.n + '}}} = ' + 
                ts.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

            norm = new normalDistribution(0,1);

            if(type == 'neq') {
                cv = jStat.normal.inv(1-this.signiflevel/2,0,1);
                pvalue = jStat.normal.cdf(-Math.abs(ts),0,1)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm z_{\\alpha/2} = \\pm z_{' 
                        + (this.signiflevel/2) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(Z > |z^\\ast|) = 2P(Z > ' + Math.abs(ts).toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $\\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'twotail',cv); 
            }
            if(type == 'gt') {
                cv = jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = 1-jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $z_{\\alpha} = z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z > z^\\ast) = P(Z > ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'greater',cv); 
            }
            if(type == 'lt') {
                cv = -jStat.normal.inv(1-this.signiflevel,0,1);
                pvalue = jStat.normal.cdf(ts,0,1);
                if(showeq) {
                    cv_txt = 'Critical value: $-z_{\\alpha} = -z_{' 
                        + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(Z < z^\\ast) = P(Z < ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                norm.printPdf(ts,'less',cv); 
            }

            var critValEl = document.getElementById("criticalValue");
            critValEl.innerHTML = cv_txt;
            if (window.MathJax) MathJax.typesetPromise([critValEl]);

            var pValueEl = document.getElementById("p_value");
            pValueEl.innerHTML = pvalue_txt;
            if (window.MathJax) MathJax.typesetPromise([pValueEl]);
        }
    }

    if(testtype == 'cp') {
        var ci_lo = jStat.beta.inv(this.alpha/2, this.n*this.phat, this.n-this.n*this.phat+1);
        var ci_hi = jStat.beta.inv(1-this.alpha/2, this.n*this.phat+1, this.n-this.n*this.phat);
        if(this.phat == 0) {
            ci_lo = 0; 
            ci_hi = 1 - Math.pow(this.alpha/2,1/this.n);
        }
        if(this.phat == 1) {
            ci_lo = Math.pow(this.alpha/2,1/this.n);
            ci_hi = 1;
        }

        var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
        ci_hi.toFixed(5) + ')$';        

        var ciOutputEl = document.getElementById("ci_output");
        ciOutputEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([ciOutputEl]); 
    }
}

