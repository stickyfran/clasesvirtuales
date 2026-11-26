// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function hypergeometricDistribution (n, N, M) 
{
	this.n=eval(n);
	this.N=eval(N);
	this.M=eval(M);
	this.mean=mean;
	this.variance=variance;
	this.sd=sd;
	this.pmf=pmf;
	this.cdf=cdf;
	this.printMoments=printMoments;
	this.plotPmf=plotPmf;

	function mean() 
	{
		return this.n*this.M/this.N;
	}

	function variance() 
	{
		return this.n*this.M/this.N*(1-this.M/this.N)*(this.N-this.n)/(this.N-1);;
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pmf(x) 
	{
		this.x = eval(x);

		// return jStat.hypgeom.pdf(x, this.N, this.M, this.n);

		// return(combination(this.M, this.x) * combination(this.N-this.M, this.n-this.x) / 
		// 	combination(this.N, this.n));

		return Math.exp(jStat.combinationln(this.M, this.x) + jStat.combinationln(this.N-this.M, this.n-this.x) - 
			jStat.combinationln(this.N, this.n));
	}

	function cdf(x)
	{
		var i;
		var cdfval=0;

		var sup_lo = Math.max(0, this.n-(this.N-this.M));	// ensure that n-x <= N-M
		var sup_hi = Math.min(this.n, this.M);		// ensure that x <= M

		for(i=sup_lo; i<=x; i++) {
			cdfval = cdfval + this.pmf(i);
		}

		if(x == sup_hi) {
			cdfval = 1;
		}
		
		return cdfval;

		// return jStat.hypgeom.cdf(x, this.N, this.M, this.n);

	}

	function printMoments() 
	{
		var txt="";

		txt += '$ \\mu = E(X) = ' + roundNumber(this.mean(),3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma = SD(X) = ' + roundNumber(this.sd(),3) + '\\hspace{0.5cm}$';
		txt += '$ \\sigma^2 = Var(X) = ' + roundNumber(this.variance(),3) + '$';

		document.getElementById("moments").innerHTML=txt; 

		// Old v2 way:
		// MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]);

		// New v3 way:
		MathJax.typesetPromise([document.querySelector('#moments')]);

	}

	function plotPmf(x,type) 
	{
		x = eval(x);
		type = eval(type);
		
		var data = new google.visualization.DataTable();

		// Create the data table.
		data.addColumn('number', 'x');
		data.addColumn('number', 'P(X=x)');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'P(X=x)');

		data.addRows(this.n+1);

		// var sup_lo = Math.max(0, this.N);	// ensure that n-x <= N-M
		// var sup_hi = Math.min(this.n, this.M);		// ensure that x <= M
		var sup_lo = Math.max(0, this.n-(this.N-this.M));	// ensure that n-x <= N-M
		var sup_hi = Math.min(this.n, this.M);		// ensure that x <= M
		if (sup_lo < this.mean()-4*this.sd()) sup_lo = Math.max(0, Math.floor(this.mean()-4*this.sd()));
		if (sup_hi > this.mean()+4*this.sd()) sup_hi = Math.min(this.n, Math.ceil(this.mean()+4*this.sd()));


		var i;
		for(i=sup_lo; i<=sup_hi; i++)
		{
			data.setCell(i, 0, i);
			data.setCell(i, 1, roundNumber(this.pmf(i),5));
			data.setCell(i, 2, 'P(X=' + i + ') = ' + data.getValue(i, 1));
			
			if(type == 0) {
				if(i == x) {
					data.setCell(i, 1, 0);
					data.setCell(i, 3, roundNumber(this.pmf(i),5));
				}
			}
			if(type == 1) {
				if(i <= x) {
					data.setCell(i, 1, 0);
					data.setCell(i, 3, roundNumber(this.pmf(i),5));
				}
			}
			if(type == 2) {
				if(i >= x) {
					data.setCell(i, 1, 0);
					data.setCell(i, 3, roundNumber(this.pmf(i),5));
				}
			}
		}

		var dataView = new google.visualization.DataView(data);
		dataView.setColumns([{calc: function(data, row) { 
			return data.getFormattedValue(row, 0); }, type:'string'}, 1, 2, 3]);

		// Set chart options
		var options = {
			backgroundColor:'transparent',
			chartArea: { left: '10%', width: '85%', bottom: '25%' },
			hAxis: {title: 'x',  titleTextStyle: {color: '#000000'}, 
				// textStyle: { fontSize: 10 },
				viewWindow: {min: sup_lo, max: sup_hi+1},
				viewWindowMode: 'explicit',
				gridlines: {color: 'transparent'}},
			vAxis: {title: 'P(X=x)',  titleTextStyle: {color: '#000000'}, 
				// textStyle: { fontSize: 10 },
				gridlines: {count: 5, color: 'transparent'},
				viewWindow: {min: 0},
				viewWindowMode: 'explicit'},
			legend: {position: 'none'},
			seriesType: "bars",
			isStacked: true,
			colors:['#6687e7','#ca8d8d'],
		};

		// Instantiate and draw our chart, passing in some options.
		var chart = new google.visualization.ComboChart(document.getElementById('pmfPlot'));
		chart.draw(dataView, options);

	}

}

