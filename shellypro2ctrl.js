// Example http://192.168.178.84/script/1/powerctrl?3kw
// script/1 <- id from the HTTP-Server script

let patDogSecs = 20;

let webCounter = 0;

let simulate = true;
let logging = true;

function errorHandler( response, error_code, error_message){
    print("Error controlling relays");
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
                { id: 0, on: true }, errorHandler);
        }
        else
        {
            Shelly.call(
                "Switch.Set",
                { id: 0, on: false }, errorHandler);

        }
 
        if(two == 1)
        {
            Shelly.call(
                "Switch.Set",
                { id: 1, on: true }, errorHandler);
        }
        else
        {
            Shelly.call(
                "Switch.Set",
                { id: 1, on: false }, errorHandler);

        }
 
 
    }
    
  }
  

function powerctrl(req,res)
{
    // Increase access counter
   § webCounter++;
    if(logging == true) 
    {
        print("Update");
    }
    
    // check request and comapare the querystring
    if (req.query === '0kw') {
        // response with some text
        res.body = 'Shelly Webserver: 0kw';
        res.code = 200;
        res.send();
 
        // Switch off both relays
        controlRelays(0, 0); 

    } else if (req.query === '1kw') {
        // response with some text
        res.body = 'Shelly Webserver: 1kw';
        res.code = 200;
        res.send();
        // Switch on first relay
        controlRelays(1, 0); 

    } else if (req.query === '2kw') {
        // response with some text
        res.body = 'Shelly Webserver: 2kw';
        res.code = 200;
        res.send();
        // Switch on second relay
        controlRelays(0, 1); 


    } else if (req.query === '3kw') {
        // response with some text
        res.body = 'Shelly Webserver: 3kw';
        res.code = 200;
        res.send();
        // Switch on both relays
        controlRelays(1, 1); 


    }
    else {
        res.body = 'Shelly Webserver';
        res.code = 200;
        res.send();
    }

}

function watchdog()
{
    let tooHot=1;
    // Read thermostat
    tooHot = Shelly.getComponentStatus("input:0").state

    if(tooHot == 1)
    {
        print("Too HOT!");
    }

    if(webCounter == 0)
    {
        print("No updates");
    }

    if(webCounter == 0 || tooHot == 1)
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

