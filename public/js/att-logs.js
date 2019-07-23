var sAudio = new Audio('/sound/success_sfx.mp3');
var eAudio = new Audio('/sound/error_sfx.mp3');

var firebaseConfig = {
    apiKey: "AIzaSyBenrkqd1qQKsKi3ROZ_7MeQ2UPBl8XvRM",
    authDomain: "experimental-fb30c.firebaseapp.com",
    databaseURL: "https://experimental-fb30c.firebaseio.com",
    projectId: "experimental-fb30c",
    storageBucket: "experimental-fb30c.appspot.com",
    messagingSenderId: "465644974117",
    appId: "1:465644974117:web:1284076871a26ecd"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

db.collection("people").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
});

function sendToFireStore({uuid, person_name,machine_name,log_at}){
    return new Promise((resolve,reject) => {
        db.collection("att_logs").add({uuid, person_name,machine_name,log_at})
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            return resolve("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error)
            return reject("Error adding document: ", error);
        });
    });    
}

function logAtt(id,callback){
    return new Promise((resolve,reject) => {
        window.fetch('/person/'+id+'/logs').then(res => res.json())
        .then(res =>{
            if(res.success == true)
                return resolve(res);
            else
                return reject("something wrong");
        })
        .then(callback).catch(() => reject("Something wrong"));
    })
}
var Logs = new Vue({
    el: "#logs",
    data: function(){
        return{
            logs:[],
        }
    }, 
    methods: {
        getPerson: function(id,machine_name){
            window.fetch('/person/'+id)
            .then(res => {
                if(res.status == 200) 
                    return res.json();
                throw "Error";
            })
            .then((data) => {
                return logAtt(id,(res) => {
                    sAudio.play();
                    this.getLogs();
                    this.sendFB({uuid: id,person_name: data.name, machine_name, log_at: new Date().toISOString});
                    // sendToFireStore({uuid: id,person_name: data.name, machine_name, log_at: new Date().toISOString});
                });
            })
            .catch(e => {
                eAudio.play();
                console.error(e);
            })
        },

        sendFB: function({uuid, person_name,machine_name,log_at}){
            db.collection("att_logs").add({uuid, person_name,machine_name,log_at})
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
                // return resolve("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error)
                // return reject("Error adding document: ", error);
            }); 
        },

        getLogs: function(){
            window.fetch('/att_logs')
            .then(res => res.json())
            .then((res) => this.logs = res)
            .catch(console.error);
        },
    },
    mounted(){
        checkAuth();
        var t = this;
        window.attFlag = "att_logs";
        this.getLogs();
        socket.on('tap', function(data){
            t.getPerson(data.uuid, data.machine_name);
        });
    },
    beforeDestroy(){
        console.log("before Destroy");
    },
})
