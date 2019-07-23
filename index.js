var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var rc522 = require("rc522");
var db = require('./db');
var path = require("path");
var bodyParser =  require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

server.listen(PORT, function (err) {
    if (err) throw err
    console.log('listening on port '+PORT);
});


app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/p',(req, res) => {
  res.sendFile(path.join(__dirname+'/public/person.html'));
});

app.get('/l',(req, res) => {
  res.sendFile(path.join(__dirname+'/public/att-logs.html'));
});
app.get('/lgn',(req, res) => {
  res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.get('/person/:uuid',async (req,res)=>{
  try{
    const { uuid } = req.params;
    const person = await db.from('person').where('uuid',uuid).first();
    if(person == undefined)
      throw "Data not found";
    res.json(person);
  }catch(error){
    res.status(404);
    res.json({error});
  }
})

app.get('/person/:uuid/logs',async (req,res)=>{
  try{
    const { uuid } = req.params;
    const person = await db.from('person').where('uuid',uuid).first();
    if(person == undefined){
      res.status(400);
      throw "Person not registered on machine";
    }
    await db('att_logs').insert({ person_id: person.id , log_time: db.fn.now() });
    res.json({success: true, log_time: db.fn.now()});
  }catch(error){
    res.json({error});
  }
})

app.post('/person',async (req,res)=>{
  try {
    const { body } = req;
    const person = await db.from('person').where('uuid',body.uuid).first();
    if(person == undefined){
      await db('person').insert(body);
    }else{
      await db('person').where('uuid',body.uuid).update(body);
    }
    res.json({success: true})
  } catch (error) {
    res.json({success: false, error})
  }
})

app.put('/person',async (req,res)=>{
  try {
    const { body } = req;
    const person = await db.from('person').where('uuid',body.id).first();
    await db('person').where('id',body.id).update(body);
    res.json({success: true})
  } catch (error) {
    res.json({success: false, error})
  }
})

app.delete('/person/:id',async (req,res)=>{
  try {
    const { id } = req.params;
    await db.from('person').where('id',id).del();
    res.json({success: true})
  } catch (error) {
    res.json({success: false, error})
  }
})

app.get('/att_logs',async (req,res)=>{
  try{
    const logs = await db.from('att_logs').innerJoin('person','person.id','att_logs.person_id').select('person.name','att_logs.log_time');
    res.json(logs);
  }catch(error){
    res.json({error});
  }
})

app.get('/people',async (req,res)=>{
  try{
    const ppl = await db.from('person').select('*');
    res.json(ppl);
  }catch(error){
    res.json({error});
  }
})

app.post('/login', async (req,res) => {
  try{
    const { username,password } = req.body;
    const user = await db.from('user').where({ username, password }).select("*").first();
    const uid = user.id
    res.json({uid});
  }catch(error){
    res.json({error});
  }
})

io.on('connection',(client) => {

  console.log("Connected with id: "+client.id);

  client.on('tap', (data) => {
    console.log(data);
  });

  client.on('disconnect', () => {
    console.log('client disconnect...', client.id);
  });

  client.on('error', (err) => {
    console.log('received error from client:', client.id)
    console.log(err)
  })

})

rc522(function(rfidSerialNumber){
  console.log(rfidSerialNumber);  
  io.emit('tap', {
        machine: "machine1",
        uuid: rfidSerialNumber
    })
});



