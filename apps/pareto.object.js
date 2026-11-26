// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function paretoDistribution (xm, alpha) 
{
	this.xm=eval(xm);
	this.alpha=eval(alpha);
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
		if(this.alpha > 1.0) return this.alpha * this.xm / (this.alpha - 1);
	}

	function variance() 
	{
 		return jStat.pareto.variance(this.xm, this.alpha);
	}

	function sd() 
	{
 		return Math.sqrt(this.variance());
	}

	function pdf(x) 
	{
		if(!isNaN(x) && x !== '') {
            x = eval(x);
			return jStat.pareto.pdf(x, this.xm, this.alpha);
		}
		return '';
	}

	function cdf(x)
	{ 
		if(!isNaN(x) && x !== '') {
            x = eval(x);
			return jStat.pareto.cdf(x, this.xm, this.alpha);
		}
		return '';
	}

	function percentile(p)
	{
		if(!isNaN(p) && p !== '') {
            p = eval(p);
			return jStat.pareto.inv(p, this.xm, this.alpha);
		}
		return '';
	}

	function printMoments() 
	{
		var txt="";

		if(this.alpha > 1)
			txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(),4) + '\\hspace{0.5cm}$';
		else 
			txt += '$ \\mu = E(X) = &#x221e; \\hspace{0.5cm}$';

		if(this.alpha > 2) {
			txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(),4) + '\\hspace{0.5cm}$';
			txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(),4) + '$';
		}
		else {
			txt += '$ \\sigma = SD(X) = &#x221e; \\hspace{0.5cm}$';
			txt += '$ \\sigma^2 = Var(X) = &#x221e; $';		
		}

		document.getElementById("moments").innerHTML=txt; 
		// Old v2 way:
		// MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]);

		// New v3 way:
		MathJax.typesetPromise([document.querySelector('#moments')]);
	}

	function printPdf(x, direction) {

		var data = new google.visualization.DataTable();

		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

        // Protect against empty strings breaking the plot
		x = (x === '' || x === null) ? NaN : eval(x);

		var lo = this.xm;
		var hi = jStat.pareto.inv(0.995, this.xm, this.alpha);

		data.addRows(401);

		var i, grd;
		for(i=0; i<401; i++)
		{
			grd = lo + (hi-lo)*i/400;
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

				var xdelta = (hi-lo)/120;
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
				min: lo,
				max: hi,
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

