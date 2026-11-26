// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function s2Inference(n, s2, alpha, citype, sigma20, type, signiflevel) {

    this.n = (n === '' || n === null) ? NaN : eval(n);
    this.s2 = (s2 === '' || s2 === null) ? NaN : eval(s2);
    this.alpha = (alpha === '' || alpha === null) ? NaN : eval(alpha);
    this.signiflevel = (signiflevel === '' || signiflevel === null) ? NaN : eval(signiflevel);
    this.sigma20 = (sigma20 === '' || sigma20 === null) ? NaN : eval(sigma20);

    if(isNaN(this.n) || isNaN(this.s2) || isNaN(this.alpha)) return;

    var showeq = false;
    if(document.getElementById('showeq').checked) {
        showeq = true;
    };

    if(citype == 'ci') {
        var ci_lo = ((this.n-1)*this.s2) / jStat.chisquare.inv(1-this.alpha/2,this.n-1);
        var ci_hi = ((this.n-1)*this.s2) / jStat.chisquare.inv(this.alpha/2,this.n-1);
    }
    else if(citype == 'upper') {
        var ci_lo = 0;
        var ci_hi = ((this.n-1)*this.s2) / jStat.chisquare.inv(this.alpha,this.n-1);
    }
    else {
        var ci_lo = ((this.n-1)*this.s2) / jStat.chisquare.inv(1-this.alpha,this.n-1);
        var ci_hi = Infinity;
    }

    if(showeq) {
        if(citype == 'ci') {
            var txt = '\\begin{eqnarray} \\left(\\frac{(n-1)s^2}{\\chi^2_{\\frac{\\alpha}{2},n-1}},'+
            '\\frac{(n-1)s^2}{\\chi^2_{1-\\frac{\\alpha}{2},n-1}}\\right) ' +
            '&=& \\left( \\frac{(' + this.n + '-1)' + this.s2 + '}{' +
            jStat.chisquare.inv(1-this.alpha/2,this.n-1).toFixed(3) + '}, '  + 
            '\\frac{(' + this.n + '-1)' + this.s2 + '}{' +
            jStat.chisquare.inv(this.alpha/2,this.n-1).toFixed(3) + '} \\right) \\\\ ' +
            '&=& ' + '(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
        }
        else if(citype == 'upper') {
            var txt = '\\begin{eqnarray} \\left(0,'+
            '\\frac{(n-1)s^2}{\\chi^2_{1-\\alpha,n-1}}\\right) ' +
            '&=& \\left( 0, '  + 
            '\\frac{(' + this.n + '-1)' + this.s2 + '}{' +
            jStat.chisquare.inv(this.alpha,this.n-1).toFixed(3) + '} \\right) \\\\ ' +
            '&=& ' + '(0, ' + ci_hi.toFixed(5) + ')\\end{eqnarray}';
        }
        else {
            var txt = '\\begin{eqnarray} \\left( \\frac{(n-1)s^2}{\\chi^2_{\\alpha,n-1}},\\infty\\right) ' +
            '&=& \\left( \\frac{(' + this.n + '-1)' + this.s2 + '}{' +
            jStat.chisquare.inv(1-this.alpha,this.n-1).toFixed(3) + '}, \\infty \\right) \\\\ ' +
            '&=& ' + '(' + ci_lo.toFixed(5) + ', \\infty)\\end{eqnarray}';
        }
    }
    else {
        if(citype == 'ci') {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + ci_hi.toFixed(5) + ')$';     
        }
        else if(citype == 'upper') {
            var txt = '$(0' + ', ' + ci_hi.toFixed(5) + ')$';       
        }
        else {
            var txt = '$(' + ci_lo.toFixed(5) + ', ' + '\\infty)$';     
        }
    }

    var ciOutputEl = document.getElementById("ci_output");
    ciOutputEl.innerHTML = txt;
    if (window.MathJax) MathJax.typesetPromise([ciOutputEl]);

    if(!isNaN(this.sigma20) && !isNaN(this.signiflevel)) {
        var cv, pvalue, cv_txt, pvalue_txt;
        var ts = ((this.n-1)*this.s2)/(this.sigma20);

        if(showeq) {
            var txt = 'Test statistic: $\\chi^{2\\ast} = \\frac{(n-1)s^2}{\\sigma_0^2} = ' + 
                '\\frac{(' + this.n + '-1)' + this.s2 + '}{' + this.sigma20 + '} =' +  
                ts.toFixed(3) + '$';
        }
        else {
            var txt = 'Test statistic: $' + ts.toFixed(3) + '$';
        }

        var testStatEl = document.getElementById('test_stat');
        testStatEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

        chisq = new chisqDistribution(this.n-1);
        
        if(type == 'neq') {
            var cv1 = jStat.chisquare.inv(this.signiflevel/2,this.n-1);
            var cv2 = jStat.chisquare.inv(1-this.signiflevel/2,this.n-1);
            pvalue = 2 * Math.min(1-jStat.chisquare.cdf(ts, this.n-1), jStat.chisquare.cdf(ts, this.n-1));
            
            if(showeq) {
                cv_txt = 'Rejection Region: $(0,\\chi^2_{1-\\alpha/2,n-1}) \\cup' +  
                    '(\\chi^2_{\\alpha/2,n-1},\\infty) = ' +
                    '(0,' + cv1.toFixed(3) + ') \\cup (' + cv2.toFixed(3) + ',\\infty)$';
                pvalue_txt = 'p-value: $ 2 \\cdot min\\left[ P(\\chi^2_{(n-1)} > \\chi^{2\\ast}),'+ 
                    'P(\\chi^2_{(n-1)} < \\chi^{2\\ast})\\right] = 2 \\cdot min\\left[ ' +
                    (1-jStat.chisquare.cdf(ts, this.n-1)).toFixed(5) + ',' +
                    jStat.chisquare.cdf(ts, this.n-1).toFixed(5) + '\\right] = ' + 
                    pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Rejection Region: $(0,' + cv1.toFixed(3) + ') \\cup (' + 
                    cv2.toFixed(3) + ',\\infty)$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
            }
            chisq.printPdf(ts,'twotail',cv1, cv2); 
        }
        if(type == 'gt') {
            cv = jStat.chisquare.inv(1-this.signiflevel, this.n-1);
            pvalue = 1-jStat.chisquare.cdf(ts, this.n-1);
            
            if(showeq) {
                cv_txt = 'Rejection Region: $(\\chi^2_{\\alpha,n-1}, \\infty) = (' + cv.toFixed(3) + ',\\infty)$';
                pvalue_txt = 'p-value: $ P(\\chi^2_{(n-1)} > \\chi^{2\\ast}) = P(\\chi^2_{(' + (this.n-1) + ')} > ' + ts.toFixed(3) + ') = ' + pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Rejection Region: $(' + cv.toFixed(3) + ',\\infty)$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
            }
            chisq.printPdf(ts,'greater',cv); 
        }
        if(type == 'lt') {
            cv = jStat.chisquare.inv(this.signiflevel, this.n-1);
            pvalue = jStat.chisquare.cdf(ts, this.n-1);
            
            if(showeq) {
                cv_txt = 'Rejection Region: $(0, \\chi^2_{1-\\alpha,n-1}) = (0,' + cv.toFixed(3) + ')$';
                pvalue_txt = 'p-value: $ P(\\chi^2_{(n-1)} < \\chi^{2\\ast}) = P(\\chi^2_{(' + (this.n-1) + ')} < ' + ts.toFixed(3) + ') = ' + pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Rejection Region: $(0,' + cv.toFixed(3) + ')$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
            }
            chisq.printPdf(ts,'less',cv); 
        }

        var critValEl = document.getElementById("criticalValue");
        critValEl.innerHTML = cv_txt;
        if (window.MathJax) MathJax.typesetPromise([critValEl]); 

        var pValueEl = document.getElementById("p_value");
        pValueEl.innerHTML = pvalue_txt;
        if (window.MathJax) MathJax.typesetPromise([pValueEl]); 
    }
}

