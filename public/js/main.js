google.charts.load('current', {packages: ['corechart']});
google.charts.load('current', {'packages':['bar']});


var mRevisions, lRevisions, lEdit, sEdit, lHistory, sHistory
var bdata, cdata, articleList, title, reNumber
var users=[];
var usersRevNumber=[];
let getList=false; getPull=false;

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    $.each($('.tabcontent'), function(index) {
    	drawTopEditorsBar(ttdata[index], $(this));
    });
}
function drawTopEditorsBar(data, pos) {
    var TopEditorsBarData = google.visualization.arrayToDataTable(data);
    var TopEditorsBarOptions = {
            bars: 'vertical',
            'width':400,
            'height':300
    };
    
    var chart = new google.charts.Bar(pos[0]);
    chart.draw(TopEditorsBarData, google.charts.Bar.convertOptions(TopEditorsBarOptions));	
}

function drawOverallPie(){
   	graphData = new google.visualization.DataTable();
	graphData.addColumn('string', 'User type');
	graphData.addColumn('number', 'Percentage');
	$.each(cdata, function(key, val) {
		graphData.addRow([key, val]);
	})
	var chartOptions = {
        'width':600,
        'height':350,
        pieSliceText: 'percentage',
        slices: {  1: {offset: 0.3},
                   3: {offset: 0.3}
        }
	};
	var chart = new google.visualization.PieChart($("#overallChart")[0]);
	chart.draw(graphData, chartOptions);
}

function drawOverallBar(){
    var columnData = google.visualization.arrayToDataTable(bdata);
    var barOptions = {
            bars: 'vertical',
            vAxis: {format: 'decimal'},
            colors: ['#1b9e77', '#d95f02', '#7570b3', '#3366cc'],
            'width':1000,
            'height':350
    };
    
    var chart = new google.charts.Bar(document.getElementById('overallChart'));
    chart.draw(columnData, google.charts.Bar.convertOptions(barOptions));
}
function drawRevDistributeByBuTable(data){
    var columnData = google.visualization.arrayToDataTable(data);
    var barOptions = {
            bars: 'vertical',
            vAxis: {format: 'decimal'},
            colors: ['#1b9e77', '#d95f02', '#7570b3', '#3366cc'],
            'width':1000,
            'height':350
    };
    
    var chart = new google.charts.Bar($("#revDistributeByBuTable")[0]);
    chart.draw(columnData, google.charts.Bar.convertOptions(barOptions));
}

function revDistributePieChart(data){
   	graphData = new google.visualization.DataTable();
	graphData.addColumn('string', 'User type');
	graphData.addColumn('number', 'Percentage');
	$.each(data, function(key, val) {
		graphData.addRow([key, val]);
	})
	var chartOptions = {
        'width':600,
        'height':350,
        pieSliceText: 'percentage',
	};
	var chart = new google.visualization.PieChart($("#revDistributePieChart")[0]);
	chart.draw(graphData, chartOptions);
}
function drawLastBarChart(data){
    var columnData = google.visualization.arrayToDataTable(data);
    var barOptions = {
            bars: 'vertical',
            //vAxis: {format: 'decimal'},
            colors: ['#1b9e77', '#d95f02', '#7570b3', '#3366cc', '#00FF00'],
            'width':1000,
            'height':500,
            legend: { position: 'top', alignment: 'start', maxLines: 1}
    };
    
    var chart = new google.charts.Bar(document.getElementById('lastBarChart'));
    chart.draw(columnData, google.charts.Bar.convertOptions(barOptions));
}

function fillList(){
		var aList = {};
   		aList.d = articleList;
   		
   		$('#myTable tr').not(':first').remove();
   		var html = '';
   		for(var i = 0; i < aList.d.length; i++)
   		            html += '<tr><td>' + aList.d[i]._id + '</td><td>' + aList.d[i].numOfEdits + '</td></tr>';
   		$('#myTable tbody').first().after(html);
}

