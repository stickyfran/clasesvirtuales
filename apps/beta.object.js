// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function betaDistribution (alpha, beta) 
{
	this.alpha=eval(alpha);
	this.beta=eval(beta);
	this.mean=mean;
	this.variance=variance;
	this.sd=sd;
	this.pdf=pdf;
	this.cdf=cdf;
	this.percentile=percentile;
	this.printMoments=printMoments;
	this.printPdf=printPdf;

	function mean() 
	{
		return jStat.beta.mean(this.alpha, this.beta);
	}

	function variance() 
	{
		return jStat.beta.variance(this.alpha, this.beta);
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

 	function pdf(x) 
 	{
		if(!isNaN(eval(x))) {
 			return jStat.beta.pdf(x, this.alpha, this.beta);
		}
		return '';
 	}

 	function cdf(x)
 	{ 
		if(!isNaN(eval(x))) {
 			return jStat.beta.cdf(x, this.alpha, this.beta);
		}
		return '';
 	}

 	function percentile(p)
 	{
		if(!isNaN(eval(p))) {
			return jStat.beta.inv(p, this.alpha, this.beta);
		}
 
		return '';
 	}

function printMoments() {
    var txt = "";
    // Ensure numbers are rounded correctly
    txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(), 4) + '\\hspace{0.5cm}$';
    txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(), 4) + '\\hspace{0.5cm}$';
    txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(), 4) + '$';

    var momentsDiv = document.getElementById("moments");
    momentsDiv.innerHTML = txt;

    // MathJax v3 Typeset Promise
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([momentsDiv]).catch(function (err) {
            console.error('MathJax rendering error:', err.message);
        });
    }
}

	function printPdf(x, direction, lo_x, hi_x) {

		var data = new google.visualization.DataTable();

		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

		x = eval(x);

		if(this.alpha >= 1 && this.beta >= 1) {
			var lo = 0;
			var hi = 1;
		}
		else {
			var lo = this.cdf(0.001);
			var hi = this.cdf(0.999);
		}

		data.addRows(801);

		var i, grd;
		for(i=0; i<801; i++)
		{
			grd = lo + (hi-lo)*i/800;
			data.setCell(i, 0, grd);
			data.setCell(i, 1, this.pdf(grd));

			if(!isNaN(x)) 
			{
				if(grd < x) {
					if(direction == 'less')
						data.setCell(i, 2, this.pdf(grd));
				}
				else {
					if(direction == 'greater')
						data.setCell(i, 2, this.pdf(grd));
				};

				var xdelta = (hi-lo)/140;
				if(grd > x-xdelta && grd < x+xdelta) {
					data.setCell(i, 3, this.pdf(grd));
				}
			}
		}

		var options = {
			backgroundColor:'transparent',
			chartArea: { left: '10%', width: '85%', bottom: '25%' },
			areaOpacity: 0,
			hAxis: {title: 'x',  titleTextStyle: {color: '#000000'}, 
				min: 0,
				max: 1,
				gridlines: {color: 'transparent', count: 7},
				baseline: lo},
			vAxis: {title: 'f(x)',  titleTextStyle: {color: '#000000'}, 
				gridlines: {count: 5, color: 'transparent'},
				viewWindow: {min: 0},
				viewWindowMode: 'explicit'},
			legend: {position: 'none'},
			series: {0:{color: 'black', areaOpacity: 0, lineWidth: 1.2}, 
				1:{color: '#e7b0b0', areaOpacity: 1, lineWidth: 0},
				2:{color: '#83aaf1', areaOpacity: 1, lineWidth: 0},
				3:{color: '#E8E8E8', areaOpacity: 1, lineWidth: 0}},
			tooltip: {trigger: 'none'}
		};

		var chart = new google.visualization.AreaChart(document.getElementById('pdfPlot'));
		chart.draw(data, options);
	}
}

