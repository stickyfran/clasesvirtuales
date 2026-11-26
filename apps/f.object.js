// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function fDistribution (df1, df2) 
{
	this.df1=eval(df1);
	this.df2=eval(df2);
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
		if(this.df2 > 2) return jStat.centralF.mean(this.df1, this.df2);
	}

	function variance() 
	{
		if(this.df2 > 4) return jStat.centralF.variance(this.df1, this.df2);
	}

	function sd() 
	{
		if(this.df2 > 4) return Math.sqrt(this.variance());
	}

	function pdf(x) 
	{
		if(!isNaN(x) && x !== '')
		{
            x = eval(x);
			return jStat.centralF.pdf(x, this.df1, this.df2);
		}
		return '';
	}

	function cdf(x)
	{ 
		if(!isNaN(x) && x !== '')
		{
            x = eval(x);
			return jStat.centralF.cdf(x, this.df1, this.df2);
		}
		return '';
	}

	function percentile(p)
	{
		if(!isNaN(p) && p !== '')
		{
            p = eval(p);
			return jStat.centralF.inv(p, this.df1, this.df2);
		}
		return '';
	}

	function printMoments() 
	{
		var txt="";

		if(!isNaN(this.mean()))
			txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(),3) + '\\hspace{0.5cm}$';
		else
			txt += '$ \\mu = E(X) = Undefined' + '\\hspace{0.5cm}$';

		if(!isNaN(this.sd()))
			txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(),3) + '\\hspace{0.5cm}$';
		else
			txt += '$ \\sigma = SD(X) = Undefined' + '\\hspace{0.5cm}$';

		if(!isNaN(this.variance()))
			txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(),3) + '$';
		else
			txt += '$ \\sigma^2 = Var(X) = Undefined' + '$';

		document.getElementById("moments").innerHTML=txt; 

		// Old v2 way:
		// MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]);

		// New v3 way:
		MathJax.typesetPromise([document.querySelector('#moments')]);

		// MathJax.Hub.Queue(["Typeset",MathJax.Hub,"moments"]); 
	}

	function printPdf(x, direction) 
	{
		var data = new google.visualization.DataTable();

		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

        // Protect against empty strings breaking the plot
		x = (x === '' || x === null) ? NaN : eval(x);

		var mu;
		if(this.df2 > 2) mu = this.mean();
		else mu = 1; 	// reasonable choice for plotting

		var sd;
		if(this.df2 > 4) sd = this.sd();
		else sd = 2;	//choose something reasonable

		var lo = Math.max(0, mu - 4*sd);
		var hi = mu + 4*sd;

		data.addRows(401);

		var i, grd;
		for(i=0; i<401; i++)
		{
			grd = lo + (hi-lo)*i/400;
			data.setCell(i, 0, grd);
			data.setCell(i, 1, this.pdf(grd));

			if(!isNaN(x)) {
				if(grd < x) {
					if(direction == 'less')
						data.setCell(i, 2, this.pdf(grd));
				}
				else {
					if(direction == 'greater')
						data.setCell(i, 2, this.pdf(grd));
				}
			}

			var xdelta = (hi-lo)/140;
			if(grd > x-xdelta && grd < x+xdelta) {
				data.setCell(i, 3, this.pdf(grd));
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