function topFiveRegUsersTable(user, number) {
	$('#topFiveRegUsersTable tr').remove();
		var topFiveUsersHtml = '';
		for(var i = 0; i < 5; i++)
			topFiveUsersHtml += '<tr><td>' + user[i] + '</td><td>' + number[i] + '</td></tr>';
		$('#topFiveRegUsersTable tbody').first().after(topFiveUsersHtml);
}


function keyWord() {
	  // Declare variables 
	  var input, filter, table, tr, td, i;
	  input = document.getElementById("myInput");
	  filter = input.value.toUpperCase();
	  table = document.getElementById("myTable");
	  tr = table.getElementsByTagName("tr");

	  // Loop through all table rows, and hide those who don't match the search query
	  for (i = 0; i < tr.length; i++) {
	    td = tr[i].getElementsByTagName("td")[0];
	    if (td) {
	      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
	        tr[i].style.display = "";
	      } else {
	        tr[i].style.display = "none";
	      }
	    } 
	  }
}

$(document).ready(function() {
    $(".individual").hide();
    $('.reNumber').hide();
    $(".loader").hide();
    
    $("#overviewLink").click(function(event){
    	$(".individual").hide();
    	$("#individualLink").css("background-color","");
   		$(this).css("background-color","#0F0");
    	$(".loader").show();
    	if (getList==false || getPull==true) {
            let getOverview = $.getJSON('/overviewdata', null, function(rdata) {
            	articleList=rdata.alltitle;
            	bdata=rdata.bdata;
            	cdata=rdata.cdata;
            	mRevisions = rdata.mostarticle[0]._id;
            	lRevisions = rdata.leastarticle[0]._id;
            	lEdit = rdata.mostpopulararticle[0]._id;
            	sEdit = rdata.lesspopulararticle[0]._id;
            	lHistory = rdata.longestarticle[0].title;
            	sHistory = rdata.shortestarticle[0]._id;
           		$("#mostRevisions").text("The article with the most number of revisions: " + mRevisions);
           		$("#leastRevisions").text("The article with the least number of revisions: " + lRevisions);
           		$("#lEditors").text("The article edited by largest group of registered users: " + lEdit);
           		$("#sEditors").text("The article edited by smallest group of registered users: " + sEdit);
           		$("#lHistory").text("The article with the longest history: " + lHistory);
           		$("#sHistory").text("The article with the shortest history: " + sHistory);
           		drawOverallBar();  
            });
            
            getOverview.done(function(rdata) {
            	getList=true;
            	$('.reNumber').show();
            	$("#overallBarChart").click();
            	$(".loader").hide();       		
            	$(".overview").show();
            });
    	} else {
        	$('.reNumber').show();
        	$("#overallBarChart").click();
        	$(".loader").hide();       		
        	$(".overview").show();
    	}
     
   	})
   	
    $("#individualLink").click(function(event){
    	$(".overview").hide();
    	//$("#lastBarChart").hide();
    	$(".loader").show();
   		$("#overviewLink").css("background-color","");
   		$(this).css("background-color","#0F0");
   		if (!getList) {
   	        let getIndi = $.getJSON('/overviewdata', null, function(rdata) {
   	        	articleList=rdata.alltitle;
   	        	bdata=rdata.bdata;
   	        	cdata=rdata.cdata;
   	        	mRevisions = rdata.mostarticle[0]._id;
   	        	lRevisions = rdata.leastarticle[0]._id;
   	        	lEdit = rdata.mostpopulararticle[0]._id;
   	        	sEdit = rdata.lesspopulararticle[0]._id;
   	        	lHistory = rdata.longestarticle[0].title;
   	        	sHistory = rdata.shortestarticle[0]._id;
   	       		$("#mostRevisions").text("The article with the most number of revisions: " + mRevisions);
   	       		$("#leastRevisions").text("The article with the least number of revisions: " + lRevisions);
   	       		$("#lEditors").text("The article edited by largest group of registered users: " + lEdit);
   	       		$("#sEditors").text("The article edited by smallest group of registered users: " + sEdit);
   	       		$("#lHistory").text("The article with the longest history: " + lHistory);
   	       		$("#sHistory").text("The article with the shortest history: " + sHistory);
   	       		drawOverallBar();  
   	        });
   	        getIndi.done(function(data){
   	        	getList=true;
   	   	   		fillList(); 	  	
   	   	    	$(".individual").show();
   	   	    	$(".loader").hide();
   	   	    	$('.userinfo').hide();
   	   	    	$('.articleChart').hide();
   	        });
   		} else {
   			fillList(); 	  	
   	    	$(".individual").show();
   	    	$(".loader").hide();
   	    	$('.userinfo').hide();
   	    	$('.articleChart').hide();
   		}

   	})
	
   	$("#overallBarChart").click(function(event){
   		event.preventDefault();
   		$("#overallPieChart").css("background-color","");
   		$(this).css("background-color","#0F0");
   		drawOverallBar()
   	})
   	
   	$("#overallPieChart").click(function(event){
   		event.preventDefault();
   		$("#overallBarChart").css("background-color","");
   		$(this).css("background-color","#0F0");
   		drawOverallPie();
   	})
   	
   	$('#topFiveRegUsers').click(function(event){
    	event.preventDefault();
    	$('.articleChart').hide();
    	$('.articleTab').css("background-color","");
    	$(this).css("background-color","#0F0");
    	$('#topFiveRegUsersTable').show();
    })
    
    $('#revDistributeByBu').click(function(event){
    	event.preventDefault();
    	$('.articleChart').hide();
    	$('.articleTab').css("background-color","");
    	$(this).css("background-color","#0F0");
    	$('#revDistributeByBuTable').show();
    	drawRevDistributeByBuTable(bybudata);
    })    

    $('#revDistributePie').click(function(event){
    	event.preventDefault();
    	$('.articleChart').hide();
    	$('.articleTab').css("background-color","");
    	$(this).css("background-color","#0F0");
    	$('#revDistributePieChart').show();
    })
    
    $('#revDistribute').click(function(event){
    	event.preventDefault();
    	$('.articleChart').hide();
    	$('.articleTab').css("background-color","");
    	$(this).css("background-color","#0F0");
    	$('#distributeChart').show();
    })
    
    $('#lastChartTab').click(function(event){
    	event.preventDefault();
    	$('.articleChart').hide();
    	$('.articleTab').css("background-color","");
    	$(this).css("background-color","#0F0");
    	$('#lastBarChart').show();
    	drawLastBarChart(tdata);
    })    
    
   	
    $('#myTable').delegate('tr', 'click', function(){
    	$(".loader").show();
        title = $(this).find('td:first').html();
        reNumber = $(this).find('td:nth-child(2)').html();
        
        let getArticle = $.getJSON('/articledata', {title: title});
        
        getArticle.done(function(rdata) {
        	$(".loader").hide();
        	$('.articleTab').css("background-color","");
        	$('.articleChart').hide();
        	lastReNumber = rdata.revtimeByarticle;
	    	for(var k=0;k<5;k++)
    		{
	    		users[k]=rdata.top5user[k]._id;
    		}
	    	for(var k=0;k<5;k++)
    		{
	    		usersRevNumber[k]=rdata.top5user[k].numOfEdits;
    		}
	    	tdata = rdata.tdata;
	    	bybudata=rdata.bdata;
	    	piedata=rdata.cdata;
	    	ttdata=rdata.barchartforuser
	    	$("#articleTitle").text("The title: " + title);
	    	$("#totalRevisions").text("The total number of revisions: " + lastReNumber);
	    	topFiveRegUsersTable(users, usersRevNumber);
	    	revDistributePieChart(piedata);
	        $.each($('.tablinks'), function(index) {
	        	$(this).text(users[index]);
	        });
	        
	        
	        if (lastReNumber > reNumber) {
	        	alert(lastReNumber - reNumber + ' new revisions has been downloaded.');
	        	getPull=true;
	        } else {
	        	alert('no new revisions.');
	        	getPull=false;
	        }	      
	        $('.userinfo').show();
        });
    })
});