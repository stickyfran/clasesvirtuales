// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function wilcoxonDistribution(n) 
{
	this.n = (n === '' || n === null) ? NaN : eval(n);
	this.mean = mean;
	this.variance = variance;
	this.sd = sd;
	this.pmf = pmf;
	this.cdf = cdf;
	this.printMoments = printMoments;
	this.plotPmf = plotPmf;
	
	this.xmin = 0;
	this.xmax = isNaN(this.n) ? 0 : (this.n * (this.n + 1) / 2);

	// Recursive function to find number of subsets that sum to x
	this.cnum = function(x, n) {
		if (x < 0 || x > (n * (n + 1) / 2) || n < 0) return 0;
		if (x === 0) return 1; // Empty set or subset summing to 0
		if (n === 0) return 0;
		return this.cnum(x, n - 1) + this.cnum(x - n, n - 1);
	};

	function mean() 
	{
		return this.n * (this.n + 1) / 4;
	}

	function variance() 
	{
		return this.n * (this.n + 1) * (2 * this.n + 1) / 24;
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pmf(x) 
	{
		var xVal = (x === '' || x === null) ? NaN : eval(x);
		if(isNaN(xVal)) return 0;

		if(xVal >= this.xmin && xVal <= this.xmax) {
			return this.cnum(xVal, this.n) / Math.pow(2, this.n);
		}
		return 0;
	}

	function cdf(x)
	{
		var xVal = (x === '' || x === null) ? NaN : eval(x);
		if(isNaN(xVal)) return 0;
		
		var cdfval = 0;
		for(var i = this.xmin; i <= xVal; i++) {
			cdfval += this.pmf(i);
		}

		return (xVal >= this.xmax) ? 1 : cdfval;
	}

	function printMoments() 
	{
		var txt = "";
		txt += '$ \\mu = E(W) = ' + roundNumber(this.mean(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(W) = ' + roundNumber(this.sd(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(W) = ' + roundNumber(this.variance(), 3) + '$';

		document.getElementById("moments").innerHTML = txt; 
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]); 
	}

	function plotPmf(x, type) 
	{
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'w');
		data.addColumn('number', 'P(W=w)');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'Highlighted');

		var xlo = this.xmin;
		var xhi = this.xmax;

		for(var i = 0; i <= xhi; i++)
		{
			var p = roundNumber(this.pmf(i), 5);
			var tooltip = 'P(W=' + i + ') = ' + p;
			
			var normalVal = p;
			var highVal = 0;

			if(type == 0 && i == x) { normalVal = 0; highVal = p; }
			if(type == 1 && i <= x) { normalVal = 0; highVal = p; }
			if(type == 2 && i >= x) { normalVal = 0; highVal = p; }

			data.addRow([i, normalVal, tooltip, highVal]);
		}

		var options = {
			backgroundColor: 'transparent',
			chartArea: { left: '10%', width: '85%', bottom: '25%' },
			hAxis: {title: 'w', viewWindow: {min: xlo, max: xhi}},
			vAxis: {title: 'P(W=w)', viewWindow: {min: 0}},
			legend: {position: 'none'},
			seriesType: "bars",
			isStacked: true,
			colors: ['#6687e7', '#ca8d8d']
		};

		var chart = new google.visualization.ComboChart(document.getElementById('pmfPlot'));
		chart.draw(data, options);
	}
}

