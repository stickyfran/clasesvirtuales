// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function lognormalDistribution (mu, sigma) 
{
	this.mu=eval(mu);
	this.sigma=eval(sigma);
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
		return jStat.lognormal.mean(this.mu, this.sigma);
	}

	function variance() 
	{
		return jStat.lognormal.variance(this.mu, this.sigma);
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pdf(x) 
	{
		if(!isNaN(x) && x !== '')
		{
            x = eval(x);
			return jStat.lognormal.pdf(x, this.mu, this.sigma);
		}
		return '';
	}

	function cdf(x)
	{ 
		if(!isNaN(x) && x !== '')
		{
            x = eval(x);
			return jStat.lognormal.cdf(x, this.mu, this.sigma);
		}
		return '';
	}

	function percentile(p)
	{
		if(!isNaN(p) && p !== '')
		{
            p = eval(p);
			return jStat.lognormal.inv(p, this.mu, this.sigma);
		}
		return '';
	}

	function printMoments() 
	{
		var txt="";

		txt += '$ E(X) = ' + roundNumber(this.mean(),3) + '\\hspace{0.5cm}$';
		txt += '$ SD(X) = ' + roundNumber(this.sd(),3) + '\\hspace{0.5cm}$';
		txt += '$ Var(X) = ' + roundNumber(this.variance(),3) + '$';

		document.getElementById("moments").innerHTML=txt; 

		// Old v2 way:
		// MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]);

		// New v3 way:
		MathJax.typesetPromise([document.querySelector('#moments')]);

		// MathJax.Hub.Queue(["Typeset",MathJax.Hub,"moments"]); 
	}

	function printPdf(x, direction) {

		var data = new google.visualization.DataTable();

		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

        // Protect against empty strings breaking the plot
		x = (x === '' || x === null) ? NaN : eval(x);

		var lo = jStat.lognormal.inv(0.0001, this.mu, this.sigma);
		if(this.sigma <= 0.5)
			var hi = jStat.lognormal.inv(0.9999, this.mu, this.sigma);
		else if(this.sigma <= 1)
			var hi = jStat.lognormal.inv(0.999, this.mu, this.sigma);
		else if(this.sigma <= 1.5)
			var hi = jStat.lognormal.inv(0.99, this.mu, this.sigma);
		else if(this.sigma <= 2)
			var hi = jStat.lognormal.inv(0.9, this.mu, this.sigma);
		else 
			var hi = jStat.lognormal.inv(0.8, this.mu, this.sigma);

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
				}
				if(direction == 'twotail') {
					if(grd < -Math.abs(x)) data.setCell(i,2,this.pdf(grd));
					if(grd >  Math.abs(x)) data.setCell(i,2,this.pdf(grd));
				}

				var xdelta = (hi-lo)/140;
				if(direction == 'less' || direction == 'greater') {
					if(grd > x-xdelta && grd < x+xdelta) {
						data.setCell(i, 3, this.pdf(grd));
					}
				}
				if(direction == 'twotail') {
					if(grd > -Math.abs(x)-xdelta && grd < -Math.abs(x)+xdelta)  
						data.setCell(i, 3, this.pdf(grd));
					if(grd > Math.abs(x)-xdelta && grd < Math.abs(x)+xdelta)  
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

