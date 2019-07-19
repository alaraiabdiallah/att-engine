var socket = io('//');

window.attFlag;

socket.on('tap', function(data){
    console.log(data);
});

var sAudio = new Audio('/sound/success_sfx.mp3');
var eAudio = new Audio('/sound/error_sfx.mp3');

function checkAuth(){
    const uid = localStorage.getItem("uid");
    if(!uid)
        window.location.href="/#/login";
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

const Login = {
    data: function(){
        return{
            username: '',
            password: '',
        }
    }, 
    methods: {
        login: function(event){
            let params = { username: this.username, password: this.password };
            window.fetch('/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal login";
            })
            .then(res => {
                localStorage.setItem("uid",res.uid);
                window.location.href="/#/";
            })
            .catch(e => alert(e))
        }
    },
    template: `<div>
        <label>Username : <input v-model="username"></label><br />
        <label>Password : <input v-model="password" type="password"></label><br />
        <button type="button" v-on:click="login">Login</button>
    </div>` 
}
const Person = {
    data: function(){
        return{
            uuid: '',
            name: '',
        }
    }, 
    methods: {
        savePerson: function(){
            let params = { uuid: this.uuid, name: this.name };
            window.fetch('/person',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal save data";
            })
            .then(res => {
                if(res.success)
                    alert('Berhasil save data')
            })
            .catch(e => alert(e))
        },
        inputChange: function(data){
            this.uuid = data.uuid
        }
    },
    mounted(){
        checkAuth();
        var t = this;
        window.attFlag = "person-data"
        socket.on('tap', function(data){
            if(window.attFlag == "person-data")
                t.inputChange(data);
        });
    },
    template: `
        <div>
            <a href="/#/">Back</a><br />
            <label>UUID : <input v-model="uuid"></label><br />
            <label>Name : <input v-model="name"></label><br />
            <button type="button" v-on:click="savePerson">Login</button>
        </div>
    `
}

const Logs = {
    data: function(){
        return{
            logs:[],
        }
    }, 
    methods: {
        getPerson: function(id){
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
                });
            })
            .catch(e => {
                eAudio.play();
                console.error(e);
            })
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
            if(window.attFlag == "att_logs")
                t.getPerson(data.uuid);
        });
    },
    beforeDestroy(){
        console.log("before Destroy");
    },
    template: `
        <div>
            <a href="/#/">Back</a><br />
            <h2>Logs</h2>
            <ul>
            <li v-for="log in logs">
                {{ log.name }} did attendance at {{ new Date(log.log_time) }}
            </li>
            </ul>
        </div>
    `
}

const Home = {
    methods:{
        logout: function(){
            console.log("Logout!")
            localStorage.removeItem("uid");
            window.location.href = "/#/login";
        },
        movePage: function(link){
            window.location.href = link;
            window.location.reload();
        }
    },
    mounted(){
        window.attFlag = undefined;
        checkAuth();
    },
    template: `
        <div>
            <h2>Menu</h2>
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="movePage('/#/person')">Person</button> | 
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="movePage('/#/logs')">Att logs</button> |
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="logout">Logout</button> |
        </div>
    `
}

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/person', component: Person },
  { path: '/logs', component: Logs },
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
    el: '#app',
    mounted(){
        socket.on('connect', function(){
            console.log("connected");
        });
    },
    router
})
