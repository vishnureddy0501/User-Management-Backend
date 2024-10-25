How to sart server:
------------------
npm run start

HTTP methods:
----------------
get
post
put (updating multiple attributes)
patch (updating single attribute)
delete

nodemon.json
------------
1. storing some secret environment variables and using them in the project.
2. you can use normal json files also, but these are not secure. Hence we are using nodemon.json

what is api:
----------------
front end     <------------> backend

front end communicates with the backend using API's. (communication between frontend and backend is called api)

Difference betweeen node js and express js:
----------------------------------------------
nodejs -> you can develop aips in node js also. but you have to write more code and we have to deep dive into concepts.

express js -> framework built on top of node js. easy to develop apis.

what is cors?
--------------
Cross Origin Resource Sharing
to restrict access to api's we use cors. 

1. Enable all CORS requests
eg: app.use(cors());

2.Optionally, you can restrict CORS to specific origins
eg:  app.use(cors({
      origin: 'https://example.com'
  }));

multer and its usage:
--------------------
limits: to set limit on the size of file and number of files to be uploaded.
fileFilter: upload only specific type of files.

Dos Attack code:
---------------------
const arr = [];
const ips = [];
app.get("/test/", (req, res) => {
  var date = new Date();
  var seconds = parseInt(date.getTime() / 1000);
  var endtime = seconds + 60;
  var username = req.params["username"];
  var ip = requestip.getClientIp(req);
  if (ips.indexOf(ip) == -1) {
    arr.push({
      username: ip,
      starttime: 0,
      endtime: 0,
      count: 0,
    });
    ips.push(ip);
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].username == ip && arr[i].count == 0) {
      arr[i].count++;
      arr[i].starttime = seconds;
      arr[i].endtime = endtime;
      res.send(true);
    } else if (arr[i].username == ip && arr[i].count < 5) {
      arr[i].count++;
      res.send(true);
    } else if (
      arr[i].username == ip &&
      arr[i].count == 5 &&
      arr[i].endtime >= parseInt(new Date().getTime() / 1000)
    ) {
      res.send(false);
    } else if (
      arr[i].username === ip &&
      arr[i].endtime < parseInt(new Date().getTime() / 1000)
    ) {
      arr[i].count = 0;
      res.send(true);
    }
  }
});

