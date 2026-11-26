// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function ztInference(n, xbar, sd, alpha, citype, itype, mu0, type, signiflevel) {

    this.n = (n === '' || n === null) ? NaN : eval(n);
    this.xbar = (xbar === '' || xbar === null) ? NaN : eval(xbar);
    this.sd = (sd === '' || sd === null) ? NaN : eval(sd);
    this.alpha = (alpha === '' || alpha === null) ? NaN : eval(alpha);
    this.mu0 = (mu0 === '' || mu0 === null) ? NaN : eval(mu0);
    this.signiflevel = (signiflevel === '' || signiflevel === null) ? NaN : eval(signiflevel);
    
    var showeq = false;
    if(document.getElementById('showeq').checked) {
        showeq = true;
    };

    // Only proceed if core parameters are valid numbers
    if (isNaN(this.n) || isNaN(this.xbar) || isNaN(this.sd) || isNaN(this.alpha)) {
        return; 
    }

    if(itype == 'sigma') {
        if(citype == 'ci') {
            var ci_lo = this.xbar - jStat.normal.inv(1-this.alpha/2,0,1)*this.sd/Math.sqrt(this.n);
            var ci_hi = this.xbar + jStat.normal.inv(1-this.alpha/2,0,1)*this.sd/Math.sqrt(this.n);
        }
        else if(citype == 'upper') {
            var ci_lo = this.xbar - Infinity;
            var ci_hi = this.xbar + jStat.normal.inv(1-this.alpha,0,1)*this.sd/Math.sqrt(this.n);
        }
        else {
            var ci_lo = this.xbar - jStat.normal.inv(1-this.alpha,0,1)*this.sd/Math.sqrt(this.n);
            var ci_hi = this.xbar + Infinity;
        }
        if(showeq) {
            if(citype == 'ci') {
                var txt = '\\begin{eqnarray} \\bar{x} \\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} ' +
                '&=& ' + this.xbar + '\\pm' + jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}} \\\\ ' +
                '&=& ' + '(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
            }
            else if(citype == 'upper') {
                var txt = '\\begin{eqnarray} \\left(-\\infty,\\ \\bar{x} + ' +
                'z_{\\alpha}\\frac{\\sigma}{\\sqrt{n}}\\right) ' +
                '&=& \\left(-\\infty,\\ ' + this.xbar + '+' + jStat.normal.inv(1-this.alpha,0,1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}}\\right) \\\\ ' +
                '&=& (-\\infty,\\ ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
            }
            else {
                var txt = '\\begin{eqnarray} \\left( \\bar{x} - ' +
                'z_{\\alpha}\\frac{\\sigma}{\\sqrt{n}},\\ \\infty\\right) ' +
                '&=& \\left(' + this.xbar + '-' + jStat.normal.inv(1-this.alpha,0,1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}},\\ \\infty\\right) \\\\ ' +
                '&=& ' + '(' + ci_lo.toFixed(5) + ', \\infty)\\end{eqnarray}';
            }
        }
        else {
            if(citype == 'ci') {
                var txt = '$(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')$';     
            }
            else if(citype == 'upper') {
                var txt = '$(-\\infty' + ', ' + ci_hi.toFixed(5) + ')$';        
            }
            else {
                var txt = '$(' + ci_lo.toFixed(5) + ', ' + '\\infty)$';     
            }
        }
    }
    else {
        if(citype == 'ci') {
            var ci_lo = this.xbar - jStat.studentt.inv(1-this.alpha/2,this.n-1)*this.sd/Math.sqrt(this.n);
            var ci_hi = this.xbar + jStat.studentt.inv(1-this.alpha/2,this.n-1)*this.sd/Math.sqrt(this.n);
        }
        else if(citype == 'upper') {
            var ci_lo = this.xbar - Infinity;
            var ci_hi = this.xbar + jStat.studentt.inv(1-this.alpha,this.n-1)*this.sd/Math.sqrt(this.n);
        }
        else {
            var ci_lo = this.xbar - jStat.studentt.inv(1-this.alpha,this.n-1)*this.sd/Math.sqrt(this.n);
            var ci_hi = this.xbar + Infinity;
        }
        if(showeq) {
            if(citype == 'ci') {
                var txt = '\\begin{eqnarray} \\bar{x} \\pm t_{\\alpha/2,n-1}\\frac{s}{\\sqrt{n}} ' +
                '&=& ' + this.xbar + '\\pm' + jStat.studentt.inv(1-this.alpha/2,this.n-1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}} \\\\ ' +
                '&=& ' + '(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
            }
            else if(citype == 'upper') {
                var txt = '\\begin{eqnarray} \\left(-\\infty,\\ \\bar{x} + ' +
                't_{\\alpha,n-1}\\frac{s}{\\sqrt{n}}\\right) ' +
                '&=& \\left(-\\infty,\\ ' + this.xbar + '+' + jStat.studentt.inv(1-this.alpha,this.n-1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}}\\right) \\\\ ' +
                '&=& (-\\infty,\\ ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
            }
            else {
                var txt = '\\begin{eqnarray} \\left( \\bar{x} - ' +
                't_{\\alpha,n-1}\\frac{s}{\\sqrt{n}},\\ \\infty\\right) ' +
                '&=& \\left(' + this.xbar + '-' + jStat.studentt.inv(1-this.alpha,this.n-1).toFixed(3) + 
                '\\frac{' + this.sd + '}{\\sqrt{' + this.n + '}},\\ \\infty\\right) \\\\ ' +
                '&=& ' + '(' + ci_lo.toFixed(5) + ', \\infty)\\end{eqnarray}';
            }
        }
        else {
            if(citype == 'ci') {
                var txt = '$(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')$';     
            }
            else if(citype == 'upper') {
                var txt = '$(-\\infty' + ', ' + ci_hi.toFixed(5) + ')$';        
            }
            else {
                var txt = '$(' + ci_lo.toFixed(5) + ', ' + '\\infty)$';     
            }
        }
    }

    var ciOutputEl = document.getElementById("ci_output");
    ciOutputEl.innerHTML = txt;
    if (window.MathJax) MathJax.typesetPromise([ciOutputEl]);

    if(!isNaN(this.mu0) && !isNaN(this.signiflevel)) {
        var cv, pvalue, cv_txt, pvalue_txt;
        var ts = (this.xbar-this.mu0)/(this.sd/Math.sqrt(this.n));
        
        if(itype == 'sigma') {
            if(showeq) {
                var txt = 'Test statistic: $z^\\ast = \\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}} = ' + 
                    '\\frac{' + this.xbar + '-' + this.mu0 + '}{' + this.sd + '/ \\sqrt{' + this.n + '}} =' +  
                    ts.toFixed(3) + '$';
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

        else {
            if(showeq) {
                var txt = 'Test statistic: $t^\\ast = \\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}} = ' + 
                    '\\frac{' + this.xbar + '-' + this.mu0 + '}{' + this.sd + '/ \\sqrt{' + this.n + '}} =' +  
                    ts.toFixed(3) + '$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]);

            t = new tDistribution(this.n-1);
            if(type == 'neq') {
                cv = jStat.studentt.inv(1-this.signiflevel/2,this.n-1);
                pvalue = jStat.studentt.cdf(-Math.abs(ts),this.n-1)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm t_{\\alpha/2,n-1} = \\pm t_{' + 
                        (this.signiflevel/2) + ',' + (this.n-1) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(t_{(n-1)} > |t^\\ast|) = 2P(t_{(' +
                        (this.n-1) + ')} > ' + Math.abs(ts).toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $\\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';                
                }
                t.printPdf(ts,'twotail',cv); 
            }
            if(type == 'gt') {
                cv = jStat.studentt.inv(1-this.signiflevel,this.n-1);
                pvalue = 1-jStat.studentt.cdf(ts,this.n-1);
                if(showeq) {
                    cv_txt = 'Critical value: $t_{\\alpha,n-1} = t_{' + 
                        this.signiflevel + ',' + (this.n-1) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(n-1)} > t^\\ast) = P(t_{(' +
                        (this.n-1) + ')} > ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';
                }
                t.printPdf(ts,'greater',cv); 
            }
            if(type == 'lt') {
                cv = -jStat.studentt.inv(1-this.signiflevel,this.n-1);
                pvalue = jStat.studentt.cdf(ts,this.n-1);
                if(showeq) {
                    cv_txt = 'Critical value: $- t_{\\alpha,n-1} = -t_{' + 
                        this.signiflevel + ',' + (this.n-1) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(n-1)} < t^\\ast) = P(t_{(' +
                        (this.n-1) + ')} < ' + ts.toFixed(3) + ') = ' + 
                        pvalue.toFixed(5) + '$';
                }
                else {
                    cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $' + 
                        pvalue.toFixed(5) + '$';
                }
                t.printPdf(ts,'less',cv); 
            }

            var critValEl = document.getElementById("criticalValue");
            critValEl.innerHTML = cv_txt;  
            if (window.MathJax) MathJax.typesetPromise([critValEl]);

            var pValueEl = document.getElementById("p_value");
            pValueEl.innerHTML = pvalue_txt;        
            if (window.MathJax) MathJax.typesetPromise([pValueEl]);
        }
    }
}