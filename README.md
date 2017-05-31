# webassignment
## Introduction
In this assignment, we work as a group to build a small data analytic web application by Wikipedia data, to draw diagrams to show the results we statistics for both the whole data set, as well as the specific article. 
On the server side, we use Node.js and NoSQL Document Storage—MongoDB, while on the client side, we use Pug (jade), JavaScript (including jQuery, Ajax, etc.) as well as relevant CSS files for the page views, using Google Chart API for the graphs drawing. 
## MVC model 
### 1)Controller
When router set the connections between request and controller, the controller can deal with the requests invoking method interacting with the model. Then, the controller will pass the data to the View model.
Firstly, get a model object defined as Revision. Use Revision to interact with Model.  


The function above is used to response the user request that wants to access to the main page. So, in this circumstance, the Controller does not need to interact with the model.


Then, build a set container to collect all results corresponding to the six requests and data used to draw bar chart and pie chart in View. The data in a set are processed by series functions like:


The function Revision.findmost() is used to find the article with the least number of revisions: 
The function Revision.findoldesttime() is used to find the article with the longest history:  

Then, Controller passes the set by JSON type to the View:


Processing individual page is similar to overall page. At first, build a set container to collect all results corresponding to the five requests and data used to draw bar chart and pie chart in View:
 

Second, put processed data into the container. In this step, series functions have been used to process data, for an example, the function used to find top five regular users:


At last, transfer the data set container to the View:


###  2)Model
•	db.js: Creates a connection to mongo DB.  
•	Revision.js:  When controller try to connect to MongoDB, it will use the instance of this module, which has the ability to deal with the request with method (find update save delete) interacting with database. Then, this model passes data to controller or save data in the DB. 
•	revision_assign.js: It is used to do the query of Wikipedia API. First it will send the http request with the parameters title of one exact article and the date you want to begin the query. The setting is like this:


•	Router:  The router will route users’ request based on the request URL to one particular controller function. We list all the routes for the project: 
Routes for ‘/’ which is used to render the home page(entry.pug) 
Routes for ‘/overview’ which is used to get JSON type data of whole dataset
Routes for ‘/indipage’ which is used to get JSON type data of one particular article

### 3)View
In the view section, we code it in the entry.pug file. For the page view layout, we divide it into two parts, one link is for the overview page, another one is for the individual page. The logical part about user interaction is coded in the /public/js/main.js file, and the relevant style sheet is in the /public/css/individual.css and w3.css.
For the single page show, we control the two pages (overview and individual) by using <div> hide() and show() method, as well as switching the different contents which are coded in different <div> with the click events by relative links. For the example below, we use jQuery selectors by element id or class name then set the click event for them to do different functions.
For receiving the data, which means get response from the database by the controller and router, we use $.ajax or $.getJSON method, we also user deferred feature in jQuery for the consequence actions after the data set has responded, such as $.getJSON().done(function(data){…}), for example:
For drawing the graph, we select invoking the Google Chart API as we had practiced in the tutorial week 9. The method of graph drawing is similar, so we set group of the graphs in the same position (using JS selector find the relative <div> position), then drawing the graphs with different data set.

In addition, we code such additional features for better performance. Such as setting the filter for the article list when user type words in search form. We also coded loading animation when data is loading from the server. 
Whole structure for the project 


