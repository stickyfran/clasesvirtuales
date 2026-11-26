// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function ztInference(n1, x1bar, sd1, n2, x2bar, sd2, alpha, itype, mu0, type, signiflevel, s1s2dropdown) {

    this.n1 = (n1 === '' || n1 === null) ? NaN : eval(n1);
    this.x1bar = (x1bar === '' || x1bar === null) ? NaN : eval(x1bar);
    this.sd1 = (sd1 === '' || sd1 === null) ? NaN : eval(sd1);
    this.n2 = (n2 === '' || n2 === null) ? NaN : eval(n2);
    this.x2bar = (x2bar === '' || x2bar === null) ? NaN : eval(x2bar);
    this.sd2 = (sd2 === '' || sd2 === null) ? NaN : eval(sd2);
    this.alpha = (alpha === '' || alpha === null) ? NaN : eval(alpha);
    this.mu0 = (mu0 === '' || mu0 === null) ? NaN : eval(mu0);
    this.signiflevel = (signiflevel === '' || signiflevel === null) ? NaN : eval(signiflevel);
    
    var sp, df;
    
    var showeq = false;
    if(document.getElementById('showeq').checked) {
        showeq = true;
    };

    // Safely exit if core calculations are not fully populated
    if (isNaN(this.n1) || isNaN(this.x1bar) || isNaN(this.sd1) || 
        isNaN(this.n2) || isNaN(this.x2bar) || isNaN(this.sd2) || isNaN(this.alpha)) {
        return; 
    }

    if(itype == 'sigma1' || itype == 'sigma2') {
        var ci_lo = (this.x1bar - this.x2bar) - jStat.normal.inv(1-this.alpha/2,0,1) * Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2);
        var ci_hi = (this.x1bar - this.x2bar) + jStat.normal.inv(1-this.alpha/2,0,1) * Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2);
        if(showeq) {
            var txt = '$$\\begin{eqnarray}\\bar{x}_1 - \\bar{x}_2 \\pm z_{\\alpha/2}' +
            '\\sqrt{\\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}} &=& ' + 
            this.x1bar + '-' + this.x2bar + '\\pm' + jStat.normal.inv(1-this.alpha/2,0,1).toFixed(3) + 
            '\\sqrt{\\frac{' + this.sd1 + '^2}{' + this.n1 + '} +' + 
                   '\\frac{' + this.sd2 + '^2}{' + this.n2 + '}}\\\\ &=& ' + 
            (this.x1bar - this.x2bar).toFixed(5) + '\\pm' + 
            (jStat.normal.inv(1-this.alpha/2,0,1) * Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2)).toFixed(5) + '\\\\ &=&' +
            '(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')$';        
        }
    }
    else if(s1s2dropdown == 's1eqs2') {
        var df = this.n1 + this.n2 - 2;
        sp = Math.sqrt(((this.n1-1)*this.sd1*this.sd1 + (this.n2-1)*this.sd2*this.sd2) / df);
        var ci_lo = (this.x1bar - this.x2bar) - jStat.studentt.inv(1-this.alpha/2,df) *
            sp * Math.sqrt(1/this.n1 + 1/this.n2);
        var ci_hi = (this.x1bar - this.x2bar) + jStat.studentt.inv(1-this.alpha/2,df) *
            sp * Math.sqrt(1/this.n1 + 1/this.n2);
        if(showeq) {
            var txt = '$$\\begin{eqnarray}\\bar{x}_1 - \\bar{x}_2 \\pm t_{\\alpha/2,n_1+n_2-2}' +
                        '(s_p)\\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}} &=& ' + 
            this.x1bar + '-' + this.x2bar + '\\pm' +
                jStat.studentt.inv(1-this.alpha/2,this.n1+this.n2-2).toFixed(3) + '(' +
            sp.toFixed(4) + ')\\sqrt{\\frac{1}{' + this.n1 + '} + \\frac{1}{' + this.n2 + '}}\\\\ &=& ' + 
            (this.x1bar - this.x2bar).toFixed(5) + '\\pm' + 
            (jStat.studentt.inv(1-this.alpha/2,df) * sp * Math.sqrt(1/this.n1 + 1/this.n2)).toFixed(5) + '\\\\ &=&' +
            '(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$ ' +
            '$$s_p = \\sqrt{\\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}} = ' +
            '\\sqrt{\\frac{(' + this.n1 + '-1)' + this.sd1 + '^2' +
                '+(' + this.n2 + '-1)' + this.sd2 + '^2}' +
                '{' + this.n1 + '+' + this.n2 + '-2}} = ' + sp.toFixed(4) + '$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')$';         
        }
    }
    else if(s1s2dropdown == 's1neqs2') {
        df = Math.pow(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2, 2) /
                (Math.pow(this.sd1*this.sd1/this.n1,2)/(this.n1-1) + 
                 Math.pow(this.sd2*this.sd2/this.n2,2)/(this.n2-1));
        var ci_lo = (this.x1bar - this.x2bar) - jStat.studentt.inv(1-this.alpha/2,df) *
            Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2);
        var ci_hi = (this.x1bar - this.x2bar) + jStat.studentt.inv(1-this.alpha/2,df) *
            Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2);
        if(showeq) {
            var txt = '$$\\begin{eqnarray}\\bar{x}_1 - \\bar{x}_2 \\pm t_{\\alpha/2,\\nu}' +
                        '\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}} &=& ' + 
            this.x1bar + '-' + this.x2bar + '\\pm' +
                jStat.studentt.inv(1-this.alpha/2,df).toFixed(3) + 
            '\\sqrt{\\frac{' + this.sd1 + '^2}{' + this.n1 + '} + ' +
            '\\frac{' + this.sd2 + '^2}{' + this.n2 + '}}\\\\ &=& ' + 
            (this.x1bar - this.x2bar).toFixed(5) + '\\pm' +
            (jStat.studentt.inv(1-this.alpha/2,df) *
            Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2)).toFixed(5) + 
            '\\\\ &=& ' +
            '(' + ci_lo.toFixed(5) + ', ' + 
            ci_hi.toFixed(5) + ')\\end{eqnarray}$$ ' +
            '$$\\nu = ' + 
            '\\frac{\\left(\\frac{s_1^2}{n_1}' +
            '+ \\frac{s_2^2}{n_2}\\right)^2}' +
            '{\\frac{\\left(\\frac{s_1^2}{n_1}\\right)^2}{n_1-1} + ' + 
            '\\frac{\\left(\\frac{s_2^2}{n_2}\\right)^2}{n_2-1}} =' +
            '\\frac{\\left(\\frac{' + this.sd1 + '^2}{' + this.n1 + '}' + 
            '+ \\frac{' + this.sd2 + '^2}{' + this.n2 + '}\\right)^2}' +
            '{\\frac{\\left(\\frac{' + this.sd1 + '^2}{' + this.n1 + '}\\right)^2}{' + this.n1 + '-1} + ' + 
            '\\frac{\\left(\\frac{' + this.sd2 + '^2}{' + this.n2 + '}\\right)^2}{' + this.n2 + '-1}} =' +
            df.toFixed(2) + '$$';
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')$';         
        }
    }

    var ciOutputEl = document.getElementById("ci_output");
    ciOutputEl.innerHTML = txt;
    if (window.MathJax) MathJax.typesetPromise([ciOutputEl]);

    if(!isNaN(this.mu0) && !isNaN(this.signiflevel)) {
        var cv, pvalue, cv_txt, pvalue_txt;
        
        if(itype == 'sigma1' || itype == 'sigma2') {
            var ts = ((this.x1bar-this.x2bar)-this.mu0)/Math.sqrt(this.sd1*this.sd1/this.n1 +       
                this.sd2*this.sd2/this.n2);
            if(showeq) {
                var txt = 'Test statistic:$$z^\\ast = ' + 
                '\\frac{(\\bar{x}_1-\\bar{x}_2)-(\\Delta_0)}' + 
                '{\\sqrt{\\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}}} = ' + 
                '\\frac{(' + this.x1bar + '-' + this.x2bar + ')-(' + this.mu0 + ')}' + 
                '{\\sqrt{\\frac{' + this.sd1 + '^2}{' + this.n1 + '} + ' +
                '\\frac{' + this.sd2 + '^2}{' + this.n2 + '}}} = ' + 
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

        else if(s1s2dropdown == 's1eqs2') {
            var ts = ((this.x1bar-this.x2bar)-this.mu0)/ (sp * Math.sqrt(1/this.n1 + 1/this.n2));
            if(showeq) {
                var txt = 'Test statistic: $$t^\\ast = ' +
                '\\frac{(\\bar{x}_1-\\bar{x}_2)-(\\Delta_0)}{s_p \\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}}} = ' + 
                '\\frac{(' + this.x1bar + '-' + this.x2bar + ')-(' + this.mu0 + ')}' +
                '{' + sp.toFixed(4) + '\\sqrt{\\frac{1}{' + this.n1 +'} + \\frac{1}{' + this.n2 + '}}} = ' + 
                    ts.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

            t = new tDistribution(this.n1+this.n2-2);
            if(type == 'neq') {
                cv = jStat.studentt.inv(1-this.signiflevel/2,this.n1+this.n2-2);
                pvalue = jStat.studentt.cdf(-Math.abs(ts),this.n1+this.n2-2)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm t_{\\alpha/2,n_1+n_2-2} = \\pm t_{' + 
                        (this.signiflevel/2) + ',' + (this.n1+this.n2-2) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(t_{(n_1+n_2-2)} > |t^\\ast|) = 2P(t_{(' +
                        (this.n1+this.n2-2) + ')} > ' + Math.abs(ts).toFixed(3) + ') = ' + 
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
                cv = jStat.studentt.inv(1-this.signiflevel,this.n1+this.n2-2);
                pvalue = 1-jStat.studentt.cdf(ts,this.n1+this.n2-2);
                if(showeq) {
                    cv_txt = 'Critical value: $t_{\\alpha,n_1+n_2-2} = t_{' + 
                        this.signiflevel + ',' + (this.n1+this.n2-2) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(n_1+n_2-2)} > t^\\ast) = P(t_{(' +
                        (this.n1+this.n2-2) + ')} > ' + ts.toFixed(3) + ') = ' + 
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
                cv = -jStat.studentt.inv(1-this.signiflevel,this.n1+this.n2-2);
                pvalue = jStat.studentt.cdf(ts,this.n1+this.n2-2);
                if(showeq) {
                    cv_txt = 'Critical value: $- t_{\\alpha,n_1+n_2-2} = -t_{' + 
                        this.signiflevel + ',' + (this.n1+this.n2-2) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(n_1+n_2-2)} < t^\\ast) = P(t_{(' +
                        (this.n1+this.n2-2) + ')} < ' + ts.toFixed(3) + ') = ' + 
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

        else if(s1s2dropdown == 's1neqs2') {
            var ts = ((this.x1bar-this.x2bar)-this.mu0) / 
                Math.sqrt(this.sd1*this.sd1/this.n1 + this.sd2*this.sd2/this.n2);
            if(showeq) {
                var txt = 'Test statistic: $$t^\\ast = ' +
                '\\frac{(\\bar{x}_1-\\bar{x}_2)-(\\Delta_0)}' +
                '{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}} = ' + 
                '\\frac{(' + this.x1bar + '-' + this.x2bar + ')-(' + this.mu0 + ')}' +
                '{\\sqrt{\\frac{' + this.sd1 + '^2}{' + this.n1 +'} + \\frac{' + 
                this.sd2 + '^2}{' + this.n2 + '}}} = ' + 
                ts.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $' + 
                    ts.toFixed(3) + '$';            
            }
            
            var testStatEl = document.getElementById('test_stat');
            testStatEl.innerHTML = txt;
            if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

            t = new tDistribution(df.toFixed(2));
            if(type == 'neq') {
                cv = jStat.studentt.inv(1-this.signiflevel/2,df);
                pvalue = jStat.studentt.cdf(-Math.abs(ts),df)*2;
                if(showeq) {
                    cv_txt = 'Critical value: $\\pm t_{\\alpha/2,\\nu} = \\pm t_{' + 
                        (this.signiflevel/2) + ',' + df.toFixed(2) + '} = \\pm' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ 2P(t_{(\\nu)} > |t^\\ast|) = 2P(t_{(' +
                        df.toFixed(2) + ')} > ' + Math.abs(ts).toFixed(3) + ') = ' + 
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
                cv = jStat.studentt.inv(1-this.signiflevel,df);
                pvalue = 1-jStat.studentt.cdf(ts,df);
                if(showeq) {
                    cv_txt = 'Critical value: $t_{\\alpha,\\nu} = t_{' + 
                        this.signiflevel + ',' + df.toFixed(2) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(\\nu)} > t^\\ast) = P(t_{(' +
                        df.toFixed(2) + ')} > ' + ts.toFixed(3) + ') = ' + 
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
                cv = -jStat.studentt.inv(1-this.signiflevel,df);
                pvalue = jStat.studentt.cdf(ts,df);
                if(showeq) {
                    cv_txt = 'Critical value: $- t_{\\alpha,\\nu} = -t_{' + 
                        this.signiflevel + ',' + df.toFixed(2) + '} = ' + cv.toFixed(3) + '$';
                    pvalue_txt = 'p-value: $ P(t_{(\\nu)} < t^\\ast) = P(t_{(' +
                        df.toFixed(2) + ')} < ' + ts.toFixed(3) + ') = ' + 
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

