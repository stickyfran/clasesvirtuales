// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function wrsDistribution(n1, n2) 
{
	this.n1 = (n1 === '' || n1 === null) ? NaN : eval(n1);
	this.n2 = (n2 === '' || n2 === null) ? NaN : eval(n2);
	this.mean = mean;
	this.variance = variance;
	this.sd = sd;
	this.pmf = pmf;
	this.cdf = cdf;
	this.printMoments = printMoments;
	this.plotPmf = plotPmf;
	
	this.xmin = isNaN(this.n1) ? 0 : this.n1 * (this.n1 + 1) / 2;
	this.xmax = isNaN(this.n1) || isNaN(this.n2) ? 0 : this.xmin + this.n1 * this.n2;

	// Recursive function for number of subsets of size n1 that sum to w
	this.fnum = function(w, n1, n2) {
		if (w < n1 * (n1 + 1) / 2 || w > (n1 * n2 + n1 * (n1 + 1) / 2)) return 0;
		if (n1 === 0 || n2 === 0) return 1;
		return this.fnum(w, n1, n2 - 1) + this.fnum(w - n1 - n2, n1 - 1, n2);
	};

	function mean() 
	{
		return this.n1 * (this.n1 + this.n2 + 1) / 2;
	}

	function variance() 
	{
		return this.n1 * this.n2 * (this.n1 + this.n2 + 1) / 12;
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pmf(w) 
	{
		var wVal = (w === '' || w === null) ? NaN : eval(w);
		if(isNaN(wVal)) return 0;

		if(wVal >= this.xmin && wVal <= this.xmax) {
			var coeff = (jStat.factorial(this.n1) * jStat.factorial(this.n2)) / jStat.factorial(this.n1 + this.n2);
			return coeff * this.fnum(wVal, this.n1, this.n2);
		}
		return 0;
	}

	function cdf(w)
	{
		var wVal = (w === '' || w === null) ? NaN : eval(w);
		if(isNaN(wVal)) return 0;
		
		var cdfval = 0;
		for(var i = this.xmin; i <= wVal; i++) {
			cdfval += this.pmf(i);
		}
		return (wVal >= this.xmax) ? 1 : cdfval;
	}

	function printMoments() 
	{
		var txt = "";
		txt += '$ \\mu = E(W_1) = ' + roundNumber(this.mean(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(W_1) = ' + roundNumber(this.sd(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(W_1) = ' + roundNumber(this.variance(), 3) + '$';

		document.getElementById("moments").innerHTML = txt; 
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]); 
	}

	function plotPmf(x, type) 
	{
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'x');
		data.addColumn('number', 'P(W1=w1)');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'Highlighted');

		var xlo = this.xmin;
		var xhi = this.xmax;

		for(var i = xlo; i <= xhi; i++)
		{
			var p = roundNumber(this.pmf(i), 5);
			var tooltip = 'P(W1=' + i + ') = ' + p;
			
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
			hAxis: {title: 'w1', viewWindow: {min: xlo, max: xhi}},
			vAxis: {title: 'P(W1=w1)', viewWindow: {min: 0}},
			legend: {position: 'none'},
			seriesType: "bars",
			isStacked: true,
			colors: ['#6687e7', '#ca8d8d']
		};

		var chart = new google.visualization.ComboChart(document.getElementById('pmfPlot'));
		chart.draw(data, options);
	}
}

