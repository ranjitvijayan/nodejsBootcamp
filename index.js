let http = require('http')

let request = require('request')

let url = require('url')

// Set a the default value for --host to 127.0.0.1
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv

let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

let destinationUrl = argv.url || url.format({
       protocol: 'http',
       host: argv.host,
       port
    })


//##############   Creating web server    #######################

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)

	req.pipe(res)

//Adding the logging at  the incoming request headers
process.stdout.write('\n\n Incoming Request in Webserver::' + JSON.stringify(req.headers))
req.pipe(process.stdout)


for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
}

}).listen(8000)


//############## Creating Proxy Server  #############################

http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)

// Proxy code here
let options = {
        headers: req.headers,
        url: `${destinationUrl}${req.url}`
    }

request(options)

//Commenting to add the below logging statement
//let outboundResponse = request(options)
//outboundResponse.pipe(res)


// Log the proxy request headers and content in the **server callback**
let outboundResponse = request(options)
req.pipe(outboundResponse)

process.stdout.write('\n\n Response from Proxy to my webserver ::'+JSON.stringify(outboundResponse.headers))
outboundResponse.pipe(process.stdout)
outboundResponse.pipe(res)


// Or more succinctly
request(options).pipe(res)


// For non-GET requestsforwarding along both the request body and the 
//HTTP verb
// Use the same HTTP verb
options.method = req.method

// Note: streams are chainable
// readableStream -> writable/readableStream -> writableStream
req.pipe(request(options)).pipe(res)

//
}).listen(8001)

