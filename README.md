## A scheduling... thing

<img src="https://github.com/jcquery/schedulerer/raw/master/demo.gif" height="250">

This is a React day scheduling component I built for a coding challenge. It had to allow dragging and dropping of events to reposition, as well as expanding and contracting events to lengthen or shorten them.

I ended up not using any libraries for the event movement, and instead combined HTML5's drag API with a bunch of state in React to create drag behavior. Moment.js was used for date parsing, and it does that really, really well. 
