// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->


function chisqDistribution (df) 
{
	this.df=eval(df);
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
		return jStat.chisquare.mean(this.df);
	}


	function variance() 
	{
		return jStat.chisquare.variance(this.df);
	}


	function sd() 
	{
		return Math.sqrt(this.variance());
	}


	function pdf(x) 
	{
		if(!isNaN(eval(x)))
		{
			return jStat.chisquare.pdf(x, this.df);
		}
		return '';
	}


	function cdf(x)
	{ 
		if(!isNaN(eval(x)))
		{
			return jStat.chisquare.cdf(x, this.df);
		}
		return '';
	}


	function percentile(p)
	{
		if(!isNaN(eval(p)))
		{
			return jStat.chisquare.inv(p, this.df);
		}
		return '';
	}


	function printMoments() 
	{
		var txt="";

		txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(),3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(),3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(),3) + '$';

		document.getElementById("moments").innerHTML=txt; 
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"moments"]); 
	}


	function printPdf(x, direction, cv, cv2) {

		var data = new google.visualization.DataTable();

		var txt = 'ChiSq(' + this.df + ')';

		data.addColumn('number', 'x');					// 0
		data.addColumn('number', txt);					// 1 --> 1
		data.addColumn('number', 'rejection region');	// 5 --> 2
		if(direction == 'twotail') {
			data.addColumn('number', 'p-value/2');	// 3 --> 3
		}
		else {
			data.addColumn('number', 'p-value');					// 3 --> 3
		}
		data.addColumn('number', 'critical value');		// 4 --> 4
		data.addColumn('number', 'test statistic');		// 2 --> 5

		x = eval(x);

		var lo = Math.max(this.mean() - 4*this.sd(), 0.1);
		var hi = this.mean() + 4*this.sd();

		data.addRows(1001);

		var i, grd;
		for(i=0; i<1001; i++)
		{
			grd = lo + (hi-lo)*i/1000;
			data.setCell(i, 0, grd);
			data.setCell(i, 1, this.pdf(grd));	

			if(!isNaN(x)) 
			{
				if(grd < x) {
					if(direction == 'less')
						data.setCell(i, 3, this.pdf(grd));
				}
				else {
					if(direction == 'greater')
						data.setCell(i, 3, this.pdf(grd));
				}
				if(direction == 'twotail') {
					if(eval(this.cdf(x)) < eval(1-this.cdf(x))) { //left tail
 						if(grd < Math.abs(x)) data.setCell(i,3,this.pdf(grd));
					}
					else { //right tail
 						if(grd > Math.abs(x)) data.setCell(i,3,this.pdf(grd));
					}
				}

				if(grd < cv) {
					if(direction == 'less')
						data.setCell(i, 2, this.pdf(grd));
				}
				else {
					if(direction == 'greater')
						data.setCell(i, 2, this.pdf(grd));
				}
				if(direction == 'twotail') {
					if(grd < Math.abs(cv)) data.setCell(i,2,this.pdf(grd));
					if(grd > Math.abs(cv2)) data.setCell(i,2,this.pdf(grd));
				}

				var xdelta = (hi-lo)/250;
				if(direction == 'less' || direction == 'greater') {
					if(grd > x-xdelta && grd < x+xdelta) {
						data.setCell(i, 5, this.pdf(grd));
					}
					if(grd > cv-xdelta && grd < cv+xdelta) {
						data.setCell(i, 4, this.pdf(grd));
					}
				}
				if(direction == 'twotail') {
					if(grd > x-xdelta && grd < x+xdelta)  
						data.setCell(i, 5, this.pdf(grd));
					if(grd > Math.abs(cv)-xdelta && grd < Math.abs(cv)+xdelta)  
						data.setCell(i, 4, this.pdf(grd));
					if(grd > Math.abs(cv2)-xdelta && grd < Math.abs(cv2)+xdelta)  
						data.setCell(i, 4, this.pdf(grd));
				}
			}
		}

		var options = {
			backgroundColor:'transparent',
			chartArea: { left: '10%', width: '85%', bottom: '25%' },
			areaOpacity: 0,
			isStacked: false,
			hAxis: {title: 'x',  titleTextStyle: {color: '#000000'}, 
				min: lo,
				max: hi,
				gridlines: {color: 'transparent', count: 7},
				baseline: lo},
			vAxis: {title: 'f(x)',  titleTextStyle: {color: '#000000'}, 
				gridlines: {count: 5, color: 'transparent'},
				viewWindow: {min: 0},
				viewWindowMode: 'explicit'},
			legend: {position: 'top', maxLines: 3},
			series: {
				0:{color: '#000000', areaOpacity: 0, lineWidth: 1.2}, 
				1:{color: '#d9d9d9', areaOpacity: 1, lineWidth: 0},		// RR
				2:{color: '#ff0000', areaOpacity: 0.1, lineWidth: 0},	// p-value
				3:{color: '#808080', areaOpacity: 1, lineWidth: 0},		// cv
				4:{color: '#83aaf1', areaOpacity: 1, lineWidth: 0}},	// ts
			tooltip: {trigger: 'none'}
		};

		var chart = new google.visualization.AreaChart(document.getElementById('pdfPlot'));
		chart.draw(data, options);
	}

}


