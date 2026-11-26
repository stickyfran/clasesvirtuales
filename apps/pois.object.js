// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function poissonDistribution (lambda) 
{
	this.lambda=eval(lambda);
	this.mean=mean;
	this.variance=variance;
	this.sd=sd;
	this.pmf=pmf;
	this.cdf=cdf;
	this.printMoments=printMoments;
	this.plotPmf=plotPmf;
	this.plotLike=plotLike;

	function mean() 
	{
		return this.lambda;
	}

	function variance() 
	{
		return this.lambda;
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pmf(x) 
	{
		this.x = eval(x);
		// return jStat.poisson.pdf(x, this.lambda);
		// return Math.exp(-this.lambda) * Math.pow(this.lambda, this.x) / factorial(this.x);
		return Math.exp(-this.lambda + this.x*Math.log(this.lambda) - (jStat.factorialln(this.x)));
	}

	function cdf(x)
	{
		var i;
		var cdfval=0;

		for(i=0; i<=x; i++) {
			cdfval = cdfval + this.pmf(i);
		}

		return cdfval;

		// return jStat.poisson.cdf(x, this.lambda);
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

	function plotPmf(x, type) 
	{
		x = eval(x);
		type = eval(type);
		
		var data = new google.visualization.DataTable();

		// Create the data table.
		data.addColumn('number', 'x');
		data.addColumn('number', 'P(X=x)');
		data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
		data.addColumn('number', 'P(X=x)');

		var lo = Math.max(-0.5, Math.floor(this.mean() - 4*this.sd()));
		var hi;

		if(this.lambda < 0.5) hi = 4;
		if(this.lambda >= 0.5 & this.lambda < 1.0) hi = 6;
		if(this.lambda >= 1.0 & this.lambda < 20) hi = Math.floor(this.mean() + 5*this.sd());
		if(this.lambda >= 20) hi = Math.floor(this.mean() + 4*this.sd());

		var mywidth = 350;
		if(this.lambda >= 200) mywidth=350 + 14*Math.sqrt(this.lambda-200);

		data.addRows(hi+1);

		var i;
		for(i=0; i<hi; i++)
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
			backgroundColor: 'transparent',
			chartArea: { left: '10%', width: '85%', bottom: '25%' },
			hAxis: {title: 'x',  titleTextStyle: {color: '#000000'}, 
				viewWindow: {min: lo, max: hi+0.5},
				viewWindowMode: 'explicit',
				gridlines: {color: 'transparent'},
				baseline: -0.5},
			vAxis: {title: 'P(X=x)',  titleTextStyle: {color: '#000000'}, 
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

	function plotLike() {

		var data = new google.visualization.DataTable();

		// Create the data table.
		data.addColumn('number', 'x');
		data.addColumn('number', "Likelihood");
		data.addColumn('number', 'Log-Likelihood');
		data.addColumn('number', 'CI');
		data.addColumn('number', 'chord');

		this.xvec = form0.x.value.split(",");

		var i, mle = 0;

		for(i=0; i<this.xvec.length; i++) {
			mle = mle + this.xvec[i]/this.xvec.length;
		}
		var ofi = this.xvec.length / mle;

		var lo = Math.max(0, mle-4*Math.sqrt(mle));
		var hi = mle+4*Math.sqrt(mle);

		data.addRows(200);

		var i, j, llike;
		var llike_mle = 0;

		for(j=0; j<this.xvec.length; j++) {
			llike_mle = llike_mle - mle + this.xvec[j]*Math.log(mle) - Math.log(factorial(this.xvec[j]));
		}

		for(i=0; i<200; i++)
		{
			llike = 0;
			grd = lo + i*(hi-lo)/200;
			data.setCell(i, 0, grd);
			for(j=0; j<this.xvec.length; j++) {
				llike = llike - grd + this.xvec[j]*Math.log(grd) - Math.log(factorial(this.xvec[j]));
			}

			data.setCell(i, 1, Math.exp(llike));
			data.setCell(i, 2, llike);
			if(2*(llike_mle - data.getValue(i,2)) < 3.84) {
				data.setCell(i, 3, 0);
			}

			data.setCell(i, 4, llike_mle-(3.84/2));
		}

		// Set chart options
		var options = {
			backgroundColor: 'transparent',
			lineWidth: 1,
			hAxis: {title: 'lambda', 
				viewWindow: {min: lo, max: hi},
				viewWindowMode: 'explicit',
				},
			legend: {position: 'none'},
			series: {
				0: {targetAxisIndex: 0, lineWidth: 1, color: 'black'},
				1: {targetAxisIndex: 1, lineWidth: 1},
				2: {color: '#228b22', lineWidth: 5},
				3: {color: '#228b22', lineWidth: 1, targetAxisIndex: 1,
					visibleInLegend: false}
				},
			vAxes: {
				0: {
					title: 'Likelihood', textStyle: {color: 'black'}, titleTextStyle: {color: 'black'}
				},
				1: {
					title: 'Log-Likelihood', textStyle: {color: 'red'}, titleTextStyle: {color: 'red'}
				}
			},
		};

		// Instantiate and draw our chart, passing in some options.
		var chart = new google.visualization.LineChart(document.getElementById('pmfPlot'));
		chart.draw(data, options);

		var txt="";
		txt += 'MLE: ' + roundNumber(mle,4) + '&nbsp;&nbsp;&nbsp;&nbsp;<br>';
		txt += 'Observed Fisher Information: ' + roundNumber(ofi,4) + '<br><br>';
		document.getElementById("moments").innerHTML=txt;
	}
}