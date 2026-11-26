// <!--Copyright 2026 Matt Bognar-->
// <!--Written by:-->
// <!--Matt Bognar-->
// <!--Iowa, USA-->
// <!----------------------------------------------------->
// <!--This software may not be copied or re-distributed-->
// <!----------------------------------------------------->

function expDistribution (lambda) {

	this.lambda=eval(lambda);
	this.mean=mean;
	this.variance=variance;
	this.sd=sd;
	this.pdf=pdf;
	this.cdf=cdf;
	this.percentile=percentile;
	this.printMoments=printMoments;
	this.printPdf=printPdf;
	this.printLike=printLike;

	function mean() 
	{
		return 1/this.lambda;
	}

	function variance() 
	{
		return 1/(this.lambda*this.lambda);
	}

	function sd() 
	{
		return Math.sqrt(this.variance());
	}

	function pdf(x) 
	{
		return(this.lambda * Math.exp(-this.lambda*x));
	}

	function cdf(x) 
	{ 
		if(!isNaN(x) && x !== '')
		{
            x = eval(x);
			return 1-Math.exp(-this.lambda*x);
		}
		
		return '';
	}

	function percentile(p)
	{
		if(!isNaN(p) && p !== '') {
            p = eval(p);
            return -Math.log(1-p)/this.lambda;
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
		// Old v2 way:
		// MathJax.Hub.Queue(["Typeset", MathJax.Hub, "moments"]);

		// New v3 way:
		MathJax.typesetPromise([document.querySelector('#moments')]);
	}

	function printPdf(x, direction) {

		var data = new google.visualization.DataTable();

		// Create the data table.
		data.addColumn('number', 'x');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');
		data.addColumn('number', 'f(x)');

        // Protect against empty strings breaking the graph plot
		x = (x === '' || x === null) ? NaN : eval(x);

		var lo = 0;
		var hi = this.percentile(0.999);

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

	function printLike() {

		var data = new google.visualization.DataTable();

		// Create the data table.
		data.addColumn('number', 'x');
		data.addColumn('number', "Likelihood");
		data.addColumn('number', 'Log-Likelihood');
		data.addColumn('number', 'CI');
		data.addColumn('number', 'chord');

		this.xvec = form0.x.value.split(",");
		var n = this.xvec.length;

		var i, grd, mle = 0, xbar = 0;

		// Determine MLE
		for(i=0; i<n; i++) {
			xbar = xbar + eval(this.xvec[i])/n;
		}
		mle = 1 / xbar;

		// Observed Fisher Info
		var ofi = n/Math.pow(mle,2);

		var lo = Math.max(0, mle-4*mle);
		var hi = mle+4*mle/Math.sqrt(n);

		data.addRows(200);

		var i, j, llike;
		var llike_mle = 0;

		this.lambda = mle;
		for(j=0; j<n; j++) {
			llike_mle = llike_mle + Math.log(this.pdf(this.xvec[j]));
		}

		for(i=0; i<200; i++)
		{
			llike = 0;
			grd = lo + i*(hi-lo)/200;
			data.setCell(i, 0, grd);

			this.lambda = grd;
			for(j=0; j<n; j++) {
				llike = llike + Math.log(this.pdf(this.xvec[j]));
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
		var chart = new google.visualization.LineChart(document.getElementById('pdfPlot'));
		chart.draw(data, options);

		// Print MLE and OFI
		var txt="";
		if(mle < 1e-6 || mle > 1e6) {
			txt += 'MLE: ' + mle.toExponential() + '&nbsp;&nbsp;&nbsp;&nbsp;<br>';
			}
		else {
			txt += 'MLE: ' + roundNumber(mle,6) + '&nbsp;&nbsp;&nbsp;&nbsp;<br>';
			}
		if(ofi < 1e-6 || ofi > 1e6) {
			txt += 'Observed Fisher Information: ' + ofi.toExponential() + '<br><br>';
			}
		else {
			txt += 'Observed Fisher Information: ' + roundNumber(ofi,6) + '<br><br>';
			}
		document.getElementById("moments").innerHTML=txt;
	}
}

