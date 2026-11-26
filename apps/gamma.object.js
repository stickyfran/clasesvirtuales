// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function gammaDistribution (alpha, beta) 
{
	this.alpha=eval(alpha);
	this.beta=1/eval(beta);
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
		return jStat.gamma.mean(this.alpha, this.beta);
	}

	function variance() 
	{
 		return jStat.gamma.variance(this.alpha, this.beta);
	}

	function sd() 
	{
 		return Math.sqrt(this.variance());
	}

	function pdf(x) 
	{
		if(!isNaN(x) && x !== '') {
            x = eval(x);
			return jStat.gamma.pdf(x, this.alpha, this.beta);
		}
		return '';
	}

	function cdf(x)
	{ 
		if(!isNaN(x) && x !== '') {
            x = eval(x);
			return jStat.gamma.cdf(x, this.alpha, this.beta);
		}
		return '';
	}

	function percentile(p)
	{
		if(!isNaN(p) && p !== '') {
            p = eval(p);
			return jStat.gamma.inv(p, this.alpha, this.beta);
		}
		return '';
	}

	function printMoments() 
	{
		var txt="";

		txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(),4) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(),4) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(),4) + '$';

		document.getElementById("moments").innerHTML=txt; 
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"moments"]); 
	}

	function printPdf(x, direction) {

		var data = new google.visualization.DataTable();

		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

        // Protect against empty strings breaking the plot
		x = (x === '' || x === null) ? NaN : eval(x);

		var lo = Math.max(this.mean() - 4*this.sd(), 0);
		var hi = this.mean() + 4*this.sd();

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

