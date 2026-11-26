// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function runsDistribution (n1, n2) 
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
	
	this.xmin;
	this.xmax;
	
	if(isNaN(this.n1) || isNaN(this.n2)) {
		this.xmin = 0;
		this.xmax = 0;
	}
	else if(this.n1 == 0 || this.n2 == 0) {
		this.xmin = 1; 
		this.xmax = 1;
	}
	else if(this.n1 != this.n2) {
		this.xmin = 2;
		this.xmax = 2 * Math.min(this.n1, this.n2) + 1;
	}
	else {
		this.xmin = 2;
		this.xmax = 2 * Math.min(this.n1, this.n2);
	}

	function mean() 
	{
		if (isNaN(this.n1) || isNaN(this.n2)) return 0;
		return (2 * this.n1 * this.n2) / (this.n1 + this.n2) + 1;
	}

	function variance() 
	{
		if (isNaN(this.n1) || isNaN(this.n2)) return 0;
		var N = this.n1 + this.n2;
		if (N <= 1) return 0;
		return (2 * this.n1 * this.n2 * (2 * this.n1 * this.n2 - N)) / (Math.pow(N, 2) * (N - 1));
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
			if(this.n1 == 0 || this.n2 == 0) {
				return 1;
			}
			var denom = combination(this.n1 + this.n2, this.n1);
			if(xVal % 2 === 0) { // Even x
				var k = xVal / 2;
				return (2 * combination(this.n1 - 1, k - 1) * combination(this.n2 - 1, k - 1)) / denom;
			}
			else { // Odd x
				var k = (xVal - 1) / 2;
				return (combination(this.n1 - 1, k) * combination(this.n2 - 1, k - 1) +
						combination(this.n1 - 1, k - 1) * combination(this.n2 - 1, k)) / denom;
			}
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
		txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(), 3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(), 3) + '$';

		document.getElementById("moments").innerHTML = txt; 
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]); 
	}

	function plotPmf(x, type) 
	{
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'x');
		data.addColumn('number', 'P(X=x)');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'Highlighted');

		var xlo = this.xmin;
		var xhi = this.xmax;

		for(var i = 0; i <= xhi; i++)
		{
			var p = roundNumber(this.pmf(i), 5);
			var tooltip = 'P(X=' + i + ') = ' + p;
			
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
			hAxis: {title: 'x', viewWindow: {min: xlo, max: xhi}},
			vAxis: {title: 'P(X=x)', viewWindow: {min: 0}},
			legend: {position: 'none'},
			seriesType: "bars",
			isStacked: true,
			colors: ['#6687e7', '#ca8d8d']
		};

		var chart = new google.visualization.ComboChart(document.getElementById('pmfPlot'));
		chart.draw(data, options);
	}
}

