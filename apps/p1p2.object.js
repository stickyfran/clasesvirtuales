// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function ztInference(n1, p1hat, n2, p2hat, alpha, delta0, type, signiflevel) {

    this.n1 = (n1 === '' || n1 === null) ? NaN : eval(n1);
    this.p1hat = (p1hat === '' || p1hat === null) ? NaN : eval(p1hat);
    this.n2 = (n2 === '' || n2 === null) ? NaN : eval(n2);
    this.p2hat = (p2hat === '' || p2hat === null) ? NaN : eval(p2hat);
    this.alpha = (alpha === '' || alpha === null) ? NaN : eval(alpha);
    this.delta0 = (delta0 === '' || delta0 === null) ? NaN : eval(delta0);
    this.signiflevel = (signiflevel === '' || signiflevel === null) ? NaN : eval(signiflevel);
    
    if(isNaN(this.n1) || isNaN(this.p1hat) || isNaN(this.n2) || isNaN(this.p2hat) || isNaN(this.alpha)) return;

    var showeq = false;
    if(document.getElementById('showeq').checked) {
        showeq = true;
    };

    var se = Math.sqrt(this.p1hat*(1-this.p1hat)/this.n1 + this.p2hat*(1-this.p2hat)/this.n2);
    var z_crit = jStat.normal.inv(1-this.alpha/2,0,1);
    var ci_lo = (this.p1hat - this.p2hat) - z_crit * se;
    var ci_hi = (this.p1hat - this.p2hat) + z_crit * se;
    
    if(showeq) {
        var txt = '$$\\begin{eqnarray}&&\\hat{p}_1 - \\hat{p}_2 \\pm z_{\\alpha/2}' +
        '\\sqrt{\\frac{\\hat{p}_1 (1-\\hat{p}_1)}{n_1} + \\frac{\\hat{p}_2 (1-\\hat{p}_2)}{n_2}} \\\\ ' +
        '&& \\quad = ' + 
        this.p1hat.toFixed(4) + '-' + this.p2hat.toFixed(4) + '\\pm' + 
        z_crit.toFixed(3) + 
        '\\sqrt{\\frac{' + this.p1hat.toFixed(4) + '(1-' + this.p1hat.toFixed(4) + ')}{' + this.n1 + '} + ' +
        '\\frac{' + this.p2hat.toFixed(4) + '(1-' + this.p2hat.toFixed(4) + ')}{' + this.n2 + '}} \\\\' +
        '&& \\quad = ' + (this.p1hat - this.p2hat).toFixed(5) + '\\pm' + 
        (z_crit * se).toFixed(5) + '\\\\' +
        '&& \\quad = (' + ci_lo.toFixed(5) + ', ' + 
        ci_hi.toFixed(5) + ')\\end{eqnarray}$$';
    }
    else {
        var txt = '$(' + ci_lo.toFixed(5) + ', ' + 
        ci_hi.toFixed(5) + ')$';        
    }

    var ciOutputEl = document.getElementById("ci_output");
    ciOutputEl.innerHTML = txt;
    if (window.MathJax) MathJax.typesetPromise([ciOutputEl]); 

    if(!isNaN(this.delta0)) {
        var cv, pvalue, cv_txt, pvalue_txt, phattmp;
        var se_test = se;

        if(this.delta0 == 0 && document.getElementById('pooledse').checked) {
            phattmp = (this.p1hat * this.n1 + this.p2hat * this.n2) / (this.n1 + this.n2);
            se_test = Math.sqrt(phattmp*(1-phattmp)*(1/this.n1 + 1/this.n2));
        }

        var ts = ((this.p1hat-this.p2hat)-this.delta0)/se_test;
        if(showeq) {
            if(this.delta0 == 0 && document.getElementById('pooledse').checked) {
                // BUG FIX: Split equations into separate $$ blocks
                var txt = 'Test statistic: $$z^\\ast = ' +
                '\\frac{(\\hat{p}_1-\\hat{p}_2)-(\\Delta_0)}' +
                '{\\sqrt{\\hat{p} (1-\\hat{p}) ' +
                '\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}} = ' +
                '\\frac{(' + this.p1hat.toFixed(4) + '-' + this.p2hat.toFixed(4) + ')-(' + this.delta0 + ')}' + 
                '{\\sqrt{' + phattmp.toFixed(3) + '(1-' + phattmp.toFixed(3) + ')' + 
                '\\left( \\frac{1}{' + this.n1 + '} + \\frac{1}{' + this.n2 + '} \\right)}} = ' + 
                ts.toFixed(3) + '$$ ' +
                'Pooled proportion: $$\\hat{p} = \\frac{n_1 \\hat{p}_1 + n_2 \\hat{p}_2}{n_1 + n_2} = \\frac{' +
                this.n1 + '(' + this.p1hat.toFixed(4) + ')' + '+' + this.n2 + '(' + this.p2hat.toFixed(4) +')}' + 
                '{' + this.n1 + '+' + this.n2 + '} = ' + phattmp.toFixed(3) + '$$';
            }
            else {
                var txt = 'Test statistic: $$z^\\ast = ' +
                '\\frac{(\\hat{p}_1-\\hat{p}_2)-(\\Delta_0)}' +
                '{\\sqrt{\\frac{\\hat{p}_1 (1-\\hat{p}_1)}{n_1} + ' +
                '\\frac{\\hat{p}_2 (1-\\hat{p}_2)}{n_2}}} = ' +
                '\\frac{(' + this.p1hat.toFixed(4) + '-' + this.p2hat.toFixed(4) + ')-(' + this.delta0 + ')}' + 
                '{\\sqrt{\\frac{' + this.p1hat.toFixed(4) + '(1-' + this.p1hat.toFixed(4) + ')}{' + this.n1 + '} + ' +
                '\\frac{' + this.p2hat.toFixed(4) + '(1-' + this.p2hat.toFixed(4) + ')}{' + this.n2 + '}}} = ' + 
                ts.toFixed(3) + '$$';
            }
        }
        else {
            var txt = 'Test statistic: $' + ts.toFixed(3) + '$';
        }
        
        var testStatEl = document.getElementById('test_stat');
        testStatEl.innerHTML = txt;
        if (window.MathJax) MathJax.typesetPromise([testStatEl]); 

        var norm = new normalDistribution(0,1);

        if(type == 'neq') {
            cv = jStat.normal.inv(1-this.signiflevel/2,0,1);
            pvalue = jStat.normal.cdf(-Math.abs(ts),0,1)*2;
            if(showeq) {
                cv_txt = 'Critical value: $\\pm z_{\\alpha/2} = \\pm z_{' + (this.signiflevel/2) + '} = \\pm' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $ 2P(Z > |z^\\ast|) = 2P(Z > ' + Math.abs(ts).toFixed(3) + ') = ' + pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Critical value: $\\pm' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
            }
            norm.printPdf(ts,'twotail',cv); 
        }
        if(type == 'gt') {
            cv = jStat.normal.inv(1-this.signiflevel,0,1);
            pvalue = 1-jStat.normal.cdf(ts,0,1);
            if(showeq) {
                cv_txt = 'Critical value: $z_{\\alpha} = z_{' + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $ P(Z > z^\\ast) = P(Z > ' + ts.toFixed(3) + ') = ' + pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
            }
            norm.printPdf(ts,'greater',cv); 
        }
        if(type == 'lt') {
            cv = -jStat.normal.inv(1-this.signiflevel,0,1);
            pvalue = jStat.normal.cdf(ts,0,1);
            if(showeq) {
                cv_txt = 'Critical value: $-z_{\\alpha} = -z_{' + this.signiflevel + '} = ' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $ P(Z < z^\\ast) = P(Z < ' + ts.toFixed(3) + ') = ' + pvalue.toFixed(5) + '$';
            }
            else {
                cv_txt = 'Critical value: $' + cv.toFixed(3) + '$';
                pvalue_txt = 'p-value: $' + pvalue.toFixed(5) + '$';                
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

