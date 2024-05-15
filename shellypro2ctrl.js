// Example http://192.168.178.84/script/1/powerctrl?3kw
// script/1 <- id from the HTTP-Server script

let patDogSecs = 60;

let webCounter = 0;

let simulate = false;
let logging = true;

function errorHandler( response, error_code, error_message){
    if(error_code != 0)
    {
      print("Error controlling relays. Errrorcode :" + error_code + " message: " + error_message);
    }
}

function controlRelays(one, two) {
    
    if(logging == true)
    {
        print("Set output 1: " + one + "  output 2: " + two);
    }
    
    if(one < 2 && two < 2 && simulate == false)
    {
        if(one == 1)
        {
            Shelly.call(
                "Switch.Set",
                { 'id': 0, 'on': true }, errorHandler);
        }
        else
        {
            Shelly.call(
                "Switch.Set",
                { 'id': 0, 'on': false }, errorHandler);

        }
 
        if(two == 1)
        {
            Shelly.call(
                "Switch.Set",
                { 'id': 1, 'on': true }, errorHandler);
        }
        else
        {
            Shelly.call(
                "Switch.Set",
                { 'id': 1, 'on': false }, errorHandler);

        }
 
 
    }
    
  }
  

function powerctrl(req,res)
{
    let tooHot=0;
    // Read thermostat
    tooHot = Shelly.getComponentStatus("input:0").state

    // Increase access counter
    webCounter++;
    if(logging == true) 
    {
        print("Update");
    }
    if(tooHot == 0)
    {
        // Max temp reached
        res.body = "Shelly webserer: max temp reached"
        controlRelays(0,0);
    }
    // check request and comapare the querystring
    else if (req.query === '0kw') {
        // response with some text
        res.body = 'Shelly Webserver: 0kw';
 
        // Switch off both relays
        controlRelays(0, 0); 

    } else if (req.query === '1kw') {
        // response with some text
        res.body = 'Shelly Webserver: 1kw';
        // Switch on first relay
        controlRelays(1, 0); 

    } else if (req.query === '2kw') {
        // response with some text
        res.body = 'Shelly Webserver: 2kw';
        // Switch on second relay
        controlRelays(0, 1); 


    } else if (req.query === '3kw') {
        // response with some text
        res.body = 'Shelly Webserver: 3kw';
        // Switch on both relays
        controlRelays(1, 1); 


    }
    else {
        res.body = 'Shelly Webserver';
    }

    res.code = 200;
    res.send();

}

function watchdog()
{
    let tooHot=0;
    // Read thermostat
    tooHot = Shelly.getComponentStatus("input:0").state

    if(logging == true)
    {
        if(tooHot == 0)
        {
            print("Too HOT!");
        }
      
        if(webCounter == 0)
        {
            print("No updates");
        }
      }    
    if(webCounter == 0 || tooHot == 0)
    {
        // Turn off both relays
        controlRelays(0, 0);
    }

    webCounter = 0;
}

// Register HTTP handler
HTTPServer.registerEndpoint('powerctrl', powerctrl);
// Setup watchdog
Timer.set(1000*patDogSecs, true, watchdog);

